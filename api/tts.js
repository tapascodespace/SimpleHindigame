const { PollyClient, SynthesizeSpeechCommand } = require('@aws-sdk/client-polly');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const region = process.env.AWS_REGION || process.env.POLLY_AWS_REGION || 'ap-south-1';
  const voiceId = process.env.POLLY_VOICE_ID || 'Aditi';

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const text = String(body?.text || '').trim();

    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const polly = new PollyClient({ region });
    const command = new SynthesizeSpeechCommand({
      Engine: 'neural',
      OutputFormat: 'mp3',
      VoiceId: voiceId,
      LanguageCode: 'hi-IN',
      Text: text,
      TextType: body?.textType === 'ssml' ? 'ssml' : 'text'
    });

    const response = await polly.send(command);
    if (!response.AudioStream) {
      return res.status(500).json({ error: 'Polly did not return audio' });
    }

    const chunks = [];
    for await (const chunk of response.AudioStream) {
      chunks.push(Buffer.from(chunk));
    }
    const audioBuffer = Buffer.concat(chunks);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(audioBuffer);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Polly request failed' });
  }
};
