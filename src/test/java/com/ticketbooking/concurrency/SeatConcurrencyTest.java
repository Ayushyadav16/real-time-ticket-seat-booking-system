package com.ticketbooking.concurrency;

import com.ticketbooking.service.impl.RedisSeatLockServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;

class SeatConcurrencyTest {

    private RedisSeatLockServiceImpl seatLockService;

    @BeforeEach
    void setUp() {
        // StringRedisTemplate mock will fail fast and trigger the atomic in-memory fallback lock mechanism
        StringRedisTemplate mockRedis = mock(StringRedisTemplate.class);
        seatLockService = new RedisSeatLockServiceImpl(mockRedis);
    }

    @Test
    @DisplayName("Verify that when 10 threads compete for the same seat simultaneously, exactly 1 wins and 9 fail")
    void testConcurrentSeatLocking() throws InterruptedException {
        int threadCount = 10;
        Long showId = 100L;
        Long seatId = 55L;

        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch readyLatch = new CountDownLatch(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(threadCount);

        AtomicInteger successCounter = new AtomicInteger(0);
        AtomicInteger failureCounter = new AtomicInteger(0);

        for (int i = 1; i <= threadCount; i++) {
            final long userId = (long) i;
            executor.submit(() -> {
                readyLatch.countDown();
                try {
                    // Wait until all threads are prepped and released simultaneously
                    startLatch.await();
                    boolean acquired = seatLockService.lockSeat(showId, seatId, userId, 300);
                    if (acquired) {
                        successCounter.incrementAndGet();
                    } else {
                        failureCounter.incrementAndGet();
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                } finally {
                    doneLatch.countDown();
                }
            });
        }

        // Wait for all threads to be ready
        readyLatch.await(5, TimeUnit.SECONDS);
        // Release all threads at the exact same millisecond
        startLatch.countDown();
        // Wait for completion
        boolean finished = doneLatch.await(10, TimeUnit.SECONDS);

        executor.shutdown();

        assertTrue(finished, "All threads should have finished within 10 seconds");
        assertEquals(1, successCounter.get(), "Exactly one user should successfully lock the seat");
        assertEquals(threadCount - 1, failureCounter.get(), "All other concurrent attempts must be rejected");

        Long owner = seatLockService.getSeatLockOwner(showId, seatId);
        assertNotNull(owner, "Seat must have an active lock owner");
        assertTrue(owner >= 1 && owner <= threadCount, "Owner must be one of the competing users");
    }

    @Test
    @DisplayName("Verify that releasing a lock allows subsequent acquisition")
    void testLockReleaseAndReacquire() {
        Long showId = 200L;
        Long seatId = 88L;
        Long user1 = 1L;
        Long user2 = 2L;

        // User 1 locks
        assertTrue(seatLockService.lockSeat(showId, seatId, user1, 300));
        // User 2 cannot lock
        assertFalse(seatLockService.lockSeat(showId, seatId, user2, 300));

        // User 2 cannot release user 1's lock
        seatLockService.unlockSeat(showId, seatId, user2);
        assertEquals(user1, seatLockService.getSeatLockOwner(showId, seatId));

        // User 1 releases lock
        seatLockService.unlockSeat(showId, seatId, user1);
        assertNull(seatLockService.getSeatLockOwner(showId, seatId));

        // User 2 can now lock
        assertTrue(seatLockService.lockSeat(showId, seatId, user2, 300));
        assertEquals(user2, seatLockService.getSeatLockOwner(showId, seatId));
    }
}
