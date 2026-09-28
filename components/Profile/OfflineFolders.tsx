// Copyright (c) 2026 Raj
// See LICENSE for details.

import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import { ArrowLeft, File, FolderOpen, Trash2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Real files, read straight from disk - the folder Arise actually saves downloads
// into (created on first use). No demo entries: an empty folder shows as empty.
const DOWNLOADS_DIR = `${FileSystem.documentDirectory}ariseDownloads/`;

type Entry = { name: string; uri: string; size: number; isDirectory: boolean };

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

export default function OfflineFolders() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [entries, setEntries] = React.useState<Entry[] | null>(null);

    const load = React.useCallback(async () => {
        const dirInfo = await FileSystem.getInfoAsync(DOWNLOADS_DIR);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(DOWNLOADS_DIR, { intermediates: true });
        }
        const names = await FileSystem.readDirectoryAsync(DOWNLOADS_DIR);
        const details = await Promise.all(
            names.map(async (name) => {
                const uri = DOWNLOADS_DIR + name;
                const info = await FileSystem.getInfoAsync(uri, { size: true });
                return { name, uri, size: info.exists ? (info as any).size ?? 0 : 0, isDirectory: info.exists ? info.isDirectory : false };
            })
        );
        setEntries(details);
    }, []);

    React.useEffect(() => {
        load();
    }, [load]);

    const remove = async (uri: string) => {
        await FileSystem.deleteAsync(uri, { idempotent: true });
        load();
    };

    const totalBytes = (entries ?? []).reduce((sum, e) => sum + e.size, 0);
    const rowBorder = isDark ? '#282828' : '#ECE3CE';
    const rowBg = isDark ? '#1A1A1A' : '#F8FAFC';

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#FAF8F3' }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <View className="flex-row items-center px-5 pt-2 pb-1">
                    <Pressable onPress={() => router.back()} hitSlop={10} className="w-9 h-9 items-center justify-center -ml-2">
                        <ArrowLeft size={20} color={isDark ? '#fff' : '#000'} />
                    </Pressable>
                    <Text className="text-[18px] font-elms-med text-black dark:text-white ml-2">Offline Folders</Text>
                </View>
                <Text className="text-[12px] font-elms text-zinc-500 px-5 mb-2">
                    {entries === null ? 'Reading storage...' : `${entries.length} items - ${formatSize(totalBytes)} total`}
                </Text>

                {entries !== null && entries.length === 0 ? (
                    <View className="flex-1 items-center justify-center px-10">
                        <FolderOpen size={36} color={isDark ? '#334155' : '#CBD5E1'} />
                        <Text className="text-[14px] font-elms-med text-black dark:text-white mt-3">This folder is empty</Text>
                        <Text className="text-[12px] font-elms text-zinc-500 mt-1 text-center">
                            Files you download in Arise are saved here.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={entries ?? []}
                        keyExtractor={(e) => e.uri}
                        contentContainerStyle={{ padding: 20, gap: 8 }}
                        renderItem={({ item }) => (
                            <View
                                className="flex-row items-center rounded-xl border px-3.5 py-3"
                                style={{ backgroundColor: rowBg, borderColor: rowBorder }}
                            >
                                {item.isDirectory ? (
                                    <FolderOpen size={18} color="#B8860B" />
                                ) : (
                                    <File size={18} color="#64748B" />
                                )}
                                <View className="flex-1 ml-3">
                                    <Text numberOfLines={1} className="text-[13px] font-elms-med text-black dark:text-white">
                                        {item.name}
                                    </Text>
                                    <Text className="text-[11px] font-elms text-zinc-500">{formatSize(item.size)}</Text>
                                </View>
                                <Pressable onPress={() => remove(item.uri)} hitSlop={8}>
                                    <Trash2 size={17} color="#EF4444" />
                                </Pressable>
                            </View>
                        )}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}
