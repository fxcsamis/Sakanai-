import React, { createContext } from 'react';
import { StatusBar, StatusBarStyle } from 'react-native';

export const StatusBarContext = createContext({
    setStatusBarTheme: (theme: StatusBarStyle) => { }
})

export default function statusBarContextProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = React.useState<StatusBarStyle>('dark-content');

    const handleSetTheme = (t: StatusBarStyle) => setTheme(t);
    return (
        <StatusBarContext.Provider value={{ setStatusBarTheme: handleSetTheme }}>
            <StatusBar barStyle={theme} animated />
            {children}
        </StatusBarContext.Provider>
    )
}