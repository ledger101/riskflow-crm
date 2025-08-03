With the tech stack finalized, we will now define the **Data Models**.

This section outlines the structure for each piece of information the CRM will store in Firestore. We will create TypeScript interfaces for each model, which will ensure data consistency between our Angular application and the database.

Let's begin with the foundational master data models: `Solution`, `Client`, and `Stakeholder`.

-----

## **4. Data Models**

### **Solution**

  * [cite\_start]**Purpose**: Represents a distinct product or service that Riskflow offers to clients[cite: 1487, 1494].
  * **TypeScript Interface**:
    ```typescript
    export interface Solution {
      id: string; // Unique identifier (document ID in Firestore)
      name: string;
      description: string;
    }
    ```

### **Client**

  * [cite\_start]**Purpose**: Represents a client company that Riskflow is engaging with[cite: 1487, 1492].
  * **TypeScript Interface**:
    ```typescript
    export interface Client {
      id: string; // Unique identifier
      name: string;
      country: string;
      industry?: string;
    }
    ```

### **Stakeholder**

  * [cite\_start]**Purpose**: Represents an individual contact person associated with a client company[cite: 1487, 1497, 1498].
  * **Relationships**: A Client can have many Stakeholders.
  * **TypeScript Interface**:
    ```typescript
    export interface Stakeholder {
      id: string; // Unique identifier
      clientId: string; // Links to the parent Client document
      name: string;
      role: string; // e.g., "CEO", "Head of Treasury"
      contactInfo?: {
        email?: string;
        phone?: string;
      };
    }
    ```

Understood. Now that the foundational master data is defined, we will model the core operational entities. These represent the day-to-day activities and data that your sales team will be creating and managing.

Here are the remaining data models for the MVP: `Opportunity`, `Communication`, and `ActionItem`.

-----

### **Opportunity**

  * **Purpose**: This is the central model in the CRM. It represents a single sales deal or opportunity in the pipeline and links all related information together.
  * **Relationships**: An Opportunity is linked to one `Client` and one `Solution`, and can have many `Communications` and `ActionItems`.
  * **TypeScript Interface**:
    ```typescript
    import { Timestamp } from 'firebase/firestore';

    export interface Opportunity {
      id: string; // Unique identifier
      clientId: string;
      clientName: string; // Stored for easy display in lists to reduce database queries
      solutionId: string;
      solutionName: string; // Stored for easy display
      ownerId: string; // Links to a User
      description: string;
      value: number;
      stage: string; // e.g., 'Lead', 'Proposal', 'Awarded'
      probability: number; // Percentage, e.g., 20, 80
      createdAt: Timestamp;
    }
    ```
    *Note: We are storing `clientName` and `solutionName` directly on the opportunity. This is a common and recommended practice with Firestore called "denormalization," which improves performance by reducing the need for extra database lookups when displaying lists.*

### **Communication**

  * **Purpose**: Represents a single logged interaction (e.g., a call, email, or meeting) related to an Opportunity.
  * **Relationships**: Many Communications belong to one Opportunity.
  * **TypeScript Interface**:
    ```typescript
    import { Timestamp } from 'firebase/firestore';

    interface Attachment {
      fileName: string;
      url: string; // Link to the file in Firebase Storage
    }

    export interface Communication {
      id: string; // Unique identifier
      opportunityId: string; // Links to the parent Opportunity
      type: 'Email' | 'Phone Call' | 'WhatsApp' | 'Online Meeting' | 'Physical Meeting';
      date: Timestamp;
      summary: string; // Notes from the interaction
      attachments?: Attachment[];
    }
    ```

### **ActionItem**

  * **Purpose**: Represents a single task or "next step" that needs to be completed for an Opportunity.
  * **Relationships**: Many Action Items can belong to one Opportunity.
  * **TypeScript Interface**:
    ```typescript
    import { Timestamp } from 'firebase/firestore';

    export interface ActionItem {
      id: string; // Unique identifier
      opportunityId: string; // Links to the parent Opportunity
      description: string;
      dueDate?: Timestamp;
      isComplete: boolean;
      completedAt?: Timestamp;
    }
    ```

----- 