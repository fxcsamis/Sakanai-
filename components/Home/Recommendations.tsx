// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useMusic } from '@/hooks/useMusic';
import { Sparkle } from 'lucide-react-native';
import React from 'react';
import MusicLinearList from '../common/MusicLinearList';

export default function Recommendations() {
    const { recommendedMusic } = useMusic();

    if (recommendedMusic.tracks.length === 0) return null;
    return (
        <MusicLinearList title="Recommendations" subTitle={`Back to \nwhat sounds good.`} Icon={Sparkle} musicPlayList={recommendedMusic} />
    )
}