import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

export default function HomeScreen() {
    const [finished, setFinished] = useState(false);

    const progress = useSharedValue<number>(10);
    const progressAnimatedStyle = useAnimatedStyle(() => ({
        width: withSpring(`${progress.value}%`),
    }));

    const onFinish = (finished: boolean | undefined) => {
        console.log("Animation finished status:", finished);

        if (finished) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        // Update React state or navigate safely here
    };

    const longPressGesture = Gesture.LongPress()
        .minDuration(0)
        .onStart(() => {
            const duration = 1000;
            // Start the progress animation linearly
            progress.value = withTiming(
                100,
                { duration: 1000, easing: Easing.bezier(0.25, 0.1, 0.25, 2.0) },
                (finished, value) => {
                    // 2. Schedule the JS-thread function from the UI thread
                    // Use the flat argument syntax: scheduleOnRN(function, ...args)
                    scheduleOnRN(onFinish, finished);
                }
            );

            scheduleOnRN(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            });

            // scheduleOnRN(() => {
            //     Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            // });
        })
        .onEnd(() => {
            if (progress.value < 100) {
                progress.value = 0;
                scheduleOnRN(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));
            }
        });

    useEffect(() => {
        if (finished) {
            console.log("finished");
        }
    }, [finished]);

    console.log("finished", finished);
    return (
        <SafeAreaView style={{ flex: 1, paddingHorizontal: 10 }}>
            <View
                style={{
                    marginTop: 50,
                    height: 20,
                    display: "flex",
                    flexDirection: "row",

                    backgroundColor: "rgba(47, 27, 224, 0.1)",
                    borderRadius: 10,
                    overflow: "hidden",
                }}
            >
                <Animated.View style={[progressAnimatedStyle, { backgroundColor: "#ad10b0", height: "100%" }]} />
            </View>

            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 20 }}>
                <GestureDetector gesture={longPressGesture}>
                    <View>
                        <Text style={{ fontSize: 20 }}>Hold to Start</Text>
                    </View>
                </GestureDetector>
                <Button
                    title="Reset"
                    onPress={() => {
                        progress.value = 0;
                    }}
                />
            </View>
        </SafeAreaView>
    );
}
