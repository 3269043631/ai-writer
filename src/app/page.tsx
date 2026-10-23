'use client'
import { useState, useRef, useEffect } from 'react'

// 免费热搜接口 (含头条和微博)
const API_TOUTIAO = 'https://api.vvhan.com/api/hotlist/toutiao'
const API_WEIBO = 'https://api.vvhan.com/api/hotlist/wbHot'

// 领域分类
const CATEGORIES = ['全部', '财经', '科技', '美食', '军事', '国际', '体育', '娱乐', '历史', '微头条', '汽车', '法律', 'NBA', '热点', '三农', '情感', '股票', '彩票', '数码', '游戏', '电影']

export default function App() {
  const [currentTab, setCurrentTab] = useState<'home' | 'write' | 'templates' | 'library' | 'history'>('home')
  const [writeTab, setWriteTab] = useState('文章生成')
  const [input, setInput] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResultModal, setShowResultModal] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  // 文章库状态
  const [articles, setArticles] = useState<any[]>([])
  const [fetchingNews, setFetchingNews] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('全部')
  const [newsSource, setNewsSource] = useState<'toutiao' | 'weibo'>('toutiao') // 默认头条热搜

  // 监听切换页面、切换来源、切换领域
  useEffect(() => {
    if (currentTab === 'library') {
      fetchHotNews()
    }
  }, [currentTab, selectedCategory, newsSource])

  async function fetchHotNews() {
    setFetchingNews(true)
    try {
      const url = newsSource === 'toutiao' ? API_TOUTIAO : API_WEIBO
      const res = await fetch(url)
      const json = await res.json()
      
      if (json.success && json.data) {
        const newsList = json.data.map((item: any, index: number) => ({
          id: index,
          title: item.title,
          source: newsSource === 'toutiao' ? '今日头条' : '微博热搜',
          time: new Date().toLocaleTimeString(),
          read: `${Math.floor(Math.random() * 100) + 10}万`,
          tag: selectedCategory,
        }))
        setArticles(newsList.slice(0, 15)) // 取前15条
      }
    } catch (e) {
      console.error('获取热点失败', e)
      setArticles([
        { id: 1, title: `【备用数据】${selectedCategory}领域：今日最新热点资讯`, source: '系统提示', time: '刚刚', read: '10万+' },
        { id: 2, title: `【备用数据】全球经济走势与科技前沿分析`, source: '系统提示', time: '刚刚', read: '5.2万' },
      ])
    } finally {
      setFetchingNews(false)
    }
  }

  // 核心生成逻辑
  async function handleGenerate() {
    if (!input.trim() || loading) return
    setResult('')
    setLoading(true)
    setShowResultModal(true)
    
    try {
      const res = await fetch('/api/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'article', topic: input, style: '爆款自媒体风格', wordCount: 800 }),
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
          setResult((prev) => prev + decoder.decode(value, { stream: true }))
          if (resultRef.current) resultRef.current.scrollTop = resultRef.current.scrollHeight
        }
      }
    } catch (e: any) {
      setResult('出错：' + e.message)
    } finally {
      setLoading(false)
    }
  }

  // 点击库里的文章，带入写作
  const handleUseArticle = (title: string) => {
    setInput(title)
    setCurrentTab('write')
  }

  // ---------------- 渲染页面：首页 ----------------
  const renderHome = () => (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{ background: 'linear-gradient(135deg, #FF9A44, #FC6076)', padding: '20px', color: '#fff', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '14px', background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '12px' }}>智能写作助手</span>
          <span style={{ fontSize: '12px' }}>1k+ 人在用</span>
        </div>
        <h1 style={{ fontSize: '24px', margin: '0 0 10px 0', fontWeight: 'bold' }}>欢迎使用 AI爆文</h1>
        <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 20px 0' }}>爆文-让创作更高效！</p>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '16px', fontSize: '12px' }}>精选文章 近3天</div>
          <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '16px', fontSize: '12px' }}>领域 30+</div>
        </div>
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginBottom: '20px' }}>
          {[
            { icon: '🔗', label: '链接生成', color: '#E0F2FE', onClick: () => setCurrentTab('write') },
            { icon: '📝', label: '文章生成', color: '#DBEAFE', onClick: () => setCurrentTab('write') },
            { icon: '💡', label: '话题生成', color: '#FEF3C7', onClick: () => setCurrentTab('write') },
            { icon: '📚', label: '文章合并', color: '#D1FAE5', onClick: () => setCurrentTab('write') }
          ].map((item, i) => (
            <div key={i} onClick={item.onClick} style={{ textAlign: 'center', cursor: 'pointer' }}>
              <div style={{ width: '50px', height: '50px', margin: '0 auto 8px', background: item.color, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{item.icon}</div>
              <div style={{ fontSize: '12px', color: '#475569' }}>{item.label}</div>
            </div>
          ))}
        </div>

        <div style={{ background: '#fff', padding: '15px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', border: '1px solid #f1f5f9' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid #FF8C00', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF8C00' }}>▶</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b' }}>新手使用教程</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>3分钟快速掌握核心功能</div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#FF8C00' }}>立即查看 &gt;</div>
        </div>

        <h3 style={{ fontSize: '16px', color: '#1e293b', marginBottom: '15px' }}>核心优势</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '12px' }}>
            <div style={{ fontSize: '20px', marginBottom: '5px' }}>📖</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>30+领域精选</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>近3天精选文库持续更新</div>
          </div>
          <div style={{ background: '#fff', padding: '15px', borderRadius: '12px' }}>
            <div style={{ fontSize: '20px', marginBottom: '5px' }}>🧠</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>多模型辅助</div>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>智能匹配行业模型精准辅助</div>
          </div>
        </div>
      </div>
    </div>
  )

  // ---------------- 渲染页面：写作台 ----------------
  const renderWrite = () => (
    <div style={{ paddingBottom: '80px' }}>
      <div style={{ display: 'flex', overflowX: 'auto', background: '#fff', padding: '15px', gap: '15px', whiteSpace: 'nowrap', borderBottom: '1px solid #f1f5f9' }}>
        {['链接生成', '文章生成', '话题生成', '素材合并创作'].map(tab => (
          <div key={tab} onClick={() => setWriteTab(tab)} style={{ padding: '8px 16px', borderRadius: '20px', fontSize: '14px', cursor: 'pointer', background: writeTab === tab ? '#FF8C00' : '#f8fafc', color: writeTab === tab ? '#fff' : '#64748b', fontWeight: writeTab === tab ? 'bold' : 'normal' }}>
            {tab}
          </div>
        ))}
      </div>

      <div style={{ padding: '20px' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
            <div style={{ fontSize: '20px', background: '#E0F2FE', padding: '8px', borderRadius: '50%' }}>🔗</div>
            <div style={{ fontWeight: 'bold' }}>{writeTab}</div>
          </div>
          
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`请输入${writeTab === '链接生成' ? '文章链接' : '文章内容或主题'}`}
            style={{ width: '100%', minHeight: '150px', border: 'none', background: '#f8fafc', borderRadius: '12px', padding: '15px', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
          />
          <div style={{ textAlign: 'right', fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>{input.length} / 5000</div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <div style={{ flex: 1, background: '#fff', padding: '10px', borderRadius: '12px', textAlign: 'center', fontSize: '12px', color: '#475569' }}>🍃 智能润色</div>
          <div style={{ flex: 1, background: '#fff', padding: '10px', borderRadius: '12px', textAlign: 'center', fontSize: '12px', color: '#475569' }}>🛡️ 原创辅助</div>
          <div style={{ flex: 1, background: '#fff', padding: '10px', borderRadius: '12px', textAlign: 'center', fontSize: '12px', color: '#475569' }}>⚠️ 违禁词检测</div>
        </div>

        <button onClick={handleGenerate} disabled={loading} style={{ width: '100%', padding: '16px', background: 'linear-gradient(90deg, #FF9A44, #FC6076)', color: '#fff', border: 'none', borderRadius: '24px', fontSize: '16px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(252,96,118,0.3)', cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? 'AI 正在生成...' : '开始生成 ➤'}
        </button>
      </div>
    </div>
  )

  // ---------------- 渲染页面：模板库 ----------------
  const renderTemplates = () => (
    <div style={{ display: 'flex', height: 'calc(100vh - 60px)', paddingBottom: '60px' }}>
      <div style={{ width: '100px', background: '#fff', paddingTop: '20px', borderRight: '1px solid #f1f5f9' }}>
        {['全部', '技能', '文章创作', '微头条创作'].map((c, i) => (
          <div key={i} style={{ padding: '15px 0', textAlign: 'center', fontSize: '13px', color: i === 0 ? '#FF8C00' : '#64748b', fontWeight: i === 0 ? 'bold' : 'normal', borderLeft: i === 0 ? '3px solid #FF8C00' : '3px solid transparent' }}>{c}</div>
        ))}
      </div>
      <div style={{ flex: 1, padding: '15px', overflowY: 'auto' }}>
        {[
          { title: '故事类写作主题生成', desc: '生成5个微头条写作主题', icon: '📰' },
          { title: '爆款标题生成', desc: '生成10个爆款标题', icon: '🔥' },
          { title: '写故事【文章模版】', desc: '社会现象、代际关系、婚恋观等', icon: '✍️' },
          { title: '去除AI痕迹（文章）', desc: '可通过朱雀AI检测，自然流畅', icon: '🪄' },
        ].map((t, i) => (
          <div key={i} onClick={() => { setInput(t.title); setCurrentTab('write'); }} style={{ background: '#fff', padding: '15px', borderRadius: '12px', marginBottom: '10px', display: 'flex', gap: '10px', cursor: 'pointer' }}>
            <div style={{ fontSize: '24px' }}>{t.icon}</div>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', marginBottom: '4px' }}>{t.title}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>{t.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // ---------------- 渲染页面：文章库 ----------------
  const renderLibrary = () => (
    <div style={{ padding: '15px', paddingBottom: '80px' }}>
      
      {/* 热搜来源切换 */}
      <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', marginBottom: '15px' }}>
        <div onClick={() => setNewsSource('toutiao')} style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', background: newsSource === 'toutiao' ? '#fff' : 'transparent', color: newsSource === 'toutiao' ? '#FF8C00' : '#64748b', fontWeight: newsSource === 'toutiao' ? 'bold' : 'normal', boxShadow: newsSource === 'toutiao' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>今日头条热搜</div>
        <div onClick={() => setNewsSource('weibo')} style={{ flex: 1, textAlign: 'center', padding: '8px', borderRadius: '8px', fontSize: '14px', cursor: 'pointer', background: newsSource === 'weibo' ? '#fff' : 'transparent', color: newsSource === 'weibo' ? '#FF8C00' : '#64748b', fontWeight: newsSource === 'weibo' ? 'bold' : 'normal', boxShadow: newsSource === 'weibo' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}>微博热搜</div>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', overflowX: 'auto' }}>
        {CATEGORIES.slice(0, 5).map((c, i) => (
          <div key={i} onClick={() => setSelectedCategory(c)} style={{ padding: '6px 16px', background: selectedCategory === c ? '#FF8C00' : '#fff', color: selectedCategory === c ? '#fff' : '#475569', borderRadius: '16px', fontSize: '13px', whiteSpace: 'nowrap', cursor: 'pointer' }}>{c}</div>
        ))}
        <div onClick={() => setShowCategoryModal(true)} style={{ padding: '6px 16px', background: '#fff', color: '#475569', borderRadius: '16px', fontSize: '13px', whiteSpace: 'nowrap', cursor: 'pointer' }}>全部领域 &gt;</div>
      </div>

      {fetchingNews ? (
        <div style={{ textAlign: 'center', padding: '30px', color: '#94a3b8' }}>正在实时拉取全网热点...</div>
      ) : (
        articles.map((item, i) => (
          <div key={i} style={{ background: '#fff', padding: '15px', borderRadius: '16px', marginBottom: '15px' }}>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#1e293b', marginBottom: '10px', lineHeight: 1.4 }}>{item.title}</div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <div style={{ width: '80px', height: '60px', background: item.source === '今日头条' ? '#ff4d4f' : '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', color: '#fff' }}>{item.source === '今日头条' ? '头条' : '🔥'}</div>
              <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>👤 {item.source}</div>
                <div>👁️ {item.read} 热度</div>
                <div>🕒 {item.time}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <div onClick={() => handleUseArticle(item.title)} style={{ flex: 1, textAlign: 'center', padding: '8px', background: '#FF8C00', color: '#fff', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>一键生成爆文</div>
            </div>
          </div>
        ))
      )}

      {/* 全部领域弹窗 */}
      {showCategoryModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div style={{ background: '#fff', borderTopLeftRadius: '20px', borderTopRightRadius: '20px', padding: '20px', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>全部领域</div>
              <div onClick={() => setShowCategoryModal(false)} style={{ fontSize: '20px', color: '#94a3b8', cursor: 'pointer' }}>×</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              {CATEGORIES.map((c, i) => (
                <div key={i} onClick={() => { setSelectedCategory(c); setShowCategoryModal(false); }} style={{ padding: '10px', textAlign: 'center', background: selectedCategory === c ? '#FF8C00' : '#f8fafc', color: selectedCategory === c ? '#fff' : '#475569', borderRadius: '12px', fontSize: '13px', cursor: 'pointer' }}>{c}</div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui, sans-serif', position: 'relative' }}>
      
      <header style={{ background: '#fff', padding: '15px 20px', textAlign: 'center', fontWeight: 'bold', fontSize: '16px', position: 'sticky', top: 0, zIndex: 10, borderBottom: '1px solid #f1f5f9' }}>
        {currentTab === 'home' ? 'AI 爆文' : currentTab === 'write' ? '内容素材整理' : currentTab === 'templates' ? '智能模板' : currentTab === 'library' ? '文章库' : '生成记录'}
      </header>

      <main>
        {currentTab === 'home' && renderHome()}
        {currentTab === 'write' && renderWrite()}
        {currentTab === 'templates' && renderTemplates()}
        {currentTab === 'library' && renderLibrary()}
        {currentTab === 'history' && <div style={{ textAlign: 'center', padding: '50px', color: '#94a3b8' }}>暂无生成记录</div>}
      </main>

      {/* 底部导航栏 */}
      <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-around', padding: '8px 0 20px 0', maxWidth: '600px', margin: '0 auto', zIndex: 20 }}>
        {[
          { id: 'home', icon: '🏠', label: '首页' },
          { id: 'templates', icon: '🎛️', label: '智能模板' },
          { id: 'library', icon: '📖', label: '文章库', highlight: true },
          { id: 'history', icon: '🕒', label: '生成记录' },
          { id: 'write', icon: '👤', label: '我的' }
        ].map(tab => (
          <div key={tab.id} onClick={() => setCurrentTab(tab.id as any)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', top: tab.highlight ? '-20px' : '0', cursor: 'pointer' }}>
            <div style={{ 
              fontSize: '20px', 
              background: tab.highlight ? '#FF8C00' : 'transparent', 
              color: tab.highlight ? '#fff' : 'inherit',
              width: tab.highlight ? '50px' : 'auto', 
              height: tab.highlight ? '50px' : 'auto', 
              borderRadius: tab.highlight ? '50%' : '0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: tab.highlight ? '0 4px 12px rgba(255,140,0,0.4)' : 'none'
            }}>{tab.icon}</div>
            <div style={{ fontSize: '10px', color: currentTab === tab.id ? '#FF8C00' : '#94a3b8', marginTop: tab.highlight ? '-5px' : '4px' }}>{tab.label}</div>
          </div>
        ))}
      </nav>

      {/* 生成结果全屏弹窗 */}
      {showResultModal && (
        <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
            <div style={{ fontWeight: 'bold' }}>AI 生成结果</div>
            <div onClick={() => setShowResultModal(false)} style={{ color: '#FF8C00', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' }}>完成</div>
          </div>
          <div ref={resultRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', fontSize: '15px', lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-wrap' }}>
            {result || (loading && 'AI 正在思考中...')}
          </div>
          <div style={{ padding: '15px 20px', borderTop: '1px solid #f1f5f9', display: 'flex', gap: '10px' }}>
            <div onClick={() => { navigator.clipboard.writeText(result); alert('已复制'); }} style={{ flex: 1, padding: '12px', textAlign: 'center', background: '#f8fafc', borderRadius: '8px', fontSize: '14px', color: '#475569', cursor: 'pointer' }}>复制全文</div>
            <div onClick={() => { setInput(result); setShowResultModal(false); setCurrentTab('write'); }} style={{ flex: 1, padding: '12px', textAlign: 'center', background: '#FF8C00', color: '#fff', borderRadius: '8px', fontSize: '14px', cursor: 'pointer' }}>继续润色</div>
          </div>
        </div>
      )}
    </div>
  )
}
