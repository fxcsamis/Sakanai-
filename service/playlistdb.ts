// Copyright (c) 2026 Raj
// See LICENSE for details.

import { PlayList, PlayListMusic, PlayListRecomendation } from "@/types/database";
import { defaultPlayListCover } from "@/utils/constants";
import * as Crypto from "expo-crypto";
import { SQLiteDatabase } from "expo-sqlite";
import { saveMedia } from "./persistMedia";

const getId = () => Crypto.randomUUID();

export async function PlayListTable(db: SQLiteDatabase) {
  try {
    const sqlCommand = `
            CREATE TABLE IF NOT EXISTS PlayList (
                id TEXT PRIMARY KEY NOT NULL,
                title TEXT DEFAULT '',
                description TEXT DEFAULT '',
                cover TEXT ,
                pined INTEGER DEFAULT 0,
                createdAt INTEGER,
                updatedAt INTEGER
            )
        `;
    await db.execAsync(sqlCommand);
  } catch (error) {
    console.error("Error while initiating Playlist db:", error);
  }
}

export async function PlayListMusicTable(db: SQLiteDatabase) {
  try {
    const sqlCommand = `
        CREATE TABLE IF NOT EXISTS PlayList_MUSIC (
            id TEXT PRIMARY KEY NOT NULL,
            musicId TEXT NOT NULL,
            playlistId TEXT NOT NULL,
            position INTEGER NOT NULL DEFAULT 0,
            createdAt INTEGER,
            updatedAt INTEGER,

            FOREIGN KEY (musicId) REFERENCES Musics(id) ON DELETE CASCADE,
            FOREIGN KEY (playlistId) REFERENCES PlayList(id) ON DELETE CASCADE,

            UNIQUE (playlistId, musicId)
        )
    `;

    await db.execAsync(sqlCommand);
  } catch (error) {
    console.error("Error while initiating Playlist Music db:", error);
  }
}

interface CreatePlayList {
  db: SQLiteDatabase;
  title: string;
  description?: string;
  cover?: string | null;
}

export const createPlayList = async ({
  db,
  title,
  description,
  cover = defaultPlayListCover,
}: CreatePlayList) => {
  try {
    const id = getId();
    const now = Date.now();
    let permanentCover;
    if (cover) permanentCover = await saveMedia(cover, 'image', id);
    const finalCover = permanentCover || defaultPlayListCover;

    await db.runAsync(
      `
      INSERT INTO PlayList (
        id, title, description, cover, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?)
      `,
      [id, title, description ?? "", finalCover, now, now],
    );

    return id;
  } catch (error) {
    console.error("Error while creating playlist:", error);
    return null;
  }
};

export const getPlayList = async (db: SQLiteDatabase, sort: 0 | 1 = 1) => {
  try {
    const SORT = sort === 0 ? "DESC" : "ASC";
    const sqlCommand = `
      SELECT *
        FROM PlayList
        ORDER BY pined ${SORT}, updatedAt ${SORT}
    `;

    const playList = (await db.getAllAsync(sqlCommand)) as PlayList[];

    return playList;
  } catch (error) {
    console.error("Error while getting playlist:", error);
    return [];
  }
};

export const getPlayListById = async (db: SQLiteDatabase, id: string) => {
  try {
    const sqlCommand = `
      SELECT *
        FROM PlayList
        WHERE id = ?
    `;

    const playList = (await db.getFirstAsync(sqlCommand, [id])) as PlayList;

    return playList;
  } catch (error) {
    console.error("Error while getting playlist object:", error);
    return null;
  }
};

export interface PlayListByMusicId {
  id: string;
  title: string;
  cover: string;
  isAdded: 0 | 1;
}

/**
 * Get all playList by musicId
 * @param param0 
 * @returns 
 */
export const getAllPlayListByMusicId = async ({ db, musicId }: { db: SQLiteDatabase, musicId: string }): Promise<PlayListByMusicId[]> => {
  try {
    const sqlCommand = `
      SELECT id, title, cover, EXISTS (SELECT 1 FROM PlayList_MUSIC WHERE playlistId = pl.id AND musicId = ?) as isAdded FROM PlayList as pl
      ORDER BY pined DESC, updatedAt DESC
    `;

    const playList = (await db.getAllAsync(sqlCommand, [musicId])) as PlayListByMusicId[];

    return playList;
  } catch (error) {
    console.error("Error while getting playlist by musicId:", error);
    return [];
  }
}

