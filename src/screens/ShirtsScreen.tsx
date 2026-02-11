import React, { useCallback, useState } from 'react';
import { Alert, Button, FlatList, Image, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { v4 as uuidv4 } from 'uuid';
import { useRepository } from '../data/RepositoryProvider';
import { Photo, Shirt } from '../data/types';
import { saveGuestPhoto, uploadCloudPhoto, getSignedPhotoUrl } from '../data/photoService';
import { useAppStore } from '../store/useAppStore';
import { BrandHeader } from '../components/BrandHeader';

export function ShirtsScreen() {
  const repo = useRepository();
  const navigation = useNavigation<any>();
  const mode = useAppStore((s) => s.mode);
  const ownerId = useAppStore((s) => s.session?.user.id ?? s.localUserId);
  const [shirts, setShirts] = useState<Shirt[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [club, setClub] = useState('');
  const [pickedUris, setPickedUris] = useState<string[]>([]);

  const load = useCallback(async () => {
    const list = await repo.listShirts();
    setShirts(list);
    const nextThumbs: Record<string, string> = {};
    for (const shirt of list) {
      const photos = await repo.listShirtPhotos(shirt.id);
      if (photos[0]) {
        if (mode === 'cloud') nextThumbs[shirt.id] = await getSignedPhotoUrl(photos[0].uriOrPath);
        else nextThumbs[shirt.id] = photos[0].uriOrPath;
      }
    }
    setThumbs(nextThumbs);
  }, [repo, mode]);

  useFocusEffect(useCallback(() => void load(), [load]));

  const pickPhotos = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ allowsMultipleSelection: true, quality: 0.8, mediaTypes: ['images'] });
    if (!res.canceled) setPickedUris(res.assets.map((a) => a.uri).slice(0, 2));
  };

  const createShirt = async () => {
    try {
      const id = uuidv4();
      const now = new Date().toISOString();
      const shirt: Shirt = { id, ownerId, title: title || 'Untitled', club, createdAt: now, updatedAt: now };
      await repo.upsertShirt(shirt);
      const photos: Photo[] = [];
      for (let i = 0; i < pickedUris.length; i += 1) {
        const photoId = uuidv4();
        const uriOrPath =
          mode === 'guest'
            ? await saveGuestPhoto(pickedUris[i], id, photoId)
            : await uploadCloudPhoto(ownerId, id, photoId, pickedUris[i]);
        photos.push({ id: photoId, shirtId: id, ownerId, uriOrPath, sortOrder: i });
      }
      await repo.setShirtPhotos(id, photos);
      setModalVisible(false);
      setTitle('');
      setClub('');
      setPickedUris([]);
      await load();
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to create shirt');
    }
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <BrandHeader />
      <Button title="Add Shirt" onPress={() => setModalVisible(true)} />
      {shirts.length === 0 ? <Text style={{ marginTop: 24 }}>Add your first shirt to Collect11</Text> : null}
      <FlatList
        data={shirts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={{ gap: 10, marginTop: 12 }}
        columnWrapperStyle={{ gap: 10 }}
        renderItem={({ item }) => (
          <Pressable
            style={{ flex: 1, backgroundColor: '#ececec', minHeight: 160, padding: 8 }}
            onPress={() => navigation.navigate('ShirtDetail', { shirtId: item.id })}
          >
            {thumbs[item.id] ? <Image source={{ uri: thumbs[item.id] }} style={{ width: '100%', height: 100 }} /> : null}
            <Text style={{ fontWeight: '700', marginTop: 6 }}>{item.title}</Text>
            <Text>{item.club}</Text>
          </Pressable>
        )}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={{ flex: 1, padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 20, fontWeight: '700' }}>Create Shirt</Text>
          <Button title="Step 1: Pick up to 2 photos" onPress={pickPhotos} />
          <Text>Selected: {pickedUris.length}</Text>
          <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={{ borderWidth: 1, padding: 10 }} />
          <TextInput placeholder="Club" value={club} onChangeText={setClub} style={{ borderWidth: 1, padding: 10 }} />
          <Button title="Save" onPress={createShirt} />
          <Button title="Cancel" onPress={() => setModalVisible(false)} color="tomato" />
        </View>
      </Modal>
    </View>
  );
}
