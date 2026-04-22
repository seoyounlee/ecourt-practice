'use strict';

// ══════════════════════════════════════════════════════
//  CASE_DB — 전체 사건 데이터베이스 (30건)
//  certNo: 관리자만 확인 가능한 전자소송인증번호
// ══════════════════════════════════════════════════════
const CASE_DB = [
  // ─── 민사 · 대여금 (5건) ───────────────────────────────
  {
    caseNo:'2026가단10218', court:'창원지법', dept:'22단독', suitType:'민사',
    type:'대여금', plaintiff:'박○○', defendant:'이○○',
    status:'진행중', filed:'2026.01.15', next:'2026.05.20', judge:'김○○',
    certNo:'ECFS-100218'
  },
  {
    caseNo:'2025가단520738', court:'수원지법', dept:'민사1단독', suitType:'민사',
    type:'대여금', plaintiff:'홍○○', defendant:'주식회사 바른커리어',
    status:'진행중', filed:'2025.03.15', next:'2026.06.10', judge:'김○○',
    certNo:'ECFS-220738'
  },
  {
    caseNo:'2026가단40227', court:'의정부지법', dept:'민사단독', suitType:'민사',
    type:'대여금', plaintiff:'강○○', defendant:'조○○',
    status:'진행중', filed:'2026.02.10', next:'2026.06.10', judge:'이○○',
    certNo:'ECFS-340227'
  },
  {
    caseNo:'2025가단550302', court:'인천지법', dept:'민사단독', suitType:'민사',
    type:'대여금', plaintiff:'곽○○', defendant:'허○○',
    status:'진행중', filed:'2025.04.18', next:'2026.06.16', judge:'방○○',
    certNo:'ECFS-450302'
  },
  {
    caseNo:'2026나11009', court:'부산지법', dept:'민사항소부', suitType:'민사',
    type:'대여금', plaintiff:'하○○', defendant:'류○○',
    status:'진행중', filed:'2026.02.26', next:'2026.05.28', judge:'서○○',
    certNo:'ECFS-511009'
  },

  // ─── 민사 · 손해배상 (4건) ──────────────────────────────
  {
    caseNo:'2026가단20115', court:'수원지법', dept:'민사1단독', suitType:'민사',
    type:'손해배상(기)', plaintiff:'김○○', defendant:'(주)태양건설',
    status:'진행중', filed:'2026.02.03', next:'2026.05.14', judge:'이○○',
    certNo:'ECFS-620115'
  },
  {
    caseNo:'2024가합123456', court:'서울중앙지법', dept:'민사합의14부', suitType:'민사',
    type:'손해배상(기)', plaintiff:'이○○', defendant:'삼성화재보험(주)',
    status:'진행중', filed:'2024.11.20', next:'2026.05.08', judge:'박○○',
    certNo:'ECFS-723456'
  },
  {
    caseNo:'2025가합77432', court:'서울중앙지법', dept:'민사합의18부', suitType:'민사',
    type:'손해배상(자)', plaintiff:'장○○', defendant:'현대해상화재보험(주)',
    status:'진행중', filed:'2025.08.14', next:'2026.06.17', judge:'조○○',
    certNo:'ECFS-877432'
  },
  {
    caseNo:'2026가단80125', court:'창원지법', dept:'민사단독', suitType:'민사',
    type:'손해배상(의)', plaintiff:'노○○', defendant:'의료법인 희망의원',
    status:'진행중', filed:'2026.01.22', next:'2026.06.09', judge:'류○○',
    certNo:'ECFS-980125'
  },

  // ─── 민사 · 임대차보증금 (3건) ──────────────────────────
  {
    caseNo:'2025가합99001', court:'서울중앙지법', dept:'민사합의21부', suitType:'민사',
    type:'임대차보증금', plaintiff:'정○○', defendant:'최○○',
    status:'진행중', filed:'2025.10.07', next:'2026.06.03', judge:'박○○',
    certNo:'ECFS-A99001'
  },
  {
    caseNo:'2026가단50891', court:'서울남부지법', dept:'민사단독', suitType:'민사',
    type:'임대차보증금', plaintiff:'한○○', defendant:'윤○○',
    status:'진행중', filed:'2026.02.20', next:'2026.05.27', judge:'정○○',
    certNo:'ECFS-B50891'
  },
  {
    caseNo:'2025가단430217', court:'서울동부지법', dept:'민사단독', suitType:'민사',
    type:'임대차보증금', plaintiff:'계○○', defendant:'전○○',
    status:'진행중', filed:'2025.07.11', next:'2026.05.13', judge:'전○○',
    certNo:'ECFS-C30217'
  },

  // ─── 민사 · 매매대금 / 양수금 (3건) ─────────────────────
  {
    caseNo:'2026가소31001', court:'인천지법', dept:'민사소액', suitType:'민사',
    type:'매매대금', plaintiff:'오○○', defendant:'박○○',
    status:'진행중', filed:'2026.01.28', next:'2026.05.12', judge:'김○○',
    certNo:'ECFS-D31001'
  },
  {
    caseNo:'2025가단480019', court:'서울남부지법', dept:'민사단독', suitType:'민사',
    type:'매매대금', plaintiff:'권○○', defendant:'황○○',
    status:'진행중', filed:'2025.07.22', next:'2026.05.06', judge:'장○○',
    certNo:'ECFS-E80019'
  },
  {
    caseNo:'2026가단70044', court:'수원지법', dept:'민사2단독', suitType:'민사',
    type:'양수금', plaintiff:'신○○', defendant:'이○○',
    status:'진행중', filed:'2026.02.18', next:'2026.06.24', judge:'한○○',
    certNo:'ECFS-F70044'
  },

  // ─── 민사 · 임금 / 퇴직금 / 공사대금 (3건) ─────────────
  {
    caseNo:'2025나33210', court:'서울동부지법', dept:'민사항소부', suitType:'민사',
    type:'임금', plaintiff:'최○○', defendant:'(주)테크솔루션',
    status:'진행중', filed:'2024.08.05', next:'2026.05.25', judge:'최○○',
    certNo:'ECFS-G33210'
  },
  {
    caseNo:'2026가단61203', court:'서울서부지법', dept:'민사단독', suitType:'민사',
    type:'퇴직금', plaintiff:'임○○', defendant:'유한회사 대성상사',
    status:'진행중', filed:'2026.01.05', next:'2026.05.19', judge:'강○○',
    certNo:'ECFS-H61203'
  },
  {
    caseNo:'2025가단599001', court:'서울북부지법', dept:'민사단독', suitType:'민사',
    type:'공사대금', plaintiff:'신○○', defendant:'박○○',
    status:'진행중', filed:'2025.12.01', next:'2026.05.18', judge:'노○○',
    certNo:'ECFS-I99001'
  },

  // ─── 민사 · 기타 (3건) ──────────────────────────────────
  {
    caseNo:'2026가단91033', court:'수원지법 성남지원', dept:'민사단독', suitType:'민사',
    type:'관리비', plaintiff:'성남○○아파트입주자대표회의', defendant:'주○○',
    status:'진행중', filed:'2026.02.14', next:'2026.05.26', judge:'백○○',
    certNo:'ECFS-J91033'
  },
  {
    caseNo:'2025가합65201', court:'서울중앙지법', dept:'민사합의30부', suitType:'민사',
    type:'소유권이전등기', plaintiff:'천○○', defendant:'방○○',
    status:'진행중', filed:'2025.06.25', next:'2026.06.23', judge:'편○○',
    certNo:'ECFS-K65201'
  },
  {
    caseNo:'2026가합22001', court:'부산지법', dept:'민사합의2부', suitType:'민사',
    type:'채무부존재확인', plaintiff:'(주)하나은행', defendant:'고○○',
    status:'진행중', filed:'2026.02.07', next:'2026.06.22', judge:'고○○',
    certNo:'ECFS-L22001'
  },

  // ─── 가사 (3건) ─────────────────────────────────────────
  {
    caseNo:'2025느단38821', court:'서울가정법원', dept:'가사단독', suitType:'가사',
    type:'이혼', plaintiff:'문○○', defendant:'심○○',
    status:'진행중', filed:'2025.09.01', next:'2026.05.21', judge:'윤○○',
    certNo:'ECFS-M38821'
  },
  {
    caseNo:'2025느합12005', court:'수원가정법원', dept:'가사합의부', suitType:'가사',
    type:'양육비', plaintiff:'남○○', defendant:'엄○○',
    status:'진행중', filed:'2025.05.30', next:'2026.06.04', judge:'차○○',
    certNo:'ECFS-N12005'
  },
  {
    caseNo:'2025느합19004', court:'서울가정법원', dept:'가사합의부', suitType:'가사',
    type:'재산분할', plaintiff:'안○○', defendant:'계○○',
    status:'진행중', filed:'2025.08.05', next:'2026.05.07', judge:'탁○○',
    certNo:'ECFS-O19004'
  },

  // ─── 행정 (2건) ─────────────────────────────────────────
  {
    caseNo:'2025구합88003', court:'서울행정법원', dept:'행정합의1부', suitType:'행정',
    type:'영업정지처분취소', plaintiff:'서○○', defendant:'강남구청장',
    status:'진행중', filed:'2025.11.12', next:'2026.06.11', judge:'천○○',
    certNo:'ECFS-P88003'
  },
  {
    caseNo:'2026구합10044', court:'서울행정법원', dept:'행정합의3부', suitType:'행정',
    type:'요양불승인처분취소', plaintiff:'탁○○', defendant:'근로복지공단이사장',
    status:'진행중', filed:'2026.01.09', next:'2026.06.02', judge:'선○○',
    certNo:'ECFS-Q10044'
  },

  // ─── 민사집행 (2건) ─────────────────────────────────────
  {
    caseNo:'2026타채90201', court:'서울중앙지법', dept:'민사신청', suitType:'민사집행',
    type:'채권압류', plaintiff:'(주)신용보증기금', defendant:'이○○',
    status:'진행중', filed:'2026.03.01', next:'-', judge:'유○○',
    certNo:'ECFS-R90201'
  },
  {
    caseNo:'2026카합12009', court:'수원지법', dept:'민사신청', suitType:'민사집행',
    type:'채권가압류', plaintiff:'백○○', defendant:'배○○',
    status:'진행중', filed:'2026.03.15', next:'-', judge:'도○○',
    certNo:'ECFS-S12009'
  },

  // ─── 소액 (1건) ─────────────────────────────────────────
  {
    caseNo:'2026가소44501', court:'의정부지법', dept:'민사소액', suitType:'민사',
    type:'손해배상(건)', plaintiff:'류○○', defendant:'이○○',
    status:'진행중', filed:'2026.02.25', next:'2026.06.08', judge:'홍○○',
    certNo:'ECFS-T44501'
  },

  // ─── 확정 (1건) ─────────────────────────────────────────
  {
    caseNo:'2024가합189003', court:'서울중앙지법', dept:'민사합의11부', suitType:'민사',
    type:'손해배상(기)', plaintiff:'최○○', defendant:'(주)카카오',
    status:'확정', filed:'2024.03.10', next:'-', judge:'심○○',
    certNo:'ECFS-U89003'
  },
];

