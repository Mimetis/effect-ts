---
theme: default
title: "Effect 4 : du TypeScript qui ne ment plus"
info: |
  Effect expliqué aux développeurs qui ne le connaissent pas.
  Les slides marquées ▶ sont exécutables : on modifie le code et on relance.
author: Sébastien Pertus
highlighter: shiki
twoslash: true
lineNumbers: false
transition: slide-left
mdc: true
monacoTypesSource: local
colorSchema: auto
drawings:
  persist: false
class: text-center
---

<div class="cover-kicker">DevFest Toulouse 2026</div>

# Effect 4
## Du TypeScript qui ne ment plus

La gestion d'erreurs (et tout le reste), enfin typée

<div class="tech-prompt mt-6">pnpm add effect</div>

<div class="cover-author">
  <div class="cover-avatar"><img src="./images/sebastien_pertus.jpg" alt="Sébastien Pertus" /></div>
  <span>Sébastien Pertus</span>
</div>

<div class="abs-br m-6 text-sm opacity-50 font-mono">
  effect 4.0
</div>

<style>
.slidev-layout.cover h1 {
  width: fit-content;
  margin: 0 auto 0.25rem;
  font-size: 5.5rem;
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  background: var(--tech-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.slidev-layout.cover h2 {
  font-size: 2.1rem;
  font-weight: 600;
  color: var(--tech-fg-strong);
}
.slidev-layout.cover h2 + p {
  margin-top: 0.6rem;
  color: var(--tech-muted);
}
.cover-kicker {
  width: fit-content;
  margin: 0 auto 1.2rem;
  padding: 0.2rem 0.9rem;
  border: 1px solid var(--tech-border);
  border-radius: 999px;
  background: var(--tech-code-bg);
  font-family: var(--tech-font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--tech-cyan);
}
.cover-author {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.7rem;
  margin-top: 2rem;
  font-weight: 600;
  color: var(--tech-fg-strong);
}
.cover-avatar {
  width: 2.6rem;
  height: 2.6rem;
  overflow: hidden;
  border-radius: 50%;
  box-shadow: 0 0 0 2px var(--tech-border);
}
.cover-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 30%;
  transform: scale(1.5);
  transform-origin: 50% 32%;
}
</style>

<!--
Accroche : "Qui a déjà eu un `undefined is not a function` en prod un vendredi soir ?"
-->

---
layout: two-cols
layoutClass: gap-10
---

# Qui suis-je ?

<div class="flex items-center gap-5 mb-3">
  <div class="flex-none rounded-full overflow-hidden shadow-lg ring-2 ring-gray-400/30" style="width: 6rem; height: 6rem">
    <img src="./images/sebastien_pertus.jpg" alt="Sébastien Pertus" style="width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; transform: scale(1.5); transform-origin: 50% 32%" />
  </div>
  <div>
    <div class="text-2xl font-bold">Sébastien Pertus</div>
    <div class="opacity-80">Senior Software Engineer @ <b>Microsoft Frontier Company</b></div>
  </div>
</div>

Des ingénieurs Microsoft **intégrés chez nos clients** pour concevoir, déployer et faire tourner l'IA en production.

<div class="flex gap-5 text-sm mt-2">
  <a href="https://github.com/mimetis" class="flex items-center gap-1"><div class="i-carbon-logo-github" /> mimetis</a>
  <a href="https://www.linkedin.com/in/sebastienpertus" class="flex items-center gap-1"><div class="i-carbon-logo-linkedin" /> sebastienpertus</a>
</div>

<div class="mt-5 text-xs uppercase tracking-widest opacity-60">Ces dernières années, aux côtés de</div>
<div class="grid grid-cols-3 gap-3 mt-2">
  <div class="h-11 flex items-center justify-center rounded-md bg-white px-3 py-2 shadow-sm"><img src="./images/logos/kuka.svg" alt="KUKA" class="max-h-full max-w-full object-contain" /></div>
  <div class="h-11 flex items-center justify-center rounded-md bg-white px-3 py-2 shadow-sm"><img src="./images/logos/coca-cola.svg" alt="Coca-Cola" class="max-h-full max-w-full object-contain" /></div>
  <div class="h-11 flex items-center justify-center rounded-md bg-white px-3 py-1 shadow-sm"><img src="./images/logos/pg.svg" alt="P&amp;G" class="max-h-full max-w-full object-contain" /></div>
  <div class="h-11 flex items-center justify-center rounded-md bg-white px-3 py-2 shadow-sm"><img src="./images/logos/cdiscount.png" alt="Cdiscount" class="max-h-full max-w-full object-contain" /></div>
  <div class="h-11 flex items-center justify-center rounded-md bg-white px-3 py-2 shadow-sm"><span class="text-gray-800 font-bold tracking-[0.2em] text-sm">MULLIEZ</span></div>
  <div class="h-11 flex items-center justify-center rounded-md bg-white px-3 py-2 shadow-sm"><img src="./images/logos/lvmh.svg" alt="LVMH" class="max-h-full max-w-full object-contain" /></div>
</div>

::right::

<div class="h-full flex flex-col justify-center">
  <img src="./images/microsoft_frontier.png" alt="Microsoft Frontier Company : AI engineering that amplifies and protects your intelligence" class="rounded-lg shadow-xl" />
  <div class="mt-3 text-xs opacity-60 text-center">
    <a href="https://www.microsoft.com/en-us/frontier-company">microsoft.com/frontier-company</a>
  </div>
</div>

<!--
Rester très court.
Frontier Company : modèle « Forward Deployed Engineering », des ingénieurs Microsoft embarqués chez le client, orientés résultats mesurables.
Annonce : « Microsoft Frontier Company: AI engineering that amplifies and protects your intelligence », Judson Althoff, 2 juillet 2026.
-->
---
zoom: 0.9
---

# Ils en parlent

Quelques voix de la communauté TypeScript, sur X

<div class="tweets">
  <div class="tweet tweet-main">
    <div class="tweet-head">
      <img class="tweet-avatar" src="./images/avatars/mattpocockuk.jpg" alt="Matt Pocock" />
      <div><b>Matt Pocock</b><small>@mattpocockuk · Total TypeScript</small></div>
      <div class="i-carbon-logo-x tweet-x" />
    </div>
    <p>It used to be "use TS, not JS".<br>Now, for backend, it's <b>"use Effect, not just TS"</b>.</p>
    <p>Took a long time for me to drop my scepticism but I 100% agree with Dillon.</p>
    <div class="tweet-quote">
      <div class="tweet-head">
        <img class="tweet-avatar tweet-avatar-sm" src="./images/avatars/dillon_mulroy.jpg" alt="Dillon Mulroy" />
        <div><b>Dillon Mulroy</b><small>@dillon_mulroy</small></div>
      </div>
      <p>i'm confident in saying that i will never start another typescript application or project without <span class="tweet-at">@EffectTS_</span></p>
      <div class="tweet-foot"><span>1 sept. 2026</span><span class="tweet-likes"><span class="i-carbon-favorite" />2,1 k</span></div>
    </div>
    <div class="tweet-foot"><span>sept. 2026</span></div>
  </div>
  <div class="tweet">
    <div class="tweet-head">
      <img class="tweet-avatar" src="./images/avatars/rhyssullivan.jpg" alt="Rhys Sullivan" />
      <div><b>Rhys Sullivan</b><small>@RhysSullivan</small></div>
      <div class="i-carbon-logo-x tweet-x" />
    </div>
    <p>Answer Overflow is fully written in Effect now &amp; supporting <b>1.5M monthly active users</b></p>
    <div class="tweet-foot"><span>mars 2026</span><span class="tweet-likes"><span class="i-carbon-favorite" />224</span></div>
  </div>
  <div class="tweet">
    <div class="tweet-head">
      <img class="tweet-avatar" src="./images/avatars/jullerino.jpg" alt="Julius Marminge" />
      <div><b>Julius Marminge</b><small>@jullerino · T3 Code</small></div>
      <div class="i-carbon-logo-x tweet-x" />
    </div>
    <p><b>T3 Code is built pretty much entirely with Effect</b> and very large portions agent coded without much context engineering.</p>
    <div class="tweet-ctx">L'app open source de <b>Theo</b> (t3.gg)</div>
    <div class="tweet-foot"><span>17 mars 2026</span><span class="tweet-likes"><span class="i-carbon-favorite" />474</span></div>
  </div>
  <div class="tweet">
    <div class="tweet-head">
      <img class="tweet-avatar" src="./images/avatars/theprimeagen.jpg" alt="ThePrimeagen" />
      <div><b>ThePrimeagen</b><small>@ThePrimeagen</small></div>
      <div class="i-carbon-logo-x tweet-x" />
    </div>
    <p>fine, you convinced me teej... <b>ill try it</b></p>
    <div class="tweet-ctx">Suivi de 2 h de live sur Effect v4</div>
    <div class="tweet-foot"><span>12 mars 2026</span><span class="tweet-likes"><span class="i-carbon-favorite" />1,1 k</span></div>
  </div>
  <div class="tweet">
    <div class="tweet-head">
      <img class="tweet-avatar" src="./images/avatars/theo.jpg" alt="Theo Browne" />
      <div><b>Theo - t3.gg</b><small>@theo</small></div>
      <div class="i-carbon-logo-x tweet-x" />
    </div>
    <p>Been using Effect for like a week and <b>I'm already filing PRs</b></p>
    <div class="tweet-foot"><span>28 juil. 2026</span><span class="tweet-likes"><span class="i-carbon-favorite" />1,1 k</span></div>
  </div>
</div>

<style>
.tweets {
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr;
  gap: 0.9rem;
  margin-top: 0.4rem;
  font-family: system-ui, sans-serif;
}
.tweet {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.8rem 1rem;
  border: 1px solid var(--tech-border);
  border-radius: 14px;
  background: var(--tech-code-bg);
  font-size: 0.82rem;
  line-height: 1.4;
}
.tweet-main {
  grid-row: span 2;
  border: 2px solid transparent;
  background:
    linear-gradient(var(--tech-code-bg), var(--tech-code-bg)) padding-box,
    var(--tech-gradient) border-box;
  font-size: 0.92rem;
}
.tweet p {
  margin: 0;
  color: var(--tech-fg-strong);
}
.tweet-head {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.tweet-head b {
  display: block;
  font-weight: 700;
  line-height: 1.2;
  color: var(--tech-fg-strong);
}
.tweet-head small {
  display: block;
  font-size: 0.72rem;
  color: var(--tech-muted);
}
.tweet-avatar {
  flex: none;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 0 0 1px var(--tech-border);
}
.tweet-avatar-sm {
  width: 1.8rem;
  height: 1.8rem;
}
.tweet-x {
  margin-left: auto;
  align-self: flex-start;
  font-size: 1rem;
  color: var(--tech-fg-strong);
}
.tweet-at {
  color: #1d9bf0;
}
.tweet-ctx {
  padding: 0.3rem 0.6rem;
  border-radius: 8px;
  background: color-mix(in srgb, var(--tech-blue) 10%, transparent);
  font-size: 0.72rem;
  color: var(--tech-muted);
}
.tweet-quote {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.7rem 0.9rem;
  border: 1px solid var(--tech-border);
  border-radius: 12px;
  font-size: 0.85rem;
}
.tweet-foot {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: auto;
  font-size: 0.72rem;
  color: var(--tech-muted);
}
.tweet-likes {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: #f91880;
}
</style>

<!--
Ne pas tout lire : laisser le public lire, commenter Matt Pocock (le prof de TypeScript le plus suivi) qui reprend Dillon Mulroy.
Rhys Sullivan : Effect en prod à 1,5 M d'utilisateurs actifs par mois.
T3 Code (l'app de Theo, plus de 20 000 étoiles) : écrite quasi entièrement en Effect, en grande partie par des agents.
ThePrimeagen : « teej » = TJ DeVries, qui l'a convaincu ; il a ensuite appris Effect v4 en live (et trouvé la syntaxe des générateurs « cursed »).
Finir sur Theo (T3 Stack, T3 Code) : une semaine d'Effect et il envoie déjà des PR.

Sources :
- Dillon Mulroy, 1er sept. 2026 (2,1 k likes, 87 réponses), repris par Matt Pocock en quote tweet : cités dans « This Week in Effect 134 » (effect.website/blog/this-week-in-effect/134).
- Rhys Sullivan, mars 2026 : « fully written in Effect now & supporting 1.5M monthly active users ».
- Theo (@theo), 28 juil. 2026 (1,1 k likes, 44 réponses) : « This Week in Effect 129 » (x.com/theo/status/2082006488797856093).
- ThePrimeagen, 12 mars 2026 (1,1 k likes, 39 réponses) : « This Week in Effect 109 » (x.com/ThePrimeagen/status/2031885878633648369).
- Julius Marminge (@jullerino), 17 mars 2026 (474 likes) : « This Week in Effect 110 ».
- Portraits : photos de profil X (via unavatar.io), stockées dans images/avatars. Comptes @RhysSullivan, @ThePrimeagen, @jullerino et @theo confirmés par leurs profils GitHub.
-->


---
class: aer-hero
---

<div class="aer-kicker">Toute la prez tient en un type</div>

<div class="aer-big">
  <span class="aer-w">Effect</span><span class="aer-p">&lt;</span><span class="a">A</span><span class="aer-p">, </span><span class="e">E</span><span class="aer-p">, </span><span class="r">R</span><span class="aer-p">&gt;</span>
</div>

<div class="aer-cards">
  <div v-click class="aer-card aer-a">
    <div class="aer-letter">A</div>
    <b>Le succès</b>
    <small>ce que ça renvoie… vraiment</small>
    <ul>
      <li>des données <b>validées</b> : <code>Schema</code></li>
      <li>une config vérifiée : <code>Config</code></li>
    </ul>
  </div>
  <div v-click class="aer-card aer-e">
    <div class="aer-letter">E</div>
    <b>Les erreurs</b>
    <small>comment ça peut échouer</small>
    <ul>
      <li><b>dans le type</b>, plus de <code>unknown</code></li>
      <li>traitées par leur nom : <code>catchTag</code></li>
      <li><code>retry</code>, <code>timeout</code></li>
    </ul>
  </div>
  <div v-click class="aer-card aer-r">
    <div class="aer-letter">R</div>
    <b>Les dépendances</b>
    <small>de quoi ça a besoin</small>
    <ul>
      <li>des <b>services</b> injectés : <code>Layer</code></li>
      <li>oubli = erreur de <b>compilation</b></li>
      <li>tests sans mock maison</li>
    </ul>
  </div>
</div>

<div v-click class="aer-punch">
  Le compilateur sait <b>ce que ça renvoie</b>, <b>comment ça échoue</b> et <b>de quoi ça a besoin</b>.
  <span>Le reste (concurrence, annulation, retry…) est <b>intégré</b>.</span>
</div>

<style>
.slidev-layout.aer-hero {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.aer-kicker {
  font-family: var(--tech-font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--tech-cyan);
}
.aer-big {
  margin: 0.1rem 0 1.1rem;
  font-family: var(--tech-font-mono);
  font-size: 6.2rem;
  font-weight: 800;
  line-height: 1.05;
  letter-spacing: -0.04em;
  white-space: nowrap;
}
.aer-w {
  background: var(--tech-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.aer-p {
  color: var(--tech-muted);
  font-weight: 600;
}
.aer-big .a, .aer-a .aer-letter { color: var(--tech-green); }
.aer-big .e, .aer-e .aer-letter { color: var(--tech-red); }
.aer-big .r, .aer-r .aer-letter { color: var(--tech-blue); }
.aer-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  width: 100%;
  text-align: left;
}
.aer-card {
  position: relative;
  padding: 0.7rem 1rem 0.6rem 3.4rem;
  border: 1px solid var(--tech-border);
  border-top: 4px solid;
  border-radius: 12px;
  background: var(--tech-code-bg);
}
.aer-a { border-top-color: var(--tech-green); }
.aer-e { border-top-color: var(--tech-red); }
.aer-r { border-top-color: var(--tech-blue); }
.aer-letter {
  position: absolute;
  left: 0.9rem;
  top: 0.45rem;
  font-family: var(--tech-font-mono);
  font-size: 2rem;
  font-weight: 800;
}
.aer-card > b {
  display: block;
  font-size: 1.05rem;
  color: var(--tech-fg-strong);
}
.aer-card > small {
  display: block;
  color: var(--tech-muted);
}
.slidev-layout .aer-card ul {
  margin: 0.45rem 0 0;
  padding-left: 1rem;
  font-size: 0.82rem;
  line-height: 1.5;
}
.slidev-layout .aer-card li {
  margin: 0;
}
.aer-punch {
  margin-top: 1rem;
  padding: 0.5rem 1.2rem;
  border: 2px solid transparent;
  border-radius: 12px;
  background:
    linear-gradient(var(--tech-code-bg), var(--tech-code-bg)) padding-box,
    var(--tech-gradient) border-box;
  font-size: 1rem;
}
.aer-punch span {
  display: block;
  font-size: 0.85rem;
  color: var(--tech-muted);
}
</style>

<!--
La slide « titre » du talk : tout ce qu'on va voir tient dans ce type.
Laisser le type seul quelques secondes : Effect, puis trois paramètres. C'est tout ce qu'il faut retenir.
Clic 1, A : ce que ça renvoie. Avec une Promise, on croit le savoir ; avec Effect, on le valide (Schema, Config).
Clic 2, E : comment ça peut échouer. Les erreurs sont dans le type, on les traite par leur nom, et on résiste (retry, timeout).
Clic 3, R : de quoi ça a besoin. Les dépendances sont dans le type : oublier de les fournir ne compile pas, et on les remplace facilement en test.
Clic 4 : la promesse du talk. Le compilateur connaît les trois… et tout ce qui manque à une Promise est déjà dans la boîte.
Transition : mais d'abord, pourquoi gérer les erreurs est un problème si vieux…
-->

---

# Gérer les erreurs : un éternel recommencement

Chaque solution corrige le défaut de la précédente… et en crée un nouveau

<div class="tl">
  <div class="tl-row tl-head">
    <span>Approche</span><span>À quoi ça ressemble</span><span>✅ On gagne</span><span>❌ Mais…</span>
  </div>
  <div v-click class="tl-row">
    <div class="tl-name">🔢 Codes d'erreur<small>C, POSIX</small></div>
    <code>const fd = open(path) // -1 ?</code>
    <span>Simple et explicite</span>
    <span>Rien n'oblige à vérifier : on <b>oublie</b>, le bug passe en silence</span>
  </div>
  <div v-click class="tl-row">
    <div class="tl-name">💥 Exceptions<small>C++, Java, JS, C#</small></div>
    <code>throw new Error("boom")</code>
    <span>Impossible d'ignorer l'erreur</span>
    <span><b>Invisible</b> dans la signature : on le découvre en prod</span>
  </div>
  <div v-click class="tl-row">
    <div class="tl-name">☕ Checked exceptions<small>Java</small></div>
    <code>User load() throws IOException</code>
    <span>L'erreur est dans la signature</span>
    <span><code>throws</code> partout… alors on écrit <code>catch (e) {}</code></span>
  </div>
  <div v-click class="tl-row">
    <div class="tl-name">📦 Result / Either<small>Rust, Go, neverthrow</small></div>
    <code>Result&lt;User, NotFound&gt;</code>
    <span>Erreur <b>typée</b>, retournée comme une valeur</span>
    <span>Async, retry, timeout, dépendances : <b>tout à la main</b></span>
  </div>
  <div v-click class="tl-row tl-effect">
    <div class="tl-name">✨ Effect<small>TypeScript</small></div>
    <code>Effect&lt;User, NotFound, Db&gt;</code>
    <span>Erreurs <b>et</b> dépendances typées</span>
    <span>➕ Retry, timeout, concurrence… <b>intégrés</b></span>
  </div>
</div>

<!--
Lire chaque ligne de gauche à droite : le "Mais…" d'une ligne est exactement ce que la ligne suivante essaie de corriger.
Codes d'erreur → on oublie de vérifier. Exceptions → on ne peut plus oublier, mais on ne sait plus ce qui peut échouer.
Checked exceptions → on le sait, mais c'est si lourd qu'on finit par tout avaler. Result → typé et léger, mais tout le reste est à faire soi-même.
Effect garde le "typé" de Result et ajoute ce qui manquait.
-->

---
zoom: 0.75
---

# ▶ Effect, c'est quoi ?

Une librairie TypeScript qui **regroupe la gestion des erreurs et des dépendances** à travers les appels successifs de vos fonctions.

<div class="wie-head">
  <div class="wie-sig">Effect&lt;<span class="a">A</span>, <span class="e">E</span>, <span class="r">R</span>&gt;</div>
  <div class="wie-aer">
    <div class="wie-a"><b>A · succès</b>ce que ça renvoie</div>
    <div class="wie-e"><b>E · erreurs</b>comment ça peut échouer</div>
    <div class="wie-r"><b>R · dépendances</b>de quoi ça a besoin</div>
  </div>
</div>

<div class="grid grid-cols-[1fr_1.2fr] gap-6">
<div class="wie-code">

```ts 
// Promise : le succès… les erreurs ? les dépendances ? 🤷
declare const getUser: (id: number) => 
   Promise<User>
declare const getOrders: (user: User) => 
   Promise<Order[]>

// Effect : le succès, les erreurs ET les dépendances
declare const getUser: (id: number) =>
  Effect<User, UserNotFound, UserRepository>
declare const getOrders: (user: User) =>
  Effect<Order[], DbError, OrderRepository>
```

</div>
<div  v-click >

```ts {monaco-run} {autorun: false}
import { Data, Effect } from "effect"

// Un effect qui ne peut echouer
const hello = Effect.succeed("Hello DevFest")

// un effect qui échoue toujours et ne renvoie jamais de valeur
const boom = Effect.fail("Oups")

// Un résultat (number) ET une erreur possible (DivisionByZero)
class DivisionByZero extends Data.TaggedError("DivisionByZero") {}

const divide = (a: number, b: number): Effect.Effect<number, DivisionByZero> =>
  b === 0 ? Effect.fail(new DivisionByZero()) : Effect.succeed(a / b)

console.log("— rien n'a encore été exécuté —")

console.log(Effect.runSync(hello))
console.log(Effect.runSyncExit(boom))
console.log(Effect.runSyncExit(divide(10, 2)))
console.log(Effect.runSyncExit(divide(10, 0)))
```

</div>
</div>

<style>
.wie-head {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin: 0.9rem 0 0.7rem;
}
.wie-sig {
  font-family: var(--tech-font-mono);
  font-size: 2rem;
  font-weight: 700;
  white-space: nowrap;
  color: var(--tech-fg-strong);
}
.wie-aer {
  display: flex;
  gap: 0.6rem;
}
.wie-aer > div {
  display: flex;
  flex-direction: column;
  padding: 0.3rem 0.8rem;
  border: 1px solid var(--tech-border);
  border-left: 4px solid;
  border-radius: 8px;
  background: var(--tech-code-bg);
  font-size: 0.8rem;
  color: var(--tech-muted);
}
.wie-aer b {
  font-family: var(--tech-font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.wie-sig .a, .wie-a b { color: var(--tech-green); }
.wie-sig .e, .wie-e b { color: var(--tech-red); }
.wie-sig .r, .wie-r b { color: var(--tech-blue); }
.wie-a { border-left-color: var(--tech-green) !important; }
.wie-e { border-left-color: var(--tech-red) !important; }
.wie-r { border-left-color: var(--tech-blue) !important; }
.wie-code {
  --slidev-code-font-size: 15px;
  --slidev-code-line-height: 23px;
}
</style>

<!--
L'idée en une phrase : chaque fonction annonce ce qu'elle renvoie (A), comment elle peut échouer (E) et de quoi elle a besoin (R).
À gauche, les deux mêmes fonctions déclarées deux fois. D'abord en Promise : le type ne parle que du succès. Les erreurs et les dépendances existent toujours… mais restent invisibles.
Clic : la version Effect. Mêmes fonctions, mais le type dit tout : UserNotFound / DbError en E, UserRepository / OrderRepository en R. Sur le slide, Effect<…> est abrégé : dans le vrai code, c'est Effect.Effect<…>.
À droite (▶), un premier Effect : Effect.succeed réussit, Effect.fail échoue. Survoler hello et boom : l'erreur est dans le type. E vaut never quand rien ne peut échouer ; A vaut never quand rien ne peut réussir.
divide : la signature dit tout. Comparer avec `(a, b) => number`, qui peut renvoyer Infinity ou lever une exception sans prévenir.
Un Effect est une description (la recette, pas le plat) : « rien n'a encore été exécuté » s'affiche avant les résultats, rien ne tourne avant run*. Donc on peut le rejouer (retry), l'interrompre, le limiter… sans toucher à son code. Une Promise, elle, est déjà lancée.
Essayer Effect.runSync(boom) : ça lève une exception, d'où runSyncExit.
Rebondir sur Matt Pocock (slide précédente) : « use TS, not JS » → « use Effect, not just TS ». Même promesse : attraper les bugs à la compilation plutôt qu'en prod.
-->

---
zoom: 0.85
---

# ▶ ① Un premier Effect : `Effect.succeed`

<div class="grid grid-cols-[1fr_1.6fr] gap-6">
<div>

On part d'un `getUser` classique :

```ts
async function getUser(id: number): Promise<User> {
  return api.find((user) => user.id === id) as User // 🙈
}
```

- `Promise<User>` **promet** un `User`… même s'il n'existe pas
- `Effect.succeed` : un Effect qui **réussit** avec une valeur
- `runSync` : on **exécute** l'Effect

<div class="tuto-sig">
  <small>getUser renvoie</small>
  <b class="a">A</b><span class="is-new">User | undefined</span>
  <b class="e">E</b><span>never</span>
  <b class="r">R</b><span>never</span>
</div>

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Effect } from "effect"
type User = { id: number; name: string; createdAt: Date }

// Ce que renvoie l'API : un tableau d'utilisateurs
const api = [
  { id: 1, name: "Ada", createdAt: new Date("1815-12-10") },
  { id: 2, name: "Grace", createdAt: new Date("1906-12-09") },
]

const getUser = (id: number) =>
  Effect.succeed(api.find((user) => user.id === id) as User)

const userEffect = getUser(1)

const user = Effect.runSync(userEffect) // ▶ on l'exécute
console.log(user)
```

</div>
</div>

<!--
On repart de zéro, avec un seul exemple qu'on va faire grandir sur 9 slides : un getUser qui cherche un utilisateur dans ce que renvoie une API (un tableau de User).
À gauche, la version classique : Promise<User> promet un User, et le `as User` fait taire TypeScript… alors que find peut ne rien trouver.
Effect.succeed : on met le résultat de la recherche dans un Effect. Survoler getUser : Effect<User | undefined, never, never>.
A = User | undefined : c'est la vérité, l'utilisateur peut ne pas exister. E = never : rien ne peut échouer (pour l'instant). R = never : aucune dépendance.
runSync exécute l'Effect et renvoie la valeur. On ne l'appelle qu'une fois, au bord du programme.
Essayer getUser(3) : undefined, sans la moindre erreur. Un utilisateur absent n'est pas un succès : c'est ce qu'on règle au ②.
-->

---
zoom: 0.8
---

# ▶ Et avec `try / catch` ?

<div class="grid grid-cols-[1fr_2.2fr] gap-6">
<div>

- `Promise<User>` ne dit **rien** des erreurs : rien n'oblige à écrire le `try`
- Dans le `catch`, `e` est `unknown` : on trie **à la main** (`instanceof`)
- Le `catch` attrape **tout** : nos erreurs… et nos **bugs**
- On peut `throw` **n'importe quoi** : une `string`, un objet…

<div v-click class="mt-6">
  <div class="fake-alert">
    <div class="fake-alert__title">localhost:3000 indique</div>
    <div class="fake-alert__msg">Error: [object Object]</div>
    <div class="fake-alert__actions"><span>OK</span></div>
  </div>
  <div class="mt-4 text-center text-sm opacity-70">🏆 Le message d'erreur le plus célèbre du web.<br>Cherchez l'erreur. <b>Littéralement.</b></div>
</div>

</div>
<div>

```ts {monaco-run} {autorun: false}
type User = { id: number; name: string; createdAt: Date }
class UserNotFound extends Error {}

// Ce que renvoie l'API : un tableau d'utilisateurs
const api = [
  { id: 1, name: "Ada", createdAt: new Date("1815-12-10") },
  { id: 2, name: "Grace", createdAt: new Date("1906-12-09") },
]

// La signature promet un User… et ne dit rien des erreurs
async function getUser(id: number): Promise<User> {
  if (id <= 0) throw { status: 400 } // on peut throw… n'importe quoi
  const user = api.find((user) => user.id === id)
  if (user === undefined) throw new UserNotFound(`User ${id} introuvable`)
  return user
}

for (const id of [1, 3]) {
  try {
    const user = await getUser(id)
    console.log("✅", user.name.toUpperCase())
  } catch (e) { // 👈 survolez e : unknown
    if (e instanceof UserNotFound) console.log("🔍", e.message)
    else console.log(`💥 Erreur non gérée : ${e}`) // 😬 le toast.error()
  }
}
```

</div>
</div>

<!--
Le même getUser qu'au ①, avec la même API (un tableau de User), écrit en async / await avec un try / catch. Lancer : les 3 cas tombent dans le même catch.
Ada (1) : ce n'est pas une erreur métier, c'est un bug. « Ada » n'a pas de nom de famille : split(" ")[1] vaut undefined, et toUpperCase lève un TypeError (TypeScript ne dit rien : un index de tableau est typé string). Le catch l'attrape comme le reste, et on l'affiche comme une erreur « non gérée ».
3 : UserNotFound, mais il faut le trier avec instanceof, et rien dans la signature ne dit que getUser peut le lever.
0 : un objet jeté tel quel (comme le JSON d'une API). `${e}` appelle String(e) : « [object Object] ». Une erreur, aucune information.
Survoler e : unknown. Survoler getUser : Promise<User>, aucune trace des erreurs. Supprimer le try / catch : TypeScript ne dit rien.
Transition : le slide suivant reprend chacun de ces problèmes… et le corrige grâce au type de l'erreur.
-->

---
zoom: 0.72
---

# ▶ ③ L'erreur est un type : `catchTag`

<div class="grid grid-cols-[1.1fr_1.5fr] gap-6">
<div>

Les problèmes du `try / catch`, corrigés **par le type** (`Effect.fail` + `Data.TaggedError`) :

<div class="fix">
    <span class="fix-ko">❌ <code>Promise&lt;User&gt;</code> : les erreurs ? 🤷</span>
    <span class="fix-ok">✅ <code>Effect&lt;User, UserNotFound&gt;</code> : l'erreur est <b>dans la signature</b></span>
    <span class="fix-ko">❌ <code>catch (e)</code> : <code>e</code> est <code>unknown</code>, trié avec <code>instanceof</code></span>
    <span class="fix-ok">✅ <code>e</code> est un <code>UserNotFound</code>, traité <b>par son nom</b></span>
    <span class="fix-ko">❌ le <code>catch</code> attrape <b>tout</b>, bugs compris</span>
    <span class="fix-ok">✅ <code>catchTag</code> n'attrape <b>que</b> <code>UserNotFound</code></span>
    <span class="fix-ko">❌ oublier le <code>try</code> : aucun avertissement</span>
    <span class="fix-ok">✅ une erreur non traitée <b>reste dans <code>E</code></b></span>
</div>

<div class="tuto-sig">
  <small>showUser renvoie</small>
  <b class="a">A</b><span>User | string</span>
  <b class="e">E</b><span class="is-new">never</span>
  <b class="r">R</b><span>never</span>
</div>

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Data, Effect } from "effect"
type User = { id: number; name: string; createdAt: Date }

// Ce que renvoie l'API : un tableau d'utilisateurs
const api = [
  { id: 1, name: "Ada", createdAt: new Date("1815-12-10") },
  { id: 2, name: "Grace", createdAt: new Date("1906-12-09") },
]

// 🆕 Une erreur typée : une classe avec un _tag
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> {}

// 🆕 L'erreur est dans la signature
const getUser = (id: number): Effect.Effect<User, UserNotFound> => {
  const user = api.find((user) => user.id === id)
  return user === undefined
    ? Effect.fail(new UserNotFound({ id })) // 🆕 un Effect qui échoue
    : Effect.succeed(user)
}

// 🆕 On traite l'erreur par son nom (son _tag)
const showUser = (id: number) =>
  Effect.catchTag(getUser(id), "UserNotFound", (e) => // 👈 survolez e
    Effect.succeed(`🔍 utilisateur ${e.id} introuvable`),
  )
// 👆 survolez showUser : E = never, plus rien à traiter

for (const id of [1, 3]) console.log(Effect.runSync(showUser(id)))
```

</div>
</div>

<style>
.fix {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0.6rem 0 0.2rem;
}
.fix-row {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  padding: 0.45rem 0.8rem;
  border: 1px solid var(--tech-border);
  border-left: 4px solid var(--tech-green);
  border-radius: 10px;
  background: var(--tech-code-bg);
  font-size: 0.82rem;
  line-height: 1.45;
}
.fix-ko {
  color: var(--tech-muted);
}
.fix-ok {
  color: var(--tech-fg-strong);
}
</style>

<!--
La correction du slide précédent, point par point : un clic par ligne. Même API, même type User qu'aux slides précédents.
Data.TaggedError : une classe d'erreur avec un _tag ("UserNotFound"), c'est par ce nom qu'on la traite.
Effect.fail est l'inverse d'Effect.succeed : un Effect qui échoue avec une valeur. C'est le throw d'Effect… mais l'erreur est dans le type : Effect<User, UserNotFound>.
La signature de getUser est annotée : sans annotation, TypeScript infère une union de deux Effects, illisible au survol. Avec Effect.gen (⑥), l'inférence se fera toute seule.
Effect.catchTag(effect, "UserNotFound", handler) : on traite l'erreur par son nom, sans pipe.
Survoler e : UserNotFound, avec son id. Ni unknown, ni instanceof, et pas de « [object Object] ».
Survoler showUser : E = never. Le compilateur sait que tout est traité. A = User | string : le User trouvé, ou le message (on transformera le User en texte avec map, au ⑤).
Changer "UserNotFound" en "UserNotFond" : erreur de compilation, ce tag n'existe pas dans E.
catchTag n'attrape que UserNotFound. Un bug (un TypeError) n'est pas une erreur attendue : il reste un défaut, visible comme tel, au lieu de se faire passer pour une erreur métier.
Demain, getUser ajoute une erreur à sa signature : elle apparaît dans le E de showUser, chez tous les appelants. Avec try / catch, personne n'est prévenu.
Lancer : 1 → Ada (un vrai User), 3 → « utilisateur 3 introuvable ».
-->

---
zoom: 0.66
---

# ▶ ④ Valider : `Schema`

<div class="grid grid-cols-[1fr_2.2fr] gap-6">
<div>

- L'API renvoie maintenant du **JSON** : des champs **inconnus**, et une date y est une `string`
- `Schema` décrit ce qu'on attend et **valide** le JSON
- `decodeUnknownEffect` **remplace** `Effect.succeed` : même forme, mais **vérifiée**
- `SchemaError` rejoint `E`, avec le **chemin** du champ fautif
- Le type `User` est **déduit** du schéma
- `catchTags` : une branche **par erreur**

<div class="tuto-sig">
  <small>getUser renvoie</small>
  <b class="a">A</b><span class="is-new">User</span>
  <b class="e">E</b><span>UserNotFound | <span class="is-new">SchemaError</span></span>
  <b class="r">R</b><span>never</span>
</div>

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Data, Effect, Schema } from "effect"

// 🆕 L'API renvoie du JSON : des objets dont on ne connaît pas les champs
const api: Array<Record<string, unknown>> = [
  { id: 1, name: "Ada", createdAt: "1815-12-10" }, // 👈 en JSON, une date est une string
  { id: 2, name: "Grace", createdAt: "hier" }, // 👈 données invalides
]

class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> {}

// 🆕 Le schéma décrit ce qu'on attend… et le type User en est déduit
const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  createdAt: Schema.DateFromString, // "1815-12-10" → Date
})
type User = typeof User.Type

const getUser = (id: number): Effect.Effect<User, UserNotFound | Schema.SchemaError> => {
  const json = api.find((user) => user.id === id)
  return json === undefined
    ? Effect.fail(new UserNotFound({ id }))
    : Schema.decodeUnknownEffect(User)(json) // 🆕 à la place de Effect.succeed
}

const showUser = (id: number) =>
  Effect.catchTags(getUser(id), {
    UserNotFound: (e) => Effect.succeed(`🔍 utilisateur ${e.id} introuvable`),
    SchemaError: (e) => Effect.succeed(`🧨 ${e.message}`), // 🆕
  })

for (const id of [1, 2, 3]) console.log(Effect.runSync(showUser(id)))
```

</div>
</div>

<!--
Jusqu'ici, l'API renvoyait des User tout prêts. En vrai, elle renvoie du JSON : on ne connaît pas les champs (Record<string, unknown>), et une date y est une string, jamais une Date. Le `as User` des slides précédents mentirait.
Schema.Struct décrit la forme attendue ; DateFromString transforme la string en vraie Date.
type User = typeof User.Type : on n'écrit plus le type à la main, il est déduit du schéma.
Une seule ligne change dans getUser : Effect.succeed(user) devient Schema.decodeUnknownEffect(User)(json). Même forme, mais la valeur est vérifiée.
SchemaError rejoint E : on l'ajoute à la signature, et catchTags (une branche par erreur) le traite.
Lancer : 1 → un vrai User (createdAt est devenu une Date), 2 → SchemaError avec le chemin du champ fautif (["createdAt"]), 3 → UserNotFound.
Corriger "hier" en "1906-12-09" en direct : Grace passe. Mettre name: 42 : l'erreur pointe sur ["name"].
Supprimer la branche SchemaError : SchemaError réapparaît dans le type de showUser (survoler), et runSync lève l'erreur pour l'id 2.
-->

---
class: cmp-hero
---

<div class="cmp-kicker">Nouvelle partie</div>

# Composer des Effects

<div class="cmp-sub">Jusqu'ici, des <b>briques</b>. Maintenant, on les assemble en un <b>pipeline</b> :<br>c'est là qu'est <span class="cmp-power">la puissance d'Effect</span>.</div>

<div class="cmp-pipe">
  <div class="cmp-step"><code>getUser</code><small>chercher</small></div>
  <span v-click="1" class="cmp-arrow">→</span>
  <div v-click="1" class="cmp-step cmp-a"><code>Schema</code><small>valider</small></div>
  <span v-click="2" class="cmp-arrow">→</span>
  <div v-click="2" class="cmp-step cmp-e"><code>getCountry</code><small>enchaîner</small></div>
  <span v-click="3" class="cmp-arrow">→</span>
  <div v-click="3" class="cmp-step cmp-ok"><code>catchTags</code><small>traiter</small></div>
</div>

<div class="cmp-sig">
  <span class="cmp-sig-label">le type suit chaque étape</span>
  <div class="cmp-types">
    <code v-click.hide="1">Effect&lt;<span class="a">unknown</span>, <span class="e">UserNotFound</span>, <span class="r">never</span>&gt;</code>
    <code v-click="[1, 2]">Effect&lt;<span class="a">User</span>, <span class="e">UserNotFound | SchemaError</span>, <span class="r">never</span>&gt;</code>
    <code v-click="[2, 3]">Effect&lt;<span class="a">Country</span>, <span class="e">UserNotFound | SchemaError | CountryNotFound</span>, <span class="r">never</span>&gt;</code>
    <code v-click="3">Effect&lt;<span class="a">string</span>, <span class="e">never</span>, <span class="r">never</span>&gt; <span class="cmp-run">tout est traité ▶</span></code>
  </div>
</div>

<div v-click="4" class="cmp-next">
  <span>Pour assembler ces étapes, on va utiliser <code>pipe()</code></span>
</div>

<style>
.slidev-layout.cmp-hero {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.cmp-kicker {
  font-family: var(--tech-font-mono);
  font-size: 0.8rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--tech-cyan);
}
.slidev-layout.cmp-hero h1 {
  margin: 0.2rem 0 0.3rem;
  padding-bottom: 0.08em;
  font-size: 3.6rem;
  font-weight: 800;
  line-height: 1.2;
  background: var(--tech-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.cmp-sub {
  font-size: 1.15rem;
  color: var(--tech-muted);
}
.cmp-sub b {
  color: var(--tech-fg-strong);
}
.cmp-power {
  font-weight: 700;
  color: var(--tech-violet);
}
.cmp-pipe {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  margin: 1.6rem 0 1.2rem;
}
.cmp-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 6.6rem;
  padding: 0.55rem 0.7rem 0.45rem;
  border: 1px solid var(--tech-border);
  border-top: 4px solid var(--tech-muted);
  border-radius: 10px;
  background: var(--tech-code-bg);
}
.cmp-step code {
  font-size: 0.95rem;
  font-weight: 700;
}
.cmp-step small {
  margin-top: 0.15rem;
  font-size: 0.72rem;
  color: var(--tech-muted);
}
.cmp-a { border-top-color: var(--tech-green); }
.cmp-e { border-top-color: var(--tech-red); }
.cmp-ok { border-top-color: var(--tech-violet); }
.cmp-r { border-top-color: var(--tech-blue); }
.cmp-arrow {
  font-size: 1.5rem;
  color: var(--tech-muted);
}
.cmp-sig {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.45rem 1.2rem 0.55rem;
  border: 2px solid transparent;
  border-radius: 12px;
  background:
    linear-gradient(var(--tech-code-bg), var(--tech-code-bg)) padding-box,
    var(--tech-gradient) border-box;
}
.cmp-sig-label {
  font-family: var(--tech-font-mono);
  font-size: 0.66rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--tech-muted);
}
/* All the signatures share one grid cell: only the visible one takes space */
.cmp-types {
  display: grid;
  margin-top: 0.25rem;
}
.cmp-types > code {
  grid-area: 1 / 1;
  justify-self: center;
  font-size: 0.95rem;
  font-weight: 700;
  white-space: nowrap;
}
.cmp-sig .a { color: var(--tech-green); }
.cmp-sig .e { color: var(--tech-red); }
.cmp-sig .r { color: var(--tech-blue); }
.cmp-run {
  margin-left: 0.6rem;
  color: var(--tech-violet);
}
.cmp-next {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem 1.4rem;
  margin-top: 1.3rem;
  font-size: 0.9rem;
  color: var(--tech-muted);
}
</style>

<!--
Changement de rythme : jusqu'ici, on a vu des briques isolées (succeed, fail, catchTag, Schema). La force d'Effect, c'est de les assembler.
Chaque brique est un Effect ; chaque étape du pipeline prend un Effect et en renvoie un autre. Et le type suit tout seul.
Départ : getUser renvoie le JSON brut (unknown), ou échoue avec UserNotFound.
Clic 1 : Schema valide. A devient User, SchemaError rejoint E.
Clic 2 : getCountry, un autre Effect qui part du User. A devient Country, et CountryNotFound s'ajoute aux erreurs : elles s'additionnent toutes seules.
Clic 3 : catchTags traite chaque erreur par son nom. E redevient never : le compilateur sait que tout est traité.
Clic 4 : pour assembler ces étapes, on va utiliser pipe() : c'est le slide suivant.
Avec des Promise, le type resterait Promise<Country> du début à la fin, sans trace des trois erreurs possibles.
-->

---
zoom: 0.6
---

# ▶ ⑤ Composer : `pipe` et `flatMap`

<div class="grid grid-cols-[1fr_2.6fr] gap-6">
<div>

- `pipe()`, c'est comme le `|` en bash, vous avez tous déjà utilisé cette syntaxe :<br>`curl -fsSL https://bun.sh/install | bash`
- Chaque brique **annonce** ses erreurs : `getUser` → `UserNotFound | SchemaError`, `getCountry` → `CountryNotFound`
- `flatMap` : enchaîne un autre Effect… et **ajoute** ses erreurs au type
- Les erreurs sont **groupées** dans `E` : survolez `getUserCountry`
- `catchTags` : une branche **par erreur**, et `E` redevient `never`

<div class="tuto-sig">
  <small>getUserCountryName renvoie</small>
  <b class="a">A</b><span class="is-new">String</span>
  <b class="e">E</b><span>UserNotFound | SchemaError | <span class="is-new">CountryNotFound</span></span>
  <b class="r">R</b><span>never</span>
</div>

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Data, Effect, Schema } from "effect"

const api: Array<Record<string, unknown>> = [
  { id: 1, name: "Ada", createdAt: "1815-12-10", country: "GB" },
  { id: 2, name: "Grace", createdAt: "hier", country: "US" }, // 👈 données invalides
  { id: 3, name: "Linus", createdAt: "1969-12-28", country: "FI" }, // 👈 pays inconnu
]
type Country = { code: string; name: string }
const countries: Country[] = [{ code: "GB", name: "Royaume-Uni" }, { code: "US", name: "États-Unis" }]

class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> {}
class CountryNotFound extends Data.TaggedError("CountryNotFound")<{ code: string }> {} 
const UserSchema = Schema.Struct({ id: Schema.Number, name: Schema.String, createdAt: Schema.DateFromString, country: Schema.String })
type User = typeof UserSchema.Type

const getUser = (id: number): Effect.Effect<User, UserNotFound | Schema.SchemaError> => {
  const json = api.find((user) => user.id === id)
  return json === undefined ? Effect.fail(new UserNotFound({ id })) : Schema.decodeUnknownEffect(UserSchema)(json)
}
const getCountry = (user: User): Effect.Effect<Country, CountryNotFound> => { 
  const country = countries.find((country) => country.code === user.country)
  return country === undefined ? Effect.fail(new CountryNotFound({ code: user.country })) : Effect.succeed(country)
}

const getUserCountryName = (id: number) =>
  getUser(id).pipe(
    Effect.flatMap((user) => getCountry(user)), // + CountryNotFound
    Effect.map((country) => `✅ ${country.name}`),
  )

const showCountry = (id: number) =>
  getUserCountryName(id).pipe(
    Effect.catchTags({ // une branche par erreur
      UserNotFound: (e) => Effect.succeed(`🔍 utilisateur ${e.id} introuvable`),
      SchemaError: (e) => Effect.succeed(`🧨 ${e.message}`),
      CountryNotFound: (e) => Effect.succeed(`🌍 pays ${e.code} inconnu`),
    }),
  )

for (const id of [1, 2, 3, 4]) console.log(Effect.runSync(showCountry(id)))
```

</div>
</div>

<!--
Le pipeline du slide précédent, en vrai : getUser → Schema → getCountry → catchTags.
L'API a maintenant un champ country, et un troisième utilisateur, Linus, dont le pays n'est pas dans la liste.
Chaque brique annonce ses erreurs dans sa signature : getUser peut échouer avec UserNotFound, getCountry avec CountryNotFound.
pipe enchaîne les étapes de haut en bas, comme le | du terminal. flatMap enchaîne un autre Effect : son erreur s'ajoute à celles d'avant.
Survoler getUserCountry : Effect<Country, UserNotFound | SchemaError | CountryNotFound, never>. Personne n'a écrit cette union : elle est déduite étape par étape.
catchTags : une branche par erreur. Survoler showCountry : Effect<string, never, never>.
Lancer : 1 → Royaume-Uni, 2 → SchemaError (["createdAt"]), 3 → pays FI inconnu, 4 → utilisateur introuvable.
Supprimer la branche CountryNotFound : CountryNotFound réapparaît dans le type de showCountry. Ajouter { code: "FI", name: "Finlande" } : Linus passe.
Avec des Promise : Promise<Country>, et un catch (e: unknown) pour trier trois erreurs à la main.
-->

---
zoom: 0.72
---

# ▶ ⑥ Comme async / await : `Effect.gen`

<div class="grid grid-cols-[1fr_2.2fr] gap-6">
<div>

Avec `pipe`, il faut **un opérateur par cas** :

```ts
const getUser = (id: number) =>
  Effect.succeed(api[id]).pipe(
    Effect.filterOrFail(
      (json) => json !== undefined,
      () => new UserNotFound({ id }),
    ),
    Effect.flatMap((json) =>
      Schema.decodeUnknownEffect(User)(json)),
  )
```

- L'appel à l'API est un **Effect** (bientôt une vraie requête) : il faut **attendre** sa réponse avant de la tester
- `Effect.gen` : du TypeScript **normal** (`if`, `const`…), et `yield*` ≈ `await`
- Plus d'annotation : la signature est **inférée**

<div class="tuto-sig">
  <small>getUser renvoie (inféré)</small>
  <b class="a">A</b><span>User</span>
  <b class="e">E</b><span>UserNotFound | SchemaError</span>
  <b class="r">R</b><span>never</span>
</div>

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Data, Effect, Schema } from "effect"

const api: Record<number, unknown> = {
  1: { id: 1, name: "Ada", createdAt: "1815-12-10" },
  2: { id: "2", name: "Grace", createdAt: "hier" }, // 👈 données invalides
}

const User = Schema.Struct({ id: Schema.Number, name: Schema.String, createdAt: Schema.DateFromString })
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> {}

// 🆕 Effect.gen se lit comme async / await : yield* ≈ await
const getUser = (id: number) =>
  Effect.gen(function* () {
    const json = yield* Effect.succeed(api[id]) // l'appel à l'API : l'Effect du ①
    if (json === undefined) return yield* Effect.fail(new UserNotFound({ id }))
    return yield* Schema.decodeUnknownEffect(User)(json)
  })
// 👆 survolez getUser : plus besoin d'annoter

const showUser = (id: number) =>
  getUser(id).pipe(
    Effect.map((user) => `✅ ${user.name}, née en ${user.createdAt.getFullYear()}`),
    Effect.catchTags({
      UserNotFound: (e) => Effect.succeed(`🔍 utilisateur ${e.id} introuvable`),
      SchemaError: (e) => Effect.succeed(`🧨 ${e.message}`),
    }),
  )

for (const id of [1, 2, 3]) console.log(Effect.runSync(showUser(id)))
```

</div>
</div>

<!--
Jusqu'ici, la réponse de l'API était sous la main (api[id]) : un ternaire suffisait. Mais l'appel à l'API est un Effect (c'est le getUser du ①), et au ⑦ ce sera une vraie requête réseau : il faut d'abord attendre sa réponse, puis la tester, puis la valider.
À gauche avec pipe : il faut connaître filterOrFail et flatMap. À droite avec gen : un simple if, comme avec async / await.
Les deux ont exactement le même type : Effect<User, UserNotFound | SchemaError, never> (vérifié avec tsc).
Le réflexe « un ternaire dans flatMap » ne compile même pas : TypeScript n'unifie pas les deux branches. Avec gen, la question ne se pose pas.
yield* ≈ await : on récupère la valeur d'un Effect. return yield* Effect.fail(…) ≈ throw, mais typé.
Plus d'annotation de retour : gen infère la signature (survoler getUser). showUser ne change pas d'une ligne.
pipe et gen se combinent : gen pour la logique, pipe pour ce qui l'entoure (catchTags ici, retry et timeout au ⑦).
-->

---
zoom: 0.68
---

# ▶ ⑦ Résister : `tryPromise`, `timeout` et `retry`

<div class="grid grid-cols-[1fr_2fr] gap-6">
<div>

- L'API est maintenant **distante**… et capricieuse
- `tryPromise` : une `Promise` devient un Effect, avec une erreur **typée**
- `timeout` + `retry` : deux lignes dans le `pipe`, **aucun helper**
- Un Effect est une **description** : `retry` peut donc le **relancer**
- Asynchrone : `runSync` → `runPromise`

<div class="tuto-sig">
  <small>getUser renvoie</small>
  <b class="a">A</b><span>User</span>
  <b class="e">E</b><span><span class="is-new">NetworkError | TimeoutError</span> | UserNotFound | SchemaError</span>
  <b class="r">R</b><span>never</span>
</div>

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Data, Effect, Schedule, Schema } from "effect"

const api: Record<number, unknown> = {
  1: { id: 1, name: "Ada", createdAt: "1815-12-10" },
  2: { id: "2", name: "Grace", createdAt: "hier" }, // 👈 données invalides
}

// 🆕 L'API est maintenant distante… et capricieuse : les 2 premiers appels échouent
let calls = 0
const fetchUser = (id: number) => new Promise<unknown>((resolve, reject) => {
  console.log(`🌐 GET /users/${id} (tentative ${++calls})`)
  setTimeout(() => (calls < 3 ? reject(new Error("ECONNRESET")) : resolve(api[id])), 100)
})

const User = Schema.Struct({ id: Schema.Number, name: Schema.String, createdAt: Schema.DateFromString })
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> {}
class NetworkError extends Data.TaggedError("NetworkError")<{ cause: unknown }> {} // 🆕

const getUser = (id: number) =>
  Effect.gen(function* () {
    const json = yield* Effect.tryPromise({ // 🆕 Promise → Effect
      try: () => fetchUser(id),
      catch: (cause) => new NetworkError({ cause }),
    }).pipe(
      Effect.timeout("1 second"), // 🆕
      Effect.retry({ schedule: Schedule.exponential("100 millis"), times: 3 }), // 🆕
    )
    if (json === undefined) return yield* Effect.fail(new UserNotFound({ id }))
    return yield* Schema.decodeUnknownEffect(User)(json)
  })

const user = await Effect.runPromise(getUser(1)) // 🆕 asynchrone : runSync → runPromise
console.log("✅", user.name)
```

</div>
</div>

<!--
fetchUser simule une API distante : les 2 premiers appels échouent (ECONNRESET), le 3e réussit.
Dans getUser, une seule ligne change : l'appel à l'API. Effect.succeed(api[id]) devient Effect.tryPromise(…). Le if et le Schema ne bougent pas.
tryPromise : catch transforme l'erreur de la Promise (unknown) en NetworkError, typée.
timeout s'applique à chaque tentative ; retry relance avec un backoff exponentiel (100 ms, puis 200 ms…), 3 fois au maximum.
Lancer : 3 tentatives dans les logs, puis ✅ Ada.
Changer calls < 3 en calls < 10 : après 4 tentatives (1 + 3 retries), NetworkError remonte.
Passer le setTimeout à 2000 : chaque tentative dépasse la seconde, TimeoutError remonte après les retries.
Pourquoi retry fonctionne : un Effect est une description. Une Promise est déjà lancée, on ne peut pas la rejouer ; un Effect, si.
-->

---
zoom: 0.68
---

# ▶ ⑧ Découpler : `Context.Service` et `Layer`

<div class="grid grid-cols-[1fr_2fr] gap-6">
<div>

- `UserApi` : le **contrat**, ce dont `getUser` a besoin
- La dépendance est **dans le type** : `R = UserApi`
- `Layer` : une implémentation… ici, le `Effect.succeed` du ① !
- Oublier `Effect.provide` = **erreur de compilation**
- Bonus : `Effect.forEach` traite les 3 ids, **2 à la fois**

<div class="tuto-sig">
  <small>getUser renvoie</small>
  <b class="a">A</b><span>User</span>
  <b class="e">E</b><span>NetworkError | TimeoutError | UserNotFound | SchemaError</span>
  <b class="r">R</b><span class="is-new">UserApi</span>
</div>

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Context, Data, Effect, Layer, Schedule, Schema } from "effect"

const User = Schema.Struct({ id: Schema.Number, name: Schema.String, createdAt: Schema.DateFromString }) // ④
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> {} // ②
class NetworkError extends Data.TaggedError("NetworkError")<{ cause: unknown }> {} // ⑦

class UserApi extends Context.Service<UserApi, { // 🆕 le contrat
  readonly fetch: (id: number) => Effect.Effect<unknown, NetworkError>
}>()("UserApi") {}

const getUser = (id: number) =>
  Effect.gen(function* () { // ⑥
    const userApi = yield* UserApi // 🆕
    const json = yield* userApi.fetch(id).pipe(
      Effect.timeout("1 second"), // ⑦
      Effect.retry({ schedule: Schedule.exponential("100 millis"), times: 3 }),
    )
    if (json === undefined) return yield* Effect.fail(new UserNotFound({ id }))
    return yield* Schema.decodeUnknownEffect(User)(json) // ④
  })

const showUser = (id: number) =>
  getUser(id).pipe( // ⑤
    Effect.map((user) => `✅ ${user.name} (${user.createdAt.getFullYear()})`),
    Effect.catchTags({ // ③
      UserNotFound: (e) => Effect.succeed(`🔍 ${e.id} introuvable`),
      SchemaError: () => Effect.succeed(`🧨 ${id} : données invalides`),
    }),
  )

// 🆕 une implémentation = un Layer… avec le Effect.succeed du ①
const api: Record<number, unknown> = {
  1: { id: 1, name: "Ada", createdAt: "1815-12-10" },
  2: { id: "2", name: "Grace", createdAt: "hier" },
}
const InMemoryUserApi = Layer.succeed(UserApi, { fetch: (id) => Effect.succeed(api[id]) })

const program = Effect.forEach([1, 2, 3], showUser, { concurrency: 2 }) // bonus
console.log(await Effect.runPromise(program.pipe(Effect.provide(InMemoryUserApi))))
```

</div>
</div>

<!--
L'exemple complet : chaque concept vu dans les étapes ① à ⑦ est là, les numéros en commentaire rappellent où il est apparu.
Context.Service déclare le contrat (la forme du service) et sa clé ("UserApi"). getUser le récupère avec yield* UserApi, sans savoir qui l'implémente.
Survoler getUser : R = UserApi. Pour l'exécuter, il faut fournir une implémentation : Effect.provide(InMemoryUserApi).
Supprimer Effect.provide : erreur de compilation « Type 'UserApi' is not assignable to type 'never' ». Pas de « service not found » en prod.
La boucle est bouclée : l'implémentation en mémoire, c'est le Effect.succeed(api[id]) du ①. En prod, un autre Layer appellerait fetch avec tryPromise ; en test, on garde celui-ci.
Effect.forEach avec { concurrency: 2 } : les 3 ids sont traités 2 à la fois. Les erreurs métier sont traitées ; il ne reste que NetworkError | TimeoutError dans le type de program.
Dans un vrai projet, on écrit Effect.fn("getUser")(function* (id) { … }) plutôt que (id) => Effect.gen(…) : même code, avec une trace (span) par appel.
-->

---

# Au programme

<div class="toc">
  <div class="toc-card"><span class="toc-num">01</span><div><b>Les erreurs</b><small>Une longue histoire de mensonges</small></div></div>
  <div class="toc-card"><span class="toc-num">02</span><div><b><code>Effect&lt;A, E, R&gt;</code></b><small>Un type qui dit enfin la vérité</small></div></div>
  <div class="toc-card"><span class="toc-num">03</span><div><b>Un <code>getUser</code> qui grandit</b><small>Le fil rouge : un cas réaliste</small></div></div>
  <div class="toc-card"><span class="toc-num">04</span><div><b>Le même chemin, avec Effect</b><small>Concurrence, annulation, retry… sans helper maison</small></div></div>
  <div class="toc-card"><span class="toc-num">05</span><div><b>Valider ce qui vient de l'extérieur</b><small><code>Schema</code> et <code>Config</code></small></div></div>
  <div class="toc-card"><span class="toc-num">06</span><div><b>Services &amp; Layers</b><small>L'injection de dépendances, typée</small></div></div>
  <div class="toc-card"><span class="toc-num">07</span><div><b>Aller plus loin</b><small>Regrouper les appels, tester le temps, partager l'état</small></div></div>
  <div class="toc-card"><span class="toc-num">08</span><div><b>Et maintenant ?</b><small>L'écosystème, le frontend, et quand l'adopter</small></div></div>
</div>

<style>
.toc {
  display: grid;
  grid-template-rows: repeat(4, auto);
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 0.75rem 1.5rem;
  margin-top: 1.5rem;
}
.toc-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.7rem 1rem;
  border: 1px solid var(--tech-border);
  border-radius: 12px;
  background: var(--tech-code-bg);
}
.toc-num {
  flex: none;
  font-family: var(--tech-font-mono);
  font-size: 1.4rem;
  font-weight: 800;
  background: var(--tech-gradient);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.toc-card b {
  display: block;
  font-weight: 650;
  color: var(--tech-fg-strong);
}
.toc-card small {
  display: block;
  font-size: 0.78rem;
  color: var(--tech-muted);
}
</style>


<!--
Le code des slides ▶ tourne dans le navigateur : pas de réseau, pas de terminal.
Les types Effect sont chargés dans l'éditeur : on peut survoler et voir les erreurs de compilation en direct.
-->

---
zoom: 0.85
---

# ▶ Le Problème: la signature ment

<div class="grid grid-cols-[1fr_2.2fr] gap-6">
<div>

- `Promise<User>` ne dit **rien** des erreurs
- On peut `throw` **n'importe quoi**, `string`, `Object` ...
- Dans le `catch`, `e` est `unknown`

<div v-click class="mt-8">
  <div class="fake-alert">
    <div class="fake-alert__title">localhost:3000 indique</div>
    <div class="fake-alert__msg">Error: [object Object]</div>
    <div class="fake-alert__actions"><span>OK</span></div>
  </div>
  <div class="mt-4 text-center text-sm opacity-70">🏆 Le message d'erreur le plus célèbre du web.<br>Cherchez l'erreur. <b>Littéralement.</b></div>
</div>

</div>
<div>

```ts {monaco-run} {autorun: false}
class UserNotFound extends Error {}
class NetworkError extends Error {}

// La signature promet un User… et ne dit rien des erreurs
async function getUser(id: number): Promise<{ id: number; name: string }> {
  if (id <= 0) throw "id invalide" // on peut throw… n'importe quoi
  if (id === 42) throw { status: 500 } // le JSON de l'API, relancé tel quel
  if (id > 100) throw new UserNotFound(`User ${id} introuvable`)
  if (id > 10) throw new NetworkError(`Network Issue`)
  return { id, name: `User ${id}` }
}

try {
  const user = await getUser(999)
  console.log("✅", user.name)
} catch (e) { // 👈 survolez e : unknown
  if (e instanceof UserNotFound) console.log("🔍", e.message)
  else console.log(`Erreur non gérée: ${e}`) // 😬 le toast.error() de tous les projets
}
```

</div>
</div>

<!--
Avec 0 : la string "id invalide" tombe dans le cas "inattendu". Personne ne l'avait prévue.
Avec 42 : l'API a renvoyé un objet, on le relance tel quel… et le toast affiche le fameux « Error: [object Object] ».
Le template `Error: ${e}` appelle String(e) : pour un objet, c'est "[object Object]". Une erreur, aucune information.
-->

---
zoom: 0.85
---

# Première idée : des tuples `[data, error]`

```ts 
export async function catchErrorTyped<T, E extends readonly BaseError[]>(promise: Promise<T>, errors: E) {
    try {
        return [await promise, null];
    } catch (error) {
        if (errors.some(e => error instanceof e)) 
            return [null, error as InstanceType<E[number]>];
        throw error;
    }
}
```

```ts
class UserInvalidUserId extends Error { readonly name = "UserInvalidUserId"}
class UserNotFound extends Error { readonly name = "UserNotFound" }

const [user, error] = await catchErrorTyped(getUser(id), [UserInvalidUserId, UserNotFound])

if (error) {
  if (error instanceof UserInvalidUserId) console.error(error.message)
  else if (error instanceof UserNotFound) console.error(error.message)
} else {
  console.log(user) // ✅ user ne peut pas être null ici
}
```

<div class="tuple-callout mt-2 px-4 py-1 rounded-lg border-l-4 border-amber-500 bg-amber-500/10">

⚠️ Ça marche, mais :
- il faut **déclarer les erreurs à chaque appel**
- si `getUser()` ajoute demain un `UnauthorizedError`, **rien ne le signale**

</div>

<style>
.tuple-callout p,
.tuple-callout ul {
  margin: 0.25rem 0;
}
</style>


---
zoom: 0.85
---

# ▶ Mieux : un `Result` (neverthrow)

<div class="grid grid-cols-[1fr_2.2fr] gap-6">
<div>

- L'erreur fait **partie du type de retour**
- `result.error` est typé : le `switch` est vérifié
- Plus de `unknown` 🎉

</div>
<div>

```ts {monaco-run} {autorun: false}
import { err, ok, type Result } from "neverthrow"

class InvalidUserId extends Error { readonly _tag = "InvalidUserId" }
class UserNotFound extends Error { readonly _tag = "UserNotFound" }
type User = { id: number; name: string }

// ✅ Les erreurs sont enfin dans la signature
function getUser(id: number): Result<User, InvalidUserId | UserNotFound> {
  if (id <= 0) return err(new InvalidUserId(`id ${id} invalide`))
  if (id > 100) return err(new UserNotFound(`User ${id} introuvable`))
  return ok({ id, name: `User ${id}` })
}

const result = getUser(999)
if (result.isErr()) {
  switch (result.error._tag) { // l'erreur est typée
    case "InvalidUserId": console.log("⚠️", result.error.message); break
    case "UserNotFound": console.log("🔍", result.error.message); break
  }
} else {
  console.log("✅", result.value.name)
}
```

</div>
</div>


---

# `Result` : un vrai progrès… mais

<div class="grid grid-cols-2 gap-4 mt-8">
  <div v-click class="lim lim-ok"><span>✅</span><div>Les erreurs entrent <b>enfin</b> dans le type</div></div>
  <div v-click class="lim lim-warn"><span>🧤</span><div>Tout ce qui peut <code>throw</code> (<code>fetch</code>, <code>JSON.parse</code>…) doit être <b>encapsulé à la main</b></div></div>
  <div v-click class="lim lim-warn"><span>🔀</span><div><code>Promise&lt;Result&gt;</code> ou <code>ResultAsync</code> : deux mondes à jongler</div></div>
  <div v-click class="lim lim-ko"><span>🚫</span><div>Concurrence, annulation, retry, timeout, dépendances : <b>rien de prévu</b></div></div>
</div>

<div v-click class="punch mt-8">

👉 Et si **un seul type** portait les erreurs… **et** tout le reste ?

</div>

<style>
.lim {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.2rem;
  border: 1px solid var(--tech-border);
  border-left: 4px solid;
  border-radius: 12px;
  background: var(--tech-code-bg);
  font-size: 1.05rem;
}
.lim > span {
  font-size: 1.8rem;
}
.lim-ok {
  border-left-color: var(--tech-green);
}
.lim-warn {
  border-left-color: #e0a82e;
}
.lim-ko {
  border-left-color: var(--tech-red);
}
.punch {
  padding: 0.4rem 1.2rem;
  border: 2px solid transparent;
  border-radius: 12px;
  background:
    linear-gradient(var(--tech-code-bg), var(--tech-code-bg)) padding-box,
    var(--tech-gradient) border-box;
  font-size: 1.15rem;
  text-align: center;
}
</style>

<!--
Transition vers Effect : on reprend exactement le même getUser, en version Effect.
-->

---
layout: section
---

# `Effect<A, E, R>`
### Un type qui dit enfin la vérité

---
zoom: 0.85
---

# ▶ Premier Effect

<div class="grid grid-cols-[1fr_1.7fr] gap-6">
<div>

- `Effect.succeed(v)` : un Effect qui **réussit**
- `Effect.fail(e)` : un Effect qui **échoue**
- L'erreur est **dans le type** : survolez `hello` et `boom`
- `Effect<number, DivisionByZero>` : **ce que ça renvoie** + **comment ça peut échouer**
- Un Effect est une **description** : rien ne s'exécute avant `run*`
- 👉 Donc on peut le **rejouer** (retry), l'**interrompre**, le **limiter**… sans toucher à son code

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Data, Effect } from "effect"

// Un effect qui ne peut echouer
const hello = Effect.succeed("Hello DevFest")

// un effect qui échoue toujours et ne renvoie jamais de valeur
const boom = Effect.fail("Oups")

// Un résultat (number) ET une erreur possible (DivisionByZero)
class DivisionByZero extends Data.TaggedError("DivisionByZero") {}

const divide = (a: number, b: number): Effect.Effect<number, DivisionByZero> =>
  b === 0 ? Effect.fail(new DivisionByZero()) : Effect.succeed(a / b)

console.log("— rien n'a encore été exécuté —")

console.log(Effect.runSync(hello))
console.log(Effect.runSyncExit(boom))
console.log(Effect.runSyncExit(divide(10, 2)))
console.log(Effect.runSyncExit(divide(10, 0)))
```

</div>
</div>

<!--
Effect<A, E, R> : A = ce qu'on obtient, E = ce qui peut échouer, R = les dépendances (on y revient plus tard).
Analogie : une recette vs le plat. La description se rejoue, s'interrompt, se limite ; le plat, lui, est déjà servi (comme une Promise déjà lancée).
E vaut never quand rien ne peut échouer ; A vaut never quand rien ne peut réussir.
divide : la signature dit tout. Comparer avec `(a, b) => number` qui peut renvoyer Infinity ou lancer une exception sans prévenir.
Data.TaggedError : une classe d'erreur avec un _tag, qu'on pourra traiter par son nom (catchTag, section suivante).
Essayer Effect.runSync(boom) : ça lève une exception, d'où runSyncExit.
-->

---
zoom: 0.85
---

# ▶ Composer : `pipe`, `map` et `flatMap`

<div class="grid grid-cols-[1fr_1fr] gap-6">
<div>

- `pipe()`, c'est comme le `|` en bash, vous avez tous déjà utilisé cette syntaxe :<br>`curl -fsSL https://bun.sh/install | bash`

- `map()` : **transforme** la valeur de succès
- `flatMap()` : **enchaîne** un autre Effect… et **ajoute** ses erreurs au type
</div>

<div>

```ts {monaco-run} {autorun: false}
import { Effect } from "effect"

const hello = Effect.succeed("Hello DevFest")

// map : transformer la valeur de succès
const length = hello.pipe( 
  Effect.map((msg) => msg.length),
)

// flatMap : enchaîner un autre Effect… qui peut échouer
const checked = length.pipe( 
  
  Effect.flatMap((n) => n > 20 ? 
    Effect.succeed(n) : 
    Effect.fail(`Trop court : ${n}`)),
)

console.log(Effect.runSyncExit(length))
console.log(Effect.runSyncExit(checked))
```

</div>
</div>

<!--
Analogie : map / flatMap sur un tableau, ou then sur une Promise… mais l'erreur reste typée.
Si une étape échoue, les suivantes ne s'exécutent pas : l'erreur court-circuite la chaîne.
-->

---
zoom: 0.7
---

# ▶ Les erreurs s'additionnent… avec `pipe`

<div class="grid grid-cols-[1fr_2.6fr] gap-6">
<div>

- Le même `getUser`… plus un `getCountry`
- Chaque fonction **déclare** ses erreurs
- `flatMap` les **additionne** : survolez `program`
- `catchTags` les traite une à une
- `Effect<string>` = `E` vaut `never` : **tout** doit être traité

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Data, Effect } from "effect"

