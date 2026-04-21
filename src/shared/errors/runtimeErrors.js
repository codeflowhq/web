const extractPythonLocation = (lines) => {
  const frames = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^File "([^"]+)", line (\d+), in (.+)$/);
    if (match) {
      const code = lines[index + 1]?.trim();
      frames.push({
        file: match[1],
        line: match[2],
        functionName: match[3],
        code,
      });
    }
  }
  return frames.findLast((frame) => !frame.file.includes("_pyodide") && !frame.file.includes("python312.zip"))
    ?? frames.at(-1)
    ?? null;
};

export const normalizeRuntimeError = (error) => {
  const raw = error instanceof Error ? error.message : String(error);
  const lines = raw.split("\n").map((line) => line.trim()).filter(Boolean);
  const location = extractPythonLocation(lines);
  const exceptionLine = [...lines]
    .reverse()
    .find((line) => /^[A-Za-z_][A-Za-z0-9_.]*(Error|Exception|Warning)?:/.test(line) || line.startsWith("SyntaxError:"));
  const useful = exceptionLine
    ?? lines.find((line) => !line.startsWith("Traceback") && !line.startsWith('File "'));
  const summary = (useful ?? raw).replace(/^Status:\s*/, "");
  if (!location) {
    return summary;
  }
  const codeSuffix = location.code ? `\nCode: ${location.code}` : "";
  return `${summary}\nLocation: ${location.file}:${location.line} in ${location.functionName}${codeSuffix}`;
};
