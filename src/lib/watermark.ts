import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

/**
 * Adds an elegant, professional watermark to a PDF when downloaded.
 * Online preview retains the 100% original unwatermarked document.
 */
export async function applyClasyWatermark(pdfBytes: Uint8Array | ArrayBuffer): Promise<Uint8Array> {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();

      // 1. Diagonal Center Watermark
      const watermarkText = 'CLASY · ABES';
      const fontSize = Math.min(width, height) * 0.08;
      page.drawText(watermarkText, {
        x: width / 2 - (fontSize * watermarkText.length) / 3.8,
        y: height / 2 - fontSize / 2,
        size: fontSize,
        font: helveticaFont,
        color: rgb(0.18, 0.38, 0.88),
        opacity: 0.13,
        rotate: degrees(45),
      });

      // 2. Bottom Footer Brand Bar
      const footerText = 'Downloaded from Clasy — ABES College Portal (clasy.app)';
      page.drawText(footerText, {
        x: 25,
        y: 12,
        size: 8.5,
        font: regularFont,
        color: rgb(0.35, 0.35, 0.4),
        opacity: 0.55,
      });
    }

    return await pdfDoc.save();
  } catch (error) {
    console.warn('PDF watermarking skipped or failed:', error);
    // If not a standard PDF or parsing fails, return original bytes unmodified
    return new Uint8Array(pdfBytes);
  }
}
