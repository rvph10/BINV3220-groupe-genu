const SQLITE_DATE_TIME = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;

export const isSqliteUtcDateTime = (value: string): boolean => {
  if (!SQLITE_DATE_TIME.test(value)) return false;
  const date = new Date(`${value.replace(" ", "T")}Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 19).replace("T", " ") === value;
};

export const formatSqliteUtcDateTime = (value: string): string => {
  if (!isSqliteUtcDateTime(value)) throw new RangeError("Date SQLite UTC invalide");
  return new Intl.DateTimeFormat("fr-BE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(`${value.replace(" ", "T")}Z`));
};
