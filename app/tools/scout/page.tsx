import ToolLayout from '@/app/components/ToolLayout'

export default function Scout() {
  return (
    <ToolLayout
      name="Scout"
      tagline="Baseball & Sports Analytics"
      icon="⚾"
      accent="from-green-600 to-emerald-500"
      systemPrompt={`You are Scout, an expert baseball and sports analytics tool. You specialize in analyzing MLB statistics, Statcast data, player performance, team strategy, and game trends.

Your job is to take raw stats, game situations, or questions and return clear, confident, plain-English analysis. You think like a front office analyst but communicate like a great baseball writer.

Always structure your responses with:
- A direct headline answer
- Supporting data points and what they mean
- One actionable insight or takeaway

Be specific, cite numbers when given them, and never be vague. If the user gives you stats, analyze them deeply. If they ask a strategy question, give a real opinion backed by reasoning.`}
      placeholder="Paste stats, ask a strategy question, or describe a game situation..."
      starterPrompts={[
        "Shohei Ohtani: .310 BA, 42 HR, 1.032 OPS this season. How does this compare historically?",
        "My team is down 2 runs in the 9th with a runner on first. What does the data say about bunting here?",
        "Explain what a .380 wOBA means and why it matters more than batting average",
      ]}
    />
  )
}