import { afterEach, describe, expect, it, vi } from "vitest";
import { formatSqliteUtcDateTime, isSqliteUtcDateTime } from "../src/utils/date.ts";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("formatSqliteUtcDateTime", () => {
  it("convertit l'heure UTC en heure locale belge, en hiver et en été", () => {
    vi.stubEnv("TZ", "Europe/Brussels");
    expect(formatSqliteUtcDateTime("2026-11-27 13:45:12")).toBe("27/11/2026 14:45");
    expect(formatSqliteUtcDateTime("2026-07-01 13:45:12")).toBe("01/07/2026 15:45");
    expect(formatSqliteUtcDateTime("2026-12-31 23:30:00")).toBe("01/01/2027 00:30");
  });

  it("utilise le fuseau local du navigateur plutôt qu'un fuseau belge imposé", () => {
    vi.stubEnv("TZ", "America/New_York");
    expect(formatSqliteUtcDateTime("2026-11-27 13:45:12")).toBe("27/11/2026 08:45");
  });

  it.each(["invalide", "2026-02-30 10:00:00", "2026-11-27T13:45:12Z", "2026-11-27 25:00:00"])(
    "rejette la date invalide %s",
    (value) => {
      expect(isSqliteUtcDateTime(value)).toBe(false);
      expect(() => formatSqliteUtcDateTime(value)).toThrow(RangeError);
    },
  );
});
