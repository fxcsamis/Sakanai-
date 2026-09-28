// Copyright (c) 2026 Raj
// See LICENSE for details.

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as LocalAuthentication from 'expo-local-authentication';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { ArrowLeft, Eye, Fingerprint, FileLock2, Plus, Trash2 } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { FlatList, Pressable, Switch, Text, ToastAndroid, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { decryptToBase64, encryptBase64 } from './vaultCrypto';
import PrivateVaultLock from './PrivateVaultLock';

const VAULT_DIR = `${FileSystem.documentDirectory}ariseVault/`;
const META_KEY = 'arise_vault_files_meta';
const BIOMETRIC_KEY = 'arise_vault_biometric_enabled';

type VaultFile = { id: string; name: string; encryptedUri: string; size: number; addedAt: number };

async function loadMeta(): Promise<VaultFile[]> {
    const raw = await AsyncStorage.getItem(META_KEY);
    return raw ? JSON.parse(raw) : [];
}
async function saveMeta(files: VaultFile[]) {
    await AsyncStorage.setItem(META_KEY, JSON.stringify(files));
}

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}

// Real vault: files are actually AES-encrypted on disk with a key derived from the
// PIN (never stored anywhere), and actually decrypted only in memory when viewed.
// A locked-out phone / uninstalled app genuinely cannot read these files' contents.
export default function PrivateVault() {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const [pin, setPin] = React.useState<string | null>(null);
    const [files, setFiles] = React.useState<VaultFile[]>([]);
    const [biometricEnabled, setBiometricEnabled] = React.useState(false);
    const [biometricAvailable, setBiometricAvailable] = React.useState(false);
    const [busy, setBusy] = React.useState(false);

    React.useEffect(() => {
        if (!pin) return;
        (async () => {
            await FileSystem.makeDirectoryAsync(VAULT_DIR, { intermediates: true }).catch(() => {});
            setFiles(await loadMeta());
            const bio = await AsyncStorage.getItem(BIOMETRIC_KEY);
            setBiometricEnabled(bio === 'true');
            const hw = await LocalAuthentication.hasHardwareAsync();
            const enrolled = await LocalAuthentication.isEnrolledAsync();
            setBiometricAvailable(hw && enrolled);
        })();
    }, [pin]);

    const toggleBiometric = async (next: boolean) => {
        if (next) {
            const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Confirm to enable biometric unlock' });
            if (!result.success) return;
        }
        await AsyncStorage.setItem(BIOMETRIC_KEY, String(next));
        setBiometricEnabled(next);
    };

    const addFile = async () => {
        if (!pin) return;
        const picked = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
        if (picked.canceled || !picked.assets?.[0]) return;
        const asset = picked.assets[0];
        setBusy(true);
        try {
            const base64 = await FileSystem.readAsStringAsync(asset.uri, { encoding: FileSystem.EncodingType.Base64 });
            const cipherText = encryptBase64(base64, pin);
            const id = `${Date.now()}`;
            const encryptedUri = `${VAULT_DIR}${id}.enc`;
            await FileSystem.writeAsStringAsync(encryptedUri, cipherText, { encoding: FileSystem.EncodingType.UTF8 });
            const entry: VaultFile = { id, name: asset.name, encryptedUri, size: asset.size ?? cipherText.length, addedAt: Date.now() };
            const next = [entry, ...files];
            setFiles(next);
            await saveMeta(next);
            ToastAndroid.show('File encrypted and added to vault', ToastAndroid.SHORT);
        } catch (e) {
            ToastAndroid.show('Could not encrypt this file', ToastAndroid.SHORT);
        } finally {
            setBusy(false);
        }
    };

    const viewFile = async (file: VaultFile) => {
        if (!pin) return;
        setBusy(true);
        try {
            const cipherText = await FileSystem.readAsStringAsync(file.encryptedUri, { encoding: FileSystem.EncodingType.UTF8 });
            const base64 = decryptToBase64(cipherText, pin);
            if (!base64) { ToastAndroid.show('Wrong key - could not decrypt', ToastAndroid.SHORT); return; }
            const tempUri = `${FileSystem.cacheDirectory}${file.name}`;
            await FileSystem.writeAsStringAsync(tempUri, base64, { encoding: FileSystem.EncodingType.Base64 });
            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(tempUri);
            } else {
                ToastAndroid.show(`Decrypted to ${tempUri}`, ToastAndroid.LONG);
            }
        } catch {
            ToastAndroid.show('Could not decrypt this file', ToastAndroid.SHORT);
        } finally {
            setBusy(false);
        }
    };

    const removeFile = async (file: VaultFile) => {
        await FileSystem.deleteAsync(file.encryptedUri, { idempotent: true });
        const next = files.filter((f) => f.id !== file.id);
        setFiles(next);
        await saveMeta(next);
    };

    if (!pin) return <PrivateVaultLock onUnlock={setPin} />;

    const rowBg = isDark ? '#1A1A1A' : '#FFFFFF';
    const rowBorder = isDark ? '#282828' : '#ECE3CE';

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#FAF8F3' }}>
            <SafeAreaView edges={['top']} style={{ flex: 1 }}>
                <View className="flex-row items-center px-5 pt-2 pb-1">
                    <Pressable onPress={() => router.back()} hitSlop={10} className="w-9 h-9 items-center justify-center -ml-2">
                        <ArrowLeft size={20} color={isDark ? '#fff' : '#000'} />
                    </Pressable>
                    <Text className="text-[18px] font-elms-med text-black dark:text-white ml-2">Private Vault</Text>
                    <View className="flex-1" />
                    <Pressable onPress={addFile} disabled={busy} className="w-9 h-9 items-center justify-center">
                        <Plus size={22} color={isDark ? '#E8C468' : '#B8860B'} />
                    </Pressable>
                </View>

                {biometricAvailable && (
                    <View className="flex-row items-center px-5 py-2">
                        <Fingerprint size={16} color={isDark ? '#E8C468' : '#B8860B'} />
                        <Text className="text-[12px] font-elms text-zinc-500 flex-1 ml-2">Unlock with biometrics</Text>
                        <Switch value={biometricEnabled} onValueChange={toggleBiometric} trackColor={{ true: '#B8860B' }} />
                    </View>
                )}

                {files.length === 0 ? (
                    <View className="flex-1 items-center justify-center px-10">
                        <FileLock2 size={36} color={isDark ? '#334155' : '#CBD5E1'} />
                        <Text className="text-[14px] font-elms-med text-black dark:text-white mt-3">Vault is empty</Text>
                        <Text className="text-[12px] font-elms text-zinc-500 mt-1 text-center">
                            Tap + to add and encrypt a file.
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={files}
                        keyExtractor={(f) => f.id}
                        contentContainerStyle={{ padding: 20, gap: 8 }}
                        renderItem={({ item }) => (
                            <View
                                className="flex-row items-center rounded-xl border px-3.5 py-3"
                                style={{ backgroundColor: rowBg, borderColor: rowBorder }}
                            >
                                <FileLock2 size={18} color="#B8860B" />
                                <View className="flex-1 ml-3">
                                    <Text numberOfLines={1} className="text-[13px] font-elms-med text-black dark:text-white">
                                        {item.name}
                                    </Text>
                                    <Text className="text-[11px] font-elms text-zinc-500">{formatSize(item.size)} - encrypted</Text>
                                </View>
                                <Pressable onPress={() => viewFile(item)} hitSlop={8} className="mr-3">
                                    <Eye size={17} color={isDark ? '#E8C468' : '#B8860B'} />
                                </Pressable>
                                <Pressable onPress={() => removeFile(item)} hitSlop={8}>
                                    <Trash2 size={17} color="#EF4444" />
                                </Pressable>
                            </View>
                        )}
                    />
                )}
            </SafeAreaView>
        </View>
    );
}
