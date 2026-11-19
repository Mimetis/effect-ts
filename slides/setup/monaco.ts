/**
 * Effect 4 only exposes its types through package.json `exports`, which the
 * default Monaco setting (`moduleResolution: NodeJs`) ignores: every Effect
 * import was typed `any` in the live editors. Use bundler resolution instead,
 * and treat each snippet as a module so top-level `await` type-checks.
 *
 * Snippets can also wrap boilerplate between `// #region …` and `// #endregion`:
 * the block is folded when the editor opens (one line instead of ten, so the
 * slide can be zoomed in), and the audience can unfold it with the ▸ chevron.
 */

type CompilerOptions = Record<string, unknown>;

interface TextModelLike {
    getLineCount(): number;
    getLineContent(lineNumber: number): string;
}

interface FoldingRangeLike {
    readonly start: number;
    readonly end: number;
    readonly kind: unknown;
}

interface EditorLike {
    getModel(): TextModelLike | null;
    getAction(id: string): { run(): Promise<void> } | null;
    onDidChangeModel(listener: () => void): unknown;
}

interface MonacoLike {
    readonly typescript: {
        readonly typescriptDefaults: {
            getCompilerOptions(): CompilerOptions;
            setCompilerOptions(options: CompilerOptions): void;
        };
    };
    readonly languages: {
        readonly FoldingRangeKind: { readonly Region: unknown };
        registerFoldingRangeProvider(
            languageId: string,
            provider: { provideFoldingRanges(model: TextModelLike): Array<FoldingRangeLike> },
        ): unknown;
    };
    readonly editor: {
        onDidCreateEditor(listener: (editor: EditorLike) => void): unknown;
    };
}

// Values of TypeScript's ModuleResolutionKind.Bundler and ModuleDetectionKind.Force.
const MODULE_RESOLUTION_BUNDLER = 100;
const MODULE_DETECTION_FORCE = 3;

const REGION_START = /^\s*\/\/\s*#region\b/;
const REGION_END = /^\s*\/\/\s*#endregion\b/;

const findRegions = (model: TextModelLike, kind: unknown): Array<FoldingRangeLike> => {
    const regions: Array<FoldingRangeLike> = [];
    const starts: Array<number> = [];
    for (let line = 1; line <= model.getLineCount(); line++) {
        const text = model.getLineContent(line);
        if (REGION_START.test(text)) {
            starts.push(line);
        } else if (REGION_END.test(text)) {
            const start = starts.pop();
            if (start !== undefined) {
                regions.push({ start, end: line, kind });
            }
        }
    }
    return regions;
};

const foldRegions = (editor: EditorLike, kind: unknown): void => {
    const model = editor.getModel();
    if (model !== null && findRegions(model, kind).length > 0) {
        void editor.getAction("editor.foldAllMarkerRegions")?.run();
    }
};

export default (monaco: MonacoLike) => {
    const defaults = monaco.typescript.typescriptDefaults;
    defaults.setCompilerOptions({
        ...defaults.getCompilerOptions(),
        moduleResolution: MODULE_RESOLUTION_BUNDLER,
        moduleDetection: MODULE_DETECTION_FORCE,
    });

    const regionKind = monaco.languages.FoldingRangeKind.Region;
    for (const language of ["typescript", "javascript"]) {
        monaco.languages.registerFoldingRangeProvider(language, {
            provideFoldingRanges: (model) => findRegions(model, regionKind),
        });
    }

    monaco.editor.onDidCreateEditor((editor) => {
        // The model is attached right after the editor is created.
        setTimeout(() => foldRegions(editor, regionKind));
        editor.onDidChangeModel(() => foldRegions(editor, regionKind));
    });

    return { editorOptions: { showFoldingControls: "always" } };
};
