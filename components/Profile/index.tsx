// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useAppSelector } from '@/hooks/useRedux';
import { defaultAvtar } from '@/utils/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Device from 'expo-device';
import * as FileSystem from 'expo-file-system/legacy';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import {
    Bot,
    Cloud,
    Crown,
    Gem,
    HardDrive,
    MessageCircle,
    Settings,
    Smartphone,
    UserPlus,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileAnimatedBackground from './ProfileAnimatedBackground';
import ProfileMenuItem from './ProfileMenuItem';
import ProfileStatCard from './ProfileStatCard';

const ROOT = FileSystem.documentDirectory ?? '';
const DOWNLOADS_DIR = `${ROOT}ariseDownloads/`;
const VAULT_DIR = `${ROOT}ariseVault/`;

function formatBytes(bytes: number) {
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

async function dirStats(dir: string) {
    const info = await FileSystem.getInfoAsync(dir);
    if (!info.exists) return { count: 0, bytes: 0 };
    const names = await FileSystem.readDirectoryAsync(dir);
    let bytes = 0;
    for (const name of names) {
        const item = await FileSystem.getInfoAsync(dir + name, { size: true });
        if (item.exists && !item.isDirectory) bytes += (item as any).size ?? 0;
    }
    return { count: names.length, bytes };
}

function ProgressBar({ progress, color }: { progress: number; color: string }) {
    return (
        <View style={{ height: 8, borderRadius: 4, overflow: 'hidden' }} className="bg-[#F1EAD8] dark:bg-[#282828]">
            <View style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%`, height: '100%', backgroundColor: color, borderRadius: 4 }} />
        </View>
    );
}

// Every value on this screen is read from the phone or the app's own storage:
// device disk space, the app's real downloads/vault folders, the real vault PIN
// state and the real device model. Nothing here is a placeholder.
export default function Profile() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const accent = isDark ? '#E8C468' : '#B8860B';

    const { name, avatar } = useAppSelector((state) => state.userReducer);
    const displayName = name && name !== 'default' ? name : 'Arise';

    const [disk, setDisk] = React.useState<{ free: number; total: number } | null>(null);
    const [ariseBytes, setAriseBytes] = React.useState(0);
    const [offlineCount, setOfflineCount] = React.useState(0);
    const [vaultReady, setVaultReady] = React.useState(false);

    useFocusEffect(
        React.useCallback(() => {
            let alive = true;
            (async () => {
                const [free, total, downloads, vault, pin] = await Promise.all([
                    FileSystem.getFreeDiskStorageAsync(),
                    FileSystem.getTotalDiskCapacityAsync(),
                    dirStats(DOWNLOADS_DIR),
                    dirStats(VAULT_DIR),
                    AsyncStorage.getItem('arise_vault_pin_hash'),
                ]);
                if (!alive) return;
                setDisk({ free, total });
                setAriseBytes(downloads.bytes + vault.bytes);
                setOfflineCount(downloads.count);
                setVaultReady(!!pin);
            })();
            return () => {
                alive = false;
            };
        }, [])
    );

    const cardShadow = {
        shadowColor: '#B8860B',
        shadowOpacity: isDark ? 0 : 0.1,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 5 },
        elevation: isDark ? 0 : 3,
    } as const;

    const usedFraction = disk ? (disk.total - disk.free) / disk.total : 0;

    return (
        <View style={{ flex: 1 }}>
            <ProfileAnimatedBackground isDark={isDark} />

            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                    {/* --- HEADER --- */}
                    <View className="items-center px-4 py-4">
                        <Pressable onPress={() => router.push('/setting')}>
                            <LinearGradient
                                colors={['#E8C468', '#B8860B']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={{ width: 112, height: 112, borderRadius: 56, padding: 3 }}
                            >
                                <View style={{ flex: 1, borderRadius: 53, backgroundColor: '#fff', padding: 4 }}>
                                    <Image
                                        source={{ uri: avatar || defaultAvtar }}
                                        style={{ flex: 1, borderRadius: 50 }}
                                        resizeMode="cover"
                                    />
                                </View>
                            </LinearGradient>
                            <View
                                style={{
                                    position: 'absolute',
                                    bottom: 2,
                                    right: 2,
                                    width: 34,
                                    height: 34,
                                    borderRadius: 17,
                                    backgroundColor: '#fff',
                                    borderWidth: 1.5,
                                    borderColor: '#B8860B',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Crown size={16} color="#B8860B" fill="#B8860B" />
                            </View>
                        </Pressable>

                        <Text className="text-[22px] font-elms-med text-black dark:text-white mt-3">{displayName}</Text>
                        <Text className="text-[12px] text-zinc-400 dark:text-[#7A7A7A] font-elms mt-0.5">
                            Tap the photo to edit your profile
                        </Text>
                    </View>

                    {/* --- DEVICE STORAGE (live from the OS) --- */}
                    <View
                        className="mx-4 rounded-2xl p-4 border border-[#ECE3CE] dark:border-[#282828] bg-[#FFFFFF] dark:bg-[#1A1A1A]"
                        style={cardShadow}
                    >
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-2">
                                <HardDrive size={20} color={accent} />
                                <Text className="text-[14px] font-elms-med text-black dark:text-white">Device Storage</Text>
                            </View>
                            {disk && (
                                <View className="rounded-lg px-2 py-1" style={{ backgroundColor: accent + '1F' }}>
                                    <Text className="text-[11px] font-elms-med" style={{ color: accent }}>
                                        {Math.round(usedFraction * 100)}% used
                                    </Text>
                                </View>
                            )}
                        </View>
                        <View className="mt-3">
                            <ProgressBar progress={usedFraction} color={accent} />
                        </View>
                        <View className="flex-row items-center justify-between mt-2">
                            <Text className="text-[12px] text-zinc-500 dark:text-[#B3B3B3] font-elms-med">
                                {disk ? `${formatBytes(disk.total - disk.free)} used` : 'Reading storage...'}
                            </Text>
                            <Text className="text-[12px] text-zinc-400 dark:text-[#7A7A7A] font-elms">
                                {disk ? `${formatBytes(disk.free)} free of ${formatBytes(disk.total)}` : ''}
                            </Text>
                        </View>
                        <Text className="text-[11.5px] text-zinc-500 dark:text-[#B3B3B3] font-elms mt-2">
                            Arise is using {formatBytes(ariseBytes)} (downloads + vault)
                        </Text>
                    </View>

                    {/* --- STATS ROW --- */}
                    <View className="flex-row gap-3 px-4 mt-4">
                        <ProfileStatCard
                            title="Offline Files"
                            value={`${offlineCount} ${offlineCount === 1 ? 'item' : 'items'}`}
                            Icon={Cloud}
                            isDark={isDark}
                            onPress={() => router.push('/offline-folders')}
                        />
                        <ProfileStatCard
                            title="This Device"
                            value={Device.modelName ?? 'View info'}
                            Icon={Smartphone}
                            isDark={isDark}
                            onPress={() => router.push('/this-device')}
                        />
                        <ProfileStatCard
                            title="Private Vault"
                            value={vaultReady ? 'Protected' : 'Not set up'}
                            Icon={Gem}
                            isDark={isDark}
                            onPress={() => router.push('/private-vault')}
                        />
                    </View>

                    {/* --- ACCOUNT --- */}
                    <View
                        className="mx-4 mt-5 rounded-2xl border border-[#ECE3CE] dark:border-[#282828] bg-[#FFFFFF] dark:bg-[#1A1A1A] overflow-hidden"
                        style={cardShadow}
                    >
                        <ProfileMenuItem
                            Icon={Settings}
                            title="Account & Settings"
                            subtitle="Edit your name, photo and app preferences"
                            isDark={isDark}
                            onPress={() => router.push('/setting')}
                        />
                        <ProfileMenuItem
                            Icon={Bot}
                            title="App Permissions"
                            subtitle="See and change what Arise can access"
                            isDark={isDark}
                            onPress={() => router.push('/ai-permissions')}
                        />
                        <ProfileMenuItem
                            Icon={UserPlus}
                            title="Invite Friend"
                            subtitle="Share your invite code and link"
                            isDark={isDark}
                            isLast
                            onPress={() => router.push('/invite-friend')}
                        />
                    </View>

                    {/* --- SUPPORT --- */}
                    <Text className="text-[10px] font-elms-med text-zinc-400 dark:text-[#7A7A7A] tracking-widest px-6 pt-5 pb-1.5">
                        SUPPORT
                    </Text>
                    <View
                        className="mx-4 rounded-2xl border border-[#ECE3CE] dark:border-[#282828] bg-[#FFFFFF] dark:bg-[#1A1A1A] overflow-hidden"
                        style={cardShadow}
                    >
                        <ProfileMenuItem
                            Icon={MessageCircle}
                            title="Send Feedback"
                            subtitle="Rate Arise and tell us what to improve"
                            isDark={isDark}
                            isLast
                            onPress={() => router.push('/submit-feedback')}
                        />
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
