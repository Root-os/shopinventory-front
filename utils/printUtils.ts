import type { Order, Item } from "@/types"

export interface PrintableOrder extends Order {
  itemDetails: Array<{
    id: number
    name: string
    quantity: number
    price: number
    unit: string
    total: number
  }>
  userName: string
  printDate: string
}

export function generateReceiptHTML(order: PrintableOrder): string {
  const balance = order.paid - order.totalPrice

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Order Receipt #${order.id}</title>
      <style>
        @page {
          size: A4;
          margin: 20mm;
        }
        
        body {
          font-family: 'Courier New', monospace;
          font-size: 12px;
          line-height: 1.4;
          color: #000;
          margin: 0;
          padding: 0;
        }
        
        .receipt-container {
          max-width: 100%;
          margin: 0 auto;
          padding: 20px;
          border: 2px solid #000;
        }
        
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        
        .company-name {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 5px;
        }
        
        .receipt-title {
          font-size: 18px;
          font-weight: bold;
          margin-top: 10px;
        }
        
        .order-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          border-bottom: 1px solid #000;
          padding-bottom: 10px;
        }
        
        .customer-info, .order-details {
          flex: 1;
        }
        
        .customer-info {
          margin-right: 20px;
        }
        
        .info-row {
          margin-bottom: 5px;
        }
        
        .label {
          font-weight: bold;
          display: inline-block;
          width: 120px;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        
        .items-table th,
        .items-table td {
          border: 1px solid #000;
          padding: 8px;
          text-align: left;
        }
        
        .items-table th {
          background-color: #f0f0f0;
          font-weight: bold;
        }
        
        .items-table .number-col {
          text-align: right;
          width: 80px;
        }
        
        .items-table .item-col {
          width: 200px;
        }
        
        .totals-section {
          float: right;
          width: 300px;
          border: 1px solid #000;
          padding: 10px;
          margin-bottom: 20px;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 5px;
          padding: 2px 0;
        }
        
        .total-row.final {
          border-top: 2px solid #000;
          padding-top: 8px;
          margin-top: 8px;
          font-weight: bold;
          font-size: 14px;
        }
        
        .balance-positive {
          color: #008000;
        }
        
        .balance-negative {
          color: #ff0000;
        }
        
        .signature-section {
          clear: both;
          margin-top: 40px;
          border-top: 1px solid #000;
          padding-top: 20px;
        }
        
        .signature-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 60px;
        }
        
        .signature-box {
          width: 200px;
          text-align: center;
        }
        
        .signature-line {
          border-bottom: 1px solid #000;
          height: 40px;
          margin-bottom: 5px;
        }
        
        .footer {
          text-align: center;
          margin-top: 30px;
          font-size: 10px;
          color: #666;
        }
        
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          
          .no-print {
            display: none;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <!-- Header -->
        <div class="header">
          <div class="company-name">SALES MANAGEMENT SYSTEM</div>
          <div>Sales Receipt</div>
          
        </div>
        
        <!-- Order Information -->
        <div class="order-info">
          <div class="customer-info">
            <div class="info-row">
              <span class="label">Customer:</span>
              <span>${order.customerName || order.Customer?.name || "Walk-in Customer"}</span>
            </div>
            <div class="info-row">
              <span class="label">Phone:</span>
              <span>${order.customerPhone || order.Customer?.phone || "N/A"}</span>
            </div>
            <div class="info-row">
              <span class="label">Payment Type:</span>
              <span>${order.paymentType}</span>
            </div>
          </div>
          
          <div class="order-details">
          <div class="info-row">
            <span class="label">Order Date:</span>
            <span>${new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
          <div class="info-row">
            <span class="label">Served by:</span>
            <span>${order.userName}</span>
          </div>
            <div class="info-row">
              <span class="label">Car Plate:</span>
              <span>${order.carPlate}</span>
            </div>
          </div>
        </div>
        <!-- Items Table -->
        <table class="items-table">
          <thead>
            <tr>
              <th class="item-col">Item</th>
              <th class="number-col">Qty</th>
              <th class="number-col">Unit</th>
              <th class="number-col">Price</th>
              <th class="number-col">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.itemDetails
              .map(
                (item) => `
              <tr>
                <td class="item-col">${item.name}</td>
                <td class="number-col">${item.quantity}</td>
                <td class="number-col">${item.unit}</td>
                <td class="number-col">${item.price.toFixed(2)} ETB</td>
                <td class="number-col">${item.total.toFixed(2)} ETB</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
        
        <!-- Totals -->
        <div class="totals-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${order.totalPrice.toFixed(2)} ETB</span>
          </div>
          <div class="total-row">
            <span>Amount Paid:</span>
            <span>${order.paid.toFixed(2)} ETB</span>
          </div>
          <div class="total-row final">
            <span>Balance:</span>
            <span class="${balance >= 0 ? "balance-positive" : "balance-negative"}">
              ${balance.toFixed(2)} ETB
            </span>
          </div>
          ${
            balance < 0
              ? `
            <div style="margin-top: 10px; font-size: 11px; color: #ff0000;">
              Customer owes: ${Math.abs(balance).toFixed(2)} ETB
            </div>
          `
              : ""
          }
        </div>
        
        <!-- Signature Section -->
        <div class="signature-section">
          <div class="signature-row">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div>customer<br/><span>${order.customerName || order.Customer?.name || "Walk-in Customer"}</span></div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div><span>${order.userName}</span></div>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Generated by Sales Management System - ${order.printDate}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function printReceipt(order: PrintableOrder): void {
  const printWindow = window.open("", "_blank", "width=800,height=600")

  if (!printWindow) {
    alert("Please allow popups to print receipts")
    return
  }

  const receiptHTML = generateReceiptHTML(order)

  printWindow.document.write(receiptHTML)
  printWindow.document.close()

  // Wait for content to load then print
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }
}

export function preparePrintableOrder(order: Order, items: Item[], userName: string): PrintableOrder {
  const itemDetails = order.items.map((orderItem) => {
    const item = items.find((i) => i.id === orderItem.itemId)
    return {
      id: orderItem.itemId,
      name: item?.name || `Item #${orderItem.itemId}`,
      quantity: orderItem.quantity,
      price: orderItem.price,
      unit: orderItem.unit,
      total: orderItem.quantity * orderItem.price,
    }
  })

  return {
    ...order,
    customerName: order.customerName || order.Customer?.name || null,
    customerPhone: order.customerPhone || order.Customer?.phone || null,
    itemDetails,
    userName,
    printDate: new Date().toLocaleString(),
  }
}

export function openReceiptPreview(order: PrintableOrder): void {
  const previewWindow = window.open("", "_blank", "width=800,height=600")

  if (!previewWindow) {
    alert("Please allow popups to preview receipt")
    return
  }

  const receiptHTML = generateReceiptHTML(order)

  // Insert a print button at the top inside the body tag
  const fullHtmlWithPrintButton = receiptHTML.replace(
    "<body>",
    `<body>
      <button onclick="window.print()" style="margin: 20px; font-size: 16px; cursor: pointer;"> Print Receipt</button>`
  )

  previewWindow.document.write(fullHtmlWithPrintButton)
  previewWindow.document.close()
}

