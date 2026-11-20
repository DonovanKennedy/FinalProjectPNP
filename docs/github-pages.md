# Publish NP-Hardness Explorer to GitHub Pages

The website is entirely static. GitHub Pages serves the compiled HTML, CSS, and
JavaScript; it does not run the unused API or database packages.

## One-time setup

1. Push this entire repository to GitHub, including `.github/workflows/github-pages.yml`.
2. Open the repository's **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Open **Actions → Publish website to GitHub Pages → Run workflow** and choose
   the default branch. Future pushes to the default branch publish automatically.
5. After the workflow succeeds, find the live link in **Settings → Pages** or
   the workflow's deployment result.

No personal access token or custom secret is required. GitHub supplies the
workflow's limited publishing permissions. Repository or organization policy
must allow GitHub Actions and GitHub Pages.

## What the workflow does

- Installs dependencies with pnpm 10.26.1 and Node.js 24.
- Runs the automated graph algorithm tests before building.
- Reads the site's base path from GitHub Pages settings, so both
  `https://owner.github.io/repository/` and root/custom-domain sites work.
- Builds only the NP-Hardness Explorer website.
- Uploads `artifacts/np-hardness-explorer/dist/public`, which contains the
  generated main `index.html` and all bundled assets.
- Publishes only the default branch, never feature branches or tags.

The editable source entry is `artifacts/np-hardness-explorer/index.html`.
Uploading only that source HTML will not work: publish the compiled directory.

## Reproduce a project-site build locally

From the repository root, after installing dependencies:

```sh
PORT=4173 BASE_PATH=/your-repository-name/ NODE_ENV=production \
  pnpm --filter @workspace/np-hardness-explorer run build
```

For a root or custom-domain site, use `BASE_PATH=/`.

If a workflow reports that the Pages site was not found, complete the one-time
Pages setup above and rerun it. This workflow does not automatically enable a
public site or change repository settings.