class InvalidUserId extends Data.TaggedError("InvalidUserId")<{ id: number }> {}
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> {}
class CountryNotFound extends Data.TaggedError("CountryNotFound")<{ id: number }> {}
type User = { id: number; name: string }

const getUser = (id: number): Effect.Effect<User, InvalidUserId | UserNotFound> =>
  id <= 0 ? Effect.fail(new InvalidUserId({ id }))
  : id > 100 ? Effect.fail(new UserNotFound({ id }))
  : Effect.succeed({ id, name: `User ${id}` })

const getCountry = (user: User): Effect.Effect<string, CountryNotFound> =>
  user.id === 31 ? Effect.fail(new CountryNotFound({ id: user.id }))
  : Effect.succeed(user.id > 50 ? "France" : "Belgique")

const program = (id: number) => // les 3 erreurs sont dans le type
  getUser(id).pipe(
    Effect.flatMap((user) =>
      getCountry(user).pipe(
        Effect.map((country) => `✅ ${user.name} (${country})`),
      ),
    ),
  )

const describe = (id: number): Effect.Effect<string> =>
  program(id).pipe(
    Effect.catchTags({
      InvalidUserId: (e) => Effect.succeed(`⚠️ id invalide : ${e.id}`),
      UserNotFound: (e) => Effect.succeed(`🔍 introuvable : ${e.id}`),
      CountryNotFound: (e) => Effect.succeed(`🌍 pays inconnu : ${e.id}`),
    }),
  )

