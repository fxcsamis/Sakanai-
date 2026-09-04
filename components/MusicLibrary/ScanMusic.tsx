// Copyright (c) 2026 Raj
// See LICENSE for details.

import { useMusic } from '@/hooks/useMusic';
import { createMultipleMusics } from '@/service/database';
import { extractAudioMetadata } from '@/service/metaDataExtractor';
import { Audio } from '@/types/audioMetadata';
import * as MediaLibrary from 'expo-media-library';
import { useSQLiteContext } from 'expo-sqlite';
import { CheckCircle2, Music2, RefreshCw, ScanLine, ShieldAlert } from 'lucide-react-native';
import React from 'react';
import { Animated, Easing, Pressable, Text, View, useColorScheme } from 'react-native';
import { ScanState } from '.';
import { ProgressBar, StatCard } from './utils';

export default function ScanMusic({ scanState, setScanState }: { scanState: ScanState, setScanState: (action: ScanState) => void }) {
    const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();
    const [scannedCount, setScannedCount] = React.useState(0);
    const [totalCount, setTotalCount] = React.useState(0);
    const [progress, setProgress] = React.useState(0);
    const [errorMsg, setErrorMsg] = React.useState('');
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const mountFade = React.useRef(new Animated.Value(0)).current;
    const ringScale = React.useRef(new Animated.Value(1)).current;
    const ringOpacity = React.useRef(new Animated.Value(0)).current;
    const iconPulse = React.useRef(new Animated.Value(1)).current;
    const checkPop = React.useRef(new Animated.Value(0)).current;
    const counterFade = React.useRef(new Animated.Value(0)).current;

    const { onReloadHomeData } = useMusic();

    const db = useSQLiteContext();

    React.useEffect(() => {
        Animated.timing(mountFade, { toValue: 1, duration: 500, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
    }, []);

    React.useEffect(() => {
        if (scanState === 'scanning') {
            counterFade.setValue(0);
            Animated.timing(counterFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();

            const pulse = Animated.loop(Animated.sequence([
                Animated.timing(iconPulse, { toValue: 1.1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
                Animated.timing(iconPulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
            ]));
            pulse.start();

            const ring = Animated.loop(Animated.parallel([
                Animated.timing(ringScale, { toValue: 1.6, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                Animated.sequence([
                    Animated.timing(ringOpacity, { toValue: 0.6, duration: 200, useNativeDriver: true }),
                    Animated.timing(ringOpacity, { toValue: 0, duration: 1000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
                ]),
            ]));
            ring.start();

            return () => { pulse.stop(); ring.stop(); iconPulse.setValue(1); };
        }

        if (scanState === 'done') {
            ringScale.setValue(1);
            ringOpacity.setValue(0);
            iconPulse.setValue(1);
            checkPop.setValue(0);
            Animated.spring(checkPop, { toValue: 1, tension: 65, friction: 7, useNativeDriver: true }).start();
        }
    }, [scanState]);

    async function handleScan() {
        if (permissionResponse?.status !== 'granted') {
            const result = await requestPermission();
            if (result.status !== 'granted') {
                setScanState('error');
                setErrorMsg('Media library access was denied.');
                return;
            }
        }

        setScanState('scanning');
        setScannedCount(0);
        setTotalCount(0);
        setProgress(0);
        setErrorMsg('');

        try {
            let hasNextPage = true;
            let after: string | undefined = undefined;
            let musics: Audio[] = [];
            let total = 0;
            let knownTotal = 0;

            while (hasNextPage) {
                const result = await MediaLibrary.getAssetsAsync({
                    mediaType: MediaLibrary.MediaType.audio,
                    first: 50,
                    after
                });

                if (knownTotal === 0 && result.totalCount > 0) {
                    knownTotal = result.totalCount;
                    setTotalCount(knownTotal);
                }

                const enrichedMusic: Audio[] = await Promise.all(
                    result.assets.map(async (asset) => {
                        try {
                            const assetInfo = await MediaLibrary.getAssetInfoAsync(asset);
                            const localUri = assetInfo.localUri ?? asset.uri;

                            const tags = await extractAudioMetadata(localUri);

                            return {
                                ...asset,
                                title: tags?.title || asset.filename?.replace(/\.[^.]+$/, '') || null,
                                album: tags?.album || 'Arise by Raj',
                                albumArtist: tags?.albumArtist || 'Arise by Raj',
                                artist: tags?.artist || 'Arise by Raj',
                                trackNumber: tags?.trackNumber ?? null,
                                year: tags?.year || 0,
                            };
                        } catch (err) {
                            console.warn(`Failed parsing metadata for: ${asset.filename}`, err);
                            return {
                                ...asset,
                                title: asset.filename?.replace(/\.[^.]+$/, '') || null,
                                album: 'Unknown Album',
                                albumArtist: 'Unknown Artist',
                                artist: 'Unknown Artist',
                                trackNumber: null,
                                year: 0,
                            };
                        }
                    })
                );

                musics.push(...enrichedMusic);

                total += result.assets.length;
                setScannedCount(total);
                setProgress(knownTotal > 0 ? total / knownTotal : 0);

                hasNextPage = result.hasNextPage;
                after = result.endCursor;
            }

            setScanState('done');
            await onReloadHomeData();
            await createMultipleMusics(musics as any, db);
        } catch (e: any) {
            setScanState('error');
            setErrorMsg(e?.message ?? 'Something went wrong.');
        }
    }

    function handleReset() {
        setScanState('idle');
        setScannedCount(0);
        setTotalCount(0);
        setProgress(0);
        checkPop.setValue(0);
    }

    const pct = Math.round(progress * 100);
    const needsPermission = permissionResponse?.status !== 'granted';
    const isLimited = permissionResponse?.accessPrivileges === 'limited';

    return (
        <View className='flex-1 items-center justify-center p-6'>
            {scanState !== 'done' && (
                <View className="w-[100px] h-[100px] items-center justify-center mb-8 mt-10">
                    <Animated.View
                        className={`absolute w-[100px] h-[100px] rounded-full border-[1.5px] ${scanState === 'scanning' ? 'border-[#4F8EF7]' : 'border-emerald-500 dark:border-[#1DB954]'}`}
                        style={{ transform: [{ scale: ringScale }], opacity: ringOpacity }}
                    />

                    <Animated.View
                        className={`w-[88px] h-[88px] rounded-full items-center justify-center border-[1px] ${scanState === 'error' ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50' : 'bg-blue-50 dark:bg-[#4F8EF7]/20 border-blue-200 dark:border-[#4F8EF7]/30'
                            }`}
                        style={{ transform: [{ scale: iconPulse }] }}
                    >
                        {scanState === 'scanning' ? (
                            <ScanLine size={40} color="#4F8EF7" />
                        ) : (
                            <Music2 size={40} color={scanState === 'error' ? '#EF4444' : '#4F8EF7'} />
                        )}
                    </Animated.View>
                </View>
            )}

            {scanState === 'idle' && (
                <View className="w-full items-center">
                    <Text className="text-slate-900 dark:text-white text-3xl font-[elms-bold] mb-2.5">Scan Music</Text>
                    <Text className="text-slate-500 dark:text-[#B3B3B3] text-sm font-[elms] text-center leading-[22px] mb-7">
                        Discover all audio tracks on your{'\n'}device and add them to your library.
                    </Text>

                    {needsPermission && (
                        <View className="flex-row items-center gap-[6px] bg-amber-50 dark:bg-amber-900/20 rounded-[10px] px-3.5 py-2 mb-5">
                            <ShieldAlert size={13} color="#F59E0B" />
                            <Text className="text-amber-600 dark:text-amber-500 text-xs font-[elms]">Permission required to scan</Text>
                        </View>
                    )}

                    {isLimited && (
                        <View className="flex-row items-center gap-[6px] bg-amber-50 dark:bg-amber-900/20 rounded-[10px] px-3.5 py-2 mb-5">
                            <ShieldAlert size={13} color="#F59E0B" />
                            <Text className="text-amber-600 dark:text-amber-500 text-xs font-[elms]">Limited access — some files may be missed</Text>
                        </View>
                    )}

                    <Pressable
                        onPress={handleScan}
                        className="flex-row items-center justify-center bg-[#4F8EF7] dark:bg-white rounded-[24px] py-[15px] w-full mt-1 active:opacity-80 active:scale-95 transition-all"
                    >
                        <ScanLine size={16} color={isDark ? "#000000" : "#fff"} style={{ marginRight: 8 }} />
                        <Text className="text-white dark:text-black text-[15px] font-[elms-med] tracking-[0.2px]">Scan Now</Text>
                    </Pressable>
                </View>
            )}

            {scanState === 'scanning' && (
                <Animated.View className="w-full items-center" style={{ opacity: counterFade }}>
                    <View className="flex-row items-center gap-[7px] bg-blue-50 dark:bg-[#4F8EF7]/20 rounded-[20px] px-3.5 py-1.5 mb-5">
                        <View className="w-1.5 h-1.5 rounded-full bg-[#4F8EF7]" />
                        <Text className="text-[#4F8EF7] text-[11px] font-[elms-med] tracking-[1.5px] uppercase">Scanning</Text>
                    </View>

                    <Text className="text-slate-900 dark:text-white text-6xl font-[elms-bold] leading-[72px] tracking-[-2px]">{scannedCount.toLocaleString()}</Text>
                    <Text className="text-slate-500 dark:text-[#B3B3B3] text-sm font-[elms] mb-7 mt-1">{totalCount > 0 ? `of ${totalCount.toLocaleString()} tracks` : 'tracks found…'}</Text>

                    <View className="w-full gap-2">
                        <ProgressBar progress={progress} />
                        <View className="flex-row justify-between">
                            <Text className="text-slate-500 dark:text-[#B3B3B3] text-[11px] font-[elms]">{totalCount > 0 ? `${pct}%` : 'Discovering…'}</Text>
                            {totalCount > 0 && <Text className="text-slate-500 dark:text-[#B3B3B3] text-[11px] font-[elms]">{scannedCount.toLocaleString()} / {totalCount.toLocaleString()}</Text>}
                        </View>
                    </View>
                </Animated.View>
            )}

            {scanState === 'done' && (
                <View className="w-full items-center">
                    <View className="flex-row items-center gap-[7px] bg-emerald-50 dark:bg-[#1DB954]/20 rounded-[20px] px-3.5 py-1.5 mb-5">
                        <CheckCircle2 size={11} color={isDark ? "#1DB954" : "#10B981"} />
                        <Text className="text-emerald-500 dark:text-[#1DB954] text-[11px] font-[elms-med] tracking-[1.5px] uppercase">Complete</Text>
                    </View>

                    <Text className="text-slate-900 dark:text-white text-6xl font-[elms-bold] leading-[72px] tracking-[-2px]">{scannedCount.toLocaleString()}</Text>
                    <Text className="text-slate-500 dark:text-[#B3B3B3] text-sm font-[elms] mb-7 mt-1">tracks discovered</Text>

                    <View className="flex-row gap-2.5 w-full mb-6 mt-2">
                        <StatCard label="Scanned" value={scannedCount.toLocaleString()} colorClass="text-[#4F8EF7] dark:text-white" />
                        <StatCard label="Progress" value="100%" colorClass="text-[#10B981] dark:text-[#1DB954]" />
                    </View>

                    <Pressable
                        onPress={handleReset}
                        className="flex-row items-center justify-center border-[0.5px] border-slate-200 dark:border-[#282828] rounded-[24px] py-[14px] w-full mt-2 active:bg-slate-100 dark:active:bg-[#282828]"
                    >
                        <RefreshCw size={15} color={isDark ? "#FFFFFF" : "#64748B"} style={{ marginRight: 8 }} />
                        <Text className="text-slate-600 dark:text-white text-sm font-[elms-med]">Rescan Library</Text>
                    </Pressable>
                </View>
            )}

            {scanState === 'error' && (
                <View className="w-full items-center">
                    <Text className="text-red-500 dark:text-red-400 text-[22px] font-[elms-med] mb-2">Scan Failed</Text>
                    {errorMsg ? <Text className="text-slate-500 dark:text-[#B3B3B3] text-[13px] font-[elms] text-center mb-6">{errorMsg}</Text> : null}
                    <Pressable onPress={handleScan} className="flex-row items-center justify-center bg-[#4F8EF7] dark:bg-white rounded-[24px] py-[15px] w-full mt-1 active:opacity-80">
                        <Text className="text-white dark:text-black text-[15px] font-[elms-med] tracking-[0.2px]">Try Again</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}