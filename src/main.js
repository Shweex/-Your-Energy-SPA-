const API_BASE = 'https://your-energy.b.goit.study/api';
const QUOTE_KEY = 'ye-quote';
const FAVORITES_KEY = 'ye-favorites';
const EMAIL_PATTERN = /^\w+(\.\w+)?@[a-zA-Z_]+?\.[a-zA-Z]{2,3}$/;

const state = {
  filter: 'Muscles',
  category: null,
  page: 1,
  limit: 12,
  keyword: '',
  totalPages: 1,
  mode: 'categories',
};

const refs = {
  filterButtons: document.querySelectorAll('.filter-btn'),
  categoryGrid: document.querySelector('[data-category-grid]'),
  exercisesResults: document.querySelector('[data-exercises-results]'),
  exercisesList: document.querySelector('.exercise-list'),
  exercisesTitle: document.querySelector('.exercises-results-title'),
  exercisesEmpty: document.querySelector('.exercises-empty'),
  exercisesBack: document.querySelector('.exercises-back-btn'),
  searchForm: document.querySelector('.exercises-search'),
  searchInput: document.querySelector('.exercises-search-input'),
  pagination: document.querySelector('.pagination'),
  quoteText: document.querySelector('.side-card-text'),
  quoteAuthor: document.querySelector('.side-card-author'),
  favoritesQuoteText: document.querySelector('.quote-text'),
  favoritesQuoteAuthor: document.querySelector('.quote-author'),
  favoritesList: document.querySelector('.favorites-list'),
  favoritesEmpty: document.querySelector('.favorites-empty'),
  subscribeForm: document.querySelector('.subscribe-form'),
};

const formatDate = date => date.toISOString().slice(0, 10);

const toTitle = value =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : '';

const getId = data => data?._id || data?.id || '';

const renderStars = rating => {
  const rounded = Math.round(Number(rating) || 0);
  return Array.from({ length: 5 }, (_, index) =>
    index < rounded ? '★' : '☆'
  ).join('');
};

const getFavorites = () => {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
  } catch {
    return [];
  }
};

const saveFavorites = list => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
};

const isFavorite = id => getFavorites().some(item => getId(item) === id);

const toggleFavorite = exercise => {
  const list = getFavorites();
  const id = getId(exercise);
  const exists = list.findIndex(item => getId(item) === id);
  if (exists >= 0) {
    list.splice(exists, 1);
  } else {
    list.push(exercise);
  }
  saveFavorites(list);
  return exists < 0;
};

const fetchJson = async url => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }
  return response.json();
};

const extractResults = data => {
  if (Array.isArray(data)) return { results: data, totalPages: 1 };
  const results = data.results || data.items || data.data || [];
  const totalPages =
    data.totalPages ||
    data.total_pages ||
    data.pages ||
    Math.ceil((data.totalItems || results.length) / (data.perPage || 1));
  return { results, totalPages: totalPages || 1 };
};

const getQuoteOfDay = async () => {
  const stored = localStorage.getItem(QUOTE_KEY);
  const today = formatDate(new Date());
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (parsed.date === today) return parsed;
    } catch {
      localStorage.removeItem(QUOTE_KEY);
    }
  }
  const data = await fetchJson(`${API_BASE}/quote`);
  const payload = {
    date: today,
    text: data.quote || data.text || '',
    author: data.author || '',
  };
  localStorage.setItem(QUOTE_KEY, JSON.stringify(payload));
  return payload;
};

const renderQuote = async () => {
  try {
    const quote = await getQuoteOfDay();
    if (refs.quoteText) refs.quoteText.textContent = quote.text;
    if (refs.quoteAuthor) refs.quoteAuthor.textContent = quote.author;
    if (refs.favoritesQuoteText) refs.favoritesQuoteText.textContent = quote.text;
    if (refs.favoritesQuoteAuthor)
      refs.favoritesQuoteAuthor.textContent = `— ${quote.author}`;
  } catch (error) {
    console.error(error);
  }
};

