# **1. Introduction**
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
