import Bunyan, { FATAL, INFO } from "bunyan";
import { Request, Response } from "express";

export interface LogError {
  err: Error;
  [key: string]: any;
}

type Serializer = (input: any) => any;
type Serializers = {
  [key: string]: Serializer;
};

export interface LoggerConfig {
  name: string;
  serializers: Serializers;
  verbose?: boolean;
  buffer?: NodeJS.WritableStream;
}

export class Logger {
  private logger: Bunyan;

  constructor(config: LoggerConfig) {
    this.logger = new Bunyan({
      name: config.name,
      serializers: config.serializers,
      level: config.verbose === true ? INFO : FATAL,
      streams: [
        {
          stream: config.buffer || process.stdout,
          level: config.verbose === false ? FATAL : INFO,
          type: !!config.buffer ? "raw" : "stream"
        }
      ]
    });
  }

  /**
   * Logs an incoming HTTP request
   * @param req Express request
   */
  request(req: Request) {
    this.logger.info({ req });
  }

  /**
   * Logs an outgoing HTTP response
   * @param req Express request
   * @param res Express responser
   */
  response(req: Request, res: Response) {
    this.logger.info({ res, req });
  }

  /**
   * Logs an error that occured during the handling of an HTTP request
   * @param err Error object
   * @param req express request
   * @param res express responser
   */
  httpError(err: Error, req: Request, res: Response) {
    this.logger.error({ err, res, req });
  }

  /**
   * logs a simple entry
   * @param entry entry to be logged
   */
  log(entry: string) {
    this.logger.info(entry);
  }

  /**
   * Log internal application error
   * @param err actual error being logged
   * @param message custom error message
   */
  error(err: Error, message?: string) {
    this.logger.error(err, message);
  }
}
