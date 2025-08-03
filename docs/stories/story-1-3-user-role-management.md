# Story 1.3: User & Role Management (Admin)

## Story Details
- **Story ID**: 1.3
- **Epic**: Epic 1 - Foundation & Core Configuration
- **Priority**: High
- **Story Points**: 5
- **Sprint**: 1

## User Story
**As an** Admin,
**I want** a user management interface to create new users and assign them roles (Admin, Sales Team, Read-Only),
**so that** I can control access and permissions within the application.

## Acceptance Criteria
1. An admin-only page for user management is created and inaccessible to non-admin roles.
2. Admins can create a new user by providing an email and initial password.
3. Admins can assign one of the three specified roles to a user during creation or via an edit function.
4. The interface displays a list of all current users and their assigned roles.
5. Only Admins can access and perform user/role management actions.

## Technical Requirements
Based on the architecture and previous stories:

### Frontend Implementation
- Create `UserManagementModule` (lazy-loaded) with `UserListComponent` and `UserFormComponent`.
- Configure route `/admin/users` protected by an `AdminGuard` extending `AuthGuard` that checks user role.
- Use `AuthService` or a new `UserService` to call Firebase Admin APIs for user creation and role assignment.
- Display a data table of users with their roles; provide "Create User" and "Edit Role" actions.

### Firebase Setup
- Use Firebase Authentication and Firestore (or custom claims) to store user-role mappings.
- Implement custom claims for roles using Firebase Admin SDK on backend (or Cloud Functions).
- Ensure Firestore security rules only allow admin users to read/write role data.

### Dependencies to Install
_No additional dependencies beyond existing Firebase and AngularFire packages._

## Definition of Done
- [ ] Admin-only user management page implemented.
- [ ] User creation with email, password, and role assignment works.
- [ ] Role updates persist and reflect immediately in UI.
- [ ] Non-admin users cannot access `/admin/users` route or perform actions.
- [ ] Unit and integration tests cover role-based access and UI flows.
- [ ] Code reviewed and merged to `main` branch.

## Development Notes
- Leverage Angular Reactive Forms for user creation/edit forms.
- Use Tailwind CSS and Angular Material data tables for UI consistency.
- Refer to `docs/architecture/3-tech-stack.md` for style guidelines.

---

This story is ready for the Dev agent to implement the user and role management interface.