# Is it a Hot Dog? 🌭

The definitive AI-powered culinary judge, built during **MLH Global Hack Week 2026**.

## How it Works
1. **Upload:** User provides an image of a suspicious food item.
2. **Inference:** The image is piped to a Vision Transformer (ViT) model hosted on Hugging Face.
3. **Verdict:** The app determines if it's a hot dog with high-precision confidence scores.

## Tech
- **Next.js** (App Router, full-stack)
- **Hugging Face Inference API** (`google/vit-base-patch16-224`)
- **Tailwind CSS**
- **Lucide React** (icons)

## Setup
1. `npm install`
2. Create `.env.local`:

```bash
HUGGINGFACE_TOKEN=hf_your_token_here
```

3. `npm run dev`
4. Open `http://localhost:3000`

## API Contract
- `POST /api/detect`
- Body: `{ "imageBase64": "data:image/jpeg;base64,..." }`
- Response: `{ isHotdog: boolean, confidence: number, topConcepts: Array<{ label: string, score: number }> }`

## Pro-Tip for your Demo
Since the model you chose is quite literal, try uploading a **Corn Dog** or a **Bratwurst** during your testing. It’s always a fun edge case to show during a hackathon demo to see how the AI handles “Hot Dog-adjacent” foods!
