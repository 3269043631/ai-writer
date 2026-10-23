'use client'
import { useState, useEffect, useRef } from 'react'

const CATS = ['微头条', '国际', '科技', '娱乐', '历史', '军事', '体育', '财经', '美食', '旅游', '社会', '科学', '法律', '热点']
const THEME_BLUE = '#144181'

export default function App() {
  const [activeTab, setActiveTab] = useState('library')
  const [selectedCat, setSelectedCat] = useState('微头条')
  const [articles, setArticles] = useState<any[]>([])
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [loading, setLoading] = useState(false)

  // 实时拉取全网真实热点并生成列表
  useEffect(() => {
    if (activeTab === 'library') {
      fetchData()
    }
  }, [activeTab, selectedCat])

  async function fetchData() {
    setLoading(true)
    try {
      // 获取真实的头条/微博实时热搜
      const res = await fetch('https://api.vvhan.com/api/hotlist/toutiao')
      const json = await res.json()
      
      if (json.success && json.data) {
        const list = json.data.map((item: any, index: number) => {
          // 补全截图中的数据字段（真实标题+模拟交互数据）
          const randomRead = Math.floor(Math.random() * 90000) + 10000
          const randomComment = Math.floor(Math.random() * 80) + 1
          const randomTime = `2026-10-23 ${String(Math.floor(Math.random() * 23)).padStart(2, '0')}:${String(Math.floor(Math.random() * 59)).padStart(2, '0')}:00`
          
          return {
            id: index,
            title: selectedCat === '微头条' ? item.title : `【${selectedCat}】${item.title}`,
            time: randomTime,
            read: randomRead,
            comment: randomComment,
            generated: Math.floor(Math.random() * 5)
          }
        })
        setArticles(list)
      }
    } catch (e) {
      // 接口崩溃时的备用数据
      setArticles([
        { id: 1, title: '突发！全网热点数据加载中...', time: '2026-10-23 12:00:00', read: 99999, comment: 88, generated: 12 },
        { id: 2, title: '接口请求超限，请稍后刷新重试', time: '2026-10-23 12:01:00', read: 52000, comment: 14, generated: 2 }
      ])
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
    } else {
      setSelectedIds([...selectedIds, id])
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', minHeight: '100vh', background: '#f5f5f5', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column' }}>
      
      {/* 顶部标题栏 */}
      <div style={{ padding: '15px', textAlign: 'center', fontSize: '18px', fontWeight: 'bold', background: '#fff', zIndex: 10 }}>
        {activeTab === 'library' ? '文章库' : 'AI 写作'}
      </div>

      {/* 文章库界面 */}
      {activeTab === 'library' && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          
          {/* 左侧深蓝分类栏 */}
          <div style={{ width: '90px', background: THEME_BLUE, overflowY: 'auto', color: '#fff' }}>
            {CATS.map(cat => (
              <div 
                key={cat} 
                onClick={() => setSelectedCat(cat)}
                style={{ 
                  padding: '18px 10px', 
                  textAlign: 'center', 
                  fontSize: '14px', 
                  cursor: 'pointer',
                  background: selectedCat === cat ? '#fff' : 'transparent',
                  color: selectedCat === cat ? THEME_BLUE : '#fff',
                  fontWeight: selectedCat === cat ? 'bold' : 'normal'
                }}
              >
                {cat}
              </div>
            ))}
          </div>

          {/* 右侧文章列表 */}
          <div style={{ flex: 1, padding: '15px', overflowY: 'auto', paddingBottom: '100px' }}>
            {loading ? (
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
                  {/* 选择圆圈 */}
                  <div 
                    onClick={() => toggleSelect(item.id)}
                    style={{ 
                      width: '24px', height: '24px', borderRadius: '50%', border: `2px solid ${THEME_BLUE}`, 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', cursor: 'pointer',
                      background: selectedIds.includes(item.id) ? THEME_BLUE : 'transparent'
                    }}
                  >
                    {selectedIds.includes(item.id) && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff' }} />}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 底部悬浮确认按钮 */}
      {activeTab === 'library' && (
        <div style={{ position: 'fixed', bottom: '70px', left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 20, pointerEvents: 'none' }}>
          <div 
            onClick={() => {
              if (selectedIds.length === 0) return alert('请先选择文章');
              alert(`已确认选择 ${selectedIds.length} 篇热点文章`);
            }}
            style={{ 
              background: THEME_BLUE, color: '#fff', padding: '12px 40px', borderRadius: '24px', fontSize: '15px', fontWeight: 'bold', 
              boxShadow: '0 4px 12px rgba(20,65,129,0.3)', pointerEvents: 'auto', cursor: 'pointer' 
            }}
          >
            确认选择 ({selectedIds.length})
          </div>
        </div>
      )}

      {/* 底部导航栏 */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', display: 'flex', justifyContent: 'space-around', padding: '10px 0', maxWidth: '600px', margin: '0 auto', zIndex: 30, borderTop: '1px solid #eee' }}>
        {[
          { id: 'home', label: '首页', icon: '🏠' },
          { id: 'templates', label: '智能模板', icon: '🎛️' },
          { id: 'works', label: '作品管理', icon: '📁' },
          { id: 'library', label: '文章库', icon: '📖' },
          { id: 'profile', label: '个人中心', icon: '👤' }
        ].map(tab => (
          <div key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: activeTab === tab.id ? THEME_BLUE : '#999', cursor: 'pointer' }}>
            <div style={{ fontSize: '20px' }}>{tab.icon}</div>
            <div style={{ fontSize: '11px', marginTop: '3px' }}>{tab.label}</div>
          </div>
        ))}
      </div>

    </div>
  )
}
