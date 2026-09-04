// Copyright (c) 2026 Raj
// See LICENSE for details.

import React from 'react';
import TrackPlayer, {
    AndroidAudioContentType,
    AppKilledPlaybackBehavior,
    Capability,
} from 'react-native-track-player';

let isSetup = false;

export function useSetupPlayer() {
    const [isReady, setIsReady] = React.useState(false);

    React.useEffect(() => {
        async function setup() {
            if (isSetup) {
                setIsReady(true);
                return;
            }

            try {
                await TrackPlayer.setupPlayer({
                    androidAudioContentType: AndroidAudioContentType.Music,
                    minBuffer: 15,
                    maxBuffer: 50,
                    backBuffer: 30,
                });

                await TrackPlayer.updateOptions({
                    android: {
                        appKilledPlaybackBehavior:
                            AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
                    },
                    capabilities: [
                        Capability.Play,
                        Capability.Pause,
                        Capability.Stop,
                        Capability.SkipToNext,
                        Capability.SkipToPrevious,
                        Capability.SeekTo,
                    ],

                    compactCapabilities: [
                        Capability.Play,
                        Capability.Pause,
                        Capability.Stop,
                        Capability.SkipToNext,
                        Capability.SkipToPrevious,
                        Capability.SeekTo,
                    ],
                    progressUpdateEventInterval: 1,
                });

                isSetup = true;
                setIsReady(true);
            } catch (e) {
                setIsReady(true);
            }
        }

        setup();
    }, []);

    return isReady;
}