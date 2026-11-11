/**
 * /team — 가상의 회사 "seeplore 스튜디오"를 위에서 내려다본 픽셀 사무실(오리지널 그림, canvas). 방마다 팀, 책상마다 팀원.
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
  const by = Object.fromEntries(all.map((m) => [m.name, m]));
  const memberCount = all.length + works.length;
  // 사무실 배치 (논리 좌표 320×210, 화면에서 4배로 그림)
  const ROOMS = [
    ['대표실', 0, 0, 56, 70, '#ecd2a8'],
    ['기획실', 56, 0, 56, 70, '#d3e6f6'],
    ['홍보팀', 112, 0, 128, 70, '#f6dcdc'],
    ['음성 부스', 240, 0, 80, 70, '#e6daf4'],
    [`제작본부 · 작품 ${works.length}편`, 0, 70, 240, 92, '#f4e6c8'],
    ['품질관리', 240, 70, 80, 46, '#d9efdd'],
    ['서버실', 240, 116, 80, 46, '#d8dee6'],
    ['휴게실', 0, 162, 320, 48, '#e6f0dc'],
  ];
  const PEOPLE = [
    // [팀원 이름, 이름표, 옷 색, x, y]
    ['대표', '대표', '#ff7a3d', 26, 34],
    ['기획 담당', 'Gemini', '#4f86e8', 82, 34],
    ['홍보팀장', '홍보팀장', '#d97757', 128, 34],
    ['블로그 작가', '블로그', '#d97757', 158, 34],
    ['쇼츠 PD', '쇼츠 PD', '#d97757', 188, 34],
    ['업로드 봇', '업로드 봇', '#4caf7a', 218, 34],
    ['내레이터', 'Aoede', '#a865d8', 278, 34],
    ['점검 로봇', '점검 로봇', '#4caf7a', 278, 96],
  ];
  const OBJECTS = [
    ['서류함', 'GitHub', 258, 128],
    ['건물 관리', 'Vercel', 290, 128],
  ];
  const WORKS = works.map((w, i) => ({ id: w.id, title: w.title, url: w.url, icon: w.icon.replace(SITE, ''), x: 26 + (i % 5) * 46, y: 84 + Math.floor(i / 5) * 19.5 })); // x = 책상 가운데
  const INFO = Object.fromEntries(all.map((m) => [m.name, { name: m.name, who: m.who, tool: m.tool, does: m.does, mood: m.mood }]));
  const card = (m) => `<li class="m"><b>${esc(m.name)}</b> <span>${esc(m.who)} · ${esc(m.tool)}</span><p>${esc(m.does)}</p></li>`;
  const logRows = LOG.map(([d, who, t]) => `<li><time>${esc(d)}</time><b>${esc(who)}</b><span>${esc(t)}</span></li>`).join('');

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-TBYJ6JBLYF"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-TBYJ6JBLYF',{content_group:'hub'});</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>seeplore 스튜디오</title>
<meta name="description" content="seeplore를 만드는 가상의 회사를 위에서 내려다본 픽셀 사무실. 대표 한 명과 AI 팀원들(Claude, Gemini, Google TTS 등)이 방마다 맡은 일을 합니다.">
<link rel="canonical" href="${SITE}/team">
<meta property="og:title" content="seeplore 스튜디오 — 대표 1명과 AI 팀원들의 사무실">
<meta property="og:description" content="seeplore 웹 다큐 시리즈를 만드는 가상의 회사. 작품마다 담당 AI가 한 명씩.">
<meta property="og:url" content="${SITE}/team">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Nanum+Gothic:wght@400;700;800&display=swap">
<style>
/* 위에서 내려다본 픽셀 사무실 + 아래 상태판. 따뜻한 나무색 바탕 */
:root { --bg: #f7efe2; --panel: #fffaf2; --line: #e2cfb1; --ink: #3d3328; --soft: #8a7a66; --accent: #e8752a; --ok: #3f9a5e; --body: 'Nanum Gothic', 'Apple SD Gothic Neo', sans-serif; color-scheme: light; }
* { box-sizing: border-box; }
html, body { margin: 0; }
body { background: var(--bg); color: var(--ink); font: 13px/1.6 var(--body); padding-block: 14px 40px; padding-left: max(12px, env(safe-area-inset-left, 0px)); padding-right: max(12px, env(safe-area-inset-right, 0px)); word-break: keep-all; }
.wrap { max-width: 1000px; margin: 0 auto; display: grid; gap: 10px; }
.head { display: flex; justify-content: space-between; align-items: baseline; flex-wrap: wrap; gap: 6px 12px; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 8px 12px; }
.head b { font-size: 14px; } .head span { color: var(--soft); font-size: 12px; } .head a { color: var(--accent); font-size: 12px; }
.mapbox { position: relative; background: #8b5e3c; border-radius: 10px; padding: 6px; overflow-x: auto; }
.mapin { position: relative; min-width: 640px; }
#office { width: 100%; height: auto; display: block; image-rendering: pixelated; border-radius: 4px; cursor: default; }
.tip { position: absolute; z-index: 2; max-width: 240px; background: #fff; border: 1px solid var(--line); border-radius: 8px; padding: 8px 10px; font-size: 12px; box-shadow: 0 4px 14px rgba(60,40,20,.18); pointer-events: none; }
.tip b { display: block; } .tip .t { color: var(--soft); font-size: 11px; } .tip p { margin: 4px 0 0; }
.status { display: flex; gap: 8px; align-items: center; background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 6px 12px; font-size: 12px; }
.status i { width: 8px; height: 8px; border-radius: 50%; background: var(--ok); flex: none; }
.grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 10px; }
.box { background: var(--panel); border: 1px solid var(--line); border-radius: 10px; padding: 10px 12px; min-width: 0; }
h2 { margin: 0 0 6px; font-size: 13px; }
ul { list-style: none; margin: 0; padding: 0; }
.next li { display: flex; justify-content: space-between; gap: 10px; padding: 5px 0; border-bottom: 1px dotted var(--line); }
.next time { font-weight: 800; color: var(--accent); font-variant-numeric: tabular-nums; white-space: nowrap; }
.log li { display: grid; grid-template-columns: 40px 70px minmax(0, 1fr); gap: 6px; padding: 4px 0; border-bottom: 1px dotted var(--line); }
.log time { color: var(--soft); font-variant-numeric: tabular-nums; } .log b { color: var(--accent); }
.team { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 8px; }
.m { border: 1px solid var(--line); border-radius: 8px; padding: 8px; background: #fff; }
.m span { color: var(--soft); font-size: 11px; } .m p { margin: 4px 0 0; }
.note { color: var(--soft); font-size: 12px; margin: 0 0 8px; }
.foot { text-align: center; color: var(--soft); font-size: 11px; } .foot a { color: var(--soft); }
@media (max-width: 700px) { .grid { grid-template-columns: 1fr; } .log li { grid-template-columns: 36px minmax(0, 1fr); } .log li span { grid-column: 2; } }
</style>
</head>
<body>
<div class="wrap">
  <div class="head"><div><b>seeplore 스튜디오</b> <span>가상의 회사 · 대표 1명, 나머지는 다 AI · 팀원 ${memberCount}</span></div><a href="/">seeplore.com →</a></div>
  <div class="mapbox"><div class="mapin">
    <canvas id="office" width="1280" height="840" role="img" aria-label="위에서 내려다본 seeplore 스튜디오 사무실. 대표실, 기획실(Gemini), 홍보팀(Claude 넷), 음성 부스(Aoede), 작품 ${works.length}개를 맡은 제작본부, 품질관리, 서버실, 휴게실이 있다."></canvas>
    <div class="tip" id="tip" hidden></div>
  </div></div>
  <div class="status"><i></i><span id="st">팀원을 눌러 보세요(PC는 마우스를 올리면). 제작본부 책상을 누르면 그 작품으로 갑니다. 휴대폰에서는 지도를 옆으로 밀어 보세요.</span></div>
  <div class="grid">
    <div class="box"><h2>다음 일정</h2><ul class="next" id="next"></ul><p class="note" style="margin:6px 0 0">시간은 한국 시각. 실제로 예약돼 돌아가는 일정입니다.</p></div>
    <div class="box"><h2>업무일지</h2><ul class="log">${logRows}</ul></div>
  </div>
  <div class="box">
    <h2>팀원</h2>
    <p class="note">사람은 대표 한 명. 나머지는 실제로 쓰는 AI·도구입니다. 제작본부는 작품 하나에 Claude 하나씩 ${works.length}명.</p>
    <ul class="team">${all.map(card).join('')}</ul>
  </div>
  <p class="foot">ⓒ seeplore · <a href="/about">회사 소개</a> · <a href="${BLOG}">블로그</a> · <a href="https://www.youtube.com/@seeplore">YouTube</a> · AI 도구 이름은 각 회사의 상표입니다</p>
</div>
<script>
const ROOMS = ${JSON.stringify(ROOMS)};
const PEOPLE = ${JSON.stringify(PEOPLE)};
const OBJECTS = ${JSON.stringify(OBJECTS)};
const WORKS = ${JSON.stringify(WORKS)};
const INFO = ${JSON.stringify(INFO)};
const c = document.getElementById('office'), g = c.getContext('2d');
g.scale(4, 4); g.imageSmoothingEnabled = false;
const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
const txt = (s, x, y, size, col, align = 'center', weight = 700) => { g.font = weight + ' ' + size + 'px Nanum Gothic, sans-serif'; g.fillStyle = col; g.textAlign = align; g.fillText(s, x, y); };
const tag = (s, x, y) => { g.font = '700 4.5px Nanum Gothic, sans-serif'; const w = g.measureText(s).width + 4; R(x - w / 2, y, w, 6.5, 'rgba(255,255,255,.92)'); R(x - w / 2, y + 6.5, w, 0.5, '#c9b08c'); txt(s, x, y + 4.8, 4.5, '#3d3328'); };
const icons = {};
for (const w of WORKS) { const im = new Image(); im.src = w.icon; im.onload = () => (icons[w.id] = im); }
function desk(x, y, w = 18) { R(x - w / 2, y, w, 7, '#b07b4f'); R(x - w / 2, y + 7, w, 1, '#8a5a34'); R(x - 4, y - 5, 8, 6, '#2b2f36'); R(x - 3, y - 4, 6, 4, '#86d3f5'); }
function person(x, y, col, t, i) {
  const bob = Math.round(Math.sin(t / 6 + i) * 0.6);
  R(x - 3, y + 6, 6, 3, '#6b4a2e');               // 의자
  R(x - 3, y + 1 + bob, 6, 5, col);                // 몸
  R(x - 2, y - 3 + bob, 4, 4, '#ffd9b8');           // 머리
  R(x - 2, y - 4 + bob, 4, 1.5, '#3a2a20');         // 머리카락
}
function plant(x, y) { R(x - 2, y + 2, 4, 3, '#a05a2c'); R(x - 3, y - 2, 6, 4, '#4f9a5c'); R(x - 1, y - 4, 2, 2, '#6cc07a'); }
let t = 0, bubble = null;
function draw() {
  R(0, 0, 320, 210, '#8b5e3c');
  for (const [name, x, y, w, h, col] of ROOMS) {
    R(x + 1, y + 1, w - 2, h - 2, col);
    for (let yy = y + 1; yy < y + h - 1; yy += 6) R(x + 1, yy, w - 2, 0.4, 'rgba(0,0,0,.05)');
    txt(name, x + 4, y + 7, 5, '#5a4632', 'left', 800);
  }
  // 대표실·기획실
  desk(26, 22, 22); plant(48, 60); R(6, 50, 12, 14, '#c28b5a'); txt('결재', 12, 58, 3.5, '#fff');
  desk(82, 22, 20); R(62, 12, 14, 9, '#fffdf6'); R(64, 14, 6, 1, '#4f86e8'); R(64, 17, 9, 1, '#4f86e8'); plant(104, 60);
  // 홍보팀 책상 넷
  for (const x of [128, 158, 188, 218]) desk(x, 22);
  R(140, 54, 76, 11, '#fff'); txt('블로그 화·금 · 쇼츠 08:47', 178, 61.5, 4.5, '#e8752a'); tag('봇 자리', 218, 33);
  // 음성 부스
  R(262, 18, 32, 26, '#cbb8e6'); R(264, 20, 28, 22, '#efe6fb'); R(277, 22, 2, 8, '#555'); R(275, 20, 6, 3, '#333'); txt('ON AIR', 280, 56, 4.5, '#a865d8', 'center', 800);
  // 제작본부 — 작품마다 책상 하나
  WORKS.forEach((w, i) => {
    R(w.x - 12, w.y + 2, 24, 7, '#b07b4f'); R(w.x - 12, w.y + 9, 24, 1, '#8a5a34');   // 책상
    R(w.x - 6, w.y - 4, 12, 10, '#2b2f36');                                            // 모니터
    const im = icons[w.id]; if (im) g.drawImage(im, w.x - 5, w.y - 3, 10, 8); else R(w.x - 5, w.y - 3, 10, 8, '#86d3f5');
    person(w.x + 17, w.y + 4, '#d97757', t, i + 10);                                    // 담당(Claude) — 책상 옆
  });
  // 품질관리
  desk(278, 84, 22); R(300, 82, 12, 18, '#fff'); for (let k = 0; k < 4; k++) R(302, 84 + k * 4, 8, 2, k % 2 ? '#3f9a5e' : '#e8752a');
  // 서버실
  R(250, 126, 16, 22, '#6b7380'); for (let k = 0; k < 5; k++) R(252, 128 + k * 4, 12, 2, '#9aa4b2');
  R(282, 124, 16, 26, '#2f343c'); for (let k = 0; k < 6; k++) R(284, 126 + k * 4, 12, 2, (t + k) % 6 < 3 ? '#4cd17a' : '#1c2026');
  for (const [, label, x, y] of OBJECTS) tag(label, x, y + 24);
  // 휴게실
  R(14, 176, 40, 12, '#7aa7c7'); R(14, 172, 40, 5, '#5f8fb0'); R(70, 178, 18, 10, '#b07b4f'); R(76, 180, 5, 4, '#fff');
  plant(110, 186); plant(304, 186); R(200, 172, 30, 22, '#ffffff'); txt('커피', 215, 186, 5, '#8b5e3c');
  // 업로드 봇이 복도(휴게실)를 오간다
  const bx = 130 + Math.sin(t / 30) * 50;
  // 사람들
  PEOPLE.forEach(([key, label, col, x, y], i) => {
    if (key === '업로드 봇') { person(bx, 190, col, t, i); tag(label, bx, 196); return; }
    person(x, y, col, t, i); tag(label, x, y + 10);
  });
  // 말풍선
  if (bubble) {
    const s = bubble.text; g.font = '700 5px Nanum Gothic, sans-serif'; const w = Math.min(g.measureText(s).width + 8, 120);
    const x = Math.max(4, Math.min(316 - w, bubble.x - w / 2)), y = Math.max(2, bubble.y - 20);
    R(x, y, w, 10, '#fff'); R(x, y + 10, w, 0.6, '#c9b08c'); R(bubble.x - 1, y + 10, 2, 3, '#fff');
    txt(s, x + w / 2, y + 7, 5, '#3d3328');
  }
}
// 말풍선: 몇 초마다 한 사람이 '오늘의 기분'을 말한다
function nextBubble() {
  const pool = PEOPLE.filter(([k]) => INFO[k]);
  const [key, , , x, y] = pool[Math.floor(Math.random() * pool.length)];
  bubble = { text: INFO[key].mood, x: key === '업로드 봇' ? 130 + Math.sin(t / 30) * 50 : x, y: key === '업로드 봇' ? 190 : y };
}
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
nextBubble(); document.fonts.ready.then(draw); draw();
if (!reduce) { setInterval(() => { t++; draw(); }, 100); setInterval(nextBubble, 3500); }
// 손가락·마우스: 팀원 설명, 작품 책상은 눌러서 이동
const tip = document.getElementById('tip');
function hit(ev) {
  const r = c.getBoundingClientRect(), k = 320 / r.width;
  const x = (ev.clientX - r.left) * k, y = (ev.clientY - r.top) * k;
  for (const w of WORKS) if (x > w.x - 13 && x < w.x + 22 && y > w.y - 5 && y < w.y + 13) return { work: w, px: w.x, py: w.y };
  for (const [key, , , px, py] of PEOPLE) { const X = key === '업로드 봇' ? 130 + Math.sin(t / 30) * 50 : px, Y = key === '업로드 봇' ? 190 : py; if (Math.abs(x - X) < 10 && Math.abs(y - Y) < 12) return { key, px: X, py: Y }; }
  for (const [key, , px, py] of OBJECTS) if (x > px - 10 && x < px + 18 && y > py - 2 && y < py + 30) return { key, px, py };
  return null;
}
function showTip(h) {
  if (!h) { tip.hidden = true; c.style.cursor = 'default'; return; }
  const r = c.getBoundingClientRect(), s = r.width / 320;
  if (h.work) { tip.innerHTML = '<b>' + h.work.title + ' 담당</b><span class="t">Claude · 누르면 작품으로</span>'; c.style.cursor = 'pointer'; }
  else { const m = INFO[h.key]; tip.innerHTML = '<b>' + m.name + '</b><span class="t">' + m.who + ' · ' + m.tool + '</span><p>' + m.does + '</p>'; c.style.cursor = 'default'; }
  tip.hidden = false;
  const left = Math.min(r.width - tip.offsetWidth - 4, Math.max(4, h.px * s - tip.offsetWidth / 2));
  tip.style.left = left + 'px'; tip.style.top = Math.max(4, h.py * s - tip.offsetHeight - 14) + 'px';
}
c.addEventListener('pointermove', (e) => showTip(hit(e)));
c.addEventListener('pointerleave', () => showTip(null));
c.addEventListener('click', (e) => { const h = hit(e); if (h && h.work) location.href = h.work.url; else showTip(h); });
// 다음 일정 (한국 시각): 블로그 공개 화·금 08:47, 쇼츠 업로드 매일 08:47, 주간 글쓰기 일 21:13
function nextAt(days, hh, mm) {
  const now = new Date(Date.now() + 9 * 3600e3); // KST 를 UTC 칸에
  for (let d = 0; d < 8; d++) {
    const x = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + d, hh, mm));
    if (days.includes(x.getUTCDay()) && x > now) return x;
  }
}
const W = '일월화수목금토';
const fmt = (x) => (x.getUTCMonth() + 1) + '.' + x.getUTCDate() + '(' + W[x.getUTCDay()] + ') ' + String(x.getUTCHours()).padStart(2, '0') + ':' + String(x.getUTCMinutes()).padStart(2, '0');
const NEXT = [['업로드 봇 · 날짜 된 글 공개, 쇼츠 업로드', [0, 1, 2, 3, 4, 5, 6], 8, 47], ['블로그 작가 · 블로그 글 공개일', [2, 5], 8, 47], ['블로그 작가 · 다음 주 글 2편 쓰기', [0], 21, 13]];
document.getElementById('next').innerHTML = NEXT.map(([what, d, h, m]) => '<li><span>' + what + '</span><time>' + fmt(nextAt(d, h, m)) + '</time></li>').join('');
</script>
</body>
</html>
`;
}
