/**
 * /team — 가상의 회사 "seeplore 스튜디오" 소개 (2000년대 미니홈피 느낌).
 * 실제로는 사람 1명(대표) + AI 도구들이 일한다. 재미로 꾸몄지만 내용은 사실대로:
 * 누가 어떤 도구이고 무슨 일을 하는지 그대로 적는다(지어낸 직원·숫자 없음).
 * 업무일지(LOG)는 손으로 적는다 — 새 일이 있으면 맨 위에 한 줄.
 */
const LOG = [
  ['11.11', '홍보팀', '소개 페이지와 AI용 요약(llms.txt)을 만들었다. 구글 AI가 우리를 "도시 이야기"로 착각해서.'],
  ['11.10', '쇼츠 PD', '쇼츠를 전부 다시 만들었다. 질문으로 시작하고, 화려한 장면으로 눈을 붙잡고, 자막은 버튼에 안 가리게.'],
  ['11.10', '업로드 봇', '쇼츠가 대표님 개인 채널로 올라간 걸 들켰다. 이제 올리기 전에 채널부터 확인한다.'],
  ['11.10', '음성팀', '쉼표 자리에서 "읔" 소리가 나던 버릇을 고쳤다. 쉼표마다 잘라 읽고 0.25초 쉰다.'],
  ['11.08', '블로그 작가', '매주 일요일 밤 글 두 편을 쓰기 시작했다. 네이버·X·스레드용 원고도 같이.'],
  ['11.07', '홍보팀', '첫 글 「챗GPT 원리, 다음 글자 맞히기로 쉽게 이해하기」 발행.'],
  ['11.06', '대표', 'blog.seeplore.com 문을 열었다.'],
];

