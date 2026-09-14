import { PlaybackService } from "@/service/trackPlayerServices";
import TrackPlayer from "react-native-track-player";

let isRegistered = false;

if (!isRegistered) {
    TrackPlayer.registerPlaybackService(() => PlaybackService);
    isRegistered = true;
}