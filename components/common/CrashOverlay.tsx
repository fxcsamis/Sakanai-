import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { clearCrash, CrashInfo, getCrash, loadPreviousCrash, subscribeCrash } from '@/utils/crashLogger';

export default function CrashOverlay() {
    const [crash, setCrash] = React.useState<CrashInfo | null>(getCrash());

    React.useEffect(() => {
        const unsub = subscribeCrash(setCrash);
        loadPreviousCrash();
        return unsub;
    }, []);

    if (!crash) return null;

    return (
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', paddingTop: 60, paddingHorizontal: 16, zIndex: 9999, elevation: 9999 }}>
            <Text style={{ color: '#ff5555', fontSize: 18, fontWeight: 'bold', marginBottom: 4 }}>
                {crash.previous ? 'Last launch crashed — here\'s why' : 'App crashed — here\'s why'}
            </Text>
            <Text style={{ color: '#888', fontSize: 11, marginBottom: 12 }}>{crash.time}</Text>
            <ScrollView>
                <Text selectable style={{ color: 'white', fontSize: 14, marginBottom: 16 }}>{crash.message}</Text>
                <Text selectable style={{ color: '#aaa', fontSize: 11 }}>{crash.stack}</Text>
            </ScrollView>
            <TouchableOpacity onPress={clearCrash} style={{ backgroundColor: 'white', borderRadius: 999, paddingVertical: 12, alignItems: 'center', marginVertical: 16 }}>
                <Text style={{ color: 'black', fontWeight: '600' }}>Dismiss</Text>
            </TouchableOpacity>
        </View>
    );
}
