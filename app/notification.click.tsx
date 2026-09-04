// Copyright (c) 2026 Raj
// See LICENSE for details.

import { Redirect } from "expo-router";

export default function NotificationClick() {
    return <Redirect href={{ pathname: "/(tabs)/home", params: { trackplayer: "true" } }} />;
}