const setActiveFilter = button => {
  refs.filterButtons.forEach(btn => btn.classList.remove('is-active'));
  button.classList.add('is-active');
};

const fetchFilters = async () => {
  const params = new URLSearchParams({
    filter: state.filter,
    page: state.page,
    limit: state.limit,
  });
  const data = await fetchJson(`${API_BASE}/filters?${params.toString()}`);
  return extractResults(data);
};

const renderCategories = items => {
  if (!refs.categoryGrid) return;
  refs.categoryGrid.innerHTML = items
    .map(item => {
      const name = item.name || item.title || '';
      const image =
        item.imgURL || item.imgUrl || item.image || item.previewUrl || '';
      return `
        <li class="category-tile" data-category="${name}">
          <img class="category-tile-image" src="${image}" alt="${name}" />
          <span class="category-tile-label">
            <span class="category-tile-title">${name}</span>
            <span class="category-tile-subtitle">${state.filter}</span>
          </span>
        </li>
      `;
    })
    .join('');
};

const renderPagination = (totalPages, currentPage) => {
  if (!refs.pagination) return;
  if (totalPages <= 1) {
    refs.pagination.classList.add('is-hidden');
    return;
  }
  refs.pagination.classList.remove('is-hidden');

  const pages = new Set([1, totalPages, currentPage, currentPage - 1, currentPage + 1]);
  const sorted = [...pages].filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const items = [];
  sorted.forEach((page, idx) => {
    const prev = sorted[idx - 1];
    if (prev && page - prev > 1) items.push('dots');
    items.push(page);
  });

  refs.pagination.innerHTML = `
    ${items
      .map(item => {
        if (item === 'dots') {
          return '<li class="pagination-item pagination-item--dots">...</li>';
        }
        return `
          <li class="pagination-item">
            <button class="pagination-btn ${item === currentPage ? 'is-active' : ''}" type="button" data-page="${item}">
              ${item}
            </button>
          </li>
        `;
      })
      .join('')}
  `;
};

const fetchExercises = async () => {
  const params = new URLSearchParams({
    page: state.page,
    limit: state.limit,
  });
  if (state.keyword) params.set('keyword', state.keyword);

  const filterKey =
    state.filter === 'Body parts'
      ? 'bodypart'
      : state.filter === 'Muscles'
        ? 'muscles'
        : 'equipment';

  if (state.category) params.set(filterKey, state.category);

  const data = await fetchJson(`${API_BASE}/exercises?${params.toString()}`);
  return extractResults(data);
};

const renderExercises = items => {
  if (!refs.exercisesList) return;
  refs.exercisesList.innerHTML = items
    .map(item => {
      const id = getId(item);
      const rating = item.rating ?? 0;
      return `
        <li class="exercise-card">
          <div class="exercise-card-head">
            <h4 class="exercise-name">${toTitle(item.name)}</h4>
            <span class="exercise-rating">
              ${rating}
              <span class="rating-stars">★</span>
            </span>
          </div>
          <div class="exercise-meta">
            <span>Body part: ${toTitle(item.bodyPart)}</span>
            <span>Target: ${toTitle(item.target)}</span>
          </div>
          <div class="exercise-stats">
            <span>${item.burnedCalories ?? 0} kcal</span>
            <span>${item.time ?? 0} min</span>
          </div>
          <button class="exercise-start-btn" type="button" data-id="${id}">
            Start
          </button>
        </li>
      `;
    })
    .join('');
};

const showExercisesView = () => {
  if (refs.categoryGrid) refs.categoryGrid.classList.add('is-hidden');
  if (refs.exercisesResults) refs.exercisesResults.classList.remove('is-hidden');
  state.mode = 'exercises';
};

