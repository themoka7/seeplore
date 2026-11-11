/**
 * seeplore.com 허브 빌드 (의존성 없음 — node 만 있으면 된다).
 *   series.json → dist/series.json (모든 작품 사이트가 읽는 목록)
 *               → dist/index.html  (시리즈 첫 페이지)
 *               → dist/about/index.html (소개), dist/llms.txt (AI 용 요약)
 *               → dist/sitemap.xml, dist/robots.txt
 *   public/*    → dist/* (아이콘 등)
 * 실행: node scripts/build.mjs   (Vercel 빌드 명령도 이것)
 */
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { teamHtml } from './team.mjs';

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

// 구조화 데이터: 이 사이트가 'seeplore' 라는 시리즈(조직)의 중심이라는 것 + 작품·블로그 연결
// (구글 'seeplore' 검색에서 이름이 같은 다른 프로젝트로 잡히던 문제 — 2026-11-07)
const BLOG = 'https://blog.seeplore.com/';
// 검색 결과 설명: 네이버 권장 80자 이내 (작품 이름 나열은 201자라 잘렸다)
const SHORT_DESC = `과학·역사 원리를 지도와 3D, 음성 해설로 설명하는 무료 교육용 웹 다큐멘터리. 한국사·우주·AI 등 ${works.length}편.`;
if (SHORT_DESC.length > 80) throw new Error(`[seo] 설명 ${SHORT_DESC.length}자 — 80자 이내로`);

