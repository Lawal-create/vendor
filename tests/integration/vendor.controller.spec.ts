// import "reflect-metadata";
// import "../../src/http/controllers";

// import { ApiResponse, SmsRepository } from "../../src/sms";
// import { createAccount, createPhoneNumber } from "../helpers/sms";
// import { generateToken, getError, getSuccess, repeat } from "../helper";

// import { App } from "../../src/app";
// import { Application } from "express";
// import { Container } from "inversify";
// import { Knex } from "knex";
// import LIB_TYPES from "../../src/internal/inversify";
// import { Logger } from "../../src/internal/logger";
// import { Redis } from "ioredis";
// import { StatusCodes } from "http-status-codes";
// import TYPES from "../../src/config/inversify.types";
// import { createPostgres } from "../../src/config/postgres";
// import { createRedis } from "../../src/config/redis";
// import env from "../../src/config/env";
// import { expect } from "chai";
// import faker from "faker";
// import ms from "ms";
// import request from "supertest";

// const baseURL = "/api/v1";
// let pg: Knex;
// let container: Container;
// let redis: Redis;
// let app: Application;

// beforeAll(async () => {
//   container = new Container();

//   const logger = new Logger({ name: env.application_name, serializers: {} });
//   container.bind<Logger>(LIB_TYPES.Logger).toConstantValue(logger);

//   pg = await createPostgres(logger);
//   redis = await createRedis(logger);

//   container.bind<Redis>(LIB_TYPES.Redis).toConstantValue(redis);
//   container.bind<Knex>(LIB_TYPES.Knex).toConstantValue(pg);

//   container.bind<SmsRepository>(TYPES.SMS).to(SmsRepository);

//   app = new App(container, logger).server.build();
// });

// afterEach(async () => {
//   await pg("account").del();
//   await pg("phone_number").del();
//   await redis.flushdb();
// });

// describe("SmsController#inboundSms", () => {
//   it("should return a 404 error for a phone number not associated with this account", async () => {
//     await createAccount(pg);
//     await createPhoneNumber(pg);

//     const token = generateToken({ id: faker.datatype.number(100) });

//     await repeat(10, () => createAccount(pg));
//     await repeat(10, () => createPhoneNumber(pg));

//     const dto = {
//       from: faker.finance.amount(100000, 999999),
//       to: faker.finance.amount(100000, 999999),
//       text: faker.lorem.words(3)
//     };

//     const error = await getError(
//       StatusCodes.NOT_FOUND,
//       request(app).post(`${baseURL}/inbound/sms`).send(dto).set("Authorization", token)
//     );

//     expect(error).to.eq("to parameter not found");
//   });

//   it("should store the from-to pair in redis for a special text", async () => {
//     const { id: accountId } = await createAccount(pg);
//     const toNumber = faker.finance.amount(100000, 999999);
//     const phoneNumber = await createPhoneNumber(pg, { account_id: accountId, number: toNumber });

//     const token = generateToken({ id: accountId });

//     await repeat(10, () => createAccount(pg));
//     await repeat(10, () => createPhoneNumber(pg));

//     const dto = {
//       from: faker.finance.amount(100000, 999999),
//       to: toNumber,
//       text: "STOP\r\n"
//     };

//     await getSuccess<ApiResponse>(request(app).post(`${baseURL}/inbound/sms`).send(dto).set("Authorization", token));

//     const key = `${accountId}_${phoneNumber.number}`;
//     const fromToPair = await redis.get(key);

//     expect(fromToPair).to.eq(JSON.stringify({ from: dto.from, to: dto.to, text: "STOP" }));
//   });

//   it("should successfully validate an inbound sms for a phone number associated with the correct account", async () => {
//     const { id: accountId } = await createAccount(pg);
//     const toNumber = faker.finance.amount(100000, 999999);
//     await createPhoneNumber(pg, { account_id: accountId, number: toNumber });

//     const token = generateToken({ id: accountId });

//     await repeat(10, () => createAccount(pg));
//     await repeat(10, () => createPhoneNumber(pg));

//     const dto = {
//       from: faker.finance.amount(100000, 999999),
//       to: toNumber,
//       text: "STOP\r\n"
//     };

