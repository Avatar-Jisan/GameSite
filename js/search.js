/* =============================
   SEARCH LOGIC - search.js
   Works on ALL pages
   ============================= */

(function () {

  $(document).ready(function () {

    // ── FIND games.json regardless of current page path ──
    const possiblePaths = [
      "data/games.json",
      "/data/games.json",
      "../data/games.json"
    ];

    function tryFetch(paths, index) {
      if (index >= paths.length) {
        console.error("Search: Could not load games.json from any path.");
        return;
      }

      fetch(paths[index])
        .then(res => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then(games => {
          initSearch(games);
        })
        .catch(() => {
          tryFetch(paths, index + 1);
        });
    }

    tryFetch(possiblePaths, 0);

  });

  function initSearch(games) {
    const input = $(".gameSearchInput");
    const sBox = $(".suggestion-box");

    if (input.length === 0 || sBox.length === 0) return;

    // ── INPUT EVENT ──────────────────────────────────
    input.on("input", function () {
      const query = $(this).val().trim().toLowerCase();
      sBox.empty();

      if (query.length === 0) {
        sBox.hide();
        return;
      }

      const matches = games.filter(g =>
        g.name.toLowerCase().includes(query)
      );

      if (matches.length > 0) {
        matches.forEach(g => {
          const item = $(`
            <div class="suggestion-item">
              <img src="${g.image}" alt="${g.name}" loading="lazy">
              <span>${highlightMatch(g.name, query)}</span>
            </div>
          `);

          item.on("click", function () {
            window.location.href = `game.html?id=${g.id}`;
          });

          sBox.append(item);
        });

        sBox.show();
      } else {
        sBox.append(
          `<div class="suggestion-no-result">No games found for "<strong>${query}</strong>"</div>`
        );
        sBox.show();
      }
    });

    // ── CLOSE ON OUTSIDE CLICK ───────────────────────
    $(document).on("click", function (e) {
      if (!$(e.target).closest(".search-section").length) {
        sBox.hide();
      }
    });

    // ── CLOSE ON ESCAPE KEY ──────────────────────────
    $(document).on("keydown", function (e) {
      if (e.key === "Escape") {
        sBox.hide();
        input.blur();
      }
    });

    // ── KEYBOARD NAVIGATION (UP/DOWN ARROW) ─────────
    let focusedIndex = -1;

    input.on("keydown", function (e) {
      const items = sBox.find(".suggestion-item");
      if (items.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusedIndex = (focusedIndex + 1) % items.length;
        updateFocus(items, focusedIndex);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        focusedIndex = (focusedIndex - 1 + items.length) % items.length;
        updateFocus(items, focusedIndex);
      } else if (e.key === "Enter") {
        if (focusedIndex >= 0) {
          items.eq(focusedIndex).trigger("click");
        }
      }
    });

    input.on("input", function () {
      focusedIndex = -1;
    });
  }

  // ── HELPERS ─────────────────────────────────────────

  function highlightMatch(name, query) {
    const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
    return name.replace(
      regex,
      `<span style="color:#97feed; font-weight:700;">$1</span>`
    );
  }

  function updateFocus(items, index) {
    items.css("background", "");
    items
      .eq(index)
      .css("background", "rgba(151, 254, 237, 0.15)")
      .get(0)
      ?.scrollIntoView({ block: "nearest" });
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

})();
