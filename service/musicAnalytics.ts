// Copyright (c) 2026 Raj 
// See LICENSE for details.

import TrackPlayer from "react-native-track-player";
import { getDatabase } from "./database-instance";
import { addRecentPlay, updateMusicAnalytics } from "./musicAnalyticsdb";

interface TrackSession {
    musicId: string;
    startedAt: number;
}

let currentSession: TrackSession | null = null;

export const initializeCurrentSession = async () => {
    if (currentSession) return;
    const activeTrack = await TrackPlayer.getActiveTrack();
    if (!activeTrack?.musicId) {
        currentSession = null;
        return;
    }
    currentSession = { musicId: activeTrack.musicId, startedAt: Date.now() };
}

export const finalizeCurrentTrack = async (position: number, duration: number) => {
    const db = getDatabase();
    if (!db) return;

    try {
        if (currentSession) {

            await updateMusicAnalytics(db, {
                musicId: currentSession?.musicId,
                seconds: position,
                musicDuration: duration,
            });

            if (position >= 15) {
                await addRecentPlay(db, currentSession?.musicId);
            }
        }

        const activeTrack = await TrackPlayer.getActiveTrack();

        if (!activeTrack?.musicId) {
            currentSession = null;
            return;
        }

        currentSession = { musicId: activeTrack.musicId, startedAt: Date.now() };
    } catch (error) {
        console.error("Failed to finalize track analytics:", error);
    }
};