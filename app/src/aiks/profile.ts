declare const SIYUAN_PROFILE: string | undefined;

const AIKS_EMBEDDED_PROFILE_NAME = "aiks-embedded";

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

const disabledProfile: AiksEmbeddedProfile = {
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

const embeddedProfile: AiksEmbeddedProfile = {
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

export function resolveAiksEmbeddedProfile(profileName?: string): AiksEmbeddedProfile {
    const profile = profileName === AIKS_EMBEDDED_PROFILE_NAME ? embeddedProfile : disabledProfile;
    return {...profile, readOnlyRootPaths: [...profile.readOnlyRootPaths]};
}

function runtimeProfileName(): string | undefined {
    return typeof SIYUAN_PROFILE === "string" && SIYUAN_PROFILE.length > 0 ? SIYUAN_PROFILE : undefined;
}

const runtimeProfile = resolveAiksEmbeddedProfile(runtimeProfileName());

export function getAiksEmbeddedProfile(): AiksEmbeddedProfile {
    return runtimeProfile;
}

export function isAiksEmbedded(): boolean {
    return runtimeProfile.enabled;
}
