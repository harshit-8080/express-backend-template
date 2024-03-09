import { createLogger, transports, format } from "winston";
import * as path from "path";
import type * as Transport from "winston-transport";
import { configure } from "safe-stable-stringify";
import config from "config";

const stringify = configure({
    deterministic: false,
});
class Logger {
    private readonly logger;
    constructor() {
        this.logger = createLogger({
            level: config.get("server.env") === "dev" ? "silly" : "info",
            exitOnError: false,
            format: format.combine(
                format.timestamp(),
                format.printf(
                    ({
                        level,
                        message,
                        timestamp,
                        url,
                        stack,
                        context,
                        payload,
                        errorId,
                    }) => {
                        const formattedStack: string =
                            typeof stack === "string"
                                ? stack.split("\n")
                                : stack;
                        return stringify(
                            {
                                timestamp,
                                level,
                                errorId,
                                message,
                                url,
                                stack: formattedStack,
                                context,
                                payload,
                            },
                            null,
                            2,
                        );
                    },
                ),
            ),
            defaultMeta: { service: "swiggy-catalog-service" },
            transports: this.configureTransports(),
        });
    }

    private configureTransports(): Transport[] {
        const isLocal = config.get("server.env") === "dev";

        const transportsArray: Transport[] = [
            new transports.Console({
                handleExceptions: true,
                handleRejections: true,
            }),
        ];

        if (isLocal) {
            // For local env, write logs to local files
            transportsArray.push(
                new transports.File({
                    filename: path.join("logs", "error.log"),
                    level: "error",
                    handleExceptions: true,
                    handleRejections: true,
                }),
                new transports.File({
                    filename: path.join("logs", "info.log"),
                    level: "info",
                }),
                new transports.File({
                    filename: path.join("logs", "warn.log"),
                    level: "warn",
                }),
                new transports.File({
                    filename: path.join("logs", "debug.log"),
                    level: "debug",
                }),
            );
        } else {
            // Configure for production
        }
        return transportsArray;
    }

    info(message: string, url?: string, payload?: Record<string, string>) {
        this.logger.info(message, { url, payload });
    }

    error(
        message: string,
        error: Error,
        { url = null, payload = null, errorId = null } = {},
    ) {
        this.logger.error(message, {
            error,
            url,
            stack: error.stack,
            payload,
            errorId,
        });
    }

    warn(message: string, url?: string, payload?: Record<string, string>) {
        this.logger.warn(message, { url, payload });
    }

    debug(
        message: string,
        context?: Record<string, string>,
        url?: string,
        payload?: Record<string, string>,
    ) {
        this.logger.debug(message, { url, context, payload });
    }
}

export default new Logger();
