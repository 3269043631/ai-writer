
"use client";

import { useState } from "react";

const templates = [
  { icon: "📖", title: "故事创作", desc: "家庭故事、情感故事、职场故事", type: "故事创作" },
  { icon: "🔥", title: "微头条", desc: "爆款开头、情节反转、情绪共鸣", type: "微头条" },
  { icon: "🔄", title: "文章改写", desc: "输入原文，重新组织表达", type: "文章改写" },
  { icon: "💡", title: "原创提示词", desc: "将你的想法变成创作指令", type: "原创提示词" },
  { icon: "📰", title: "文章创作", desc: "根据主题快速生成文章", type: "文章创作" },
  { icon: "✨", title: "标题生成", desc: "生成吸引读者的标题", type: "标题生成" },
];

export default function Home() {
  const [page, setPage] = useState("智能模板");
  const [type, setType] = useState("故事创作");
  const [topic, setTopic] = useState("");
  const [source, setSource] = useState("");
  const [style, setStyle] = useState("真实生活风");
  const [length, setLength] = useState("1500字");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [works, setWorks] = useState<string[]>([]);

  async function generate() {
    if (!topic.trim() && !source.trim()) {
      alert("请先输入创作主题或原文");
      return;
    }

    setLoading(true);
    setResult("");

    const prompt = `你是一名专业中文自媒体写作专家。
任务类型：${type}
创作主题：${topic || "根据提供的原文进行处理"}
写作风格：${style}
目标长度：${length}
原文内容：${source}
要求：中文输出，结构清晰，内容具体，避免空话。直接输出成品。`;

    try {
      const response = await fetch("/api/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, topic, source, type, style, length }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "生成失败，请检查 API 配置");
      }

      const text =
        data.content ||
        data.result ||
        data.text ||
        data.output ||
        data.choices?.[0]?.message?.content;

      if (!text) throw new Error("接口没有返回文章内容，请检查 API 接口格式");
      setResult(text);
    } catch (error) {
      setResult(
        "暂时无法生成内容。\n\n请检查项目是否已配置 DeepSeek API 密钥，以及 /api/write 接口是否正常。\n\n详细信息：" +
          (error instanceof Error ? error.message : "未知错误")
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert("复制成功");
    } catch {
      alert("复制失败，请长按文字手动复制");
    }
  }

  function saveWork() {
    if (!result) return;
    const next = [result, ...works];
    setWorks(next);
    try {
      localStorage.setItem("ai-writer-works", JSON.stringify(next));
    } catch {}
    alert("已保存作品");
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] pb-24 text-slate-800">
      <header className="bg-gradient-to-r from-violet-700 to-indigo-600 px-5 pb-7 pt-7 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-extrabold tracking-wide">AI 羽文</div>
              <div className="mt-1 text-xs text-violet-100">
                智能创作 · 灵感随时生成
              </div>
            </div>
            <div className="rounded-full border border-white/30 bg-white/15 px-3 py-2 text-xs">
              AI 创作助手
            </div>
          </div>

          <div className="mt-7 rounded-2xl bg-white/10 p-4">
            <div className="text-lg font-bold">让创作更简单</div>
            <p className="mt-2 text-sm leading-6 text-violet-100">
              选择智能模板，输入你的想法，快速开始创作。
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4">
        <section className="-mt-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-xl font-bold text-violet-700">AI</div>
              <div className="mt-1 text-xs text-slate-500">智能辅助创作</div>
            </div>
            <div>
              <div className="text-xl font-bold text-violet-700">多种</div>
              <div className="mt-1 text-xs text-slate-500">创作模板</div>
            </div>
            <div>
              <div className="text-xl font-bold text-violet-700">快捷</div>
              <div className="mt-1 text-xs text-slate-500">生成与复制</div>
            </div>
          </div>
        </section>

        {page === "作品管理" ? (
          <section className="mt-5 rounded-2xl bg-white p-4">
            <h2 className="text-lg font-bold">作品管理</h2>
            <p className="mt-1 text-sm text-slate-500">本次访问保存的作品</p>
            {works.length === 0 ? (
              <div className="py-12 text-center text-sm text-slate-400">
                暂无作品，创作完成后可以保存
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {works.map((work, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 p-3">
                    <p className="whitespace-pre-wrap text-sm">{work}</p>
                    <button
                      onClick={() => copyText(work)}
                      className="mt-3 rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-700"
                    >
                      复制作品
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        ) : page === "个人中心" ? (
          <section className="mt-5 rounded-2xl bg-white p-5">
            <h2 className="text-lg font-bold">个人中心</h2>
            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <div className="font-medium">我的创作空间</div>
              <p className="mt-2 text-sm text-slate-500">
                当前为基础版页面，登录、会员与额度功能需要另外接入。
              </p>
            </div>
            <button
              onClick={() => setPage("智能模板")}
              className="mt-4 w-full rounded-xl bg-violet-600 py-3 text-white"
            >
              开始创作
            </button>
          </section>
        ) : (
          <>
            <section className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-lg font-bold">智能模板</h2>
                <span className="text-xs text-slate-400">选择模板开始创作</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {templates.map((item) => (
                  <button
                    key={item.title}
                    onClick={() => {
                      setType(item.type);
                      setPage("智能模板");
                      document.getElementById("editor")?.scrollIntoView({
                        behavior: "smooth",
                      });
                    }}
                    className={`rounded-2xl border bg-white p-4 text-left transition ${
                      type === item.type
                        ? "border-violet-400 ring-1 ring-violet-200"
                        : "border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="font-bold">{item.title}</span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {item.desc}
                    </p>
                    <div className="mt-3 text-xs font-medium text-violet-600">
                      选择模板 →
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section id="editor" className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="text-lg font-bold">智能创作</h2>
              <p className="mt-1 text-sm text-slate-500">
                填写要求，生成属于你的内容
              </p>

              <label className="mb-2 mt-5 block text-sm font-semibold">
                创作类型
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none focus:border-violet-500"
              >
                {templates.map((item) => (
                  <option key={item.type} value={item.type}>
                    {item.type}
                  </option>
                ))}
              </select>

              <label className="mb-2 mt-4 block text-sm font-semibold">
                创作主题 / 要求
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="例如：写一个拆迁家庭故事，开头有冲突，中间有反转，结尾令人感慨……"
                rows={4}
                className="w-full resize-y rounded-xl border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-violet-500"
              />

              <label className="mb-2 mt-4 block text-sm font-semibold">
                原文内容（改写时填写）
              </label>
              <textarea
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="把需要改写或续写的原文粘贴到这里……"
                rows={4}
                maxLength={10000}
                className="w-full resize-y rounded-xl border border-slate-200 p-3 text-sm leading-6 outline-none focus:border-violet-500"
              />
              <div className="text-right text-xs text-slate-400">
                {source.length}/10000
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    语言风格
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                  >
                    <option>真实生活风</option>
                    <option>情感共鸣风</option>
                    <option>悬念反转风</option>
                    <option>幽默轻松风</option>
                    <option>专业正式风</option>
                    <option>口语化表达</option>
                  </select>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    目标长度
                  </label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                  >
                    <option>300字</option>
                    <option>800字</option>
                    <option>1500字</option>
                    <option>2500字</option>
                    <option>3000字</option>
                  </select>
                </div>
              </div>

              <button
                onClick={generate}
                disabled={loading}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-violet-700 to-indigo-600 py-3.5 font-bold text-white shadow-md disabled:opacity-60"
              >
                {loading ? "正在生成，请稍候…" : "✨ 开始生成"}
              </button>

              {result && (
                <div className="mt-6 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold">生成结果</h3>
                    <span className="text-xs text-slate-400">
                      {result.length} 字符
                    </span>
                  </div>
                  <textarea
                    value={result}
                    onChange={(e) => setResult(e.target.value)}
                    rows={12}
                    className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm leading-7"
                  />
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => copyText(result)}
                      className="rounded-xl border border-violet-200 bg-white py-3 text-sm font-semibold text-violet-700"
                    >
                      复制内容
                    </button>
                    <button
                      onClick={saveWork}
                      className="rounded-xl bg-violet-600 py-3 text-sm font-semibold text-white"
                    >
                      保存作品
                    </button>
                  </div>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto grid max-w-5xl grid-cols-4">
          {navItems.map((item, i) => (
            <button
              key={item}
              onClick={() => setPage(item)}
              className={`flex flex-col items-center gap-1 py-3 text-xs ${
                page === item
                  ? "font-bold text-violet-700"
                  : "text-slate-500"
              }`}
            >
              <span className="text-lg">
                {["⌂", "▦", "▤", "♙"][i]}
              </span>
              {item}
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