// 이 시리즈가 무엇인지 AI·검색엔진이 서술형으로 읽을 수 있게 — 구글 AI 모드가 '도시·건축 이야기'로 잘못 요약했다(2026-11-11)
const WHAT = '과학과 역사의 원리를 지도와 3D 화면 위에서 장면을 하나씩 넘기며 음성 해설로 설명하는 무료 교육용 웹 다큐멘터리 시리즈. 중학생이 혼자 보고 이해할 수 있는 눈높이로 만든다.';
const FIELDS = [...new Set(works.map((w) => w.field || '그 밖의 주제'))];
const ld = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${SITE}/#org`,
      name: 'seeplore',
      alternateName: ['시플로어', 'seeplore 시리즈'],
      url: `${SITE}/`,
      logo: `${SITE}/icons/icon-512.png`,
      description: WHAT,
      sameAs: [BLOG, 'https://www.youtube.com/@seeplore'],
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE}/#site`,
      name: 'seeplore',
      url: `${SITE}/`,
      inLanguage: 'ko',
      description: WHAT,
      publisher: { '@id': `${SITE}/#org` },
    },
    {
      '@type': 'CreativeWorkSeries',
      '@id': `${SITE}/#series`,
      name: 'seeplore',
      url: `${SITE}/`,
      inLanguage: 'ko',
      description: WHAT,
      genre: ['교육용 웹 다큐멘터리', '인터랙티브 3D', '과학 교육', '역사 교육'],
      about: FIELDS,
      audience: { '@type': 'EducationalAudience', educationalRole: 'student', audienceType: '중학생 이상' },
      isAccessibleForFree: true,
      publisher: { '@id': `${SITE}/#org` },
      hasPart: works.map((w, i) => ({
        '@type': 'CreativeWork',
        additionalType: 'https://schema.org/WebApplication',
        position: i + 1,
        name: w.title,
        url: w.url,
        description: w.desc,
        about: w.field || undefined,
        genre: '교육용 웹 다큐멘터리',
        inLanguage: 'ko',
        isAccessibleForFree: true,
        isPartOf: { '@id': `${SITE}/#series` },
      })),
    },
    {
      '@type': 'CollectionPage',
      name: 'seeplore — 보면서 탐험하는 웹 다큐멘터리',
      url: `${SITE}/`,
      inLanguage: 'ko',
      isPartOf: { '@id': `${SITE}/#site` },
      mainEntity: { '@id': `${SITE}/#series` },
      description: WHAT,
    },
  ],
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
<meta name="description" content="${esc(SHORT_DESC)}">
<link rel="canonical" href="${SITE}/">
<!-- 네이버 서치어드바이저 소유 확인 -->
<meta name="naver-site-verification" content="07dc96c0d781f67fb9257f031aac64107c365247">
<meta property="og:type" content="website">
<meta property="og:site_name" content="seeplore">
<meta property="og:title" content="seeplore — 보면서 탐험하는 웹 다큐멘터리">
<meta property="og:description" content="${esc(SHORT_DESC)}">
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
.blog { margin: 28px 0 0; font-size: 15px; } .blog a { color: var(--text); text-decoration: none; border-bottom: 1px solid var(--border); padding-bottom: 2px; }
.kicker { margin: 0; font-size: 15px; font-weight: 600; color: var(--muted); }
h1 { margin: 10px 0 0; font-size: clamp(48px, 13vw, 84px); line-height: 1; font-weight: 900; letter-spacing: -0.05em; }
.lead { margin: 18px 0 0; font-size: 16px; line-height: 1.7; color: #c9d0d6; } .lead a { color: var(--text); }
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
  <p class="lead">과학과 역사의 원리를 지도와 3D 위에서 장면을 하나씩 넘기며 음성 해설로 설명하는 교육용 웹 다큐멘터리 시리즈입니다. 작품마다 축이 하나 있습니다 — 시간, 거리, 깊이처럼. 축을 따라가면 이야기가 됩니다. <a href="/about">seeplore 소개 →</a></p>
  <ul>${cards}
  </ul>
  <p class="soon">+ 다음 작품 준비 중</p>
  <p class="blog"><a href="${BLOG}">seeplore 블로그 — 작품 뒤의 원리와 만든 이야기 →</a></p>
  <footer>작품 ${works.length}편 · 무료 · 회원 가입 없음 · <a href="/team" style="color:inherit">만드는 사람들</a></footer>
</main>
</body>
</html>
`;
writeFileSync('dist/index.html', html);

// ---- 소개 페이지 /about — AI·검색엔진이 근거로 삼을 서술형 문장 ----
const byField = FIELDS.map((f) => ({ f, ws: works.filter((w) => (w.field || '그 밖의 주제') === f) }));
const ABOUT_TITLE = 'seeplore 소개 — 과학·역사 원리를 3D와 음성 해설로 보는 교육용 웹 다큐';
const ABOUT_DESC = `seeplore가 무엇을, 누구를 위해, 어떤 방식으로 만드는지. 작품 ${works.length}편을 분야별로 정리했습니다.`;
const aboutLd = {
  '@context': 'https://schema.org',
  '@type': 'AboutPage',
  name: ABOUT_TITLE,
  url: `${SITE}/about`,
  inLanguage: 'ko',
  description: ABOUT_DESC,
  about: { '@id': `${SITE}/#series` },
  isPartOf: { '@id': `${SITE}/#site` },
};
const aboutHtml = `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-TBYJ6JBLYF"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-TBYJ6JBLYF',{content_group:'hub'});</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(ABOUT_TITLE)}</title>
<meta name="description" content="${esc(ABOUT_DESC)}">
<link rel="canonical" href="${SITE}/about">
<meta property="og:type" content="website">
<meta property="og:site_name" content="seeplore">
<meta property="og:title" content="${esc(ABOUT_TITLE)}">
<meta property="og:description" content="${esc(ABOUT_DESC)}">
<meta property="og:url" content="${SITE}/about">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png">
<script type="application/ld+json">${JSON.stringify(aboutLd)}</script>
<style>
:root { --bg: #050608; --text: #f3f5f7; --muted: #9aa3ab; --border: rgba(255,255,255,.12); color-scheme: dark; font-family: 'Pretendard', 'Noto Sans KR', system-ui, -apple-system, sans-serif; color: var(--text); }
html, body { margin: 0; background: var(--bg); }
main { width: min(100% - 32px, 680px); margin: 0 auto; padding: calc(env(safe-area-inset-top, 0px) + 48px) 0 64px; word-break: keep-all; line-height: 1.75; }
a { color: var(--text); }
.back { font-size: 14px; color: var(--muted); }
h1 { font-size: clamp(30px, 7vw, 42px); line-height: 1.2; letter-spacing: -0.03em; margin: 18px 0 0; }
h2 { font-size: 20px; margin: 40px 0 8px; }
p, li { color: #c9d0d6; font-size: 16px; }
ul { padding-left: 20px; }
li { margin: 6px 0; }
li b { color: var(--text); }
.f { margin: 22px 0 4px; font-size: 13px; letter-spacing: .08em; color: var(--muted); }
</style>
</head>
<body>
<main>
<a class="back" href="/">← seeplore 첫 페이지</a>
<h1>seeplore는 무엇인가요?</h1>
<p>seeplore(보면서 see, 탐험하는 explore)는 <b>과학과 역사의 원리를 설명하는 교육용 웹 다큐멘터리 시리즈</b>입니다. 지도나 3D 화면 위에서 장면을 하나씩 넘기며, 장면마다 짧은 글과 음성 해설로 "무슨 일이 왜 일어나는지"를 차례로 보여 줍니다. 지금까지 ${works.length}편을 냈습니다.</p>

<h2>누구를 위해 만드나요?</h2>
<p>중학생이 혼자 보고 이해할 수 있는 눈높이를 기준으로 씁니다. 어려운 용어는 쉬운 말로 풀고, 시험·요리·집안일처럼 누구나 겪는 일에 빗대어 설명합니다. 학생은 스스로 공부할 때, 선생님은 수업 화면 자료로, 어른은 궁금했던 원리를 짧게 확인할 때 씁니다.</p>

<h2>어떤 방식으로 만드나요?</h2>
<ul>
<li><b>축 하나를 따라갑니다.</b> 작품마다 시간·거리·깊이·속도 같은 축이 하나 있고, 장면은 그 축 위의 한 지점입니다(예: 한국사는 연도, 바다는 수심, 블랙홀은 시계가 느려지는 정도).</li>
<li><b>보는 것과 듣는 것을 함께.</b> 장면을 직접 넘겨 볼 수도 있고, '다큐멘터리' 모드를 켜면 음성 해설에 맞춰 화면이 저절로 움직입니다.</li>
<li><b>숫자는 계산하거나 출처에서 가져옵니다.</b> 비행기 날개 둘레 공기, 작은 AI의 학습처럼 화면에 보이는 값은 가능한 한 실제로 계산한 값이고, 통계·천문 수치는 공식 자료의 기준일과 함께 적습니다.</li>
<li><b>무료, 가입 없음.</b> 브라우저에서 바로 열리고 휴대폰에서도 볼 수 있습니다.</li>
</ul>

<h2>무엇을 다루나요?</h2>
<p>과학(우주·지구·물리·AI·컴퓨터·공학·생명)과 역사, 사회·경제의 원리를 다룹니다. 아파트·다리 작품도 특정 도시나 장소를 소개하는 것이 아니라, 구조물이 지어지는 과정과 힘의 원리를 설명합니다.</p>
${byField.map(({ f, ws }) => `<p class="f">${esc(f)}</p>\n<ul>\n${ws.map((w) => `<li><a href="${esc(w.url)}"><b>${esc(w.title)}</b></a> — ${esc(w.desc)}</li>`).join('\n')}\n</ul>`).join('\n')}

<h2>더 보기</h2>
<ul>
<li><a href="${BLOG}">seeplore 블로그</a> — 작품 뒤의 원리와 만든 과정을 글로 정리합니다.</li>
<li><a href="https://www.youtube.com/@seeplore">YouTube @seeplore</a> — 작품의 한 장면을 1분 안쪽 쇼츠로 요약합니다.</li>
<li><a href="/team">만드는 사람들</a> — 대표 한 명과 AI 팀원들이 일하는 사무실(가상)</li>
</ul>
</main>
</body>
</html>
`;
mkdirSync('dist/about', { recursive: true });
writeFileSync('dist/about/index.html', aboutHtml);

