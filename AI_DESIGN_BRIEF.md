# Supercell-Style Revamp Brief (Voice-First)

Use this brief when prompting Cursor / Claude / GPT to redesign the existing project with a polished, mobile-game feel while preserving current voice logic.

## Goal
Turn the current voice-first game into a more entertaining, high-feedback, Supercell-inspired experience without breaking:
- speech-to-text flow,
- command processing,
- text-to-speech loop,
- existing server routes.

## Core UX Direction
- Keep the game voice-first and text-supported.
- Prioritize “juicy” feedback: bounce, impact, sparkle, shake, reward reveal.
- Use card-based UI, chunky controls, high contrast, rounded components, and clear hierarchy.
- Keep desktop centered with a mobile-like max-width layout.

## Visual References To Provide AI
Paste your chosen links under these categories when using the master prompt:

1. Core Aesthetic (Layout + card structure)
- Brawl Stars UI Kit (Behance)
- Clash Royale UI concepts (Dribbble)
- Supercell-style menu/settings systems (Figma)

2. Component References (buttons, bars, reward cards)
- Clash Royale screen galleries / UI databases
- Uiverse game/3D button examples

3. Typography
- Lilita One (Google Fonts)
- Luckiest Guy (Google Fonts)

## Suggested UI Rules
- Typography: `Lilita One` for major UI text; fallback to `Luckiest Guy` for punch headings.
- Button style: thick lower shadow + pressed state (`transform: translateY(4px)` on active).
- Containers: rounded cards (~20px radius), thick borders, layered depth.
- Palette baseline:
  - Background: `#12192b`
  - Primary action: `#FFCC00`
  - Secondary action: `#1B75BC`

## Feedback Rules (must-have)
- Every voice command should trigger one visible reaction.
- Success: glow/pulse/pop + SFX.
- Combat actions: micro screen-shake + hit flash.
- Rewards: bounce + sparkle/confetti.
- Error/unrecognized command: playful fail state, not a dead end.

## Voice Command Icon Set (quick assets)
- Attack (sword): https://img.icons8.com/color/96/sword.png
- Defend (shield): https://img.icons8.com/color/96/shield.png
- Magic: https://img.icons8.com/color/96/magic-wand.png
- Listening (mic): https://img.icons8.com/color/96/microphone.png

## Master Prompt (paste into AI)
"I want to completely revamp the UI/UX of this voice-first game (`https://github.com/tapascodespace/SimpleHindigame`).

Aesthetic Goal: mimic a Supercell-style design language (Brawl Stars / Clash Royale feel).

Design Rules:
- Typography: use Lilita One for UI elements.
- Buttons: create juicy 3D buttons with thick bottom borders; include `:active` press-down behavior.
- Containers: rounded cards (~20px radius), strong borders, layered shadows.
- Colors: deep navy background (#12192b), primary gold (#FFCC00), secondary blue (#1B75BC).
- Feedback: every voice-command result must trigger visual feedback (bounce/shake/pop/emoji).
- Responsiveness: center the layout, mobile-game look even on desktop (`max-width: 480px` style treatment for key panels).

Implementation constraints:
- Do NOT break existing Web Speech API / STT / TTS logic.
- Keep command processing and server API routes intact.
- Make additive UI/CSS/animation changes only.

Reference Links:
- [Paste Behance/Dribbble/Figma references here]

Start by restructuring `index.html` styles and UI components while preserving current JavaScript game flow."

## Fast Implementation Checklist (60 minutes)
1. Replace button/card styling with chunky, high-contrast components.
2. Add action-specific visual reactions (attack/defend/magic/loot/build).
3. Add tiny SFX layer for instant feedback (success/error/listening/impact).
4. Add reward reveal animation (coin pop/confetti).
5. Keep fallback-safe behavior if image generation or voice services are slow.

## Safety Notes
- Keep runtime API keys server-side only.
- Do not remove graceful fallbacks for STT, TTS, and image generation.
- Prefer additive animation and style changes over architecture rewrites.