for (const id of [1, 99, 0, 999, 31]) console.log(Effect.runSync(describe(id)))
```

</div>
</div>

<!--
Même getUser que les slides try/catch et neverthrow (ids 0 et 999), plus getCountry (le user 31, de Toulouse, est rejeté 😉).
program vaut Effect<string, InvalidUserId | UserNotFound | CountryNotFound, never> sans l'avoir écrit : flatMap a additionné les erreurs.
Remarquer l'imbrication : pour garder `user` sous la main dans le map, il faut un flatMap dans le flatMap… slide suivante, Effect.gen règle ça.
En retirant une ligne de catchTags, `describe` ne compile plus : l'erreur restante n'est pas traitée.
-->

---
zoom: 0.7
---

# ▶ Le même programme, avec `Effect.gen`

<div class="grid grid-cols-[1fr_2.6fr] gap-6">
<div>

- **Exactement** le même programme qu'avec `pipe`
- `Effect.gen` + `yield*` ≈ `async` + `await`
- Plus d'imbrication : on lit le code **de haut en bas**
- Les erreurs s'additionnent **de la même façon** : survolez `program`
</div>

<div>

```ts {monaco-run} {autorun: false}
import { Data, Effect } from "effect"

class InvalidUserId extends Data.TaggedError("InvalidUserId")<{ id: number }> {}
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> {}
class CountryNotFound extends Data.TaggedError("CountryNotFound")<{ id: number }> {}
type User = { id: number; name: string }

