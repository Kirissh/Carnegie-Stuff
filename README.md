# PDF Quizzer

Upload a PDF, pick a topic and question count, and get an instant quiz with answer feedback.

Coursework repo — CMU summer internship @ Carnegie Mellon University Pittsburgh.

## Features

- PDF upload with text extraction
- Topic suggestions from your document
- Choose how many questions (3–25)
- Immediate correct/incorrect feedback per question
- AI-powered questions via [LLM7.io](https://llm7.io) (offline fallback included)
- Papers stored locally in your browser

## Quick Start

```bash
npm install
cp .env.example .env   # add your LLM7.io token
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- PDF.js for text extraction
- LLM7.io OpenAI-compatible API for quiz generation
