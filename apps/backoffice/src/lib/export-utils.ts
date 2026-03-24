/**
 * Export utilities for CSV and PDF generation
 */

// CSV Export
export const exportToCSV = (data: Record<string, any>[], filename: string) => {
  if (data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value ?? '';
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${filename}.csv`);
};

// Helper to download a blob
export const downloadBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Format date for export
export const formatDateForExport = (date: string | Date): string => {
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

// Format currency for export
export const formatCurrencyForExport = (amount: number): string => {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Generate invoice HTML for printing/PDF
export const generateInvoiceHTML = (order: {
  code: string;
  orderPlacedAt: string;
  customer?: {
    firstName: string;
    lastName: string;
    emailAddress: string;
    phoneNumber?: string;
  };
  shippingAddress?: {
    fullName: string;
    streetLine1: string;
    streetLine2?: string;
    city: string;
    province?: string;
    postalCode?: string;
    country?: { name: string };
  };
  lines: Array<{
    productVariant: { name: string; sku: string };
    quantity: number;
    unitPriceWithTax: number;
    linePriceWithTax: number;
  }>;
  subTotalWithTax: number;
  shippingWithTax: number;
  totalWithTax: number;
  customFields?: {
    wilaya?: string;
    city?: string;
  };
}) => {
  const formatPrice = (cents: number) => formatCurrencyForExport(cents / 100);
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Facture #${order.code}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; padding: 40px; }
    .invoice { max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .logo { font-size: 28px; font-weight: bold; color: #2563eb; }
    .invoice-info { text-align: right; }
    .invoice-info h2 { font-size: 24px; color: #333; margin-bottom: 8px; }
    .invoice-info p { color: #666; }
    .addresses { display: flex; justify-content: space-between; margin-bottom: 40px; }
    .address-block { width: 45%; }
    .address-block h3 { font-size: 14px; color: #666; margin-bottom: 8px; text-transform: uppercase; }
    .address-block p { margin: 4px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
    th { background-color: #f3f4f6; padding: 12px; text-align: left; font-weight: 600; border-bottom: 2px solid #e5e7eb; }
    td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .text-right { text-align: right; }
    .totals { margin-left: auto; width: 300px; }
    .totals table { margin-bottom: 0; }
    .totals td { border: none; padding: 8px 0; }
    .totals .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #333; padding-top: 12px; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 14px; }
    @media print {
      body { padding: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="logo">OSCAR</div>
      <div class="invoice-info">
        <h2>FACTURE</h2>
        <p><strong>N:</strong> ${order.code}</p>
        <p><strong>Date:</strong> ${formatDate(order.orderPlacedAt)}</p>
      </div>
    </div>

    <div class="addresses">
      <div class="address-block">
        <h3>Vendeur</h3>
        <p><strong>OSCAR E-Commerce</strong></p>
        <p>Algérie</p>
        <p>contact@oscar.dz</p>
      </div>
      <div class="address-block">
        <h3>Client</h3>
        ${
          order.customer
            ? `
        <p><strong>${order.customer.firstName} ${order.customer.lastName}</strong></p>
        <p>${order.customer.emailAddress}</p>
        ${order.customer.phoneNumber ? `<p>${order.customer.phoneNumber}</p>` : ''}
        `
            : '<p>Client anonyme</p>'
        }
        ${
          order.shippingAddress
            ? `
        <p>${order.shippingAddress.streetLine1}</p>
        ${order.shippingAddress.streetLine2 ? `<p>${order.shippingAddress.streetLine2}</p>` : ''}
        <p>${order.shippingAddress.city}${order.shippingAddress.postalCode ? `, ${order.shippingAddress.postalCode}` : ''}</p>
        ${order.shippingAddress.province ? `<p>${order.shippingAddress.province}</p>` : ''}
        `
            : order.customFields?.wilaya
              ? `<p>${order.customFields.city || ''}, ${order.customFields.wilaya}</p>`
              : ''
        }
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Produit</th>
          <th>SKU</th>
          <th class="text-right">Quantité</th>
          <th class="text-right">Prix unitaire</th>
          <th class="text-right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${order.lines
          .map(
            (line) => `
        <tr>
          <td>${line.productVariant.name}</td>
          <td>${line.productVariant.sku}</td>
          <td class="text-right">${line.quantity}</td>
          <td class="text-right">${formatPrice(line.unitPriceWithTax)}</td>
          <td class="text-right">${formatPrice(line.linePriceWithTax)}</td>
        </tr>
        `
          )
          .join('')}
      </tbody>
    </table>

    <div class="totals">
      <table>
        <tr>
          <td>Sous-total</td>
          <td class="text-right">${formatPrice(order.subTotalWithTax)}</td>
        </tr>
        <tr>
          <td>Livraison</td>
          <td class="text-right">${formatPrice(order.shippingWithTax)}</td>
        </tr>
        <tr class="total-row">
          <td>Total TTC</td>
          <td class="text-right">${formatPrice(order.totalWithTax)}</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>Merci pour votre commande !</p>
      <p>OSCAR E-Commerce - Algérie</p>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>
  `;
};

// Print invoice
export const printInvoice = (order: Parameters<typeof generateInvoiceHTML>[0]) => {
  const html = generateInvoiceHTML(order);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
  }
};
