// Copyright (c) 2026 Raj
// See LICENSE for details.

export type DemoVideo = {
    id: string;
    youtubeId: string;
    title: string;
    channel: string;
    duration: string;
    views: string;
};

// Demo/placeholder content — real, freely licensed short films (Blender Foundation
// open movie projects) used purely to showcase the thumbnail + playback UI.
export const demoVideos: DemoVideo[] = [
    {
        id: '1',
        youtubeId: 'aqz-KE-bpKQ',
        title: 'Big Buck Bunny — 4K 60fps',
        channel: 'Blender Foundation',
        duration: '10:34',
        views: '2.1M views',
    },
    {
        id: '2',
        youtubeId: 'CgsabqDxf-4',
        title: 'Sintel — Official Trailer',
        channel: 'Blender Foundation',
        duration: '1:31',
        views: '5.4M views',
    },
    {
        id: '3',
        youtubeId: 'R6MlUcmOul8',
        title: 'Tears of Steel — 4K',
        channel: 'Blender Foundation',
        duration: '12:14',
        views: '1.8M views',
    },
    {
        id: '4',
        youtubeId: 'MFg8mBaMoPs',
        title: "Elephants Dream — Enhanced",
        channel: 'Blender Foundation',
        duration: '10:53',
        views: '3.2M views',
    },
    {
        id: '5',
        youtubeId: 'YE7VzlLtp-4',
        title: 'Big Buck Bunny — Full Film',
        channel: 'Blender Foundation',
        duration: '9:56',
        views: '4.7M views',
    },
];
