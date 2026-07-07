(function (global) {
  "use strict";

  var NAV_MENUS = {
    men: {
      parentSlugs: ["men"],
      type: "list",
      items: [
        { label: "T-Shirts", slugs: ["t-shirts", "men-t-shirts", "mens-t-shirts"] },
        { label: "Polos", slugs: ["polos", "men-polos"] },
        { label: "Shirts", slugs: ["shirts", "men-shirts"] },
        { label: "Shorts", slugs: ["shorts", "men-shorts"] },
        { label: "Trousers", slugs: ["trousers", "men-trousers"] },
        { label: "Chino", slugs: ["chino", "men-chino", "chinos"] },
        { label: "Pants", slugs: ["pants", "men-pants"] }
      ]
    },
    women: {
      parentSlugs: ["women"],
      type: "list",
      items: [
        { label: "T-Shirts", slugs: ["t-shirts", "women-t-shirts", "womens-t-shirts"] },
        { label: "Kurtis | Fusion Tops", slugs: ["kurtis-fusion-tops", "kurtis", "fusion-tops"] },
        { label: "Fusion Suit", slugs: ["fusion-suit", "women-fusion-suit"] },
        { label: "Long Dress", slugs: ["long-dress", "women-long-dress"] },
        { label: "2 Piece Suit", slugs: ["2-piece-suit", "women-2-piece-suit"] },
        { label: "3 Piece Suit", slugs: ["3-piece-suit", "women-3-piece-suit"] },
        { label: "Loungewear", slugs: ["loungewear", "women-loungewear"] },
        { label: "Pajamas | Trouser", slugs: ["pajamas-trouser", "pajamas", "women-pajamas"] },
        { label: "Leggings", slugs: ["leggings", "women-leggings"] },
        { label: "Pants", slugs: ["pants", "women-pants"] }
      ]
    },
    kids: {
      parentSlugs: ["kids"],
      type: "columns",
      columns: [
        {
          title: "BOYS",
          items: [
            { label: "T-Shirts", slugs: ["boys-t-shirts", "boys-tshirts"] },
            { label: "Polos", slugs: ["boys-polos"] },
            { label: "Shirts", slugs: ["boys-shirts"] },
            { label: "Kurta", slugs: ["boys-kurta"] },
            { label: "Sandos", slugs: ["boys-sandos"] },
            { label: "Loungewear", slugs: ["boys-loungewear"] },
            { label: "Shorts", slugs: ["boys-shorts"] },
            { label: "Trouser", slugs: ["boys-trouser", "boys-trousers"] },
            { label: "2 PC Suit", slugs: ["boys-2-pc-suit", "boys-2-piece-suit"] },
            { label: "Pants", slugs: ["boys-pants"] },
            { label: "Boxers", slugs: ["boys-boxers"] }
          ]
        },
        {
          title: "GIRLS",
          items: [
            { label: "T-Shirts", slugs: ["girls-t-shirts", "girls-tshirts"] },
            { label: "Frocks", slugs: ["girls-frocks", "frocks"] },
            { label: "TOP AND SHIRT", slugs: ["girls-top-and-shirt", "top-and-shirt"] },
            { label: "SUITS", slugs: ["girls-suits"] },
            { label: "long Dress", slugs: ["girls-long-dress", "long-dress"] },
            { label: "Kurtis | Fusion Top", slugs: ["girls-kurtis", "girls-fusion-top"] },
            { label: "Rompers | Bodysuits", slugs: ["rompers-bodysuits", "girls-rompers"] },
            { label: "Shorts", slugs: ["girls-shorts"] },
            { label: "Leggings | Trousers | Pajamas", slugs: ["girls-leggings-trousers-pajamas"] },
            { label: "2 PC Suits", slugs: ["girls-2-pc-suits"] },
            { label: "Loungewear", slugs: ["girls-loungewear"] },
            { label: "Skirts", slugs: ["girls-skirts", "skirts"] },
            { label: "Pants", slugs: ["girls-pants"] }
          ]
        }
      ]
    },
    under999: {
      parentSlugs: ["under999", "under-999"],
      type: "list",
      flash: true,
      items: [
        { label: "MEN", slugs: ["under999-men", "men-under-999", "under-999-men"] },
        { label: "WOMEN", slugs: ["under999-women", "women-under-999", "under-999-women"] },
        { label: "BOYS", slugs: ["under999-boys", "boys-under-999", "under-999-boys"] },
        { label: "GIRLS", slugs: ["under999-girls", "girls-under-999", "under-999-girls"] }
      ]
    }
  };

  function slugify(label) {
    return String(label || "")
      .toLowerCase()
      .replace(/[|]/g, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function findCategoryBySlug(categories, slug) {
    if (!slug) return null;
    return categories.filter(function (category) {
      return category && category.slug === slug;
    })[0] || null;
  }

  function resolveItemUrl(categories, item, parentSlug) {
    var i;
    var slugs = item.slugs || [];
    var category = null;

    for (i = 0; i < slugs.length; i += 1) {
      category = findCategoryBySlug(categories, slugs[i]);
      if (category) break;
    }

    if (!category && parentSlug) {
      for (i = 0; i < slugs.length; i += 1) {
        category = findCategoryBySlug(categories, parentSlug + "-" + slugs[i]);
        if (category) break;
      }
    }

    if (category && category.permalink) return category.permalink;
    if (category && category.slug) return "/product-category/" + category.slug + "/";

    if (slugs[0]) return "/product-category/" + slugs[0] + "/";
    return "/product-category/" + (parentSlug ? parentSlug + "-" : "") + slugify(item.label) + "/";
  }

  function resolveParentUrl(categories, menuKey) {
    var menu = NAV_MENUS[menuKey];
    if (!menu) return "/shop/";
    var i;
    var category = null;

    for (i = 0; i < menu.parentSlugs.length; i += 1) {
      category = findCategoryBySlug(categories, menu.parentSlugs[i]);
      if (category) break;
    }

    if (category && category.permalink) return category.permalink;
    if (category && category.slug) return "/product-category/" + category.slug + "/";
    return "/product-category/" + menu.parentSlugs[0] + "/";
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

  function renderListDropdown(menu, categories, parentSlug) {
    return menu.items.map(function (item) {
      var url = resolveItemUrl(categories, item, parentSlug);
      return '<a href="' + escapeAttr(url) + '">' + escapeHtml(item.label) + "</a>";
    }).join("");
  }

  function renderColumnsDropdown(menu, categories, parentSlug) {
    return menu.columns.map(function (column) {
      var links = column.items.map(function (item) {
        var url = resolveItemUrl(categories, item, parentSlug);
        return '<a href="' + escapeAttr(url) + '">' + escapeHtml(item.label) + "</a>";
      }).join("");

      return [
        '<div class="ro-dropdown-col">',
          "<strong>" + escapeHtml(column.title) + "</strong>",
          links,
        "</div>"
      ].join("");
    }).join("");
  }

  function renderDropdownHtml(menuKey, categories) {
    var menu = NAV_MENUS[menuKey];
    if (!menu) return "";
    var parentSlug = menu.parentSlugs[0];

    if (menu.type === "columns") {
      return '<div class="ro-dropdown ro-dropdown-cols">' + renderColumnsDropdown(menu, categories, parentSlug) + "</div>";
    }

    return '<div class="ro-dropdown">' + renderListDropdown(menu, categories, parentSlug) + "</div>";
  }

  function renderCategorySubLinks(menuKey, categories, limit) {
    var menu = NAV_MENUS[menuKey];
    if (!menu) return "";
    var parentSlug = menu.parentSlugs[0];
    var max = limit || 4;
    var html = "";

    if (menu.type === "columns") {
      menu.columns.forEach(function (column) {
        html += '<span class="ro-category-sub-head">' + escapeHtml(column.title) + "</span>";
        column.items.slice(0, 3).forEach(function (item) {
          var url = resolveItemUrl(categories, item, parentSlug);
          html += '<a href="' + escapeAttr(url) + '">' + escapeHtml(item.label) + "</a>";
        });
      });
      return html;
    }

    menu.items.slice(0, max).forEach(function (item) {
      var url = resolveItemUrl(categories, item, parentSlug);
      html += '<a href="' + escapeAttr(url) + '">' + escapeHtml(item.label) + "</a>";
    });

    return html;
  }

  function initNavDropdowns(root, categories) {
    if (!root) return;
    var safeCategories = Array.isArray(categories) ? categories : [];
    var dropdownItems = root.querySelectorAll(".ro-nav-dd[data-menu]");

    dropdownItems.forEach(function (item) {
      var menuKey = item.getAttribute("data-menu");
      var menu = NAV_MENUS[menuKey];
      var trigger = item.querySelector(".ro-nav-trigger");
      var panel = item.querySelector(".ro-dropdown-panel");
      if (!menu || !trigger || !panel) return;

      trigger.href = resolveParentUrl(safeCategories, menuKey);
      panel.innerHTML = renderDropdownHtml(menuKey, safeCategories);

      if (menu.flash) {
        item.classList.add("is-flash");
      }
    });

    bindDropdownEvents(root);
  }

  function bindDropdownEvents(root) {
    var items = root.querySelectorAll(".ro-nav-dd");
    var mobileQuery = window.matchMedia("(max-width: 860px)");

    items.forEach(function (item) {
      var trigger = item.querySelector(".ro-nav-trigger");
      if (!trigger) return;

      trigger.addEventListener("click", function (event) {
        if (!mobileQuery.matches) return;
        event.preventDefault();
        var isOpen = item.classList.contains("is-open");
        root.querySelectorAll(".ro-nav-dd.is-open").forEach(function (openItem) {
          if (openItem !== item) openItem.classList.remove("is-open");
        });
        item.classList.toggle("is-open", !isOpen);
      });
    });

    document.addEventListener("click", function (event) {
      if (!root.contains(event.target)) {
        root.querySelectorAll(".ro-nav-dd.is-open").forEach(function (openItem) {
          openItem.classList.remove("is-open");
        });
      }
    });
  }

  global.VibecanoNav = {
    NAV_MENUS: NAV_MENUS,
    initNavDropdowns: initNavDropdowns,
    renderCategorySubLinks: renderCategorySubLinks,
    resolveParentUrl: resolveParentUrl,
    resolveItemUrl: resolveItemUrl,
    findCategoryBySlug: findCategoryBySlug
  };
})(typeof window !== "undefined" ? window : this);
