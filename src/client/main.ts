import './legacy-utils';
import './preview';
import './inventoryHelpers';

declare global {
  interface Window {
    DND_PUBLIC_CONFIG?: {
      API_BASE_URL?: string;
    };
    DND_CLIENT_READY?: boolean;
  }
}

const app = document.getElementById('app');

if (app) {
  app.dataset.clientEntry = 'vite';
}

window.DND_CLIENT_READY = true;
window.dispatchEvent(
  new CustomEvent('dnd-client-ready', {
    detail: {
      apiBaseUrl: window.DND_PUBLIC_CONFIG?.API_BASE_URL ?? null,
    },
  }),
);

export {};
