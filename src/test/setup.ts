import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll } from 'vitest';
import { server } from './msw/server';

// jsdom no implementa scrollTo (lo usa <ScrollRestoration /> de React Router) ni scrollIntoView
// (lo usa la paginación de posts).
window.scrollTo = () => undefined;
Element.prototype.scrollIntoView = () => undefined;

// jsdom no implementa showModal/close de <dialog> (lo usa Drawer). Stub mínimo: solo `open`.
if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
  Object.assign(HTMLDialogElement.prototype, {
    showModal(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    },
    close(this: HTMLDialogElement) {
      this.removeAttribute('open');
      this.dispatchEvent(new Event('close'));
    },
  });
}

// jsdom no implementa Pointer Capture (lo usa Sonner para el swipe de los toasts).
if (!('setPointerCapture' in Element.prototype)) {
  Object.assign(Element.prototype, {
    setPointerCapture: () => undefined,
    releasePointerCapture: () => undefined,
    hasPointerCapture: () => false,
  });
}

beforeAll(() => {
  // Cualquier petición sin handler hace fallar el test: nunca se toca la red real.
  server.listen({ onUnhandledFrame: 'error' });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});
