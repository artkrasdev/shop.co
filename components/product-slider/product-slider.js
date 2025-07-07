import styles from './styles.scss?inline';

class ProductSlider extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.images = [];
        this.activeIndex = 0;
    }

    static get observedAttributes() {
        return ['images'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'images') {
            try {
                this.images = JSON.parse(newValue);
            } catch {
                this.images = [];
            }
            this.activeIndex = 0;
            this.render();
        }
    }

    connectedCallback() {
        if (this.hasAttribute('images')) {
            try {
                this.images = JSON.parse(this.getAttribute('images'));
            } catch {
                this.images = [];
            }
        }
        this.render();
    }

    setActive(index) {
        this.activeIndex = index;
        this.render();
    }

    render() {
        if (!this.images.length) {
            this.shadowRoot.innerHTML = `<style>${styles}</style><div>No images</div>`;
            return;
        }
        this.shadowRoot.innerHTML = `
            <style>${styles}</style>
            <div class="single-product__image">
                <div class="single-product__image__thumb">
                    ${this.images.map((img, i) => `
                        <img src="${img}" alt="Thumbnail ${i+1}" data-index="${i}" class="${i === this.activeIndex ? 'active' : ''}">
                    `).join('')}
                </div>
                <div class="single-product__image__main">
                    <img src="${this.images[this.activeIndex]}" alt="Main Product Image">
                </div>
            </div>
        `;
        this.shadowRoot.querySelectorAll('.single-product__image__thumb img').forEach(img => {
            img.addEventListener('click', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                this.setActive(idx);
            });
        });
    }
}

customElements.define('product-slider', ProductSlider);

export default ProductSlider;