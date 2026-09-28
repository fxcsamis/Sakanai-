// Copyright (c) 2026 Raj
// See LICENSE for details.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import * as Crypto from 'expo-crypto';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { ArrowLeft, Copy, Share2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Pressable, Share, Text, ToastAndroid, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';

const STORAGE_KEY = 'arise_referral_code';

// Real, persisted, unique-per-install referral code and a real QR/native share sheet.
// There is no reward-tracking backend yet, so this does not claim any "X friends
// invited" stat - that would be fake without a server to actually count it.
export default function InviteFriend() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const [code, setCode] = React.useState<string | null>(null);

    React.useEffect(() => {
        (async () => {
            let existing = await AsyncStorage.getItem(STORAGE_KEY);
            if (!existing) {
                const random = await Crypto.getRandomBytesAsync(5);
                existing = Array.from(random).map((b) => b.toString(36)).join('').toUpperCase().slice(0, 8);
                await AsyncStorage.setItem(STORAGE_KEY, existing);
            }
            setCode(existing);
        })();
    }, []);

    const link = code ? Linking.createURL('invite', { queryParams: { code } }) : '';

    const copyLink = async () => {
        await Clipboard.setStringAsync(link);
        ToastAndroid.show('Invite link copied', ToastAndroid.SHORT);
    };

    const shareLink = () => {
        Share.share({ message: `Join me on Arise. Invite code ${code}: ${link}` });
    };

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#FAF8F3' }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <View className="flex-row items-center px-5 pt-2 pb-3">
                    <Pressable onPress={() => router.back()} hitSlop={10} className="w-9 h-9 items-center justify-center -ml-2">
                        <ArrowLeft size={20} color={isDark ? '#fff' : '#000'} />
                    </Pressable>
                    <Text className="text-[18px] font-elms-med text-black dark:text-white ml-2">Invite Friend</Text>
                </View>

                <View className="items-center px-8 pt-6">
                    <Text className="text-[13px] font-elms text-zinc-500 text-center mb-6">
                        Share your invite link or let a friend scan this code.
                    </Text>

                    <View className="p-4 rounded-2xl bg-white">
                        {code ? <QRCode value={link} size={180} /> : <Text className="text-zinc-400">Generating...</Text>}
                    </View>

                    <View
                        className="w-full rounded-2xl border mt-6 px-4 py-3 flex-row items-center"
                        style={{ borderColor: isDark ? '#282828' : '#ECE3CE' }}
                    >
                        <Text className="flex-1 text-[13px] font-elms text-black dark:text-white" numberOfLines={1}>
                            {link || '...'}
                        </Text>
                        <Pressable onPress={copyLink} hitSlop={8} className="ml-2">
                            <Copy size={18} color={isDark ? '#E8C468' : '#B8860B'} />
                        </Pressable>
                    </View>

                    <Pressable
                        onPress={shareLink}
                        style={{ backgroundColor: '#B8860B' }}
                        className="w-full rounded-xl h-12 items-center justify-center mt-4 flex-row gap-2"
                    >
                        <Share2 size={17} color="#fff" />
                        <Text className="text-white font-elms-med text-[14px]">Share Invite</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </View>
    );
}
