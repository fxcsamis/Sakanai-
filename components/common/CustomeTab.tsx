// Copyright (c) 2026 Raj
// See LICENSE for details.

import { LucideProps } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Image, ImageSourcePropType, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

// One tab: icon + label. The highlight behind the active tab lives in TabBarBackground;
// here the icon just does a small iOS-style squish-and-pop when it becomes active.
export default function CustomeTab({ name, Icon, image = null, isActive = false }: { name: string, Icon?: React.ForwardRefExoticComponent<LucideProps & React.RefAttributes<SVGSVGElement>> | null, image?: ImageSourcePropType | null, isActive?: boolean }) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const scale = useSharedValue(isActive ? 1.1 : 1);

    React.useEffect(() => {
        scale.value = isActive
            ? withSequence(
                withTiming(0.82, { duration: 90 }),
                withSpring(1.1, { mass: 0.5, damping: 8, stiffness: 260 })
            )
            : withSpring(1, { mass: 0.5, damping: 14, stiffness: 220 });
    }, [isActive]);

    const iconStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const wrapStyle = useAnimatedStyle(() => ({
        opacity: withTiming(isActive ? 1 : 0.55, { duration: 180 }),
    }));

    return (
        <Animated.View style={wrapStyle} className='items-center justify-center'>
            <Animated.View style={iconStyle} className='items-center justify-center'>
                {Icon && <Icon color={isDark ? 'white' : 'black'} size={16} />}
                {image && <Image source={image} style={{ width: 16, height: 16 }} />}
            </Animated.View>
            <Text
                numberOfLines={1}
                style={{ fontSize: 9, marginTop: 1 }}
                className={`${isDark ? 'text-white' : 'text-black'} font-elms-med`}
            >
                {name}
            </Text>
        </Animated.View>
    );
}
