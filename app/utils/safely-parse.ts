export const safelyParseInt = (input: string) => {
  try {
    const parsed = parseInt(input, 10);
    return isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
};

export const safelyParseData = <T>(input: T): T =>
  JSON.parse(
    JSON.stringify(input, (key, value) => {
      if (typeof value === "bigint") {
        return Number(value);
      }

      if (key === "date") {
        return value.split("T")[0];
      }

      return value;
    })
  );
