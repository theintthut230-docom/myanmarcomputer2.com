(() => {
  const body = document.body;
  const panels = [...document.querySelectorAll('.topic-panel')];
  const tabs = [...document.querySelectorAll('.topic-tab')];
  const tabList = document.querySelector('.topic-tabs');
  const desktopSearch = document.getElementById('site-search');
  const mobileSearch = document.getElementById('mobile-search');
  const searchFeedback = document.getElementById('search-feedback');
  const noResults = document.getElementById('no-results');
  const menuToggle = document.querySelector('.menu-toggle');
  const siteNav = document.getElementById('site-nav');
  const themeToggle = document.querySelector('.theme-toggle');
  const backToTop = document.querySelector('.back-to-top');
  const searchCards = [...document.querySelectorAll('[data-search-card]')];
  let activeTopic = 'language';
  let lastSearch = '';

  const syncSearchInputs = value => {
    if (desktopSearch && desktopSearch.value !== value) desktopSearch.value = value;
    if (mobileSearch && mobileSearch.value !== value) mobileSearch.value = value;
  };

  const restoreTabSemantics = () => {
    tabList.setAttribute('role', 'tablist');
    tabList.setAttribute('aria-label', 'Guide topics');
    tabs.forEach(tab => {
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-controls', tab.dataset.tabTarget);
    });
    panels.forEach(panel => {
      panel.setAttribute('role', 'tabpanel');
      panel.setAttribute('aria-labelledby', `tab-${panel.id}`);
      panel.removeAttribute('aria-label');
    });
  };

  const setTopic = (id, focusPanel = false) => {
    const target = document.getElementById(id);
    if (!target || body.classList.contains('searching')) return;
    activeTopic = id;
    panels.forEach(panel => {
      const isActive = panel.id === id;
      panel.hidden = !isActive;
      panel.classList.toggle('is-active', isActive);
    });
    tabs.forEach(tab => {
      const isActive = tab.dataset.tabTarget === id;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });
    document.querySelectorAll('[data-nav]').forEach(link => {
      link.classList.toggle('is-current', link.dataset.nav === id);
    });
    if (focusPanel) target.focus({ preventScroll: true });
  };

  const runSearch = rawQuery => {
    const query = rawQuery.trim().toLocaleLowerCase();
    lastSearch = query;
    body.classList.toggle('searching', Boolean(query));

    if (!query) {
      restoreTabSemantics();
      searchCards.forEach(card => { card.hidden = false; });
      panels.forEach(panel => {
        panel.hidden = panel.id !== activeTopic;
        panel.classList.toggle('is-active', panel.id === activeTopic);
      });
      tabs.forEach(tab => {
        const active = tab.dataset.tabTarget === activeTopic;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
        tab.tabIndex = active ? 0 : -1;
      });
      searchFeedback.hidden = true;
      searchFeedback.textContent = '';
      noResults.hidden = true;
      return;
    }

    tabList.setAttribute('role', 'group');
    tabList.setAttribute('aria-label', 'Choose a topic to clear search and switch topics');
    tabs.forEach(tab => {
      tab.removeAttribute('role');
      tab.removeAttribute('aria-selected');
      tab.removeAttribute('tabindex');
      tab.classList.remove('is-active');
    });

    let matches = 0;
    panels.forEach(panel => {
      panel.setAttribute('role', 'region');
      panel.removeAttribute('aria-labelledby');
      panel.setAttribute('aria-label', `Search results: ${panel.querySelector('.section-heading h2').textContent}`);
      let sectionMatches = 0;
      const cards = [...panel.querySelectorAll('[data-search-card]')];
      cards.forEach(card => {
        const match = card.textContent.toLocaleLowerCase().includes(query);
        card.hidden = !match;
        if (match) {
          matches += 1;
          sectionMatches += 1;
        }
      });
      panel.hidden = sectionMatches === 0;
      panel.classList.toggle('is-active', sectionMatches > 0);
    });

    searchFeedback.hidden = false;
    searchFeedback.textContent = matches
      ? `${matches} ${matches === 1 ? 'result' : 'results'} across all topics for “${rawQuery.trim()}”.`
      : `No results across the guide for “${rawQuery.trim()}”.`;
    noResults.hidden = matches !== 0;
  };

  function activateTopic(id) {
    if (lastSearch) {
      syncSearchInputs('');
      runSearch('');
    }
    setTopic(id);
  }

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateTopic(tab.dataset.tabTarget));
    tab.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = tabs.length - 1;
      tabs[next].focus();
      activateTopic(tabs[next].dataset.tabTarget);
    });
  });

  [desktopSearch, mobileSearch].filter(Boolean).forEach(input => {
    input.addEventListener('input', event => {
      syncSearchInputs(event.currentTarget.value);
      runSearch(event.currentTarget.value);
    });
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape' && event.currentTarget.value) {
        syncSearchInputs('');
        runSearch('');
      }
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      event.preventDefault();
      const chosen = window.matchMedia('(max-width: 760px)').matches ? mobileSearch : desktopSearch;
      chosen?.focus();
    }
  });

  const updateHashNavigation = () => {
    const id = location.hash.slice(1);
    const target = document.getElementById(id);
    if (!target?.matches('[data-section]')) return;
    activateTopic(id);
    requestAnimationFrame(() => target.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  window.addEventListener('hashchange', updateHashNavigation);
  if (location.hash) requestAnimationFrame(updateHashNavigation);

  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', () => {
      activateTopic(link.dataset.nav);
      closeMobileMenu();
    });
  });

  document.querySelectorAll('.hero-badges a, .button-quiet').forEach(link => {
    link.addEventListener('click', () => {
      const id = link.getAttribute('href')?.slice(1);
      if (id && document.getElementById(id)?.matches('[data-section]')) activateTopic(id);
    });
  });

  document.querySelector('[data-reset-tabs]')?.addEventListener('click', () => activateTopic(activeTopic));

  function closeMobileMenu() {
    if (!menuToggle) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    siteNav.classList.remove('is-open');
  }

  menuToggle?.addEventListener('click', () => {
    const open = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    siteNav.classList.toggle('is-open', open);
  });

  const setTheme = dark => {
    body.classList.toggle('dark-mode', dark);
    themeToggle.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggle.title = dark ? 'Switch to light mode' : 'Switch to dark mode';
    themeToggle.querySelector('svg').innerHTML = dark
      ? '<circle cx="12" cy="12" r="4"></circle><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"></path>'
      : '<path d="M20.2 15.2A8.1 8.1 0 0 1 8.8 3.8 8.3 8.3 0 1 0 20.2 15.2Z"></path><path d="M16.5 3v3M15 4.5h3"></path>';
  };

  let storedTheme = null;
  try {
    storedTheme = window.localStorage.getItem('mmtech-theme');
  } catch {
    // Private browsing contexts may deny storage; theme controls still work per page view.
  }
  setTheme(storedTheme ? storedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
  themeToggle.addEventListener('click', () => {
    const dark = !body.classList.contains('dark-mode');
    setTheme(dark);
    try {
      window.localStorage.setItem('mmtech-theme', dark ? 'dark' : 'light');
    } catch {
      // Keep the selected theme for this view even when persistence is unavailable.
    }
  });

  const updateBackToTop = () => backToTop.classList.toggle('is-visible', window.scrollY > 380);
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const input = document.getElementById('burmese-input');
  const preview = document.getElementById('burmese-preview');
  input.addEventListener('input', () => { preview.textContent = input.value || 'မြန်မာစာကို ဒီမှာ ရေးကြည့်ပါ…'; });
  document.getElementById('year').textContent = new Date().getFullYear();
  updateBackToTop();
})();
