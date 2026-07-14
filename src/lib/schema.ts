import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  boolean,
  decimal,
  jsonb,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const roleEnum = pgEnum("role", ["admin", "colaborador", "cliente"]);
export const appointmentStatusEnum = pgEnum("appointment_status", [
  "pendiente",
  "confirmada",
  "completada",
  "cancelada",
]);
export const inventoryTypeEnum = pgEnum("inventory_type", ["uso", "venta"]);
export const commissionStatusEnum = pgEnum("commission_status", [
  "pendiente",
  "pagada",
]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  name: text("name").notNull(),
  phone: text("phone"),
  role: roleEnum("role").notNull().default("cliente"),
  avatarUrl: text("avatar_url"),
  securityQuestion: text("security_question"),
  securityAnswerHash: text("security_answer_hash"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const colaboradores = pgTable("colaboradores", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  specialty: text("specialty"),
  commissionPct: decimal("commission_pct", { precision: 5, scale: 2 }).default("0"),
  isAvailable: boolean("is_available").default(true).notNull(),
  colorTag: text("color_tag"),
});

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  durationMin: integer("duration_min").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true).notNull(),
});

export const appointments = pgTable("appointments", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  colaboradorId: uuid("colaborador_id")
    .references(() => colaboradores.id)
    .notNull(),
  startAt: timestamp("start_at", { withTimezone: true }).notNull(),
  endAt: timestamp("end_at", { withTimezone: true }).notNull(),
  status: appointmentStatusEnum("status").default("pendiente").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appointmentServices = pgTable(
  "appointment_services",
  {
    appointmentId: uuid("appointment_id")
      .references(() => appointments.id, { onDelete: "cascade" })
      .notNull(),
    serviceId: uuid("service_id")
      .references(() => services.id)
      .notNull(),
    quantity: integer("quantity").default(1).notNull(),
  },
  (t) => ({ pk: primaryKey({ columns: [t.appointmentId, t.serviceId] }) }),
);

export const inventory = pgTable("inventory", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  type: inventoryTypeEnum("type").notNull(),
  category: text("category"),
  stockQty: integer("stock_qty").default(0).notNull(),
  minStock: integer("min_stock").default(0).notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }),
  supplier: text("supplier"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const serviceHistory = pgTable("service_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, {
    onDelete: "cascade",
  }),
  serviceId: uuid("service_id").references(() => services.id),
  details: jsonb("details"),
  performedAt: timestamp("performed_at").defaultNow().notNull(),
});

export const commissions = pgTable("commissions", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentId: uuid("appointment_id")
    .references(() => appointments.id, { onDelete: "cascade" })
    .notNull(),
  colaboradorId: uuid("colaborador_id")
    .references(() => colaboradores.id)
    .notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: commissionStatusEnum("status").default("pendiente").notNull(),
  settledAt: timestamp("settled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
  colaborador: one(colaboradores, { fields: [users.id], references: [colaboradores.userId] }),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  appointments: many(appointments),
  history: many(serviceHistory),
}));

export const colaboradoresRelations = relations(colaboradores, ({ many }) => ({
  appointments: many(appointments),
  commissions: many(commissions),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  appointmentServices: many(appointmentServices),
  history: many(serviceHistory),
}));

export const appointmentsRelations = relations(appointments, ({ one, many }) => ({
  client: one(clients, { fields: [appointments.clientId], references: [clients.id] }),
  colaborador: one(colaboradores, {
    fields: [appointments.colaboradorId],
    references: [colaboradores.id],
  }),
  services: many(appointmentServices),
  commissions: many(commissions),
  history: many(serviceHistory),
}));

export const appointmentServicesRelations = relations(appointmentServices, ({ one }) => ({
  appointment: one(appointments, {
    fields: [appointmentServices.appointmentId],
    references: [appointments.id],
  }),
  service: one(services, {
    fields: [appointmentServices.serviceId],
    references: [services.id],
  }),
}));

export const serviceHistoryRelations = relations(serviceHistory, ({ one }) => ({
  client: one(clients, { fields: [serviceHistory.clientId], references: [clients.id] }),
  appointment: one(appointments, {
    fields: [serviceHistory.appointmentId],
    references: [appointments.id],
  }),
  service: one(services, { fields: [serviceHistory.serviceId], references: [services.id] }),
}));

export const commissionsRelations = relations(commissions, ({ one }) => ({
  appointment: one(appointments, {
    fields: [commissions.appointmentId],
    references: [appointments.id],
  }),
  colaborador: one(colaboradores, {
    fields: [commissions.colaboradorId],
    references: [colaboradores.id],
  }),
}));

export const cashRegisters = pgTable("cash_registers", {
  id: uuid("id").primaryKey().defaultRandom(),
  colaboradorId: uuid("colaborador_id")
    .references(() => colaboradores.id)
    .notNull(),
  apertura: timestamp("apertura").defaultNow().notNull(),
  cierre: timestamp("cierre"),
  montoInicial: decimal("monto_inicial", { precision: 10, scale: 2 }).notNull(),
  montoEsperado: decimal("monto_esperado", { precision: 10, scale: 2 }),
  montoReal: decimal("monto_real", { precision: 10, scale: 2 }),
  diferencia: decimal("diferencia", { precision: 10, scale: 2 }),
  estado: text("estado").notNull().default("abierta"),
  notas: text("notas"),
});

export const cashMovements = pgTable("cash_movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  cajaId: uuid("caja_id")
    .references(() => cashRegisters.id, { onDelete: "cascade" })
    .notNull(),
  appointmentId: uuid("appointment_id")
    .references(() => appointments.id, { onDelete: "set null" }),
  tipo: text("tipo").notNull(),
  monto: decimal("monto", { precision: 10, scale: 2 }).notNull(),
  concepto: text("concepto"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cashRegistersRelations = relations(cashRegisters, ({ one, many }) => ({
  colaborador: one(colaboradores, {
    fields: [cashRegisters.colaboradorId],
    references: [colaboradores.id],
  }),
  movements: many(cashMovements),
}));

export const cashMovementsRelations = relations(cashMovements, ({ one }) => ({
  caja: one(cashRegisters, {
    fields: [cashMovements.cajaId],
    references: [cashRegisters.id],
  }),
  appointment: one(appointments, {
    fields: [cashMovements.appointmentId],
    references: [appointments.id],
  }),
}));

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  action: text("action").notNull(),
  email: text("email"),
  ip: text("ip"),
  userAgent: text("user_agent"),
  success: boolean("success").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const loginAttempts = pgTable("login_attempts", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  ip: text("ip").notNull(),
  success: boolean("success").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  user: one(users, { fields: [auditLog.userId], references: [users.id] }),
}));

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type Colaborador = typeof colaboradores.$inferSelect;
export type Service = typeof services.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
export type InventoryItem = typeof inventory.$inferSelect;
export type ServiceHistory = typeof serviceHistory.$inferSelect;
export type Commission = typeof commissions.$inferSelect;
export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type CashRegister = typeof cashRegisters.$inferSelect;
export type CashMovement = typeof cashMovements.$inferSelect;
