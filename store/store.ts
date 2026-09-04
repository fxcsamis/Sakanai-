import { configureStore } from "@reduxjs/toolkit";
import TrackReducer from "./reducer/trackplayerSlice";
import UserReducer from "./reducer/userSlice";

export const store = configureStore({
    reducer: {
        trackReducer: TrackReducer,
        userReducer: UserReducer
    }
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch