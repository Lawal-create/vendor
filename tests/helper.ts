import { StatusCodes } from "http-status-codes";
import { Test } from "supertest";
import env from "../src/config/env";
import jsonwebtoken from "jsonwebtoken";

/**
 * Run async job `fn` `n` times.
 * @param n number of times to run it
 * @param fn job to run
 */
export async function repeat(n: number, fn: (i?: number) => Promise<any>): Promise<any[]> {
  const jobs = Array.from({ length: n }).map((_x, i) => fn(i));
  return Promise.all(jobs);
}

export async function getSuccess<T>(t: Test) {
  const { body } = await t.expect(StatusCodes.OK);
  return body as T;
}

export async function getError(code: number, t: Test): Promise<any> {
  const { body } = await t.expect(code);
  return body.error;
}

export function generateToken(payload: any, expiresIn?: any) {
  return `Bearer ${jsonwebtoken.sign(payload, env.app_secret, expiresIn && { expiresIn })}`;
}
