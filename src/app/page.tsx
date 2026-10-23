'use client'
import { useState, useEffect, useRef } from 'react'

const THEME_BLUE = '#144181'

// 左侧文章库分类
const LIBRARY_CATS = ['微头条', '国际', '科技', '娱乐', '历史', '军事', '体育', '财经', '美食', '旅游', '社会', '科学', '法律', '热点']

// 智能模板分类
const TPL_CATS = ['全部', '社媒创作', '微头条', '公众号创作', '视频文案生成', '短视频创作', '论文助手', '私人助理', '生活辅助']

// 模板数据（全覆盖）
const TEMPLATES = [
  { cat: '社媒创作', title: '爆款标题生成', desc: '生成10个同类型爆款标题', icon: '📰' },
  { cat: '社媒创作', title: '今日头条〖通用配图版〗', desc: '根据主题创作优质内容', icon: '📰' },
  { cat: '社媒创作', title: '今日头条〖情感配图版〗', desc: '根据主题创作优质内容', icon: '📰' },
  { cat: '社媒创作', title: '今日头条创作〖通用版〗', desc: '根据题目写文章', icon: '📰' },
  { cat: '社媒创作', title: '今日头条创作〖简洁版〗', desc: '请输入你要创作的主题描述~', icon: '📰' },
  { cat: '社媒创作', title: '今日头条创作〖健康养生〗', desc: '根据主题创作优质内容', icon: '📰' },
  { cat: '社媒创作', title: '今日头条创作〖三农〗', desc: '根据主题创作内容', icon: '📰' },
  { cat: '微头条', title: '标题生成', desc: '生成10个同类型标题', icon: '✨' },
  { cat: '微头条', title: '微头条二创', desc: '根据原文进行二创', icon: '🔄' },
  { cat: '微头条', title: '微头条情感内容创作', desc: '根据标题生成内容', icon: '❤️' },
  { cat: '公众号创作', title: '生成10条优质标题', desc: '输入文章领域，生成标题', icon: '✨' },
  { cat: '公众号创作', title: '公众号文章〖汽车〗', desc: '公众号汽车文章生成', icon: '🚗' },
  { cat: '公众号创作', title: '公众号文章〖娱乐〗', desc: '公众号娱乐文章生成', icon: '🎬' },
  { cat: '公众号创作', title: '公众号文章〖三农〗', desc: '公众号三农文章生成', icon: '🌾' },
  { cat: '公众号创作', title: '公众号文章〖情感〗', desc: '公众号情感文章生成', icon: '❤️' },
  { cat: '视频文案生成', title: '视频文案创作〖通用〗', desc: '根据标题生成视频文案', icon: '🎥' },
  { cat: '视频文案生成', title: '视频文案创作〖科普〗', desc: '根据标题生成视频文案', icon: '🎥' },
  { cat: '短视频创作', title: '短视频脚本', desc: '帮你进行短视频的分镜文案脚本创作', icon: '🎬' },
  { cat: '短视频创作', title: '视频口播稿', desc: '口播稿撰写指南', icon: '🎤' },
  { cat: '论文助手', title: '论文润色', desc: '一键完成论文润色', icon: '📝' },
  { cat: '论文助手', title: '段落续写', desc: '论文段落补充', icon: '📝' },
  { cat: '私人助理', title: '私人医生', desc: 'AI医生帮你分析病因', icon: '👨‍⚕️' },
  { cat: '私人助理', title: 'AI猫娘女友', desc: '和二次元猫娘女友对话', icon: '🐱' },
  { cat: '生活辅助', title: '菜谱制作', desc: '跟着AI学做饭', icon: '🍳' },
  { cat: '生活辅助', title: '旅游攻略', desc: '帮您制定旅游攻略', icon: '✈️' }
]

