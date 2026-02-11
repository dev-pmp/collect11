import React, { useState } from 'react';
import { Alert, Button, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';

export function AuthScreen() {
  const navigation = useNavigation<any>();
  const signIn = useAppStore((s) => s.signIn);
  const signUp = useAppStore((s) => s.signUp);
  const startUpgrade = useAppStore((s) => s.startUpgrade);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const run = async (type: 'in' | 'up') => {
    try {
      if (type === 'in') await signIn(email, password);
      else await signUp(email, password);
      startUpgrade();
      navigation.replace('Migration');
    } catch (e: any) {
      Alert.alert('Auth failed', e.message ?? 'Unknown error');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={{ borderWidth: 1, padding: 8 }} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={{ borderWidth: 1, padding: 8 }} />
      <Button title="Sign In" onPress={() => run('in')} />
      <Button title="Sign Up" onPress={() => run('up')} />
    </View>
  );
}
