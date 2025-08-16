import { Trader } from "@/types/api";

// Use Next.js API routes as proxy to avoid CORS issues
const API_BASE_URL = "";

export const api = {
  async getLeaderboard(
    sortBy: string = "win_rate",
    order: string = "desc"
  ): Promise<Trader[]> {
    const response = await fetch(
      `${API_BASE_URL}/api/leaderboard?sort_by=${sortBy}&order=${order}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch leaderboard: ${response.statusText}`);
    }

    return response.json();
  },

  async getTrader(traderId: number): Promise<Trader> {
    const response = await fetch(`${API_BASE_URL}/api/traders/${traderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch trader: ${response.statusText}`);
    }

    return response.json();
  },
};
