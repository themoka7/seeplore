/**
 * 영어판 허브: /en (첫 페이지), /en/about (소개), /en/team (가상의 회사).
 * 영어판이 있는 작품(series.json 의 urlEn)만 영어 제목·설명(titleEn·descEn)으로 싣는다 — 영어판 안에서는 한국어가 나오지 않는다
 * (스킬 series-web-doc: 한국어로 넘어가는 곳은 '한국어' 전환 링크 하나뿐). 영어판이 없는 작품은 싣지 않는다.
 * 한국어 문장을 고치면 여기 영어 문장도 함께 맞춘다(같은 내용, 숫자는 계산).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { groupWorks } from './groups.mjs';

const FIELD_EN = {
  역사: 'History', 우주: 'Space', 지구: 'Earth', 물리: 'Physics', 'AI·컴퓨터': 'AI & Computers', 공학: 'Engineering',
  '사회·경제': 'Society & Economy', '생명·건강': 'Life & Health', 생명: 'Life', 건강: 'Health', '일상·마음·건강': 'Everyday Life, Mind & Health', 체험: 'Experiences', '그 밖의 주제': 'Other topics',
};

export function buildEn({ works: all, esc, SITE, BLOG, teamHtml }) {
  const BLOG_EN = `${BLOG}en/`;
  const works = all.filter((w) => w.urlEn);
  const n = works.length;
  const href = (w) => w.urlEn;
  const host = (u) => new URL(u).host + new URL(u).pathname.replace(/\/$/, '');

  const WHAT = 'A free educational web documentary series that explains how science and history work, scene by scene on maps and in 3D, with voice narration. Written so a middle-school student can follow it alone.';
  const DESC = `Free web documentaries that explain science on maps and in 3D, with narration. ${n} titles in English so far, more on the way.`;
  const GA = `<script async src="https://www.googletagmanager.com/gtag/js?id=G-TBYJ6JBLYF"></script>
<script>window.dataLayer=window.dataLayer||[];if(/^(localhost|127\\.|192\\.168\\.)/.test(location.hostname))window['ga-disable-G-TBYJ6JBLYF']=true;function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-TBYJ6JBLYF',{content_group:'hub-en'});</script>`;
  const head = ({ title, desc, path, ko: koPath, ld }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
${GA}
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#050608">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${path}">
<link rel="alternate" hreflang="ko" href="${SITE}${koPath}">
<link rel="alternate" hreflang="en" href="${SITE}${path}">
<link rel="alternate" hreflang="x-default" href="${SITE}${koPath}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="seeplore">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:locale" content="en_US">
<meta property="og:locale:alternate" content="ko_KR">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<script type="application/ld+json">${JSON.stringify(ld)}</script>`;
  const BASE_CSS = `:root { --bg: #050608; --text: #f3f5f7; --muted: #9aa3ab; --border: rgba(255,255,255,.12); color-scheme: dark;
  font-family: 'Pretendard', 'Noto Sans KR', system-ui, -apple-system, sans-serif; color: var(--text); }
* { box-sizing: border-box; }
html, body { margin: 0; background: var(--bg); -webkit-text-size-adjust: 100%; }
a { color: var(--text); }`;

  // ---- /en ----
  const card = (w, i) => `
      <li>
        <a class="work" href="${esc(href(w))}">
          <img src="${esc(w.icon.replace(SITE, ''))}" alt="" width="72" height="72" ${i > 3 ? 'loading="lazy"' : ''}>
          <span class="txt">
            <b>${esc(w.titleEn)}</b>
            <span class="desc">${esc(w.descEn)}</span>
            <span class="host">${esc(host(href(w)))}</span>
          </span>
        </a>
      </li>`;
  const groups = groupWorks(works);
  let ci = 0;
  const sections = groups
    .map(({ g, ws }) => `
  <section class="grp" id="${g.key}" aria-labelledby="h-${g.key}">
    <h2 id="h-${g.key}">${esc(g.en)}<small>${ws.length}</small></h2>
    <p>${esc(g.introEn)}</p>
    <ul>${ws.map((w) => card(w, ci++)).join('')}
    </ul>
  </section>`)
    .join('');
  const jump = `<nav class="jump" aria-label="Subjects">${groups.map(({ g, ws }) => `<a href="#${g.key}">${esc(g.en)}<small>${ws.length}</small></a>`).join('')}</nav>`;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'seeplore — web documentaries you explore',
    url: `${SITE}/en`,
    inLanguage: 'en',
    description: WHAT,
    isPartOf: { '@id': `${SITE}/#site` },
    mainEntity: {
      '@type': 'CreativeWorkSeries',
      '@id': `${SITE}/#series`,
      name: 'seeplore',
      hasPart: works.map((w, i) => ({ '@type': 'CreativeWork', position: i + 1, name: w.titleEn, url: href(w), description: w.descEn, inLanguage: 'en', isAccessibleForFree: true })),
    },
  };
  const index = `${head({ title: 'seeplore | Web documentaries on maps and in 3D', desc: DESC, path: '/en', ko: '/', ld })}
<style>
${BASE_CSS}
main { width: min(100% - 32px, 720px); margin: 0 auto; padding: calc(env(safe-area-inset-top, 0px) + 56px) 0 64px; }
.top { display: flex; justify-content: flex-end; font-size: 13px; } .top a { color: var(--muted); text-decoration: none; }
.kicker { margin: 0; font-size: 15px; font-weight: 600; color: var(--muted); }
h1 { margin: 10px 0 0; font-size: clamp(48px, 13vw, 84px); line-height: 1; font-weight: 900; letter-spacing: -0.05em; }
.lead { margin: 18px 0 0; font-size: 16px; line-height: 1.7; color: #c9d0d6; }
.note { margin: 12px 0 0; font-size: 14px; line-height: 1.6; color: var(--muted); }
ul { list-style: none; margin: 40px 0 0; padding: 0; display: grid; gap: 10px; }
.work { display: flex; gap: 16px; align-items: center; padding: 14px; border: 1px solid var(--border); border-radius: 16px; color: inherit; text-decoration: none; background: rgba(255,255,255,.02); transition: background .2s, border-color .2s; }
.work:hover, .work:focus-visible { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.3); }
.work img { flex: none; width: 72px; height: 72px; border-radius: 50%; border: 2px solid rgba(128,128,128,.35); padding: 3px; }
.txt { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.txt b { font-size: 18px; letter-spacing: -0.02em; }
.desc { font-size: 14px; line-height: 1.55; color: #c9d0d6; }
.host { font-size: 12px; color: var(--muted); overflow-wrap: anywhere; }
.soon { margin: 10px 0 0; padding: 14px 18px; border: 1px dashed var(--border); border-radius: 16px; color: var(--muted); font-size: 14px; }
.blog { margin: 28px 0 0; font-size: 15px; } .blog a { text-decoration: none; border-bottom: 1px solid var(--border); padding-bottom: 2px; }
footer { margin-top: 40px; font-size: 12px; line-height: 1.6; color: #6f777e; } footer a { color: inherit; }
.jump { display: flex; flex-wrap: wrap; gap: 8px; margin: 28px 0 0; } .jump a { font-size: 14px; font-weight: 600; color: var(--text); text-decoration: none; border: 1px solid var(--border); border-radius: 999px; padding: 8px 14px; } .jump a:hover { border-color: rgba(255,255,255,.35); } .jump small { color: var(--muted); font-weight: 500; margin-left: 4px; }
.grp { margin: 44px 0 0; scroll-margin-top: 16px; } .grp h2 { margin: 0; font-size: 22px; letter-spacing: -0.02em; } .grp h2 small { font-size: 14px; font-weight: 600; color: var(--muted); margin-left: 6px; } .grp > p { margin: 6px 0 0; font-size: 14px; line-height: 1.6; color: var(--muted); }
.grp ul { margin-top: 16px; }
</style>
</head>
<body>
<main>
  <nav class="top"><a href="/" hreflang="ko">한국어</a></nav>
  <p class="kicker">Web documentaries you see and explore</p>
  <h1>seeplore</h1>
  <p class="lead">An educational web documentary series that explains how science and history work — step through the scenes on a map or in 3D, with voice narration. Each title follows one axis, like time, distance or depth. Follow the axis and it becomes a story. <a href="/en/about">About seeplore →</a></p>
  ${jump}${sections}
  <p class="soon">+ More titles on the way</p>
  <p class="blog"><a href="${BLOG_EN}">seeplore blog — the ideas behind each title →</a></p>
  <footer>${n} titles in English · free · no sign-up · <a href="/en/team">Who makes it</a> · <a href="/" hreflang="ko">한국어</a></footer>
</main>
</body>
</html>
`;
  mkdirSync('dist/en', { recursive: true });
  writeFileSync('dist/en/index.html', index);

  // ---- /en/about ----
  const fields = [...new Set(works.map((w) => w.field || '그 밖의 주제'))];
  const byField = fields.map((f) => ({ f, ws: works.filter((w) => (w.field || '그 밖의 주제') === f) }));
  const A_TITLE = 'About seeplore — educational web documentaries on science and history in 3D';
  const A_DESC = `What seeplore makes, who it is for and how it is made, with the ${n} titles available in English.`;
  const aboutLd = { '@context': 'https://schema.org', '@type': 'AboutPage', name: A_TITLE, url: `${SITE}/en/about`, inLanguage: 'en', description: A_DESC, about: { '@id': `${SITE}/#series` }, isPartOf: { '@id': `${SITE}/#site` } };
  const about = `${head({ title: A_TITLE, desc: A_DESC, path: '/en/about', ko: '/about', ld: aboutLd })}
<style>
${BASE_CSS}
main { width: min(100% - 32px, 680px); margin: 0 auto; padding: calc(env(safe-area-inset-top, 0px) + 48px) 0 64px; line-height: 1.75; }
.bar { display: flex; justify-content: space-between; font-size: 14px; } .bar a { color: var(--muted); text-decoration: none; }
h1 { font-size: clamp(30px, 7vw, 42px); line-height: 1.2; letter-spacing: -0.03em; margin: 18px 0 0; }
h2 { font-size: 20px; margin: 40px 0 8px; color: var(--text); }
p, li { color: #c9d0d6; font-size: 16px; }
ul { padding-left: 20px; }
li { margin: 6px 0; }
li b { color: var(--text); }
.f { margin: 22px 0 4px; font-size: 13px; letter-spacing: .08em; color: var(--muted); }
</style>
</head>
<body>
<main>
<div class="bar"><a href="/en">← seeplore</a><a href="/about" hreflang="ko">한국어</a></div>
<h1>What is seeplore?</h1>
<p>seeplore (<i>see</i> + <i>explore</i>) is <b>an educational web documentary series that explains how science and history work</b>. You step through scenes on a map or in 3D, and each scene shows, in a few short sentences and with voice narration, what happens and why. The series started in Korean (${all.length} titles); ${n} are in English so far, and more are being translated — text, app and narration.</p>

<h2>Who is it for?</h2>
<p>It is written so a middle-school student can watch it alone and understand it. Hard terms are put into plain words and compared with everyday things like exams, cooking and chores. Students use it to study on their own, teachers put it on the classroom screen, and adults use it to check how something works in a few minutes.</p>

<h2>How is it made?</h2>
<ul>
<li><b>Each title follows one axis.</b> Time, distance, depth or speed — every scene is one point on that axis (Korean history follows the years, the ocean follows depth, black holes follow how much a clock slows down).</li>
<li><b>Watch and listen together.</b> Step through the scenes yourself, or turn on documentary mode and the view moves along with the narration.</li>
<li><b>Numbers are calculated or sourced.</b> Things like the air around a wing or a small AI learning are actually computed where possible; statistics and astronomical figures come from official sources with their reference dates.</li>
<li><b>Free, no sign-up.</b> It opens straight in the browser, on phones too.</li>
</ul>

<h2>What does it cover?</h2>
<p>Science (space, Earth, physics, AI and computers, engineering, life) and history, plus how society and the economy work. The titles in English so far:</p>
${byField.map(({ f, ws }) => `<p class="f">${esc(FIELD_EN[f] ?? f)}</p>\n<ul>\n${ws.map((w) => `<li><a href="${esc(href(w))}"><b>${esc(w.titleEn)}</b></a> — ${esc(w.descEn)}</li>`).join('\n')}\n</ul>`).join('\n')}

<h2>More</h2>
<ul>
<li><a href="${BLOG_EN}">seeplore blog</a> — the ideas behind each title and how it was made.</li>
<li><a href="https://www.youtube.com/@seeplore">YouTube @seeplore</a> — one scene from a title, summed up in a Short under a minute (narrated in Korean for now).</li>
<li><a href="/en/team">Who makes it</a> — a dad, his son and their AI teammates in a make-believe office.</li>
</ul>
</main>
</body>
</html>
`;
  mkdirSync('dist/en/about', { recursive: true });
  writeFileSync('dist/en/about/index.html', about);

  // ---- /en/team ----
  mkdirSync('dist/en/team', { recursive: true });
  writeFileSync('dist/en/team/index.html', teamHtml({ works, esc, SITE, BLOG, lang: 'en' }));
}
