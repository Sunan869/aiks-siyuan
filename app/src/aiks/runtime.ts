import {AIKS_ROOTS} from "./roots";

export const AIKS_TOPBAR_ENTRY_IDS = [
    "barBack",
    "barForward",
    "barSearch",
    "barDocument",
    "barDatabase",
    "barGraph",
    "barAuxiliary",
    "barMore",
] as const;

type AiksDockItem = {
    type?: string;
    [key: string]: unknown;
};

type AiksDockConfig = {
    data?: AiksDockItem[][];
    [key: string]: unknown;
};

export type AiksUiLayoutLike = {
    hideDock?: boolean;
    layout?: unknown;
    left?: AiksDockConfig;
    right?: AiksDockConfig;
    bottom?: AiksDockConfig;
    [key: string]: unknown;
};

const LEFT_DOCK_TYPES = new Set(["file"]);
const RIGHT_DOCK_TYPES = new Set(["outline", "backlink"]);

const filterDock = (dock: AiksDockConfig | undefined, allowed: Set<string>) => {
    if (!dock?.data) {
        return;
    }
    dock.data = dock.data.map((section) => section.filter((item) => Boolean(item?.type && allowed.has(item.type))));
};

export const applyAiksWorkbenchLayoutPolicy = <T extends AiksUiLayoutLike>(layout: T): T => {
    filterDock(layout.left, LEFT_DOCK_TYPES);
    filterDock(layout.right, RIGHT_DOCK_TYPES);
    filterDock(layout.bottom, new Set());
    layout.hideDock = false;
    return layout;
};

export const getAiksRootDisplayName = (pathOrName: string): string | undefined => {
    const value = pathOrName?.trim();
    if (!value) {
        return undefined;
    }
    const normalized = value.startsWith("/") ? value : `/${value}`;
    const root = AIKS_ROOTS.find((item) => item.path === normalized);
    if (!root) {
        return undefined;
    }
    return `${root.label}${root.readOnly ? " 🔒" : ""}`;
};
