# Story 1.2: User Authentication

## Story Details
- **Story ID**: 1.2
- **Epic**: Epic 1 - Foundation & Core Configuration
- **Priority**: High
- **Story Points**: 5
- **Sprint**: 1

## User Story
**As a** User,
**I want** to securely log in to the application using my email and password,
**so that** I can access the CRM system based on my role.

## Acceptance Criteria
1. A dedicated login page is created with email and password fields.
2. Users can authenticate against Firebase Authentication.
3. Successful login redirects the user to the main application dashboard.
4. Unsuccessful login displays a clear, user-friendly error message.
5. Logout functionality is available on all protected routes.

## Technical Requirements
Based on the architecture and Story 1.1:

### Frontend Implementation
- Create an `AuthModule` (lazy-loaded) with `LoginComponent` and `LogoutService`.
- Configure Angular routes:  
  - `/login` → `LoginComponent`  
  - All other routes protected by `AuthGuard`.
- Use `AuthService` from `core/services/auth.service.ts` for signIn and signOut.
- Display form validation errors (required fields, email format).

### Firebase Authentication
- Ensure Firebase Auth (`getAuth`) is properly initialized in `FirebaseService`.
- Use `signInWithEmailAndPassword` from `firebase/auth` within `AuthService`.
- Protect dashboard and feature routes with `AuthGuard` that checks `AuthService.isAuthenticated()`.

### Dependencies to Install
```json
{
  "@angular/fire": "^18.0.0",
  "firebase": "^10.0.0"
}
```

## Definition of Done
- [ ] Login page implemented and styled per design guidelines.
- [ ] Authentication succeeds and fails correctly with Firebase.
- [ ] AuthGuard prevents unauthenticated access to protected routes.
- [ ] Logout action signs the user out and redirects to `/login`.
- [ ] All tests (unit & e2e) for login and guard functionality pass.
- [ ] Code reviewed and merged to `main` branch.

## Development Notes
- Use Angular Reactive Forms for login form.
- Leverage Tailwind CSS for styling.
- Raise toast notifications for error/success messages.
- Refer to `docs/architecture/3-tech-stack.md` for UI standards.

---

This story is ready for the Dev agent to implement the login/logout flow.
