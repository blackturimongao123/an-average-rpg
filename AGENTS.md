# An Average RPG — AI starting prompt

Use this file when beginning work on this repo. Detailed rules live in `.cursor/rules/*.mdc` (always applied in Cursor).

---

## Copy-paste prompt (new session)

```
You are working on An Average RPG — a fantasy idle roguelite where players control a cursed bloodline across generations (not a single hero). Death is progression.

Stack: pnpm monorepo · React/Vite/Tailwind (apps/web) · Firebase (Auth, Firestore, Functions) · Rust/WASM (crates/) · JSON game content (game-data/).

Before coding:
1. Read AGENTS.md and relevant .cursor/rules/
2. Match existing patterns; keep diffs minimal
3. Server-authoritative gameplay — mutations in functions/src/actions/, not client-only
4. User-facing changes → bump APP_VERSION in apps/web/src/constants/version.ts
5. Never expose or commit secrets (.env, credentials)
6. When done → git add . && git commit && git push (triggers deploy on main)

Live site: GitHub Pages (peaceiris → gh-pages). Firebase project: an-average-rpg.
Verify deploy via sidebar footer: MVP vX.Y.Z must match APP_VERSION in repo.
```

---

## What this project is

**An Average RPG** is a browser game about a **family line**, not one character. Each **heir** can die; the **lineage** keeps the bank, bloodline skills, effects, and adventurer rank. Players loop: create heir → tavern / dungeons / jobs / missions / skills → death → inheritance → next generation.

Read `.cursor/rules/game-core-concepts.mdc` for full design rules.

---

## Repo map (short)

| Path | Purpose |
|------|---------|
| `apps/web/` | React UI — features, components, stores, Firebase client |
| `functions/` | Cloud Functions — authoritative game actions |
| `packages/shared/` | Shared types & schemas (`@bloodline/shared`) |
| `game-data/` | Static JSON (classes, skills, dungeons, events, …) |
| `crates/` | Rust simulation + WASM bindings |
| `.github/workflows/` | `web-pages.yml` (web build + Firebase + GitHub Pages) |

Full layout: `.cursor/rules/project-structure.mdc`.

**Aliases:** `@/` → `apps/web/src/` · `@game-data` → `game-data/`

---

## Architecture (non-negotiable)

