/* ---------------- data ---------------- */
const HOJE = new Date(2026,5,7); // 07/06/2026 (simulação)
const MES = ['jan','fev','mar','abr','mai','jun','jul','ago','set','out','nov','dez'];
const fmt = d => d.getDate().toString().padStart(2,'0')+'/'+(d.getMonth()+1).toString().padStart(2,'0');
const fmtLong = d => d.getDate()+' '+MES[d.getMonth()]+' '+d.getFullYear();
const daysTo = d => Math.ceil((d-HOJE)/86400000);

const eventos = [
  {id:'e1',tipo:'festa',titulo:'Esquenta da Calourada',data:new Date(2026,5,8),hora:'18h',local:'Pátio Central',valor:'Gratuito',contato:'@atletica_inatel',
    desc:'Abertura oficial da temporada da Atlética. Música, food trucks e apresentação das modalidades de esportes e e-sports para os calouros de 2026.'},
  {id:'e2',tipo:'reuniao',titulo:'Reunião Geral da Atlética',data:new Date(2026,5,12),hora:'19h',local:'Auditório B12',valor:'Gratuito',contato:'@atletica_inatel',
    desc:'Reunião aberta a todos os interessados em integrar a diretoria ou os times. Pauta: calendário 2026, intercolegiais e abertura dos seletivos.'},
  {id:'e3',tipo:'festa',titulo:'Festa de Calouros 2026',data:new Date(2026,5,15),hora:'20h',local:'Espaço INATEL',valor:'R$ 30,00 (estudante)',contato:'@atletica_inatel',
    desc:'A festa que marca o início do ano letivo. Line-up de DJs, área de jogos e o tradicional encontro entre veteranos e calouros. Ingressos limitados.'},
  {id:'e4',tipo:'palestra',titulo:'Palestra: Carreira em E-sports',data:new Date(2026,5,18),hora:'20h',local:'CDG Hub',valor:'Gratuito',contato:'@atletica_inatel',
    desc:'Bate-papo com profissionais do cenário competitivo sobre carreiras em e-sports, da organização de times à produção de eventos.'},
  {id:'e5',tipo:'festa',titulo:'Inatel Beer Fest',data:new Date(2026,5,22),hora:'19h',local:'Quadra Coberta',valor:'R$ 25,00 (estudante)',contato:'@atletica_inatel',
    desc:'Festival com cervejas artesanais da região, música ao vivo e arrecadação revertida para os times da Atlética.'},
  {id:'e6',tipo:'acao',titulo:'Agasalho Solidário',data:new Date(2026,5,25),hora:'14h',local:'Hall do Bloco I',valor:'Doação',contato:'@atletica_inatel',
    desc:'Campanha de arrecadação de agasalhos para instituições de Santa Rita do Sapucaí. Traga sua doação e participe.'},
];
const seletivos = [
  {id:'s1',cat:'esporte',mod:'Vôlei Masculino',abre:new Date(2026,5,1),fecha:new Date(2026,5,10),tryout:'Tryout em 12/06 às 19h',
    reqs:['Aluno regularmente matriculado','Disponibilidade ter/qui à noite','Atestado médico válido'],
    desc:'A equipe de vôlei masculino abre vagas para a temporada de intercolegiais 2026. Treinos às terças e quintas, 19h, na quadra coberta.'},
  {id:'s2',cat:'esports',mod:'Valorant',abre:new Date(2026,5,2),fecha:new Date(2026,5,16),tryout:'Tryouts online em 18/06',
    reqs:['Aluno regularmente matriculado','Rank mínimo: Ascendente','Disponibilidade para treinos online'],
    desc:'Seletivo para a line principal de Valorant. Disputaremos as ligas universitárias do segundo semestre. Vagas para 5 titulares e 2 reservas.'},
  {id:'s3',cat:'esports',mod:'League of Legends',abre:new Date(2026,5,20),fecha:new Date(2026,5,30),tryout:'Tryouts online a definir',
    reqs:['Aluno regularmente matriculado','Elo mínimo: Platina','Disponibilidade para scrims'],
    desc:'Inscrições abrem em 20/06 para a equipe de LoL. Fique de olho: cadastre seu interesse e ative a notificação para não perder a abertura.'},
  {id:'s4',cat:'esporte',mod:'Basquete',abre:new Date(2026,5,22),fecha:new Date(2026,6,2),tryout:'Tryout a definir',
    reqs:['Aluno regularmente matriculado','Disponibilidade seg/qua à noite','Atestado médico válido'],
    desc:'Seletivo de basquete com abertura em 22/06. A equipe busca atletas para todas as posições visando os Jogos Intercolegiais.'},
  {id:'s5',cat:'esporte',mod:'Futsal Feminino',abre:null,fecha:null,proximo:new Date(2026,7,1),tryout:'Próximo seletivo em ago/2026',
    reqs:['Aluna regularmente matriculada','Disponibilidade ter/qui à noite','Atestado médico válido'],
    desc:'A equipe de futsal feminino está com o elenco completo para a temporada atual. O próximo seletivo está previsto para agosto de 2026.'},
];
function seletivoStatus(s){
  if(s.abre===null) return {key:'full',label:'Equipe completa'};
  if(daysTo(s.abre)>0) return {key:'soon',label:'Abre em '+fmt(s.abre)};
  const dl = daysTo(s.fecha);
  if(dl<0) return {key:'full',label:'Encerrado'};
  return {key:'open',label:'Inscrições abertas',daysLeft:dl};
}

