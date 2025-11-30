const urlInput = document.getElementById('urlInput');
const randomizeBtn = document.getElementById('randomizeBtn');
const resultsContainer = document.getElementById('resultsContainer');

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
	return array;
}

function createCard(url) {
	let displayTitle = "Sem Título";
	try {
		const urlObj = new URL(url);
		displayTitle = urlObj.hostname.replace('www.', '');
	} catch (e) {
		displayTitle = url;
	}

	const card = document.createElement('div');
	card.className = 'card';

	// Criamos um contêiner para o texto
	const contentEl = document.createElement('div');
	contentEl.className = 'card-content';

	const titleEl = document.createElement('div');
	titleEl.className = 'card-title';
	titleEl.textContent = displayTitle;

	const urlEl = document.createElement('div');
	urlEl.className = 'card-url';
	urlEl.textContent = url;

	contentEl.appendChild(titleEl);
	contentEl.appendChild(urlEl);

	const btn = document.createElement('button');
	document.getElementById('randomizeBtn').classList.add('btn-primary');
	btn.className = 'btn btn-icon';
	btn.innerHTML = '<span class="material-symbols-outlined">open_in_new</span> Abrir';
	btn.onclick = () => window.open(url, '_blank');

	card.appendChild(contentEl);
	card.appendChild(btn);

	return card;
}

randomizeBtn.addEventListener('click', () => {
	const text = urlInput.value;
	if (!text.trim()) return;

	const urls = text.split(/\n+/).map(u => u.trim()).filter(u => u.length > 0);

	const shuffledUrls = shuffleArray(urls);

	resultsContainer.innerHTML = '';

	shuffledUrls.forEach(url => {
		let validUrl = url;
		if (!validUrl.startsWith('http')) {
			validUrl = 'https://' + validUrl;
		}
		resultsContainer.appendChild(createCard(validUrl));
	});
});