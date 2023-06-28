import "reflect-metadata";

import { inject, injectable } from "inversify";

import { Knex } from "knex";
import TYPES from "./inversify";
import env from "@app/config/env";
import unset from "lodash/unset";

export interface Model {
  id: number;
}

const defaultToJSON = function () {
  return { ...this };
};

@injectable()
export class Repository<T> {
  @inject(TYPES.Knex) protected knex: Knex;

  /**
   * creates a knex query object for a specified table
   * @param table table name
   * @param excluded fields which should be excluded from the query result to be returned
   * @returns
   */
  protected setup<T>(table: string, ...excluded: string[]) {
    return () => this.knex<T>(table).queryContext({ excluded }).withSchema(env.postgres_schema);
  }
}

/**
 * Knex postProcessResponse hook for protecting properties from being exposed over
 * the web.
 * @param result result of query
 * @param context context provided when building the query
 * @returns the modified result
 */
export function excludeProperties(result?: Model | Model[], context?: any) {
  if (result && context?.excluded && context.excluded.length > 0) {
    const rows = Array.isArray(result) ? result : [result];

    rows.forEach(result => {
      const superToJSON = result["toJSON"] || defaultToJSON.bind(result);
      result["toJSON"] = function () {
        const data = superToJSON();

        context.excluded.forEach((path: string) => {
          unset(data, path);
        });

        return data;
      };
    });
  }

  return result;
}
