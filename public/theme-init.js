(function () {
  try {
    var t = localStorage.getItem("bs-theme") || "dark";
    document.documentElement.setAttribute("data-bs-theme", t);
  } catch {
    // ignore
  }
})();
