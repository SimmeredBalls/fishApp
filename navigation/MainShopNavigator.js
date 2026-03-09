import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import CartScreen from '../screens/CartScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// This allows us to have sub-screens inside the Profile tab
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
    </Stack.Navigator>
  );
}

export default function MainShopNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Shop') iconName = 'fish-outline';
          else if (route.name === 'Cart') iconName = 'cart-outline';
          else if (route.name === 'Orders') iconName = 'person-outline';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2ecc71',
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: '#2ecc71' },
        headerTintColor: '#fff',
      })}
    >
      <Tab.Screen name="Shop" component={HomeScreen} options={{ title: 'Fresh Fish' }} />
      <Tab.Screen name="Cart" component={CartScreen} />
      {/* We use the ProfileStack here instead of just ProfileScreen */}
      <Tab.Screen name="Orders" component={ProfileStack} options={{ title: 'My Profile' }} />
    </Tab.Navigator>
  );
}