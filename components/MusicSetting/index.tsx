// Copyright (c) 2026 Raj
// See LICENSE for details.

import { TAB_BAR_SPACE } from '@/utils/constants';
import { useRouter } from 'expo-router';
import { ArrowLeft, Music2, Palette, PlayCircle, Video } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '../common/FocusAwareStatusBar';

export default function MusicSettingScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [playerStyle, setPlayerStyle] = React.useState<'classic' | 'gesture'>('classic');
    const [ambientBackground, setAmbientBackground] = React.useState(false);
    const [contentMode, setContentMode] = React.useState<'music' | 'video'>('music');

    return (
        <View className="flex-1 bg-white dark:bg-[#121212]">
            <FocusAwareStatusBar style="auto" />

            <SafeAreaView edges={['top']}>
                <View className="flex-row items-center gap-3 px-5 pt-2 pb-4">
                    <Pressable onPress={() => router.back()} hitSlop={10} className="bg-slate-50 dark:bg-[#181818] p-2 rounded-full">
                        <ArrowLeft size={20} color={isDark ? 'white' : 'black'} />
                    </Pressable>
                    <Text className="text-2xl font-elms-med text-gray-900 dark:text-white">
                        Music Setting
                    </Text>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: TAB_BAR_SPACE + 12 }}>
                <Text className="text-xs font-bold text-slate-400 dark:text-[#A1A1AA] uppercase tracking-wider mb-2">
                    Appearance
                </Text>
                <View className="bg-white dark:bg-[#181818] rounded-xl border border-slate-100 dark:border-transparent mb-6 p-4">
                    <View className="flex-row items-center gap-3">
                        <View className="bg-orange-50 dark:bg-orange-500/10 p-2 rounded-lg">
                            <Palette size={18} color="#FF6F4E" />
                        </View>
                        <View className="flex-1">
                            <Text className="text-base font-semibold text-slate-700 dark:text-white">Ambient Background</Text>
                            <Text className="text-xs text-slate-400 dark:text-[#A1A1AA] mt-0.5">Solid background</Text>
                        </View>
                        <Switch value={ambientBackground} onValueChange={setAmbientBackground} />
                    </View>
                </View>

                <Text className="text-xs font-bold text-slate-400 dark:text-[#A1A1AA] uppercase tracking-wider mb-2">
                    Player UI
                </Text>
                <View className="bg-white dark:bg-[#181818] rounded-xl border border-slate-100 dark:border-transparent mb-6 p-4">
                    <View className="flex-row items-center gap-3 mb-3">
                        <View className="bg-orange-50 dark:bg-orange-500/10 p-2 rounded-lg">
                            <PlayCircle size={18} color="#FF6F4E" />
                        </View>
                        <View>
                            <Text className="text-base font-semibold text-slate-700 dark:text-white">Player Style</Text>
                            <Text className="text-xs text-slate-400 dark:text-[#A1A1AA] mt-0.5">Button controls for playback</Text>
                        </View>
                    </View>

                    <View className="flex-row bg-slate-50 dark:bg-[#242424] rounded-full p-1">
                        <Pressable
                            onPress={() => setPlayerStyle('classic')}
                            className={`flex-1 items-center py-2 rounded-full ${playerStyle === 'classic' ? 'bg-orange-100 dark:bg-orange-500/20' : ''}`}
                        >
                            <Text className={`text-[13px] font-semibold ${playerStyle === 'classic' ? 'text-orange-600' : 'text-slate-500 dark:text-[#B3B3B3]'}`}>
                                Classic
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setPlayerStyle('gesture')}
                            className={`flex-1 items-center py-2 rounded-full ${playerStyle === 'gesture' ? 'bg-orange-100 dark:bg-orange-500/20' : ''}`}
                        >
                            <Text className={`text-[13px] font-semibold ${playerStyle === 'gesture' ? 'text-orange-600' : 'text-slate-500 dark:text-[#B3B3B3]'}`}>
                                Gesture
                            </Text>
                        </Pressable>
                    </View>
                </View>

                <Text className="text-xs font-bold text-slate-400 dark:text-[#A1A1AA] uppercase tracking-wider mb-2">
                    Content Mode
                </Text>
                <View className="bg-white dark:bg-[#181818] rounded-xl border border-slate-100 dark:border-transparent mb-6 p-4">
                    <View className="flex-row items-center gap-3 mb-3">
                        <View className="bg-orange-50 dark:bg-orange-500/10 p-2 rounded-lg">
                            <Music2 size={18} color="#FF6F4E" />
                        </View>
                        <Text className="text-base font-semibold text-slate-700 dark:text-white">
                            {contentMode === 'music' ? 'Showing music content' : 'Showing video content'}
                        </Text>
                    </View>

                    <View className="flex-row bg-slate-50 dark:bg-[#242424] rounded-full p-1">
                        <Pressable
                            onPress={() => setContentMode('music')}
                            className={`flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-full ${contentMode === 'music' ? 'bg-orange-100 dark:bg-orange-500/20' : ''}`}
                        >
                            <Music2 size={14} color={contentMode === 'music' ? '#FF6F4E' : '#94A3B8'} />
                            <Text className={`text-[13px] font-semibold ${contentMode === 'music' ? 'text-orange-600' : 'text-slate-500 dark:text-[#B3B3B3]'}`}>
                                Music
                            </Text>
                        </Pressable>
                        <Pressable
                            onPress={() => setContentMode('video')}
                            className={`flex-1 flex-row items-center justify-center gap-1.5 py-2 rounded-full ${contentMode === 'video' ? 'bg-orange-100 dark:bg-orange-500/20' : ''}`}
                        >
                            <Video size={14} color={contentMode === 'video' ? '#FF6F4E' : '#94A3B8'} />
                            <Text className={`text-[13px] font-semibold ${contentMode === 'video' ? 'text-orange-600' : 'text-slate-500 dark:text-[#B3B3B3]'}`}>
                                Video
                            </Text>
                        </Pressable>
                    </View>
                </View>

                <Text className="text-xs text-slate-400 dark:text-[#A1A1AA] px-1">
                    Light/Dark theme is controlled from the Arise menu, not here.
                </Text>
            </ScrollView>
        </View>
    );
}
