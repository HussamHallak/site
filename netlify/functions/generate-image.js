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
    console.log('Function started');
    
    // Parse the request body
    let body;
    try {
      body = JSON.parse(event.body);
      console.log('Parsed body:', { width: body.width, height: body.height, hasImage: !!body.image });
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Invalid JSON body' })
      };
    }

    const { image, width, height, timestamp } = body;
    
    if (!image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No image data provided' })
      };
    }

    // Get environment variables
    const siteID = process.env.ba1416c8-1ad6-4d18-9798-83a21c23399b || process.env.ba1416c8-1ad6-4d18-9798-83a21c23399b;
    const token = process.env.nfp_6DU6kiqu5fDJxtLWzoePzjgwQVEFJVMWf324;
    
    console.log('Environment check:', { 
      hasSiteID: !!siteID, 
      hasToken: !!token,
      siteID: siteID ? siteID.substring(0, 10) + '...' : 'missing',
      token: token ? 'present' : 'missing'
    });
    
    if (!siteID || !token) {
      return {
        statusCode: 500,
        body: JSON.stringify({ 
          error: 'Missing environment variables. Please set SITE_ID and NETLIFY_BLOB_TOKEN.' 
        })
      };
    }

    // Create store with manual configuration
    console.log('Creating blob store...');
    const store = getStore({
      name: 'images',
      siteID: siteID,
      token: token
    });
    
    // Create a unique filename
    const fileName = `browser_${width}x${height}_${timestamp.replace(/[\s:]/g, '-')}.png`;
    console.log('Filename:', fileName);
    
    // Convert base64 to binary
    const imageBuffer = Buffer.from(image, 'base64');
    console.log('Image buffer size:', imageBuffer.length, 'bytes');
    
    // Save the file to Netlify Blob Storage
    console.log('Saving to blob storage...');
    await store.set(fileName, imageBuffer, {
      contentType: 'image/png'
    });
    
    // Get the public URL for the saved file
    const publicUrl = await store.getPublicUrl(fileName);
    console.log('Public URL:', publicUrl);
    
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
    console.error('Error stack:', error.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        stack: error.stack
      })
    };
  }
};
