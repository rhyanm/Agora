import Anthropic from '@anthropic-ai/sdk'
import { NextRequest, NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    console.log('API route hit')
    console.log('Key exists:', !!process.env.ANTHROPIC_API_KEY)

    const { messages, systemPrompt } = await req.json()

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    return NextResponse.json({ text })
  } catch (err: unknown) {
    console.error('API Error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
