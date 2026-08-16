(function () {
  "use strict";

  /* ----------------------------------------------------------
     DATA — everything about a folder lives here so content /
     destinations / images can be edited later without touching
     the interaction logic below.
  ---------------------------------------------------------- */
  var FOLDERS = {
    project1:   { kind: "project",    title: "Project 1" },
    project2:   { kind: "project",    title: "Project 2" },
    project3:   { kind: "project",    title: "Project 3" },
    skills:     { kind: "skills" },
    experience: { kind: "experience" },
    sidequests: { kind: "sidequests" }
  };

  var desktop = document.getElementById("desktop");
  var pageRoot = document.getElementById("page-root");
  var charImgs = {
    center: document.querySelector(".character__img--center"),
    left: document.querySelector(".character__img--left"),
    right: document.querySelector(".character__img--right")
  };

  /* ----------------------------------------------------------
     CHARACTER GAZE — three static images, crossfaded.
     Tracks how many folders on each side are currently
     hovered so leaving one folder onto another on the same
     side doesn't flicker back to center.
  ---------------------------------------------------------- */
  var hoverCount = { left: 0, right: 0 };

  function setGaze(direction) {
    charImgs.center.classList.toggle("is-active", direction === "center");
    charImgs.left.classList.toggle("is-active", direction === "left");
    charImgs.right.classList.toggle("is-active", direction === "right");
  }

  function refreshGaze() {
    if (hoverCount.left > 0) {
      setGaze("left");
    } else if (hoverCount.right > 0) {
      setGaze("right");
    } else {
      setGaze("center");
    }
  }

  /* ----------------------------------------------------------
     FOLDER WIRING
  ---------------------------------------------------------- */
  document.querySelectorAll(".folder").forEach(function (btn) {
    var side = btn.getAttribute("data-side");
    var target = btn.getAttribute("data-target");

    btn.addEventListener("mouseenter", function () {
      hoverCount[side]++;
      refreshGaze();
    });
    btn.addEventListener("mouseleave", function () {
      hoverCount[side] = Math.max(0, hoverCount[side] - 1);
      refreshGaze();
    });
    btn.addEventListener("focus", function () {
      hoverCount[side]++;
      refreshGaze();
    });
    btn.addEventListener("blur", function () {
      hoverCount[side] = Math.max(0, hoverCount[side] - 1);
      refreshGaze();
    });

    btn.addEventListener("click", function () {
      navigateTo(target);
    });
  });

  /* ----------------------------------------------------------
     ROUTING — templates are cloned into #page-root.
  ---------------------------------------------------------- */
  function buildPage(id) {
    var def = FOLDERS[id];
    if (!def) return null;

    var tplId = def.kind === "project" ? "tpl-project" : "tpl-" + def.kind;
    var tpl = document.getElementById(tplId);
    if (!tpl) return null;

    var node = tpl.content.cloneNode(true);
    if (def.kind === "project") {
      var titleEl = node.querySelector(".page__title");
      if (titleEl) titleEl.textContent = def.title;
    }
    return node;
  }

  function navigateTo(id) {
    var content = buildPage(id);
    if (!content) return;

    pageRoot.innerHTML = "";
    pageRoot.appendChild(content);

    desktop.classList.remove("is-active");
    pageRoot.classList.add("is-active");
    document.body.classList.add("is-page-open");
    window.scrollTo(0, 0);

    var backBtn = pageRoot.querySelector("[data-back]");
    if (backBtn) backBtn.addEventListener("click", goHome);

    history.pushState({ view: id }, "", "#" + id);
  }

  function goHome() {
    pageRoot.classList.remove("is-active");
    pageRoot.innerHTML = "";
    desktop.classList.add("is-active");
    document.body.classList.remove("is-page-open");
    hoverCount = { left: 0, right: 0 };
    setGaze("center");

    if (location.hash) {
      history.pushState({ view: "home" }, "", location.pathname);
    }
  }

  window.addEventListener("popstate", function (e) {
    var view = e.state && e.state.view;
    if (!view || view === "home") {
      goHome();
    } else {
      navigateTo(view);
    }
  });

  /* Deep-link support: opening the site with #project1 etc.
     jumps straight to that folder's page. */
  function initFromHash() {
    var id = location.hash ? location.hash.slice(1) : "";
    if (id && FOLDERS[id]) {
      navigateTo(id);
    }
  }

  initFromHash();
})();
