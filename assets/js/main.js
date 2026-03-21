(() => {
  // Table of contents
  const tocEl = document.getElementById("toc");
  if (tocEl) {
    const headings = Array.from(
      document.querySelectorAll(".page-content h2, .page-content h3")
    ).filter((h) => h.id);

    if (headings.length > 1) {
      const ul = document.createElement("ul");

      headings.forEach((heading) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = "#" + heading.id;
        a.textContent = heading.textContent.trim();
        if (heading.tagName === "H3") li.classList.add("toc-h3");
        li.appendChild(a);
        ul.appendChild(li);
      });

      tocEl.appendChild(ul);

      // Highlight active heading on scroll
      const tocLinks = tocEl.querySelectorAll("a");
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              tocLinks.forEach((a) => a.classList.remove("active"));
              const active = tocEl.querySelector(
                `a[href="#${entry.target.id}"]`
              );
              if (active) active.classList.add("active");
            }
          });
        },
        { rootMargin: "-10% 0px -80% 0px" }
      );

      headings.forEach((h) => observer.observe(h));
    } else {
      // Hide sidebar when there are no headings worth a TOC
      const sidebar = document.querySelector(".toc-sidebar");
      if (sidebar) sidebar.style.display = "none";
    }
  }

  // Theme switch
  const body = document.body;
  const lamp = document.getElementById("mode");

  const toggleTheme = (state) => {
    if (state === "dark") {
      localStorage.setItem("theme", "light");
      body.removeAttribute("data-theme");
    } else if (state === "light") {
      localStorage.setItem("theme", "dark");
      body.setAttribute("data-theme", "dark");
    } else {
      initTheme(state);
    }
  };

  lamp.addEventListener("click", () =>
    toggleTheme(localStorage.getItem("theme"))
  );

  // Blur the content when the menu is open
  const cbox = document.getElementById("menu-trigger");

  cbox.addEventListener("change", function () {
    const area = document.querySelector(".wrapper");
    this.checked
      ? area.classList.add("blurry")
      : area.classList.remove("blurry");
  });
})();
