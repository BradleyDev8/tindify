"use client";
import Link from "next/link";

import { useState, useEffect } from "react";
import { SpotifyTrack } from "@/types/types";
import {
  saveTrack,
  createPlaylist,
  getRecommendation,
  stopPlayback,
} from "@/app/actions";
import { SongPlayer } from "@/components/SongPreviewPlayer";

interface TindifyComponentProps {
  initialTrack: SpotifyTrack;
  accessToken: string;
}

export function TindifyComponent({
  initialTrack,
  accessToken,
}: TindifyComponentProps) {
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack>(initialTrack);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        await createNewPlaylist();
        setIsPlayerReady(true);
      } catch (err) {
        setError("Failed to initialize. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    initializeComponent();

    return () => {
      stopPlayback(accessToken);
    };
  }, [accessToken]);

  const createNewPlaylist = async () => {
    try {
      const newPlaylistId = await createPlaylist("My Spotify Tinder Playlist");
      setPlaylistId(newPlaylistId);
    } catch (error) {
      console.error("Error creating playlist:", error);
      throw new Error("Failed to create playlist");
    }
  };

  const fetchNextTrack = async () => {
    setIsLoading(true);
    try {
      const track = await getRecommendation();
      setCurrentTrack(track);
    } catch (error) {
      console.error("Error fetching next track:", error);
      setError("Failed to fetch next track. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (currentTrack && playlistId && isPlayerReady) {
      setIsLoading(true);
      try {
        await saveTrack(currentTrack.id, playlistId);
        await fetchNextTrack();
      } catch (error) {
        console.error("Error saving track:", error);
        setError("Failed to save track. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handlePass = () => {
    fetchNextTrack();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        <p className="mt-4 text-lg font-semibold text-center">
          Initializing Tindify...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <p className="text-red-500 text-lg text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <Link
        href="/dashboard"
        className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded inline-block mb-4"
      >
        Go back
      </Link>
      <h1 className="text-2xl font-bold mb-4 text-green-400">Tindify</h1>
      <div className="bg-black border border-green-400 p-4 sm:p-6 rounded-lg shadow-sm shadow-green-400 w-full max-w-md flex flex-col justify-center items-center">
        <h2 className="text-xl font-semibold text-center text-green-400">
          {currentTrack.name}
        </h2>
        <p className="text-gray-300 text-center">
          {currentTrack.artists.map((artist) => artist.name).join(", ")}
        </p>
        {currentTrack.album.images[0] && (
          <img
            src={currentTrack.album.images[0].url}
            alt={`${currentTrack.name} album cover`}
            className="w-48 h-48 sm:w-64 sm:h-64 object-cover mt-4 shadow-sm rounded-lg shadow-green-400"
          />
        )}
        <div className="flex flex-col items-center mt-4 w-full max-w-xs">
          <button
            onClick={handlePass}
            className="animate-bg-shine bg-[linear-gradient(110deg,#000,45%,#E4E4E7,55%,#000)] bg-[length:200%_100%] text-white border-red-500 border-[1px] rounded-lg shadow tracking-wide font-bold py-2 px-4 w-full mb-4"
            disabled={isLoading}
          >
            Pass
          </button>
          <SongPlayer track={currentTrack} accessToken={accessToken} />
          <button
            onClick={handleSave}
            className="animate-bg-shine bg-[linear-gradient(110deg,#000,45%,#E4E4E7,55%,#000)] bg-[length:200%_100%] text-white border-green-400 border-[1px] rounded-lg shadow tracking-wide font-bold py-2 px-4 w-full mt-4"
            disabled={isLoading}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
