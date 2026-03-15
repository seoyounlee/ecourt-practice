
// ═══ 전역 ═══
// admin 계정만 하드코딩 — 학생 계정은 모두 localStorage에서 관리
const ADMIN_ACC={
  admin:{pw:'admin1234',name:'관리자',org:'운영팀',role:'admin',created:'2026-01-01'},
};
let curUser=null,addIdChecked=false,editingId=null;

// ─── 스토리지: localStorage 기반 (탭 닫아도 유지) ───────────
function getAcc(){
  try{
    const s=localStorage.getItem('ec_acc');
    const stored=s?JSON.parse(s):{};
    // admin 계정은 항상 ADMIN_ACC 우선 (localStorage에 손상된 데이터가 있어도 무시)
    const merged={...stored,...ADMIN_ACC};
    return merged;
  }catch{return{...ADMIN_ACC};}
}
function saveAcc(id,info){
  try{
    const s=localStorage.getItem('ec_acc');
    const a=s?JSON.parse(s):{};
    a[id]=info;
    localStorage.setItem('ec_acc',JSON.stringify(a));
  }catch{}
}
function delAcc(id){
  // admin은 삭제 불가
  if(id==='admin'){showToast('admin 계정은 삭제할 수 없습니다.','warn');return;}
  try{
    const s=localStorage.getItem('ec_acc');
    const a=s?JSON.parse(s):{};
    delete a[id];
    localStorage.setItem('ec_acc',JSON.stringify(a));
  }catch{}
}
function getAllStoredAcc(){
  // localStorage에 저장된 계정 전체 (admin 포함)
  try{const s=localStorage.getItem('ec_acc');return s?JSON.parse(s):{};}catch{return{};}
}
function getLogs(){try{const s=localStorage.getItem('ec_logs');return s?JSON.parse(s):[];}catch{return[];}}
function addLog(type,msg){const l=getLogs();l.unshift({type,msg,time:new Date().toLocaleString('ko-KR')});if(l.length>100)l.pop();try{localStorage.setItem('ec_logs',JSON.stringify(l));}catch{}}

// ═══ 인증 ═══
function initAuth(){
  try{const u=sessionStorage.getItem('ec_user');if(u){curUser=JSON.parse(u);}}catch{}
  if(!curUser||curUser.role!=='admin'){
    document.getElementById('admin-login-screen').style.display='flex';
    document.getElementById('admin-gnb').style.display='none';
    document.getElementById('admin-content').style.display='none';
    setTimeout(()=>{const el=document.getElementById('adm-id');if(el)el.focus();},200);
    return;
  }
  showAdminPanel();
}
function showAdminPanel(){
  document.getElementById('admin-login-screen').style.display='none';
  document.getElementById('admin-gnb').style.display='block';
  document.getElementById('admin-content').style.display='block';
  const el=document.getElementById('gnb-uname');
  if(el)el.textContent=curUser.name;
  renderAll();
}
function doAdminLogin(){
  const id=(document.getElementById('adm-id').value||'').trim();
  const pw=document.getElementById('adm-pw').value||'';
  const err=document.getElementById('adm-err');
  err.style.display='none';
  if(!id||!pw){
    err.textContent='아이디와 비밀번호를 입력해주세요.';
    err.style.display='block';
    return;
  }
  const accounts=getAcc();
  const acc=accounts[id];
  if(!acc||acc.pw!==pw){
    err.innerHTML='아이디 또는 비밀번호가 올바르지 않습니다.<br><small>관리자 계정: admin / admin1234</small>';
    err.style.display='block';
    document.getElementById('adm-pw').value='';
    return;
  }
  if(acc.role!=='admin'){
    err.textContent='관리자 계정이 아닙니다.';
    err.style.display='block';
    return;
  }
  const user={id,name:acc.name,org:acc.org||'',role:'admin'};
  sessionStorage.setItem('ec_user',JSON.stringify(user));
  curUser=user;
  addLog('login','관리자 로그인: '+id);
  showAdminPanel();
}
function doLogout(){
  if(!confirm('로그아웃 하시겠습니까?'))return;
  sessionStorage.removeItem('ec_user');
  curUser=null;
  document.getElementById('admin-login-screen').style.display='flex';
  document.getElementById('admin-gnb').style.display='none';
  document.getElementById('admin-content').style.display='none';
  const id=document.getElementById('adm-id');
  const pw=document.getElementById('adm-pw');
  const err=document.getElementById('adm-err');
  if(id)id.value='';
  if(pw)pw.value='';
  if(err)err.style.display='none';
  setTimeout(()=>{if(id)id.focus();},100);
}

// ═══ 패널 전환 ═══
function showPanel(name){
  ['dashboard','accounts','add','practice','logs','settings'].forEach(p=>{
    document.getElementById('panel-'+p).style.display=p===name?'block':'none';
    document.getElementById('nav-'+p).className='snav-item'+(p===name?' on':'');
  });
  if(name==='accounts')renderAccTable();
  if(name==='logs')renderFullLogs();
  if(name==='dashboard')renderDashboard();
  if(name==='practice')renderPracticePanel();
}

