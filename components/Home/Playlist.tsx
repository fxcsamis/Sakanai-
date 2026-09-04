// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useMusic } from '@/hooks/useMusic';
import { useAppSelector } from '@/hooks/useRedux';
import { useTrack } from '@/hooks/useTrack';
import { formatDurationLocalString } from '@/service/MusicDuration';
import { getPlayListMusic } from '@/service/playlistdb';
import { getTrackFromMusic } from '@/service/TrackMaker';
import { IMusicTrack, IPlayListMusicTrack, PlayListMusic } from '@/types/database';
import { defaultPlayList, defaultPlayListCover } from '@/utils/constants';
import { useSQLiteContext } from 'expo-sqlite';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';

export default function Playlist() {
    const { playlist } = useMusic();
    const db = useSQLiteContext();
    const { musics } = useMusic();
    const { setupQueue } = useTrack();
    const tracks = useAppSelector(state => state.trackReducer);

    const getPlaylistMusic = async () => {
        const res = await getPlayListMusic(db, playlist?.id!);
        return res ?? [];
    }

    const playlistMusics = (playlistEntries: PlayListMusic[]) => {
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
        )
    }

    const handlePlay = async () => {
        if (tracks.sourceId !== playlist?.id) {
            const pm = await getPlaylistMusic();
            setupQueue({ tracks: getTrackFromMusic(playlistMusics(pm)), playlistName: playlist?.title || defaultPlayList, sourceType: 'playlist', sourceId: playlist?.id!, queueHash: null });
        }
    }
    if (!playlist) return null;
    return (
        <Pressable className='w-full' onPress={handlePlay}>

            <View
                className='overflow-hidden bg-white dark:bg-[#181818]'
                style={{
                    flex: 1,
                    borderRadius: 14,
                    shadowColor: '#000',
                    shadowOpacity: 0.02,
                    shadowRadius: 4,
                    elevation: 6,
                }}>
                <Image
                    source={{ uri: playlist?.cover || defaultPlayListCover }}
                    className='w-full'
                    style={{ aspectRatio: 1 }}
                />
            </View>

            <View className='px-1 mt-2'>
                <Text className='text-black dark:text-white text-2xl font-elms-med tracking-tighter'>
                    {playlist?.title}
                </Text>
                <Text className='text-zinc-400 dark:text-[#B3B3B3] text-sm font-elms mt-0.5'>
                    {playlist?.numberOfMusic} songs • {formatDurationLocalString(playlist?.totalSeconds || 0)}
                </Text>
            </View>

        </Pressable>
    );
}