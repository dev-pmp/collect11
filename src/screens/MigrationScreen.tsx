import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { migrateGuestToCloud } from '../data/migrateGuestToCloud';
import { useAppStore } from '../store/useAppStore';

export function MigrationScreen() {
  const navigation = useNavigation<any>();
  const localUserId = useAppStore((s) => s.localUserId);
  const session = useAppStore((s) => s.session);
  const finishMigration = useAppStore((s) => s.finishMigration);
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      if (!session?.user.id) return;
      try {
        await migrateGuestToCloud(localUserId, session.user.id);
        await finishMigration();
        setDone(true);
      } catch (e: any) {
        Alert.alert('Migration issue', e.message ?? 'Please retry');
      }
    })();
  }, [session?.user.id, localUserId, finishMigration]);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 }}>
      {!done ? (
        <>
          <ActivityIndicator />
          <Text>Migrating your Collect11 data to cloud...</Text>
        </>
      ) : (
        <>
          <Text>Migration complete ✅</Text>
          <Button title="Go to app" onPress={() => navigation.replace('Collect11')} />
        </>
      )}
    </View>
  );
}