const getUser = (id: number): Effect.Effect<User, InvalidUserId | UserNotFound> =>
  id <= 0 ? Effect.fail(new InvalidUserId({ id }))
  : id > 100 ? Effect.fail(new UserNotFound({ id }))
  : Effect.succeed({ id, name: `User ${id}` })

const getCountry = (user: User): Effect.Effect<string, CountryNotFound> =>
  user.id === 31 ? Effect.fail(new CountryNotFound({ id: user.id }))
  : Effect.succeed(user.id > 50 ? "France" : "Belgique")

const program = (id: number) => // les 3 erreurs sont dans le type
  Effect.gen(function* () {
    const user = yield* getUser(id) // yield* ≈ await
    const country = yield* getCountry(user)
    return `✅ ${user.name} (${country})`
  })

const describe = (id: number): Effect.Effect<string> =>
  program(id).pipe(
    Effect.catchTags({
      InvalidUserId: (e) => Effect.succeed(`⚠️ id invalide : ${e.id}`),
      UserNotFound: (e) => Effect.succeed(`🔍 introuvable : ${e.id}`),
      CountryNotFound: (e) => Effect.succeed(`🌍 pays inconnu : ${e.id}`),
    }),
  )

for (const id of [1, 99, 0, 999, 31]) console.log(Effect.runSync(describe(id)))
```

</div>
</div>


---
layout: section
---

# Un `getUser` qui grandit…
### Le fil rouge : un cas réaliste

---
zoom: 0.85
---

# Le besoin

<div class="need">
  <div v-click class="need-item"><span class="need-n">1</span><div class="i-carbon-user" /><div>Récupérer un utilisateur</div></div>
  <div v-click class="need-item"><span class="need-n">2</span><div class="i-carbon-code" /><div>… proprement, avec <code>async/await</code></div></div>
  <div v-click class="need-item"><span class="need-n">3</span><div class="i-carbon-shopping-cart" /><div>… et ses <b>commandes</b>, en <b>parallèle</b></div></div>
  <div v-click class="need-item"><span class="need-n">4</span><div class="i-carbon-group" /><div>… pour <b>N utilisateurs</b>, mais pas plus de <b>5 à la fois</b></div></div>
  <div v-click class="need-item"><span class="need-n">5</span><div class="i-carbon-stop-outline" /><div>… en pouvant <b>tout annuler</b> (l'utilisateur quitte la page)</div></div>
  <div v-click class="need-item"><span class="need-n">6</span><div class="i-carbon-renew" /><div>… avec des <b>retries</b> (le réseau, c'est le réseau)</div></div>
  <div v-click class="need-item"><span class="need-n">7</span><div class="i-carbon-warning-alt" /><div>… et une <b>gestion d'erreurs</b> digne de ce nom</div></div>
  <div v-click class="need-item"><span class="need-n">8</span><div class="i-carbon-checkmark-outline" /><div>… en <b>validant</b> ce que renvoie l'API</div></div>
</div>

<style>
.need {
  display: grid;
  grid-template-rows: repeat(4, auto);
  grid-auto-flow: column;
  grid-auto-columns: 1fr;
  gap: 1rem 1.5rem;
  margin-top: 2rem;
}
.need-item {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 1rem 1.2rem;
  border: 1px solid var(--tech-border);
  border-radius: 12px;
  background: var(--tech-code-bg);
  font-size: 1.15rem;
}
.need-n {
  flex: none;
  display: grid;
  place-items: center;
  width: 1.8rem;
  height: 1.8rem;
  border-radius: 50%;
  background: var(--tech-gradient);
  color: white;
  font-family: var(--tech-font-mono);
  font-size: 0.85rem;
  font-weight: 700;
}
.dark .need-n {
  color: #1a1b26;
}
.need-item > [class^="i-carbon"] {
  flex: none;
  font-size: 1.3rem;
  color: var(--tech-cyan);
}
</style>

<!--
Poser le scénario fil rouge : chaque étape est une demande "réaliste" d'un PO ou d'un incident de prod.
-->

---
zoom: 0.72
---

# En TypeScript « classique »

````md magic-move {lines: true}
```ts
// ① Get user, version Promise
function getUser(id: string): Promise<User> {
  return fetch(`/api/users/${id}`).then((res) => res.json())
}
```

```ts
// ② async / await
async function getUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`)
  return res.json()
}
```

