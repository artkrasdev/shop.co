import styles from './styles.scss?inline';

class Placeholder extends HTMLElement {
    static get observedAttributes() {
        return ['width', 'height'];
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
        const width = this.getAttribute('width') || '100%';
        const height = this.getAttribute('height') || '2em';
        this.shadowRoot.innerHTML = `
            <style>${styles}</style>
            <div class="placeholder" style="width: ${width}; height: ${height};"></div>
        `;
    }
}

if (!customElements.get('placeholder-blink')) {
    customElements.define('placeholder-blink', Placeholder);
} 