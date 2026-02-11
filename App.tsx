import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { RepositoryProvider } from './src/data/RepositoryProvider';
import { useAppBootstrap } from './src/store/useAppBootstrap';
import { View, ActivityIndicator } from 'react-native';

export default function App() {
  const isReady = useAppBootstrap();

  if (!isReady) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <RepositoryProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </RepositoryProvider>
  );
}
