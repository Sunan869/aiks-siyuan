import {Constants} from "../constants";
import {applyAiksWorkbenchLayoutPolicy} from "../aiks/runtime";
import {isAiksEmbedded} from "../aiks/profile";

export const ensureUILayout = () => {
    if (!window.siyuan.config.uiLayout?.left) {
        window.siyuan.config.uiLayout = JSON.parse(JSON.stringify(Constants.SIYUAN_EMPTY_LAYOUT));
    }
    if (isAiksEmbedded()) {
        applyAiksWorkbenchLayoutPolicy(window.siyuan.config.uiLayout);
    }
};
