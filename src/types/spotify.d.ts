interface Window {
  Spotify: {
    Player: new (options: {
      name: string;
      getOAuthToken: (cb: (token: string) => void) => void;
    }) => Spotify.Player;
  };
  onSpotifyWebPlaybackSDKReady: () => void;
}

declare namespace Spotify {
  interface Player {
    addListener(event: string, callback: (data: any) => void): boolean;
    removeListener(event: string, callback?: (data: any) => void): boolean;
    connect(): Promise<boolean>;
    disconnect(): void;
    getCurrentState(): Promise<null | {
      paused: boolean;
      position: number;
      duration: number;
      track_window: {
        current_track: {
          name: string;
          artists: { name: string }[];
          album: { name: string; images: { url: string }[] };
          uri: string;
        };
      };
    }>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    setName(name: string): Promise<void>;
    setVolume(volume: number): Promise<void>;
    loadAndPlayTrack(uri: string): Promise<void>;
  }
}
