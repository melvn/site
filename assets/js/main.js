(() => {
  const body = document.body;
  const media = window.matchMedia("(prefers-color-scheme: dark)");

  // Theme: follows the system until the reader picks one.
  const applyTheme = (theme) => {
    if (theme === "dark") body.setAttribute("data-theme", "dark");
    else body.removeAttribute("data-theme");
  };

  const lamp = document.getElementById("mode");
  if (lamp) {
    lamp.addEventListener("click", () => {
      const next = body.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      localStorage.setItem("theme", next);
    });
  }

  const followsSystem = () =>
    !localStorage.getItem("theme") &&
    body.getAttribute("data-default-theme") === "system";

  media.addEventListener("change", (e) => {
    if (followsSystem()) applyTheme(e.matches ? "dark" : "light");
  });

  // Table of contents: sidebar on wide screens, collapsible on narrow ones.
  const content = document.querySelector(".page-content");
  const tocEl = document.getElementById("toc");
  if (content && tocEl) {
    const headings = Array.from(content.querySelectorAll("h2, h3")).filter((h) => h.id);
    const sidebar = document.querySelector(".toc-sidebar");

    if (headings.length > 1) {
      const build = () => {
        const ul = document.createElement("ul");
        headings.forEach((heading) => {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = "#" + heading.id;
          a.textContent = heading.textContent.replace(/^#\s*/, "").trim();
          if (heading.tagName === "H3") li.classList.add("toc-h3");
          li.appendChild(a);
          ul.appendChild(li);
        });
        return ul;
      };

      tocEl.appendChild(build());
      const mobile = document.getElementById("toc-m");
      const mobileWrap = document.getElementById("toc-mobile");
      if (mobile && mobileWrap) {
        mobile.appendChild(build());
        mobileWrap.hidden = false;
        mobile.addEventListener("click", (e) => {
          if (e.target.closest("a")) mobileWrap.open = false;
        });
      }

      const links = document.querySelectorAll("#toc a, #toc-m a");
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
          });
        },
        { rootMargin: "-10% 0px -80% 0px" }
      );
      headings.forEach((h) => observer.observe(h));
    } else if (sidebar) {
      sidebar.style.display = "none";
    }
  }

  // Reading progress on posts
  const bar = document.getElementById("progress");
  if (bar && content && document.querySelector(".wrapper.post")) {
    let ticking = false;
    const update = () => {
      const r = content.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (window.innerHeight * 0.25 - r.top) / r.height));
      bar.style.transform = "scaleX(" + p + ")";
      bar.classList.toggle("on", window.scrollY > 40 && p > 0.004);
      ticking = false;
    };
    window.addEventListener("scroll", () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  // Code blocks: language label and copy button
  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  };

  const flash = (btn, done, idle) => {
    btn.textContent = done;
    btn.classList.add("done");
    setTimeout(() => {
      btn.textContent = idle;
      btn.classList.remove("done");
    }, 1400);
  };

  document.querySelectorAll("div.highlighter-rouge").forEach((block) => {
    const code = block.querySelector("pre code");
    if (!code) return;
    const match = Array.from(block.classList).find((c) => c.startsWith("language-"));
    const lang = match ? match.replace("language-", "") : "";

    const tools = document.createElement("div");
    tools.className = "code-tools";
    if (lang && lang !== "plaintext") {
      const label = document.createElement("span");
      label.className = "code-lang";
      label.textContent = lang;
      tools.appendChild(label);
    }
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "code-copy";
    btn.textContent = "Copy";
    btn.setAttribute("aria-label", "Copy code to clipboard");
    btn.addEventListener("click", async () => {
      await copyText(code.innerText.replace(/\n$/, ""));
      flash(btn, "Copied", "Copy");
    });
    tools.appendChild(btn);
    block.classList.add("has-tools");
    block.prepend(tools);
  });

  // BibTeX copy
  document.querySelectorAll(".cite").forEach((cite) => {
    const btn = cite.querySelector(".cite-copy");
    const code = cite.querySelector(".cite-code");
    if (btn && code) {
      btn.addEventListener("click", async () => {
        await copyText(code.innerText);
        flash(btn, "Copied", "Copy BibTeX");
      });
    }
  });
})();
