#!/usr/bin/env node
import { spawnSync } from "node:child_process";

async function readStdin() {
    const chunks = [];
    for await (const chunk of process.stdin) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString("utf8");
}

function printHookMessage(message) {
    process.stdout.write(JSON.stringify({ systemMessage: message }));
}

function shouldRunLint(payload) {
    const serialized = JSON.stringify(payload || {}).toLowerCase();
    const editToolPattern = /(apply_patch|create_file|str_replace|insert|vscode_renamesymbol|mcp_pylance_mcp_s_pylanceinvokerefactoring|edit_notebook_file)/;
    const codeFilePattern = /\.(ts|tsx|js|jsx|mjs|cjs)\b/;

    return editToolPattern.test(serialized) && codeFilePattern.test(serialized);
}

function runLint() {
    const isWindows = process.platform === "win32";
    return spawnSync("pnpm", ["-s", "lint"], {
        cwd: process.cwd(),
        encoding: "utf8",
        shell: isWindows
    });
}

const stdinRaw = await readStdin();
let payload = {};

try {
    payload = stdinRaw.trim() ? JSON.parse(stdinRaw) : {};
} catch {
    printHookMessage("[post-edit-lint] Ignored: hook input was not valid JSON.");
    process.exit(0);
}

if (!shouldRunLint(payload)) {
    process.exit(0);
}

const lintResult = runLint();

if (lintResult.error) {
    printHookMessage(`[post-edit-lint] Could not run lint: ${lintResult.error.message}`);
    process.exit(0);
}

if (lintResult.status !== 0) {
    const combined = `${lintResult.stdout || ""}\n${lintResult.stderr || ""}`.trim();
    const details = combined.split(/\r?\n/).slice(0, 24).join("\n");
    printHookMessage(`[post-edit-lint] Lint failed after code edit.\n${details}`);
    process.exit(0);
}

printHookMessage("[post-edit-lint] Lint passed after code edit.");
process.exit(0);