const showCategoriesView = () => {
  if (refs.categoryGrid) refs.categoryGrid.classList.remove('is-hidden');
  if (refs.exercisesResults) refs.exercisesResults.classList.add('is-hidden');
  state.mode = 'categories';
  state.keyword = '';
  state.category = null;
  state.page = 1;
};

const renderExercisesHeader = () => {
  if (!refs.exercisesTitle) return;
  const label = state.category ? `${state.filter} / ${state.category}` : 'Exercises';
  refs.exercisesTitle.textContent = label;
};

const loadCategories = async () => {
  const { results, totalPages } = await fetchFilters();
  renderCategories(results);
  renderPagination(totalPages, state.page);
};

const loadExercises = async () => {
  const { results, totalPages } = await fetchExercises();
  state.totalPages = totalPages;
  renderExercises(results);
  renderExercisesHeader();
  renderPagination(totalPages, state.page);
  if (refs.exercisesEmpty) {
    refs.exercisesEmpty.classList.toggle('is-hidden', results.length > 0);
  }
};

const createModal = content => {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = content;

  const onClose = () => {
    document.removeEventListener('keydown', onEsc);
    backdrop.remove();
  };

  const onEsc = event => {
    if (event.key === 'Escape') onClose();
  };

  backdrop.addEventListener('click', event => {
    if (event.target === backdrop) onClose();
  });

  const closeBtn = backdrop.querySelector('.modal-close-btn');
  if (closeBtn) closeBtn.addEventListener('click', onClose);

  document.addEventListener('keydown', onEsc);
  document.body.appendChild(backdrop);

  return { backdrop, onClose };
};

const openRatingModal = exercise => {
  const { backdrop, onClose } = createModal(`
    <div class="modal modal--rating" role="dialog" aria-modal="true">
      <button class="modal-close-btn" type="button" aria-label="Close">×</button>
      <h3 class="modal-title">Rating</h3>
      <form class="rating-form">
        <div class="rating-row">
          <span class="rating-value">0.0</span>
          <div class="rating-options">
            ${[1, 2, 3, 4, 5]
              .map(
                value => `
                  <label class="rating-option">
                    <input type="radio" name="rating" value="${value}" ${value === 5 ? 'checked' : ''} />
                    <span>★</span>
                  </label>
                `
              )
              .join('')}
          </div>
        </div>
        <input class="rating-email" type="email" name="email" placeholder="Email" required />
        <textarea class="rating-comment" name="comment" placeholder="Your comment"></textarea>
        <button class="modal-btn modal-btn-primary" type="submit">Send</button>
        <p class="form-message"></p>
      </form>
    </div>
  `);

  const form = backdrop.querySelector('.rating-form');
  const message = backdrop.querySelector('.form-message');
  const ratingValue = backdrop.querySelector('.rating-value');
  const defaultRating = 5;
  ratingValue.textContent = defaultRating.toFixed(1);

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const formData = new FormData(form);
    const rating = Number(formData.get('rating'));
    const email = String(formData.get('email')).trim();

    if (!EMAIL_PATTERN.test(email)) {
      message.textContent = 'Invalid email format.';
      message.className = 'form-message error';
      return;
    }

    try {
      await fetch(`${API_BASE}/exercises/${getId(exercise)}/rating`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });
      message.textContent = 'Rating submitted successfully.';
      message.className = 'form-message success';
      setTimeout(() => {
        onClose();
        openExerciseModal(getId(exercise));
      }, 600);
    } catch (error) {
      message.textContent = 'Failed to submit rating.';
      message.className = 'form-message error';
    }
  });

  form.addEventListener('change', event => {
    if (event.target.name === 'rating') {
      const value = Number(event.target.value);
      ratingValue.textContent = value.toFixed(1);
    }
  });
};

