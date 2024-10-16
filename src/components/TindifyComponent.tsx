"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { SpotifyTrack } from "@/types/types";
import {
  saveTrack,
  createPlaylist,
  getRecommendation,
  stopPlayback,
  getAvailableGenres,
} from "@/app/actions";
import { SongPlayer } from "@/components/SongPreviewPlayer";
import { SongSelector } from "@/components/SongSelector";
import { GenreSelector } from "@/components/GenreSelector";
import { AlbumCoverSkeleton } from "@/components/AlbumSkeleton";
import { FaHeart, FaHeartBroken } from "react-icons/fa";

interface TindifyComponentProps {
  initialTrack: SpotifyTrack;
  accessToken: string;
}

export function TindifyComponent({ initialTrack, accessToken }: TindifyComponentProps) {
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack>(initialTrack);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlayerReady, setIsPlayerReady] = useState(false);
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedSong, setSelectedSong] = useState<SpotifyTrack | null>(null);

  useEffect(() => {
    const initializeComponent = async () => {
      try {
        await createNewPlaylist();
        const genres = await getAvailableGenres();
        setAvailableGenres(genres);
        setIsPlayerReady(true);
      } catch {
        setError("Failed to initialize. Please try again.");
      } finally {
        setIsInitializing(false);
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
      const track = await getRecommendation(selectedSong?.id, selectedGenres);
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

  const handleGenresSelect = (genres: string[]) => {
    setSelectedGenres(genres);
    fetchNextTrack();
  };

  const handleSongSelect = (track: SpotifyTrack | null) => {
    setSelectedSong(track);
    if (track) {
      fetchNextTrack();
    }
  };

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
        <p className="mt-4 text-lg font-semibold text-center">Initializing Tindify...</p>
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-4 text-green-400">Tindify</h1>
      <SongSelector onSongSelect={handleSongSelect} selectedSong={selectedSong} />
      <GenreSelector
        availableGenres={availableGenres}
        onGenresSelect={handleGenresSelect}
        selectedGenres={selectedGenres}
      />
      <div className="bg-black border border-green-400 p-4 sm:p-6 rounded-lg shadow-sm shadow-green-400 w-full max-w-md flex flex-col justify-center items-center">
        <h2 className="text-xl font-semibold text-center text-green-400">{currentTrack.name}</h2>
        <p className="text-gray-300 text-center">
          {currentTrack.artists.map((artist) => artist.name).join(", ")}
        </p>
        {isLoading ? (
          <AlbumCoverSkeleton />
        ) : (
          currentTrack.album.images[0] && (
            <img
              src={currentTrack.album.images[0].url}
              alt={`${currentTrack.name} album cover`}
              className="w-48 h-48 sm:w-64 sm:h-64 object-cover mt-4 shadow-sm rounded-lg shadow-green-400"
            />
          )
        )}
        <div className="flex items-center justify-between mt-4 w-1/2 max-w-xs">
          <button
            onClick={handlePass}
            className="text-red-500 hover:text-red-900 transition-colors duration-200"
            disabled={isLoading}
          >
            <FaHeartBroken className="w-8 h-8" />
          </button>
          <SongPlayer track={currentTrack} accessToken={accessToken} />
          <button
            onClick={handleSave}
            className="text-green-400 hover:text-green-900 transition-colors duration-200"
            disabled={isLoading}
          >
            <FaHeart className="w-8 h-8" />
          </button>
        </div>
      </div>
      <Link
        href="/dashboard"
        className="border border-green-400 text-white hover:bg-green-900 font-bold py-2 px-4 rounded inline-block mb-4 mt-4"
      >
        Go back
      </Link>
    </div>
  );
}
