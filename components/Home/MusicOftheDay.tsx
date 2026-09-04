// Copyright (c) 2026 Raj 
// See LICENSE for details.
import { useMusic } from '@/hooks/useMusic';
import { useAppSelector } from '@/hooks/useRedux';
import { useTrack } from '@/hooks/useTrack';
import { getTrackFromMusic } from '@/service/TrackMaker';
import { IMusicTrack } from '@/types/database';
import { defaultMusicArtWork } from '@/utils/constants';
import { Asterisk, MoveRight } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

export default function MusicoftheDay() {
    const { handpickedMusic } = useMusic();
    const { setupQueue, playAtIndex } = useTrack();
    const tracks = useAppSelector(state => state.trackReducer);

    const handlePlay = (musicId: string) => {
        if (!handpickedMusic.tracks || !handpickedMusic.queueHash) return;

        const indx = handpickedMusic.tracks.findIndex(m => m.id === musicId);
        if (tracks.playlistName === 'Music of the Day' && tracks.queueHash === handpickedMusic.queueHash) {
            playAtIndex(indx);
        } else {
            setupQueue({ tracks: getTrackFromMusic(handpickedMusic.tracks), playlistName: 'Music of the Day', sourceId: null, sourceType: 'default', startIndex: indx, queueHash: handpickedMusic.queueHash });
        }
    }

    if (handpickedMusic.tracks.length === 0) return null;
    return (
        <View>
            <View className='flex-row items-start gap-3'>
                <View className='flex-col items-center gap-1 mt-1'>
                    <View className='w-0.5 h-8 bg-purple-500 dark:bg-purple-400 rounded-full' />
                    <View className='w-0.5 h-3 bg-zinc-200 dark:bg-[#282828] rounded-full' />
                </View>

                <View className='flex-col items-start flex-1'>
                    <View className='flex-row items-center gap-1.5 mb-2'>
                        <Asterisk size={10} color='#a855f7' fill='#a855f7' strokeWidth={0} />
                        <Text className='text-purple-500 dark:text-purple-400 text-xs font-elms-med tracking-widest uppercase'>Today's Vibe</Text>
                    </View>
                    <Text className='text-black dark:text-white text-4xl font-elms-med tracking-tighter leading-none'>
                        hand-picked,{'\n'}just for today.
                    </Text>
                    <View className='flex-row items-center gap-1.5 mt-3'>
                        <View className='w-4 h-px bg-zinc-200 dark:bg-[#282828]' />
                        <MoveRight size={11} color='#d4d4d8' />
                    </View>
                </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 10 }} className='my-2 mx-3'>
                {handpickedMusic.tracks.map((item: IMusicTrack) => (
                    <Pressable key={item.id} className='flex-row items-center w-full gap-3' onPress={() => handlePlay(item.id)}>
                        <Image
                            source={{ uri: item.customCoverUri || defaultMusicArtWork }}
                            className='w-16 h-16 rounded-sm'
                        />

                        <View className='flex-1 flex-col justify-center max-w-[78%]'>
                            <Text numberOfLines={1} className='text-black dark:text-white text-sm font-jakarta tracking-tight' style={{ fontWeight: 500 }}>
                                {item.title}
                            </Text>
                            <Text numberOfLines={1} className='text-zinc-500 dark:text-[#B3B3B3] text-xs mt-0.5'>
                                {item.artist}
                            </Text>
                        </View>
                    </Pressable>
                ))}
            </ScrollView>
        </View>
    )
}