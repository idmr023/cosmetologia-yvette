"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Loader2, UserCircle, Save, Pencil } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { TopBar } from "@/components/navigation/TopBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface ClientData {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  notes: string | null;
}

export default function ClientePerfilPage() {
  useSession();
  const [client, setClient] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    apiFetch("/api/clients/me")
      .then((r) => r.json())
      .then((data) => {
        setClient(data);
        setForm({
          firstName: data.firstName ?? "",
          lastName: data.lastName ?? "",
          phone: data.phone ?? "",
          email: data.email ?? "",
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    setMessage("");
    try {
      const res = await apiFetch("/api/clients/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated = await res.json();
        setClient(updated);
        setEditing(false);
        setMessage("Perfil actualizado correctamente.");
      } else {
        const err = await res.json();
        setMessage(err.error || "Error al guardar.");
      }
    } catch {
      setMessage("Error de conexión.");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setForm({
      firstName: client?.firstName ?? "",
      lastName: client?.lastName ?? "",
      phone: client?.phone ?? "",
      email: client?.email ?? "",
    });
    setEditing(false);
    setMessage("");
  }

  if (loading) {
    return (
      <>
        <TopBar title="Perfil" />
        <LoadingSpinner className="py-16" />
      </>
    );
  }

  return (
    <>
      <TopBar title="Perfil" />
      <div className="mx-auto max-w-2xl space-y-4 p-4">
        <Card className="flex items-center gap-4 p-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gold/10 text-gold">
            <UserCircle className="h-8 w-8" />
          </div>
          <div>
            <p className="font-semibold text-ink dark:text-white">
              {client?.firstName} {client?.lastName}
            </p>
            <p className="text-sm text-neutral-500">{client?.email}</p>
          </div>
        </Card>

        <Card className="space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink dark:text-white">
              Datos Personales
            </h3>
            {!editing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditing(true)}
              >
                <Pencil className="h-4 w-4" />
                Editar
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs text-neutral-500">
                Nombre
              </label>
              {editing ? (
                <Input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm text-ink dark:text-white">{client?.firstName}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">
                Apellido
              </label>
              {editing ? (
                <Input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm text-ink dark:text-white">{client?.lastName}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">
                Teléfono
              </label>
              {editing ? (
                <Input
                  value={form.phone}
                  onChange={(e) =>
                    setForm({ ...form, phone: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm text-ink dark:text-white">{client?.phone}</p>
              )}
            </div>
            <div>
              <label className="mb-1 block text-xs text-neutral-500">
                Email
              </label>
              {editing ? (
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              ) : (
                <p className="text-sm text-ink dark:text-white">{client?.email ?? "—"}</p>
              )}
            </div>
          </div>

          {message && (
            <p
              className={`text-sm ${
                message.includes("correctamente")
                  ? "text-green-600"
                  : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}

          {editing && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Guardar Cambios
              </Button>
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
