package com.ticketbooking.service;

import com.ticketbooking.dto.TheatreRequest;
import com.ticketbooking.dto.TheatreResponse;
import com.ticketbooking.entity.Theatre;
import com.ticketbooking.exception.ResourceNotFoundException;
import com.ticketbooking.repository.TheatreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TheatreService {

    private final TheatreRepository theatreRepository;

    public TheatreService(TheatreRepository theatreRepository) {
        this.theatreRepository = theatreRepository;
    }

    @Transactional(readOnly = true)
    public List<TheatreResponse> getAllTheatres(String city) {
        List<Theatre> theatres;
        if (city != null && !city.trim().isEmpty()) {
            theatres = theatreRepository.findByCityIgnoreCase(city.trim());
        } else {
            theatres = theatreRepository.findAll();
        }
        return theatres.stream().map(TheatreResponse::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TheatreResponse getTheatreById(Long id) {
        Theatre theatre = getTheatreEntity(id);
        return TheatreResponse.fromEntity(theatre);
    }

    @Transactional(readOnly = true)
    public Theatre getTheatreEntity(Long id) {
        return theatreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Theatre not found with id: " + id));
    }

    @Transactional
    public TheatreResponse createTheatre(TheatreRequest request) {
        Theatre theatre = new Theatre(
                request.getName(),
                request.getLocation(),
                request.getCity()
        );
        Theatre saved = theatreRepository.save(theatre);
        return TheatreResponse.fromEntity(saved);
    }

    @Transactional
    public TheatreResponse updateTheatre(Long id, TheatreRequest request) {
        Theatre theatre = getTheatreEntity(id);
        theatre.setName(request.getName());
        theatre.setLocation(request.getLocation());
        theatre.setCity(request.getCity());

        Theatre updated = theatreRepository.save(theatre);
        return TheatreResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteTheatre(Long id) {
        Theatre theatre = getTheatreEntity(id);
        theatreRepository.delete(theatre);
    }
}
