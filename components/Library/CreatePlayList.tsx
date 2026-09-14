// Copyright (c) 2026 Raj
// See LICENSE for details.

import { createPlayList } from "@/service/playlistdb";
import { defaultPlayListCover } from "@/utils/constants";
import * as ImagePicker from "expo-image-picker";
import { useSQLiteContext } from "expo-sqlite";
import React from "react";
import { Image, Text, TextInput, TouchableOpacity, View, useColorScheme } from "react-native";
import CustomModal from "../ui/model";

interface CreatePlayListProps {
    isVisible: boolean;
    onClose: () => void;
    onRefresh: () => Promise<void>;
}

function CreatePlayList({ isVisible, onClose, onRefresh }: CreatePlayListProps) {
    const db = useSQLiteContext();
    const [customeImage, setCustomeImage] = React.useState<string | null>(null);
    const [title, setTitle] = React.useState("");
    const [description, setDescription] = React.useState("");
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleImagePicker = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                allowsEditing: true,
                mediaTypes: ["images"],
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setCustomeImage(result.assets[0].uri);
            }
        } catch (error) {
            console.log("Error picking documents:", error);
        }
    };

    const handleCreatePlayList = async () => {
        await createPlayList({ db, title, description, cover: customeImage });
        await onRefresh();
        onClose();

        setTitle('');
        setDescription('');
        setCustomeImage(null);
    };

    return (
        <CustomModal isVisible={isVisible} onClose={onClose} position="bottom">
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-5">New Playlist</Text>

            <View className="flex-row items-center gap-4 mb-4">
                <TouchableOpacity
                    activeOpacity={0.8}
                    className="relative w-28 h-28 rounded-2xl shadow-sm overflow-hidden bg-slate-200 dark:bg-[#282828] items-center justify-center"
                    onPress={handleImagePicker}
                >
                    <Image
                        source={{ uri: customeImage || defaultPlayListCover }}
                        className="absolute w-full h-full"
                        resizeMode="cover"
                    />
                </TouchableOpacity>

                <View className="flex-1 h-28 justify-center">
                    <Text className="text-[10px] font-bold text-slate-400 dark:text-[#B3B3B3] uppercase mb-1 ml-1 tracking-wider">
                        Title
                    </Text>
                    <TextInput
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Playlist name"
                        placeholderTextColor={isDark ? "#B3B3B3" : "#94a3b8"}
                        className="bg-slate-100 dark:bg-[#181818] px-4 py-3 rounded-xl text-base font-medium text-slate-900 dark:text-white"
                    />
                </View>
            </View>

            <View className="mb-6">
                <Text className="text-[10px] font-bold text-slate-400 dark:text-[#B3B3B3] uppercase mb-1 ml-1 tracking-wider">
                    Description
                </Text>
                <TextInput
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Optional description"
                    placeholderTextColor={isDark ? "#B3B3B3" : "#94a3b8"}
                    multiline
                    numberOfLines={2}
                    textAlignVertical="top"
                    className="bg-slate-100 dark:bg-[#181818] px-4 py-3 h-20 rounded-xl text-base font-medium text-slate-900 dark:text-white"
                />
            </View>

            <View className="flex-row gap-3">
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={onClose}
                    className="flex-1 bg-slate-100 dark:bg-[#282828] py-3.5 rounded-xl items-center"
                >
                    <Text className="text-slate-700 dark:text-white text-base font-bold">Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={handleCreatePlayList}
                    className="flex-1 bg-slate-900 dark:bg-white py-3.5 rounded-xl items-center shadow-sm"
                >
                    <Text className="text-white dark:text-[#121212] text-base font-bold">Create</Text>
                </TouchableOpacity>
            </View>
        </CustomModal>
    );
}

export default CreatePlayList;