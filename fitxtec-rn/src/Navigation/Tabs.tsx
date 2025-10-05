import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from './../theme/color';

// Screens (crea placeholders si no existen)
//import HomeScreen from '../screens/HomeScreen';
import WorkoutScreen from '../screens/WorkoutScreen';
// import RoutinesScreen from '../screens/RoutinesScreen';
// import ProgressScreen from '../screens/ProgressScreen';
// import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg }
};

export default function Tabs() {
  return (
    <NavigationContainer theme={navTheme}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8
          },
          tabBarIcon: ({ color, size, focused }) => {
            switch (route.name) {
              case 'Home':
                return <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
              case 'Workout':
                return <MaterialCommunityIcons name="dumbbell" size={size} color={color} />;
              case 'Routines':
                return <Ionicons name={focused ? 'grid' : 'grid-outline'} size={size} color={color} />;
              case 'Progress':
                return <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={size} color={color} />;
              case 'Profile':
                return <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />;
              default:
                return null;
            }
          }
        })}
      >
        
        <Tab.Screen name="Workout" component={WorkoutScreen} />
        
      </Tab.Navigator>
    </NavigationContainer>
  );
}
//<Tab.Screen name="Home" component={HomeScreen} />
{/* <Tab.Screen name="Routines" component={RoutinesScreen} />
        <Tab.Screen name="Progress" component={ProgressScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} /> */}