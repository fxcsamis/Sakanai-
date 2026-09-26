// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useAppSelector } from '@/hooks/useRedux';
import { defaultAvtar } from '@/utils/constants';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import {
    Bot,
    Clock,
    Cloud,
    History,
    Lock,
    LogIn,
    LogOut,
    Settings as SettingsIcon,
    Share2,
    Star,
    UserPlus,
} from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProfileAnimatedBackground from './ProfileAnimatedBackground';
import ProfileMenuItem from './ProfileMenuItem';
import ProfileStatCard from './ProfileStatCard';

// Simple track+fill progress bar (no need for Reanimated here - these values only
// change on real state updates, not every frame, so a plain style width is cheap).
function ProgressBar({ progress, color, isDark }: { progress: number; color: string; isDark: boolean }) {
    return (
        <View
            style={{ height: 8, borderRadius: 4, overflow: 'hidden' }}
            className="bg-zinc-100 dark:bg-[#282828]"
        >
            <View style={{ width: `${Math.max(0, Math.min(100, progress * 100))}%`, height: '100%', backgroundColor: color, borderRadius: 4 }} />
        </View>
    );
}

export default function Profile() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    // Real account fields (already wired to your Redux store elsewhere in the app)
    const { name, avatar } = useAppSelector((state) => state.userReducer);

    // --- Everything below is demo/placeholder state, matching Cloudihub's own
    // fallback values, until this is wired to a real backend/auth + downloads list ---
    const isSignedIn = false;
    const username = name && name !== 'default' ? `@${name.toLowerCase().replace(/\s+/g, '_')}` : '@alexskyward';
    const email = 'alex.skyward@arise.app';
    const level = 5;
    const xp = 3450;
    const xpTarget = 5000;
    const badgeTitle = 'Sky Voyager';
    const badgeColor = '#0284C7';
    const offlineFilesCount = 0;
    const storagePercent = 24;
    const storageUsedGB = 2.4;
    const storageTotalGB = 10;
    const isVaultSetUp = false;

    const goToComingSoon = (title: string) =>
        router.push({ pathname: '/coming-soon', params: { title } });

    return (
        <View style={{ flex: 1 }}>
            <ProfileAnimatedBackground isDark={isDark} />

            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
                    {/* --- HEADER: avatar + badge + name/username/email + sign-in pill --- */}
                    <View className="items-center px-4 py-4">
                        <Pressable onPress={() => goToComingSoon('Edit Profile')}>
                            <LinearGradient
                                colors={['#0284C7', '#9333EA']}
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

                            {/* Rank badge overlay */}
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
                                    borderColor: badgeColor,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Star size={16} color={badgeColor} fill={badgeColor} />
                            </View>
                        </Pressable>

                        <Text className="text-[22px] font-elms-med text-black dark:text-white mt-3">
                            {name && name !== 'default' ? name : 'Alex Skyward'}
                        </Text>
                        <Text className="text-[13px] text-zinc-500 dark:text-[#B3B3B3] font-elms mt-0.5">
                            {username}
                        </Text>
                        <Text className="text-[12px] text-zinc-400 dark:text-[#7A7A7A] font-elms mt-0.5">
                            {email}
                        </Text>
                    </View>

                    {/* --- RANK / LEVEL CARD --- */}
                    <View className="mx-4 rounded-2xl p-4 border border-zinc-100 dark:border-[#282828] bg-white dark:bg-[#1A1A1A]">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-3 flex-1">
                                <Image
                                    source={{ uri: avatar || defaultAvtar }}
                                    style={{ width: 36, height: 36, borderRadius: 18, opacity: isSignedIn ? 1 : 0.4 }}
                                />
                                <View className="flex-1">
                                    <Text className="text-[15px] font-elms-med text-black dark:text-white" numberOfLines={1}>
                                        {isSignedIn ? `Level ${level} • ${badgeTitle}` : 'Level Locked • Sign In'}
                                    </Text>
                                    <Text className="text-[11.5px] text-zinc-500 dark:text-[#B3B3B3] font-elms" numberOfLines={1}>
                                        {isSignedIn ? `XP Progress: ${xp.toLocaleString()} / ${xpTarget.toLocaleString()} XP` : 'Sign in to earn XP & unlock perks'}
                                    </Text>
                                </View>
                            </View>

                            <Pressable
                                onPress={() => goToComingSoon(isSignedIn ? 'Prime Level & Badges' : 'Sign In')}
                                className="rounded-xl px-2.5 py-1.5"
                                style={{ backgroundColor: isSignedIn ? '#ECFDF5' : (isDark ? '#242424' : '#F1F5F9') }}
                            >
                                <Text
                                    className="text-[11px] font-elms-med"
                                    style={{ color: isSignedIn ? '#059669' : '#64748B' }}
                                >
                                    {isSignedIn ? 'Upgrade ⚡' : 'Sign In 🔒'}
                                </Text>
                            </Pressable>
                        </View>

                        <View className="mt-3.5">
                            <ProgressBar progress={isSignedIn ? xp / xpTarget : 0} color={isSignedIn ? badgeColor : '#94A3B8'} isDark={isDark} />
                        </View>

                        <View className="flex-row items-center justify-between mt-2.5">
                            <Text className="text-[11px] text-zinc-500 dark:text-[#B3B3B3] font-elms-med">
                                {isSignedIn ? 'Next Tier: Level 6 • Diamond Elite' : 'Unlock ranks by signing in'}
                            </Text>
                            <Text
                                className="text-[11px] font-elms-med"
                                style={{ color: isSignedIn ? badgeColor : '#64748B' }}
                            >
                                {isSignedIn ? `${Math.round((xp / xpTarget) * 100)}%` : '0%'}
                            </Text>
                        </View>
                    </View>

                    {/* --- STORAGE QUOTA CARD --- */}
                    <View className="mx-4 mt-4 rounded-2xl p-4 border border-zinc-100 dark:border-[#282828] bg-white dark:bg-[#1A1A1A]">
                        <View className="flex-row items-center justify-between">
                            <View className="flex-row items-center gap-2">
                                <Cloud size={20} color={isDark ? '#38BDF8' : '#0284C7'} />
                                <Text className="text-[14px] font-elms-med text-black dark:text-white">Arise Storage</Text>
                            </View>
                            <View className="rounded-lg px-2 py-1" style={{ backgroundColor: isDark ? '#0C2A3D' : '#F0F9FF' }}>
                                <Text className="text-[11px] font-elms-med" style={{ color: isDark ? '#38BDF8' : '#0284C7' }}>
                                    {storagePercent}% Used
                                </Text>
                            </View>
                        </View>
                        <View className="mt-3">
                            <ProgressBar progress={storagePercent / 100} color={isDark ? '#38BDF8' : '#0284C7'} isDark={isDark} />
                        </View>
                        <View className="flex-row items-center justify-between mt-2">
                            <Text className="text-[12px] text-zinc-500 dark:text-[#B3B3B3] font-elms-med">
                                {storageUsedGB} GB Used
                            </Text>
                            <Text className="text-[12px] text-zinc-400 dark:text-[#7A7A7A] font-elms">
                                {storageTotalGB} GB Total
                            </Text>
                        </View>
                    </View>

                    {/* --- STATS ROW --- */}
                    <View className="flex-row gap-3 px-4 mt-4">
                        <ProfileStatCard
                            title="Offline Files"
                            value={`${offlineFilesCount} files`}
                            Icon={Cloud}
                            isDark={isDark}
                            onPress={() => goToComingSoon('Offline Folders')}
                        />
                        <ProfileStatCard
                            title="Linked Devices"
                            value="3 Active"
                            Icon={Share2}
                            isDark={isDark}
                            onPress={() => goToComingSoon('Linked Devices')}
                        />
                        <ProfileStatCard
                            title="Private Vault"
                            value={isVaultSetUp ? 'Protected' : 'Locked'}
                            Icon={Lock}
                            isDark={isDark}
                            onPress={() => goToComingSoon('Private Vault')}
                        />
                    </View>

                    {/* --- ACCOUNT CARD --- */}
                    <View className="mx-4 mt-5 rounded-2xl border border-zinc-100 dark:border-[#282828] bg-white dark:bg-[#1A1A1A] overflow-hidden">
                        <ProfileMenuItem
                            Icon={isSignedIn ? Star : Lock}
                            iconColor={isSignedIn ? '#D97706' : '#64748B'}
                            title="Prime Level & Badges Shop"
                            subtitle={isSignedIn ? `Active: Level ${level} • Upgrade badges & unlock perks` : '🔒 Locked • Sign in to view level, balance & badges'}
                            isDark={isDark}
                            onPress={() => goToComingSoon('Prime Level & Badges')}
                        />
                        <ProfileMenuItem
                            Icon={Bot}
                            title="AI Copilot & Permissions"
                            subtitle="Disabled • Tap to configure permissions"
                            isDark={isDark}
                            onPress={() => goToComingSoon('AI Copilot & Permissions')}
                        />
                        <ProfileMenuItem
                            Icon={Clock}
                            title="Watch Later"
                            subtitle="0 saved videos queued"
                            isDark={isDark}
                            onPress={() => goToComingSoon('Watch Later')}
                        />
                        <ProfileMenuItem
                            Icon={UserPlus}
                            title="Invite Friend"
                            subtitle="Invite friends & earn free storage"
                            isDark={isDark}
                            onPress={() => goToComingSoon('Invite Friend')}
                        />
                        <ProfileMenuItem
                            Icon={Cloud}
                            iconColor="#0284C7"
                            title="Downloads"
                            subtitle="Manage downloaded videos, music, files & folders"
                            isDark={isDark}
                            isLast
                            onPress={() => router.push('/(tabs)/downloader-hub')}
                        />
                    </View>

                    {/* --- SYSTEM PREFERENCES --- */}
                    <Text className="text-[10px] font-elms-med text-zinc-400 dark:text-[#7A7A7A] tracking-widest px-6 pt-5 pb-1.5">
                        SYSTEM PREFERENCES
                    </Text>
                    <View className="mx-4 rounded-2xl border border-zinc-100 dark:border-[#282828] bg-white dark:bg-[#1A1A1A] overflow-hidden">
                        <ProfileMenuItem
                            Icon={Share2}
                            iconColor="#6366F1"
                            title="Cloud Services Hub"
                            subtitle="Manage your active external cloud portals"
                            isDark={isDark}
                            onPress={() => goToComingSoon('Cloud Services Hub')}
                        />
                        <ProfileMenuItem
                            Icon={History}
                            iconColor="#0284C7"
                            title="Activity Logs History"
                            subtitle="Review recently played tracks & visited pages"
                            isDark={isDark}
                            onPress={() => goToComingSoon('Activity Logs History')}
                        />
                        <ProfileMenuItem
                            Icon={SettingsIcon}
                            iconColor="#EC4899"
                            title="Feedback & Rating"
                            subtitle="Submit star rating & help improve Arise"
                            isDark={isDark}
                            isLast
                            onPress={() => goToComingSoon('Feedback & Rating')}
                        />
                    </View>

                    {/* --- LOGOUT / LOGIN --- */}
                    <Pressable
                        onPress={() => goToComingSoon(isSignedIn ? 'Logout' : 'Log In / Sign Up')}
                        className="flex-row items-center justify-center gap-2 mx-4 mt-6 py-3.5"
                    >
                        {isSignedIn ? <LogOut size={20} color="#EF4444" /> : <LogIn size={20} color="#EF4444" />}
                        <Text className="text-[16px] font-elms-med" style={{ color: '#EF4444' }}>
                            {isSignedIn ? 'Logout' : 'Log In / Sign Up'}
                        </Text>
                    </Pressable>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
