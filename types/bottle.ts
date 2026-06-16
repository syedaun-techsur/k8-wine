// types/bottle.ts

/** A single bottle record as returned by the API. */
export interface Bottle {
  id: number;
  name: string;
  vintage: number | null;
  varietal: string | null;
  quantity: number;
  location: string | null;
  created_at: string;       // ISO 8601 UTC string, e.g. "2026-06-13T10:00:00.000Z"
}

/** Body for POST /api/bottles */
export interface CreateBottleRequest {
  name: string;             // Required; non-empty after trim; max 255 chars
  vintage?: number | null;  // Optional; integer in [1800, currentYear+1]
  varietal?: string | null; // Optional; max 255 chars
  quantity?: number;        // Optional; integer >= 1; defaults to 1
  location?: string | null; // Optional; max 500 chars
}

/** Body for PUT /api/bottles/[id] */
export interface UpdateBottleRequest {
  name: string;             // Required; non-empty after trim; max 255 chars
  vintage?: number | null;  // Optional; integer in [1800, currentYear+1]
  varietal?: string | null; // Optional; max 255 chars
  quantity?: number;        // Optional; integer >= 0 (0 = finished bottle)
  location?: string | null; // Optional; max 500 chars
}

/** Standard error response shape for all API error codes */
export interface ApiError {
  error: string;
}

/** GET /api/health response */
export interface HealthResponse {
  status: 'ok';
}
