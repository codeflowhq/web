export const normalizeRuntimeError = (error) => {
  const raw = error instanceof Error ? error.message : String(error);
  const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);
  const useful = lines.find((line) => !line.startsWith("Traceback") && !line.startsWith('File "'));
  if (useful) {
    return useful.replace(/^Status:\s*/, "");
  }
  return raw.replace(/^Status:\s*/, "");
};
