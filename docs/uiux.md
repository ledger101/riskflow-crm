## HIGH-LEVEL GOAL

Generate a multi-page CRM application dashboard using Next.js 14, TypeScript, and Tailwind CSS, based on the shadcn/ui component library. The application is for a sales team to manage their pipeline. The design should be clean, professional, data-dense, and responsive (mobile-first).

## DETAILED, STEP-BY-STEP INSTRUCTIONS

**1. Create the Main Application Layout:**
   - Generate a main layout component (`layout.tsx`) that includes a responsive sidebar for navigation on the left and a main content area on the right.
   - The sidebar should contain the following navigation links using the Lucide icons library: "Dashboard" (icon: LayoutDashboard), "Opportunities" (icon: DollarSign), and "Settings" (icon: Settings).
   - Add a header bar above the main content area. The header should include a user profile dropdown menu on the right with a "Log Out" option.

**2. Create the Login Page:**
   - Create a simple, centered login page (`/login`).
   - It should have a card component containing a form with fields for "Email" and "Password" (use shadcn/ui Input) and a "Login" button (use shadcn/ui Button).

**3. Create the Dashboard Page (`/`):**
   - This should be the main page after login, using the main layout.
   - The page title should be "Dashboard".
   - Create a responsive grid layout.
   - In the grid, add two main widgets:
     a. **Pipeline Overview Widget**: Display a shadcn/ui Card with the title "Pipeline Overview". Inside, use a Bar Chart (from shadcn/ui charts) to show the number of deals per stage. Use mock data for stages like "Lead", "Proposal", "Negotiation", "Closed - Won".
     b. **Financial Performance Widget**: Display a shadcn/ui Card with the title "Quarterly Performance". Inside, use a series of Stat Cards to show "Quarterly Target: $250,000", "Achieved: [mock value]", and "Win Rate: [mock %]". Add a shadcn/ui Progress bar to visualize the progress towards the quarterly target.

**4. Create the Opportunities Page (`/opportunities`):**
   - Use the main layout. The page title should be "Opportunities".
   - At the top of the page, include filter controls: a Dropdown (shadcn/ui Select) to filter by "Stage" and another to filter by "Owner".
   - Also at the top, include a "Create New Opportunity" button (shadcn/ui Button).
   - The main feature of this page is a Data Table (using shadcn/ui Table) to display a list of opportunities.
   - The table columns should be: "Client Name", "Solution", "Value" (formatted as currency), "Stage" (using a shadcn/ui Badge for styling), "Owner", and an "Actions" column with a dropdown menu (shadcn/ui DropdownMenu) for "View" and "Edit".

**5. Create the Opportunity Detail Page (`/opportunities/[id]`):**
   - This page is for viewing a single opportunity. Use a two-column responsive layout.
   - **Left Column**:
     - Display a shadcn/ui Card titled "Key Details". Inside, show the opportunity's core information: Client, Solution, Value, Stage, Probability, Owner.
     - Below that, display another Card titled "Action Items". This should be a list of tasks with checkboxes.
   - **Right Column (Main Area)**:
     - At the top, include the Opportunity's main title/description.
     - The primary feature is a "Communication Timeline". This should be a vertically stacked list of events (calls, emails, meetings). Each timeline item should show an icon for the communication type, the date, and the notes/summary.

## CODE EXAMPLES, DATA STRUCTURES & CONSTRAINTS

**Use these TypeScript types for all mock data:**

```typescript
type Opportunity = {
  id: string;
  clientName: string;
  solution: string;
  value: number;
  stage: 'Lead' | 'Contact' | 'Proposal' | 'Decision' | 'Awarded';
  probability: number;
  owner: string;
};

type Communication = {
  id: string;
  type: 'Email' | 'Call' | 'Meeting' | 'WhatsApp';
  date: string;
  notes: string;
  attachments?: { fileName: string; url: string }[];
};

type ActionItem = {
  id: string;
  task: string;
  isComplete: boolean;
};uiux.md