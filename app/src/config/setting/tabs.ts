import {editorConfigApi} from "../tabs/editorRuntime";
import {fileConfigApi} from "../tabs/fileRuntime";
import {flashcardConfigApi} from "../tabs/flashcardRuntime";
import {aiConfigApi} from "../tabs/ai/aiRuntime";
import {secretsConfigApi} from "../tabs/secretsVariablesRuntime";
import {exportConfigApi} from "../tabs/exportRuntime";
import {searchConfigApi} from "../tabs/searchRuntime";
import {appearanceConfigApi} from "../tabs/appearanceRuntime";
import {mountSyncTabExtras, patchSyncConfig} from "../tabs/syncRuntime";
import {mountAccessTab} from "../tabs/accessRuntime";
import {collectAssetsTabSearchStrings, mountAssetsTab} from "../assets";
import {collectBazaarTabSearchStrings, mountBazaarTab} from "../bazaarTab";
/// #if !MOBILE
import {collectKeymapTabSearchStrings, mountKeymapTab} from "../tabs/keymapUi";
/// #endif
import {SettingBuilder, type SettingTab} from "./builder";
import {registerEditorTab} from "../tabs/editorTab";
import {registerFileTab} from "../tabs/fileTab";
import {registerFlashcardTab} from "../tabs/flashcardTab";
import {registerAiTab} from "../tabs/ai/aiTab";
import {registerSecretsVariablesTab} from "../tabs/secretsVariablesTab";
import {registerExportTab} from "../tabs/exportTab";
import {registerSearchTab} from "../tabs/searchTab";
import {registerAppearanceTab} from "../tabs/appearanceTab";
import {registerSyncTab} from "../tabs/syncTab";
import {registerAccessTab} from "../tabs/accessTab";
import {registerAppTab} from "../tabs/appTab";
import {registerAboutTab} from "../tabs/aboutTab";
import {isDisabledFeature} from "../../protyle/util/compatibility";
import {getHostCapabilities} from "../../util/hostCapabilities";

const setting = new SettingBuilder();
const settingTabs = {
    editor: setting.tab({
        id: "editor",
        icon: "iconEdit",
        title: () => window.siyuan.languages.editor,
        defaultSave: editorConfigApi.patch,
    }, registerEditorTab),
    file: setting.tab({
        id: "file",
        icon: "iconFiles",
        title: () => window.siyuan.languages.fileTree,
        defaultSave: fileConfigApi.patch,
    }, registerFileTab),
    appearance: setting.tab({
        id: "appearance",
        icon: "iconTheme",
        title: () => window.siyuan.languages.appearance,
        defaultSave: appearanceConfigApi.patch,
    }, registerAppearanceTab),
    bazaar: setting.panel({
        id: "bazaar",
        icon: "iconBazaar",
        title: () => window.siyuan.languages.bazaar,
        // 产品定制：集市入口已下线
        hidden: () => true,
        searchStrings: collectBazaarTabSearchStrings,
        mount: mountBazaarTab,
    }),
    flashcard: setting.tab({
        id: "flashcard",
        icon: "iconRiffCard",
        title: () => window.siyuan.languages.riffCard,
        // 产品定制：闪卡设置已下线
        hidden: () => true,
        defaultSave: flashcardConfigApi.patch,
    }, registerFlashcardTab),
    ai: setting.tab({
        id: "ai",
        icon: "iconSparkles",
        title: () => window.siyuan.languages.ai,
        hidden: () => isDisabledFeature("ai"),
        defaultSave: aiConfigApi.patch,
    }, registerAiTab),
    secretsVariables: setting.tab({
        id: "secretsVariables",
        icon: "iconSquareAsterisk",
        title: () => window.siyuan.languages.secretsVariables,
        // 产品定制：秘钥与变量已下线
        hidden: () => true,
        defaultSave: secretsConfigApi.patch,
    }, registerSecretsVariablesTab),
    assets: setting.panel({
        id: "assets",
        icon: "iconImage",
        title: () => window.siyuan.languages.assets,
        searchStrings: collectAssetsTabSearchStrings,
        mount: mountAssetsTab,
    }),
    export: setting.tab({
        id: "export",
        icon: "iconUpload",
        title: () => window.siyuan.languages.export,
        hidden: () => !getHostCapabilities().importExport,
        defaultSave: exportConfigApi.patch,
    }, registerExportTab),
    search: setting.tab({
        id: "search",
        icon: "iconSearch",
        title: () => window.siyuan.languages.search,
        defaultSave: searchConfigApi.patch,
    }, registerSearchTab),
    /// #if !MOBILE
    keymap: setting.panel({
        id: "keymap",
        icon: "iconKeymap",
        title: () => window.siyuan.languages.keymap,
        searchStrings: collectKeymapTabSearchStrings,
        mount: mountKeymapTab,
    }),
    /// #endif
    sync: setting.tab({
        id: "sync",
        icon: "iconCloud",
        title: () => window.siyuan.languages.accountSync,
        // 产品定制：账号与同步已下线
        hidden: () => true,
        defaultSave: patchSyncConfig,
        afterMount: mountSyncTabExtras,
    }, registerSyncTab),
    access: setting.tab({
        id: "access",
        icon: "iconLock",
        title: () => window.siyuan.languages.authentication,
        // 产品定制：鉴权已下线
        hidden: () => true,
        afterMount: mountAccessTab,
    }, registerAccessTab),
    app: setting.tab({
        id: "app",
        icon: "iconLayoutGrid",
        title: () => window.siyuan.languages.application,
        // 产品定制：应用已下线
        hidden: () => true,
    }, registerAppTab),
    about: setting.tab({
        id: "about",
        icon: "iconInfo",
        title: () => window.siyuan.languages.about,
        // 产品定制：关于已下线
        hidden: () => true,
    }, registerAboutTab),
};

export type TSettingTab = keyof typeof settingTabs;

export const getSettingTab = (id: TSettingTab): SettingTab => settingTabs[id];

export interface ISettingTabShell<TId extends string = string> {
    id: TId;
    icon: string;
    title: string;
    hidden?: boolean;
}

let settingTabShellCache: ISettingTabShell<TSettingTab>[] | undefined;

export const getSettingTabDefs = (): ISettingTabShell<TSettingTab>[] => {
    if (settingTabShellCache) {
        return settingTabShellCache;
    }
    settingTabShellCache = (Object.entries(settingTabs) as [TSettingTab, SettingTab][]).map(([id, tab]) => ({
        id,
        icon: tab.icon,
        title: tab.title(),
        hidden: tab.hidden?.(),
    }));
    return settingTabShellCache;
};

/** 移动端侧栏中设置标签页菜单项的 DOM `id` */
export const settingTabToMenuId = (tabId: string): string =>
    "menuConfig" + tabId[0].toUpperCase() + tabId.slice(1);
