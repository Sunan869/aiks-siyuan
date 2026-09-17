export type AiksSearchScope = "knowledge" | "aiConversations";

export interface AiksSearchModel {
    shortcut: "Mod+K";
    defaultScopes: AiksSearchScope[];
    opensAsMainMode: false;
}

export const AIKS_SEARCH: AiksSearchModel = {
    shortcut: "Mod+K",
    defaultScopes: ["knowledge", "aiConversations"],
    opensAsMainMode: false,
};