interface UpdatePlayList {
  db: SQLiteDatabase;
  playList: {
    id: string;
    title: string;
    description?: string;
    cover?: string;
  };
}

export const updatePlayList = async ({ db, playList }: UpdatePlayList) => {
  try {
    if (!playList.id) return null;

    const filteredFields = Object.fromEntries(
      Object.entries(playList).filter(
        ([_, v]) => v !== null && v !== undefined,
      ),
    );

    const keys = Object.keys(filteredFields);

    if (keys.length === 0) return null;
    const setClauses: string[] = [];
    const values: any[] = [];

    keys.forEach((key) => {
      setClauses.push(`${key} = ?`);
      values.push(filteredFields[key]);
    });

    setClauses.push("updatedAt = ?");
    values.push(Date.now());

    values.push(playList.id);

    const sqlCommand = `UPDATE PlayList SET ${setClauses} WHERE id = ?`;
    await db.runAsync(sqlCommand, values);

    const playListObject = await db.runAsync(
      `SELECT * FROM PlayList WHERE id = ?`,
      playList.id,
    );
    return playListObject;
  } catch (error) {
    console.error("Error while updating playlist:", error);
    return null;
  }
};

export const removePlayList = async ({
  db,
  playlistId,
}: {
  db: SQLiteDatabase;
  playlistId: string;
}) => {
  try {
    await db.execAsync("BEGIN TRANSACTION");

    await db.runAsync(
      `
      DELETE FROM PlayList_MUSIC
      WHERE playlistId = ?
      `,
      [playlistId],
    );

    await db.runAsync(
      `
      DELETE FROM PlayList
      WHERE id = ?
      `,
      [playlistId],
    );

    await db.execAsync("COMMIT");

    return true;
  } catch (error) {
    await db.execAsync("ROLLBACK");
    console.error("Error while removing playlist:", error);
    return false;
  }
};

export const appendPlayListMusic = async ({
  db,
  musicId,
  playlistId,
}: {
  db: SQLiteDatabase;
  musicId: string;
  playlistId: string;
}) => {
  try {
    if (!musicId || !playlistId) return null;

    const existingRecord = await db.getFirstAsync<{ id: string }>(
      `
        SELECT id FROM PlayList_MUSIC 
        WHERE playlistId = ? AND musicId = ?
      `,
      [playlistId, musicId]
    );

    if (existingRecord) {
      return existingRecord.id;
    }

    const now = Date.now();
    const id = getId();

    const lastObject = await db.getFirstAsync<{ maxPosition: number }>(
      `
        SELECT MAX(position) as maxPosition
          FROM PlayList_MUSIC
          WHERE playlistId = ?
      `,
      [playlistId],
    );

    const position = (lastObject?.maxPosition ?? -1) + 1;

    const sqlCommand = `INSERT INTO PlayList_MUSIC (
      id, musicId, playlistId, position, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?)`;

    await db.runAsync(sqlCommand, [
      id,
      musicId,
      playlistId,
      position,
      now,
      now,
    ]);

    return id;
  } catch (error) {
    console.error("Error while append playlist music:", error);
    return null;
  }
};

export const setPlayListMusic = async ({
  db,
  musicIds,
  playlistId,
}: {
  db: SQLiteDatabase;
  musicIds: string[];
  playlistId: string;
}) => {
  try {
    if (!musicIds || !playlistId) return false;

    const now = Date.now();

    await db.withTransactionAsync(async () => {

      await db.runAsync(
        `DELETE FROM PlayList_MUSIC WHERE playlistId = ?`,
        [playlistId]
      );

      const sqlCommand = `INSERT INTO PlayList_MUSIC (
        id, musicId, playlistId, position, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?)`;

      for (let i = 0; i < musicIds.length; i++) {
        const musicId = musicIds[i];
        const recordId = getId();

        await db.runAsync(sqlCommand, [
          recordId,
          musicId,
          playlistId,
          i,
          now,
          now,
        ]);
      }
    });

    const playList = await getPlayListMusic(db, playlistId);

    return playList;
  } catch (error) {
    console.error("Error while resetting playlist music:", error);
    return null;
  }
};

