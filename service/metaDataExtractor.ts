// Copyright (c) 2026 Raj
// See LICENSE for details.

import { IMusicTrack } from "@/types/database";
import { Buffer } from 'buffer';
import * as FileSystem from 'expo-file-system/legacy';

function encodeFileUri(uri: string): string {
    if (!uri.startsWith('file://')) return uri;
    return 'file://' + uri.slice(7).split('/').map(encodeURIComponent).join('/');
}

async function readBytes(uri: string, position: number, length: number): Promise<Buffer> {
    const b64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
        position,
        length,
    });
    return Buffer.from(b64, 'base64');
}


const TEXT_FRAMES = ['TIT2', 'TPE1', 'TALB', 'TPE2', 'TRCK', 'TDRC', 'TYER'];

function parseID3v2(buf: Buffer): Record<string, string> {
    const result: Record<string, string> = {};
    if (buf.toString('ascii', 0, 3) !== 'ID3') return result;

    const majorVersion = buf[3];
    const tagSize =
        ((buf[6] & 0x7f) << 21) | ((buf[7] & 0x7f) << 14) |
        ((buf[8] & 0x7f) << 7) | (buf[9] & 0x7f);

    const frameIdLen = majorVersion === 2 ? 3 : 4;
    const frameHeaderLen = majorVersion === 2 ? 6 : 10;
    let offset = 10;
    const end = Math.min(10 + tagSize, buf.length);

    while (offset + frameHeaderLen < end) {
        const frameId = buf.toString('ascii', offset, offset + frameIdLen);
        if (!frameId || frameId[0] === '\0') break;

        let frameSize = 0;
        if (majorVersion === 2) {
            frameSize = (buf[offset + 3] << 16) | (buf[offset + 4] << 8) | buf[offset + 5];
        } else if (majorVersion === 4) {
            frameSize = ((buf[offset + 4] & 0x7f) << 21) | ((buf[offset + 5] & 0x7f) << 14) |
                ((buf[offset + 6] & 0x7f) << 7) | (buf[offset + 7] & 0x7f);
        } else {
            frameSize = (buf[offset + 4] << 24) | (buf[offset + 5] << 16) |
                (buf[offset + 6] << 8) | buf[offset + 7];
        }

        offset += frameHeaderLen;
        if (frameSize <= 0 || offset + frameSize > end) break;

        const frameData = buf.slice(offset, offset + frameSize);
        const normalised = majorVersion === 2
            ? ({
                TT2: 'TIT2', TP1: 'TPE1', TAL: 'TALB', TP2: 'TPE2',
                TRK: 'TRCK', TYE: 'TDRC',
            }[frameId] ?? frameId)
            : frameId;

        if (TEXT_FRAMES.includes(normalised)) {
            const enc = frameData[0];
            const text = frameData.slice(1);
            result[normalised] = (enc === 1 || enc === 2)
                ? text.toString('utf16le').replace(/\0/g, '').trim()
                : text.toString('utf8').replace(/\0/g, '').trim();
        }

        offset += frameSize;
    }
    return result;
}

async function tryID3v1(uri: string): Promise<Record<string, string> | null> {
    try {
        const info = await FileSystem.getInfoAsync(uri);
        if (!info.exists || !('size' in info) || (info as any).size < 128) return null;

        const buf = await readBytes(uri, (info as any).size - 128, 128);
        if (buf.toString('ascii', 0, 3) !== 'TAG') return null;

        const readFixed = (start: number, len: number) =>
            buf.toString('latin1', start, start + len).replace(/\0/g, '').trim();

        return {
            title: readFixed(3, 30),
            artist: readFixed(33, 30),
            album: readFixed(63, 30),
            year: readFixed(93, 4),
        };
    } catch {
        return null;
    }
}

const ILST_MAP: Record<string, string> = {
    '©nam': 'title',
    '©ART': 'artist',
    '©alb': 'album',
    'aART': 'albumArtist',
    '©day': 'year',
    'trkn': 'trackNumber',
};

function findAtom(buf: Buffer, name: string, offset = 0, end?: number): number {
    end = end ?? buf.length;
    while (offset + 8 <= end) {
        const size = buf.readUInt32BE(offset);
        const type = buf.toString('ascii', offset + 4, offset + 8);
        if (size < 8) break;
        if (type === name) return offset;
        offset += size;
    }
    return -1;
}

