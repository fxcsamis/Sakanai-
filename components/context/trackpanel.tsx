// Copyright (c) 2026 Raj 
// See LICENSE for details.

import React from 'react';

export const TrackPanelContext = React.createContext({
    open: false,
    onClose: () => { },
    onOpen: () => { }
})

export default function trackpanelProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState<boolean>(false);
    const handleClose = () => setOpen(false);
    const handleOpen = () => setOpen(true);
    return (
        <TrackPanelContext.Provider value={{
            open, onClose: handleClose, onOpen: handleOpen
        }}>
            {children}
        </TrackPanelContext.Provider>
    )
}