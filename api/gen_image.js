module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const runwareKey =
    process.env.RUNWARE_API_KEY ||
    process.env.RUNWARE_KEY ||
    process.env.RUNWAY_API_KEY ||
    process.env.RUNWARE_BEARER_TOKEN ||
    '';
  if (!runwareKey) {
    return res.status(503).json({
      error: 'Runware key missing. Set RUNWARE_API_KEY (or RUNWARE_KEY / RUNWAY_API_KEY / RUNWARE_BEARER_TOKEN).'
    });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const prompt = String(body?.prompt || '').trim();
    const width = Number(body?.width || 128);
    const height = Number(body?.height || 128);
    const style = String(body?.style || 'pixel');

    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const taskUuid = `asset-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
    const payload = [
      {
        taskType: 'imageInference',
        taskUUID: taskUuid,
        positivePrompt: `${prompt}. style: ${style}. transparent background. game-ready icon/sprite.`,
        width,
        height,
        outputType: 'URL',
        outputFormat: 'PNG',
        numberResults: 1,
        includeCost: false
      }
    ];

    const response = await fetch('https://api.runware.ai/v1', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${runwareKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.message || data?.error || 'Runware request failed' });
    }

    const imageUrl = data?.data?.[0]?.imageURL || data?.data?.[0]?.image_url;
    if (!imageUrl) {
      return res.status(500).json({ error: 'No image URL returned by provider' });
    }

    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return res.status(500).json({ error: 'Failed to fetch generated image' });
    }

    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(imageBuffer);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Image generation failed' });
  }
};
