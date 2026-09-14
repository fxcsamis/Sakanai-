// Copyright (c) 2026 Raj
// See LICENSE for details.

import React from 'react';
import { ScrollView, Text, View } from 'react-native';

type Props = { children: React.ReactNode };
type State = { error: Error | null; info: string | null };

export default class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { error: null, info: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { error };
    }

    componentDidCatch(error: Error, info: React.ErrorInfo) {
        this.setState({ error, info: info.componentStack ?? null });
        console.log('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.error) {
            return (
                <View style={{ flex: 1, backgroundColor: '#000', paddingTop: 60, paddingHorizontal: 16 }}>
                    <Text style={{ color: '#ff5555', fontSize: 18, fontWeight: 'bold', marginBottom: 12 }}>
                        App crashed — here's why
                    </Text>
                    <ScrollView>
                        <Text style={{ color: 'white', fontSize: 14, marginBottom: 16 }}>
                            {this.state.error.name}: {this.state.error.message}
                        </Text>
                        <Text style={{ color: '#aaa', fontSize: 11 }}>
                            {this.state.error.stack}
                        </Text>
                        {this.state.info && (
                            <Text style={{ color: '#888', fontSize: 11, marginTop: 16 }}>
                                {this.state.info}
                            </Text>
                        )}
                    </ScrollView>
                </View>
            );
        }
        return this.props.children;
    }
}
