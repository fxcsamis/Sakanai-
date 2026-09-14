import { Directory, File, Paths } from 'expo-file-system';

type MediaType = 'image' | 'video';

const FOLDERS: Record<MediaType, string> = {
    image: 'albumart',
    video: 'videos',
};

const getExtension = (
    uri: string,
    fallback: string
): string => {
    const match = uri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    return match?.[1]?.toLowerCase() ?? fallback;
};

const ensureDirectory = (dir: Directory) => {
    if (!dir.exists) {
        dir.create();
    }
};

const removeExistingFiles = (
    dir: Directory,
    musicId: string
) => {
    if (!dir.exists) return;

    for (const item of dir.list()) {
        if (
            item instanceof File &&
            item.name.startsWith(`${musicId}_`)
        ) {
            item.delete();
        }
    }
};

export async function saveMedia(
    cacheUri: string,
    type: MediaType,
    musicId: string
): Promise<string> {
    const folder = FOLDERS[type];
    const fallbackExt = type === 'image' ? 'jpg' : 'mp4';
    const ext = getExtension(cacheUri, fallbackExt);

    const dir = new Directory(Paths.document, folder);

    ensureDirectory(dir);

    removeExistingFiles(dir, musicId);

    const fileName = `${musicId}_${Date.now()}.${ext}`;

    const destFile = new File(dir, fileName);

    const sourceFile = new File(cacheUri);

    sourceFile.copy(destFile);

    return destFile.uri;
}

export async function saveLyrics(
    sourceUri: string,
    musicId: string
): Promise<string> {
    const dir = new Directory(Paths.document, 'lyrics');

    ensureDirectory(dir);

    removeExistingFiles(dir, musicId);

    const destFile = new File(
        dir,
        `${musicId}_${Date.now()}.lrc`
    );

    const sourceFile = new File(sourceUri);

    sourceFile.copy(destFile);

    return destFile.uri;
}