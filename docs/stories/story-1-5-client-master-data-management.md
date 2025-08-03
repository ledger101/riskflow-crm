# Story 1.5: Client Master Data Management (Admin)

## Story Details
- **Story ID**: 1.5
- **Epic**: Epic 1 - Foundation & Core Configuration
- **Priority**: High
- **Story Points**: 5
- **Sprint**: 1

## User Story
**As an** Admin,
**I want** to create, view, edit, and manage the list of client companies,
**so that** they can be correctly associated with sales opportunities.

## Acceptance Criteria
1. An admin-only page for managing clients is created and is inaccessible to non-admin roles.
2. Admins can add a new client with all necessary fields (e.g., Name, Country, Industry).
3. Admins can edit the details of an existing client.
4. All clients are displayed in a filterable list.
5. Client data validation ensures required fields are completed.

## Technical Requirements
Based on the architecture and previous stories:

### Frontend Implementation
- Create `ClientManagementModule` (lazy-loaded) with `ClientListComponent` and `ClientFormComponent`.
- Configure route `/admin/clients` protected by `AdminGuard`.
- Use existing `ClientService` from `core/services/client.service.ts` for CRUD operations.
- Display a data table of clients with filtering capabilities for Country and Industry.
- Implement form validation for required fields (Name, Country, Industry).

### Data Model
```typescript
interface Client {
  id?: string;
  name: string;
  country: string;
  industry: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Firebase Setup
- Use Firestore collection `clients` to store client data.
- Implement proper security rules to allow only admin users to read/write client data.
- Add indexes for filtering by country and industry.

### Dependencies
_No additional dependencies beyond existing Firebase and AngularFire packages._

## Definition of Done
- [x] Admin-only client management page implemented and accessible at `/admin/clients`.
- [x] Client creation with all required fields works correctly.
- [x] Client editing updates data and reflects immediately in UI.
- [x] Clients list displays all clients with filtering by Country and Industry.
- [x] Form validation prevents submission with missing required fields.
- [x] Non-admin users cannot access client management functionality.
- [ ] Unit and integration tests cover client CRUD operations and filtering.
- [ ] Code reviewed and merged to `main` branch.

## Development Notes
- Leverage existing `ClientService` if already implemented
- Follow same patterns established in User Management (Story 1.3) and Solution Management (Story 1.4)
- Ensure consistent UI/UX with other admin interfaces
- Add proper error handling and user feedback
- Consider adding pagination for large client lists

## Ready for Development
This story is ready for the Dev agent to begin implementation.
