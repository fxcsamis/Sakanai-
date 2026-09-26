// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Construction } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// One shared placeholder for every Profile sub-screen that isn't built yet
// (Private Vault, Offline Folders, Watch Later, AI Copilot, Invite Friend,
// Cloud Services Hub, Activity History, Feedback, Prime Badges, Linked Devices,
// Edit Profile, Sign In). Each gets built out as its own screen later.
export default function ComingSoon() {
    const router = useRouter();
    const { title } = useLocalSearchParams<{ title?: string }>();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#FFFFFF' }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <View className="flex-row items-center gap-3 px-5 pt-2 pb-4">
                    <Pressable onPress={() => router.back()} hitSlop={10}>
                        <ArrowLeft size={22} color={isDark ? '#fff' : '#000'} />
                    </Pressable>
                    <Text className="text-[18px] font-elms-med text-black dark:text-white" numberOfLines={1}>
                        {title ?? 'Coming Soon'}
                    </Text>
                </View>

                <View className="flex-1 items-center justify-center px-10">
                    <Construction size={40} color={isDark ? '#B3B3B3' : '#94A3B8'} />
                    <Text className="text-[15px] font-elms-med text-black dark:text-white mt-4 text-center">
                        {title ?? 'This screen'} is coming soon
                    </Text>
                    <Text className="text-[12.5px] text-zinc-500 dark:text-[#B3B3B3] font-elms mt-1.5 text-center">
                        This part of the profile hasn't been built out yet.
                    </Text>
                </View>
            </SafeAreaView>
        </View>
    );
}