```ts
// ③ Parallélisme : l'utilisateur ET ses commandes
async function getUser(id: string): Promise<User> {
  const res = await fetch(`/api/users/${id}`)
  return res.json()
}
// getOrders(id) : même code, autre URL

async function getUserWithOrders(id: string) {
  const [user, orders] = await Promise.all([getUser(id), getOrders(id)])
  return { ...user, orders }
}

async function getUsersWithOrders(ids: string[]) {
  return Promise.all(ids.map(getUserWithOrders)) // 💥 1 000 ids = 2 000 requêtes d'un coup
}
```

```ts
// ④ Concurrence limitée : 5 utilisateurs à la fois
async function getUserWithOrders(id: string) {
  const [user, orders] = await Promise.all([getUser(id), getOrders(id)])
  return { ...user, orders }
}

async function mapWithConcurrency<T, R>(
  items: T[], limit: number, fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  let next = 0
  const worker = async () => {
    while (next < items.length) {
      const i = next++
      results[i] = await fn(items[i])
    }
  }
  await Promise.all(Array.from({ length: limit }, worker))
  return results
}

async function getUsersWithOrders(ids: string[]) {
  return mapWithConcurrency(ids, 5, getUserWithOrders)
}
```

```ts
// ⑤ Interruption : AbortSignal propagé partout… à la main
async function getUser(id: string, signal?: AbortSignal): Promise<User> {
  const res = await fetch(`/api/users/${id}`, { signal })
  return res.json()
}

async function getUserWithOrders(id: string, signal?: AbortSignal) {
  // Promise.all n'annule PAS la requête sœur si l'une échoue
  const controller = new AbortController()
  const onAbort = () => controller.abort(signal?.reason)
  signal?.addEventListener("abort", onAbort)
  try {
    const [user, orders] = await Promise.all([
      getUser(id, controller.signal),
      getOrders(id, controller.signal),
    ])
    return { ...user, orders }
  } catch (e) {
    controller.abort(e)
    throw e
  } finally {
    signal?.removeEventListener("abort", onAbort)
  }
}

async function getUsersWithOrders(ids: string[], signal?: AbortSignal) {
  return mapWithConcurrency(ids, 5, (id) => {
    signal?.throwIfAborted()
    return getUserWithOrders(id, signal)
  })
}
```

