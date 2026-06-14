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

    if (typeof emailjs !== "undefined") {
      emailjs.init("Nl5w6GX-dNijKGjN_");
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

      if (!ok) {
        return;
      }

      if (typeof emailjs === "undefined") {
        if (formSuccess) {
          formSuccess.textContent = "Email service unavailable. Please try again later.";
          formSuccess.hidden = false;
        }
        return;
      }

      var submitButton = form.querySelector('button[type="submit"]');
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      var templateParams = {
        from_name: nameVal,
        from_email: emailVal,
        subject: document.getElementById("subject").value.trim(),
        message: msgVal,
      };

      emailjs
        .send("service_g39abnl", "template_fyq4iwr", templateParams)
        .then(function () {
          if (formSuccess) {
            formSuccess.textContent = "Message sent successfully! We'll respond soon.";
            formSuccess.hidden = false;
            formSuccess.focus();
          }
          form.reset();
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Send Message";
          }
        })
        .catch(function (error) {
          console.error("EmailJS Error:", error);
          if (formSuccess) {
            formSuccess.textContent = "Sending failed. Please try again later.";
            formSuccess.hidden = false;
            formSuccess.focus();
          }
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.textContent = "Send Message";
          }
        });
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

/* ---------- Chatbot ---------- */
var chatbot = document.getElementById("chatbot");
var chatToggle = document.getElementById("chatbot-toggle");
var chatWindow = document.getElementById("chat-window");
var chatClose = document.getElementById("chat-close");
var chatBody = document.getElementById("chat-body");
var chatInput = document.getElementById("chat-input");
var chatSend = document.getElementById("chat-send");

// Toggle chat window
function toggleChat() {
  chatWindow.classList.toggle("chat-hidden");
  if (!chatWindow.classList.contains("chat-hidden") && chatBody.children.length === 0) {
    addMessage("Hi! I'm the Cyber Connections Assistant. How can I help you, services, training, or pricing?", "bot");
  }
}

chatToggle.addEventListener("click", toggleChat);
chatClose.addEventListener("click", toggleChat);

// Send message
function sendMessage() {
  var message = chatInput.value.trim();
  if (!message) return;

  // Add user message
  addMessage(message, "user");

  // Clear input
  chatInput.value = "";

  // Generate bot response after a short delay
  setTimeout(function() {
    var response = getBotResponse(message);
    addMessage(response, "bot");
  }, 500);
}

chatSend.addEventListener("click", sendMessage);
chatInput.addEventListener("keypress", function(e) {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// Add message to chat
function addMessage(text, type) {
  var messageDiv = document.createElement("div");
  messageDiv.className = "message " + type;

  var bubble = document.createElement("div");
  bubble.className = "message-bubble";
  bubble.textContent = text;

  messageDiv.appendChild(bubble);
  chatBody.appendChild(messageDiv);

  // Auto-scroll to bottom
  chatBody.scrollTop = chatBody.scrollHeight;
}

// Bot response logic
function getBotResponse(userMessage) {
  var message = userMessage.toLowerCase();

  if (message.includes("hello")) {
    return "Hello! Welcome to Cyber Connections. How can I assist you today?";
  } else if (message.includes("services")) {
    return getServicesInfo();
  } else if (message.includes("training") || message.includes("courses") || message.includes("learn")) {
    return getTrainingInfo();
  } else if (message.includes("price") || message.includes("pricing") || message.includes("cost") || message.includes("rate")) {
    return getPricingInfo();
  } else {
    return "I'm sorry, I didn't understand that. Can you please rephrase?";
  }
}

// Get training information from the training section
function getTrainingInfo() {
  var trainingCards = document.querySelectorAll(".training .service-card");
  if (!trainingCards || trainingCards.length === 0) {
    return "We offer training in basic computer skills, Microsoft Office, internet usage, and more. Check our training section for details!";
  }

  var trainings = [];

  for (var i = 0; i < trainingCards.length; i++) {
    var card = trainingCards[i];
    var title = card.querySelector(".service-card__title");
    var text = card.querySelector(".service-card__text");

    if (title && text) {
      var trainingName = title.textContent.trim();
      var description = text.textContent.trim();

      if (trainingName && description) {
        trainings.push(trainingName + ": " + description);
      }
    }
  }

  if (trainings.length > 0) {
    return "Here are our training courses:\n" + trainings.join("\n\n");
  } else {
    return "We offer training in basic computer skills, Microsoft Office, internet usage, and more. Check our training section for details!";
  }
}

// Get services information from the services section
function getServicesInfo() {
  var serviceCards = document.querySelectorAll(".services .service-card");
  if (!serviceCards || serviceCards.length === 0) {
    return "We offer fast internet, printing, scanning, and more at affordable rates. Check our services section for details!";
  }

  var services = [];

  for (var i = 0; i < serviceCards.length; i++) {
    var card = serviceCards[i];
    var title = card.querySelector(".service-card__title");
    var text = card.querySelector(".service-card__text");

    if (title && text) {
      var serviceName = title.textContent.trim();
      var description = text.textContent.trim();

      if (serviceName && description) {
        services.push(serviceName + ": " + description);
      }
    }
  }

  if (services.length > 0) {
    return "Here are our available services:\n" + services.join("\n\n");
  } else {
    return "We offer fast internet, printing, scanning, and more at affordable rates. Check our services section for details!";
  }
}

// Get pricing information from the table
function getPricingInfo() {
  var pricingTable = document.querySelector(".pricing-table tbody");
  if (!pricingTable) {
    return "I'm sorry, I couldn't access the pricing information right now.";
  }

  var rows = pricingTable.querySelectorAll("tr");
  var prices = [];

  for (var i = 0; i < rows.length; i++) {
    var cells = rows[i].querySelectorAll("td");
    if (cells.length >= 2) {
      var service = cells[0].textContent.trim();
      var rate = cells[1].textContent.trim();
      var notes = cells[2] ? cells[2].textContent.trim() : "";

      if (rate !== "---") {
        prices.push(service + ": " + rate + (notes ? " (" + notes + ")" : ""));
      }
    }
  }

  if (prices.length > 0) {
    return "Here are our current prices:\n" + prices.join("\n");
  } else {
    return "I'm sorry, I couldn't find any pricing information.";
  }
}
