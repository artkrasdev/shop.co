import styles from './styles.scss?inline';

class BlogItem extends HTMLElement {
    static get observedAttributes() {
        return ['title', 'excerpt', 'image', 'link'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.render();
    }

    attributeChangedCallback() {
        this.render();
    }

    render() {
        const title = this.getAttribute('title') || '';
        const excerpt = this.getAttribute('excerpt') || '';
        const image = this.getAttribute('image') || '';
        const link = this.getAttribute('link') || '#';

        this.shadowRoot.innerHTML = `
            <style>${styles}</style>
            <article class="blog-item">
                ${image ? `<img class="blog-item__image" src="${image}" alt="${title}">` : ''}
                <div class="blog-item__content">
                    <h2 class="blog-item__title">${title}</h2>
                    <p class="blog-item__excerpt">${excerpt}</p>
                </div>
                <a class="blog-item__link" href="${link}" aria-label="Read more about ${title}"></a>
            </article>
        `;
    }
}

// Prevent re-definition when hot-reloading
if (!customElements.get('blog-item')) {
    customElements.define('blog-item', BlogItem);
}