export function teamHtml({ works, esc, SITE, BLOG }) {
  const role = (name, who, tool, does, mood) => ({ name, who, tool, does, mood });
  const DEPTS = [
    {
      name: '대표실',
      members: [role('대표', '사람', '사람 1명', '무엇을 만들지 정하고, 다 만든 것을 직접 보고 고치라고 한다. 배포 버튼은 대표만 누른다.', '오늘도 휴대폰으로 결재 중')],
    },
    {
      name: '기획실',
      members: [role('기획 담당', 'Gemini', 'Google Gemini', '새 작품 아이디어와 기획안 초안을 낸다. 사실과 다른 곳은 제작본부가 계획 단계에서 짚는다.', '다음 주제 뭐 하지')],
    },
    {
      name: '제작본부',
      note: `작품 하나에 담당 하나. 각자 자기 작품의 3D 화면·장면 글·다큐 원고를 만든다. 모두 Claude(Claude Code)이고, 일하는 법은 공통 지침서 한 권(series-web-doc)을 따른다.`,
      works: true,
    },
    {
      name: '다큐 음성팀',
      members: [role('내레이터', 'Aoede', 'Google Cloud TTS · Chirp 3 HD', '모든 작품의 다큐멘터리 해설과 쇼츠를 읽는다. 0.95배 속도, 쉼표에서 0.25초 쉰다.', '목 관리 중')],
    },
    {
      name: '홍보팀',
      members: [
        role('홍보팀장', 'Claude', 'Claude Code', '블로그·쇼츠·검색 등록을 맡고, 다른 팀원이 매주 따를 지침을 쓴다.', '조회수 1 올라갈 때마다 기쁨'),
        role('블로그 작가', 'Claude', 'Claude Code (매주 일요일 밤 예약)', '화·금 글을 미리 써 둔다. 중학생 눈높이, 숫자는 작품에 적힌 것만.', '이번 주 글감 고르는 중'),
        role('쇼츠 PD', 'Claude', 'Claude Code + 렌더링 스크립트', '작품 장면을 골라 50초 쇼츠로 만든다. 첫 2초는 질문과 화려한 장면.', '편집은 프레임 단위로'),
        role('업로드 봇', '봇', 'GitHub Actions (매일 08:47)', '날짜가 된 글을 공개하고, 쇼츠를 @seeplore 채널에 올린다.', '알람 없이 일어남'),
      ],
    },
    {
      name: '품질관리',
      members: [role('점검 로봇', '봇', 'Playwright', '모든 장면을 넘기며 휴대폰·PC 화면을 찍고 오류를 모은다. 이름표가 잘리면 바로 이른다.', '스크린샷 1,000장째')],
    },
    {
      name: '총무·시설',
      members: [
        role('서류함', 'GitHub', 'GitHub', '모든 작품의 코드와 글을 보관한다.', '정리 정돈'),
        role('건물 관리', 'Vercel', 'Vercel', '사이트를 세상에 띄운다. 하루 100번까지만 문을 여닫을 수 있어서 대표가 아껴 쓴다.', '오늘 남은 배포 횟수 확인'),
      ],
    },
  ];
  const memberCount = 1 + 1 + works.length + 1 + 4 + 1 + 2;
  const card = (m) => `<li class="m"><div class="av">${esc(m.who.slice(0, 2))}</div><div class="mi"><p class="mn"><b>${esc(m.name)}</b> <span>${esc(m.who)}</span></p><p class="mt">${esc(m.tool)}</p><p class="md">${esc(m.does)}</p><p class="mood">오늘의 기분 · ${esc(m.mood)}</p></div></li>`;
  const workCard = (w) => `<li class="w"><a href="${esc(w.url)}"><img src="${esc(w.icon.replace(SITE, ''))}" alt="" width="40" height="40" loading="lazy"><span><b>${esc(w.title)}</b> 담당</span></a></li>`;
  const depts = DEPTS.map(
    (d) => `<section class="dept"><h3>${esc(d.name)}</h3>${d.note ? `<p class="note">${esc(d.note)}</p>` : ''}${d.works ? `<ul class="ws">${works.map(workCard).join('')}</ul>` : `<ul class="ms">${d.members.map(card).join('')}</ul>`}</section>`,
  ).join('\n');
  const log = LOG.map(([d, who, t]) => `<li><time>${esc(d)}</time><b>${esc(who)}</b><span>${esc(t)}</span></li>`).join('');

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-TBYJ6JBLYF"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-TBYJ6JBLYF',{content_group:'hub'});</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>seeplore 스튜디오</title>
<meta name="description" content="seeplore를 만드는 가상의 회사. 대표 한 명과 AI 팀원들(Claude, Gemini, Google TTS 등)이 어떤 일을 나눠 맡는지 소개합니다.">
<link rel="canonical" href="${SITE}/team">
<meta property="og:title" content="seeplore 스튜디오 — 대표 1명과 AI 팀원들">
<meta property="og:description" content="seeplore 웹 다큐 시리즈를 만드는 가상의 회사 조직도와 업무일지.">
<meta property="og:url" content="${SITE}/team">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gaegu:wght@700&family=Nanum+Gothic:wght@400;700&display=swap">
<style>
/* 2000년대 미니홈피 느낌: 하늘색 점무늬 바깥, 흰 다이어리 판, 왼쪽 프로필 · 오른쪽 내용, 작은 글씨 */
:root { --sky: #cfe6f5; --dot: #b7d6ec; --paper: #ffffff; --line: #b9c9d6; --ink: #333a40; --soft: #6c7a86; --accent: #ff7a3d; --tab: #e9f2f9; --link: #1f6fb2;
  --hand: 'Gaegu', 'Nanum Gothic', cursive; --body: 'Nanum Gothic', 'Apple SD Gothic Neo', sans-serif; color-scheme: light; }
* { box-sizing: border-box; }
html, body { margin: 0; }
body { background: var(--sky) radial-gradient(var(--dot) 1.5px, transparent 1.6px) 0 0 / 14px 14px; color: var(--ink); font: 13px/1.6 var(--body); padding-block: 24px 48px; padding-left: max(12px, env(safe-area-inset-left, 0px)); padding-right: max(12px, env(safe-area-inset-right, 0px)); word-break: keep-all; }
.frame { max-width: 920px; margin: 0 auto; background: #8fb7d3; border-radius: 18px; padding: 10px; box-shadow: 0 2px 0 #7aa4c1; }
.top { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; color: #fff; padding: 2px 10px 8px; font-size: 12px; }
.top b { font-size: 15px; }
.top a { color: #fff; }
.book { display: grid; grid-template-columns: 220px minmax(0, 1fr); gap: 10px; }
.side, .main { background: var(--paper); border: 1px solid var(--line); border-radius: 12px; padding: 14px; min-width: 0; }
.photo { aspect-ratio: 1; border: 1px solid var(--line); border-radius: 8px; display: grid; place-items: center; background: #050608; }
.photo img { width: 70%; height: auto; }
.today { font: 700 20px/1.3 var(--hand); color: var(--accent); margin: 12px 0 6px; }
.side p { margin: 6px 0; color: var(--soft); }
.side dl { margin: 12px 0 0; display: grid; grid-template-columns: auto 1fr; gap: 4px 10px; font-size: 12px; }
.side dt { color: var(--soft); } .side dd { margin: 0; font-weight: 700; }
.tabs { display: flex; gap: 4px; flex-wrap: wrap; margin: -2px 0 12px; }
.tabs a { padding: 4px 12px; border: 1px solid var(--line); border-radius: 8px 8px 0 0; background: var(--tab); color: var(--ink); text-decoration: none; font-size: 12px; }
.tabs a:focus-visible, .tabs a:hover { background: #fff; }
h2 { font: 700 15px var(--body); margin: 18px 0 8px; padding-bottom: 4px; border-bottom: 1px dotted var(--line); }
h2:first-of-type { margin-top: 0; }
h3 { margin: 16px 0 6px; font-size: 13px; color: var(--link); }
h3::before { content: '▸ '; }
.note { margin: 0 0 8px; color: var(--soft); }
ul { list-style: none; margin: 0; padding: 0; }
.ms { display: grid; gap: 8px; }
.m { display: flex; gap: 10px; padding: 10px; border: 1px solid #e3ebf1; border-radius: 10px; background: #fbfdff; }
.av { flex: none; width: 44px; height: 44px; border-radius: 50%; background: var(--tab); border: 1px solid var(--line); display: grid; place-items: center; font-weight: 700; font-size: 12px; color: var(--link); }
.mi { min-width: 0; } .mi p { margin: 0; }
.mn span { color: var(--soft); font-size: 12px; }
.mt { font-size: 11.5px; color: var(--soft); }
.md { margin-top: 4px !important; }
.mood { margin-top: 4px !important; font: 700 15px var(--hand); color: var(--accent); }
.ws { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 6px; }
.w a { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border: 1px solid #e3ebf1; border-radius: 10px; color: var(--ink); text-decoration: none; background: #fbfdff; }
.w a:hover, .w a:focus-visible { border-color: var(--line); background: #fff; }
.w img { width: 36px; height: 36px; border-radius: 50%; flex: none; }
.log li { display: grid; grid-template-columns: 42px 76px minmax(0, 1fr); gap: 8px; padding: 6px 0; border-bottom: 1px dotted #dfe7ee; }
.log time { color: var(--soft); font-variant-numeric: tabular-nums; }
.log b { color: var(--link); }
.how p { margin: 6px 0; }
.foot { text-align: center; color: #fff; font-size: 12px; margin-top: 10px; }
.foot a { color: #fff; }
@media (max-width: 640px) { .book { grid-template-columns: 1fr; } .photo { max-width: 160px; margin: 0 auto; } .log li { grid-template-columns: 38px minmax(0, 1fr); } .log li span { grid-column: 2; } }
</style>
</head>
<body>
<div class="frame">
  <div class="top"><span><b>seeplore 스튜디오</b> · 가상의 회사</span><a href="/">seeplore.com 으로 →</a></div>
  <div class="book">
    <aside class="side">
      <div class="photo"><img src="/icons/icon-192.png" alt="seeplore 로고" width="192" height="192"></div>
      <p class="today">대표 1명, 나머지는 다 AI</p>
      <p>보면서(see) 탐험하는(explore) 웹 다큐를 만드는 회사입니다. 진짜 회사는 아니고, 실제로 이렇게 일을 나눠서 만들고 있다는 걸 회사처럼 꾸며 봤어요.</p>
      <dl>
        <dt>설립</dt><dd>2026년 11월</dd>
        <dt>작품</dt><dd>${works.length}편</dd>
        <dt>팀원</dt><dd>${memberCount}명(?)</dd>
        <dt>사람</dt><dd>1명</dd>
      </dl>
    </aside>
    <main class="main">
      <nav class="tabs" aria-label="바로 가기"><a href="#org">조직도</a><a href="#log">업무일지</a><a href="#how">일하는 법</a><a href="/about">회사 소개</a></nav>
      <h2 id="org">조직도</h2>
      ${depts}
      <h2 id="log">업무일지</h2>
      <ul class="log">${log}</ul>
      <h2 id="how">일하는 법</h2>
      <div class="how">
        <p>· 대표가 주제를 고르면, 기획실(Gemini)이 기획안을 내고, 제작본부 담당(Claude)이 계획을 다시 짜서 대표에게 확인받은 뒤 만든다.</p>
        <p>· 작품마다 공통 지침서를 따른다. 글은 중학생이 혼자 읽고 이해할 수 있게, 숫자는 계산하거나 출처가 있는 것만.</p>
        <p>· 사이트에 올리는 건 하루 한 번, 대표가 허락할 때만.</p>
        <p>· 홍보팀은 블로그·쇼츠는 자동으로 올리고, 네이버·X·스레드는 대표가 복사해 올릴 원고를 미리 만들어 둔다.</p>
      </div>
    </main>
  </div>
  <p class="foot">ⓒ seeplore · <a href="${BLOG}">블로그</a> · <a href="https://www.youtube.com/@seeplore">YouTube</a> · 등장하는 AI 도구 이름은 각 회사의 상표입니다.</p>
</div>
</body>
</html>
`;
}
