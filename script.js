const urlInput = document.getElementById('urlInput');
const randomizeBtn = document.getElementById('randomizeBtn');
const resultsContainer = document.getElementById('resultsContainer');

let linksState = [];

function loadFromStorage() {
	const stored = localStorage.getItem('randomizer_links');
	if (stored) {
		linksState = JSON.parse(stored);
		renderList();
	}
}

function saveToStorage() {
	localStorage.setItem('randomizer_links', JSON.stringify(linksState));
}

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

function createCard(linkObj, index) {
	let displayTitle;
	try {
		const urlObj = new URL(linkObj.url);
		displayTitle = urlObj.pathname.replaceAll('/', '').replaceAll('-', ' ')
	} catch (e) {
		displayTitle = linkObj.url;
	}

	const card = document.createElement('div');
	card.className = 'card';

	if (linkObj.opened) {
		card.classList.add('opened');
	}

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

	const btn = document.createElement('button');
	btn.className = 'btn btn-icon';

	btn.innerHTML = linkObj.opened
		? '<span class="material-symbols-outlined">check</span> Aberto'
		: '<span class="material-symbols-outlined">open_in_new</span> Abrir';

	btn.onclick = () => {
		window.open(linkObj.url, '_blank');

		linksState[index].opened = true;
		saveToStorage();

		card.classList.add('opened');
		btn.innerHTML = '<span class="material-symbols-outlined">check</span> Aberto';
	};

	card.appendChild(contentEl);
	card.appendChild(btn);

	return card;
}

function renderList() {
	resultsContainer.innerHTML = '';
	linksState.forEach((linkObj, index) => {
		resultsContainer.appendChild(createCard(linkObj, index));
	});
}

randomizeBtn.addEventListener('click', () => {
	const text = urlInput.value;
	if (!text.trim()) return;

	const urls = text.split(/\n+/).map(u => u.trim()).filter(u => u.length > 0);
	const shuffledUrls = shuffleArray(urls);

	linksState = shuffledUrls.map(url => {
		let validUrl = url;
		if (!validUrl.startsWith('http')) {
			validUrl = 'https://' + validUrl;
		}
		return { url: validUrl, opened: false };
	});

	saveToStorage();
	renderList();
});

document.addEventListener('DOMContentLoaded', loadFromStorage);
document.getElementById('randomizeBtn').classList.add('btn-primary');