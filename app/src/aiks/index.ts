import {initializeAiksEmbeddedWorkbench} from "./bootstrap";

initializeAiksEmbeddedWorkbench();

export {
    AIKS_EMBEDDED_PROFILE_NAME,
    getAiksEmbeddedProfile,
    isAiksEmbedded,
    resolveAiksEmbeddedProfile,
    type AiksEmbeddedProfile,
} from "./profile";
export {AIKS_ROOTS, type AiksRootPresentation} from "./roots";
export {
    AIKS_WORKBENCH_LAYOUT,
    type AiksAuxiliaryTab,
    type AiksToolbarAction,
    type AiksWorkbenchLayoutModel,
    type AiksWorkbenchMode,
    type AiksWorkbenchPane,
} from "./layout";
export {AIKS_SEARCH, type AiksSearchModel, type AiksSearchScope} from "./search";
export {
    AIKS_TOPBAR_ENTRY_IDS,
    applyAiksWorkbenchConfigPolicy,
    applyAiksWorkbenchLayoutPolicy,
    getAiksRootDisplayName,
    type AiksUiLayoutLike,
    type AiksWorkbenchConfigLike,
} from "./runtime";
export {
    AIKS_ROOT_TREE_SELECTOR,
    initializeAiksRootPresentation,
    presentAiksRootLabels,
    type AiksRootLabelElementLike,
} from "./presentation";
export {
    installAiksWorkbenchHostApi,
    openAiksMainGraph,
    openAiksMainGraphWithRuntime,
    type AiksMainGraphOpenResult,
    type AiksMainGraphRuntime,
    type AiksWorkbenchHostApi,
} from "./hostApi";
export {initializeAiksEmbeddedWorkbench} from "./bootstrap";