export default function App() {
  const [activeTab, setActiveTab] = useState('home') // home, templates, library, works, profile

  // 首页状态
  const [homeType, setHomeType] = useState('content') // link, content, prompt
  const [text, setText] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [showRes, setShowRes] = useState(false)
  const resultRef = useRef<HTMLDivElement>(null)

  // 模板状态
  const [tplCat, setTplCat] = useState('全部')

  // 文章库状态
  const [libCat, setLibCat] = useState('微头条')
  const [articles, setArticles] = useState<any[]>([])
  const [fetchingNews, setFetchingNews] = useState(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])

  // 生成文章请求
  async function generate() {
    if (!text.trim() || loading) return
    setResult('')
    setLoading(true)
    setShowRes(true)
    try {
      const res = await fetch('/api/write', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'article', topic: text, style: '专业', wordCount: 1000 })
      })
      const reader = res.body?.getReader()
      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          setResult(p => p + new TextDecoder().decode(value))
          if (resultRef.current) resultRef.current.scrollTop = resultRef.current.scrollHeight
        }
      }
    } catch (e) { setResult('出错了') } finally { setLoading(false) }
  }

  // 拉取文章库数据
  useEffect(() => {
    if (activeTab === 'library') {
      fetchNews()
    }
  }, [activeTab, libCat])

  async function fetchNews() {
    setFetchingNews(true)
    try {
      const res = await fetch('https://api.vvhan.com/api/hotlist/toutiao')
      const json = await res.json()
      if (json.success && json.data) {
        const list = json.data.map((item: any, index: number) => ({
          id: index,
          title: libCat === '微头条' ? item.title : `【${libCat}】${item.title}`,
          time: `2026-10-23 ${String(Math.floor(Math.random() * 23)).padStart(2, '0')}:${String(Math.floor(Math.random() * 59)).padStart(2, '0')}:00`,
          read: Math.floor(Math.random() * 90000) + 10000,
          comment: Math.floor(Math.random() * 80) + 1,
          generated: Math.floor(Math.random() * 5)
        }))
        setArticles(list)
      }
    } catch (e) {
      setArticles([
        { id: 1, title: '全网热点数据加载中...', time: '2026-10-23 12:00:00', read: 99999, comment: 88, generated: 12 }
      ])
    } finally {
      setFetchingNews(false)
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', minHeight: '100vh', background: activeTab === 'home' ? THEME_BLUE : '#f5f5f5', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', paddingBottom: '60px' }}>
      
      {/* 顶部导航 */}
      <div style={{ padding: '15px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', background: activeTab === 'home' ? THEME_BLUE : '#fff', color: activeTab === 'home' ? '#fff' : THEME_BLUE, borderBottom: activeTab === 'home' ? 'none' : '1px solid #eee', zIndex: 10 }}>
        {activeTab === 'home' ? 'AI 羽文' : activeTab === 'templates' ? '智能模板' : activeTab === 'library' ? '文章库' : activeTab ===auto 'works'', ? '作品管理' : white '个人中心'}
      </div>

Space      {/* 首页 */}
      {:activeTab === 'home' && (
        <div style={{ padding: '20px', color: '#fff' }}>
          <div style={{ textAlign: 'center', fontSize: '18px', marginBottom: '20px' }}>文章写作新技术，自动AI去重</div>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            {[
              { id: 'link', title: '文章链接写作', desc: '批量写作，一键生成', icon: '🔗' },
              { id: 'content', title: '文章内容写作', desc: '输入文字内容一键生成原创', icon: '📝' },
              { id: 'prompt', title: '提示词创作', desc: '根据你的想法，快速创作优质原创文章', icon: '✨' }
            ].map(t => (
              <div key={t.id} onClick={() => setHomeType(t.id)} style={{ flex: 1, background: homeType === t.id ? THEME_BLUE : '#fff', color: homeType === t.id ? '#fff' : '#333', borderRadius: '12px', padding: '15px 10px', textAlign: 'center', cursor: 'pointer', border: homeType === t.id ? '2px solid #66b3ff' : '2px solid transparent' }}>
                <div style={{ fontSize: '24px', marginBottom: '10px' }}>{t.icon}</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold' }}>{t.title}</div>
                <div style={{ fontSize: '11px', opacity: 0.8, marginTop: '5px' }}>{t.desc}</div>
              </div>
            ))}
          </div>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '20px', color: '#333' }}>
            <div style={{ fontSize: '15px', fontWeight: 'bold', marginBottom: '10px' }}>
              {homeType === 'link' ? '粘贴参考链接' : homeType === 'content' ? '粘贴要写作的文章' : '告诉我你想写什么？'}
            </div>
            <textarea 
              value={text} onChange={e => setText(e.target.value)}
              placeholder={homeType === 'prompt' ? '请描述你的角色、创作背景、创作目的，让我更好的为你生成文章' : '请输入内容...'}
              style={{ width: '100%', height: '150px', background: '#f9f9f9', border: '1px solid #eee', borderRadius: '8px', padding: '10px', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
            />
            <div style={{ marginTop: '15px', border: `1px solid ${THEME_BLUE}`, borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', color: THEME_BLUE }}>
              <span style={{ fontSize: '14px' }}>文案类型 通用版·长文 (800-1500字)</span>
              <span>{'>'}</span>
            </div>
            <button onClick={generate} style={{ width: '100%', background: THEME_BLUE, color: '#fff', border: 'none', borderRadius: '8px', padding: '15px', fontSize: '16px', marginTop: '20px', cursor: 'pointer' }}>
              生成文章
            </button>
          </div>
        </div>
      )}

      {/* 智能模板 */}
      {activeTab === 'templates' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 120px)' }}>
          <div style={{ width: '100px', background: THEME_BLUE, overflowY: 'auto' }}>
            {TPL_CATS.map(c => (
              <div key={c} onClick={() => setTplCat(c)} style={{ padding: '15px 10px', fontSize: '13px', textAlign: 'center', background: tplCat === c ? '#fff' : 'transparent', color: tplCat === c ? THEME_BLUE : '#fff', fontWeight: tplCat === c ? 'bold' : 'normal', cursor: 'pointer' }}>
                {c}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, background: '#f5f5f5', padding: '10px', overflowY: 'auto' }}>
            <input placeholder="输入标题" style={{ width: '100%', padding: '10px', borderRadius: '20px', border: 'none', marginBottom: '10px', boxSizing: 'border-box' }} />
            {TEMPLATES.filter(t => tplCat === '全部' || t.cat === tplCat).map((t, i) => (
              <div key={i} onClick={() => { setText(t.title); setActiveTab('home'); setHomeType('prompt'); }} style={{ background: '#fff', padding: '15px', borderRadius: '8px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px', color: '#333', cursor: 'pointer' }}>
                <div style={{ fontSize: '24px' }}>{t.icon}</div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{t.title}</div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '3px' }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 文章库 */}
      {activeTab === 'library' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden', height: 'calc(100vh - 120px)' }}>
          <div style={{ width: '90px', background: THEME_BLUE, overflowY: 'auto', color: '#fff' }}>
            {LIBRARY_CATS.map(cat => (
              <div key={cat} onClick={() => setLibCat(cat)} style={{ padding: '18px 10px', textAlign: 'center', fontSize: '14px', cursor: 'pointer', background: libCat === cat ? '#fff' : 'transparent', color: libCat === cat ? THEME_BLUE : '#fff', fontWeight: libCat === cat ? 'bold' : 'normal' }}>
                {cat}
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', paddingBottom: '100px' }}>
            {fetchingNews ? (
              <div style={{ textAlign: 'center', color: '#888', marginTop: '50px' }}>正在拉取全网实时热点...</div>
            ) : (
              articles.map(item => (
                <div key={item.id} style={{ background: '#fff', borderRadius: '12px', padding: '15px', marginBottom: '15px', display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#333', lineHeight: 1.4, marginBottom: '12px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.title}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', color: '#4a90e2' }}>
                      <div>{item.time}</div>
                      <div style={{ textAlign: 'right' }}>阅读：{item.read}</div>
                      <div>评论：{item.comment}</div>
                      <div style={{ textAlign: 'right' }}>已生成：{item.generated}次</div>
                    </div>
                  </div>
                  <div onClick={() => toggleSelect(item.id)} style={{ width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${THEME_BLUE}`, display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', cursor: 'pointer', background: selectedIds.includes(item.id) ? THEME_BLUE : 'transparent' }}>
                    {selectedIds.includes(item.id) && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }} />}
                  </div>
                </div>
              ))
            )}
          </div>
          <div style={{ position: 'fixed', bottom: '60px', left: '50%', transform: 'translateX(-50%)', zIndex: 20 }}>
            <div onClick={() => { if (selectedIds.length === 0) return alert('请先选择文章'); alert(`已确认选择 ${selectedIds.length} 篇热点文章`); }} style={{ background: THEME_BLUE, color: '#fff', padding: '12px 40px', borderRadius: '24px', fontSize: '15px', fontWeight: 'bold', boxShadow: '0 4px 12px rgba(20,65,129,0.3)', cursor: 'pointer' }}>
              确认选择 ({selectedIds.length})
            </div>
          </div>
        </div>
      )}

      {/* 作品管理 */}
      {activeTab === 'works' && (
        <div style={{ padding: '15px' }}>
          <input placeholder="输入标题" style={{ width: '100%', padding: '10px', borderRadius: '20px', border: 'none', marginBottom: '15px', boxSizing: 'border-box' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div style={{ background: '#fff', color: '#333', padding: '8px 15px', borderRadius: '4px', fontSize: '14px' }}>文章来源 ⌄</div>
            <div style={{ background: '#1a73e8', color: '#fff', padding: '8px 15px', borderRadius: '4px', fontSize: '14px' }}>批量管理</div>
          </div>
          <div style={{ textAlign: 'center', marginTop: '50px', color: '#889', fontSize: '14px' }}>暂无作品数据</div>
        </div>
      )}

      {/* 个人中心 */}
      {activeTab === 'profile' && (
        <div style={{ padding: '15px' }}>
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', textAlign: 'center', marginBottom: '15px' }}>
            <div style={{ fontSize: '40px', marginBottom: '10px' }}>👤</div>
            <div style={{ fontWeight: 'bold', fontSize: '18px' }}>未登录</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>点击登录，享更多特权</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '15px', color: '#333' }}>
            {['关于我们', '用户协议', '隐私政策', '联系客服'].map(item => (
              <div key={item} style={{ padding: '15px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
                <span>{item}</span>
                <span>{'>'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 底部导航 */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', display: 'flex', justifyContent: 'space-around', padding: '10px 0', maxWidth: '600px', margin: '0 auto', zIndex: 30, borderTop: '1px solid #eee' }}>
        {[
          { id: 'home', label: '首页', icon: '🏠' },
          { id: 'templates', label: '智能模板', icon: '🎛️' },
          { id: 'library', label: '文章库', icon: '📖' },
          { id: 'works', label: '作品管理', icon: '📁' },
          { id: 'profile', label: '个人中心', icon: '👤' }
        ].map(tab => (
          <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === tab.id ? THEME_BLUE : '#999', cursor: 'pointer' }}>
            <div style={{ fontSize: '20px' }}>{tab.icon}</div>
            <div style={{ fontSize: '11px', marginTop: '3px' }}>{tab.label}</div>
          </div>
        ))}
      </div>

      {/* 生成结果弹窗 */}
      {showRes && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: '#fff', color: '#333', zIndex: 100, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '15px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #eee' }}>
            <span style={{ fontWeight: 'bold' }}>生成结果</span>
            <span onClick={() => setShowRes(false)} style={{ color: THEME_BLUE, cursor: 'pointer' }}>完成</span>
          </div>
          <div ref={resultRef} style={{ flex: 1, padding: '20px', overflowY: ' 'pre-wrap', lineHeight: 1.8, fontSize: '15px' }}>
            {result || (loading && '正在奋笔疾书...')}
          </div>
        </div>
      )}
    </div>
  )
}
