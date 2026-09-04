// Copyright (c) 2026 Raj
// See LICENSE for detail

import { fetchUserMetricsDashboard, MusicStatsPayload } from '@/service/musicAnalyticsdb'
import { useSQLiteContext } from 'expo-sqlite'
import { Clock, Crown, TrendingUp } from 'lucide-react-native'
import React from 'react'
import { Image, Text, useColorScheme, View } from 'react-native'

const EMPTY_STATS: MusicStatsPayload = {
    totalWatchMinutes: 0,
    completionRate: 0,
    heavyRotation: [],
    weeklyGraphData: [],
}

const RANK_ACCENTS = ['#fbbf24', '#cbd5e1', '#d97706']

const rankColor = (index: number) => RANK_ACCENTS[index] ?? '#94a3b8'

const Matrics = () => {
    const [stats, setStats] = React.useState<MusicStatsPayload>(EMPTY_STATS)
    const [loading, setLoading] = React.useState(true)
    const db = useSQLiteContext()
    const colorScheme = useColorScheme();
    const isDark = colorScheme === 'dark';

    const loadStats = React.useCallback(async () => {
        try {
            const response = await fetchUserMetricsDashboard(db)
            if (response) {
                setStats(response)
            }
        } catch (error) {
            console.error('Failed loading music stats:', error)
        } finally {
            setLoading(false)
        }
    }, [db])

    React.useEffect(() => {
        loadStats()
    }, [loadStats])

    if (loading) {
        return (
            <View className="bg-white dark:bg-[#181818] rounded-xl p-6 shadow-sm border border-slate-100 dark:border-[#282828] mb-6 items-center">
                <Text className="text-slate-400 dark:text-[#B3B3B3] text-sm font-medium">Loading stats…</Text>
            </View>
        )
    }

    const maxMinutes = Math.max(1, ...stats.weeklyGraphData.map((d) => d.minutes))

    return (
        <View className="mb-6">
            <Text className="text-sm font-bold text-slate-400 dark:text-[#B3B3B3] uppercase tracking-wider ml-2 mb-2">
                Your Stats
            </Text>

            <View className="flex-row gap-3 mb-3">
                <View className="flex-1 bg-white dark:bg-[#181818] rounded-xl p-4 shadow-sm border border-slate-100 dark:border-[#282828]">
                    <View className="w-9 h-9 rounded-full bg-slate-900 dark:bg-[#282828] items-center justify-center mb-3">
                        <Clock size={16} color={isDark ? "#FFFFFF" : "#ffffff"} />
                    </View>
                    <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                        {Math.round(stats.totalWatchMinutes)}
                    </Text>
                    <Text className="text-xs font-medium text-slate-400 dark:text-[#B3B3B3]">Minutes Listened</Text>
                </View>

                <View className="flex-1 bg-white dark:bg-[#181818] rounded-xl p-4 shadow-sm border border-slate-100 dark:border-[#282828]">
                    <View className="w-9 h-9 rounded-full bg-slate-900 dark:bg-[#282828] items-center justify-center mb-3">
                        <TrendingUp size={16} color={isDark ? "#FFFFFF" : "#ffffff"} />
                    </View>
                    <Text className="text-2xl font-bold text-slate-900 dark:text-white">
                        {Math.round(stats.completionRate * 100)}%
                    </Text>
                    <Text className="text-xs font-medium text-slate-400 dark:text-[#B3B3B3]">Completion Rate</Text>
                </View>
            </View>

            <View className="bg-white dark:bg-[#181818] rounded-xl p-5 shadow-sm border border-slate-100 dark:border-[#282828] mb-3">
                <Text className="text-base font-semibold text-slate-700 dark:text-white mb-4 font-elms">Weekly Activity</Text>

                {stats.weeklyGraphData.length === 0 ? (
                    <Text className="text-slate-400 dark:text-[#B3B3B3] text-sm font-elms">No listening activity yet.</Text>
                ) : (
                    <View className="flex-row items-end justify-between h-24">
                        {stats.weeklyGraphData.map((day) => (
                            <View key={day.dayName} className="items-center flex-1">
                                <View
                                    className="w-3 bg-slate-900 dark:bg-white rounded-full"
                                    style={{ height: Math.max(4, (day.minutes / maxMinutes) * 70) }}
                                />
                                <Text className="text-[10px] font-semibold text-slate-400 dark:text-[#B3B3B3] mt-2">
                                    {day.dayName.slice(0, 3)}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            <View className="bg-white dark:bg-[#181818] rounded-xl shadow-sm border border-slate-100 dark:border-[#282828] overflow-hidden">

                <Text className="text-base font-semibold text-slate-700 dark:text-white ml-3 font-elms p-2 mt-2">Most Played</Text>

                {stats.heavyRotation.length === 0 ? (
                    <Text className="text-slate-400 dark:text-[#B3B3B3] text-sm px-5 pb-4">No tracks played yet.</Text>
                ) : (
                    stats.heavyRotation.map((track, index) => {
                        const isLast = index === stats.heavyRotation.length - 1

                        return (
                            <View
                                key={track.id}
                                className={`flex-row items-center justify-between px-4 py-3 ${isLast ? '' : 'border-b border-slate-100 dark:border-[#282828]'
                                    }`}
                            >
                                <View className="flex-row items-center flex-1 mr-3">
                                    <View className="relative mr-3">
                                        <Image
                                            source={{ uri: track.customCoverUri }}
                                            className="w-12 h-12 rounded-md bg-slate-100 dark:bg-[#282828]"
                                            resizeMode="cover"
                                        />

                                        {index < 3 && (
                                            <View className="absolute -top-2 -right-1.5 bg-white dark:bg-[#181818] rounded-full p-0.5">
                                                <Crown size={12} color={rankColor(index)} className='rotate-12' fill={rankColor(index)} />
                                            </View>
                                        )}
                                    </View>

                                    <View className="flex-1">
                                        <Text className="text-sm font-bold text-slate-900 dark:text-white" numberOfLines={1}>
                                            {track.title}
                                        </Text>
                                        <Text className="text-xs font-medium text-slate-400 dark:text-[#B3B3B3]" numberOfLines={1}>
                                            {track.artist}
                                        </Text>
                                    </View>
                                </View>

                                <Text className="text-xs font-bold text-slate-400 dark:text-[#B3B3B3]">{track.playCount}x</Text>
                            </View>
                        )
                    })
                )}
            </View>
        </View>
    )
}

export default Matrics