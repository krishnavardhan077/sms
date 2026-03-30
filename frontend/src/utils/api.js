/**
 * Centralised API base URL — reads from VITE_API_URL in .env
 * Usage:  import { API } from '../utils/api'
 */
export const API = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api';
