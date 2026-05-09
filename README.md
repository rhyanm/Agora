# AI Store

A collection of five purpose-built AI tools, each designed for a specific job. No generic chatbot — every tool has a defined role, structured output, and a focused use case.

## Tools

| Tool | Category | What it does |
|------|----------|--------------|
| **Scout** ⚾ | Sports | Baseball & sports analytics — paste stats or game data and get plain-English analysis |
| **Distill** 📄 | Research | Summarizes any text, report, or dataset into key insights and action items |
| **Clause** 📋 | Legal | Breaks down contracts and legal documents — flags risks and translates into plain English |
| **Fit Check** 👔 | Lifestyle | Personal style advisor — outfit feedback, pairing suggestions, occasion guidance |
| **Forge** 🔧 | Builder | Interviews you and builds a custom AI tool spec and ready-to-use prompt |

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- An [Anthropic API key](https://console.anthropic.com/)

## Getting Started

**1. Clone the repo**
```bash
git clone https://github.com/rhyanm/ai-store.git
cd ai-store
```

**2. Install dependencies**
```bash
npm install
```

**3. Set up your API key**

Create a `.env.local` file in the root of the project:
```bash
cp .env.local.example .env.local
```

Or create it manually and add:
```
ANTHROPIC_API_KEY=your_api_key_here
```

Get your API key from [console.anthropic.com](https://console.anthropic.com/).

**4. Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

```bash
npm run build
npm start
```

## Tech Stack

- [Next.js 14](https://nextjs.org/) — React framework
- [TypeScript](https://www.typescriptlang.org/) — type safety
- [Tailwind CSS](https://tailwindcss.com/) — styling
- [Anthropic SDK](https://www.npmjs.com/package/@anthropic-ai/sdk) — AI responses