// ═══ 대시보드 ═══
function renderDashboard(){
  const acc=getAcc();const ids=Object.keys(acc);
  const total=ids.length;
  const users=ids.filter(i=>acc[i].role!=='admin').length;
  const admins=ids.filter(i=>acc[i].role==='admin').length;
  document.getElementById('stat-total').textContent=total;
  document.getElementById('stat-users').textContent=users;
  document.getElementById('stat-admins').textContent=admins;
  document.getElementById('acc-cnt').textContent=total;

  // 실습 현황 통계 - Supabase에서 비동기 로딩
  sbGetAllRecords().then(records=>{
    const localRecs=getAllRecords();
    const finalRecords=records.length>0?records:localRecs;
    const practiceAvg=finalRecords.length?Math.round(finalRecords.reduce((s,r)=>s+r.score,0)/finalRecords.length):0;
    document.getElementById('stat-practice').textContent=finalRecords.length;
    document.getElementById('stat-practice-avg').textContent=practiceAvg+'점';
    document.getElementById('practice-cnt').textContent=finalRecords.length;
    // 최근 실습 기록
    const rp=document.getElementById('recent-practice');
    if(rp){
      rp.innerHTML=finalRecords.slice(0,5).length?finalRecords.slice(0,5).map(r=>`
        <div style="padding:10px 16px;border-bottom:1px solid #f0f2f8;display:flex;align-items:center;gap:10px;">
          <div style="background:${bgFn(r.score)};border-radius:4px;padding:4px 8px;font-size:13px;font-weight:700;color:${colorFn(r.score)};min-width:36px;text-align:center;">${r.score}</div>
          <div style="flex:1;"><div style="font-size:12px;font-weight:600;">${r.userName||'–'} <span style="font-weight:400;color:#888;">(${r.userId||''})</span></div><div style="font-size:11px;color:#aaa;">${r.caseType||'소장 실습'} · ${r.date||''}</div></div>
          <span style="font-size:12px;color:${colorFn(r.score)};">${gradeFn(r.score)}</span>
        </div>`).join('')
      :'<div style="padding:20px;text-align:center;color:#aaa;font-size:12px;">아직 실습 기록이 없습니다.</div>';
    }
  });
  // 최근 계정 (추가된 것 우선)
  const recent=ids.filter(i=>i!=='admin').slice(0,5);
  const recentAll=recent.length?recent:ids.slice(0,5);
  const rb=document.getElementById('recent-accounts');
  rb.innerHTML=recentAll.map(id=>`<div class="log-item" style="padding:10px 20px;"><div class="log-dot ${acc[id].role==='admin'?'orange':'green'}"></div><div class="log-txt"><strong>${acc[id].name}</strong> (${id})<br><span style="color:#aaa;">${acc[id].org||'소속없음'} · ${acc[id].created||'-'}</span></div><span class="badge ${acc[id].role==='admin'?'badge-admin':'badge-user'}">${acc[id].role==='admin'?'관리자':'실습생'}</span></div>`).join('');
  // 최근 실습 기록
  const recentPractice=records.slice(0,5);
  const rp=document.getElementById('recent-practice');
  if(rp){
    rp.innerHTML=recentPractice.length?recentPractice.map(r=>`
      <div style="padding:10px 16px;border-bottom:1px solid #f0f2f8;display:flex;align-items:center;gap:10px;">
        <div style="background:${bgFn(r.score)};border-radius:4px;padding:4px 8px;font-size:13px;font-weight:700;color:${colorFn(r.score)};min-width:36px;text-align:center;">${r.score}</div>
        <div style="flex:1;"><div style="font-size:12px;font-weight:600;">${r.userName||'–'} <span style="font-weight:400;color:#888;">(${r.userId||''})</span></div><div style="font-size:11px;color:#aaa;">${r.caseType||'소장 실습'} · ${r.date||''}</div></div>
        <span style="font-size:12px;color:${colorFn(r.score)};">${gradeFn(r.score)}</span>
      </div>`).join('')
    :'<div style="padding:20px;text-align:center;color:#aaa;font-size:12px;">아직 실습 기록이 없습니다.</div>';
  }
}

// ═══ 계정 테이블 ═══
function renderAccTable(){
  const acc=getAcc();const ids=Object.keys(acc);
  const q=(document.getElementById('acc-search')||{}).value?.trim().toLowerCase()||'';
  const f=(document.getElementById('acc-filter')||{}).value||'';
  const filtered=ids.filter(id=>{
    const a=acc[id];
    if(f&&a.role!==f)return false;
    if(q&&!id.toLowerCase().includes(q)&&!(a.name||'').toLowerCase().includes(q))return false;
    return true;
  });
  document.getElementById('acc-total-label').textContent=filtered.length;
  document.getElementById('acc-cnt').textContent=ids.length;
  const tb=document.getElementById('acc-tbody');
  tb.innerHTML=filtered.map(id=>{
    const a=acc[id];
    const isAdmin=(id==='admin');
    return`<tr>
      <td><input type="checkbox" class="accchk" value="${id}" ${isAdmin?'disabled':''}></td>
      <td><code style="font-size:12px;background:#f0f2f8;padding:2px 6px;border-radius:3px;">${id}</code>${isAdmin?'<span style="font-size:10px;color:#c0392b;margin-left:6px;font-weight:600;">관리자</span>':''}</td>
      <td><strong>${a.name||'–'}</strong></td>
      <td style="color:#666;">${a.org||'–'}</td>
      <td><span class="badge ${a.role==='admin'?'badge-admin':'badge-user'}">${a.role==='admin'?'관리자':'실습생'}</span></td>
      <td><span class="badge badge-active">활성</span></td>
      <td style="color:#888;">${a.created||'–'}</td>
      <td><div style="display:flex;gap:4px;">
        <button class="btn btn-outline btn-sm" onclick="openEdit('${id}')">수정</button>
        <button class="btn btn-gray btn-sm" onclick="resetPw('${id}')">PW초기화</button>
        ${!isAdmin?`<button class="btn btn-red btn-sm" onclick="delAcc1('${id}')">삭제</button>`:''}
      </div></td>
    </tr>`;
  }).join('');
}

