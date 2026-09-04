// Copyright (c) 2026 Raj
// See LICENSE for details.

import { LinearGradient } from 'expo-linear-gradient';
import { Play } from 'lucide-react-native';
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
    const [isPressed, setIsPressed] = React.useState(false);
    const glow = useSharedValue(0.4);

    React.useEffect(() => {
        glow.value = withRepeat(
            withSequence(
                withTiming(0.9, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
                withTiming(0.4, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            true
        );
    }, []);

    const cardStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: withSpring(isPressed ? 0.97 : 1, { mass: 0.3, damping: 15, stiffness: 220 }) },
        ],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glow.value,
    }));

    return (
        <View className="w-full px-4 mb-6">
            <Animated.View style={cardStyle}>
                {/* premium ambient glow behind the card */}
                <Animated.View
                    style={[
                        glowStyle,
                        {
                            position: 'absolute',
                            top: 6,
                            left: 6,
                            right: 6,
                            bottom: -2,
                            borderRadius: 28,
                            backgroundColor: '#6C5CE7',
                        },
                    ]}
                />

                <Pressable
                    onPress={() => onPress(video)}
                    onPressIn={() => setIsPressed(true)}
                    onPressOut={() => setIsPressed(false)}
                    style={{
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 10 },
                        shadowOpacity: 0.25,
                        shadowRadius: 18,
                        elevation: 10,
                    }}
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
