// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useMusic } from '@/hooks/useMusic';
import { Zap } from 'lucide-react-native';
import React from 'react';
import MusicLinearList from '../common/MusicLinearList';

export default function Recent() {
    const { recent } = useMusic();

    if (recent.tracks.length === 0) {
        return null;
    }

    return (
        <MusicLinearList title="Recent" subTitle={`Pick up where\nyou left off.`} Icon={Zap} musicPlayList={recent} />
    )
}