/**
 * Effect 4 only exposes its types through package.json `exports`, which the
 * default Monaco setting (`moduleResolution: NodeJs`) ignores: every Effect
 * import was typed `any` in the live editors. Use bundler resolution instead,
 * and treat each snippet as a module so top-level `await` type-checks.
 */

type CompilerOptions = Record<string, unknown>;

interface MonacoLike {
    readonly typescript: {
        readonly typescriptDefaults: {
            getCompilerOptions(): CompilerOptions;
            setCompilerOptions(options: CompilerOptions): void;
        };
    };
}

// Values of TypeScript's ModuleResolutionKind.Bundler and ModuleDetectionKind.Force.
const MODULE_RESOLUTION_BUNDLER = 100;
const MODULE_DETECTION_FORCE = 3;

export default (monaco: MonacoLike) => {
    const defaults = monaco.typescript.typescriptDefaults;
    defaults.setCompilerOptions({
        ...defaults.getCompilerOptions(),
        moduleResolution: MODULE_RESOLUTION_BUNDLER,
        moduleDetection: MODULE_DETECTION_FORCE,
    });
};
