// Copyright (c) 2026 Raj
// See LICENSE for details.

import { HashedIMusicTrackList, IMusicTrack } from "@/types/database";
import * as Crypto from "expo-crypto";
import { SQLiteDatabase } from "expo-sqlite";
import { LyricsTable } from "./lyricsdb";
import { initMusicAnalyticsDB, initRecentPlaysDB } from "./musicAnalyticsdb";
import { PlayListMusicTable, PlayListTable } from "./playlistdb";
import createQueueHash from "./queueHash";

export const InitiateDataBase = async (db: SQLiteDatabase) => {
  // const TARGET_DATABASE_VERSION = 4;

  // await db.execAsync("PRAGMA journal_mode = 'wal';");

  // const result = await db.getFirstAsync<{ user_version: number }>(
  //     'PRAGMA user_version'
  // );

  // const currentVersion = result?.user_version ?? 3;

  // if (currentVersion >= TARGET_DATABASE_VERSION) {
  //     return;
  // }

  await initiateTable(db);

  // await db.execAsync(`PRAGMA user_version = ${TARGET_DATABASE_VERSION}`);
};

const initiateTable = async (db: SQLiteDatabase) => {
  try {
    await db.execAsync(`
        CREATE TABLE IF NOT EXISTS Musics (
            id TEXT PRIMARY KEY NOT NULL,
            uri TEXT NOT NULL,
            filename TEXT NOT NULL,
            title TEXT,
            artist TEXT DEFAULT 'Unknown Artist',
            album TEXT DEFAULT 'Unknown Album',
            albumArtist TEXT,
            albumId TEXT,
            duration REAL,
            trackNumber INTEGER DEFAULT 0,
            year INTEGER,
            artwork TEXT, 
            isLiked INTEGER DEFAULT 0,
            creationTime INTEGER,
            modificationTime INTEGER,
            customCoverUri TEXT,
            customVideoUri TEXT,
            customVideoFileName TEXT,
            visible INTEGER DEFAULT 1,
            lyricsId TEST DEFAULT NULL,
            youtube_uri TEXT,

            FOREIGN KEY (lyricsId) REFERENCES Lyrics(id) ON DELETE SET NULL
        );
    `);

    await db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_musics_artist ON Musics(artist);
        CREATE INDEX IF NOT EXISTS idx_musics_album ON Musics(album);
        CREATE INDEX IF NOT EXISTS idx_musics_isLiked ON Musics(isLiked);
    `);

    await LyricsTable(db);
    await PlayListTable(db);
    await PlayListMusicTable(db);
    await initMusicAnalyticsDB(db);
    await initRecentPlaysDB(db);
  } catch (error) {
    console.error(`Error while Initiate Musics db `, error);
  }
};

const migrateV1ToV2 = async (db: SQLiteDatabase) => {
  try {
    await db.execAsync(`
            ALTER TABLE Musics ADD COLUMN uri TEXT NOT NULL DEFAULT '';
            ALTER TABLE Musics ADD COLUMN title TEXT;
            ALTER TABLE Musics ADD COLUMN artist TEXT DEFAULT 'Unknown Artist';
            ALTER TABLE Musics ADD COLUMN album TEXT DEFAULT 'Unknown Album';
            ALTER TABLE Musics ADD COLUMN albumArtist TEXT;
            ALTER TABLE Musics ADD COLUMN trackNumber INTEGER DEFAULT 0;
            ALTER TABLE Musics ADD COLUMN year INTEGER;
            ALTER TABLE Musics ADD COLUMN artwork TEXT;
        `);

    await db.execAsync(`
            CREATE INDEX IF NOT EXISTS idx_musics_artist ON Musics(artist);
            CREATE INDEX IF NOT EXISTS idx_musics_album ON Musics(album);
            CREATE INDEX IF NOT EXISTS idx_musics_isLiked ON Musics(isLiked);
        `);
  } catch (e) {
    console.error("Migration from V1 to V2 failed:", e);
  }
};

export const createMusic = async (music: IMusicTrack, db: SQLiteDatabase) => {
  try {
    await db.runAsync(
      `INSERT OR IGNORE INTO Musics (
                id, uri, filename, title, artist, album, albumArtist, albumId, 
                duration, trackNumber, year, isLiked, creationTime, 
                modificationTime, customCoverUri, customVideoUri, customVideoFileName, visible
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      music.id,
      music.uri,
      music.filename,
      music.title,
      music.artist,
      music.album,
      music.albumArtist,
      music.albumId,
      music.duration,
      music.trackNumber,
      music.year,
      music.isLiked ?? 0,
      music.creationTime,
      music.modificationTime,
      music.customCoverUri ?? null,
      music.customVideoUri ?? null,
      music.customVideoFileName ?? null,
      1,
    );
  } catch (error) {
    console.error("Failed to insert music row into SQLite:", error);
  }
};

