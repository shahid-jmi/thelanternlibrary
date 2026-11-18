import mongoose, { Schema } from 'mongoose';

interface CounterAttrs {
  _id: string;
  seq: number;
}

const counterSchema = new Schema<CounterAttrs>(
  {
    _id: { type: String, required: true },
    seq: { type: Number, required: true, default: 0 },
  },
  { versionKey: false }
);

const Counter = mongoose.model('Counter', counterSchema);

// Atomically reserves the next number in a named sequence. Unlike
// "count existing documents + 1", two simultaneous callers can never get the
// same value.
export const nextSequence = async (name: string): Promise<number> => {
  const counter = await Counter.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )
    .lean<CounterAttrs>()
    .exec();
  return counter!.seq;
};

export default Counter;
