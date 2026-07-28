"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.referralUsageRelations = exports.referralCodesRelations = exports.orderItemsRelations = exports.ordersRelations = exports.orderItems = exports.orders = exports.reviewsRelations = exports.loyaltyTransactionsRelations = exports.loyaltyPointsRelations = exports.referralUsage = exports.referralCodes = exports.notifications = exports.reviews = exports.clientRewards = exports.loyaltyRewards = exports.loyaltyTransactions = exports.loyaltyPoints = exports.loyaltyTiers = exports.settings = exports.userMfa = exports.auditLogs = exports.refreshTokens = exports.auditLogRelations = exports.loginAttempts = exports.auditLog = exports.cashMovementsRelations = exports.cashRegistersRelations = exports.cashMovements = exports.cashRegisters = exports.commissionsRelations = exports.serviceHistoryRelations = exports.appointmentServicesRelations = exports.appointmentsRelations = exports.servicesRelations = exports.colaboradoresRelations = exports.clientsRelations = exports.usersRelations = exports.commissions = exports.serviceHistory = exports.inventory = exports.appointmentServices = exports.appointments = exports.services = exports.colaboradores = exports.clients = exports.users = exports.commissionStatusEnum = exports.inventoryTypeEnum = exports.appointmentStatusEnum = exports.roleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_orm_1 = require("drizzle-orm");
exports.roleEnum = (0, pg_core_1.pgEnum)("role", ["admin", "colaborador", "cliente"]);
exports.appointmentStatusEnum = (0, pg_core_1.pgEnum)("appointment_status", [
    "pendiente",
    "confirmada",
    "completada",
    "cancelada",
]);
exports.inventoryTypeEnum = (0, pg_core_1.pgEnum)("inventory_type", ["uso", "venta"]);
exports.commissionStatusEnum = (0, pg_core_1.pgEnum)("commission_status", [
    "pendiente",
    "pagada",
]);
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    passwordHash: (0, pg_core_1.text)("password_hash"),
    name: (0, pg_core_1.text)("name").notNull(),
    phone: (0, pg_core_1.text)("phone"),
    role: (0, exports.roleEnum)("role").notNull().default("cliente"),
    avatarUrl: (0, pg_core_1.text)("avatar_url"),
    securityQuestion: (0, pg_core_1.text)("security_question"),
    securityAnswerHash: (0, pg_core_1.text)("security_answer_hash"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.clients = (0, pg_core_1.pgTable)("clients", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)("user_id").references(() => exports.users.id, { onDelete: "set null" }).unique(),
    firstName: (0, pg_core_1.text)("first_name").notNull(),
    lastName: (0, pg_core_1.text)("last_name").notNull(),
    dni: (0, pg_core_1.text)("dni").unique().notNull(),
    phone: (0, pg_core_1.text)("phone").notNull(),
    email: (0, pg_core_1.text)("email"),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.colaboradores = (0, pg_core_1.pgTable)("colaboradores", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)("user_id").references(() => exports.users.id, { onDelete: "cascade" }),
    fullName: (0, pg_core_1.text)("full_name").notNull(),
    phone: (0, pg_core_1.text)("phone"),
    specialty: (0, pg_core_1.text)("specialty"),
    commissionPct: (0, pg_core_1.decimal)("commission_pct", { precision: 5, scale: 2 }).default("0"),
    isAvailable: (0, pg_core_1.boolean)("is_available").default(true).notNull(),
    colorTag: (0, pg_core_1.text)("color_tag"),
});
exports.services = (0, pg_core_1.pgTable)("services", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    name: (0, pg_core_1.text)("name").notNull(),
    category: (0, pg_core_1.text)("category").notNull(),
    durationMin: (0, pg_core_1.integer)("duration_min").notNull(),
    price: (0, pg_core_1.decimal)("price", { precision: 10, scale: 2 }).notNull(),
    description: (0, pg_core_1.text)("description"),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
});
exports.appointments = (0, pg_core_1.pgTable)("appointments", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    clientId: (0, pg_core_1.uuid)("client_id")
        .references(() => exports.clients.id, { onDelete: "cascade" })
        .notNull(),
    colaboradorId: (0, pg_core_1.uuid)("colaborador_id")
        .references(() => exports.colaboradores.id)
        .notNull(),
    startAt: (0, pg_core_1.timestamp)("start_at", { withTimezone: true }).notNull(),
    endAt: (0, pg_core_1.timestamp)("end_at", { withTimezone: true }).notNull(),
    status: (0, exports.appointmentStatusEnum)("status").default("pendiente").notNull(),
    totalPrice: (0, pg_core_1.decimal)("total_price", { precision: 10, scale: 2 }).notNull(),
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.appointmentServices = (0, pg_core_1.pgTable)("appointment_services", {
    appointmentId: (0, pg_core_1.uuid)("appointment_id")
        .references(() => exports.appointments.id, { onDelete: "cascade" })
        .notNull(),
    serviceId: (0, pg_core_1.uuid)("service_id")
        .references(() => exports.services.id)
        .notNull(),
    quantity: (0, pg_core_1.integer)("quantity").default(1).notNull(),
}, (t) => ({ pk: (0, pg_core_1.primaryKey)({ columns: [t.appointmentId, t.serviceId] }) }));
exports.inventory = (0, pg_core_1.pgTable)("inventory", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    name: (0, pg_core_1.text)("name").notNull(),
    type: (0, exports.inventoryTypeEnum)("type").notNull(),
    category: (0, pg_core_1.text)("category"),
    stockQty: (0, pg_core_1.integer)("stock_qty").default(0).notNull(),
    minStock: (0, pg_core_1.integer)("min_stock").default(0).notNull(),
    unitPrice: (0, pg_core_1.decimal)("unit_price", { precision: 10, scale: 2 }),
    supplier: (0, pg_core_1.text)("supplier"),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.serviceHistory = (0, pg_core_1.pgTable)("service_history", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    clientId: (0, pg_core_1.uuid)("client_id")
        .references(() => exports.clients.id, { onDelete: "cascade" })
        .notNull(),
    appointmentId: (0, pg_core_1.uuid)("appointment_id").references(() => exports.appointments.id, {
        onDelete: "cascade",
    }),
    serviceId: (0, pg_core_1.uuid)("service_id").references(() => exports.services.id),
    details: (0, pg_core_1.jsonb)("details"),
    performedAt: (0, pg_core_1.timestamp)("performed_at").defaultNow().notNull(),
});
exports.commissions = (0, pg_core_1.pgTable)("commissions", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    appointmentId: (0, pg_core_1.uuid)("appointment_id")
        .references(() => exports.appointments.id, { onDelete: "cascade" })
        .notNull(),
    colaboradorId: (0, pg_core_1.uuid)("colaborador_id")
        .references(() => exports.colaboradores.id)
        .notNull(),
    amount: (0, pg_core_1.decimal)("amount", { precision: 10, scale: 2 }).notNull(),
    status: (0, exports.commissionStatusEnum)("status").default("pendiente").notNull(),
    settledAt: (0, pg_core_1.timestamp)("settled_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.usersRelations = (0, drizzle_orm_1.relations)(exports.users, ({ one }) => ({
    colaborador: one(exports.colaboradores, { fields: [exports.users.id], references: [exports.colaboradores.userId] }),
    client: one(exports.clients, { fields: [exports.users.id], references: [exports.clients.userId] }),
}));
exports.clientsRelations = (0, drizzle_orm_1.relations)(exports.clients, ({ one, many }) => ({
    user: one(exports.users, { fields: [exports.clients.userId], references: [exports.users.id] }),
    appointments: many(exports.appointments),
    history: many(exports.serviceHistory),
    loyaltyPoints: one(exports.loyaltyPoints),
    orders: many(exports.orders),
    reviews: many(exports.reviews),
}));
exports.colaboradoresRelations = (0, drizzle_orm_1.relations)(exports.colaboradores, ({ many }) => ({
    appointments: many(exports.appointments),
    commissions: many(exports.commissions),
}));
exports.servicesRelations = (0, drizzle_orm_1.relations)(exports.services, ({ many }) => ({
    appointmentServices: many(exports.appointmentServices),
    history: many(exports.serviceHistory),
}));
exports.appointmentsRelations = (0, drizzle_orm_1.relations)(exports.appointments, ({ one, many }) => ({
    client: one(exports.clients, { fields: [exports.appointments.clientId], references: [exports.clients.id] }),
    colaborador: one(exports.colaboradores, {
        fields: [exports.appointments.colaboradorId],
        references: [exports.colaboradores.id],
    }),
    services: many(exports.appointmentServices),
    commissions: many(exports.commissions),
    history: many(exports.serviceHistory),
}));
exports.appointmentServicesRelations = (0, drizzle_orm_1.relations)(exports.appointmentServices, ({ one }) => ({
    appointment: one(exports.appointments, {
        fields: [exports.appointmentServices.appointmentId],
        references: [exports.appointments.id],
    }),
    service: one(exports.services, {
        fields: [exports.appointmentServices.serviceId],
        references: [exports.services.id],
    }),
}));
exports.serviceHistoryRelations = (0, drizzle_orm_1.relations)(exports.serviceHistory, ({ one }) => ({
    client: one(exports.clients, { fields: [exports.serviceHistory.clientId], references: [exports.clients.id] }),
    appointment: one(exports.appointments, {
        fields: [exports.serviceHistory.appointmentId],
        references: [exports.appointments.id],
    }),
    service: one(exports.services, { fields: [exports.serviceHistory.serviceId], references: [exports.services.id] }),
}));
exports.commissionsRelations = (0, drizzle_orm_1.relations)(exports.commissions, ({ one }) => ({
    appointment: one(exports.appointments, {
        fields: [exports.commissions.appointmentId],
        references: [exports.appointments.id],
    }),
    colaborador: one(exports.colaboradores, {
        fields: [exports.commissions.colaboradorId],
        references: [exports.colaboradores.id],
    }),
}));
exports.cashRegisters = (0, pg_core_1.pgTable)("cash_registers", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    colaboradorId: (0, pg_core_1.uuid)("colaborador_id")
        .references(() => exports.colaboradores.id)
        .notNull(),
    apertura: (0, pg_core_1.timestamp)("apertura").defaultNow().notNull(),
    cierre: (0, pg_core_1.timestamp)("cierre"),
    montoInicial: (0, pg_core_1.decimal)("monto_inicial", { precision: 10, scale: 2 }).notNull(),
    montoEsperado: (0, pg_core_1.decimal)("monto_esperado", { precision: 10, scale: 2 }),
    montoReal: (0, pg_core_1.decimal)("monto_real", { precision: 10, scale: 2 }),
    diferencia: (0, pg_core_1.decimal)("diferencia", { precision: 10, scale: 2 }),
    estado: (0, pg_core_1.text)("estado").notNull().default("abierta"),
    notas: (0, pg_core_1.text)("notas"),
});
exports.cashMovements = (0, pg_core_1.pgTable)("cash_movements", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    cajaId: (0, pg_core_1.uuid)("caja_id")
        .references(() => exports.cashRegisters.id, { onDelete: "cascade" })
        .notNull(),
    appointmentId: (0, pg_core_1.uuid)("appointment_id")
        .references(() => exports.appointments.id, { onDelete: "set null" }),
    tipo: (0, pg_core_1.text)("tipo").notNull(),
    monto: (0, pg_core_1.decimal)("monto", { precision: 10, scale: 2 }).notNull(),
    concepto: (0, pg_core_1.text)("concepto"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.cashRegistersRelations = (0, drizzle_orm_1.relations)(exports.cashRegisters, ({ one, many }) => ({
    colaborador: one(exports.colaboradores, {
        fields: [exports.cashRegisters.colaboradorId],
        references: [exports.colaboradores.id],
    }),
    movements: many(exports.cashMovements),
}));
exports.cashMovementsRelations = (0, drizzle_orm_1.relations)(exports.cashMovements, ({ one }) => ({
    caja: one(exports.cashRegisters, {
        fields: [exports.cashMovements.cajaId],
        references: [exports.cashRegisters.id],
    }),
    appointment: one(exports.appointments, {
        fields: [exports.cashMovements.appointmentId],
        references: [exports.appointments.id],
    }),
}));
exports.auditLog = (0, pg_core_1.pgTable)("audit_log", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)("user_id").references(() => exports.users.id, { onDelete: "set null" }),
    action: (0, pg_core_1.text)("action").notNull(),
    email: (0, pg_core_1.text)("email"),
    ip: (0, pg_core_1.text)("ip"),
    userAgent: (0, pg_core_1.text)("user_agent"),
    success: (0, pg_core_1.boolean)("success").notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.loginAttempts = (0, pg_core_1.pgTable)("login_attempts", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    email: (0, pg_core_1.text)("email").notNull(),
    ip: (0, pg_core_1.text)("ip").notNull(),
    success: (0, pg_core_1.boolean)("success").notNull().default(false),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.auditLogRelations = (0, drizzle_orm_1.relations)(exports.auditLog, ({ one }) => ({
    user: one(exports.users, { fields: [exports.auditLog.userId], references: [exports.users.id] }),
}));
exports.refreshTokens = (0, pg_core_1.pgTable)("refresh_tokens", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => exports.users.id, { onDelete: "cascade" })
        .notNull(),
    tokenHash: (0, pg_core_1.text)("token_hash").notNull(),
    isRevoked: (0, pg_core_1.boolean)("is_revoked").default(false).notNull(),
    expiresAt: (0, pg_core_1.timestamp)("expires_at").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.auditLogs = (0, pg_core_1.pgTable)("audit_logs", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    tableName: (0, pg_core_1.text)("table_name").notNull(),
    recordId: (0, pg_core_1.uuid)("record_id").notNull(),
    operation: (0, pg_core_1.text)("operation").notNull(),
    oldData: (0, pg_core_1.jsonb)("old_data"),
    newData: (0, pg_core_1.jsonb)("new_data"),
    changedBy: (0, pg_core_1.uuid)("changed_by"),
    changedAt: (0, pg_core_1.timestamp)("changed_at").defaultNow().notNull(),
});
exports.userMfa = (0, pg_core_1.pgTable)("user_mfa", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    userId: (0, pg_core_1.uuid)("user_id")
        .references(() => exports.users.id, { onDelete: "cascade" })
        .notNull()
        .unique(),
    secret: (0, pg_core_1.text)("secret").notNull(),
    isEnabled: (0, pg_core_1.boolean)("is_enabled").default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.settings = (0, pg_core_1.pgTable)("settings", {
    key: (0, pg_core_1.text)("key").primaryKey(),
    value: (0, pg_core_1.text)("value").notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.loyaltyTiers = (0, pg_core_1.pgTable)("loyalty_tiers", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    name: (0, pg_core_1.text)("name").notNull().unique(),
    minPoints: (0, pg_core_1.integer)("min_points").notNull().default(0),
    discountPct: (0, pg_core_1.decimal)("discount_pct", { precision: 5, scale: 2 }).default("0"),
    color: (0, pg_core_1.text)("color").default("#C9A227"),
    benefits: (0, pg_core_1.jsonb)("benefits").default([]),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.loyaltyPoints = (0, pg_core_1.pgTable)("loyalty_points", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    clientId: (0, pg_core_1.uuid)("client_id")
        .references(() => exports.clients.id, { onDelete: "cascade" })
        .notNull(),
    points: (0, pg_core_1.integer)("points").notNull().default(0),
    totalEarned: (0, pg_core_1.integer)("total_earned").notNull().default(0),
    totalRedeemed: (0, pg_core_1.integer)("total_redeemed").notNull().default(0),
    tierId: (0, pg_core_1.uuid)("tier_id").references(() => exports.loyaltyTiers.id),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
}, (t) => ({
    clientUnique: (0, pg_core_1.unique)().on(t.clientId),
}));
exports.loyaltyTransactions = (0, pg_core_1.pgTable)("loyalty_transactions", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    clientId: (0, pg_core_1.uuid)("client_id")
        .references(() => exports.clients.id, { onDelete: "cascade" })
        .notNull(),
    appointmentId: (0, pg_core_1.uuid)("appointment_id").references(() => exports.appointments.id, { onDelete: "set null" }),
    points: (0, pg_core_1.integer)("points").notNull(),
    type: (0, pg_core_1.text)("type").notNull(), // 'earn' | 'redeem' | 'expire'
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.loyaltyRewards = (0, pg_core_1.pgTable)("loyalty_rewards", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    name: (0, pg_core_1.text)("name").notNull(),
    description: (0, pg_core_1.text)("description"),
    pointsCost: (0, pg_core_1.integer)("points_cost").notNull(),
    rewardType: (0, pg_core_1.text)("reward_type").notNull(), // 'discount' | 'free_service' | 'product' | 'upgrade'
    rewardValue: (0, pg_core_1.text)("reward_value"), // monto descuento o id del servicio
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.clientRewards = (0, pg_core_1.pgTable)("client_rewards", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    clientId: (0, pg_core_1.uuid)("client_id")
        .references(() => exports.clients.id, { onDelete: "cascade" })
        .notNull(),
    rewardId: (0, pg_core_1.uuid)("reward_id")
        .references(() => exports.loyaltyRewards.id)
        .notNull(),
    redeemedAt: (0, pg_core_1.timestamp)("redeemed_at").defaultNow().notNull(),
    usedAt: (0, pg_core_1.timestamp)("used_at"),
    code: (0, pg_core_1.text)("code").notNull().unique(),
});
exports.reviews = (0, pg_core_1.pgTable)("reviews", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    appointmentId: (0, pg_core_1.uuid)("appointment_id")
        .references(() => exports.appointments.id, { onDelete: "set null" })
        .notNull()
        .unique(),
    clientId: (0, pg_core_1.uuid)("client_id")
        .references(() => exports.clients.id, { onDelete: "cascade" })
        .notNull(),
    colaboradorId: (0, pg_core_1.uuid)("colaborador_id")
        .references(() => exports.colaboradores.id)
        .notNull(),
    serviceId: (0, pg_core_1.uuid)("service_id")
        .references(() => exports.services.id),
    rating: (0, pg_core_1.integer)("rating").notNull(), // 1-5
    comment: (0, pg_core_1.text)("comment"),
    isPublic: (0, pg_core_1.boolean)("is_public").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.notifications = (0, pg_core_1.pgTable)("notifications", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    type: (0, pg_core_1.text)("type").notNull(), // 'reminder' | 'confirmation' | 'promotion' | 'low_stock' | 'review'
    channel: (0, pg_core_1.text)("channel").notNull(), // 'whatsapp' | 'email' | 'in_app'
    recipientId: (0, pg_core_1.text)("recipient_id"), // phone o email
    title: (0, pg_core_1.text)("title"),
    body: (0, pg_core_1.text)("body").notNull(),
    metadata: (0, pg_core_1.jsonb)("metadata"),
    status: (0, pg_core_1.text)("status").default("pending").notNull(), // 'pending' | 'sent' | 'failed'
    sentAt: (0, pg_core_1.timestamp)("sent_at"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.referralCodes = (0, pg_core_1.pgTable)("referral_codes", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    clientId: (0, pg_core_1.uuid)("client_id")
        .references(() => exports.clients.id, { onDelete: "cascade" })
        .notNull()
        .unique(),
    code: (0, pg_core_1.text)("code").notNull().unique(),
    discountPct: (0, pg_core_1.decimal)("discount_pct", { precision: 5, scale: 2 }).default("10"),
    usageCount: (0, pg_core_1.integer)("usage_count").default(0).notNull(),
    maxUses: (0, pg_core_1.integer)("max_uses").default(5),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.referralUsage = (0, pg_core_1.pgTable)("referral_usage", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    referralCodeId: (0, pg_core_1.uuid)("referral_code_id")
        .references(() => exports.referralCodes.id, { onDelete: "cascade" })
        .notNull(),
    referredClientId: (0, pg_core_1.uuid)("referred_client_id")
        .references(() => exports.clients.id, { onDelete: "cascade" })
        .notNull(),
    appointmentId: (0, pg_core_1.uuid)("appointment_id").references(() => exports.appointments.id, { onDelete: "set null" }),
    discountApplied: (0, pg_core_1.decimal)("discount_applied", { precision: 10, scale: 2 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
exports.loyaltyPointsRelations = (0, drizzle_orm_1.relations)(exports.loyaltyPoints, ({ one, many }) => ({
    client: one(exports.clients, { fields: [exports.loyaltyPoints.clientId], references: [exports.clients.id] }),
    tier: one(exports.loyaltyTiers, { fields: [exports.loyaltyPoints.tierId], references: [exports.loyaltyTiers.id] }),
    transactions: many(exports.loyaltyTransactions),
}));
exports.loyaltyTransactionsRelations = (0, drizzle_orm_1.relations)(exports.loyaltyTransactions, ({ one }) => ({
    client: one(exports.clients, { fields: [exports.loyaltyTransactions.clientId], references: [exports.clients.id] }),
    appointment: one(exports.appointments, { fields: [exports.loyaltyTransactions.appointmentId], references: [exports.appointments.id] }),
}));
exports.reviewsRelations = (0, drizzle_orm_1.relations)(exports.reviews, ({ one }) => ({
    appointment: one(exports.appointments, { fields: [exports.reviews.appointmentId], references: [exports.appointments.id] }),
    client: one(exports.clients, { fields: [exports.reviews.clientId], references: [exports.clients.id] }),
    colaborador: one(exports.colaboradores, { fields: [exports.reviews.colaboradorId], references: [exports.colaboradores.id] }),
    service: one(exports.services, { fields: [exports.reviews.serviceId], references: [exports.services.id] }),
}));
exports.orders = (0, pg_core_1.pgTable)("orders", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    clientId: (0, pg_core_1.uuid)("client_id")
        .references(() => exports.clients.id, { onDelete: "cascade" })
        .notNull(),
    status: (0, pg_core_1.text)("status").notNull().default("pendiente"), // pendiente, enviado, entregado, cancelado
    totalAmount: (0, pg_core_1.decimal)("total_amount", { precision: 10, scale: 2 }).notNull(),
    paymentMethod: (0, pg_core_1.text)("payment_method"), // yape, plin, efectivo, transferencia, mercadopago
    paymentStatus: (0, pg_core_1.text)("payment_status").default("pendiente"), // pendiente, pagado, reembolsado
    paidAt: (0, pg_core_1.timestamp)("paid_at"),
    shippingAddress: (0, pg_core_1.text)("shipping_address"),
    deliveryMethod: (0, pg_core_1.text)("delivery_method").default("recojo"), // recojo, delivery
    notes: (0, pg_core_1.text)("notes"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)("updated_at").defaultNow().notNull(),
});
exports.orderItems = (0, pg_core_1.pgTable)("order_items", {
    id: (0, pg_core_1.uuid)("id").primaryKey().defaultRandom(),
    orderId: (0, pg_core_1.uuid)("order_id")
        .references(() => exports.orders.id, { onDelete: "cascade" })
        .notNull(),
    inventoryId: (0, pg_core_1.uuid)("inventory_id")
        .references(() => exports.inventory.id)
        .notNull(),
    quantity: (0, pg_core_1.integer)("quantity").notNull().default(1),
    unitPrice: (0, pg_core_1.decimal)("unit_price", { precision: 10, scale: 2 }).notNull(),
});
exports.ordersRelations = (0, drizzle_orm_1.relations)(exports.orders, ({ one, many }) => ({
    client: one(exports.clients, { fields: [exports.orders.clientId], references: [exports.clients.id] }),
    items: many(exports.orderItems),
}));
exports.orderItemsRelations = (0, drizzle_orm_1.relations)(exports.orderItems, ({ one }) => ({
    order: one(exports.orders, { fields: [exports.orderItems.orderId], references: [exports.orders.id] }),
    product: one(exports.inventory, { fields: [exports.orderItems.inventoryId], references: [exports.inventory.id] }),
}));
exports.referralCodesRelations = (0, drizzle_orm_1.relations)(exports.referralCodes, ({ one, many }) => ({
    client: one(exports.clients, { fields: [exports.referralCodes.clientId], references: [exports.clients.id] }),
    usage: many(exports.referralUsage),
}));
exports.referralUsageRelations = (0, drizzle_orm_1.relations)(exports.referralUsage, ({ one }) => ({
    referralCode: one(exports.referralCodes, { fields: [exports.referralUsage.referralCodeId], references: [exports.referralCodes.id] }),
    referredClient: one(exports.clients, { fields: [exports.referralUsage.referredClientId], references: [exports.clients.id] }),
}));
//# sourceMappingURL=schema.js.map