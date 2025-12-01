export const Utils = {
	shuffleArray: (array) => {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	},

	formatUrl: (url) => {
		return !url.startsWith('http') ? 'https://' + url : url;
	},

	getDisplayTitle: (linkObj) => {
		if (linkObj.title && linkObj.title.trim() !== "") {
			return linkObj.title;
		}

		let displayTitle = "";
		try {
			const urlObj = new URL(linkObj.url);
			displayTitle = urlObj.pathname.replaceAll('/', '').replaceAll('-', ' ');
			if (!displayTitle.trim()) {
				displayTitle = urlObj.hostname;
			}
		} catch (e) {
			displayTitle = linkObj.url;
		}
		return displayTitle;
	}
};