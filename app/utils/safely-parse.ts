export const safelyParseInt = (input: string) => {
  try {
    const parsed = parseInt(input, 10);
    return isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}
