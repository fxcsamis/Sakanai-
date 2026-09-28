// Copyright (c) 2026 Raj
// See LICENSE for details.

import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { useRouter } from 'expo-router';
import { ArrowLeft, Cpu, HardDrive, Smartphone, Tag } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function bytesToGB(bytes: number | null | undefined) {
    if (!bytes) return null;
    return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

// Replaces Cloudihub's fake "3 Active Devices" list: Arise has no multi-device
// account/sync backend, so a real linked-devices list isn't possible yet. This
// shows genuine diagnostics for the device Arise is actually running on right now.
export default function ThisDevice() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const rows = [
        { Icon: Smartphone, label: 'Device', value: [Device.manufacturer, Device.modelName].filter(Boolean).join(' ') || 'Unknown' },
        { Icon: Cpu, label: 'OS', value: `${Device.osName ?? 'Android'} ${Device.osVersion ?? ''}`.trim() },
        { Icon: HardDrive, label: 'Total RAM', value: bytesToGB(Device.totalMemory) ?? 'Unavailable' },
        { Icon: Tag, label: 'Arise Version', value: `${Application.nativeApplicationVersion ?? '—'} (build ${Application.nativeBuildVersion ?? '—'})` },
    ];

    const rowBg = isDark ? '#1A1A1A' : '#FFFFFF';
    const rowBorder = isDark ? '#282828' : '#ECE3CE';

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#FAF8F3' }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <View className="flex-row items-center px-5 pt-2 pb-3">
                    <Pressable onPress={() => router.back()} hitSlop={10} className="w-9 h-9 items-center justify-center -ml-2">
                        <ArrowLeft size={20} color={isDark ? '#fff' : '#000'} />
                    </Pressable>
                    <Text className="text-[18px] font-elms-med text-black dark:text-white ml-2">This Device</Text>
                </View>

                <View className="px-5">
                    <Text className="text-[12px] font-elms text-zinc-500 mb-3">
                        Live diagnostics for this phone, read directly from the OS.
                    </Text>

                    <View className="rounded-2xl border overflow-hidden" style={{ borderColor: rowBorder }}>
                        {rows.map((r, i) => (
                            <View
                                key={r.label}
                                className={`flex-row items-center p-4 ${i === rows.length - 1 ? '' : 'border-b'}`}
                                style={{ backgroundColor: rowBg, borderColor: rowBorder }}
                            >
                                <r.Icon size={18} color={isDark ? '#E8C468' : '#B8860B'} />
                                <Text className="text-[13px] font-elms text-zinc-500 ml-3 flex-1">{r.label}</Text>
                                <Text className="text-[13px] font-elms-med text-black dark:text-white" numberOfLines={1}>
                                    {r.value}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </SafeAreaView>
        </View>
    );
}