const openExerciseModal = async id => {
  try {
    const exercise = await fetchJson(`${API_BASE}/exercises/${id}`);
    const favoriteText = isFavorite(id) ? 'Remove from favorites' : 'Add to favorites';

    const { backdrop, onClose } = createModal(`
      <div class="modal modal--exercise" role="dialog" aria-modal="true">
        <button class="modal-close-btn" type="button" aria-label="Close">×</button>
        <div class="modal-exercise">
          <div class="modal-media">
            ${exercise.gifUrl ? `<img src="${exercise.gifUrl}" alt="${exercise.name}" />` : ''}
          </div>
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title">${toTitle(exercise.name)}</h3>
              <div class="modal-rating">
                <span class="modal-rating-value">${(exercise.rating ?? 0).toFixed?.(2) ?? exercise.rating ?? 0}</span>
                <span class="modal-rating-stars">${renderStars(exercise.rating)}</span>
              </div>
            </div>
            <div class="modal-divider"></div>
            <ul class="modal-meta-list">
              <li><span class="modal-meta-label">Target</span><span class="modal-meta-value">${toTitle(exercise.target)}</span></li>
              <li><span class="modal-meta-label">Body part</span><span class="modal-meta-value">${toTitle(exercise.bodyPart)}</span></li>
              <li><span class="modal-meta-label">Equipment</span><span class="modal-meta-value">${toTitle(exercise.equipment)}</span></li>
              <li><span class="modal-meta-label">Popular</span><span class="modal-meta-value">${exercise.popularity ?? 0}</span></li>
            </ul>
            <div class="modal-divider"></div>
            <div class="modal-stats">
              <span>Burned calories: ${exercise.burnedCalories ?? 0}</span>
              <span>Time: ${exercise.time ?? 0} min</span>
            </div>
            <p class="modal-description">${exercise.description || ''}</p>
            <div class="modal-actions">
              <button class="modal-btn modal-btn-primary" data-favorite type="button">
                ${favoriteText}
              </button>
              <button class="modal-btn modal-btn-secondary" data-rating type="button">
                Give a rating
              </button>
            </div>
          </div>
        </div>
      </div>
    `);

    const favoriteBtn = backdrop.querySelector('[data-favorite]');
    const ratingBtn = backdrop.querySelector('[data-rating]');

    favoriteBtn.addEventListener('click', () => {
      const added = toggleFavorite(exercise);
      favoriteBtn.textContent = added ? 'Remove from favorites' : 'Add to favorites';
      if (refs.favoritesList) renderFavorites();
    });

    ratingBtn.addEventListener('click', () => {
      onClose();
      openRatingModal(exercise);
    });
  } catch (error) {
    alert('Failed to load exercise details.');
  }
};

const renderFavorites = () => {
  if (!refs.favoritesList) return;
  const favorites = getFavorites();
  refs.favoritesList.innerHTML = favorites
    .map(item => {
      const id = getId(item);
      return `
        <li class="favorite-card">
          <div class="favorite-card-head">
            <p class="favorite-name">${toTitle(item.name)}</p>
            <button class="favorite-remove-btn" type="button" data-id="${id}">
              Remove
            </button>
          </div>
          <div class="favorite-meta">
            <p class="favorite-meta-item">Body part: ${toTitle(item.bodyPart)}</p>
            <p class="favorite-meta-item">Target: ${toTitle(item.target)}</p>
          </div>
          <div class="favorite-stats">
            <p class="favorite-stat">${item.burnedCalories ?? 0} kcal</p>
            <p class="favorite-stat">${item.time ?? 0} min</p>
          </div>
          <button class="favorite-start-btn" type="button" data-id="${id}">
            Start
          </button>
        </li>
      `;
    })
    .join('');

  if (refs.favoritesEmpty) {
    refs.favoritesEmpty.classList.toggle('is-hidden', favorites.length > 0);
  }
};

