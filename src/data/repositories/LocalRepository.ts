import { db } from '../localDb';
import { Collection, Photo, Shirt } from '../types';
import { IRepository } from './IRepository';

const rowToShirt = (row: any): Shirt => ({
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
});

export class LocalRepository implements IRepository {
  constructor(private readonly ownerId: string) {}

  async listShirts(): Promise<Shirt[]> {
    const rows = db.getAllSync('SELECT * FROM shirts WHERE owner_id = ? ORDER BY updated_at DESC', [this.ownerId]);
    return rows.map(rowToShirt);
  }

  async getShirt(id: string): Promise<Shirt | null> {
    const row = db.getFirstSync('SELECT * FROM shirts WHERE id = ? AND owner_id = ?', [id, this.ownerId]);
    return row ? rowToShirt(row) : null;
  }

  async upsertShirt(shirt: Shirt): Promise<void> {
    db.runSync(
      `INSERT OR REPLACE INTO shirts
      (id, owner_id, title, description, club, league, season, brand, size, condition, player_name, player_number, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        shirt.id,
        shirt.ownerId,
        shirt.title,
        shirt.description ?? null,
        shirt.club ?? null,
        shirt.league ?? null,
        shirt.season ?? null,
        shirt.brand ?? null,
        shirt.size ?? null,
        shirt.condition ?? null,
        shirt.playerName ?? null,
        shirt.playerNumber ?? null,
        shirt.createdAt,
        shirt.updatedAt,
      ],
    );
  }

  async deleteShirt(id: string): Promise<void> {
    db.runSync('DELETE FROM shirt_photos WHERE shirt_id = ? AND owner_id = ?', [id, this.ownerId]);
    db.runSync('DELETE FROM collection_items WHERE shirt_id = ? AND owner_id = ?', [id, this.ownerId]);
    db.runSync('DELETE FROM shirts WHERE id = ? AND owner_id = ?', [id, this.ownerId]);
  }

  async listCollections(): Promise<Collection[]> {
    const rows = db.getAllSync('SELECT * FROM collections WHERE owner_id = ? ORDER BY created_at DESC', [this.ownerId]);
    return rows.map((row: any) => ({
      id: row.id,
      ownerId: row.owner_id,
      name: row.name,
      description: row.description ?? undefined,
      createdAt: row.created_at,
    }));
  }

  async upsertCollection(collection: Collection): Promise<void> {
    db.runSync(
      `INSERT OR REPLACE INTO collections (id, owner_id, name, description, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [collection.id, collection.ownerId, collection.name, collection.description ?? null, collection.createdAt],
    );
  }

  async deleteCollection(id: string): Promise<void> {
    db.runSync('DELETE FROM collection_items WHERE collection_id = ? AND owner_id = ?', [id, this.ownerId]);
    db.runSync('DELETE FROM collections WHERE id = ? AND owner_id = ?', [id, this.ownerId]);
  }

  async setShirtPhotos(shirtId: string, photos: Photo[]): Promise<void> {
    db.runSync('DELETE FROM shirt_photos WHERE shirt_id = ? AND owner_id = ?', [shirtId, this.ownerId]);
    photos.forEach((photo) => {
      db.runSync(
        `INSERT INTO shirt_photos (id, shirt_id, owner_id, local_uri, sort_order, created_at)
         VALUES (?, ?, ?, ?, ?, datetime('now'))`,
        [photo.id, photo.shirtId, photo.ownerId, photo.uriOrPath, photo.sortOrder],
      );
    });
  }

  async listShirtPhotos(shirtId: string): Promise<Photo[]> {
    const rows = db.getAllSync('SELECT * FROM shirt_photos WHERE shirt_id = ? AND owner_id = ? ORDER BY sort_order ASC', [
      shirtId,
      this.ownerId,
    ]);
    return rows.map((row: any) => ({
      id: row.id,
      shirtId: row.shirt_id,
      ownerId: row.owner_id,
      uriOrPath: row.local_uri,
      sortOrder: row.sort_order,
    }));
  }

  async setCollectionItems(collectionId: string, shirtIds: string[]): Promise<void> {
    db.runSync('DELETE FROM collection_items WHERE collection_id = ? AND owner_id = ?', [collectionId, this.ownerId]);
    shirtIds.forEach((shirtId) => {
      db.runSync(
        `INSERT OR REPLACE INTO collection_items (collection_id, shirt_id, owner_id, created_at)
         VALUES (?, ?, ?, datetime('now'))`,
        [collectionId, shirtId, this.ownerId],
      );
    });
  }
}