export const removePlayListMusic = async ({
  db,
  musicId,
  playlistId,
}: {
  db: SQLiteDatabase;
  musicId: string;
  playlistId: string;
}) => {
  try {
    await db.runAsync(
      `
      DELETE FROM PlayList_MUSIC
      WHERE musicId = ? AND playlistId = ?
      `,
      [musicId, playlistId],
    );

    return true;
  } catch (error) {
    console.error("Error while removing playlist music:", error);
    return false;
  }
};

export const reorderPlaylistMusic = async ({
  db,
  items,
}: {
  db: SQLiteDatabase;
  items: { id: string }[];
}) => {
  const now = Date.now();

  try {
    await db.execAsync("BEGIN TRANSACTION");

    for (let i = 0; i < items.length; i++) {
      await db.runAsync(
        `
        UPDATE PlayList_MUSIC
        SET position = ?, updatedAt = ?
        WHERE id = ?
        `,
        [i, now, items[i].id],
      );
    }

    await db.execAsync("COMMIT");

    return true;
  } catch (error) {
    await db.execAsync("ROLLBACK");
    console.error("Failed to reorder playlist:", error);
    return false;
  }
};

export const getPlayListMusic = async (db: SQLiteDatabase, id: string) => {
  try {
    const sqlCommand = `
      SELECT * FROM PlayList_MUSIC
      WHERE playlistId = ?
      ORDER BY position ASC
    `;

    const result = (await db.getAllAsync(sqlCommand, [id])) as PlayListMusic[];
    return result;
  } catch (error) {
    console.error("Failed to fetching playlist Music:", error);
    return [];
  }
};

export const pinPlayList = async (db: SQLiteDatabase, pin: 0 | 1, playlistId: string) => {
  try {
    if (!playlistId) return false;

    const sqlCommand = `
      UPDATE PlayList SET pined = ?
      WHERE id = ?
    `;


    await db.runAsync(sqlCommand, [pin, playlistId]);
    return true;
  } catch (error) {
    console.error("Failed to pin playlist :", error);
    return false;
  }
}

/**
 * 
 * @param db
 * @returns 
 */
export const getPlayListRecomendation = async (db: SQLiteDatabase): Promise<PlayListRecomendation | null> => {
  try {
    const sqlCommand = `
        SELECT p.*,
        COUNT(plm.musicId) as numberOfMusic,
        SUM(ma.playCount) as totalPlayCount,
        SUM(ma.skipCount) as totalSkipCount,
        SUM(ma.completedCount) as totalCompletedCount,
        SUM(m.duration) as totalSeconds,

        SUM(ma.totalListeningSeconds) as totalListeningSeconds,
        SUM(m.isLiked) as numberOfLikes

        FROM PlayList p
        LEFT JOIN PlayList_MUSIC plm
            ON p.id = plm.playlistId

        LEFT JOIN Musics m
            ON plm.musicId = m.id

        LEFT JOIN music_analytics ma
            ON plm.musicId = ma.musicId

        GROUP BY p.id
    `;

    const playlists = (await db.getAllAsync(sqlCommand)) as (PlayListRecomendation & { numberOfLikes: number, numberOfMusic: number, totalSeconds: number, totalPlayCount: number, totalSkipCount: number, totalCompletedCount: number, totalListeningSeconds: number })[];

    /**
     * formula : 
     * score = each like worth 5 points
     * each music worth 2 points
     * each minute worth 1 point
     */
    const scoredPlaylists = playlists.map((playlist) => ({
      ...playlist,
      score: playlist.pined * 100 + playlist.numberOfLikes * 25 + playlist.totalPlayCount * 2 + playlist.totalCompletedCount * 10 - playlist.totalSkipCount * 5 + (playlist.totalListeningSeconds / (60 * 60))
    }));

    const result = scoredPlaylists.sort((a, b) => b.score - a.score)[0]

    if (!result) return null;

    return result
  } catch (error) {
    console.error("Error getting playlist recomendation:", error);
    return null;
  }
}