// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useCallback } from "react";
import TrackPlayer, { State, usePlaybackState } from "react-native-track-player";
import { useAppDispatch } from "./useRedux";

import { initializeCurrentSession } from "@/service/musicAnalytics";
import { addToQueue, clearQueue, cycleLoopMode, LoopMode, onCycleLoopMode, playAtIndex, playNext, removeFromQueue, setupQueue, skipToNext, skipToPrevious, toggleShuffle, TrackSourceType, updateMusic } from "@/store/reducer/trackplayerSlice";
import { AriseTrack } from "@/types/database";

export const useTrack = () => {
    const dispatch = useAppDispatch();
    const { state } = usePlaybackState();

    const isPlaying = state === State.Playing;

    const handleVolume = useCallback(async (v: number) => await TrackPlayer.setVolume(v), []);

    const handleSetupQueue = useCallback(
        ({ tracks, startIndex, playlistName, sourceId, sourceType, play = true, queueHash }: { tracks: AriseTrack[]; startIndex?: number, playlistName: string, sourceId: string | null, sourceType: TrackSourceType, play?: boolean, queueHash: string | null }) => {
            return dispatch(setupQueue({ tracks, startIndex, playlistName, sourceId, sourceType, play, queueHash }));
        },
        [dispatch]
    );

    const handlePlayAtIndex = useCallback(
        (index: number) => {
            return dispatch(playAtIndex(index));
        },
        [dispatch]
    );

    const handleSkipToNext = useCallback(() => {
        return dispatch(skipToNext());
    }, [dispatch]);

    const handleSkipToPrevious = useCallback(() => {
        return dispatch(skipToPrevious());
    }, [dispatch]);

    const handleAddToQueue = useCallback(
        (tracks: AriseTrack[]) => {
            return dispatch(addToQueue(tracks));
        },
        [dispatch]
    );

    const handlePlayNext = useCallback(
        (tracks: AriseTrack[]) => {
            return dispatch(playNext(tracks));
        },
        [dispatch]
    );

    const handleRemoveFromQueue = useCallback(
        (index: number) => {
            return dispatch(removeFromQueue(index));
        },
        [dispatch]
    );

    const handleCycleLoopMode = useCallback(() => {
        return dispatch(cycleLoopMode());
    }, [dispatch]);

    const handleUpdateMusic = useCallback((track: AriseTrack) => {
        return dispatch(updateMusic(track));
    },
        [dispatch]);

    const handleToggleShuffle = useCallback(() => {
        return dispatch(toggleShuffle());
    }, [dispatch]);

    const handleClearQueue = useCallback(() => {
        return dispatch(clearQueue());
    }, [dispatch]);

    const togglePlay = async () => {
        initializeCurrentSession();
        if (isPlaying) await TrackPlayer.pause();
        else await TrackPlayer.play();
    };

    const handleOnCycleLoopMode = useCallback((mode: LoopMode) => {
        return dispatch(onCycleLoopMode(mode))
    }, [dispatch]);

    const seekTo = async (seconds: number) => await TrackPlayer.seekTo(seconds);
    const pause = async () => {
        await initializeCurrentSession();
        await TrackPlayer.pause()
    };
    const play = async () => {
        await TrackPlayer.play();
        await initializeCurrentSession();
    }

    return {
        setupQueue: handleSetupQueue,
        playAtIndex: handlePlayAtIndex,
        skipToNext: handleSkipToNext,
        skipToPrevious: handleSkipToPrevious,
        addToQueue: handleAddToQueue,
        playNext: handlePlayNext,
        setTrackVolume: handleVolume,
        onCycleLoopMode: handleOnCycleLoopMode,
        removeFromQueue: handleRemoveFromQueue,
        cycleLoopMode: handleCycleLoopMode,
        updateMusic: handleUpdateMusic,
        toggleShuffle: handleToggleShuffle,
        clearQueue: handleClearQueue,
        togglePlay: togglePlay,
        seekTo: seekTo,
        play: play,
        pause: pause,
        isPlaying
    };
};