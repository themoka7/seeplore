/**
 * /team — 가상의 회사 "seeplore 스튜디오"를 위에서 내려다본 사무실(인터랙티브, public/team/office.js).
 * ▶ 하루 보기: 새 작품 하나가 나오기까지를 팀원이 실제로 걸어 다니며 보여 준다. /team?shorts = 세로 9:16 쇼츠 녹화용.
 * 가구·사람 그림: Kenney Roguelike Indoor / Roguelike Characters (CC0, public/team/). 모니터·벽·바닥은 코드로 그린다.
 * 말풍선: 예약 일정에서 계산한 상태(업로드·글 공개) + 맡은 일. 지어낸 숫자는 쓰지 않는다.
 * 실제로는 사람 1명(대표) + AI 도구들이 일한다. 재미로 꾸몄지만 내용은 사실대로:
 * 누가 어떤 도구이고 무슨 일을 하는지 그대로 적는다(지어낸 직원·숫자 없음).
 */

export function teamHtml({ works, esc, SITE, BLOG }) {
  const role = (name, who, tool, does, mood) => ({ name, who, tool, does, mood });
  const DEPTS = [
    {
      name: '대표실',
      members: [role('대표', '사람', '사람 1명', '무엇을 만들지 정하고, 다 만든 것을 직접 보고 고치라고 한다. 배포 버튼은 대표만 누른다.', '오늘도 휴대폰으로 결재 중')],
    },
    {
      name: '기획실',
      members: [role('기획 담당', 'AI', '기획 AI', '새 작품 아이디어와 기획안 초안을 낸다. 사실과 다른 곳은 제작본부가 계획 단계에서 짚는다.', '다음 주제 뭐 하지')],
    },
    {
      name: '제작본부',
      note: `작품 하나에 담당 하나. 각자 자기 작품의 3D 화면·장면 글·다큐 원고를 만든다. 모두 AI이고, 일하는 법은 공통 지침서 한 권을 따른다.`,
      works: true,
    },
    {
      name: '다큐 음성팀',
      members: [role('내레이터', 'AI', '음성 합성 AI', '모든 작품의 다큐멘터리 해설과 쇼츠를 읽는다. 0.95배 속도, 쉼표에서 0.25초 쉰다.', '목 관리 중')],
    },
    {
      name: '홍보팀',
      members: [
        role('홍보팀장', 'AI', '코딩 AI', '블로그·쇼츠·검색 등록을 맡고, 다른 팀원이 매주 따를 지침을 쓴다.', '조회수 1 올라갈 때마다 기쁨'),
        role('블로그 작가', 'AI', '코딩 AI (매주 일요일 밤 예약)', '화·금 글을 미리 써 둔다. 중학생 눈높이, 숫자는 작품에 적힌 것만.', '이번 주 글감 고르는 중'),
        role('쇼츠 PD', 'AI', '코딩 AI + 렌더링 스크립트', '작품 장면을 골라 50초 쇼츠로 만든다. 첫 2초는 질문과 화려한 장면.', '편집은 프레임 단위로'),
        role('업로드 봇', '봇', '자동 실행 (매일 08:47)', '날짜가 된 글을 공개하고, 쇼츠를 @seeplore 채널에 올린다.', '알람 없이 일어남'),
      ],
    },
    {
      name: '품질관리',
      members: [role('점검 로봇', '봇', '브라우저 자동 점검', '모든 장면을 넘기며 휴대폰·PC 화면을 찍고 오류를 모은다. 이름표가 잘리면 바로 이른다.', '스크린샷 1,000장째')],
    },
    {
      name: '총무·시설',
      members: [
        role('서류함', '도구', '코드 저장소', '모든 작품의 코드와 글을 보관한다.', '정리 정돈'),
        role('건물 관리', '도구', '웹 호스팅', '사이트를 세상에 띄운다. 하루 100번까지만 문을 여닫을 수 있어서 대표가 아껴 쓴다.', '오늘 남은 배포 횟수 확인'),
      ],
    },
  ];
  const all = DEPTS.flatMap((d) => d.members ?? []);
  const memberCount = all.length + works.length;
  const info = Object.fromEntries(all.map((m) => [m.name, { name: m.name, who: m.who, tool: m.tool, does: m.does }]));
  const data = { works: works.map((w) => ({ id: w.id, title: w.title, url: w.url, icon: w.icon.replace(SITE, '') })), info, sheets: { indoor: '/team/indoor.png', chars: '/team/chars.png' } };
  const card = (m) => `<li><b>${esc(m.name)}</b><span>${esc(m.who)} · ${esc(m.tool)}</span><p>${esc(m.does)}</p></li>`;

  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-TBYJ6JBLYF"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','G-TBYJ6JBLYF',{content_group:'hub'});</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>seeplore 스튜디오</title>
<meta name="description" content="seeplore를 만드는 가상의 회사. 대표 한 명과 AI 팀원들이 새 작품 하나를 어떻게 만드는지 사무실에서 보여 줍니다.">
<link rel="canonical" href="${SITE}/team">
<meta property="og:title" content="seeplore 스튜디오 — 대표 1명과 AI 팀원들">
<meta property="og:description" content="새 작품 하나가 나오기까지, AI 팀원들이 사무실을 오가며 일하는 모습.">
<meta property="og:url" content="${SITE}/team">
<link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png">
<style>
/* 허브(seeplore.com)와 같은 검정 페이지 + 그 안에 불 켜진 사무실 그림 */
:root { --bg: #050608; --panel: rgba(255,255,255,.03); --ink: #f3f5f7; --soft: #9aa3ab; --body: #c9d0d6; --line: rgba(255,255,255,.12); --accent: #ffd24a;
  color-scheme: dark; font-family: 'Pretendard', 'Noto Sans KR', system-ui, -apple-system, sans-serif; color: var(--ink); }
* { box-sizing: border-box; }
html, body { margin: 0; background: var(--bg); }
body { padding-block: calc(env(safe-area-inset-top, 0px) + 28px) 56px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); word-break: keep-all; }
.wrap { max-width: 1040px; margin: 0 auto; display: grid; gap: 16px; }
.back { font-size: 14px; color: var(--soft); text-decoration: none; }
.kicker { margin: 6px 0 0; font-size: 15px; font-weight: 600; color: var(--soft); }
h1 { margin: 6px 0 0; font-size: clamp(40px, 10vw, 72px); line-height: 1; font-weight: 900; letter-spacing: -0.05em; }
.lead { margin: 14px 0 0; font-size: 16px; line-height: 1.7; color: var(--body); max-width: 640px; }
.stage { position: relative; border-radius: 16px; overflow: hidden; border: 1px solid var(--line); background: #6e5338; box-shadow: 0 0 0 1px rgba(0,0,0,.4), 0 20px 60px rgba(0,0,0,.6); }
#office { display: block; width: 100%; height: auto; image-rendering: pixelated; touch-action: manipulation; }
.bar { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
#play { font: 800 15px inherit; font-family: inherit; background: var(--ink); color: #050608; border: 0; border-radius: 999px; padding: 11px 20px; cursor: pointer; }
#play:disabled { opacity: .45; cursor: default; }
#play:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.hint { margin: 0; font-size: 13px; color: var(--soft); }
.themes { display: flex; gap: 4px; } .themes button { font: 700 13px inherit; font-family: inherit; color: var(--ink); background: transparent; border: 1px solid var(--line); border-radius: 999px; padding: 8px 12px; cursor: pointer; } .themes button[aria-pressed="true"] { background: var(--ink); color: #050608; }
#caption { position: absolute; left: 50%; bottom: 14px; transform: translateX(-50%); max-width: calc(100% - 24px); background: rgba(5,6,8,.86); color: #fff; font-weight: 800; font-size: clamp(13px, 2vw, 17px); padding: 8px 14px; border-radius: 10px; text-align: center; pointer-events: none; }
#caption:empty { display: none; }
.tip { position: absolute; z-index: 3; max-width: 250px; background: #11151a; color: var(--ink); border: 1px solid var(--line); border-radius: 10px; padding: 9px 11px; font-size: 12.5px; line-height: 1.55; box-shadow: 0 8px 24px rgba(0,0,0,.5); pointer-events: none; }
.tip b { display: block; font-size: 13.5px; } .tip .t { color: var(--soft); font-size: 11.5px; } .tip p { margin: 4px 0 0; color: var(--body); }
.box { border: 1px solid var(--line); border-radius: 16px; padding: 16px 18px; background: var(--panel); min-width: 0; }
h2 { margin: 0 0 10px; font-size: 16px; letter-spacing: -0.01em; }
ul { list-style: none; margin: 0; padding: 0; }
.team { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 10px; }
.team li { border: 1px solid var(--line); border-radius: 12px; padding: 11px 13px; background: rgba(255,255,255,.02); }
.team b { font-size: 14.5px; } .team span { display: block; color: var(--soft); font-size: 12px; margin-top: 2px; } .team p { margin: 6px 0 0; font-size: 13px; line-height: 1.6; color: var(--body); }
.note { margin: 0 0 10px; font-size: 13.5px; line-height: 1.75; color: var(--body); }
footer { font-size: 12px; line-height: 1.7; color: #6f777e; } footer a { color: #6f777e; }
/* 쇼츠 녹화용: 세로 화면 하나만 */
body.shorts { padding: 0; background: #000; }
body.shorts .wrap > :not(.stage) { display: none; }
body.shorts .wrap { max-width: none; }
body.shorts .stage { border: 0; border-radius: 0; height: 100vh; aspect-ratio: 9 / 16; margin: 0 auto; }
body.shorts #office { width: 100%; height: 100%; }
body.shorts #caption { top: 57%; bottom: auto; font-size: 22px; }
</style>
</head>
<body>
<script>if (new URLSearchParams(location.search).has('shorts')) document.body.classList.add('shorts');</script>
<div class="wrap">
  <a class="back" href="/">← seeplore</a>
  <div>
    <p class="kicker">가상의 회사 · 사람 1명, AI 팀원 ${memberCount - 1}</p>
    <h1>seeplore 스튜디오</h1>
    <p class="lead">seeplore를 실제로 이렇게 나눠서 만들고 있어서 회사처럼 꾸며 봤습니다. 대표 한 명이 정하고, 나머지는 AI와 자동화 도구가 맡습니다.</p>
  </div>
  <div class="bar"><button id="play" type="button">▶ 작품 하나가 나오기까지 보기</button><div class="themes" role="group" aria-label="시안"><button type="button" data-t="day">낮</button><button type="button" data-t="night">밤</button><button type="button" data-t="line">도면</button><button type="button" data-t="mono">흑백</button></div><p class="hint">팀원을 누르면 하는 일과 지금 상태가 보입니다. 제작본부 책상을 누르면 그 작품으로.</p></div>
  <div class="stage">
    <canvas id="office" width="1024" height="800" role="img" aria-label="위에서 내려다본 seeplore 스튜디오. 대표실, 기획실, 홍보팀, 음성 부스, 작품 ${works.length}개를 맡은 제작본부, 품질관리, 서버실, 휴게실."></canvas>
    <div id="caption" aria-live="polite"></div>
    <div class="tip" id="tip" hidden></div>
  </div>
  <div class="box"><h2>일하는 법</h2>
      <p class="note">· 대표가 주제를 고르면 기획실 AI가 기획안을 내고, 제작본부 담당 AI가 계획을 다시 짜서 확인받은 뒤 만든다.<br>· 글은 중학생이 혼자 읽고 이해할 수 있게, 숫자는 계산하거나 출처가 있는 것만.<br>· 사이트에 올리는 건 하루 한 번, 대표가 허락할 때만.<br>· 블로그·쇼츠는 자동으로 올리고, 네이버·X·스레드는 대표가 올릴 원고를 미리 만든다.</p></div>
  <div class="box">
    <h2>팀원</h2>
    <p class="note">사람은 대표 한 명. 나머지는 실제로 쓰는 AI와 도구입니다. 제작본부는 작품 하나에 AI 하나씩 ${works.length}명.</p>
    <ul class="team">${all.map(card).join('')}</ul>
  </div>
  <footer>가구·사람 그림: Kenney Roguelike Indoor · Roguelike Characters (CC0) · <a href="/about">seeplore 소개</a> · <a href="${BLOG}">블로그</a> · <a href="https://www.youtube.com/@seeplore">YouTube</a></footer>
</div>
<script>if (document.body.classList.contains('shorts')) { const c = document.getElementById('office'); c.width = 720; c.height = 1280; }</script>
<script id="office-data" type="application/json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>
<script src="/team/office.js"></script>
<script>{ const bs = document.querySelectorAll('.themes button'); const cur = new URLSearchParams(location.search).get('theme') || 'day'; bs.forEach((b) => { b.setAttribute('aria-pressed', b.dataset.t === cur); b.onclick = () => { window.__setTheme(b.dataset.t); bs.forEach((x) => x.setAttribute('aria-pressed', x === b)); }; }); }</script>
</body>
</html>
`;
}
