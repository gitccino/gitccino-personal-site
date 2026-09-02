// Direct origin instead of Vite dev proxy

const raw = import.meta.env.VITE_API_URL?.trim();

if (!raw) {
  throw new Error("VITE_API_URL is required");
}

export const API_URL = raw.replace(/\/+$/, ""); // no trailing slash
