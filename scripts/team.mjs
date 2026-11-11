/**
 * /team — 가상의 회사 "seeplore 스튜디오" 미니홈피 (2000년대 미니홈피 문법을 빌린 오리지널 디자인 — 특정 서비스의 이름·로고·화폐는 쓰지 않는다).
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
  const all = DEPTS.flatMap((d) => d.members ?? []);
  const memberCount = all.length + works.length;
  const card = (m) => `<li class="m"><div class="av">${esc(m.who.slice(0, 2))}</div><div class="mi"><p class="mn"><b>${esc(m.name)}</b> <span>${esc(m.who)}</span></p><p class="mt">${esc(m.tool)}</p><p class="md">${esc(m.does)}</p></div></li>`;
  const workCard = (w) => `<li class="w"><a href="${esc(w.url)}"><img src="${esc(w.icon.replace(SITE, ''))}" alt="" width="40" height="40" loading="lazy"><span><b>${esc(w.title)}</b> 담당</span></a></li>`;
  const depts = DEPTS.map(
    (d) => `<section class="dept"><h3>${esc(d.name)}</h3>${d.note ? `<p class="note">${esc(d.note)}</p>` : ''}${d.works ? `<ul class="ws">${works.map(workCard).join('')}</ul>` : `<ul class="ms">${d.members.map(card).join('')}</ul>`}</section>`,
  ).join('\n');
  const logRows = (rows) => rows.map(([d, who, t]) => `<li><time>${esc(d)}</time><b>${esc(who)}</b><span>${esc(t)}</span></li>`).join('');
  const album = works.map((w) => `<li><a href="${esc(w.url)}"><img src="${esc(w.icon.replace(SITE, ''))}" alt="" width="96" height="96" loading="lazy"><span>${esc(w.title)}</span></a></li>`).join('');
  const guest = all.map((m) => `<li><div class="av sm">${esc(m.who.slice(0, 2))}</div><p><b>${esc(m.name)}</b> <span class="gw">(${esc(m.who)})</span><br>${esc(m.mood)}</p></li>`).join('');
  const wave = all.map((m) => `<option>${esc(m.name)} · ${esc(m.who)}</option>`).join('') + works.map((w) => `<option value="${esc(w.url)}">${esc(w.title)} 담당</option>`).join('');
  // 미니룸 사람들: [이름표, 몸 색, x 위치(0~200)]
  const ROOM = [['대표', '#ff7a3d', 28], ['Gemini', '#5b8def', 62], ['Claude', '#d97757', 98], ['Aoede', '#b06ad9', 132], ['봇', '#4caf7a', 166]];

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-TBYJ6JBLYF"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-TBYJ6JBLYF',{content_group:'hub'});</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>seeplore 스튜디오 미니홈피</title>
<meta name="description" content="seeplore를 만드는 가상의 회사. 대표 한 명과 AI 팀원들(Claude, Gemini, Google TTS 등)이 어떤 일을 나눠 맡는지 미니홈피로 꾸몄습니다.">
<link rel="canonical" href="${SITE}/team">
<meta property="og:title" content="seeplore 스튜디오 미니홈피 — 대표 1명과 AI 팀원들">
<meta property="og:description" content="seeplore 웹 다큐 시리즈를 만드는 가상의 회사의 미니룸·조직도·다이어리.">
<meta property="og:url" content="${SITE}/team">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Gaegu:wght@700&family=Nanum+Gothic:wght@400;700;800&display=swap">
<style>
/* 미니홈피 문법: 점무늬 바깥 · 스프링 철한 다이어리 판 · 왼쪽 프로필 · 가운데 내용 · 오른쪽 세로 탭 · 미니룸 · 오늘의 BGM */
:root { --out: #e9eef3; --dot: #d5dee6; --cover: #ff8a3d; --cover-dk: #e86f22; --paper: #fff; --line: #c8d3dc; --ink: #3a3f44; --soft: #7b8792; --hl: #ff7a1a; --blue: #2a73b8; --tab: #f2f6f9;
  --hand: 'Gaegu', 'Nanum Gothic', cursive; --body: 'Nanum Gothic', 'Apple SD Gothic Neo', sans-serif; color-scheme: light; }
