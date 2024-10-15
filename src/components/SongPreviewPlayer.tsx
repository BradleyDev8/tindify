"use client";

import { useState, useEffect, useCallback } from "react";
import { SpotifyTrack } from "@/types/types";

interface SongPlayerProps {
  track: SpotifyTrack;
  accessToken: string;
}

export function SongPlayer({ track, accessToken }: SongPlayerProps) {
  const [player, setPlayer] = useState<Spotify.Player | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  const initializePlayer = useCallback(() => {
    if (!window.Spotify) {
      console.error("Spotify SDK not available");
      return;
    }

    const newPlayer = new window.Spotify.Player({
      name: "Spotify Tinder Player",
      getOAuthToken: (cb) => {
        console.log("Getting OAuth token");
        cb(accessToken);
      },
    });

    newPlayer.addListener("ready", ({ device_id }) => {
      console.log("Player ready with Device ID", device_id);
      setDeviceId(device_id);
      setIsReady(true);
      setLoading(false);
      setIsPlayerReady(true);
    });

    newPlayer.addListener("not_ready", ({ device_id }) => {
      console.log("Device ID has gone offline", device_id);
      setIsReady(false);
      setLoading(false);
    });

    newPlayer.addListener("player_state_changed", (state) => {
      console.log("Player state changed", state);
      if (state) {
        setIsPlaying(!state.paused);
      }
    });

    newPlayer.connect().then((success) => {
      if (success) {
        console.log("Player connected successfully");
        setPlayer(newPlayer);
      } else {
        console.error("Player failed to connect");
        setLoading(false);
      }
    });
  }, [accessToken]);

  useEffect(() => {
    initializePlayer();

    return () => {
      if (player) {
        player.disconnect();
      }
    };
  }, [initializePlayer]);

  useEffect(() => {
    if (isReady && deviceId) {
      playTrack();
    }
  }, [track, isReady, deviceId]);

  const playTrack = async () => {
    if (!isReady || !deviceId || !isPlayerReady) {
      console.log(
        "Player is not ready, device ID is not available, or player is not fully initialized"
      );
      return;
    }

    console.log("Attempting to play track", track.uri);
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ uris: [track.uri] }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error playing track:", errorData);
      } else {
        console.log("Track play request successful");
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Error playing track:", error);
    }
  };

  const togglePlay = async () => {
    if (!player) {
      console.error("Player is not initialized");
      return;
    }

    try {
      await player.togglePlay();
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error("Error toggling play state:", error);
    }
  };

  return (
    <div>
      <button
        onClick={togglePlay}
        className="border-green-400 border-[2px] text-white font-bold p-2 rounded-full mr-2 w-12 h-12 flex items-center justify-center"
        disabled={!isReady}
      >
        {isPlaying ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M6.75 5.25a.75.75 0 01.75-.75H9a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H7.5a.75.75 0 01-.75-.75V5.25zm7.5 0A.75.75 0 0115 4.5h1.5a.75.75 0 01.75.75v13.5a.75.75 0 01-.75.75H15a.75.75 0 01-.75-.75V5.25z"
              clipRule="evenodd"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path
              fillRule="evenodd"
              d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </button>
    </div>
  );
}
