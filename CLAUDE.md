# CLAUDE.md

## Deployments: GitHub Actions only, never Netlify builds

Netlify now bills by build minutes/credits and the allowance runs out quickly, so
**all deploys go through GitHub Actions** (`.github/workflows/deploy.yml`). The
workflow builds on GitHub's runners and only *uploads* the result to Netlify, which
keeps Netlify build usage near zero.

Each production deploy still costs ~15 Netlify credits (the team ran out on
2026-10-19), so **production deploys are manual only**:

- **Push to `main`:** runs `netlify build` on the runner as a free CI check. Nothing
  is uploaded or deployed.
- **To deploy to production:** `gh workflow run deploy.yml`, and **only when the user
  asks for a deploy.** It ships whatever is on `main`. Never deploy just because you pushed.
- **Pull requests** still get a draft preview at `pr-<number>--<site>.netlify.app`.
- **Do not** run `netlify deploy`, `netlify build`, or `netlify deploy --build` locally.
- **Do not** trigger deploys/builds through the Netlify UI, Netlify build hooks, or the
  Netlify MCP deploy tools.
- **Do not** re-enable Netlify's Git-triggered builds (Site configuration → Build &
  deploy → Stop builds must stay on), or every push builds twice.
- Netlify is still the host: site env vars/secrets live in the Netlify site settings
  and `netlify deploy --build` in CI pulls them from there. GitHub only holds
  `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID`.
- If a deploy fails, read the GitHub Actions run logs (`gh run list`, `gh run view --log-failed`)
  rather than starting a Netlify build to debug.