export const createMultipleMusics = async (
  musics: IMusicTrack[],
  db: SQLiteDatabase,
) => {
  if (!musics || musics.length === 0) return;

  try {
    await db.withTransactionAsync(async () => {
      const statement = await db.prepareAsync(
        `INSERT OR IGNORE INTO Musics (
                    id, uri, filename, title, artist, album, albumArtist, albumId, 
                    duration, trackNumber, year, isLiked, creationTime, 
                    modificationTime, customCoverUri, customVideoUri, customVideoFileName, visible
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
      );

      try {
        for (const music of musics) {
          await statement.executeAsync([
            music.id,
            music.uri,
            music.filename,
            music.title,
            music.artist,
            music.album,
            music.albumArtist,
            music.albumId,
            music.duration,
            music.trackNumber,
            music.year,
            music.isLiked ?? 0,
            music.creationTime,
            music.modificationTime,
            music.customCoverUri ?? null,
            music.customVideoUri ?? null,
            music.customVideoFileName ?? null,
            1,
          ] as any[]);
        }
      } finally {
        await statement.finalizeAsync();
      }
    });
  } catch (error) {
    console.error("Failed batch insertion of tracks into SQLite:", error);
  }
};

const getHash = () => Crypto.randomUUID();
// --------- //
export const getAllMusics = async (
  db: SQLiteDatabase,
): Promise<HashedIMusicTrackList> => {
  try {
    const result = await db.getAllAsync<IMusicTrack>(`
        SELECT 
            Musics.*, 
            Musics.id as musicId,
            Lyrics.name AS lyricsName, 
            Lyrics.uri AS lyricsUri
        FROM Musics
        LEFT JOIN Lyrics ON Musics.lyricsId = Lyrics.id
        ORDER BY Musics.modificationTime DESC;
    `);

    const hash = await createQueueHash(result);
    return { tracks: result, queueHash: hash };
  } catch (error) {
    console.error("Failed getting music from SQLite:", error);
    return { tracks: [], queueHash: getHash() };
  }
};

export const getMusic = async (
  db: SQLiteDatabase,
  musicId: string,
): Promise<IMusicTrack | null> => {
  try {
    const result = await db.getFirstAsync<any>(
      `
            SELECT 
                Musics.*, 
                Musics.id as musicId,
                Lyrics.name AS lyricsName, 
                Lyrics.uri AS lyricsUri
            FROM Musics
            LEFT JOIN Lyrics ON Musics.lyricsId = Lyrics.id
            WHERE Musics.id = ?;
        `,
      [musicId],
    );

    return result;
  } catch (error) {
    console.error("Failed getting music from SQLite:", error);
    return null;
  }
};

interface UpdateMusic {
  title: string;
  artist: string;
  youtube_uri?: string | null;
  lyricsId?: string | null;
  customCoverUri?: string | null;
  customVideoUri?: string | null;
  customVideoFileName?: string | null;
}

export const updateMusicdb = async (
  db: SQLiteDatabase,
  musicId: string,
  fields: UpdateMusic,
): Promise<IMusicTrack | null> => {
  try {
    if (!musicId) return null;

    const filteredFields = Object.fromEntries(
      Object.entries(fields).filter(([_, v]) => v !== null && v !== undefined),
    ) as UpdateMusic;

    const keys = Object.keys(filteredFields) as (keyof UpdateMusic)[];

    if (keys.length === 0) return null;

    const setClauses: string[] = [];
    const values: any[] = [];

    keys.forEach((key) => {
      setClauses.push(`${key} = ?`);
      values.push(filteredFields[key]);
    });

    setClauses.push("modificationTime = ?");
    values.push(Date.now());
    values.push(musicId);

    const sqlQuery = `UPDATE Musics SET ${setClauses.join(", ")} WHERE id = ?`;

    await db.runAsync(sqlQuery, values);

    return await getMusic(db, musicId);
  } catch (error) {
    console.error("Failed updating music from SQLite:", error);
    return null;
  }
};

export const hideMusicdb = async (
  db: SQLiteDatabase,
  visibility: 0 | 1,
  musicId: string,
) => {
  try {
    const value = visibility === 1 ? 0 : 1;
    const sql = `UPDATE Musics SET visible = ? WHERE id = ?`;
    await db.runAsync(sql, [value, musicId]);
  } catch (error) {
    console.error("Failed update visibility music from SQLite:", error);
    return null;
  }
};

export const removeMusicdb = async (db: SQLiteDatabase, musicId: string) => {
  try {
    const sql = `DELETE FROM Musics WHERE id = ?`;
    await db.runAsync(sql, musicId);
    return true;
  } catch (error) {
    console.error("Failed deleting music from SQLite:", error);
    return false;
  }
};

export const likeMusic = async (db: SQLiteDatabase, musicId: string, liked: 0 | 1) => {
  try {
    const sql = `UPDATE Musics SET isLiked = ${liked} WHERE id = ?`;

    await db.runAsync(sql, [musicId]);
    return true;
  } catch (error) {
    console.error("Failed like music from SQLite:", error);
    return false;
  }
}


export const hideAllMusic = async (db: SQLiteDatabase) => {
  try {
    const sql = `UPDATE Musics SET visible = 0`;
    const re = await db.runAsync(sql);
    return true;
  } catch (error) {
    console.error("Failed hide all music from SQLite:", error);
    return false;
  }
}
