import type { Block } from '@/content/docs'
import { CodeBlock } from '@/components/code-block'
import { RichText } from '@/components/rich-text'

export function DocBlocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, index) => {
        switch (block.kind) {
          case 'h2':
            return (
              <h2 key={index} id={block.id}>
                <a className="heading-link" href={`#${block.id}`}>
                  {block.text}
                </a>
              </h2>
            )
          case 'h3':
            return (
              <h3 key={index} id={block.id}>
                <a className="heading-link" href={`#${block.id}`}>
                  {block.text}
                </a>
              </h3>
            )
          case 'p':
            return (
              <p key={index}>
                <RichText text={block.text} />
              </p>
            )
          case 'list':
            return block.ordered ? (
              <ol key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <RichText text={item} />
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={index}>
                {block.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <RichText text={item} />
                  </li>
                ))}
              </ul>
            )
          case 'code':
            return <CodeBlock key={index} code={block.code} label={block.label} />
          case 'note':
            return (
              <aside className="callout" key={index} data-tone={block.tone}>
                <div className="callout__bar" />
                <div>
                  <div className="callout__title">{block.title}</div>
                  <p className="callout__text">
                    <RichText text={block.text} />
                  </p>
                </div>
              </aside>
            )
          case 'table':
            return (
              <div className="table-wrap" key={index}>
                <table>
                  <thead>
                    <tr>
                      {block.head.map((cell) => (
                        <th key={cell}>{cell}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td key={cellIndex}>
                            <RichText text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          case 'steps':
            return (
              <ol className="steps" key={index}>
                {block.items.map((item, itemIndex) => (
                  <li className="steps__item" key={itemIndex}>
                    <p className="steps__title">
                      <span className="steps__num">{String(itemIndex + 1).padStart(2, '0')}</span>
                      <span>
                        <RichText text={item.title} />
                      </span>
                    </p>
                    <p className="steps__text">
                      <RichText text={item.text} />
                    </p>
                    {item.code && <CodeBlock code={item.code.code} label={item.code.label} />}
                  </li>
                ))}
              </ol>
            )
          default:
            return null
        }
      })}
    </>
  )
}
