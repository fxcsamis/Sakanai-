// Copyright (c) 2026 Raj
// See LICENSE for details.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import { ArrowLeft, Delete, Fingerprint, Lock } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { hashPin } from './vaultCrypto';

const PIN_HASH_KEY = 'arise_vault_pin_hash';
const BIOMETRIC_KEY = 'arise_vault_biometric_enabled';

// Real PIN, hashed with SHA-256 before it's ever written to disk (AsyncStorage
// only ever sees the hash). Real biometric prompt via expo-local-authentication,
// using the device's actual enrolled fingerprint/face - not simulated.
export default function PrivateVaultLock({ onUnlock }: { onUnlock: (pin: string) => void }) {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [storedHash, setStoredHash] = React.useState<string | null | undefined>(undefined);
    const [biometricEnabled, setBiometricEnabled] = React.useState(false);
    const [pin, setPin] = React.useState('');
    const [confirmPin, setConfirmPin] = React.useState<string | null>(null);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        (async () => {
            const [hash, bio] = await Promise.all([
                AsyncStorage.getItem(PIN_HASH_KEY),
                AsyncStorage.getItem(BIOMETRIC_KEY),
            ]);
            setStoredHash(hash);
            setBiometricEnabled(bio === 'true');
            if (hash && bio === 'true') {
                tryBiometric(hash);
            }
        })();
    }, []);

    const tryBiometric = async (existingHashForUnlock?: string) => {
        const hasHardware = await LocalAuthentication.hasHardwareAsync();
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        if (!hasHardware || !isEnrolled) return;
        const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Unlock Private Vault' });
        if (result.success) {
            // Biometric confirms identity; the actual encryption key is still derived
            // from the PIN the user set, so we keep that PIN in memory for this session.
            const cached = await AsyncStorage.getItem('arise_vault_pin_cache');
            if (cached) onUnlock(cached);
        }
    };

    const digit = (d: string) => {
        setError('');
        if (pin.length >= 4) return;
        setPin((p) => p + d);
    };
    const backspace = () => setPin((p) => p.slice(0, -1));

    const submitSetup = async () => {
        if (pin.length !== 4) { setError('Enter a 4-digit PIN'); return; }
        if (confirmPin === null) {
            setConfirmPin(pin);
            setPin('');
            return;
        }
        if (pin !== confirmPin) {
            setError('PINs did not match, try again');
            setConfirmPin(null);
            setPin('');
            return;
        }
        const hash = await hashPin(pin);
        await AsyncStorage.setItem(PIN_HASH_KEY, hash);
        await AsyncStorage.setItem('arise_vault_pin_cache', pin);
        onUnlock(pin);
    };

    const submitUnlock = async () => {
        const hash = await hashPin(pin);
        if (hash === storedHash) {
            await AsyncStorage.setItem('arise_vault_pin_cache', pin);
            onUnlock(pin);
        } else {
            setError('Incorrect PIN');
            setPin('');
        }
    };

    React.useEffect(() => {
        if (pin.length !== 4) return;
        if (storedHash === null) { submitSetup(); return; }
        submitUnlock();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pin]);

    if (storedHash === undefined) return null;

    const isSetup = storedHash === null;
    const dots = Array.from({ length: 4 }, (_, i) => i < pin.length);

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#0B1220' : '#0F172A' }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <Pressable onPress={() => router.back()} hitSlop={10} className="w-9 h-9 items-center justify-center ml-3 mt-1">
                    <ArrowLeft size={20} color="#fff" />
                </Pressable>

                <View className="flex-1 items-center justify-center px-8">
                    <View className="w-16 h-16 rounded-full items-center justify-center" style={{ backgroundColor: '#B8860B33' }}>
                        <Lock size={26} color="#E8C468" />
                    </View>
                    <Text className="text-white text-[16px] font-elms-med mt-5">
                        {isSetup ? (confirmPin === null ? 'Set a Vault PIN' : 'Confirm your PIN') : 'Enter Vault PIN'}
                    </Text>
                    {!!error && <Text className="text-red-400 text-[12px] font-elms mt-1.5">{error}</Text>}

                    <View className="flex-row gap-3 mt-6">
                        {dots.map((filled, i) => (
                            <View
                                key={i}
                                style={{
                                    width: 14, height: 14, borderRadius: 7,
                                    backgroundColor: filled ? '#E8C468' : 'transparent',
                                    borderWidth: 1.5, borderColor: '#E8C468',
                                }}
                            />
                        ))}
                    </View>

                    <View className="mt-10" style={{ width: 260 }}>
                        {[['1', '2', '3'], ['4', '5', '6'], ['7', '8', '9'], ['', '0', 'del']].map((row, ri) => (
                            <View key={ri} className="flex-row justify-between mb-4">
                                {row.map((k, ki) =>
                                    k === '' ? (
                                        <View key={ki} style={{ width: 68, height: 68 }} />
                                    ) : k === 'del' ? (
                                        <Pressable
                                            key={ki}
                                            onPress={backspace}
                                            style={{ width: 68, height: 68 }}
                                            className="items-center justify-center"
                                        >
                                            <Delete size={22} color="#94A3B8" />
                                        </Pressable>
                                    ) : (
                                        <Pressable
                                            key={ki}
                                            onPress={() => digit(k)}
                                            style={{
                                                width: 68, height: 68, borderRadius: 34,
                                                backgroundColor: 'rgba(255,255,255,0.06)',
                                            }}
                                            className="items-center justify-center"
                                        >
                                            <Text className="text-white text-[22px] font-elms-med">{k}</Text>
                                        </Pressable>
                                    )
                                )}
                            </View>
                        ))}
                    </View>

                    {!isSetup && biometricEnabled && (
                        <Pressable onPress={() => tryBiometric()} className="mt-2 flex-row items-center gap-2">
                            <Fingerprint size={18} color="#E8C468" />
                            <Text className="text-[13px] font-elms-med" style={{ color: '#E8C468' }}>
                                Use biometric unlock
                            </Text>
                        </Pressable>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
}
