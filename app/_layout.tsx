// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from "expo-font";
import { Stack } from 'expo-router';
import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import AppThemeProvider from '@/components/context/apptheme';
import MusicContextProvider from '@/components/context/music';
import RefreshProvider from '@/components/context/refresh';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { useSetupPlayer } from '@/hooks/useSetupPlayer';
import { InitiateDataBase } from '@/service/database';
import { store } from '@/store/store';
import { SQLiteProvider } from 'expo-sqlite';
import { useColorScheme } from 'nativewind';
import { Provider } from 'react-redux';


export default function Layout() {
  const isReady = useSetupPlayer();
  const [fontsLoaded] = useFonts({
    ElmsSans_400: require('@/assets/font/ElmsSans-Regular.ttf'),
    ElmsSans_500: require('@/assets/font/ElmsSans-Medium.ttf'),
    ElmsSans_700: require('@/assets/font/ElmsSans-Bold.ttf'),

    OldStandT_400: require('@/assets/font/OldStandardTT-Regular.ttf'),
    OldStandT_700: require('@/assets/font/OldStandardTT-Bold.ttf'),
  });
  const { colorScheme } = useColorScheme();

  if (!fontsLoaded || !isReady) return null;

  return (

    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <SQLiteProvider databaseName='arise_raj_sqlite.db' onInit={InitiateDataBase}>
            <AppThemeProvider colorTheme={colorScheme}>
              <MusicContextProvider>
                <RefreshProvider>
                  <GluestackUIProvider mode={colorScheme ?? "light"} style={{ flex: 1 }}>
                    <Stack screenOptions={{ headerShown: false }} >
                      <Stack.Screen name='index' />
                      <Stack.Screen name='(tabs)' />
                    </Stack>
                  </GluestackUIProvider>
                </RefreshProvider>
              </MusicContextProvider>
            </AppThemeProvider>
          </SQLiteProvider>
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}