// ---- llms.txt — AI 가 읽기 쉬운 요약 (llmstxt.org 형식) ----
writeFileSync(
  'dist/llms.txt',
  `# seeplore

> ${WHAT} 작품 ${works.length}편, 회원 가입 없음, 한국어(일부 작품은 영어판도 있음).

seeplore는 특정 도시·장소나 건축을 소개하는 서비스가 아니다. 과학·역사 원리를 장면 순서대로 설명하는 교육용 웹 다큐멘터리다. 작품마다 축(시간·거리·깊이 등)이 하나 있고, 3D 화면과 음성 해설(다큐멘터리 모드)로 본다.

- [seeplore 소개](${SITE}/about): 무엇을, 누구를 위해, 어떤 방식으로 만드는지
- [작품 목록 JSON](${SITE}/series.json)

${byField.map(({ f, ws }) => `## ${f}\n\n${ws.map((w) => `- [${w.title}](${w.url}): ${w.desc}`).join('\n')}`).join('\n\n')}

## 더 보기

- [seeplore 블로그](${BLOG}): 작품 뒤의 원리와 만든 과정
- [YouTube @seeplore](https://www.youtube.com/@seeplore): 작품 한 장면을 요약한 쇼츠
`,
);

mkdirSync('dist/team', { recursive: true });
writeFileSync('dist/team/index.html', teamHtml({ works, esc, SITE, BLOG }));

const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  'dist/sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${SITE}/</loc><lastmod>${today}</lastmod></url>\n  <url><loc>${SITE}/about</loc><lastmod>${today}</lastmod></url>\n  <url><loc>${SITE}/team</loc><lastmod>${today}</lastmod></url>\n</urlset>\n`,
);
writeFileSync('dist/robots.txt', `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`[seeplore] 작품 ${works.length}편 → dist/`);
