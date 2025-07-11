// Get the product slug from the URL and fetch data from WordPress, then populate the <single-product> component

// Helper to safely get nested values
const getSafe = (obj, path, fallback = undefined) => {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj) ?? fallback;
};

async function fetchProductBySlug(slug) {
  const endpoint = `http://localhost:8888/wordpress/wp-json/wp/v2/product?slug=${encodeURIComponent(slug)}`;
  const res = await fetch(endpoint, { credentials: 'include' });
  if (!res.ok) throw new Error(`Failed fetching product: ${res.status}`);
  const data = await res.json();
  if (!Array.isArray(data) || data.length === 0) throw new Error('Product not found');
  return data[0];
}

function transformWpProduct(wp) {
  const acf = wp.acf || {};

  // Images: main image + gallery if present
  const images = [];
  const mainImgUrl = getSafe(acf, 'main_image.url');
  if (mainImgUrl) images.push(mainImgUrl);

  const gallery = acf.product_gallery;
  if (Array.isArray(gallery)) {
    gallery.forEach(img => {
      const url = getSafe(img, 'url');
      if (url) images.push(url);
    });
  }

  return {
    id: wp.id,
    images,
    title: acf.title || getSafe(wp, 'title.rendered', ''),
    rating: acf.rating || 0,
    price: parseFloat(acf.price) || 0,
    originalPrice: parseFloat(acf.original_price) || 0,
    description: acf.description || '',
    colors: Array.isArray(acf.colors) ? acf.colors : [],
    sizes: Array.isArray(acf.sizes) ? acf.sizes : []
  };
}

async function initSingleProduct() {
  try {
    let slug = '';
    const params = new URLSearchParams(window.location.search);

    // If URL uses key=value (e.g., ?slug=checkered-shirt)
    if (params.has('slug')) {
      slug = params.get('slug');
    } else {
      // Handle bare slug in query string (e.g., ?checkered-shirt)
      slug = window.location.search.replace(/^\?/, '').split('&')[0];
    }

    if (!slug) throw new Error('No product slug provided');

    const wpProduct = await fetchProductBySlug(slug);
    const product = transformWpProduct(wpProduct);

    const productSection = document.querySelector('section.product');
    if (!productSection) throw new Error('Product section not found in DOM');

    // Remove any existing single-product element
    const existing = productSection.querySelector('single-product');
    if (existing) existing.remove();

    // Create and append a fresh single-product component
    const sp = document.createElement('single-product');
    sp.setAttribute('product', JSON.stringify(product));
    productSection.appendChild(sp);

    // Extract categories from WP response and update breadcrumb
    const categories = extractCategoriesFromClassList(wpProduct.class_list);
    updateBreadcrumb(categories);

    // Fetch and render related products
    await loadRelatedProducts(categories, slug);

  } catch (err) {
    console.error('Single product init failed:', err);
  }
}

// Helper: format dashed slug (e.g., "men" or "casual-shirts") to Title-Case
function formatLabel(slug) {
  return slug
    .split('-')
    .map(s => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

// Build a <product-card> element from a WP product object ---
function buildProductCard(product) {
  const acf = product.acf || {};
  const card = document.createElement('product-card');

  // Basic attributes
  card.setAttribute('slug', product.slug);
  card.setAttribute('name', acf.title || product.title?.rendered || '');
  card.setAttribute('rating', acf.rating || '4');
  

  // Pricing
  if (acf.price) {
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

  return card;
}

// Fetch and render related products ---
async function loadRelatedProducts(categories = [], currentSlug = '', limit = 4) {
  if (!Array.isArray(categories) || categories.length === 0) return;

  try {
    const endpoint = 'http://localhost:8888/wordpress/wp-json/wp/v2/product?per_page=100';
    const res = await fetch(endpoint, { credentials: 'include' });
    if (!res.ok) throw new Error(`Failed fetching products list: ${res.status}`);
    const products = await res.json();

    // Filter products by category overlap and exclude current product
    const related = products.filter(p => {
      if (p.slug === currentSlug) return false;
      const prodCats = (p.class_list || [])
        .filter(cls => cls.startsWith('product-category-'))
        .map(cls => cls.replace('product-category-', ''));
      return prodCats.some(cat => categories.includes(cat));
    });

    if (related.length === 0) return;

    // Shuffle and pick first N
    related.sort(() => 0.5 - Math.random());
    const picks = related.slice(0, limit);

    const container = document.querySelector('.related__products');
    if (!container) return;

    // Clear existing
    container.innerHTML = '';

    picks.forEach(p => {
      container.appendChild(buildProductCard(p));
    });
  } catch (err) {
    console.error('Failed loading related products:', err);
  }
}

// Extract product categories from WP response's class_list
function extractCategoriesFromClassList(classList = []) {
  return classList
    .filter(cls => cls.startsWith('product-category-'))
    .map(cls => cls.replace('product-category-', ''));
}

// Update the breadcrumb text in the DOM
function updateBreadcrumb(categories = []) {
  if (!Array.isArray(categories) || categories.length === 0) return;

  // Ensure broad parent categories appear first
  const PRIORITY = ['men', 'women', 'kids', 'unisex'];
  const ordered = [...categories].sort((a, b) => {
    const ia = PRIORITY.indexOf(a);
    const ib = PRIORITY.indexOf(b);
    if (ia !== -1 || ib !== -1) {
      if (ia === -1) return 1; // b (priority) before a
      if (ib === -1) return -1; // a (priority) before b
      return ia - ib; // both priority
    }
    return a.localeCompare(b);
  });
  const labels = ordered.map(formatLabel);
  const breadcrumbEl = document.querySelector('section.product > p');
  if (!breadcrumbEl) return;

  breadcrumbEl.textContent = `Home > Shop > ${labels.join(' > ')} `;
}

// Replace previous DOMContentLoaded listener with combined initialization
document.addEventListener('DOMContentLoaded', () => {
  initSingleProduct();
});
