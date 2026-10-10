# Investor version — handoff notes

Two versions of the OraCare prototype now live in the same GitHub repo
(`dainabo/oracare-app`) and the same Vercel project. The public link
`oracare-app.vercel.app` shows whichever one Vercel treats as **Production**.

| Branch          | What it is                                   | Edited?            |
| --------------- | -------------------------------------------- | ------------------ |
| `main`          | Investor pitch version (general, not women's health) | Yes — all new work |
| `womens-health` | Frozen original women's-health version (commit `a6707b6`, live as of 2026-07-30) | **Never** |

Created 2026-10-10.

---

## Current state

- Vercel production branch: **`main`**
- So `oracare-app.vercel.app` = investor version (once the edits are pushed).
- Every push to `main` updates the live link automatically.

---

## The permanent women's-health URL

Vercel gives every branch its own URL that always shows the latest build of
that branch. For `womens-health` (confirmed working 2026-10-10):

```
https://oracare-app-git-womens-health-daina-bo-s-projects.vercel.app
```

The branch's head is an empty commit (`1271322`) on top of `a6707b6`, added
only to make Vercel build the branch — the files are identical to the
original.

To find it again in the dashboard:

1. Open the **oracare** project in Vercel.
2. Go to **Deployments**.
3. Filter by branch (or look for a row whose source says `womens-health`).
4. Click it. Under **Domains** you'll see the branch URL (`...-git-womens-health-...`).

**Note:** on the free plan, preview URLs are protected by default ("Vercel
Authentication") — only you, logged into Vercel, can open them. Anyone else
gets a login wall. If you need to share it with someone, turn it off in
**Settings → Deployment Protection**, or just switch Production back
(see below) so the main link shows women's health.

---

## How to switch the live link to women's health

1. Vercel → **oracare** project → **Settings**.
2. Find the production branch setting. In the current UI it's under
   **Environments → Production → Branch Tracking**; older UI shows it under
   **Git → Production Branch**.
3. Change `main` → `womens-health`. Save.
4. Go to **Deployments**, find the latest `womens-health` deployment,
   click **⋯ → Redeploy** (or **Promote to Production** if offered).
5. Wait ~1 minute. Open `oracare-app.vercel.app` to confirm.

## How to switch back to the investor version

Same steps, but set the branch back to `main`, then redeploy the latest
`main` deployment.

---

## Free-plan (Hobby) gotchas

- **Instant Rollback only goes back ONE production deployment.** After a few
  pushes to `main`, it can't reach the women's-health version. Use the branch
  switch above instead — don't rely on the rollback button.
- **If you ever press Instant Rollback, Vercel stops auto-publishing new
  pushes** to the live link until you click **Undo Rollback**. If edits
  suddenly "aren't showing up", check for this first.
- Branches and preview builds are free. Nothing here costs money.

---

## Rules for working on the code

- All investor edits go on `main`.
- Never edit, commit to, or push to `womens-health`. It's the backup.
- If `womens-health` ever needs a fix, decide it explicitly first —
  it's meant to stay identical to the version sent with the original deck.

## If something goes badly wrong

The women's-health version is safe in git no matter what happens on `main`.
Worst case, in the project folder:

```
git checkout womens-health
```

shows the original files locally. Ask Claude to help restore from there.
