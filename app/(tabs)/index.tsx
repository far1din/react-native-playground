import { useAudioPlayer } from "expo-audio";
import * as Haptics from "expo-haptics";
import { useEffect, useState } from "react";
import { Button, Text, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { scheduleOnRN } from "react-native-worklets";

const defaultSuccess = require("@/assets/sounds/success.wav");

export default function HomeScreen() {
    const [finished, setFinished] = useState(false);
    const player = useAudioPlayer(defaultSuccess);

    const progress = useSharedValue<number>(10);
    const progressAnimatedStyle = useAnimatedStyle(() => ({
        width: withSpring(`${progress.value}%`),
    }));

    const onFinish = (finished: boolean | undefined) => {
        if (finished) {
            player.seekTo(0);
            player.play();

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            setTimeout(() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            }, 50);
        }
    };

    const longPressGesture = Gesture.LongPress()
        .minDuration(0)
        .onStart(() => {
            progress.value = withTiming(100, { duration: 1000, easing: Easing.linear }, (finished) => {
                scheduleOnRN(onFinish, finished);
            });

            scheduleOnRN(() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            });
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
