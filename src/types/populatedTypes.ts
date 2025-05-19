interface PopulatedUser {
  _id: string;
  email: string;
}

interface PopulatedProduct {
  _id: string;
  name: string;
  imageUrl: string;
}

export type { PopulatedUser, PopulatedProduct };
