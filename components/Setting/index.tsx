// Copyright (c) 2026 Raj
// See LICENSE for detail

import { useRouter } from 'expo-router';
import { ArrowLeft, Cog } from 'lucide-react-native';
import React from 'react';
import { Pressable, ScrollView, Text, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import FocusAwareStatusBar from '../common/FocusAwareStatusBar';
import TermAndConditionSheet from '../common/TermAndConditionSheet';
import Settings from './Settings';

export default function index() {
    const router = useRouter();
    const [open, setOpen] = React.useState<boolean>(false);
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const handleOpen = React.useCallback(() => setOpen(prev => !prev), []);

    return (
        <>
            <View className='flex-1 bg-white dark:bg-[#121212]'>
                <FocusAwareStatusBar style='auto' />
                <SafeAreaView className='flex-1' edges={['top']}>
                    <View className='flex-row items-center justify-between px-5 py-3.5 border-b-[0.5px] border-slate-200 dark:border-[#282828]'>
                        <Pressable className="w-9 h-9 items-center justify-center rounded-xl bg-slate-50 dark:bg-[#181818] active:bg-slate-100 dark:active:bg-[#282828]" hitSlop={12} onPress={() => router.back()}>
                            <ArrowLeft size={18} color={isDark ? '#FFFFFF' : '#64748B'} />
                        </Pressable>
                        <Text className="text-slate-900 dark:text-white text-[15px] font-elms-med tracking-[0.3px]">Account & Settings</Text>
                        <Pressable className="w-9 h-9 items-center justify-center rounded-xl bg-slate-50 dark:bg-[#181818] active:bg-slate-100 dark:active:bg-[#282828]" hitSlop={12}>
                            <Cog size={18} color={isDark ? '#FFFFFF' : '#64748B'} />
                        </Pressable>
                    </View>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 20, paddingBottom: 60 }} className='flex-1 px-4 py-2 '>


                        <Settings onTerm={handleOpen} />
                    </ScrollView>
                </SafeAreaView>
            </View>
            <TermAndConditionSheet open={open} onClose={handleOpen} />
        </>
    )
}