```ts
// ⑥ Retry avec backoff exponentiel
async function getUser(id: string, signal?: AbortSignal): Promise<User> {
  return retry(async () => {
    const res = await fetch(`/api/users/${id}`, { signal })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  }, { times: 3, signal })
}

async function retry<T>(
  fn: () => Promise<T>,
  { times, signal }: { times: number; signal?: AbortSignal }
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn()
    } catch (e) {
      if (attempt >= times || signal?.aborted) throw e
      await sleep(100 * 2 ** attempt, signal) // le sleep doit AUSSI être annulable
    }
  }
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    }, { once: true })
  })
}
// getUserWithOrders, getUsersWithOrders, mapWithConcurrency : inchangés
```

```ts
// ⑦ Gestion d'erreurs
class UserNotFound extends Error {
  constructor(readonly id: string) { super(`User ${id} not found`) }
}
class HttpError extends Error {
  constructor(readonly status: number) { super(`HTTP ${status}`) }
}

async function getUser(id: string, signal?: AbortSignal): Promise<User> {
  return retry(async () => {
    const res = await fetch(`/api/users/${id}`, { signal })
    if (res.status === 404) throw new UserNotFound(id)
    if (!res.ok) throw new HttpError(res.status)
    return res.json()
  }, { times: 3, signal, shouldRetry: (e) => !(e instanceof UserNotFound) })
} // 🧰 et retry() doit maintenant accepter une option shouldRetry…

// Côté appelant
try {
  const users = await getUsersWithOrders(ids, controller.signal)
} catch (e) {                                  // e: unknown 🤷
  if (e instanceof UserNotFound) { /* ... */ }
  else if (e instanceof HttpError) { /* ... */ }
  else if (e instanceof DOMException && e.name === "AbortError") { /* ... */ }
  else throw e                                 // TypeError ? JSON invalide ? Autre ?
}
```

```ts
// ⑧ Bonus : timeout global
const controller = new AbortController()
const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(5_000)])

try {
  const users = await getUsersWithOrders(ids, signal)
} catch (e) {
  if (e instanceof DOMException && e.name === "TimeoutError") { /* encore un cas… */ }
  // ...
}

// Et toujours : Promise<UserWithOrders[]> 😬
```
````

<!--
Faire défiler les 8 étapes (1 clic = 1 étape), en commentant à chaque fois ce qui a été ajouté.
Étape ④ : la concurrence limitée n'existe pas en natif, il faut un helper (ou p-limit).
Étape ⑤ : le signal pollue TOUTES les signatures ; Promise.all n'annule pas la sœur.
Étape ⑥ : piège classique, le sleep du retry doit lui aussi écouter le signal.
Étape ⑦ : malgré tout ce travail, `catch (e)` reçoit `unknown`.
-->
---

# Le bilan

<div class="grid grid-cols-3 gap-4 mt-6">
  <div v-click class="bilan"><span>🧰</span><div><b>3 helpers maison</b> : <code>mapWithConcurrency</code>, <code>retry</code>, <code>sleep</code></div></div>
  <div v-click class="bilan"><span>🔌</span><div>Un <code>AbortSignal</code> <b>propagé à la main</b> dans chaque signature</div></div>
  <div v-click class="bilan"><span>🧟</span><div><code>Promise.all</code> n'annule pas les requêtes sœurs, et les workers continuent après un échec</div></div>
  <div v-click class="bilan"><span>🙈</span><div>Les erreurs sont <code>unknown</code> : on teste avec <code>instanceof</code> et on espère n'en oublier aucune</div></div>
  <div v-click class="bilan"><span>🔍</span><div>Pas de logs, pas de traces, difficile à tester (retry = vrais <code>setTimeout</code>)</div></div>
  <div v-click class="bilan bilan-punch"><span>😬</span><div>Et la signature ? <b>Toujours</b> <code>Promise&lt;UserWithOrders[]&gt;</code></div></div>
</div>

<style>
.bilan {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1rem 1.1rem;
  border: 1px solid var(--tech-border);
  border-radius: 12px;
  background: var(--tech-code-bg);
  font-size: 0.95rem;
  line-height: 1.45;
}
.bilan > span {
  font-size: 2rem;
  line-height: 1;
}
.bilan-punch {
  border: 2px solid transparent;
  background:
    linear-gradient(var(--tech-code-bg), var(--tech-code-bg)) padding-box,
    linear-gradient(135deg, var(--tech-red), var(--tech-violet)) border-box;
}
</style>

<!--
Transition : "On connaît maintenant Effect : refaisons exactement le même chemin avec lui."
-->
---
layout: section
---

# Le même chemin, avec Effect
### Concurrence, annulation, retry… sans helper maison

---
zoom: 0.72
---

# `getUser`, version Effect

````md magic-move {lines: true}
```ts
// ① Get user
const getUser = (id: string) =>
  Effect.tryPromise(() =>
    fetch(`/api/users/${id}`).then((res) => res.json() as Promise<User>)
  )
// Effect<User, Cause.UnknownError, never>
```

```ts
// ② Effect.gen ≈ async / await
const getUser = (id: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise(() => fetch(`/api/users/${id}`))
    return yield* Effect.tryPromise(() => res.json() as Promise<User>)
  })
```

```ts
// ③ Parallélisme
const getUser = (id: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise(() => fetch(`/api/users/${id}`))
    return yield* Effect.tryPromise(() => res.json() as Promise<User>)
  })

// Effect.all vs Promise.all / Promise.allSettled :
//  ✅ les erreurs restent typées (pas de `catch (e: unknown)` ni de `reason: any`)
//  ✅ si une branche échoue, les autres sont interrompues (pas de requête zombie)
//  ✅ { mode: "result" } ≈ allSettled… mais chaque échec garde son type
const getUserWithOrders = (id: string) =>
  Effect.all([getUser(id), getOrders(id)], { concurrency: "unbounded" }).pipe(
    Effect.map(([user, orders]) => ({ ...user, orders }))
  )

const getUsersWithOrders = (ids: string[]) =>
  Effect.forEach(ids, getUserWithOrders, { concurrency: "unbounded" })
```

```ts
// ④ Concurrence limitée : un seul mot change
const getUser = (id: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise(() => fetch(`/api/users/${id}`))
    return yield* Effect.tryPromise(() => res.json() as Promise<User>)
  })

const getUserWithOrders = (id: string) =>
  Effect.all([getUser(id), getOrders(id)], { concurrency: "unbounded" }).pipe(
    Effect.map(([user, orders]) => ({ ...user, orders }))
  )

const getUsersWithOrders = (ids: string[]) =>
  Effect.forEach(ids, getUserWithOrders, { concurrency: 5 })
```

```ts
// ⑤ Interruption : Effect fournit le signal, et annule tout seul
const getUser = (id: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise((signal) => fetch(`/api/users/${id}`, { signal }))
    return yield* Effect.tryPromise(() => res.json() as Promise<User>)
  })

const getUserWithOrders = (id: string) =>
  Effect.all([getUser(id), getOrders(id)], { concurrency: "unbounded" }).pipe(
    Effect.map(([user, orders]) => ({ ...user, orders }))
  ) // si getUser échoue, getOrders est interrompu automatiquement

const getUsersWithOrders = (ids: string[]) =>
  Effect.forEach(ids, getUserWithOrders, { concurrency: 5 })

// Côté appelant : on lance… et on peut tout annuler
const fiber = Effect.runFork(getUsersWithOrders(ids))
// l'utilisateur quitte la page :
Effect.runFork(Fiber.interrupt(fiber)) // tout s'arrête, requêtes HTTP comprises
```

```ts
// ⑥ Retry avec backoff exponentiel
const getUser = (id: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise((signal) => fetch(`/api/users/${id}`, { signal }))
    return yield* Effect.tryPromise(() => res.json() as Promise<User>)
  }).pipe(
    Effect.retry({ schedule: Schedule.exponential("100 millis"), times: 3 })
  )

const getUserWithOrders = (id: string) =>
  Effect.all([getUser(id), getOrders(id)], { concurrency: "unbounded" }).pipe(
    Effect.map(([user, orders]) => ({ ...user, orders }))
  )

const getUsersWithOrders = (ids: string[]) =>
  Effect.forEach(ids, getUserWithOrders, { concurrency: 5 })
```

```ts
// ⑦ Gestion d'erreurs : typées, et visibles dans la signature
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: string }> {}
class HttpError extends Data.TaggedError("HttpError")<{ status: number }> {}
class NetworkError extends Data.TaggedError("NetworkError")<{ cause: unknown }> {}

const getUser = (id: string) =>
  Effect.gen(function* () {
    const res = yield* Effect.tryPromise({
      try: (signal) => fetch(`/api/users/${id}`, { signal }),
      catch: (cause) => new NetworkError({ cause }),
    })
    if (res.status === 404) return yield* new UserNotFound({ id })
    if (!res.ok) return yield* new HttpError({ status: res.status })
    return yield* Effect.promise(() => res.json() as Promise<User>)
  }).pipe(
    Effect.retry({
      schedule: Schedule.exponential("100 millis"),
      times: 3,
      while: (e) => e._tag !== "UserNotFound", // pas de retry sur un 404
    })
  )
// Effect<User, UserNotFound | HttpError | NetworkError, never>
```

```ts
// ⑧ Bonus : timeout global + traces OpenTelemetry
const getUser = (id: string) =>
  Effect.gen(function* () {
    /* ... inchangé ... */
  }).pipe(
    Effect.retry({ /* ... */ }),
    Effect.withSpan("getUser", { attributes: { id } })
  )

const getUsersWithOrders = (ids: string[]) =>
  Effect.forEach(ids, getUserWithOrders, { concurrency: 5 }).pipe(
    Effect.timeout("5 seconds"),
    Effect.withSpan("getUsersWithOrders")
  )
// Effect<UserWithOrders[], UserNotFound | HttpError | NetworkError | Cause.TimeoutError, never>
```
````

<!--
Même déroulé que la version classique, 1 clic = 1 étape.
Étape ③ : Effect.all remplace Promise.all. Avantages :
  - Promise.all rejette avec la première erreur, typée unknown, et laisse tourner les autres promesses ;
    Effect.all garde l'union des erreurs dans le type et interrompt les branches restantes (démo slide « Promise.all vs Effect.all : la requête zombie »).
  - Promise.allSettled donne { status, reason: any } à tester à la main ;
    Effect.all({ mode: "result" }) renvoie des Result typés.
  - Sans option, Effect.all est séquentiel : la concurrence est explicite ({ concurrency }).
Étape ④ : "unbounded" → 5, c'est tout.
Étape ⑤ : aucune signature ne change ; l'interruption est structurée (fibers).
Étape ⑥ : un pipe, pas de helper ; le sleep est interruptible par construction.
Étape ⑦ : survol de la signature = la liste exacte des erreurs.
Étape ⑧ : le timeout ajoute Cause.TimeoutError au type ; withSpan donne des traces sans effort.
-->
---
zoom: 0.7
---

# ▶ `Promise.all` vs `Effect.all` : la requête zombie

Même scénario : `getUser` échoue au bout de 100 ms, pendant que `getOrders` tourne encore.

<div class="grid grid-cols-2 gap-6">
<div>

### ❌ `Promise.all` rejette… mais n'annule rien

```ts {monaco-run} {autorun: false}
const fakeFetch = (url: string, signal?: AbortSignal) =>
  new Promise<unknown[]>((resolve, reject) => {
    console.log(`🌐 GET ${url}`)
    const timer = setTimeout(() => {
      console.log(`🧟 ${url} terminé… pour rien`)
      resolve([])
    }, 1000)
    signal?.addEventListener("abort", () => {
      clearTimeout(timer)
      reject(signal.reason)
    })
  })

async function getUser(id: number) {
  await new Promise((resolve) => setTimeout(resolve, 100))
  throw new Error(`User ${id} introuvable`)
}
const getOrders = (id: number) => fakeFetch(`/api/users/${id}/orders`)

try {
  await Promise.all([getUser(1), getOrders(1)])
} catch (e) {
  console.log("❌", (e as Error).message)
}
```

</div>
<div>

### ✅ `Effect.all` interrompt la branche sœur

```ts {monaco-run} {autorun: false}
import { Effect } from "effect"

const fakeFetch = (url: string, signal?: AbortSignal) =>
  new Promise<unknown[]>((resolve, reject) => {
    console.log(`🌐 GET ${url}`)
    const timer = setTimeout(() => resolve([]), 1000)
    signal?.addEventListener("abort", () => {
      clearTimeout(timer)
      console.log(`🛑 ${url} annulé`)
      reject(signal.reason)
    })
  })

const getUser = (id: number) =>
  Effect.gen(function* () {
    yield* Effect.sleep("100 millis")
    return yield* Effect.fail(`User ${id} introuvable`)
  })
// Effect fournit le signal… et l'annule si besoin
const getOrders = (id: number) =>
  Effect.tryPromise((signal) => fakeFetch(`/api/users/${id}/orders`, signal))

await Effect.runPromise(
  Effect.all([getUser(1), getOrders(1)], { concurrency: "unbounded" }).pipe(
    Effect.catch((error) => Effect.log(`❌ ${error}`)),
  ),
)
```

</div>
</div>

