// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { ImageBackground } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { ArrowLeft } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { getColors } from 'react-native-image-colors';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppTheme } from '@/hooks/useAppTheme';
import { usePlaylist } from '@/hooks/usePlaylist';
import { getPlayListById, getPlayListMusic } from '@/service/playlistdb';
import { defaultPlayListCover } from '@/utils/constants';
import { AppTheme } from '../context/apptheme';

import FocusAwareStatusBar from '../common/FocusAwareStatusBar';
import MiniPlayer from '../common/MiniPlayer';
import EditSheet from './EditSheet';
import MusicList from './MusicList';
import PlayListControls from './PlayListControls';
import PlayListMusic from './PlayListMusic';
import PlaylistRemoveDialog from './PlaylistRemoveDialog';

const BACKGROUND_COLOR = '#121212';

export default function PlaylistScreen({ playlistId }: { playlistId: string }) {
    const { setTheme } = useAppTheme();
    const router = useRouter();
    const db = useSQLiteContext();
    const { setPlayList, setPlayListMusic, playlist } = usePlaylist();

    const [gradient, setGradient] = useState<string[]>(['transparent', BACKGROUND_COLOR]);
    const [musiclistSheet, setMusicListSheet] = useState<boolean>(false);
    const [editPlaylist, setEditPlaylist] = React.useState<boolean>(false);
    const [removeDialog, setRemovedialog] = React.useState<boolean>(false);

    const handleMusicListSheet = useCallback(() => setMusicListSheet(prev => !prev), []);
    const handleEditPlayList = React.useCallback(() => { setEditPlaylist(prev => !prev); }, []);
    const handleRemoveDialog = React.useCallback(() => setRemovedialog(prev => !prev), []);

    useEffect(() => {
        if (!playlist?.cover) return;

        getColors(playlist.cover, {
            fallback: BACKGROUND_COLOR,
            cache: true,
            key: playlist.cover,
            quality: 'low'
        })
            .then((colors) => {
                let extractedColor = BACKGROUND_COLOR;

                if (colors.platform === 'android') {
                    extractedColor = colors.vibrant || colors.dominant || BACKGROUND_COLOR;
                } else if (colors.platform === 'ios') {
                    extractedColor = colors.primary || BACKGROUND_COLOR;
                } else {
                    extractedColor = colors.vibrant || BACKGROUND_COLOR;
                }

                setGradient([extractedColor, BACKGROUND_COLOR]);
            })
            .catch((err) => {
                console.warn("Gradient extraction failed, using defaults:", err);
                setGradient(['transparent', BACKGROUND_COLOR]);
            });
    }, [playlist?.cover]);

    const loadPlayList = useCallback(async () => {
        try {
            const [details, tracks] = await Promise.all([
                getPlayListById(db, playlistId),
                getPlayListMusic(db, playlistId)
            ]);
            if (details) setPlayList(details);
            if (tracks) setPlayListMusic(tracks);
        } catch (error) {
            console.error("Failed loading target playlist data stack:", error);
        }
    }, [db, playlistId, setPlayList, setPlayListMusic]);

    useEffect(() => {
        loadPlayList();
    }, [loadPlayList]);

    useFocusEffect(
        useCallback(() => {
            setTheme(AppTheme.dark);
            return () => setTheme(AppTheme.light);
        }, [setTheme])
    );

    const ListHeader = useCallback(() => (
        <View>
            <ImageBackground
                className='w-full aspect-square'
                style={{ aspectRatio: 1 }}
                source={{ uri: playlist?.cover || defaultPlayListCover }}
            >
                <SafeAreaView className='relative p-4 z-20' edges={['top']}>
                    <Pressable
                        className="w-10 h-10 items-center justify-center rounded-md bg-black/30"
                        hitSlop={12}
                        onPress={() => router.back()}
                    >
                        <ArrowLeft size={22} color='white' strokeWidth={2.5} />
                    </Pressable>
                </SafeAreaView>

                <LinearGradient
                    colors={[
                        'rgba(18, 18, 18, 0)',
                        'rgba(18, 18, 18, 0.15)',
                        'rgba(18, 18, 18, 0.45)',
                        'rgba(18, 18, 18, 0.85)',
                        BACKGROUND_COLOR
                    ]}
                    locations={[0, 0.4, 0.7, 0.9, 1]}
                    style={{
                        position: 'absolute',
                        bottom: 0, left: 0, right: 0,
                        height: '100%',
                        zIndex: 10,
                    }}
                    pointerEvents="none"
                />

                <View className='absolute bottom-6 left-5 right-5 z-20'>
                    <Text numberOfLines={2} className='text-white font-bold text-4xl mb-2'>
                        {playlist?.title}
                    </Text>
                    <Text numberOfLines={2} className='text-gray-300 text-sm leading-5'>
                        {playlist?.description}
                    </Text>
                </View>
            </ImageBackground>

            <PlayListControls onMusicListOpen={handleMusicListSheet} onEditPlayList={handleEditPlayList} onRemovePlaylist={handleRemoveDialog} />
        </View>
    ), [playlist, router, handleMusicListSheet]);

    return (
        <>
            <View className='flex-1' style={{ backgroundColor: BACKGROUND_COLOR }}>
                <FocusAwareStatusBar animated style='light' />

                <View className='flex-1'>
                    <LinearGradient
                        colors={[gradient[0], 'rgba(18, 18, 18, 0.5)', BACKGROUND_COLOR]}
                        locations={[0, 0.5, 1]}
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 520,
                        }}
                        pointerEvents="none"
                    />

                    <PlayListMusic reload={loadPlayList} header={<ListHeader />} />
                </View>

                <MiniPlayer />
            </View>

            <MusicList playlistId={playlistId} onMusicListOpen={handleMusicListSheet} open={musiclistSheet} />

            <EditSheet reload={loadPlayList} open={editPlaylist} onClose={handleEditPlayList} />
            <PlaylistRemoveDialog isVisible={removeDialog} onClose={handleRemoveDialog} />
        </>
    );
}