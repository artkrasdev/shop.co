// Fetch 4 random products from WordPress REST API and render them in both New Arrivals and Top Selling sections
(async function loadProducts() {
  const API_URL = 'http://localhost:8888/wordpress/wp-json/wp/v2/product';
  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.status} ${response.statusText}`);
    }

    const products = await response.json();

    const newArrivalsContainer = document.querySelector('.new-arrivals__products');
    const topSellingContainer = document.querySelector('.top-selling__products');

    if (!newArrivalsContainer || !topSellingContainer) {
      console.warn('Product containers not found on the page.');
      return;
    }

    newArrivalsContainer.innerHTML = '';
    topSellingContainer.innerHTML = '';

    const selected = [...products].sort(() => 0.5 - Math.random()).slice(0, 4);

    const buildCard = (product) => {
      const acf = product.acf || {};
      const card = document.createElement('product-card');

      card.setAttribute('slug', product.slug);
      card.setAttribute('name', acf.title || product.title?.rendered || '');
      card.setAttribute('rating', acf.rating || '4');

      if (acf.price) card.setAttribute('price', acf.price);
      if (acf.original_price) {
        card.setAttribute('originalPrice', acf.original_price);
        const sale = parseFloat(acf.price);
        const original = parseFloat(acf.original_price);
        if (!isNaN(sale) && !isNaN(original) && original > sale) {
          const discount = Math.round(((original - sale) / original) * 100);
          card.setAttribute('discount', discount.toString());
        }
      }

      if (acf.main_image?.url) card.setAttribute('image', acf.main_image.url);

      return card;
    };

    selected.forEach((product) => {
      newArrivalsContainer.appendChild(buildCard(product));
      topSellingContainer.appendChild(buildCard(product));
    });
  } catch (error) {
    console.error(error);
  }
})();