//     const response = await getSuccess<ApiResponse>(
//       request(app).post(`${baseURL}/inbound/sms`).send(dto).set("Authorization", token)
//     );

//     expect(response.message).to.eq("inbound sms okay");
//   });
// });

// describe("SmsController#outboundSms", () => {
//   it("should return a 404 error for a phone number not associated with this account", async () => {
//     await createAccount(pg);
//     await createPhoneNumber(pg);

//     const token = generateToken({ id: faker.datatype.number(100) });

//     await repeat(10, () => createAccount(pg));
//     await repeat(10, () => createPhoneNumber(pg));

//     const dto = {
//       from: faker.finance.amount(100000, 999999),
//       to: faker.finance.amount(100000, 999999),
//       text: faker.lorem.words(3)
//     };

//     const error = await getError(
//       StatusCodes.NOT_FOUND,
//       request(app).post(`${baseURL}/outbound/sms`).send(dto).set("Authorization", token)
//     );

//     expect(error).to.eq("from parameter not found");
//   });

//   it("should return a 403 error for a phone number with more than 50 requests within 24 hours", async () => {
//     await createAccount(pg);
//     await createPhoneNumber(pg);

//     const token = generateToken({ id: faker.datatype.number(100) });

//     await repeat(10, () => createAccount(pg));
//     await repeat(10, () => createPhoneNumber(pg));

//     const dto = {
//       from: faker.finance.amount(100000, 999999),
//       to: faker.finance.amount(100000, 999999),
//       text: faker.lorem.words(3)
//     };

//     const rateLimitingKey = `${dto.from}_count`;
//     await redis.set(rateLimitingKey, 51);

//     const error = await getError(
//       StatusCodes.FORBIDDEN,
//       request(app).post(`${baseURL}/outbound/sms`).send(dto).set("Authorization", token)
//     );

//     expect(error).to.eq(`limit reached for from ${dto.from}`);
//   });

//   it("should return a 403 error for a from-to pair blocked by a STOP request", async () => {
//     const { id: accountId } = await createAccount(pg);
//     const fromNumber = faker.finance.amount(100000, 999999);
//     const phoneNumber = await createPhoneNumber(pg, { account_id: accountId, number: fromNumber });

//     const token = generateToken({ id: accountId });

//     await repeat(10, () => createAccount(pg));
//     await repeat(10, () => createPhoneNumber(pg));

//     const dto = {
//       from: fromNumber,
//       to: faker.finance.amount(100000, 999999),
//       text: "STOP\r\n"
//     };

//     const fromToKey = `${accountId}_${phoneNumber.number}`;
//     await redis.set(fromToKey, JSON.stringify({ from: dto.from, to: dto.to, text: "STOP\r" }));

//     const error = await getError(
//       StatusCodes.FORBIDDEN,
//       request(app).post(`${baseURL}/outbound/sms`).send(dto).set("Authorization", token)
//     );

//     expect(error).to.eq(`sms from ${dto.from} to ${dto.to} blocked by STOP request`);
//   });

//   it("should successfully validate an outbound sms for a phone number associated with the correct account", async () => {
//     const { id: accountId } = await createAccount(pg);
//     const fromNumber = faker.finance.amount(100000, 999999);
//     await createPhoneNumber(pg, { account_id: accountId, number: fromNumber });

//     const token = generateToken({ id: accountId });

//     await repeat(10, () => createAccount(pg));
//     await repeat(10, () => createPhoneNumber(pg));

//     const dto = {
//       from: fromNumber,
//       to: faker.finance.amount(100000, 999999),
//       text: "STOP\r\n"
//     };

//     const response = await getSuccess<ApiResponse>(
//       request(app).post(`${baseURL}/outbound/sms`).send(dto).set("Authorization", token)
//     );

//     expect(response.message).to.eq("outbound sms okay");

//     const rateLimitingKey = `${dto.from}_count`;
//     const rateLimitingCount = await redis.get(rateLimitingKey);
//     const ttl = await redis.pttl(rateLimitingKey);

//     expect(Number(rateLimitingCount)).to.eq(1);
//     expect(ttl).to.be.lessThan(ms("24h"));
//   });
// });

describe("SmsController#inboundSms", () => {
  it("should return a 404 error for a phone number not associated with this account", async () => {});
});
