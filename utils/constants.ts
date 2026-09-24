// Copyright (c) 2026 Raj
// See LICENSE for details.

import { Image } from "react-native";

export const defaultMusicArtWork: string = Image.resolveAssetSource(
  require("@/assets/arise/arise.png"),
).uri;

export const defaultPlayListCover: string =
  "https://res.cloudinary.com/dcyn3ewpv/image/upload/v1780313890/default-playlist_krm5zv.png";

export const defaultPlayList = 'default'

export const defaultAvtar = 'https://res.cloudinary.com/dcyn3ewpv/image/upload/v1780825511/WhatsApp_Image_2026-05-24_at_13.44.14_bfle0n.jpg'

// Shared "Sunset" custom theme colors (the warm peach/brown look used across the app
// when the user selects the custom theme from Settings > Appearance).
export const customThemeColors = {
  light: '#FDF0E7',
  dark: '#241C18',
};

// Space the floating bottom tab bar takes (bar + gap). Screens add it as bottom padding.
export const TAB_BAR_SPACE = 84;
