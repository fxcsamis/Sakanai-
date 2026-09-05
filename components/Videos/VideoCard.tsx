// Copyright (c) 2026 Raj
// See LICENSE for details.

import { LinearGradient } from 'expo-linear-gradient';
import { Play } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
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

    // Native elevation shadows barely show up on a near-black background,
    // so the floating effect is faked with soft layered halos instead.
    const haloColorOuter = isDark ? 'rgba(255,255,255,0.045)' : 'rgba(15,23,42,0.10)';
    const haloColorInner = isDark ? 'rgba(255,255,255,0.075)' : 'rgba(15,23,42,0.16)';

    return (
        <View className="w-full px-4 mb-8">
            <Animated.View style={floatStyle}>
                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        top: 14,
                        left: 4,
                        right: 4,
                        bottom: -8,
                        borderRadius: 32,
                        backgroundColor: haloColorOuter,
                    }}
                />
                <View
                    pointerEvents="none"
                    style={{
                        position: 'absolute',
                        top: 18,
                        left: 12,
                        right: 12,
                        bottom: -3,
                        borderRadius: 28,
                        backgroundColor: haloColorInner,
                    }}
                />

                <Pressable
                    onPress={() => onPress(video)}
                    onPressIn={() => setIsPressed(true)}
                    onPressOut={() => setIsPressed(false)}
                >
                    <View className="rounded-3xl overflow-hidden bg-gray-100 dark:bg-[#181818] aspect-video relative border border-black/5 dark:border-white/10">
                        <Image
                            source={{ uri: `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />

                        <LinearGradient
                            colors={['transparent', 'rgba(0,0,0,0.7)']}
                            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%' }}
                            pointerEvents="none"
                        />

                        <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
                            <View className="bg-black/40 rounded-full p-4 border border-white/20">
                                <Play color="white" fill="white" size={26} />
                            </View>
                        </View>

                        <View className="absolute bottom-2.5 right-2.5 bg-black/70 px-2 py-1 rounded-md">
                            <Text className="text-[11px] text-white font-elms-med">{video.duration}</Text>
                        </View>

                        <View className="absolute bottom-2.5 left-2.5 right-16">
                            <Text numberOfLines={1} className="text-[15px] font-elms-med text-white leading-5">
                                {video.title}
                            </Text>
                        </View>
                    </View>
                </Pressable>

                <Text numberOfLines={1} className="text-[12px] text-gray-500 dark:text-[#B3B3B3] mt-2 ml-1">
                    {video.channel} · {video.views}
                </Text>
            </Animated.View>
        </View>
    );
}
