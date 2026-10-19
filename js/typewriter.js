(function () {
  'use strict';

  const pauseFor = (char) => {
    if ('。！？'.indexOf(char) >= 0) return 240;
    if ('，、；：'.indexOf(char) >= 0) return 110;
    if ('…'.indexOf(char) >= 0) return 180;
    return 38;
  };

  async function type(element, text, options) {
    const opts = options || {};
    const chars = Array.from(String(text || ''));
    const cancelled = typeof opts.cancelled === 'function' ? opts.cancelled : () => false;
    const speed = typeof opts.speed === 'number' ? opts.speed : 1;

    element.textContent = '';
    element.classList.add('is-typing');

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.textContent = chars.join('');
      element.classList.remove('is-typing');
      return true;
    }

    for (let i = 0; i < chars.length; i += 1) {
      if (cancelled()) {
        element.classList.remove('is-typing');
        return false;
      }
      element.textContent += chars[i];
      if (typeof opts.onChar === 'function') opts.onChar(element);
      await new Promise((resolve) => window.setTimeout(resolve, pauseFor(chars[i]) * speed));
    }

    element.classList.remove('is-typing');
    return true;
  }

  window.WhygeTypewriter = { type: type };
})();
