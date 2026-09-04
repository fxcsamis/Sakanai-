// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { usePlaylist } from '@/hooks/usePlaylist';
import { useAppSelector } from '@/hooks/useRedux';
import { useTrack } from '@/hooks/useTrack';
import { reorderPlaylistMusic } from '@/service/playlistdb';
import { getTrackFromMusic } from '@/service/TrackMaker';
import { IPlayListMusicTrack } from '@/types/database';
import { defaultMusicArtWork, defaultPlayList } from '@/utils/constants';
import { useSQLiteContext } from 'expo-sqlite';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import DraggableFlatList, { ScaleDecorator } from 'react-native-draggable-flatlist';
import PlayListMusicMenu from './PlayListMusicMenu';

export default function PlayListMusic({ header, reload }: { header: React.JSX.Element, reload: () => void }) {
    const db = useSQLiteContext();
    const { setupQueue, playAtIndex } = useTrack();
    const { playlistMusics, setPlayListMusic, playlist, playListHash } = usePlaylist();
    const track = useAppSelector(state => state.trackReducer);

    const handleReorder = async (data: any) => {
        await reorderPlaylistMusic({ db, items: data });
        setPlayListMusic(data);
    }

    const handlePlay = (musicId: string) => {
        if (!playListHash || !playlistMusics) return;
        const musicIdx = playlistMusics.findIndex(item => item.id === musicId);
        if (playlist?.title === track.playlistName && track.queueHash === playListHash) {
            playAtIndex(musicIdx);
        } else {
            setupQueue({ tracks: getTrackFromMusic(playlistMusics), playlistName: playlist?.title || defaultPlayList, sourceType: 'playlist', sourceId: playlist?.id!, startIndex: musicIdx, queueHash: playListHash });
        }
    }

    const renderTrack = ({ item, drag, isActive }: { item: IPlayListMusicTrack, drag: any, isActive: boolean }) => (
        <ScaleDecorator>
            <View className={`flex-row items-center w-full gap-3 py-2 px-6 ${isActive ? 'opacity-70 bg-zinc-800' : ''}`}>
                <Pressable
                    onLongPress={drag}
                    disabled={isActive}
                    className='flex-1 flex-row items-center gap-3'
                    onPress={() => handlePlay(item.id)}
                >
                    <Image
                        source={{ uri: item.customCoverUri || defaultMusicArtWork }}
                        className='w-16 h-16 rounded-sm bg-slate-100'
                        resizeMethod="resize"
                    />

                    <View className='flex-1 flex-col justify-center'>
                        <Text
                            numberOfLines={1}
                            className='text-white text-sm font-jakarta tracking-tight'
                            style={{ fontWeight: '500' }}
                        >
                            {item.title}
                        </Text>
                        <Text numberOfLines={1} className='text-zinc-500 text-xs mt-0.5'>
                            {item.artist}
                        </Text>
                    </View>
                </Pressable>

                <View>
                    <PlayListMusicMenu reload={reload} isLiked={item.isLiked ?? 0} musicId={item.musicId} />
                </View>
            </View>
        </ScaleDecorator>
    );

    return (
        <View className="flex-1">
            <DraggableFlatList
                data={playlistMusics}
                onDragEnd={({ data }) => handleReorder(data)}
                keyExtractor={(item) => item.id}
                renderItem={renderTrack}

                ListHeaderComponent={header}

                contentContainerStyle={{ paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
}