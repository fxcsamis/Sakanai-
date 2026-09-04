// Copyright (c) 2026 Raj
// See LICENSE for details.

import * as MediaLibrary from 'expo-media-library';

export interface AudioMetadata {
    album: string;
    albumArtist: string;
    artist: string;
    year: number;
};

export interface Audio extends AudioMetadata {
    id: string;
    filename: string;
    uri: string;
    mediaType: MediaLibrary.MediaTypeValue;
    mediaSubtypes?: MediaLibrary.MediaSubtype[];
    width: number;
    height: number;
    creationTime: number;
    modificationTime: number;
    duration: number;
    albumId?: string;
}