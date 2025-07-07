import './main.js';
import '../components/blog-item/blog-item.js';

const POSTS_CONTAINER_ID = 'wp-posts';
const LOAD_MORE_BTN_ID = 'load-more';

const WP_SITE_URL = 'http://localhost:8888/wordpress';
const POSTS_PER_PAGE = 2;

let currentPage = 1;
let totalPages = null;

async function fetchPosts(page = 1) {
  const endpoint = `${WP_SITE_URL}/wp-json/wp/v2/posts?_embed&per_page=${POSTS_PER_PAGE}&page=${page}`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    console.error('Failed to fetch posts', response.statusText);
    return [];
  }


  if (totalPages === null) {
    const pagesHeader = response.headers.get('X-WP-TotalPages');
    totalPages = pagesHeader ? parseInt(pagesHeader, 10) : 0;
  }

  return response.json();
}

function sanitizeExcerpt(rawHtml) {
  const tmp = document.createElement('div');
  tmp.innerHTML = rawHtml;
  return tmp.textContent ?? tmp.innerText ?? '';
}

function renderPosts(posts = []) {
  const container = document.getElementById(POSTS_CONTAINER_ID);
  if (!container) return;

  const fragment = document.createDocumentFragment();

  posts.forEach(post => {
    const imgUrl = post?._embedded?.['wp:featuredmedia']?.[0]?.source_url;

    const blogItem = document.createElement('blog-item');
    blogItem.setAttribute('title', post.title.rendered);
    blogItem.setAttribute('excerpt', sanitizeExcerpt(post.excerpt.rendered).slice(0, 160) + '…');
    if (imgUrl) {
      blogItem.setAttribute('image', imgUrl);
    }
    blogItem.setAttribute('link', post.link || '#');

    fragment.appendChild(blogItem);
  });

  container.appendChild(fragment);
}

async function loadMore() {
  if (totalPages !== null && currentPage > totalPages) return;

  const posts = await fetchPosts(currentPage);
  renderPosts(posts);
  currentPage += 1;

  // Hide button if we've reached last page
  if (totalPages !== null && currentPage > totalPages) {
    const btn = document.getElementById(LOAD_MORE_BTN_ID);
    if (btn) btn.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadMore();
  const btn = document.getElementById(LOAD_MORE_BTN_ID);
  if (btn) {
    btn.addEventListener('click', loadMore);
  }
}); 