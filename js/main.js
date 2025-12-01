import {API} from './api.js';
import {Utils} from './utils.js';
import {ModalManager} from './modal.js';
import {UIManager} from './ui.js';

const modal = new ModalManager();
const ui = new UIManager(modal);

const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const randomizeBtn = document.getElementById('randomizeBtn');
const searchInput = document.getElementById('searchInput');

let currentLinks = [];

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
	const filtered = currentLinks.filter(link => link.url.toLowerCase().includes(term));
	ui.renderList(filtered);
}

searchInput.addEventListener('input', () => {
	applyFilterAndRender();
});

addBtn.addEventListener('click', async () => {
	const urls = ui.getInputUrls();
	if (urls.length === 0) return;

	ui.toggleLoading(true);
	try {
		await API.addLinks(urls);
		ui.clearInput();
		await refreshList(true);
	} catch (error) {
		console.error(error);
	} finally {
		ui.toggleLoading(false);
	}
});

clearBtn.addEventListener('click', () => modal.open('clear'));

randomizeBtn.addEventListener('click', () => refreshList(true));

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
			await API.clearLinks();
			currentLinks = [];
			ui.renderList([]);
		} catch (error) {
			console.error(error);
		}
	}
});

document.addEventListener('DOMContentLoaded', () => refreshList(true));