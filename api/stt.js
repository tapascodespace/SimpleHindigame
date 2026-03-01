module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing ELEVENLABS_API_KEY environment variable' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const audioBase64 = body?.audioBase64;
    const mimeType = body?.mimeType || 'audio/webm';
    const languageCode = body?.languageCode;

    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    const audioBuffer = Buffer.from(audioBase64, 'base64');
    const audioBlob = new Blob([audioBuffer], { type: mimeType });
    const extension = mimeType.includes('mp4') ? 'm4a' : mimeType.includes('ogg') ? 'ogg' : 'webm';

    const form = new FormData();
    form.append('file', audioBlob, `speech.${extension}`);
    form.append('model_id', 'scribe_v1');
    if (languageCode) form.append('language_code', languageCode);

    const response = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey
      },
      body: form
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: data?.detail?.message || data?.error || 'Speech-to-text request failed' });
    }

    return res.status(200).json({ text: data?.text || '' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
