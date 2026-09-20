export interface AiksRootPresentation {
    path: string;
    label: string;
    readOnly: boolean;
}

export const AIKS_ROOTS: AiksRootPresentation[] = [
    {path: "/10 AI Sessions", label: "AI 对话记录", readOnly: true},
    {path: "/20 Knowledge", label: "知识", readOnly: false},
];
