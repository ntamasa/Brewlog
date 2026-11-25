# Brewlog

Brewlog is a single-user coffee tasting journal: an Angular 22 frontend and a Spring Boot 4.2 backend on PostgreSQL 17, for local or private deployment.

## Prerequisites

- Node.js 24.15.0 or newer
- Docker Desktop installed and running
- JDK 25 is not needed: Gradle downloads it

## Run

`docker compose up -d --build`, then open http://localhost:8081

## Test

- `backend/`: `./gradlew spotlessCheck test`
- `frontend/`: `npm start`, `npm test`, `npm run lint`, `npm run format:check`, `npm run build`
- `e2e/`: `npx playwright install chromium` and `npx playwright test` against the running compose stack

[Business rules](docs/business-rules.md)
