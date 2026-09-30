package com.ticketbooking.config;

import com.ticketbooking.dto.SeatLayoutGenerateRequest;
import com.ticketbooking.entity.Movie;
import com.ticketbooking.entity.Screen;
import com.ticketbooking.entity.Theatre;
import com.ticketbooking.repository.MovieRepository;
import com.ticketbooking.repository.ScreenRepository;
import com.ticketbooking.repository.SeatRepository;
import com.ticketbooking.repository.TheatreRepository;
import com.ticketbooking.service.SeatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final MovieRepository movieRepository;
    private final TheatreRepository theatreRepository;
    private final ScreenRepository screenRepository;
    private final SeatRepository seatRepository;
    private final SeatService seatService;

    public DataInitializer(MovieRepository movieRepository,
                           TheatreRepository theatreRepository,
                           ScreenRepository screenRepository,
                           SeatRepository seatRepository,
                           SeatService seatService) {
        this.movieRepository = movieRepository;
        this.theatreRepository = theatreRepository;
        this.screenRepository = screenRepository;
        this.seatRepository = seatRepository;
        this.seatService = seatService;
    }

    @Override
    public void run(String... args) {
        if (movieRepository.count() == 0) {
            log.info("Seeding initial Movies...");
            List<Movie> movies = Arrays.asList(
                    new Movie(
                            "Inception",
                            "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.",
                            148,
                            "English",
                            LocalDate.of(2010, 7, 16),
                            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&auto=format&fit=crop"
                    ),
                    new Movie(
                            "Interstellar",
                            "When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.",
                            169,
                            "English",
                            LocalDate.of(2014, 11, 7),
                            "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop"
                    ),
                    new Movie(
                            "Oppenheimer",
                            "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.",
                            180,
                            "English",
                            LocalDate.of(2023, 7, 21),
                            "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&auto=format&fit=crop"
                    )
            );
            movieRepository.saveAll(movies);
            log.info("Seeded {} movies.", movies.size());
        }

        if (theatreRepository.count() == 0) {
            log.info("Seeding initial Theatres, Screens, and Seats...");
            // Theatre 1: Mumbai
            Theatre pvr = new Theatre("PVR Grand Cineplex", "Phoenix Palladium, Lower Parel", "Mumbai");
            theatreRepository.save(pvr);

            Screen pvrScreen1 = new Screen(pvr, "IMAX Laser Screen 1", 50);
            Screen pvrScreen2 = new Screen(pvr, "Audi 2 Gold Class", 50);
            screenRepository.saveAll(Arrays.asList(pvrScreen1, pvrScreen2));

            // Theatre 2: Delhi
            Theatre inox = new Theatre("INOX Megaplex", "Select CITYWALK, Saket", "Delhi");
            theatreRepository.save(inox);

            Screen inoxScreen1 = new Screen(inox, "Screen 1 Dolby Atmos", 50);
            screenRepository.save(inoxScreen1);

            // Generate seats for each screen: Rows A to E, 10 seats each
            SeatLayoutGenerateRequest layout = new SeatLayoutGenerateRequest(
                    Arrays.asList("A", "B", "C", "D", "E"),
                    10,
                    Arrays.asList("D"), // Premium
                    Arrays.asList("E")  // Recliner
            );

            seatService.generateSeatsForScreen(pvrScreen1.getId(), layout);
            seatService.generateSeatsForScreen(pvrScreen2.getId(), layout);
            seatService.generateSeatsForScreen(inoxScreen1.getId(), layout);

            log.info("Successfully seeded Theatres, Screens, and generated Seat layouts.");
        }
    }
}
