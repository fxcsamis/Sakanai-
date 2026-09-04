// Copyright (c) 2026 Raj
// See LICENSE for detail

import { useMusic } from '@/hooks/useMusic';
import { useShorts } from '@/hooks/useShorts';
import { useTrack } from '@/hooks/useTrack';
import { likeMusic } from '@/service/database';
import { AriseTrack } from '@/types/database';
import { defaultMusicArtWork } from '@/utils/constants';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSQLiteContext } from 'expo-sqlite';
import { useVideoPlayer, VideoView } from 'expo-video';
import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useProgress } from 'react-native-track-player';
import FeedOverLay from './FeedOverLay';

const SLIDER_HEIGHT = 3;
const SLIDER_HEIGHT_ACTIVE = 6;

const HIT_SLOP = 20;
const DOUBLE_TAP_DELAY = 300;

function FeedItem({ containerHeight, isActive, feed }: { containerHeight: number; isActive: boolean, feed: AriseTrack }) {
    const db = useSQLiteContext();
    const { isHolding, handleHolding } = useShorts();
    const [showImage, setShowImage] = React.useState<boolean>(!feed?.customVideoUri);
    const { position, duration } = useProgress(250);
    const { play, pause, seekTo, setTrackVolume } = useTrack();
    const { setLike } = useMusic();

    const videoPlayer = useVideoPlayer(feed.customVideoUri ?? null, (p) => {
        p.loop = true;
        p.muted = true;
    });

    const seekToPosition = (pixelX: number) => {
        if (duration <= 0) return;
        const ratio = Math.max(0, Math.min(1, pixelX / sliderWidth.value));
        const seconds = ratio * duration;
        seekTo(seconds);
    };

    const handleShowImage = React.useCallback(() => {
        if (!feed.customVideoUri) return;
        setShowImage(prev => !prev);
    }, [feed]);

    // like
    const [isLiked, setIsLiked] = React.useState(feed.isLiked === 1);
    const tapTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const likeAnimationTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    const [showLikeAnimation, setShowLikeAnimation] = React.useState<boolean>(false);

    const toggleLike = async () => {
        if (!feed.musicId) return;
        const likeState = isLiked ? 0 : 1;
        const response = await likeMusic(db, feed.musicId, likeState);
        if (response) {
            setIsLiked(prev => !prev);
            setLike(feed.musicId, likeState);
        }
    };

    const handleLike = async () => {
        if (!feed.musicId) return;
        const response = await likeMusic(db, feed.musicId, 1);
        if (response) {
            setIsLiked(true);
            setLike(feed.musicId, 1)
        }
    };

    // slider properties
    const sliderWidth = useSharedValue(0);
    const progressX = useSharedValue(0);
    const isDragging = useSharedValue(false);
    const startX = useSharedValue(0);

    const [isMuted, setIsMuted] = React.useState(false);

    React.useEffect(() => {
        if (!isDragging.value && duration > 0) {
            progressX.value = withTiming((position / duration) * sliderWidth.value, { duration: 200 });
        }
    }, [position, duration]);

    React.useEffect(() => {
        if (!videoPlayer) return;
        if (isActive) videoPlayer.play();
        else videoPlayer.pause();
    }, [isActive, videoPlayer]);

    const resumePlay = React.useCallback(() => {
        if (videoPlayer) videoPlayer.play();
        play();
    }, [videoPlayer, play]);

    const pausePlay = React.useCallback(() => {
        if (videoPlayer) videoPlayer.pause();
        pause();
    }, [videoPlayer, pause]);

    //#region slider gesture animation
    const panGesture = Gesture.Pan()
        .hitSlop({ top: HIT_SLOP, bottom: HIT_SLOP })
        .minDistance(0)
        .onBegin((e) => {
            isDragging.value = true;
            startX.value = progressX.value;
            const clamped = Math.max(0, Math.min(sliderWidth.value, e.x));
            progressX.value = clamped;
            runOnJS(pausePlay)();
            runOnJS(seekToPosition)(clamped);
        })
        .onUpdate((e) => {
            const clamped = Math.max(0, Math.min(sliderWidth.value, e.x));
            progressX.value = clamped;
            runOnJS(seekToPosition)(clamped);
        })
        .onEnd(() => {
            isDragging.value = false;
            runOnJS(resumePlay)();
        })
        .onFinalize(() => {
            isDragging.value = false;
        });

    const trackStyle = useAnimatedStyle(() => ({
        height: withSpring(isDragging.value ? SLIDER_HEIGHT_ACTIVE : SLIDER_HEIGHT, {
            mass: 0.3,
            damping: 15,
            stiffness: 200,
        }),
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.35)',
        overflow: 'hidden' as const,
    }));

    const fillStyle = useAnimatedStyle(() => ({
        width: progressX.value,
        height: '100%',
        backgroundColor: 'white',
        borderRadius: 4,
    }));

    const thumbStyle = useAnimatedStyle(() => ({
        position: 'absolute' as const,
        top: '50%',
        left: progressX.value - 6,
        marginTop: -6,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'white',
        opacity: withTiming(isDragging.value ? 1 : 0, { duration: 150 }),
        transform: [{ scale: withSpring(isDragging.value ? 1 : 0.1) }],
    }));

    const muteOpacity = useSharedValue(0);
    const muteStyle = useAnimatedStyle(() => ({ opacity: muteOpacity.value }));

    const handleLikeAnimation = React.useCallback(() => {
        setShowLikeAnimation(true);

        if (likeAnimationTimeoutRef.current) {
            clearTimeout(likeAnimationTimeoutRef.current);
        }

        likeAnimationTimeoutRef.current = setTimeout(() => {
            setShowLikeAnimation(false);
        }, 700);
    }, []);

    const handlePress = () => {
        if (tapTimeoutRef.current) {
            clearTimeout(tapTimeoutRef.current);
            tapTimeoutRef.current = null;
            handleLike();
            handleLikeAnimation();
        } else {
            tapTimeoutRef.current = setTimeout(() => {
                tapTimeoutRef.current = null;
                toggleMute();
            }, DOUBLE_TAP_DELAY);
        }
    };

    const toggleMute = () => {
        const next = !isMuted;
        setIsMuted(next);
        setTrackVolume(next ? 0 : 1);
        muteOpacity.value = withSequence(
            withTiming(1, { duration: 80 }),
            withDelay(700, withTiming(0, { duration: 300 }))
        );
    };

    const handleLongPress = () => {
        handleHolding(true);
        if (videoPlayer) videoPlayer.pause();
        pause();
    };

    const handlePressOut = () => {
        if (isHolding.value) {
            handleHolding(false);
            if (videoPlayer) videoPlayer.play();
            play();
        }
    };

    React.useEffect(() => {
        return () => {
            if (tapTimeoutRef.current) clearTimeout(tapTimeoutRef.current);
            if (likeAnimationTimeoutRef.current) clearTimeout(likeAnimationTimeoutRef.current);
        };
    }, []);
    //#endregion

    return (
        <Pressable className="relative w-full" style={{ height: containerHeight }}>
            {!showImage && feed.customVideoUri && videoPlayer &&
                <VideoView
                    style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        width: '100%', height: '100%',
                        zIndex: 0,
                    }}
                    player={videoPlayer}
                    allowsPictureInPicture
                    contentFit="cover"
                    nativeControls={false}
                />
            }

            {showImage && (
                <Image
                    source={{ uri: feed.artwork || defaultMusicArtWork }}
                    className='absolute z-0 h-full w-full'
                    resizeMode="contain"
                />
            )}

            <Pressable
                onPress={handlePress}
                onLongPress={handleLongPress}
                onPressOut={handlePressOut}
                delayLongPress={250}
                style={{
                    position: 'absolute',
                    top: 0, left: 0, right: 0, bottom: 0,
                    zIndex: 10,
                }}
            />

            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={{
                    position: 'absolute',
                    bottom: 0, left: 0, right: 0,
                    height: '50%',
                    zIndex: 10,
                }}
                pointerEvents="none"
            />

            <Animated.View
                pointerEvents="none"
                style={[muteStyle, {
                    position: 'absolute',
                    top: 12, right: 12,
                    zIndex: 30,
                    backgroundColor: 'rgba(0,0,0,0.4)',
                    borderRadius: 50,
                    padding: 6,
                }]}
            >
                <Ionicons
                    name={isMuted ? 'volume-mute' : 'volume-high'}
                    size={18}
                    color="white"
                />
            </Animated.View>

            <FeedOverLay like={isLiked} onLike={toggleLike} animation={showLikeAnimation} feed={feed} toggleImagePreview={handleShowImage} musicId={feed?.id} />

            <GestureDetector gesture={panGesture}>
                <View
                    style={{
                        position: 'absolute',
                        bottom: -5,
                        left: 0, right: 0,
                        zIndex: 50,
                        paddingBottom: 6,
                        paddingHorizontal: 0,
                        justifyContent: 'flex-end',
                    }}
                    onLayout={(e) => {
                        sliderWidth.value = e.nativeEvent.layout.width;
                    }}
                >
                    <Animated.View style={trackStyle}>
                        <Animated.View style={fillStyle} />
                    </Animated.View>
                    <Animated.View style={thumbStyle} />
                </View>
            </GestureDetector>
        </Pressable>
    );
}

export default React.memo(FeedItem);