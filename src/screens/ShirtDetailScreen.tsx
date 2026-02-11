import React, { useCallback, useState } from 'react';
import { Alert, Button, FlatList, Image, Modal, Pressable, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useRepository } from '../data/RepositoryProvider';
import { getSignedPhotoUrl } from '../data/photoService';
import { useAppStore } from '../store/useAppStore';

export function ShirtDetailScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const repo = useRepository();
  const mode = useAppStore((s) => s.mode);
  const [shirt, setShirt] = useState<any>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [showCollections, setShowCollections] = useState(false);

  const load = useCallback(async () => {
    const current = await repo.getShirt(route.params.shirtId);
    setShirt(current);
    const photoRows = await repo.listShirtPhotos(route.params.shirtId);
    setCollections(await repo.listCollections());
    if (mode === 'cloud') {
      setPhotos(await Promise.all(photoRows.map((p) => getSignedPhotoUrl(p.uriOrPath))));
    } else {
      setPhotos(photoRows.map((p) => p.uriOrPath));
    }
  }, [repo, route.params.shirtId, mode]);

  useFocusEffect(useCallback(() => void load(), [load]));

  const remove = async () => {
    try {
      await repo.deleteShirt(route.params.shirtId);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Delete failed', e.message ?? 'Unknown error');
    }
  };

  const addToCollection = async (collectionId: string) => {
    try {
      await repo.setCollectionItems(collectionId, [route.params.shirtId]);
      setShowCollections(false);
      Alert.alert('Saved', 'Shirt added to collection');
    } catch (e: any) {
      Alert.alert('Failed', e.message ?? 'Could not add shirt');
    }
  };

  if (!shirt) return <View style={{ flex: 1, padding: 16 }}><Text>Loading...</Text></View>;

  return (
    <View style={{ flex: 1, padding: 16, gap: 8 }}>
      <Text style={{ fontSize: 24, fontWeight: '800' }}>{shirt.title}</Text>
      <Text>Club: {shirt.club}</Text>
      <FlatList
        horizontal
        data={photos}
        keyExtractor={(item) => item}
        renderItem={({ item }) => <Image source={{ uri: item }} style={{ width: 120, height: 120, marginRight: 8 }} />}
      />
      <Button title="Add to collections" onPress={() => setShowCollections(true)} />
      <Button title="Delete shirt" onPress={remove} color="tomato" />

      <Modal visible={showCollections} animationType="slide">
        <View style={{ flex: 1, padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>Add to collection</Text>
          <FlatList
            data={collections}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable style={{ padding: 12, borderBottomWidth: 1 }} onPress={() => addToCollection(item.id)}>
                <Text>{item.name}</Text>
              </Pressable>
            )}
          />
          <Button title="Close" onPress={() => setShowCollections(false)} />
        </View>
      </Modal>
    </View>
  );
}
