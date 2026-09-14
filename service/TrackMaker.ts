// Copyright (c) 2026 Raj
// See LICENSE for details.

import { AriseTrack, IMusicTrack } from "@/types/database";
import { defaultMusicArtWork } from "@/utils/constants";

export function getTrackFromMusic(musics: IMusicTrack[]): AriseTrack[] {
    return musics?.map((music: IMusicTrack, _) => ({
        id: music.id.toString(),
        musicId: music.musicId,
        url: music.uri,
        title: music.filename,
        artist: music.artist,
        artwork: music.customCoverUri || defaultMusicArtWork,
        duration: music.duration || 0,
        mediaId: music.musicId,

        youtube_uri: music.youtube_uri,

        isLiked: music.isLiked,
        visible: music.visible,

        customCoverUri: music.customCoverUri,
        customVideoUri: music.customVideoUri,
        customVideoFileName: music.customVideoFileName,

        lyricsId: music.lyricsId,
        lyricsName: music.lyricsName,
        lyricsUri: music.lyricsUri
    }))
}

export function getFirstTrackFromMusic(music: IMusicTrack): AriseTrack {
    return {
        id: music.id.toString(),
        musicId: music.musicId,
        url: music.uri,
        title: music.filename,
        artist: music.artist,
        artwork: music.customCoverUri || defaultMusicArtWork,
        duration: music.duration || 0,
        mediaId: music.musicId,

        isLiked: music.isLiked,
        visible: music.visible,

        customCoverUri: music.customCoverUri,
        customVideoUri: music.customVideoUri,
        customVideoFileName: music.customVideoFileName,

        lyricsId: music.lyricsId,
        lyricsName: music.lyricsName,
        lyricsUri: music.lyricsUri
    }
} 