// ═══ 계정 추가 ═══
let addIdOk=false;
function checkAddId(){
  const id=document.getElementById('add-id').value.trim();
  const err=document.getElementById('add-id-err');const ok=document.getElementById('add-id-ok');
  err.classList.remove('show');ok.style.display='none';addIdOk=false;
  if(!id){err.textContent='아이디를 입력해주세요.';err.classList.add('show');return;}
  if(!/^[a-z0-9]{4,12}$/.test(id)){err.textContent='영문 소문자+숫자 4~12자로 입력해주세요.';err.classList.add('show');return;}
  if(getAcc()[id]){err.textContent='이미 사용 중인 아이디입니다.';err.classList.add('show');return;}
  ok.style.display='block';addIdOk=true;
}
function doAddAccount(){
  const name=document.getElementById('add-name').value.trim();
  const id=document.getElementById('add-id').value.trim();
  const pw=document.getElementById('add-pw').value;
  const pw2=document.getElementById('add-pw2').value;
  const org=document.getElementById('add-org').value.trim();
  const role=document.getElementById('add-role').value;
  const barNum=(document.getElementById('add-barnum')?.value||'').trim();
  const addr=(document.getElementById('add-addr')?.value||'').trim();
  const tel=(document.getElementById('add-tel')?.value||'').trim();
  const email=(document.getElementById('add-email')?.value||'').trim();
  let valid=true;
  ['add-name-err','add-id-err','add-pw-err','add-pw2-err'].forEach(e=>document.getElementById(e).classList.remove('show'));
  if(!name){document.getElementById('add-name-err').textContent='이름을 입력해주세요.';document.getElementById('add-name-err').classList.add('show');valid=false;}
  if(!addIdOk){document.getElementById('add-id-err').textContent='아이디 중복확인을 해주세요.';document.getElementById('add-id-err').classList.add('show');valid=false;}
  if(pw.length<6){document.getElementById('add-pw-err').textContent='비밀번호는 6자 이상이어야 합니다.';document.getElementById('add-pw-err').classList.add('show');valid=false;}
  if(pw!==pw2){document.getElementById('add-pw2-err').textContent='비밀번호가 일치하지 않습니다.';document.getElementById('add-pw2-err').classList.add('show');valid=false;}
  if(!valid)return;
  const today=new Date().toISOString().split('T')[0];
  saveAcc(id,{pw,name,org,role,barNum,addr,tel,email,created:today});
  addIdOk=false;
  addLog('add',`계정 추가: ${name} (${id}) - ${role==='admin'?'관리자':'실습생'}`);
  showToast('✅ "'+name+'" 계정이 추가되었습니다.','ok');
  resetAddForm();renderAccTable();renderDashboard();
  document.getElementById('acc-cnt').textContent=Object.keys(getAcc()).length;
}
function resetAddForm(){
  ['add-name','add-id','add-pw','add-pw2','add-org','add-barnum','add-addr','add-tel','add-email'].forEach(i=>{
    const el=document.getElementById(i);if(el)el.value='';
  });
  document.getElementById('add-role').value='user';
  document.getElementById('add-id-ok').style.display='none';
  ['add-name-err','add-id-err','add-pw-err','add-pw2-err'].forEach(e=>document.getElementById(e).classList.remove('show'));
  addIdOk=false;
}

// 일괄 추가
function doBulkAdd(){
  const prefix=document.getElementById('bulk-prefix').value.trim();
  const start=parseInt(document.getElementById('bulk-start').value)||1;
  const end=parseInt(document.getElementById('bulk-end').value)||10;
  const pw=document.getElementById('bulk-pw').value.trim()||'court1234';
  if(!prefix){showToast('접두사를 입력해주세요.','err');return;}
  if(end<start||end-start>49){showToast('번호 범위를 확인해주세요. (최대 50개)','warn');return;}
  const today=new Date().toISOString().split('T')[0];
  let added=0;
  for(let i=start;i<=end;i++){
    const id=prefix+String(i).padStart(2,'0');
    if(getAcc()[id])continue;
    saveAcc(id,{pw,name:prefix+String(i).padStart(2,'0'),org:'실습반',role:'user',created:today});
    added++;
  }
  addLog('bulk',`일괄 추가: ${prefix}${String(start).padStart(2,'0')}~${prefix}${String(end).padStart(2,'0')} (${added}개)`);
  showToast(`✅ ${added}개 계정이 추가되었습니다.`,'ok');
  renderDashboard();renderAccTable();
}

