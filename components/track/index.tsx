// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useAppSelector } from '@/hooks/useRedux';
import { useTrackPanle } from '@/hooks/useTrackPanel';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronDown, EllipsisVertical, Hd, ListFilter, Music } from 'lucide-react-native';
import React from 'react';
import { Image, ScrollView, Text, TouchableOpacity, useWindowDimensions, View } from 'react-native';
import { getColors } from 'react-native-image-colors';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useVideoPlayer, VideoView } from 'expo-video';
import AddToPlayList from '../common/AddToPlayList';
import { YouTubeEmbed } from '../common/YouTubeEmbed';
import Lyrics from './Lyrics';
import TrackController from './TrackController';
import TrackMusicList from './TrackMusicList';
import TrackSheet from './TrackSheet';

const BACKGROUND_COLOR = '#121212';

export default function PlayerScreen() {
    const [dominantColor, setDominantColor] = React.useState(BACKGROUND_COLOR);
    const [vibrantColor, setVibrantColor] = React.useState(BACKGROUND_COLOR);
    const [showVideo, setShowVideo] = React.useState<boolean>(false);
    const { open, onClose } = useTrackPanle();

    const { height: screenHeight } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const firstPageHeight = screenHeight - insets.top - insets.bottom;

    const { queue, currentIndex, playlistName } = useAppSelector((state) => state.trackReducer);
    const track = queue[currentIndex];

    const [openPlayListMenu, setOpenPlayListMenu] = React.useState<boolean>(false);
    const handlePlayListMenu = React.useCallback(() => setOpenPlayListMenu(prev => !prev), []);
    const [openAddToPlaylist, setOpenAddToPlaylist] = React.useState<boolean>(false);
    const handleAddToPlaylist = React.useCallback(() => setOpenAddToPlaylist(prev => !prev), []);

    const videoPlayer = useVideoPlayer(track?.customVideoUri ?? null, (p) => {
        p.loop = true;
        p.muted = true;
        p.play();
    });

    React.useEffect(() => {
        if (videoPlayer && track?.customVideoUri) {
            videoPlayer.loop = true;
            videoPlayer.muted = true;
            videoPlayer.play();
        }
    }, [videoPlayer, track?.customVideoUri]);

    const handleShowView = React.useCallback(() => setShowVideo(prev => !prev), []);

    React.useEffect(() => {
        if (!track) { return; }
        if (!track.artwork) {
            setDominantColor(BACKGROUND_COLOR);
            setVibrantColor(BACKGROUND_COLOR);
            return;
        }

        getColors(track?.artwork, {
            fallback: BACKGROUND_COLOR,
            cache: true,
            key: track?.artwork,
            quality: 'low',
        })
            .then((colors) => {
                if (colors.platform === 'android') {
                    setDominantColor(colors.dominant || BACKGROUND_COLOR);
                    setVibrantColor(colors.vibrant || colors.dominant || BACKGROUND_COLOR);
                } else if (colors.platform === 'ios') {
                    setDominantColor(colors.background || BACKGROUND_COLOR);
                    setVibrantColor(colors.primary || colors.secondary || BACKGROUND_COLOR);
                } else {
                    setDominantColor(colors.vibrant || BACKGROUND_COLOR);
                    setVibrantColor(colors.lightVibrant || BACKGROUND_COLOR);
                }
            })
            .catch((err) => {
                console.warn('Gradient extraction failed:', err);
                setDominantColor(BACKGROUND_COLOR);
                setVibrantColor(BACKGROUND_COLOR);
            });
    }, [track?.artwork]);

    return (
        <TrackSheet open={open} onClose={onClose}>
            <View style={{ flex: 1, backgroundColor: BACKGROUND_COLOR }}>

                {showVideo && track?.customVideoUri && videoPlayer && (
                    <VideoView
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: screenHeight,
                            zIndex: 0,
                        }}
                        player={videoPlayer}
                        allowsPictureInPicture={false}
                        contentFit="cover"
                        nativeControls={false}
                    />
                )}

                <LinearGradient
                    colors={['rgba(18,18,18,0.05)', 'rgba(18,18,18,0.65)', BACKGROUND_COLOR]}
                    locations={[0, 0.45, 1]}
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: showVideo ? screenHeight : 0,
                        opacity: 0.95,
                        zIndex: 1,
                    }}
                />

                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    bounces
                    style={{ zIndex: 2 }}
                >


                    <SafeAreaView className="flex-1 px-6 mb-10">
                        <LinearGradient
                            colors={[vibrantColor, dominantColor, BACKGROUND_COLOR]}
                            locations={[0, 0.4, 1]}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: showVideo ? 0 : screenHeight,
                                opacity: 0.8,
                            }}
                        />
                        <View style={{ minHeight: firstPageHeight }} className="justify-between">

                            <View className="flex-row justify-between items-center pt-2 pb-4">
                                <TouchableOpacity hitSlop={15} onPress={onClose}>
                                    <ChevronDown size={28} color="#fff" />
                                </TouchableOpacity>

                                <View className="items-center">
                                    <Text className="text-white/70 text-xs font-bold uppercase tracking-widest mb-1">
                                        Playing from playlist
                                    </Text>
                                    <Text className="text-white text-sm font-bold">
                                        {playlistName}
                                    </Text>
                                </View>

                                <TouchableOpacity hitSlop={15} onPress={handleAddToPlaylist}>
                                    <EllipsisVertical size={24} color="#fff" />
                                </TouchableOpacity>
                            </View>

                            <View className="flex-1 items-center justify-center">
                                {!showVideo && track?.artwork ? (
                                    <Image
                                        source={{ uri: track.artwork }}
                                        className="w-full aspect-square rounded-md bg-white/5"
                                        resizeMode="cover"
                                    />
                                ) : showVideo ? (
                                    <View className="w-full aspect-square" />
                                ) : (
                                    <View className="w-16 h-16 rounded-sm bg-slate-100 items-center justify-center">
                                        <Music size={24} color="#A1A1AA" />
                                    </View>
                                )}
                            </View>

                            <TrackController />
                        </View>

                        <View className="mb-8 flex-row justify-between items-center">
                            {track?.customVideoUri ? (
                                <TouchableOpacity hitSlop={12} onPress={handleShowView}>
                                    <Hd size={20} opacity={showVideo ? 1 : 0.5} color="white" />
                                </TouchableOpacity>
                            ) : (
                                <Hd size={20} color="white" opacity={0.2} />
                            )}
                            <TouchableOpacity hitSlop={12} onPress={handlePlayListMenu}>
                                <ListFilter size={20} color="white" opacity={0.8} />
                            </TouchableOpacity>
                        </View>

                        <Lyrics color={vibrantColor} />

                        {track?.youtube_uri && (
                            <View className='my-6'>
                                <Text className="text-white font-bold text-lg">Youtube Reference</Text>
                                <YouTubeEmbed id={track.youtube_uri} />
                            </View>
                        )}
                    </SafeAreaView>
                </ScrollView>
            </View>

            <TrackMusicList open={openPlayListMenu} onClose={handlePlayListMenu} />
            <AddToPlayList isVisible={openAddToPlaylist} musicId={track?.id || ''} onClose={handleAddToPlaylist} />
        </TrackSheet>
    );
}