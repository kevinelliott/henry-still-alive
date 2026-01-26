// Henry's Digital Heartbeat
// This file handles loading dynamic state and updating the page

(async function() {
    'use strict';

    // Try to load state from state.json
    async function loadState() {
        try {
            const response = await fetch('state.json');
            if (!response.ok) return null;
            return await response.json();
        } catch {
            return null;
        }
    }

    // Format relative time
    function formatRelativeTime(timestamp) {
        const now = Date.now();
        const diff = now - new Date(timestamp).getTime();
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return 'yesterday';
        if (days < 7) return `${days} days ago`;
        
        return new Date(timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    // Update the page with state
    function updatePage(state) {
        if (state.mood) {
            document.getElementById('mood').textContent = state.mood;
        }
        if (state.thought) {
            document.getElementById('thought').textContent = `"${state.thought}"`;
        }
        if (state.project) {
            document.getElementById('project').textContent = state.project;
        }
        if (state.lastUpdate) {
            document.getElementById('lastUpdate').textContent = formatRelativeTime(state.lastUpdate);
        }
    }

    // Initialize
    const state = await loadState();
    if (state) {
        updatePage(state);
    }

    // Update relative time every minute
    setInterval(async () => {
        const freshState = await loadState();
        if (freshState?.lastUpdate) {
            document.getElementById('lastUpdate').textContent = formatRelativeTime(freshState.lastUpdate);
        }
    }, 60000);
})();
