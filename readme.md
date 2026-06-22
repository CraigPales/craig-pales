# Craig Pales: Cartoon Studio & Consistency Engine

This is a premium, interactive web application designed to help start the cartoon project **"Craig Pales: The Forbidden Vigilante"**. It addresses the challenge of **character consistency** between frames/episodes and lets you interactively test the show's core dark-comedy action hook (Craig's forbidden arts slicing enemies like butter).

---

## Story Premise
Craig Pales was a serene Shaolin monk taught forbidden martial arts. Sworn to never use them, he is kidnapped and ends up in New York City. Forced to defend the city and himself, he breaks his vow. The catch? The forbidden arts make his fists and kicks cut street gang members **like butter**, slicing them into neat, cartoonish meat cuts.

---

## Character Consistency Strategy
Maintaining identical characters across subsequent scenes is the primary hurdle in cartoon production. This project showcases two primary paths:
1. **Modular Vector Rigging**: Building characters out of reusable SVG layers (Head, Eyes, Robe, Outfits). You can swap parts programmatically to change expressions or outfits without losing style consistency.
2. **AI Generative Stack (LoRA + ControlNet)**: Training a custom Stable Diffusion LoRA on Craig's vector design and using ControlNet (OpenPose/Canny) to lock poses and line art across generations.

---

## Project Structure
- `index.html`: Dashboard layout, storyboard creator fields, and AI workflow guides.
- `style.css`: Premium dark-mode styling with Outfit & Inter typography, glassmorphism, and neon overlays.
- `app.js`: Tab routing, dynamic SVG cartoon rendering engine, and storyboard timeline state.
- `canvas.js`: Physics-based HTML5 canvas slashing simulation with sound synthesizers and particle fountains.

---

## How to Run the Studio
To run the interactive web application, open a terminal in this directory and start a local HTTP server:

### Option A: Python (Built-in)
```bash
python3 -m http.server 8000
```
Then open [http://localhost:8000](http://localhost:8000) in your browser.

### Option B: Node.js (serve)
```bash
npx serve
```
Then open the provided port in your browser.

---

## Workspace Setup
For optimal pairing, it is recommended to set this folder as your active workspace in Antigravity.
```json
{
  "active_workspace": "/Users/o/.gemini/antigravity/scratch/craig-pales"
}
```
