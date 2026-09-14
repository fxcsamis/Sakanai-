// Copyright (c) 2026 Raj 
// See LICENSE for detail

import { useMusic } from '@/hooks/useMusic';
import { useAppSelector } from '@/hooks/useRedux';
import { useTrack } from '@/hooks/useTrack';
import { getTrackFromMusic } from '@/service/TrackMaker';
import { IMusicTrack } from '@/types/database';
import { defaultMusicArtWork } from '@/utils/constants';
import { Search, X } from 'lucide-react-native';
import React from 'react';
import { FlatList, Image, Keyboard, Pressable, Text, TextInput, TouchableOpacity, View, useColorScheme } from 'react-native';

export default function SearchInput({ _query, musicList }: { _query?: string, musicList?: IMusicTrack[] }) {
    const { filteredMusic } = useMusic();
    const [query, setQuery] = React.useState('');
    const [focused, setFocused] = React.useState(false);
    const [musics, setMusics] = React.useState<IMusicTrack[]>([]);
    const { setupQueue, playAtIndex } = useTrack();
    const tracks = useAppSelector(state => state.trackReducer);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    React.useEffect(() => {
        if (musicList && musicList.length > 0) setMusics(musicList);
        if (_query) setQuery(_query);
    }, [musicList, _query]);

    const searchResults = React.useMemo(() => {
        if (!query.trim()) return [];
        if (query.startsWith('#')) {
            return musics;
        }

        const lowerCaseQuery = query.toLowerCase();
        return filteredMusic.filter(
            (item) =>
                item.title?.toLowerCase().includes(lowerCaseQuery) ||
                item.artist?.toLowerCase().includes(lowerCaseQuery)
        );
    }, [query, musics, filteredMusic]);

    const handleClear = () => {
        setQuery('');
        Keyboard.dismiss();
    };

    const handlePlay = (musicId: string) => {
        const indx = musics.findIndex(m => m.id === musicId);
        if (tracks.playlistName === query) {
            playAtIndex(indx);
        } else {
            setupQueue({ tracks: getTrackFromMusic(musics), playlistName: query, sourceId: null, sourceType: 'search', startIndex: indx, queueHash: null });
        }
    }

    React.useEffect(() => {
        if (musicList && musicList?.length > 0) setFocused(true);
    }, [musicList])

    return (
        <View className="w-full relative z-50">
            <View className={`flex-row items-center rounded-full px-3 py-2 gap-3 bg-zinc-100 dark:bg-[#242424] border transition-all ${focused ? 'border-zinc-300 dark:border-white' : 'border-transparent dark:border-transparent'}`}>
                <Search size={17} color={focused ? (isDark ? '#FFFFFF' : '#3f3f46') : (isDark ? '#B3B3B3' : '#a1a1aa')} />
                <TextInput
                    className="flex-1 text-zinc-800 dark:text-white text-sm h-6 p-0"
                    placeholder="What do you want to listen to?"
                    placeholderTextColor={isDark ? "#B3B3B3" : "#a1a1aa"}
                    value={query}
                    onChangeText={setQuery}
                    onFocus={() => setFocused(true)}
                    onBlur={() => {
                        if (!query) setFocused(false);
                    }}
                    returnKeyType="search"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={handleClear} activeOpacity={0.6} className="p-1 -m-1">
                        <View className="bg-zinc-300 dark:bg-[#3E3E3E] rounded-full p-0.5">
                            <X size={12} color={isDark ? "#FFFFFF" : "#52525b"} strokeWidth={2.5} />
                        </View>
                    </TouchableOpacity>
                )}
            </View>

            {focused && query.length > 0 && (
                <View className="mt-4 bg-white dark:bg-[#121212] rounded-2xl shadow-sm border border-zinc-100 dark:border-[#282828]">
                    <View className="flex-row items-center gap-3 px-4 py-2 bg-white dark:bg-[#121212] rounded-t-2xl">
                        <Text className="text-[10px] font-bold tracking-widest uppercase text-zinc-400 dark:text-[#B3B3B3]">
                            Results
                        </Text>
                        <View className="flex-1 h-px bg-zinc-100 dark:bg-[#282828]" />
                    </View>

                    {searchResults.length === 0 ? (
                        <View className="py-8 items-center justify-center">
                            <Text className="text-zinc-800 dark:text-white font-medium text-sm mb-1">No songs found</Text>
                            <Text className="text-zinc-400 dark:text-[#B3B3B3] text-xs">Try searching for a different artist or title</Text>
                        </View>
                    ) : (
                        <FlatList
                            data={searchResults}
                            scrollEnabled={false}
                            keyExtractor={(item) => item.id}
                            keyboardShouldPersistTaps="handled"
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={{ paddingBottom: 10 }}
                            renderItem={({ item }) => (
                                <Pressable
                                    key={item.id}
                                    className='flex-row items-center w-full gap-3 px-4 py-2 active:bg-zinc-50 dark:active:bg-[#1A1A1A]'
                                    onPress={() => {
                                        Keyboard.dismiss();
                                        setFocused(false);
                                        handlePlay(item.id);
                                    }}
                                >
                                    <Image
                                        source={{ uri: item.customCoverUri || defaultMusicArtWork }}
                                        className='w-16 h-16 rounded-sm'
                                    />
                                    <View className='flex-1 flex-col justify-center pr-2'>
                                        <Text numberOfLines={1} className='text-black dark:text-white text-sm font-medium tracking-tight'>
                                            {item.title}
                                        </Text>
                                        <Text numberOfLines={1} className='text-zinc-500 dark:text-[#B3B3B3] text-xs mt-0.5'>
                                            {item.artist}
                                        </Text>
                                    </View>
                                </Pressable>
                            )}
                        />
                    )}
                </View>
            )}
        </View>
    );
}