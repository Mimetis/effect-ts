"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { User, UserWithOrders } from "@/lib/effect/schemas";

// Calls the API; when the status is not 2xx, throws the message sent by the server.
async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok) throw new Error(`${res.status} · ${body.message}`);
  return body;
}

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : String(e));

export default function EffectHome() {
  const [users, setUsers] = useState<User[]>([]);
  const [listError, setListError] = useState<string | null>(null);
  const [selected, setSelected] = useState<UserWithOrders | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function loadUsers() {
    try {
      setUsers(await fetchJson<User[]>("/api/users-effect"));
      setListError(null);
    } catch (e) {
      setListError(errorMessage(e));
    }
  }

  async function openUser(id: string) {
    setLoadingId(id);
    setSelected(null);
    setDetailError(null);
    try {
      setSelected(await fetchJson<UserWithOrders>(`/api/users-effect/${id}`));
    } catch (e) {
      setDetailError(errorMessage(e));
    } finally {
      setLoadingId(null);
    }
  }

  useEffect(() => {
    fetchJson<User[]>("/api/users-effect").then(setUsers, (e) => setListError(errorMessage(e)));
  }, []);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-12 font-sans">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-violet-600 dark:text-violet-400">Effect 4</p>
      <h1 className="text-3xl font-bold">Utilisateurs</h1>
      <p className="mt-1 text-zinc-500">
        <code className="font-mono">GET /api/users-effect</code> puis <code className="font-mono">GET /api/users-effect/:id</code>
      </p>
      <Link href="/" className="mt-2 inline-block text-sm text-zinc-500 underline">
        ← Comparer avec la version async/await
      </Link>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <section>
          {listError && (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {listError}{" "}
              <button type="button" className="underline" onClick={loadUsers}>
                Réessayer
              </button>
            </p>
          )}
          {!listError && users.length === 0 && <p className="text-zinc-500">Chargement…</p>}

          {users.length > 0 && (
            <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {users.map((user) => (
                <li key={user.id}>
                  <button
                    type="button"
                    onClick={() => openUser(String(user.id))}
                    className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  >
                    <span className="font-medium">{user.name}</span>
                    <span className="text-sm text-zinc-500">{user.email}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <p className="mt-4 text-sm text-zinc-500">
            Tester les erreurs :{" "}
            <button type="button" className="font-mono underline" onClick={() => openUser("42")}>
              /api/users-effect/42
            </button>{" "}
            ·{" "}
            <button type="button" className="font-mono underline" onClick={() => openUser("abc")}>
              /api/users-effect/abc
            </button>
          </p>
        </section>

        <section className="rounded-xl border border-zinc-200 p-5 dark:border-zinc-800">
          {!selected && !detailError && !loadingId && (
            <p className="text-zinc-500">Clique sur un utilisateur pour voir ses commandes.</p>
          )}
          {loadingId && <p className="text-zinc-500">Chargement de /api/users-effect/{loadingId}…</p>}
          {detailError && <p className="font-mono text-sm text-red-600 dark:text-red-400">{detailError}</p>}

          {selected && (
            <>
              <h2 className="text-xl font-semibold">{selected.name}</h2>
              <p className="text-sm text-zinc-500">{selected.email}</p>
              <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-zinc-500">Commandes</h3>
              {selected.orders.length === 0 ? (
                <p className="mt-2 text-zinc-500">Aucune commande.</p>
              ) : (
                <ul className="mt-2 space-y-1">
                  {selected.orders.map((order) => (
                    <li key={order.id} className="flex justify-between">
                      <span>{order.product}</span>
                      <span className="font-mono">{order.total.toFixed(2)} €</span>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
