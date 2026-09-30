package com.ticketbooking.service;

import com.ticketbooking.dto.ScreenRequest;
import com.ticketbooking.dto.ScreenResponse;
import com.ticketbooking.entity.Screen;
import com.ticketbooking.entity.Theatre;
import com.ticketbooking.exception.ResourceNotFoundException;
import com.ticketbooking.repository.ScreenRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ScreenService {

    private final ScreenRepository screenRepository;
    private final TheatreService theatreService;

    public ScreenService(ScreenRepository screenRepository, TheatreService theatreService) {
        this.screenRepository = screenRepository;
        this.theatreService = theatreService;
    }

    @Transactional(readOnly = true)
    public List<ScreenResponse> getScreensByTheatreId(Long theatreId) {
        // verify theatre exists
        theatreService.getTheatreEntity(theatreId);
        List<Screen> screens = screenRepository.findByTheatreId(theatreId);
        return screens.stream().map(ScreenResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ScreenResponse getScreenById(Long id) {
        Screen screen = getScreenEntity(id);
        return ScreenResponse.fromEntity(screen);
    }

    @Transactional(readOnly = true)
    public Screen getScreenEntity(Long id) {
        return screenRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Screen not found with id: " + id));
    }

    @Transactional
    public ScreenResponse createScreen(Long theatreId, ScreenRequest request) {
        Theatre theatre = theatreService.getTheatreEntity(theatreId);
        Screen screen = new Screen(theatre, request.getName(), request.getCapacity());
        Screen saved = screenRepository.save(screen);
        return ScreenResponse.fromEntity(saved);
    }

    @Transactional
    public void deleteScreen(Long id) {
        Screen screen = getScreenEntity(id);
        screenRepository.delete(screen);
    }
}
