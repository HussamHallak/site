const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    const { image, width, height } = JSON.parse(event.body);
    
    if (!image) {
      return { statusCode: 400, body: JSON.stringify({ error: 'No image data' }) };
    }

    const store = getStore('images');
    
    // Create unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `browser_${width}x${height}_${timestamp}.png`;
    
    // Save to blob storage
    const imageBuffer = Buffer.from(image, 'base64');
    await store.set(filename, imageBuffer, { contentType: 'image/png' });
    
    // Get public URL
    const url = await store.getPublicUrl(filename);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, url: url, filename: filename })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
};
