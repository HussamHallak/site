const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const { image, width, height, timestamp } = body;

    if (!image) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'No image data provided' })
      };
    }

    const siteID = process.env.SITE_ID || process.env.NETLIFY_SITE_ID;
    const token = process.env.NETLIFY_BLOB_TOKEN;

    if (!siteID || !token) {
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Missing environment variables',
          hasSiteID: !!siteID,
          hasToken: !!token
        })
      };
    }

    const store = getStore({
      name: 'images',
      siteID: siteID,
      token: token
    });

    const fileName = 'browser_' + width + 'x' + height + '_' + Date.now() + '.png';
    const imageBuffer = Buffer.from(image, 'base64');

    await store.set(fileName, imageBuffer, {
      contentType: 'image/png'
    });

    const publicUrl = await store.getPublicUrl(fileName);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        filename: fileName,
        url: publicUrl
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message
      })
    };
  }
};