function parseIlst(buf: Buffer, offset: number, end: number): Record<string, string> {
    const result: Record<string, string> = {};
    while (offset + 8 < end) {
        const atomSize = buf.readUInt32BE(offset);
        if (atomSize < 8 || offset + atomSize > end) break;

        const atomName = buf.toString('utf8', offset + 4, offset + 8);
        const key = ILST_MAP[atomName];

        if (key) {
            const dataOffset = offset + 8;
            if (dataOffset + 16 < offset + atomSize) {
                const dataSize = buf.readUInt32BE(dataOffset);
                const payloadStart = dataOffset + 16;
                const payloadEnd = dataOffset + dataSize;

                if (payloadEnd <= offset + atomSize) {
                    if (atomName === 'trkn') {
                        if (payloadEnd - payloadStart >= 4) {
                            result[key] = String(buf.readUInt16BE(payloadStart + 2));
                        }
                    } else {
                        result[key] = buf.toString('utf8', payloadStart, payloadEnd).replace(/\0/g, '').trim();
                    }
                }
            }
        }
        offset += atomSize;
    }
    return result;
}

async function extractM4ATags(uri: string): Promise<Record<string, string> | null> {
    try {
        const info = await FileSystem.getInfoAsync(uri);
        if (!info.exists) return null;
        const fileSize = (info as any).size as number;

        const chunkSize = Math.min(512 * 1024, fileSize);
        let buf = await readBytes(uri, 0, chunkSize);

        let moovOffset = findAtom(buf, 'moov');

        if (moovOffset === -1 && fileSize > chunkSize) {
            const tailStart = Math.max(0, fileSize - chunkSize);
            buf = await readBytes(uri, tailStart, fileSize - tailStart);
            moovOffset = findAtom(buf, 'moov');
        }
        if (moovOffset === -1) return null;

        const moovSize = buf.readUInt32BE(moovOffset);
        const moovEnd = moovOffset + moovSize;
        const udtaOffset = findAtom(buf, 'udta', moovOffset + 8, moovEnd);
        if (udtaOffset === -1) return null;

        const udtaSize = buf.readUInt32BE(udtaOffset);
        const udtaEnd = udtaOffset + udtaSize;
        const metaOffset = findAtom(buf, 'meta', udtaOffset + 8, udtaEnd);
        if (metaOffset === -1) return null;

        const metaSize = buf.readUInt32BE(metaOffset);
        const metaEnd = metaOffset + metaSize;
        const ilstOffset = findAtom(buf, 'ilst', metaOffset + 12, metaEnd);
        if (ilstOffset === -1) return null;

        const ilstSize = buf.readUInt32BE(ilstOffset);
        return parseIlst(buf, ilstOffset + 8, ilstOffset + ilstSize);
    } catch {
        return null;
    }
}

export const extractAudioMetadata = async (
    fileUri: string
): Promise<Partial<IMusicTrack> | null> => {
    const uri = encodeFileUri(fileUri);
    const isM4A = /\.m4a$/i.test(uri);

    try {
        if (isM4A) {
            const tags = await extractM4ATags(uri);
            if (!tags) return null;

            return {
                title: tags.title || null,
                artist: tags.artist,
                album: tags.album,
                albumArtist: tags.albumArtist || null,
                trackNumber: parseInt(tags.trackNumber, 10) || 0,
                year: parseInt(tags.year?.substring(0, 4), 10) || null,
            };
        }

        const header = await readBytes(uri, 0, 10);

        if (header.toString('ascii', 0, 3) === 'ID3') {
            const tagSize =
                ((header[6] & 0x7f) << 21) | ((header[7] & 0x7f) << 14) |
                ((header[8] & 0x7f) << 7) | (header[9] & 0x7f);

            const buf = await readBytes(uri, 0, 10 + tagSize);
            const tags = parseID3v2(buf);

            return {
                title: tags['TIT2'] || null,
                artist: tags['TPE1'],
                album: tags['TALB'],
                albumArtist: tags['TPE2'] || null,
                trackNumber: parseInt((tags['TRCK'] ?? '').split('/')[0], 10) || 0,
                year: parseInt((tags['TDRC'] ?? '').substring(0, 4), 10) || null,
            };
        }

        const v1 = await tryID3v1(uri);
        if (v1) {
            return {
                title: v1.title || null,
                artist: v1.artist,
                album: v1.album,
                albumArtist: null,
                trackNumber: 0,
                year: parseInt(v1.year, 10) || null,
            };
        }

        return null;
    } catch (err) {
        console.warn(`extractAudioMetadata failed for: ${fileUri}`, err);
        return null;
    }
};