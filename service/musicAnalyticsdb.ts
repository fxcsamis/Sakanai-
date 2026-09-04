// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { HashedIMusicTrackList, IMusicTrack, MusicAnalytics } from "@/types/database";
import { defaultMusicArtWork } from "@/utils/constants";
import * as Crypto from "expo-crypto";
import { SQLiteDatabase } from "expo-sqlite";
import createQueueHash from "./queueHash";

const getId = () => Crypto.randomUUID();

export const initMusicAnalyticsDB = async (db: SQLiteDatabase) => {
    try {
        const sqlCommand = `
            CREATE TABLE IF NOT EXISTS music_analytics (
                musicId TEXT PRIMARY KEY NOT NULL,
                playCount INTEGER NOT NULL DEFAULT 0,
                skipCount INTEGER NOT NULL DEFAULT 0,
                completedCount INTEGER NOT NULL DEFAULT 0,
                totalListeningSeconds INTEGER NOT NULL DEFAULT 0,

                firstPlayedAt INTEGER DEFAULT NULL,
                lastPlayedAt INTEGER DEFAULT NULL,

                createdAt INTEGER NOT NULL,
                updatedAt INTEGER NOT NULL,

                FOREIGN KEY (musicId) REFERENCES Musics(id) ON DELETE CASCADE
            )
        `

        await db.execAsync(sqlCommand);
        await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_music_analytics_lastplayed ON music_analytics(lastPlayedAt DESC);`);
        await db.execAsync(` CREATE INDEX IF NOT EXISTS idx_music_analytics_playcount ON music_analytics(playCount DESC);`)
    } catch (error) {
        console.error("Error initializing music analytics database:", error);
    }
}

interface UpdateMusicAnalytics {
    musicId: string;
    seconds: number;
    musicDuration: number;
}

/**
 * Gets the music analytics for a given music.
 * @param db 
 * @param musicId 
 * @returns Promise<any | null>
 */
export const getMusicAnalytics = async (db: SQLiteDatabase, musicId: string): Promise<any | null> => {
    try {
        const sqlCommand = `
            SELECT * FROM music_analytics WHERE musicId = ?;
        `
        const result = await db.getFirstAsync(sqlCommand, [musicId]);
        return result;
    } catch (error) {
        console.error("Error fetching music analytics:", error);
        return null;
    }
}

export const initializeMusicAnalyticsForMusic = async (db: SQLiteDatabase, musicId: string) => {
    try {
        const now = Date.now();
        const sqlCommand = `
            INSERT OR IGNORE INTO music_analytics (musicId, playCount, skipCount, completedCount, totalListeningSeconds, firstPlayedAt, createdAt, updatedAt)
            VALUES (?, 0, 0, 0, 0, ?, ?, ?);
        `
        await db.runAsync(sqlCommand, [musicId, now, now, now]);

        const analytics = await getMusicAnalytics(db, musicId);
        return analytics;
    } catch (error) {
        console.error("Error initializing music analytics for music:", error);
        return null;
    }
}

export const updateMusicAnalytics = async (db: SQLiteDatabase, updateData: UpdateMusicAnalytics) => {
    try {

        const completionThreshold = 0.8; // 80% or more is considered completed
        const skipThreshold = 0.1; // Played for less than 10% of the song is considered skipped
        const completedRatio = updateData.musicDuration > 0 ? updateData.seconds / updateData.musicDuration : 0;
        const isCompleted = completedRatio >= completionThreshold;
        const isSkipped = completedRatio < skipThreshold;
        const playCount = 1;
        const skipCount = isSkipped ? 1 : 0;
        const completedCount = isCompleted ? 1 : 0;

        const now = Date.now();

        let existingAnalytics = await getMusicAnalytics(db, updateData.musicId);

        if (!existingAnalytics) {
            existingAnalytics = await initializeMusicAnalyticsForMusic(db, updateData.musicId);
        }

        const sqlCommand = `
            UPDATE music_analytics
            SET
                playCount = playCount + ?,
                skipCount = skipCount + ?,
                completedCount = completedCount + ?,
                totalListeningSeconds = totalListeningSeconds + ?,
                lastPlayedAt = ?,
                updatedAt = ?
            WHERE musicId = ?;
        `;

        await db.runAsync(sqlCommand, [playCount, skipCount, completedCount, updateData.seconds, now, now, updateData.musicId]);
    } catch (error) {
        console.error("Error updating music analytics:", error);
    }
}

export const initRecentPlaysDB = async (db: SQLiteDatabase) => {
    try {
        const sqlCommand = `
        CREATE TABLE IF NOT EXISTS RecentPlays (
            id TEXT PRIMARY KEY NOT NULL,
        
            musicId TEXT NOT NULL,

            playedAt INTEGER NOT NULL,

            FOREIGN KEY (musicId)
                REFERENCES Musics(id)
            ON DELETE CASCADE
        );
        `
        await db.execAsync(sqlCommand);
        await db.execAsync(`CREATE INDEX IF NOT EXISTS idx_recentplays_playedat ON RecentPlays(playedAt DESC);`);
    } catch (error) {
        console.error("Error initializing recent plays database:", error);
    }
}

/**
 * Adds a recent play entry for a given music.
 * @param db 
 * @param musicId 
 * @returns Promise<void>
 */
export const addRecentPlay = async (db: SQLiteDatabase, musicId: string) => {
    try {
        const now = Date.now();
        const id = getId();
        const sqlCommand = `
            INSERT INTO RecentPlays (id, musicId, playedAt)
            VALUES (?, ?, ?);
        `;
        await db.runAsync(sqlCommand, [id, musicId, now]);

        await db.runAsync(`
            DELETE FROM RecentPlays
                WHERE id NOT IN (
                SELECT id
                FROM RecentPlays
                ORDER BY playedAt DESC
                LIMIT ?
            );
            `, [150]);
    } catch (error) {
        console.error("Error adding recent play:", error);
    }
}

/**
 * gets last 20 played musics
 * @param db 
 * @param limit 
 * @returns Promise<HashIMusicTrack>
 */
export const getRecentPlays = async (db: SQLiteDatabase, limit: number = 20): Promise<HashedIMusicTrackList> => {
    try {
        const sql = `
            SELECT
                music.*,
                music.id as musicId,
                Lyrics.name AS lyricsName,
                Lyrics.uri AS lyricsUri
            FROM Musics AS music

            LEFT JOIN Lyrics
                ON music.lyricsId = Lyrics.id

            INNER JOIN (
                SELECT
                    musicId,
                    MAX(playedAt) AS lastPlayed
                FROM RecentPlays
                GROUP BY musicId
            ) rp
                ON music.id = rp.musicId

            WHERE music.visible = 1

            ORDER BY rp.lastPlayed DESC
            LIMIT ?;
        `;


        const recent = await db.getAllAsync(sql, [limit]) as IMusicTrack[];
        const hash = await createQueueHash(recent);
        return { tracks: recent, queueHash: hash } as HashedIMusicTrackList;
    } catch (error) {
        console.error("Error fetching recent plays database:", error);
        return { tracks: [], queueHash: "default" };
    }
}

/**
 * Gets recomendations based on user listening history
 * @param db 
 * @param limit 
 * @returns Promise<HashMusicList[]>
 */
export const getRecomendations = async (db: SQLiteDatabase, limit: number = 20): Promise<HashedIMusicTrackList> => {
    try {
        const sqlCommand = `
            SELECT music.isLiked, music.creationTime , music_a.* 
            FROM music_analytics AS music_a
            LEFT JOIN Musics as music ON music_a.musicId = music.id
            WHERE music_a.playCount > 1 AND music.visible = 1
        `

        const dbResult = await db.getAllAsync(sqlCommand) as (MusicAnalytics & { isLiked: boolean, creationTime: number })[];

        /**
         * Scoring algorithm
         */
        const scoredData = dbResult.map((item) => {
            const now = Date.now();
            const hoursSincePlayed = (now - item.lastPlayedAt) / (1000 * 60 * 60);

            const recencyScore = 100 / (1 + hoursSincePlayed / 24);
            const engagement = item.completedCount * 50;
            const liking = item.isLiked ? 1 * 25 : 0;
            const playScore = item.playCount * 10;

            const skipPenalty = item.skipCount * -5;
            const totalListeningSeconds = (item.totalListeningSeconds / (1000 * 60 * 60)) * 10;
            const daysOld = (now - item.creationTime) / (1000 * 60 * 60 * 24);

            const freshnessScore = Math.max(0, 30 - daysOld);

            const musicPreferenceScore = engagement + liking + skipPenalty + totalListeningSeconds + playScore;
            const adjustedScore = musicPreferenceScore * 0.7 + recencyScore * 0.3 + freshnessScore * 0.1;
            return {
                id: item.musicId,
                score: adjustedScore,
            };
        })

        // Sort by score
        scoredData.sort((a, b) => b.score - a.score);

        // Return top N
        const recommendedIds = scoredData.slice(0, limit).map((item) => item.id);

        if (recommendedIds.length > 0) {
            const placeholders = recommendedIds.map(() => "?").join(",");
            const query = `
                    SELECT
                        Musics.*,
                        Musics.id as musicId,
                        Lyrics.name AS lyricsName,
                        Lyrics.uri AS lyricsUri
                    FROM Musics
                    LEFT JOIN Lyrics ON Musics.lyricsId = Lyrics.id
                    WHERE Musics.id IN (${placeholders})
                    ORDER BY Musics.modificationTime DESC;
                `;

            const recommendedTracks = (await db.getAllAsync(query, recommendedIds)) as IMusicTrack[];
            const hash = await createQueueHash(recommendedTracks);
            return { tracks: recommendedTracks, queueHash: hash } as HashedIMusicTrackList;
        }

        // Get most played songs
        const recentsHashTrackList = await getRecentPlays(db, limit);


        if (recentsHashTrackList.tracks.length > 0) {
            return recentsHashTrackList;
        }

        return { tracks: [], queueHash: 'default' } as HashedIMusicTrackList;
    } catch (error) {
        console.error("Error fetching recomendations:", error);
        return { tracks: [], queueHash: 'default' } as HashedIMusicTrackList;
    }
}

export interface MusicStatsPayload {
    totalWatchMinutes: number;
    completionRate: number;
    heavyRotation: Array<{
        id: string;
        title: string;
        artist: string;
        playCount: number;
        customCoverUri: string;
    }>;
    weeklyGraphData: Array<{
        dayName: string;
        minutes: number;
    }>;
}

export const fetchUserMetricsDashboard = async (db: SQLiteDatabase): Promise<MusicStatsPayload> => {
    try {
        const topTracksQuery = `
            SELECT 
              m.id, m.title, m.customCoverUri, m.filename, m.artist, ma.playCount,
              SUM(ma.totalListeningSeconds) OVER() as globalSeconds,
              SUM(ma.playCount) OVER() as globalPlays,
              SUM(ma.completedCount) OVER() as globalCompletions
            FROM music_analytics ma
            INNER JOIN Musics m ON ma.musicId = m.id
            WHERE ma.playCount > 0
            ORDER BY ma.playCount DESC
            LIMIT 5;
        `;
        const trackRows = await db.getAllAsync<any>(topTracksQuery);

        const sevenDaysAgoMs = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const graphQuery = `
            SELECT lastPlayedAt, totalListeningSeconds 
            FROM music_analytics 
            WHERE lastPlayedAt >= ${sevenDaysAgoMs}
        `;
        const graphRows = await db.getAllAsync<any>(graphQuery);

        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const weeklyGraphData = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));

            d.setHours(0, 0, 0, 0);
            return {
                timestamp: d.getTime(),
                dayName: daysOfWeek[d.getDay()],
                minutes: 0
            };
        });

        graphRows.forEach((row) => {
            if (!row.lastPlayedAt) return;

            const playedDate = new Date(row.lastPlayedAt);
            playedDate.setHours(0, 0, 0, 0);

            const targetDay = weeklyGraphData.find(d => d.timestamp === playedDate.getTime());
            if (targetDay) {
                targetDay.minutes += (row.totalListeningSeconds / 60);
            }
        });

        if (trackRows.length === 0) {
            return { totalWatchMinutes: 0, completionRate: 0, heavyRotation: [], weeklyGraphData };
        }

        const metaRow = trackRows[0];
        const totalWatchMinutes = Math.round((metaRow.globalSeconds || 0) / 60);
        const completionRate = metaRow.globalPlays > 0
            ? Math.round((metaRow.globalCompletions / metaRow.globalPlays) * 100)
            : 0;

        const heavyRotation = trackRows.map(row => ({
            id: row.id,
            title: row.title || row.filename,
            artist: row.artist,
            customCoverUri: row.customCoverUri || defaultMusicArtWork,
            playCount: row.playCount
        }));

        return { totalWatchMinutes, completionRate, heavyRotation, weeklyGraphData };

    } catch (err) {
        console.error("Database analytics loading failed:", err);
        throw err;
    }
};