declare const SIYUAN_PROFILE: string | undefined;

export const AIKS_EMBEDDED_PROFILE_NAME = "aiks-embedded" as const;

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

const STANDALONE_PROFILE: AiksEmbeddedProfile = {
    enabled: false,
    productName: "AIKS Knowledge Workbench",
    hidePluginMarketplace: false,
    hidePluginManagement: false,
    hideThemeMarketplace: false,
    hideSiyuanAi: false,
    hideAgent: false,
    hideMcp: false,
    hideAccount: false,
    hideCloudSync: false,
    hideSubscription: false,
    hideCommunity: false,
    hideSelfUpdate: false,
    readOnlyRootPaths: [],
};

const EMBEDDED_PROFILE: AiksEmbeddedProfile = {
    enabled: true,
    productName: "AIKS Knowledge Workbench",
    hidePluginMarketplace: true,
    hidePluginManagement: true,
    hideThemeMarketplace: true,
    hideSiyuanAi: true,
    hideAgent: true,
    hideMcp: true,
    hideAccount: true,
    hideCloudSync: true,
    hideSubscription: true,
    hideCommunity: true,
    hideSelfUpdate: true,
    readOnlyRootPaths: ["/10 AI Sessions"],
};

function cloneProfile(profile: AiksEmbeddedProfile): AiksEmbeddedProfile {
    return {
        ...profile,
        readOnlyRootPaths: [...profile.readOnlyRootPaths],
    };
}

export function resolveAiksEmbeddedProfile(profileName?: string): AiksEmbeddedProfile {
    return cloneProfile(profileName === AIKS_EMBEDDED_PROFILE_NAME ? EMBEDDED_PROFILE : STANDALONE_PROFILE);
}

function readBuildProfileName(): string | undefined {
    return typeof SIYUAN_PROFILE === "undefined" || SIYUAN_PROFILE === "" ? undefined : SIYUAN_PROFILE;
}

const activeProfile = resolveAiksEmbeddedProfile(readBuildProfileName());

export function getAiksEmbeddedProfile(): AiksEmbeddedProfile {
    return cloneProfile(activeProfile);
}

export function isAiksEmbedded(): boolean {
    return activeProfile.enabled;
}
