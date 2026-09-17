export type AiksWorkbenchMode = "document" | "database" | "graph";
export type AiksWorkbenchPane = "documentTree" | "main" | "auxiliary";
export type AiksAuxiliaryTab = "outline" | "backlinks" | "properties";
export type AiksToolbarAction =
    | "back"
    | "forward"
    | "search"
    | "document"
    | "database"
    | "graph"
    | "toggleAuxiliary"
    | "more";

export interface AiksWorkbenchLayoutModel {
    panes: AiksWorkbenchPane[];
    auxiliaryTabs: AiksAuxiliaryTab[];
    mainModes: AiksWorkbenchMode[];
    toolbarActions: AiksToolbarAction[];
}

export const AIKS_WORKBENCH_LAYOUT: AiksWorkbenchLayoutModel = {
    panes: ["documentTree", "main", "auxiliary"],
    auxiliaryTabs: ["outline", "backlinks", "properties"],
    mainModes: ["document", "database", "graph"],
    toolbarActions: [
        "back",
        "forward",
        "search",
        "document",
        "database",
        "graph",
        "toggleAuxiliary",
        "more",
    ],
};