- **Client is untrusted.** Combat, rewards, death, inheritance, bank, skill claims → `functions/src/actions/`.
- **Firestore** = live state (`lineages`, subcollections for heirs, bank, effects, …).
- **game-data/** = read-only content at build time; not mutated at runtime.
- New screen → `features/` + route in `App.tsx` + sidebar.
- New game rule → function action + export in `functions/src/index.ts` + callable in `apps/web/src/firebase/functions.ts` + types in `packages/shared/`.

---

## Dev commands

```bash
pnpm install          # deps
pnpm dev              # web @ localhost:3000
firebase emulators:start
pnpm build            # production web build
pnpm build:wasm       # Rust → apps/web/src/wasm
cargo test --workspace
pnpm --filter functions build
```

**Local env:** copy `apps/web/.env.example` → `apps/web/.env.local` (gitignored).

---

## Workflow rules (always follow)

### 1. Ship every change
After any completed edit: `git add .` → `git commit` → `git push`. See `.cursor/rules/git-ship-on-change.mdc`.

### 2. Bump version on player-facing changes
Increment patch semver in `apps/web/src/constants/version.ts`. Mention new version in summary. See `.cursor/rules/bump-app-version.mdc`.

### 3. Protect secrets
Never print, commit, or paste real keys. `.env*` is gitignored; CI uses GitHub Secrets. See `.cursor/rules/protect-secrets.mdc`.

### 4. Deploy happens on push to `main`
- **Web + Firebase:** one push to `main` → `web-pages.yml` builds the app, deploys Firebase backend, then publishes Pages.

See `.cursor/rules/deploy-on-push.mdc`.

---

## GitHub secrets (if CI fails after clean slate)

**Web build (6 required):** `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`

**Recommended:** `VITE_ALLOW_REGISTRATION`, `VITE_ALLOWED_USERNAMES`

**Firebase deploy (pick one — JSON keys are blocked on many accounts by org policy `iam.disableServiceAccountKeyCreation`):**

**Option A — Workload Identity Federation (recommended, no keys):** GitHub secrets `GCP_WORKLOAD_IDENTITY_PROVIDER` + `GCP_SERVICE_ACCOUNT`.

In [Cloud Shell](https://shell.cloud.google.com/?project=an-average-rpg) run (replace `REPO` if forked). **Skip pool create** if you already created `github-actions` (step 2 only).

```bash
PROJECT_ID=an-average-rpg
PROJECT_NUMBER=$(gcloud projects describe $PROJECT_ID --format='value(projectNumber)')
POOL_ID=github-actions
PROVIDER_ID=github
SA_ID=github-actions-firebase
SA_EMAIL=${SA_ID}@${PROJECT_ID}.iam.gserviceaccount.com
REPO=blackturimongao123/an-average-rpg

# 1) Service account (create if missing — keys not needed)
gcloud iam service-accounts describe $SA_EMAIL --project=$PROJECT_ID 2>/dev/null \
  || gcloud iam service-accounts create $SA_ID \
       --project=$PROJECT_ID --display-name="GitHub Actions Firebase Deploy"
for ROLE in roles/firebase.admin roles/cloudfunctions.admin roles/run.admin roles/iam.serviceAccountUser; do
  gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SA_EMAIL}" --role="$ROLE" --condition=None
done

# 2) Workload identity pool (skip if "already exists")
gcloud iam workload-identity-pools describe $POOL_ID --project=$PROJECT_ID --location=global 2>/dev/null \
  || gcloud iam workload-identity-pools create $POOL_ID \
       --project=$PROJECT_ID --location=global --display-name="GitHub Actions"

# 3) OIDC provider — attribute-condition is required on many orgs
gcloud iam workload-identity-pools providers describe $PROVIDER_ID \
  --project=$PROJECT_ID --location=global --workload-identity-pool=$POOL_ID 2>/dev/null \
  || gcloud iam workload-identity-pools providers create-oidc $PROVIDER_ID \
       --project=$PROJECT_ID --location=global --workload-identity-pool=$POOL_ID \
       --display-name="GitHub" --issuer-uri="https://token.actions.githubusercontent.com" \
       --attribute-mapping="google.subject=assertion.sub,attribute.actor=assertion.actor,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
       --attribute-condition="assertion.repository=='${REPO}'"

# 4) Let this repo impersonate the service account
gcloud iam service-accounts add-iam-policy-binding $SA_EMAIL --project=$PROJECT_ID \
  --role="roles/iam.workloadIdentityUser" \
  --member="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/attribute.repository/${REPO}"

echo "GCP_WORKLOAD_IDENTITY_PROVIDER=projects/${PROJECT_NUMBER}/locations/global/workloadIdentityPools/${POOL_ID}/providers/${PROVIDER_ID}"
echo "GCP_SERVICE_ACCOUNT=${SA_EMAIL}"
```

Paste the two echoed lines into GitHub → Settings → Secrets → Actions.

**Option B — CI token:** Set repository variable `FIREBASE_DEPLOY_AUTH` = `token`, then add secret `FIREBASE_TOKEN` from `firebase login:ci`.

---

## Verify live deploy

1. Push to `main` succeeds; GitHub Actions green.
2. Open live site; sidebar shows **MVP vX.Y.Z**.
3. That version must match `APP_VERSION` in `apps/web/src/constants/version.ts`.
4. If stale, hard-refresh or wait for CDN — compare version before debugging code.

**Pages setting:** Deploy from branch `gh-pages`, folder `/`.

---

## Coding standards

- **Minimal scope** — smallest correct diff; no drive-by refactors.
- **Match conventions** — read surrounding code before adding files.
- **Reuse** — extend existing functions/components; don’t duplicate logic.
- **Comments** — only for non-obvious business logic.
- **Tests** — add only when requested or for meaningful behavior coverage.

---

## Picking up a task

1. Clarify whether the change is UI, server logic, game data, or infra.
2. Read the relevant feature page + matching `functions/src/actions/` file + JSON in `game-data/`.
3. Update `@bloodline/shared` types if the domain model changes.
4. Update `firestore.rules` if Firestore access patterns change.
5. Bump `APP_VERSION` if players will notice.
6. Commit, push, report new version and what to test.

---

## Cursor rules index

| Rule file | Topic |
|-----------|--------|
| `game-core-concepts.mdc` | Game design & domain model |
| `project-structure.mdc` | Repo layout & where to put code |
| `git-ship-on-change.mdc` | Commit & push after every change |
| `bump-app-version.mdc` | Version bump on user-facing ship |
| `protect-secrets.mdc` | Secrets & `.gitignore` |
| `deploy-on-push.mdc` | GitHub Pages deploy; Firebase must run in same workflow run |
