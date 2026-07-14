import { headers } from "next/headers";

export async function getClientIP(): Promise<string> {
  const headersList = headers();
  const forwarded = headersList.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]!.trim();
  }
  const realIp = headersList.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export async function getUserAgent(): Promise<string> {
  const headersList = headers();
  return headersList.get("user-agent") ?? "unknown";
}
