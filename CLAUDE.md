# seeplore — 작업 규칙

시리즈 허브 저장소. README.md 를 먼저 읽는다.

- `series.json` 이 시리즈 목록의 **유일한 원본**이다. 순서 = 화면 순서. 출시한 작품만 넣는다.
- 아이콘은 `public/icons/series/<id>.png` (192×192). 문법은 계정 스킬 `series-web-doc` 4절.
- `node scripts/build.mjs` 가 점검(필수 칸·중복·아이콘 파일)까지 한다. 실패하면 배포되지 않는다.
- `main` 푸시 = 배포. `series.json` 은 모든 작품 사이트가 읽으므로 형식(`works[]`, 필드 이름)을 바꾸지 않는다. 바꿔야 하면 모든 저장소의 `src/ui/series.ts` 를 먼저 바꾼다.
