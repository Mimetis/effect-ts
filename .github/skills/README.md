# Skills

Les skills d'agent du projet. GitHub Copilot (dans VS Code et en CLI) les détecte dans ce dossier et charge un skill à la demande, quand la tâche correspond à sa `description`. On peut aussi l'appeler explicitement en tapant `/effect` dans le chat.

## Les skills

| Skill | Rôle |
|---|---|
| [effect](./effect/SKILL.md) | Écrire, relire ou migrer du code vers Effect 4 (`effect` 4.0.0) : `Effect.gen` et `Effect.fn`, erreurs typées, services et layers, `Schema`, `Config`, retry et timeout, client HTTP, tests avec `@effect/vitest`, et migration depuis async/await, try/catch, `Promise.all` ou zod |

Le skill `effect` est adapté des guides [effect-solutions](https://github.com/kitlangton/effect-solutions) de Kit Langton (licence MIT), réécrits pour `effect` 4.0.0 : ces guides datent des bêtas de la v4, et plusieurs API ont changé depuis (`Schema.TaggedError`, `Schedule.upTo`, `Config.String`, `effect/http`…). Tous les exemples ont été vérifiés avec `tsc` contre `effect` 4.0.0, et les comportements décrits (retry, timeout, config, erreurs HTTP…) par des tests.

## Format d'un skill

Un skill est un dossier qui contient un `SKILL.md` :

```text
.github/skills/
└── effect/
    ├── SKILL.md       # obligatoire : règles et sommaire, chargé quand le skill sert
    └── references/    # docs détaillées, chargées seulement si besoin
```

Le `SKILL.md` commence par un frontmatter YAML. Le champ `name` doit être identique au nom du dossier, et la `description` dit quand utiliser le skill : c'est elle que l'agent lit pour décider de le charger.

Documentation : [Agent Skills dans VS Code](https://code.visualstudio.com/docs/copilot/customization/agent-skills).
