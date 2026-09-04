// Copyright (c) 2026 Raj 
// See LICENSE for details.

import React, { createContext } from 'react';
import { ColorSchemeName } from 'react-native';

export enum AppTheme {
    'light' = 'light', 'dark' = 'dark'
}
export const AppThemeContext = createContext<{ theme: AppTheme, setTheme: (theme: AppTheme) => void }>({
    theme: AppTheme.light,
    setTheme: (theme: AppTheme) => { }
})

export default function AppThemeProvider({ children, colorTheme }: { children: React.ReactNode, colorTheme: ColorSchemeName }) {
    const [theme, setTheme] = React.useState<AppTheme>(AppTheme.light);

    const handleSetTheme = (t: AppTheme) => setTheme(t);
    return (
        <AppThemeContext.Provider value={{ setTheme: handleSetTheme, theme }}>
            {children}
        </AppThemeContext.Provider>
    )
}