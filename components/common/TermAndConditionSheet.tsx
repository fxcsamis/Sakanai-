// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { Check, Database, Equal, Heart, Lock, Notebook, Sparkle } from "lucide-react-native";
import React from 'react';
import { ScrollView, Text, View, useColorScheme } from 'react-native';
import SheetProvider from '../ui/Sheet';


const TermAndCondition: { title: string, content: string, icon: React.ElementType }[] = [
    { icon: Database, title: "Local-First Experience", content: "Arise follows a local-first approach. Your music data, preferences, and settings primarily stay on your device and are not unnecessarily uploaded or shared." },
    { icon: Equal, title: "User Responsibility", content: "Users are responsible for the music and media they access through the app and must ensure they have the legal rights to use that content." },
    { icon: Lock, title: "Privacy", content: "Arise is designed with privacy in mind and does not intentionally sell or share personal user data with third parties." },
    { icon: Sparkle, title: "App Changes", content: "Features, UI, animations, and functionality may change over time as the app evolves and experiments with new ideas." },
    { icon: Heart, title: "Fair Use", content: "Users must not misuse, exploit, reverse engineer, or disrupt the application or its services." },
    { icon: Notebook, title: "Disclaimer", content: `Arise is provided "as is" without guarantees of uninterrupted performance, compatibility, or error-free operation.` },
    { icon: Check, title: "Acceptance", content: "By using Arise, you agree to these Terms & Conditions and any future updates made to them." }
];

export default function TermAndConditionSheet({ open, onClose }: { open: boolean, onClose: () => void }) {
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    return (
        <SheetProvider open={open} onClose={onClose}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                className='px-5 pt-2 pb-12 bg-white dark:bg-[#121212]'
                contentContainerStyle={{ paddingBottom: 48 }}
            >

                <View className='items-center mb-4 pt-2'>
                    <View className='bg-zinc-100 dark:bg-[#282828] rounded-2xl px-4 py-1.5 mb-4'>
                        <Text className='text-xs font-elms text-zinc-500 dark:text-[#B3B3B3] uppercase tracking-widest'>
                            Legal
                        </Text>
                    </View>

                    <Text className='text-4xl font-elms-bold text-zinc-900 dark:text-white tracking-tight text-center leading-tight'>
                        Terms &{'\n'}Conditions
                    </Text>

                    <View className='flex-row items-center mt-3 gap-2'>
                        <View className='h-px w-8 bg-zinc-200 dark:bg-[#282828]' />
                        <Text className='text-xs font-elms text-zinc-400 dark:text-[#B3B3B3]'>
                            Last updated May 7, 2026
                        </Text>
                        <View className='h-px w-8 bg-zinc-200 dark:bg-[#282828]' />
                    </View>
                </View>

                <Text className='font-elms text-center my-4 text-base text-zinc-600 dark:text-[#B3B3B3] leading-relaxed'>
                    Arise is a <Text className='font-elms-bold text-zinc-900 dark:text-white'>personal</Text> and experimental music player created by Raj for creativity, design exploration, and immersive music experiences.
                </Text>


                <View className='flex-row items-center mb-6'>
                    <View className='flex-1 h-px bg-zinc-100 dark:bg-[#282828]' />
                    <Text className='text-xs font-elms text-zinc-300 dark:text-[#535353] mx-3'>Policies</Text>
                    <View className='flex-1 h-px bg-zinc-100 dark:bg-[#282828]' />
                </View>

                {TermAndCondition.map((tac, index) => (
                    <View key={index}>
                        <View className='flex-row gap-4 mb-6'>
                            <View className='items-center'>
                                <View className='w-10 h-10 rounded-2xl bg-zinc-100 dark:bg-[#282828] items-center justify-center'>
                                    <tac.icon size={18} color={isDark ? "#FFFFFF" : "#3f3f46"} strokeWidth={1.5} />
                                </View>
                                {index < TermAndCondition.length - 1 && (
                                    <View className='w-px flex-1 bg-zinc-100 dark:bg-transparent mt-2' />
                                )}
                            </View>

                            <View className='flex-1 pt-1'>
                                <Text className='text-base font-elms-bold text-zinc-900 dark:text-white mb-1.5'>
                                    {tac.title}
                                </Text>
                                <Text className='font-elms text-sm text-zinc-500 dark:text-[#B3B3B3] leading-relaxed'>
                                    {tac.content}
                                </Text>

                                {index < TermAndCondition.length - 1 && (
                                    <View className='mt-6' />
                                )}
                            </View>
                        </View>
                    </View>
                ))}

                <View className='mt-2 items-center py-4 border-t border-zinc-100 dark:border-[#282828]'>
                    <Text className='text-xs font-elms text-zinc-400 dark:text-[#535353] text-center'>
                        Built with ♥ by Raj · Arise v1.0
                    </Text>
                </View>
            </ScrollView>
        </SheetProvider>
    );
}