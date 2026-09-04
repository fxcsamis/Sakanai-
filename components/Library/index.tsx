// Copyright (c) 2026 Raj
// See LICENSE for details.

import { NavBar } from "@/config/viewRegistry/navbar";
import { useRefresh } from "@/hooks/useRefresh";
import Renderer from "@/renderer/renderer";
import { getPlayList } from "@/service/playlistdb";
import { PlayList } from "@/types/database";
import { useSQLiteContext } from "expo-sqlite";
import React from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import FocusAwareStatusBar from "../common/FocusAwareStatusBar";
import CreatePlayList from "./CreatePlayList";
import Library from "./Library";

export default function index() {
    const db = useSQLiteContext();
    const { onRefresh, playlistRefresh } = useRefresh();
    const [refresh, setRefresh] = React.useState<boolean>(false);
    const [open, setOpen] = React.useState<boolean>(false);
    const [playList, setPlayList] = React.useState<PlayList[]>([]);
    const [sort, setSort] = React.useState<0 | 1>(0);

    const loadPlayList = async () => {
        const result = await getPlayList(db, sort);
        if (result && result.length !== 0) {
            setPlayList(result);
        }
    };

    const navSeen = {
        ...NavBar["nav"],
        children: [
            { key: "NavGreet" },
            { key: "NavChip", props: { text: "Library" } },
        ],
    };

    const handleSort = React.useCallback(() => {
        setSort(prev => {
            return prev === 0 ? 1 : 0;
        })
    }, [])

    const handleRefresh = async () => {
        setRefresh(true);
        await loadPlayList();
        await onRefresh();
        setRefresh(false);
    };

    React.useEffect(() => {
        loadPlayList();
    }, []);

    React.useEffect(() => {
        loadPlayList()
    }, [sort, playlistRefresh])

    const handleOpen = React.useCallback(() => setOpen((prev) => !prev), []);
    return (
        <>
            <View className="flex-1 bg-white dark:bg-[#121212]">
                <FocusAwareStatusBar style="auto" />
                <Renderer scene={navSeen} />
                <ScrollView
                    contentContainerStyle={{ gap: 20, paddingBottom: 10 }}
                    className="flex-1 px-6 py-2"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refresh} onRefresh={handleRefresh} tintColor="#B3B3B3" />
                    }
                >
                    <Library onCreateNew={handleOpen} playList={playList} onSort={handleSort} sort={sort} />
                </ScrollView>
            </View>

            <CreatePlayList isVisible={open} onClose={handleOpen} onRefresh={handleRefresh} />
        </>
    );
}