import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generatePDFInvoice = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const invoicesDir = path.join(__dirname, '../uploads/invoices');

      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const fileName = `Iris_Invoice_${order.orderId || Date.now()}.pdf`;
      const filePath = path.join(invoicesDir, fileName);
      const writeStream = fs.createWriteStream(filePath);

      doc.pipe(writeStream);

      // Header Banner
      doc.rect(40, 40, 515, 60).fill('#035542');
      doc.fillColor('#ffffff')
         .fontSize(22)
         .font('Helvetica-Bold')
         .text('IRIS PREMIUM BOTTLING CO.', 60, 52);
      doc.fontSize(10)
         .font('Helvetica')
         .text('Bespoke Artesian Spring Water & 24K Gold Labeling', 60, 78);

      // Order Title
      doc.fillColor('#333333')
         .fontSize(18)
         .font('Helvetica-Bold')
         .text(`OFFICIAL INVOICE — #${order.orderId || '1001'}`, 40, 120);

      doc.fontSize(10).font('Helvetica').fillColor('#666666');
      doc.text(`Date: ${new Date(order.createdAt || Date.now()).toLocaleDateString('en-IN')}`, 40, 142);
      doc.text(`Status: ${order.orderStatus || 'Confirmed & Dispatched'}`, 40, 156);

      // Bill To Section
      doc.rect(40, 180, 515, 80).stroke('#333333');
      doc.fillColor('#035542').font('Helvetica-Bold').fontSize(11).text('BILL TO / CUSTOMER DETAILS', 55, 192);
      doc.fillColor('#333333').font('Helvetica').fontSize(10);
      doc.text(`Customer Name: ${order.customerName || 'Valued Customer'}`, 55, 210);
      doc.text(`WhatsApp: +${order.whatsappNumber || ''}`, 55, 224);
      doc.text(`Phone: +${order.phoneNumber || order.whatsappNumber || ''}`, 55, 238);

      // Label Customization Summary Box
      doc.rect(40, 275, 515, 65).fill('#f9e9a9').stroke('#333333');
      doc.fillColor('#035542').font('Helvetica-Bold').fontSize(11).text('BESPOKE LABEL MONOGRAM SPECIFICATION', 55, 285);
      doc.fillColor('#333333').font('Helvetica').fontSize(10);
      doc.text(`Branding / Logo Printed: "${order.brandingName || order.monogramText || order.customerName || 'Iris Custom'}"`, 55, 302);
      doc.text(`Delivery Date: ${order.deliveryDate || 'As scheduled'}`, 55, 318);

      // Items Table Header
      let y = 355;
      doc.rect(40, y, 515, 25).fill('#035542');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10);
      doc.text('ITEM DESCRIPTION', 50, y + 8);
      doc.text('VESSEL / SIZE', 230, y + 8);
      doc.text('QTY', 360, y + 8);
      doc.text('PRICE (INR)', 420, y + 8);
      doc.text('TOTAL', 490, y + 8);

      // Items Rows
      const items = Array.isArray(order.items) && order.items.length > 0
        ? order.items
        : [{ name: order.productName || 'Iris Custom Water Bottle', size: order.bottleSize || '750ml', quantity: order.quantity || 1, unitPrice: order.unitPrice || order.totalAmount || 350, total: order.totalAmount || 350 }];

      y += 25;
      for (const item of items) {
        doc.rect(40, y, 515, 30).stroke('#333333');
        doc.fillColor('#333333').font('Helvetica').fontSize(10);
        doc.text(String(item.name || 'Custom Bottle').substring(0, 24), 50, y + 8);
        doc.text(String(item.size || '750ml').substring(0, 18), 230, y + 8);
        doc.text(`${item.quantity || 1}`, 360, y + 8);
        doc.text(`INR ${item.unitPrice || item.price || 0}`, 420, y + 8);
        doc.text(`INR ${item.total || (item.quantity * (item.unitPrice || item.price || 0)) || order.totalAmount || 0}`, 490, y + 8);
        y += 30;
      }

      // Total Box
      y += 15;
      doc.rect(340, y, 215, 40).fill('#035542');
      doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(12);
      doc.text('GRAND TOTAL:', 350, y + 13);
      doc.text(`INR ${order.totalAmount || 0}`, 470, y + 13);

      // Footer Notes
      y += 60;
      doc.fillColor('#666666').font('Helvetica-Oblique').fontSize(9);
      doc.text('Thank you for choosing Iris Premium Bottling Co.', 40, y);
      doc.text('Natural Alpine Artesian Spring Water (pH 7.8 naturally alkaline). All shipments ice-bucket tested.', 40, y + 14);
      doc.text('Plant Location: Nellore, Andhra Pradesh | Contact: concierge@irispremium.com', 40, y + 28);

      doc.end();

      writeStream.on('finish', () => {
        const publicServerUrl = process.env.PUBLIC_SERVER_URL || 'https://e5a9-2409-40f0-5052-f94a-dcd3-d3ca-9fc7-2ad5.ngrok-free.app';
        const publicUrl = `${publicServerUrl}/invoices/${fileName}`;
        console.log(`📄 Generated local PDF invoice at: ${filePath} -> Public URL: ${publicUrl}`);
        resolve(publicUrl);
      });

      writeStream.on('error', (err) => reject(err));
    } catch (error) {
      reject(error);
    }
  });
};

export default { generatePDFInvoice };
