import { Schema } from 'mongoose';

export interface LocalizedText {
  en: string;
  ur?: string;
}

export const localizedTextSchema = new Schema<LocalizedText>(
  {
    en: { type: String, required: true, trim: true },
    ur: { type: String, trim: true },
  },
  { _id: false }
);
