export const metadata = { title: 'AI 写作助手' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body
        style={{
          margin: 0,
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "PingFang SC", "Microsoft YaHei", sans-serif',
          background: '#f8fafc',
          color: '#0f172a',
        }}
      >
        {children}
      </body>
    </html>
  )
}
