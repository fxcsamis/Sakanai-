// Copyright (c) 2026 Raj 
// See LICENSE for details.

import * as FileSystem from 'expo-file-system';

export interface LyricLine {
    time: number; // milliseconds
    text: string;
}

export const LyricsService = {
    parse(rawText: string): LyricLine[] {
        try {
            if (!rawText) return [];

            const lines = rawText.split(/\r?\n/);
            const parsedResult: LyricLine[] = [];
            const timeTagRegex = /\[(\d{2}):(\d{2})[.:](\d{2,3})\]/g;

            lines.forEach((line) => {
                const tags = line.match(timeTagRegex);
                if (!tags) return;

                const cleanText = line.replace(timeTagRegex, '').trim();
                if (!cleanText) return; // Skip metadata [by:someone]

                tags.forEach((tag) => {
                    const matchRegex = /\[(\d{2}):(\d{2})[.:](\d{2,3})\]/;
                    const match = matchRegex.exec(tag);

                    if (match) {
                        const mins = parseInt(match[1], 10);
                        const secs = parseInt(match[2], 10);
                        const msStr = match[3];

                        // milliseconds
                        const ms = parseInt(msStr.padEnd(3, '0').slice(0, 3), 10);
                        const totalMs = (mins * 60 * 1000) + (secs * 1000) + ms;

                        parsedResult.push({
                            time: totalMs,
                            text: cleanText
                        });
                    }
                });
            });

            return parsedResult.sort((a, b) => a.time - b.time);

        } catch (error) {
            console.error("[LyricService] Industrial Engine failure loading asset:", error);
            return [];
        }
    },

    async loadLyricsFromFile(source: string): Promise<LyricLine[]> {
        try {
            const text = await new FileSystem.File(source).text();
            const rawText = await text.toString();
            const lyrics: LyricLine[] = this.parse(rawText);

            return lyrics;
        } catch (error) {
            console.error("[LyricService] Industrial Engine failure loading asset:", error);
            return [];
        }
    }
}

export function findActiveLyricIndex(lyrics: LyricLine[], currentPosition: number): number {
    let low = 0;
    let high = lyrics.length - 1;
    let result = -1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (lyrics[mid].time <= currentPosition) {
            result = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }
    return result;
}