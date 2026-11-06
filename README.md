# seeplore

**https://seeplore.com** — 지도와 3D 위에서 펼쳐지는 음성 해설 웹 다큐멘터리 시리즈의 허브.

이 저장소는 두 가지 일을 한다.

1. **시리즈 목록의 원본** `series.json` — 모든 작품 사이트의 시리즈 줄(첫 화면 위, ☰ 메뉴, 다큐 끝 화면)이 `https://seeplore.com/series.json` 을 읽는다.
2. **seeplore.com 첫 페이지** — 같은 목록으로 작품 모음 페이지를 만든다.

## 새 작품 시작하기 (새 세션에서)

1. GitHub 에서 새 저장소를 만든다 — **"Add a README file" 체크**(그래야 `main` 이 생기고 Vercel 실서비스 브랜치가 `main` 으로 잡힌다).
2. Claude Code(웹)에서 그 저장소로 새 세션을 열고 첫 메시지:

   > 시리즈 새 작품 만들자. 저장소는 themoka7/<새 저장소>. 주제는 ○○ (보여 주고 싶은 것: ○○). series-web-doc 스킬대로 계획부터 보여 줘.

3. 다른 AI 가 준 기획안이 있으면 같이 붙여 넣는다. 계획 → 골격 → 데이터 → 다큐 → 음성 → 검색·공유 → 출시 순서로, 단계마다 미리보기 주소(`<프로젝트>-git-dev-thejmok.vercel.app`)로 확인한다.
4. 주소는 `<작품 이름>.seeplore.com` — Spaceship DNS 에 CNAME 한 줄(호스트 `<작품 이름>`, 값 `cname.vercel-dns.com`).

제작 지침 원본: `themoka7/myspacever1` 의 `skills/series-web-doc/` (계정 스킬로 올리는 묶음: `skills/series-web-doc.skill`).

## 새 작품을 냈을 때

1. `public/icons/series/<id>.png` (192×192, 시리즈 아이콘 문법) 추가
2. `series.json` 의 `works` 끝에 한 줄 추가 (`id` · `label`(\n 줄바꿈) · `title` · `url` · `icon` · `desc`)
3. `main` 에 푸시 → Vercel 자동 배포 → 모든 작품 사이트의 시리즈 줄이 바뀐다(브라우저 캐시 5분)
   - 푸시했는데 배포 목록에 그 커밋이 없으면(웹훅 누락) Vercel 대시보드에서 Redeploy 하거나 다음 푸시를 기다린다. API 배포(`create_deployment`)는 팀 무료 한도(하루 100회)에 걸릴 수 있다.

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
