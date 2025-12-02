import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import type { EslintUpdateResult, ExecError } from "../types/index.js";
import {
    OLD_ESLINT_CONFIG_FILES,
    NEW_ESLINT_CONFIG_CONTENT,
} from "../constants/index.js";

export function updateEslintConfig(projectPath: string): EslintUpdateResult {
    const actions: string[] = [];
    const eslintConfigMjs = path.join(projectPath, "eslint.config.mjs");
    const packageJsonPath = path.join(projectPath, "package.json");

    try {
        // Remove old ESLint config files
        for (const oldConfig of OLD_ESLINT_CONFIG_FILES) {
            const oldConfigPath = path.join(projectPath, oldConfig);
            if (fs.existsSync(oldConfigPath)) {
                fs.unlinkSync(oldConfigPath);
                actions.push(`Removed old config file: ${oldConfig}`);
            }
        }

        // Update or create eslint.config.mjs
        fs.writeFileSync(eslintConfigMjs, NEW_ESLINT_CONFIG_CONTENT, "utf-8");
        actions.push("Updated eslint.config.mjs content");

        // Check and install @raycast/eslint-config
        const packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, "utf-8"),
        );
        const devDeps = packageJson.devDependencies || {};

        if (!devDeps["@raycast/eslint-config"]) {
            try {
                execSync("npm install --save-dev @raycast/eslint-config", {
                    cwd: projectPath,
                    stdio: "pipe",
                });
                actions.push("Installed @raycast/eslint-config");
            } catch (error) {
                const execError = error as ExecError;
                const errorMessage = execError.message || String(error);
                return {
                    success: false,
                    message: `Failed to install @raycast/eslint-config: ${errorMessage}`,
                    actions,
                };
            }
        } else {
            actions.push("@raycast/eslint-config already installed, skipping");
        }

        return {
            success: true,
            message: "ESLint configuration updated successfully",
            actions,
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        return {
            success: false,
            message: `Failed to update ESLint configuration: ${errorMessage}`,
            actions,
        };
    }
}
