export const API_BASE_URL = "http://localhost:8000";

export const api = {
  health: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.json();
    } catch (error) {
      console.error("Health Check Failed:", error);
      return { status: "offline" };
    }
  },

  search: async (sourceId: string, bbox: number[], startDate: string, endDate: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source_id: sourceId,
          bbox,
          start_date: startDate,
          end_date: endDate,
        }),
      });
      return response.json();
    } catch (error) {
      console.error("Search Failed:", error);
      return { results: [] };
    }
  },

  analyzeSpectral: async (lat: number, lon: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/spectral/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat, lon }),
      });
      return response.json();
    } catch (error) {
      console.error("Spectral Analysis Failed:", error);
      return { bands: [] }; // Fallback
    }
  },

  processFusion: async (action: string, params: any = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/fusion/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, params }),
      });
      return response.json();
    } catch (error) {
      console.error("Fusion Process Failed:", error);
      return { status: "error", message: "Failed to process fusion action." };
    }
  },

  fuse: async (method: string, opticalSourceId: string, secondarySourceId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/fuse`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method,
          optical_source_id: opticalSourceId,
          secondary_source_id: secondarySourceId,
        }),
      });
      return response.json();
    } catch (error) {
      console.error("Fusion Failed:", error);
      return { status: "error", message: "Failed to trigger fusion." };
    }
  },

  agentReason: async (query: string, context: any = null) => {
    try {
      const response = await fetch(`${API_BASE_URL}/agent/reason`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, context }),
      });
      return response.json();
    } catch (error) {
      console.error("Agent Reason Failed:", error);
      return {
        answer: "I'm having trouble connecting to my reasoning engine (Backend Offline).",
        thoughts: [],
        actions: []
      };
    }
  },

  exportMap: async (imageBase64: string, center: { lat: number, lon: number }, zoom: number, activeLayers: string[], userId?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/export`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_base64: imageBase64,
          center,
          zoom,
          active_layers: activeLayers,
          user_id: userId
        }),
      });
      return response.json();
    } catch (error) {
      console.error("Export Failed:", error);
      throw error;
    }
  }
};
