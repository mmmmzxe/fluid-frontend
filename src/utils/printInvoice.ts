import { Order } from '@/services/adminApi';
import Logo from '@/assets/Logo.png';

export const printInvoice = (order: Order) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const customerName = order.createdBy?.name || `${order.firstName || ''} ${order.lastName || ''}`.trim() || 'Guest';
  const customerEmail = order.createdBy?.email || order.email || '';
  const customerPhone = order.phone || order.createdBy?.phone || '';
  const date = new Date(order.createdAt).toLocaleDateString();
  const time = new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
    <html dir="ltr">
    <head>
      <title>Receipt #${orderId}</title>
      <style>
        @page {
          margin: 0;
          size: 80mm auto;
        }
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }
        body {
          width: 80mm;
          margin: 0 auto;
          padding: 10px;
          font-family: 'Arial', sans-serif;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          background-color: #fff;
        }
        .header {
          text-align: center;
          margin-bottom: 10px;
        }
        .logo {
          max-height: 60px;
          margin-bottom: 5px;
          filter: grayscale(100%);
        }
        .shop-name {
          font-size: 20px;
          font-weight: bold;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .divider {
          border-top: 1px dashed #000;
          margin: 8px 0;
        }
        .info-section {
          margin-bottom: 10px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
          font-size: 11px;
        }
        .info-label {
          font-weight: bold;
        }
        .customer-section {
          margin: 8px 0;
        }
        .customer-name {
          font-weight: bold;
          text-transform: uppercase;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 8px 0;
        }
        th {
          text-align: left;
          border-bottom: 1px dashed #000;
          border-top: 1px dashed #000;
          padding: 5px 0;
          font-size: 11px;
          font-weight: bold;
        }
        td {
          padding: 5px 0;
          vertical-align: top;
          font-size: 11px;
        }
        .item-name {
          font-weight: bold;
          display: block;
        }
        .item-meta {
          font-size: 10px;
          margin-top: 1px;
        }
        .text-right {
          text-align: right;
        }
        .text-center {
          text-align: center;
        }
        .totals {
          margin-top: 5px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 2px 0;
          font-size: 11px;
        }
        .total-row.grand-total {
          font-size: 15px;
          font-weight: bold;
          border-top: 1px solid #000;
          margin-top: 5px;
          padding-top: 8px;
        }
        .payment-method {
          margin-top: 8px;
          font-weight: bold;
          text-align: center;
          border: 1px solid #000;
          padding: 4px;
        }
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 10px;
        }
        .qr-placeholder {
          margin-top: 15px;
          border: 1px solid #eee;
          width: 60px;
          height: 60px;
          margin-inline : auto;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 8px;
        }
        @media print {
          body {
            width: 80mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="${Logo}" alt="Logo" class="logo" />
        <div class="shop-name">Extrachic</div>
        <div class="info-row text-center" style="display: block;">
          ORDER RECEIPT
        </div>
      </div>

      <div class="divider"></div>

      <div class="info-section">
        <div class="info-row">
          <span class="info-label">Order ID:</span>
          <span>#${orderId}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Date:</span>
          <span>${date} ${time}</span>
        </div>
      </div>

      <div class="divider"></div>

      <div class="customer-section">
        <div class="customer-name">${customerName}</div>
        <div>${customerPhone}</div>
        <div>${order.address || ''}</div>
        ${shippingGov ? `<div>${shippingGov}</div>` : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th class="text-right" style="width: 40px;">Qty</th>
            <th class="text-right" style="width: 70px;">Total</th>
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
                  <span class="item-name">${item.name || item.productId || 'Product'}</span>
                  ${item.color || item.size ? `
                    <div class="item-meta">
                      ${item.color ? `<span>Color: ${item.color}</span>` : ''}
                      ${item.size ? `<span>Size: ${item.size}</span>` : ''}
                    </div>
                  ` : ''}
                  <div class="item-meta">@ L.E${unit.toFixed(2)}</div>
                </td>
                <td class="text-right">${qty}</td>
                <td class="text-right">L.E${total.toFixed(2)}</td>
              </tr>
            `;
  }).join('')}
        </tbody>
      </table>

      <div class="divider"></div>

      <div class="totals">
        <div class="total-row">
          <span>Subtotal</span>
          <span>L.E${Number(order.subTotal ?? 0).toFixed(2)}</span>
        </div>
        <div class="total-row">
          <span>Shipping</span>
          <span>L.E${Number(shippingPrice ?? 0).toFixed(2)}</span>
        </div>
        <div class="total-row grand-total">
          <span>TOTAL</span>
          <span>L.E${Number(order.finalPrice ?? 0).toFixed(2)}</span>
        </div>
      </div>

      ${order.paymentWay ? `
        <div class="payment-method">
          METHOD: ${order.paymentWay.toUpperCase()}
        </div>
      ` : ''}

      <div class="footer">
        <p>THANK YOU FOR SHOPPING WITH US!</p>
        <p>Please keep this receipt for your records.</p>
        <div class="qr-placeholder">
          SCAN ME
        </div>
      </div>

      <script>
        window.onload = () => {
          window.print();
          setTimeout(() => {
            window.close();
          }, 500);
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

