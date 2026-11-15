import type { RequestHandler } from 'msw';

export const API_URL = import.meta.env.VITE_API_URL;

export const handlers: RequestHandler[] = [];
