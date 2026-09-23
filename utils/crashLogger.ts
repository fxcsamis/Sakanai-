// Catches JS errors that the React ErrorBoundary can't see (worklet errors, effects,
// callbacks, promise rejections) and keeps the app alive so the reason can be shown on screen.
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CrashInfo = { message: string; stack: string; fatal: boolean; time: string; previous?: boolean };

const KEY = 'arise_last_crash';
let current: CrashInfo | null = null;
const listeners = new Set<(c: CrashInfo | null) => void>();

const emit = () => listeners.forEach((l) => l(current));

export const getCrash = () => current;

export const subscribeCrash = (fn: (c: CrashInfo | null) => void) => {
    listeners.add(fn);
    return () => { listeners.delete(fn); };
};

export const clearCrash = () => {
    current = null;
    AsyncStorage.removeItem(KEY).catch(() => { });
    emit();
};

export const loadPreviousCrash = async () => {
    try {
        const raw = await AsyncStorage.getItem(KEY);
        if (raw && !current) {
            current = { ...(JSON.parse(raw) as CrashInfo), previous: true };
            emit();
        }
    } catch { }
};

export function installCrashHandler() {
    const eu = (globalThis as any).ErrorUtils;
    if (!eu?.setGlobalHandler) return;
    const previousHandler = eu.getGlobalHandler?.();

    eu.setGlobalHandler((error: any, isFatal?: boolean) => {
        const info: CrashInfo = {
            message: String(error?.name ? `${error.name}: ${error.message}` : error?.message ?? error),
            stack: String(error?.stack ?? ''),
            fatal: !!isFatal,
            time: new Date().toISOString(),
        };
        current = info;
        AsyncStorage.setItem(KEY, JSON.stringify(info)).catch(() => { });
        emit();
        // Fatal errors are shown on screen instead of killing the app; non-fatal go to the default handler.
        if (!isFatal) previousHandler?.(error, isFatal);
    });
}
