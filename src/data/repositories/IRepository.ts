import { Collection, Photo, Shirt } from '../types';

export interface IRepository {
  listShirts(): Promise<Shirt[]>;
  getShirt(id: string): Promise<Shirt | null>;
  upsertShirt(shirt: Shirt): Promise<void>;
  deleteShirt(id: string): Promise<void>;

  listCollections(): Promise<Collection[]>;
  upsertCollection(collection: Collection): Promise<void>;
  deleteCollection(id: string): Promise<void>;

  setShirtPhotos(shirtId: string, photos: Photo[]): Promise<void>;
  listShirtPhotos(shirtId: string): Promise<Photo[]>;

  setCollectionItems(collectionId: string, shirtIds: string[]): Promise<void>;
}
