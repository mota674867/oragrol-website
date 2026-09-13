export type OrOneDetailsContent = {
  itemLabel: string;
  title: string;
  subtitle: string;
  intro: string;
  inclusions: string[];
  control: string;
  whoItSuits: string;
  example: string;
  scope: string;
};

// Transcribed exactly from ORAGROL_Details_Claude_Complete.md, section 9.
// Signature (the document's 5th entry) is deliberately NOT included here —
// out of scope for this implementation per explicit instruction.
export const orOneDetailsContent: Record<string, OrOneDetailsContent> = {
  STARTER: {
    itemLabel: "STARTER",
    title: "OR ONE Starter",
    subtitle: "A focused first system.",
    intro:
      "Build a connected automation system for selected tasks within one business category, up to 30 points. We scope the capabilities, required connections and approval steps, then build and manage the agreed system. You receive a dashboard to review activity and decisions within that focused scope.",
    inclusions: [
      "Up to 30 points of selected capabilities from one category only.",
      "Build and configuration for the agreed workflow.",
      "Required connections identified during scoping.",
      "Dashboard visibility and defined approval steps.",
      "Managed operation within the agreed service scope.",
    ],
    control:
      "Review proposed outcomes through the dashboard and approve sensitive actions. Changes to selected capabilities are assessed for scope, feasibility and any additional work; a points balance is not an unlimited change allowance.",
    whoItSuits: "Businesses beginning with a focused workflow in one function.",
    example: "Select lead qualification and related Sales tasks within the 30-point limit, with the exact combination checked in the builder.",
    scope: "One category only. The build fee and Base monthly OR Service Fee are displayed on the tier card; final scope is confirmed through review.",
  },
  "100": {
    itemLabel: "100",
    title: "OR ONE 100",
    subtitle: "A broader connected scope.",
    intro:
      "Build a coordinated system using up to 100 points of selected capabilities across the available business categories. We define how the selected workflows share information, handle exceptions and bring decisions to you. You receive a managed system and dashboard organized around that agreed combination.",
    inclusions: [
      "Up to 100 points across selected categories.",
      "Connected workflows and agreed data handovers.",
      "Build and configuration for the confirmed scope.",
      "Dashboard visibility and approval steps.",
      "Managed operation within the agreed service scope.",
    ],
    control:
      "Approve proposed outcomes and sensitive actions through the agreed workflow. Changes are reviewed for feasibility and scope before implementation.",
    whoItSuits: "Businesses connecting a broader set of recurring tasks.",
    example: "Combine selected Sales and Customer Service capabilities within 100 points, so lead and customer records support a coordinated workflow.",
    scope:
      "Selected capabilities determine coverage; 100 points does not guarantee a whole department is automated. Refer to the tier card for the build fee and Base monthly OR Service Fee.",
  },
  "200": {
    itemLabel: "200",
    title: "OR ONE 200",
    subtitle: "More workflows working together.",
    intro:
      "Build a coordinated system using up to 200 points across selected business categories. We design the connections, ownership and approval steps needed for the chosen workflows to work together. You receive consolidated activity visibility and managed operation across the confirmed scope.",
    inclusions: [
      "Up to 200 points across selected categories.",
      "Shared records and workflow handovers as scoped.",
      "Build and configuration for the agreed combination.",
      "Dashboard visibility and approval steps.",
      "Managed operation within the agreed service scope.",
    ],
    control: "Proposed outcomes and sensitive decisions remain subject to approval. Changes to the system are reviewed before implementation.",
    whoItSuits: "Businesses coordinating recurring work across several functions.",
    example:
      "Connect selected Marketing, Sales and Customer Service tasks so campaign activity, leads and customer follow-up share an agreed process within 200 points.",
    scope: "Coverage depends on selected capabilities and connections. Refer to the tier card for the build fee and Base monthly OR Service Fee.",
  },
  "400": {
    itemLabel: "400",
    title: "OR ONE 400",
    subtitle: "An extensive operating scope.",
    intro:
      "Build a wider coordinated system using up to 400 points across the available categories. We map the selected processes, shared information and approval responsibilities into the agreed operating design. You receive a managed system with a central view of activity, exceptions and decisions across those workflows.",
    inclusions: [
      "Up to 400 points across selected categories.",
      "Coordination of the agreed workflows and handovers.",
      "Build and configuration for the confirmed operating scope.",
      "Dashboard visibility and approval steps.",
      "Managed operation within the agreed service scope.",
    ],
    control: "Final outcomes and sensitive actions follow agreed approval rules. Broader coverage does not remove human responsibility or permit unrestricted action.",
    whoItSuits: "Businesses needing extensive coordination across multiple functions.",
    example: "Connect selected Sales, Finance, Customer Service and Operations workflows within 400 points, with clear handovers and exception reporting.",
    scope:
      "This tier does not promise to run the entire business or every department. Refer to the tier card for the build fee and Base monthly OR Service Fee.",
  },
};

export const POINTS_EXPLANATION =
  "Points measure the complexity of your selected capabilities and help determine your system tier.";
