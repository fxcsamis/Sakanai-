// Copyright (c) 2026 Raj
// See LICENSE for details.

import React from 'react';
import { DemoVideo } from '../Videos/demoVideos';

type VideoPlayerContextType = {
    activeVideo: DemoVideo | null;
    minimized: boolean;
    open: (video: DemoVideo) => void;
    minimize: () => void;
    expand: () => void;
    close: () => void;
};

export const VideoPlayerContext = React.createContext<VideoPlayerContextType>({
    activeVideo: null,
    minimized: false,
    open: () => { },
    minimize: () => { },
    expand: () => { },
    close: () => { },
});

export const useVideoPlayer = () => React.useContext(VideoPlayerContext);

export default function VideoPlayerProvider({ children }: { children: React.ReactNode }) {
    const [activeVideo, setActiveVideo] = React.useState<DemoVideo | null>(null);
    const [minimized, setMinimized] = React.useState(false);

    const open = React.useCallback((video: DemoVideo) => {
        setActiveVideo(video);
        setMinimized(false);
    }, []);

    const minimize = React.useCallback(() => setMinimized(true), []);
    const expand = React.useCallback(() => setMinimized(false), []);
    const close = React.useCallback(() => {
        setActiveVideo(null);
        setMinimized(false);
    }, []);

    return (
        <VideoPlayerContext.Provider value={{ activeVideo, minimized, open, minimize, expand, close }}>
            {children}
        </VideoPlayerContext.Provider>
    );
}
