const { BedrockRuntimeClient, ConverseCommand } = require('@aws-sdk/client-bedrock-runtime');

function mapMessages(messages = []) {
  return messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant'))
    .map(m => {
      const rawContent = Array.isArray(m.content)
        ? m.content.map(part => (typeof part === 'string' ? part : part?.text || '')).join('\n')
        : m.content;
      return {
        role: m.role,
        content: [{ text: String(rawContent || '') }]
      };
    })
    .filter(m => m.content[0].text.trim().length > 0);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const region = process.env.AWS_REGION || process.env.BEDROCK_AWS_REGION || 'us-east-1';
  const modelId = process.env.BEDROCK_MODEL_ID || 'mistral.mistral-large-2407-v1:0';

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const maxTokens = Number(body?.max_tokens || 350);
    const messages = mapMessages(body?.messages || []);

    const client = new BedrockRuntimeClient({ region });
    const command = new ConverseCommand({
      modelId,
      system: body?.system ? [{ text: String(body.system) }] : undefined,
      messages,
      inferenceConfig: {
        maxTokens,
        temperature: 0.7,
        topP: 0.9
      }
    });

    const result = await client.send(command);
    const text = result?.output?.message?.content
      ?.map(part => part?.text || '')
      .join('')
      .trim() || '';

    return res.status(200).json({ text });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Bedrock request failed' });
  }
};
