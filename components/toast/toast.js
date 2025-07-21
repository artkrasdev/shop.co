import styles from './styles.scss?inline';

class Toast extends HTMLElement {
    static get observedAttributes() {
        return ['text', 'type'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.timeoutId = null;
    }

    connectedCallback() {
        this.render();
        // Only call showToast if not already in a toast-container
        const parent = this.parentNode;
        if (!parent || !parent.classList || !parent.classList.contains('toast-container')) {
            this.showToast();
        }
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log('attributeChangedCallback:', name, oldValue, newValue, 'Current attributes:', this.getAttribute('text'), this.getAttribute('type'));
        this.render();
    }

    render() {
        const text = this.getAttribute('text') || '';
        const type = this.getAttribute('type') || 'success';
        this.shadowRoot.innerHTML = `
            <style>${styles}</style>
            <div class="toast toast--${type}">
                <span class="toast__icon">${this.getIcon(type)}</span>
                <span class="toast__text">${text}</span>
            </div>
        `;
    }

    showToast() {
        // Append directly to body if not already present
        if (this.parentNode !== document.body) {
            document.body.appendChild(this);
        }
        // Animate in
        const toastDiv = this.shadowRoot.querySelector('.toast');
        toastDiv.classList.add('show');
        // Stack all toasts
        Toast.stackToasts();
        // Hide after 5 seconds
        this.timeoutId = setTimeout(() => {
            this.hideToast();
        }, 5000);
    }

    hideToast() {
        const toastDiv = this.shadowRoot.querySelector('.toast');
        if (toastDiv) {
            toastDiv.classList.remove('show');
            toastDiv.classList.add('hide');
            setTimeout(() => {
                if (this.parentNode) {
                    this.parentNode.removeChild(this);
                    Toast.stackToasts();
                }
            }, 300); // match transition duration
        }
    }

    disconnectedCallback() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }

    getIcon(type) {
        switch(type) {
            case 'error':
                return `<svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#FF3333"/><path d="M6 6l8 8M14 6l-8 8" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;
            case 'warning':
                return `<svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#FFC633"/><path d="M10 5v6" stroke="#fff" stroke-width="2" stroke-linecap="round"/><circle cx="10" cy="14" r="1" fill="#fff"/></svg>`;
            case 'success':
            default:
                return `<svg width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="10" cy="10" r="10" fill="#01AB31"/><path d="M6 10.5l3 3 5-5" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
        }
    }

    static stackToasts() {
        // Get all toast-message elements in the body (in order of appearance)
        const toasts = Array.from(document.querySelectorAll('toast-message'));
        const spacing = 72; // match $space-md (16px)
        const base = 32; // match $space-xl (32px)
        // Stack from the bottom up
        toasts.forEach((toast, i) => {
            const offset = base + i * (toast.offsetHeight + spacing);
            const toastDiv = toast.shadowRoot && toast.shadowRoot.querySelector('.toast');
            if (toastDiv) {
                toastDiv.style.bottom = offset + 'px';
                toastDiv.style.right = base + 'px';
            }
        });
    }
}

if (!customElements.get('toast-message')) {
    customElements.define('toast-message', Toast);
} 