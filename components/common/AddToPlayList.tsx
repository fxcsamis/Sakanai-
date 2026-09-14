// Copyright (c) 2026 Raj
// See LICENSE for details.

import { appendPlayListMusic, getAllPlayListByMusicId, PlayListByMusicId, removePlayListMusic } from '@/service/playlistdb'
import { defaultPlayListCover } from '@/utils/constants'
import { useSQLiteContext } from 'expo-sqlite'
import { CheckIcon, ListMusic, X } from 'lucide-react-native'
import React from 'react'
import { Image, ScrollView, Text, TouchableOpacity, useColorScheme, View } from 'react-native'
import CustomModal from '../ui/model'

const AddToPlayList = ({ musicId, isVisible, onClose }: { musicId: string, isVisible: boolean, onClose: () => void }) => {
    const db = useSQLiteContext();
    const [playlist, setplaylist] = React.useState<PlayListByMusicId[]>([]);
    const [selectedPlaylists, setSelectedPlaylists] = React.useState<string[]>([]);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const loadPlaylists = async () => {
        const response = await getAllPlayListByMusicId({ db, musicId });
        if (response) {
            setplaylist(response);
            setSelectedPlaylists(response.filter((item) => item.isAdded).map((item) => item.id));
        }
    }

    React.useEffect(() => {
        if (isVisible) {
            loadPlaylists();
        }
    }, [musicId, isVisible])

    const handlePlayListAction = async (id: string) => {
        const isAdded = selectedPlaylists.includes(id);
        if (isAdded) {
            const res = await handleRemoveFromPlayList(id);
            if (res) setSelectedPlaylists(prev => prev.filter(pid => pid !== id));
        } else {
            const res = await handleAddToPlayList(id);
            if (res) setSelectedPlaylists(prev => [...prev, id]);
        }
    }

    const togglePlaylist = (id: string) => {
        handlePlayListAction(id);
    };

    const handleAddToPlayList = React.useCallback(async (playlistId: string) => {
        if (!musicId) return false;
        const res = await appendPlayListMusic({ db, musicId, playlistId })
        return true;
    }, [musicId]);

    const handleRemoveFromPlayList = React.useCallback(async (playlistId: string) => {
        if (!musicId) return false;
        const res = await removePlayListMusic({ db, musicId, playlistId })
        return true;
    }, [musicId]);

    return (
        <CustomModal isVisible={isVisible} position='middle' onClose={onClose}>
            <View className="w-full pb-4 mb-4 border-b border-gray-100 dark:border-[#282828] flex-row items-center justify-between">
                <Text className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">Add to Playlist</Text>
                <TouchableOpacity
                    className="w-8 h-8 bg-gray-100 dark:bg-[#282828] rounded-full items-center justify-center"
                    onPress={onClose}
                    activeOpacity={0.7}
                >
                    <X size={18} color={isDark ? "#B3B3B3" : "#6B7280"} />
                </TouchableOpacity>
            </View>

            {playlist.length !== 0 ? (
                <ScrollView showsVerticalScrollIndicator={false} className="w-full max-h-[60vh]">
                    {playlist.map((item) => {
                        const isSelected = selectedPlaylists.includes(item.id);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                activeOpacity={0.7}
                                onPress={() => togglePlaylist(item.id)}
                                className="flex-row items-center justify-between py-3 px-2 mb-2 rounded-2xl active:bg-gray-50 dark:active:bg-[#282828]"
                            >
                                <View className="flex-row items-center flex-1">
                                    <View className="shadow-sm dark:shadow-none">
                                        <Image
                                            source={{ uri: item?.cover || defaultPlayListCover }}
                                            className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-[#282828] border border-gray-100 dark:border-transparent"
                                            alt="playlist-cover"
                                        />
                                    </View>
                                    <View className="justify-center ml-4 flex-1 pr-4">
                                        <Text
                                            className="text-base font-bold text-gray-800 dark:text-white mb-0.5"
                                            numberOfLines={1}
                                        >
                                            {item.title}
                                        </Text>
                                        <Text className="text-xs text-gray-400 dark:text-[#B3B3B3] font-medium">
                                            {isSelected ? 'Added to playlist' : 'Tap to add'}
                                        </Text>
                                    </View>
                                </View>

                                <View>
                                    <View
                                        className={`w-7 h-7 rounded-full border-[1.5px] items-center justify-center transition-colors ${isSelected
                                            ? 'bg-black border-black dark:bg-white dark:border-white'
                                            : 'bg-transparent border-gray-300 dark:border-[#535353]'
                                            }`}
                                    >
                                        {isSelected && <CheckIcon size={14} color={isDark ? "#121212" : "white"} strokeWidth={3} />}
                                    </View>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            ) : (
                <View className="items-center justify-center py-10 px-4">
                    <View className="w-20 h-20 bg-gray-50 dark:bg-[#282828] rounded-full items-center justify-center mb-5">
                        <ListMusic size={32} color={isDark ? "#B3B3B3" : "#9CA3AF"} strokeWidth={1.5} />
                    </View>
                    <Text className="text-xl font-bold text-gray-800 dark:text-white mb-2">No Playlists Found</Text>
                    <Text className="text-sm text-gray-500 dark:text-[#B3B3B3] text-center mb-8 px-4 leading-5">
                        Create your first playlist to start saving your favorite music.
                    </Text>
                </View>
            )}
        </CustomModal>
    )
}

export default AddToPlayList