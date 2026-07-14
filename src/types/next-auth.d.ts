import "next-auth";

declare module "next-auth" {
  interface User {
    role?: "admin" | "colaborador" | "cliente";
    colaboradorId?: string;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "admin" | "colaborador" | "cliente";
      colaboradorId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "colaborador" | "cliente";
    colaboradorId?: string;
  }
}
