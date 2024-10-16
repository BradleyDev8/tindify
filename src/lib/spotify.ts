const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI;

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize";

export function getAuthUrl() {
  // Create URLSearchParams object to hold query parameters
  const params = new URLSearchParams({
    client_id: CLIENT_ID as string,
    response_type: "code",
    redirect_uri: REDIRECT_URI as string,
    scope:
      "ugc-image-upload user-read-private user-read-email playlist-modify-private playlist-modify-public playlist-read-private playlist-read-collaborative user-follow-modify user-follow-read user-read-playback-position user-top-read user-read-recently-played user-library-modify user-library-read user-read-playback-state user-modify-playback-state user-read-currently-playing app-remote-control streaming",
  });
  // Return the complete authorization URL
  return `${AUTHORIZE_ENDPOINT}?${params.toString()}`;
}

export async function getAccessToken(code: string) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI as string,
    }),
  });

  return response.json();
}
