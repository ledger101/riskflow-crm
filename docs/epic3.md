Perfect. With the core execution features defined, we will now detail the final epic for the MVP, which focuses on delivering insights through reporting.

Here is the detailed breakdown for **Epic 3**. These stories will create the dashboard that provides real-time visibility into the sales pipeline and financial performance.

---

## **Epic 3: Reporting & Analytics Dashboard**
**Epic Goal**: This epic brings all the collected data to life by providing valuable, real-time insights to leadership and the sales team. It focuses on creating a central dashboard that visualizes the health of the sales pipeline and tracks performance against key financial targets. Upon completion, stakeholders will no longer need to manually compile reports and can make faster, data-informed decisions.

### **Story 3.1: Dashboard UI & Widget Layout**
* **As a** User,
* **I want** to see a main dashboard page with a defined layout for various reporting widgets,
* **so that** there is a consistent and organized space for viewing analytics.

**Acceptance Criteria**:
1.  A "Dashboard" page is created and set as the default page after login.
2.  The page has a responsive grid-based layout that can hold multiple data widgets.
3.  Placeholder components are created for each planned widget (e.g., "Pipeline Overview," "Financial Performance").
4.  The dashboard is accessible to all user roles.

### **Story 3.2: Pipeline Overview Widget**
* **As a** Sales Leader,
* **I want** a pipeline overview widget on the dashboard that shows the number and total value of opportunities in each stage,
* **so that** I can quickly assess the health of the sales funnel.

**Acceptance Criteria**:
1.  A widget on the dashboard visually represents the sales pipeline (e.g., as a funnel or bar chart).
2.  Each stage in the chart displays the total count of opportunities and the sum of their financial value.
3.  The data in the widget updates in real-time as opportunities are created or their stages are changed.
4.  Clicking on a stage in the widget can (optionally, as a nice-to-have) navigate the user to the Opportunities list, pre-filtered for that stage.

### **Story 3.3: Financial Performance Widget**
* **As a** Sales Leader,
* **I want** a financial performance widget that tracks sales against our quarterly and annual targets,
* **so that** I can monitor progress towards our financial goals.

**Acceptance Criteria**:
1.  A widget on the dashboard displays the Annual Sales Target and the current Quarterly Sales Target (these values will be configured in the admin settings).
2.  The widget shows the sum of the value of all opportunities marked as "Closed - Awarded" within the relevant time period.
3.  A visual element, like a progress bar or gauge, clearly shows the percentage of the target that has been achieved.
4.  The widget's data updates in real-time when an opportunity is won.

### **Story 3.4: Data Export Functionality**
* **As a** Sales Leader,
* **I want** to export the opportunity list as an Excel or PDF file,
* **so that** I can perform offline analysis or share reports with stakeholders.

**Acceptance Criteria**:
1.  An "Export" button is available on the "Opportunities" page.
2.  Clicking the button gives the user the option to export as either Excel or PDF.
3.  The exported file includes all data currently displayed in the opportunity list, respecting any active filters.

---

This completes the story breakdown for all three epics required for the MVP. Please review this final set of stories.

Once you approve this, the PRD will be considered functionally complete, and I will prepare it for the final validation and handoff to the Architect.