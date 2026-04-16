# the-frankfurtert-protocol

## Projects in this repo
- **Is it a Hot Dog? 🌭**: `is-it-a-hot-dog/` (Next.js + Hugging Face)

## Is it a Hot Dog? 🌭
An AI-powered snack judge built for a hackathon demo. Upload an image and the app will consult a Vision Transformer (ViT) model to decide if it’s a hot dog.

### Tech stack
- **Next.js** (App Router)
- **Tailwind CSS**
- **Hugging Face Inference API** (`google/vit-base-patch16-224`)
- **Lucide React** (icons)

### Local setup
From the repo root:

```bash
cd is-it-a-hot-dog
npm install
```

Create `is-it-a-hot-dog/.env.local` (recommended) or `is-it-a-hot-dog/.env`:

```bash
HUGGINGFACE_TOKEN=hf_your_token_here
```

Run the app:

```bash
npm run dev
```

Then open `http://localhost:3000`.

### API contract
- **POST** `/api/detect`
- **Body**: `{ "imageBase64": "data:image/jpeg;base64,..." }`
- **Response**: `{ isHotdog: boolean, confidence: number, topConcepts: Array<{ label: string, score: number }> }`

### Demo tips
- Use a clear hot dog photo for the “wow” moment.
- For fun edge cases, try **corn dog**, **bratwurst**, or “hot dog adjacent” foods.

### Notes
- Don’t commit your token. This repo’s `.gitignore` already ignores `.env*`.