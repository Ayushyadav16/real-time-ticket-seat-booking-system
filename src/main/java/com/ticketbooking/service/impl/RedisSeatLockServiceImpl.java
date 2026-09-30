package com.ticketbooking.service.impl;

import com.ticketbooking.service.SeatLockService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class RedisSeatLockServiceImpl implements SeatLockService {

    private static final Logger log = LoggerFactory.getLogger(RedisSeatLockServiceImpl.class);
    private static final String LOCK_PREFIX = "seat-lock:show:";

    private final StringRedisTemplate redisTemplate;

    // In-memory fallback if Redis server is temporarily unreachable
    private final Map<String, FallbackLock> memoryLocks = new ConcurrentHashMap<>();

    private static class FallbackLock {
        final Long userId;
        final long expiresAtEpochMs;

        FallbackLock(Long userId, long ttlSeconds) {
            this.userId = userId;
            this.expiresAtEpochMs = System.currentTimeMillis() + (ttlSeconds * 1000);
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiresAtEpochMs;
        }

        long getRemainingSeconds() {
            long remaining = (expiresAtEpochMs - System.currentTimeMillis()) / 1000;
            return Math.max(0, remaining);
        }
    }

    public RedisSeatLockServiceImpl(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    private String buildKey(Long showId, Long seatId) {
        return LOCK_PREFIX + showId + ":seat:" + seatId;
    }

    @Override
    public boolean lockSeat(Long showId, Long seatId, Long userId, long ttlSeconds) {
        String key = buildKey(showId, seatId);
        String val = String.valueOf(userId);

        try {
            // Redis atomic SET key value NX EX <ttlSeconds>
            Boolean success = redisTemplate.opsForValue().setIfAbsent(key, val, Duration.ofSeconds(ttlSeconds));
            return Boolean.TRUE.equals(success);
        } catch (Exception e) {
            log.warn("Redis unavailable for lockSeat ({}), falling back to in-memory lock.", e.getMessage());
            return lockInMemory(key, userId, ttlSeconds);
        }
    }

    @Override
    public boolean lockSeats(Long showId, List<Long> seatIds, Long userId, long ttlSeconds) {
        List<Long> acquired = new ArrayList<>();
        boolean success = true;

        for (Long seatId : seatIds) {
            if (lockSeat(showId, seatId, userId, ttlSeconds)) {
                acquired.add(seatId);
            } else {
                success = false;
                break;
            }
        }

        if (!success) {
            // Rollback all acquired locks in this batch to prevent partial reservation
            log.info("Multi-seat lock failed for user {}. Rolling back {} acquired seats.", userId, acquired.size());
            for (Long lockedSeatId : acquired) {
                unlockSeat(showId, lockedSeatId, userId);
            }
            return false;
        }

        return true;
    }

    @Override
    public void unlockSeat(Long showId, Long seatId, Long userId) {
        String key = buildKey(showId, seatId);
        try {
            String currentOwner = redisTemplate.opsForValue().get(key);
            if (currentOwner != null && (userId == null || currentOwner.equals(String.valueOf(userId)))) {
                redisTemplate.delete(key);
            }
        } catch (Exception e) {
            log.warn("Redis unavailable for unlockSeat ({}), falling back to memory.", e.getMessage());
            FallbackLock lock = memoryLocks.get(key);
            if (lock != null && (userId == null || lock.userId.equals(userId))) {
                memoryLocks.remove(key);
            }
        }
    }

    @Override
    public void unlockSeats(Long showId, List<Long> seatIds, Long userId) {
        for (Long seatId : seatIds) {
            unlockSeat(showId, seatId, userId);
        }
    }

    @Override
    public Long getSeatLockOwner(Long showId, Long seatId) {
        String key = buildKey(showId, seatId);
        try {
            String val = redisTemplate.opsForValue().get(key);
            if (val != null) {
                return Long.parseLong(val);
            }
            return null;
        } catch (Exception e) {
            FallbackLock lock = memoryLocks.get(key);
            if (lock != null) {
                if (lock.isExpired()) {
                    memoryLocks.remove(key);
                    return null;
                }
                return lock.userId;
            }
            return null;
        }
    }

    @Override
    public Long getRemainingTtlSeconds(Long showId, Long seatId) {
        String key = buildKey(showId, seatId);
        try {
            Long ttl = redisTemplate.getExpire(key);
            if (ttl != null && ttl > 0) {
                return ttl;
            }
            return null;
        } catch (Exception e) {
            FallbackLock lock = memoryLocks.get(key);
            if (lock != null && !lock.isExpired()) {
                return lock.getRemainingSeconds();
            }
            return null;
        }
    }

    @Override
    public Map<Long, Long> getLockedSeatsForShow(Long showId, List<Long> seatIds) {
        Map<Long, Long> result = new HashMap<>();
        for (Long seatId : seatIds) {
            Long owner = getSeatLockOwner(showId, seatId);
            if (owner != null) {
                result.put(seatId, owner);
            }
        }
        return result;
    }

    private synchronized boolean lockInMemory(String key, Long userId, long ttlSeconds) {
        FallbackLock existing = memoryLocks.get(key);
        if (existing != null && !existing.isExpired()) {
            return false;
        }
        memoryLocks.put(key, new FallbackLock(userId, ttlSeconds));
        return true;
    }
}
