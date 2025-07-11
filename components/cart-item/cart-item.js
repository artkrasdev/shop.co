import styles from './styles.scss?inline';

class CartItem extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        const name = this.getAttribute('name');
        const size = this.getAttribute('size');
        const color = this.getAttribute('color');
        const price = this.getAttribute('price');
        const quantity = this.getAttribute('quantity') || 1;
        const image = this.getAttribute('image');
        const productId = this.getAttribute('product_id');

        const template = document.createElement('template');
        template.innerHTML = `
            <style>${styles}</style>
            <div class="cart-item">
                <img src="${image}" alt="${name}">
                <div class="cart-item__container">
                    <div class="cart-item__container__top">
                        <h2>${name}</h2>
                        <svg class='trash-btn' width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.25 4.5H16.5V3.75C16.5 3.15326 16.2629 2.58097 15.841 2.15901C15.419 1.73705 14.8467 1.5 14.25 1.5H9.75C9.15326 1.5 8.58097 1.73705 8.15901 2.15901C7.73705 2.58097 7.5 3.15326 7.5 3.75V4.5H3.75C3.55109 4.5 3.36032 4.57902 3.21967 4.71967C3.07902 4.86032 3 5.05109 3 5.25C3 5.44891 3.07902 5.63968 3.21967 5.78033C3.36032 5.92098 3.55109 6 3.75 6H4.5V19.5C4.5 19.8978 4.65804 20.2794 4.93934 20.5607C5.22064 20.842 5.60218 21 6 21H18C18.3978 21 18.7794 20.842 19.0607 20.5607C19.342 20.2794 19.5 19.8978 19.5 19.5V6H20.25C20.4489 6 20.6397 5.92098 20.7803 5.78033C20.921 5.63968 21 5.44891 21 5.25C21 5.05109 20.921 4.86032 20.7803 4.71967C20.6397 4.57902 20.4489 4.5 20.25 4.5ZM10.5 15.75C10.5 15.9489 10.421 16.1397 10.2803 16.2803C10.1397 16.421 9.94891 16.5 9.75 16.5C9.55109 16.5 9.36032 16.421 9.21967 16.2803C9.07902 16.1397 9 15.9489 9 15.75V9.75C9 9.55109 9.07902 9.36032 9.21967 9.21967C9.36032 9.07902 9.55109 9 9.75 9C9.94891 9 10.1397 9.07902 10.2803 9.21967C10.421 9.36032 10.5 9.55109 10.5 9.75V15.75ZM15 15.75C15 15.9489 14.921 16.1397 14.7803 16.2803C14.6397 16.421 14.4489 16.5 14.25 16.5C14.0511 16.5 13.8603 16.421 13.7197 16.2803C13.579 16.1397 13.5 15.9489 13.5 15.75V9.75C13.5 9.55109 13.579 9.36032 13.7197 9.21967C13.8603 9.07902 14.0511 9 14.25 9C14.4489 9 14.6397 9.07902 14.7803 9.21967C14.921 9.36032 15 9.55109 15 9.75V15.75ZM15 4.5H9V3.75C9 3.55109 9.07902 3.36032 9.21967 3.21967C9.36032 3.07902 9.55109 3 9.75 3H14.25C14.4489 3 14.6397 3.07902 14.7803 3.21967C14.921 3.36032 15 3.55109 15 3.75V4.5Z" fill="#FF3333"/></svg>
                    </div>
                    <div class="cart-item__container__middle">
                        <p>Size: ${size}</p>
                        <p>Color: ${color}</p>
                    </div>
                    <div class="cart-item__container__bottom">
                        <p class="cart-item__container__bottom--price">$${price}</p>
                        <div class="cart-item__container__bottom__quantity">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="minus-btn"><path d="M17.8125 10.0001C17.8125 10.2487 17.7137 10.4872 17.5379 10.663C17.3621 10.8388 17.1236 10.9376 16.875 10.9376H3.125C2.87636 10.9376 2.6379 10.8388 2.46209 10.663C2.28627 10.4872 2.1875 10.2487 2.1875 10.0001C2.1875 9.75142 2.28627 9.51296 2.46209 9.33715C2.6379 9.16133 2.87636 9.06256 3.125 9.06256H16.875C17.1236 9.06256 17.3621 9.16133 17.5379 9.33715C17.7137 9.51296 17.8125 9.75142 17.8125 10.0001Z" fill="black"/></svg>                                    
                            <p class="qty-val">${quantity}</p>
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" class="plus-btn"><path d="M17.8125 10.0001C17.8125 10.2487 17.7137 10.4872 17.5379 10.663C17.3621 10.8388 17.1236 10.9376 16.875 10.9376H10.9375V16.8751C10.9375 17.1237 10.8387 17.3622 10.6629 17.538C10.4871 17.7138 10.2486 17.8126 10 17.8126C9.75136 17.8126 9.5129 17.7138 9.33709 17.538C9.16127 17.3622 9.0625 17.1237 9.0625 16.8751V10.9376H3.125C2.87636 10.9376 2.6379 10.8388 2.46209 10.663C2.28627 10.4872 2.1875 10.2487 2.1875 10.0001C2.1875 9.75142 2.28627 9.51296 2.46209 9.33715C2.6379 9.16133 2.87636 9.06256 3.125 9.06256H9.0625V3.12506C9.0625 2.87642 9.16127 2.63796 9.33709 2.46215C9.5129 2.28633 9.75136 2.18756 10 2.18756C10.2486 2.18756 10.4871 2.28633 10.6629 2.46215C10.8387 2.63796 10.9375 2.87642 10.9375 3.12506V9.06256H16.875C17.1236 9.06256 17.3621 9.16133 17.5379 9.33715C17.7137 9.51296 17.8125 9.75142 17.8125 10.0001Z" fill="black"/></svg>                                    
                        </div>
                    </div>
                </div>
            </div>
        `;
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        const dispatch = cart => window.dispatchEvent(new CustomEvent('cart:updated', { detail: cart }));

        // Helper functions to interact with localStorage cart
        const getCart = () => JSON.parse(localStorage.getItem('cart') || '[]');
        const saveCart = cart => localStorage.setItem('cart', JSON.stringify(cart));
        const normalize = v => (v === undefined || v === null) ? '' : String(v);
        const findIndex = (cart) => cart.findIndex(it => String(it.product_id) === String(productId) && normalize(it.color) === normalize(color) && normalize(it.size) === normalize(size));

        // listeners
        const plus  = this.shadowRoot.querySelector('.plus-btn');
        const minus = this.shadowRoot.querySelector('.minus-btn');
        const trash = this.shadowRoot.querySelector('.trash-btn');
        const qtyVal= this.shadowRoot.querySelector('.qty-val');

        if (plus) plus.addEventListener('click', () => {
            const cart = getCart();
            const idx = findIndex(cart);
            if (idx !== -1) {
                cart[idx].qty += 1;
                saveCart(cart);
                // update UI immediately
                qtyVal.textContent = cart[idx].qty;
                dispatch(cart);
            }
        });

        if (minus) minus.addEventListener('click', () => {
            const cart = getCart();
            const idx = findIndex(cart);
            if (idx !== -1 && cart[idx].qty > 1) {
                cart[idx].qty -= 1;
                saveCart(cart);
                qtyVal.textContent = cart[idx].qty;
                dispatch(cart);
            }
        });

        if (trash) trash.addEventListener('click', () => {
            let cart = getCart();
            cart = cart.filter((it, i) => i !== findIndex(cart));
            saveCart(cart);
            dispatch(cart);
        });
    }
}

customElements.define('cart-item', CartItem);