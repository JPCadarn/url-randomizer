export const API = {
    getLinks: async () => {
        const response = await fetch('api/get_links.php');
        return await response.json();
    },
    addLinks: async (urls) => {
        await fetch('api/add_links.php', {
            method: 'POST',
            body: JSON.stringify({ urls })
        });
    },
    deleteLink: async (id) => {
        await fetch('api/delete_link.php', {
            method: 'POST',
            body: JSON.stringify({ id })
        });
    },
    clearLinks: async () => {
        await fetch('api/clear_links.php');
    },
    clearWatched: async () => {
        await fetch('api/clear_watched.php');
    },
    updateStatus: async (id, status) => {
        await fetch('api/update_status.php', {
            method: 'POST',
            body: JSON.stringify({ id, status })
        });
    }
};