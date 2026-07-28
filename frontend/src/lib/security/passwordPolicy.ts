export interface PasswordValidation {
  valid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];

  if (password.length < 10) {
    errors.push("Mínimo 10 caracteres");
  }
  if (!/[a-zA-Z]/.test(password)) {
    errors.push("Debe contener al menos una letra");
  }
  if (!/\d/.test(password)) {
    errors.push("Debe contener al menos un número");
  }

  return { valid: errors.length === 0, errors };
}
