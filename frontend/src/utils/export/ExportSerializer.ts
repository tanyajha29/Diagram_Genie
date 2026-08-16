export class ExportSerializer {
  /**
   * Downloads a plain text string (SVG) directly as a file in the browser
   */
  static downloadText(content: string, filename: string, mimeType = 'image/svg+xml') {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Rasterizes the self-contained SVG string to a high-resolution PNG file in the browser
   */
  static async exportToPng(
    svgString: string,
    width: number,
    height: number,
    filename: string,
    pixelRatio = 2
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = width * pixelRatio;
            canvas.height = height * pixelRatio;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Failed to obtain 2D canvas rendering context'));
              return;
            }

            // Smooth scaling
            ctx.scale(pixelRatio, pixelRatio);
            ctx.drawImage(img, 0, 0, width, height);

            canvas.toBlob((pngBlob) => {
              try {
                if (!pngBlob) {
                  reject(new Error('Canvas rasterization to PNG blob failed'));
                  return;
                }
                const pngUrl = URL.createObjectURL(pngBlob);
                
                const link = document.createElement('a');
                link.href = pngUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                
                document.body.removeChild(link);
                URL.revokeObjectURL(pngUrl);
                URL.revokeObjectURL(url);
                resolve();
              } catch (err) {
                reject(err);
              }
            }, 'image/png');
          } catch (err) {
            reject(err);
          }
        };

        img.onerror = (err) => {
          URL.revokeObjectURL(url);
          reject(new Error(`Failed to load SVG vector into Image object: ${err}`));
        };

        img.src = url;
      } catch (err) {
        reject(err);
      }
    });
  }
}
