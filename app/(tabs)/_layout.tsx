// Copyright (c) 2026 Raj 
// See LICENSE for details.

import AppDrawer from "@/components/common/AppDrawer";
import CustomeTab from "@/components/common/CustomeTab";
import { useThemePreference } from "@/components/context/themePreference";
import TrackpanelProvider from "@/components/context/trackpanel";
import Track from "@/components/track";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { setDatabase } from "@/service/database-instance";
import { setCurrentIndex } from "@/store/reducer/trackplayerSlice";
import { customThemeColors } from "@/utils/constants";
import { usePathname } from "expo-router";
import { TabList, Tabs, TabSlot, TabTrigger } from "expo-router/ui";
import { useSQLiteContext } from "expo-sqlite";
import { Home, Library, Video } from "lucide-react-native";
import { useColorScheme } from "nativewind";
import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useActiveTrack } from "react-native-track-player";

export const AppDrawerContext = React.createContext({
    open: false,
    onClose: () => { },
    onOpen: () => { }
});

export default function TabLayout() {
    const db = useSQLiteContext();
    const insets = useSafeAreaInsets();
    const [open, setOpen] = React.useState<boolean>(false);
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const { isCustomTheme } = useThemePreference();
    const track = useActiveTrack();
    const trackSlice = useAppSelector(state => state.trackReducer);
    const dispatch = useAppDispatch();
    const pathname = usePathname();

    // Same background the screens use, so the gap around the floating bar blends in (no black strip)
    const pageBg = isCustomTheme
        ? (isDark ? customThemeColors.dark : customThemeColors.light)
        : (isDark ? '#121212' : '#FFFFFF');

    // Floating pill colours: slightly different from the page so the capsule stays visible
    const pill = isCustomTheme
        ? (isDark
            ? { bg: '#33261F' }
            : { bg: '#F8E3D3' })
        : (isDark
            ? { bg: '#1E1E1E' }
            : { bg: '#F1F1F3' });

    const handleClose = () => setOpen(false);
    const handleOpen = () => setOpen(true);

    React.useEffect(() => {
        if (!track) return;

        const queue = trackSlice.queue;
        const idx = queue.findIndex(item => item.musicId === track.mediaId);
        if (typeof idx === 'undefined' || typeof idx === null || idx === -1) return;

        if (idx === trackSlice.currentIndex) return;
        dispatch(setCurrentIndex(idx));

    }, [track]);

    React.useEffect(() => {
        setDatabase(db);
    }, [db]);

    return (
        <>
            <TrackpanelProvider>
                <Tabs style={{ flex: 1, backgroundColor: pageBg }}>
                    <AppDrawerContext.Provider value={{ open, onClose: handleClose, onOpen: handleOpen }}>
                        <TabSlot />
                    </AppDrawerContext.Provider>

                    <TabList
                        style={{
                            marginHorizontal: 16,
                            marginTop: 6,
                            marginBottom: Math.max(insets.bottom, 10),
                            backgroundColor: pill.bg,
                            overflow: 'hidden',
                        }}
                        className='flex-row items-center justify-around px-3 py-1.5 rounded-[28px]'
                    >
                        <TabTrigger name="setting" href={'/setting'} style={{ display: 'none' }} />
                        <TabTrigger name="music library" href={'/(tabs)/music_library'} style={{ display: 'none' }} />
                        <TabTrigger name="Search" href={"/search"} style={{ display: 'none' }} />
                        {/* <TabTrigger name="playlist" href={'/(tabs)/playlist'} style={{ display: 'none' }} /> */}
                        <TabTrigger name="index" href={"/home"}>
                            <CustomeTab name="Music" Icon={Home} isActive={pathname.startsWith('/home')} />
                        </TabTrigger>

                        <TabTrigger name="Videos" href={"/videos"}>
                            <CustomeTab name="Videos" Icon={Video} isActive={pathname.startsWith('/videos')} />
                        </TabTrigger>

                        <TabTrigger name="Vibes" href={"/shorts"}>
                            <CustomeTab name="Shorts" image={isDark ? require('@/assets/arise/shorts-dark.png') : require('@/assets/arise/shorts.png')} isActive={pathname.startsWith('/shorts')} />
                        </TabTrigger>

                        <TabTrigger name="Library" href={"/library"}>
                            <CustomeTab name="Library" Icon={Library} isActive={pathname.startsWith('/library')} />
                        </TabTrigger>
                    </TabList>
                </Tabs>
                <AppDrawer onClose={handleClose} open={open} />
                <Track />
            </TrackpanelProvider>
        </>
    );
}