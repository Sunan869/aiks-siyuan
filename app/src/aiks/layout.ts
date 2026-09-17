export type AiksWorkbenchMode = "document" | "database" | "graph";
export type AiksRightPanel = "outline" | "backlinks" | "properties";
export type AiksStandaloneSurface =
    | "pluginMarketplace"
    | "pluginManagement"
    | "themeMarketplace"
    | "siyuanAi"
    | "agent"
    | "mcp"
    | "cloudSync"
    | "account"
    | "subscription"
    | "community"
    | "selfUpdate"
    | "standaloneSettings";

export interface AiksWorkbenchLayout {
    leftPanel: "documentTree";
    primaryModes: AiksWorkbenchMode[];
    rightPanels: AiksRightPanel[];
    search: "siyuan";
    hiddenStandaloneSurfaces: AiksStandaloneSurface[];
}

export function createAiksWorkbenchLayout(): AiksWorkbenchLayout {
    return {
        leftPanel: "documentTree",
        primaryModes: ["document", "database", "graph"],
        rightPanels: ["outline", "backlinks", "properties"],
        search: "siyuan",
        hiddenStandaloneSurfaces: [
            "pluginMarketplace",
            "pluginManagement",
            "themeMarketplace",
            "siyuanAi",
            "agent",
            "mcp",
            "cloudSync",
            "account",
            "subscription",
            "community",
            "selfUpdate",
            "standaloneSettings",
        ],
    };
}
