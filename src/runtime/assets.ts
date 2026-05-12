const APP_BASE_URL = import.meta.env.BASE_URL ?? "/";

export const resolveAssetUrl = (value: unknown): unknown => {
  if (typeof value !== "string") {
    return value;
  }
  if (/^(https?:)?\/\//.test(value) || value.startsWith("data:")) {
    return value;
  }
  const normalizedPath = value.replace(/^\/+/, "");
  const origin = globalThis.window?.location?.origin ?? "http://localhost";
  return new URL(normalizedPath, new URL(APP_BASE_URL, origin)).toString();
};
