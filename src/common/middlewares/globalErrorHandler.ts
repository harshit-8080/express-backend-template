import { HttpError } from "http-errors";
import { v4 as uuidv4 } from "uuid";
import { NextFunction, Request, Response } from "express";
import logger from "../../config/logger";
import config from "config";

export const globalErrorHandler = (
    error: HttpError,
    req: Request,
    res: Response,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    next: NextFunction,
) => {
    const errorId = uuidv4();
    logger.error(error.message, error, {
        url: req.url,
        payload: req.body,
        errorId: errorId,
    });

    const statusCode = error.status || 500;
    const isProduction = config.get("server.env") === "production";
    const message = isProduction
        ? `An unexpected error occurred.`
        : error.message;

    const errorStack =
        typeof error.stack === "string" ? error.stack.split("\n") : error.stack;

    return res.status(statusCode).json({
        errors: [
            {
                ref: errorId,
                success: false,
                error: true,
                type: error.name,
                message: message,
                path: req.path,
                location: "server",
                stack: isProduction ? null : errorStack,
            },
        ],
    });
};
