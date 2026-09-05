// Copyright (c) 2026 Raj
// See LICENSE for details.

import { Download, MoreVertical, Play } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { DemoVideo } from './demoVideos';

export default function VideoCard({ video, onPress }: { video: DemoVideo; onPress: (video: DemoVideo) => void }) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [isPressed, setIsPressed] = React.useState(false);
    const float = useSharedValue(0);

    React.useEffect(() => {
        float.value = withRepeat(
            withSequence(
                withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
                withTiming(0, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            true
        );
    }, []);

    const floatStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: float.value * -3 },
            { scale: withSpring(isPressed ? 0.97 : 1, { mass: 0.3, damping: 15, stiffness: 220 }) },
        ],
    }));

    const handleMore = () => Alert.alert('More', 'More options coming soon.');
    const handleDownload = () => Alert.alert('Download', 'Downloads will be available soon.');

    return (
        <View className="w-full px-4 mb-6">
            <Animated.View
                style={[
                    floatStyle,
                    {
                        borderRadius: 20,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 8 },
                        shadowOpacity: isDark ? 0.4 : 0.12,
                        shadowRadius: 16,
                        elevation: 6,
                    },
                ]}
            >
                <Pressable
                    onPress={() => onPress(video)}
                    onPressIn={() => setIsPressed(true)}
                    onPressOut={() => setIsPressed(false)}
                    className="rounded-[20px] overflow-hidden bg-white dark:bg-[#181818]"
                >
                    <View className="aspect-video relative">
                        <Image
                            source={{ uri: `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />

                        <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
                            <View className="bg-black/35 rounded-full p-3.5 border border-white/25">
                                <Play color="white" fill="white" size={22} />
                            </View>
                        </View>

                        <View className="absolute bottom-2.5 right-2.5 bg-black/75 px-2 py-1 rounded-md">
                            <Text className="text-[11px] text-white font-elms-med">{video.duration}</Text>
                        </View>
                    </View>

                    <View className="px-4 pt-3 pb-3.5">
                        <Text numberOfLines={2} className="text-[15px] font-elms-med text-gray-900 dark:text-white leading-5">
                            {video.title}
                        </Text>

                        <View className="flex-row items-center justify-between mt-2">
                            <Text numberOfLines={1} className="text-[12px] text-gray-500 dark:text-[#B3B3B3] flex-1 pr-3">
                                {video.channel} · {video.views}
                            </Text>

                            <View className="flex-row items-center gap-4">
                                <Pressable onPress={handleDownload} hitSlop={8}>
                                    <Download size={17} color={isDark ? '#B3B3B3' : '#64748B'} />
                                </Pressable>
                                <Pressable onPress={handleMore} hitSlop={8}>
                                    <MoreVertical size={17} color={isDark ? '#B3B3B3' : '#64748B'} />
                                </Pressable>
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Animated.View>
        </View>
    );
}
