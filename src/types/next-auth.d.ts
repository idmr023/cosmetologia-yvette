import "next-auth";

declare module "next-auth" {
  interface User {
    role?: "admin" | "colaborador" | "cliente";
    colaboradorId?: string;
    clientId?: string;
    accessToken?: string;
    refreshToken?: string;
  }
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    user: {
      id: string;
      name: string;
      email: string;
      role: "admin" | "colaborador" | "cliente";
      colaboradorId?: string;
      clientId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: "admin" | "colaborador" | "cliente";
    colaboradorId?: string;
    clientId?: string;
    accessToken?: string;
    refreshToken?: string;
  }
}
