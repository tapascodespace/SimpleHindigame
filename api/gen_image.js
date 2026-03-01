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

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const prompt = String(body?.prompt || '').trim();
    const width = Number(body?.width || 128);
    const height = Number(body?.height || 128);
    const style = String(body?.style || 'pixel');

    if (!prompt) {
      return res.status(400).json({ error: 'prompt is required' });
    }

    const targetWidth = Number.isFinite(width) && width > 0 ? width : 512;
    const targetHeight = Number.isFinite(height) && height > 0 ? height : 512;

    const enhancedPrompt = `${prompt}. style: ${style}. game-ready sprite, clean silhouette, transparent background.`;

    // Primary provider: Runware
    if (runwareKey) {
      const payload = [
        {
          taskType: 'imageInference',
          numberResults: 1,
          width: targetWidth,
          height: targetHeight,
          includeCost: true,
          outputType: ['URL'],
          model: 'google:4@3',
          positivePrompt: enhancedPrompt
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
      if (response.ok) {
        const first = data?.data?.[0] || {};
        const imageUrl =
          first.imageURL ||
          first.imageUrl ||
          first.image_url ||
          (Array.isArray(first.images) ? first.images[0]?.imageURL || first.images[0]?.url : '');

        if (imageUrl) {
          const imageResponse = await fetch(imageUrl);
          if (imageResponse.ok) {
            const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
            res.setHeader('Content-Type', 'image/png');
            res.setHeader('Cache-Control', 'no-store');
            res.setHeader('X-Gen-Provider', 'runware');
            return res.status(200).send(imageBuffer);
          }
        }
      }
    }

    // Guaranteed visual fallback: Pollinations (no key)
    const seed = Math.floor(Math.random() * 1000000);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancedPrompt)}?width=${targetWidth}&height=${targetHeight}&seed=${seed}&model=flux&nologo=true`;
    const fallbackResponse = await fetch(pollinationsUrl);

    if (!fallbackResponse.ok) {
      return res.status(502).json({ error: 'All image providers failed (Runware + fallback).' });
    }

    const fallbackBuffer = Buffer.from(await fallbackResponse.arrayBuffer());
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Gen-Provider', 'pollinations-fallback');
    return res.status(200).send(fallbackBuffer);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Image generation failed' });
  }
};
