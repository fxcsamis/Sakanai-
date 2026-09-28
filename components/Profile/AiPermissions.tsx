// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useRouter } from 'expo-router';
import * as MediaLibrary from 'expo-media-library';
import { ArrowLeft, Image as ImageIcon } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Linking, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Real, device-checked permissions (no fake toggle states). Android can't let an app
// revoke its own already-granted permission - "turning off" opens the system
// per-app permission screen, same as every other Android app does this.
export default function AiPermissions() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [mediaStatus, setMediaStatus] = React.useState<MediaLibrary.PermissionStatus | null>(null);

    const refresh = React.useCallback(async () => {
        const current = await MediaLibrary.getPermissionsAsync();
        setMediaStatus(current.status);
    }, []);

    React.useEffect(() => {
        refresh();
    }, [refresh]);

    const toggleMedia = async (next: boolean) => {
        if (next) {
            const result = await MediaLibrary.requestPermissionsAsync();
            setMediaStatus(result.status);
        } else {
            await Linking.openSettings();
        }
    };

    const rowBg = isDark ? '#1A1A1A' : '#FFFFFF';
    const rowBorder = isDark ? '#282828' : '#ECE3CE';

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#FAF8F3' }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <View className="flex-row items-center px-5 pt-2 pb-3">
                    <Pressable onPress={() => router.back()} hitSlop={10} className="w-9 h-9 items-center justify-center -ml-2">
                        <ArrowLeft size={20} color={isDark ? '#fff' : '#000'} />
                    </Pressable>
                    <Text className="text-[18px] font-elms-med text-black dark:text-white ml-2">App Permissions</Text>
                </View>

                <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>
                    <Text className="text-[12px] font-elms text-zinc-500 mb-3">
                        These reflect your phone's actual permission state for Arise, checked live - not stored preferences.
                    </Text>

                    <View
                        className="rounded-2xl border p-4 flex-row items-center"
                        style={{ backgroundColor: rowBg, borderColor: rowBorder }}
                    >
                        <View className="w-9 h-9 rounded-full items-center justify-center" style={{ backgroundColor: '#B8860B1A' }}>
                            <ImageIcon size={18} color="#B8860B" />
                        </View>
                        <View className="flex-1 ml-3">
                            <Text className="text-[14px] font-elms-med text-black dark:text-white">Photos & Media Library</Text>
                            <Text className="text-[11.5px] font-elms text-zinc-500 mt-0.5">
                                {mediaStatus === null
                                    ? 'Checking...'
                                    : mediaStatus === 'granted'
                                    ? 'Granted - used for saving downloads to your gallery'
                                    : mediaStatus === 'denied'
                                    ? 'Denied - tap to open system settings'
                                    : 'Not requested yet'}
                            </Text>
                        </View>
                        <Switch
                            value={mediaStatus === 'granted'}
                            onValueChange={toggleMedia}
                            trackColor={{ true: '#B8860B' }}
                        />
                    </View>

                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
