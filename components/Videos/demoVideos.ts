// Copyright (c) 2026 Raj
// See LICENSE for details.

export type DemoVideo = {
    id: string;
    videoUrl: string;
    thumbnail: string;
    title: string;
    channel: string;
    duration: string;
    views: string;
};

// Demo/placeholder content — direct, freely licensed MP4 files (no YouTube
// embed involved), so playback is fully native and never breaks or shows
// YouTube's own bot-check screen.
export const demoVideos: DemoVideo[] = [
    {
        id: '1',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
        title: 'Big Buck Bunny',
        channel: 'Blender Foundation',
        duration: '9:56',
        views: '2.1M views',
    },
    {
        id: '2',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/Sintel.jpg',
        title: 'Sintel',
        channel: 'Blender Foundation',
        duration: '14:48',
        views: '5.4M views',
    },
    {
        id: '3',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/TearsOfSteel.jpg',
        title: 'Tears of Steel',
        channel: 'Blender Foundation',
        duration: '12:14',
        views: '1.8M views',
    },
    {
        id: '4',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
        title: 'Elephants Dream',
        channel: 'Blender Foundation',
        duration: '10:53',
        views: '3.2M views',
    },
    {
        id: '5',
        videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4',
        thumbnail: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/SubaruOutbackOnStreetAndDirt.jpg',
        title: 'Subaru Outback — Street & Dirt',
        channel: 'Google Media Test',
        duration: '0:31',
        views: '4.7M views',
    },
];
