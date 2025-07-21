const WP_SITE_URL = 'https://artur-shop.poei.garage404.com/'; 

document.addEventListener('DOMContentLoaded', () => {
  const sliderElement = document.getElementById('price-slider');

  // Safeguard – only run on pages where the slider exists and the library is loaded
  if (!sliderElement || typeof window.noUiSlider === 'undefined') return;

  // Default range values – adjust as needed
  const RANGE_MIN = 0;
  const RANGE_MAX = 500;
  const START_MIN = 0;
  const START_MAX = 200;

  // State: currently selected price range
  let currentPriceRange = [START_MIN, START_MAX];

  // Create the slider
  window.noUiSlider.create(sliderElement, {
    start: [START_MIN, START_MAX],
    connect: true,
    step: 1,
    range: {
      min: RANGE_MIN,
      max: RANGE_MAX,
    },
  });

  // Elements to display min and max values
  const minOutput = document.getElementById('price-min');
  const maxOutput = document.getElementById('price-max');

  // Update the displayed values when the slider changes
  sliderElement.noUiSlider.on('update', (values, handle) => {
    const value = Math.round(values[handle]);
    if (handle === 0) {
      if (minOutput) minOutput.textContent = `$${value}`;
    } else {
      if (maxOutput) maxOutput.textContent = `$${value}`;
    }

    // Update current price range; filtering occurs when Apply Filters is clicked
    currentPriceRange[handle] = value;
  });

  /* --------------------------------------------------
   * Color filter swatch selection
   * -------------------------------------------------- */
  const colorItems = document.querySelectorAll('.shop__filters__colors__items__item');
  if (colorItems.length) {
    const CHECK_SVG = '<svg width="14" height="11" viewBox="0 0 14 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M13.5306 2.03063L5.5306 10.0306C5.46092 10.1005 5.37813 10.156 5.28696 10.1939C5.1958 10.2317 5.09806 10.2512 4.99935 10.2512C4.90064 10.2512 4.8029 10.2317 4.71173 10.1939C4.62057 10.156 4.53778 10.1005 4.4681 10.0306L0.968098 6.53063C0.898333 6.46087 0.842993 6.37804 0.805236 6.28689C0.76748 6.19574 0.748047 6.09804 0.748047 5.99938C0.748047 5.90072 0.76748 5.80302 0.805236 5.71187C0.842993 5.62072 0.898333 5.53789 0.968098 5.46813C1.03786 5.39837 1.12069 5.34302 1.21184 5.30527C1.30299 5.26751 1.40069 5.24808 1.49935 5.24808C1.59801 5.24808 1.69571 5.26751 1.78686 5.30527C1.87801 5.34302 1.96083 5.39837 2.0306 5.46813L4.99997 8.4375L12.4693 0.969379C12.6102 0.828483 12.8013 0.749329 13.0006 0.749329C13.1999 0.749329 13.391 0.828483 13.5318 0.969379C13.6727 1.11028 13.7519 1.30137 13.7519 1.50063C13.7519 1.69989 13.6727 1.89098 13.5318 2.03188L13.5306 2.03063Z" fill="white"/></svg>';

    const addCheckIcon = (el) => {
      if (!el.querySelector('svg')) {
        el.insertAdjacentHTML('beforeend', CHECK_SVG);
      }
    };

    const removeCheckIcon = (el) => {
      const icon = el.querySelector('svg');
      if (icon) icon.remove();
    };

    // Toggle selection on click, allowing multiple selections
    colorItems.forEach((item) => {
      item.addEventListener('click', () => {
        const isSelected = item.classList.contains('selected');
        if (isSelected) {
          item.classList.remove('selected');
          removeCheckIcon(item);
        } else {
          item.classList.add('selected');
          addCheckIcon(item);
        }
      });
    });

    // Ensure any pre-selected items have the icon
    colorItems.forEach((item) => {
      if (item.classList.contains('selected')) {
        addCheckIcon(item);
      }
    });
  }

  /* --------------------------------------------------
   * Size filter selection
   * -------------------------------------------------- */
  const sizeItems = document.querySelectorAll('.shop__filters__sizes__items__item');
  let selectedSizes = [];
  let selectedStyles = [];

  const slugify = (text) =>
    text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-') // spaces to hyphens
      .replace(/[^\w-]/g, ''); // remove non-word chars except hyphen

  /* Pagination state */
  const determineItemsPerPage = () => (window.matchMedia('(max-width: 600px)').matches ? 6 : 9);
  let ITEMS_PER_PAGE = determineItemsPerPage();

  let currentPage = 1;
  let lastMatchingCards = [];
  let resultsTextEl = null;

  /* Pagination elements */
  const paginationWrapper = document.querySelector('.shop__products__pagination');
  const pagesContainer = paginationWrapper?.querySelector('.pagination__pages');
  const prevBtn = paginationWrapper?.querySelector('.pagination__prev');
  const nextBtn = paginationWrapper?.querySelector('.pagination__next');

  const renderPagination = (totalPages) => {
    if (!paginationWrapper || !pagesContainer) return;

    // Hide pagination if single page
    if (totalPages <= 1) {
      paginationWrapper.style.display = 'none';
      return;
    }

    paginationWrapper.style.display = '';

    // Clear previous page buttons
    pagesContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = 'pagination__page';
      if (i === currentPage) btn.classList.add('active');
      btn.textContent = i.toString();
      btn.addEventListener('click', () => {
        currentPage = i;
        updateDisplayedCards();
      });
      pagesContainer.appendChild(btn);
    }

    // Prev/Next buttons
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;
  };

  const updateDisplayedCards = () => {
    if (!lastMatchingCards.length) return;
    const totalPages = Math.ceil(lastMatchingCards.length / ITEMS_PER_PAGE);

    // Update results counter text
    if (!resultsTextEl) {
      /* Grab first p inside sort container once */
      const sortContainer = document.querySelector('.shop__products__header__sort');
      if (sortContainer) {
        resultsTextEl = sortContainer.querySelector('p');
      }
    }

    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIdx = startIdx + ITEMS_PER_PAGE;

    const showingBegin = lastMatchingCards.length === 0 ? 0 : startIdx + 1;
    const showingEnd = Math.min(endIdx, lastMatchingCards.length);

    if (resultsTextEl) {
      if (lastMatchingCards.length === 0) {
        resultsTextEl.textContent = 'No results';
      } else {
        resultsTextEl.textContent = `Showing ${showingBegin}-${showingEnd} of ${lastMatchingCards.length} results`;
      }
    }

    // Ensure currentPage within bounds after grabbing indices as above
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    lastMatchingCards.forEach((card, idx) => {
      card.style.display = idx >= startIdx && idx < endIdx ? '' : 'none';
    });

    renderPagination(totalPages);
  };

  // Hoisted filter function
  function filterCards() {
    currentPage = 1; // reset page on new filter application
    const cards = document.querySelectorAll('product-card');
    lastMatchingCards = [];
    cards.forEach((card) => {
      // Category match
      const categories = card.dataset.categories ? card.dataset.categories.split(',') : [];
      const matchesCategory = !selectedCategory || categories.includes(selectedCategory);

      // Price match
      const rawPriceStr = card.getAttribute('price') || '0';
      const numericPrice = parseFloat(rawPriceStr.replace(/[^\d.]/g, ''));
      const price = isNaN(numericPrice) ? 0 : numericPrice;
      const [minPrice, maxPrice] = currentPriceRange;
      const matchesPrice = price >= minPrice && price <= maxPrice;

      // Size match
      const sizeSlugs = card.dataset.sizes ? card.dataset.sizes.split(',') : [];
      const matchesSize = selectedSizes.length === 0 || sizeSlugs.some((slug) => selectedSizes.includes(slug));

      // Style match
      const styleSlugs = card.dataset.styles ? card.dataset.styles.split(',') : [];
      const matchesStyle = selectedStyles.length === 0 || styleSlugs.some((slug) => selectedStyles.includes(slug));

      const isMatch = matchesCategory && matchesPrice && matchesSize && matchesStyle;

      if (isMatch) {
        lastMatchingCards.push(card);
      }

      // Hide all for now; will show relevant after loop
      card.style.display = 'none';
    });

    updateDisplayedCards();
  }

  if (sizeItems.length) {
    sizeItems.forEach((item) => {
      item.addEventListener('click', () => {
        item.classList.toggle('selected');

        const label = item.textContent.trim();
        const slug = slugify(label);

        if (item.classList.contains('selected')) {
          // add
          if (!selectedSizes.includes(slug)) selectedSizes.push(slug);
        } else {
          // remove
          selectedSizes = selectedSizes.filter((s) => s !== slug);
        }

        // Do not filter yet; wait for Apply Filters button
      });
    });
  }

  /* --------------------------------------------------
   * Styles filter selection
   * -------------------------------------------------- */
  const styleItems = document.querySelectorAll('.shop__filters__styles__items__item');
  if (styleItems.length) {
    styleItems.forEach((item) => {
      item.addEventListener('click', () => {
        item.classList.toggle('selected');

        const label = item.querySelector('p')?.textContent.trim() || '';
        const slug = slugify(label);

        if (item.classList.contains('selected')) {
          if (!selectedStyles.includes(slug)) selectedStyles.push(slug);
        } else {
          selectedStyles = selectedStyles.filter((s) => s !== slug);
        }

        // Do not filter yet; wait for Apply Filters button
      });
    });
  }

  /* --------------------------------------------------
   * Categories filter (sidebar)
   * -------------------------------------------------- */
  const categoryItems = document.querySelectorAll('.shop__filters__categories__items__item');
  let selectedCategory = null; // currently active category slug or null (all)

  if (categoryItems.length) {
    categoryItems.forEach((item) => {
      item.addEventListener('click', () => {
        const label = item.querySelector('p')?.textContent || '';
        const slug = slugify(label);

        const isSelected = item.classList.contains('selected');

        if (isSelected) {
          // Deselect -> show all
          item.classList.remove('selected');
          selectedCategory = null;
        } else {
          // Select this and deselect others
          categoryItems.forEach((i) => i.classList.remove('selected'));
          item.classList.add('selected');
          selectedCategory = slug;
        }

        // Do not filter yet; wait for Apply Filters button
      });
    });
  }

  /* --------------------------------------------------
   * Fetch and render products from WordPress
   * -------------------------------------------------- */
  (async function loadProducts() {
    const API_URL = 'http://localhost:8888/wordpress/wp-json/wp/v2/product?per_page=12';
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
      }

      const products = await response.json();
      const productsContainer = document.querySelector('.shop__products__items');
      if (!productsContainer) {
        console.warn('Products container not found on the page.');
        return;
      }

      // Clear any placeholder content
      productsContainer.innerHTML = '';

      const buildCard = (product) => {
        const acf = product.acf || {};
        const card = document.createElement('product-card');

        // Basic attributes
        card.setAttribute('slug', product.slug);
        card.setAttribute('name', acf.title || product.title?.rendered || '');
        card.setAttribute('rating', acf.rating || '4');
        card.setAttribute('width', '100');

        // Categories data (for filtering)
        const categorySlugs = (product.class_list || [])
          .filter((cls) => cls.startsWith('product-category-'))
          .map((cls) => cls.replace('product-category-', ''));

        if (categorySlugs.length) {
          card.dataset.categories = categorySlugs.join(',');
        }

        // Pricing
        if (acf.price) {
          // Ensure numeric string
          const cleanPrice = acf.price.toString().replace(/[^\d.]/g, '');
          card.setAttribute('price', cleanPrice);
        }
        if (acf.original_price) {
          const cleanOriginal = acf.original_price.toString().replace(/[^\d.]/g, '');
          card.setAttribute('originalPrice', cleanOriginal);

          const sale = parseFloat(acf.price?.toString().replace(/[^\d.]/g, ''));
          const original = parseFloat(cleanOriginal);
          if (!isNaN(sale) && !isNaN(original) && original > sale) {
            const discount = Math.round(((original - sale) / original) * 100);
            card.setAttribute('discount', discount.toString());
          }
        }

        // Image
        if (acf.main_image?.url) card.setAttribute('image', acf.main_image.url);

        // Sizes dataset for filtering
        if (Array.isArray(acf.sizes) && acf.sizes.length) {
          const sizeSlugs = acf.sizes.map((s) => slugify(s));
          card.dataset.sizes = sizeSlugs.join(',');
        }

        // Styles dataset for filtering
        if (Array.isArray(acf.style) && acf.style.length) {
          const styleSlugs = acf.style.map((st) => slugify(st));
          card.dataset.styles = styleSlugs.join(',');
        }

        return card;
      };

      products.forEach((product) => {
        productsContainer.appendChild(buildCard(product));
      });

      // Store all cards for pagination later
      lastMatchingCards = Array.from(productsContainer.querySelectorAll('product-card'));
      updateDisplayedCards();

      // If any filters have been pre-selected (e.g., via URL), apply them now
      if (selectedStyles.length > 0 || selectedSizes.length > 0 || selectedCategory) {
        filterCards();
      }
    } catch (error) {
      console.error(error);
    }
  })();

  // --- Set h1 to category from URL if present ---
  const params = new URLSearchParams(window.location.search);
  const categoryParam = params.get('category');
  if (categoryParam) {
    // Convert slug to human-readable (e.g., new-arrivals -> New Arrivals)
    const formatted = categoryParam
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    const h1 = document.querySelector('.shop__products__header h1');
    if (h1) h1.textContent = formatted;

    // If the param corresponds to a style, pre-select that style filter
    const styleSlugs = ['casual', 'formal', 'party', 'gym'];
    const slug = categoryParam.toLowerCase();
    if (styleSlugs.includes(slug)) {
      if (!selectedStyles.includes(slug)) selectedStyles.push(slug);

      // Highlight the matching style item in the filters panel
      if (typeof styleItems !== 'undefined' && styleItems.length) {
        styleItems.forEach((item) => {
          const label = item.querySelector('p')?.textContent.trim() || '';
          const itemSlug = slugify(label);
          if (itemSlug === slug) {
            item.classList.add('selected');
          }
        });
      }
    }
  }

  /* --------------------------------------------------
   * Apply Filters button
   * -------------------------------------------------- */
  const applyFiltersBtn = document.querySelector('.shop__filters__styles button');

  /* --------------------------------------------------
   * Mobile filters toggle (overlay & slide-up)
   * -------------------------------------------------- */
  const filtersButton = document.querySelector('.shop__products__header__sort__filters');
  const filtersPanel = document.querySelector('.shop__filters');
  const filtersOverlay = document.getElementById('filters-overlay');

  const closeFilters = () => {
    if (filtersPanel) filtersPanel.classList.remove('open');
    if (filtersOverlay) filtersOverlay.classList.remove('active');
  };

  if (filtersButton && filtersPanel && filtersOverlay) {
    filtersButton.addEventListener('click', () => {
      filtersPanel.classList.add('open');
      filtersOverlay.classList.add('active');
    });

    filtersOverlay.addEventListener('click', closeFilters);
  }

  if (applyFiltersBtn) {
    applyFiltersBtn.addEventListener('click', () => {
      filterCards();
      // Close filters on mobile after applying
      closeFilters();
    });
  }

  // Add prev/next listeners
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentPage > 1) {
        currentPage -= 1;
        updateDisplayedCards();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(lastMatchingCards.length / ITEMS_PER_PAGE);
      if (currentPage < totalPages) {
        currentPage += 1;
        updateDisplayedCards();
      }
    });
  }

  /* --------------------------------------------------
   * Handle viewport resize to adjust items per page
   * -------------------------------------------------- */
  window.addEventListener('resize', () => {
    const newVal = determineItemsPerPage();
    if (newVal !== ITEMS_PER_PAGE) {
      ITEMS_PER_PAGE = newVal;
      updateDisplayedCards();
    }
  });
}); 