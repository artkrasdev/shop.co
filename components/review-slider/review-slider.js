import styles from './styles.scss?inline';

class ReviewSlider extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        const template = document.createElement('template');
        template.innerHTML = `
            <style>${styles}</style>
            <div class="review-slider">
                <h2>Review Slider</h2>
            </div>
        `;
    }
}

customElements.define('review-slider', ReviewSlider);