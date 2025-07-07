import styles from './styles.scss?inline';

class ProductCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        const rating = this.getAttribute('rating');
        const price = this.getAttribute('price');
        const originalPrice = this.getAttribute('originalPrice');
        const discount = this.getAttribute('discount');
        const image = this.getAttribute('image');
        const name = this.getAttribute('name');

        const template = document.createElement('template');
        template.innerHTML = `
            <style>${styles}</style>
            <div class="product">
                <img src=${image} alt=${name} loading="lazy">
                <h3>${name}</h3>
                <div class="product__rating">
                    <div class="product__rating__stars">
                        ${this.generateStars(rating)}
                    </div>
                    <p>${rating}/5</p>
                </div>
                <div class="product__price">
                    <p class="product__price--current">$${price}</p>
                    ${originalPrice ? `<p class="product__price--original">$${originalPrice}</p>` : ''}
                    ${discount ? `
                        <div class="product__price--discount">
                            <p>-${discount}%</p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        this.shadowRoot.appendChild(template.content.cloneNode(true));
    }

    generateStars(rating) {
        const fullStar = `<svg width="19" height="17" viewBox="0 0 19 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9.24494 0.255005L11.8641 5.89491L18.0374 6.6431L13.4829 10.8769L14.679 16.9793L9.24494 13.956L3.8109 16.9793L5.00697 10.8769L0.452479 6.6431L6.62573 5.89491L9.24494 0.255005Z" fill="#FFC633"/>
        </svg>`;

        const halfStar = `<svg width="9" height="17" viewBox="0 0 9 17" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3.56594 16.9793L8.99998 13.956V0.255005L6.38077 5.89491L0.20752 6.6431L4.76201 10.8769L3.56594 16.9793Z" fill="#FFC633"/>
        </svg>`;

        const numRating = parseFloat(rating);
        const fullStars = Math.floor(numRating);
        const hasHalfStar = numRating % 1 >= 0.5;
        

        return `
            ${Array(fullStars).fill(fullStar).join('')}
            ${hasHalfStar ? halfStar : ''}
        `;
    }

    render() {}
}

customElements.define('product-card', ProductCard);