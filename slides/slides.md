---
theme: default
title: Effect-TS — la gestion d'erreurs, enfin typée
info: |
  Présentation Effect-TS basée sur les tutoriels 01 à 05 de ce dépôt.
class: text-center
transition: slide-left
mdc: true
lineNumbers: true
---

# Effect-TS

La gestion d'erreurs, enfin typée

<div class="abs-br m-6 text-sm opacity-50">
  effect 4.0
</div>

<!--
Notes du présentateur : visibles dans le mode présentateur (touche "p" ou /presenter).
-->

---
layout: section
---

# Pourquoi ?

Codes d'erreur → exceptions → checked exceptions → `Result` → **Effect**

---

# Le problème

```ts
async function getUser(id: string): Promise<User> {
  // Quelles erreurs peut-on recevoir ici ? 🤷
}
```

- La signature **ment** : les erreurs ne sont pas dans le type
- `try / catch` reçoit un `unknown`
- Rien n'oblige l'appelant à gérer les cas d'échec

---
layout: section
---

# Tutorial 01 — try/catch vs neverthrow

---

# Tutorial 01

<<< @/../tutorial01/script.ts ts {all}{maxHeight:'400px'}

---
layout: section
---

# Tutorial 02 — Premiers pas avec Effect

---

# `Effect<A, E, R>`

| Paramètre | Signification            |
| --------- | ------------------------ |
| `A`       | Valeur de succès         |
| `E`       | Erreurs possibles (typées) |
| `R`       | Dépendances requises     |

<<< @/../tutorial02/script.ts ts {all}{maxHeight:'300px'}

---
layout: section
---

# Tutorial 03 — Schema et Config

---

# Tutorial 03

<<< @/../tutorial03/script.ts ts {all}{maxHeight:'400px'}

---
layout: section
---

# Tutorial 04 — Application complète

Services, Layers, Postgres et mock

---

# Tutorial 04

<<< @/../tutorial04/user-repository.ts ts {all}{maxHeight:'400px'}

---
layout: section
---

# Tutorial 05 — Express vs Effect

---
layout: two-cols-header
layoutClass: gap-4
---

# Classique vs Effect

::left::

<<< @/../tutorial05/classic-server.ts ts {all}{maxHeight:'350px'}

::right::

<<< @/../tutorial05/effect-server.ts ts {all}{maxHeight:'350px'}

---
layout: center
class: text-center
---

# Merci !

[effect.website](https://effect.website) · [sli.dev](https://sli.dev)
