// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { setAvatar, setName } from '@/store/reducer/userSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, ImageBackground, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Arise from './Arise';
import StaterModel from './StaterModel';

const { width } = Dimensions.get('window');

export default function index() {
    const router = useRouter();
    const translateX = useRef(new Animated.Value(0)).current;
    const [open, setOpen] = React.useState<boolean>(false);
    const { name } = useAppSelector(state => state.userReducer);
    const dispatch = useAppDispatch();

    const handleOpen = React.useCallback(() => setOpen(prev => !prev), []);

    const handleContinue = async (userName?: string) => {
        if (!userName || userName.trim() === '') {
            handleOpen();
            return;
        }

        await AsyncStorage.setItem("continue", "true");

        router.replace("/(tabs)/home");
    };

    const handleContinueTo = async () => {
        if (name === 'default') {
            handleOpen();
            return;
        }

        await AsyncStorage.setItem("continue", "true");

        router.replace("/(tabs)/home");
    };
    useEffect(() => {
        Animated.loop(
            Animated.timing(translateX, {
                toValue: -width,
                duration: 3000,
                useNativeDriver: true,
            })
        ).start();
    }, [translateX]);

    React.useEffect(() => {
        const initialize = async () => {
            try {
                const [user, continue_] = await Promise.all([
                    AsyncStorage.getItem("user"),
                    AsyncStorage.getItem("continue")
                ])

                if (continue_ && JSON.parse(continue_)) {
                    if (user) {
                        const { name, avatar } = JSON.parse(user);

                        dispatch(setName(name));
                        dispatch(setAvatar(avatar));
                    }

                    router.replace("/(tabs)/home");
                }
            } catch (error) {
                console.error("Failed to initialize app:", error);
            }
        };

        initialize();
    }, []);

    return (
        <>
            <ImageBackground
                source={require("@/assets/images/landing.jpg")}
                className='flex-1'
                resizeMode="cover"
            >

                <SafeAreaView>
                    <View className='flex justify-center items-center my-6'>

                        <MaskedView
                            maskElement={
                                <Text className='text-5xl font-ostt text-center bg-transparent'>
                                    Welcome
                                </Text>
                            }
                            style={{ height: 60, width: '100%' }}
                        >

                            <Animated.View
                                style={{
                                    width: width * 2,
                                    height: '100%',
                                    transform: [{ translateX }]
                                }}
                            >
                                <LinearGradient
                                    colors={['#3b82f6', '#ec4899', '#8b5cf6', '#ec4899', '#3b82f6']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 0 }}
                                    style={{ flex: 1 }}
                                />
                            </Animated.View>
                        </MaskedView>

                    </View>
                </SafeAreaView>

                <Arise handleContinue={handleContinueTo} />
            </ImageBackground>
            <StaterModel open={open} onClose={handleOpen} handleContinue={handleContinue} /></>
    )
}
