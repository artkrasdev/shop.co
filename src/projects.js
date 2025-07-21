import './main.js';

const PROJECTS_CONTAINER_ID = 'wp-projects';
const LOAD_MORE_BTN_ID = 'load-more-projects';

const WP_SITE_URL = 'http://localhost:8888/wordpress';
const PROJECTS_PER_PAGE = 2;

let currentPage = 1;
let totalPages = null;

async function fetchProjects(page = 1) {
  const endpoint = `${WP_SITE_URL}/wp-json/wp/v2/projet?_embed&per_page=${PROJECTS_PER_PAGE}&page=${page}`;
  const response = await fetch(endpoint);

  if (!response.ok) {
    console.error('Failed to fetch projects', response.statusText);
    return [];
  }

  if (totalPages === null) {
    const pagesHeader = response.headers.get('X-WP-TotalPages');
    totalPages = pagesHeader ? parseInt(pagesHeader, 10) : 0;
  }

  return response.json();
}

function renderProjects(projects = []) {
  const container = document.getElementById(PROJECTS_CONTAINER_ID);
  if (!container) return;

  const fragment = document.createDocumentFragment();

  projects.forEach(project => {
    const article = document.createElement('article');
    article.className = 'wp-project';

    const featuredImgUrl = project?._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    if (featuredImgUrl) {
      const img = document.createElement('img');
      img.src = featuredImgUrl;
      img.alt = project.title.rendered;
      article.appendChild(img);
    }

    const title = document.createElement('h2');
    title.innerHTML = project.title.rendered;
    article.appendChild(title);

    const secondaryImgUrl = project?.acf?.image_secondaire;
    if (secondaryImgUrl) {
      const secondaryImg = document.createElement('img');
      secondaryImg.src = secondaryImgUrl;
      secondaryImg.alt = `${project.title.rendered} - secondary`;
      article.appendChild(secondaryImg);
    }

    if (project?.acf?.client) {
      const clientP = document.createElement('p');
      clientP.textContent = `Client: ${project.acf.client}`;
      article.appendChild(clientP);
    }

    if (project?.acf?.date) {
      const dateP = document.createElement('p');
      dateP.textContent = `Date: ${project.acf.date}`;
      article.appendChild(dateP);
    }

    if (project?.acf?.lien) {
      const linkA = document.createElement('a');
      linkA.href = project.acf.lien;
      linkA.target = '_blank';
      linkA.rel = 'noopener noreferrer';
      linkA.textContent = 'Voir le projet';
      article.appendChild(linkA);
    }

    fragment.appendChild(article);
  });

  container.appendChild(fragment);
}

async function loadMoreProjects() {
  if (totalPages !== null && currentPage > totalPages) return;

  const projects = await fetchProjects(currentPage);
  renderProjects(projects);
  currentPage += 1;

  if (totalPages !== null && currentPage > totalPages) {
    const btn = document.getElementById(LOAD_MORE_BTN_ID);
    if (btn) btn.style.display = 'none';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadMoreProjects();
  const btn = document.getElementById(LOAD_MORE_BTN_ID);
  if (btn) {
    btn.addEventListener('click', loadMoreProjects);
  }
}); 