/* ---------------- state ---------------- */
const state = {
  badge:3, hub:false, tab:'tudo', evFilter:'todos', selFilter:'todos', query:'',
  agenda:new Set(), reminders:new Set(), prefs:{festa:true,reuniao:false,palestra:true,acao:false,esporte:true,esports:true},
  historico:[], bottom:'home'
};
const stack = [];

/* ---------------- icons ---------------- */
const I = {
  bell:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  back:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>',
  arrow:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>',
  search:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
  cal:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  clock:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>',
  pin:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  tag:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41 13.42 20.6a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  user:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  check:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  info:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  plus:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  share:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>',
  ext:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
  arch:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V8a6 6 0 0 1 12 0v13"/><path d="M3 21h18"/><path d="M9 21v-5a3 3 0 0 1 6 0v5"/></svg>',
  home:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>',
  brief:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
  news:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9h4"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/></svg>',
  acad:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10 12 5 2 10l10 5 10-5z"/><path d="M6 12v5c0 1 3 3 6 3s6-2 6-3v-5"/></svg>',
  fin:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  glob:'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20z"/></svg>',
  menu:'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
};
const TIPO_LABEL = {festa:'Festa',reuniao:'Reunião',palestra:'Palestra',acao:'Ação Social'};

/* ---------------- render helpers ---------------- */
const vp = document.getElementById('viewport');
function bnav(active){
  const items=[['home','Início',I.home],['carreira','Carreira',I.brief],['atletica','Atlética',I.arch],['noticias','Notícias',I.news],['perfil','Perfil',I.user]];
  return '<div class="bnav">'+items.map(([k,l,ic])=>{
    const badge = (k==='atletica'&&state.badge>0&&active!=='atletica')?'<span class="nbadge">'+state.badge+'</span>':'';
    return '<button class="'+(active===k?'on':'')+'" onclick="tapNav(\''+k+'\')">'+badge+ic+'<span>'+l+'</span></button>';
  }).join('')+'</div>';
}
function eventCard(e){
  return '<div class="card" onclick="openEvent(\''+e.id+'\')">'
    +'<div class="top"><span class="tag '+e.tipo+'">'+TIPO_LABEL[e.tipo]+'</span></div>'
    +'<h3>'+e.titulo+'</h3>'
    +'<div class="meta"><b>'+fmt(e.data)+'</b> · '+e.hora+' · '+e.local+'</div>'
    +'<div class="cta"><span>Ver detalhes</span>'+I.arrow+'</div></div>';
}
function seletivoCard(s){
  const st=seletivoStatus(s);
  let pill;
  if(st.key==='open'){
    const urgent = st.daysLeft<=3;
    pill='<span class="pill '+(urgent?'urgent':'ok')+'">'+(urgent?'<span class="blink"></span>':'')+'Encerra em '+st.daysLeft+'d</span>';
  } else if(st.key==='soon'){ pill='<span class="pill soon">'+st.label+'</span>'; }
  else { pill='<span class="pill full">'+st.label+'</span>'; }
  const catLabel = s.cat==='esports'?'E-sports':'Esporte';
  return '<div class="card" onclick="openSeletivo(\''+s.id+'\')">'
    +'<div class="top"><span class="tag seletiva">Seletiva · '+catLabel+'</span>'+pill+'</div>'
    +'<h3>'+s.mod+'</h3>'
    +'<div class="meta">'+s.tryout+'</div>'
    +'<div class="cta"><span>'+(st.key==='full'?'Ver detalhes':'Ver edital')+'</span>'+I.arrow+'</div></div>';
}

