import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

/**
 * Adds a high-visibility, professional watermark to a PDF when downloaded.
 * Online preview retains the 100% original unwatermarked document.
 */
export async function applyClasyWatermark(pdfBytes: Uint8Array | ArrayBuffer): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();

      // 1. Large Diagonal Center Watermark: "CLASY · ABES"
      const watermarkText = 'CLASY · ABES';
      const fontSize = Math.max(32, Math.min(width, height) * 0.085);
      const textWidth = fontSize * 0.6 * watermarkText.length;
      
      page.drawText(watermarkText, {
        x: width / 2 - textWidth / 2.2,
        y: height / 2 - fontSize / 3,
        size: fontSize,
        font: boldFont,
        color: rgb(0.12, 0.35, 0.85), // Premium Royal Blue
        opacity: 0.22,
        rotate: degrees(45),
      });

      // 2. Secondary Repeat Watermark (Top & Bottom Diagonals for Full Protection)
      page.drawText('CLASY', {
        x: width * 0.2,
        y: height * 0.75,
        size: fontSize * 0.65,
        font: boldFont,
        color: rgb(0.12, 0.35, 0.85),
        opacity: 0.14,
        rotate: degrees(45),
      });

      page.drawText('CLASY', {
        x: width * 0.6,
        y: height * 0.25,
        size: fontSize * 0.65,
        font: boldFont,
        color: rgb(0.12, 0.35, 0.85),
        opacity: 0.14,
        rotate: degrees(45),
      });

      // 3. Top Header Bar Branding
      page.drawText('CLASY — Official ABES Study Materials', {
        x: 24,
        y: height - 16,
        size: 8,
        font: boldFont,
        color: rgb(0.2, 0.3, 0.5),
        opacity: 0.6,
      });

      // 4. Bottom Footer Bar Branding
      page.drawText('Downloaded from Clasy (ABES College Notes & Timetable) • https://clasy-tau.vercel.app', {
        x: 24,
        y: 12,
        size: 7.5,
        font: regularFont,
        color: rgb(0.2, 0.2, 0.25),
        opacity: 0.6,
      });
    }

    return await pdfDoc.save();
  } catch (error) {
    console.warn('PDF watermarking failed, returning original document:', error);
    return new Uint8Array(pdfBytes);
  }
}
