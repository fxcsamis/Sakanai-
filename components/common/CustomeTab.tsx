// Copyright (c) 2026 Raj 
// See LICENSE for details.

import { LucideProps } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { Image, ImageSourcePropType, Text } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';

export default function CustomeTab({ name, Icon, image = null, isActive = false }: { name: string, Icon?: React.ForwardRefExoticComponent<LucideProps & React.RefAttributes<SVGSVGElement>> | null, image?: ImageSourcePropType | null, isActive?: boolean }) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const pillStyle = useAnimatedStyle(() => ({
        transform: [
            { scale: withSpring(isActive ? 1 : 0.94, { mass: 0.3, damping: 15, stiffness: 220 }) },
        ],
        backgroundColor: withTiming(
            isActive ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)') : 'transparent',
            { duration: 200 }
        ),
    }));

    const iconStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: withSpring(isActive ? -1 : 0, { mass: 0.3, damping: 14, stiffness: 220 }) },
        ],
        opacity: withTiming(isActive ? 1 : 0.6, { duration: 200 }),
    }));

    return (
        <Animated.View
            style={pillStyle}
            className='flex items-center gap-0.5 px-3 py-1.5 rounded-full min-w-[52px]'
        >
            <Animated.View style={iconStyle} className='flex items-center gap-0.5'>
                {Icon && <Icon className={isDark ? 'text-white' : 'text-black'} color={isDark ? 'white' : 'black'} size={16} />}
                {image && <Image source={image} className='w-[1.1rem] h-[1.1rem]' />}
                <Text
                    numberOfLines={1}
                    className={`${isDark ? 'text-white' : 'text-black'} font-elms-med text-[10px]`}
                >
                    {name}
                </Text>
            </Animated.View>
        </Animated.View>
    )
}