// ═══ 계정 수정 ═══
function openEdit(id){
  const acc=getAcc()[id];if(!acc)return;
  editingId=id;
  document.getElementById('edit-id').value=id;
  document.getElementById('edit-name').value=acc.name;
  document.getElementById('edit-pw').value='';
  document.getElementById('edit-org').value=acc.org||'';
  document.getElementById('edit-role').value=acc.role||'user';
  document.getElementById('pop-edit').classList.add('show');
}
function doEditAccount(){
  const name=document.getElementById('edit-name').value.trim();
  const pw=document.getElementById('edit-pw').value;
  const org=document.getElementById('edit-org').value.trim();
  const role=document.getElementById('edit-role').value;
  if(!name){alert('이름을 입력해주세요.');return;}
  const acc=getAcc()[editingId];
  const updated={...acc,name,org,role};
  if(pw&&pw.length>=6)updated.pw=pw;
  else if(pw&&pw.length<6){alert('비밀번호는 6자 이상이어야 합니다.');return;}
  saveAcc(editingId,updated);
  addLog('edit',`계정 수정: ${name} (${editingId})`);
  showToast('✅ 계정이 수정되었습니다.','ok');
  closePop('pop-edit');renderAccTable();renderDashboard();
}

// ═══ 삭제 & 초기화 ═══
function delAcc1(id){
  if(id==='admin'){showToast('admin 계정은 삭제할 수 없습니다.','warn');return;}
  if(!confirm('"'+id+'" 계정을 삭제하시겠습니까?'))return;
  delAcc(id);
  addLog('delete',`계정 삭제: ${id}`);
  showToast('🗑 계정이 삭제되었습니다.','ok');
  renderAccTable();renderDashboard();
}
function delSelected(){
  const chk=[...document.querySelectorAll('.accchk:checked')].map(c=>c.value);
  if(!chk.length){showToast('삭제할 계정을 선택해주세요.','warn');return;}
  const toDelete=chk.filter(id=>id!=='admin');
  const adminBlocked=chk.filter(id=>id==='admin');
  if(adminBlocked.length)showToast('admin 계정은 삭제할 수 없습니다.','warn');
  if(!toDelete.length)return;
  if(!confirm(toDelete.length+'개 계정을 삭제하시겠습니까?'))return;
  toDelete.forEach(id=>delAcc(id));
  addLog('delete',`계정 일괄 삭제: ${toDelete.join(', ')}`);
  showToast(`🗑 ${toDelete.length}개 계정이 삭제되었습니다.`,'ok');
  renderAccTable();renderDashboard();
}
function resetPw(id){
  if(!confirm('"'+id+'" 비밀번호를 court1234로 초기화하시겠습니까?'))return;
  const acc=getAcc()[id];if(!acc)return;
  saveAcc(id,{...acc,pw:'court1234'});
  addLog('edit',`비밀번호 초기화: ${id}`);
  showToast('🔑 비밀번호가 court1234로 초기화되었습니다.','ok');
}
function resetSelected(){
  const chk=[...document.querySelectorAll('.accchk:checked')].map(c=>c.value);
  if(!chk.length){showToast('선택된 계정이 없습니다.','warn');return;}
  if(!confirm(chk.length+'개 계정의 비밀번호를 court1234로 초기화하시겠습니까?'))return;
  chk.forEach(id=>{const acc=getAcc()[id];if(acc)saveAcc(id,{...acc,pw:'court1234'});});
  addLog('edit',`비밀번호 일괄 초기화: ${chk.join(', ')}`);
  showToast(`🔑 ${chk.length}개 계정의 비밀번호가 초기화되었습니다.`,'ok');
  renderAccTable();
}
function resetDefaultPw(){
  // 더 이상 기본 계정이 없으므로 전체 학생 계정 PW 초기화
  const acc=getAcc();
  const students=Object.keys(acc).filter(id=>id!=='admin'&&acc[id].role!=='admin');
  if(!students.length){showToast('초기화할 학생 계정이 없습니다.','warn');return;}
  if(!confirm(`학생 계정 ${students.length}개의 비밀번호를 court1234로 초기화하시겠습니까?`))return;
  students.forEach(id=>saveAcc(id,{...acc[id],pw:'court1234'}));
  addLog('edit',`학생 계정 전체 비밀번호 초기화 (${students.length}개)`);
  showToast(`🔑 ${students.length}개 학생 계정의 비밀번호가 초기화되었습니다.`,'ok');
}
function deleteAddedAccounts(){
  const acc=getAcc();
  const toDelete=Object.keys(acc).filter(id=>id!=='admin'&&acc[id].role!=='admin');
  if(!toDelete.length){showToast('삭제할 학생 계정이 없습니다.','warn');return;}
  if(!confirm(`학생 계정 ${toDelete.length}개를 모두 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`))return;
  toDelete.forEach(id=>delAcc(id));
  addLog('delete',`학생 계정 전체 삭제 (${toDelete.length}개)`);
  showToast(`🗑 학생 계정 ${toDelete.length}개가 삭제되었습니다.`,'ok');
  renderAccTable();renderDashboard();
}

