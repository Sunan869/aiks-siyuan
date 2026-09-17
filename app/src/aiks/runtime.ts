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
};

type AiksDockConfig = {
    data?: AiksDockItem[][];
};

export type AiksUiLayoutLike = {
    hideDock?: boolean;
    layout?: unknown;
    left?: AiksDockConfig;
    right?: AiksDockConfig;
    bottom?: AiksDockConfig;
};

export type AiksWorkbenchConfigLike = {
    appearance?: {
        hideToolbar?: boolean;
    };
    system?: {
        disabledFeatures?: string[];
    };
    fileTree?: {
        openFilesUseCurrentTab?: boolean;
        maxOpenTabCount?: number;
    };
    uiLayout: AiksUiLayoutLike;
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

export const applyAiksWorkbenchConfigPolicy = <T extends AiksWorkbenchConfigLike>(config: T): T => {
    applyAiksWorkbenchLayoutPolicy(config.uiLayout);
    if (config.appearance) {
        config.appearance.hideToolbar = true;
    }
    if (config.system) {
        config.system.disabledFeatures ||= [];
        if (!config.system.disabledFeatures.includes("ai")) {
            config.system.disabledFeatures.push("ai");
        }
    }
    if (config.fileTree) {
        config.fileTree.openFilesUseCurrentTab = true;
        config.fileTree.maxOpenTabCount = 1;
    }
    return config;
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
