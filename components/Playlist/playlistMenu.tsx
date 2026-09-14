// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { usePlaylist } from '@/hooks/usePlaylist';
import { pinPlayList } from '@/service/playlistdb';
import { useSQLiteContext } from 'expo-sqlite';
import { Cog, EllipsisVertical, ListMusic, Pin, Trash } from 'lucide-react-native';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Menu, MenuItem, MenuItemLabel } from '../ui/menu';

const PlaylistMenu = ({ onMusicListOpen, onEditPlayList, onRemovePlaylist }: { onMusicListOpen: () => void, onEditPlayList: () => void, onRemovePlaylist: () => void }) => {
    const db = useSQLiteContext();
    const { playlist } = usePlaylist();
    const [pin, setPin] = React.useState<0 | 1>(0);

    const handlePined = async () => {
        const pinValue = pin === 1 ? 0 : 1;
        const res = await pinPlayList(db, pinValue, playlist?.id!);
        if (res) setPin(pinValue);
    }

    React.useEffect(() => {
        setPin(playlist?.pined ?? 0);
    }, [playlist])
    return (
        <Menu
            className="bg-neutral-900 rounded-xl border border-neutral-800 p-1 w-44 right-2 shadow-2xl"
            offset={6}
            trigger={({ ...triggerProps }) => (
                <TouchableOpacity
                    className="flex-row items-center justify-center gap-1.5 bg-neutral-800 px-2 py-1.5 rounded-full border border-neutral-700 active:bg-neutral-700"
                    {...triggerProps}
                >
                    <EllipsisVertical size={12} color="#e5e5e5" />
                    <Text className="text-neutral-200 text-xs font-semibold tracking-wide">Options</Text>
                </TouchableOpacity>
            )}
        >
            <MenuItem
                key="Queue"
                textValue="Add to Queue"
                className="w-full min-w-0 px-2 py-1.5 flex-row items-center gap-2.5 rounded-lg active:bg-neutral-800"
                onPress={onMusicListOpen}
            >
                <ListMusic size={14} color="#818cf8" />
                <MenuItemLabel size="sm" className="text-neutral-200 font-medium text-sm tracking-wide">
                    Add Music
                </MenuItemLabel>
            </MenuItem>

            <MenuItem
                key="Favourite"
                textValue="Favourite"
                className="w-full min-w-0 px-2 py-1.5 flex-row items-center gap-2.5 rounded-lg active:bg-neutral-800"
                onPress={handlePined}
            >
                <Pin size={14} color="#fb7185" />
                <MenuItemLabel size="sm" className="text-neutral-200 font-medium text-sm tracking-wide">
                    {pin === 1 ? 'unpin' : 'Pin'}
                </MenuItemLabel>
            </MenuItem>

            <MenuItem
                key="Plugins"
                textValue="Plugins"
                className="w-full min-w-0 px-2 py-1.5 flex-row items-center gap-2.5 rounded-lg active:bg-neutral-800 border-b border-neutral-800 mb-0.5 pb-2"
                onPress={onEditPlayList}
            >
                <Cog size={14} color="#fbbf24" />
                <MenuItemLabel size="sm" className="text-neutral-200 font-medium text-sm tracking-wide">
                    Edit
                </MenuItemLabel>
            </MenuItem>

            <MenuItem
                key="Remove"
                textValue="Remove"
                className="w-full min-w-0 px-2 py-1.5 flex-row items-center gap-2.5 rounded-lg active:bg-red-950/40 mt-0.5"
                onPress={onRemovePlaylist}
            >
                <Trash size={14} color="#f87171" />
                <MenuItemLabel size="sm" className="text-red-400 font-medium text-sm tracking-wide">
                    Remove
                </MenuItemLabel>
            </MenuItem>
        </Menu>
    );
};

export default PlaylistMenu;