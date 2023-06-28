import { Request, Response } from "express";
import { inject, injectable } from "inversify";

import { Logger } from "./logger";
import Status from "http-status-codes";
import TYPES from "./inversify";

@injectable()
export class Controller<T> {
  @inject(TYPES.Logger) protected log: Logger;

  protected send(req: Request, res: Response, t: T, statusCode?: number) {
    res.status(statusCode || Status.OK).send(t);
    this.log.response(req, res);
  }
}
