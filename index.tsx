// Copyright (c) 2026 Raj
// See LICENSE for details.

import "@/config/trackPlayerRegister";
import { registerRootComponent } from "expo";
import { ExpoRoot } from "expo-router";

export default function App() {
    const ctx = require.context("./app");
    return <ExpoRoot context={ctx} />
}

registerRootComponent(App);

