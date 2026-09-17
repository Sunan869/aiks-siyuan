import {installAiksWorkbenchHostApi} from "./hostApi";
import {isAiksEmbedded} from "./profile";
import {initializeAiksRootPresentation} from "./presentation";

let stopRootPresentation: (() => void) | undefined;

export const initializeAiksEmbeddedWorkbench = () => {
    if (!isAiksEmbedded() || typeof document === "undefined") {
        return;
    }

    document.documentElement.dataset.aiksProfile = "embedded";
    installAiksWorkbenchHostApi(window);
    stopRootPresentation?.();
    stopRootPresentation = initializeAiksRootPresentation(document);
};
