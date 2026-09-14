// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useAppSelector } from '@/hooks/useRedux';
import { useShorts } from '@/hooks/useShorts';
import { AriseTrack } from '@/types/database';
import { defaultAvtar, defaultMusicArtWork } from '@/utils/constants';
import LottieView from 'lottie-react-native';
import { Bookmark, EllipsisVertical, Heart, Plus, Send } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, LayoutAnimation, Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import AddToPlayList from '../common/AddToPlayList';
import { Avatar, AvatarFallbackText, AvatarImage } from '../ui/avatar';

export default function FeedOverLay({ like, onLike, animation, feed, toggleImagePreview, musicId }: { like: boolean, onLike: () => void, animation: boolean, feed: AriseTrack, toggleImagePreview: () => void, musicId: string }) {
    const { isHolding } = useShorts();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showAddToPlayList, setShowAddToPlayList] = useState(false);
    const { name, avatar } = useAppSelector(state => state.userReducer);

    const wrapperStyle = useAnimatedStyle(() => ({ opacity: withTiming(isHolding.value ? 0 : 1, { duration: 200 }) }))

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsExpanded(!isExpanded);
    };

    return (
        <>
            <Animated.View style={wrapperStyle} className='absolute z-10 inset-0 justify-end pb-6 px-4' pointerEvents="box-none">
                <View className='flex-row items-end justify-between w-full' pointerEvents="box-none">

                    <View className='flex-1 mr-6 gap-3' pointerEvents="box-none">

                        <View className='flex-row items-center gap-3'>
                            <Avatar size="md" className="border border-white/20">
                                <AvatarFallbackText>{name}</AvatarFallbackText>
                                <AvatarImage
                                    source={{ uri: avatar || defaultAvtar }}
                                />
                            </Avatar>
                            <Text numberOfLines={1} className='text-[15px] font-bold text-white shadow-md'>
                                @{feed.artist}
                            </Text>
                        </View>

                        <Pressable onPress={toggleExpand} className="active:opacity-80">
                            <Text
                                numberOfLines={isExpanded ? undefined : 2}
                                className='text-white text-[14px] leading-snug shadow-md'
                            >
                                {feed.title}
                            </Text>
                            {!isExpanded && (
                                <Text className="text-white/70 font-bold text-[13px] mt-1">
                                    more
                                </Text>
                            )}
                        </Pressable>
                    </View>

                    <View className='items-center gap-5' pointerEvents="box-none">

                        <View className="items-center gap-1">
                            <Pressable
                                onPress={onLike}
                                className='w-10 h-10 justify-center items-center relative'
                            >
                                {!animation && <Heart
                                    size={32}
                                    color={like ? 'red' : 'white'}
                                    fill={like ? 'red' : 'transparent'}
                                />}

                                {animation && (
                                    <LottieView
                                        source={require('@/assets/json/like.json')}
                                        autoPlay
                                        loop={false}
                                        style={{ width: 85, height: 85, position: 'absolute' }}

                                    />
                                )}
                            </Pressable>
                            <Text className="text-white font-semibold text-xs shadow-md">Like</Text>
                        </View>

                        <View className="items-center gap-1">
                            <Pressable className='w-10 h-10 justify-center items-center' onPress={() => { setShowAddToPlayList(true) }}>
                                <Plus size={30} color={'white'} />
                            </Pressable>
                            <Text className="text-white font-semibold text-xs shadow-md">Playlist</Text>
                        </View>

                        <View className="items-center gap-1">
                            <Pressable className='w-10 h-10 justify-center items-center'>
                                <Send size={30} color={'white'} />
                            </Pressable>
                            <Text className="text-white font-semibold text-xs shadow-md">Share</Text>
                        </View>

                        <View className="items-center gap-1">
                            <Pressable
                                onPress={() => setIsSaved(!isSaved)}
                                className='w-10 h-10 justify-center items-center'
                            >
                                <Bookmark
                                    size={30}
                                    color={'white'}
                                    fill={isSaved ? 'white' : 'transparent'}
                                />
                            </Pressable>
                            <Text className="text-white font-semibold text-xs shadow-md">Save</Text>
                        </View>

                        <View className="items-center gap-1">
                            <Pressable
                                className='w-10 h-10 justify-center items-center'
                            >
                                <EllipsisVertical
                                    size={30}
                                    color={'white'}
                                    fill={isSaved ? 'white' : 'transparent'}
                                />
                            </Pressable>
                        </View>

                        <Pressable onPress={toggleImagePreview} className='justify-center items-center mt-2'>
                            <View className="p-1 bg-white/20 rounded-md">
                                <Image
                                    source={{ uri: feed.artwork || defaultMusicArtWork }}
                                    className='w-10 h-10 rounded-sm'
                                />
                            </View>
                        </Pressable>

                    </View>

                </View>
            </Animated.View>
            <AddToPlayList isVisible={showAddToPlayList} musicId={musicId} onClose={() => { setShowAddToPlayList(false) }} />
        </>
    );
}