import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { WeeklyCalendar } from "@/components/weekly-calendar";
export default function TabTwoScreen() {
    return (
        <SafeAreaView style={{ flex: 1, padding: 20, gap: 5 }}>
            <View style={styles.titleContainer}>
                <Text style={{ fontSize: 30, fontWeight: "bold" }}>Streak</Text>
            </View>
            <Text style={{ fontSize: 16, lineHeight: 24 }}>This is a simple app to help you track your streak.</Text>
            <WeeklyCalendar />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    titleContainer: {
        flexDirection: "row",
        gap: 8,
    },
});
