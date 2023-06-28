import { NextFunction, Request, Response } from "express";
import jwt, { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";

import { ApplicationError } from "@app/internal/errors";
import { StatusCodes } from "http-status-codes";
import admin from "../../config/firebase";
import env from "@app/config/env";

export async function loadSession(req: Request, _res: Response, next: NextFunction) {
  const authSession = req.headers.authorization;

  if (!authSession) {
    return next(new ApplicationError(StatusCodes.UNAUTHORIZED, "We could not authenticate your request"));
  }

  const [scheme, token] = authSession.split(/\s+/);

  if (scheme !== "Bearer") {
    return next(new ApplicationError(StatusCodes.UNAUTHORIZED, `${scheme} is not supported`));
  }

  try {
    const decoded = await jwt.verify(token, env.app_secret);
    req.session = decoded;

    next();
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return next(new ApplicationError(StatusCodes.UNAUTHORIZED, "Your authentication has expired", err));
    } else if (err instanceof JsonWebTokenError) {
      return next(new ApplicationError(StatusCodes.UNAUTHORIZED, "We could not verify your authentication", err));
    }

    return next(err);
  }
}

export async function verifyToken(req: Request, _res: Response, next: NextFunction) {
  const authSession = req.headers.authorization;

  if (!authSession) {
    return next(new ApplicationError(StatusCodes.UNAUTHORIZED, "We could not authenticate your request"));
  }

  try {
    const decoded = await admin.auth().verifyIdToken(authSession);
    console.log(decoded);
    req["user"] = decoded;
    return next();
  } catch (err) {
    return next(err);
  }
}

export async function checkAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    const decoded = req["user"];
    if (decoded.admin) return next();
    return next(new ApplicationError(StatusCodes.UNAUTHORIZED, "Unauthorized access"));
  } catch (err) {
    return next(err);
  }
}
