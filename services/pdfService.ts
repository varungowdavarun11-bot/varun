import { PDFData } from '../types';

// We access the globally loaded pdfjsLib from the CDN script in index.html
declare global {
  interface Window {
    pdfjsLib: any;
  }
}

export const extractTextFromPDF = async (file: File): Promise<PDFData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async function () {
      try {
        const typedarray = new Uint8Array(this.result as ArrayBuffer);
        
        // Use the global window.pdfjsLib
        if (!window.pdfjsLib) {
          throw new Error("PDF.js library not loaded");
        }

        const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
        let fullText = '';
        
        // Loop through all pages
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          
          const pageText = textContent.items
            .map((item: any) => item.str)
            .join(' ');
            
          fullText += `[Page ${i}]\n${pageText}\n\n`;
        }

        resolve({
          name: file.name,
          text: fullText,
          pageCount: pdf.numPages
        });

      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};
