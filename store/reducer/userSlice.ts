// Copyright (c) 2026 Raj
// See LICENSE for details.

import { defaultAvtar } from "@/utils/constants";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface User {
    name: string,
    avatar: string | null,
}

const initialState: User = {
    name: 'default',
    avatar: defaultAvtar,
}


const userSlice = createSlice({
    name: 'user',
    initialState: initialState,

    reducers: {
        setName: (state, action: PayloadAction<string>) => {
            state.name = action.payload;
        },
        setAvatar: (state, action: PayloadAction<string>) => {
            state.avatar = action.payload;
        },
        resetUser: (state) => {
            state.name = '';
            state.avatar = defaultAvtar;
        }
    }
})

export default userSlice.reducer;
export const { setName, setAvatar, resetUser } = userSlice.actions;
