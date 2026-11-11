# seeplore — 작업 규칙

시리즈 허브 저장소. README.md 를 먼저 읽는다.

- `series.json` 이 시리즈 목록의 **유일한 원본**이다. 순서 = 화면 순서. 출시한 작품만 넣는다.
- 아이콘은 `public/icons/series/<id>.png` (192×192). 문법은 계정 스킬 `series-web-doc` 4절.
- `node scripts/build.mjs` 가 점검(필수 칸·중복·아이콘 파일)까지 한다. 실패하면 배포되지 않는다.
- `main` 푸시 = 배포. `series.json` 은 모든 작품 사이트가 읽으므로 형식(`works[]`, 필드 이름)을 바꾸지 않는다. 바꿔야 하면 모든 저장소의 `src/ui/series.ts` 를 먼저 바꾼다.
- 작품마다 `field`(분야: 역사·우주·지구·물리·AI·컴퓨터·공학·사회·경제·생명·건강 …)를 넣는다 — 소개 페이지(`/about`)·`llms.txt`·JSON-LD(CreativeWorkSeries)가 분야별로 묶는다. 없으면 '그 밖의 주제'.
- `/about`·`llms.txt` 는 AI·검색엔진이 seeplore 를 정확히 요약하라고 둔 서술형 소개다(구글 AI 모드가 '도시·건축 이야기'로 잘못 요약했다, 2026-11-11). 시리즈 성격이 바뀌면 `scripts/build.mjs` 의 `WHAT` 과 소개 문장을 함께 고친다.
- `/team`(가상의 회사 seeplore 스튜디오)의 가구·사람 그림은 Kenney Roguelike Indoor·Characters(CC0, `public/team/`). 업무일지는 `scripts/team.mjs` 의 LOG 맨 위에 한 줄씩.
- `/team` 미리보기 아티팩트: https://claude.ai/artifact/VXtckrhW7hCfJGHB3BkXx9 (같은 주소에 다시 올린다 — 그림·아이콘을 data URI 로, office.js 를 안에 넣고, GA 를 뺀 판). 쇼츠 녹화는 `/team?shorts`(세로 9:16, 하루 보기 자동 재생).
