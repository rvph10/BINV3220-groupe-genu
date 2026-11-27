import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { IN_MEMORY, openDatabase } from "../../src/db/database.ts";
import { runMigrations } from "../../src/db/migrate.ts";
import { seedDatabase, SEEDED_TABLES } from "../../src/db/seed/seed.ts";
import { OFFER, STUDENT } from "../../src/db/seed/seedIds.ts";

const listTables = (db: ReturnType<typeof openDatabase>): string[] =>
  (
    db
      .prepare("SELECT name FROM sqlite_schema WHERE type = 'table' ORDER BY name")
      .all() as { name: string }[]
  ).map((row) => row.name);

describe("runMigrations", () => {
  it("crée toutes les tables sur une base vierge", () => {
    const db = openDatabase(IN_MEMORY);

    expect(runMigrations(db)).toEqual(["001_initial.sql", "002_applications_non_withdrawn.sql"]);
    expect(listTables(db)).toEqual([...SEEDED_TABLES, "schema_migrations"].sort());
  });

  it("n'applique pas deux fois la même migration", () => {
    const db = openDatabase(IN_MEMORY);
    runMigrations(db);

    expect(runMigrations(db)).toEqual([]);
  });

  it("active les clés étrangères", () => {
    const db = openDatabase(IN_MEMORY);

    expect(db.pragma("foreign_keys", { simple: true })).toBe(1);
  });

  it("met à niveau une base existante sans perdre ses candidatures", () => {
    const db = openDatabase(IN_MEMORY);
    db.exec(readFileSync(new URL("../../src/db/migrations/001_initial.sql", import.meta.url), "utf8"));
    db.exec("CREATE TABLE schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now'))) STRICT");
    db.prepare("INSERT INTO schema_migrations (name) VALUES (?)").run("001_initial.sql");
    seedDatabase(db);
    const count = db.prepare("SELECT count(*) AS count FROM applications").get();

    expect(runMigrations(db)).toEqual(["002_applications_non_withdrawn.sql"]);
    expect(db.prepare("SELECT count(*) AS count FROM applications").get()).toEqual(count);
  });

  it("refuse une migration avec doublons existants sans marquer la migration comme appliquée", () => {
    const db = openDatabase(IN_MEMORY);
    db.exec(readFileSync(new URL("../../src/db/migrations/001_initial.sql", import.meta.url), "utf8"));
    db.exec("CREATE TABLE schema_migrations (name TEXT PRIMARY KEY, applied_at TEXT NOT NULL DEFAULT (datetime('now'))) STRICT");
    db.prepare("INSERT INTO schema_migrations (name) VALUES (?)").run("001_initial.sql");
    seedDatabase(db);
    db.prepare("INSERT INTO applications (student_id, offer_id, status) VALUES (?, ?, 'REJECTED')")
      .run(STUDENT.LUCAS_DUPONT, OFFER.FLEET_APP);

    expect(() => runMigrations(db)).toThrow(/UNIQUE/);
    expect(db.prepare("SELECT name FROM schema_migrations WHERE name = ?")
      .get("002_applications_non_withdrawn.sql")).toBeUndefined();
    expect(db.prepare("SELECT count(*) AS count FROM applications WHERE student_id = ? AND offer_id = ?")
      .get(STUDENT.LUCAS_DUPONT, OFFER.FLEET_APP)).toEqual({ count: 2 });
  });
});
