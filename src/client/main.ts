declare global {
  interface Window {
    DND_PUBLIC_CONFIG?: {
      API_BASE_URL?: string;
    };
  }
}

const app = document.getElementById('app');

if (app) {
  app.dataset.clientEntry = 'vite';
}

window.dispatchEvent(
  new CustomEvent('dnd-client-ready', {
    detail: {
      apiBaseUrl: window.DND_PUBLIC_CONFIG?.API_BASE_URL ?? null,
    },
  }),
);

export {};
