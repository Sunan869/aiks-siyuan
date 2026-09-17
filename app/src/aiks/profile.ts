export interface AiksEmbeddedProfile {
    enabled: boolean;
    productName: "AIKS Knowledge Workbench";
    hidePluginMarketplace: boolean;
    hidePluginManagement: boolean;
    hideThemeMarketplace: boolean;
    hideSiyuanAi: boolean;
    hideAgent: boolean;
    hideMcp: boolean;
    hideAccount: boolean;
    hideCloudSync: boolean;
    hideSubscription: boolean;
    hideCommunity: boolean;
    hideSelfUpdate: boolean;
    readOnlyRootPaths: string[];
}

const AIKS_PROFILE_NAME = "aiks-embedded";

function readRuntimeProfileName(): string | undefined {
    const runtime = globalThis as typeof globalThis & {
        process?: { env?: Record<string, string | undefined> };
    };
    return runtime.process?.env?.SIYUAN_PROFILE;
}

export function resolveAiksEmbeddedProfile(profileName?: string): AiksEmbeddedProfile {
    const enabled = profileName === AIKS_PROFILE_NAME;

    return {
        enabled,
        productName: "AIKS Knowledge Workbench",
        hidePluginMarketplace: enabled,
        hidePluginManagement: enabled,
        hideThemeMarketplace: enabled,
        hideSiyuanAi: enabled,
        hideAgent: enabled,
        hideMcp: enabled,
        hideAccount: enabled,
        hideCloudSync: enabled,
        hideSubscription: enabled,
        hideCommunity: enabled,
        hideSelfUpdate: enabled,
        readOnlyRootPaths: enabled ? ["/10 AI Sessions"] : [],
    };
}

export function getAiksEmbeddedProfile(): AiksEmbeddedProfile {
    return resolveAiksEmbeddedProfile(readRuntimeProfileName());
}

export function isAiksEmbedded(): boolean {
    return getAiksEmbeddedProfile().enabled;
}
