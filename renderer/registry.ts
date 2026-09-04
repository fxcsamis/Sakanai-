// Copyright (c) 2026 Raj 
// See LICENSE for details.

import MiniPlayer from "@/components/common/MiniPlayer";
import NavBar, { ChipSnippts, GreetSnippts, TimeSnippts } from "@/components/common/NavBar";
import VertualFC from "@/components/common/VertualFC";
import GetStarted from "@/components/GetStarted";
import AriseLogo from "@/components/GetStarted/Arise";
import Home from "@/components/Home";
import MusicoftheDay from "@/components/Home/MusicOftheDay";
import Playlist from "@/components/Home/Playlist";
import Recent from "@/components/Home/Recent";
import Recommendations from "@/components/Home/Recommendations";
import Shorts from "@/components/Home/Shorts";
import Library from "@/components/Library";
import Search from "@/components/Search";
import SearchInput from "@/components/Search/SearchInput";
import SuggestGrids from "@/components/Search/SuggestGrids";
import { ComponentType } from "react";

export const sectionsRegistry: Record<string, ComponentType<any>> = {
    AriseLogo: AriseLogo,
    GetStarted: GetStarted,

    //? Nav
    NavBar: NavBar,
    NavGreet: GreetSnippts,
    NavTime: TimeSnippts,
    NavChip: ChipSnippts,

    //? home page
    Home: Home,
    Recent: Recent,
    Music_Of_The_Day: MusicoftheDay,
    Shorts: Shorts,
    Recommendations: Recommendations,
    Playlist: Playlist,

    //? Search
    Search: Search,
    SearchInput: SearchInput,
    SuggestGrids: SuggestGrids,

    //? Library
    Library: Library,

    //? miniplayer
    MiniPlayer: MiniPlayer,
    Virtual: VertualFC
}