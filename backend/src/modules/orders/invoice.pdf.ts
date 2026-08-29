import PDFDocument from 'pdfkit';
import type { AdminOrderDto } from './order.mapper.js';

export const buildInvoicePdf = (order: AdminOrderDto): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).fillColor('#2e1a08').text('The Lantern Library');
    doc.fontSize(10).fillColor('#666').text('Srinagar, Kashmir');
    doc.moveDown(1.5);

    doc.fillColor('#000').fontSize(16).text('INVOICE', { align: 'right' });
    doc.fontSize(10).text(`Invoice #: ${order.invoiceNumber ?? '-'}`, { align: 'right' });
    doc.text(`Date: ${(order.invoiceGeneratedAt ?? new Date()).toDateString()}`, { align: 'right' });
    doc.moveDown(1.5);

    doc.fontSize(12).text('Bill To:');
    doc.fontSize(10).text(order.customerName);
    doc.text(order.customerAltPhone ? `${order.customerPhone} / ${order.customerAltPhone}` : order.customerPhone);
    doc.text(order.addressLine);
    doc.text(`${order.locality}, ${order.city}`);
    doc.text(`${order.state} - ${order.pincode}`);
    doc.moveDown(1.5);

    const tableTop = doc.y;
    doc.fontSize(10).text('Item', 50, tableTop);
    doc.text('Author', 260, tableTop);
    doc.text('Price', 450, tableTop, { width: 100, align: 'right' });
    doc
      .moveTo(50, tableTop + 15)
      .lineTo(550, tableTop + 15)
      .stroke();

    const bookRowY = tableTop + 25;
    doc.text(order.bookTitle, 50, bookRowY, { width: 200 });
    doc.text(order.bookAuthor, 260, bookRowY, { width: 180 });
    doc.text(`Rs ${order.price.toFixed(2)}`, 450, bookRowY, { width: 100, align: 'right' });

    const deliveryRowY = bookRowY + 20;
    doc.text('Delivery Charge', 50, deliveryRowY, { width: 200 });
    doc.text(`Rs ${order.deliveryCharge.toFixed(2)}`, 450, deliveryRowY, {
      width: 100,
      align: 'right',
    });

    const total = order.price + order.deliveryCharge;
    const totalDividerY = deliveryRowY + 25;
    doc.moveTo(50, totalDividerY).lineTo(550, totalDividerY).stroke();
    doc.fontSize(12).text('Total', 260, totalDividerY + 10);
    doc.text(`Rs ${total.toFixed(2)}`, 450, totalDividerY + 10, { width: 100, align: 'right' });

    doc.moveDown(4);
    doc
      .fontSize(10)
      .fillColor('#666')
      .text('Thank you for your order.', 50, doc.y, { align: 'center', width: 500 });

    doc.end();
  });
