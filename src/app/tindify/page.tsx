import { cookies } from "next/headers";
import { getRecommendation } from "@/app/actions";
import { TindifyComponent } from "@/components/TindifyComponent";
import { Suspense } from "react";

function LoadingFallback() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      <p className="mt-4 text-lg font-semibold">Loading initial track...</p>
    </div>
  );
}

export default async function SpotifyTinderPage() {
  const cookieStore = cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    return <div>Error: No access token found. Please log in again.</div>;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <TindifyContent accessToken={accessToken} />
    </Suspense>
  );
}

async function TindifyContent({ accessToken }: { accessToken: string }) {
  try {
    const initialTrack = await getRecommendation();
    return <TindifyComponent initialTrack={initialTrack} accessToken={accessToken} />;
  } catch (error) {
    console.error("Error fetching initial track:", error);
    return <div>Error: Failed to load initial track. Please try again later.</div>;
  }
}
