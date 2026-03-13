import { Utils } from './utils.js';
import { API } from './api.js';

export class UIManager {
    constructor(modalManager) {
        this.modal = modalManager;
        this.container = document.getElementById('resultsContainer');
        this.input = document.getElementById('urlInput');
        this.addBtn = document.getElementById('addBtn');
        this.tooltipEl = this.createTooltipElement();
    }

    createTooltipElement() {
        const el = document.createElement('div');
        el.className = 'js-tooltip';
        document.body.appendChild(el);
        return el;
    }

    showTooltip(target, text) {
        this.tooltipEl.textContent = text;
        this.tooltipEl.classList.add('visible');

        const rect = target.getBoundingClientRect();
        const tooltipRect = this.tooltipEl.getBoundingClientRect();

        let top = rect.top - tooltipRect.height - 8;
        let left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);

        if (top < 0) {
            top = rect.bottom + 8;
        }

        this.tooltipEl.style.top = `${top}px`;
        this.tooltipEl.style.left = `${left}px`;
    }

    hideTooltip() {
        this.tooltipEl.classList.remove('visible');
    }

    renderList(links) {
        this.container.innerHTML = '';

        if (!links || links.length === 0) {
            this.container.innerHTML = `
                <div class="empty-state">
                    <span class="material-symbols-outlined">inbox</span>
                    <p>Nenhum link cadastrado.</p>
                    <small>Adicione URLs no campo ao lado.</small>
                </div>
            `;
            return;
        }

        links.forEach(link => this.container.appendChild(this.createCard(link)));
    }

    createCard(linkObj) {
        const displayTitle = Utils.getDisplayTitle(linkObj);
        const card = document.createElement('div');
        card.className = 'card';
        if (linkObj.is_opened) card.classList.add('opened');

        const contentEl = document.createElement('div');
        contentEl.className = 'card-content';

        const titleEl = document.createElement('div');
        titleEl.className = 'card-title';
        titleEl.textContent = displayTitle;

        const urlEl = document.createElement('div');
        urlEl.className = 'card-url';
        urlEl.textContent = linkObj.url;

        contentEl.appendChild(titleEl);
        contentEl.appendChild(urlEl);

        const actionsGroup = document.createElement('div');
        actionsGroup.className = 'actions-group';

        const copyBtn = document.createElement('button');
        copyBtn.className = 'btn-icon';
        copyBtn.innerHTML = '<span class="material-symbols-outlined">content_copy</span>';

        copyBtn.onmouseenter = () => this.showTooltip(copyBtn, 'Copiar URL');
        copyBtn.onmouseleave = () => this.hideTooltip();

        copyBtn.onclick = async () => {
            await navigator.clipboard.writeText(linkObj.url);
            copyBtn.innerHTML = '<span class="material-symbols-outlined">check_small</span>';
            this.showTooltip(copyBtn, 'Copiado!');
            setTimeout(() => {
                copyBtn.innerHTML = '<span class="material-symbols-outlined">content_copy</span>';
                if(copyBtn.matches(':hover')) this.showTooltip(copyBtn, 'Copiar URL');
            }, 2000);
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-icon delete-action';
        deleteBtn.innerHTML = '<span class="material-symbols-outlined">delete</span>';

        deleteBtn.onmouseenter = () => this.showTooltip(deleteBtn, 'Excluir');
        deleteBtn.onmouseleave = () => this.hideTooltip();

        deleteBtn.onclick = () => this.modal.open('delete', { id: linkObj.id, element: card });

        const openBtn = document.createElement('button');
        openBtn.className = 'btn-icon';
        openBtn.style.width = 'auto';
        openBtn.style.padding = '0 12px';

        const updateOpenBtnState = (isOpened) => {
            if (isOpened) {
                openBtn.innerHTML = '<span class="material-symbols-outlined">check</span>';
                card.classList.add('opened');
            } else {
                openBtn.innerHTML = '<span class="material-symbols-outlined">open_in_new</span>';
                card.classList.remove('opened');
            }
        };

        updateOpenBtnState(linkObj.is_opened);

        openBtn.onmouseenter = () => {
            const text = linkObj.is_opened ? 'Marcar como não lido' : 'Abrir link';
            this.showTooltip(openBtn, text);
        };
        openBtn.onmouseleave = () => this.hideTooltip();

        openBtn.onclick = async () => {
            if (!linkObj.is_opened) {
                window.open(linkObj.url, '_blank');
            }
            linkObj.is_opened = !linkObj.is_opened;
            updateOpenBtnState(linkObj.is_opened);
            const text = linkObj.is_opened ? 'Marcar como não lido' : 'Abrir link';
            this.showTooltip(openBtn, text);
            await API.updateStatus(linkObj.id, linkObj.is_opened ? 1 : 0);
        };

        actionsGroup.appendChild(copyBtn);
        actionsGroup.appendChild(deleteBtn);
        actionsGroup.appendChild(openBtn);
        card.appendChild(contentEl);
        card.appendChild(actionsGroup);

        return card;
    }

    toggleLoading(isLoading) {
        this.addBtn.disabled = isLoading;
        if (isLoading) {
            this.addBtn.innerHTML = '<div class="spinner"></div>';
        } else {
            this.addBtn.innerHTML = '<span class="material-symbols-outlined">add</span> Adicionar';
        }
    }

    clearInput() {
        this.input.value = '';
    }

    getInputUrls() {
        const text = this.input.value;
        if (!text.trim()) return [];
        return text.split(/\n+/).map(u => u.trim()).filter(u => u.length > 0).map(u => Utils.formatUrl(u));
    }
}