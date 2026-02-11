import AsyncStorage from '@react-native-async-storage/async-storage';
import { LocalRepository } from './repositories/LocalRepository';
import { CloudRepository } from './repositories/CloudRepository';
import { appStorageKeys } from '../store/useAppStore';
import { uploadCloudPhoto } from './photoService';
import { db } from './localDb';

export async function migrateGuestToCloud(localUserId: string, cloudUserId: string) {
  const alreadyMigrated = await AsyncStorage.getItem(appStorageKeys.MIGRATION_FLAG_KEY);
  if (alreadyMigrated === 'true') return;

  const localRepo = new LocalRepository(localUserId);
  const cloudRepo = new CloudRepository(cloudUserId);

  const shirts = await localRepo.listShirts();
  for (const shirt of shirts) {
    await cloudRepo.upsertShirt({ ...shirt, ownerId: cloudUserId });
    const localPhotos = await localRepo.listShirtPhotos(shirt.id);
    const migratedPhotos = [];
    for (const photo of localPhotos) {
      try {
        const path = await uploadCloudPhoto(cloudUserId, shirt.id, photo.id, photo.uriOrPath);
        migratedPhotos.push({ ...photo, ownerId: cloudUserId, uriOrPath: path });
      } catch (e) {
        // continue migration even if a single photo upload fails
        console.warn('Photo upload failed during migration', photo.id, e);
      }
    }
    await cloudRepo.setShirtPhotos(shirt.id, migratedPhotos);
  }

  const collections = await localRepo.listCollections();
  for (const collection of collections) {
    await cloudRepo.upsertCollection({ ...collection, ownerId: cloudUserId });
    const links = db.getAllSync('SELECT shirt_id FROM collection_items WHERE collection_id = ? AND owner_id = ?', [
      collection.id,
      localUserId,
    ]);
    await cloudRepo.setCollectionItems(
      collection.id,
      links.map((x: any) => x.shirt_id),
    );
  }

  db.runSync('UPDATE shirts SET owner_id = ? WHERE owner_id = ?', [cloudUserId, localUserId]);
  db.runSync('UPDATE shirt_photos SET owner_id = ? WHERE owner_id = ?', [cloudUserId, localUserId]);
  db.runSync('UPDATE collections SET owner_id = ? WHERE owner_id = ?', [cloudUserId, localUserId]);
  db.runSync('UPDATE collection_items SET owner_id = ? WHERE owner_id = ?', [cloudUserId, localUserId]);

  await AsyncStorage.setItem(appStorageKeys.MIGRATION_FLAG_KEY, 'true');
}