// ═══ 로그 ═══
function renderFullLogs(){
  const logsData=getLogs();
  const colors={login:'green',signup:'blue',add:'blue',delete:'orange',edit:'orange',bulk:'green'};
  document.getElementById('full-logs').innerHTML=logsData.length?logsData.map(l=>`<div class="log-item"><div class="log-dot ${colors[l.type]||'blue'}"></div><div class="log-txt">${l.msg}</div><span class="log-time">${l.time}</span></div>`).join(''):'<div style="text-align:center;color:#aaa;font-size:12px;padding:30px;">활동 로그가 없습니다.</div>';
}
function clearLogs(){
  if(!confirm('모든 로그를 삭제하시겠습니까?'))return;
  localStorage.removeItem('ec_logs');
  showToast('로그가 초기화되었습니다.','ok');
  if(document.getElementById('panel-logs').style.display!=='none')renderFullLogs();
  renderDashboard();
}

// ═══ 실습 현황 ═══
// ═══ Supabase 설정 ═══
const SB_URL = 'https://knpvayujykoqjncctxrr.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtucHZheXVqeWtvcWpuY2N0eHJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM1NzA3NDUsImV4cCI6MjA4OTE0Njc0NX0.rXlo5IsOW6FS5N1X3vgqNM1RvzB84TYPqVhnYyc6FSg';
const SB_HEADERS = {'apikey':SB_KEY,'Authorization':'Bearer '+SB_KEY};

function getAllRecords(){
  // 동기 호환용: localStorage 반환 (비동기 로딩은 renderPracticePanel에서 처리)
  try{return JSON.parse(localStorage.getItem('ec_all_records')||'[]');}catch{return[];}
}

async function sbGetAllRecords(){
  try{
    const res = await fetch(
      SB_URL+'/rest/v1/practice_records?order=created_at.desc&limit=500',
      {headers: SB_HEADERS}
    );
    if(!res.ok) return [];
    const data = await res.json();
    return data.map(r=>({
      userId: r.user_id,
      userName: r.user_name,
      score: r.score,
      feedback: r.feedback,
      caseType: r.case_type,
      court: r.court,
      plaintiff: r.plaintiff,
      defendant: r.defendant,
      hasAgent: r.has_agent,
      evidenceCount: r.evidence_count,
      date: r.date_str || new Date(r.created_at).toLocaleString('ko-KR'),
    }));
  }catch(e){ console.error('[Supabase] 전체기록 읽기 실패:', e); return []; }
}
function gradeFn(s){return s>=90?'🏆 우수':s>=70?'✅ 양호':s>=50?'📝 보통':'⚠️ 미흡';}
function colorFn(s){return s>=90?'#15803d':s>=70?'#1e40af':s>=50?'#92400e':'#991b1b';}
function bgFn(s){return s>=90?'#f0fdf4':s>=70?'#eff6ff':s>=50?'#fffbeb':'#fef2f2';}

function renderPracticePanel(){
  // 로딩 표시
  const statsEl=document.getElementById('practice-stats2');
  if(statsEl)statsEl.innerHTML='<div style="grid-column:1/-1;text-align:center;padding:20px;color:#aaa;">⏳ 데이터 불러오는 중...</div>';
  const body=document.getElementById('student-summary-body');
  if(body)body.innerHTML='<div style="text-align:center;padding:40px;color:#aaa;">⏳ Supabase에서 기록을 불러오는 중...</div>';

  sbGetAllRecords().then(records=>{
    // localStorage 백업과 병합
    const localRecs=getAllRecords();
    const finalRecords=records.length>0?records:localRecs;

    // localStorage에도 캐시
    if(records.length>0){
      try{localStorage.setItem('ec_all_records',JSON.stringify(records));}catch{}
    }

    const total=finalRecords.length;
    const avg=total?Math.round(finalRecords.reduce((s,r)=>s+r.score,0)/total):0;
    const best=total?Math.max(...finalRecords.map(r=>r.score)):0;
    const participants=new Set(finalRecords.map(r=>r.userId)).size;
    document.getElementById('practice-cnt').textContent=total;

    if(statsEl)statsEl.innerHTML=`
      <div style="background:#eff6ff;border-radius:6px;padding:14px;text-align:center;border:1px solid #bfdbfe;">
        <div style="font-size:28px;font-weight:700;color:#1e40af;">${total}</div>
        <div style="font-size:11px;color:#64748b;margin-top:2px;">총 실습 횟수</div>
      </div>
      <div style="background:#f0fdf4;border-radius:6px;padding:14px;text-align:center;border:1px solid #bbf7d0;">
        <div style="font-size:28px;font-weight:700;color:#15803d;">${participants}</div>
        <div style="font-size:11px;color:#64748b;margin-top:2px;">참여 학생 수</div>
      </div>
      <div style="background:#fffbeb;border-radius:6px;padding:14px;text-align:center;border:1px solid #fde68a;">
        <div style="font-size:28px;font-weight:700;color:#92400e;">${avg}</div>
        <div style="font-size:11px;color:#64748b;margin-top:2px;">전체 평균 점수</div>
      </div>
      <div style="background:#fef2f2;border-radius:6px;padding:14px;text-align:center;border:1px solid #fecaca;">
        <div style="font-size:28px;font-weight:700;color:#991b1b;">${best}</div>
        <div style="font-size:11px;color:#64748b;margin-top:2px;">최고 점수</div>
      </div>`;

    // 학생별 요약 렌더링 (데이터 전달)
    renderStudentSummaryWithData(finalRecords);
  });
}

