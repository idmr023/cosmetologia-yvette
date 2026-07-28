import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartItem {
  inventoryId: string;
  name: string;
  price: string;
  quantity: number;
  stockQty: number;
  image?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (inventoryId: string) => void;
  updateQuantity: (inventoryId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalAmount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const existing = get().items.find((i) => i.inventoryId === item.inventoryId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.inventoryId === item.inventoryId
                ? { ...i, quantity: Math.min(i.quantity + 1, i.stockQty) }
                : i,
            ),
          });
        } else {
          set({ items: [...get().items, { ...item, quantity: 1 }] });
        }
      },

      removeItem: (inventoryId) => {
        set({ items: get().items.filter((i) => i.inventoryId !== inventoryId) });
      },

      updateQuantity: (inventoryId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(inventoryId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i.inventoryId === inventoryId ? { ...i, quantity: Math.min(quantity, i.stockQty) } : i,
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalAmount: () =>
        get().items.reduce((sum, i) => sum + parseFloat(i.price) * i.quantity, 0),
    }),
    { name: "yvette-cart" },
  ),
);
