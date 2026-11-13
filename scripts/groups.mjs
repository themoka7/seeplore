/**
 * 첫 페이지(/, /en)의 묶음 — 작품의 field(분야)로 나눈다. 새 작품도 field 만 있으면 저절로 들어간다.
 * ids 는 field 와 다르게 놓을 작품(예: 생명의 역사는 '역사' 분야지만 지구 이야기로, 무지개는 '물리'지만 지구·하늘 이야기로).
 * 어느 묶음에도 맞지 않는 field 는 마지막 묶음으로.
 */
export const GROUPS = [
  {
    key: 'society',
    ko: '역사·사회', en: 'History & Society',
    fields: ['역사', '사회·경제', '사회', '경제'],
    introKo: '지도 위의 우리 역사, 월급과 물가, 통계로 줄인 한 반처럼 우리 삶과 맞닿은 주제.',
    introEn: 'Topics close to everyday life — prices, wages and the value of money.',
  },
  {
    key: 'space',
    ko: '우주·지구', en: 'Space & Earth',
    fields: ['우주', '지구'],
    ids: ['life', 'rainbow'],
    introKo: '블랙홀과 외계 행성에서 땅속·바닷속, 무지개와 파도까지 — 거리·깊이·시간을 따라간다.',
    introEn: 'From black holes and strange planets to rainbows and ocean waves — following distance, depth and time.',
  },
  {
    key: 'tech',
    ko: 'AI·컴퓨터·공학·생명', en: 'AI, Computers, Engineering & Life',
    fields: ['AI·컴퓨터', '공학', '물리', '생명·건강', '생명', '건강'],
    introKo: 'AI가 배우는 법, 컴퓨터 속 0.05초, 아파트와 다리, 비행기와 원자핵, 병원체까지 — 기술과 몸속의 원리.',
    introEn: 'How AI learns, how machines at home work, and the physics of flight — the ideas inside technology.',
  },
];

/** works → [{ g, ws }] (비어 있는 묶음은 뺀다, 묶음 안 순서는 series.json 순서) */
export function groupWorks(works) {
  const of = (w) => GROUPS.find((g) => g.ids?.includes(w.id)) ?? GROUPS.find((g) => g.fields.includes(w.field)) ?? GROUPS[GROUPS.length - 1];
  return GROUPS.map((g) => ({ g, ws: works.filter((w) => of(w) === g) })).filter((x) => x.ws.length);
}
