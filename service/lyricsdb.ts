// Copyright (c) 2026 Raj 
// See LICENSE for details.

import * as Crypto from "expo-crypto";
import { DocumentPickerAsset } from "expo-document-picker";
import { SQLiteDatabase } from "expo-sqlite";

const getId = () => Crypto.randomUUID();

export async function LyricsTable(db: SQLiteDatabase) {
    try {
        await db.execAsync(`
            CREATE TABLE IF NOT EXISTS Lyrics (
                id TEXT PRIMARY KEY NOT NULL,
                mimeType TEXT DEFAULT 'text/plain',
                name TEXT DEFAULT '',
                size INTEGER DEFAULT 0,
                uri TEXT,
                musicId TEXT UNIQUE
            );
        `);
    } catch (error) {
        console.error("Error while initiating Lyrics db:", error);
    }
}


/**1ea458b3-1bba-4ebe-8a56-ab9adabbb747
 * create lyrics
 */

export interface LyricsObject extends DocumentPickerAsset {
    musicId: string;
}

export async function createOrUpdateLyrics(
    lyrics: LyricsObject,
    db: SQLiteDatabase
) {
    try {
        const existingRecord = await db.getFirstAsync<{ id: string }>(
            "SELECT id FROM Lyrics WHERE musicId = ?",
            [lyrics.musicId]
        );

        const id = existingRecord ? existingRecord.id : getId();
        await db.runAsync(
            `
            INSERT INTO Lyrics (id, mimeType, name, size, uri, musicId)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(musicId)
            DO UPDATE SET
                mimeType = excluded.mimeType,
                name = excluded.name,
                size = excluded.size,
                uri = excluded.uri;
            `,
            id,
            lyrics.mimeType ?? null,
            lyrics.name,
            lyrics.size ?? null,
            lyrics.uri,
            lyrics.musicId
        );

        return id;
    } catch (error) {
        console.error("Error while creating/updating Lyrics -> db:", error);
        return null;
    }
}