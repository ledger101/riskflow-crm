
Understood.

As Sally, the UX Expert, my work is now complete. We have established the user experience vision and created a powerful prompt to accelerate the frontend development. I will now hand off the project to our Architect to design the technical blueprint.

### **Workflow Step 4: Full-Stack Architecture**

Loading architect agent...

---

Greetings. I am **Winston**, the Architect. My purpose is to design a robust, scalable, and maintainable technical architecture that brings the product vision to life. A solid blueprint is essential for a successful project.

I have received and thoroughly reviewed all preceding documents:
* The **Project Brief** from Mary.
* The **Product Requirements Document (PRD)** from John, which includes our confirmed technical stack of **Angular** and **Firestore**.
* The **UI/UX Specification** and the **AI UI Generation Prompt** from Sally.

I will now synthesize all of this information to create the definitive **Fullstack Architecture Document** using the `fullstack-architecture-tmpl.yaml`. This document will serve as the master plan for the development team.

Let's begin with the introduction and the choice of a starter template.

---

# Riskflow CRM Web App Fullstack Architecture Document

## **1. Introduction**
This document outlines the complete fullstack architecture for the Riskflow CRM Web App, including the Angular frontend, the Google Cloud/Firebase backend, and their integration. It serves as the single source of truth for all technical implementation, ensuring consistency across the entire technology stack.

### **Starter Template or Existing Project**
While a specific third-party starter template was not selected, this architecture will be based on the official, industry-standard project structures provided by the **Angular CLI** and the **Firebase CLI**.

* The frontend will be initialized using `ng new`.
* The backend (serverless functions) will be initialized using `firebase init functions`.
* The AI-generated UI code (from the v0 prompt) will serve as a high-fidelity visual and structural reference for the Angular component implementation.

This approach ensures we start with a clean, well-structured foundation that adheres to the best practices of the chosen ecosystem.

### **Change Log**
| Date | Version | Description | Author |
| :--- | :--- | :--- | :--- |
| 2025-08-03 | 1.0 | Initial architecture draft | Winston (Architect) |

---
Of course. Understood completely.

You are requesting a client-side architecture where the Angular application communicates directly with Firestore for database operations and Firebase Authentication for user management, removing the need for an intermediary backend layer like Cloud Functions for the primary CRUD (Create, Read, Update, Delete) operations.

This is an excellent and very common pattern for developing with Firebase. It simplifies the architecture significantly but also places a critical emphasis on using **Firestore Security Rules** to protect your data, as all authorization and validation logic will be defined there instead of in a backend API.

I have revised the High-Level Architecture to reflect this "Backend-as-a-Service" (BaaS) approach.

-----

## **2. High Level Architecture (Revised)**

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

## **3. Tech Stack**

### **Technology Stack Table**
| Category | Technology | Version | Purpose | Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend Language** | TypeScript | ~5.4.x | Primary language for Angular development | Provides type safety, scalability, and is native to Angular. |
| **Frontend Framework**| Angular | ~18.x.x | Core framework for building the user interface | User's required choice. A robust and mature framework for enterprise applications. |
| **UI Component Library**| Angular Material | ~18.x.x | Provides a comprehensive set of pre-built UI components | High-quality, accessible components that accelerate frontend development. |
| **State Management** | NgRx | ~18.x.x | Manages application-wide state | Provides a predictable and scalable pattern for managing complex state. |
| **Database** | Firestore | (SDK ~10.x) | Primary NoSQL database for all application data | User's required choice. Highly scalable, real-time, and serverless. |
| **Authentication** | Firebase Auth | (SDK ~10.x) | Handles user identity, login, and security | Seamlessly integrates with Firestore security rules and the Angular app. |
| **File Storage** | Firebase Storage| (SDK ~10.x) | Stores file attachments for communication logs | The native, secure solution for file storage in the Firebase ecosystem. |
| **Frontend Testing** | Jest & Playwright | Latest | Unit testing (Jest) and End-to-End testing (Playwright)| Jest is the modern standard for Angular unit tests. Playwright is a powerful tool for E2E tests. |
| **Build Tool** | Angular CLI | ~18.x.x | Standard toolchain for Angular development | Manages project creation, building, testing, and deployment. |
| **Styling** | Tailwind CSS | ~3.4.x | A utility-first CSS framework for styling | Allows for rapid development of modern, custom user interfaces. |
| **Monitoring** | Google Analytics | Latest | Tracks user interaction and application usage | Provides insights into how the application is being used. |

---

Please review this definitive tech stack. This is a critical decision point that locks in the tools for the project. Do you approve of these selections?