/**
 * seeplore.com 허브 빌드 (의존성 없음 — node 만 있으면 된다).
 *   series.json → dist/series.json (모든 작품 사이트가 읽는 목록)
 *               → dist/index.html  (시리즈 첫 페이지)
 *               → dist/sitemap.xml, dist/robots.txt
 *   public/*    → dist/* (아이콘 등)
 * 실행: node scripts/build.mjs   (Vercel 빌드 명령도 이것)
 */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';

const SITE = 'https://seeplore.com';
const data = JSON.parse(readFileSync('series.json', 'utf8'));
const works = data.works;

// ---- 점검: 아이디 중복, 필수 칸, 아이콘 파일 ----
const ids = new Set();
for (const w of works) {
  for (const k of ['id', 'label', 'title', 'url', 'icon', 'desc']) if (typeof w[k] !== 'string' || !w[k]) throw new Error(`[series] ${w.id ?? '?'} 의 ${k} 가 비었습니다`);
  if (ids.has(w.id)) throw new Error(`[series] 아이디 중복: ${w.id}`);
  ids.add(w.id);
  const local = w.icon.replace(SITE, 'public');
  if (w.icon.startsWith(SITE) && !existsSync(local)) throw new Error(`[series] 아이콘 파일 없음: ${local}`);
}

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist', { recursive: true });
cpSync('public', 'dist', { recursive: true });
writeFileSync('dist/series.json', JSON.stringify({ works }, null, 1));

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const host = (u) => new URL(u).host;

const cards = works
  .map(
    (w, i) => `
      <li>
        <a class="work" href="${esc(w.url)}">
          <img src="${esc(w.icon.replace(SITE, ''))}" alt="" width="72" height="72" ${i > 3 ? 'loading="lazy"' : ''}>
          <span class="txt">
            <b>${esc(w.title)}</b>
            <span class="desc">${esc(w.desc)}</span>
            <span class="host">${esc(host(w.url))}</span>
          </span>
        </a>
      </li>`,
  )
  .join('');

const ld = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'seeplore',
  url: `${SITE}/`,
  inLanguage: 'ko',
  description: '지도와 3D 위에서 펼쳐지는 음성 해설 웹 다큐멘터리 시리즈',
  hasPart: works.map((w) => ({ '@type': 'WebApplication', name: w.title, url: w.url, description: w.desc })),
};

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<!-- 방문 통계: Google Analytics — 작품별 (아직 없음) + 시리즈 전체 G-TBYJ6JBLYF (스킬 series-web-doc 4절) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-TBYJ6JBLYF"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  if (/^(localhost|127\\.|192\\.168\\.)/.test(location.hostname)) {
    window['ga-disable-G-TBYJ6JBLYF'] = true;
  }
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-TBYJ6JBLYF', { content_group: 'hub' });
</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#050608">
<title>seeplore | 지도와 3D로 보는 웹 다큐멘터리 시리즈</title>
<meta name="description" content="${esc(works.map((w) => w.title).join(' · '))} — 지도와 3D 위에서 펼쳐지는 음성 해설 웹 다큐멘터리 시리즈.">
<link rel="canonical" href="${SITE}/">
<!-- 네이버 서치어드바이저 소유 확인 -->
<meta name="naver-site-verification" content="07dc96c0d781f67fb9257f031aac64107c365247">
<meta property="og:type" content="website">
<meta property="og:site_name" content="seeplore">
<meta property="og:title" content="seeplore — 보면서 탐험하는 웹 다큐멘터리">
<meta property="og:description" content="${esc(works.map((w) => w.title).join(' · '))}">
<meta property="og:url" content="${SITE}/">
<meta property="og:locale" content="ko_KR">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="manifest" href="/manifest.webmanifest">
<meta name="apple-mobile-web-app-title" content="seeplore">
<meta name="theme-color" content="#050608">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>
:root { --bg: #050608; --text: #f3f5f7; --muted: #9aa3ab; --border: rgba(255,255,255,.12); color-scheme: dark;
  font-family: 'Pretendard', 'Noto Sans KR', system-ui, -apple-system, sans-serif; color: var(--text); }
* { box-sizing: border-box; }
html, body { margin: 0; background: var(--bg); -webkit-text-size-adjust: 100%; }
main { width: min(100% - 32px, 720px); margin: 0 auto; padding: calc(env(safe-area-inset-top, 0px) + 56px) 0 64px; word-break: keep-all; }
.kicker { margin: 0; font-size: 15px; font-weight: 600; color: var(--muted); }
h1 { margin: 10px 0 0; font-size: clamp(48px, 13vw, 84px); line-height: 1; font-weight: 900; letter-spacing: -0.05em; }
.lead { margin: 18px 0 0; font-size: 16px; line-height: 1.7; color: #c9d0d6; }
ul { list-style: none; margin: 40px 0 0; padding: 0; display: grid; gap: 10px; }
.work { display: flex; gap: 16px; align-items: center; padding: 14px; border: 1px solid var(--border); border-radius: 16px; color: inherit; text-decoration: none; background: rgba(255,255,255,.02); transition: background .2s, border-color .2s; }
.work:hover, .work:focus-visible { background: rgba(255,255,255,.06); border-color: rgba(255,255,255,.3); }
.work img { flex: none; width: 72px; height: 72px; border-radius: 50%; border: 2px solid rgba(128,128,128,.35); padding: 3px; }
.txt { min-width: 0; display: flex; flex-direction: column; gap: 4px; }
.txt b { font-size: 18px; letter-spacing: -0.02em; }
.desc { font-size: 14px; line-height: 1.55; color: #c9d0d6; }
.host { font-size: 12px; color: var(--muted); }
.soon { margin: 10px 0 0; padding: 14px 18px; border: 1px dashed var(--border); border-radius: 16px; color: var(--muted); font-size: 14px; }
footer { margin-top: 40px; font-size: 12px; line-height: 1.6; color: #6f777e; }
</style>
</head>
<body>
<main>
  <p class="kicker">보면서(see) 탐험하는(explore) 웹 다큐멘터리</p>
  <h1>seeplore</h1>
  <p class="lead">지도와 3D 위에서 장면을 하나씩 넘기며 음성 해설로 듣는 시리즈입니다. 작품마다 축이 하나 있습니다 — 시간, 거리, 깊이처럼. 축을 따라가면 이야기가 됩니다.</p>
  <ul>${cards}
  </ul>
  <p class="soon">+ 다음 작품 준비 중</p>
  <footer>작품 ${works.length}편 · 무료 · 회원 가입 없음</footer>
</main>
</body>
</html>
`;
writeFileSync('dist/index.html', html);

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE}/</loc><lastmod>${today}</lastmod></url>\n</urlset>\n`,
);
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`[seeplore] 작품 ${works.length}편 → dist/`);
