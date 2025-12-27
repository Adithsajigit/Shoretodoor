import PDFDocument from 'pdfkit';
import path from 'path';
import fs from 'fs';

interface InvoiceData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  orderDate: Date;
  items: Array<{
    productName: string;
    malayalamName: string;
    quantity: number;
    price: number;
    lineTotal: number;
  }>;
  totalWeight: number;
  subtotal: number;
  tier: string;
}

// Function to save invoice PDF to disk
export async function saveInvoicePDF(data: InvoiceData): Promise<string> {
  const pdfBuffer = await generateInvoicePDF(data);
  
  // In serverless environments (like Vercel), use /tmp directory
  // In local development, use public/invoices
  const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL;
  
  let invoicesDir: string;
  let publicUrl: string;
  
  if (isProduction) {
    // Use /tmp in serverless environment
    invoicesDir = path.join('/tmp', 'invoices');
    console.log('[PDF] Using /tmp directory for invoice storage (serverless)');
  } else {
    // Use public/invoices in local development
    invoicesDir = path.join(process.cwd(), 'public', 'invoices');
    console.log('[PDF] Using public/invoices directory (local development)');
  }
  
  if (!fs.existsSync(invoicesDir)) {
    console.log('[PDF] Creating invoices directory:', invoicesDir);
    fs.mkdirSync(invoicesDir, { recursive: true });
  }
  
  // Generate filename
  const filename = `Invoice_${data.orderId.slice(0, 8).toUpperCase()}_${Date.now()}.pdf`;
  const filePath = path.join(invoicesDir, filename);
  
  console.log('[PDF] Saving invoice to:', filePath);
  
  // Save to disk
  fs.writeFileSync(filePath, pdfBuffer);
  
  console.log('[PDF] Invoice saved successfully');
  
  // Return the file path (for email attachment in serverless, or public URL in local)
  if (isProduction) {
    // In production, return the actual file path for email attachment
    // The invoice will be attached to email, not served as public URL
    return filePath;
  } else {
    // In local development, return the public URL
    return `/invoices/${filename}`;
  }
}

