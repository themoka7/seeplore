# seeplore

**https://seeplore.com** — 지도와 3D 위에서 펼쳐지는 음성 해설 웹 다큐멘터리 시리즈의 허브.

이 저장소는 두 가지 일을 한다.

1. **시리즈 목록의 원본** `series.json` — 모든 작품 사이트의 시리즈 줄(첫 화면 위, ☰ 메뉴, 다큐 끝 화면)이 `https://seeplore.com/series.json` 을 읽는다.
2. **seeplore.com 첫 페이지** — 같은 목록으로 작품 모음 페이지를 만든다.

## 새 작품을 냈을 때

1. `public/icons/series/<id>.png` (192×192, 시리즈 아이콘 문법) 추가
2. `series.json` 의 `works` 끝에 한 줄 추가 (`id` · `label`(\n 줄바꿈) · `title` · `url` · `icon` · `desc`)
3. `main` 에 푸시 → Vercel 자동 배포 → 모든 작품 사이트의 시리즈 줄이 바뀐다(브라우저 캐시 5분)

작품 저장소는 손대지 않아도 된다. 단, 각 저장소 `src/ui/series.ts` 의 `SERIES`(허브를 못 읽을 때 쓰는 목록, 정적 페이지용)는 가끔 맞춰 둔다.

## 작품 사이트 쪽 (`src/ui/series.ts`, 모든 저장소에 같은 파일)

- 처음엔 빌드에 들어간 목록이나 지난번에 받아 둔 목록(localStorage `seeplore.series`)으로 그린다.
- 0.8초 뒤 `series.json` 을 받아 바뀐 게 있으면 시리즈 줄을 다시 그린다. 실패하면 그대로.
- 지금 작품이 허브 목록에 아직 없으면(출시 전) 빌드 목록의 자기 항목을 끝에 붙인다.

## 빌드

```bash
node scripts/build.mjs   # series.json 점검 → dist/ (index.html, series.json, sitemap, robots, 아이콘)
```

의존성 없음. `vercel.json` 이 빌드 명령·출력 폴더·CORS(`series.json`, `icons/`) 헤더를 정한다.

## 앞으로

- `starter/` — 새 작품 시작 틀(카드·HUD·목차·첫 화면·축·다큐 플레이어·음성/정적 페이지/아이콘 스크립트). 「신호로 보는 AI」 완성 뒤 거기서 뽑아낸다.
