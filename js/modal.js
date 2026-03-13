export class ModalManager {
    constructor() {
        this.overlay = document.getElementById('confirmModal');
        this.title = document.getElementById('modalTitle');
        this.body = document.getElementById('modalBody');
        this.confirmBtn = document.getElementById('confirmActionBtn');
        this.cancelBtn = document.getElementById('cancelActionBtn');
        this.currentAction = null;
        this.payload = null;
        this.setupListeners();
    }

    setupListeners() {
        this.cancelBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });
        this.confirmBtn.addEventListener('click', () => {
            if (this.onConfirm) this.onConfirm(this.currentAction, this.payload);
            this.close();
        });
    }

    open(action, payload = {}) {
        this.currentAction = action;
        this.payload = payload;

        if (action === 'delete') {
            this.title.textContent = 'Excluir Link';
            this.body.textContent = 'Você tem certeza que deseja excluir este link?';
            this.confirmBtn.textContent = 'Excluir';
        } else if (action === 'clear') {
            this.title.textContent = 'Limpar Lista';
            this.body.textContent = 'Você tem certeza que deseja apagar TODOS os links? Esta ação é irreversível.';
            this.confirmBtn.textContent = 'Limpar Tudo';
        } else if (action === 'clearWatched') {
            this.title.textContent = 'Limpar Assistidos';
            this.body.textContent = 'Você tem certeza que deseja excluir todos os links marcados como assistidos?';
            this.confirmBtn.textContent = 'Limpar';
        }

        this.overlay.classList.add('active');
    }

    close() {
        this.overlay.classList.remove('active');
        this.currentAction = null;
        this.payload = null;
    }

    setOnConfirm(callback) {
        this.onConfirm = callback;
    }
}