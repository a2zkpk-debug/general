(() => {
  "use strict";

  const doc = document;
  const header = doc.querySelector(".site-header");
  const menuToggle = doc.querySelector(".menu-toggle");
  const navLinks = doc.querySelector(".nav-links");
  const yearEl = doc.getElementById("year");

  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* Sticky header state */
  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile nav */
  if (menuToggle && navLinks) {
    const setOpen = (open) => {
      menuToggle.setAttribute("aria-expanded", String(open));
      navLinks.classList.toggle("is-open", open);
      doc.body.classList.toggle("nav-open", open);
    };

    menuToggle.addEventListener("click", () => {
      const open = menuToggle.getAttribute("aria-expanded") !== "true";
      setOpen(open);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setOpen(false));
    });

    doc.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setOpen(false);
    });
  }

  /* Reveal on scroll */
  const reveals = doc.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* Stat counters */
  const counters = doc.querySelectorAll("[data-count]");
  if (counters.length && "IntersectionObserver" in window) {
    const animate = (el) => {
      const target = Number(el.getAttribute("data-count")) || 0;
      const suffix = el.getAttribute("data-suffix") || "";
      const duration = 1400;
      const start = performance.now();

      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const cio = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animate(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    counters.forEach((el) => cio.observe(el));
  } else {
    counters.forEach((el) => {
      el.textContent =
        (el.getAttribute("data-count") || "0") +
        (el.getAttribute("data-suffix") || "");
    });
  }

  /* Testimonials slider */
  const track = doc.querySelector("[data-testimonials]");
  if (track) {
    const cards = Array.from(track.querySelectorAll(".tcard"));
    if (cards.length > 1) {
      let index = 0;
      const dotsWrap = doc.createElement("div");
      dotsWrap.className = "t-dots";
      dotsWrap.setAttribute("role", "tablist");
      dotsWrap.setAttribute("aria-label", "Testimonials");

      const show = (i) => {
        index = (i + cards.length) % cards.length;
        cards.forEach((card, n) => {
          card.hidden = n !== index;
          card.classList.toggle("is-active", n === index);
        });
        dotsWrap.querySelectorAll("button").forEach((btn, n) => {
          btn.setAttribute("aria-selected", String(n === index));
          btn.classList.toggle("is-active", n === index);
        });
      };

      cards.forEach((_, n) => {
        const btn = doc.createElement("button");
        btn.type = "button";
        btn.setAttribute("role", "tab");
        btn.setAttribute("aria-label", `Show testimonial ${n + 1}`);
        btn.addEventListener("click", () => {
          show(n);
          restart();
        });
        dotsWrap.appendChild(btn);
      });

      track.after(dotsWrap);
      show(0);

      let timer = null;
      const restart = () => {
        clearInterval(timer);
        timer = setInterval(() => show(index + 1), 5500);
      };
      restart();

      track.addEventListener("mouseenter", () => clearInterval(timer));
      track.addEventListener("mouseleave", restart);
    }
  }
})();
