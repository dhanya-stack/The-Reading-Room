# Authoring The Reading Room

The public site has no editor mode. The old `?edit=1` URL is intentionally not an authoring route: a URL parameter and browser storage do not authenticate anyone and cannot publish safely.

## First-time setup

1. Visit [Pages CMS](https://app.pagescms.org/) and sign in with the GitHub account that owns `dhanya-stack/The-Reading-Room`.
2. When Pages CMS asks, install its GitHub App for that repository only. GitHub then controls who can write to the repository; visitors to the public site cannot edit it.
3. Open the `main` branch and choose **Reading catalogue**. The CMS uses `.pages.yml` in this repository to edit `data/books.json`.

## Publishing a reflection

1. Find the book, add or edit its journal note and/or longer reflection, then select **Publish this reflection publicly**.
2. Set the status to one of the three public categories. A legacy paused or rereading title is displayed under **Currently reading**.
3. Save in Pages CMS. This commits the change to `main`; GitHub Pages then publishes it automatically.

Only checked reflections are shown to visitors. Do not put private drafts into `data/books.json` or another public repository file: Git history and GitHub Pages are public. Private drafts need a separate private repository or private CMS backend, which is deliberately not configured here.

You can verify a save by opening the [live website](https://dhanya-stack.github.io/The-Reading-Room/) after the Pages deployment completes.
