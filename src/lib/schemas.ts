import { z } from "zod";

export const clientSchema = z.object({
  firstName: z.string().min(2, "Nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "Apellido debe tener al menos 2 caracteres"),
  phone: z.string().min(6, "Teléfono inválido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  notes: z.string().optional(),
});

export const serviceSchema = z.object({
  name: z.string().min(2, "Nombre del servicio requerido"),
  category: z.string().min(1, "Categoría requerida"),
  durationMin: z.coerce.number().min(5, "Duración mínima 5 min"),
  price: z.coerce.number().min(0, "Precio inválido"),
  description: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const inventorySchema = z.object({
  name: z.string().min(2, "Nombre del producto requerido"),
  type: z.enum(["uso", "venta"]),
  category: z.string().optional(),
  stockQty: z.coerce.number().min(0, "Stock inválido"),
  minStock: z.coerce.number().min(0, "Stock mínimo inválido"),
  unitPrice: z.coerce.number().min(0).optional().or(z.literal("")),
  supplier: z.string().optional(),
});

export const colaboradorSchema = z.object({
  fullName: z.string().min(2, "Nombre completo requerido"),
  phone: z.string().optional(),
  specialty: z.string().optional(),
  commissionPct: z.coerce.number().min(0).max(100),
  isAvailable: z.boolean().default(true),
  colorTag: z.string().optional(),
});

export const appointmentSchema = z.object({
  clientId: z.string().uuid("Cliente inválido"),
  serviceId: z.string().uuid("Servicio inválido"),
  colaboradorId: z.string().uuid("Colaboradora inválida"),
  startAt: z.string().min(1, "Fecha y hora requerida"),
  notes: z.string().optional(),
});

export const bookingSchema = z.object({
  serviceId: z.string().uuid(),
  colaboradorId: z.string().uuid(),
  startAt: z.string(),
  modality: z.enum(["salon", "domicilio"]),
  clientName: z.string().min(2),
  clientPhone: z.string().min(6),
  clientEmail: z.string().email().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export type ClientFormData = z.infer<typeof clientSchema>;
export type ServiceFormData = z.infer<typeof serviceSchema>;
export type InventoryFormData = z.infer<typeof inventorySchema>;
export type ColaboradorFormData = z.infer<typeof colaboradorSchema>;
export type AppointmentFormData = z.infer<typeof appointmentSchema>;
