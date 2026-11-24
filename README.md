# Personal site

Personal site of Melvin Goxhaj, built with [Jekyll](https://jekyllrb.com).
The layout started from the [Klise](https://github.com/piharpi/jekyll-klise) theme (MIT, see `LICENSE`) and has since been reworked.

## Develop

```sh
bundle install
bundle exec jekyll serve
```

## Structure

- `_layouts/default.html` is the single page shell. Home, page, post and 404 layouts all wrap it.
- `_sass/_theme.scss` holds every colour as a CSS variable, with a light and a dark set.
- `_data/menus.yml` controls the navigation.
- Posts live in `_posts/<slug>/`, so images can sit next to the post.

## Writing a post

Create `_posts/<slug>/YYYY-MM-DD-<slug>.md` with this front matter:

```yaml
---
title: "Post title"
date: 2026-12-01 10:00:00 +1100
description: One sentence shown on the home page and under the title.
tags: [alignment]      # optional, used by search only
cite: true             # optional, adds a "Cite this post" BibTeX block
status: Draft          # optional label, e.g. Draft or Revised
modified: 2026-12-10   # optional, shows "Updated ..."
math: true             # optional, loads KaTeX for this post
---
```

What the template gives you with plain markdown:

- **Footnotes** (`[^1]`) become sidenotes in the right margin on wide screens and tap or hover popups on smaller ones.
- **Math** with `$a^2$` inline and `$$ ... $$` for display, when `math: true` is set.
- **Callouts**: put `{: .callout}` under a blockquote. Add `.definition`, `.claim`, `.caveat` or `.result` for a labelled variant.
- **Margin figures**: `![alt](image.png){: .margin}`. For a figure with a caption use `<figure class="margin">` or `<figure class="wide">`.
- **Code blocks** get a language label and a copy button.
- **Links to your other posts** show a hover preview.
- **Search**: press Ctrl or Cmd + K, or `/`, anywhere on the site.
- **Cite this post** with BibTeX appears at the end of posts that set `cite: true`.
