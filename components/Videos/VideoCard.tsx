// Copyright (c) 2026 Raj
// See LICENSE for details.

import { LinearGradient } from 'expo-linear-gradient';
import { Play } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { DemoVideo } from './demoVideos';

export default function VideoCard({ video, onPress }: { video: DemoVideo; onPress: (video: DemoVideo) => void }) {
    const pressed = React.useRef(false);
    const [isPressed, setIsPressed] = React.useState(false);

    const cardStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: withSpring(isPressed ? 0.96 : 1, { mass: 0.3, damping: 15, stiffness: 220 }) },
        ],
    }));

    return (
        <Animated.View style={cardStyle} className="w-1/2 px-1.5 mb-4">
            <Pressable
                onPress={() => onPress(video)}
                onPressIn={() => setIsPressed(true)}
                onPressOut={() => setIsPressed(false)}
            >
                <View className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-[#181818] aspect-video relative">
                    <Image
                        source={{ uri: `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />

                    <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.55)']}
                        style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '55%' }}
                        pointerEvents="none"
                    />

                    <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
                        <View className="bg-black/45 rounded-full p-2.5">
                            <Play color="white" fill="white" size={16} />
                        </View>
                    </View>

                    <View className="absolute bottom-1.5 right-1.5 bg-black/70 px-1.5 py-0.5 rounded-md">
                        <Text className="text-[10px] text-white font-elms-med">{video.duration}</Text>
                    </View>
                </View>

                <Text numberOfLines={2} className="text-[13px] font-elms-med text-gray-900 dark:text-white mt-2 leading-4">
                    {video.title}
                </Text>
                <Text numberOfLines={1} className="text-[11px] text-gray-500 dark:text-[#B3B3B3] mt-0.5">
                    {video.channel} · {video.views}
                </Text>
            </Pressable>
        </Animated.View>
    );
}
