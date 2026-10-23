'use client'
import { useState, useRef } from 'react'
import type { CSSProperties } from 'react'

const MODES = [
  { key: 'article', label: '写作' },
  { key: 'continue', label: '续写' },
  { key: 'expand', label: '扩写' },
  { key: 'shorten', label: '缩写' },
  { key: 'polish', label: '润色' },
  { key: 'rewrite', label: '改写' },
  { key: 'title', label: '标题' },
  { key: 'summary', label: '摘要' },
]

const TEMPLATES = [
  { label: '论文', style: '学术论文风格，包含摘要、引言、正文、结论' },
  { label: '工作总结', style: '工作总结风格，分点陈述成果、问题与计划' },
  { label: '新闻稿', style: '新闻稿风格，导语、主体、背景，客观简洁' },
  { label: '自媒体', style: '自媒体爆款风格，口语化、有共鸣' },
  { label: '营销文案', style: '营销文案风格，痛点—方案—行动号召' },
]

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  fontSize: 15,
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
}

export default function Home() {
  const [mode, setMode] = useState('article')
  const [topic, setTopic] = useState('')
  const [keywords, setKeywords] = useState('')
  const [style, setStyle] = useState('专业')
  const [wordCount, setWordCount] = useState('800')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  async function generate() {
    if (loading) return
    setContent('')
    setLoading(true)
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch('/api/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          topic,
          keywords,
          style,
          wordCount: Number(wordCount) || 800,
          prompt: content,
        }),
        signal: controller.signal,
      })
      if (!res.ok) {
        const err = await res.text()
        setContent('生成失败：' + err)
        return
      }
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          setContent((prev) => prev + decoder.decode(value, { stream: true }))
        }
      }
    } catch (e: any) {
      if (e?.name !== 'AbortError') setContent('出错：' + e.message)
    } finally {
      setLoading(false)
      abortRef.current = null
    }
  }

  function stop() {
    abortRef.current?.abort()
    setLoading(false)
  }

  function copy() {
    if (!content) return
    navigator.clipboard.writeText(content).then(
      () => alert('已复制到剪贴板'),
      () => alert('复制失败，请长按选择文字复制')
    )
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '16px 16px 48px' }}>
      <h1 style={{ fontSize: 20, margin: '0 0 4px' }}>AI 写作助手</h1>
      <p style={{ color: '#64748b', fontSize: 13, margin: '0 0 16px' }}>
        输入主题，一键生成中文文章
      </p>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 8 }}>
        {MODES.map((m) => (
          <button
            key={m.key}
            onClick={() => setMode(m.key)}
            style={{
              flexShrink: 0,
              padding: '6px 14px',
              fontSize: 14,
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              cursor: 'pointer',
              background: mode === m.key ? '#0f172a' : '#fff',
              color: mode === m.key ? '#fff' : '#0f172a',
            }}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 16 }}>
        {TEMPLATES.map((t) => (
          <button
            key={t.label}
            onClick={() => setStyle(t.style)}
            style={{
              flexShrink: 0,
              padding: '6px 12px',
              fontSize: 13,
              borderRadius: 20,
              border: '1px solid #e2e8f0',
              background: '#fff',
              cursor: 'pointer',
              color: '#334155',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 10, marginBottom: 16 }}>
        <input
          style={inputStyle}
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="主题，例如：人工智能对教育的影响"
        />
        <input
          style={inputStyle}
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          placeholder="关键词，用逗号分隔（选填）"
        />
        <input
          style={inputStyle}
          value={style}
          onChange={(e) => setStyle(e.target.value)}
          placeholder="写作风格，例如：专业、口语化、幽默"
        />
        <input
          style={inputStyle}
          type="number"
          value={wordCount}
          onChange={(e) => setWordCount(e.target.value)}
          placeholder="目标字数"
        />
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
        <button
          onClick={generate}
          disabled={loading}
          style={{
            flex: 1,
            padding: 12,
            fontSize: 15,
            fontWeight: 600,
            borderRadius: 10,
            border: 'none',
            background: '#0f172a',
            color: '#fff',
            cursor: 'pointer',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? '生成中…' : '开始生成'}
        </button>
        {loading && (
          <button
            onClick={stop}
            style={{
              padding: '12px 16px',
              fontSize: 15,
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              background: '#fff',
              cursor: 'pointer',
            }}
          >
            停止
          </button>
        )}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="生成的内容会出现在这里，也可以直接编辑…"
        style={{
          width: '100%',
          minHeight: 340,
          padding: 14,
          fontSize: 15,
          lineHeight: 1.7,
          border: '1px solid #e2e8f0',
          borderRadius: 10,
          outline: 'none',
          boxSizing: 'border-box',
          resize: 'vertical',
          background: '#fff',
        }}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 8,
        }}
      >
        <span style={{ fontSize: 12, color: '#94a3b8' }}>{content.length} 字符</span>
        <button
          onClick={copy}
          style={{
            padding: '8px 16px',
            fontSize: 14,
            borderRadius: 8,
            border: '1px solid #e2e8f0',
            background: '#fff',
            cursor: 'pointer',
          }}
        >
          复制全文
        </button>
      </div>
    </div>
  )
}
