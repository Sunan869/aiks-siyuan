export type AiksMainGraphOpenResult = "reused" | "created" | "unavailable";

export type AiksAiAssistOperation =
    | "summary"
    | "tags"
    | "category"
    | "title"
    | "key_conclusions"
    | "structure"
    | "rewrite";

export interface AiksAiAssistSuggestion {
    operation: AiksAiAssistOperation;
    title?: string | null;
    summary?: string | null;
    tags?: string[];
    category?: string | null;
    text?: string | null;
}

export interface AiksMainGraphRuntime {
    activateExistingGlobalGraph: () => boolean;
    createGlobalGraph: () => boolean;
}

export interface AiksEmbeddedBridgeRuntime {
    requestAiAssist: (
        docId: string,
        operation: AiksAiAssistOperation,
    ) => Promise<AiksAiAssistSuggestion>;
}

export interface AiksWorkbenchHostApi {
    openGraph: () => Promise<boolean>;
    requestAiAssist: (
        docId: string,
        operation: AiksAiAssistOperation,
    ) => Promise<AiksAiAssistSuggestion>;
}

declare global {
    interface Window {
        aiksWorkbench?: AiksWorkbenchHostApi;
        __AIKS_BRIDGE__?: AiksEmbeddedBridgeRuntime;
    }
}

export const openAiksMainGraphWithRuntime = (runtime: AiksMainGraphRuntime): AiksMainGraphOpenResult => {
    if (runtime.activateExistingGlobalGraph()) {
        return "reused";
    }
    return runtime.createGlobalGraph() ? "created" : "unavailable";
};

const createNativeGraphRuntime = async (): Promise<AiksMainGraphRuntime | undefined> => {
    if (typeof window === "undefined" || !window.siyuan?.layout?.centerLayout || !window.siyuan?.ws?.app) {
        return undefined;
    }

    const [getAllModule, layoutModule, tabModule, graphModule] = await Promise.all([
        import("../layout/getAll"),
        import("../layout/util"),
        import("../layout/Tab"),
        import("../layout/dock/Graph"),
    ]);

    return {
        activateExistingGlobalGraph: () => {
            const graph = getAllModule.getAllModels().graph.find((item) => item.type === "global");
            const tab = graph?.parent;
            const wnd = tab?.parent;
            if (!tab?.headElement || !wnd) {
                return false;
            }
            wnd.switchTab(tab.headElement, true);
            wnd.showHeading();
            return true;
        },
        createGlobalGraph: () => {
            const app = window.siyuan?.ws?.app;
            const centerLayout = window.siyuan?.layout?.centerLayout;
            if (!app || !centerLayout) {
                return false;
            }
            const wnd = layoutModule.getWndByLayout(centerLayout);
            if (!wnd) {
                return false;
            }
            const title = window.siyuan.languages?.graphView || window.siyuan.languages?.globalGraph || "Graph";
            wnd.addTab(new tabModule.Tab({
                icon: "iconGraph",
                title,
                callback(tab) {
                    tab.addModel(new graphModule.Graph({
                        app,
                        tab,
                        type: "global",
                    }));
                },
            }));
            return true;
        },
    };
};

export const openAiksMainGraph = async (): Promise<boolean> => {
    const runtime = await createNativeGraphRuntime();
    if (!runtime) {
        return false;
    }
    return openAiksMainGraphWithRuntime(runtime) !== "unavailable";
};

export const installAiksWorkbenchHostApi = (target: Window = window): AiksWorkbenchHostApi => {
    const api: AiksWorkbenchHostApi = {
        openGraph: openAiksMainGraph,
        requestAiAssist: async (docId, operation) => {
            const bridge = target.__AIKS_BRIDGE__;
            if (!bridge?.requestAiAssist) {
                throw new Error("AIKS AI Assist bridge is unavailable");
            }
            return bridge.requestAiAssist(docId, operation);
        },
    };
    target.aiksWorkbench = api;
    return api;
};
