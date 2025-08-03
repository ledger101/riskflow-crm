# **Epic 1: Foundation & Core Configuration**
**Epic Goal**: This foundational epic establishes the project's technical backbone and core administrative features. Upon completion, administrators will be able to set up the system, manage users, and define the core data (solutions, clients), creating a ready and secure environment for the sales team to begin managing opportunities in the next epic.

### **Story 1.1: Initial Project & Firebase Setup**
* **As an** Admin,
* **I want** the initial Angular application and backend infrastructure to be set up and connected to Firebase,
* **so that** a foundation exists for building all subsequent features.

**Acceptance Criteria**:
1.  A new Angular project is created using the decided technical stack.
2.  A new Firebase project is configured with Firestore Database and Firebase Authentication enabled.
3.  The Angular application successfully connects to the Firebase/Firestore backend.
4.  The project structure is set up within a monorepo.
5.  A basic "health check" or landing page loads successfully when the application is run.

### **Story 1.2: User Authentication**
* **As a** User,
* **I want** to securely log in to the application using my email and password,
* **so that** I can access the CRM system based on my role.

**Acceptance Criteria**:
1.  A dedicated login page is created.
2.  Users can be authenticated against the Firebase Authentication user pool.
3.  Upon successful login, the user is redirected to the main application dashboard.
4.  An unsuccessful login attempt displays a clear error message.
5.  A basic logout functionality is implemented.

### **Story 1.3: User & Role Management (Admin)**
* **As an** Admin,
* **I want** a user management interface to create new users and assign them roles (Admin, Sales Team, Read-Only),
* **so that** I can control access and permissions within the application.

**Acceptance Criteria**:
1.  An admin-only page for user management is created and is inaccessible to non-admin roles.
2.  Admins can create a new user by providing an email and initial password.
3.  Admins can assign one of the three specified roles to a user during creation or via an edit function.
4.  The interface displays a list of all current users and their assigned roles.

### **Story 1.4: Solution Master Data Management (Admin)**
* **As an** Admin,
* **I want** to create, view, edit, and manage the list of company solutions/products,
* **so that** sales reps can accurately assign them to new opportunities.

**Acceptance Criteria**:
1.  An admin-only page for managing solutions is created.
2.  Admins can add a new solution, providing a name and description.
3.  Admins can edit the name and description of an existing solution.
4.  All available solutions are displayed in a list.
5.  A solution cannot be deleted if it is associated with an existing opportunity (future-proofing).

### **Story 1.5: Client Master Data Management (Admin)**
* **As an** Admin,
* **I want** to create, view, edit, and manage the list of client companies,
* **so that** they can be correctly associated with sales opportunities.

**Acceptance Criteria**:
1.  An admin-only page for managing clients is created.
2.  Admins can add a new client with all necessary fields (e.g., Name, Country, Industry).
3.  Admins can edit the details of an existing client.
4.  All clients are displayed in a filterable list.

---

Please review this first set of user stories for Epic 1. Does this sequence and level of detail seem correct to build the foundation of the CRM?