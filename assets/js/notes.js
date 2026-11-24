(() => {
  const wide = window.matchMedia("(min-width: 1280px)");
  const canHover = window.matchMedia("(hover: hover)");

  // One shared popover, used for footnotes (narrow screens) and page previews.
  const pop = document.createElement("div");
  pop.className = "popover";
  pop.setAttribute("role", "tooltip");
  document.body.appendChild(pop);

  let hideTimer = null;
  let owner = null;

  const hide = () => {
    clearTimeout(hideTimer);
    pop.classList.remove("on");
    owner = null;
  };

  const scheduleHide = () => {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 160);
  };

  const show = (anchor, fill, card) => {
    clearTimeout(hideTimer);
    owner = anchor;
    pop.classList.toggle("card", !!card);
    pop.scrollTop = 0;
    pop.replaceChildren();
    fill(pop);
    pop.classList.add("on");
    const a = anchor.getBoundingClientRect();
    const pw = pop.offsetWidth;
    const ph = pop.offsetHeight;
    let left = a.left + window.scrollX;
    left = Math.max(12, Math.min(left, window.scrollX + document.documentElement.clientWidth - pw - 12));
    let top = a.bottom + window.scrollY + 6;
    if (a.bottom + ph + 16 > window.innerHeight && a.top > ph + 16) {
      top = a.top + window.scrollY - ph - 6;
    }
    pop.style.left = left + "px";
    pop.style.top = top + "px";
  };

  pop.addEventListener("mouseenter", () => clearTimeout(hideTimer));
  pop.addEventListener("mouseleave", scheduleHide);
  window.addEventListener("scroll", () => { if (owner) hide(); }, { passive: true });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") hide(); });
  document.addEventListener("click", (e) => {
    if (owner && !pop.contains(e.target) && !owner.contains(e.target)) hide();
  });

  // Footnotes: sidenotes in the margin on wide screens, popups otherwise.
  const content = document.querySelector(".page-content");

  if (content) {
    const noteHtml = (li) => {
      const clone = li.cloneNode(true);
      clone.querySelectorAll("a.reversefootnote, a[role='doc-backlink']").forEach((a) => a.remove());
      const paras = clone.querySelectorAll(":scope > p");
      return paras.length === 1 ? paras[0].innerHTML.trim() : clone.innerHTML.trim();
    };

    let count = 0;
    content.querySelectorAll("a.footnote").forEach((ref, i) => {
      const id = (ref.getAttribute("href") || "").replace(/^#/, "");
      const li = id && document.getElementById(id);
      if (!li) return;
      const html = noteHtml(li);
      count += 1;

      const side = document.createElement("span");
      side.className = "sidenote";
      const num = document.createElement("span");
      num.className = "sidenote-num";
      num.textContent = String(i + 1);
      side.appendChild(num);
      side.insertAdjacentHTML("beforeend", html);
      (ref.closest("sup") || ref).after(side);

      const open = () => show(ref, (box) => { box.innerHTML = html; });
      ref.addEventListener("click", (e) => {
        e.preventDefault();
        if (wide.matches) {
          side.scrollIntoView({ block: "center", behavior: "smooth" });
        } else if (owner === ref) {
          hide();
        } else {
          open();
        }
      });
      if (canHover.matches) {
        ref.addEventListener("mouseenter", () => { if (!wide.matches) open(); });
        ref.addEventListener("mouseleave", scheduleHide);
      }
    });

    if (count) content.classList.add("has-sidenotes");
  }

  // Page previews: a card with the opening of the post, for links to other pages.
  if (!canHover.matches) return;

  const clip = (text, max) => {
    if (text.length <= max) return text;
    const cut = text.slice(0, max);
    return cut.slice(0, cut.lastIndexOf(" ")).replace(/[.,;:\s]+$/, "") + "…";
  };

  const cache = new Map();
  const fetchPage = (url) => {
    if (!cache.has(url)) {
      cache.set(
        url,
        fetch(url, { credentials: "same-origin" })
          .then((r) => (r.ok ? r.text() : Promise.reject(new Error("bad status"))))
          .then((text) => {
            const doc = new DOMParser().parseFromString(text, "text/html");
            const title = (doc.querySelector("h1.header-title") || doc.querySelector("title"))?.textContent.trim();
            const date = doc.querySelector("time[itemprop='datePublished']")?.textContent.trim() || "";
            const read = doc.querySelector(".read-time")?.textContent.trim() || "";
            const desc =
              doc.querySelector(".post-abstract")?.textContent.trim() ||
              doc.querySelector("meta[name='description']")?.getAttribute("content") ||
              "";
            const body = doc.querySelector(".page-content");
            const paras = body
              ? Array.from(body.querySelectorAll(":scope > p"))
                  .map((p) => {
                    p.querySelectorAll("sup, .sidenote").forEach((n) => n.remove());
                    return p.textContent.replace(/\s+/g, " ").trim();
                  })
                  .filter((t) => t.length > 40)
                  .slice(0, 2)
                  .map((t) => clip(t, 300))
              : [];
            return { title, meta: [date, read].filter(Boolean).join(" · "), desc, paras };
          })
          .catch(() => null)
      );
    }
    return cache.get(url);
  };

  const fillCard = (box, page) => {
    const t = document.createElement("span");
    t.className = "popover-title";
    t.textContent = page.title;
    box.appendChild(t);
    if (page.meta) {
      const m = document.createElement("span");
      m.className = "popover-meta";
      m.textContent = page.meta;
      box.appendChild(m);
    }
    const text = document.createElement("div");
    text.className = "popover-text";
    const parts = page.paras.length ? page.paras : page.desc ? [page.desc] : [];
    parts.forEach((p) => {
      const el = document.createElement("p");
      el.textContent = p;
      text.appendChild(el);
    });
    box.appendChild(text);
  };

  const selector = [
    ".page-content a[href]",
    ".post-item-title a",
    ".intro-bio a[href]",
    ".post-nav a",
  ].join(", ");

  document.querySelectorAll(selector).forEach((a) => {
    if (a.origin !== location.origin) return;
    if (a.classList.contains("footnote") || a.classList.contains("anchor-head")) return;
    if (a.pathname === location.pathname) return;
    if (/\.[a-z0-9]{2,5}$/i.test(a.pathname) && !/\.html?$/i.test(a.pathname)) return;

    let timer = null;
    let active = false;

    const open = async () => {
      const page = await fetchPage(a.origin + a.pathname);
      if (!page || !page.title || !active) return;
      show(a, (box) => fillCard(box, page), true);
    };

    a.addEventListener("mouseenter", () => {
      active = true;
      clearTimeout(timer);
      timer = setTimeout(open, 250);
    });
    a.addEventListener("mouseleave", () => {
      active = false;
      clearTimeout(timer);
      scheduleHide();
    });
    a.addEventListener("focus", () => {
      if (!a.matches(":focus-visible")) return;
      active = true;
      open();
    });
    a.addEventListener("blur", () => {
      active = false;
      scheduleHide();
    });
  });
})();