* { box-sizing: border-box; }
html, body { margin: 0; }
body { background: var(--out) radial-gradient(var(--dot) 1.4px, transparent 1.5px) 0 0 / 12px 12px; color: var(--ink); font: 12.5px/1.6 var(--body); padding-block: 18px 40px; padding-left: max(10px, env(safe-area-inset-left, 0px)); padding-right: max(10px, env(safe-area-inset-right, 0px)); word-break: keep-all; }
.wrap { max-width: 900px; margin: 0 auto; display: flex; gap: 0; align-items: flex-start; }
.diary { flex: 1; min-width: 0; background: var(--cover); border-radius: 16px; padding: 12px 12px 14px; box-shadow: 0 3px 0 var(--cover-dk); position: relative; }
.diary::before { content: ''; position: absolute; left: 50%; top: 40px; bottom: 30px; width: 14px; margin-left: -7px; background: repeating-linear-gradient(#fff 0 6px, transparent 6px 16px); opacity: .55; border-radius: 7px; }
.bar { display: flex; justify-content: space-between; align-items: center; gap: 8px; flex-wrap: wrap; color: #fff; padding: 0 6px 8px; font-size: 11.5px; }
.bar b { font: 800 14px var(--body); }
.count { font-variant-numeric: tabular-nums; background: rgba(0,0,0,.12); border-radius: 10px; padding: 1px 8px; }
.count i { font-style: normal; color: #fff4a8; font-weight: 800; }
.pages { display: grid; grid-template-columns: 210px minmax(0, 1fr); gap: 10px; position: relative; }
.page { background: var(--paper); border-radius: 10px; border: 1px solid #f0c3a3; padding: 12px; min-width: 0; }
.photo { aspect-ratio: 1; border-radius: 6px; background: #050608; display: grid; place-items: center; }
.photo img { width: 64%; height: auto; }
.mood { font: 700 19px/1.25 var(--hand); color: var(--hl); margin: 10px 0 4px; }
.page p { margin: 5px 0; }
.soft { color: var(--soft); }
.side dl { margin: 10px 0; display: grid; grid-template-columns: auto 1fr; gap: 2px 10px; font-size: 11.5px; }
.side dt { color: var(--soft); } .side dd { margin: 0; font-weight: 700; }
.side select { width: 100%; font: 12px var(--body); padding: 4px; border: 1px solid var(--line); border-radius: 4px; background: #fff; color: var(--ink); }
.wave { margin-top: 10px; font-size: 11px; color: var(--soft); }
.bgm { margin-top: 12px; border: 1px solid var(--line); border-radius: 8px; padding: 8px; background: var(--tab); }
.bgm b { font-size: 11px; color: var(--blue); }
.bgm button { font: 700 12px var(--body); border: 1px solid var(--line); background: #fff; border-radius: 12px; padding: 2px 10px; cursor: pointer; color: var(--ink); }
.bgm .t { font-size: 11.5px; margin: 4px 0; }
.tabs { position: relative; display: flex; flex-direction: column; gap: 4px; margin-top: 48px; }
.tabs a { writing-mode: vertical-rl; text-orientation: upright; padding: 10px 5px; background: var(--tab); border: 1px solid var(--line); border-left: 0; border-radius: 0 8px 8px 0; color: var(--ink); text-decoration: none; font-size: 11.5px; letter-spacing: 1px; }
.tabs a[aria-current="page"] { background: #fff; color: var(--hl); font-weight: 800; }
.tabs a:focus-visible { outline: 2px solid var(--blue); }
h2 { font: 800 13px var(--body); color: var(--blue); margin: 0 0 8px; padding-bottom: 4px; border-bottom: 1px dotted var(--line); display: flex; justify-content: space-between; }
h2 small { font-weight: 400; color: var(--soft); }
h3 { margin: 14px 0 6px; font-size: 12.5px; color: var(--blue); }
h3::before { content: '▸ '; }
.room { width: 100%; height: auto; image-rendering: pixelated; border: 1px solid var(--line); border-radius: 6px; display: block; background: #f7efe4; }
.roomcap { font-size: 11px; color: var(--soft); margin: 4px 0 12px !important; }
ul { list-style: none; margin: 0; padding: 0; }
.news li { display: grid; grid-template-columns: 38px 64px minmax(0, 1fr); gap: 6px; padding: 4px 0; border-bottom: 1px dotted #e3e9ee; }
.news time { color: var(--soft); font-variant-numeric: tabular-nums; } .news b { color: var(--blue); }
.ilchon { margin-top: 14px; }
.ilchon li { display: flex; gap: 8px; padding: 6px 0; border-bottom: 1px dotted #e3e9ee; align-items: flex-start; }
.ilchon p { margin: 0; } .gw { color: var(--soft); font-size: 11px; }
.ms { display: grid; gap: 6px; }
.m { display: flex; gap: 10px; padding: 8px; border: 1px solid #e6edf2; border-radius: 8px; background: #fbfdff; }
.av { flex: none; width: 40px; height: 40px; border-radius: 50%; background: var(--tab); border: 1px solid var(--line); display: grid; place-items: center; font-weight: 800; font-size: 11px; color: var(--blue); }
.av.sm { width: 30px; height: 30px; font-size: 10px; }
.mi { min-width: 0; } .mi p { margin: 0; }
.mn span, .mt { color: var(--soft); font-size: 11px; }
.md { margin-top: 3px !important; }
.note { color: var(--soft); margin: 0 0 6px !important; }
.ws { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 5px; }
.w a { display: flex; align-items: center; gap: 8px; padding: 5px 7px; border: 1px solid #e6edf2; border-radius: 8px; color: var(--ink); text-decoration: none; background: #fbfdff; }
.w img { width: 32px; height: 32px; border-radius: 50%; flex: none; }
.album { display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr)); gap: 8px; }
.album a { display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px; border: 1px solid #e6edf2; border-radius: 8px; color: var(--ink); text-decoration: none; text-align: center; font-size: 11.5px; }
.album img { width: 72px; height: 72px; border-radius: 6px; }
.how p { margin: 6px 0; }
.foot { text-align: center; color: var(--soft); font-size: 11px; margin: 10px 0 0; }
.foot a { color: var(--soft); }
section[hidden] { display: none !important; }
@media (max-width: 700px) {
  .pages { grid-template-columns: 1fr; } .diary::before { display: none; }
  .photo { max-width: 140px; margin: 0 auto; }
  .wrap { flex-direction: column; }
  .tabs { flex-direction: row; flex-wrap: wrap; margin: 0 0 6px; width: 100%; order: -1; }
  .tabs a { writing-mode: horizontal-tb; border: 1px solid var(--line); border-radius: 8px; padding: 6px 12px; flex: 1; text-align: center; }
}
</style>
</head>
<body>
<div class="wrap">
 <div class="diary">
  <div class="bar"><span><b>seeplore 스튜디오</b>의 미니홈피 · 가상의 회사</span><span class="count">작품 <i>${works.length}</i> · 팀원 <i>${memberCount}</i> · 사람 <i>1</i></span></div>
  <div class="pages">
   <aside class="page side">
    <div class="photo"><img src="/icons/icon-192.png" alt="seeplore 로고" width="192" height="192"></div>
    <p class="mood">대표 1명, 나머지는 다 AI</p>
    <p class="soft">보면서(see) 탐험하는(explore) 웹 다큐를 만드는 회사. 진짜 회사는 아니고, 실제로 이렇게 일을 나눠서 만들고 있어서 회사처럼 꾸며 봤어요.</p>
    <dl><dt>설립</dt><dd>2026.11</dd><dt>본사</dt><dd>seeplore.com</dd><dt>사옥</dt><dd>클라우드 어딘가</dd></dl>
    <p class="wave">팀원 찾아가기</p>
    <select id="wave" aria-label="팀원 찾아가기"><option value="">팀원을 고르세요</option>${wave}</select>
    <div class="bgm"><b>♪ 오늘의 BGM</b><p class="t">내레이터 Aoede — 「다음 글자 맞히기」</p><button type="button" id="bgm">▶ 듣기</button><audio id="bgm-a" preload="none" src="https://ai-slot.seeplore.com/narration/guess-1.mp3"></audio></div>
   </aside>
   <div class="page main">
    <section id="home">
     <h2>미니룸 <small>오늘도 출근</small></h2>
     <canvas class="room" id="room" width="800" height="440" role="img" aria-label="작은 사무실에 대표, Gemini, Claude, Aoede, 봇이 책상에 앉아 일하는 그림"></canvas>
     <p class="roomcap">왼쪽부터 대표 · 기획(Gemini) · 제작·홍보(Claude) · 목소리(Aoede) · 봇</p>
     <h2>최근 소식 <small><a href="#diary">더 보기</a></small></h2>
     <ul class="news">${logRows(LOG.slice(0, 4))}</ul>
     <h2 class="ilchon">팀원 한마디 <small>${all.length}개</small></h2>
     <ul class="ilchon">${guest}</ul>
    </section>
    <section id="profile" hidden>
     <h2>조직도 <small>${memberCount}명(?)</small></h2>
     ${depts}
     <h3>일하는 법</h3>
     <div class="how">
      <p>· 대표가 주제를 고르면 기획실(Gemini)이 기획안을 내고, 제작본부(Claude)가 계획을 다시 짜서 대표에게 확인받은 뒤 만든다.</p>
      <p>· 작품마다 공통 지침서를 따른다. 글은 중학생이 혼자 읽고 이해할 수 있게, 숫자는 계산하거나 출처가 있는 것만.</p>
      <p>· 사이트에 올리는 건 하루 한 번, 대표가 허락할 때만.</p>
      <p>· 블로그·쇼츠는 자동으로 올리고, 네이버·X·스레드는 대표가 복사해 올릴 원고를 미리 만들어 둔다.</p>
     </div>
    </section>
    <section id="diary" hidden>
     <h2>다이어리 <small>업무일지</small></h2>
     <ul class="news">${logRows(LOG)}</ul>
    </section>
    <section id="album" hidden>
     <h2>사진첩 <small>작품 ${works.length}편</small></h2>
     <ul class="album">${album}</ul>
    </section>
   </div>
  </div>
  <p class="foot" style="color:#fff">ⓒ seeplore · <a style="color:#fff" href="/about">회사 소개</a> · <a style="color:#fff" href="${BLOG}">블로그</a> · <a style="color:#fff" href="https://www.youtube.com/@seeplore">YouTube</a> · AI 도구 이름은 각 회사의 상표</p>
 </div>
 <nav class="tabs" aria-label="메뉴"><a href="#home">홈</a><a href="#profile">프로필</a><a href="#diary">다이어리</a><a href="#album">사진첩</a></nav>
</div>
<script>
// 탭: 주소의 #이름으로 고른다
const TABS = ['home', 'profile', 'diary', 'album'];
function show() {
  const id = TABS.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'home';
  for (const t of TABS) document.getElementById(t).hidden = t !== id;
  for (const a of document.querySelectorAll('.tabs a')) a.toggleAttribute('aria-current', a.getAttribute('href') === '#' + id), a.getAttribute('href') === '#' + id && a.setAttribute('aria-current', 'page');
}
addEventListener('hashchange', show); show();
// 팀원 찾아가기: 작품 담당이면 그 작품으로, 나머지는 프로필 탭으로
document.getElementById('wave').onchange = (e) => { const v = e.target.value; if (!v) return; if (v.startsWith('http')) location.href = v; else location.hash = 'profile'; };
// 오늘의 BGM
const au = document.getElementById('bgm-a'), bt = document.getElementById('bgm');
bt.onclick = () => { if (au.paused) { au.play().then(() => (bt.textContent = '❚❚ 멈춤')).catch(() => (bt.textContent = '재생 못 함')); } else { au.pause(); bt.textContent = '▶ 듣기'; } };
au.onended = () => (bt.textContent = '▶ 듣기');
// 미니룸: 픽셀로 그린 작은 사무실 (200×110 을 화면 폭에 맞춰 키운다)
const c = document.getElementById('room'), g = c.getContext('2d'); g.scale(4, 4); // 200×110 좌표로 그리고 4배로 — 글자가 또렷하게
const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
let t = 0;
function draw() {
  R(0, 0, 200, 70, '#f6e7d4'); for (let x = 0; x < 200; x += 8) R(x, 0, 1, 70, '#efdcc5');   // 벽
  R(0, 70, 200, 40, '#c99a6b'); for (let x = 0; x < 200; x += 16) R(x, 70, 1, 40, '#b88a5c'); // 마루
  R(14, 10, 40, 26, '#8fc5ea'); R(14, 10, 40, 2, '#fff'); R(33, 10, 2, 26, '#fff'); R(14, 22, 40, 2, '#fff'); // 창문
  R(150, 12, 34, 22, '#050608'); g.fillStyle = '#fff'; g.font = '900 15px Nanum Gothic, sans-serif'; g.textAlign = 'center'; g.fillText('S', 167, 29); g.textAlign = 'left'; // 로고 액자
  R(72, 14, 60, 18, '#fffdf6'); R(72, 14, 60, 1, '#d9c9b0'); g.fillStyle = '#c0582a'; g.font = '700 7px Nanum Gothic, sans-serif'; g.textAlign = 'center'; g.fillText('오늘도 무사 배포', 102, 26); g.textAlign = 'left'; // 칠판
  const PEOPLE = ${JSON.stringify(ROOM)};
  PEOPLE.forEach(([name, col, x], i) => {
    const bob = Math.round(Math.sin(t / 8 + i) * 0.8);
    R(x - 9, 66, 22, 3, '#8a5a34'); R(x - 8, 69, 2, 12, '#6e4527'); R(x + 10, 69, 2, 12, '#6e4527'); // 책상
    R(x - 4, 56, 12, 9, '#2b2f36'); R(x - 3, 57, 10, 7, (t + i * 5) % 20 < 10 ? '#7fd6ff' : '#9be7c4'); R(x + 1, 65, 2, 1, '#2b2f36'); // 모니터
    R(x + 1, 74 + bob, 6, 6, '#ffd8b5'); R(x + 1, 73 + bob, 6, 2, '#3a2a20'); R(x + 2, 76 + bob, 1, 1, '#222'); R(x + 5, 76 + bob, 1, 1, '#222'); // 머리
    R(x, 80 + bob, 8, 8, col); R(x + 1, 88, 2, 4, '#3b3f48'); R(x + 5, 88, 2, 4, '#3b3f48'); // 몸·다리
    g.font = '700 6px Nanum Gothic, sans-serif'; const tw = g.measureText(name).width + 6; g.fillStyle = '#fff'; g.fillRect(x + 4 - tw / 2, 95, tw, 9); g.fillStyle = '#333'; g.textAlign = 'center'; g.fillText(name, x + 4, 101.5); g.textAlign = 'left';
  });
  R(186, 54, 8, 16, '#3f8a4f'); R(184, 48, 12, 8, '#56b06a'); R(187, 70, 6, 6, '#a0522d'); // 화분
}
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
document.fonts.ready.then(draw); draw(); if (!reduce) setInterval(() => { t++; draw(); }, 120);
</script>
</body>
</html>
`;
}
