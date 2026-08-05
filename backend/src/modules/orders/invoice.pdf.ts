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

    const rowY = tableTop + 25;
    doc.text(order.bookTitle, 50, rowY, { width: 200 });
    doc.text(order.bookAuthor, 260, rowY, { width: 180 });
    doc.text(`Rs ${order.price.toFixed(2)}`, 450, rowY, { width: 100, align: 'right' });

    doc
      .moveTo(50, rowY + 30)
      .lineTo(550, rowY + 30)
      .stroke();
    doc.fontSize(12).text('Total', 260, rowY + 40);
    doc.text(`Rs ${order.price.toFixed(2)}`, 450, rowY + 40, { width: 100, align: 'right' });

    doc.moveDown(4);
    doc
      .fontSize(10)
      .fillColor('#666')
      .text('Thank you for your order.', 50, doc.y, { align: 'center', width: 500 });

    doc.end();
  });
