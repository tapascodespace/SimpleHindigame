# Voice Detective (Vercel Deploy)

A single-page noir detective game with:
- Hindi/English speech input (browser speech recognition)
- Claude-powered story logic
- ElevenLabs voice narration
- Persistent in-browser story journal

## Deploy to Vercel

1. Push this folder to a GitHub repo.
2. Import the repo in Vercel.
3. In Vercel Project Settings → Environment Variables, add:
   - `CLAUDE_API_KEY`
   - `ELEVENLABS_API_KEY`
   - `MISTRAL_API_KEY` (optional, reserved for future use)
4. Deploy.

## Local run

```bash
python3 -m http.server 8000
```

Open:
- `http://localhost:8000/` (Vercel-style entry)
- `http://localhost:8000/hindi-voice-detective.html` (legacy file)

## Serverless routes

- `POST /api/claude` → Claude text response
- `POST /api/tts` → ElevenLabs audio stream
- `POST /api/stt` → ElevenLabs speech-to-text transcription
- `GET /api/health` → health check

## Notes

- API keys are now server-side only and are not exposed in the browser.
- Use Chrome for best speech-recognition support.
