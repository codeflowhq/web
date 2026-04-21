const APP_BASE_URL = import.meta.env.BASE_URL ?? "/";

export const resolveAssetUrl = (value) => {
  if (typeof value !== "string") {
    return value;
  }
  if (/^(https?:)?\/\//.test(value) || value.startsWith("data:")) {
    return value;
  }
  const normalizedPath = value.replace(/^\/+/, "");
  return new URL(normalizedPath, new URL(APP_BASE_URL, window.location.origin)).toString();
};