<!--
Lancer les deux, et comparer les logs.
Promise.all : le log 🧟 arrive presque une seconde APRÈS l'erreur, la requête a été payée pour rien.
Pour l'annuler, il faudrait un AbortController propagé partout (étape ⑤ de la version classique).
Effect.all : tryPromise((signal) => …) fournit l'AbortSignal ; dès que getUser échoue, la fibre sœur est interrompue et le fetch annulé.
Aucune signature ne change : l'interruption est structurée (les fibres enfants suivent leur parent).
-->

---
layout: section
---

# Valider ce qui vient de l'extérieur
### `Schema` et `Config`

---
zoom: 0.8
---

# ▶ Valider la réponse de l'API : `Schema`

<div class="grid grid-cols-[1fr_1.8fr] gap-6">
<div>

### Classique

```ts
const user = (await res.json()) as User
// 🙈 "as" = on fait confiance au backend
// createdAt est une string, pas une Date
```


Avec zod ou valibot, deux options… et aucune ne rejoint le type :

- `parse` : **lève une exception**, retour au `catch (e: unknown)`
- `safeParse` : renvoie un objet `{ success, … }`, à **tester à la main** à chaque appel

</div>
<div>

### Effect

```ts {monaco-run} {autorun: false}
import { Data, Effect, Schema } from "effect"

class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> {}

const User = Schema.Struct({
  id: Schema.Number,
  name: Schema.String,
  createdAt: Schema.DateFromString, // string ISO → Date
})

// Ce que renvoie l'API : du JSON… donc du unknown
const api: Record<number, unknown> = {
  1: { id: 1, name: "Ada", createdAt: "1815-12-10" },
  2: { id: "2", name: "Grace", createdAt: "hier" }, // 👈 données invalides
}

const getUser = (id: number) => // 👈 survolez : SchemaError a rejoint le type
  Effect.gen(function* () {
    const row = api[id]
    if (row === undefined) return yield* new UserNotFound({ id })
    return yield* Schema.decodeUnknownEffect(User)(row)
  })
// Effect<User, UserNotFound | SchemaError, never>

for (const id of [1, 2, 3]) Effect.runSync(getUser(id).pipe(Effect.match({
  onSuccess: (user) => console.log("✅", user.name, user.createdAt.getFullYear()),
  onFailure: (error) => console.log("❌", error._tag, error.message),
})))
```

</div>
</div>

<!--
Lancer : 1 → succès (createdAt est devenu une vraie Date), 2 → SchemaError avec le chemin du champ fautif, 3 → UserNotFound.
Le point clé : en ajoutant une ligne (decodeUnknownEffect), SchemaError rejoint le type de getUser. Survoler getUser.
Corriger les données de 2 en direct : l'erreur disparaît.
Avec `as User`, cette ligne invalide passe… et casse plus loin ; avec Schema, elle est rejetée dès la lecture.
-->

---
zoom: 0.73
---

# ▶ `Config` : le `.env` validé au démarrage

<div class="grid grid-cols-[1fr_2.4fr] gap-6">
<div>

- `Config` lit l'environnement, `Schema` valide
- `constantCase` : `app.apiUrl` → `APP_API_URL`
- `Redacted` : la clé n'apparaît **jamais** dans les logs

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Config, ConfigProvider, Effect, Schema } from "effect"

const AppConfig = Schema.Struct({
  name: Schema.NonEmptyString,
  port: Schema.Int.check(Schema.isBetween({ minimum: 3000, maximum: 9999 })),
  apiUrl: Schema.URL,
  apiKey: Schema.Redacted(Schema.NonEmptyString),
})

// Le fichier .env, simulé
const env = {
  APP_NAME: "devfest-demo",
  APP_PORT: "8080",
  APP_API_URL: "https://api.example.com",
  APP_API_KEY: "s3cr3t",
}

const program = Effect.gen(function* () {
  const config = yield* Config.schema(AppConfig, "app")
  yield* Effect.log(`🚀 ${config.name} sur le port ${config.port}`)
  yield* Effect.log(`🌐 API : ${config.apiUrl.host}`)
  yield* Effect.log(`🔑 clé : ${config.apiKey}`) // Redacted : jamais affichée
})

await Effect.runPromise(
  program.pipe(
    Effect.provideService(
      ConfigProvider.ConfigProvider,
      ConfigProvider.fromEnv({ env }).pipe(ConfigProvider.constantCase),
    ),
    Effect.catchTag("ConfigError", (error) => Effect.log(`❌ ${error.message}`)),
  ),
)
```

</div>
</div>

<!--
En vrai, ConfigProvider.fromEnv() sans option lit process.env (par exemple un .env chargé par node --env-file).
-->

---
layout: section
---

# Services & Layers
### L'injection de dépendances, typée


---
zoom: 0.77
---

# ▶ Changer d'implémentation sans toucher au métier

<div class="grid grid-cols-[1fr_2.4fr] gap-6">
<div>

- `greet` ne connaît que le **contrat**
- Un `Layer` par implémentation : mock, API, PostgreSQL…

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Context, Data, Effect, Layer } from "effect"

type User = { id: number; name: string }
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> {}

// 1. Le contrat (A la mode .NET):
interface IUserRepository { findById: (id: number) => Effect.Effect<User, UserNotFound> }

// 2. Context: Pensez ce Context comme un conteneur pour les services: Map<ServiceKey, Service>
const UserRepository = Context.Service<IUserRepository>("app/UserRepository")

// 3. La logique métier ne connaît que le contrat
const greet = (id: number) => 
  Effect.gen(function* () {
    const repository = yield* UserRepository
    const user = yield* repository.findById(id)
    return `👋 Bonjour ${user.name}`
  })

// 4. Un Layer = Implémentation de IUserRepository
const ApiRepository = Layer.succeed(UserRepository, {
  findById: (id) =>
    Effect.succeed({ id, name: "Jane " }).pipe(Effect.delay("500 millis")),
})

console.log(await Effect.runPromise(greet(1).pipe(Effect.provide(ApiRepository))))
```

</div>
</div>


---
zoom: 0.77
---

# ▶ Le même service, écrit comme une classe

<div class="grid grid-cols-[1fr_2.4fr] gap-6">
<div>

- Une seule **classe** : le **contrat** (le type) **et** la **clé** du service
- Le `Layer` rangé avec le contrat : `UserRepository.api`
- Dans le type, `R` affiche le nom de la classe : `Effect<string, UserNotFound, UserRepository>`
- `greet` ne change pas

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Context, Data, Effect, Layer } from "effect"

type User = { id: number; name: string }
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> {}

// 1. Une classe = le contrat (le type) + la clé du service
class UserRepository extends Context.Service<UserRepository, {
  readonly findById: (id: number) => Effect.Effect<User, UserNotFound>
}>()("app/UserRepository") {
  // 2. L'implémentation (Layer), rangée avec le contrat
  static readonly api = Layer.succeed(UserRepository, {
    findById: (id) => Effect.succeed({ id, name: "Jane" }).pipe(Effect.delay("500 millis")),
  })
}

// 3. La logique métier ne connaît que le contrat : rien ne change
const greet = (id: number) =>
  Effect.gen(function* () {
    const repository = yield* UserRepository
    const user = yield* repository.findById(id)
    return `👋 Bonjour ${user.name}`
  })

console.log(await Effect.runPromise(greet(1).pipe(Effect.provide(UserRepository.api))))
```

</div>
</div>

<!--
Même exemple que le slide précédent, avec la forme « classe » de Context.Service : c'est celle qu'on écrit dans un vrai projet.
La classe porte à la fois le type du contrat et la clé ; l'implémentation est une propriété statique (api ; on ajouterait test, postgres… de la même façon).
Survoler greet : R = UserRepository, le nom de la classe (avec la forme fonction, le type est moins lisible).
Dans le backend de démo : backend/lib/effect/database.ts suit ce modèle (Database.layer).
Pas de `export` devant la classe dans le slide : le code tourne comme le corps d'une fonction ; dans un vrai fichier, on l'exporte.
-->

---
zoom: 0.75
---

# Classique vs Effect

<div class="vs-table">

| | Étape | ❌ TypeScript classique | ✅ Effect |
|---|---|---|---|
| ⏳ | async / await | `async` / `await` | `Effect.gen` / `yield*` |
| 🔀 | Parallélisme | `Promise.all` | `Effect.all` / `Effect.forEach` |
| 🚦 | Concurrence limitée | helper maison | `{ concurrency: 5 }` |
| 🛑 | Interruption | `AbortSignal` dans chaque signature | automatique (fibers) |
| 🔁 | Retry | `retry` + `sleep` annulable | `Effect.retry` + `Schedule` |
| 🧯 | Erreurs | `unknown` + `instanceof` | union typée dans `E` |
| ⏱️ | Timeout | `AbortSignal.any` + `AbortSignal.timeout` | `Effect.timeout` |
| 🔍 | Traces | à brancher à la main | `Effect.withSpan` |
| 🛡️ | Validation | `as User` (ou zod à brancher) | `Schema` + `SchemaError` typée |
| 🧩 | Dépendances | singletons, conteneur DI ou mocks de modules | `Layer`, vérifié à la compilation (`R`) |

</div>

<style>
.vs-table table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 10px 30px -12px rgba(0, 0, 0, 0.35);
  font-size: 1.05rem;
}
.vs-table th {
  padding: 0.7rem 1rem;
  text-align: left;
  font-weight: 700;
  letter-spacing: 0.02em;
  color: white;
  background: #475569;
}
.vs-table th:nth-child(3) { background: #b91c1c; }
.vs-table th:nth-child(4) { background: #15803d; }
.vs-table td {
  padding: 0.55rem 1rem;
  border-top: 1px solid rgba(128, 128, 128, 0.18);
  vertical-align: middle;
}
.vs-table td:first-child { width: 2.5rem; text-align: center; font-size: 1.25rem; }
.vs-table td:nth-child(2) { font-weight: 650; white-space: nowrap; }
.vs-table td:nth-child(3) { background: rgba(239, 68, 68, 0.07); opacity: 0.85; }
.vs-table td:nth-child(4) { background: rgba(34, 197, 94, 0.1); font-weight: 600; }
.vs-table tr:hover td { filter: brightness(1.08); }
</style>

<!--
Le récapitulatif de tout le fil rouge : chaque ligne = un helper ou une convention maison d'un côté, une option ou un type de l'autre.
-->


---
layout: section
---

# Aller plus loin
### Regrouper les appels, tester le temps, partager l'état

---
zoom: 0.72
---

# ▶ ⑩ Regrouper les appels : `Request` + `RequestResolver`

<div class="grid grid-cols-[1fr_2.8fr] gap-6">
<div>

### Classique

- 1 000 users = **1 000** `GET /api/users/:id`
- Le même id demandé 2 fois = 2 requêtes
- DataLoader ou cache maison… à brancher partout

### Effect

- Les requêtes concurrentes partent **en un seul appel**
- Le code appelant **ne change pas**
- `withCache` : **dédoublonnage** + cache

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Data, Effect, Exit, Request, RequestResolver } from "effect"

type User = { id: number; name: string }
class UserNotFound extends Data.TaggedError("UserNotFound")<{ id: number }> {}
class GetUserById extends Request.Class<{ readonly id: number }, User, UserNotFound> {}

// Le backend sait renvoyer plusieurs users en un seul appel
const fetchUsersBatch = (ids: ReadonlyArray<number>) =>
  Effect.log(`🌐 GET /api/users?ids=${ids.join(",")}`).pipe(
    Effect.as(ids.filter((id) => id !== 404).map((id) => ({ id, name: `User ${id}` }))),
  )

const UserResolver = RequestResolver.make<GetUserById>((entries) =>
  fetchUsersBatch(entries.map((entry) => entry.request.id)).pipe(
    Effect.map((users) => entries.forEach((entry) => {
      const user = users.find((u) => u.id === entry.request.id)
      entry.completeUnsafe(user ? Exit.succeed(user) : Exit.fail(new UserNotFound({ id: entry.request.id })))
    })),
  ),
)

// Le code appelant ne sait rien du regroupement
const getUsers = (resolver: RequestResolver.RequestResolver<GetUserById>) =>
  Effect.forEach([1, 2, 3, 2, 1, 404], (id) =>
    Effect.request(new GetUserById({ id }), resolver).pipe(Effect.result),
    { concurrency: "unbounded" }) // 👉 essayez 2

await Effect.runPromise(Effect.gen(function* () {
  yield* getUsers(UserResolver)
  yield* Effect.log("— avec withCache —")
  const cached = yield* RequestResolver.withCache(UserResolver, { capacity: 100 })
  yield* getUsers(cached)
  yield* getUsers(cached) // tout est en cache : aucun appel
}))
```

</div>
</div>

<!--
Sans cache : un seul appel, mais les ids 1 et 2 partent deux fois. Avec withCache : dédoublonnés, puis plus aucun appel.
La taille d'un lot est bornée par la concurrence : avec concurrency 5, 1 000 users ≈ 200 appels (et non 1 000).
Chaque entrée DOIT être complétée (completeUnsafe), sinon l'appelant reste bloqué.
-->

---
zoom: 0.85
---

# ▶ ⑪ Tester le retry sans attendre : `TestClock`

<div class="grid grid-cols-[1fr_2.4fr] gap-6">
<div>

### Classique

- `vi.useFakeTimers()`
- `vi.advanceTimersByTimeAsync(...)`
- Mock de `fetch`
- Et l'ordre promesses / timers à dompter 🤯

### Effect

- Le temps est un **service** : en test, on le remplace
- 7 s de backoff… testées en quelques **ms**
- `it.effect` (`@effect/vitest`) fournit le `TestClock`

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Data, Effect, Exit, Fiber, Schedule } from "effect"
import { TestClock } from "effect/testing"

class HttpError extends Data.TaggedError("HttpError")<{ status: number }> {}

const test = Effect.gen(function* () {
  let attempts = 0
  const flaky = Effect.suspend(() => {
    attempts++
    return Effect.fail(new HttpError({ status: 503 }))
  })
  const fiber = yield* flaky.pipe(
    // 1 s + 2 s + 4 s = 7 secondes de backoff
    Effect.retry({ schedule: Schedule.exponential("1 second"), times: 3 }),
    Effect.forkChild,
  )
  yield* TestClock.adjust("10 seconds") // ⏩ le temps avance… instantanément
  const exit = yield* Fiber.await(fiber)
  return `${attempts} tentatives, échec final : ${Exit.isFailure(exit)}`
})

const start = Date.now()
const result = await Effect.runPromise(test.pipe(Effect.provide(TestClock.layer())))
console.log(`✅ ${result} — en ${Date.now() - start} ms`)
```

</div>
</div>

<!--
Même principe pour fetch : on fournit un Layer de test (section 6).
-->

---
zoom: 0.85
---

# ▶ État partagé : `let` vs `Ref`

<div class="grid grid-cols-[1fr_2.2fr] gap-6">
<div>

- Le bug classique : **lire → await → écrire**
- 10 requêtes concurrentes… et des incréments perdus
- `Ref.update` : une fonction **synchrone** et **atomique**, impossible d'y glisser un `await`

</div>
<div>

```ts {monaco-run} {autorun: false}
import { Effect, Ref } from "effect"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// ❌ Classique : lire → await → écrire
let completed = 0
const handleRequest = async () => {
  const current = completed
  await sleep(25) // … une autre requête passe par là
  completed = current + 1
}
await Promise.all(Array.from({ length: 10 }, handleRequest))
console.log(`classique : ${completed} / 10`)

