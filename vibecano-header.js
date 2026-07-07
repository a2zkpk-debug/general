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
    mainCategories: [
      { key: "men", slugs: ["men"], label: "Men" },
      { key: "women", slugs: ["women"], label: "Women" },
      { key: "kids", slugs: ["kids"], label: "Kids" },
      { key: "accessories", slugs: ["accessories"], label: "Accessories" },
      { key: "under999", slugs: ["under999", "under-999"], label: "Under Rs. 999" }
    ]
  };

  var root = document.getElementById("vibecanoHeaderRoot");
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
  if (shopBtn) shopBtn.href = "/product-category/under999/";

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  expandHeaderLayout();
  loadAccountState();
  loadCartCount();
  loadNavCategories();

  window.addEventListener("resize", expandHeaderLayout);
  window.addEventListener("load", function () {
      expandHeaderLayout();
  });

  function expandHeaderLayout() {
    var node = root.parentElement;
    var elementorClasses = [
      "elementor-widget", "elementor-element", "e-con", "e-con-inner",
      "elementor-widget-wrap", "elementor-section", "elementor-container",
      "elementor-column", "elementor-widget-container", "elementor", "elementor-location-header"
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

  function loadNavCategories() {
    if (!window.fetch) return;

    fetch(CONFIG.categoriesEndpoint + "?per_page=100", { credentials: "same-origin" })
      .then(function (response) {
        if (!response.ok) throw new Error("Categories request failed");
        return response.json();
      })
      .then(function (categories) {
        var safeCategories = Array.isArray(categories) ? categories : [];
        CONFIG.mainCategories.forEach(function (item) {
          var category = resolveMainCategory(safeCategories, item);
          if (!category) return;
          var linkEl = navLinks[item.key];
          var url = getCategoryUrl(category);
          if (linkEl) {
            linkEl.href = url;
            linkEl.textContent = item.label || category.name;
          }
          if (item.key === "under999" && shopBtn) {
            shopBtn.href = url;
          }
        });
      })
      .catch(function () {});
  }

  function resolveMainCategory(categories, item) {
    var i;
    for (i = 0; i < item.slugs.length; i += 1) {
      var match = categories.filter(function (category) {
        return category && category.slug === item.slugs[i];
      })[0];
      if (match) return match;
    }
    return null;
  }

  function getCategoryUrl(category) {
    if (category && category.permalink) return category.permalink;
    if (category && category.slug) return "/product-category/" + category.slug + "/";
    return CONFIG.shopUrl;
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

})();
