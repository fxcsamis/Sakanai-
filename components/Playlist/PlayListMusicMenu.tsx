// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useMusic } from '@/hooks/useMusic';
import { usePlaylist } from '@/hooks/usePlaylist';
import { likeMusic } from '@/service/database';
import { removePlayListMusic } from '@/service/playlistdb';
import { useSQLiteContext } from 'expo-sqlite';
import { EllipsisVertical, Heart, HeartOff, X } from 'lucide-react-native';
import React from 'react';
import { Pressable } from 'react-native';
import { Menu, MenuItem, MenuItemLabel } from '../ui/menu';

export default function PlayListMusicMenu({ isLiked, musicId, reload }: { isLiked: 0 | 1, musicId: string, reload: () => void }) {
    const db = useSQLiteContext();
    const { playlist } = usePlaylist();
    const { onMusicLike } = useMusic();
    const [like, setLike] = React.useState<0 | 1>(isLiked);

    const handleSetLike = (v: 0 | 1) => setLike(v);

    const handleLike = async () => {
        const setLike = like === 1 ? 0 : 1;
        const response = await likeMusic(db, musicId, setLike);

        if (response) {
            handleSetLike(setLike);
            onMusicLike(musicId, setLike);
        }
    }

    const handleRemove = async () => {
        if (!musicId || !playlist?.id) return;
        const response = await removePlayListMusic({
            db, musicId, playlistId: playlist?.id
        })

        if (response) reload();
    }

    React.useEffect(() => {
        setLike(isLiked);
    }, [isLiked])
    return (
        <Menu
            className="bg-neutral-900 rounded-xl border border-neutral-800 p-1 w-36 right-2 shadow-2xl"
            offset={6}
            trigger={({ ...triggerProps }) => (
                <Pressable
                    {...triggerProps}
                    hitSlop={14}
                    className="w-8 h-8 items-center justify-center rounded-full"
                >
                    <EllipsisVertical size={15} color="#71717a" />
                </Pressable>
            )}
        >

            <MenuItem
                key="Favourite"
                textValue="Favourite"
                className="w-full min-w-0 px-2 py-1.5 flex-row items-center gap-2.5 rounded-lg active:bg-neutral-800 border-b border-neutral-800 mb-0.5 pb-2"
                onPress={handleLike}
            >
                {like === 0 ? <Heart size={14} color="#fb7185" fill={'#fb7185'} /> : <HeartOff size={14} color={'white'} />}
                <MenuItemLabel size="sm" className="text-neutral-200 font-medium text-sm tracking-wide">
                    {like === 0 ? 'Like' : 'unlike'}
                </MenuItemLabel>
            </MenuItem>

            <MenuItem
                key="Share"
                textValue="Share"
                className="w-full min-w-0 px-2 py-1.5 flex-row items-center gap-2.5 rounded-lg active:bg-neutral-800"
                onPress={handleRemove}
            >
                <X size={14} color="#fb7185" />
                <MenuItemLabel size="sm" className="text-neutral-200 font-medium text-sm tracking-wide">
                    Remove
                </MenuItemLabel>
            </MenuItem>
        </Menu>
    );
}