import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import CalendarComponent from "./calendar-component";
import NumberIncrementor from "./number-incrementor";

const defaultSuccess = require("@/assets/sounds/success-2.mp3");

export function WeeklyCalendar() {
    const player = useAudioPlayer(defaultSuccess);
    const [selectedNumber, setSelectedNumber] = useState(10);
    const [maxNumber, setMaxNumber] = useState(30);

    const progress = useSharedValue<number>(0);
    const progressAnimatedStyle = useAnimatedStyle(() => ({
        height: withSpring(`${progress.value}%`),
    }));

    const onFinish = (finished: boolean | undefined) => {
        if (finished) {
            player.seekTo(0);
            player.play();

            setTimeout(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            }, 50);
            setTimeout(() => {
                setSelectedNumber((prev) => prev + 1);
                setMaxNumber((prev) => selectedNumber + 5);
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }, 100);
        }
    };

    const longPressGesture = Gesture.LongPress()
        .minDuration(0)
        .onStart(() => {
            progress.value = withTiming(140, { duration: 500, easing: Easing.linear }, (finished) => {
                scheduleOnRN(onFinish, finished);
            });

            scheduleOnRN(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            });
        })
        .onEnd(() => {
            if (progress.value < 140) {
                progress.value = 0;
                scheduleOnRN(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
            }
        });
    return (
        <View style={{ flex: 1, gap: 40, marginTop: 40 }}>
            <NumberIncrementor maxNumber={maxNumber} selectedNumber={selectedNumber} />

            <CalendarComponent>
                <Animated.View style={[styles.dayContainerInner, progressAnimatedStyle]} />
            </CalendarComponent>

            <View
                style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 20,

                    position: "absolute",
                    bottom: 100,
                    left: 0,
                    right: 0,
                }}
            >
                <GestureDetector gesture={longPressGesture}>
                    <View
                        style={{
                            backgroundColor: "#FBE8FF",
                            height: 100,
                            width: 100,
                            borderRadius: 100,
                            justifyContent: "center",
                            alignItems: "center",
                            borderWidth: 5,
                            borderColor: "purple",
                        }}
                    >
                        <Text style={{ fontSize: 14, fontWeight: 500, textAlign: "center" }}>HOLD</Text>
                    </View>
                </GestureDetector>
                <Button
                    title="Reset"
                    onPress={() => {
                        progress.value = 0;
                    }}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: "row",
        gap: 8,
    },
    dayContainer: {
        backgroundColor: "#FBE8FF",
        flex: 1,
        justifyContent: "center",
        paddingVertical: 10,
        alignItems: "center",
        height: 50,
        borderRadius: 100,
        overflow: "hidden",
    },
    dayContainerInner: {
        width: "100%",
        bottom: 0,
        position: "absolute",
        backgroundColor: "#AD10B0",
        borderTopLeftRadius: 80,
        borderTopRightRadius: 20,
    },
});