// ══════════════════════════════════════════════════════
//  SCHEDULE_DB — 재판기일 데이터 (사건번호로 CASE_DB와 연결)
// ══════════════════════════════════════════════════════
const SCHEDULE_DB = [
  { caseNo:'2026가단10218',   date:'2026-05-20', day:'수', type:'변론', court:'창원지법',       dept:'22단독',       time:'10:00', room:'제103호', judge:'김○○' },
  { caseNo:'2025가단520738',  date:'2026-06-10', day:'수', type:'변론', court:'수원지법',        dept:'민사1단독',    time:'14:00', room:'제304호', judge:'김○○' },
  { caseNo:'2026가단40227',   date:'2026-06-10', day:'수', type:'변론', court:'의정부지법',      dept:'민사단독',     time:'10:30', room:'제205호', judge:'이○○' },
  { caseNo:'2025가단550302',  date:'2026-06-16', day:'화', type:'변론', court:'인천지법',        dept:'민사단독',     time:'14:30', room:'제302호', judge:'방○○' },
  { caseNo:'2026나11009',     date:'2026-05-28', day:'목', type:'변론', court:'부산지법',        dept:'민사항소부',   time:'10:00', room:'제404호', judge:'서○○' },
  { caseNo:'2026가단20115',   date:'2026-05-14', day:'목', type:'변론', court:'수원지법',        dept:'민사1단독',    time:'13:30', room:'제206호', judge:'이○○' },
  { caseNo:'2024가합123456',  date:'2026-05-08', day:'금', type:'조정', court:'서울중앙지법',    dept:'민사합의14부', time:'11:00', room:'제501호', judge:'박○○' },
  { caseNo:'2025가합77432',   date:'2026-06-17', day:'수', type:'변론', court:'서울중앙지법',    dept:'민사합의18부', time:'15:00', room:'제506호', judge:'조○○' },
  { caseNo:'2026가단80125',   date:'2026-06-09', day:'화', type:'변론', court:'창원지법',        dept:'민사단독',     time:'11:00', room:'제205호', judge:'류○○' },
  { caseNo:'2025가합99001',   date:'2026-06-03', day:'수', type:'변론', court:'서울중앙지법',    dept:'민사합의21부', time:'14:00', room:'제503호', judge:'박○○' },
  { caseNo:'2026가단50891',   date:'2026-05-27', day:'수', type:'심문', court:'서울남부지법',    dept:'민사단독',     time:'10:00', room:'제205호', judge:'정○○' },
  { caseNo:'2025가단430217',  date:'2026-05-13', day:'수', type:'변론', court:'서울동부지법',    dept:'민사단독',     time:'10:00', room:'제303호', judge:'전○○' },
  { caseNo:'2026가소31001',   date:'2026-05-12', day:'화', type:'변론', court:'인천지법',        dept:'민사소액',     time:'14:00', room:'제104호', judge:'김○○' },
  { caseNo:'2025가단480019',  date:'2026-05-06', day:'수', type:'변론', court:'서울남부지법',    dept:'민사단독',     time:'14:30', room:'제203호', judge:'장○○' },
  { caseNo:'2026가단70044',   date:'2026-06-24', day:'수', type:'변론', court:'수원지법',        dept:'민사2단독',    time:'13:00', room:'제307호', judge:'한○○' },
  { caseNo:'2025나33210',     date:'2026-05-25', day:'월', type:'변론', court:'서울동부지법',    dept:'민사항소부',   time:'10:30', room:'제202호', judge:'최○○' },
  { caseNo:'2026가단61203',   date:'2026-05-19', day:'화', type:'변론', court:'서울서부지법',    dept:'민사단독',     time:'10:30', room:'제304호', judge:'강○○' },
  { caseNo:'2025가단599001',  date:'2026-05-18', day:'월', type:'변론', court:'서울북부지법',    dept:'민사단독',     time:'14:00', room:'제206호', judge:'노○○' },
  { caseNo:'2026가단91033',   date:'2026-05-26', day:'화', type:'변론', court:'수원지법 성남지원', dept:'민사단독', time:'14:00', room:'제205호', judge:'백○○' },
  { caseNo:'2025가합65201',   date:'2026-06-23', day:'화', type:'변론', court:'서울중앙지법',    dept:'민사합의30부', time:'10:30', room:'제508호', judge:'편○○' },
  { caseNo:'2026가합22001',   date:'2026-06-22', day:'월', type:'변론', court:'부산지법',        dept:'민사합의2부',  time:'10:00', room:'제402호', judge:'고○○' },
  { caseNo:'2025느단38821',   date:'2026-05-21', day:'목', type:'변론', court:'서울가정법원',    dept:'가사단독',     time:'10:00', room:'제401호', judge:'윤○○' },
  { caseNo:'2025느합12005',   date:'2026-06-04', day:'목', type:'조정', court:'수원가정법원',    dept:'가사합의부',   time:'11:30', room:'제302호', judge:'차○○' },
  { caseNo:'2025느합19004',   date:'2026-05-07', day:'목', type:'변론', court:'서울가정법원',    dept:'가사합의부',   time:'14:00', room:'제403호', judge:'탁○○' },
  { caseNo:'2025구합88003',   date:'2026-06-11', day:'목', type:'변론', court:'서울행정법원',    dept:'행정합의1부',  time:'10:00', room:'제603호', judge:'천○○' },
  { caseNo:'2026구합10044',   date:'2026-06-02', day:'화', type:'변론', court:'서울행정법원',    dept:'행정합의3부',  time:'11:00', room:'제605호', judge:'선○○' },
  { caseNo:'2026가소44501',   date:'2026-06-08', day:'월', type:'변론', court:'의정부지법',      dept:'민사소액',     time:'10:30', room:'제106호', judge:'홍○○' },
];

// ══════════════════════════════════════════════════════
//  헬퍼 — 학습자별 배정 사건 조회 / 저장
// ══════════════════════════════════════════════════════
function getAssignments() {
  try { return JSON.parse(localStorage.getItem('ec_case_assignments') || '{}'); }
  catch { return {}; }
}
function saveAssignments(obj) {
  try { localStorage.setItem('ec_case_assignments', JSON.stringify(obj)); }
  catch {}
}
function getAssignedCases(userId) {
  const a = getAssignments();
  const nos = a[userId] || [];
  return CASE_DB.filter(c => nos.includes(c.caseNo));
}
function getAssignedSchedule(userId) {
  const cases = getAssignedCases(userId).map(c => c.caseNo);
  return SCHEDULE_DB.filter(s => cases.includes(s.caseNo));
}
