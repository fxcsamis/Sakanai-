// Copyright (c) 2026 Raj 
// See LICENSE for details.
import { NavBar } from '@/config/viewRegistry/navbar';
import { useAppDrawer } from '@/hooks/useAppDrawer';
import { useMusic } from '@/hooks/useMusic';
import { useRefresh } from '@/hooks/useRefresh';
import { useTrackPanle } from '@/hooks/useTrackPanel';
import Renderer from '@/renderer/renderer';
import { Section } from '@/types/screenMap';
import { defaultMusicArtWork } from '@/utils/constants';
import { useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import FocusAwareStatusBar from '../common/FocusAwareStatusBar';
import MiniPlayer from '../common/MiniPlayer';

export default function index({ children }: { children: React.ReactNode }) {
    const [activeTab, setActiveTab] = React.useState('All');
    const { onReloadHomeData, musics, recent, recommendedMusic, filteredMusic, handleLiked, handleShots, handleTopPick } = useMusic();
    const { onOpen } = useAppDrawer();
    const { refresh, onRefresh, setRefresh } = useRefresh();
    const noMusic = musics.tracks.length === 0;
    const params = useLocalSearchParams();
    const { onOpen: openTrackPanel } = useTrackPanle();

    let categories = [];

    if (musics.tracks.length > 0) categories.push('All');
    if (recent.tracks.length > 0) categories.push('Top Picks');
    if (recommendedMusic.tracks.length > 0) categories.push('Recommended');

    const navSeen = {
        ...NavBar['nav'],
        children: [
            { key: 'NavGreet' },
            { key: 'NavTime' }
        ]
    };

    const homeSeen: Section = React.useMemo(() => {
        const children = [
            { key: 'Recent' },
            { key: 'Shorts' },
            { key: 'Playlist' },
            { key: 'Recommendations' },
            { key: 'Music_Of_The_Day' },
        ];

        const map: Record<string, string> = {
            'Top Picks': 'Music_Of_The_Day',
            Recommended: 'Recommendations',
        };

        const activeKey = map[activeTab];

        if (activeKey) {
            const index = children.findIndex(x => x.key === activeKey);

            if (index > 0) {
                const [selected] = children.splice(index, 1);
                children.unshift(selected);
            }
        }

        return {
            key: 'Virtual',
            children
        };
    }, [activeTab]);

    const handleLoadHome = async () => {
        await onReloadHomeData();
    }

    const handleRefresh = async () => {
        setRefresh(true);
        await onReloadHomeData();
        onRefresh();
    }

    React.useEffect(() => {
        handleLoadHome();
    }, []);

    React.useEffect(() => {
        if (params.trackplayer !== undefined) {
            openTrackPanel();
        }
    }, [params.trackplayer])

    React.useEffect(() => {
        handleLiked();
        handleTopPick();
        handleShots();
    }, [filteredMusic, musics])


    return (
        <>
            <View className='bg-white dark:bg-[#121212] flex-1'>
                <Renderer scene={navSeen} />
                <FocusAwareStatusBar style='auto' />

                <ScrollView
                    contentContainerStyle={{ gap: 20, paddingBottom: 60, flexGrow: 1 }}
                    className='flex-1 px-4 py-2'
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refresh} onRefresh={handleRefresh} tintColor="#B3B3B3" />}
                >
                    {categories.length >= 2 && <View>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={{ gap: 12 }}
                        >
                            {categories.map((tab) => {
                                const isActive = activeTab === tab;

                                return (
                                    <TouchableOpacity
                                        key={tab}
                                        onPress={() => setActiveTab(tab)}
                                        activeOpacity={0.7}
                                        className={`px-3 py-1.5 rounded-full border ${isActive
                                            ? 'bg-white border-gray-300 dark:bg-[#282828] dark:border-[#282828]'
                                            : 'bg-[#27272A] border-transparent dark:bg-[#121212] dark:border-[#282828]'
                                            }`}
                                    >
                                        <Text className={`text-sm font-elms-med ${isActive ? 'text-black dark:text-white' : 'text-[#A1A1AA] dark:text-[#B3B3B3]'}`}>
                                            {tab}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>}

                    {noMusic && (
                        <View className='flex-1 justify-center items-center py-20 px-6'>
                            <View className='mb-8 rounded-[32px] bg-gray-50 dark:bg-[#181818] p-2 border border-gray-100 dark:border-[#282828]'>
                                <Image
                                    source={{ uri: defaultMusicArtWork }}
                                    className='w-32 h-32 rounded-2xl opacity-90'
                                    resizeMode='cover'
                                />
                            </View>

                            <Text className='text-2xl font-extrabold text-gray-800 dark:text-white mb-2 text-center tracking-tight'>
                                It's quiet in here
                            </Text>

                            <Text className='text-base text-gray-500 dark:text-[#B3B3B3] text-center leading-6 mb-8 px-2'>
                                Your library is empty. Let's find your local tracks to get the party started.
                            </Text>

                            <TouchableOpacity
                                activeOpacity={0.8}
                                className='bg-[#27272A] dark:bg-white px-8 py-4 rounded-full flex-row items-center shadow-sm'
                                onPress={onOpen}
                            >
                                <Text className='text-white dark:text-[#121212] font-semibold text-base'>
                                    Open Menu
                                </Text>
                            </TouchableOpacity>

                            <Text className='text-xs text-gray-400 dark:text-[#B3B3B3] mt-6 text-center'>
                                (You can also open the menu by tapping your avatar)
                            </Text>
                        </View>
                    )}

                    <Renderer scene={homeSeen} />
                </ScrollView>
            </View>
            <MiniPlayer />
        </>
    );
}