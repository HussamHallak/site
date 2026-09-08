const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method not allowed' }) 
    };
  }

  try {
    // Get the image data from the request
    const { image, width, height, timestamp } = JSON.parse(event.body);
    
    if (!image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No image data provided' })
      };
    }

    // Connect to blob storage
    const store = getStore('images');
    
    // Create a unique filename
    const fileName = `browser_${width}x${height}_${timestamp.replace(/[\s:]/g, '-')}.png`;
    
    // Convert base64 to binary
    const imageBuffer = Buffer.from(image, 'base64');
    
    // Save the file to Netlify Blob Storage
    await store.set(fileName, imageBuffer, {
      contentType: 'image/png'
    });
    
    // Get the public URL for the saved file
    const publicUrl = await store.getPublicUrl(fileName);
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        filename: fileName,
        url: publicUrl,
        message: 'Image saved successfully!'
      })
    };
  } catch (error) {
    console.error('Error saving image:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
