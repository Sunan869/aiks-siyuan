import { AIKS_ROOTS } from "./roots";

const READ_ONLY_ROOTS = AIKS_ROOTS.filter((root) => root.readOnly).map((root) => root.path);

export function isAiksReadOnlyPath(path: string): boolean {
    return READ_ONLY_ROOTS.some((root) => path === root || path.startsWith(`${root}/`));
}
