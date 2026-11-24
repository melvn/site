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
