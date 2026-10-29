# Contributing

Anyone can improve the reference. There are three ways in, easiest first.

## 1. Edit on GitHub

Every reference page on https://thecontractroom.com has an "Edit this entry on GitHub" link.
It opens the file in this repo. GitHub forks the repo and opens the pull request for you. You
need no git and no clone.

## 2. Open an issue

Use one of the issue forms.

- Suggest a piece: a link to an article, report, filing or podcast, and why it matters to a deal maker.
- Suggest an organisation: its website, what it sells, and one public source.
- Report an error: the page, what is wrong, and the source that shows it. The "Report an error" link on the site opens this form with the page filled in.

A maintainer turns the issue into a pull request.

## 3. Clone and run the checks

Run these from the repo root.

```
npm ci
npm run check
npm test
```

`npm run check` must end with `0 errors`. Run `npm run build` to produce the graph and the JSON-LD.

## Rules

- Make one change per pull request: one entry or one correction. Touch only the lines you are changing.
- Cite every fact. Each citation is a `source/...` entry that points at the public page that says it. The validator checks that the citation exists. The citation check fetches the page.
- Follow the voice rules in `docs/voice.md`. Write plain English, lead with the point, and keep to one idea per sentence. The style checker rejects em dashes and unsafe links.
- Never edit README.md, because it is regenerated on merge.
- Leave new entity types to the maintainers. A new type needs routes and display code on the site. The validator rejects unknown types.
- Write a piece as our summary and a link. Do not republish anything from the piece. Do not name a product of ours in a piece.

## Review

A maintainer replies within seven days. The reply is a merge, a request for changes, or a close with a reason.

## Licence

Code is MIT (see LICENSE). Content under `ontology/` and `docs/` is CC BY 4.0 (see LICENSE-CONTENT.md). Your contribution is released under the same terms.
