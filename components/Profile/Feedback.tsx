// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useRouter } from 'expo-router';
import { ArrowLeft, Star } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Pressable, Share, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Feedback() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [rating, setRating] = React.useState(5);
    const [liked, setLiked] = React.useState('');
    const [improve, setImprove] = React.useState('');

    // Sends the feedback through whichever app the user picks (mail, Telegram, ...).
    // Nothing is claimed as "submitted" - only the share sheet actually opening.
    const submit = async () => {
        const message = `Arise feedback - ${rating}/5 stars\n\nLiked: ${liked || '-'}\nImprove: ${improve || '-'}`;
        await Share.share({ message });
    };

    const inputBorder = isDark ? '#282828' : '#ECE3CE';
    const inputText = isDark ? '#FFFFFF' : '#0F172A';

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#FAF8F3' }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <View className="flex-row items-center px-5 pt-2 pb-1">
                    <Pressable onPress={() => router.back()} hitSlop={10} className="w-9 h-9 items-center justify-center -ml-2">
                        <ArrowLeft size={20} color={isDark ? '#fff' : '#000'} />
                    </Pressable>
                </View>

                <View className="items-center px-6 pt-2">
                    <Text className="text-[18px] font-elms-med text-black dark:text-white">Help us improve Arise</Text>
                    <Text className="text-[12px] font-elms text-zinc-500 mt-0.5">
                        We value your rating & feature suggestions
                    </Text>

                    <View className="flex-row gap-2 mt-5">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Pressable key={i} onPress={() => setRating(i)} hitSlop={6}>
                                <Star size={32} color={i <= rating ? '#F59E0B' : '#CBD5E1'} fill={i <= rating ? '#F59E0B' : 'transparent'} />
                            </Pressable>
                        ))}
                    </View>

                    <View className="w-full mt-5">
                        <Text className="text-[12px] font-elms-med text-zinc-500 mb-1.5">What did you like the most?</Text>
                        <TextInput
                            value={liked}
                            onChangeText={setLiked}
                            placeholder="E.g. cloud navigation speed, glass design..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            numberOfLines={3}
                            style={{ borderColor: inputBorder, color: inputText }}
                            className="border rounded-xl px-3.5 py-3 text-[13px] font-elms"
                        />
                    </View>

                    <View className="w-full mt-3">
                        <Text className="text-[12px] font-elms-med text-zinc-500 mb-1.5">How can we improve?</Text>
                        <TextInput
                            value={improve}
                            onChangeText={setImprove}
                            placeholder="E.g. add support for OneDrive sync..."
                            placeholderTextColor="#94A3B8"
                            multiline
                            numberOfLines={3}
                            style={{ borderColor: inputBorder, color: inputText }}
                            className="border rounded-xl px-3.5 py-3 text-[13px] font-elms"
                        />
                    </View>

                    <Pressable
                        onPress={submit}
                        style={{ backgroundColor: '#B8860B' }}
                        className="w-full rounded-xl h-12 items-center justify-center mt-6"
                    >
                        <Text className="text-white font-elms-med text-[14px]">Send Feedback</Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        </View>
    );
}
