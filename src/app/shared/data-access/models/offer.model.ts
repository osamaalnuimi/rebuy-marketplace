export interface Offer {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  votes: number;
  category: string;
  seller: string;
  condition: OfferCondition;
  createdAt: Date;
}

export type OfferCondition = 'new' | 'like-new' | 'good' | 'fair';

export interface UserVote {
  offerId: string;
  voteType: VoteType;
}

export type VoteType = 1 | -1;
