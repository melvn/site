(() => {
  const openBtn = document.getElementById("search-open");
  const isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
  const kbd = document.querySelector(".menu-kbd");
  if (kbd) kbd.textContent = isMac ? "⌘K" : "Ctrl K";

  let palette = null;
  let input = null;
  let list = null;
  let posts = null;
  let loading = null;
  let results = [];
  let active = 0;
  let lastFocus = null;

  const load = () => {
    if (!loading) {
      loading = fetch("/assets/search.json")
        .then((r) => r.json())
        .then((data) => {
          posts = data.map((p) => ({
            ...p,
            _title: p.title.toLowerCase(),
            _desc: (p.description || "").toLowerCase(),
            _tags: (p.tags || "").toLowerCase(),
            _text: (p.text || "").toLowerCase(),
          }));
        })
        .catch(() => { posts = []; });
    }
    return loading;
  };

  const build = () => {
    palette = document.createElement("div");
    palette.className = "palette";
    palette.innerHTML =
      '<div class="palette-box" role="dialog" aria-modal="true" aria-label="Search posts">' +
      '<input class="palette-input" type="text" placeholder="Search posts…" autocomplete="off" spellcheck="false" role="combobox" aria-expanded="true" aria-controls="palette-results" aria-label="Search posts" />' +
      '<ul class="palette-results" id="palette-results" role="listbox"></ul>' +
      '<div class="palette-hint"><span>↑↓ to move</span><span>↵ to open</span><span>esc to close</span></div>' +
      "</div>";
    document.body.appendChild(palette);
    input = palette.querySelector(".palette-input");
    list = palette.querySelector(".palette-results");

    palette.addEventListener("mousedown", (e) => {
      if (e.target === palette) close();
    });
    input.addEventListener("input", () => render(input.value));
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
      else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
      else if (e.key === "Enter") {
        e.preventDefault();
        if (results[active]) location.href = results[active].url;
      } else if (e.key === "Escape") { e.preventDefault(); close(); }
    });
  };

  const score = (p, tokens) => {
    let s = 0;
    for (const t of tokens) {
      const inTitle = p._title.includes(t);
      const inTags = p._tags.includes(t);
      const inDesc = p._desc.includes(t);
      const inText = p._text.includes(t);
      if (!(inTitle || inTags || inDesc || inText)) return 0;
      s += (inTitle ? 6 : 0) + (inTags ? 3 : 0) + (inDesc ? 2 : 0) + (inText ? 1 : 0);
    }
    return s;
  };

  const render = (query) => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const all = posts || [];
    results = tokens.length
      ? all
          .map((p, i) => ({ p, s: score(p, tokens), i }))
          .filter((x) => x.s > 0)
          .sort((a, b) => b.s - a.s || a.i - b.i)
          .map((x) => x.p)
      : all.slice();
    active = 0;
    list.replaceChildren();
    if (!results.length) {
      const empty = document.createElement("li");
      empty.className = "palette-empty";
      empty.textContent = "No matching posts.";
      list.appendChild(empty);
      return;
    }
    results.forEach((p, i) => {
      const li = document.createElement("li");
      li.setAttribute("role", "option");
      li.id = "palette-opt-" + i;
      const a = document.createElement("a");
      a.className = "palette-item";
      a.href = p.url;
      a.setAttribute("aria-selected", i === 0 ? "true" : "false");
      const t = document.createElement("span");
      t.className = "palette-title";
      t.textContent = p.title;
      const d = document.createElement("span");
      d.className = "palette-desc";
      d.textContent = [p.date, p.description].filter(Boolean).join(" · ");
      a.append(t, d);
      a.addEventListener("mousemove", () => select(i));
      li.appendChild(a);
      list.appendChild(li);
    });
    input.setAttribute("aria-activedescendant", "palette-opt-0");
  };

  const select = (i) => {
    const items = list.querySelectorAll(".palette-item");
    if (!items.length) return;
    active = (i + items.length) % items.length;
    items.forEach((el, n) => el.setAttribute("aria-selected", n === active ? "true" : "false"));
    items[active].scrollIntoView({ block: "nearest" });
    input.setAttribute("aria-activedescendant", "palette-opt-" + active);
  };
  const move = (d) => select(active + d);

  const open = async () => {
    if (!palette) build();
    lastFocus = document.activeElement;
    palette.classList.add("on");
    input.value = "";
    input.focus();
    await load();
    render(input.value);
  };

  const close = () => {
    if (!palette) return;
    palette.classList.remove("on");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  };

  if (openBtn) openBtn.addEventListener("click", open);

  document.addEventListener("keydown", (e) => {
    const typing = /^(input|textarea|select)$/i.test(e.target.tagName) || e.target.isContentEditable;
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      palette && palette.classList.contains("on") ? close() : open();
    } else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
      e.preventDefault();
      open();
    }
  });
})();
