import { StyleSheet, View } from "react-native";
import { ThemedText } from "./themed-text";

export function WeeklyCalendar() {
    return (
        <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={styles.dayContainer}>
                <View style={styles.dayContainerInner} />
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
        height: 70,
        borderRadius: 10,
        overflow: "hidden",
    },
    dayContainerInner: {
        width: "100%",
        height: "1000%",
        bottom: 0,
        position: "absolute",
        backgroundColor: "#AD10B0",
        borderTopLeftRadius: 80,
        borderTopRightRadius: 20,
    },
});
