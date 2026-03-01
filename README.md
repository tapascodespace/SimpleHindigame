# Voice Detective (Vercel Deploy)

A single-page noir detective game with:
- Hindi/English/mixed speech input (recorder + server STT)
- Mistral reasoning (via Mistral API or AWS Bedrock)
- Amazon Polly (Aditi) bilingual voice narration
- Persistent in-browser story journal

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Import the repo in Vercel.
3. In Vercel Project Settings → Environment Variables, add:
   - `MISTRAL_API_KEY` (preferred if you want simple key-based Mistral access)
  - or `AWS_BEARER_TOKEN_BEDROCK` (supported alias for your bearer-style Bedrock key)
   - OR Bedrock credentials:
     - `AWS_ACCESS_KEY_ID`
     - `AWS_SECRET_ACCESS_KEY`
     - `AWS_REGION` (example: `ap-south-1` for Polly, Bedrock region as available)
   - `BEDROCK_MODEL_ID` (default: `mistral.mistral-large-2407-v1:0`)
   - `MISTRAL_MODEL` (default: `mistral-large-latest` when using Mistral API)
   - `POLLY_VOICE_ID` (default: `Aditi`)
   - `ELEVENLABS_API_KEY` (currently used by `/api/stt` route for robust speech-to-text)
4. Deploy.

If your Bedrock model runs in a different region than Polly, use:
- `BEDROCK_AWS_REGION`
- `POLLY_AWS_REGION`

## Local run (static preview)

```bash
python3 -m http.server 8000
```

Open:
- `http://localhost:8000/` (Vercel-style entry)
- `http://localhost:8000/hindi-voice-detective.html` (legacy file)

For full serverless route testing, use `vercel dev` after logging in.

## Serverless routes

- `POST /api/claude` → Claude text response
- `POST /api/claude` → Mistral text response (Mistral API first, Bedrock fallback; route name kept for compatibility)
- `POST /api/tts` → Amazon Polly MP3 audio stream
- `POST /api/stt` → ElevenLabs speech-to-text transcription
- `GET /api/health` → health check

## Notes

- API keys are server-side only and are not exposed in the browser.
- Use Chrome for best speech-recognition support.
