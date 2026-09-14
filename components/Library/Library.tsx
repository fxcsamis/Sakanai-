// Copyright (c) 2026 Raj
// See LICENSE for details.

import { PlayList } from "@/types/database";
import { FlashList } from "@shopify/flash-list";
import { ArrowUpDown, LayoutGrid, LayoutList, Plus } from "lucide-react-native";
import React from "react";
import { Pressable, Text, View, useColorScheme } from "react-native";
import LibraryCard from "./LibraryCard";

export default function Library({
    onCreateNew,
    playList,
    sort,
    onSort
}: {
    playList: PlayList[];
    onCreateNew: () => void;
    sort: 0 | 1;
    onSort: () => void;
}) {
    const [isList, setIsList] = React.useState(false);
    const toggle = React.useCallback(() => setIsList((prev) => !prev), []);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View className="flex-1 bg-white dark:bg-[#121212]">
            <View className="flex-row justify-between items-center pb-4 px-1">
                <Pressable className="flex-row items-center gap-1.5" hitSlop={8} onPress={onSort}>
                    <ArrowUpDown size={14} color={isDark ? "#B3B3B3" : "#18181B"} strokeWidth={2.5} />
                    <Text className="text-zinc-900 dark:text-[#B3B3B3] text-[13px] font-bold">{sort === 0 ? 'Recent' : 'Oldest'}</Text>
                </Pressable>

                <View className="flex-row gap-4 items-center">
                    <Pressable onPress={onCreateNew} hitSlop={8}>
                        <Plus size={18} color={isDark ? "#FFFFFF" : "#18181B"} />
                    </Pressable>
                    <Pressable onPress={toggle} hitSlop={8}>
                        {isList ? (
                            <LayoutGrid size={18} color={isDark ? "#FFFFFF" : "#18181B"} />
                        ) : (
                            <LayoutList size={18} color={isDark ? "#FFFFFF" : "#18181B"} />
                        )}
                    </Pressable>
                </View>
            </View>

            {playList.length === 0 ? (
                <View className="flex-1 items-center justify-center pb-20 px-4">
                    <Text className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
                        No playlists yet
                    </Text>

                    <Text className="text-sm text-zinc-500 dark:text-[#B3B3B3] text-center mb-8 px-6 leading-5">
                        Create your first playlist to start organizing your favorite tracks
                        and albums.
                    </Text>

                    <Pressable
                        onPress={onCreateNew}
                        className="bg-zinc-900 dark:bg-white px-6 py-3.5 rounded-full flex-row items-center gap-2 active:opacity-80"
                    >
                        <Plus size={18} color={isDark ? "#000000" : "#FFFFFF"} strokeWidth={2.5} />
                        <Text className="text-white dark:text-black font-bold text-[15px]">
                            Create Playlist
                        </Text>
                    </Pressable>
                </View>
            ) : (
                <FlashList
                    key={isList ? "list" : "grid"}
                    data={playList}
                    scrollEnabled={false}
                    numColumns={isList ? 1 : 3}
                    renderItem={({ item }) => (
                        <LibraryCard isGrid={!isList} playList={item} />
                    )}
                    contentContainerStyle={!isList ? { paddingHorizontal: 2 } : undefined}
                />
            )}
        </View>
    );
}