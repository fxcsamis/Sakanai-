// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { NavBar } from '@/config/viewRegistry/navbar';
import { useMusic } from '@/hooks/useMusic';
import { useRefresh } from '@/hooks/useRefresh';
import Renderer from '@/renderer/renderer';
import { IMusicTrack } from '@/types/database';
import React from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import FocusAwareStatusBar from '../common/FocusAwareStatusBar';
import Shorts from '../Home/Shorts';
import SearchInput from './SearchInput';
import SuggestGrids from './SuggestGrids';

export default function index({ children }: { children: React.ReactNode }) {
    const { onReloadHomeData, recent, likedMusics, recommendedMusic, handpickedMusic } = useMusic();
    const [musics, setMusics] = React.useState<IMusicTrack[]>([]);
    const [query, setQuery] = React.useState<string>('');
    const { refresh, onRefresh, setRefresh } = useRefresh();


    const navSeen = {
        ...NavBar['nav'],
        children: [
            { key: 'NavGreet' },
            { key: 'NavChip', props: { text: "Search" } }
        ]
    };

    const handleRecentMusic = () => {
        setMusics(recent.tracks);
        setQuery('#Recent')
    }

    const handleLikedMusic = () => {
        setMusics(likedMusics.tracks);
        setQuery('#Liked')
    }

    const handleSuggested = () => {
        setMusics(recommendedMusic.tracks);
        setQuery('#Suggested')
    }

    const handleTopPick = () => {
        setMusics(handpickedMusic.tracks);
        setQuery('#TopPick')
    }

    const handleRefresh = async () => {
        setRefresh(true);
        await onReloadHomeData();
        onRefresh();
    }
    return (
        <View className='flex-1 bg-white dark:bg-[#121212]'>
            <FocusAwareStatusBar style='auto' />
            <Renderer scene={navSeen} />
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 20, paddingBottom: 10 }} className='flex-1 px-4 py-2'
                refreshControl={<RefreshControl refreshing={refresh} onRefresh={handleRefresh} tintColor="#B3B3B3" />}>
                <SearchInput _query={query} musicList={musics} />
                <SuggestGrids onRecent={handleRecentMusic} onLiked={handleLikedMusic} onSuggested={handleSuggested} onTopPick={handleTopPick} />
                <Shorts />
                {children}
            </ScrollView>
        </View>
    )
}