export async function generateInvoicePDF(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4',
        margins: { top: 35, bottom: 35, left: 50, right: 50 },
        bufferPages: true,
        autoFirstPage: true
      });
      
      const chunks: Buffer[] = [];
      
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      let yPos = 35;

      // Add logo if it exists (smaller)
      const logoPath = path.join(process.cwd(), 'logo.PNG');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, yPos, { width: 45, height: 45 });
      }

      // Header - Company Info (Left side) - more compact
      doc.fontSize(14)
         .fillColor('#0ea5e9')
         .font('Helvetica-Bold')
         .text('Shore to Door', 105, yPos + 2);

      doc.fontSize(7)
         .fillColor('#64748b')
         .font('Helvetica')
         .text('Premium Kerala Fresh Fish', 105, yPos + 18);
      
      doc.fontSize(6)
         .text(process.env.SMTP_USER || 'info@shoretodoor.uk', 105, yPos + 28);

      // Invoice Title (Right side) - smaller
      doc.fontSize(22)
         .fillColor('#1e293b')
         .font('Helvetica-Bold')
         .text('INVOICE', 420, yPos + 5, { align: 'right' });

      yPos += 48;

      // Horizontal divider
      doc.moveTo(50, yPos)
         .lineTo(545, yPos)
         .strokeColor('#0ea5e9')
         .lineWidth(1.5)
         .stroke();

      yPos += 12;

      // Invoice Details (Left) and Bill To (Right) - more compact
      const leftCol = 50;
      const rightCol = 320;

      // Left Column - Invoice Details
      doc.fontSize(6)
         .fillColor('#64748b')
         .font('Helvetica-Bold')
         .text('INVOICE #', leftCol, yPos);
      
      doc.fontSize(9)
         .fillColor('#1e293b')
         .font('Helvetica')
         .text(data.orderId.slice(0, 8).toUpperCase(), leftCol, yPos + 9);

      doc.fontSize(6)
         .fillColor('#64748b')
         .font('Helvetica-Bold')
         .text('DATE', leftCol, yPos + 24);
      
      doc.fontSize(8)
         .fillColor('#1e293b')
         .font('Helvetica')
         .text(data.orderDate.toLocaleDateString('en-GB', { 
           day: '2-digit', 
           month: 'short', 
           year: 'numeric' 
         }), leftCol, yPos + 32);

      // Right Column - Bill To
      doc.fontSize(6)
         .fillColor('#64748b')
         .font('Helvetica-Bold')
         .text('BILL TO', rightCol, yPos);

      doc.fontSize(10)
         .fillColor('#1e293b')
         .font('Helvetica-Bold')
         .text(data.customerName, rightCol, yPos + 9);

      doc.fontSize(7)
         .fillColor('#64748b')
         .font('Helvetica')
         .text(data.customerEmail, rightCol, yPos + 22);

      // Status Badge - smaller
      yPos += 45;
      doc.roundedRect(rightCol, yPos, 70, 16, 2)
         .fillAndStroke('#fef3c7', '#f59e0b')
         .lineWidth(0.8);
      
      doc.fontSize(7)
         .fillColor('#92400e')
         .font('Helvetica-Bold')
         .text('PENDING', rightCol, yPos + 4, { width: 70, align: 'center' });

      yPos += 24;

      // Items Table - more compact
      const tableTop = yPos;
      const col1 = 50;   // Item Description
      const col2 = 330;  // Qty
      const col3 = 405;  // Rate
      const col4 = 485;  // Amount
      
      doc.rect(50, tableTop, 495, 22)
         .fillAndStroke('#f1f5f9', '#cbd5e1')
         .lineWidth(0.5);

      doc.fontSize(7)
         .fillColor('#475569')
         .font('Helvetica-Bold')
         .text('ITEM', col1 + 8, tableTop + 8)
         .text('QTY', col2, tableTop + 8, { width: 65, align: 'center' })
         .text('RATE', col3, tableTop + 8, { width: 70, align: 'right' })
         .text('TOTAL', col4, tableTop + 8, { width: 60, align: 'right' });

      yPos = tableTop + 24;

      // Items - very compact rows
      data.items.forEach((item, index) => {
        // Product name and Malayalam name on same line
        doc.fontSize(8)
           .fillColor('#1e293b')
           .font('Helvetica-Bold')
           .text(item.productName, col1 + 8, yPos, { width: 200, lineBreak: false });

        doc.fontSize(6)
           .fillColor('#64748b')
           .font('Helvetica')
           .text(` (${item.malayalamName})`, col1 + 8, yPos + 10, { width: 200 });

        // Quantity
        doc.fontSize(8)
           .fillColor('#1e293b')
           .font('Helvetica')
           .text(`${item.quantity} kg`, col2, yPos + 3, { width: 65, align: 'center' });

        // Rate
        doc.fontSize(7)
           .fillColor('#64748b')
           .text(`£${item.price.toFixed(2)}`, col3, yPos + 3, { width: 70, align: 'right' });

        // Amount
        doc.fontSize(9)
           .fillColor('#1e293b')
           .font('Helvetica-Bold')
           .text(`£${item.lineTotal.toFixed(2)}`, col4, yPos + 3, { width: 60, align: 'right' });

        yPos += 22;

        // Separator line between items
        if (index < data.items.length - 1) {
          doc.moveTo(50, yPos - 1)
             .lineTo(545, yPos - 1)
             .strokeColor('#e2e8f0')
             .lineWidth(0.3)
             .stroke();
        }
      });

      yPos += 8;

      // Summary box - very compact
      const summaryBoxTop = yPos;
      const summaryLeft = 360;
      const summaryWidth = 185;
      const summaryHeight = 85;

      doc.rect(summaryLeft, summaryBoxTop, summaryWidth, summaryHeight)
         .fillAndStroke('#f8fafc', '#cbd5e1')
         .lineWidth(0.8);

      yPos = summaryBoxTop + 10;

      // Subtotal
      doc.fontSize(7)
         .fillColor('#64748b')
         .font('Helvetica')
         .text('Subtotal:', summaryLeft + 10, yPos, { width: 90 });
      
      doc.fontSize(8)
         .fillColor('#1e293b')
         .font('Helvetica-Bold')
         .text(`£${data.subtotal.toFixed(2)}`, summaryLeft + 105, yPos, { width: 70, align: 'right' });

      yPos += 15;

      // Total Weight
      doc.fontSize(7)
         .fillColor('#64748b')
         .font('Helvetica')
         .text('Weight:', summaryLeft + 10, yPos, { width: 90 });
      
      doc.fontSize(8)
         .fillColor('#1e293b')
         .font('Helvetica-Bold')
         .text(`${data.totalWeight.toFixed(1)} kg`, summaryLeft + 105, yPos, { width: 70, align: 'right' });

      yPos += 15;

      // Pricing Tier
      doc.fontSize(7)
         .fillColor('#64748b')
         .font('Helvetica')
         .text('Tier:', summaryLeft + 10, yPos, { width: 90 });
      
      doc.fontSize(8)
         .fillColor('#f59e0b')
         .font('Helvetica-Bold')
         .text(data.tier, summaryLeft + 105, yPos, { width: 70, align: 'right' });

      yPos += 18;

      // Total divider
      doc.moveTo(summaryLeft + 10, yPos)
         .lineTo(summaryLeft + summaryWidth - 10, yPos)
         .strokeColor('#94a3b8')
         .lineWidth(1)
         .stroke();

      yPos += 8;

      // Grand Total
      doc.fontSize(9)
         .fillColor('#1e293b')
         .font('Helvetica-Bold')
         .text('TOTAL:', summaryLeft + 10, yPos, { width: 90 });
      
      doc.fontSize(13)
         .fillColor('#0ea5e9')
         .font('Helvetica-Bold')
         .text(`£${data.subtotal.toFixed(2)}`, summaryLeft + 105, yPos - 1, { width: 70, align: 'right' });

      yPos = summaryBoxTop + summaryHeight + 15;

      // Payment Terms Section - very compact
      doc.moveTo(50, yPos)
         .lineTo(545, yPos)
         .dash(3, { space: 2 })
         .strokeColor('#cbd5e1')
         .lineWidth(0.8)
         .stroke()
         .undash();

      yPos += 10;

      doc.fontSize(7)
         .fillColor('#475569')
         .font('Helvetica-Bold')
         .text('PAYMENT TERMS', 50, yPos);

      yPos += 10;

      doc.fontSize(6)
         .fillColor('#64748b')
         .font('Helvetica')
         .text('Payment details will be provided separately. This invoice is for your records.', 
               50, yPos, { width: 495, lineGap: 1 });

      yPos += 18;

      doc.fontSize(7)
         .fillColor('#475569')
         .font('Helvetica-Bold')
         .text('NOTES', 50, yPos);

      yPos += 10;

      doc.fontSize(6)
         .fillColor('#64748b')
         .font('Helvetica')
         .text('• All prices in GBP (£)  • Subject to availability  • We will contact you to confirm', 
               50, yPos, { width: 495, lineGap: 1 });

      // Footer - positioned near bottom but flexible
      yPos += 25;
      
      doc.moveTo(50, yPos)
         .lineTo(545, yPos)
         .strokeColor('#e2e8f0')
         .lineWidth(0.8)
         .stroke();

      doc.fontSize(7)
         .fillColor('#0ea5e9')
         .font('Helvetica-Bold')
         .text('Thank you for your business!', 50, yPos + 6, { align: 'center', width: 495 });

      doc.fontSize(6)
         .fillColor('#94a3b8')
         .font('Helvetica')
         .text('Computer-generated invoice - no signature required', 
               50, yPos + 15, { align: 'center', width: 495 });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
