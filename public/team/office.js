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
  // 화면 모양: 넓으면 가로 배치(32×25 타일), 휴대폰·쇼츠는 세로 배치(16×34 타일) — 휴대폰에서 글자가 너무 작아지지 않게
  const PORTRAIT = SHORTS || window.innerWidth < 700;
  const WW = (PORTRAIT ? 16 : 32) * T, WH = (PORTRAIT ? 26.5 : 20.5) * T;
  if (SHORTS) { canvas.width = 720; canvas.height = 1280; } else if (PORTRAIT) { canvas.width = WW * 3; canvas.height = WH * 3; } else { canvas.width = WW * 2; canvas.height = WH * 2; }
  const cap = document.getElementById('caption');
  const tip = document.getElementById('tip');
  const playBtn = document.getElementById('play');

  // ---------------------------------------------------------------- 영어판(/en/team): 내부 이름은 한국어 그대로, 화면에 그릴 때만 바꾼다
  const EN = document.documentElement.lang === 'en';
  const DICT = {
    '아빠': 'Dad', '아들': 'Son', '기획 담당': 'Planner', '기획 AI': 'Planner AI', '홍보팀장': 'PR Lead', '블로그': 'Blog', '블로그 작가': 'Blog Writer',
    '쇼츠 PD': 'Shorts PD', '업로드 봇': 'Upload Bot', '내레이터': 'Narrator', '점검 로봇': 'Test Robot', '제작 담당': 'Maker', '코딩 AI': 'Coding AI',
    '일이 있을 때 들어와 작품 하나를 맡는다. 3D 화면·장면 글·다큐 원고를 만들고 고친다.': 'Comes in when there is work and takes one title — builds and fixes the 3D scenes, scene text and documentary script.',
    '아빠 방': "Dad's Room", '기획실': 'Planning', '홍보팀': 'PR Team', '음성 부스': 'Voice Booth', '제작본부': 'Production', '품질관리': 'QA', '서버실': 'Server Room', '휴게실': 'Lounge',
    '서버': 'Server', '커피': 'Coffee', '출시 작품': 'Released', '불러오는 중…': 'Loading…',
    '아들이 다음 작품 주제를 고릅니다': 'Son picks the next topic', '아빠, 다음은 무지개 어때?': 'Dad, how about rainbows next?', '좋아, 기획해 보자': "Sounds good, let's plan it",
    '기획안 정리할게요': "I'll write the plan", '기획실이 기획안을 써서 제작본부로': 'Planning sends the plan to Production', '기획안 전달!': 'Plan delivered!',
    '장면 만드는 중…': 'Building scenes…', '계획부터 확인받을게요': "I'll get the plan approved first", '다큐 원고는 음성 부스에서 녹음': 'The script is recorded in the voice booth',
    '원고 녹음 부탁해요': 'Please record this script', '● 녹음 중 — 쉼표에서 0.25초': '● Recording — 0.25 s at commas', '점검 로봇이 장면을 하나씩 넘기며 확인': 'The test robot checks every scene',
    '휴대폰·PC 화면 점검 중…': 'Checking phone & PC screens…', '통과!': 'Pass!', '아들이 직접 보며 어려운 곳을 짚습니다': 'Son watches it and points out the hard parts',
    '여기 무슨 말인지 모르겠어': "I don't get this part", '쉬운 말로 고칠게요': "I'll make it simpler", '출시는 아빠가 허락할 때만, 하루 한 번': 'Release only when Dad says so — once a day',
    '출시해도 될까요?': 'Can we release it?', '올려!': 'Ship it!', '배포!': 'Deploy!', '홍보팀은 쇼츠와 블로그 글을 준비': 'PR prepares a Short and a blog post',
    '쇼츠 렌더링 중 — 첫 2초는 질문으로': 'Rendering the Short — question first', '블로그 글 예약 — 화·금 08:47': 'Blog post scheduled — Tue/Fri 08:47',
    '아침 08:47, 업로드 봇이 서버실에서 올립니다': 'At 08:47 the upload bot publishes from the server room', '@seeplore 업로드 완료': 'Uploaded to @seeplore',
    '이렇게 작품 하나가 나옵니다 — seeplore.com': "That's how one title gets made — seeplore.com",
    '휴게실 대기': 'Waiting in the lounge', '다음 주 글 쓰는 중': "Writing next week's posts", '쇼츠 렌더링 중': 'Rendering Shorts', '쇼츠 자막 검토 중': 'Checking Shorts captions',
    '오늘 공개분 확인 중': "Checking today's posts", '검색 색인 확인 중': 'Checking search indexing', '결재 대기 중': 'Waiting to approve', '다음 주제 검토 중': 'Reviewing next topics',
    '다음 주제 고르는 중': 'Picking the next topic', '작품 보며 검토 중': 'Reviewing a title', '다음 원고 대기': 'Waiting for the next script', '장면 점검 대기': 'Waiting to test scenes',
    '점검 부탁해요': 'Please test this', '배포 준비': 'Getting ready to deploy', '기획안 질문 있어요': 'Question about the plan', '이 장면 어때요?': 'How does this scene look?',
    '조회수 어때요?': "How're the views?", '잘 돼 가요?': 'How is it going?', '커피 한 잔': 'Coffee break', '오늘 배포 몇 번?': 'Deploys today?',
    '여기 어려워요': 'This part is hard', '이 장면 재밌다!': 'This scene is fun!', '다음 주제 생각났어': 'I have a topic idea', '이것도 만들자': "Let's make this too",
    '다음 기획안이에요': "Here's the next plan", '주제 후보 셋': 'Three topic ideas', '아이디어 회의': 'Idea meeting', '이번 주 글 2편': "This week's two posts",
    '쇼츠 장면 골라요': 'Picking Shorts scenes', '숫자 확인할게요': "I'll check the numbers", '글 예약 부탁': 'Please schedule this post', '글감 고르는 중': 'Picking a topic',
    '쇼츠 녹음 부탁': 'Please voice this Short', '표지 장면 찍을게요': "I'll grab the cover shot", '렌더링 확인': 'Checking the render', '업로드 준비': 'Getting ready to upload',
    '공개 목록 확인': 'Checking the schedule', '충전 중…': 'Charging…', '발음 확인해요': 'Checking pronunciation', '목 풀기': 'Warming up the voice',
    '장면 점검 중…': 'Testing scenes…', '이름표 잘림 없음': 'No clipped labels', '배포 확인': 'Checking the deploy', '끝! 휴게실로': 'Done! Off to the lounge',
    '좋아요!': 'Sure!', '바로 할게요': 'On it', '확인!': 'Got it!', '잠깐만요': 'One sec', '출시 작품 · 누르면 열기': 'Released · tap to open', '지금: ': 'Now: ',
  };
  const PAT = [
    [/^제작 (\d)$/, 'Maker $1'], [/^「(.+)」 맡는 중$/, 'Working on “$1”'], [/^「(.+)」 맡았어요$/, 'I’ll take “$1”'],
    [/^담당 AI가 「(.+)」를 3D로 만듭니다$/, 'A maker AI builds “$1” in 3D'], [/^(\d\d:\d\d) 실행 대기$/, 'Next run $1'], [/^(.+) 글 공개 대기$/, 'Next post $1'], [/^출시 작품 (\d+)$/, 'Released $1'], [/^외 (\d+)편 · 누르면 전체 목록$/, '$1 more · tap to see all'],
  ];
  const L = (s) => { if (!EN || !s) return s; if (DICT[s] != null) return DICT[s]; for (const [re, to] of PAT) if (re.test(s)) return s.replace(re, to); return s; };
  // ---------------------------------------------------------------- 그림 불러오기
  const load = (src) => new Promise((r) => { const im = new Image(); im.onload = () => r(im); im.onerror = () => r(null); im.src = src; });
  let indoor = null, chars = null; const icons = {};
  const tile = (sh, cx, cy, x, y, w = 1, h = 1) => sh && g.drawImage(sh, cx * 17, cy * 17, w * 17 - 1, h * 17 - 1, Math.round(x), Math.round(y), w * 16, h * 16);
  const R = (x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const FONT = 'Pretendard, "Noto Sans KR", "Apple SD Gothic Neo", sans-serif';
  const text = (s, x, y, size, col, align = 'center', w = 700) => { s = L(s); g.font = `${w} ${size}px ${FONT}`; g.fillStyle = col; g.textAlign = align; g.fillText(s, x, y); };

  // ---------------------------------------------------------------- 사무실 배치 (타일)
  // ---------------------------------------------------------------- 시안(테마): ?theme=day|night|line|mono
  const THEMES = {
    day:   { name: '낮', bg: '#6e5338', corridor: '#cdb48e', wall: '#8a6a4a', label: '#5c4630', line: 'rgba(120,90,50,.07)', tagBg: 'rgba(40,30,20,.78)', floors: ['#ead6b4', '#dbe8f3', '#f4e0dc', '#e8e0f3', '#efe3c8', '#dcefe0', '#dfe4ea', '#e8efdc'], furn: 'normal', people: 'normal' },
    night: { name: '밤', bg: '#050608', corridor: '#161b22', wall: '#2b323b', label: '#8b95a1', line: 'rgba(255,255,255,.025)', tagBg: 'rgba(0,0,0,.7)', floors: ['#1d1913', '#121a23', '#201719', '#1b1724', '#1a170f', '#111d16', '#13171c', '#151b12'], furn: 'dark', people: 'dim', glow: true },
    line:  { name: '도면', bg: '#050608', corridor: '#050608', wall: '#3b4450', label: '#6f7a86', line: null, tagBg: 'rgba(5,6,8,.85)', floors: Array(8).fill('#080a0d'), furn: 'ghost', people: 'normal', glow: true, outline: true },
    chip:  { name: '컴퓨터 속', bg: '#020605', corridor: '#020605', wall: '#1f6f52', label: '#3ddc97', line: null, tagBg: 'rgba(2,10,8,.88)', floors: Array(8).fill('#04100c'), furn: 'teal', people: 'normal', glow: true, chip: true, outline: true },
    base:  { name: '우주 기지', bg: '#02030a', corridor: '#1a2130', wall: '#7b8ba3', label: '#a9c4e8', line: null, tagBg: 'rgba(4,8,18,.85)', floors: ['#1c2331', '#1a2232', '#1d2230', '#1c2133', '#1b2230', '#1a2331', '#1c2130', '#1b2331'], furn: 'steel', people: 'normal', glow: true, glowC: '120,220,255', base: true },
    space: { name: '관제실', bg: '#03050b', corridor: '#060a16', wall: '#22355c', label: '#7fa6e8', line: null, tagBg: 'rgba(3,6,14,.85)', floors: Array(8).fill('#070c1a'), furn: 'blue', people: 'normal', glow: true, glowC: '110,160,255', stars: true, outline: true },
    neon:  { name: '네온', bg: '#040306', corridor: '#040306', wall: '#ff3ea5', wall2: '#2ee6ff', label: '#ff7cc4', line: null, tagBg: 'rgba(8,4,12,.85)', floors: Array(8).fill('#08060d'), furn: 'violet', people: 'normal', glow: true, glowC: '255,62,165', neon: true, outline: true },
    gold:  { name: '블랙 골드', bg: '#050505', corridor: '#0b0a08', wall: '#a8873f', label: '#c9a45c', line: 'rgba(201,164,92,.04)', tagBg: 'rgba(0,0,0,.8)', floors: ['#100e0b', '#0d0c0a', '#100e0b', '#0d0c0a', '#0e0d0a', '#0d0c0a', '#0e0d0a', '#0d0c0a'], furn: 'sepia', people: 'gray', glow: true, glowC: '232,190,110', outline: true },
    mono:  { name: '흑백', bg: '#050608', corridor: '#101317', wall: '#2a2f36', label: '#8b95a1', line: 'rgba(255,255,255,.02)', tagBg: 'rgba(0,0,0,.75)', floors: ['#17191c', '#15171a', '#17191c', '#15171a', '#131518', '#15171a', '#131518', '#15171a'], furn: 'gray', people: 'gray', accent: '#ffd24a' },
  };
  let TH = THEMES[new URLSearchParams(location.search).get('theme')] ?? THEMES.chip; // 정한 시안: 컴퓨터 속 (2026-11-11). 다른 시안은 ?theme= 로만
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
  const ROOMS_LAND = [
    { name: '아빠 방', x: 0, y: 0, w: 6, h: 6.5, floor: '#ead6b4', door: 3 },
    { name: '기획실', x: 6, y: 0, w: 6, h: 6.5, floor: '#dbe8f3', door: 9 },
    { name: '홍보팀', x: 12, y: 0, w: 13, h: 6.5, floor: '#f4e0dc', door: 18.5 },
    { name: '음성 부스', x: 25, y: 0, w: 7, h: 6.5, floor: '#e8e0f3', door: 28.5 },
    { name: '제작본부', x: 0, y: 8, w: 23, h: 7, floor: '#efe3c8', door: 11.5, top: true },
    { name: '품질관리', x: 23, y: 8, w: 9, h: 3.5, floor: '#dcefe0', door: 27.5, top: true },
    { name: '서버실', x: 23, y: 11.5, w: 9, h: 3.5, floor: '#dfe4ea', door: 27.5 },
    { name: '휴게실', x: 0, y: 15, w: 32, h: 5.5, floor: '#e8efdc', door: 16 },
  ];
  // 세로 배치: 가운데 세로 복도(x 7.5~8.5)를 두고 왼쪽·오른쪽 방, 제작본부는 복도가 지나가는 넓은 방
  const SPINE = 8 * T;
  const ROOMS_PORT = [
    { name: '아빠 방', x: 0, y: 0, w: 7.5, h: 6, side: 'r', doorY: 3 },
    { name: '기획실', x: 8.5, y: 0, w: 7.5, h: 6, side: 'l', doorY: 3 },
    { name: '홍보팀', x: 0, y: 6.5, w: 7.5, h: 7, side: 'r', doorY: 10 },
    { name: '음성 부스', x: 8.5, y: 6.5, w: 7.5, h: 3.5, side: 'l', doorY: 8.25 },
    { name: '제작본부', x: 0, y: 14, w: 16, h: 7.5, open: true },
    { name: '품질관리', x: 8.5, y: 10, w: 7.5, h: 3.5, side: 'l', doorY: 11.75 },
    { name: '서버실', x: 0, y: 22, w: 7.5, h: 4.5, side: 'r', doorY: 24.25 },
    { name: '휴게실', x: 8.5, y: 22, w: 7.5, h: 4.5, side: 'l', doorY: 24.25 },
  ];
  const ROOMS = (PORTRAIT ? ROOMS_PORT : ROOMS_LAND).map((r, i) => ({ ...r, floor: TH.floors[i] }));

  // 사람: 자기 자리(책상 앞 의자 위치, 픽셀)와 캐릭터 그림(시트 칸)
  const people = {};
  const addPerson = (key, label, ch, deskX, deskY, opts = {}) => {
    people[key] = { key, label, ch, deskX, deskY, x: deskX, y: deskY + 14, homeX: deskX, homeY: deskY + 14, path: [], speed: 1.4, say: '', sayUntil: 0, carry: false, flip: false, typing: true, ...opts };
  };
  const SEAT = PORTRAIT
    ? { 아빠: [3.7, 2.4], '아들': [10.6, 2.4], '기획 담당': [14, 2.4], 홍보팀장: [2.2, 8.6], '블로그 작가': [5.6, 8.6], '쇼츠 PD': [2.2, 11.2], '업로드 봇': [5.6, 11.2], 내레이터: [12.2, 7.2], '점검 로봇': [12.2, 10.7] }
    : { 아빠: [3, 2.4], '아들': [7.8, 2.4], '기획 담당': [10.4, 2.4], 홍보팀장: [14, 2.4], '블로그 작가': [17, 2.4], '쇼츠 PD': [20, 2.4], '업로드 봇': [23, 2.4], 내레이터: [28.5, 2.4], '점검 로봇': [27.5, 9.1] };
  const seat = (k, label, ch, o) => addPerson(k, label, ch, SEAT[k][0] * T, SEAT[k][1] * T, o);
  seat('아빠', '아빠', [0, 9]);
  seat('아들', '아들', [0, 8]);
  seat('기획 담당', '기획 AI', [1, 6]);
  seat('홍보팀장', '홍보팀장', [0, 5]);
  seat('블로그 작가', '블로그', [0, 7]);
  seat('쇼츠 PD', '쇼츠 PD', [1, 7]);
  seat('업로드 봇', '업로드 봇', [1, 11], { speed: 1.9 });
  seat('내레이터', '내레이터', [1, 5]);
  seat('점검 로봇', '점검 로봇', [1, 11], { speed: 1.9 });
  // 제작본부: 늘 앉아 있는 건 아니다 — 담당 넷이 일이 있을 때 휴게실에서 들어와 작품 하나를 맡는다
  const MAKER_CHARS = [[0, 6], [1, 8], [0, 10], [1, 9]];
  const MAKER_DESK = PORTRAIT ? [[10.4, 15.4], [14, 15.4], [10.4, 18.4], [14, 18.4]] : [[11.5, 9.6], [15, 9.6], [18.5, 9.6], [11.5, 12.4]];
  const MAKER_REST = PORTRAIT ? [[9.6, 25.6], [11, 25.6], [12.4, 25.6], [15, 24.8]] : [[13, 18.6], [15, 19.6], [17, 18.6], [24, 18.8]];
  const makers = MAKER_DESK.map(([dx, dy], i) => {
    const key = 'maker:' + (i + 1);
    addPerson(key, '제작 ' + (i + 1), MAKER_CHARS[i], dx * T, dy * T, { maker: true, on: i < 2, work: i < 2 ? DATA.works[i * 7 % DATA.works.length] : null, restX: MAKER_REST[i][0] * T, restY: MAKER_REST[i][1] * T });
    const p = people[key]; if (!p.on) { p.x = p.restX; p.y = p.restY; p.homeX = p.restX; p.homeY = p.restY; p.typing = false; }
    DATA.info[key] = { name: '제작 담당', who: 'AI', tool: '코딩 AI', does: '일이 있을 때 들어와 작품 하나를 맡는다. 3D 화면·장면 글·다큐 원고를 만들고 고친다.' };
    return p;
  });
  const desks = makers.map((p) => ({ x: p.deskX, y: p.deskY }));
  // 작품 진열장: 출시한 작품 아이콘 — 누르면 그 작품으로
  const SHELF = PORTRAIT ? { x: 0.8 * T, y: 16 * T, cols: 5, gap: 22, size: 16 } : { x: 1 * T, y: 10 * T, cols: 5, gap: 23, size: 17 };
  const shelfAt = (i) => [SHELF.x + (i % SHELF.cols) * SHELF.gap, SHELF.y + Math.floor(i / SHELF.cols) * (SHELF.gap - 2)];
  // 진열장은 3줄까지 — 넘치면 최신 작품만 놓고 마지막 칸에 '+N'(누르면 전체 목록). 작품이 늘어도 방 밖으로 넘치지 않게
  const SHELF_MAX = SHELF.cols * 3;
  const SHOWN = DATA.works.length > SHELF_MAX ? DATA.works.slice(-(SHELF_MAX - 1)) : DATA.works;
  const MORE = DATA.works.length - SHOWN.length;
  const ALL_URL = document.documentElement.lang === 'en' ? '/en' : '/';
  const roomOf = (p) => ROOMS.find((r) => p.homeX >= r.x * T && p.homeX < (r.x + r.w) * T && p.homeY >= r.y * T && p.homeY < (r.y + r.h) * T);

  // ---------------------------------------------------------------- 길 찾기: 내 방 문 → 복도 → 상대 방 문 → 목적지
  function routePort(p, tx, ty) {
    const inRoom = (x, y) => ROOMS.find((r) => x >= r.x * T && x < (r.x + r.w) * T && y >= r.y * T && y < (r.y + r.h) * T);
    const from = inRoom(p.x, p.y) ?? roomOf(p), to = inRoom(tx, ty);
    const pts = [];
    const exitOf = (r, y) => (r.open ? [[SPINE, y]] : [[r.side === 'r' ? (r.x + r.w - 1) * T : (r.x + 1) * T, r.doorY * T], [SPINE, r.doorY * T]]);
    if (from && to && from !== to) {
      pts.push(...exitOf(from, p.y));
      const back = exitOf(to, ty).reverse();
      pts.push([SPINE, back[0][1]], ...back);
    }
    pts.push([tx, ty]);
    return pts;
  }
  function route(p, tx, ty) {
    if (PORTRAIT) return routePort(p, tx, ty);
    const from = ROOMS.find((r) => p.x >= r.x * T && p.x < (r.x + r.w) * T && p.y >= r.y * T && p.y < (r.y + r.h) * T) ?? roomOf(p);
    const to = ROOMS.find((r) => tx >= r.x * T && tx < (r.x + r.w) * T && ty >= r.y * T && ty < (r.y + r.h) * T);
    const pts = [];
    const via = (room) => (room.name === '휴게실' ? 15 * T : CORRIDOR_Y);
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
  const goHome = (key) => { const p = people[key]; if (p.maker) { p.homeX = p.on ? p.deskX : p.restX; p.homeY = p.on ? p.deskY + 14 : p.restY; } return walkTo(key, p.homeX, p.homeY).then(() => { p.typing = !p.maker || p.on; }); };
  const say = (key, s, ms = 2200) => { const p = people[key]; p.say = s; p.sayUntil = performance.now() + ms; return wait(ms).then(() => { if (p.sayUntil <= performance.now()) p.say = ''; }); };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---------------------------------------------------------------- 하루 보기 (새 작품 하나가 나오기까지 — 실제 만드는 순서)
  const STAR_W = DATA.works.find((w) => w.id === 'rainbow') ?? DATA.works[DATA.works.length - 1];
  const SK = 'maker:1';
  const STAR = { w: STAR_W, get x() { return people[SK].deskX; }, get y() { return people[SK].deskY; } };
  let focusKey = null, flash = 0, playing = false;
  const busy = new Set();            // 하루 보기에 나오는 사람 — 돌아다니기에서 뺀다
  const setCap = (s) => { if (cap) cap.textContent = L(s); };
  async function story() {
    if (playing) return; playing = true; playBtn && (playBtn.disabled = true);
    const st = (k) => { focusKey = k; busy.add(k); };
    setCap('아들이 다음 작품 주제를 고릅니다');
    st('아들'); await walkToPerson('아들', '아빠'); await say('아들', '아빠, 다음은 무지개 어때?');
    st('아빠'); await say('아빠', '좋아, 기획해 보자', 1800);
    goHome('아들');
    st('기획 담당'); await say('기획 담당', '기획안 정리할게요');
    setCap('기획실이 기획안을 써서 제작본부로');
    people['기획 담당'].carry = true; await walkTo('기획 담당', STAR.x + 14, STAR.y + 16); await say('기획 담당', '기획안 전달!');
    people['기획 담당'].carry = false; goHome('기획 담당');
    setCap(`담당 AI가 「${STAR.w.title}」를 3D로 만듭니다`);
    st(SK); people[SK].on = true; people[SK].work = STAR.w; await goHome(SK); people[SK].typing = true; await say(SK, '장면 만드는 중…', 2600); await say(SK, '계획부터 확인받을게요', 1800);
    setCap('다큐 원고는 음성 부스에서 녹음');
    people[SK].carry = true; await walkToPerson(SK, '내레이터'); people[SK].carry = false; await say(SK, '원고 녹음 부탁해요');
    st('내레이터'); await say('내레이터', '● 녹음 중 — 쉼표에서 0.25초', 2600);
    st(SK); goHome(SK);
    setCap('점검 로봇이 장면을 하나씩 넘기며 확인');
    st('점검 로봇'); await walkTo('점검 로봇', STAR.x + 16, STAR.y + 18); await say('점검 로봇', '휴대폰·PC 화면 점검 중…', 2200); await say('점검 로봇', '통과!', 1400); goHome('점검 로봇');
    setCap('아들이 직접 보며 어려운 곳을 짚습니다');
    st('아들'); await walkTo('아들', STAR.x + 14, STAR.y + 16); await say('아들', '여기 무슨 말인지 모르겠어', 2200);
    st(SK); await say(SK, '쉬운 말로 고칠게요', 1600); goHome('아들');
    setCap('출시는 아빠가 허락할 때만, 하루 한 번');
    st(SK); await walkToPerson(SK, '아빠'); await say(SK, '출시해도 될까요?');
    st('아빠'); await say('아빠', '올려!', 1600);
    st(SK); await walkTo(SK, ...spot.서버); flash = 40; await say(SK, '배포!', 1600); goHome(SK);
    setCap('홍보팀은 쇼츠와 블로그 글을 준비');
    st('쇼츠 PD'); await say('쇼츠 PD', '쇼츠 렌더링 중 — 첫 2초는 질문으로', 2400);
    st('블로그 작가'); await say('블로그 작가', '블로그 글 예약 — 화·금 08:47', 2200);
    setCap('아침 08:47, 업로드 봇이 서버실에서 올립니다');
    st('업로드 봇'); people['업로드 봇'].carry = true; await walkTo('업로드 봇', ...spot.서버2); people['업로드 봇'].carry = false; flash = 40; await say('업로드 봇', '@seeplore 업로드 완료', 2200); goHome('업로드 봇');
    setCap('이렇게 작품 하나가 나옵니다 — seeplore.com');
    focusKey = null; busy.clear(); await wait(2500);
    setCap(''); playing = false; playBtn && (playBtn.disabled = false);
  }

  // ---------------------------------------------------------------- 자유 모드: 가끔 한 명이 지금 상태를 말한다
  const kst = () => new Date(Date.now() + 9 * 3600e3);
  function nextAt(days, hh, mm) { const n = kst(); for (let d = 0; d < 8; d++) { const x = new Date(Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate() + d, hh, mm)); if (days.includes(x.getUTCDay()) && x > n) return x; } }
  const DAY = EN ? ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] : '일월화수목금토';
  const md = (x) => (EN ? `${DAY[x.getUTCDay()]} ${x.getUTCMonth() + 1}/${x.getUTCDate()}` : `${x.getUTCMonth() + 1}.${x.getUTCDate()}(${DAY[x.getUTCDay()]})`);
  const hm = (x) => `${String(x.getUTCHours()).padStart(2, '0')}:${String(x.getUTCMinutes()).padStart(2, '0')}`;
  function status(key) {
    const n = kst(), h = n.getUTCHours(), dow = n.getUTCDay();
    if (key.startsWith('maker:')) { const p = people[key]; return p.on && p.work ? `「${p.work.title}」 맡는 중` : '휴게실 대기'; }
    switch (key) {
      case '업로드 봇': return `${hm(nextAt([0, 1, 2, 3, 4, 5, 6], 8, 47))} 실행 대기`;
      case '블로그 작가': return dow === 0 && h >= 21 ? '다음 주 글 쓰는 중' : `${md(nextAt([2, 5], 8, 47))} 글 공개 대기`;
      case '쇼츠 PD': return dow === 0 && h >= 21 ? '쇼츠 렌더링 중' : '쇼츠 자막 검토 중';
      case '홍보팀장': return h < 9 ? '오늘 공개분 확인 중' : '검색 색인 확인 중';
      case '아빠': return '결재 대기 중';
      case '기획 담당': return '다음 주제 검토 중';
      case '아들': return pick(['다음 주제 고르는 중', '작품 보며 검토 중']);
      case '내레이터': return '다음 원고 대기';
      case '점검 로봇': return '장면 점검 대기';
      default: return '';
    }
  }
  // ---------------------------------------------------------------- 늘 움직이는 사무실: 한가한 사람에게 심부름을 준다
  const keys = Object.keys(people);
  const out = new Set();               // 지금 자리를 비운 사람
  const at = (key) => [people[key].homeX + 14, people[key].homeY + 2];
  const near = (k) => [SEAT[k][0] * T + 16, SEAT[k][1] * T + 18];
  const spot = PORTRAIT
    ? { 음성: near('내레이터'), 점검: near('점검 로봇'), 서버: [2.6 * T, 25.1 * T], 서버2: [5.2 * T, 25.1 * T], 커피: [10.2 * T, 24.7 * T], 탁자: [13.4 * T, 25.3 * T], 기획: near('기획 담당'), 아빠: near('아빠'), 홍보: [4 * T, 10.2 * T] }
    : { 음성: near('내레이터'), 점검: near('점검 로봇'), 서버: [26.4 * T, 14.2 * T], 서버2: [30 * T, 14.2 * T], 커피: [4 * T, 17.9 * T], 탁자: [10 * T, 18.5 * T], 기획: near('기획 담당'), 아빠: near('아빠'), 홍보: [17 * T + 16, 2.4 * T + 18] };
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const randomDesk = () => pick(desks);
  function errands(key) {
    const d = randomDesk(), dp = [d.x + 14, d.y + 16];
    if (key.startsWith('maker:')) return pick([
      [spot.음성, '원고 녹음 부탁해요', true], [spot.점검, '점검 부탁해요'], [spot.서버, '배포 준비'], [spot.기획, '기획안 질문 있어요', true], [dp, '이 장면 어때요?'],
    ]);
    switch (key) {
      case '아빠': return pick([[spot.홍보, '조회수 어때요?'], [dp, '잘 돼 가요?'], [spot.커피, '커피 한 잔'], [spot.서버, '오늘 배포 몇 번?']]);
      case '아들': return pick([[dp, '여기 어려워요'], [dp, '이 장면 재밌다!'], [spot.아빠, '다음 주제 생각났어', true], [spot.기획, '이것도 만들자']]);
      case '기획 담당': return pick([[dp, '다음 기획안이에요', true], [spot.아빠, '주제 후보 셋', true], [spot.탁자, '아이디어 회의']]);
      case '홍보팀장': return pick([[spot.아빠, '이번 주 글 2편', true], [dp, '쇼츠 장면 골라요'], [spot.커피, '커피 한 잔']]);
      case '블로그 작가': return pick([[dp, '숫자 확인할게요'], [at('업로드 봇'), '글 예약 부탁', true], [spot.탁자, '글감 고르는 중']]);
      case '쇼츠 PD': return pick([[spot.음성, '쇼츠 녹음 부탁', true], [dp, '표지 장면 찍을게요'], [spot.서버, '렌더링 확인']]);
      case '업로드 봇': return pick([[spot.서버, '업로드 준비', true], [spot.홍보, '공개 목록 확인'], [spot.커피, '충전 중…']]);
      case '내레이터': return pick([[dp, '발음 확인해요'], [spot.탁자, '목 풀기']]);
      case '점검 로봇': return pick([[dp, '장면 점검 중…'], [dp, '이름표 잘림 없음'], [spot.서버, '배포 확인']]);
      default: return null;
    }
  }
  async function errand(key) {
    const p0 = people[key];
    if (p0.maker) {                                               // 제작 담당: 들어오기 / 일하기 / 나가기
      out.add(key);
      if (!p0.on) {
        if (makers.filter((m) => m.on).length >= 3) { out.delete(key); return; }
        p0.on = true; p0.work = pick(DATA.works); await goHome(key); await say(key, `「${p0.work.title}」 맡았어요`, 2200);
      } else if (Math.random() < 0.35) {
        await say(key, '끝! 휴게실로', 1500); p0.on = false; p0.work = null; await goHome(key);
      } else {
        const job = errands(key); const [[x, y], line, paper] = job; p0.carry = !!paper;
        await walkTo(key, x, y); p0.carry = false; await say(key, line, 2000); await goHome(key);
      }
      out.delete(key); return;
    }
    const job = errands(key); if (!job) return;
    const [[x, y], line, paper] = job; const p = people[key];
    out.add(key); p.carry = !!paper;
    await walkTo(key, x, y); p.carry = false;
    await say(key, line, 1800 + Math.random() * 900);
    if (Math.random() < 0.5) {                                    // 상대가 대답
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
  function drawModule(r) {
    const x = r.x * T + 4, y = r.y * T + 4, w = r.w * T - 8, h = r.h * T - 8;
    g.fillStyle = '#3a4659'; g.beginPath(); g.roundRect(x - 2, y - 2, w + 4, h + 4, 10); g.fill();            // 선체
    g.fillStyle = r.floor; g.beginPath(); g.roundRect(x, y, w, h, 8); g.fill();
    g.save(); g.beginPath(); g.roundRect(x, y, w, h, 8); g.clip();
    for (let gx = x; gx < x + w; gx += 16) R(gx, y, 1, h, 'rgba(255,255,255,.05)');                         // 바닥 철판
    for (let gy = y; gy < y + h; gy += 16) R(x, gy, w, 1, 'rgba(255,255,255,.05)');
    R(x, y, w, 2, 'rgba(120,220,255,.35)');                                                                // 천장 조명 띠
    g.restore();
    g.strokeStyle = TH.wall; g.lineWidth = 1.2; g.beginPath(); g.roundRect(x - 2, y - 2, w + 4, h + 4, 10); g.stroke();
    for (let k = 0; k < Math.floor(w / 40); k++) { const cx = x + 24 + k * 40; g.fillStyle = '#0a1020'; g.beginPath(); g.arc(cx, y - 1, 3.2, 0, 7); g.fill(); g.strokeStyle = '#9fb2cc'; g.lineWidth = 0.8; g.stroke(); g.fillStyle = 'rgba(200,220,255,.8)'; g.fillRect(cx - 1, y - 2, 1, 1); } // 둥근 창
    text(r.name, x + 8, y + 13, 7.5, TH.label, 'left', 800);
  }
  function drawRoom(r) {
    if (TH.base) return drawModule(r);
    const x = r.x * T, y = r.y * T, w = r.w * T, h = r.h * T;
    R(x, y, w, h, r.floor);
    if (TH.line) for (let yy = y + 6; yy < y + h; yy += 8) R(x, yy, w, 1, TH.line);
    if (TH.chip) { for (let gx = x + 8; gx < x + w; gx += 16) for (let gy = y + 8; gy < y + h; gy += 16) R(gx, gy, 1, 1, '#0d3b2b'); for (let px = x + 6; px < x + w - 4; px += 6) { R(px, y - 2, 2, 2, '#b08d3c'); R(px, y + h, 2, 2, '#b08d3c'); } for (let py = y + 6; py < y + h - 4; py += 6) { R(x - 2, py, 2, 2, '#b08d3c'); R(x + w, py, 2, 2, '#b08d3c'); } }
    if (TH.stars) for (let k = 0; k < (w * h) / 900; k++) { const sx = x + ((k * 97 + r.x * 13) % w), sy = y + ((k * 57 + r.y * 29) % h), tw = (t / 6 + k) % 7 < 1; R(sx, sy, tw ? 2 : 1, tw ? 2 : 1, tw ? '#cfe0ff' : 'rgba(150,180,255,.45)'); }
    if (TH.neon) { g.save(); g.shadowColor = TH.wall; g.shadowBlur = 8; g.strokeStyle = TH.wall; g.lineWidth = 1.2; g.strokeRect(x + 2, y + 2, w - 4, h - 4); g.restore(); }
    if (TH.outline && !TH.stars && !TH.neon) { if (!TH.chip) for (let gx = x + 8; gx < x + w; gx += 16) for (let gy = y + 8; gy < y + h; gy += 16) R(gx, gy, 1, 1, '#1a2028'); R(x, y, w, 1, TH.wall); R(x, y, 1, h, TH.wall); R(x + w - 1, y, 1, h, TH.wall); R(x, y + h - 1, w, 1, TH.wall); }
    else if (TH.stars) { R(x, y, w, 1, TH.wall); R(x, y, 1, h, TH.wall); R(x + w - 1, y, 1, h, TH.wall); R(x, y + h - 1, w, 1, TH.wall); }
    else { R(x, y, w, 3, TH.wall); R(x, y, 2, h, TH.wall); R(x + w - 2, y, 2, h, TH.wall); R(x, y + h - 2, w, 2, TH.wall); }
    // 문(벽 틈)
    if (r.open) { R(SPINE - 10, y, 20, 3, r.floor); R(SPINE - 10, y + h - 3, 20, 3, r.floor); }
    else if (r.side) { const dy = r.doorY * T - 10; if (r.side === 'r') R(x + w - 3, dy, 3, 20, r.floor); else R(x, dy, 3, 20, r.floor); }
    else { const dx = r.door * T - 10; if (r.top) R(dx, y, 20, 3, r.floor); else R(dx, y + h - 2, 20, 2, r.floor); }
    text(TH.outline ? L(r.name).toUpperCase() : r.name, x + 7, y + 13, TH.outline ? 6.5 : 7.5, TH.label, 'left', 800);
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
    s = L(s);
    g.font = `700 6.5px ${FONT}`; const w = g.measureText(s).width + 7;
    R(cx - w / 2, y, w, 9, TH.tagBg); text(s, cx, y + 6.8, 6.5, '#fff');
  }
  function bubble(s, cx, y) {
    s = L(s);
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
    cam.x = WW / 2; cam.y = WH / 2; cam.z = Math.min(canvas.width / WW, canvas.height / WH);
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
    if (TH.base) {                                            // 기지 바깥 우주 (화면 좌표)
      for (let k = 0; k < 140; k++) { const sx = (k * 137.5) % canvas.width, sy = (k * 89.3 + k * k * 0.7) % canvas.height, tw = (t / 8 + k) % 11 < 1; g.fillStyle = tw ? '#ffffff' : `rgba(180,200,255,${0.25 + (k % 5) * 0.12})`; g.fillRect(sx, sy, tw ? 3 : 1.5, tw ? 3 : 1.5); }
      const px = canvas.width * (PORTRAIT ? 1.05 : 1.02), py = canvas.height * (PORTRAIT ? 0.62 : 0.95), pr = Math.min(canvas.width, canvas.height) * (PORTRAIT ? 0.5 : 0.42);
      const pg = g.createRadialGradient(px - pr * 0.35, py - pr * 0.35, pr * 0.1, px, py, pr);
      pg.addColorStop(0, '#5b8fd6'); pg.addColorStop(0.55, '#1f4f8f'); pg.addColorStop(1, '#06142c');
      g.fillStyle = pg; g.beginPath(); g.arc(px, py, pr, 0, 7); g.fill();
      g.strokeStyle = 'rgba(120,180,255,.35)'; g.lineWidth = 6; g.beginPath(); g.arc(px, py, pr + 4, 0, 7); g.stroke();
    }
    g.setTransform(cam.z, 0, 0, cam.z, canvas.width / 2 - cam.x * cam.z, canvas.height / 2 - cam.y * cam.z);
    if (PORTRAIT) {
      if (TH.base) { g.fillStyle = '#3a4659'; g.beginPath(); g.roundRect(7.45 * T, 0, 1.1 * T, WH, 6); g.fill(); R(7.6 * T, 0, 0.8 * T, WH, TH.corridor); for (let k = 0; k < 12; k++) { const py = ((t * 1.3 + k * 40) % WH); R(8 * T - 1, py, 2, 2, (k % 3) ? 'rgba(120,220,255,.7)' : '#ffd24a'); } }
      else R(7.5 * T, 0, T, WH, TH.corridor);                  // 세로 복도
      if (TH.neon) { g.save(); g.shadowColor = TH.wall2; g.shadowBlur = 10; R(8 * T - 0.5, 0, 1, WH, TH.wall2); g.restore(); }
      if (TH.chip) {
        for (const xx of [7.7 * T, 8 * T, 8.3 * T]) R(xx, 0, 1, WH, '#0f4a35');
        for (let k = 0; k < 7; k++) { const py = ((t * (1.1 + (k % 3) * 0.5) + k * 77) % (WH + 40)) - 20, xx = [7.7, 8, 8.3][k % 3] * T; g.fillStyle = 'rgba(61,220,151,.9)'; g.fillRect(xx - 1, py, 3, 6); g.fillStyle = 'rgba(61,220,151,.25)'; g.fillRect(xx, py - 10, 1, 10); }
      }
    } else {
      if (TH.base) { g.fillStyle = '#3a4659'; g.beginPath(); g.roundRect(0, 6.95 * T, WW, 1.1 * T, 6); g.fill(); R(0, 7.1 * T, WW, 0.8 * T, TH.corridor); for (let k = 0; k < 16; k++) { const px = ((t * 1.3 + k * 40) % WW); R(px, 7.5 * T - 1, 2, 2, (k % 3) ? 'rgba(120,220,255,.7)' : '#ffd24a'); } R(11.2 * T, 14.6 * T, 0.6 * T, 0.8 * T, '#3a4659'); R(27.2 * T, 10.8 * T, 0.6 * T, 1.4 * T, '#3a4659'); }
      else R(0, 7 * T, WW, 1 * T, TH.corridor);               // 복도
      if (TH.neon) { g.save(); g.shadowColor = TH.wall2; g.shadowBlur = 10; R(0, 7.5 * T - 0.5, WW, 1, TH.wall2); g.restore(); }
      if (!TH.outline && !TH.base) R(0, 19.5 * T - 1, WW, 1, TH.wall);
      if (TH.chip) {
        for (const yy of [7.2 * T, 7.5 * T, 7.8 * T]) R(0, yy, WW, 1, '#0f4a35');
        R(11.5 * T, 6.5 * T, 1, 13 * T, '#0f4a35'); R(27.5 * T, 6.5 * T, 1, 13 * T, '#0f4a35');
        for (let k = 0; k < 9; k++) { const px = ((t * (1.2 + (k % 3) * 0.5) + k * 61) % (WW + 40)) - 20, yy = [7.2, 7.5, 7.8][k % 3] * T; g.fillStyle = 'rgba(61,220,151,.9)'; g.fillRect(px, yy - 1, 6, 3); g.fillStyle = 'rgba(61,220,151,.25)'; g.fillRect(px - 10, yy, 10, 1); }
        for (let k = 0; k < 3; k++) { const py = 6.5 * T + ((t * 0.9 + k * 70) % (13 * T)); R(11.5 * T - 1, py, 3, 5, '#7dffcf'); R(27.5 * T - 1, (py + 90) % (13 * T) + 6.5 * T, 3, 5, '#7dffcf'); }
      }
    }
    // 테마에 맞는 그림 시트
    indoor = SHEETS['in_' + TH.furn] ?? SHEETS.in_normal; chars = SHEETS['ch_' + TH.people] ?? SHEETS.ch_normal;
    for (const r of ROOMS) drawRoom(r);
    if (indoor && chars) {
      // 소품
      const rack = (sx, sy, k) => { tile(indoor, 25 + (k % 2), 8, sx, sy, 1, 2); for (let j = 0; j < 4; j++) R(sx + 5, sy + 6 + j * 6, 3, 2, flash > 0 ? (t % 4 < 2 ? '#fff36b' : '#4cd17a') : (t / 4 + j + k) % 5 < 3 ? '#4cd17a' : '#1f6b3b'); };
      if (PORTRAIT) {
        tile(indoor, 23, 0, 0.6 * T, 4.4 * T); tile(indoor, 16, 0, 6.2 * T, 4.4 * T);
        tile(indoor, 19, 12, 9 * T, 4.4 * T); tile(indoor, 20, 12, 10 * T, 4.4 * T); tile(indoor, 17, 0, 14.8 * T, 4.6 * T);
        tile(indoor, 23, 8, 9 * T, 8.4 * T, 2, 1); tile(indoor, 16, 0, 6.3 * T, 12.2 * T);
        for (let k = 0; k < 3; k++) rack((1 + k * 2.1) * T, 22.9 * T, k);
        tag('서버', 3.7 * T, 25.5 * T);
        tile(indoor, 0, 12, 9 * T, 22.7 * T, 2, 1); tile(indoor, 5, 12, 11 * T, 22.7 * T);
        tile(indoor, 3, 0, 13.6 * T, 23.6 * T); tile(indoor, 3, 2, 14.6 * T, 23.6 * T);
        text('커피', 10.4 * T, 24.9 * T, 6, TH.label);
      } else {
        tile(indoor, 23, 0, 0.6 * T, 4.4 * T); tile(indoor, 24, 0, 1.6 * T, 4.4 * T);
        tile(indoor, 16, 0, 4.7 * T, 4.9 * T); tile(indoor, 17, 0, 10.7 * T, 4.9 * T); tile(indoor, 16, 0, 23.7 * T, 4.9 * T);
        tile(indoor, 19, 12, 6.5 * T, 3.9 * T); tile(indoor, 20, 12, 7.5 * T, 3.9 * T);
        tile(indoor, 23, 8, 25.6 * T, 4.4 * T, 2, 1);
        for (let k = 0; k < 3; k++) rack((26 + k * 2) * T, 12.4 * T, k);
        tag('서버', 24.6 * T, 14 * T);
        tile(indoor, 0, 12, 2 * T, 16.3 * T, 3, 1); tile(indoor, 5, 12, 5 * T, 16.3 * T);
        for (const bx of [10, 20]) { tile(indoor, 3, 0, bx * T, 17.4 * T); tile(indoor, 1, 2, (bx - 1) * T, 17.4 * T); tile(indoor, 3, 2, (bx + 1) * T, 17.4 * T); }
        tile(indoor, 16, 0, 27 * T, 17.6 * T); tile(indoor, 17, 0, 30.4 * T, 17.6 * T);
        text('커피', 3.5 * T, 18.3 * T, 6, TH.label);
      }
      // 작품 진열장
      text('출시 작품 ' + DATA.works.length, SHELF.x, SHELF.y - 4, 6, TH.label, 'left', 800);
      if (MORE) { const [x, y] = shelfAt(SHOWN.length); R(x - 1, y - 1, SHELF.size + 2, SHELF.size + 2, TH.chip ? '#0f4a35' : 'rgba(0,0,0,.35)'); text('+' + MORE, x + SHELF.size / 2, y + SHELF.size / 2 + 2.5, 7, TH.label, 'center', 800); }
      SHOWN.forEach((w, i) => { const [x, y] = shelfAt(i); R(x - 1, y - 1, SHELF.size + 2, SHELF.size + 2, TH.chip ? '#0f4a35' : 'rgba(0,0,0,.35)'); if (icons[w.id]) g.drawImage(icons[w.id], x, y, SHELF.size, SHELF.size); });
      // 책상과 사람 (위에서 아래 순서로)
      const all = Object.values(people);
      for (const p of all) { const here = Math.abs(p.x - p.deskX) < 2 && Math.abs(p.y - p.deskY - 14) < 2; deskAt(p.deskX, p.deskY, p.maker && p.on && here && p.work ? icons[p.work.id] : null, p.typing && here, t); }
      if (focusKey && people[focusKey]) { const f = people[focusKey]; g.fillStyle = 'rgba(255,200,40,.45)'; g.beginPath(); g.ellipse(f.x, f.y + 7, 10, 4, 0, 0, 7); g.fill(); }
      for (const p of [...all].sort((a, b) => a.y - b.y)) drawPerson(p, t);
      for (const p of all) if (!p.maker) tag(p.label, p.homeX, p.homeY + 10);
      for (const p of makers) tag(p.label, p.x, p.y + 10);
      const now = performance.now();
      for (const p of all) if (p.say && p.sayUntil > now) bubble(p.say, p.x, p.y - 4);
      if (TH.glow) { g.globalCompositeOperation = 'lighter'; for (const p of all) { const gr = g.createRadialGradient(p.deskX, p.deskY + 2, 0, p.deskX, p.deskY + 2, 26); const gc = TH.glowC ?? (TH.chip ? '61,220,151' : '120,200,255'); gr.addColorStop(0, `rgba(${gc},.2)`); gr.addColorStop(1, `rgba(${gc},0)`); g.fillStyle = gr; g.fillRect(p.deskX - 26, p.deskY - 24, 52, 52); } g.globalCompositeOperation = 'source-over'; }
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
    for (let i = 0; i < SHOWN.length + (MORE ? 1 : 0); i++) { const [sx, sy] = shelfAt(i); if (x >= sx - 2 && x <= sx + SHELF.size + 2 && y >= sy - 2 && y <= sy + SHELF.size + 2) return { shelf: SHOWN[i] ?? { title: L('출시 작품 ') + DATA.works.length, url: ALL_URL, more: true }, x: sx, y: sy }; }
    for (const p of Object.values(people)) if (Math.abs(x - p.x) < 14 && y > p.y - 26 && y < p.y + 12) return p;
    return null;
  }
  function showTip(p, ev) {
    if (!tip) return;
    if (!p) { tip.hidden = true; canvas.style.cursor = 'default'; return; }
    const info = DATA.info[p.key];
    tip.innerHTML = p.shelf
      ? `<b>${p.shelf.more ? L(`출시 작품 ${DATA.works.length}`) : p.shelf.title}</b><span class="t">${p.shelf.more ? L(`외 ${MORE}편 · 누르면 전체 목록`) : L('출시 작품 · 누르면 열기')}</span>`
      : `<b>${L(info.name)}</b><span class="t">${info.who}${info.tool ? ' · ' + L(info.tool) : ''}</span><p>${L(info.does)}</p><p class="t">${L('지금: ')}${L(status(p.key))}</p>`;
    canvas.style.cursor = p.shelf ? 'pointer' : 'default';
    tip.hidden = false;
    const [, , r] = worldAt(ev), box = canvas.parentElement.getBoundingClientRect();
    const left = ev.clientX - box.left - tip.offsetWidth / 2, top = ev.clientY - box.top - tip.offsetHeight - 18;
    tip.style.left = Math.max(6, Math.min(box.width - tip.offsetWidth - 6, left)) + 'px';
    tip.style.top = Math.max(6, top) + 'px';
  }
  canvas.addEventListener('pointermove', (e) => showTip(hit(e), e));
  canvas.addEventListener('pointerleave', () => showTip(null));
  canvas.addEventListener('click', (e) => { const p = hit(e); if (p && p.shelf) location.href = p.shelf.url; else { showTip(p, e); if (p && !playing) say(p.key, status(p.key), 2600); } });
  playBtn && playBtn.addEventListener('click', story);

  // ---------------------------------------------------------------- 시작
  Promise.all([load(DATA.sheets.indoor), load(DATA.sheets.chars), ...DATA.works.map((w) => load(w.icon).then((im) => (icons[w.id] = im)))]).then(([a, b]) => {
    SHEETS.in_normal = a; SHEETS.ch_normal = b;
    SHEETS.in_dark = variant(a, (d, i) => { d[i] *= 0.55; d[i + 1] *= 0.55; d[i + 2] *= 0.6; });
    SHEETS.in_gray = variant(a, (d, i) => { gray(d, i); d[i] *= 0.6; d[i + 1] *= 0.6; d[i + 2] *= 0.6; });
    SHEETS.in_ghost = variant(a, (d, i) => { gray(d, i); d[i + 3] *= 0.35; });
    SHEETS.in_teal = variant(a, (d, i) => { const v = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]; d[i] = v * 0.15; d[i + 1] = v * 0.75; d[i + 2] = v * 0.55; d[i + 3] *= 0.7; });
    SHEETS.in_blue = variant(a, (d, i) => { const v = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]; d[i] = v * 0.35; d[i + 1] = v * 0.5; d[i + 2] = v * 0.95; d[i + 3] *= 0.75; });
    SHEETS.in_violet = variant(a, (d, i) => { const v = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]; d[i] = v * 0.7; d[i + 1] = v * 0.3; d[i + 2] = v * 0.85; d[i + 3] *= 0.7; });
    SHEETS.in_sepia = variant(a, (d, i) => { const v = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]; d[i] = v * 0.62; d[i + 1] = v * 0.5; d[i + 2] = v * 0.3; });
    SHEETS.in_steel = variant(a, (d, i) => { const v = 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2]; d[i] = v * 0.62; d[i + 1] = v * 0.72; d[i + 2] = v * 0.88; });
    SHEETS.ch_dim = variant(b, (d, i) => { d[i] *= 0.85; d[i + 1] *= 0.85; d[i + 2] *= 0.85; });
    SHEETS.ch_gray = variant(b, (d, i) => { gray(d, i); d[i] *= 0.8; d[i + 1] *= 0.8; d[i + 2] *= 0.8; });
    indoor = a; chars = b;
    if (SHORTS) setTimeout(story, 600);
  });
  requestAnimationFrame(frame);
  window.__office = { story, people };
})();
