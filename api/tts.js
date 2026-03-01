const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly');

async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function synthesizeWithPolly({ text, region, voiceId, textType }) {
  const polly = new PollyClient({ region });
  const baseInput = {
    OutputFormat: 'mp3',
    VoiceId: voiceId,
    LanguageCode: 'hi-IN',
    Text: text,
    TextType: textType
  };

  const engines = ['neural', 'standard'];
  let lastError = null;

  for (const engine of engines) {
    try {
      const response = await polly.send(new SynthesizeSpeechCommand({ ...baseInput, Engine: engine }));
      if (!response.AudioStream) throw new Error('Polly did not return audio');
      return await streamToBuffer(response.AudioStream);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Polly synthesis failed');
}

async function synthesizeWithElevenLabs({ text, voiceId, body }) {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not configured for fallback TTS');
  }

  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId || 'ErXwobaYiN019PkySvjV'}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text,
      model_id: body?.model_id || 'eleven_multilingual_v2',
      voice_settings: body?.voice_settings || {
        stability: 0.65,
        similarity_boost: 0.85,
        style: 0.3,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    let message = 'ElevenLabs fallback request failed';
    try {
      const errorData = await response.json();
      message = errorData?.detail?.message || message;
    } catch (_) {}
    throw new Error(message);
  }

  return Buffer.from(await response.arrayBuffer());
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const region = process.env.AWS_REGION || process.env.POLLY_AWS_REGION || 'ap-south-1';
  const pollyVoiceId = process.env.POLLY_VOICE_ID || 'Aditi';

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const text = String(body?.text || '').trim();

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const textType = body?.textType === 'ssml' ? 'ssml' : 'text';
    let audioBuffer = null;
    let pollyError = null;

    try {
      audioBuffer = await synthesizeWithPolly({
        text,
        region,
        voiceId: pollyVoiceId,
        textType
      });
    } catch (error) {
      pollyError = error;
      audioBuffer = await synthesizeWithElevenLabs({
        text,
        voiceId: body?.voiceId,
        body
      });
    }

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    if (pollyError) {
      res.setHeader('X-TTS-Fallback', 'elevenlabs');
    }
    return res.status(200).send(audioBuffer);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'TTS request failed' });
  }
};

