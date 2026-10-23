
"use client";

import { useState } from "react";

type Template = {
  icon: string;
  title: string;
  desc: string;
  type: string;
};

const navItems: string[] = ["首页", "智能模板", "作品管理", "个人中心"];

const templates: Template[] = [
  { icon: "📖", title: "故事创作", desc: "家庭、情感、职场、民间故事", type: "故事创作" },
  { icon: "🔥", title: "微头条", desc: "吸引人的开头与情节反转", type: "微头条" },
  { icon: "🔄", title: "文章改写", desc: "输入原文，重新组织表达", type: "文章改写" },
  { icon: "💡", title: "原创提示词", desc: "把创作思路变成完整指令", type: "原创提示词" },
  { icon: "📰", title: "文章创作", desc: "根据主题快速创作文章", type: "文章创作" },
  { icon: "✨", title: "标题生成", desc: "生成吸引读者的标题", type: "标题生成" },
];

type ApiResult = {
  content?: string;
  result?: string;
  text?: string;
  output?: string;
  error?: string;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export default function Home() {
  const [page, setPage] = useState<string>("智能模板");
  const [type, setType] = useState<string>("故事创作");
  const [topic, setTopic] = useState<string>("");
  const [source, setSource] = useState<string>("");
  const [style, setStyle] = useState<string>("真实生活风");
  const [length, setLength] = useState<string>("1500字");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [works, setWorks] = useState<string[]>([]);

  async function generate(): Promise<void> {
    if (!topic.trim() && !source.trim()) {
      alert("请先输入创作主题或原文");
      return;
    }

    setLoading(true);
    setResult("");

    const prompt = [
      "你是一名专业的中文自媒体写作专家。",
      `任务类型：${type}`,
      `创作主题：${topic || "根据提供的原文进行处理"}`,
      `语言风格：${style}`,
      `目标长度：${length}`,
      `原文内容：${source}`,
      "请用中文直接输出完整成品，内容具体，结构清晰。",
    ].join("\n");

    try {
      const response = await fetch("/api/write", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          topic,
          source,
          type,
          style,
          length,
        }),
      });

      const data: ApiResult = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `请求失败：${response.status}`);
      }

      const content =
        data.content ||
        data.result ||
        data.text ||
        data.output ||
        data.choices?.[0]?.message?.content ||
        "";

      if (!content) {
        throw new Error("接口没有返回文章内容，请检查 /api/write 接口");
      }

      setResult(content);
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "未知错误";
      setResult(
        `生成失败：${message}\n\n请检查 DeepSeek API 密钥和 /api/write 接口配置。`
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyText(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      alert("复制成功");
    } catch {
      alert("自动复制失败，请长按文字手动复制");
    }
  }

  function saveWork(): void {
    if (!result.trim()) {
      alert("没有可保存的内容");
      return;
    }

    const next = [result, ...works];
    setWorks(next);

    try {
      localStorage.setItem("ai-writer-works", JSON.stringify(next));
    } catch {
      // 即使浏览器存储不可用，本次页面仍保留作品
    }

    alert("作品已保存");
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24 text-slate-800">
      <header className="bg-gradient-to-r from-violet-700 to-indigo-600 px-5 pb-8 pt-7 text-white">
        <div className="mx-auto max-w-5xl">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-extrabold">AI 羽文</h1>
              <p className="mt-1 text-xs text-violet-100">
                智能创作 · 灵感随时生成
              </p>
            </div>
            <span className="rounded-full bg-white/15 px-3 py-2 text-xs">
              AI 创作助手
            </span>
          </div>

          <div className="mt-7 rounded-2xl bg-white/10 p-4">
            <h2 className="text-lg font-bold">让创作更简单</h2>
            <p className="mt-2 text-sm leading-6 text-violet-100">
              选择智能模板，输入你的想法，快速开始创作。
            </p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4">
        <section className="-mt-3 grid grid-cols-3 rounded-2xl bg-white p-4 text-center shadow-sm">
          <div>
            <div className="text-xl font-bold text-violet-700">AI</div>
            <div className="mt-1 text-xs text-slate-500">智能辅助</div>
          </div>
          <div>
            <div className="text-xl font-bold text-violet-700">多种</div>
            <div className="mt-1 text-xs text-slate-500">创作模板</div>
          </div>
          <div>
            <div className="text-xl font-bold text-violet-700">快捷</div>
            <div className="mt-1 text-xs text-slate-500">生成与复制</div>
          </div>
        </section>

        {page === "作品管理" ? (
          <section className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold">作品管理</h2>
            {works.length === 0 ? (
              <p className="py-12 text-center text-sm text-slate-400">
                暂无作品，创作完成后可以保存
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {works.map((work: string, index: number) => (
                  <article
                    key={`${index}-${work.slice(0, 16)}`}
                    className="rounded-xl border border-slate-100 p-3"
                  >
                    <p className="whitespace-pre-wrap text-sm">{work}</p>
                    <button
                      onClick={() => void copyText(work)}
                      className="mt-3 rounded-lg bg-violet-50 px-3 py-2 text-sm text-violet-700"
                    >
                      复制作品
                    </button>
                  </article>
                ))}
              </div>
            )}
          </section>
        ) : page === "个人中心" ? (
          <section className="mt-5 rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold">个人中心</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              欢迎使用 AI 羽文。登录、会员和额度功能需要另外接入。
            </p>
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
                <span className="text-xs text-slate-400">
                  选择模板开始创作
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {templates.map((item: Template) => (
                  <button
                    key={item.type}
                    onClick={() => setType(item.type)}
                    className={`rounded-2xl border bg-white p-4 text-left ${
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

            <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
              <h2 className="text-lg font-bold">智能创作</h2>
              <p className="mt-1 text-sm text-slate-500">
                填写要求，生成属于你的内容
              </p>

              <label className="mb-2 mt-5 block text-sm font-semibold">
                创作类型
              </label>
              <select
                value={type}
                onChange={(event) => setType(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
              >
                {templates.map((item: Template) => (
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
                onChange={(event) => setTopic(event.target.value)}
                placeholder="例如：写一个家庭故事，开头有冲突，中间有反转，结尾令人感慨……"
                rows={4}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm leading-6"
              />

              <label className="mb-2 mt-4 block text-sm font-semibold">
                原文内容（改写时填写）
              </label>
              <textarea
                value={source}
                onChange={(event) => setSource(event.target.value)}
                placeholder="粘贴需要改写或续写的原文……"
                rows={4}
                maxLength={10000}
                className="w-full rounded-xl border border-slate-200 p-3 text-sm leading-6"
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
                    onChange={(event) => setStyle(event.target.value)}
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
                    onChange={(event) => setLength(event.target.value)}
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
                onClick={() => void generate()}
                disabled={loading}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-violet-700 to-indigo-600 py-3.5 font-bold text-white disabled:opacity-60"
              >
                {loading ? "正在生成，请稍候…" : "✨ 开始生成"}
              </button>

              {result && (
                <div className="mt-6 rounded-xl border border-violet-100 bg-violet-50/50 p-4">
                  <h3 className="font-bold">生成结果</h3>
                  <textarea
                    value={result}
                    onChange={(event) => setResult(event.target.value)}
                    rows={12}
                    className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm leading-7"
                  />
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => void copyText(result)}
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
          {navItems.map((item: string, index: number) => (
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
                {["⌂", "▦", "▤", "♙"][index]}
              </span>
              {item}
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
