"use client";

import { useState } from "react";
import { searchTracks } from "@/app/actions";
import { SpotifyTrack } from "@/types/types";

interface SongSelectorProps {
  onSongSelect: (track: SpotifyTrack | null) => void;
  selectedSong: SpotifyTrack | null;
}

export function SongSelector({ onSongSelect, selectedSong }: SongSelectorProps) {
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      const results = await searchTracks(searchQuery);
      setSearchResults(results);
    }
  };

  return (
    <div className="mb-4 w-full max-w-md">
      <h3 className="text-lg font-semibold mb-2 text-green-400">Select a Song:</h3>
      <div className="flex">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a song"
          className="flex-grow border border-green-400 bg-black text-white p-2 rounded-l-md"
        />
        <button onClick={handleSearch} className="bg-green-400 text-black p-2 rounded-r-md">
          Search
        </button>
      </div>
      {selectedSong && (
        <div className="mt-2 p-2 bg-green-900 rounded">
          <p className="text-white">
            Selected: {selectedSong.name} by{" "}
            {selectedSong.artists.map((artist) => artist.name).join(", ")}
          </p>
          <button onClick={() => onSongSelect(null)} className="mt-1 text-sm text-red-400">
            Clear
          </button>
        </div>
      )}
      <ul className="mt-2 max-h-40 overflow-y-auto">
        {searchResults.map((track) => (
          <li
            key={track.id}
            onClick={() => onSongSelect(track)}
            className="cursor-pointer hover:bg-green-900 p-2 rounded text-white"
          >
            {track.name} by {track.artists.map((artist) => artist.name).join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
