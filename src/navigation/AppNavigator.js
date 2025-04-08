import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import GroupDetailScreen from "../screens/GroupDetailScreen";

const Stack = createStackNavigator();

export default function AppNavigator({ onLogout }) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home">
          {(props) => <HomeScreen {...props} onLogout={onLogout} />}
        </Stack.Screen>
        <Stack.Screen name="GroupDetail" component={GroupDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
