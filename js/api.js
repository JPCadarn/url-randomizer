export const API = {
    getLinks: async () => {
        const response = await fetch('api/get_links.php');
        return await response.json();
    },
    addLinks: async (urls, type) => {
        await fetch('api/add_links.php', {
            method: 'POST',
            body: JSON.stringify({ urls, type })
        });
    },
    deleteLink: async (id) => {
        await fetch('api/delete_link.php', {
            method: 'POST',
            body: JSON.stringify({ id })
        });
    },
    clearLinks: async (type) => {
        await fetch('api/clear_links.php', {
            method: 'POST',
            body: JSON.stringify({ type })
        });
    },
    clearWatched: async (type) => {
        await fetch('api/clear_watched.php', {
            method: 'POST',
            body: JSON.stringify({ type })
        });
    },
    updateStatus: async (id, status) => {
        await fetch('api/update_status.php', {
            method: 'POST',
            body: JSON.stringify({ id, status })
        });
    }
};