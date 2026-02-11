import * as FileSystem from 'expo-file-system';
import { supabase } from './supabase';

export async function saveGuestPhoto(sourceUri: string, shirtId: string, photoId: string) {
  const targetDir = `${FileSystem.documentDirectory}photos/${shirtId}`;
  await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });
  const dest = `${targetDir}/${photoId}.jpg`;
  await FileSystem.copyAsync({ from: sourceUri, to: dest });
  return dest;
}

export async function uploadCloudPhoto(ownerId: string, shirtId: string, photoId: string, sourceUri: string) {
  const path = `${ownerId}/${shirtId}/${photoId}.jpg`;
  const response = await fetch(sourceUri);
  const blob = await response.blob();
  const { error } = await supabase.storage.from('shirt-photos').upload(path, blob, { upsert: true, contentType: 'image/jpeg' });
  if (error) throw error;
  return path;
}

export async function getSignedPhotoUrl(path: string) {
  const { data, error } = await supabase.storage.from('shirt-photos').createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
