import { DateTime } from "luxon";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Dimensions, FlatList, Pressable, StyleProp, StyleSheet, Text, TextStyle, View, ViewStyle } from "react-native";
import Animated from "react-native-reanimated";
import { IconSymbol } from "./ui/icon-symbol";

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

export default function CalendarComponent({
    children,
    progressTextColorStyle,
    checkedInDates,
    todayCheckedInStyle,
}: {
    children: React.ReactNode;
    progressTextColorStyle: StyleProp<TextStyle>;
    checkedInDates: string[];
    todayCheckedInStyle: StyleProp<ViewStyle>;
}) {
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
            {item.map((day) => {
                const today = DateTime.local();
                const isFutureDate = day.date > today;
                const isCheckedIn = checkedInDates.includes(day.date.toISODate() || "");

                return (
                    <Pressable
                        key={day.date.toISODate()}
                        style={[
                            styles.dayBox,
                            { borderColor: day.isToday ? "#bf00f0" : "transparent", borderWidth: 1 },
                            isCheckedIn && { backgroundColor: "#bf00f0" },
                        ]}
                        // onPress={() => console.log()}
                    >
                        {day.isToday && children}
                        {/* <Text style={styles.dayLabel}>{day.date.toFormat("ccc")}</Text> */}
                        <Animated.Text
                            style={[
                                styles.dayText,
                                day.isToday && styles.todayText,
                                day.isToday && progressTextColorStyle,
                                isCheckedIn && { color: "#FBE8FF" },
                                isFutureDate && { color: "lightgray" },
                            ]}
                        >
                            {day.date.toFormat("d")}
                        </Animated.Text>
                        {/* <View
                        style={{ height: 8, width: 8, backgroundColor: "#c192ff", borderRadius: 100, marginTop: 4 }}
                    /> */}

                        {isFutureDate ? (
                            <IconSymbol name="circle" size={18} style={{ marginTop: 4 }} color="lightgray" />
                        ) : isCheckedIn ? (
                            <IconSymbol
                                name="checkmark.circle.fill"
                                size={18}
                                style={{ marginTop: 4 }}
                                color="#FBE8FF"
                            />
                        ) : day.isToday ? (
                            <View style={{ height: 18, width: 18, marginTop: 4 }}>
                                <IconSymbol
                                    name="circle"
                                    size={18}
                                    style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}
                                    color="#bf00f0"
                                />
                                <Animated.View
                                    style={[
                                        todayCheckedInStyle,
                                        { position: "absolute", bottom: 0, left: 0, right: 0 },
                                    ]}
                                >
                                    <IconSymbol name="checkmark.circle.fill" size={18} color="#FBE8FF" />
                                </Animated.View>
                            </View>
                        ) : (
                            <IconSymbol name="xmark.circle.fill" size={18} style={{ marginTop: 4 }} color="#FF6161" />
                        )}
                    </Pressable>
                );
            })}
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
                renderItem={(item) => renderWeek(item)}
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
        paddingHorizontal: 8,
        paddingBottom: 14,
        alignItems: "flex-start",
        justifyContent: "center",
    },
    headerText: {
        fontSize: 20,
        fontWeight: "600",
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
        height: 70,
        width: (WINDOW_WIDTH - 40) / 7,
        borderRadius: 30,
        backgroundColor: "#f9f4ff",
        overflow: "hidden",
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
        backgroundColor: "#00ef0e", // A nice blue for today
    },
    todayText: {
        width: 30,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        color: "#bf00f0",
    },
});
