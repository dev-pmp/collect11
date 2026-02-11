import React from 'react';
import { Alert, Button, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { BrandHeader } from '../components/BrandHeader';

export function ProfileScreen() {
  const navigation = useNavigation<any>();
  const mode = useAppStore((s) => s.mode);
  const session = useAppStore((s) => s.session);
  const signOut = useAppStore((s) => s.signOut);

  return (
    <View style={{ flex: 1, padding: 16, gap: 16 }}>
      <BrandHeader />
      {mode === 'guest' ? (
        <>
          <Text>You are using Collect11 in guest mode</Text>
          <Button
            title="Create account to back up your Collect11 collection"
            onPress={() => navigation.navigate('Auth')}
          />
        </>
      ) : (
        <>
          <Text>Signed in as: {session?.user.email}</Text>
          <Button
            title="Logout"
            onPress={async () => {
              try {
                await signOut();
              } catch (e: any) {
                Alert.alert('Sign out failed', e.message ?? 'Unknown error');
              }
            }}
          />
        </>
      )}
    </View>
  );
}
