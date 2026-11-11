/**
 * /team — 가상의 회사 "seeplore 스튜디오"의 밤 사무실(위에서 내려다본 그림). 허브와 같은 검정 바탕.
 * 가구·사람 그림: Kenney Roguelike Indoor / Roguelike Characters (CC0, public/team/). 모니터·벽·바닥은 코드로 그린다.
 * 말풍선: 예약 일정에서 계산한 상태(업로드·글 공개) + 맡은 일. 지어낸 숫자는 쓰지 않는다.
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
  const INFO = Object.fromEntries(all.map((m) => [m.name, { name: m.name, who: m.who, tool: m.tool, does: m.does }]));
  const WORKS = works.map((w) => ({ id: w.id, title: w.title, url: w.url, icon: w.icon.replace(SITE, '') }));
  const card = (m) => `<li><b>${esc(m.name)}</b><span>${esc(m.who)} · ${esc(m.tool)}</span><p>${esc(m.does)}</p></li>`;
  const logRows = LOG.map(([d, who, t]) => `<li><time>${esc(d)}</time><b>${esc(who)}</b><span>${esc(t)}</span></li>`).join('');

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-TBYJ6JBLYF"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-TBYJ6JBLYF',{content_group:'hub'});</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#050608">
<title>seeplore 스튜디오</title>
<meta name="description" content="seeplore를 만드는 가상의 회사. 대표 한 명과 AI 팀원들(Claude, Gemini, Google TTS 등)이 방마다 맡은 일을 합니다.">
<link rel="canonical" href="${SITE}/team">
<meta property="og:title" content="seeplore 스튜디오 — 대표 1명과 AI 팀원들">
<meta property="og:description" content="seeplore 웹 다큐 시리즈를 만드는 가상의 회사. 작품마다 담당 AI가 한 명씩.">
<meta property="og:url" content="${SITE}/team">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png">
<style>
:root { --bg: #050608; --panel: #0c0f13; --text: #f3f5f7; --muted: #9aa3ab; --border: rgba(255,255,255,.12); --accent: #ffd24a; --ok: #4cd17a;
  color-scheme: dark; font-family: 'Pretendard', 'Noto Sans KR', system-ui, -apple-system, sans-serif; color: var(--text); }
* { box-sizing: border-box; }
html, body { margin: 0; background: var(--bg); }
body { padding-block: calc(env(safe-area-inset-top, 0px) + 28px) 56px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); word-break: keep-all; }
.wrap { max-width: 1040px; margin: 0 auto; display: grid; gap: 14px; }
.back { font-size: 14px; color: var(--muted); text-decoration: none; }
.kicker { margin: 6px 0 0; font-size: 14px; font-weight: 600; color: var(--muted); }
h1 { margin: 4px 0 0; font-size: clamp(34px, 8vw, 56px); line-height: 1.05; font-weight: 900; letter-spacing: -0.04em; }
.lead { margin: 10px 0 0; font-size: 15px; line-height: 1.7; color: #c9d0d6; max-width: 640px; }
.map { position: relative; border: 1px solid var(--border); border-radius: 14px; overflow-x: auto; background: #07090c; }
.mapin { position: relative; min-width: 700px; }
#office { display: block; width: 100%; height: auto; image-rendering: pixelated; }
.tip { position: absolute; z-index: 2; max-width: 250px; background: #11151a; border: 1px solid var(--border); border-radius: 10px; padding: 9px 11px; font-size: 12.5px; line-height: 1.55; box-shadow: 0 8px 24px rgba(0,0,0,.5); pointer-events: none; }
.tip b { display: block; font-size: 13.5px; } .tip .t { color: var(--muted); font-size: 11.5px; } .tip p { margin: 4px 0 0; color: #c9d0d6; }
.hint { margin: 0; font-size: 12.5px; color: var(--muted); }
.cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px; }
.box { border: 1px solid var(--border); border-radius: 14px; padding: 14px 16px; background: rgba(255,255,255,.02); min-width: 0; }
h2 { margin: 0 0 8px; font-size: 15px; letter-spacing: -0.01em; }
ul { list-style: none; margin: 0; padding: 0; }
.next li { display: flex; justify-content: space-between; gap: 12px; padding: 7px 0; border-bottom: 1px solid var(--border); font-size: 13.5px; color: #c9d0d6; }
.next li:last-child { border-bottom: 0; }
.next time { color: var(--accent); font-weight: 700; font-variant-numeric: tabular-nums; white-space: nowrap; }
.log li { display: grid; grid-template-columns: 44px 78px minmax(0, 1fr); gap: 8px; padding: 6px 0; border-bottom: 1px solid var(--border); font-size: 13px; color: #c9d0d6; }
.log li:last-child { border-bottom: 0; }
.log time { color: var(--muted); font-variant-numeric: tabular-nums; } .log b { color: var(--text); }
.team { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; }
.team li { border: 1px solid var(--border); border-radius: 12px; padding: 10px 12px; }
.team b { font-size: 14px; } .team span { display: block; color: var(--muted); font-size: 12px; } .team p { margin: 6px 0 0; font-size: 13px; line-height: 1.6; color: #c9d0d6; }
.note { margin: 0 0 10px; font-size: 13px; color: var(--muted); }
footer { font-size: 12px; line-height: 1.7; color: #6f777e; } footer a { color: #6f777e; }
@media (max-width: 720px) { .cols { grid-template-columns: 1fr; } .log li { grid-template-columns: 40px minmax(0, 1fr); } .log li span { grid-column: 2; } }
</style>
</head>
<body>
<div class="wrap">
  <a class="back" href="/">← seeplore</a>
  <div>
    <p class="kicker">가상의 회사 · 사람 1명, AI 팀원 ${memberCount - 1}</p>
    <h1>seeplore 스튜디오</h1>
    <p class="lead">seeplore를 실제로 이렇게 나눠서 만들고 있어서 회사처럼 꾸며 봤습니다. 대표 한 명이 정하고, 나머지는 AI와 자동화 도구가 맡습니다. 말풍선은 예약된 일정에서 계산한 지금 상태입니다.</p>
  </div>
  <div class="map"><div class="mapin">
    <canvas id="office" width="1024" height="768" role="img" aria-label="위에서 내려다본 밤의 seeplore 스튜디오. 대표실, 기획실(Gemini), 홍보팀(Claude 셋과 봇), 음성 부스(Aoede), 작품 ${works.length}개를 맡은 제작본부, 품질관리, 서버실, 휴게실."></canvas>
    <div class="tip" id="tip" hidden></div>
  </div></div>
  <p class="hint">팀원을 누르면(PC는 마우스를 올리면) 하는 일이 보입니다. 제작본부 책상을 누르면 그 작품으로 갑니다. 휴대폰에서는 그림을 옆으로 밀어 보세요.</p>
  <div class="cols">
    <div class="box"><h2>다음 일정</h2><ul class="next" id="next"></ul></div>
    <div class="box"><h2>업무일지</h2><ul class="log">${logRows}</ul></div>
  </div>
  <div class="box">
    <h2>팀원</h2>
    <p class="note">사람은 대표 한 명. 나머지는 실제로 쓰는 AI와 도구입니다. 제작본부는 작품 하나에 Claude 하나씩 ${works.length}명.</p>
    <ul class="team">${all.map(card).join('')}</ul>
  </div>
  <footer>가구·사람 그림: Kenney Roguelike Indoor · Roguelike Characters (CC0) · <a href="/about">seeplore 소개</a> · <a href="${BLOG}">블로그</a> · <a href="https://www.youtube.com/@seeplore">YouTube</a> · AI 도구 이름은 각 회사의 상표입니다</footer>
</div>
<script>
const WORKS = ${JSON.stringify(WORKS)};
const INFO = ${JSON.stringify(INFO)};
const c = document.getElementById('office'), g = c.getContext('2d');
const T = 16, S = 2;                       // 타일 16px, 화면 2배 (논리 512×384 = 32×24 타일)
g.scale(S, S); g.imageSmoothingEnabled = false;
const load = (src) => new Promise((r) => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = src; });
const tile = (sheet, cx, cy, x, y, w = 1, h = 1) => sheet && g.drawImage(sheet, cx * 17, cy * 17, w * 17 - 1, h * 17 - 1, x, y, w * 16, h * 16);
const R = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
const text = (s, x, y, size, col, align = 'center', w = 700) => { g.font = w + ' ' + size + 'px Pretendard, "Noto Sans KR", sans-serif'; g.fillStyle = col; g.textAlign = align; g.fillText(s, x, y); };

// ---- 지금 상태 (한국 시각, 실제 예약 일정) ----
const kst = () => new Date(Date.now() + 9 * 3600e3);
function nextAt(days, hh, mm) { const n = kst(); for (let d = 0; d < 8; d++) { const x = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + d, hh, mm)); if (days.includes(x.getUTCDay()) && x > n) return x; } }
const DAY = '일월화수목금토';
const md = (x) => (x.getUTCMonth() + 1) + '.' + x.getUTCDate() + '(' + DAY[x.getUTCDay()] + ')';
const hm = (x) => String(x.getUTCHours()).padStart(2, '0') + ':' + String(x.getUTCMinutes()).padStart(2, '0');
function status(key) {
  const n = kst(), h = n.getUTCHours(), dow = n.getUTCDay();
  const up = nextAt([0, 1, 2, 3, 4, 5, 6], 8, 47), post = nextAt([2, 5], 8, 47), write = nextAt([0], 21, 13);
  switch (key) {
    case '업로드 봇': return (h === 8 && n.getUTCMinutes() >= 47 && n.getUTCMinutes() < 55) ? '올리는 중' : hm(up) + ' 실행 대기';
    case '블로그 작가': return (dow === 0 && h >= 21) ? '다음 주 글 쓰는 중' : md(post) + ' 글 공개 대기';
    case '쇼츠 PD': return (dow === 0 && h >= 21) ? '쇼츠 렌더링 중' : '쇼츠 자막 검토 중';
    case '홍보팀장': return h < 9 ? '오늘 공개분 확인 중' : '검색 색인 확인 중';
    case '대표': return '결재 대기 중';
    case '기획 담당': return '다음 주제 검토 중';
    case '내레이터': return '다음 원고 대기';
    case '점검 로봇': return '장면 점검 대기';
    default: return '';
  }
}

// ---- 사무실 배치 (타일 단위, 40×26) ----
const ROOMS = [
  ['대표실', 0, 0, 6, 7], ['기획실', 6, 0, 6, 7], ['홍보팀', 12, 0, 13, 7], ['음성 부스', 25, 0, 7, 7],
  ['제작본부 · 작품 ' + WORKS.length + '편', 0, 7, 23, 12], ['품질관리', 23, 7, 9, 6], ['서버실', 23, 13, 9, 6], ['휴게실', 0, 19, 32, 5],
];
// 팀원: [팀원 이름, 이름표, 캐릭터(시트 칸 x,y), 책상 타일 x,y]
const PEOPLE = [
  ['대표', '대표', [0, 9], 2, 2.6],
  ['기획 담당', 'Gemini', [1, 6], 8, 2.6],
  ['홍보팀장', '홍보팀장', [0, 5], 13, 2.6],
  ['블로그 작가', '블로그', [0, 7], 16, 2.6],
  ['쇼츠 PD', '쇼츠 PD', [1, 7], 19, 2.6],
  ['업로드 봇', '업로드 봇', [1, 11], 22, 2.6],
  ['내레이터', 'Aoede', [1, 5], 27.5, 2.6],
  ['점검 로봇', '점검 로봇', [1, 11], 26.5, 9.2],
];
const DESK = WORKS.map((w, i) => ({ ...w, tx: 1.2 + (i % 5) * 4.4, ty: 9 + Math.floor(i / 5) * 2.4 }));
const WORK_CHARS = [[0, 5], [0, 6], [1, 6], [0, 7], [1, 7], [0, 8], [1, 8], [0, 9], [1, 9], [0, 10]];

let indoor, chars; const icons = {};
function monitor(x, y, glow, icon) {
  R(x + 3, y - 9, 12, 9, '#1b1f26'); R(x + 4, y - 8, 10, 7, glow);
  if (icon) g.drawImage(icon, x + 5, y - 8, 8, 7);
  R(x + 8, y, 2, 2, '#1b1f26');
  g.fillStyle = 'rgba(120,200,255,.06)'; g.beginPath(); g.ellipse(x + 9, y + 4, 14, 8, 0, 0, 7); g.fill(); // 화면 불빛
}
function desk(tx, ty, icon) {
  const x = tx * T, y = ty * T;
  tile(indoor, 0, 0, x, y); tile(indoor, 2, 0, x + T, y);
  monitor(x + 7, y + 6, '#7cc6ff', icon);
}
function person(ch, tx, ty) { tile(chars, ch[0], ch[1], tx * T + 8, ty * T + 13); }
function nameTag(s, cx, y) {
  g.font = '700 7px Pretendard, "Noto Sans KR", sans-serif'; const w = g.measureText(s).width + 8;
  R(cx - w / 2, y, w, 10, 'rgba(0,0,0,.72)'); text(s, cx, y + 7.5, 7, '#e9edf1');
}
function bubble(s, cx, y) {
  g.font = '700 7px Pretendard, "Noto Sans KR", sans-serif'; const w = g.measureText(s).width + 16;
  const x = Math.max(2, Math.min(510 - w, cx - w / 2)), by = Math.max(2, y - 16);
  R(x, by, w, 12, '#f3f5f7'); R(cx - 1.5, by + 12, 3, 3, '#f3f5f7');
  g.fillStyle = '#4cd17a'; g.beginPath(); g.arc(x + 5, by + 6, 1.8, 0, 7); g.fill();
  text(s, x + 10, by + 8.5, 7, '#111', 'left');
}
let bubbleKey = '대표', t = 0;
function draw() {
  R(0, 0, 512, 384, '#0a0c10');
  for (const [name, x, y, w, h] of ROOMS) {
    R(x * T + 2, y * T + 2, w * T - 4, h * T - 4, '#151a21');                                   // 바닥
    for (let yy = y * T + 2; yy < (y + h) * T - 2; yy += 8) R(x * T + 2, yy, w * T - 4, 1, 'rgba(255,255,255,.025)');
    R(x * T + 2, y * T + 2, w * T - 4, 3, '#222a33');                                           // 벽 윗선
    text(name, x * T + 8, y * T + 15, 8, '#9aa3ab', 'left', 800);
  }
  if (!indoor || !chars) return;
  // 소품 (Kenney 타일)
  tile(indoor, 23, 0, 0.4 * T, 1.2 * T); tile(indoor, 24, 0, 1.4 * T, 1.2 * T);             // 대표실 책장
  tile(indoor, 16, 0, 4.6 * T, 5 * T); tile(indoor, 17, 0, 10.6 * T, 5 * T); tile(indoor, 16, 0, 23.6 * T, 5 * T); // 화분
  tile(indoor, 19, 12, 6.6 * T, 4.6 * T); tile(indoor, 20, 12, 7.6 * T, 4.6 * T);                 // 기획실 기획안 액자
  tile(indoor, 23, 8, 25.6 * T, 4.8 * T, 2, 1);                                                   // 음성 부스 녹음 장비
  for (let k = 0; k < 3; k++) { tile(indoor, 25 + (k % 2), 8, (24.4 + k * 2.4) * T, 14.8 * T, 1, 2); for (let j = 0; j < 4; j++) R((24.4 + k * 2.4) * T + 5, 14.8 * T + 6 + j * 6, 3, 2, (t + j + k) % 5 < 3 ? '#4cd17a' : '#1f6b3b'); }
  nameTag('GitHub · Vercel', 27.4 * T, 17.3 * T);
  tile(indoor, 0, 12, 2 * T, 20.4 * T, 3, 1); tile(indoor, 5, 12, 5 * T, 20.4 * T);               // 휴게실 커피 카운터
  tile(indoor, 3, 0, 10 * T, 21 * T); tile(indoor, 1, 2, 9 * T, 21 * T); tile(indoor, 3, 2, 11 * T, 21 * T); // 둥근 탁자·의자
  tile(indoor, 3, 0, 15 * T, 21 * T); tile(indoor, 1, 2, 14 * T, 21 * T); tile(indoor, 3, 2, 16 * T, 21 * T);
  tile(indoor, 16, 0, 20 * T, 21.4 * T); tile(indoor, 17, 0, 30.6 * T, 21.4 * T);
  // 제작본부: 작품마다 책상 + 담당 Claude
  DESK.forEach((d, i) => { desk(d.tx, d.ty, icons[d.id]); person(WORK_CHARS[i % WORK_CHARS.length], d.tx, d.ty); });
  // 팀원
  for (const [key, label, ch, tx, ty] of PEOPLE) { desk(tx, ty, null); person(ch, tx, ty); nameTag(label, tx * T + 16, ty * T + 31); }
  // 말풍선
  const p = PEOPLE.find((q) => q[0] === bubbleKey);
  if (p) bubble(status(p[0]), p[3] * T + 16, p[4] * T + 4);
}
Promise.all([load('/team/indoor.png'), load('/team/chars.png'), ...WORKS.map((w) => load(w.icon).then((im) => (icons[w.id] = im)))]).then(([a, b]) => { indoor = a; chars = b; draw(); });
draw();
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
let bi = 0;
setInterval(() => { t++; if (!reduce && t % 30 === 0) { bi = (bi + 1) % PEOPLE.length; bubbleKey = PEOPLE[bi][0]; } draw(); }, 100);

// 누르기·마우스: 설명, 작품 책상은 이동
const tip = document.getElementById('tip');
function hit(ev) {
  const r = c.getBoundingClientRect(), k = 512 / r.width, x = (ev.clientX - r.left) * k, y = (ev.clientY - r.top) * k;
  for (const d of DESK) if (x > d.tx * T && x < d.tx * T + 34 && y > d.ty * T - 6 && y < d.ty * T + 30) return { work: d, px: d.tx * T + 16, py: d.ty * T };
  for (const [key, , , tx, ty] of PEOPLE) if (x > tx * T && x < tx * T + 34 && y > ty * T - 6 && y < ty * T + 42) return { key, px: tx * T + 16, py: ty * T };
  return null;
}
function showTip(h) {
  if (!h) { tip.hidden = true; c.style.cursor = 'default'; return; }
  const r = c.getBoundingClientRect(), s = r.width / 512;
  if (h.work) { tip.innerHTML = '<b>' + h.work.title + ' 담당</b><span class="t">Claude · 출시 · 누르면 작품으로</span>'; c.style.cursor = 'pointer'; }
  else { const m = INFO[h.key]; tip.innerHTML = '<b>' + m.name + '</b><span class="t">' + m.who + ' · ' + m.tool + '</span><p>' + m.does + '</p><p class="t">지금: ' + status(h.key) + '</p>'; bubbleKey = h.key; c.style.cursor = 'default'; }
  tip.hidden = false;
  tip.style.left = Math.min(r.width - tip.offsetWidth - 6, Math.max(6, h.px * s - tip.offsetWidth / 2)) + 'px';
  tip.style.top = Math.max(6, h.py * s - tip.offsetHeight - 22) + 'px';
}
c.addEventListener('pointermove', (e) => showTip(hit(e)));
c.addEventListener('pointerleave', () => showTip(null));
c.addEventListener('click', (e) => { const h = hit(e); if (h && h.work) location.href = h.work.url; else showTip(h); });

// 다음 일정
const fmt = (x) => md(x) + ' ' + hm(x);
const NEXT = [['업로드 봇 · 날짜 된 글 공개, 쇼츠 업로드', nextAt([0, 1, 2, 3, 4, 5, 6], 8, 47)], ['블로그 작가 · 블로그 글 공개', nextAt([2, 5], 8, 47)], ['블로그 작가 · 다음 주 글 2편 쓰기', nextAt([0], 21, 13)]];
document.getElementById('next').innerHTML = NEXT.map(([w, x]) => '<li><span>' + w + '</span><time>' + fmt(x) + '</time></li>').join('');
</script>
</body>
</html>
`;
}
