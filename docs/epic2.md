Great. With the foundational stories for Epic 1 approved, we will now define the user stories for the core sales functionality.

Here is the detailed breakdown for **Epic 2**. These stories focus on enabling your sales team to actively manage their deals and communications within the new system.

---

## **Epic 2: Opportunity & Communication Management**
**Epic Goal**: This epic delivers the core functionality for the sales team. It enables them to manage the entire lifecycle of a sales opportunity, from creation to closing. A key feature is the ability to meticulously log all client communications, providing a complete history of every interaction and ensuring a single source of truth for each deal.

### **Story 2.1: View Opportunities List**
* **As a** Sales Team member,
* **I want** to view a list of all sales opportunities,
* **so that** I can get an overview of the current pipeline.

**Acceptance Criteria**:
1.  A main "Opportunities" page is created and accessible from the primary navigation.
2.  The page displays all opportunities in a table or grid, showing key fields (e.g., Client, Solution, Value, Stage, Owner).
3.  The list of opportunities can be sorted by any of the key fields.
4.  The list can be filtered by Stage, Owner, and Country.

### **Story 2.2: Create a New Opportunity**
* **As a** Sales Team member,
* **I want** to create a new sales opportunity, linking it to an existing client and solution,
* **so that** I can start tracking a new deal.

**Acceptance Criteria**:
1.  A "Create New Opportunity" button is available on the Opportunities page.
2.  A form is presented that allows the user to select a Client and a Solution from the master data created in Epic 1.
3.  The user can input all required opportunity fields (Description, Value, initial Probability, initial Stage).
4.  The Opportunity Owner defaults to the logged-in user but can be changed by an Admin.
5.  Upon saving, the new opportunity is added to the Firestore database and appears in the Opportunities list.

### **Story 2.3: View and Edit an Opportunity's Details**
* **As a** Sales Team member,
* **I want** to view the full details of a single opportunity and edit its attributes,
* **so that** I can keep the deal information up-to-date as it progresses.

**Acceptance Criteria**:
1.  Clicking on an opportunity in the list navigates the user to its dedicated detail page.
2.  The detail page displays all information associated with the opportunity.
3.  An "Edit" function allows the user to update key fields, such as Value, Probability, and Stage.
4.  All changes are saved to Firestore and reflected in the Opportunities list.

### **Story 2.4: Log a Communication**
* **As a** Sales Team member,
* **I want** to log a communication event (e.g., email, call, meeting) against a specific opportunity,
* **so that** a complete and chronological record of all client interactions is maintained.

**Acceptance Criteria**:
1.  The opportunity detail page contains a communication timeline/log section.
2.  A form allows the user to add a new communication entry, selecting the type (Email, Call, etc.), date/time, and adding rich text notes.
3.  The user can optionally upload one or more file attachments (e.g., meeting recordings, presentations) to a communication log.
4.  Once saved, the new entry appears in the communication timeline, sorted chronologically.

### **Story 2.5: Manage Action Items**
* **As a** Sales Team member,
* **I want** to add, view, and complete action items for an opportunity,
* **so that** I can effectively manage my tasks and next steps for each deal.

**Acceptance Criteria**:
1.  The opportunity detail page contains a section for managing "Next Steps" or "Action Items".
2.  The user can add a new action item with a description and an optional due date.
3.  Action items can be marked as complete (e.g., via a checkbox).
4.  The interface clearly distinguishes between open and completed action items.

---

Please review these stories for Epic 2. Do they cover the essential day-to-day activities of your sales team as you envision them?