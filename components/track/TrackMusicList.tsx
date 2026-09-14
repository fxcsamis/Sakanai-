// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useAppSelector } from '@/hooks/useRedux'
import { useTrack } from '@/hooks/useTrack'
import { AriseTrack } from '@/types/database'
import { defaultMusicArtWork } from '@/utils/constants'
import clsx from 'clsx'
import React from 'react'
import { FlatList, Image, Pressable, Text, View } from 'react-native'
import SheetProvider from '../ui/Sheet'

const TrackMusicList = ({ open, onClose }: { open: boolean, onClose: () => void }) => {
    const { playlistName, queue, currentIndex } = useAppSelector(state => state.trackReducer);
    const { playAtIndex } = useTrack();

    const handlePlay = (musicId: string) => {
        const indx = queue.findIndex(m => m.id === musicId);
        playAtIndex(indx);
    }

    const renderTrack = ({ item, index }: { item: AriseTrack, index: number }) => {
        const isActive = index === currentIndex;

        return (
            <Pressable
                className={clsx(
                    'flex-row items-center w-full gap-4 p-3 rounded-md active:bg-white/5',
                    isActive && 'bg-white/5'
                )}
                onPress={() => handlePlay(item.id)}
            >
                <Image
                    source={{ uri: item.customCoverUri || defaultMusicArtWork }}
                    className='w-16 h-16 rounded-sm'
                />

                <View className='flex-1 flex-col justify-center pr-2'>
                    <Text
                        numberOfLines={1}
                        className={clsx(
                            'text-base font-jakarta tracking-tight',
                            isActive ? 'text-white font-bold' : 'text-white/90 font-medium'
                        )}
                    >
                        {item.title}
                    </Text>
                    <Text
                        numberOfLines={1}
                        className={[
                            "text-sm mt-0.5",
                            isActive ? "text-white/70" : "text-zinc-500"
                        ].join(" ")}
                    >
                        {item.artist}
                    </Text>
                </View>
            </Pressable>
        )
    }

    return (
        <SheetProvider open={open} onClose={onClose} className='bg-[#121212]' closeClassName='bg-white/10'>
            <View className='flex-1 pt-3 pb-6'>
                <View className='px-5 pb-4 border-b-[1px] border-white/10 flex-row items-end justify-between'>
                    <Text className="text-white font-bold text-2xl tracking-tight">
                        {playlistName || 'Queue'}
                    </Text>
                    <Text className="text-white/50 uppercase tracking-widest text-xs font-semibold mb-1">
                        Playing from playlist
                    </Text>
                </View>

                <FlatList
                    data={queue}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 16, gap: 8 }}
                    className='flex-1'
                    renderItem={renderTrack}
                    extraData={currentIndex}
                />
            </View>
        </SheetProvider>
    )
}

export default TrackMusicList