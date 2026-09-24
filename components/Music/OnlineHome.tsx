// Copyright (c) 2026 Raj
// See LICENSE for details.

import { TAB_BAR_SPACE } from '@/utils/constants';
import { useMusic } from '@/hooks/useMusic';
import { useTrack } from '@/hooks/useTrack';
import { getTrackFromMusic } from '@/service/TrackMaker';
import { IMusicTrack } from '@/types/database';
import { defaultMusicArtWork } from '@/utils/constants';
import { Play } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, ScrollView, Text, View } from 'react-native';

const CREAM = '#FFFFFF';
const CREAM_DARK = '#121212';
const MAROON = '#7A3B2E';
const CORAL = '#FF6F4E';

export default function OnlineHome() {
    const { musics, recent } = useMusic();
    const { setupQueue, playAtIndex } = useTrack();

    const mixTracks = (recent.tracks.length > 0 ? recent.tracks : musics.tracks).slice(0, 3);
    const recentAlbums = musics.tracks.slice(0, 10);

    const artistNames = Array.from(
        new Set(mixTracks.map((t) => t.artist).filter(Boolean))
    ).slice(0, 2).join(', ');

    const handlePlayMix = () => {
        if (mixTracks.length === 0) return;
        setupQueue({
            tracks: getTrackFromMusic(mixTracks),
            playlistName: 'Your Mix',
            sourceId: null,
            sourceType: 'default',
            startIndex: 0,
            queueHash: 'your-mix',
        });
        playAtIndex(0);
    };

    const handlePlayAlbum = (musicId: string) => {
        const indx = recentAlbums.findIndex((m) => m.id === musicId);
        setupQueue({
            tracks: getTrackFromMusic(recentAlbums),
            playlistName: 'Recent Albums',
            sourceId: null,
            sourceType: 'default',
            startIndex: indx,
            queueHash: 'recent-albums-online',
        });
        playAtIndex(indx);
    };

    const art = (i: number) => mixTracks[i]?.customCoverUri || defaultMusicArtWork;
    const realArtCount = mixTracks.filter((t) => !!t.customCoverUri).length;
    const hasEnoughRealArt = realArtCount >= 2;

    return (
        <ScrollView
            style={{ backgroundColor: CREAM }}
            className="dark:bg-[#121212]"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE + 72 }}
        >
            <View className="px-5 pt-4">
                <Text style={{ color: MAROON }} className="text-6xl font-elms-med leading-[3.4rem] dark:text-[#F3D9CC]">
                    Your{'\n'}Mix
                </Text>

                <Text className="text-[15px] text-[#7A3B2E]/70 dark:text-[#F3D9CC]/60 mt-3">
                    {artistNames || 'Add some local music to get started'}
                </Text>
            </View>

            {mixTracks.length > 0 && (
                hasEnoughRealArt ? (
                    <View className="mt-6 px-5" style={{ height: 320 }}>
                        <Pressable
                            onPress={handlePlayMix}
                            style={{ position: 'absolute', top: 0, right: 20, zIndex: 10 }}
                        >
                            <View style={{ backgroundColor: CORAL }} className="w-20 h-20 rounded-full items-center justify-center">
                                <Play color="white" fill="white" size={26} />
                            </View>
                        </Pressable>

                        {mixTracks[0] && (
                            <Image
                                source={{ uri: art(0) }}
                                style={{ position: 'absolute', top: 60, left: 0, width: 100, height: 100, borderRadius: 999 }}
                            />
                        )}

                        {mixTracks[1] && (
                            <Image
                                source={{ uri: art(1) }}
                                style={{ position: 'absolute', top: 130, left: 60, width: 220, height: 260, borderRadius: 110 }}
                            />
                        )}

                        {mixTracks[2] && (
                            <Image
                                source={{ uri: art(2) }}
                                style={{ position: 'absolute', bottom: 0, right: 10, width: 100, height: 100, borderRadius: 999 }}
                            />
                        )}
                    </View>
                ) : (
                    // Not enough tracks have real embedded artwork — showing the
                    // 3-shape collage here would just repeat the same fallback
                    // logo, which looks broken. A single clean card instead.
                    <View className="mt-6 px-5">
                        <Pressable onPress={handlePlayMix} className="flex-row items-center gap-4">
                            <Image
                                source={{ uri: art(0) }}
                                style={{ width: 120, height: 120, borderRadius: 24 }}
                            />
                            <View className="flex-1">
                                <Text numberOfLines={1} style={{ color: MAROON }} className="text-lg font-elms-med dark:text-[#F3D9CC]">
                                    {mixTracks[0]?.title}
                                </Text>
                                <Text numberOfLines={1} className="text-[13px] text-[#7A3B2E]/60 dark:text-[#F3D9CC]/50 mt-1">
                                    {mixTracks[0]?.artist}
                                </Text>
                            </View>
                            <View style={{ backgroundColor: CORAL }} className="w-14 h-14 rounded-full items-center justify-center">
                                <Play color="white" fill="white" size={18} />
                            </View>
                        </Pressable>
                    </View>
                )
            )}

            {recentAlbums.length > 0 && (
                <View className="mt-8 px-5">
                    <Text style={{ color: MAROON }} className="text-2xl font-elms-med mb-3 dark:text-[#F3D9CC]">
                        Recent Albums
                    </Text>

                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                        {recentAlbums.map((item: IMusicTrack) => (
                            <Pressable key={item.id} onPress={() => handlePlayAlbum(item.id)} style={{ width: 130 }}>
                                <Image
                                    source={{ uri: item.customCoverUri || defaultMusicArtWork }}
                                    style={{ width: 130, height: 130, borderRadius: 18 }}
                                />
                                <Text numberOfLines={1} style={{ color: MAROON }} className="text-[13px] font-elms-med mt-2 dark:text-[#F3D9CC]">
                                    {item.title}
                                </Text>
                                <Text numberOfLines={1} className="text-[11px] text-[#7A3B2E]/60 dark:text-[#F3D9CC]/50">
                                    {item.artist}
                                </Text>
                            </Pressable>
                        ))}
                    </ScrollView>
                </View>
            )}
        </ScrollView>
    );
}
