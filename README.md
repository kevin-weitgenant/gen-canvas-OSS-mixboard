# Gen Canvas

> An open-source infinite canvas whiteboard with AI-powered image generation.

> An OSS alternative to [Mixboard](https://mixboard.app).

## Why Gen Canvas?

Current AI tools weren’t built for **visual iteration workflows**.

- **Chat interfaces** (like ChatGPT or Google Gemini) are great for conversation—but break down when you need to **generate, compare, tweak, and evolve multiple images**. You lose context, versions, and spatial organization.
  
- Tools like Mixboard get much closer to the ideal workflow—and it’s the best experience I found—but they come with limitations:
  
  - Locked into specific models
    
  - Limited control over prompting
    
  - Not extensible or hackable
    

Gen Canvas exists to fix that.

It’s built around three core ideas:

- **Spatial thinking > linear chat**  
  Ideas—especially visual ones—should live side by side, not buried in a scroll.
  
- **Model-agnostic by design**  
  Use any image model you want. No lock-in.
  
- **Full control for builders**  
  Prompt however you want, extend however you want, and integrate your own workflows.
  

## Features

- **Infinite Canvas** — Pan, zoom, and organize your ideas on an unlimited workspace
  
- **AI Image Generation** — Generate images directly on the canvas using text prompts
  
- **Interactive Tools** — Selection, pan, and context menu for seamless manipulation
  

## AI Provider

Currently, Gen Canvas uses the **[kie.ai](https://kie.ai)** API for image generation.

An API key is required — sign up at [kie.ai](https://kie.ai) to get yours.

## Quick Start

```bash
# Install dependencies

npm install



# Create a .env file with your kie.ai API key

echo "VITE_KIE_AI_API_KEY=your_key_here" > .env



# Run the development server

npm run dev
```

## Tech Stack

- React 19 + TypeScript
  
- Vite
  
- Tailwind CSS
  
- Zustand for state management
  

## Collaboration

Interested in contributing or collaborating? **DM me on [X/Twitter](https://x.com/KevinWeitgenant)**.

MIT License