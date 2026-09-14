// Copyright (c) 2026 Raj
// See LICENSE for details.

import React from 'react';
import { View } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';

export const YouTubeEmbed = ({ id }: { id: string }) => {
  return (
    <View className="w-full rounded-[6px] overflow-hidden bg-[#050505] shadow-md my-4">
      <YoutubePlayer
        height={175}
        videoId={id}
        play={false}
        mute={true}
        initialPlayerParams={{
          controls: 1,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          iv_load_policy: 3,
        }}
      />
    </View>
  );
};