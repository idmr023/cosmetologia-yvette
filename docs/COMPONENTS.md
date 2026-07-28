# Sistema de Componentes

## Estructura

```
src/components/
├── primitives/       ← UI atómicos (antes ui/)
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Card.tsx
│   ├── Badge.tsx
│   ├── DataCard.tsx        ← Card genérico con slots
│   ├── CardSkeleton.tsx    ← Loading placeholder
│   ├── EmptyState.tsx      ← "No hay datos"
│   ├── PageShell.tsx       ← Layout CRUD estándar
│   ├── FilterChips.tsx     ← Chips de filtro genéricos
│   ├── ConfirmDialog.tsx   ← Modal de confirmación
│   ├── ThreeDotMenu.tsx
│   └── Sheet.tsx           ← Bottom sheet móvil
│
├── cards/             ← Cards de dominio (delgados, usan DataCard)
│   ├── AppointmentCard.tsx
│   ├── ClientCard.tsx
│   ├── ColaboradorCard.tsx
│   └── InventoryCard.tsx
│
├── modals/            ← Formularios en sheet
│   ├── AppointmentForm.tsx
│   ├── ClientForm.tsx
│   ├── ColaboradorForm.tsx
│   ├── ServiceForm.tsx
│   ├── InventoryForm.tsx
│   └── ConfirmDelete.tsx   ← Deprecado → usar ConfirmDialog
│
├── navigation/        ← Navegación
│   ├── TopBar.tsx
│   ├── SideNav.tsx
│   ├── BottomNav.tsx
│   └── navConfig.ts
│
├── cash/              ← Componentes de caja
├── landing/           ← Componentes de landing page
└── AppShell.tsx       ← Shell principal (SessionProvider + Nav + Sheet)
```

## Patrón DataCard

```tsx
<DataCard
  header={{ icon: Scissors, title: "Nombre", subtitle: "Categoría" }}
  badges={[<Badge>Activo</Badge>]}
  menu={[{ label: "Editar", icon: Pencil, onClick: fn }]}
  footer={<span className="text-gold">S/ 50.00</span>}
/>
```

## Patrón PageShell (toda página admin)

```tsx
<PageShell
  title="Clientes"
  action={{ label: "Nuevo cliente", icon: Plus, onClick: openCreate }}
  filters={<FilterChips options={FILTERS} value={filter} onChange={setFilter} />}
  search={{ value: search, onChange: setSearch, placeholder: "Buscar..." }}
  loading={loading}
  empty={items.length === 0}
  count={`${items.length} de ${total}`}
>
  {items.map(item => <CardComponent key={item.id} ... />)}
</PageShell>
```

## Hooks

```
src/hooks/
├── useCrud.ts           ← Hook genérico CRUD (base para los demás)
├── useAppointments.ts   ← useCrud("/api/appointments") + lógica extra
├── useClients.ts        ← useCrud("/api/clients") + search
├── useServices.ts       ← useCrud("/api/services") + categories
├── useColaboradores.ts  ← useCrud("/api/colaboradores")
├── useInventory.ts      ← useCrud("/api/inventory") + lowStock
├── useCommissions.ts    ← useCrud("/api/commissions")
├── useReports.ts        ← Hook específico de reportes
├── useCashRegister.ts   ← Hook específico de caja
├── useClientHistory.ts  ← Hook específico de historial
├── useColaboradorCalendar.ts ← Hook específico de calendario
└── useFormSheet.ts      ← Hook para manejar sheet + form + save
```
