import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ShirtsScreen } from '../screens/ShirtsScreen';
import { CollectionsScreen } from '../screens/CollectionsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { ShirtDetailScreen } from '../screens/ShirtDetailScreen';
import { AuthScreen } from '../screens/AuthScreen';
import { MigrationScreen } from '../screens/MigrationScreen';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

function Tabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Shirts" component={ShirtsScreen} />
      <Tab.Screen name="Collections" component={CollectionsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <RootStack.Navigator>
      <RootStack.Screen name="Collect11" component={Tabs} />
      <RootStack.Screen name="ShirtDetail" component={ShirtDetailScreen} options={{ title: 'Shirt Detail' }} />
      <RootStack.Screen name="Auth" component={AuthScreen} options={{ title: 'Create account' }} />
      <RootStack.Screen name="Migration" component={MigrationScreen} options={{ title: 'Migrating to cloud' }} />
    </RootStack.Navigator>
  );
}
