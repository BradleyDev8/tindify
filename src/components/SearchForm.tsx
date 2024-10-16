"use client";

import { useState } from "react";
import { searchTracks } from "@/app/actions";
import { SpotifyTrack } from "@/types/types";

export function SearchForm() {
  const [searchResults, setSearchResults] = useState<SpotifyTrack[] | null>(null);

  const handleSubmit = async (formData: FormData) => {
    const query = formData.get("query") as string;
    const results = await searchTracks(query);
    setSearchResults(results);
  };

  return (
    <div>
      <form action={handleSubmit}>
        <input
          type="text"
          name="query"
          placeholder="Search for tracks"
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Search
        </button>
      </form>
      {searchResults && <SearchResults tracks={searchResults} />}
    </div>
  );
}

function SearchResults({ tracks }: { tracks: SpotifyTrack[] }) {
  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-2">Search Results</h2>
      <TrackList tracks={tracks} />
    </div>
  );
}

function TrackList({ tracks }: { tracks: SpotifyTrack[] }) {
  return (
    <ul>
      {tracks.map((track) => (
        <li key={track.id} className="mb-2">
          {track.name} by {track.artists.map((artist) => artist.name).join(", ")}
        </li>
      ))}
    </ul>
  );
}
