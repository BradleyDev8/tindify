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
  type PlayerEvent =
    | "ready"
    | "not_ready"
    | "player_state_changed"
    | "initialization_error"
    | "authentication_error"
    | "account_error"
    | "playback_error";

  type PlayerEventCallback =
    | ((state: { device_id: string }) => void) // for 'ready' and 'not_ready'
    | ((state: PlaybackState | null) => void) // for 'player_state_changed'
    | ((error: Error) => void); // for error events

  interface PlaybackState {
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
  }

  interface Player {
    addListener(event: PlayerEvent, callback: PlayerEventCallback): boolean;
    removeListener(event: PlayerEvent, callback?: PlayerEventCallback): boolean;
    connect(): Promise<boolean>;
    disconnect(): void;
    getCurrentState(): Promise<PlaybackState | null>;
    pause(): Promise<void>;
    resume(): Promise<void>;
    togglePlay(): Promise<void>;
    seek(positionMs: number): Promise<void>;
    setName(name: string): Promise<void>;
    setVolume(volume: number): Promise<void>;
    loadAndPlayTrack(uri: string): Promise<void>;
  }
}
