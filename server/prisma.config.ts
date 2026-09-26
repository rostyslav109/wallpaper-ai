import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // `prisma generate` (під час збірки) база не потрібна, тому допускаємо порожнє значення.
    // Для міграцій і роботи сервера DATABASE_URL має бути заданий.
    url: process.env.DATABASE_URL ?? "",
  },
});
