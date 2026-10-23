'use client'
import { useState, useRef } from 'react'

const TEMPLATES = [
  { title: '爆款标题生成', desc: '生成10个同类型爆款标题', prompt: '请根据我提供的主题，生成10个吸引人的爆款自媒体标题。' },
  { title: '今日头条【通用版】', desc: '根据主题创作优质内容', prompt: '请根据我的主题，写一篇今日头条风格的文章。' },
  { title: '今日头条【情感版】', desc: '根据主题创作情感共鸣内容', prompt: '请根据主题，写一篇今日头条情感类文章，要求引发共鸣。' },
  { title: '微头条二创', desc: '根据原文进行二次创作', prompt: '请对以下内容进行微头条二创，保留核心意思。' },
  { title: '公众号文章【汽车】', desc: '公众号汽车文章生成', prompt: '请写一篇关于汽车的公众号文章，要求专业。' },
  { title: '公众号文章【娱乐】', desc: '公众号娱乐文章生成', prompt: '请写一篇娱乐八卦或影视评论类的公众号文章。' },
  { title: '视频文案【通用】', desc: '根据标题生成视频文案', prompt: '请根据标题写一段短视频文案，包含前3秒钩子。' },
  { title: '视频文案【科普】', desc: '根据标题生成科普文案', prompt: '请写一段科普类短视频文案，要求把复杂知识讲得简单有趣。' },
  { title: '短视频脚本', desc: '帮你进行短视频的分镜脚本', prompt: '请根据主题写一份短视频分镜脚本，包含画面描述、台词。' },
  { title: '视频口播稿', desc: '口播稿撰写指南', prompt: '请写一篇适合真人口播的视频文案，语言要自然。' },
  { title: '论文润色', desc: '一键完成论文润色', prompt: '请对以下论文段落进行润色，提升学术性。' },
  { title: '论文大纲', desc: '由选题生成大纲', prompt: '请根据我提供的论文选题，生成一份详细的论文大纲。' },
  { title: 'Python文章', desc: 'Python文章生成', prompt: '请写一篇关于Python编程的入门教程文章。' },
  { title: 'PS软件文章', desc: '根据标题生成PS专业文章', prompt: '请写一篇关于Photoshop使用技巧的专业教程。' },
  { title: '菜谱制作', desc: '跟着AI学做饭', prompt: '请根据我提供的食材，写一份详细的菜谱。' },
  { title: '旅游攻略', desc: '帮您制定旅游攻略', prompt: '请为我的目的地制定一份详细的旅游攻略。' },
  { title: '取名神器', desc: '给小孩或宠物起个好听的名字', prompt: '请帮我起10个有寓意的名字，并解释含义。' },
  { title: 'AI猫娘女友', desc: '和二次元猫娘女友对话', prompt: '你现在是一个可爱的猫娘女友，请用撒娇的语气回复我。' }
]

export default function App() {
  const [tab, setTab] = useState('home')
  const [tpl, setTpl] = useState(TEMPLATES[0])
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  async function generate() {
    if (!input.trim() || loading) return
    setResult('')
    setLoading(true)
    setShowModal(true)
    try {
      const res = await fetch('/api/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'custom', systemPrompt: tpl.prompt, topic: input, wordCount: 800 }),
      })
      if (!res.ok) {
        setResult('生成失败：' + (await res.text()))
        return
      }
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          setResult(p => p + decoder.decode(value, { stream: true }))
          if (resultRef.current) resultRef.current.scrollTop = resultRef.current.scrollHeight
        }
      }
    } catch (e: any) {
      setResult('出错：' + e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: '#f5f6f8', minHeight: '100vh', fontFamily: 'sans-serif', paddingBottom: '70px' }}>
      {tab === 'home' && (
        <div style={{ padding: '20px' }}>
          <h1 style={{ fontSize: '20px', marginBottom: '20px', color: '#333' }}>智能模板库</h1>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {TEMPLATES.map((item, i) => (
              <div key={i} onClick={() => { setTpl(item); setTab('write'); setInput(''); }} style={{ background: '#fff', padding: '15px', borderRadius: '12px', cursor: 'pointer' }}>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#333', marginBottom: '6px' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: '#888' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'write' && (
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <span onClick={() => setTab('home')} style={{ fontSize: '20px', marginRight: '10px', cursor: 'pointer' }}>←</span>
            <h2 style={{ fontSize: '18px', margin: 0 }}>{tpl.title}</h2>
          </div>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} placeholder="请输入主题内容..." style={{ width: '100%', minHeight: '150px', border: 'none', background: '#f9f9f9', padding: '10px', borderRadius: '8px', outline: 'none', resize: 'none' }} />
          </div>
          <button onClick={generate} disabled={loading} style={{ width: '100%', padding: '15px', background: '#2575fc', color: '#fff', border: 'none', borderRadius: '12px', fontSize: '16px' }}>
            {loading ? '生成中...' : '立即生成'}
          </button>
        </div>
      )}

      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', display: 'flex', justifyContent: 'space-around', padding: '15px 0', borderTop: '1px solid #eee' }}>
        <div onClick={() => setTab('home')} style={{ color: tab === 'home' ? '#2575fc' : '#888', cursor: 'pointer' }}>首页模板</div>
        <div onClick={() => { setTab('write'); if(!tpl) setTpl(TEMPLATES[0]); }} style={{ color: tab === 'write' ? '#2575fc' : '#888', cursor: 'pointer' }}>创作</div>
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 10, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
            <span>生成结果</span>
            <span onClick={() => setShowModal(false)} style={{ color: '#2575fc', cursor: 'pointer' }}>关闭</span>
          </div>
          <div ref={resultRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
            {result || (loading && '思考中...')}
          </div>
        </div>
      )}
    </div>
  )
}
