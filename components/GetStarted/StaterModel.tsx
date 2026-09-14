// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useAppDispatch } from '@/hooks/useRedux';
import { saveMedia } from '@/service/persistMedia';
import { setAvatar, setName } from '@/store/reducer/userSlice';
import { defaultAvtar } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CustomModal from '../ui/model';

const StarterModal = ({ open = true, onClose, handleContinue }: { open: boolean, onClose: () => void, handleContinue: (name: string) => void }) => {
    const [avatar, setAvatarLocal] = useState<string | null>(null);
    const [name, setNameLocal] = useState<string>('');
    const dispatch = useAppDispatch();

    const handleSave = async () => {
        let media = defaultAvtar;
        if (avatar) media = await saveMedia(avatar, 'image', 'user');
        dispatch(setAvatar(media));
        dispatch(setName(name));

        await AsyncStorage.setItem('user', JSON.stringify({ avatar: media, name }))
        handleContinue(name);
    }

    const handleImagePicker = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                mediaTypes: ['images'],
                quality: 1
            });

            if (result.canceled || !result.assets || result.assets.length === 0) return;
            const pickedFile = result.assets[0];
            setAvatarLocal(pickedFile.uri);
        } catch (error) {
            console.log("Error picking documents:", error);
        }
    };

    return (
        <CustomModal isVisible={open} onClose={onClose} position='bottom'>
            <View className="px-2 py-4 items-center">

                <Text className="text-2xl font-bold text-slate-900 mb-2">
                    Welcome to Music
                </Text>
                <Text className="text-sm text-slate-500 mb-8 text-center">
                    Let's set up your profile to get started.
                </Text>

                <TouchableOpacity
                    activeOpacity={0.8}
                    className="relative mb-8 shadow-sm"
                    onPress={handleImagePicker}
                >
                    <Image
                        source={{ uri: avatar || defaultAvtar }}
                        className="w-28 h-28 rounded-full border-4 border-white bg-slate-100"
                        resizeMode="cover"
                    />
                    <View className="absolute bottom-0 right-0 bg-slate-900 w-8 h-8 rounded-full items-center justify-center border-2 border-white shadow-md">
                        <Camera size={14} color="#ffffff" />
                    </View>
                </TouchableOpacity>

                <View className="w-full gap-2 mb-6">
                    <Text className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">
                        How should we call you?
                    </Text>
                    <TextInput
                        value={name}
                        onChangeText={setNameLocal}
                        placeholder="e.g. Raj"
                        placeholderTextColor="#94a3b8"
                        className="w-full bg-slate-50 border border-slate-200 px-5 py-4 rounded-2xl text-base text-slate-900 font-medium"
                    />
                </View>

                <Text className="text-xs text-slate-400 text-center px-4 leading-relaxed mt-2 mb-6">
                    By continuing, you agree to our <Text className="text-slate-600 font-bold">Terms of Service</Text> and <Text className="text-slate-600 font-bold">Privacy Policy</Text>.
                </Text>

                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={handleSave}
                    className="w-full bg-black py-4 rounded-2xl items-center shadow-md mt-auto"
                >
                    <Text className="text-white text-lg font-bold tracking-wide">
                        Continue
                    </Text>
                </TouchableOpacity>

            </View>
        </CustomModal>
    );
};

export default StarterModal;