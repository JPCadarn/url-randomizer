import { API } from './api.js';
import { Utils } from './utils.js';
import { ModalManager } from './modal.js';
import { UIManager } from './ui.js';

const modal = new ModalManager();
const ui = new UIManager(modal);

const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const clearWatchedBtn = document.getElementById('clearWatchedBtn');
const randomizeBtn = document.getElementById('randomizeBtn');
const openAllBtn = document.getElementById('openAllBtn');
const searchInput = document.getElementById('searchInput');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const tabBtns = document.querySelectorAll('.tab-btn');

let currentLinks = [];
let filteredLinks = [];
let activeTab = 'video';

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeTab = btn.dataset.type;
        applyFilterAndRender();
    });
});

async function refreshList(shuffle = false) {
    try {
        let links = await API.getLinks();
        if (shuffle) links = Utils.shuffleArray(links);
        currentLinks = links;
        applyFilterAndRender();
    } catch (error) {
        console.error(error);
        ui.renderList([]);
    }
}

function applyFilterAndRender() {
    const term = searchInput.value.toLowerCase();

    if (term.length > 0) {
        clearSearchBtn.classList.add('visible');
    } else {
        clearSearchBtn.classList.remove('visible');
    }

    filteredLinks = currentLinks.filter(link => {
        const matchesTab = link.type === activeTab;
        const matchesSearch = link.url.toLowerCase().includes(term) || (link.title && link.title.toLowerCase().includes(term));
        return matchesTab && matchesSearch;
    });

    ui.renderList(filteredLinks);
}

searchInput.addEventListener('input', () => {
    applyFilterAndRender();
});

clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    applyFilterAndRender();
    searchInput.focus();
});

addBtn.addEventListener('click', async () => {
    const urls = ui.getInputUrls();
    if (urls.length === 0) return;

    ui.toggleLoading(true);
    try {
        await API.addLinks(urls, activeTab);
        ui.clearInput();
        await refreshList();
    } catch (error) {
        console.error(error);
    } finally {
        ui.toggleLoading(false);
    }
});

clearBtn.addEventListener('click', () => modal.open('clear', { type: activeTab }));
clearWatchedBtn.addEventListener('click', () => modal.open('clearWatched', { type: activeTab }));
randomizeBtn.addEventListener('click', () => refreshList(true));

openAllBtn.addEventListener('click', () => {
    console.log('aisudhfiuasdhfisuahf')
    if (filteredLinks.length === 0) return;

    let popupBlocked = false;

    filteredLinks.forEach(link => {
        const openedWindow = window.open(link.url, '_blank');

        if (!openedWindow) {
            popupBlocked = true;
        }

        if (link.type !== 'permanent' && !link.is_opened) {
            link.is_opened = true;
            API.updateStatus(link.id, 1).catch(err => console.error(err));
        }
    });

    ui.renderList(filteredLinks);

    if (popupBlocked) {
        alert("O seu navegador bloqueou a abertura de múltiplas abas. Permita os pop-ups para este site e tente novamente.");
    }
});

modal.setOnConfirm(async (action, payload) => {
    if (action === 'delete') {
        try {
            await API.deleteLink(payload.id);
            if (payload.element) payload.element.remove();

            currentLinks = currentLinks.filter(l => l.id !== payload.id);
            applyFilterAndRender();
        } catch (error) {
            console.error(error);
            refreshList();
        }
    } else if (action === 'clear') {
        try {
            await API.clearLinks(payload.type);
            await refreshList();
        } catch (error) {
            console.error(error);
        }
    } else if (action === 'clearWatched') {
        try {
            await API.clearWatched(payload.type);
            await refreshList();
        } catch (error) {
            console.error(error);
        }
    }
});

document.addEventListener('DOMContentLoaded', () => refreshList());