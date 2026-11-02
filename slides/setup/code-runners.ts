import { Console, Effect } from "effect";

/**
 * Slidev hands every `{monaco-run}` snippet its own `console` (a function
 * parameter) whose output is shown below the editor. This setup:
 *
 * 1. formats values the way an Effect developer expects: tagged errors as
 *    `UserNotFound {"id":1}` and Effect data types (Exit, Result, Option,
 *    Redacted…) through their compact `toString()`;
 * 2. routes Effect logs (`Effect.log`, `Console.log`), which go through
 *    Effect's default console (`globalThis.console`), to the snippet that ran
 *    last.
 */

type CodeRunner = (code: string, context: unknown) => unknown;
type RunnerConsole = typeof globalThis.console;

const RUN_HOOK = "__effectSlidevRun";
const LOG_METHODS = new Set<PropertyKey>(["log", "info", "warn", "error", "debug"]);

const isPrimitive = (value: unknown): boolean =>
    ["string", "number", "boolean", "bigint"].includes(typeof value);

const isTaggedError = (value: unknown): value is Error & { readonly _tag: string } =>
    value instanceof Error && typeof Reflect.get(value, "_tag") === "string";

const hasCustomToString = (value: object): boolean =>
    !(value instanceof Error) &&
    !(value instanceof Date) &&
    !Array.isArray(value) &&
    value.toString !== Object.prototype.toString;

const needsFormatting = (value: unknown): boolean =>
    isTaggedError(value) ||
    (Array.isArray(value) && value.some(needsFormatting)) ||
    (typeof value === "object" && value !== null && hasCustomToString(value));

const formatValue = (value: unknown): unknown => {
    if (isTaggedError(value)) {
        const fields = Object.entries(value).filter(([key]) => key !== "_tag");
        return fields.length > 0
            ? `${value._tag} ${JSON.stringify(Object.fromEntries(fields))}`
            : value._tag;
    }
    if (Array.isArray(value) && value.some(needsFormatting)) {
        const items = value.map((item) =>
            needsFormatting(item) ? String(formatValue(item)) : JSON.stringify(item),
        );
        return `[${items.join(", ")}]`;
    }
    if (typeof value === "object" && value !== null && hasCustomToString(value)) {
        return (value as { toString(): string }).toString();
    }
    return value;
};

// Join consecutive primitives like a real console does, e.g. the logger's
// "[12:00:00.000] INFO (#1):" prefix and its message.
const joinPrimitives = (args: ReadonlyArray<unknown>): Array<unknown> => {
    const joined: Array<unknown> = [];
    for (const arg of args) {
        const last = joined.at(-1);
        if (joined.length > 0 && isPrimitive(arg) && isPrimitive(last)) {
            joined[joined.length - 1] = `${String(last)} ${String(arg)}`;
        } else {
            joined.push(arg);
        }
    }
    return joined;
};

const proxyConsole = (
    getTarget: () => RunnerConsole,
    prepare: (args: ReadonlyArray<unknown>) => ReadonlyArray<unknown>,
): RunnerConsole =>
    new Proxy(globalThis.console, {
        get(_console, key) {
            const target = getTarget();
            const value: unknown = Reflect.get(target, key);
            if (typeof value !== "function") {
                return value;
            }
            const prepareArgs = LOG_METHODS.has(key) ? prepare : (args: ReadonlyArray<unknown>) => args;
            return (...args: Array<unknown>): unknown =>
                Reflect.apply(value, target, prepareArgs(args)) as unknown;
        },
    });

const realConsole = globalThis.console;
let lastRunConsole: RunnerConsole | undefined;

// Called at the top of every snippet with Slidev's console for that run.
Reflect.set(globalThis, RUN_HOOK, (runConsole: RunnerConsole): RunnerConsole => {
    lastRunConsole = proxyConsole(
        () => runConsole,
        (args) => joinPrimitives(args.map(formatValue)),
    );
    return lastRunConsole;
});

// Effect resolves its default console lazily from `globalThis.console`, then
// caches it: resolve it once while the global points at our forwarding proxy.
globalThis.console = proxyConsole(() => lastRunConsole ?? realConsole, (args) => args);
try {
    Effect.runSync(Console.Console);
} finally {
    globalThis.console = realConsole;
}

// Slidev rewrites `import … from "x"` into `await import("x")`, then swaps
// `import(` for its own loader with a single-line regex. Without a semicolon,
// TypeScript copies a comment that follows the import inside the call, the
// regex misses it and the browser fails to resolve "x": end imports with `;`.
const IMPORT_END = /^((?:import\b[^\n]*?|\})\s*from\s*["'][^"'\n]+["'])[ \t]*$/gm;
const terminateImports = (code: string): string => code.replace(IMPORT_END, "$1;");

const withRunHook = (runner: CodeRunner): CodeRunner =>
    (code, context) =>
        runner(`console = globalThis.${RUN_HOOK}(console);\n${terminateImports(code)}`, context);

export default (runners: Record<string, CodeRunner>) =>
    Object.fromEntries(
        Object.entries(runners)
            .filter(([lang]) => ["ts", "typescript", "js", "javascript"].includes(lang))
            .map(([lang, runner]) => [lang, withRunHook(runner)]),
    );
