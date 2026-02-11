export type Shirt = {
  id: string;
  ownerId: string;
  title: string;
  description?: string;
  club?: string;
  league?: string;
  season?: string;
  brand?: string;
  size?: string;
  condition?: string;
  playerName?: string;
  playerNumber?: number;
  createdAt: string;
  updatedAt: string;
};

export type Photo = {
  id: string;
  shirtId: string;
  ownerId: string;
  uriOrPath: string;
  sortOrder: number;
};

export type Collection = {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  createdAt: string;
};

export type CollectionItem = {
  collectionId: string;
  shirtId: string;
  ownerId: string;
  createdAt: string;
};
