import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { nextSequence } from '../common/models/counter.js';
import { normalizeOrder } from '../modules/orders/order.mapper.js';
import type { OrderLean } from '../modules/orders/order.model.js';

// Converts single-book orders (book/bookTitle/price, status pending/paid/
// cancelled) into the multi-item shape. Old WhatsApp orders become:
//   pending   → placed, unpaid
//   paid      → delivered, paid (they were completed outside the system)
//   cancelled → cancelled
// Each gets a real order number (oldest first) and is marked isLegacy, so
// the admin panel can show it as history. Stock is not touched.
// Safe to run more than once — only orders without `items` are converted.
const migrateOrdersToItems = async (): Promise<void> => {
  await connectDatabase();

  try {
    const collection = mongoose.connection.db!.collection('orders');
    const legacy = await collection
      .find({ items: { $exists: false } })
      .sort({ createdAt: 1 })
      .toArray();

    for (const raw of legacy) {
      const order = normalizeOrder(raw as unknown as OrderLean);
      const orderNumber = `LL-${1000 + (await nextSequence('order'))}`;
      const at = (raw.createdAt as Date | undefined) ?? new Date();

      await collection.updateOne(
        { _id: raw._id },
        {
          $set: {
            orderNumber,
            channel: 'whatsapp',
            items: order.items,
            subtotal: order.subtotal,
            deliveryCharge: order.deliveryCharge,
            total: order.total,
            deliveryRegion: 'domestic',
            deliveryEstimate: '',
            customer: null,
            status: order.status,
            statusHistory: [
              { status: order.status, at, byEmail: null, note: 'Migrated from a WhatsApp order' },
            ],
            paymentStatus: order.paymentStatus,
            paymentMethod: order.paymentStatus === 'paid' ? 'other' : null,
            paidAt:
              order.paymentStatus === 'paid' ? ((raw.updatedAt as Date | undefined) ?? at) : null,
            stockPending: false,
            shipment: {
              courier: null,
              trackingNumber: null,
              trackingUrl: null,
              shippedAt: null,
              deliveredAt: null,
            },
            internalNotes: [],
            needsAttention: false,
            attentionReason: null,
            receipt: order.receipt,
            isLegacy: true,
          },
          $unset: {
            book: '',
            bookTitle: '',
            bookAuthor: '',
            price: '',
            invoiceNumber: '',
            invoiceGeneratedAt: '',
          },
        }
      );
    }

    console.log(`Converted ${legacy.length} order(s) to the multi-item format.`);
  } finally {
    await disconnectDatabase();
  }
};

migrateOrdersToItems().catch((error: unknown) => {
  console.error(`Migration failed: ${error instanceof Error ? error.message : error}`);
  process.exit(1);
});
