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
    const voiceId = body.voiceId || 'ErXwobaYiN019PkySvjV';

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: body.text || '',
        model_id: body.model_id || 'eleven_monolingual_v1',
        voice_settings: body.voice_settings || {
          stability: 0.65,
          similarity_boost: 0.85,
          style: 0.3,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      let message = 'ElevenLabs request failed';
      try {
        const errData = await response.json();
        message = errData?.detail?.message || message;
      } catch (_) {}
      return res.status(response.status).json({ error: message });
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(audioBuffer);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
};