/* ---- HUB feed ---- */
function feedItems(){
  const q=state.query.trim().toLowerCase();
  let evs=eventos.slice(), sels=seletivos.slice();
  if(q){
    evs=evs.filter(e=>(e.titulo+e.local+TIPO_LABEL[e.tipo]).toLowerCase().includes(q));
    sels=sels.filter(s=>(s.mod+s.cat).toLowerCase().includes(q));
  }
  let items=[];
  if(state.tab==='tudo'||state.tab==='seletivos'){
    items=items.concat(sels.map(s=>({type:'s',s,rank:rankSel(s)})));
  }
  if(state.tab==='tudo'||state.tab==='eventos'){
    items=items.concat(evs.map(e=>({type:'e',e,rank:1000+daysTo(e.data)})));
  }
  items.sort((a,b)=>a.rank-b.rank);
  return items;
}
function rankSel(s){
  const st=seletivoStatus(s);
  if(st.key==='open') return st.daysLeft;          // open: most urgent first
  if(st.key==='soon') return 500+daysTo(s.abre);    // upcoming
  return 9000;                                      // full last
}
function renderHub(){
  const items=feedItems();
  let body;
  if(items.length===0){
    body='<div class="empty">'+I.search+'Nada encontrado para a sua busca.<br>Tente outro termo.</div>';
  } else {
    body=items.map((it,i)=>{
      const html = it.type==='e'?eventCard(it.e):seletivoCard(it.s);
      return html.replace('class="card"','class="card" style="animation-delay:'+(i*45)+'ms"');
    }).join('');
  }
  const tabs=[['tudo','Tudo'],['eventos','Eventos'],['seletivos','Seletivos']];
  const hint = state.tab==='tudo'?'<div class="feedhint">'+I.info+'Ordenado por urgência · seletivos perto do fim aparecem no topo</div>':'';
  let toolbar='<div class="toolbar"><div class="search">'+I.search
    +'<input id="q" placeholder="Buscar eventos e seletivos" value="'+state.query.replace(/"/g,'&quot;')+'" oninput="onSearch(this.value)"></div>';
  if(state.tab==='eventos'){
    const f=[['todos','Todos'],['festa','Festas'],['reuniao','Reuniões'],['palestra','Palestras'],['acao','Ações']];
    toolbar+='<div class="chips">'+f.map(([k,l])=>'<button class="chip '+(state.evFilter===k?'on':'')+'" onclick="setEvFilter(\''+k+'\')">'+l+'</button>').join('')+'</div>';
  } else if(state.tab==='seletivos'){
    const f=[['todos','Todos'],['esporte','Esportes'],['esports','E-sports']];
    toolbar+='<div class="chips">'+f.map(([k,l])=>'<button class="chip '+(state.selFilter===k?'on':'')+'" onclick="setSelFilter(\''+k+'\')">'+l+'</button>').join('')+'</div>';
  }
  toolbar+='</div>';
  // apply chip filters to body when in those tabs
  if(state.tab==='eventos'&&state.evFilter!=='todos'){
    const evs=eventos.filter(e=>e.tipo===state.evFilter);
    body = evs.length?evs.map((e,i)=>eventCard(e).replace('class="card"','class="card" style="animation-delay:'+(i*45)+'ms"')).join('')
      :'<div class="empty">'+I.cal+'Nenhum evento desse tipo por enquanto.</div>';
  }
  if(state.tab==='seletivos'&&state.selFilter!=='todos'){
    const ss=seletivos.filter(s=>s.cat===state.selFilter).sort((a,b)=>rankSel(a)-rankSel(b));
    body = ss.length?ss.map((s,i)=>seletivoCard(s).replace('class="card"','class="card" style="animation-delay:'+(i*45)+'ms"')).join('')
      :'<div class="empty">'+I.arch+'Nenhum seletivo nessa categoria.</div>';
  }
  return view('hub',
    '<div class="appbar"><button class="back" onclick="goHome()">'+I.back+'</button>'
      +'<div><div class="ttl">Atlética INATEL</div></div>'
      +'<button class="icbtn" onclick="openNotif()" aria-label="Notificações">'+I.bell+'</button></div>'
    +'<div class="tabs">'+tabs.map(([k,l])=>'<button class="'+(state.tab===k?'on':'')+'" onclick="setTab(\''+k+'\')">'+l+'</button>').join('')+'</div>'
    +toolbar
    +'<div class="scroll"><div class="feed">'+hint+body+'</div></div>'
    +bnav('atletica'));
}

/* ---- event detail ---- */
function renderEvent(e){
  const inAgenda=state.agenda.has(e.id), reminded=state.reminders.has(e.id);
  return view('event',
    '<div class="appbar"><button class="back" onclick="back()">'+I.back+'</button><div class="ttl">Detalhes do evento</div></div>'
    +'<div class="scroll"><div class="detail">'
    +'<div class="hero"><span class="tag '+e.tipo+'">'+TIPO_LABEL[e.tipo]+'</span><span class="ph">imagem do evento</span></div>'
    +'<div class="dbody"><h2>'+e.titulo+'</h2>'
    +'<div class="dmeta">'
      +'<div class="row">'+I.cal+'<span class="k">Data</span><span class="v">'+fmtLong(e.data)+'</span></div>'
      +'<div class="row">'+I.clock+'<span class="k">Horário</span><span class="v">'+e.hora+'</span></div>'
      +'<div class="row">'+I.pin+'<span class="k">Local</span><span class="v">'+e.local+'</span></div>'
      +'<div class="row">'+I.tag+'<span class="k">Valor</span><span class="v">'+e.valor+'</span></div>'
      +'<div class="row">'+I.user+'<span class="k">Contato</span><span class="v">'+e.contato+'</span></div>'
    +'</div>'
    +'<div class="sec-label">Sobre o evento</div><p class="desc">'+e.desc+'</p>'
    +'</div>'
    +'<div class="actions">'
      +'<button class="btn '+(inAgenda?'on':'primary')+'" id="agBtn" onclick="addAgenda(\''+e.id+'\')">'+(inAgenda?I.check+'Adicionado à agenda':I.plus+'Adicionar à agenda')+'</button>'
      +'<button class="btn '+(reminded?'on':'ghost')+'" id="remBtn" onclick="toggleReminder(\''+e.id+'\')">'+(reminded?I.check+'Lembrete ativado (1h antes)':I.clock+'Lembrar-me (1h antes)')+'</button>'
      +'<button class="btn ghost" onclick="shareItem(\''+e.titulo+'\')">'+I.share+'Compartilhar</button>'
    +'</div></div></div>'
    +bnav('atletica'));
}

/* ---- seletivo detail ---- */
function renderSeletivo(s){
  const st=seletivoStatus(s);
  const acessou = state.historico.some(h=>h.id===s.id);
  let windowBlock,actions;
  if(st.key==='open'){
    windowBlock='<div class="window"><div class="lab">Período de inscrição</div>'
      +'<div class="dates">'+fmt(s.abre)+'<span style="opacity:.7">&rarr;</span>'+fmt(s.fecha)+'</div>'
      +'<div class="sub">'+s.tryout+' · encerra em '+st.daysLeft+' dia'+(st.daysLeft>1?'s':'')+'</div></div>';
    actions = acessou
      ? '<div class="btn on">'+I.check+'Formulário acessado em '+state.historico.find(h=>h.id===s.id).quando+'</div>'
        +'<button class="btn ghost" onclick="askRedirect(\''+s.id+'\')">'+I.ext+'Acessar formulário novamente</button>'
        +'<button class="btn soft" onclick="shareItem(\''+s.mod+'\')">'+I.share+'Compartilhar</button>'
      : '<button class="btn primary" onclick="askRedirect(\''+s.id+'\')">'+I.ext+'Acessar formulário</button>'
        +'<button class="btn soft" onclick="shareItem(\''+s.mod+'\')">'+I.share+'Compartilhar</button>';
  } else if(st.key==='soon'){
    const reminded=state.reminders.has(s.id);
    windowBlock='<div class="window" style="background:linear-gradient(135deg,#0a4c8c,#0b5fb0)"><div class="lab">Abertura prevista</div>'
      +'<div class="dates">'+fmtLong(s.abre)+'</div><div class="sub">Inscrições ainda não abriram</div></div>';
    actions='<button class="btn '+(reminded?'on':'primary')+'" onclick="toggleReminder(\''+s.id+'\')">'
      +(reminded?I.check+'Você será avisado na abertura':I.bell.replace('width="20" height="20"','width="18" height="18"')+'Avise-me quando abrir')+'</button>'
      +'<button class="btn soft" onclick="shareItem(\''+s.mod+'\')">'+I.share+'Compartilhar</button>';
  } else {
    windowBlock='<div class="window" style="background:linear-gradient(135deg,#5b6b7a,#7a8896)"><div class="lab">Status</div>'
      +'<div class="dates">Equipe completa</div><div class="sub">'+s.tryout+'</div></div>';
    actions='<button class="btn ghost" disabled style="opacity:.6">Inscrições encerradas</button>';
  }
  const catLabel=s.cat==='esports'?'E-sports':'Esporte';
  const stPill = st.key==='open'?'<span class="pill ok">'+I.check+'Inscrições abertas</span>'
    : st.key==='soon'?'<span class="pill soon">Abre em '+fmt(s.abre)+'</span>'
    : '<span class="pill full">Equipe completa</span>';
  return view('seletivo',
    '<div class="appbar"><button class="back" onclick="back()">'+I.back+'</button><div class="ttl">Processo seletivo</div></div>'
    +'<div class="scroll"><div class="detail" style="padding-top:16px">'
    +'<div class="dbody" style="padding-top:0">'
      +'<div class="top" style="display:flex;gap:8px;align-items:center;margin-bottom:6px">'+stPill+'</div>'
      +'<h2>'+s.mod+'</h2>'
      +'<div class="meta" style="color:var(--muted);font-size:13.5px;margin-top:2px">'+catLabel+' · Atlética INATEL</div>'
      +windowBlock
      +'<div class="sec-label">Sobre o seletivo</div><p class="desc">'+s.desc+'</p>'
      +'<div class="sec-label">Requisitos</div><ul class="reqs">'+s.reqs.map(r=>'<li>'+I.check+r+'</li>').join('')+'</ul>'
      +(st.key==='open'?'<div class="note">'+I.info+'A inscrição é feita no formulário oficial da Atlética, fora do app.</div>':'')
    +'</div>'
    +'<div class="actions">'+actions+'</div>'
    +'</div></div>'
    +bnav('atletica'));
}

/* ---- notifications ---- */
function renderNotif(){
  const ev=[['festa','Festas'],['reuniao','Reuniões'],['palestra','Palestras'],['acao','Ações sociais']];
  const sp=[['esporte','Esportes tradicionais'],['esports','E-sports']];
  const sw=(k,l,d)=>'<div class="item"><div class="ico">'+I.bell+'</div><div class="txt"><b>'+l+'</b>'+(d?'<span>'+d+'</span>':'')+'</div>'
    +'<label class="switch"><input type="checkbox" '+(state.prefs[k]?'checked':'')+' onchange="togglePref(\''+k+'\',this.checked)"><span class="sl"></span></label></div>';
  return view('notif',
    '<div class="appbar"><button class="back" onclick="back()">'+I.back+'</button><div class="ttl">Notificações</div></div>'
    +'<div class="scroll"><div class="np">'
    +'<div class="lead">Escolha sobre o que você quer receber avisos por push.</div>'
    +'<div class="grp">Eventos</div>'+ev.map(([k,l])=>sw(k,l)).join('')
    +'<div class="grp">Processos seletivos</div>'+sp.map(([k,l])=>sw(k,l)).join('')
    +'<div class="foot">Você continuará recebendo lembretes dos eventos que favoritou.</div>'
    +'<div class="actions"><button class="btn primary" onclick="savePrefs()">'+I.check+'Salvar preferências</button></div>'
    +'</div></div>'
    +bnav('atletica'));
}

/* ---- profile ---- */
function renderProfile(){
  const ag=[...state.agenda].map(id=>eventos.find(e=>e.id===id)).filter(Boolean);
  const rem=[...state.reminders].map(id=>eventos.find(e=>e.id===id)||seletivos.find(s=>s.id===id)).filter(Boolean);
  const hist=state.historico;
  const prow=(ic,t,sub)=>'<div class="prow">'+ic+'<div class="pr-t"><b>'+t+'</b>'+(sub?'<span>'+sub+'</span>':'')+'</div></div>';
  const block=(h,arr,render,emptyTxt)=>'<div class="pblock"><div class="h">'+h+'</div>'
    +(arr.length?arr.map(render).join(''):'<div class="pempty">'+emptyTxt+'</div>')+'</div>';
  return view('perfil',
    '<div class="profile">'
    +'<div class="phead"><div class="avatar">J</div><div><div class="nm">João Fetin</div><div class="rl">Eng. de Software · GES 2026</div></div></div>'
    +'<div class="scroll" style="background:var(--bg)">'
    +block(I.ext+'Inscrições acessadas', hist, h=>prow(I.arch,h.mod,'Formulário acessado em '+h.quando), 'Você ainda não acessou nenhum formulário de seletivo.')
    +block(I.clock+'Meus lembretes', rem, r=>prow(I.bell,r.titulo||r.mod, r.data?'Lembrete 1h antes · '+fmt(r.data):'Aviso na abertura'), 'Nenhum lembrete ativo.')
    +block(I.cal+'Na minha agenda', ag, e=>prow(I.cal,e.titulo,fmt(e.data)+' · '+e.hora+' · '+e.local), 'Nenhum evento adicionado à agenda.')
    +'<div class="pblock"><div class="h">Preferências</div>'
      +'<div class="prow" onclick="openNotif()" style="cursor:pointer">'+I.bell+'<div class="pr-t"><b>Notificações da Atlética</b><span>Gerenciar avisos de eventos e seletivos</span></div>'+I.arrow+'</div></div>'
    +'<div style="height:90px"></div></div>'
    +bnav('perfil'));
}

/* ---- home (App Inatel) ---- */
function renderHome(){
  return view('home',
    '<div class="scroll" style="background:var(--bg)">'
    +'<div class="home-hd">'
      +'<div class="logo"><span class="lk">App Inatel</span><span class="menu">'+I.menu+'</span></div>'
      +'<div class="hi">Olá, João!</div><div class="q">O que você precisa hoje?</div>'
    +'</div>'
    +'<div class="grid">'
      +tile(I.acad,'Acadêmico')
      +tile(I.fin,'Financeiro')
      +tile(I.brief,'Carreira')
      +tile(I.news,'Notícias')
      +tile(I.arch,'Atlética','atletica')
      +tile(I.glob,'Intercâmbio')
    +'</div></div>'
    +bnav('home'));
}
function tile(ic,name,act){
  const onclick = act==='atletica'?'openHub()':'comingSoon()';
  const badge = act==='atletica'&&state.badge>0?'<span class="nb">'+state.badge+'</span>':'';
  return '<div class="tile" onclick="'+onclick+'">'+badge+'<div class="ti">'+ic+'</div><div class="tn">'+name+'</div></div>';
}

/* ---------------- view system ---------------- */
function view(id,inner){ return '<div class="view" data-view="'+id+'">'+inner+'</div>'; }
function mount(html,dir){
  const cur=vp.querySelector('.view');
  vp.insertAdjacentHTML('beforeend',html);
  const next=vp.lastElementChild;
  if(dir==='forward') next.classList.add('hide-right');
  else if(dir==='back') next.classList.add('hide-left');
  next.getBoundingClientRect();
  requestAnimationFrame(()=>{
    next.classList.remove('hide-right','hide-left');
    if(cur){ cur.classList.add(dir==='back'?'hide-right':'hide-left');
      setTimeout(()=>cur.remove(),360); }
  });
  const sc=next.querySelector('.scroll'); if(sc) sc.scrollTop=0;
}
function nav(renderFn,dir){ mount(renderFn(),dir||'forward'); }
function push(name){ stack.push(name); }
function back(){
  stack.pop();
  const prev=stack[stack.length-1]||'hub';
  routeRender(prev,'back');
}
function routeRender(name,dir){
  const map={hub:renderHub,notif:renderNotif,perfil:renderProfile,home:renderHome};
  if(map[name]) return nav(map[name],dir);
  if(name.startsWith('event:')){ const e=eventos.find(x=>x.id===name.split(':')[1]); return nav(()=>renderEvent(e),dir); }
  if(name.startsWith('seletivo:')){ const s=seletivos.find(x=>x.id===name.split(':')[1]); return nav(()=>renderSeletivo(s),dir); }
}

/* ---------------- navigation actions ---------------- */
function openHub(){ if(state.badge>0) state.badge=0; state.hub=true; stack.length=0; stack.push('hub'); nav(renderHub,'forward'); }
function goHome(){ stack.length=0; stack.push('home'); nav(renderHome,'back'); }
function tapNav(k){
  if(k==='atletica'){ openHub(); return; }
  if(k==='home'){ goHome(); return; }
  if(k==='perfil'){ if(stack[stack.length-1]!=='perfil'){ stack.push('perfil'); } nav(renderProfile,'forward'); return; }
  comingSoon();
}
function setTab(t){ state.tab=t; const v=vp.querySelector('[data-view="hub"]'); refreshHub(); }
function setEvFilter(f){ state.evFilter=f; refreshHub(); }
function setSelFilter(f){ state.selFilter=f; refreshHub(); }
function onSearch(v){ state.query=v; refreshHubKeepFocus(); }
function refreshHub(){
  const old=vp.querySelector('[data-view="hub"]'); if(!old) return;
  old.outerHTML=renderHub(); 
}
let searchTimer;
function refreshHubKeepFocus(){
  clearTimeout(searchTimer);
  searchTimer=setTimeout(()=>{
    const old=vp.querySelector('[data-view="hub"]'); if(!old) return;
    old.outerHTML=renderHub();
    const inp=document.getElementById('q');
    if(inp){ inp.focus(); inp.setSelectionRange(inp.value.length,inp.value.length); }
  },120);
}
function openEvent(id){ push('event:'+id); const e=eventos.find(x=>x.id===id); nav(()=>renderEvent(e),'forward'); }
function openSeletivo(id){ push('seletivo:'+id); const s=seletivos.find(x=>x.id===id); nav(()=>renderSeletivo(s),'forward'); }
function openNotif(){ push('notif'); nav(renderNotif,'forward'); }

/* ---------------- interactions (input/process/feedback) ---------------- */
function addAgenda(id){
  state.agenda.add(id);
  const b=document.getElementById('agBtn');
  b.className='btn on'; b.innerHTML=I.check+'Adicionado à agenda';
  toast('Evento adicionado à sua agenda');
}
function toggleReminder(id){
  if(state.reminders.has(id)){ state.reminders.delete(id); toast('Lembrete desativado'); }
  else { state.reminders.add(id); toast('Pronto! Avisaremos você 1h antes'); }
  // re-render current detail to reflect button state
  const top=stack[stack.length-1];
  if(top&&top.startsWith('event:')){ const e=eventos.find(x=>x.id===top.split(':')[1]); replaceCurrent(renderEvent(e)); }
  else if(top&&top.startsWith('seletivo:')){ const s=seletivos.find(x=>x.id===top.split(':')[1]); replaceCurrent(renderSeletivo(s)); }
}
function replaceCurrent(html){
  const cur=vp.querySelector('.view:last-child');
  const sc=cur&&cur.querySelector('.scroll'); const pos=sc?sc.scrollTop:0;
  cur.outerHTML=html;
  const ns=vp.querySelector('.view:last-child .scroll'); if(ns) ns.scrollTop=pos;
}
function shareItem(t){ toast('Link de "'+t+'" copiado para compartilhar'); }
function savePrefs(){
  const on=Object.entries(state.prefs).filter(([k,v])=>v).length;
  toast('Preferências salvas · '+on+' categoria'+(on!==1?'s':'')+' ativa'+(on!==1?'s':''));
}
function togglePref(k,v){ state.prefs[k]=v; }
function comingSoon(){ toast('Disponível na versão completa do App Inatel'); }

/* modal redirect flow */
let pendingSel=null;
function askRedirect(id){ pendingSel=id; document.getElementById('overlay').classList.add('show'); }
function closeModal(){ document.getElementById('overlay').classList.remove('show'); pendingSel=null; }
function confirmRedirect(){
  const s=seletivos.find(x=>x.id===pendingSel);
  document.getElementById('overlay').classList.remove('show');
  toast('Abrindo formulário oficial da Atlética…');
  const quando=fmt(HOJE)+' às 09:41';
  if(s&&!state.historico.some(h=>h.id===s.id)) state.historico.unshift({id:s.id,mod:s.mod,quando});
  const target='seletivo:'+(s?s.id:'');
  setTimeout(()=>{
    if(s && stack[stack.length-1]===target) replaceCurrent(renderSeletivo(s));
    toast('Inscrição registrada no seu histórico');
  },1100);
  pendingSel=null;
}

/* toast */
let toastTimer;
function toast(msg){
  const t=document.getElementById('toast');
  document.getElementById('toastmsg').textContent=msg;
  t.classList.add('show'); clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>t.classList.remove('show'),2400);
}

/* boot */
stack.push('home');
nav(renderHome,'forward');