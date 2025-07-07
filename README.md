# Flashcard App

A full-stack flashcard application with spaced repetition, built with Spring Boot (Java 17) for the backend and React for the frontend.

## Features

- User authentication (JWT)
- Create, edit, and delete decks and flashcards
- CSV import/export for decks
- Spaced repetition review system
---

## Backend Setup (`flashcard-backend`)

### Prerequisites

- Java 17+
- Maven

### Running the Backend

1. Install dependencies and run the server:
   ```sh
   cd flashcard-backend
   mvn spring-boot:run
   ```
2. The backend will start on [http://localhost:8080](http://localhost:8080).


## Frontend Setup (`flashcard-frontend`)

### Prerequisites

- Node.js (v16+ recommended)
- npm

### Running the Frontend

1. Install dependencies:
   ```sh
   cd flashcard-frontend
   npm install
   ```
2. Start the development server:
   ```sh
   npm start
   ```
3. The frontend will run on [http://localhost:3000](http://localhost:3000).

### Proxy

- API requests to `/api` are proxied to the backend via `setupProxy.js`.

---

## Usage

1. Register a new user or log in.
2. Create decks and add flashcards.
3. Use the review feature for spaced repetition.
4. Import/export decks as CSV files.

---

## Scripts

### Backend

- `mvn spring-boot:run` — Start backend server

### Frontend

- `npm start` — Start frontend dev server