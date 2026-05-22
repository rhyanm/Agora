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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let currentMessages: any[] = messages

    let response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: currentMessages,
      tools: [{ type: 'web_search_20260209', name: 'web_search' }],
    })

    // Server-side web search may pause mid-loop; re-send until done
    while (response.stop_reason === 'pause_turn') {
      currentMessages = [
        ...currentMessages,
        { role: 'assistant', content: response.content },
      ]
      response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 2048,
        system: systemPrompt,
        messages: currentMessages,
        tools: [{ type: 'web_search_20260209', name: 'web_search' }],
      })
    }

    const text = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === 'text')
      .map(block => block.text)
      .join('\n\n')

    return NextResponse.json({ text })
  } catch (err: unknown) {
    console.error('API Error:', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
