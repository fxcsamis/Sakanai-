// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useMusic } from '@/hooks/useMusic';
import { useAppSelector } from '@/hooks/useRedux';
import { useTrack } from '@/hooks/useTrack';
import { getTrackFromMusic } from '@/service/TrackMaker';
import { IMusicTrack } from '@/types/database';
import { defaultMusicArtWork } from '@/utils/constants';
import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { EllipsisVertical, MoveRight } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';

export default function Shorts() {
    const { shorts } = useMusic();
    const { setupQueue } = useTrack();
    const router = useRouter();

    const track = useAppSelector(state => state.trackReducer);

    const streamPlayList = (play: boolean = true) => {
        if (!shorts.tracks || shorts.tracks.length === 0 || !shorts.queueHash) return;
        setupQueue({ tracks: getTrackFromMusic(shorts.tracks), playlistName: 'Shorts', sourceType: 'short', sourceId: null, play, queueHash: shorts.queueHash });
    }

    const handlePlayInShort = (musicId: string) => {
        if (shorts.tracks.length === 0) return;
        if (track.playlistName !== 'Shorts' || track.queueHash !== shorts.queueHash) streamPlayList(false);
        const index = shorts.tracks.findIndex(muisc => muisc.id === musicId);
        if (index === -1) return;
        router.push({ pathname: '/(tabs)/shorts', params: { activeIndex: index } });
    }

    if (shorts.tracks.length === 0) return null;
    return (
        <View>
            <View className='flex-col items-start'>
                <View className='flex-row items-center gap-2 bg-sky-50 dark:bg-[#181818] px-3 py-1 rounded-full self-start mb-2'>
                    <Image source={require("@/assets/arise/shorts.png")} className='w-3 h-3' />
                    <Text className='text-sky-500 dark:text-sky-400 text-xs font-elms-med tracking-widest uppercase'>Shorts</Text>
                </View>
                <Text className='text-black dark:text-white text-4xl font-elms-med tracking-tighter leading-none'>Catch a new vibe.</Text>
                <View className='flex-row items-center gap-1.5 mt-2'>
                    <View className='w-4 h-px bg-gray-300 dark:bg-[#282828]' />
                    <MoveRight size={11} color='#d1d5db' />
                </View>
            </View>

            <FlatList
                data={shorts.tracks}
                scrollEnabled={false}
                numColumns={2}
                columnWrapperStyle={{ gap: 15 }}
                contentContainerStyle={{ gap: 15 }}
                className='mx-2 my-2'
                renderItem={({ item }: { item: IMusicTrack }) => (
                    <View
                        className='flex-1 bg-white dark:bg-[#181818] rounded-[14px]'
                        style={{
                            shadowColor: '#000',
                            shadowOpacity: 0.12,
                            shadowRadius: 16,
                            shadowOffset: { width: 0, height: 8 },
                            elevation: 6,
                        }}>
                        <Pressable onPress={() => handlePlayInShort(item.id)} style={{ borderRadius: 14, overflow: 'hidden' }}>
                            <ImageBackground
                                source={{ uri: item?.customCoverUri || defaultMusicArtWork }}
                                style={{ width: '100%', aspectRatio: 2 / 3 }}
                            >
                                <LinearGradient
                                    colors={['transparent', 'transparent', 'rgba(0,0,0,0.55)']}
                                    style={{ flex: 1, padding: 10, justifyContent: 'space-between' }}
                                >
                                    <View className='flex-row items-center justify-end'>
                                        <EllipsisVertical size={18} color='#fff' />
                                    </View>

                                    <View className='flex-col gap-0.5'>
                                        <Text numberOfLines={2} className='text-white text-sm font-elms-med leading-tight'>
                                            {item.title}
                                        </Text>
                                        <Text numberOfLines={1} className='text-white/60 text-xs font-elms'>
                                            {item.artist}
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </ImageBackground>
                        </Pressable>
                    </View>
                )}
            />
        </View>
    )
}