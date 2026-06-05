# Infrastructure and Tech Stack

## Core Application

- Language: Java 21
- Framework: Spring Boot
- Build tool: Gradle via the checked-in Gradle Wrapper (`./gradlew`)
- API style: REST APIs with JSON
- Validation: Jakarta Bean Validation
- Configuration: Spring profiles for local, staging, and production

## Front End

- Framework: React
- Component library: Material Components

## Recommended Spring Boot Modules

- Spring Web for HTTP APIs
- Spring Data JPA for persistence
- Spring Security for authentication and authorization
- Spring Boot Actuator for health checks, metrics, and operational endpoints
- Spring Validation for request validation
- Flyway or Liquibase for database migrations

## Database

- Database: PostgreSQL only
- Local development: Docker Compose with PostgreSQL
- Migrations: Flyway or Liquibase checked into source control
- Connection pooling: HikariCP, provided by Spring Boot defaults

## Infrastructure

- Containerization: Docker
- Local orchestration: Docker Compose
- Cloud deployment target: Vercel
- Runtime: Java 21 container image
- Reverse proxy or ingress: Nginx, cloud load balancer, or managed ingress
- Secrets: environment variables or a managed secrets service

## CI/CD

- Source control: GitHub
- Automation: GitHub Actions using `./gradlew`
- Pipeline stages:
  - Build
  - Unit tests
  - Integration tests
  - Static analysis
  - Docker image build
  - Deployment

## Observability

- Health checks: Spring Boot Actuator
- Application logs: structured JSON logs
- Metrics: Micrometer
- Dashboards: Grafana or cloud-native monitoring
- Error tracking: Sentry or equivalent

## Testing

- Unit tests: JUnit 5
- Mocking: Mockito
- Integration tests: Spring Boot Test
- API tests: MockMvc or WebTestClient
- Database tests: Testcontainers with PostgreSQL

## Development Standards

- Java version: 21
- Package structure: feature-oriented or layered by domain
- Formatting: shared formatter configuration
- Static checks: Checkstyle, SpotBugs, or SonarQube
- Documentation: OpenAPI/Swagger for API contracts

## Initial Project Setup

1. Generate a Spring Boot project using Java 21 and Gradle.
2. Add Spring Web, Spring Data JPA, PostgreSQL Driver, Validation, Security, and Actuator.
3. Commit the Gradle Wrapper files so builds run with `./gradlew`.
4. Configure local PostgreSQL with Docker Compose.
5. Add database migrations.
6. Add GitHub Actions for build and test using `./gradlew build`.
7. Add Dockerfile for production packaging.
