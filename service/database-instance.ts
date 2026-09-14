// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { SQLiteDatabase } from "expo-sqlite";

let database: SQLiteDatabase | null = null;

export const setDatabase = (
    db: SQLiteDatabase
) => {
    database = db;
};

export const getDatabase = () => {
    if (!database) {
        throw new Error(
            "Database not initialized"
        );
    }

    return database;
};