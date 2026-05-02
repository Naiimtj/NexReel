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
