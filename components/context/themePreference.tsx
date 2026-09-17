// Copyright (c) 2026 Raj
// See LICENSE for details.

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme as useNativewindColorScheme } from 'nativewind';
import React, { createContext, useContext } from 'react';
import { Appearance } from 'react-native';

export type ThemePreference = 'light' | 'dark' | 'system' | 'custom';

const STORAGE_KEY = 'arise_theme_preference';

const ThemePreferenceContext = createContext<{
    preference: ThemePreference;
    setPreference: (pref: ThemePreference) => void;
    isCustomTheme: boolean;
}>({
    preference: 'system',
    setPreference: () => { },
    isCustomTheme: false,
});

export const useThemePreference = () => useContext(ThemePreferenceContext);

export default function ThemePreferenceProvider({ children }: { children: React.ReactNode }) {
    const { setColorScheme } = useNativewindColorScheme();
    const [preference, setPreferenceState] = React.useState<ThemePreference>('system');

    const applyPreference = React.useCallback((pref: ThemePreference) => {
        if (pref === 'light' || pref === 'dark') {
            Appearance.setColorScheme(pref);
            setColorScheme(pref);
        } else {
            // 'system' and 'custom' both follow the device's light/dark setting;
            // 'custom' additionally swaps the app's base color palette (see customThemeColors).
            Appearance.setColorScheme(null);
            setColorScheme('system');
        }
    }, [setColorScheme]);

    React.useEffect(() => {
        (async () => {
            try {
                const saved = await AsyncStorage.getItem(STORAGE_KEY);
                const pref = (saved as ThemePreference | null) ?? 'system';
                setPreferenceState(pref);
                applyPreference(pref);
            } catch (error) {
                console.log('Failed loading theme preference:', error);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const setPreference = React.useCallback(async (pref: ThemePreference) => {
        setPreferenceState(pref);
        applyPreference(pref);
        try {
            await AsyncStorage.setItem(STORAGE_KEY, pref);
        } catch (error) {
            console.log('Failed saving theme preference:', error);
        }
    }, [applyPreference]);

    return (
        <ThemePreferenceContext.Provider value={{ preference, setPreference, isCustomTheme: preference === 'custom' }}>
            {children}
        </ThemePreferenceContext.Provider>
    );
}
