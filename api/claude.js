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
  const bedrockModelId = process.env.BEDROCK_MODEL_ID || 'mistral.mistral-large-2407-v1:0';
  const mistralApiKey = process.env.MISTRAL_API_KEY || process.env.BEDROCK_API_KEY || '';
  const mistralApiModel = process.env.MISTRAL_MODEL || 'mistral-large-latest';

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const maxTokens = Number(body?.max_tokens || 350);
    const messages = mapMessages(body?.messages || []);

    if (mistralApiKey) {
      const chatMessages = [];
      if (body?.system) {
        chatMessages.push({ role: 'system', content: String(body.system) });
      }
      for (const m of messages) {
        chatMessages.push({ role: m.role, content: m.content?.[0]?.text || '' });
      }

      const mistralResponse = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mistralApiKey}`
        },
        body: JSON.stringify({
          model: body?.model || mistralApiModel,
          messages: chatMessages,
          max_tokens: maxTokens,
          temperature: 0.7,
          top_p: 0.9
        })
      });

      const mistralData = await mistralResponse.json();
      if (!mistralResponse.ok) {
        return res.status(mistralResponse.status).json({
          error: mistralData?.error?.message || mistralData?.message || 'Mistral API request failed'
        });
      }

      const mistralText = mistralData?.choices?.[0]?.message?.content || '';
      return res.status(200).json({ text: String(mistralText).trim() });
    }

    const client = new BedrockRuntimeClient({ region });
    const command = new ConverseCommand({
      modelId: body?.model || bedrockModelId,
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
