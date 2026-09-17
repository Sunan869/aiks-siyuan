import {getAiksRootDisplayName} from "./runtime";

export const AIKS_ROOT_TREE_SELECTOR =
    '.sy__file ul[data-url] > li[data-type="navigation-root"] + ul > li[data-type="navigation-file"] > .b3-list-item__text';

export interface AiksRootLabelElementLike {
    textContent: string | null;
    getAttribute?: (name: string) => string | null;
    setAttribute?: (name: string, value: string) => void;
}

export const presentAiksRootLabels = (elements: Iterable<AiksRootLabelElementLike>): number => {
    let changed = 0;
    for (const element of elements) {
        const internalLabel = element.textContent?.trim();
        if (!internalLabel) {
            continue;
        }
        const displayLabel = getAiksRootDisplayName(internalLabel);
        if (!displayLabel) {
            continue;
        }
        element.textContent = displayLabel;
        const ariaLabel = element.getAttribute?.("aria-label");
        if (ariaLabel?.startsWith(internalLabel)) {
            element.setAttribute?.("aria-label", displayLabel + ariaLabel.slice(internalLabel.length));
        }
        changed++;
    }
    return changed;
};

export const initializeAiksRootPresentation = (root: ParentNode = document): (() => void) => {
    const render = () => {
        presentAiksRootLabels(root.querySelectorAll<HTMLElement>(AIKS_ROOT_TREE_SELECTOR));
    };

    render();
    if (typeof MutationObserver === "undefined") {
        return () => undefined;
    }

    const target = root instanceof Document ? root.body : root as Node;
    if (!target) {
        return () => undefined;
    }

    const observer = new MutationObserver(render);
    observer.observe(target, {
        childList: true,
        characterData: true,
        subtree: true,
    });
    return () => observer.disconnect();
};
