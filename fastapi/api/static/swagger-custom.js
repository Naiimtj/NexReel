(function () {
  var STORAGE_KEY = 'nexreel-swagger-theme';
  var darkLink = document.getElementById('dark-theme');

  function injectToggle() {
    // Try multiple containers — BaseLayout has no topbar
    var target =
      document.querySelector('.swagger-ui .scheme-container') ||
      document.querySelector('.swagger-ui .information-container') ||
      document.querySelector('.swagger-ui .wrapper');
    if (!target) return setTimeout(injectToggle, 300);

    var outer = document.createElement('div');
    outer.className = 'theme-toggle-wrapper';

    var toggle = document.createElement('div');
    toggle.className = 'theme-toggle';

    var isDark = !darkLink.disabled;
    toggle.innerHTML =
      '<span class="theme-icon">\u2600\uFE0F</span>' +
      '<label class="toggle-switch">' +
      '  <input type="checkbox" id="theme-switch"' +
      (isDark ? ' checked' : '') +
      '>' +
      '  <span class="toggle-slider"></span>' +
      '</label>' +
      '<span class="theme-icon">\uD83C\uDF19</span>';

    outer.appendChild(toggle);
    target.parentNode.insertBefore(outer, target);

    document
      .getElementById('theme-switch')
      .addEventListener('change', function () {
        darkLink.disabled = !this.checked;
        localStorage.setItem(STORAGE_KEY, this.checked ? 'dark' : 'light');
      });
  }

  injectToggle();
})();


// Redact sensitive header values from rendered curl snippets.
// The actual network requests are NOT affected — only the displayed text.
(function () {
  var SENSITIVE = ['X-Admin-Password', 'X-User-Token'];

  function redactEl(el) {
    var original = el.innerHTML;
    var result = original;
    SENSITIVE.forEach(function (h) {
      // Matches: -H 'Header: actual-value' or -H "Header: actual-value"
      var re = new RegExp('(-H\\s+[\'"]' + h + ':\\s*)([^\'"]+)', 'g');
      result = result.replace(re, '$1***');
    });
    if (result !== original) el.innerHTML = result;
  }

  function scan(root) {
    var els = (root.querySelectorAll ? root : document).querySelectorAll(
      '.curl, pre.microlight, .curl-command pre, .curl-command code, .request-url pre'
    );
    els.forEach(redactEl);
  }

  var obs = new MutationObserver(function (mutations) {
    mutations.forEach(function (m) {
      m.addedNodes.forEach(function (n) {
        if (n.nodeType !== 1) return;
        scan(n);
      });
    });
  });

  document.addEventListener('DOMContentLoaded', function () {
    obs.observe(document.body, { childList: true, subtree: true });
  });
})();