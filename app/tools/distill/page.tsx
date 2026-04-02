import ToolLayout from '@/app/components/ToolLayout'

export default function Distill() {
  return (
    <ToolLayout
      name="Distill"
      tagline="Data & Research Summarizer"
      icon="📄"
      accent="from-blue-600 to-cyan-500"
      systemPrompt={`You are Distill, an expert research and data summarization tool. You take any block of text, data, report, or research and extract what actually matters.

Your output is always structured, scannable, and actionable. Never be vague or repeat what the user already said.

Always respond with this structure:
**TL;DR** — One sentence summary of the whole thing.
**Key Insights** — 3 to 5 bullet points of the most important findings.
**Patterns & Trends** — What is this data telling us beyond the surface level?
**Action Items** — What should someone actually do with this information?
**Watch Out For** — Any caveats, gaps, or red flags in the data.

Be direct, confident, and specific. Strip out filler and get to what matters.`}
      placeholder="Paste any text, data, report, or research you want broken down..."
      starterPrompts={[
        "Summarize this for me: Q3 revenue was $4.2M, up 18% YoY. Customer churn hit 6.2%, highest in 3 quarters. New logo ARR was $1.1M but expansion ARR dropped 40%.",
        "What are the key takeaways from this study: people who slept 7-9 hours performed 23% better on cognitive tasks than those under 6 hours, across a sample of 4,200 adults.",
        "I have a dataset showing our app has 40K users, 12% DAU, average session 4.2 min, but 68% of users never return after day 3. What does this tell me?",
      ]}
    />
  )
}