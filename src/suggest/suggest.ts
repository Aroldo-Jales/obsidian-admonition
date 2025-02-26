import {
    Editor,
    EditorPosition,
    EditorSuggest,
    EditorSuggestContext,
    EditorSuggestTriggerInfo,
    TFile
} from "obsidian";
import ObsidianAdmonition from "src/main";

export class CalloutSuggest extends EditorSuggest<string> {
    constructor(public plugin: ObsidianAdmonition) {
        super(plugin.app);
    }
    getSuggestions(ctx: EditorSuggestContext) {
        return Object.keys(this.plugin.admonitions).filter((p) =>
            p.toLowerCase().contains(ctx.query.toLowerCase())
        );
    }
    renderSuggestion(text: string, el: HTMLElement) {
        el.createSpan({ text });
    }
    selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent): void {
        if (!this.context) return;

        const line = this.context.editor
            .getLine(this.context.end.line)
            .slice(this.context.end.ch);
        const [_, exists] = line.match(/^(\] ?)/) ?? [];

        this.context.editor.replaceRange(
            `${value}] `,
            this.context.start,
            {
                ...this.context.end,
                ch:
                    this.context.start.ch +
                    this.context.query.length +
                    (exists?.length ?? 0)
            },
            "admonitions"
        );

        this.context.editor.setCursor(
            this.context.start.line,
            this.context.start.ch + value.length + 2
        );

        this.close();
    }
    onTrigger(
        cursor: EditorPosition,
        editor: Editor,
        file: TFile
    ): EditorSuggestTriggerInfo {
        const line = editor.getLine(cursor.line);
        //not inside the bracket
        if (/> \[!\w+\]/.test(line.slice(0, cursor.ch))) return null;
        if (!/> \[!\w*/.test(line)) return null;

        const match = line.match(/> \[!(\w*)\]?/);
        if (!match) return null;

        const [_, query] = match;

        if (
            !query ||
            Object.keys(this.plugin.admonitions).find(
                (p) => p.toLowerCase() == query.toLowerCase()
            )
        ) {
            return null;
        }
        const matchData = {
            end: cursor,
            start: {
                ch: match.index + 4,
                line: cursor.line
            },
            query
        };
        return matchData;
    }
}
export class AdmonitionSuggest extends EditorSuggest<string> {
    constructor(public plugin: ObsidianAdmonition) {
        super(plugin.app);
    }
    getSuggestions(ctx: EditorSuggestContext) {
        return Object.keys(this.plugin.admonitions).filter((p) =>
            p.toLowerCase().contains(ctx.query.toLowerCase())
        );
    }
    renderSuggestion(text: string, el: HTMLElement) {
        el.createSpan({ text });
    }
    selectSuggestion(value: string, evt: MouseEvent | KeyboardEvent): void {
        if (!this.context) return;

        this.context.editor.replaceRange(
            `${value}`,
            this.context.start,
            this.context.end,
            "admonitions"
        );

        this.close();
    }
    onTrigger(
        cursor: EditorPosition,
        editor: Editor,
        file: TFile
    ): EditorSuggestTriggerInfo {
        const line = editor.getLine(cursor.line);
        if (!/```ad-\w+/.test(line)) return null;
        const match = line.match(/```ad-(\w+)/);
        if (!match) return null;
        const [_, query] = match;

        if (
            !query ||
            Object.keys(this.plugin.admonitions).find(
                (p) => p.toLowerCase() == query.toLowerCase()
            )
        ) {
            return null;
        }

        const matchData = {
            end: cursor,
            start: {
                ch: match.index + 6,
                line: cursor.line
            },
            query
        };
        return matchData;
    }
}
