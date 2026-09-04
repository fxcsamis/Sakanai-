// Copyright (c) 2026 Raj
// See LICENSE for details.

import TrackPlayer, { Event } from 'react-native-track-player';
import { finalizeCurrentTrack, initializeCurrentSession } from './musicAnalytics';

export async function PlaybackService() {

    TrackPlayer.addEventListener(Event.RemotePlay, async () => {
        await TrackPlayer.play();
        await initializeCurrentSession();
    });
    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
    TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
    TrackPlayer.addEventListener(Event.RemoteNext, () => TrackPlayer.skipToNext());
    TrackPlayer.addEventListener(Event.RemotePrevious, () => TrackPlayer.skipToPrevious());

    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async (event) => {
        if (!event.lastTrack) return;

        const duration = event.lastTrack.duration ?? 0;
        const position = event.lastPosition ?? 0;
        await finalizeCurrentTrack(position, duration);
    });

    // Fired when seeking via notification scrubber
    TrackPlayer.addEventListener(Event.RemoteSeek, ({ position }) =>
        TrackPlayer.seekTo(position)
    );

    // Fired when the audio output changes (e.g. headphones unplugged)
    TrackPlayer.addEventListener(Event.RemoteDuck, async ({ paused, permanent }) => {
        if (permanent) {
            await TrackPlayer.stop();
        } else {
            paused ? await TrackPlayer.pause() : await TrackPlayer.play();
        }
    });
}