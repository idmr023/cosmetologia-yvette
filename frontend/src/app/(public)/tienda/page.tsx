"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Plus, Minus, Package, Loader2, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/stores/cartStore";
import { cn, formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  category: string;
  stockQty: number;
  unitPrice: string;
  supplier: string | null;
}

export default function TiendaPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showCart, setShowCart] = useState(false);

  const { items, addItem, removeItem, updateQuantity, totalItems, totalAmount } = useCartStore();

  useEffect(() => {
    const url = categoryFilter
      ? `/api/products?category=${encodeURIComponent(categoryFilter)}`
      : "/api/products";

    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.data ?? []);
        setCategories(data.categories ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [categoryFilter]);

  return (
    <div className="min-h-screen bg-pastel/20 pb-24">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/95 px-4 py-3 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <h1 className="text-base font-semibold text-ink">Tienda Yvette</h1>
          <button
            onClick={() => setShowCart(!showCart)}
            className="relative min-h-touch min-w-touch flex items-center justify-center rounded-lg p-2"
          >
            <ShoppingCart className="h-5 w-5 text-ink" />
            {totalItems() > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-white">
                {totalItems()}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-6xl p-4">
        {/* Categories */}
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setCategoryFilter(null)}
            className={cn(
              "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              !categoryFilter ? "bg-gold text-white" : "border border-neutral-200 bg-white text-neutral-600",
            )}
          >
            Todas
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={cn(
                "shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
                categoryFilter === cat ? "bg-gold text-white" : "border border-neutral-200 bg-white text-neutral-600",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gold" />
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-400">
            No hay productos disponibles
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => {
              const cartItem = items.find((i) => i.inventoryId === product.id);
              return (
                <div
                  key={product.id}
                  className="flex flex-col rounded-2xl border border-neutral-200 bg-white p-4 transition-all hover:border-gold/30"
                >
                  <div className="mb-2 flex h-20 items-center justify-center rounded-xl bg-pastel/30">
                    <Package className="h-10 w-10 text-gold/50" />
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
                    {product.category}
                  </p>
                  <p className="text-base font-semibold text-ink">{product.name}</p>
                  <p className="mt-1 text-lg font-bold text-gold">
                    {formatCurrency(product.unitPrice)}
                  </p>
                  <p className="text-xs text-neutral-400">
                    Stock: {product.stockQty} uds.
                  </p>

                  <div className="mt-auto pt-3">
                    {cartItem ? (
                      <div className="flex items-center justify-between rounded-xl border border-gold/30 bg-gold/5 p-1">
                        <button
                          onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                          className="min-h-touch min-w-touch flex items-center justify-center rounded-lg text-gold"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-sm font-semibold text-ink">{cartItem.quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                          disabled={cartItem.quantity >= product.stockQty}
                          className="min-h-touch min-w-touch flex items-center justify-center rounded-lg text-gold disabled:opacity-30"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        fullWidth
                        onClick={() =>
                          addItem({
                            inventoryId: product.id,
                            name: product.name,
                            price: product.unitPrice,
                            quantity: 1,
                            stockQty: product.stockQty,
                          })
                        }
                      >
                        <Plus className="h-4 w-4" /> Agregar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Cart drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setShowCart(false)}>
          <div
            className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-3xl bg-white p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Carrito ({totalItems()})</h2>
              <button onClick={() => setShowCart(false)} className="min-h-touch min-w-touch rounded-lg p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-neutral-400">Carrito vacío</p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.inventoryId}
                    className="flex items-center justify-between rounded-xl border border-neutral-200 p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-ink">{item.name}</p>
                      <p className="text-xs text-gold">{formatCurrency(item.price)} c/u</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.inventoryId, item.quantity - 1)}
                        className="min-h-touch min-w-touch flex items-center justify-center rounded-lg text-neutral-500"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.inventoryId, item.quantity + 1)}
                        className="min-h-touch min-w-touch flex items-center justify-center rounded-lg text-neutral-500"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.inventoryId)}
                        className="min-h-touch min-w-touch flex items-center justify-center rounded-lg text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="border-t border-neutral-200 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-ink">Total</span>
                    <span className="text-gold">{formatCurrency(totalAmount())}</span>
                  </div>
                </div>

                <Button size="lg" fullWidth onClick={() => { setShowCart(false); router.push("/checkout"); }}>
                  Ir a pagar <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
