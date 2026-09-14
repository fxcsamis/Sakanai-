// Copyright (c) 2026 Raj 
// See LICENSE for details.

import React, { createContext } from 'react';

interface MusicLib {
    editSheet: boolean;
    openSheet: () => void;
    closeSheet: () => void;

    editMusicId: string;
    setEditMusicId: (id: string) => void;
}

export const MusicLibContext = createContext<MusicLib>({
    editSheet: false,
    openSheet: () => { },
    closeSheet: () => { },
    editMusicId: '',
    setEditMusicId: (id: string) => { },
})

export default function musicLibProvider({ children }: { children: React.ReactNode }) {
    const [editSheet, setEditSheet] = React.useState<boolean>(false);
    const [editMusicId, setMusicId] = React.useState<string>('');

    const openSheet = () => setEditSheet(true);
    const closeSheet = () => setEditSheet(false);
    const handleEditMusicId = (id: string) => setMusicId(id);

    return (
        <MusicLibContext.Provider value={{ editSheet, openSheet, closeSheet, setEditMusicId: handleEditMusicId, editMusicId }}>
            {children}
        </MusicLibContext.Provider>
    )
}