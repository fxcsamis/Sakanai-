// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useMusic } from '@/hooks/useMusic';
import { useMusicLib } from '@/hooks/useMusicLib';
import { hideAllMusic, hideMusicdb, removeMusicdb } from '@/service/database';
import { IMusicTrack } from '@/types/database';
import { useSQLiteContext } from 'expo-sqlite';
import { Cog, EllipsisVertical, Eye, EyeClosed, ListMusic, Trash } from 'lucide-react-native';
import React from 'react';
import { Pressable, View, useColorScheme } from 'react-native';
import { Menu, MenuItem, MenuItemLabel } from '../ui/menu';

export default function MusicMenu({ musicId, onAddToPlayList }: { musicId: string, onAddToPlayList: () => void }) {
    const db = useSQLiteContext();
    const { musics, onMusicRefresh } = useMusic();
    const { closeSheet, setEditMusicId, openSheet } = useMusicLib();
    const [music, setMusic] = React.useState<IMusicTrack | null>(null);
    const [visibility, setVisibility] = React.useState<0 | 1>(1);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleEdit = () => {
        setEditMusicId(musicId);
        openSheet();
    }

    const handleHideMode = React.useCallback(async () => {
        if (!music) return;

        await hideMusicdb(db, visibility, music.id);
        setVisibility(prev => prev === 1 ? 0 : 1);
        closeSheet();
    }, [music])

    const handleDeleteMusic = React.useCallback(async () => {
        await removeMusicdb(db, musicId);
        closeSheet();
    }, [music])

    const handleHideAllMusic = React.useCallback(async () => {
        await hideAllMusic(db);
        await onMusicRefresh();
        closeSheet();
    }, [db, onMusicRefresh, closeSheet]);

    React.useEffect(() => {
        const track = musics.tracks.find(m => m.id === musicId);
        if (track) {
            setMusic(track);
            setVisibility(track.visible)

        }
    }, [musicId, musics]);


    return (
        <Menu
            className="bg-white dark:bg-[#282828] border border-zinc-100 dark:border-transparent rounded-xl shadow-lg shadow-zinc-200/80 dark:shadow-black/50 overflow-hidden min-w-[180px] right-10"
            offset={6}
            trigger={({ ...triggerProps }) => (
                <Pressable
                    {...triggerProps}
                    className="w-8 h-8 items-center justify-center rounded-full"
                >
                    <EllipsisVertical size={15} color={isDark ? "#B3B3B3" : "#71717a"} />
                </Pressable>
            )}
        >
            <MenuItem
                key="Queue"
                textValue="Add to Queue"
                className="px-4 py-3 flex-row items-center gap-3 active:bg-zinc-50 dark:active:bg-[#3E3E3E] border-b border-zinc-100 dark:border-[#3E3E3E]"
                onPress={onAddToPlayList}
            >
                <View className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 items-center justify-center">
                    <ListMusic size={14} color={isDark ? "#818cf8" : "#6366f1"} />
                </View>
                <MenuItemLabel size="sm" className="text-zinc-700 dark:text-white font-medium tracking-wide">
                    Add to Queue
                </MenuItemLabel>
            </MenuItem>

            {/* <MenuItem
                key="Favourite"
                textValue="Favourite"
                className="px-4 py-3 flex-row items-center gap-3 active:bg-zinc-50 dark:active:bg-[#3E3E3E] border-b border-zinc-100 dark:border-[#3E3E3E]"
            >
                <View className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-500/20 items-center justify-center">
                    <Heart size={14} color={isDark ? "#fb7185" : "#f43f5e"} />
                </View>
                <MenuItemLabel size="sm" className="text-zinc-700 dark:text-white font-medium tracking-wide">
                    Favourite
                </MenuItemLabel>
            </MenuItem> */}

            <MenuItem
                key="Hide"
                textValue="Hide"
                className="px-4 py-3 flex-row items-center gap-3 active:bg-zinc-50 dark:active:bg-[#3E3E3E] border-b border-zinc-100 dark:border-[#3E3E3E]"
                onPress={handleHideMode}
            >
                <View className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 items-center justify-center">
                    <Eye size={14} color={isDark ? "#34d399" : "#10b981"} />
                </View>
                <MenuItemLabel size="sm" className="text-zinc-700 dark:text-white font-medium tracking-wide">
                    {visibility === 1 ? 'Hide' : 'UnHide'}
                </MenuItemLabel>
            </MenuItem>

            <MenuItem
                key="HideAll"
                textValue="Hide All"
                className="px-4 py-3 flex-row items-center gap-3 active:bg-zinc-50 dark:active:bg-[#3E3E3E] border-b border-zinc-100 dark:border-[#3E3E3E]"
                onPress={handleHideAllMusic}
            >
                <View className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-500/20 items-center justify-center">
                    <EyeClosed size={14} color={isDark ? "#34d399" : "#10b981"} />
                </View>
                <MenuItemLabel size="sm" className="text-zinc-700 dark:text-white font-medium tracking-wide">
                    Hide All
                </MenuItemLabel>
            </MenuItem>



            <MenuItem
                key="Plugins"
                textValue="Plugins"
                className="px-4 py-3 flex-row items-center gap-3 active:bg-zinc-50 dark:active:bg-[#3E3E3E]"
                onPress={handleEdit}
            >
                <View className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/20 items-center justify-center">
                    <Cog size={14} color={isDark ? "#fbbf24" : "#f59e0b"} />
                </View>
                <MenuItemLabel size="sm" className="text-zinc-700 dark:text-white font-medium tracking-wide">
                    Edit
                </MenuItemLabel>
            </MenuItem>

            <MenuItem
                key="Share"
                textValue="Share"
                className="px-4 py-3 flex-row items-center gap-3 active:bg-red-50 dark:active:bg-red-900/30 border-b border-zinc-100 dark:border-[#3E3E3E]"
                onPress={handleDeleteMusic}
            >
                <View className="w-7 h-7 rounded-lg bg-red-50 dark:bg-red-500/20 items-center justify-center">
                    <Trash size={14} color={isDark ? "#f87171" : "#b91c1c"} />
                </View>
                <MenuItemLabel size="sm" className="text-zinc-700 dark:text-white font-medium tracking-wide">
                    Remove
                </MenuItemLabel>
            </MenuItem>
        </Menu>
    );
}