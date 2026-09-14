// Copyright (c) 2026 Raj 
// See LICENSE for detail

import { useMusic } from '@/hooks/useMusic';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue
} from 'react-native-reanimated';



const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
interface Card { label: string, tag: string, color: string[], uri: string, callback: () => void }

function GridCard({ item }: { item: Card }) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <AnimatedTouchable
            className="flex-1"
            style={animatedStyle}
            activeOpacity={1}
            onPress={item.callback}
        >
            <View className="overflow-hidden rounded-2xl aspect-video">
                <Image
                    source={{ uri: item.uri }}
                    className="absolute w-full h-full"
                    resizeMode="cover"
                />

                <LinearGradient
                    colors={[`${item.color[0]}cc`, `${item.color[1]}99`]}
                    className="absolute w-full h-full"
                />

                <LinearGradient
                    colors={['transparent', 'rgba(0,0,0,0.25)']}
                    className="absolute bottom-0 left-0 right-0 h-[60%]"
                />

                <View className="absolute bottom-0 left-0 right-0 p-2.5">
                    <View className="self-start px-2 py-0.5 mb-1 bg-white/20 rounded-full">
                        <Text className="text-[9px] tracking-[0.5px] text-white/90 uppercase">
                            {item.tag}
                        </Text>
                    </View>

                    <Text className="text-[15px] font-bold tracking-[-0.3px] text-white">
                        {item.label}
                    </Text>
                </View>
            </View>
        </AnimatedTouchable>
    );
}

export default function SuggestGrids({ onLiked, onRecent, onSuggested, onTopPick }: { onRecent: () => void, onLiked: () => void, onSuggested: () => void, onTopPick: () => void }) {
    const { likedMusics } = useMusic();

    const cards: Card[] = [
        {
            label: 'Recent',
            tag: 'Updated today',
            color: ['#7c3aed', '#4f46e5'] as const,
            uri: 'https://res.cloudinary.com/dcyn3ewpv/image/upload/v1780851944/images_pqn8kp.jpg',
            callback: onRecent
        },
        {
            label: 'Linked',
            tag: `${likedMusics?.tracks.length ?? 0} tracks`,
            color: ['#059669', '#0d9488'] as const,
            uri: 'https://res.cloudinary.com/dcyn3ewpv/image/upload/v1780851886/g-2_xlzk1i.png',
            callback: onLiked
        },
        {
            label: 'Suggested',
            tag: 'For you',
            color: ['#0369a1', '#0891b2'] as const,
            uri: 'https://res.cloudinary.com/dcyn3ewpv/image/upload/v1780851913/g-3_os9tsx.jpg',
            callback: onSuggested
        },
        {
            label: 'Top Pick',
            tag: '🔥 Trending',
            color: ['#be185d', '#e11d48'] as const,
            uri: 'https://res.cloudinary.com/dcyn3ewpv/image/upload/v1780851856/g4_n0i8ew.jpg',
            callback: onTopPick
        },
    ];


    return (
        <FlatList
            numColumns={2}
            scrollEnabled={false}
            data={cards}
            columnWrapperClassName="gap-2.5"
            contentContainerClassName="gap-2.5"
            keyExtractor={(item) => item.label}
            renderItem={({ item }) => <GridCard item={item} />}
        />
    );
}