Great. Now that we have the application's skeleton, let's map out the **User Flows**.

This section details the step-by-step paths that users will take to accomplish their most important tasks. We'll start with the most critical flow for a sales representative: creating a new opportunity.

-----

## **3. User Flows**

### **Flow 1: Creating a New Opportunity**

  * **User Goal**: To quickly and accurately capture a new sales lead in the system so it can be tracked in the pipeline.
  * **Entry Point**: The user clicks a "Create New Opportunity" button on the main "Opportunities List" page.
  * **Success Criteria**: A new opportunity record is successfully created in the database and is immediately visible in the Opportunities List.

#### **Flow Diagram**

```mermaid
graph TD
    A[User is on Opportunities List Page] --> B{Clicks 'Create New Opportunity'};
    B --> C[System displays 'Create Opportunity' form];
    C --> D[User selects an existing Client];
    D --> E[User selects an existing Solution];
    E --> F[User fills in remaining fields <br>(e.g., Value, Description)];
    F --> G{User clicks 'Save'};
    G --> H{Is form data valid?};
    H -- Yes --> I[System saves data to Firestore];
    I --> J[System closes form];
    J --> K[System shows success message <br>and refreshes the Opportunity List];
    H -- No --> L[System displays validation errors <br>on the form];
    L --> F;
```

#### **Edge Cases & Error Handling:**

  * **Incomplete Form**: If the user tries to save without filling in required fields (e.g., Client, Solution, Value), the form will display clear inline error messages indicating which fields are missing.
  * **Network Error**: If the save operation fails due to a network or server issue, the system will display a notification to the user (e.g., "Failed to save opportunity. Please try again.") and the form will remain open with the data intact.

-----
Great. Let's move on to the next critical user flow, which covers the day-to-day management of an existing deal. This flow is central to the application's value, as it's where the sales team will spend most of their time.

-----

### **Flow 2: Managing an Existing Opportunity**

  * **User Goal**: To maintain an accurate, up-to-date record of a deal's progress and all related client interactions.
  * **Entry Point**: The user clicks on a specific opportunity from the "Opportunities List" page.
  * [cite\_start]**Success Criteria**: A new communication is successfully logged and appears in the timeline[cite: 43]. [cite\_start]The opportunity's stage is successfully updated, and the change is reflected in the main opportunity list[cite: 40].

#### **Flow Diagram**

```mermaid
graph TD
    A[User is on Opportunities List Page] --> B{Clicks on a specific opportunity};
    B --> C[System navigates to the Opportunity Detail Page];
    
    subgraph "On Opportunity Detail Page"
        C --> D{Wants to log a communication?};
        D -- Yes --> E[User clicks 'Add Communication'];
        E --> F[System displays 'Log Communication' form];
        F --> G[User fills in details <br>(type, notes, attachments)];
        G --> H{User clicks 'Save Log'};
        H --> I[System saves communication <br>and updates timeline];
        I --> C;

        C --> J{Wants to update status?};
        J -- Yes --> K[User clicks 'Edit' on opportunity details];
        K --> L[User changes 'Pipeline Stage' dropdown];
        L --> M{User clicks 'Save Changes'};
        M --> N[System saves new stage <br>and updates detail view];
        N --> C;
    end
    
    C --> O{Navigates back to<br>Opportunities List};
    O --> P[List now reflects updated Stage];

```

#### **Edge Cases & Error Handling:**

  * **Failed File Upload**: If a file attachment fails to upload when logging a communication, the system will notify the user, but still allow them to save the text-based notes of the log.
  * **Concurrent Edits**: If another user updates the opportunity while the current user is viewing the page, the system should ideally show a notification indicating that the data is stale and needs to be refreshed. (This can be a post-MVP consideration).
  * **Invalid Stage Transition**: The system could be configured in the future to prevent illogical stage jumps (e.g., from "Lead" directly to "Awarded"), but for the MVP, all transitions will be allowed.

-----

This flow represents the core daily loop for a sales representative. Does this accurately capture the process of updating a deal and logging an interaction?