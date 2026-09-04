// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useMusic } from '@/hooks/useMusic';
import createQueueHash from '@/service/queueHash';
import { IMusicTrack, IPlayListMusicTrack, PlayList, PlayListMusic } from '@/types/database';
import React, { createContext, useMemo, useState } from 'react';

interface PlaylistContextType {
    playlist: PlayList | null;
    playListHash: string;
    playlistMusics: IPlayListMusicTrack[];
    setPlayList: (playlist: PlayList) => void;
    setPlayListMusic: (musics: PlayListMusic[]) => Promise<void>;
}

export const PlaylistContext = createContext<PlaylistContextType>({
    playlist: null,
    playListHash: 'default',
    playlistMusics: [],
    setPlayList: () => { },
    setPlayListMusic: async () => { },
});

export default function PlayListProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const { musics } = useMusic();

    const [playlist, setPlaylist] = useState<PlayList | null>(null);
    const [playlistEntries, setPlaylistEntries] = useState<PlayListMusic[]>([]);
    const [playlistHash, setPlayListHash] = React.useState<string>('');

    const playlistMusics = useMemo<IPlayListMusicTrack[]>(() => {
        const musicMap = new Map<string, IMusicTrack>(
            musics.tracks.map((music) => [music.id, music])
        );

        return playlistEntries.reduce<IPlayListMusicTrack[]>(
            (result, playlistMusic) => {
                const music = musicMap.get(playlistMusic.musicId);

                if (!music) return result;

                result.push({
                    ...music,
                    ...playlistMusic,
                });

                return result;
            },
            []
        );
    }, [playlistEntries, musics]);

    const handleSetPlayList = React.useCallback(async (playlistMusics: PlayListMusic[]) => {
        const hash = await createQueueHash(playlistMusics);
        setPlaylistEntries(playlistMusics);
        setPlayListHash(hash);
    }, [])

    return (
        <PlaylistContext.Provider
            value={{
                playlist,
                playlistMusics,
                playListHash: playlistHash,
                setPlayList: setPlaylist,
                setPlayListMusic: handleSetPlayList,
            }}
        >
            {children}
        </PlaylistContext.Provider>
    );
}