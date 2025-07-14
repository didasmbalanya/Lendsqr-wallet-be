import { Knex } from "knex";

export const config: { [key: string]: Knex.Config } = {
  development: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST || "127.0.0.1",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "lendsqr_wallet_dev",
      charset: "utf8mb4",
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "src/migrations",
    },
  },
  test: {
    client: "mysql2",
    connection: {
      host: process.env.DB_HOST || "127.0.0.1",
      port: parseInt(process.env.DB_PORT || "3306"),
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "lendsqr_wallet_dev",
      charset: "utf8mb4",
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "src/migrations",
    },
  },

  production: {
    client: "mysql2",
    connection: process.env.DATABASE_URL || "", // Heroku provides DATABASE_URL
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: "knex_migrations",
      directory: "src/migrations",
    },
    debug: false,
  },
};

export default config;

