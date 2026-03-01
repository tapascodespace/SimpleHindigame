module.exports = function handler(req, res) {
  return res.status(200).json({
    ok: true,
    service: 'voice-detective',
    timestamp: new Date().toISOString(),
    providers: {
      elevenlabsConfigured: Boolean(process.env.ELEVENLABS_API_KEY),
      pollyConfigured: Boolean(process.env.AWS_REGION || process.env.POLLY_AWS_REGION)
    }
  });
};
