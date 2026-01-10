import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import React from "react";

import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
    const colorScheme = useColorScheme();

    return (
        <NativeTabs>
            <NativeTabs.Trigger name="index">
                <Icon sf={{ default: "heart", selected: "heart.fill" }} />
                <Label>Home</Label>
            </NativeTabs.Trigger>
            <NativeTabs.Trigger name="explore">
                <Icon sf={{ default: "paperplane", selected: "paperplane.fill" }} />
                <Label>Explore</Label>
            </NativeTabs.Trigger>
        </NativeTabs>
    );
}
