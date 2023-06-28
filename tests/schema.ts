import "module-alias/register";

import { Logger } from "../src/internal/logger";
import Postgrator from "postgrator";
import { createPostgres } from "../src/config/postgres";
import env from "../src/config/env";
import path from "path";

const logger = new Logger({ name: "test-setup", serializers: {} });

async function migrate() {
  const pg = await createPostgres(logger);

  const postgrator = new Postgrator({
    migrationPattern: path.join(process.cwd(), "db/test/*"),
    driver: "pg",
    database: env.postgres_db,
    schemaTable: "schema_migrations",
    currentSchema: "test",
    execQuery: query => pg.raw(query)
  });

  await pg.raw(`create schema if not exists test authorization ${env.postgres_user};`);

  await postgrator.migrate();
}

migrate().then(
  () => {
    logger.log("created test db");
    process.exit(0);
  },
  err => {
    logger.error(err);
    process.exit(1);
  }
);
