/**
 * README.md 의 작품 목록(<!-- works:start --> ~ <!-- works:end -->)을 series.json 으로 다시 쓴다.
 * build.mjs 가 부른다 — 새 작품을 넣고 빌드하면 README 도 같이 바뀌니, 바뀐 README 를 함께 커밋한다.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { groupWorks } from './groups.mjs';

export function updateReadme(works) {
  if (!existsSync('README.md')) return;
  const src = readFileSync('README.md', 'utf8');
  const a = '<!-- works:start -->', b = '<!-- works:end -->';
  if (!src.includes(a) || !src.includes(b)) return;
  const row = (w) => `| <img src="${w.icon}" width="44" height="44" alt=""> | **[${w.title}](${w.url})**${w.urlEn ? ` · [EN](${w.urlEn})` : ''} | ${w.desc} |`;
  const body = groupWorks(works)
    .map(({ g, ws }) => `### ${g.ko} · ${g.en} (${ws.length})\n\n| | 작품 | 한 줄 소개 |\n|---|---|---|\n${ws.map(row).join('\n')}`)
    .join('\n\n');
  const nEn = works.filter((w) => w.urlEn).length;
  let out = src.slice(0, src.indexOf(a) + a.length) + `\n\n${body}\n\n` + src.slice(src.indexOf(b));
  out = out.replace(/<!-- n -->.*?<!-- \/n -->/g, `<!-- n -->${works.length}<!-- /n -->`).replace(/<!-- nEn -->.*?<!-- \/nEn -->/g, `<!-- nEn -->${nEn}<!-- /nEn -->`);
  if (out !== src) writeFileSync('README.md', out);
}
