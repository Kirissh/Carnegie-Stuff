# Quasar

**Transform research papers into interactive quizzes.**

Quasar is a galaxy-themed PDF quiz generator that extracts text from research papers and creates multiple-choice quizzes to help you study and retain material.

![Quasar](public/favicon.svg)

## Features

- **PDF Upload** — Drag & drop or browse to upload text-based PDFs
- **Auto Quiz Generation** — MCQs, fill-in-the-blank, and true/false questions generated offline
- **Paper Library** — Browse, search, sort, and manage all uploaded research papers
- **Quiz Mode** — Progress bar, question navigator, flag for review, optional timer
- **Results & Review** — Score breakdown with answer review and retry option
- **Optional AI** — Add an OpenAI API key in settings for smarter questions
- **Data Export/Import** — Backup and restore your library
- **100% Local** — Papers stored in your browser, nothing uploaded to servers

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Build

```bash
npm run build
npm run preview
```

## Tips

- Works best with **text-based PDFs** (not scanned images)
- Configure question count, timer, and shuffle in **Settings**
- Add an OpenAI API key for AI-powered question generation

## Tech Stack

- React + TypeScript + Vite
- Tailwind CSS v4
- PDF.js for text extraction
- LocalStorage for persistence
