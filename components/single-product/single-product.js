import '../product-slider/product-slider.js';
import styles from './styles.scss?inline';

class SingleProduct extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        const productAttr = this.getAttribute('product');
        let product = {};
        try {
            product = JSON.parse(productAttr);
        } catch (e) {
            console.error('Invalid product JSON', e);
        }

        const id = product.id || '';
        const images = product.images || [];
        const title = product.title || '';
        const rating = product.rating || 0;
        const price = product.price || '';
        const originalPrice = product.originalPrice || '';
        const description = product.description || '';
        const colors = product.colors || [];
        const sizes = product.sizes || [];

        const template = document.createElement('template');
        template.innerHTML = `
            <style>${styles}</style>
            <div class="single-product">
                <product-slider images='${JSON.stringify(images)}'></product-slider>
                <div class="single-product__info">
                    <h1>${title}</h1>
                    <div class="single-product__info__rating">
                        <div class="stars">${this.generateStars(rating)}</div>
                        <p>${rating}/5</p>
                    </div>
                    <div class="single-product__info__price">
                        <p class="single-product__info__price--current">$${price}</p>
                        <p class="single-product__info__price--original">$${originalPrice}</p>
                        <div class="single-product__info__price--discount">
                            <p>${this.generateDiscount(originalPrice, price)}</p>
                        </div>
                    </div>
                    <p>${description}</p>

                    <div class="single-product__info__colors">
                        <p>Select Color</p>
                        <div class="single-product__info__colors__variants">
                            ${colors.map((color, idx) => `
                                <button class="color-btn" data-color="${color}" style="background-color: ${color};" ${idx === 0 ? 'data-selected="true"' : ''}>
                                    ${idx === 0 ? `<span class="checkmark">${this.getCheckIcon()}</span>` : ''}
                                </button>
                            `).join('')}
                        </div>
                    </div>

                    <div class="single-product__info__sizes">
                        <p>Choose Size</p>
                        <div class="single-product__info__sizes__variants">
                            ${sizes.map((size, idx) => `<button class="size-btn${idx === 0 ? ' active' : ''}" data-size="${size}" ${idx === 0 ? 'data-selected="true"' : ''}>${size}</button>`).join('')}
                        </div>
                    </div>

                    <div class="single-product__info__actions">
                        <div class="single-product__info__actions__quantity">
                            <button type="button" class="quantity-decrease">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.375 12C21.375 12.2984 21.2565 12.5845 21.0455 12.7955C20.8345 13.0065 20.5484 13.125 20.25 13.125H3.75C3.45163 13.125 3.16548 13.0065 2.9545 12.7955C2.74353 12.5845 2.625 12.2984 2.625 12C2.625 11.7016 2.74353 11.4155 2.9545 11.2045C3.16548 10.9935 3.45163 10.875 3.75 10.875H20.25C20.5484 10.875 20.8345 10.9935 21.0455 11.2045C21.2565 11.4155 21.375 11.7016 21.375 12Z" fill="black"/></svg>
                            </button>
                            <span class="quantity-value">1</span>
                            <button type="button" class="quantity-increase">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21.375 12C21.375 12.2984 21.2565 12.5845 21.0455 12.7955C20.8345 13.0065 20.5484 13.125 20.25 13.125H13.125V20.25C13.125 20.5484 13.0065 20.8345 12.7955 21.0455C12.5845 21.2565 12.2984 21.375 12 21.375C11.7016 21.375 11.4155 21.2565 11.2045 21.0455C10.9935 20.8345 10.875 20.5484 10.875 20.25V13.125H3.75C3.45163 13.125 3.16548 13.0065 2.9545 12.7955C2.74353 12.5845 2.625 12.2984 2.625 12C2.625 11.7016 2.74353 11.4155 2.9545 11.2045C3.16548 10.9935 3.45163 10.875 3.75 10.875H10.875V3.75C10.875 3.45163 10.9935 3.16548 11.2045 2.9545C11.4155 2.74353 11.7016 2.625 12 2.625C12.2984 2.625 12.5845 2.74353 12.7955 2.9545C13.0065 3.16548 13.125 3.45163 13.125 3.75V10.875H20.25C20.5484 10.875 20.8345 10.9935 21.0455 11.2045C21.2565 11.4155 21.375 11.7016 21.375 12Z" fill="black"/></svg>
                            </button>
                        </div>
                        <button id="add-to-cart" class="button--primary">Add to Cart</button>
                    </div>
                </div>
            </div>
        `;

        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // Counter logic
        this.quantity = 1;
        const decreaseBtn = this.shadowRoot.querySelector('.quantity-decrease');
        const increaseBtn = this.shadowRoot.querySelector('.quantity-increase');
        const valueSpan = this.shadowRoot.querySelector('.quantity-value');

        decreaseBtn.addEventListener('click', () => {
            if (this.quantity > 1) {
                this.quantity--;
                valueSpan.textContent = this.quantity;
            }
        });
        increaseBtn.addEventListener('click', () => {
            this.quantity++;
            valueSpan.textContent = this.quantity;
        });

        // Color selection logic
        this.selectedColor = colors[0] || null;
        const colorBtns = this.shadowRoot.querySelectorAll('.color-btn');
        colorBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                colorBtns.forEach(b => {
                    b.removeAttribute('data-selected');
                    const mark = b.querySelector('.checkmark');
                    if (mark) mark.remove();
                });
                btn.setAttribute('data-selected', 'true');
                this.selectedColor = btn.getAttribute('data-color');

                btn.insertAdjacentHTML('beforeend', `<span class="checkmark">${this.getCheckIcon()}</span>`);
            });
        });

        // Size selection logic
        this.selectedSize = sizes[0] || null;
        const sizeBtns = this.shadowRoot.querySelectorAll('.size-btn');
        sizeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                sizeBtns.forEach(b => {
                    b.removeAttribute('data-selected');
                    b.classList.remove('active');
                });
                btn.setAttribute('data-selected', 'true');
                btn.classList.add('active');
                this.selectedSize = btn.getAttribute('data-size');
            });
        });

        const addBtn = this.shadowRoot.querySelector('#add-to-cart');
        addBtn.addEventListener('click', async () => {
            const payload = {
                product_id: id,
                color: this.selectedColor,
                size: this.selectedSize,
                qty: this.quantity
            };
            try {
                const res = await fetch('http://localhost:8888/SHOP.CO/backend/api/cart.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(payload)
                });
                const cart = await res.json();
                window.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));
            } catch (err) {
                console.error('Add to cart failed', err);
            }
        });
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

    generateDiscount(originalPrice, price) {
        const discount = ((originalPrice - price) / originalPrice) * 100;
        return `-${discount.toFixed(0)}%`;
    }

    getCheckIcon() {
        return `<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 8.5L7 11.5L12 6.5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    }

    render() {}
}

customElements.define('single-product', SingleProduct);