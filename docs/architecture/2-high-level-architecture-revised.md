# **2. High Level Architecture (Revised)**

### **Technical Summary**

The Riskflow CRM will be architected as a modern, serverless web application with a "thick client" design. The frontend will be a Single Page Application (SPA) built with Angular and will connect directly to managed Firebase services. Firebase Hosting will provide global content delivery for the Angular app. User identity will be managed by Firebase Authentication, and all CRM data will be stored and retrieved directly from the Firestore database, governed by a robust set of security rules.

### **Platform and Infrastructure Choice**

  * **Platform:** **Google Cloud Platform (GCP) / Firebase**
      * **Rationale**: This ecosystem is ideal for a client-side architecture, providing tightly integrated, managed services that the Angular application can securely access directly.
  * **Key Services**:
      * **Firebase Hosting**: To deploy and host the Angular frontend application.
      * **Firebase Authentication**: To manage user identity, login, and access control.
      * **Firestore**: To serve as the primary NoSQL database, accessed directly from the Angular client.
  * **Deployment Host and Regions**: `us-central1` (or another region of your choice).

### **Repository Structure**

  * **Structure**: **Monorepo**
      * **Rationale**: This structure is still highly recommended. While we are removing the dedicated backend application, a monorepo managed with **Nx** will still be beneficial for organizing the Angular application and any shared libraries (like data models/types).

### **High Level Architecture Diagram**

```mermaid
graph TD
    subgraph "User's Browser"
        A[Angular SPA]
    end

    subgraph "Google Cloud Platform / Firebase"
        B[Firebase Hosting]
        D[Firebase Authentication]
        E[Firestore Database <br><i>(Protected by Security Rules)</i>]
    end

    A -- "Loads App" --> B
    A -- "Reads/Writes Data (SDK)" --> E
    A -- "Login/Auth (SDK)" --> D
```

### **Architectural and Design Patterns**

  * **Single Page Application (SPA)**: The Angular frontend will operate as an SPA, providing a rich, responsive user experience.
  * **Backend-as-a-Service (BaaS)**: We will leverage Firebase's managed services (Auth, Firestore) as our backend, eliminating the need to build and maintain a separate server-side application for core functionality.
  * **Angular Service Layer for Firebase**: As you requested, a dedicated service layer will be created within the Angular application. This service will be responsible for encapsulating all interactions with the Firestore and Firebase Auth SDKs. This centralizes the Firebase logic, keeps components clean, and makes the application easier to manage and test.
Excellent. With the high-level architecture approved, we will now finalize the definitive **Tech Stack**.

This table serves as the single source of truth for every technology, library, and version that will be used in this project. This ensures consistency and provides a clear, actionable list for the development team. The following selections are based on our discussion, centered around Angular and the Google Firebase ecosystem.

---
