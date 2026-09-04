// Copyright (c) 2026 Raj 
// See LICENSE for details.

import React from 'react';
import { Pressable, Text, View } from 'react-native';
import TermAndConditionSheet from '../common/TermAndConditionSheet';

export default React.memo(function TermAndCondition() {
    const [open, setOpen] = React.useState<boolean>(false);
    const handleClose = () => {
        setOpen(false)
    };

    return (
        <>
            <View className='flex flex-row justify-center mt-4 items-center gap-2'>
                <Text className="text-black text-sm">
                    By continuing, accept our{" "}
                </Text>
                <Pressable className='w-fit h-fit' onPress={() => setOpen(true)}>
                    <Text className="text-blue-500 text-sm underline underline-offset-2">
                        Terms & Privacy Policy
                    </Text>
                </Pressable>
            </View>
            <TermAndConditionSheet open={open} onClose={handleClose} />
        </>
    )
})