function switchPracticeTab(tab){
  document.getElementById('pview-summary').style.display=tab==='summary'?'':'none';
  document.getElementById('pview-detail').style.display=tab==='detail'?'':'none';
  const on='padding:10px 22px;font-size:13px;font-weight:700;cursor:pointer;border:none;background:none;color:var(--navy2);border-bottom:3px solid var(--navy2);margin-bottom:-2px;font-family:inherit;';
  const off='padding:10px 22px;font-size:13px;font-weight:600;cursor:pointer;border:none;background:none;color:#888;border-bottom:3px solid transparent;margin-bottom:-2px;font-family:inherit;';
  document.getElementById('ptab-summary').style.cssText=tab==='summary'?on:off;
  document.getElementById('ptab-detail').style.cssText=tab==='detail'?on:off;
  if(tab==='detail') renderPracticeDetail();
  else renderStudentSummary();
}

function renderStudentSummaryWithData(records){
  const q=(document.getElementById('student-search')||{}).value?.trim().toLowerCase()||'';
  const byStudent={};
  records.forEach(r=>{
    const uid=r.userId||'unknown';
    if(!byStudent[uid])byStudent[uid]={userId:uid,userName:r.userName||uid,records:[]};
    byStudent[uid].records.push(r);
  });
  let students=Object.values(byStudent);
  if(q)students=students.filter(s=>s.userName.toLowerCase().includes(q)||s.userId.toLowerCase().includes(q));
  const body=document.getElementById('student-summary-body');
  if(!body)return;
  if(!students.length){
    body.innerHTML='<div style="text-align:center;padding:48px;color:#aaa;"><div style="font-size:40px;margin-bottom:12px;">📋</div><div style="font-size:14px;font-weight:600;color:#888;margin-bottom:6px;">아직 실습 기록이 없습니다</div><div style="font-size:12px;">학생이 소장 작성을 완료하면 자동으로 기록됩니다.</div></div>';
    return;
  }
  body.innerHTML=students.map(s=>{
    const cnt=s.records.length;
    const avg=Math.round(s.records.reduce((a,r)=>a+r.score,0)/cnt);
    const best=Math.max(...s.records.map(r=>r.score));
    const latest=s.records[0];
    return `<div style="border-bottom:1px solid #f0f2f8;">
      <div style="padding:14px 20px;display:flex;align-items:center;gap:14px;cursor:pointer;background:#fafbfc;transition:background .15s;"
           onmouseover="this.style.background='#f0f4f8'" onmouseout="this.style.background='#fafbfc'"
           onclick="toggleStudentDetail('sd-${s.userId}')">
        <div style="width:44px;height:44px;background:${bgFn(avg)};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:${colorFn(avg)};flex-shrink:0;border:2px solid ${colorFn(avg)};">${avg}</div>
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:700;color:#003366;">${s.userName}<span style="font-size:11px;font-weight:400;color:#888;margin-left:6px;">(${s.userId})</span></div>
          <div style="font-size:11px;color:#888;margin-top:3px;">실습 <strong>${cnt}회</strong> &nbsp;·&nbsp; 평균 <strong style="color:${colorFn(avg)};">${avg}점</strong> &nbsp;·&nbsp; 최고 <strong>${best}점</strong> &nbsp;·&nbsp; 최근: ${latest.date||'–'}</div>
        </div>
        <span style="font-size:12px;font-weight:700;color:${colorFn(avg)};margin-right:6px;">${gradeFn(avg)}</span>
        <span style="font-size:16px;color:#bbb;" id="arr-${s.userId}">▼</span>
      </div>
      <div id="sd-${s.userId}" style="display:none;background:#fff;">
        ${s.records.map(r=>`
        <div style="padding:14px 20px 14px 40px;border-top:1px solid #f0f4f8;display:flex;gap:14px;align-items:flex-start;">
          <div style="background:${bgFn(r.score)};border-radius:6px;padding:10px 12px;text-align:center;min-width:60px;flex-shrink:0;">
            <div style="font-size:20px;font-weight:700;color:${colorFn(r.score)};line-height:1;">${r.score}</div>
            <div style="font-size:9px;color:${colorFn(r.score)};margin-top:2px;font-weight:600;">${gradeFn(r.score).split(' ')[1]}</div>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:11px;color:#666;margin-bottom:8px;display:flex;flex-wrap:wrap;gap:10px;">
              <span>📅 ${r.date||'–'}</span><span>⚖ ${r.caseType||'소장 실습'}</span>
              <span>🏛 ${r.court||'–'}</span><span>📁 입증서류 ${r.evidenceCount||0}건</span>
            </div>
            <div style="background:#f8f9fc;border:1px solid #e0e6ee;border-radius:4px;padding:10px 12px;">
              <div style="font-size:11px;font-weight:700;color:#003366;margin-bottom:5px;">🤖 AI 피드백</div>
              <div style="font-size:11px;color:#444;line-height:1.8;white-space:pre-wrap;">${(r.feedback||'피드백 없음').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</div>
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>`;
  }).join('');
}

function renderStudentSummary(){
  // 기존 호환: Supabase 로딩 후 renderStudentSummaryWithData 호출
  sbGetAllRecords().then(records=>{
    const localRecs=getAllRecords();
    renderStudentSummaryWithData(records.length>0?records:localRecs);
  });
}
  const q=(document.getElementById('student-search')||{}).value?.trim().toLowerCase()||'';
  const byStudent={};
  records.forEach(r=>{
    const uid=r.userId||'unknown';
    if(!byStudent[uid]) byStudent[uid]={userId:uid,userName:r.userName||uid,records:[]};
    byStudent[uid].records.push(r);
  });
  let students=Object.values(byStudent);
  if(q) students=students.filter(s=>s.userName.toLowerCase().includes(q)||s.userId.toLowerCase().includes(q));
  const body=document.getElementById('student-summary-body');
  if(!students.length){
    body.innerHTML='<div style="text-align:center;padding:48px;color:#aaa;"><div style="font-size:40px;margin-bottom:12px;">📋</div><div style="font-size:14px;font-weight:600;color:#888;margin-bottom:6px;">아직 실습 기록이 없습니다</div><div style="font-size:12px;">학생이 소장 작성을 완료하면 자동으로 기록됩니다.</div></div>';
    return;
  }
  body.innerHTML=students.map(s=>{
    const cnt=s.records.length;
    const avg=Math.round(s.records.reduce((a,r)=>a+r.score,0)/cnt);
    const best=Math.max(...s.records.map(r=>r.score));
    const latest=s.records[0];
    return `<div style="border-bottom:1px solid #f0f2f8;">
      <div style="padding:14px 20px;display:flex;align-items:center;gap:14px;cursor:pointer;background:#fafbfc;transition:background .15s;"
           onmouseover="this.style.background='#f0f4f8'" onmouseout="this.style.background='#fafbfc'"
           onclick="toggleStudentDetail('sd-${s.userId}')">
        <div style="width:44px;height:44px;background:${bgFn(avg)};border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:700;color:${colorFn(avg)};flex-shrink:0;border:2px solid ${colorFn(avg)};">${avg}</div>
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:700;color:#003366;">${s.userName}<span style="font-size:11px;font-weight:400;color:#888;margin-left:6px;">(${s.userId})</span></div>
          <div style="font-size:11px;color:#888;margin-top:3px;">실습 <strong>${cnt}회</strong> &nbsp;·&nbsp; 평균 <strong style="color:${colorFn(avg)};">${avg}점</strong> &nbsp;·&nbsp; 최고 <strong>${best}점</strong> &nbsp;·&nbsp; 최근: ${latest.date||'–'}</div>
        </div>
        <span style="font-size:12px;font-weight:700;color:${colorFn(avg)};margin-right:6px;">${gradeFn(avg)}</span>
        <span style="font-size:16px;color:#bbb;transition:transform .2s;" id="arr-${s.userId}">▼</span>
      </div>
      <div id="sd-${s.userId}" style="display:none;background:#fff;">
        ${s.records.map(r=>`
        <div style="padding:14px 20px 14px 40px;border-top:1px solid #f0f4f8;display:flex;gap:14px;align-items:flex-start;">
          <div style="background:${bgFn(r.score)};border-radius:6px;padding:10px 12px;text-align:center;min-width:60px;flex-shrink:0;">
            <div style="font-size:20px;font-weight:700;color:${colorFn(r.score)};line-height:1;">${r.score}</div>
            <div style="font-size:9px;color:${colorFn(r.score)};margin-top:2px;font-weight:600;">${gradeFn(r.score).split(' ')[1]}</div>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-size:11px;color:#666;margin-bottom:8px;display:flex;flex-wrap:wrap;gap:10px;">
              <span>📅 ${r.date||'–'}</span><span>⚖ ${r.caseType||'소장 실습'}</span>
              <span>🏛 ${r.court||'–'}</span><span>📁 입증서류 ${r.evidenceCount||0}건</span>
            </div>
            <div style="background:#f8f9fc;border:1px solid #e0e6ee;border-radius:4px;padding:10px 12px;">
              <div style="font-size:11px;font-weight:700;color:#003366;margin-bottom:5px;">🤖 AI 피드백</div>
              <div style="font-size:11px;color:#444;line-height:1.8;white-space:pre-wrap;">${(r.feedback||'피드백 없음').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</div>
            </div>
          </div>
        </div>`).join('')}
      </div>
    </div>`;
  }).join('');
}

function toggleStudentDetail(id){
  const el=document.getElementById(id);if(!el)return;
  const uid=id.replace('sd-','');
  const arr=document.getElementById('arr-'+uid);
  const open=el.style.display!=='none';
  el.style.display=open?'none':'block';
  if(arr)arr.textContent=open?'▼':'▲';
}

function renderPracticeDetail(){
  let records=getAllRecords();
  const q=(document.getElementById('practice-search')||{}).value?.trim().toLowerCase()||'';
  const gf=(document.getElementById('practice-grade-filter')||{}).value||'';
  if(q) records=records.filter(r=>(r.userName||'').toLowerCase().includes(q)||(r.userId||'').toLowerCase().includes(q));
  if(gf) records=records.filter(r=>gf==='90'?r.score>=90:gf==='70'?r.score>=70&&r.score<90:gf==='50'?r.score>=50&&r.score<70:r.score<50);
  if(document.getElementById('practice-total-label')) document.getElementById('practice-total-label').textContent=records.length;
  const tbody=document.getElementById('practice-tbody');
  if(!records.length){tbody.innerHTML='<tr><td colspan="9" style="text-align:center;color:#aaa;padding:24px;">실습 기록이 없습니다.</td></tr>';return;}
  tbody.innerHTML=records.map((r,i)=>`<tr>
    <td><strong>${r.userName||'–'}</strong></td>
    <td><code style="font-size:11px;background:#f0f2f8;padding:2px 6px;border-radius:3px;">${r.userId||'–'}</code></td>
    <td><div style="background:${bgFn(r.score)};border-radius:4px;padding:3px 8px;text-align:center;font-weight:700;font-size:13px;color:${colorFn(r.score)};display:inline-block;">${r.score}</div></td>
    <td><span style="color:${colorFn(r.score)};font-weight:600;">${gradeFn(r.score)}</span></td>
    <td style="font-size:11px;">${r.caseType||'–'}</td><td style="font-size:11px;">${r.court||'–'}</td>
    <td style="text-align:center;">${r.evidenceCount||0}건</td>
    <td style="font-size:11px;color:#888;">${r.date||'–'}</td>
    <td><button class="btn btn-gray btn-sm" onclick="showFeedbackDetail(${i})">보기</button></td>
  </tr>`).join('');
  window._practiceRecords=records;
}

function showFeedbackDetail(idx){
  const r=window._practiceRecords?.[idx];
  if(!r)return;
  const existing=document.getElementById('pop-feedback');
  if(existing)existing.remove();
  const pop=document.createElement('div');
  pop.id='pop-feedback';
  pop.className='pop-overlay show';
  pop.innerHTML=`<div class="pop-box" style="width:520px;max-height:80vh;overflow-y:auto;">
    <div class="pop-hd">${r.userName}(${r.userId}) 실습 피드백 <button class="pop-cl" onclick="document.getElementById('pop-feedback').remove()">✕</button></div>
    <div class="pop-bd">
      <div style="display:flex;gap:12px;margin-bottom:14px;">
        <div style="background:${bgFn(r.score)};border-radius:8px;padding:16px;text-align:center;min-width:80px;">
          <div style="font-size:32px;font-weight:700;color:${colorFn(r.score)};">${r.score}</div>
          <div style="font-size:10px;color:${colorFn(r.score)};">/ 100점</div>
          <div style="font-size:12px;font-weight:700;color:${colorFn(r.score)};margin-top:4px;">${gradeFn(r.score).split(' ')[1]}</div>
        </div>
        <div style="flex:1;">
          <div style="font-size:12px;color:#888;line-height:1.9;">
            <div>📅 ${r.date}</div>
            <div>⚖ 사건유형: ${r.caseType||'–'}</div>
            <div>🏛 법원: ${r.court||'–'}</div>
            <div>👤 원고: ${r.plaintiff||'–'}</div>
            <div>👤 피고: ${r.defendant||'–'}</div>
            <div>📁 입증서류: ${r.evidenceCount||0}건</div>
          </div>
        </div>
      </div>
      <div style="background:#f8f9fc;border:1px solid #e0e6ee;border-radius:4px;padding:14px;">
        <div style="font-size:12px;font-weight:700;color:#003366;margin-bottom:8px;">🤖 AI 피드백</div>
        <div style="font-size:12px;color:#333;line-height:1.9;white-space:pre-wrap;">${(r.feedback||'피드백 없음').replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>')}</div>
      </div>
    </div>
    <div class="pop-ft"><button class="btn btn-navy" onclick="document.getElementById('pop-feedback').remove()">닫기</button></div>
  </div>`;
  pop.addEventListener('click',e=>{if(e.target===pop)pop.remove();});
  document.body.appendChild(pop);
}

function exportPracticeCSV(){
  const records=getAllRecords();
  if(!records.length){showToast('내보낼 기록이 없습니다.','warn');return;}
  const header='학생명,아이디,점수,등급,사건유형,법원,입증서류,실습일시\n';
  const rows=records.map(r=>`${r.userName||''},${r.userId||''},${r.score},${gradeFn(r.score).split(' ')[1]},${r.caseType||''},${r.court||''},${r.evidenceCount||0},${r.date||''}`).join('\n');
  const blob=new Blob(['\uFEFF'+header+rows],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='실습현황_'+new Date().toLocaleDateString('ko-KR')+'.csv';a.click();
  URL.revokeObjectURL(url);
  showToast('CSV 파일이 다운로드되었습니다.','ok');
}

// ═══ 팝업 ═══
function closePop(id){document.getElementById(id).classList.remove('show');}
function togAllChk(m){document.querySelectorAll('.accchk').forEach(c=>c.checked=m.checked);}

// ═══ 토스트 ═══
function showToast(msg,type='ok'){const t=document.createElement('div');t.className='toast '+type;t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),3000);}

// ═══ 전체 렌더 ═══
function renderAll(){renderDashboard();renderAccTable();}

// ═══ 초기화 ═══
document.addEventListener('DOMContentLoaded',()=>{
  initAuth();
  document.querySelectorAll('.pop-overlay').forEach(el=>{el.addEventListener('click',e=>{if(e.target===el)el.classList.remove('show');});});
});
