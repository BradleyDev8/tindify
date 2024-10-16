"use server";

import { cookies } from "next/headers";
import { SpotifyTrack } from "@/types/types";

/**
 * Fetches data from the Spotify API.
 * @param {string} endpoint - The specific API endpoint to fetch data from.
 * @param {string} accessToken - The access token for authorization.
 * @returns {Promise<any>} The JSON response from the API.
 */
async function fetchFromSpotify(endpoint: string, accessToken: string, options: RequestInit = {}) {
  const url = `https://api.spotify.com/v1${endpoint}`;
  console.log(`Fetching from Spotify: ${url}`);

  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 1000 * 2 ** retries;
      console.log(`Rate limited. Retrying after ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      retries++;
    } else if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Spotify API error: ${response.status} ${response.statusText}`);
      console.error(`Error body: ${errorBody}`);
      console.error(`Request URL: ${url}`);
      throw new Error(`Spotify API error: ${response.status} ${response.statusText}. ${errorBody}`);
    } else {
      return response.json();
    }
  }

  throw new Error("Max retries reached. Unable to complete the request.");
}

/**
 * Searches for tracks on Spotify based on a query.
 * @param {string} query - The search query for tracks.
 * @returns {Promise<SpotifyTrack[]>} An array of SpotifyTrack objects.
 */
export async function searchTracks(query: string): Promise<SpotifyTrack[]> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    throw new Error("No access token found");
  }

  const data = await fetchFromSpotify(
    `/search?type=track&q=${encodeURIComponent(query)}`,
    accessToken
  );
  return data.tracks.items;
}

export async function getTopTracks(): Promise<SpotifyTrack[]> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    throw new Error("No access token found");
  }

  try {
    const data = await fetchFromSpotify("/me/top/tracks", accessToken);
    return data.items;
  } catch (error) {
    console.error("Error fetching top tracks:", error);
    throw error;
  }
}

export async function getRecommendation(
  seedTrackId?: string,
  seedGenres?: string[]
): Promise<SpotifyTrack> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    throw new Error("No access token found");
  }

  try {
    let endpoint = "/recommendations?limit=1";

    if (seedTrackId) {
      endpoint += `&seed_tracks=${seedTrackId}`;
    } else if (seedGenres && seedGenres.length > 0) {
      endpoint += `&seed_genres=${seedGenres.join(",")}`;
    } else {
      endpoint += "&seed_genres=pop,rock,hip-hop,electronic";
    }

    const data = await fetchFromSpotify(endpoint, accessToken);
    if (!data.tracks || data.tracks.length === 0) {
      throw new Error("No tracks returned from recommendation");
    }
    return data.tracks[0];
  } catch (error) {
    console.error("Error getting recommendation:", error);
    if (error instanceof Error && error.message.includes("Max retries reached")) {
      throw new Error(
        "Unable to get track recommendation due to rate limiting. Please try again later."
      );
    }
    throw new Error("Failed to get track recommendation");
  }
}

export async function saveTrack(trackId: string, playlistId: string): Promise<void> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    throw new Error("No access token found");
  }

  await fetchFromSpotify(`/playlists/${playlistId}/tracks`, accessToken, {
    method: "POST",
    body: JSON.stringify({ uris: [`spotify:track:${trackId}`] }),
  });
}

export async function createPlaylist(name: string): Promise<string> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    throw new Error("No access token found");
  }

  const userData = await fetchFromSpotify("/me", accessToken);
  const playlist = await fetchFromSpotify(`/users/${userData.id}/playlists`, accessToken, {
    method: "POST",
    body: JSON.stringify({ name, public: false }),
  });

  return playlist.id;
}

export async function stopPlayback(accessToken: string): Promise<void> {
  try {
    await fetchFromSpotify("/me/player/pause", accessToken, {
      method: "PUT",
    });
  } catch (error) {
    console.error("Error stopping playback:", error);
  }
}

export async function getAvailableGenres(): Promise<string[]> {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    throw new Error("No access token found");
  }

  try {
    const data = await fetchFromSpotify("/recommendations/available-genre-seeds", accessToken);
    return data.genres;
  } catch (error) {
    console.error("Error fetching available genres:", error);
    throw error;
  }
}
