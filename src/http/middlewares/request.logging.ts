import { NextFunction, Request, Response } from "express";

import { Logger } from "@app/internal/logger";

/**
 * middleware for logging requests
 * @param logger bunyan logger
 * @param ignore user agents of requests to ignore
 */
export function logRequest(logger: Logger) {
  // ignore kubernetes requests by default

  return function (req: Request, _res: Response, next: NextFunction) {
    logger.request(req);
    next();
  };
}
