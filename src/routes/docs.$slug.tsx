import { Link, createFileRoute, notFound } from '@tanstack/react-router'
import { DocBlocks } from '@/components/doc-blocks'
import { DocsSidebar } from '@/components/docs-sidebar'
import { DocsToc } from '@/components/docs-toc'
import { getDoc, getDocNeighbours, getHeadings } from '@/content/docs'

export const Route = createFileRoute('/docs/$slug')({
  loader: ({ params }) => {
    const doc = getDoc(params.slug)
    if (!doc) throw notFound()
    return { doc }
  },
  component: DocPage,
  head: ({ loaderData }) => ({
    meta: [
      { title: `${loaderData?.doc.title ?? '文档'} · Tailscale 中文` },
      { name: 'description', content: loaderData?.doc.description ?? '' },
    ],
  }),
})

function DocPage() {
  const { doc } = Route.useLoaderData()
  const { previous, next } = getDocNeighbours(doc.slug)
  const headings = getHeadings(doc)

  return (
    <div className="docs-shell">
      <DocsSidebar />

      <article className="doc">
        <div className="doc__crumb">
          <Link to="/docs">文档</Link>
          <span aria-hidden="true">/</span>
          <span>{doc.group}</span>
        </div>

        <h1 className="doc__title">{doc.title}</h1>
        <p className="doc__desc">{doc.description}</p>
        <div className="doc__meta">
          <span>约 {doc.minutes} 分钟</span>
          <span>整理自官方文档</span>
        </div>

        <div className="prose-doc" data-compact={doc.slug === 'faq' ? 'true' : undefined}>
          <DocBlocks blocks={doc.blocks} />
        </div>

        <nav className="doc-foot" aria-label="上一篇与下一篇">
          {previous ? (
            <Link
              to="/docs/$slug"
              params={{ slug: previous.slug }}
              className="doc-foot__link"
            >
              <span className="doc-foot__dir">上一篇</span>
              <span className="doc-foot__title">{previous.title}</span>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}

          {next ? (
            <Link
              to="/docs/$slug"
              params={{ slug: next.slug }}
              className="doc-foot__link doc-foot__link--next"
            >
              <span className="doc-foot__dir">下一篇</span>
              <span className="doc-foot__title">{next.title}</span>
            </Link>
          ) : (
            <span aria-hidden="true" />
          )}
        </nav>
      </article>

      <DocsToc items={headings} />
    </div>
  )
}
