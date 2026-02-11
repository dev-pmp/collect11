import React, { useCallback, useState } from 'react';
import { Alert, Button, FlatList, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { v4 as uuidv4 } from 'uuid';
import { useRepository } from '../data/RepositoryProvider';
import { Collection } from '../data/types';
import { useAppStore } from '../store/useAppStore';
import { BrandHeader } from '../components/BrandHeader';

export function CollectionsScreen() {
  const repo = useRepository();
  const ownerId = useAppStore((s) => s.session?.user.id ?? s.localUserId);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');

  const load = useCallback(async () => {
    setCollections(await repo.listCollections());
  }, [repo]);
  useFocusEffect(useCallback(() => void load(), [load]));

  const createCollection = async () => {
    try {
      await repo.upsertCollection({
        id: uuidv4(),
        ownerId,
        name,
        createdAt: new Date().toISOString(),
      });
      setShowCreate(false);
      setName('');
      await load();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to create collection');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <BrandHeader />
      <Button title="Create collection" onPress={() => setShowCreate(true)} />
      <FlatList
        data={collections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={{ padding: 12, borderBottomWidth: 1 }}>
            <Text style={{ fontWeight: '700' }}>{item.name}</Text>
            <Text>{item.description}</Text>
          </Pressable>
        )}
      />

      <Modal visible={showCreate} animationType="slide">
        <View style={{ flex: 1, padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>Create Collection</Text>
          <TextInput placeholder="Name" value={name} onChangeText={setName} style={{ borderWidth: 1, padding: 8 }} />
          <Button title="Save" onPress={createCollection} />
          <Button title="Cancel" color="tomato" onPress={() => setShowCreate(false)} />
        </View>
      </Modal>
    </View>
  );
}
