// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useMusic } from '@/hooks/useMusic';
import { usePlaylist } from '@/hooks/usePlaylist';
import { formatDuration } from '@/service/MusicDuration';
import { setPlayListMusic } from '@/service/playlistdb';
import { IMusicTrack } from '@/types/database';
import { defaultMusicArtWork } from '@/utils/constants';
import { useSQLiteContext } from 'expo-sqlite';
import { CheckIcon, FolderSearch } from 'lucide-react-native';
import React, { memo, useCallback, useState } from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import Animated, { SlideInDown, SlideOutDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import SheetProvider from '../ui/Sheet';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MusicList = ({ playlistId, onMusicListOpen, open }: { playlistId: string, onMusicListOpen: () => void, open: boolean }) => {
    const db = useSQLiteContext();
    const { musics } = useMusic();
    const [selectedMusicIds, setSelectedMusicIds] = useState<string[]>([]);
    const { setPlayListMusic: setMusic, playlistMusics } = usePlaylist();

    const buttonScale = useSharedValue(1);

    const toggleSelection = useCallback((id: string) => {
        setSelectedMusicIds((prevSelected) => {
            if (prevSelected.includes(id)) {
                return prevSelected.filter((musicId) => musicId !== id);
            } else {
                return [...prevSelected, id];
            }
        });
    }, []);

    const handleSetPlayListMusic = async () => {
        const result = await setPlayListMusic({ db, musicIds: selectedMusicIds, playlistId });
        if (result && Array.isArray(result)) setMusic(result);
        onMusicListOpen();
    };

    const animatedButtonStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: buttonScale.value }],
        };
    });

    const handlePressIn = () => {
        buttonScale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
    };

    const handlePressOut = () => {
        buttonScale.value = withSpring(1, { damping: 10, stiffness: 300 });
    };

    const renderItem = useCallback(({ item }: { item: IMusicTrack }) => {
        const isSelected = selectedMusicIds.includes(item.id);
        return (
            <TrackItem
                item={item}
                isSelected={isSelected}
                onToggle={toggleSelection}
            />
        );
    }, [selectedMusicIds, toggleSelection]);

    React.useEffect(() => {
        const ids = playlistMusics.map(m => m.musicId);
        setSelectedMusicIds(ids);
    }, [playlistMusics])

    return (
        <SheetProvider open={open} onClose={onMusicListOpen}>
            <View className="flex-1">
                <Text className='text-black font-elms-bold mx-2 my-4 text-xl'>
                    Choose Music
                </Text>

                <FlatList
                    data={musics.tracks}
                    extraData={selectedMusicIds}
                    className='flex-1 px-2 py-2'
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={{ gap: 10, paddingBottom: 90 }}
                    showsVerticalScrollIndicator={false}
                    removeClippedSubviews={true}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    ListEmptyComponent={
                        <View className="flex-1 items-center justify-center py-8 px-8">
                            <FolderSearch size={52} color="black" className='py-4' strokeWidth={1.5} />
                            <Text className="text-black text-lg font-elms-bold tracking-wide mb-2">
                                No Music Found
                            </Text>
                            <Text className="text-gray-700 text-center mb-8 text-sm leading-5 font-jakarta">
                                Your library is looking a little quiet. Scan your device to discover local audio files.
                            </Text>
                        </View>
                    }
                />

                {selectedMusicIds.length !== 0 && (
                    <Animated.View
                        entering={SlideInDown.duration(300)}
                        exiting={SlideOutDown.duration(300)}
                        className='absolute bottom-4 left-4 right-4 shadow-2xl'
                    >
                        <AnimatedPressable
                            onPress={handleSetPlayListMusic}
                            onPressIn={handlePressIn}
                            onPressOut={handlePressOut}
                            style={animatedButtonStyle}
                            className='bg-neutral-900 py-4 rounded-2xl items-center justify-center border border-neutral-800'
                        >
                            <Text className='text-white text-base font-elms-bold tracking-wide'>
                                Add to Playlist ({selectedMusicIds.length})
                            </Text>
                        </AnimatedPressable>
                    </Animated.View>
                )}
            </View>
        </SheetProvider>
    );
};

interface TrackItemProps {
    item: IMusicTrack;
    isSelected: boolean;
    onToggle: (id: string) => void;
}

const TrackItem = memo(({ item, isSelected, onToggle }: TrackItemProps) => {
    const handlePress = useCallback(() => {
        onToggle(item.id);
    }, [item.id, onToggle]);

    return (
        <Pressable
            className='flex-row items-center w-full gap-3 pr-2'
            onPress={handlePress}
        >
            <View className='flex-1 flex-row items-center gap-3'>
                <Image
                    source={{ uri: item.customCoverUri || defaultMusicArtWork }}
                    className='w-16 h-16 rounded-sm bg-slate-100'
                    resizeMethod="resize"
                />

                <View className='flex-1 flex-col justify-center'>
                    <Text
                        numberOfLines={1}
                        className='text-black text-sm font-jakarta tracking-tight'
                        style={{ fontWeight: 500 }}
                    >
                        {item.title}
                    </Text>

                    <Text numberOfLines={1} className='text-zinc-500 text-xs mt-0.5'>
                        {formatDuration(item.duration)} • Local Audio
                    </Text>
                </View>
            </View>

            <View>
                <View
                    className={`w-6 h-6 rounded-md border items-center justify-center ${isSelected ? 'bg-black border-black' : 'border-gray-300'
                        }`}
                >
                    {isSelected && <CheckIcon size={14} color="white" />}
                </View>
            </View>
        </Pressable>
    );
});

export default MusicList;