/**
 * Cyber Connections — small interactive behaviors
 * Preloader, theme toggle, mobile nav, smooth scroll, form validation, scroll reveal
 */

(function () {
  "use strict";

  var THEME_KEY = "cyber-connections-theme";
  var HEADER_OFFSET = 72;

  /* ---------- Preloader (bonus) ---------- */
  var preloader = document.getElementById("preloader");
  var minPreloadMs = 900;

  function hidePreloader() {
    if (!preloader) return;
    preloader.classList.add("is-done");
    preloader.setAttribute("aria-hidden", "true");
  }

  var preloadStart = Date.now();
  window.addEventListener("load", function () {
    var elapsed = Date.now() - preloadStart;
    var wait = Math.max(0, minPreloadMs - elapsed);
    setTimeout(hidePreloader, wait);
  });

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ---------- Dark / light theme (bonus) ---------- */
  var themeToggle = document.getElementById("themeToggle");
  var root = document.documentElement;

  function applyTheme(theme) {
    if (theme === "light") {
      root.setAttribute("data-theme", "light");
    } else {
      root.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (e) {
      /* ignore quota / private mode */
    }
  }

  function readStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }

  (function initTheme() {
    var stored = readStoredTheme();
    if (stored === "light" || stored === "dark") {
      applyTheme(stored === "light" ? "light" : "dark");
    }
  })();

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var isLight = root.getAttribute("data-theme") === "light";
      applyTheme(isLight ? "dark" : "light");
    });
  }

  /* ---------- Mobile menu ---------- */
  var navToggle = document.getElementById("navToggle");
  var siteNav = document.getElementById("siteNav");
  var navLinks = siteNav ? siteNav.querySelectorAll('a[href^="#"]') : [];

  function setNavOpen(open) {
    document.body.classList.toggle("nav-open", open);
    if (navToggle) {
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    }
  }

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", function () {
      setNavOpen(!document.body.classList.contains("nav-open"));
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        setNavOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        setNavOpen(false);
      }
    });
  }

  /* ---------- Smooth scroll for in-page links (accounts for sticky header) ---------- */
  function scrollToHash(hash, behavior) {
    if (!hash || hash === "#") return;
    var target = document.querySelector(hash);
    if (!target) return;
    var top = target.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET;
    window.scrollTo({
      top: Math.max(0, top),
      behavior: behavior || "smooth",
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener("click", function (e) {
      var href = anchor.getAttribute("href");
      if (!href || href.length < 2) return;
      var isSamePage = !anchor.hasAttribute("download") && anchor.getAttribute("target") !== "_blank";
      if (!isSamePage) return;
      if (document.querySelector(href)) {
        e.preventDefault();
        scrollToHash(href, "smooth");
        if (history.replaceState) {
          history.replaceState(null, "", href);
        }
      }
    });
  });

  /* Open correct section if page loaded with hash */
  if (window.location.hash) {
    window.requestAnimationFrame(function () {
      scrollToHash(window.location.hash, "auto");
    });
  }

  /* ---------- Contact form validation (frontend only) ---------- */
  var form = document.getElementById("contactForm");
  if (form) {
    var nameInput = document.getElementById("name");
    var emailInput = document.getElementById("email");
    var messageInput = document.getElementById("message");
    var nameError = document.getElementById("nameError");
    var emailError = document.getElementById("emailError");
    var messageError = document.getElementById("messageError");
    var formSuccess = document.getElementById("formSuccess");

    function showError(el, message) {
      if (!el) return;
      el.textContent = message || "";
      el.hidden = !message;
    }

    function isValidEmail(value) {
      // Simple, readable pattern for beginners
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (formSuccess) {
        formSuccess.hidden = true;
      }

      var ok = true;

      var nameVal = nameInput ? nameInput.value.trim() : "";
      if (!nameVal || nameVal.length < 2) {
        showError(nameError, "Please enter your name (at least 2 characters).");
        ok = false;
      } else {
        showError(nameError, "");
      }

      var emailVal = emailInput ? emailInput.value.trim() : "";
      if (!emailVal || !isValidEmail(emailVal)) {
        showError(emailError, "Please enter a valid email address.");
        ok = false;
      } else {
        showError(emailError, "");
      }

      var msgVal = messageInput ? messageInput.value.trim() : "";
      if (!msgVal || msgVal.length < 10) {
        showError(messageError, "Please write a message (at least 10 characters).");
        ok = false;
      } else {
        showError(messageError, "");
      }

      if (ok && formSuccess) {
        formSuccess.hidden = false;
        form.reset();
        formSuccess.focus();
      }
    });
  }

  /* ---------- WhatsApp Chat Toggle ---------- */
  var whatsappToggle = document.getElementById("whatsappToggle");
  var whatsappBox = document.getElementById("whatsappBox");
  var whatsappClose = document.getElementById("whatsappClose");

  if (whatsappToggle && whatsappBox && whatsappClose) {
    whatsappToggle.addEventListener("click", function () {
      var isHidden = whatsappBox.hasAttribute("hidden");
      if (isHidden) {
        whatsappBox.removeAttribute("hidden");
        whatsappToggle.setAttribute("aria-expanded", "true");
      } else {
        whatsappBox.setAttribute("hidden", "");
        whatsappToggle.setAttribute("aria-expanded", "false");
      }
    });

    whatsappClose.addEventListener("click", function () {
      whatsappBox.setAttribute("hidden", "");
      whatsappToggle.setAttribute("aria-expanded", "false");
    });

    // Close chat box when clicking outside
    document.addEventListener("click", function (e) {
      var isClickInsideBox = whatsappBox.contains(e.target);
      var isClickOnToggle = whatsappToggle.contains(e.target);
      if (!isClickInsideBox && !isClickOnToggle) {
        whatsappBox.setAttribute("hidden", "");
        whatsappToggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }
})();
