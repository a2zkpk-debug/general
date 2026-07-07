(function () {
  "use strict";

  var CONFIG = {
    shopUrl: "/shop/",
    loginUrl: "/my-account/",
    registerUrl: "/my-account/?action=register",
    accountUrl: "/my-account/",
    userEndpoint: "/wp-json/wp/v2/users/me?context=edit",
    cartEndpoint: "/wp-json/wc/store/v1/cart",
    categoriesEndpoint: "/wp-json/wc/store/v1/products/categories",
    categoryImages: {
      men: "https://vibecano.com/wp-content/uploads/2026/07/Men-251x300.jpg",
      women: "https://vibecano.com/wp-content/uploads/2026/07/women-251x300.jpg",
      kids: "https://vibecano.com/wp-content/uploads/2026/07/kids-251x300.jpg",
      accessories: "https://vibecano.com/wp-content/uploads/2026/07/Accessories-251x300.jpg"
    },
    mainCategories: [
      {
        key: "men",
        slugs: ["men"],
        label: "Men",
        toneClass: "is-men",
        fallbackImage: "https://vibecano.com/wp-content/uploads/2026/07/Men-251x300.jpg"
      },
      {
        key: "women",
        slugs: ["women"],
        label: "Women",
        toneClass: "is-women",
        fallbackImage: "https://vibecano.com/wp-content/uploads/2026/07/women-251x300.jpg"
      },
      {
        key: "kids",
        slugs: ["kids"],
        label: "Kids",
        toneClass: "is-kids",
        fallbackImage: "https://vibecano.com/wp-content/uploads/2026/07/kids-251x300.jpg"
      },
      {
        key: "accessories",
        slugs: ["accessories"],
        label: "Accessories",
        toneClass: "is-accessories",
        fallbackImage: "https://vibecano.com/wp-content/uploads/2026/07/Accessories-251x300.jpg"
      },
      {
        key: "under999",
        slugs: ["under999", "under-999"],
        label: "Under Rs. 999",
        toneClass: "is-under999",
        fallbackLabel: "999"
      }
    ]
  };

  var root = document.getElementById("vibecanoHeroRoot");
  if (!root) return;

  var toggle = document.getElementById("roMenuToggle");
  var nav = document.getElementById("roNavLinks");
  var guestEl = document.getElementById("roAccountGuest");
  var userEl = document.getElementById("roAccountUser");
  var greetingEl = document.getElementById("roAccountGreeting");
  var loginLink = document.getElementById("roLoginLink");
  var registerLink = document.getElementById("roRegisterLink");
  var cartCountEl = document.getElementById("roCartCount");
  var shopBtn = document.getElementById("roShopBtn");
  var categoryGridEl = document.getElementById("roCategoryGrid");
  var ctaUnder999 = document.getElementById("roCtaUnder999");
  var navLinks = {
    men: document.getElementById("roNavMen"),
    women: document.getElementById("roNavWomen"),
    kids: document.getElementById("roNavKids"),
    accessories: document.getElementById("roNavAccessories"),
    under999: document.getElementById("roNavUnder999")
  };

  if (loginLink) loginLink.href = CONFIG.loginUrl;
  if (registerLink) registerLink.href = CONFIG.registerUrl;
  if (userEl) userEl.href = CONFIG.accountUrl;

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  expandLayout();
  renderCategorySkeletons();
  loadAccountState();
  loadCartCount();
  loadMainCategories();

  function afterCategoriesLoaded(categories) {
    if (window.VibecanoNav && typeof window.VibecanoNav.initNavDropdowns === "function") {
      window.VibecanoNav.initNavDropdowns(root, categories);
    }
    if (shopBtn && window.VibecanoNav) {
      shopBtn.href = window.VibecanoNav.resolveParentUrl(categories || [], "under999");
    }
  }

  window.addEventListener("resize", expandLayout);
  window.addEventListener("load", function () {
      expandLayout();
  });

  function expandLayout() {
    var node = root.parentElement;
    var elementorClasses = [
      "elementor-widget", "elementor-element", "e-con", "e-con-inner",
      "elementor-widget-wrap", "elementor-section", "elementor-container",
      "elementor-column", "elementor-widget-container", "elementor"
    ];
    while (node && node !== document.documentElement) {
      if (node.classList) {
        var isElementor = false;
        for (var i = 0; i < elementorClasses.length; i += 1) {
          if (node.classList.contains(elementorClasses[i])) isElementor = true;
        }
        if (isElementor || String(node.className || "").indexOf("elementor") !== -1) {
          node.style.setProperty("width", "100%", "important");
          node.style.setProperty("max-width", "none", "important");
          node.style.setProperty("align-self", "stretch", "important");
          node.style.setProperty("flex", "1 1 100%", "important");
          node.style.setProperty("padding-left", "0", "important");
          node.style.setProperty("padding-right", "0", "important");
          node.style.setProperty("overflow", "visible", "important");
        }
      }
      node = node.parentElement;
    }
    root.style.setProperty("width", "100vw", "important");
    root.style.setProperty("max-width", "100vw", "important");
    root.style.setProperty("margin-left", "calc(50% - 50vw)", "important");
    root.style.setProperty("margin-right", "calc(50% - 50vw)", "important");
  }

  function loadMainCategories() {
    if (!window.fetch) {
      renderFallbackCategories([]);
      return;
    }

    fetch(CONFIG.categoriesEndpoint + "?per_page=100", { credentials: "same-origin" })
      .then(function (response) {
        if (!response.ok) throw new Error("Categories request failed");
        return response.json();
      })
      .then(function (categories) {
        var safeCategories = Array.isArray(categories) ? categories : [];
        renderAllCategories(safeCategories);
      })
      .catch(function () {
        renderFallbackCategories([]);
      });
  }

  function renderAllCategories(categories) {
    var resolved = CONFIG.mainCategories.map(function (item) {
      var match = resolveMainCategory(categories, item);
      if (match) return match;

      return {
        key: item.key,
        label: item.label,
        toneClass: item.toneClass,
        fallbackImage: item.fallbackImage || CONFIG.categoryImages[item.key] || "",
        fallbackLabel: item.fallbackLabel || "",
        category: {
          name: item.label,
          slug: item.slugs[0],
          permalink: "/product-category/" + item.slugs[0] + "/"
        }
      };
    });

    renderCategoryCards(resolved);
    bindCategoryLinks(resolved);
    afterCategoriesLoaded(categories);
  }

  function resolveMainCategory(categories, item) {
    var category = null;
    var i;

    for (i = 0; i < item.slugs.length; i += 1) {
      category = findCategoryBySlug(categories, item.slugs[i]);
      if (category) break;
    }

    if (!category) return null;

    return {
      key: item.key,
      label: item.label,
      toneClass: item.toneClass,
      fallbackImage: item.fallbackImage || CONFIG.categoryImages[item.key] || "",
      fallbackLabel: item.fallbackLabel || "",
      category: category
    };
  }

  function findCategoryBySlug(categories, slug) {
    return categories.filter(function (category) {
      return category && category.slug === slug;
    })[0] || null;
  }

  function getCategoryUrl(category) {
    if (category && category.permalink) return category.permalink;
    if (category && category.slug) return "/product-category/" + category.slug + "/";
    return CONFIG.shopUrl;
  }

  function getCategoryImage(item) {
    if (item.key && CONFIG.categoryImages[item.key]) {
      return CONFIG.categoryImages[item.key];
    }
    if (item.fallbackImage) return item.fallbackImage;
    if (item.category && item.category.image && item.category.image.src) {
      return item.category.image.src;
    }
    return "";
  }

  function renderCategoryCards(items) {
    if (!categoryGridEl) return;
    categoryGridEl.innerHTML = items.map(renderCategoryCard).join("");
  }

  function renderCategoryCard(item) {
    var category = item.category;
    var url = escapeAttr(getCategoryUrl(category));
    var name = escapeHtml(item.label || category.name || "Category");
    var toneClass = escapeAttr(item.toneClass || "");
    var imageSrc = getCategoryImage(item);
    var imageHtml;

    if (imageSrc) {
      imageHtml = '<img src="' + escapeAttr(imageSrc) + '" alt="' + escapeAttr(category.name || item.label) + '" loading="lazy" decoding="async">';
    } else {
      var fallbackText = escapeHtml(item.fallbackLabel || (item.label || category.name || "VC").slice(0, 1));
      imageHtml = '<div class="ro-category-fallback">' + fallbackText + "</div>";
    }

    return [
      '<a href="' + url + '" class="ro-category ' + toneClass + '">',
        '<div class="ro-category-ring">',
          '<div class="ro-category-img">',
            imageHtml,
          "</div>",
        "</div>",
        "<h3>" + name + "</h3>",
      "</a>"
    ].join("");
  }

  function bindCategoryLinks(items) {
    items.forEach(function (item) {
      var linkEl = navLinks[item.key];
      var url = getCategoryUrl(item.category);

      if (linkEl && !linkEl.classList.contains("ro-nav-trigger")) {
        linkEl.href = url;
        linkEl.textContent = item.label || item.category.name;
      }

      if (item.key === "under999") {
        if (ctaUnder999) ctaUnder999.href = url;
      }
    });
  }

  function renderCategorySkeletons() {
    if (!categoryGridEl) return;
    categoryGridEl.innerHTML = "";
    for (var i = 0; i < CONFIG.mainCategories.length; i += 1) {
      categoryGridEl.innerHTML += '<div class="ro-category-skeleton" aria-hidden="true"></div>';
    }
  }

  function renderFallbackCategories(categories) {
    if (!categoryGridEl) return;

    var fallback = CONFIG.mainCategories.map(function (item) {
      return {
        key: item.key,
        label: item.label,
        toneClass: item.toneClass,
        fallbackImage: item.fallbackImage || CONFIG.categoryImages[item.key] || "",
        fallbackLabel: item.fallbackLabel || "",
        category: {
          name: item.label,
          slug: item.slugs[0],
          permalink: "/product-category/" + item.slugs[0] + "/"
        }
      };
    });

    renderCategoryCards(fallback);
    bindCategoryLinks(fallback);
    afterCategoriesLoaded(categories || []);
  }

  function loadAccountState() {
    if (!window.fetch || !guestEl || !userEl || !greetingEl) {
      showGuest();
      return;
    }

    fetch(CONFIG.userEndpoint, { credentials: "same-origin" })
      .then(function (response) {
        if (!response.ok) throw new Error("Guest user");
        return response.json();
      })
      .then(function (user) {
        greetingEl.textContent = "Assalam O Alikum, " + getDisplayName(user);
        showUser();
      })
      .catch(function () {
        showGuest();
      });
  }

  function getDisplayName(user) {
    if (!user) return "there";
    if (user.first_name) return user.first_name;
    if (user.name) return String(user.name).split(" ")[0];
    if (user.slug) return user.slug;
    return "there";
  }

  function showGuest() {
    if (guestEl) guestEl.hidden = false;
    if (userEl) userEl.hidden = true;
  }

  function showUser() {
    if (guestEl) guestEl.hidden = true;
    if (userEl) userEl.hidden = false;
  }

  function loadCartCount() {
    if (!window.fetch || !cartCountEl) return;

    fetch(CONFIG.cartEndpoint, { credentials: "same-origin" })
      .then(function (response) {
        return response.ok ? response.json() : null;
      })
      .then(function (cart) {
        if (!cart) return;
        var count = Number(cart.items_count);
        if (Number.isFinite(count)) cartCountEl.textContent = String(count);
      })
      .catch(function () {});
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }
})();
