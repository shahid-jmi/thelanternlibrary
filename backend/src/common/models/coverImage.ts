import { Schema } from 'mongoose';

export interface CoverImage {
  url: string;
  key: string | null;
}

export const coverImageSchema = new Schema<CoverImage>(
  {
    url: { type: String, required: true },
    key: { type: String, default: null },
  },
  { _id: false }
);
