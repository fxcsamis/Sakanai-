// Copyright (c) 2026 Raj 
// See LICENSE for details.

import PlayListProvider from "@/components/context/playlist";
import PlayList from "@/components/Playlist";
import { useLocalSearchParams } from "expo-router";
import React from 'react';

export default function playlist() {
    const { playlistId } = useLocalSearchParams<{ playlistId: string }>()
    return (
        <PlayListProvider>
            <PlayList playlistId={playlistId} />
        </PlayListProvider>
    )
}