// ✅ Effect : Ref.update est atomique
const program = Effect.gen(function* () {
  const counter = yield* Ref.make(0)
  const handle = Effect.sleep("25 millis").pipe(
    Effect.andThen(Ref.update(counter, (n) => n + 1)),
  )
  yield* Effect.all(Array.from({ length: 10 }, () => handle), { concurrency: "unbounded" })
  return yield* Ref.get(counter)
})
console.log(`Effect : ${await Effect.runPromise(program)} / 10`)
```

</div>
</div>

<!--
Honnêteté : `completed++` juste après l'await marcherait aussi. Le vrai bug, c'est la lecture et l'écriture séparées par un await ; Ref rend ce découpage impossible.
-->

---
layout: section
---

# Et maintenant ?
### L'écosystème, le frontend, et quand l'adopter

---

# L'écosystème

Depuis Effect 4 : **un seul paquet `effect`**, sans dépendance, et toutes les briques partagent le même numéro de version.

<div class="eco">
  <div class="eco-card eco-core"><div class="i-carbon-cube" /><div><code>effect</code><p>Le cœur : Effect, Layer, Schedule, Stream, Schema, Config…</p></div></div>
  <div class="eco-card"><div class="i-carbon-application" /><div><code>effect/http</code> <code>effect/sql</code> <code>effect/rpc</code> <code>effect/cli</code>…<p>Intégrés au package principal</p></div></div>
  <div class="eco-card"><div class="i-carbon-bare-metal-server" /><div><code>@effect/platform-node</code> / <code>-bun</code> / <code>-deno</code> / <code>-browser</code><p>Les implémentations par plateforme</p></div></div>
  <div class="eco-card"><div class="i-carbon-data-base" /><div><code>@effect/sql-pg</code>, <code>@effect/sql-sqlite-node</code>…<p>Les drivers de base de données</p></div></div>
  <div class="eco-card"><div class="i-carbon-chart-network" /><div><code>@effect/opentelemetry</code><p>Exporter les traces de <code>withSpan</code></p></div></div>
  <div class="eco-card"><div class="i-carbon-test-tool" /><div><code>@effect/vitest</code><p>Les tests</p></div></div>
</div>

<style>
.eco {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.9rem 1.2rem;
  margin-top: 1.2rem;
}
.eco-card {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 0.8rem 1rem;
  border: 1px solid var(--tech-border);
  border-radius: 12px;
  background: var(--tech-code-bg);
  font-size: 0.85rem;
}
.eco-card > [class^="i-carbon"] {
  flex: none;
  margin-top: 0.15rem;
  font-size: 1.5rem;
  color: var(--tech-cyan);
}
.eco-card code {
  white-space: nowrap;
}
.eco-card p {
  margin: 0.3rem 0 0;
  color: var(--tech-muted);
}
.eco-core {
  border: 2px solid transparent;
  background:
    linear-gradient(var(--tech-code-bg), var(--tech-code-bg)) padding-box,
    var(--tech-gradient) border-box;
}
</style>

---
zoom: 0.8
---

# Et côté frontend ? **Foldkit**

<div class="grid grid-cols-[1fr_1.25fr] gap-8">
<div>

Un **framework frontend** TypeScript **construit sur Effect**, architecturé comme Elm.

- **Un seul `Model`**, décrit par un `Schema` : tout l'état de l'app
- **Des `Message`** typés, une fonction **`update`** pure : chaque changement est visible
- **Les effets de bord sont des valeurs** (`Command`) : le runtime Effect gère concurrence, interruption, ressources
- Routing typé, SSR, composants UI accessibles, **DevTools** (et MCP pour les agents IA)
- Tests sans DOM ni mocks : *Story* et *Scene*

```bash
npx create-foldkit-app@latest
```

<div class="text-sm opacity-70 mt-2">
  <a href="https://foldkit.dev">foldkit.dev</a> · projet communautaire, encore en 0.x
</div>

</div>
<div>

```ts
import { Schema } from "effect"
import { Runtime, Update } from "foldkit"
import { Document, HtmlBuilder } from "foldkit/html"
import { defineMessageUnion } from "foldkit/message"
import { modifyFields } from "foldkit/struct"

// MODEL : l'état, décrit par un Schema
const Model = Schema.Struct({ count: Schema.Number })
type Model = typeof Model.Type

// MESSAGES : tout ce qui peut arriver
const Message = defineMessageUnion({ ClickedIncrement: {}, ClickedDecrement: {} })
type Message = typeof Message.Type

// UPDATE : (model, message) → nouveau model
const update = (model: Model, message: Message) =>
  Message.match<Update.Return<Model, Message>>(message, {
    ClickedIncrement: () => ({ model: modifyFields(model, { count: (n) => n + 1 }) }),
    ClickedDecrement: () => ({ model: modifyFields(model, { count: (n) => n - 1 }) }),
  })

// VIEW : model → HTML
const view = (model: Model, h: HtmlBuilder<Message>): Document => ({
  title: `Counter: ${model.count}`,
  body: h.div([], [
    h.button([h.OnClick(Message.ClickedDecrement())], ["-"]),
    h.p([], [model.count.toString()]),
    h.button([h.OnClick(Message.ClickedIncrement())], ["+"]),
  ]),
})
```

</div>
</div>

<!--
Foldkit (foldkit.dev, github.com/foldkit/foldkit) : « React, Vue, Svelte et Solid règlent le rendu et vous laissent l'architecture ; Foldkit vous donne l'architecture. »
Toute application Foldkit est un Effect ; le Model entier est un Schema ; les Commands utilisent les services, l'interruption, les ressources et la concurrence d'Effect.
Si le backend est déjà en Effect, on retrouve les mêmes outils et les mêmes patterns dans le navigateur.
Exemple : le Counter officiel, légèrement raccourci (sans Reset, init et entry.ts).
Honnêteté : pré-1.0, des breaking changes restent possibles. Dépend de effect ~4.1.
Alternative officielle si on veut garder React / Vue / Solid : Effect Atom (@effect/atom-react, -vue, -solid).
-->
---
zoom: 0.85
---

# Effect 🤝 les agents IA

Un code Effect est plus facile à écrire et à vérifier… pour un agent aussi

<div class="grid grid-cols-[1.1fr_1fr] gap-6 mt-4">
<div class="ai-why">
  <div class="ai-card"><span>🧭</span><div><b>Une structure prévisible</b><p><code>Effect.gen</code>, <code>Effect.fn</code>, services, layers : un seul style, rien à inventer</p></div></div>
  <div class="ai-card"><span>🔁</span><div><b>Le compilateur corrige l'agent</b><p>Une erreur non traitée, un service non fourni : visible dans le type (<code>E</code>, <code>R</code>), avant d'exécuter</p></div></div>
  <div class="ai-card"><span>🧰</span><div><b>Tout est déjà là</b><p>Retry, timeout, concurrence, validation, config : pas de librairie choisie au hasard</p></div></div>
  <div class="ai-card"><span>📚</span><div><b>La doc est dans le paquet</b><p><code>node_modules/effect/AGENTS.md</code>, <code>ai-docs/</code> et les sources, alignés sur la version installée</p></div></div>
</div>
<div class="ai-skill">
  <div class="ai-skill__title"><b>Le skill officiel</b><a href="https://www.skills.sh/effect-ts/skills/effect-ts">skills.sh</a></div>
  <div class="tech-prompt">npx skills add Effect-TS/skills</div>
  <ul>
    <li><code>effect-ts</code> : avant d'écrire du code Effect, l'agent lit <code>node_modules/effect/AGENTS.md</code>, puis les sources</li>
    <li><code>effect-v3-to-v4</code> : migrer un projet d'Effect 3 à Effect 4</li>
    <li>Claude Code, Cursor, Codex, GitHub Copilot… · <b>8,5 k</b> installations</li>
  </ul>
  <div class="ai-quote">« Effect feels insanely good to use with agents […] An outrageous advantage for any non-frontend TS code »<small>— Matt Pocock, oct. 2026</small></div>
  <div class="ai-repo">📁 Dans ce dépôt : un skill Effect (<code>.github/skills/effect</code>), et <code>backend/AGENTS.md</code> qui y renvoie</div>
</div>
</div>

<style>
.ai-why {
  display: grid;
  gap: 0.7rem;
}
.ai-card {
  display: flex;
  align-items: flex-start;
  gap: 0.9rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--tech-border);
  border-radius: 12px;
  background: var(--tech-code-bg);
}
.ai-card > span {
  font-size: 1.6rem;
  line-height: 1.2;
}
.ai-card b {
  color: var(--tech-fg-strong);
}
.ai-card p {
  margin: 0.2rem 0 0;
  font-size: 0.85rem;
  color: var(--tech-muted);
}
.ai-skill {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  padding: 1rem 1.2rem;
  border: 2px solid transparent;
  border-radius: 14px;
  background:
    linear-gradient(var(--tech-code-bg), var(--tech-code-bg)) padding-box,
    var(--tech-gradient) border-box;
}
.ai-skill__title {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  color: var(--tech-fg-strong);
}
.ai-skill__title a {
  font-size: 0.8rem;
}
.ai-skill .tech-prompt {
  align-self: flex-start;
}
.ai-skill ul {
  margin: 0;
  font-size: 0.88rem;
}
.ai-quote {
  padding: 0.6rem 0.9rem;
  border-left: 3px solid var(--tech-violet);
  border-radius: 6px;
  background: color-mix(in srgb, var(--tech-violet) 8%, transparent);
  font-size: 0.85rem;
  font-style: italic;
}
.ai-repo {
  margin-top: auto;
  padding-top: 0.7rem;
  border-top: 1px dashed var(--tech-border);
  font-size: 0.8rem;
  color: var(--tech-muted);
}
.ai-quote small {
  display: block;
  margin-top: 0.3rem;
  font-style: normal;
  color: var(--tech-muted);
}
</style>

<!--
Message : Effect est un très bon terrain pour les agents de code, et l'équipe Effect l'outille officiellement.
Pourquoi : un style unique (moins de « créativité » de l'agent), des erreurs et dépendances dans le type (le compilateur lui signale ce qu'il a oublié), tout est intégré (pas de dépendances au hasard), et la doc voyage avec le paquet.
Le paquet effect 4.0.0 contient AGENTS.md (≈ 400 lignes, identique à CLAUDE.md), ai-docs/ (76 fichiers d'exemples par thème : services, schedule, streams, http, sql, cli, cluster…) et les sources src/.
Le skill officiel (github.com/Effect-TS/skills) : effect-ts ajoute aux instructions de l'agent (AGENTS.md / CLAUDE.md) « lire node_modules/effect/AGENTS.md avant d'écrire du code Effect » ; effect-v3-to-v4 guide la migration.
Dans ce dépôt : un skill Effect dans .github/skills/effect, et backend/AGENTS.md qui y renvoie ; le plugin @effect/tsgo ajoute des diagnostics Effect au compilateur (encore du feedback pour l'agent).
Autres témoignages : Rhys Sullivan (mars 2026) : « in the long term it's much more token efficient than writing standard TS » ; T3 Code, « very large portions agent coded » ; Michael Arnaldi : donner le repo Effect à l'agent (git subtree).
Sources : skills.sh/effect-ts/skills/effect-ts (8,5 k installations au 4 nov. 2026), effect.website (« LLMs ❤️ Effect »), tweet de Matt Pocock du 1er oct. 2026.
-->
---

# Quand l'adopter ? (avec honnêteté)

<div class="grid grid-cols-2 gap-6">
<div class="px-4 pt-2 rounded-xl border border-green-500/30 bg-green-500/6">

### ✅ Oui si…
- Beaucoup d'I/O, d'erreurs et de dépendances
- Besoin de résilience (retry, timeout, annulation)
- Équipe prête à apprendre un nouveau paradigme

</div>
<div class="px-4 pt-2 rounded-xl border border-amber-500/30 bg-amber-500/6">

### ⚠️ Attention si…
- Petit script ou projet très simple
- Courbe d'apprentissage non budgétée
- Taille du bundle critique

</div>
</div>

<v-click>

👉 Adoption **progressive** possible : `Effect.runPromise` à la frontière de ton code existant.

</v-click>

<v-click>

<div class="mt-3 px-4 py-1 rounded-lg border border-green-500/40 bg-green-500/8">

**💼 Et côté emploi ?** Effect reste une compétence **de niche, mais recherchée** : le [job board officiel](https://effect.website/effect-jobs) liste une vingtaine d'entreprises qui recrutent, surtout dans **l'IA et les LLM** (OpenRouter, HumanLayer, Supermemory), **la fintech et l'assurance** (Gen, Reap, Tranched à Paris, Evalucar en France) et **les outils pour développeurs** (Warp, Solid). Des postes souvent seniors ou « founding engineer », affichés de **90–120 k€** à Munich à **plus de 200 k$** aux États-Unis.

</div>

</v-click>

<!--
Sources (vérifiées le 4 novembre 2026) :
- effect.website/effect-jobs : 20 entreprises listées. IA/LLM : OpenRouter, HumanLayer, Supermemory, Datapizza, SynTwin, Joymore. Fintech/insurtech : Gen, Reap, Tranched (Paris), Evalucar (France). Dev tools : Warp, Solid. Aussi santé (Medblocks), legaltech (LEAP), broadcast (Bitfocus).
- Salaires affichés : SynTwin 90–120 k€ (Munich), HumanLayer 180–250 k$ (SF), Gen 218–239 k$ (NYC).
- En production (effect.website) : OpenCode, OpenRouter, MasterClass ; Effect Days 2026 cite aussi Cloudflare, Warp, Alchemy.
- npm : ~74 M de téléchargements/semaine pour `effect`, mais gonflés par les dépendances indirectes (ex. @prisma/config dépend de effect) ; GitHub : ~17 500 étoiles.
- Honnêteté : marché encore petit ; c'est un atout différenciant sur un CV TypeScript, pas encore un mot-clé de masse.
-->
---
layout: center
class: text-center
---

# Merci ! <span class="tech-emoji">🙏</span>

Questions ?

<div class="grid grid-cols-[1fr_auto_1fr] gap-10 items-center text-left mt-8 text-sm">
<div>

### 🔗 Pour aller plus loin

- [effect.website/docs](https://effect.website/docs/) : la documentation
- [github.com/Effect-TS/effect](https://github.com/Effect-TS/effect) : le code source
- [discord.gg/effect-ts](https://discord.gg/effect-ts) : la communauté (très active)
- [Module of the Week](https://effect.website/module-of-the-week) : un module expliqué chaque semaine
- [Effect Days](https://effect.website/effect-days) : la conférence
- [Effect Jobs](https://effect.website/effect-jobs) : les offres d'emploi

</div>
<div class="text-center">
  <div class="inline-block bg-white p-3 rounded-xl shadow-lg">
    <img src="./images/qr-github-effect-ts.svg" alt="QR code vers github.com/Mimetis/effect-ts" class="w-44 h-44" style="image-rendering: pixelated" />
  </div>
  <div class="mt-2 font-mono text-xs">
    <a href="https://github.com/Mimetis/effect-ts">github.com/Mimetis/effect-ts</a>
  </div>
  <div class="text-xs opacity-70">slides + démos</div>
</div>
<div>

### 🐦 À suivre sur X

- [@EffectTS_](https://x.com/EffectTS_) : le compte officiel
- [@MichaelArnaldi](https://x.com/MichaelArnaldi) : créateur d'Effect
- [@kitlangton](https://x.com/kitlangton) : OpenCode, talks Effect
- [@mattiamanzati](https://x.com/mattiamanzati) : Effectful Technologies
- [@schickling](https://x.com/schickling) : local-first, LiveStore
- [@mattpocockuk](https://x.com/mattpocockuk) : TypeScript (et Effect)

</div>
</div>

<!--
Le QR code pointe vers https://github.com/Mimetis/effect-ts (slides et démos du talk).
Comptes X vérifiés : @EffectTS_ et @MichaelArnaldi cités par effect.website ; @kitlangton, @mattiamanzati, @schickling via leurs profils GitHub ; @mattpocockuk cité sur effect.website (« Why Effect was designed this way »).
-->
