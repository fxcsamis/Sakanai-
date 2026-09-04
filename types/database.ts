// Copyright (c) 2026 Raj
// See LICENSE for details.

import { Track } from "react-native-track-player";

export interface IMusicTrack {
  id: string;
  uri: string;
  filename: string;
  duration: number;
  creationTime: number;
  modificationTime: number;
  mediaType: "audio" | string;
  height: number;
  width: number;
  albumId: string | null;

  title: string | null;
  artist: string;
  album: string | null;
  albumArtist: string | null;
  trackNumber: number | null;
  year: number | null;

  isLiked?: 0 | 1;
  visible: 0 | 1;
  customCoverUri?: string | null;
  customVideoUri?: string | null;
  customVideoFileName?: string | null;

  lyricsId?: string | null;
  lyricsName?: string | null;
  lyricsUri?: string | null;
  youtube_uri?: string | null;
  [key: string]: any;
}

export interface HashedIMusicTrackList {
  queueHash: string | null;
  tracks: IMusicTrack[]
}

export interface AriseTrack extends Track {
  isLiked?: 0 | 1;
  visible: 0 | 1;
  musicId: string;

  customCoverUri?: string | null;
  customVideoUri?: string | null;
  customVideoFileName?: string | null;

  youtube_uri?: string | null;

  lyricsId?: string | null;
  lyricsName?: string | null;
  lyricsUri?: string | null;
}

/**
 * Interface for lyrics
 */

export interface ILyrics {
  id: string;
  mimeType: string;
  name: string;
  size: number;
  uri: string;
  musicId: string;
}

// playlist
export interface PlayList {
  id: string;
  title: string;
  description: string;
  cover: string;
  pined: 0 | 1;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlayListRecomendation extends PlayList {
  numberOfMusic: number;
  totalSeconds: number;
}

export interface PlayListMusic {
  id: string;
  musicId: string;
  playlistId: string;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlayListMusicTrack
  extends IMusicTrack, PlayListMusic { }


export interface MusicAnalytics {
  musicId: string,
  playCount: number,
  skipCount: number,
  completedCount: number,
  totalListeningSeconds: number,
  firstPlayedAt: number,
  lastPlayedAt: number,
  createdAt: number,
  updatedAt: number,
}