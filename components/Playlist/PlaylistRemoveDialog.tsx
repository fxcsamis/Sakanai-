// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { usePlaylist } from '@/hooks/usePlaylist';
import { useRefresh } from '@/hooks/useRefresh';
import { removePlayList } from '@/service/playlistdb';
import { defaultPlayListCover } from '@/utils/constants';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { CircleAlert } from 'lucide-react-native';
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import CustomModal from '../ui/model';

interface PlaylistRemoveDialogProps {
    isVisible: boolean;
    onClose: () => void;
}

const PlaylistRemoveDialog = ({ isVisible, onClose }: PlaylistRemoveDialogProps) => {
    const { playlist } = usePlaylist();
    const { onPlaylistRefresh } = useRefresh();
    const router = useRouter();
    const db = useSQLiteContext();

    const handlePlaylistRemove = async () => {
        if (!playlist?.id) return;
        const response = await removePlayList({ db, playlistId: playlist.id });
        if (response) {
            onClose();
            router.back();
            onPlaylistRefresh();
        }
    }

    return (
        <CustomModal isVisible={isVisible} onClose={onClose} className='gap-5 bg-zinc-900'>

            <View className='flex-row items-center gap-2.5'>
                <CircleAlert size={22} color={'#dc2626'} />
                <Text className='text-lg font-elms-med text-zinc-100 flex-1' numberOfLines={1}>
                    Delete Playlist?
                </Text>
            </View>

            <View className='flex-row gap-4 p-3 rounded-2xl items-center'>
                <View className='relative w-20 h-20 rounded-xl shadow-sm overflow-hidden bg-zinc-700 items-center justify-center'>
                    <Image
                        source={{ uri: playlist?.cover || defaultPlayListCover }}
                        className="absolute w-full h-full"
                        resizeMode="cover"
                    />
                </View>

                <View className='flex-1 justify-center gap-0.5'>
                    <Text className='text-base font-semibold text-zinc-200' numberOfLines={1}>
                        {playlist?.title ?? "Untitled Playlist"}
                    </Text>
                    {playlist?.description ? (
                        <Text className='text-xs text-zinc-400' numberOfLines={2}>
                            {playlist.description}
                        </Text>
                    ) : (
                        <Text className='text-xs text-zinc-400 italic'>
                            No description provided
                        </Text>
                    )}
                </View>
            </View>

            <Text className='text-sm text-zinc-400 px-1'>
                Are you sure you want to delete this playlist? This action cannot be undone.
            </Text>


            <View className='flex-row gap-3 mt-2'>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={onClose}
                    className='flex-1 py-3.5 bg-zinc-800 rounded-xl items-center justify-center'
                >
                    <Text className='text-sm font-medium text-zinc-300'>
                        Cancel
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handlePlaylistRemove}
                    className='flex-1 py-3.5 bg-red-600 rounded-xl items-center justify-center shadow-sm shadow-red-600/20'
                >
                    <Text className='text-sm font-semibold text-white'>
                        Delete
                    </Text>
                </TouchableOpacity>
            </View>

        </CustomModal>
    )
}

export default PlaylistRemoveDialog;