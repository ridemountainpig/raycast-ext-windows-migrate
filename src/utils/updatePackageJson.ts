import fs from "fs";
import path from "path";
import type { PackageJsonUpdateResult } from "../types/index.js";

export function updatePackageJsonPlatforms(
    projectPath: string,
): PackageJsonUpdateResult {
    const packageJsonPath = path.join(projectPath, "package.json");

    try {
        if (!fs.existsSync(packageJsonPath)) {
            return {
                success: false,
                message: "package.json not found",
            };
        }

        const packageJson = JSON.parse(
            fs.readFileSync(packageJsonPath, "utf-8"),
        ) as Record<string, unknown>;

        // Check platforms field
        if (!packageJson.platforms) {
            // If it doesn't exist, add macOS and Windows
            packageJson.platforms = ["macOS", "Windows"];
            fs.writeFileSync(
                packageJsonPath,
                JSON.stringify(packageJson, null, 2) + "\n",
                "utf-8",
            );
            return {
                success: true,
                message: "Platforms field updated successfully",
                action: 'Added platforms: ["macOS", "Windows"]',
            };
        } else if (
            Array.isArray(packageJson.platforms) &&
            packageJson.platforms.every(
                (p): p is string => typeof p === "string",
            )
        ) {
            // Check if Windows is included
            if (!packageJson.platforms.includes("Windows")) {
                packageJson.platforms.push("Windows");
                fs.writeFileSync(
                    packageJsonPath,
                    JSON.stringify(packageJson, null, 2) + "\n",
                    "utf-8",
                );
                return {
                    success: true,
                    message: "Platforms field updated successfully",
                    action: "Added Windows to platforms",
                };
            } else {
                return {
                    success: true,
                    message:
                        "Platforms field already contains Windows, skipping",
                    action: "No update needed",
                };
            }
        }

        return {
            success: false,
            message: "Platforms field format is incorrect",
        };
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : String(error);
        return {
            success: false,
            message: `Failed to update package.json: ${errorMessage}`,
        };
    }
}
