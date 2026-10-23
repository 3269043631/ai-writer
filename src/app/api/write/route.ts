import OpenAI from 'openai'

const client = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

const SYSTEM: Record<string, string> = {
  article:
    '你是专业中文写作助手。根据用户给出的主题、关键词、风格和字数撰写文章。只输出正文，不要解释。',
  continue:
    '你是中文续写助手。根据已有文本自然衔接续写，保持风格、人称、语气一致。只输出续写内容。',
  expand:
    '你是中文扩写助手。在不改变原意的前提下增加细节、例子和过渡，使内容更充实。只输出扩写后的全文。',
  shorten:
    '你是中文缩写助手。保留核心信息和逻辑，删除冗余表达。只输出缩写后的全文。',
  polish:
    '你是中文润色助手。修正语法、优化用词、调整语序，使表达更流畅专业，不改变原意。只输出润色后的全文。',
  rewrite:
    '你是中文改写助手。在保留核心意思的前提下换一种表达方式和句式结构重写。只输出改写后的全文。',
  title: '你是标题生成助手。生成 5 个中文标题，每行一个，不加序号和解释。',
  summary: '你是摘要助手。用 100–200 字概括核心信息。只输出摘要。',
}

export async function POST(req: Request) {
  try {
    const { mode, topic, keywords, style, wordCount, prompt } = await req.json()
    const system = SYSTEM[mode] || SYSTEM.article

    const userContent = [
      topic && `主题：${topic}`,
      keywords && `关键词：${keywords}`,
      style && `风格：${style}`,
      wordCount && `目标字数：约 ${wordCount} 字`,
      prompt && `已有内容：\n${prompt}`,
    ]
      .filter(Boolean)
      .join('\n')

    const stream = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userContent || '请生成一篇短文。' },
      ],
      stream: true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || ''
            if (text) controller.enqueue(encoder.encode(text))
          }
        } finally {
          controller.close()
        }
      },
    })

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  } catch (e: any) {
    return new Response('服务端错误：' + (e?.message || '未知错误'), { status: 500 })
  }
}
