// Copyright (c) 2026 Raj
// See LICENSE for details.

import { TAB_BAR_SPACE } from '@/utils/constants';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import {
    Download,
    FileText,
    FolderOpen,
    Headphones,
    PlayCircle,
    Smartphone,
    Trash2,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { FlatList, Pressable, Text, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Same Downloads Hub design as Cloudihub's Browser Download Manager (type-based icon,
// Open/Install action, delete), rebuilt for Arise: real files, read straight from the
// app's actual downloads folder - nothing here is a placeholder list.
const DOWNLOADS_DIR = `${FileSystem.documentDirectory ?? ''}ariseDownloads/`;

type FileEntry = { name: string; uri: string; size: number };

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
}

function fileKind(name: string) {
    const n = name.toLowerCase();
    if (n.endsWith('.apk')) return { label: 'App', Icon: Smartphone, tint: '#16A34A' };
    if (n.endsWith('.mp3') || n.endsWith('.m4a') || n.endsWith('.wav')) return { label: 'Music', Icon: Headphones, tint: '#D97706' };
    if (n.endsWith('.mp4') || n.endsWith('.mkv') || n.endsWith('.mov')) return { label: 'Video', Icon: PlayCircle, tint: '#0284C7' };
    return { label: 'File', Icon: FileText, tint: '#64748B' };
}

export default function DownloaderHub() {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const accent = isDark ? '#E8C468' : '#B8860B';

    const [files, setFiles] = React.useState<FileEntry[] | null>(null);

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
                return { name, uri, size: info.exists ? (info as any).size ?? 0 : 0 };
            })
        );
        setFiles(details);
    }, []);

    React.useEffect(() => {
        load();
    }, [load]);

    const openFile = async (file: FileEntry) => {
        if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(file.uri);
        } else {
            ToastAndroid.show('No app available to open this file', ToastAndroid.SHORT);
        }
    };

    const removeFile = async (file: FileEntry) => {
        await FileSystem.deleteAsync(file.uri, { idempotent: true });
        load();
    };

    const cardBg = isDark ? '#1A1A1A' : '#FFFFFF';
    const cardBorder = isDark ? '#282828' : '#ECE3CE';

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#FAF8F3' }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                {/* Header */}
                <View className="flex-row items-center px-5 pt-3 pb-2">
                    <View
                        className="w-9 h-9 rounded-full items-center justify-center"
                        style={{ backgroundColor: accent + '1F' }}
                    >
                        <Download size={18} color={accent} />
                    </View>
                    <View className="ml-3">
                        <Text className="text-[17px] font-elms-med text-black dark:text-white">Downloads</Text>
                        <Text className="text-[11.5px] font-elms text-zinc-500 dark:text-[#B3B3B3]">
                            {files === null ? 'Reading storage...' : `${files.length} ${files.length === 1 ? 'item' : 'items'} saved`}
                        </Text>
                    </View>
                </View>

                {files !== null && files.length === 0 ? (
                    <View className="flex-1 items-center justify-center px-10">
                        <View
                            className="w-20 h-20 rounded-full items-center justify-center"
                            style={{ backgroundColor: isDark ? '#1E293B' : '#F1EAD8' }}
                        >
                            <FolderOpen size={32} color={accent} />
                        </View>
                        <Text className="text-[15px] font-elms-med text-black dark:text-white mt-4">
                            No downloaded files yet
                        </Text>
                        <Text className="text-[12px] font-elms text-zinc-500 dark:text-[#B3B3B3] mt-1 text-center">
                            Downloaded videos, music, files and apps will show up here.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={files ?? []}
                        keyExtractor={(f) => f.uri}
                        contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: TAB_BAR_SPACE + 12 }}
                        renderItem={({ item }) => {
                            const kind = fileKind(item.name);
                            const isApk = item.name.toLowerCase().endsWith('.apk');
                            return (
                                <View
                                    className="flex-row items-center rounded-2xl px-3.5 py-3 border"
                                    style={{ backgroundColor: cardBg, borderColor: cardBorder }}
                                >
                                    <View
                                        className="w-9 h-9 rounded-xl items-center justify-center"
                                        style={{ backgroundColor: kind.tint + '1F' }}
                                    >
                                        <kind.Icon size={18} color={kind.tint} />
                                    </View>

                                    <View className="flex-1 ml-3">
                                        <Text numberOfLines={1} className="text-[13px] font-elms-med text-black dark:text-white">
                                            {item.name}
                                        </Text>
                                        <Text className="text-[11px] font-elms text-zinc-500 dark:text-[#B3B3B3]">
                                            {kind.label} - {formatSize(item.size)}
                                        </Text>
                                    </View>

                                    <Pressable
                                        onPress={() => openFile(item)}
                                        style={{ backgroundColor: isApk ? '#16A34A' : accent }}
                                        className="rounded-lg px-3 py-1.5 mr-2"
                                    >
                                        <Text className="text-white text-[11px] font-elms-med">
                                            {isApk ? 'Install' : 'Open'}
                                        </Text>
                                    </Pressable>

                                    <Pressable onPress={() => removeFile(item)} hitSlop={8}>
                                        <Trash2 size={16} color="#EF4444" />
                                    </Pressable>
                                </View>
                            );
                        }}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}
