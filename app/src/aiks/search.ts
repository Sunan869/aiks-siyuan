export type AiksSearchScope =
    | "all"
    | "knowledge"
    | "conversations"
    | "currentDocument"
    | "currentDirectory";

export interface AiksSearchScopeOption {
    id: AiksSearchScope;
    label: string;
}

export const AIKS_SEARCH_DEFAULT_SCOPE: AiksSearchScope = "all";

export const AIKS_SEARCH_SCOPES: AiksSearchScopeOption[] = [
    {id: "all", label: "全部"},
    {id: "knowledge", label: "知识"},
    {id: "conversations", label: "AI 对话记录"},
    {id: "currentDocument", label: "当前文档"},
    {id: "currentDirectory", label: "当前目录"},
];

export const AIKS_SEARCH_FILTERS = ["project", "category", "tags", "time"] as const;

export type AiksSearchFilter = typeof AIKS_SEARCH_FILTERS[number];
