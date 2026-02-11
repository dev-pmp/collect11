import { supabase } from '../supabase';
import { Collection, Photo, Shirt } from '../types';
import { IRepository } from './IRepository';

export class CloudRepository implements IRepository {
  constructor(private readonly ownerId: string) {}

  async listShirts(): Promise<Shirt[]> {
    const { data, error } = await supabase.from('shirts').select('*').order('updated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      id: row.id,
      ownerId: row.owner_id,
      title: row.title,
      description: row.description ?? undefined,
      club: row.club ?? undefined,
      league: row.league ?? undefined,
      season: row.season ?? undefined,
      brand: row.brand ?? undefined,
      size: row.size ?? undefined,
      condition: row.condition ?? undefined,
      playerName: row.player_name ?? undefined,
      playerNumber: row.player_number ?? undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async getShirt(id: string): Promise<Shirt | null> {
    const { data, error } = await supabase.from('shirts').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    if (!data) return null;
    return {
      id: data.id,
      ownerId: data.owner_id,
      title: data.title,
      description: data.description ?? undefined,
      club: data.club ?? undefined,
      league: data.league ?? undefined,
      season: data.season ?? undefined,
      brand: data.brand ?? undefined,
      size: data.size ?? undefined,
      condition: data.condition ?? undefined,
      playerName: data.player_name ?? undefined,
      playerNumber: data.player_number ?? undefined,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async upsertShirt(shirt: Shirt): Promise<void> {
    const { error } = await supabase.from('shirts').upsert({
      id: shirt.id,
      owner_id: shirt.ownerId,
      title: shirt.title,
      description: shirt.description,
      club: shirt.club,
      league: shirt.league,
      season: shirt.season,
      brand: shirt.brand,
      size: shirt.size,
      condition: shirt.condition,
      player_name: shirt.playerName,
      player_number: shirt.playerNumber,
      created_at: shirt.createdAt,
      updated_at: shirt.updatedAt,
    });
    if (error) throw error;
  }

  async deleteShirt(id: string): Promise<void> {
    await supabase.from('shirt_photos').delete().eq('shirt_id', id);
    await supabase.from('collection_items').delete().eq('shirt_id', id);
    const { error } = await supabase.from('shirts').delete().eq('id', id);
    if (error) throw error;
  }

  async listCollections(): Promise<Collection[]> {
    const { data, error } = await supabase.from('collections').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      id: row.id,
      ownerId: row.owner_id,
      name: row.name,
      description: row.description ?? undefined,
      createdAt: row.created_at,
    }));
  }

  async upsertCollection(collection: Collection): Promise<void> {
    const { error } = await supabase.from('collections').upsert({
      id: collection.id,
      owner_id: collection.ownerId,
      name: collection.name,
      description: collection.description,
      created_at: collection.createdAt,
    });
    if (error) throw error;
  }

  async deleteCollection(id: string): Promise<void> {
    await supabase.from('collection_items').delete().eq('collection_id', id);
    const { error } = await supabase.from('collections').delete().eq('id', id);
    if (error) throw error;
  }

  async setShirtPhotos(shirtId: string, photos: Photo[]): Promise<void> {
    await supabase.from('shirt_photos').delete().eq('shirt_id', shirtId);
    if (photos.length === 0) return;
    const { error } = await supabase.from('shirt_photos').upsert(
      photos.map((photo) => ({
        id: photo.id,
        shirt_id: photo.shirtId,
        owner_id: photo.ownerId,
        path: photo.uriOrPath,
        sort_order: photo.sortOrder,
        created_at: new Date().toISOString(),
      })),
    );
    if (error) throw error;
  }

  async listShirtPhotos(shirtId: string): Promise<Photo[]> {
    const { data, error } = await supabase
      .from('shirt_photos')
      .select('*')
      .eq('shirt_id', shirtId)
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data ?? []).map((row: any) => ({
      id: row.id,
      shirtId: row.shirt_id,
      ownerId: row.owner_id,
      uriOrPath: row.path,
      sortOrder: row.sort_order,
    }));
  }

  async setCollectionItems(collectionId: string, shirtIds: string[]): Promise<void> {
    await supabase.from('collection_items').delete().eq('collection_id', collectionId);
    if (shirtIds.length === 0) return;
    const { error } = await supabase.from('collection_items').upsert(
      shirtIds.map((shirtId) => ({
        collection_id: collectionId,
        shirt_id: shirtId,
        owner_id: this.ownerId,
        created_at: new Date().toISOString(),
      })),
    );
    if (error) throw error;
  }
}
