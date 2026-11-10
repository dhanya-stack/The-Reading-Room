# Between the Pages — The Reading Room

A complete, responsive personal reading-journal website for GitHub Pages. This is a **fresh rebuild** of the earlier Reading Room and Midnight Library prototypes.

## What's inside

- A distinctive illustrated room with **real clickable book spines** and growing, horizontal-scrollable bookshelves.
- **Two atmospheres:** the warm daylight Reading Room and the deep-green, lamplit Midnight Library; switch using the upper-right control.
- Publisher/edition cover imagery served from **Open Library** where an ISBN or cover ID is specified. If the connection or cover is unavailable, an illustrated title/author cover displays instead — no blank shelves.
- Search by title/author, filter by status or genre, explore a random book, inspect book details and published notes.
- A journal page that displays only **actually entered** public reflections; reading statistics that do not invent finished dates.
- An **author's desk** for adding/editing books, genres, ISBNs, reading status, progress, ratings, public notes and reflections; local drafts and one-click exports.
- No build tools, accounts, API keys, or framework. Works directly on GitHub Pages.

## Preview locally

Open `index.html` in any modern browser. Internet access is optional: the layout, text and editing work without it. Edition-cover images and web fonts use online services, with built-in fallbacks.

## Editor desk: how to add a book or publish your reflections

1. Open `index.html?edit=1` (when hosted, append `?edit=1` to the website URL).
2. Use **Add a book**, or open any book and select **Edit this entry**.
3. Write your notes in **Public journal note** and **After the last page**. Leave them blank if not ready to share. Press **Save on this device**.
4. Click **Export books.js for Codex**. This saves the full *public* catalogue, including whatever notes you chose to enter.
5. In your repository, **replace `data/books.js`** with that exported `books.js` and commit/push it. GitHub Pages updates when published. The public website then shows those changes.

**Important:** `?edit=1` is a local-content editing convenience, **not authentication**. It cannot change the live website by itself, and its drafts only affect the current browser. Everyone who opens the editor on a public site sees the published catalogue plus their own local edits, not your private draft. Only export and publish notes you intend to share.

Use **Download JSON backup** to keep an independent backup, or **Import** to restore a previous export. There is no server-side syncing or comments system at this stage.

## Files

- `index.html` — all page structure and accessible dialogs
- `styles.css` — themes, layout, wood shelves, and mobile styles
- `app.js` — navigation, bookshelf, covers, filters, modal, author desk and exports
- `data/books.js` — **single source of truth** for the catalogue; presently contains 47 imported books
- `assets/` — original botanical illustrations, windows and favicon
- `CODEX_PUBLISH.md` — deployment prompt and acceptance checklist

## Existing catalogue

The 47 books and broad statuses were carried over from the November 2026 prototype. **Please review the statuses and covers before publishing**: some entries were explicitly marked 'To confirm'; no reading dates, star ratings or reviews have been invented.

## Credits and technical notes

Cover images are requested from [Open Library](https://openlibrary.org/dev/docs/api/covers), with links to the corresponding edition when the ISBN is known. All other illustrative SVG assets were created for this project. The fonts use Google Fonts with Georgia/Arial fallbacks. No tracking or analytics are included.

Hosted on any ordinary static service, including GitHub Pages. Keep file structure unchanged. No npm install or build needed.
