"use client";

import React, { useState } from "react";

interface GenreSelectorProps {
  availableGenres: string[];
  onGenresSelect: (genres: string[]) => void;
  selectedGenres: string[];
}

export function GenreSelector({
  availableGenres,
  onGenresSelect,
  selectedGenres,
}: GenreSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleChange = (genre: string) => {
    const updatedGenres = selectedGenres.includes(genre)
      ? selectedGenres.filter((g) => g !== genre)
      : [...selectedGenres, genre];
    onGenresSelect(updatedGenres);
  };

  const toggleDropdown = () => setIsOpen(!isOpen);

  return (
    <div className="relative mb-4 w-full max-w-md">
      <button
        onClick={toggleDropdown}
        className="w-full bg-black text-green-400 border border-green-400 rounded p-2 flex justify-between items-center"
      >
        <span>
          {selectedGenres.length > 0 ? `${selectedGenres.length} genres selected` : "Select Genres"}
        </span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-black border border-green-400 rounded max-h-60 overflow-y-auto">
          {availableGenres.map((genre) => (
            <label key={genre} className="flex items-center p-2 hover:bg-green-900 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedGenres.includes(genre)}
                onChange={() => handleChange(genre)}
                className="mr-2"
              />
              {genre}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
