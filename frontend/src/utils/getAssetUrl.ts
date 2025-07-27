// src/utils/getAssetUrl.ts
export function getAssetUrl(path: string): string {
  const isDev = import.meta.env.DEV;
  if (isDev) return path;

  const apiBase = import.meta.env.VITE_API_BASE_URL!;
  const backendOrigin = apiBase.replace(/\/api$/, "");
  return `${backendOrigin}${path}`;
}
