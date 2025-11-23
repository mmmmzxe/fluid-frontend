import { Order } from '@/services/adminApi';
import Logo from '@/assets/Logo.png';

export const printInvoice = (order: Order) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const customerName = order.createdBy?.name || `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'Guest';
  const customerEmail = order.createdBy?.email || order.email || '';
  const customerPhone = order.phone || order.createdBy?.phone || '';
  const date = new Date(order.createdAt).toLocaleDateString();
  const orderId = order._id.slice(-8).toUpperCase();

  // Parse shipping info
  const shippingPrice = typeof (order as any).shippingId === 'object' && (order as any).shippingId !== null
    ? ((order as any).shippingId as any).price
    : (Number(order.finalPrice ?? 0) - Number(order.subTotal ?? 0));

  const shippingGov = typeof (order as any).shippingId === 'object' && (order as any).shippingId !== null
    ? ((order as any).shippingId as any).government
    : '';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Invoice #${orderId}</title>
      <style>
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: #333;
          line-height: 1.6;
          padding: 40px;
          max-width: 800px;
          margin: 0 auto;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          border-bottom: 2px solid #eee;
          padding-bottom: 20px;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #333;
        }
        .invoice-details {
          text-align: right;
        }
        .invoice-details h1 {
          margin: 0;
          font-size: 32px;
          color: #333;
        }
        .invoice-details p {
          margin: 5px 0 0;
          color: #666;
        }
        .info-section {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
        }
        .info-block h3 {
          margin: 0 0 10px;
          font-size: 14px;
          text-transform: uppercase;
          color: #666;
        }
        .info-block p {
          margin: 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 40px;
        }
        th {
          text-align: left;
          padding: 15px;
          background: #f9f9f9;
          border-bottom: 1px solid #eee;
          font-weight: 600;
        }
        td {
          padding: 15px;
          border-bottom: 1px solid #eee;
        }
        .text-right {
          text-align: right;
        }
        .totals {
          margin-left: auto;
          width: 300px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #eee;
        }
        .total-row.final {
          border-bottom: none;
          font-size: 18px;
          font-weight: bold;
          border-top: 2px solid #333;
          margin-top: 10px;
          padding-top: 15px;
        }
        .footer {
          margin-top: 60px;
          text-align: center;
          color: #999;
          font-size: 12px;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        @media print {
          body { padding: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="logo">
          <img src="${Logo}" alt="Extrachic Logo" style="max-height: 60px;" />
        </div>
        <div class="invoice-details">
          <h1>INVOICE</h1>
          <p>#${orderId}</p>
          <p>${date}</p>
        </div>
      </div>

      <div class="info-section">
        <div class="info-block">
          <h3>Bill To</h3>
          <p><strong>${customerName}</strong></p>
          <p>${customerEmail}</p>
          <p>${customerPhone}</p>
        </div>
        <div class="info-block">
          <h3>Ship To</h3>
          <p>${order.address || 'No address provided'}</p>
          ${shippingGov ? `<p>${shippingGov}</p>` : ''}
        </div>
        <div class="info-block">
          <h3>Payment Information</h3>
          <p>Method: ${order.paymentWay ? order.paymentWay.charAt(0).toUpperCase() + order.paymentWay.slice(1) : 'N/A'}</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th class="text-right">Quantity</th>
            <th class="text-right">Price</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${order.products?.map((item: any) => {
    const unit = Number(item.unitPrice ?? item.finalPrice ?? 0);
    const qty = Number(item.quantity ?? 1);
    const total = unit * qty;
    return `
              <tr>
                <td>
                  <div>${item.name || item.productId || 'Product'}</div>
                  ${item.color ? `<div style="font-size: 12px; color: #666;">Color: ${item.color}</div>` : ''}
                  ${item.size ? `<div style="font-size: 12px; color: #666;">Size: ${item.size}</div>` : ''}
                </td>
                <td class="text-right">${qty}</td>
                <td class="text-right">L.E${unit.toFixed(2)}</td>
                <td class="text-right">L.E${total.toFixed(2)}</td>
              </tr>
            `;
  }).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal</span>
          <span>L.E${Number(order.subTotal ?? 0).toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>Shipping</span>
          <span>L.E${Number(shippingPrice ?? 0).toFixed(2)}</span>
        </div>
        <div class="total-row final">
          <span>Total</span>
          <span>L.E${Number(order.finalPrice ?? 0).toFixed(2)}</span>
        </div>
      </div>

      <div class="footer">
        <p>Thank you for your business!</p>
        <p>If you have any questions about this invoice, please contact support.</p>
      </div>

      <script>
        window.onload = () => {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
