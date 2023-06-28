import { NextFunction, Request, Response } from "express";

import { ApplicationError } from "@app/internal/errors";
import { Logger } from "@app/internal/logger";
import Status from "http-status-codes";

/**
 * Middleware for interpreting ApplicationError
 * @param logger octonet logger
 */
export function errors(logger: Logger) {
  return function (err: any, req: Request, res: Response, next: NextFunction) {
    // handling for asynchronous situations where error is thrown after response has been sent
    if (res.headersSent) return next(err);

    if (err instanceof ApplicationError) {
      res.status(err.code).json({ message: "", error: err.message, data: err.data });
    } else {
      res.status(Status.INTERNAL_SERVER_ERROR).json({
        message: "",
        error: "unknown failure"
      });
    }

    logger.httpError(err, req, res);
  };
}
