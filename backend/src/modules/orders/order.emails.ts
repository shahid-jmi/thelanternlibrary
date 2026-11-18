import env from '../../config/env.js';
import { sendMail } from '../../common/services/mail.service.js';
import { getSettings } from '../settings/settings.service.js';
import type { AdminOrderDto } from './order.mapper.js';

const rupees = (amount: number): string => `₹${amount.toLocaleString('en-IN')}`;

const escapeHtml = (value: string): string =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const itemLines = (order: AdminOrderDto): string[] =>
  order.items.map((item) => `${item.quantity} × ${item.title} — ${rupees(item.lineTotal)}`);

// Tells the shop a new order came in, so nobody has to keep refreshing the
// admin panel. Skipped when no notification email is set.
export const sendNewOrderAlert = async (order: AdminOrderDto): Promise<void> => {
  const { notificationEmail } = await getSettings();
  if (!notificationEmail) return;

  const adminUrl = `${env.frontendUrl}/admin/dashboard`;
  const lines = [
    `New order ${order.orderNumber} from ${order.customerName} (${order.customerPhone})`,
    '',
    ...itemLines(order),
    '',
    `Subtotal: ${rupees(order.subtotal)}`,
    `Delivery: ${rupees(order.deliveryCharge)}`,
    `Total: ${rupees(order.total)}`,
    '',
    `${order.city}, ${order.state}`,
    '',
    `Open in admin: ${adminUrl}`,
  ];

  await sendMail({
    to: notificationEmail,
    subject: `New order ${order.orderNumber} — ${rupees(order.total)}`,
    text: lines.join('\n'),
    html: lines.map((line) => (line ? `<p>${escapeHtml(line)}</p>` : '')).join(''),
  });
};

export const sendOrderShippedEmail = async (order: AdminOrderDto): Promise<void> => {
  if (!order.customerEmail) return;
  const { store } = await getSettings();
  const { courier, trackingNumber, trackingUrl } = order.shipment;

  const lines = [
    `Hi ${order.customerName},`,
    '',
    `Your order ${order.orderNumber} from ${store.name} is on its way.`,
    '',
    ...itemLines(order),
    '',
    courier ? `Courier: ${courier}` : '',
    trackingNumber ? `Tracking number: ${trackingNumber}` : '',
    trackingUrl ? `Track your parcel: ${trackingUrl}` : '',
    '',
    'Thank you for shopping with us.',
  ].filter((line, index, all) => line || all[index - 1]);

  await sendMail({
    to: order.customerEmail,
    subject: `Your order ${order.orderNumber} has shipped`,
    text: lines.join('\n'),
    html: lines
      .map((line) => {
        if (!line) return '';
        if (trackingUrl && line.endsWith(trackingUrl)) {
          return `<p>Track your parcel: <a href="${escapeHtml(trackingUrl)}">${escapeHtml(trackingUrl)}</a></p>`;
        }
        return `<p>${escapeHtml(line)}</p>`;
      })
      .join(''),
  });
};
