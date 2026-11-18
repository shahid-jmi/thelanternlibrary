import PDFDocument from 'pdfkit';
import type { StoreDetails } from '../settings/settings.model.js';
import type { AdminOrderDto } from './order.mapper.js';

// INR is shown as whole rupees, not with cents-style decimals — "Rs" stays
// plain text (not the ₹ glyph) since PDF fonts often lack that character.
const formatRupees = (amount: number): string => `Rs ${Math.round(amount).toLocaleString('en-IN')}`;

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  upi: 'UPI',
  bank_transfer: 'Bank transfer',
  cash: 'Cash',
  card: 'Card',
  other: 'Other',
};

const formatDate = (date: Date): string =>
  date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });

const PAGE_BOTTOM = 760;

// A simple order receipt. The shop isn't GST-registered, so this is
// deliberately not labelled a tax invoice and shows no tax lines.
export const buildReceiptPdf = (order: AdminOrderDto, store: StoreDetails): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Store
    doc.fontSize(20).fillColor('#2e1a08').text(store.name);
    doc.fontSize(10).fillColor('#666');
    if (store.address) doc.text(store.address);
    const contact = [store.phone, store.email].filter(Boolean).join('  ·  ');
    if (contact) doc.text(contact);
    doc.moveDown(1.5);

    // Receipt details
    doc.fillColor('#000').fontSize(16).text('RECEIPT', { align: 'right' });
    doc.fontSize(10);
    doc.text(`Receipt #: ${order.receiptNumber ?? '-'}`, { align: 'right' });
    doc.text(`Order #: ${order.orderNumber}`, { align: 'right' });
    doc.text(`Order date: ${formatDate(order.createdAt)}`, { align: 'right' });
    if (order.paidAt) doc.text(`Paid on: ${formatDate(order.paidAt)}`, { align: 'right' });
    if (order.paymentMethod) {
      doc.text(`Payment: ${PAYMENT_METHOD_LABELS[order.paymentMethod] ?? order.paymentMethod}`, {
        align: 'right',
      });
    }
    doc.moveDown(1.5);

    // Customer
    doc.fontSize(12).text('Deliver to:');
    doc.fontSize(10).text(order.customerName);
    doc.text(
      order.customerAltPhone
        ? `${order.customerPhone} / ${order.customerAltPhone}`
        : order.customerPhone
    );
    doc.text(order.addressLine);
    doc.text(`${order.locality}, ${order.city}`);
    doc.text(`${order.state} - ${order.pincode}`);
    doc.moveDown(1.5);

    // Items
    const header = (y: number) => {
      doc.fontSize(10).fillColor('#000');
      doc.text('Item', 50, y, { width: 260 });
      doc.text('Qty', 320, y, { width: 40, align: 'right' });
      doc.text('Price', 370, y, { width: 80, align: 'right' });
      doc.text('Amount', 460, y, { width: 90, align: 'right' });
      doc
        .moveTo(50, y + 15)
        .lineTo(550, y + 15)
        .stroke();
      return y + 25;
    };

    let y = header(doc.y);
    for (const item of order.items) {
      const label = item.subtitle ? `${item.title} — ${item.subtitle}` : item.title;
      const rowHeight = Math.max(doc.heightOfString(label, { width: 260 }), 12) + 8;
      if (y + rowHeight > PAGE_BOTTOM) {
        doc.addPage();
        y = header(50);
      }
      doc.text(label, 50, y, { width: 260 });
      doc.text(String(item.quantity), 320, y, { width: 40, align: 'right' });
      doc.text(formatRupees(item.unitPrice), 370, y, { width: 80, align: 'right' });
      doc.text(formatRupees(item.lineTotal), 460, y, { width: 90, align: 'right' });
      y += rowHeight;
    }

    if (y + 90 > PAGE_BOTTOM) {
      doc.addPage();
      y = 50;
    }

    // Totals
    doc.moveTo(50, y).lineTo(550, y).stroke();
    y += 10;
    const totalRow = (label: string, amount: string, size = 10) => {
      doc.fontSize(size).text(label, 320, y, { width: 130, align: 'right' });
      doc.text(amount, 460, y, { width: 90, align: 'right' });
      y += size + 8;
    };
    totalRow('Subtotal', formatRupees(order.subtotal));
    totalRow('Delivery', order.deliveryCharge === 0 ? 'Free' : formatRupees(order.deliveryCharge));
    totalRow('Total', formatRupees(order.total), 12);

    doc
      .fontSize(10)
      .fillColor('#666')
      .text('Thank you for your order.', 50, y + 30, { align: 'center', width: 500 });

    doc.end();
  });
