import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

const ITEM_HEIGHT = 68;

export default function NumberIncrementor({
    maxNumber,
    selectedNumber,
}: {
    maxNumber: number;
    selectedNumber: number;
}) {
    const selected = useSharedValue(selectedNumber);
    // const MAX_NUMBER = 30;

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: withTiming(-selected.value * ITEM_HEIGHT, {
                        duration: 500,
                        easing: Easing.out(Easing.cubic),
                    }),
                },
            ],
        };
    });

    const pickNumber = (num: number) => {
        selected.value = num;
    };

    useEffect(() => {
        selected.value = selectedNumber;
    }, [selectedNumber]);

    return (
        <View style={styles.container}>
            {/* Window */}

            <View style={styles.window}>
                <Animated.View style={animatedStyle}>
                    {Array.from({ length: maxNumber + 1 }).map((_, i) => (
                        <View key={i} style={styles.item}>
                            <Text style={styles.text}>{i}</Text>
                        </View>
                    ))}
                </Animated.View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    window: {
        height: ITEM_HEIGHT,
        width: 80,

        overflow: "hidden",
        borderRadius: 5,
        backgroundColor: "#FBE8FF",
        marginBottom: 32,
    },
    item: {
        height: ITEM_HEIGHT,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 52,
        fontWeight: "600",
        color: "black",
    },
    buttons: {
        flexDirection: "row",
        gap: 12,
    },
});
