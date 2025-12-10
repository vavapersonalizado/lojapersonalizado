/**
 * Upload print file to Cloudinary
 * @param {string} dataURL - Base64 data URL of the image
 * @param {string} orderId - Order ID
 * @param {string} itemId - Order item ID
 * @returns {Promise<string>} - Cloudinary URL
 */
export async function uploadPrintFile(dataURL, orderId, itemId) {
  try {
    // Convert dataURL to blob
    const response = await fetch(dataURL);
    const blob = await response.blob();
    
    // Create form data
    const formData = new FormData();
    formData.append('file', blob, `print_${orderId}_${itemId}.png`);
    formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);
    formData.append('folder', 'print-files');
    formData.append('tags', `order:${orderId},item:${itemId}`);
    
    // Upload to Cloudinary
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData
      }
    );
    
    if (!uploadResponse.ok) {
      throw new Error('Failed to upload print file to Cloudinary');
    }
    
    const data = await uploadResponse.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading print file:', error);
    throw error;
  }
}

/**
 * Generate print-ready file from canvas
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {Object} productInfo - Product dimensions and info
 * @returns {string} - Data URL of print-ready file
 */
export function generatePrintFile(canvas, productInfo = {}) {
  const {
    width = 10, // cm
    height = 10, // cm
    name = 'Produto',
    dpi = 300
  } = productInfo;
  
  // Calculate scale for 300 DPI (96 DPI is default)
  const scale = dpi / 96;
  
  // Create high-resolution canvas
  const printCanvas = document.createElement('canvas');
  printCanvas.width = canvas.width * scale;
  printCanvas.height = canvas.height * scale;
  
  const ctx = printCanvas.getContext('2d');
  
  // Scale context
  ctx.scale(scale, scale);
  
  // Draw original canvas
  ctx.drawImage(canvas, 0, 0);
  
  // Reset scale for text
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  
  // Add technical information
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, printCanvas.height - 80, printCanvas.width, 80);
  
  ctx.fillStyle = 'white';
  ctx.font = 'bold 24px Arial';
  ctx.fillText(name, 20, printCanvas.height - 50);
  
  ctx.font = '18px Arial';
  ctx.fillText(`Dimensões: ${width}cm x ${height}cm`, 20, printCanvas.height - 25);
  ctx.fillText(`Resolução: ${dpi} DPI`, printCanvas.width - 200, printCanvas.height - 25);
  
  // Export as PNG
  return printCanvas.toDataURL('image/png');
}
