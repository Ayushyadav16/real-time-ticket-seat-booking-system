# Real-Time Ticket & Seat Booking System

[![Java](https://img.shields.io/badge/Java-17%2B-orange.svg)](https://openjdk.org/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.1-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-7-red.svg)](https://redis.io/)
[![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-3.x-black.svg)](https://kafka.apache.org/)
[![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-blueviolet.svg)](https://stomp.github.io/)

A distributed, production-grade real-time ticket and seat booking application designed to solve high-concurrency seat reservation challenges and prevent double-booking.

---

## 1. System Architecture

```text
                               ┌───────────────────────────┐
                               │   React.js Single-Page    │
                               │   Application (Vite/Nginx)│
                               └─────────────┬─────────────┘
                                             │
                               HTTP REST API │ WebSocket (STOMP)
                                             ▼
                               ┌───────────────────────────┐
                               │    Spring Boot Backend    │
                               │  (Security, REST, STOMP)  │
                               └──────┬───────┬───────┬────┘
                                      │       │       │
                   Atomic Lock (5m)   │       │       │ Event Stream
                 ┌────────────────────┘       │       └────────────────────┐
                 ▼                            ▼                            ▼
         ┌───────────────┐           ┌────────────────┐           ┌────────────────┐
         │  Redis Cache  │           │  MySQL Server  │           │  Apache Kafka  │
         │ (Temporary    │           │ (Permanent     │           │ (booking-      │
         │  Seat Locks)  │           │  Source of     │           │  events)       │
         └───────────────┘           │  Truth)        │           └───────┬────────┘
                                     └────────────────┘                   │
                                                               ┌──────────┴──────────┐
                                                               ▼                     ▼
                                                        Notification             Analytics
                                                          Consumer               Consumer
                                                        (Email/SMS)             (Metrics)
```

---

## 2. Key Features

- **Double-Booking Elimination**: Multi-layer concurrency protection:
  - **Redis Layer**: Atomic `SET key value NX EX 300` distributed lock with all-or-nothing rollback across multiple seats.
  - **Database Layer**: Uniqueness constraints on `(booking_id, seat_id)` and validation in MySQL ensuring single-owner permanence.
- **Real-Time Live UI Synchronization**:
  - WebSocket STOMP broker updates seat state live across all connected clients on `/topic/shows/{showId}/seats`.
  - Color-coded live statuses: Available (White), Held/Locked by Me (Amber), Locked by Others (Slate Gray), Confirmed Booked (Red).
- **Event-Driven Architecture**:
  - Decoupled asynchronous processing with Apache Kafka (`booking-events`).
  - **Notification Consumer**: Dispatches simulated transactional confirmation emails and SMS tickets.
  - **Analytics Consumer**: Aggregates booking counts, ticket volume, and revenue metrics in real time.
- **Seat Tier Pricing & Layout Engine**:
  - Tier pricing: Regular ($12.00), Premium ($18.00), Recliner ($25.00).
  - Admin visual layout configurator and auto-generation for cinema screens.
- **Role-Based Access Control**:
  - Stateless JWT authentication with BCrypt hashing.
  - `CUSTOMER` and `ADMIN` role segmentation.

---

## 3. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, React Router 6, Axios, STOMP.js, SockJS Client, CSS3 |
| **Backend** | Java 17, Spring Boot 3.4.1, Spring Data JPA, Spring Security, Spring Data Redis, Spring Kafka, Spring WebSocket |
| **Databases** | MySQL 8.0 (Relational), Redis 7 (In-Memory Key-Value) |
| **Event Broker** | Apache Kafka & Zookeeper |
| **DevOps** | Docker, Docker Compose, Nginx |

---

## 4. Default Seed Accounts

The application automatically seeds initial data on startup:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@ticketbooking.com` | `Admin@123` |
| **Customer 1** | `alice@example.com` | `Password@123` |
| **Customer 2** | `bob@example.com` | `Password@123` |

---

## 5. Quickstart with Docker Compose

Ensure [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/) are installed and running.

```bash
# Clone the repository and navigate into the project directory
git clone <repo-url>
cd firstspringbootproject

# Build and start all services (MySQL, Redis, Zookeeper, Kafka, Backend, Frontend)
docker compose up --build
```

### Service Endpoints

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:8080/api](http://localhost:8080/api)
- **Health Check**: [http://localhost:8080/api/health](http://localhost:8080/api/health)
- **WebSocket Handshake**: `http://localhost:8080/ws-booking`

---

## 6. Local Development Setup

### Prerequisites
- JDK 17+
- Node.js 18+ and npm
- MySQL 8.0 running on `localhost:3306`
- Redis (optional — resilient in-memory fallback enabled if offline)
- Apache Kafka (optional — resilient event dispatcher fallback enabled if offline)

### Step 1: Database Setup
Create database in MySQL (tables and seed data are automatically initialized on boot):
```sql
CREATE DATABASE IF NOT EXISTS ticket_booking_db;
```

### Step 2: Run Backend
```bash
# Using Maven wrapper
./mvnw clean package -DskipTests
java -jar target/ticketbooking-0.0.1-SNAPSHOT.jar
```
Backend will start on `http://127.0.0.1:8080`.

### Step 3: Run Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend will be accessible at `http://127.0.0.1:5173`.

---

## 7. REST API Endpoints

### Authentication
- `POST /api/auth/register` — Register customer or admin
- `POST /api/auth/login` — Authenticate and receive JWT
- `GET /api/auth/me` — Retrieve current authenticated user profile

### Catalog (Movies, Theatres, Screens, Shows)
- `GET /api/movies` — List active movies
- `POST /api/movies` — Create movie *(Admin)*
- `GET /api/theatres` — List theatres
- `POST /api/theatres` — Create theatre *(Admin)*
- `POST /api/screens` — Create screen *(Admin)*
- `POST /api/screens/{id}/generate-seats` — Generate cinema seat layout *(Admin)*
- `GET /api/shows` — Search shows filtered by `movieId`, `theatreId`, `date`
- `POST /api/shows` — Schedule show with screen overlap protection *(Admin)*

### Real-Time Seat Locking & Booking
- `GET /api/shows/{showId}/seats` — Get show seat layout with live states (`AVAILABLE`, `LOCKED`, `BOOKED`)
- `POST /api/shows/{showId}/seats/lock` — Atomically hold seat selection for 5 minutes (`SETNX EX 300`)
- `POST /api/shows/{showId}/seats/unlock` — Release temporary seat hold
- `POST /api/bookings` — Confirm booking, persist to MySQL, release Redis lock, publish Kafka event
- `GET /api/bookings` — Retrieve current user's booking history
- `GET /api/bookings/{id}` — Retrieve digital ticket details with QR code styling
- `POST /api/bookings/{id}/cancel` — Cancel booking and release seats back to available pool

---

## 8. WebSocket Channels

- **Endpoint**: `/ws-booking` (supports SockJS and native STOMP)
- **Topic**: `/topic/shows/{showId}/seats`
- **Payload Schema**:
```json
{
  "action": "LOCKED",
  "showId": 1,
  "seatIds": [12, 13],
  "userId": 2,
  "bookingReference": null,
  "timestamp": "2026-09-30T12:00:00"
}
```

---

## 9. Automated Testing

Run the automated test suite including unit tests, integration tests, and multi-threaded concurrency verification:

```bash
# Run all tests
./mvnw test

# Run concurrency verification test (10 simultaneous threads competing for the same seat)
./mvnw test -Dtest=SeatConcurrencyTest
```
All **40 tests** pass cleanly with 0 failures and 0 errors.
