// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { ShortContextType } from '@/types/shorts';
import React from 'react';
import { SharedValue, useSharedValue } from 'react-native-reanimated';

export const ShortContext = React.createContext<ShortContextType>({
    isHolding: { value: false } as SharedValue<boolean>,
    handleHolding: () => { }
})

export default function ShortContextProvider({ children }: { children: React.ReactNode }) {
    const [showImage, setShowImage] = React.useState<boolean>(false);
    const isHolding = useSharedValue<boolean>(false);

    // Image preview
    const toggleImagePreview = React.useCallback(() => setShowImage(prev => !prev), []);
    const handleHolding = React.useCallback((val: boolean) => isHolding.value = val, [isHolding]);

    return (
        <ShortContext.Provider value={{
            isHolding: isHolding,
            handleHolding
        }}>
            {children}
        </ShortContext.Provider>
    )
}