const handleSubscribe = () => {
  if (!refs.subscribeForm) return;
  const message = document.createElement('p');
  message.className = 'form-message';
  refs.subscribeForm.appendChild(message);

  refs.subscribeForm.addEventListener('submit', async event => {
    event.preventDefault();
    const emailInput = refs.subscribeForm.querySelector('input[name="email"]');
    const email = emailInput?.value.trim() || '';

    if (!EMAIL_PATTERN.test(email)) {
      message.textContent = 'Invalid email format.';
      message.className = 'form-message error';
      return;
    }

    try {
      await fetch(`${API_BASE}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      message.textContent = 'Subscription successful.';
      message.className = 'form-message success';
      refs.subscribeForm.reset();
    } catch (error) {
      message.textContent = 'Subscription failed.';
      message.className = 'form-message error';
    }
  });
};

const initHome = () => {
  if (!refs.categoryGrid) return;

  refs.filterButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const filterName = btn.textContent.trim();
      if (state.filter === filterName) return;
      state.filter = filterName;
      state.page = 1;
      state.keyword = '';
      setActiveFilter(btn);
      showCategoriesView();
      await loadCategories();
    });
  });

  refs.categoryGrid.addEventListener('click', async event => {
    const tile = event.target.closest('.category-tile');
    if (!tile) return;
    state.category = tile.dataset.category;
    state.page = 1;
    showExercisesView();
    await loadExercises();
  });

  refs.exercisesList.addEventListener('click', event => {
    const button = event.target.closest('.exercise-start-btn');
    if (!button) return;
    openExerciseModal(button.dataset.id);
  });

  refs.exercisesBack?.addEventListener('click', async () => {
    showCategoriesView();
    await loadCategories();
  });

  refs.searchForm?.addEventListener('submit', async event => {
    event.preventDefault();
    state.keyword = refs.searchInput?.value.trim() || '';
    state.page = 1;
    await loadExercises();
  });

  refs.pagination?.addEventListener('click', async event => {
    const button = event.target.closest('[data-page]');
    if (!button) return;
    const nextPage = Number(button.dataset.page);
    if (nextPage === state.page) return;
    state.page = nextPage;
    if (state.mode === 'categories') {
      await loadCategories();
    } else {
      await loadExercises();
    }
  });

  loadCategories();
};

const initFavorites = () => {
  if (!refs.favoritesList) return;
  renderFavorites();

  refs.favoritesList.addEventListener('click', event => {
    const removeBtn = event.target.closest('.favorite-remove-btn');
    const startBtn = event.target.closest('.favorite-start-btn');

    if (removeBtn) {
      const id = removeBtn.dataset.id;
      const list = getFavorites().filter(item => getId(item) !== id);
      saveFavorites(list);
      renderFavorites();
    }

    if (startBtn) {
      openExerciseModal(startBtn.dataset.id);
    }
  });
};

document.addEventListener('DOMContentLoaded', () => {
  const menu = document.querySelector('[data-menu]');
  const menuOpenBtn = document.querySelector('.burger-btn');
  const menuCloseBtn = document.querySelector('.mobile-close-btn');

  const closeMenu = () => {
    if (!menu) return;
    menu.classList.add('is-hidden');
    document.body.style.overflow = '';
  };

  const openMenu = () => {
    if (!menu) return;
    menu.classList.remove('is-hidden');
    document.body.style.overflow = 'hidden';
  };

  menuOpenBtn?.addEventListener('click', openMenu);
  menuCloseBtn?.addEventListener('click', closeMenu);
  menu?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });

  const path = window.location.pathname.replace(/\/+$/, '');
  const isFavorites = path.endsWith('page-2.html');
  document.querySelectorAll('.nav-link').forEach(link => {
    const target = link.getAttribute('href') || '';
    const active =
      (isFavorites && target.includes('page-2.html')) ||
      (!isFavorites && target.includes('index.html'));
    link.classList.toggle('is-active', active);
    if (active) {
      link.setAttribute('aria-current', 'page');
    } else {
      link.removeAttribute('aria-current');
    }
  });

  renderQuote();
  initHome();
  initFavorites();
  handleSubscribe();
});
