import { FastifyInstance } from 'fastify'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

// Simple rules - no AI needed for these
const RULES: Record<string, string[]> = {
  burger:    ['Fries', 'Cola'],
  pizza:     ['Garlic Bread', 'Orange Juice'],
  coffee:    ['Muffin', 'Croissant'],
  sandwich:  ['Chips', 'Lemonade'],
  pasta:     ['Garlic Bread', 'Iced Tea'],
  salad:     ['Soup', 'Water'],
  tea:       ['Biscuits', 'Cake'],
  rice:      ['Papad', 'Lassi'],
}

function getRuleBasedSuggestions(cartItemNames: string[]): string[] {
  const suggestions = new Set<string>()
  for (const itemName of cartItemNames) {
    const lower = itemName.toLowerCase()
    for (const [keyword, addons] of Object.entries(RULES)) {
      if (lower.includes(keyword)) {
        addons.forEach(a => suggestions.add(a))
      }
    }
  }
  // Return top 2, or defaults if nothing matched
  const result = [...suggestions].slice(0, 2)
  return result.length > 0 ? result : ['Cola', 'Water']
}

export async function upsellRoutes(app: FastifyInstance) {

  app.post('/', { onRequest: [(app as any).authenticate] }, async (request, reply) => {
    const { cartItems } = request.body as any
    // cartItems = ["Burger", "Coffee"]

    // If AI is disabled, use rules only
    if (process.env.AI_ENABLED !== 'true') {
      return { suggestions: getRuleBasedSuggestions(cartItems), source: 'rules' }
    }

    // Try AI, fall back to rules if it fails
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{
          role: 'user',
          content: `A customer ordered: ${cartItems.join(', ')}. 
          Suggest exactly 2 add-on food/drink items they might like.
          Reply with ONLY a JSON array of 2 strings. Example: ["Fries", "Cola"]`
        }],
        max_tokens: 50
      })

      const text = response.choices[0].message.content || '[]'
      const suggestions = JSON.parse(text)
      return { suggestions, source: 'ai' }

    } catch (error) {
      // AI failed - use rules as fallback
      return { suggestions: getRuleBasedSuggestions(cartItems), source: 'rules-fallback' }
    }
  })
}