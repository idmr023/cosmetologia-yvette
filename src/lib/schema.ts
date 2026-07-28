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
  unique,
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
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }).unique(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dni: text("dni").unique().notNull(),
  phone: text("phone").notNull(),
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

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tableName: text("table_name").notNull(),
  recordId: uuid("record_id").notNull(),
  operation: text("operation").notNull(),
  oldData: jsonb("old_data"),
  newData: jsonb("new_data"),
  changedBy: uuid("changed_by"),
  changedAt: timestamp("changed_at").defaultNow().notNull(),
});

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
export const refreshTokens = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  tokenHash: text("token_hash").notNull(),
  isRevoked: boolean("is_revoked").default(false).notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userMfa = pgTable("user_mfa", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  secret: text("secret").notNull(),
  isEnabled: boolean("is_enabled").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const loyaltyTiers = pgTable("loyalty_tiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
  minPoints: integer("min_points").notNull().default(0),
  discountPct: decimal("discount_pct", { precision: 5, scale: 2 }).default("0"),
  color: text("color").default("#C9A227"),
  benefits: jsonb("benefits").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const loyaltyPoints = pgTable("loyalty_points", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  points: integer("points").notNull().default(0),
  totalEarned: integer("total_earned").notNull().default(0),
  totalRedeemed: integer("total_redeemed").notNull().default(0),
  tierId: uuid("tier_id").references(() => loyaltyTiers.id),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
  clientUnique: unique().on(t.clientId),
}));

export const loyaltyTransactions = pgTable("loyalty_transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, {
    onDelete: "set null",
  }),
  points: integer("points").notNull(),
  type: text("type").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const loyaltyRewards = pgTable("loyalty_rewards", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  pointsCost: integer("points_cost").notNull(),
  rewardType: text("reward_type").notNull(),
  rewardValue: text("reward_value"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clientRewards = pgTable("client_rewards", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  rewardId: uuid("reward_id")
    .references(() => loyaltyRewards.id)
    .notNull(),
  redeemedAt: timestamp("redeemed_at").defaultNow().notNull(),
  usedAt: timestamp("used_at"),
  code: text("code").notNull().unique(),
});

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  appointmentId: uuid("appointment_id")
    .references(() => appointments.id, { onDelete: "set null" })
    .notNull()
    .unique(),
  clientId: uuid("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  colaboradorId: uuid("colaborador_id")
    .references(() => colaboradores.id)
    .notNull(),
  serviceId: uuid("service_id").references(() => services.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  isPublic: boolean("is_public").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type").notNull(),
  channel: text("channel").notNull(),
  recipientId: text("recipient_id"),
  title: text("title"),
  body: text("body").notNull(),
  metadata: jsonb("metadata"),
  status: text("status").default("pending").notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  status: text("status").notNull().default("pendiente"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method"),
  paymentStatus: text("payment_status").default("pendiente"),
  paidAt: timestamp("paid_at"),
  shippingAddress: text("shipping_address"),
  deliveryMethod: text("delivery_method").default("recojo"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id")
    .references(() => orders.id, { onDelete: "cascade" })
    .notNull(),
  inventoryId: uuid("inventory_id")
    .references(() => inventory.id)
    .notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
});

export const referralCodes = pgTable("referral_codes", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  code: text("code").notNull().unique(),
  discountPct: decimal("discount_pct", { precision: 5, scale: 2 }).default("10"),
  usageCount: integer("usage_count").default(0).notNull(),
  maxUses: integer("max_uses").default(5),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const referralUsage = pgTable("referral_usage", {
  id: uuid("id").primaryKey().defaultRandom(),
  referralCodeId: uuid("referral_code_id")
    .references(() => referralCodes.id, { onDelete: "cascade" })
    .notNull(),
  referredClientId: uuid("referred_client_id")
    .references(() => clients.id, { onDelete: "cascade" })
    .notNull(),
  appointmentId: uuid("appointment_id").references(() => appointments.id, {
    onDelete: "set null",
  }),
  discountApplied: decimal("discount_applied", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one }) => ({
  colaborador: one(colaboradores, {
    fields: [users.id],
    references: [colaboradores.userId],
  }),
  client: one(clients, { fields: [users.id], references: [clients.userId] }),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, { fields: [clients.userId], references: [users.id] }),
  appointments: many(appointments),
  history: many(serviceHistory),
  loyaltyPoints: one(loyaltyPoints),
  orders: many(orders),
  reviews: many(reviews),
}));

export const loyaltyPointsRelations = relations(loyaltyPoints, ({ one, many }) => ({
  client: one(clients, {
    fields: [loyaltyPoints.clientId],
    references: [clients.id],
  }),
  tier: one(loyaltyTiers, {
    fields: [loyaltyPoints.tierId],
    references: [loyaltyTiers.id],
  }),
  transactions: many(loyaltyTransactions),
}));

export const loyaltyTransactionsRelations = relations(
  loyaltyTransactions,
  ({ one }) => ({
    client: one(clients, {
      fields: [loyaltyTransactions.clientId],
      references: [clients.id],
    }),
    appointment: one(appointments, {
      fields: [loyaltyTransactions.appointmentId],
      references: [appointments.id],
    }),
  }),
);

export const reviewsRelations = relations(reviews, ({ one }) => ({
  appointment: one(appointments, {
    fields: [reviews.appointmentId],
    references: [appointments.id],
  }),
  client: one(clients, {
    fields: [reviews.clientId],
    references: [clients.id],
  }),
  colaborador: one(colaboradores, {
    fields: [reviews.colaboradorId],
    references: [colaboradores.id],
  }),
  service: one(services, {
    fields: [reviews.serviceId],
    references: [services.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  client: one(clients, {
    fields: [orders.clientId],
    references: [clients.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(inventory, {
    fields: [orderItems.inventoryId],
    references: [inventory.id],
  }),
}));

export const referralCodesRelations = relations(
  referralCodes,
  ({ one, many }) => ({
    client: one(clients, {
      fields: [referralCodes.clientId],
      references: [clients.id],
    }),
    usage: many(referralUsage),
  }),
);

export const referralUsageRelations = relations(referralUsage, ({ one }) => ({
  referralCode: one(referralCodes, {
    fields: [referralUsage.referralCodeId],
    references: [referralCodes.id],
  }),
  referredClient: one(clients, {
    fields: [referralUsage.referredClientId],
    references: [clients.id],
  }),
}));

export type AuditLog = typeof auditLog.$inferSelect;
export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type Setting = typeof settings.$inferSelect;
export type CashRegister = typeof cashRegisters.$inferSelect;
export type CashMovement = typeof cashMovements.$inferSelect;
export type RefreshToken = typeof refreshTokens.$inferSelect;
export type AuditLogs = typeof auditLogs.$inferSelect;
export type UserMfa = typeof userMfa.$inferSelect;
export type LoyaltyTier = typeof loyaltyTiers.$inferSelect;
export type LoyaltyPoints = typeof loyaltyPoints.$inferSelect;
export type LoyaltyTransaction = typeof loyaltyTransactions.$inferSelect;
export type LoyaltyReward = typeof loyaltyRewards.$inferSelect;
export type ClientReward = typeof clientRewards.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type ReferralCode = typeof referralCodes.$inferSelect;
export type ReferralUsage = typeof referralUsage.$inferSelect;
