export class Modal {
  constructor(title, content) {
    this.title = title;
    this.content = content;
    this.modal = null;
  }

  render() {
    this.modal = document.createElement('div');
    this.modal.className = 'modal-overlay';

    this.modal.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <h3>${this.title}</h3>
          <button class="modal-close" id="modalClose">✕</button>
        </div>
        <div class="modal-content">
          ${this.content}
        </div>
      </div>
    `;

    // Add event listeners
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    this.modal.querySelector('#modalClose').addEventListener('click', () => {
      this.close();
    });

    // Handle escape key
    document.addEventListener('keydown', this.handleEscape.bind(this));

    return this.modal;
  }

  handleEscape(e) {
    if (e.key === 'Escape') {
      this.close();
    }
  }

  close() {
    document.removeEventListener('keydown', this.handleEscape.bind(this));
    this.modal.remove();
  }
}