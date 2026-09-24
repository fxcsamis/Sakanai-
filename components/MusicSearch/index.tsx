// Copyright (c) 2026 Raj
// See LICENSE for details.

import { TAB_BAR_SPACE } from '@/utils/constants';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mic, Search as SearchIcon, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '../common/FocusAwareStatusBar';

const CREAM = '#FFFFFF';
const MAROON = '#7A3B2E';

export default function MusicSearchScreen() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [query, setQuery] = React.useState('');

    const scale = useSharedValue(0.85);
    const opacity = useSharedValue(0);

    React.useEffect(() => {
        opacity.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.ease) });
        scale.value = withSpring(1, { mass: 0.4, damping: 9, stiffness: 160 });
    }, []);

    const bounceStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [{ scale: scale.value }],
    }));

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : CREAM }}>
            <FocusAwareStatusBar style="auto" />

            <SafeAreaView edges={['top']}>
                <Animated.View style={[bounceStyle, { paddingHorizontal: 20, paddingTop: 8 }]}>
                    <View className="flex-row items-center gap-3 mb-4">
                        <Pressable onPress={() => router.back()} hitSlop={10}>
                            <ArrowLeft size={22} color={isDark ? '#F3D9CC' : MAROON} />
                        </Pressable>
                        <Text style={{ color: isDark ? '#F3D9CC' : MAROON }} className="text-3xl font-elms-med">
                            Search
                        </Text>
                    </View>

                    <View
                        className="flex-row items-center rounded-full px-4 h-12"
                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(122,59,46,0.08)' }}
                    >
                        <SearchIcon size={17} color={isDark ? '#F3D9CC' : MAROON} />
                        <TextInput
                            autoFocus
                            value={query}
                            onChangeText={setQuery}
                            placeholder="Search songs, artists, albums..."
                            placeholderTextColor={isDark ? '#F3D9CC99' : '#7A3B2E99'}
                            style={{ color: isDark ? '#F3D9CC' : MAROON }}
                            className="flex-1 ml-2 text-[15px]"
                        />
                        {query.length > 0 && (
                            <Pressable onPress={() => setQuery('')} hitSlop={8}>
                                <X size={16} color={isDark ? '#F3D9CC' : MAROON} />
                            </Pressable>
                        )}
                        <Pressable hitSlop={8} className="ml-2">
                            <Mic size={17} color={isDark ? '#F3D9CC' : MAROON} />
                        </Pressable>
                    </View>
                </Animated.View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: TAB_BAR_SPACE + 12 }}>
                <Text style={{ color: isDark ? '#F3D9CC99' : '#7A3B2E99' }} className="text-[14px]">
                    {query.trim().length > 0
                        ? `No local results for "${query}" yet.`
                        : 'Start typing to search your music library.'}
                </Text>
            </ScrollView>
        </View>
    );
}
