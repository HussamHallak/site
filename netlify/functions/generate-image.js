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

    // ============================================================
    // MANUALLY CONFIGURE BLOB STORAGE
    // ============================================================
    // You need to get these values from your Netlify dashboard
    const siteID = process.env.ba1416c8-1ad6-4d18-9798-83a21c23399b;  // Your site ID
    const token = process.env.nfp_6DU6kiqu5fDJxtLWzoePzjgwQVEFJVMWf324;  // Your blob token
    
    if (!siteID || !token) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Missing environment variables. Please set NETLIFY_SITE_ID and NETLIFY_BLOB_TOKEN.' 
        })
      };
    }
    
    // Create store with manual configuration
    const store = getStore({
      name: 'images',
      siteID: siteID,
      token: token
    });
    
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
