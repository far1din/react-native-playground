import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import NumberIncrementor from "./number-incrementor";
import { ThemedText } from "./themed-text";

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
            progress.value = withTiming(250, { duration: 500, easing: Easing.linear }, (finished) => {
                scheduleOnRN(onFinish, finished);
            });

            scheduleOnRN(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            });
        })
        .onEnd(() => {
            if (progress.value < 250) {
                progress.value = 0;
                scheduleOnRN(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
            }
        });
    return (
        <>
            <View style={{ flexDirection: "row", gap: 8 }}>
                <View style={styles.dayContainer}>
                    <Animated.View style={[styles.dayContainerInner, progressAnimatedStyle]} />
                    <ThemedText>M</ThemedText>

                    {/* <IconSymbol name="checkmark.circle.fill" size={20} color="white" /> */}
                </View>
                <View style={styles.dayContainer}>
                    <ThemedText>T</ThemedText>
                </View>
                <View style={styles.dayContainer}>
                    <ThemedText>W</ThemedText>
                </View>
                <View style={styles.dayContainer}>
                    <ThemedText>T</ThemedText>
                </View>
                <View style={styles.dayContainer}>
                    <ThemedText>F</ThemedText>
                </View>
                <View style={styles.dayContainer}>
                    <ThemedText>S</ThemedText>
                </View>
                <View style={styles.dayContainer}>
                    <ThemedText>S</ThemedText>
                </View>
            </View>

            <NumberIncrementor maxNumber={maxNumber} selectedNumber={selectedNumber} />

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
        </>
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
