export function resolveAppBaseUrl(
  configuredBaseUrl: string | undefined,
  requestHeaders: Pick<Headers, "get">
) {
  const configured = configuredBaseUrl?.trim().replace(/\/+$/, "");
  if (configured) {
    return /^https?:\/\//i.test(configured) ? configured : `https://${configured}`;
  }

  const forwardedHost = requestHeaders.get("x-forwarded-host")?.trim();
  const host = forwardedHost || requestHeaders.get("host")?.trim();

  if (host) {
    const forwardedProto = requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim();
    const protocol = forwardedProto || (host.startsWith("localhost") ? "http" : "https");
    return `${protocol}://${host}`;
  }

  return "http://localhost:3000";
}
