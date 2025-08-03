# Story 1.1: Initial Project & Firebase Setup

## Story Details
- **Story ID**: 1.1
- **Epic**: Epic 1 - Foundation & Core Configuration
- **Priority**: Critical
- **Story Points**: 8
- **Sprint**: 1

## User Story
**As an** Admin,
**I want** the initial Angular application and backend infrastructure to be set up and connected to Firebase,
**so that** a foundation exists for building all subsequent features.

## Acceptance Criteria
1. A new Angular project is created using the decided technical stack
2. A new Firebase project is configured with Firestore Database and Firebase Authentication enabled
3. The Angular application successfully connects to the Firebase/Firestore backend
4. The project structure is set up within a monorepo
5. A basic "health check" or landing page loads successfully when the application is run

## Technical Requirements
Based on the architecture document:

### Frontend Setup
- Create Angular 18.x project using Angular CLI
- Install and configure Angular Material 18.x
- Install and configure Tailwind CSS 3.4.x
- Set up project structure for monorepo

### Firebase Setup
- Create Firebase project
- Enable Firestore Database
- Enable Firebase Authentication
- Enable Firebase Hosting
- Configure Firebase SDK (~10.x) in Angular project

### Dependencies to Install
```json
{
  "@angular/material": "^18.0.0",
  "@angular/cdk": "^18.0.0", 
  "tailwindcss": "^3.4.0",
  "firebase": "^10.0.0",
  "@angular/fire": "^18.0.0"
}
```

### Project Structure
```
riskflow-crm/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── firebase.service.ts
│   │   │   └── guards/
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   └── models/
│   │   ├── features/
│   │   └── app.component.ts
│   ├── environments/
│   └── main.ts
├── firebase.json
├── firestore.rules
└── package.json
```

## Definition of Done
- [ ] Angular project created and running on localhost:4200
- [ ] Firebase project created and configured
- [ ] Firebase SDK integrated and connection verified
- [ ] Basic landing/health check page displays "Riskflow CRM - System Ready"
- [ ] Firebase Authentication and Firestore services can be imported
- [ ] Project builds successfully with `ng build`
- [ ] All specified dependencies installed and configured
- [ ] Basic project structure implemented as specified
- [ ] Code committed to repository

## Development Notes
- Use Angular CLI for project creation: `ng new riskflow-crm`
- Follow the tech stack specified in `docs/architecture/3-tech-stack.md`
- Refer to Firebase setup documentation for proper configuration
- Ensure environment files are properly configured for development and production

## Ready for Development
This story is ready for the Dev agent to begin implementation.
