import { DateTime } from "luxon";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, StyleSheet, Text, View } from "react-native";

const WINDOW_WIDTH = Dimensions.get("window").width - 40; // 40 is the padding of the container
const DAYS_IN_WEEK = 7;
// How far back and forward you want to generate
const MONTHS_BACK = 12;
const MONTHS_FORWARD = 12;

type DayItem = {
    date: DateTime;
    isToday: boolean;
    isCurrentMonth: boolean; // Optional: to style days outside the focused month differently
};
type Week = DayItem[];

export default function CalendarComponent() {
    const [weeks, setWeeks] = useState<Week[]>([]);
    const [currentMonthStr, setCurrentMonthStr] = useState<string>("");
    const listRef = useRef<FlatList<Week>>(null);

    // 1️⃣ Build calendar data on mount
    useEffect(() => {
        const generatedWeeks = buildCalendarData();
        setWeeks(generatedWeeks);

        // Set initial header to today's month
        setCurrentMonthStr(DateTime.local().toFormat("MMMM yyyy"));
    }, []);

    // 2️⃣ Scroll to current week once data is ready
    useEffect(() => {
        if (weeks.length > 0) {
            // Find the index of the week containing 'today'
            const index = weeks.findIndex((week) => week.some((day) => day.isToday));

            // We use a timeout to ensure the list is rendered before scrolling
            setTimeout(() => {
                if (index >= 0 && listRef.current) {
                    listRef.current.scrollToIndex({ index, animated: false });
                }
            }, 100);
        }
    }, [weeks]);

    // 📌 Generates weeks array
    function buildCalendarData() {
        const now = DateTime.local();

        // Start X months back, aligned to the start of that week (e.g. Monday)
        // This ensures columns stay consistent (Col 1 is always Mon, etc.)
        const startPoint = now.minus({ months: MONTHS_BACK }).startOf("month").startOf("week");

        // End X months forward, aligned to end of that week
        const endPoint = now.plus({ months: MONTHS_FORWARD }).endOf("month").endOf("week");

        const days: DayItem[] = [];
        let pointer = startPoint;

        while (pointer <= endPoint) {
            days.push({
                date: pointer,
                isToday: pointer.hasSame(now, "day"),
                isCurrentMonth: pointer.hasSame(now, "month"),
            });
            pointer = pointer.plus({ days: 1 });
        }

        // Group into weeks
        const grouped: Week[] = [];
        let tempWeek: DayItem[] = [];

        days.forEach((day) => {
            tempWeek.push(day);
            if (tempWeek.length === DAYS_IN_WEEK) {
                grouped.push(tempWeek);
                tempWeek = [];
            }
        });

        return grouped;
    }

    // 📌 Helper: Updates the Month/Year text when the user swipes
    const onViewableItemsChanged = useCallback(({ viewableItems }: any) => {
        if (viewableItems.length > 0) {
            const visibleWeek = viewableItems[0].item as Week;
            // We take the middle day of the week (index 3) to decide which month to show
            // This prevents the header from flickering too early if a week spans two months
            const representativeDate = visibleWeek[3].date;
            setCurrentMonthStr(representativeDate.toFormat("MMMM yyyy"));
        }
    }, []);

    // Config for the viewability tracker
    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 50,
    }).current;

    // Render one week
    const renderWeek = ({ item }: { item: Week }) => (
        <View style={styles.weekRow}>
            {item.map((day) => (
                <View key={day.date.toISODate()} style={[styles.dayBox, day.isToday && styles.todayHighlight]}>
                    <Text style={styles.dayLabel}>{day.date.toFormat("ccc")}</Text>
                    <Text style={[styles.dayText, day.isToday && styles.todayText]}>{day.date.toFormat("dd")}</Text>
                </View>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* HEADER */}
            <View style={styles.header}>
                <Text style={styles.headerText}>{currentMonthStr}</Text>
            </View>

            {/* CALENDAR LIST */}
            <FlatList
                ref={listRef}
                data={weeks}
                horizontal
                pagingEnabled
                keyExtractor={(_, i) => i.toString()}
                renderItem={renderWeek}
                // Fixed: removed the (-40) which causes drift
                getItemLayout={(_, index) => ({
                    length: WINDOW_WIDTH,
                    offset: index * WINDOW_WIDTH,
                    index,
                })}
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                initialNumToRender={3}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: "transparent",
    },
    header: {
        paddingHorizontal: 16,
        paddingBottom: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    headerText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#333",
    },
    weekRow: {
        flexDirection: "row",
        width: WINDOW_WIDTH,
        justifyContent: "space-around", // spread days evenly
    },
    dayBox: {
        alignItems: "center",
        justifyContent: "center",
        padding: 10,
        borderRadius: 12,
    },
    dayLabel: {
        fontSize: 12,
        color: "#999",
        marginBottom: 4,
        textTransform: "uppercase",
    },
    dayText: {
        fontSize: 18,
        fontWeight: "600",
        color: "#333",
    },
    todayHighlight: {
        backgroundColor: "#2196F3", // A nice blue for today
    },
    todayText: {
        color: "#fff",
    },
});
