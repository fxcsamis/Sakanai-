// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useAppSelector } from '@/hooks/useRedux';
import { useTrack } from '@/hooks/useTrack';
import { getTrackFromMusic } from '@/service/TrackMaker';
import { HashedIMusicTrackList, IMusicTrack } from '@/types/database';
import { defaultMusicArtWork } from '@/utils/constants';
import { MoveRight, Zap } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

export default function MusicLinearList({ title, subTitle, Icon = Zap, musicPlayList = { tracks: [], queueHash: 'default' } }: { title: string, subTitle: string, Icon?: React.ElementType, musicPlayList: HashedIMusicTrackList }) {
    const { setupQueue, playAtIndex } = useTrack();
    const tracks = useAppSelector(state => state.trackReducer);
    const handlePlay = (musicId: string) => {
        if (!musicPlayList?.tracks || !musicPlayList.queueHash) return;

        const indx = musicPlayList.tracks.findIndex(m => m.id === musicId);
        if (tracks.playlistName === title && tracks.queueHash === musicPlayList.queueHash) {
            playAtIndex(indx);
        } else {
            setupQueue({ tracks: getTrackFromMusic(musicPlayList.tracks), playlistName: title, sourceId: null, sourceType: 'default', startIndex: indx, queueHash: musicPlayList.queueHash });
        }
    }
    return (
        <View>
            <View className='flex-col items-start'>
                <View className='flex-row items-center gap-2 bg-sky-50 dark:bg-[#181818] px-3 py-1 rounded-full self-start mb-2'>
                    <Icon size={12} color='#0ea5e9' fill='#0ea5e9' strokeWidth={0} />
                    <Text className='text-sky-500 dark:text-sky-400 text-xs font-elms-med tracking-widest uppercase'>{title}</Text>
                </View>
                <Text className='text-black dark:text-white text-4xl font-elms-med tracking-tighter leading-none'>{subTitle}</Text>
                <View className='flex-row items-center gap-1.5 mt-2'>
                    <View className='w-4 h-px bg-gray-300 dark:bg-[#282828]' />
                    <MoveRight size={11} color='#d1d5db' />
                </View>
            </View>

            <ScrollView horizontal contentContainerStyle={{ gap: 6 }} className='my-2' showsHorizontalScrollIndicator={false}>
                {musicPlayList?.tracks?.map((item: IMusicTrack) => (
                    <Pressable key={item.id} onPress={() => handlePlay(item.id)}>
                        <View className='w-36'>

                            <Image
                                source={{ uri: item.customCoverUri || defaultMusicArtWork }}
                                className='w-[8.5rem] h-[8.5rem]'
                            />

                            <View className='items-center'>
                                <Text numberOfLines={1} className='text-black dark:text-white text-sm font-jakarta mt-2.5 tracking-tight'>
                                    {item.title}
                                </Text>

                                <Text numberOfLines={1} className='text-zinc-500 dark:text-[#B3B3B3] text-xs font-normal mt-1'>
                                    {item.artist}
                                </Text>
                            </View>

                        </View>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    )
}