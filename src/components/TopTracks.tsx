import { getTopTracks } from "@/app/actions";
import { SpotifyTrack } from "@/types/types";
import Image from "next/image";

export async function TopTracks() {
  let topTracks: SpotifyTrack[] | null = null;
  let error: string | null = null;

  try {
    topTracks = await getTopTracks();
  } catch {
    error = "Failed to fetch top tracks. Please try again later.";
  }

  if (error) {
    return <p className="text-red-500">{error}</p>;
  }

  if (!topTracks || topTracks.length === 0) {
    return <p>No top tracks found.</p>;
  }

  return (
    <div className="mt-8 bg-black border border-green-400 rounded-lg p-6 shadow-md ">
      <h2 className="text-2xl font-bold mb-4 text-gray-200">Your Top Tracks</h2>
      <ul className="space-y-4">
        {topTracks.map((track) => (
          <li
            key={track.id}
            className="bg-black border border-green-400 rounded-md p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center">
              {track.album.images[0] && (
                <Image
                  src={track.album.images[0].url}
                  alt={`${track.name} album cover`}
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded-md mr-4"
                />
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-200">{track.name}</h3>
                <p className="text-sm text-gray-400">
                  {track.artists.map((artist) => artist.name).join(", ")}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
