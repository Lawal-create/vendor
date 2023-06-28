import "module-alias/register";
import "reflect-metadata";
import "./http/controllers";

import { App } from "./app";
import { Container } from "inversify";
import { FormRepository } from "./forms";
import { Knex } from "knex";
import LIB_TYPES from "./internal/inversify";
import { Logger } from "./internal/logger";
import { ProductRepository } from "./products";
import { Redis } from "ioredis";
import TYPES from "./config/inversify.types";
import { VendorRepository } from "./vendors";
import admin from "./config/firebase";
import { createPostgres } from "./config/postgres";
import { createRedis } from "./config/redis";
import env from "./config/env";
import http from "http";
import { isHealthy } from "./config/health";

const start = async () => {
  const logger = new Logger({ name: env.application_name, serializers: {} });

  try {
    const container = new Container();

    // point to logger for the sake of other dependencies
    container.bind<Logger>(LIB_TYPES.Logger).toConstantValue(logger);

    // setup postgres
    const pg = await createPostgres(logger);
    container.bind<Knex>(LIB_TYPES.Knex).toConstantValue(pg);
    logger.log("successfully connected to postgres");

    // setup in-memory store
    const redis = await createRedis(logger);
    container.bind<Redis>(LIB_TYPES.Redis).toConstantValue(redis);
    logger.log("successfully connected to redis");

    container.bind<ProductRepository>(TYPES.ProductRepository).to(ProductRepository);
    container.bind<VendorRepository>(TYPES.VendorRepository).to(VendorRepository);
    container.bind<FormRepository>(TYPES.FormRepository).to(FormRepository);

    const app = new App(container, logger, () => isHealthy(pg, redis));
    const appServer = app.server.build();

    // start server
    const httpServer = http.createServer(appServer);
    httpServer.listen(env.port);
    httpServer.on("listening", () => logger.log(`${env.application_name} listening on ${env.port}`));

    process.on("SIGTERM", async () => {
      logger.log("exiting aplication...");

      // knex automatically closes connections

      httpServer.close(() => {
        process.exit(0);
      });
    });
  } catch (err) {
    logger.error(err);
  }
};

start();
