// seeplore 스튜디오 — 위에서 내려다본 사무실 (인터랙티브)
// 데이터는 페이지의 <script id="office-data" type="application/json"> 에서 받는다:
//   { works:[{id,title,url,icon}], info:{이름:{name,who,tool,does}}, sheets:{indoor,chars} }
// 모드: 기본(자유) — 팀원이 자기 책상에서 일하고, 누르면 설명·작품 이동.
//       늘 — 한가한 사람이 심부름(녹음·점검·배포·커피·회의)을 다녀온다. 화면은 항상 사무실 전체.
//       ▶ 하루 보기 — 새 작품 하나가 나오기까지 순서대로(주인공 발밑에 노란 표시).
//       ?shorts — 세로 9:16 화면(쇼츠 녹화용), 하루 보기를 바로 재생.
// 그림: Kenney Roguelike Indoor / Characters (CC0). 모니터·벽·바닥·종이는 코드로.
(() => {
  const DATA = JSON.parse(document.getElementById('office-data').textContent);
  const SHORTS = new URLSearchParams(location.search).has('shorts');
  const canvas = document.getElementById('office');
  const g = canvas.getContext('2d');
  const T = 16;                         // 타일
  const WW = 32 * T, WH = 25 * T;       // 세계 크기 512×400
  const cap = document.getElementById('caption');
  const tip = document.getElementById('tip');
  const playBtn = document.getElementById('play');

  // ---------------------------------------------------------------- 그림 불러오기
  const load = (src) => new Promise((r) => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = src; });
  let indoor = null, chars = null; const icons = {};
  const tile = (sh, cx, cy, x, y, w = 1, h = 1) => sh && g.drawImage(sh, cx * 17, cy * 17, w * 17 - 1, h * 17 - 1, Math.round(x), Math.round(y), w * 16, h * 16);
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const FONT = 'Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  const text = (s, x, y, size, col, align = 'center', w = 700) => { g.font = `${w} ${size}px ${FONT}`; g.fillStyle = col; g.textAlign = align; g.fillText(s, x, y); };

  // ---------------------------------------------------------------- 사무실 배치 (타일)
  // ---------------------------------------------------------------- 시안(테마): ?theme=day|night|line|mono
  const THEMES = {
    day:   { name: '낮', bg: '#6e5338', corridor: '#cdb48e', wall: '#8a6a4a', label: '#5c4630', line: 'rgba(120,90,50,.07)', tagBg: 'rgba(40,30,20,.78)', floors: ['#ead6b4', '#dbe8f3', '#f4e0dc', '#e8e0f3', '#efe3c8', '#dcefe0', '#dfe4ea', '#e8efdc'], furn: 'normal', people: 'normal' },
    night: { name: '밤', bg: '#050608', corridor: '#161b22', wall: '#2b323b', label: '#8b95a1', line: 'rgba(255,255,255,.025)', tagBg: 'rgba(0,0,0,.7)', floors: ['#1d1913', '#121a23', '#201719', '#1b1724', '#1a170f', '#111d16', '#13171c', '#151b12'], furn: 'dark', people: 'dim', glow: true },
    line:  { name: '도면', bg: '#050608', corridor: '#050608', wall: '#3b4450', label: '#6f7a86', line: null, tagBg: 'rgba(5,6,8,.85)', floors: Array(8).fill('#080a0d'), furn: 'ghost', people: 'normal', glow: true, outline: true },
    chip:  { name: '컴퓨터 속', bg: '#020605', corridor: '#020605', wall: '#1f6f52', label: '#3ddc97', line: null, tagBg: 'rgba(2,10,8,.88)', floors: Array(8).fill('#04100c'), furn: 'teal', people: 'normal', glow: true, chip: true, outline: true },
    mono:  { name: '흑백', bg: '#050608', corridor: '#101317', wall: '#2a2f36', label: '#8b95a1', line: 'rgba(255,255,255,.02)', tagBg: 'rgba(0,0,0,.75)', floors: ['#17191c', '#15171a', '#17191c', '#15171a', '#131518', '#15171a', '#131518', '#15171a'], furn: 'gray', people: 'gray', accent: '#ffd24a' },
  };
  let TH = THEMES[new URLSearchParams(location.search).get('theme')] ?? THEMES.day;
  window.__setTheme = (k) => { if (THEMES[k]) { TH = THEMES[k]; ROOMS.forEach((r, i) => (r.floor = TH.floors[i])); } };
  // 그림 시트 보정본(어둡게·흑백·흐리게) — 픽셀을 직접 바꿔 캔버스로 만든다(모든 브라우저에서 같게)
  function variant(img, fn) {
    if (!img) return null;
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height), a = d.data;
    for (let i = 0; i < a.length; i += 4) fn(a, i);
    x.putImageData(d, 0, 0); return c;
  }
  const gray = (a, i) => { const v = 0.3 * a[i] + 0.59 * a[i + 1] + 0.11 * a[i + 2]; a[i] = a[i + 1] = a[i + 2] = v; };
  const SHEETS = {};
  const CORRIDOR_Y = 7.25 * T;          // 위층 방들과 제작본부 사이 복도 가운데
  const ROOMS0 = [
    { name: '대표실', x: 0, y: 0, w: 6, h: 6.5, floor: '#ead6b4', door: 3 },
    { name: '기획실', x: 6, y: 0, w: 6, h: 6.5, floor: '#dbe8f3', door: 9 },
    { name: '홍보팀', x: 12, y: 0, w: 13, h: 6.5, floor: '#f4e0dc', door: 18.5 },
    { name: '음성 부스', x: 25, y: 0, w: 7, h: 6.5, floor: '#e8e0f3', door: 28.5 },
    { name: '제작본부', x: 0, y: 8, w: 23, h: 11.5, floor: '#efe3c8', door: 11.5, top: true },
    { name: '품질관리', x: 23, y: 8, w: 9, h: 5.5, floor: '#dcefe0', door: 27.5, top: true },
    { name: '서버실', x: 23, y: 13.5, w: 9, h: 6, floor: '#dfe4ea', door: 27.5 },
    { name: '휴게실', x: 0, y: 19.5, w: 32, h: 5.5, floor: '#e8efdc', door: 16 },
  ];
  const ROOMS = ROOMS0.map((r, i) => ({ ...r, floor: TH.floors[i] }));

  // 사람: 자기 자리(책상 앞 의자 위치, 픽셀)와 캐릭터 그림(시트 칸)
  const people = {};
  const addPerson = (key, label, ch, deskX, deskY, opts = {}) => {
    people[key] = { key, label, ch, deskX, deskY, x: deskX, y: deskY + 14, homeX: deskX, homeY: deskY + 14, path: [], speed: 1.4, say: '', sayUntil: 0, carry: false, flip: false, typing: true, ...opts };
  };
  addPerson('대표', '대표', [0, 9], 3 * T, 2.4 * T);
  addPerson('기획 담당', '기획', [1, 6], 9 * T, 2.4 * T);
  addPerson('홍보팀장', '홍보팀장', [0, 5], 14 * T, 2.4 * T);
  addPerson('블로그 작가', '블로그', [0, 7], 17 * T, 2.4 * T);
  addPerson('쇼츠 PD', '쇼츠 PD', [1, 7], 20 * T, 2.4 * T);
  addPerson('업로드 봇', '업로드 봇', [1, 11], 23 * T, 2.4 * T, { speed: 1.9 });
  addPerson('내레이터', '내레이터', [1, 5], 28.5 * T, 2.4 * T);
  addPerson('점검 로봇', '점검 로봇', [1, 11], 27.5 * T, 10 * T, { speed: 1.9 });
  const WORK_CHARS = [[0, 5], [0, 6], [1, 6], [0, 7], [1, 7], [0, 8], [1, 8], [0, 9], [1, 9], [0, 10]];
  const desks = DATA.works.map((w, i) => {
    const dx = (1.7 + (i % 5) * 4.4) * T, dy = (9.6 + Math.floor(i / 5) * 2.45) * T;
    addPerson('work:' + w.id, w.title, WORK_CHARS[i % WORK_CHARS.length], dx, dy, { work: w });
    return { w, x: dx, y: dy };
  });
  const roomOf = (p) => ROOMS.find((r) => p.homeX >= r.x * T && p.homeX < (r.x + r.w) * T && p.homeY >= r.y * T && p.homeY < (r.y + r.h) * T);

  // ---------------------------------------------------------------- 길 찾기: 내 방 문 → 복도 → 상대 방 문 → 목적지
  function route(p, tx, ty) {
    const from = ROOMS.find((r) => p.x >= r.x * T && p.x < (r.x + r.w) * T && p.y >= r.y * T && p.y < (r.y + r.h) * T) ?? roomOf(p);
    const to = ROOMS.find((r) => tx >= r.x * T && tx < (r.x + r.w) * T && ty >= r.y * T && ty < (r.y + r.h) * T);
    const pts = [];
    const via = (room) => (room.name === '휴게실' || room.name === '서버실' ? 19.5 * T : CORRIDOR_Y);
    if (from && to && from !== to) {
      const fy = via(from), ty2 = via(to);
      pts.push([from.door * T, p.y], [from.door * T, fy]);
      if (fy !== ty2) pts.push([11.5 * T, fy], [11.5 * T, ty2]);   // 제작본부를 지나 아래층으로
      pts.push([to.door * T, ty2], [to.door * T, ty]);
    }
    pts.push([tx, ty]);
    return pts;
  }
  const walkTo = (key, tx, ty) => new Promise((done) => { const p = people[key]; p.path = route(p, tx, ty); p.typing = false; p.onArrive = done; });
  const walkToPerson = (key, other) => { const o = people[other]; return walkTo(key, o.homeX + 14, o.homeY + 2); };
  const goHome = (key) => walkTo(key, people[key].homeX, people[key].homeY).then(() => { people[key].typing = true; });
  const say = (key, s, ms = 2200) => { const p = people[key]; p.say = s; p.sayUntil = performance.now() + ms; return wait(ms).then(() => { if (p.sayUntil <= performance.now()) p.say = ''; }); };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---------------------------------------------------------------- 하루 보기 (새 작품 하나가 나오기까지 — 실제 만드는 순서)
  const STAR = desks.find((d) => d.w.id === 'rainbow') ?? desks[desks.length - 1];
  const SK = 'work:' + STAR.w.id;
  let focusKey = null, flash = 0, playing = false;
  const busy = new Set();            // 하루 보기에 나오는 사람 — 돌아다니기에서 뺀다
  const setCap = (s) => { if (cap) cap.textContent = s; };
  async function story() {
    if (playing) return; playing = true; playBtn && (playBtn.disabled = true);
    const st = (k) => { focusKey = k; busy.add(k); };
    setCap('대표가 다음 작품 주제를 정합니다');
    st('대표'); await walkToPerson('대표', '기획 담당'); await say('대표', '다음은 무지개 어때요?');
    st('기획 담당'); await say('기획 담당', '기획안 정리할게요');
    goHome('대표');
    setCap('기획실이 기획안을 써서 제작본부로');
    people['기획 담당'].carry = true; await walkTo('기획 담당', STAR.x + 14, STAR.y + 16); await say('기획 담당', '기획안 전달!');
    people['기획 담당'].carry = false; goHome('기획 담당');
    setCap(`담당 AI가 「${STAR.w.title}」를 3D로 만듭니다`);
    st(SK); people[SK].typing = true; await say(SK, '장면 만드는 중…', 2600); await say(SK, '계획부터 확인받을게요', 1800);
    setCap('다큐 원고는 음성 부스에서 녹음');
    people[SK].carry = true; await walkToPerson(SK, '내레이터'); people[SK].carry = false; await say(SK, '원고 녹음 부탁해요');
    st('내레이터'); await say('내레이터', '● 녹음 중 — 쉼표에서 0.25초', 2600);
    st(SK); goHome(SK);
    setCap('점검 로봇이 장면을 하나씩 넘기며 확인');
    st('점검 로봇'); await walkTo('점검 로봇', STAR.x + 16, STAR.y + 18); await say('점검 로봇', '휴대폰·PC 화면 점검 중…', 2200); await say('점검 로봇', '통과!', 1400); goHome('점검 로봇');
    setCap('출시는 대표가 허락할 때만, 하루 한 번');
    st(SK); await walkToPerson(SK, '대표'); await say(SK, '출시해도 될까요?');
    st('대표'); await say('대표', '올려!', 1600);
    st(SK); await walkTo(SK, 26 * T, 16.6 * T); flash = 40; await say(SK, '배포!', 1600); goHome(SK);
    setCap('홍보팀은 쇼츠와 블로그 글을 준비');
    st('쇼츠 PD'); await say('쇼츠 PD', '쇼츠 렌더링 중 — 첫 2초는 질문으로', 2400);
    st('블로그 작가'); await say('블로그 작가', '블로그 글 예약 — 화·금 08:47', 2200);
    setCap('아침 08:47, 업로드 봇이 서버실에서 올립니다');
    st('업로드 봇'); people['업로드 봇'].carry = true; await walkTo('업로드 봇', 30 * T, 16.6 * T); people['업로드 봇'].carry = false; flash = 40; await say('업로드 봇', '@seeplore 업로드 완료', 2200); goHome('업로드 봇');
    setCap('이렇게 작품 하나가 나옵니다 — seeplore.com');
    focusKey = null; busy.clear(); await wait(2500);
    setCap(''); playing = false; playBtn && (playBtn.disabled = false);
  }

  // ---------------------------------------------------------------- 자유 모드: 가끔 한 명이 지금 상태를 말한다
  const kst = () => new Date(Date.now() + 9 * 3600e3);
  function nextAt(days, hh, mm) { const n = kst(); for (let d = 0; d < 8; d++) { const x = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + d, hh, mm)); if (days.includes(x.getUTCDay()) && x > n) return x; } }
  const DAY = '일월화수목금토';
  const md = (x) => `${x.getUTCMonth() + 1}.${x.getUTCDate()}(${DAY[x.getUTCDay()]})`;
  const hm = (x) => `${String(x.getUTCHours()).padStart(2, '0')}:${String(x.getUTCMinutes()).padStart(2, '0')}`;
  function status(key) {
    const n = kst(), h = n.getUTCHours(), dow = n.getUTCDay();
    if (key.startsWith('work:')) return pick(['출시 · 대기', '장면 다시 보는 중', '숫자 출처 확인 중']);
    switch (key) {
      case '업로드 봇': return `${hm(nextAt([0, 1, 2, 3, 4, 5, 6], 8, 47))} 실행 대기`;
      case '블로그 작가': return dow === 0 && h >= 21 ? '다음 주 글 쓰는 중' : `${md(nextAt([2, 5], 8, 47))} 글 공개 대기`;
      case '쇼츠 PD': return dow === 0 && h >= 21 ? '쇼츠 렌더링 중' : '쇼츠 자막 검토 중';
      case '홍보팀장': return h < 9 ? '오늘 공개분 확인 중' : '검색 색인 확인 중';
      case '대표': return '결재 대기 중';
      case '기획 담당': return '다음 주제 검토 중';
      case '내레이터': return '다음 원고 대기';
      case '점검 로봇': return '장면 점검 대기';
      default: return '';
    }
  }
  // ---------------------------------------------------------------- 늘 움직이는 사무실: 한가한 사람에게 심부름을 준다
  const keys = Object.keys(people);
  const out = new Set();               // 지금 자리를 비운 사람
  const at = (key) => [people[key].homeX + 14, people[key].homeY + 2];
  const spot = { 음성: [28.5 * T + 16, 2.4 * T + 18], 점검: [27.5 * T + 16, 10 * T + 18], 서버: [26.4 * T, 16.6 * T], 커피: [4 * T, 22.4 * T], 탁자: [10 * T, 23 * T], 기획: [9 * T + 16, 2.4 * T + 18], 대표: [3 * T + 16, 2.4 * T + 18], 홍보: [17 * T + 16, 2.4 * T + 18] };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const randomDesk = () => pick(desks);
  function errands(key) {
    const d = randomDesk(), dp = [d.x + 14, d.y + 16];
    if (key.startsWith('work:')) return pick([
      [spot.음성, '원고 녹음 부탁해요', true], [spot.점검, '점검 부탁해요'], [spot.서버, '배포 준비'], [spot.커피, '커피 한 잔'], [spot.탁자, '잠깐 회의'], [spot.기획, '기획안 질문 있어요', true], [dp, '이 장면 어때요?'],
    ]);
    switch (key) {
      case '대표': return pick([[spot.홍보, '조회수 어때요?'], [dp, '잘 돼 가요?'], [spot.커피, '커피 한 잔'], [spot.서버, '오늘 배포 몇 번?']]);
      case '기획 담당': return pick([[dp, '다음 기획안이에요', true], [spot.대표, '주제 후보 셋', true], [spot.탁자, '아이디어 회의']]);
      case '홍보팀장': return pick([[spot.대표, '이번 주 글 2편', true], [dp, '쇼츠 장면 골라요'], [spot.커피, '커피 한 잔']]);
      case '블로그 작가': return pick([[dp, '숫자 확인할게요'], [at('업로드 봇'), '글 예약 부탁', true], [spot.탁자, '글감 고르는 중']]);
      case '쇼츠 PD': return pick([[spot.음성, '쇼츠 녹음 부탁', true], [dp, '표지 장면 찍을게요'], [spot.서버, '렌더링 확인']]);
      case '업로드 봇': return pick([[spot.서버, '업로드 준비', true], [spot.홍보, '공개 목록 확인'], [spot.커피, '충전 중…']]);
      case '내레이터': return pick([[dp, '발음 확인해요'], [spot.탁자, '목 풀기']]);
      case '점검 로봇': return pick([[dp, '장면 점검 중…'], [dp, '이름표 잘림 없음'], [spot.서버, '배포 확인']]);
      default: return null;
    }
  }
  async function errand(key) {
    const job = errands(key); if (!job) return;
    const [[x, y], line, paper] = job; const p = people[key];
    out.add(key); p.carry = !!paper;
    await walkTo(key, x, y); p.carry = false;
    await say(key, line, 1800 + Math.random() * 900);
    if (key.startsWith('work:') && Math.random() < 0.5) {         // 상대가 대답
      const near = Object.values(people).find((q) => q.key !== key && Math.hypot(q.x - p.x, q.y - p.y) < 40 && !q.path.length);
      if (near) await say(near.key, pick(['좋아요!', '바로 할게요', '확인!', '잠깐만요']), 1300);
    }
    await goHome(key); out.delete(key);
  }
  setInterval(() => {
    if (document.hidden) return;
    const idle = keys.filter((k) => !out.has(k) && !busy.has(k));
    const want = SHORTS ? 4 : 7;                                    // 동시에 돌아다니는 사람 수
    for (let i = out.size; i < want && idle.length; i++) errand(idle.splice(Math.floor(Math.random() * idle.length), 1)[0]);
    // 자리에 있는 사람 하나는 지금 상태를 말한다
    const seat = keys.filter((k) => !out.has(k) && !busy.has(k) && !people[k].say);
    if (seat.length && !playing) { const k = pick(seat); say(k, status(k), 2400); }
  }, 900);

  // ---------------------------------------------------------------- 그리기
  function drawRoom(r) {
    const x = r.x * T, y = r.y * T, w = r.w * T, h = r.h * T;
    R(x, y, w, h, r.floor);
    if (TH.line) for (let yy = y + 6; yy < y + h; yy += 8) R(x, yy, w, 1, TH.line);
    if (TH.chip) { for (let gx = x + 8; gx < x + w; gx += 16) for (let gy = y + 8; gy < y + h; gy += 16) R(gx, gy, 1, 1, '#0d3b2b'); for (let px = x + 6; px < x + w - 4; px += 6) { R(px, y - 2, 2, 2, '#b08d3c'); R(px, y + h, 2, 2, '#b08d3c'); } for (let py = y + 6; py < y + h - 4; py += 6) { R(x - 2, py, 2, 2, '#b08d3c'); R(x + w, py, 2, 2, '#b08d3c'); } }
    if (TH.outline) { if (!TH.chip) for (let gx = x + 8; gx < x + w; gx += 16) for (let gy = y + 8; gy < y + h; gy += 16) R(gx, gy, 1, 1, '#1a2028'); R(x, y, w, 1, TH.wall); R(x, y, 1, h, TH.wall); R(x + w - 1, y, 1, h, TH.wall); R(x, y + h - 1, w, 1, TH.wall); }
    else { R(x, y, w, 3, TH.wall); R(x, y, 2, h, TH.wall); R(x + w - 2, y, 2, h, TH.wall); R(x, y + h - 2, w, 2, TH.wall); }
    // 문(벽 틈)
    const dx = r.door * T - 10;
    if (r.top) R(dx, y, 20, 3, r.floor); else R(dx, y + h - 2, 20, 2, r.floor);
    text(TH.outline ? r.name.toUpperCase() : r.name, x + 7, y + 13, TH.outline ? 6.5 : 7.5, TH.label, 'left', 800);
  }
  function monitor(x, y, on, icon) {
    R(x - 6, y - 9, 12, 9, '#30353d'); R(x - 5, y - 8, 10, 7, on);
    if (icon) g.drawImage(icon, x - 5, y - 8, 10, 7);
    R(x - 1, y, 2, 2, '#30353d');
  }
  function deskAt(x, y, icon, typing, t) {
    tile(indoor, 0, 0, x - 16, y); tile(indoor, 2, 0, x, y);
    monitor(x, y + 6, TH.chip ? (typing && (t >> 3) % 2 ? '#9dffd8' : '#3ddc97') : typing && (t >> 3) % 2 ? '#a9e3ff' : '#8fd2f7', icon);
  }
  function drawPerson(p, t) {
    const moving = p.path.length > 0;
    const bob = moving ? Math.abs(Math.sin(t / 3)) * 2 : p.typing ? ((t >> 2) % 2) * 0.6 : 0;
    g.save(); g.translate(Math.round(p.x), Math.round(p.y - bob));
    if (p.flip) g.scale(-1, 1);
    tile(TH.people === 'gray' && (moving || p.say) ? SHEETS.ch_normal : chars, p.ch[0], p.ch[1], -8, -8);
    g.restore();
    if (p.carry && TH.chip) { g.fillStyle = (t >> 2) % 2 ? '#7dffcf' : '#3ddc97'; g.fillRect(p.x - 4, p.y - 18 - bob, 8, 8); }
    else if (p.carry) { R(p.x - 4, p.y - 18 - bob, 8, 9, '#ffffff'); R(p.x - 3, p.y - 16 - bob, 6, 1, '#9aa3ab'); R(p.x - 3, p.y - 13 - bob, 5, 1, '#9aa3ab'); }
  }
  function tag(s, cx, y) {
    g.font = `700 6.5px ${FONT}`; const w = g.measureText(s).width + 7;
    R(cx - w / 2, y, w, 9, TH.tagBg); text(s, cx, y + 6.8, 6.5, '#fff');
  }
  function bubble(s, cx, y) {
    g.font = `700 7px ${FONT}`; const w = g.measureText(s).width + 12;
    const x = Math.max(2, Math.min(WW - w - 2, cx - w / 2)), by = Math.max(2, y - 26);
    g.fillStyle = '#fff'; g.strokeStyle = '#3d3328'; g.lineWidth = 0.8;
    g.beginPath(); g.roundRect ? g.roundRect(x, by, w, 13, 4) : g.rect(x, by, w, 13); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(cx - 3, by + 13); g.lineTo(cx, by + 17); g.lineTo(cx + 3, by + 13); g.fill();
    text(s, x + w / 2, by + 9.2, 7, '#2b241c');
  }
  // 카메라: 항상 사무실 전체
  const cam = { x: WW / 2, y: WH / 2, z: 1 };
  function updateCam() {
    const portrait = canvas.height > canvas.width;
    const fit = Math.min(canvas.width / WW, canvas.height / WH);
    let tx = WW / 2, ty = WH / 2, tz = fit;
    if (portrait) { tz = canvas.width / WW; ty = WH / 2 + (canvas.height * 0.08) / tz; } // 항상 사무실 전체 — 세로(쇼츠)는 폭에 맞추고 위쪽에
    cam.x += (tx - cam.x) * 0.08; cam.y += (ty - cam.y) * 0.08; cam.z += (tz - cam.z) * 0.08;
    // 화면 밖으로 나가지 않게
    const hw = canvas.width / cam.z / 2, hh = canvas.height / cam.z / 2;

  }
  let t = 0;
  function frame() {
    t++;
    // 걷기
    for (const p of Object.values(people)) {
      if (!p.path.length) continue;
      const [tx, ty] = p.path[0], dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
      if (Math.abs(dx) > 0.5) p.flip = dx < 0;
      if (d <= p.speed) { p.x = tx; p.y = ty; p.path.shift(); if (!p.path.length && p.onArrive) { const f = p.onArrive; p.onArrive = null; f(); } }
      else { p.x += (dx / d) * p.speed; p.y += (dy / d) * p.speed; }
    }
    updateCam();
    g.setTransform(1, 0, 0, 1, 0, 0); g.imageSmoothingEnabled = false;
    R(0, 0, canvas.width, canvas.height, TH.bg);
    g.setTransform(cam.z, 0, 0, cam.z, canvas.width / 2 - cam.x * cam.z, canvas.height / 2 - cam.y * cam.z);
    R(0, 7 * T, WW, 1 * T, TH.corridor);                      // 복도
    if (!TH.outline) R(0, 19.5 * T - 1, WW, 1, TH.wall);
    if (TH.chip) {
      for (const yy of [7.2 * T, 7.5 * T, 7.8 * T]) R(0, yy, WW, 1, '#0f4a35');
      R(11.5 * T, 6.5 * T, 1, 13 * T, '#0f4a35'); R(27.5 * T, 6.5 * T, 1, 13 * T, '#0f4a35');
      for (let k = 0; k < 9; k++) { const px = ((t * (1.2 + (k % 3) * 0.5) + k * 61) % (WW + 40)) - 20, yy = [7.2, 7.5, 7.8][k % 3] * T; g.fillStyle = 'rgba(61,220,151,.9)'; g.fillRect(px, yy - 1, 6, 3); g.fillStyle = 'rgba(61,220,151,.25)'; g.fillRect(px - 10, yy, 10, 1); }
      for (let k = 0; k < 3; k++) { const py = 6.5 * T + ((t * 0.9 + k * 70) % (13 * T)); R(11.5 * T - 1, py, 3, 5, '#7dffcf'); R(27.5 * T - 1, (py + 90) % (13 * T) + 6.5 * T, 3, 5, '#7dffcf'); }
    }
    // 테마에 맞는 그림 시트
    indoor = SHEETS['in_' + TH.furn] ?? SHEETS.in_normal; chars = SHEETS['ch_' + TH.people] ?? SHEETS.ch_normal;
    for (const r of ROOMS) drawRoom(r);
    if (indoor && chars) {
      // 소품
      tile(indoor, 23, 0, 0.4 * T, 1 * T); tile(indoor, 24, 0, 1.4 * T, 1 * T);
      tile(indoor, 16, 0, 4.7 * T, 4.9 * T); tile(indoor, 17, 0, 10.7 * T, 4.9 * T); tile(indoor, 16, 0, 23.7 * T, 4.9 * T);
      tile(indoor, 19, 12, 6.5 * T, 3.9 * T); tile(indoor, 20, 12, 7.5 * T, 3.9 * T);
      tile(indoor, 23, 8, 25.6 * T, 4.4 * T, 2, 1);
      for (let k = 0; k < 3; k++) {
        const sx = (24.2 + k * 2.6) * T, sy = 15.1 * T;
        tile(indoor, 25 + (k % 2), 8, sx, sy, 1, 2);
        for (let j = 0; j < 4; j++) R(sx + 5, sy + 6 + j * 6, 3, 2, flash > 0 ? (t % 4 < 2 ? '#fff36b' : '#4cd17a') : (t / 4 + j + k) % 5 < 3 ? '#4cd17a' : '#1f6b3b');
      }
      tag('서버', 27.6 * T, 18.4 * T);
      tile(indoor, 0, 12, 2 * T, 20.8 * T, 3, 1); tile(indoor, 5, 12, 5 * T, 20.8 * T);
      for (const bx of [10, 15]) { tile(indoor, 3, 0, bx * T, 21.6 * T); tile(indoor, 1, 2, (bx - 1) * T, 21.6 * T); tile(indoor, 3, 2, (bx + 1) * T, 21.6 * T); }
      tile(indoor, 16, 0, 20 * T, 22 * T); tile(indoor, 17, 0, 30.4 * T, 22 * T);
      text('커피', 3.5 * T, 22.8 * T, 6, TH.label);
      // 책상과 사람 (위에서 아래 순서로)
      const all = Object.values(people);
      for (const p of all) deskAt(p.deskX, p.deskY, p.work ? icons[p.work.id] : null, p.typing && !p.path.length && Math.abs(p.x - p.homeX) < 1, t);
      if (focusKey && people[focusKey]) { const f = people[focusKey]; g.fillStyle = 'rgba(255,200,40,.45)'; g.beginPath(); g.ellipse(f.x, f.y + 7, 10, 4, 0, 0, 7); g.fill(); }
      for (const p of [...all].sort((a, b) => a.y - b.y)) drawPerson(p, t);
      for (const p of all) if (!p.work) tag(p.label, p.homeX, p.homeY + 10);
      const now = performance.now();
      for (const p of all) if (p.say && p.sayUntil > now) bubble(p.say, p.x, p.y - 4);
      if (TH.glow) { g.globalCompositeOperation = 'lighter'; for (const p of all) { const gr = g.createRadialGradient(p.deskX, p.deskY + 2, 0, p.deskX, p.deskY + 2, 26); const gc = TH.chip ? '61,220,151' : '120,200,255'; gr.addColorStop(0, `rgba(${gc},.2)`); gr.addColorStop(1, `rgba(${gc},0)`); g.fillStyle = gr; g.fillRect(p.deskX - 26, p.deskY - 24, 52, 52); } g.globalCompositeOperation = 'source-over'; }
    } else text('불러오는 중…', WW / 2, WH / 2, 12, TH.label);
    if (flash > 0) flash--;
    requestAnimationFrame(frame);
  }

  // ---------------------------------------------------------------- 누르기·마우스
  function worldAt(ev) {
    const r = canvas.getBoundingClientRect(), sx = canvas.width / r.width;
    const cx = (ev.clientX - r.left) * sx, cy = (ev.clientY - r.top) * sx;
    return [(cx - canvas.width / 2) / cam.z + cam.x, (cy - canvas.height / 2) / cam.z + cam.y, r, sx];
  }
  function hit(ev) {
    const [x, y] = worldAt(ev);
    for (const p of Object.values(people)) if (Math.abs(x - p.x) < 14 && y > p.y - 26 && y < p.y + 12) return p;
    return null;
  }
  function showTip(p, ev) {
    if (!tip) return;
    if (!p) { tip.hidden = true; canvas.style.cursor = 'default'; return; }
    const info = DATA.info[p.key];
    tip.innerHTML = p.work
      ? `<b>${p.work.title} 담당</b><span class="t">AI · 출시 · 누르면 작품으로</span>`
      : `<b>${info.name}</b><span class="t">${info.who} · ${info.tool}</span><p>${info.does}</p><p class="t">지금: ${status(p.key)}</p>`;
    canvas.style.cursor = p.work ? 'pointer' : 'default';
    tip.hidden = false;
    const [, , r] = worldAt(ev), box = canvas.parentElement.getBoundingClientRect();
    const left = ev.clientX - box.left - tip.offsetWidth / 2, top = ev.clientY - box.top - tip.offsetHeight - 18;
    tip.style.left = Math.max(6, Math.min(box.width - tip.offsetWidth - 6, left)) + 'px';
    tip.style.top = Math.max(6, top) + 'px';
  }
  canvas.addEventListener('pointermove', (e) => showTip(hit(e), e));
  canvas.addEventListener('pointerleave', () => showTip(null));
  canvas.addEventListener('click', (e) => { const p = hit(e); if (p && p.work) location.href = p.work.url; else { showTip(p, e); if (p && !playing) say(p.key, status(p.key), 2600); } });
  playBtn && playBtn.addEventListener('click', story);

  // ---------------------------------------------------------------- 시작
  Promise.all([load(DATA.sheets.indoor), load(DATA.sheets.chars), ...DATA.works.map((w) => load(w.icon).then((im) => (icons[w.id] = im)))]).then(([a, b]) => {
    SHEETS.in_normal = a; SHEETS.ch_normal = b;
    SHEETS.in_dark = variant(a, (d, i) => { d[i] *= 0.55; d[i + 1] *= 0.55; d[i + 2] *= 0.6; });
    SHEETS.in_gray = variant(a, (d, i) => { gray(d, i); d[i] *= 0.6; d[i + 1] *= 0.6; d[i + 2] *= 0.6; });
    SHEETS.in_ghost = variant(a, (d, i) => { gray(d, i); d[i + 3] *= 0.35; });
    SHEETS.in_teal = variant(a, (d, i) => { const v = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]; d[i] = v * 0.15; d[i + 1] = v * 0.75; d[i + 2] = v * 0.55; d[i + 3] *= 0.7; });
    SHEETS.ch_dim = variant(b, (d, i) => { d[i] *= 0.85; d[i + 1] *= 0.85; d[i + 2] *= 0.85; });
    SHEETS.ch_gray = variant(b, (d, i) => { gray(d, i); d[i] *= 0.8; d[i + 1] *= 0.8; d[i + 2] *= 0.8; });
    indoor = a; chars = b;
    if (SHORTS) setTimeout(story, 600);
  });
  requestAnimationFrame(frame);
  window.__office = { story, people };
})();
