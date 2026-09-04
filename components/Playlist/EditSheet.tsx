// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { usePlaylist } from '@/hooks/usePlaylist';
import { defaultPlayListCover } from '@/utils/constants';
import * as ImagePicker from 'expo-image-picker';
import { useSQLiteContext } from 'expo-sqlite';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import SheetProvider from '../ui/Sheet';
// 1. Import Reanimated utilities
import { saveMedia } from '@/service/persistMedia';
import { updatePlayList } from '@/service/playlistdb';
import Animated, { useAnimatedKeyboard, useAnimatedStyle } from 'react-native-reanimated';

const EditSheet = ({ reload, open, onClose }: { reload: () => void, open: boolean, onClose: () => void }) => {
    const db = useSQLiteContext();
    const { playlist } = usePlaylist();

    const [title, setTitle] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [cover, setCover] = useState<string>('');

    const keyboard = useAnimatedKeyboard();

    const animatedKeyboardStyle = useAnimatedStyle(() => {
        return {
            paddingBottom: keyboard.height.value,
        };
    });

    const handleImagePicker = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                mediaTypes: ['images'],
                quality: 1
            });

            if (result.canceled || !result.assets || result.assets.length === 0) return;
            const pickedFile = result.assets[0];
            setCover(pickedFile.uri);
        } catch (error) {
            console.log("Error picking documents:", error);
        }
    };

    const handleSave = async () => {
        if (!playlist) return;
        let finalCover = cover;

        if (cover !== playlist.cover) {
            finalCover = await saveMedia(cover, 'image', playlist.id);
        }

        await updatePlayList({ db, playList: { id: playlist.id, title: title, description: description, cover: finalCover } });
        reload();
        onClose();
    };

    useEffect(() => {
        setTitle(playlist?.title ?? '');
        setDescription(playlist?.description ?? '');
        setCover(playlist?.cover ?? defaultPlayListCover);
    }, [playlist]);

    return (
        <SheetProvider open={open} onClose={onClose}>
            <Animated.View style={[{ flex: 1 }, animatedKeyboardStyle]}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    className='px-5 pt-4'
                    contentContainerStyle={{ paddingBottom: 40 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <View className='mb-6 flex-row items-center justify-between'>
                        <Text className='text-2xl font-elms-bold text-slate-900'>Edit Playlist</Text>
                    </View>

                    <View className='items-center mb-8'>
                        <TouchableOpacity
                            activeOpacity={0.8}
                            className='relative rounded-2xl shadow-sm overflow-hidden bg-slate-100'
                            onPress={handleImagePicker}
                        >
                            <Image
                                source={{ uri: cover }}
                                className='w-full h-64'
                                resizeMode="cover"
                                style={{ aspectRatio: 1 }}
                            />
                        </TouchableOpacity>
                    </View>

                    <View className='gap-5'>
                        <View>
                            <Text className='text-xs font-elms text-slate-500 uppercase mb-1 ml-1 tracking-wider'>
                                Title
                            </Text>
                            <TextInput
                                value={title}
                                onChangeText={setTitle}
                                placeholder="Enter title"
                                placeholderTextColor="#94a3b8"
                                className='bg-slate-100 px-4 py-3 rounded-xl text-base font-elms text-slate-900'
                            />
                        </View>

                        <View>
                            <Text className='text-xs font-elms text-slate-500 uppercase mb-1 ml-1 tracking-wider'>
                                Description
                            </Text>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Enter Description"
                                placeholderTextColor="#94a3b8"
                                className='bg-slate-100 px-4 py-3 rounded-xl text-base font-elms text-slate-900'
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={handleSave}
                        className='mt-8 bg-slate-900 py-4 rounded-xl items-center shadow-sm'
                    >
                        <Text className='text-white text-lg font-elms-bold'>Save Changes</Text>
                    </TouchableOpacity>
                </ScrollView>
            </Animated.View>
        </SheetProvider>
    );
};

export default EditSheet;