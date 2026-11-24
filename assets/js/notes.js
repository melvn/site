(() => {
  const content = document.querySelector(".page-content");
  if (!content) return;

  const wide = window.matchMedia("(min-width: 1280px)");
  const canHover = window.matchMedia("(hover: hover)");

  // One shared popover, used for footnotes (narrow screens) and link previews.
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

  const show = (anchor, fill) => {
    clearTimeout(hideTimer);
    owner = anchor;
    pop.replaceChildren();
    fill(pop);
    pop.classList.add("on");
    const a = anchor.getBoundingClientRect();
    const pw = pop.offsetWidth;
    const ph = pop.offsetHeight;
    let left = a.left + window.scrollX;
    left = Math.max(12, Math.min(left, window.scrollX + document.documentElement.clientWidth - pw - 12));
    let top = a.bottom + window.scrollY + 8;
    if (a.bottom + ph + 16 > window.innerHeight && a.top > ph + 16) {
      top = a.top + window.scrollY - ph - 8;
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
  const noteHtml = (li) => {
    const clone = li.cloneNode(true);
    clone.querySelectorAll("a.reversefootnote, a[role='doc-backlink']").forEach((a) => a.remove());
    const paras = clone.querySelectorAll(":scope > p");
    return paras.length === 1 ? paras[0].innerHTML.trim() : clone.innerHTML.trim();
  };

  const refs = content.querySelectorAll("sup[role='doc-noteref'] > a, a.footnote");
  const noteFor = new Map();

  refs.forEach((ref, i) => {
    const id = (ref.getAttribute("href") || "").replace(/^#/, "");
    const li = id && document.getElementById(id);
    if (!li) return;
    const html = noteHtml(li);
    noteFor.set(ref, html);

    const side = document.createElement("span");
    side.className = "sidenote";
    const num = document.createElement("span");
    num.className = "sidenote-num";
    num.textContent = String(i + 1);
    side.appendChild(num);
    side.insertAdjacentHTML("beforeend", html);
    const anchor = ref.closest("sup") || ref;
    anchor.after(side);

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

  if (noteFor.size) content.classList.add("has-sidenotes");

  // Previews for links to other pages on this site.
  if (!canHover.matches) return;

  const cache = new Map();
  const fetchMeta = (url) => {
    if (!cache.has(url)) {
      cache.set(
        url,
        fetch(url, { credentials: "same-origin" })
          .then((r) => (r.ok ? r.text() : Promise.reject(new Error("bad status"))))
          .then((text) => {
            const doc = new DOMParser().parseFromString(text, "text/html");
            const title = (doc.querySelector("h1.header-title") || doc.querySelector("title"))?.textContent.trim();
            const desc = doc.querySelector("meta[name='description']")?.getAttribute("content") || "";
            return { title, desc };
          })
          .catch(() => null)
      );
    }
    return cache.get(url);
  };

  content.querySelectorAll("a[href]").forEach((a) => {
    if (a.origin !== location.origin) return;
    if (a.classList.contains("footnote") || a.classList.contains("anchor-head")) return;
    if (a.pathname === location.pathname) return;
    if (/\.[a-z0-9]{2,5}$/i.test(a.pathname) && !/\.html?$/i.test(a.pathname)) return;

    let timer = null;
    let hovering = false;
    a.addEventListener("mouseenter", () => {
      hovering = true;
      clearTimeout(timer);
      timer = setTimeout(async () => {
        const meta = await fetchMeta(a.origin + a.pathname);
        if (!meta || !meta.title || !hovering) return;
        show(a, (box) => {
          const t = document.createElement("span");
          t.className = "popover-title";
          t.textContent = meta.title;
          box.appendChild(t);
          if (meta.desc) {
            const d = document.createElement("span");
            d.className = "popover-desc";
            d.textContent = meta.desc;
            box.appendChild(d);
          }
        });
      }, 250);
    });
    a.addEventListener("mouseleave", () => {
      hovering = false;
      clearTimeout(timer);
      scheduleHide();
    });
  });
})();
