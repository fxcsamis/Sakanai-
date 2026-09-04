// Copyright (c) 2026 Raj
// See LICENSE for details.

import { IMusicTrack, IPlayListMusicTrack, PlayListMusic } from "@/types/database";
import * as Crypto from "expo-crypto";

/**
 * 
 * @param tracks 
 * @returns hash
 */

export default async function createQueueHash(tracks: IMusicTrack[] | IPlayListMusicTrack[] | PlayListMusic[], random: boolean = false) {
    let trades = JSON.stringify(tracks);
    if (random) {
        trades += String(Math.random())
    }
    return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, trades);
}