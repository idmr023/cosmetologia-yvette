export function generateSecret(): string {
  return "JBSWY3DPEHPK3PXP";
}

export function generateURI(_options: {
  issuer: string;
  label: string;
  secret: string;
}): string {
  return "otpauth://totp/test?secret=test";
}

export async function verify(_options: {
  secret: string;
  token: string;
}): Promise<{ valid: boolean; delta: number }> {
  return { valid: true, delta: 0 };
}
