/* Keelo — demo build. Designed by Olayemi. Simulated prices; no real wallet or money. */
(function(){
"use strict";
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const ICONS=window.IP_ICONS||{};
const ic=(n,cls='')=>{const d=ICONS[n];return d?`<svg class="ic ${cls}" viewBox="${d[0]}" aria-hidden="true">${d[1]}</svg>`:''};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/* ---------- vector marks ---------- */
const FLOWER='M30.9178 30.1205C54.1034 -10.0402 4.57049 -10.0402 27.756 30.1205C4.57049 -10.0402 -20.1972 32.8591 26.1764 32.8591C-20.1947 32.8591 4.57049 75.7559 27.756 35.5977C4.57049 75.7584 54.1034 75.7584 30.9178 35.5977C54.1034 75.7584 78.871 32.8591 32.4975 32.8591C78.8686 32.8591 54.1034 -10.0377 30.9178 30.1205Z';
const STAR='M34.6417 17.3197C20.7427 19.2109 19.2109 20.7427 17.322 34.6393C15.4308 20.7427 13.899 19.2109 0 17.3197C13.899 15.4308 15.4308 13.899 17.3197 0C19.2109 13.899 20.7427 15.4308 34.6393 17.3197Z';
const STAR2='M18.997 9.49788C11.375 10.535 10.535 11.375 9.49917 18.9958C8.46203 11.375 7.62201 10.535 0 9.49788C7.62201 8.46203 8.46203 7.62201 9.49788 0C10.535 7.62201 11.375 8.46203 18.9958 9.49788Z';
let gid=0;
const flower=(cls='')=>{const id='fg'+(++gid);return `<svg class="${cls}" viewBox="0 0 59 66" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e7d6fe"/><stop offset="1" stop-color="#8a8098"/></linearGradient></defs><path fill="url(#${id})" d="${FLOWER}"/></svg>`};
const star=(cls='',fill='#fff')=>`<svg class="${cls}" viewBox="0 0 35 35" aria-hidden="true"><path fill="${fill}" d="${STAR}"/></svg>`;
const star2=(cls='')=>{const id='sg'+(++gid);return `<svg class="${cls}" viewBox="0 0 19 19" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0ff99"/><stop offset="1" stop-color="#90995b"/></linearGradient></defs><path fill="url(#${id})" d="${STAR2}"/></svg>`};
const markSvg=d=>`<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const MARKS={
  BTC:()=>ic('btc')||ic('bitcoin'),
  ETH:()=>ic('ethereum'),
  LTC:()=>ic('ltc'),
  XRP:()=>ic('xrp'),
  EOS:()=>markSvg('<path d="M12 3l6 6.5-2.6 11H8.6L6 9.5z"/><path d="M6 9.5h12M12 3 8.6 20.5M12 3l3.4 17.5"/>')
};
const mark=c=>MARKS[c]?MARKS[c]():'';

/* ---------- coins & simulated prices ---------- */
const COINS={
  BTC:{name:'Bitcoin', base:26927.00, dp:6, vol:1},
  ETH:{name:'Ethereum',base:1928.33, dp:5, vol:1.15},
  LTC:{name:'Litecoin',base:64.18,   dp:4, vol:1.3},
  XRP:{name:'Ripple',  base:0.5212,  dp:2, vol:1.4},
  EOS:{name:'EOS',     base:0.5794,  dp:2, vol:1.5}
};
const ORDER=['BTC','ETH','LTC','XRP','EOS'];
const RANGES={
  '1D':{n:96, stepMs:15*60e3, vol:.0022},
  '1W':{n:168,stepMs:60*60e3, vol:.0042},
  '1M':{n:120,stepMs:6*60*60e3,vol:.011},
  '1Y':{n:183,stepMs:2*864e5, vol:.03}
};
function rng(seed){let s=seed>>>0;return()=>{s^=s<<13;s^=s>>>17;s^=s<<5;return((s>>>0)/4294967296)}}
function hashStr(s){let h=2166136261;for(const c of s){h^=c.charCodeAt(0);h=Math.imul(h,16777619)}return h>>>0}
const PRICE={}, HIST={};
const now0=Date.now();
ORDER.forEach(c=>{PRICE[c]=COINS[c].base; HIST[c]={};
  Object.entries(RANGES).forEach(([r,cfg])=>{
    const R=rng(hashStr(c+r+'keelo')); const w=[0]; let drift=(R()-.5)*cfg.vol*.35;
    for(let i=1;i<cfg.n;i++){ if(i%Math.ceil(cfg.n/5)===0) drift=(R()-.5)*cfg.vol*.35; w.push(w[i-1]+drift+(R()-.5)*2*cfg.vol*COINS[c].vol); }
    const last=w[w.length-1];
    HIST[c][r]=w.map((v,i)=>({t:now0-(cfg.n-1-i)*cfg.stepMs, p:COINS[c].base*Math.exp(v-last)}));
  });
});
const open24=c=>HIST[c]['1D'][0].p;
const chg24=c=>(PRICE[c]-open24(c))/open24(c);

/* ---------- formatting (thousands separators everywhere) ---------- */
const nf=(v,min,max)=>Number(v).toLocaleString('en-US',{minimumFractionDigits:min,maximumFractionDigits:max});
const usd=v=>(v<0?'-':'')+'$'+nf(Math.abs(v),2,2);
const usdP=v=>v>=1?usd(v):'$'+nf(v,4,4);
const amt=(v,c)=>{const dp=COINS[c].dp; const s=nf(v,0,dp); return s+' '+c};
const pct=v=>(v>=0?'+':'')+nf(v*100,2,2)+'%';

/* ---------- state (localStorage) ---------- */
const KEY='keelo.demo.v1';
function seedState(){
  const d=864e5, t=Date.now(); const at=(days,h,m)=>{const x=new Date(t-days*d);x.setHours(h,m,0,0);return x.getTime()};
  return {signedIn:false,name:'Jack',email:'',cash:2500,hide:false,
    hold:{BTC:2.05,ETH:50,LTC:72,XRP:8900,EOS:0},
    txs:[
      {id:'TX-1042',type:'buy',coin:'LTC',qty:72,usd:72*62.9,price:62.9,ts:at(2,9,44)},
      {id:'TX-1031',type:'receive',coin:'XRP',qty:8900,usd:8900*.509,price:.509,ts:at(5,18,12),from:'rDEMokeeLo…'},
      {id:'TX-1017',type:'buy',coin:'ETH',qty:50,usd:50*1880.12,price:1880.12,ts:at(9,11,5)},
      {id:'TX-1004',type:'buy',coin:'BTC',qty:2.05,usd:2.05*25890.4,price:25890.4,ts:at(14,20,31)},
      {id:'TX-1001',type:'deposit',coin:'USD',qty:2500,usd:2500,price:1,ts:at(15,8,17)}
    ]};
}
let S; try{S=JSON.parse(localStorage.getItem(KEY))}catch(e){}
if(!S||!S.hold) S=seedState();
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}};
const holdUSD=c=>(S.hold[c]||0)*PRICE[c];
const total=()=>S.cash+ORDER.reduce((a,c)=>a+holdUSD(c),0);
const dayChange=()=>ORDER.reduce((a,c)=>a+(S.hold[c]||0)*(PRICE[c]-open24(c)),0);
const initials=n=>(n||'J').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
const firstName=n=>(n||'Jack').trim().split(/\s+/)[0];
const money=v=>S.hide?'$••••••':usd(v);

/* ---------- tiny helpers ---------- */
function sparkPath(series,w,h,pad=2){
  const ps=series.map(x=>x.p); const mn=Math.min(...ps), mx=Math.max(...ps), sp=(mx-mn)||1;
  return series.map((x,i)=>`${i?'L':'M'}${(i/(series.length-1)*w).toFixed(1)} ${(pad+(1-(x.p-mn)/sp)*(h-pad*2)).toFixed(1)}`).join('');
}
function down(series,n){const out=[];const step=(series.length-1)/(n-1);for(let i=0;i<n;i++)out.push(series[Math.round(i*step)]);return out}
function sparkSvg(c,w=64,h=31){const s=down(HIST[c]['1D'],28);const up=chg24(c)>=0;return `<svg class="spark ${up?'up':'down'}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${sparkPath(s,w,h)}"/></svg>`}
function tween(el,to,fmt,ms=900){
  if(!el)return; const from=parseFloat(el.dataset.v||'0'); el.dataset.v=to;
  if(S.hide){el.textContent=fmt(to);return}
  const t0=performance.now(); const e=x=>1-Math.pow(1-x,3);
  (function f(t){const k=Math.min(1,(t-t0)/ms); el.textContent=fmt(from+(to-from)*e(k)); if(k<1) requestAnimationFrame(f)})(t0);
}
let toastT; function toast(msg,icon='check-solid'){const t=$('#toast');t.innerHTML=ic(icon)+esc(msg);t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),2200)}
function rise(html,i){return html.replace('data-rise','data-rise style="--i:'+i+'"')}

/* ---------- sheet ---------- */
function openSheet(html){const w=$('#sheet');$('.sheet',w).innerHTML=html;w.hidden=false;w.classList.remove('closing')}
function closeSheet(){const w=$('#sheet');if(w.hidden)return;w.classList.add('closing');setTimeout(()=>{w.hidden=true;w.classList.remove('closing')},280)}
document.addEventListener('click',e=>{if(e.target.closest('[data-close]'))closeSheet()});

/* ---------- router ---------- */
const TABS=['home','trade','portfolio','activity','profile'];
let cur=null, curName='', flow={side:'buy',coin:'BTC',usd:0,to:'',range:'1W'};
const views={};
function parse(){const h=location.hash.replace(/^#\/?/,'')||'';const [name,arg]=h.split('/');return {name:name||'',arg}}
function go(h){if(location.hash==='#/'+h) render(); else location.hash='#/'+h}
const depth={welcome:0,signin:1,home:2,trade:2,portfolio:2,activity:2,profile:2,amount:3,send:3,receive:3,review:4,success:5};
function render(){
  let {name,arg}=parse();
  if(!S.signedIn && !['welcome','signin'].includes(name)) name='welcome';
  if(S.signedIn && (name==='welcome'||name==='signin'||!name)) name='home';
  if(!views[name]) name=S.signedIn?'home':'welcome';
  const prev=curName; curName=name;
  const el=document.createElement('section'); el.className='screen';
  const v=views[name](arg); el.innerHTML=v.html; if(v.cls) el.classList.add(...v.cls.split(' '));
  if(TABS.includes(name)) el.classList.add('has-nav');
  const app=$('#app'); if(v.dark) app.setAttribute('data-dark',''); else app.removeAttribute('data-dark');
  let dir='enter';
  if(prev){ const a=depth[prev]??2, b=depth[name]??2;
    if(TABS.includes(prev)&&TABS.includes(name)) dir=TABS.indexOf(name)>=TABS.indexOf(prev)?'':'back';
    else dir=b>=a?'':'back';
    if(name==='success') dir='up';
  } else dir='fade';
  el.classList.add('enter'); if(dir) el.classList.add(dir);
  const stage=$('#stage');
  if(cur){const old=cur; old.classList.add('leave'); if(dir) old.classList.add(dir); setTimeout(()=>old.remove(),470)}
  if(cur&&cur._key) document.removeEventListener('keydown',cur._key);
  stage.appendChild(el); cur=el; el._tick=v.tick||null;
  setTimeout(()=>el.classList.remove('enter','back','up','fade'),480);
  // nav
  const nav=$('#nav'); const tab=v.tab||(TABS.includes(name)?name:null);
  nav.classList.toggle('hide',!TABS.includes(name));
  if(tab) moveInd(tab);
  closeSheet();
  v.mount&&v.mount(el,arg);
}
function moveInd(tab){const a=$(`#nav a[data-tab="${tab}"]`);if(!a)return;const ind=$('#navInd');ind.style.transform=`translateX(${a.offsetLeft}px)`;$$('#nav a').forEach(x=>x.toggleAttribute('aria-current',x===a))}
window.addEventListener('hashchange',render);
window.addEventListener('resize',()=>{const t=TABS.includes(curName)?curName:null;if(t)moveInd(t)});

/* ---------- WELCOME (Figma: iPhone 16 Pro - 4; new words) ---------- */
views.welcome=()=>{
  const card=(c,cls,label)=>`<div class="w-card ${cls}"><div class="ct">${mark(c)}</div><svg class="sp" viewBox="0 0 92 48"><path d="${sparkPath(down(HIST[c]['1W'],22),92,48,3)}"/></svg><div class="pr"><b>${label}</b><span data-wp="${c}">${nf(PRICE[c],2,2)}</span></div></div>`;
  const lines=['Your coins,','kept close.','Watch, buy','and send.'];
  return {dark:true,cls:'welcome',html:`<div class="w-canvas">
    <div class="w-orb1"></div><div class="w-orb2"></div>
    <i class="w-dot" style="left:214px;top:89px"></i><i class="w-dot" style="left:177px;top:359px"></i><i class="w-dot" style="left:325px;top:447px"></i>
    ${card('ETH','w-c1','ETH/USD')}${card('BTC','w-c2','BTC/USD')}${card('LTC','w-c3','LTC/USD')}
    ${flower('w-flower')}
    <img class="w-brand" src="assets/brand/keelo_logo_color_on_dark.svg" alt="Keelo" width="83" height="24">
    <h1 class="w-head" aria-label="${lines.join(' ')}">${lines.map((l,i)=>`<span><i style="--i:${i}">${l}</i></span>`).join('')}</h1>
    <div class="w-cta"><button class="btn" data-go="signin" data-rise style="--i:7">Get Started</button></div>
    <p class="w-tag">Demo build · Designed by Olayemi</p>
  </div>`,mount(el){$('[data-go]',el).onclick=()=>go('signin')}};
};

/* ---------- SIGN IN (built from the design's fields & buttons) ---------- */
views.signin=()=>({html:`<div class="pad">
  <button class="back" data-back aria-label="Back">${ic('angle-left-solid')}</button>
  <div class="si-mark" data-rise>${flower()}</div>
  <h1 class="si-h" data-rise style="--i:1">Welcome to Keelo</h1>
  <p class="si-p" data-rise style="--i:2">Sign in to your demo wallet. Any name, email and password will do.</p>
  <form class="si-form" novalidate>
    <div class="field" data-rise style="--i:3"><label for="f-name">Name</label><div class="val"><input id="f-name" autocomplete="name" placeholder="Jack" value="${esc(S.name==='Jack'?'':S.name)}"></div></div>
    <div class="field" data-rise style="--i:4"><label for="f-email">Email</label><div class="val"><input id="f-email" type="email" autocomplete="email" placeholder="you@example.com" value="${esc(S.email)}"></div></div>
    <div class="field" data-rise style="--i:5"><label for="f-pw">Password</label><div class="val"><input id="f-pw" type="password" autocomplete="current-password" placeholder="••••••••"><button type="button" class="eye" aria-label="Show password">${ic('eye')}</button></div></div>
    <div style="margin-top:30px;--i:6" data-rise><button class="btn" type="submit">Sign in</button></div>
  </form>
  <div class="or" data-rise style="--i:7">or</div>
  <div class="alt" data-rise style="--i:8"><button class="pillbtn line" data-quick>${ic('apple')}Apple</button><button class="pillbtn line" data-quick>${ic('google')}Google</button></div>
  <p class="si-note">Demo build · no real account, wallet or money</p>
</div>`,mount(el){
  $('[data-back]',el).onclick=()=>go('welcome');
  $('.eye',el).onclick=e=>{const i=$('#f-pw',el);const show=i.type==='password';i.type=show?'text':'password';e.currentTarget.innerHTML=ic(show?'eye-slash':'eye')};
  const done=()=>{const n=$('#f-name',el).value.trim();S.name=n||'Jack';S.email=$('#f-email',el).value.trim()||'jack@example.com';S.signedIn=true;save();go('home');setTimeout(()=>toast('Signed in to your demo wallet'),500)};
  $('form',el).onsubmit=e=>{e.preventDefault();done()};
  $$('[data-quick]',el).forEach(b=>b.onclick=done);
}});

/* ---------- HOME (Figma: iPhone 16 Pro - 5) ---------- */
function holdRow(c,i){
  return `<a class="row" href="#/trade/${c}" data-rise style="--i:${i}"><span class="tile">${mark(c)}</span><span><div class="nm">${COINS[c].name}</div><div class="tk">${c}</div></span>${sparkSvg(c)}<span class="rt"><div class="v" data-hv="${c}">${money(holdUSD(c))}</div><div class="a">${amt(S.hold[c]||0,c)}</div></span></a>`;
}
views.home=()=>{
  const held=ORDER.filter(c=>(S.hold[c]||0)>0);
  return {html:`
  <div class="h-top" data-rise><span class="h-hello">Hello ${esc(firstName(S.name))} 👋</span><button class="h-bell" data-bell aria-label="Notifications">${ic('bell')}<b></b></button><a class="avatar" href="#/profile" aria-label="Profile">${esc(initials(S.name))}</a></div>
  <div class="bal" data-rise style="--i:1"><div class="bal-back"></div><div class="bal-card">
    <div class="bal-l">Your Balance</div><div class="bal-v" id="balV" data-v="0">${money(0)}</div>
    <span class="bal-demo">Demo · simulated</span>
    <div class="bal-pill" id="balPill"></div>
    ${star('bal-sp1')}${star2('bal-sp2')}
  </div></div>
  <div class="wids">
    <a class="wid w1" href="#/receive" data-rise style="--i:2">${ic('download-solid')}<span>Receive</span></a>
    <a class="wid w2" href="#/trade" data-rise style="--i:3">${ic('exchange-alt-solid')}<span>Trade</span></a>
    <a class="wid w3" href="#/send" data-rise style="--i:4">${ic('paper-plane-solid')}<span>Send</span></a>
  </div>
  <div class="sec-h" data-rise style="--i:5"><h2>Holdings</h2><a href="#/portfolio">See All</a></div>
  <div class="list">${held.length?held.map((c,i)=>holdRow(c,i+6)).join(''):`<div class="empty">${ic('wallet-solid')}No coins yet. Tap Trade to buy your first.</div>`}
    <div style="padding:16px 0 0"><span class="demo-chip">Demo · simulated prices, updating live</span></div></div>`,
  mount(el){
    tween($('#balV',el),total(),money,1100); pill(el);
    $('[data-bell]',el).onclick=notifSheet;
  },tick(el){tween($('#balV',el),total(),money,600);pill(el);
    ORDER.forEach(c=>{const v=$(`[data-hv="${c}"]`,el);if(v)v.textContent=money(holdUSD(c))});}};
};
function pill(el){const p=$('#balPill',el);if(!p)return;const d=dayChange();const base=total()-d;const up=d>=0;p.innerHTML=`${ic(up?'caret-up-solid':'caret-down-solid')}${S.hide?'••••':usd(Math.abs(d))} · ${nf(Math.abs(d/base*100),2,2)}% today`}
function notifSheet(){
  const items=S.txs.slice(0,5);
  openSheet(`<h3>Notifications</h3><div class="list" style="padding:0;margin-top:8px">${items.length?items.map(t=>txRow(t,0,true)).join(''):'<div class="empty">You\'re all caught up.</div>'}</div><p class="si-note">Demo build · these come from your own activity</p>`);
  $$('.sheet .row').forEach(r=>r.onclick=e=>{e.preventDefault();const t=S.txs.find(x=>x.id===r.dataset.tx);closeSheet();setTimeout(()=>txSheet(t),320)});
}

/* ---------- TRADE / COIN DETAIL (Figma: iPhone 16 Pro - 6) ---------- */
function tabsHtml(sel,attr,list=ORDER){return `<div class="tabs" role="tablist">${list.map(c=>`<button role="tab" data-${attr}="${c}" class="${c===sel?'on':''}" aria-selected="${c===sel}">${c}</button>`).join('')}<i class="bar"></i></div>`}
function placeBar(wrap,anim=true){const on=$('.on',wrap),bar=$('.bar',wrap);if(!on||!bar)return;if(!anim)bar.style.transition='none';bar.style.left=on.offsetLeft+'px';bar.style.width=on.offsetWidth+'px';if(!anim)requestAnimationFrame(()=>bar.style.transition='')}
views.trade=arg=>{
  if(flow.mode==='send'){flow.mode=null;flow.usd=0}
  if(arg&&COINS[arg]) flow.coin=arg;
  const c=flow.coin;
  return {tab:'trade',html:`<div class="pad">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-top:22px" data-rise><h1 class="title">Trading</h1><span class="demo-chip">Demo · simulated</span></div>
    <div class="t-tabs" data-rise style="--i:1">${tabsHtml(c,'coin')}</div>
    <div class="t-coin" data-rise style="--i:2"><span class="tile">${mark(c)}</span><span><div class="nm">${COINS[c].name}</div><div class="tk">${c}</div></span><span class="rt"><div class="v" id="tPrice">${usdP(PRICE[c])}</div><div class="a" id="tChg"></div></span></div>
    <div class="t-meta" data-rise style="--i:3"><span class="a" style="font-size:11.5px;color:var(--muted)">You hold <b style="color:#000">${amt(S.hold[c]||0,c)}</b></span><div class="ranges" role="tablist">${Object.keys(RANGES).map(r=>`<button data-range="${r}" class="${r===flow.range?'on':''}">${r}</button>`).join('')}<i class="knob"></i></div></div>
    <div class="chart" id="chart" data-rise style="--i:4"><svg id="chartSvg"></svg><div class="tip" id="tip"></div></div>
    <div class="t-act" data-rise style="--i:5"><button class="pillbtn ${flow.side==='buy'?'fill':'line'}" data-side="buy">Buy</button><button class="pillbtn ${flow.side==='sell'?'fill':'line'}" data-side="sell">Sell</button></div>
    <div class="t-form" data-rise style="--i:6">
      <div class="field"><label>At Price | USD</label><div class="val"><span id="tAt">${nf(PRICE[c],2,PRICE[c]<1?4:2)}</span><span class="suffix">Live · simulated</span></div></div>
      <div class="field" style="cursor:pointer" data-amount><label>Amount</label><div class="val"><span id="tAmt">${flow.usd?nf(flow.usd,0,2)+' USD':'<span style="color:#9a9aab">0 USD</span>'}</span><span class="chips">${[25,50,100].map(p=>`<button data-pct="${p}">${p}%</button>`).join('')}</span></div></div>
      <p class="t-hint" id="tHint"></p>
      <div class="t-go"><button class="btn" id="tGo"></button></div>
    </div></div>`,
  mount(el){
    const tw=$('.t-tabs',el); requestAnimationFrame(()=>placeBar(tw,false));
    $$('[data-coin]',el).forEach(b=>b.onclick=()=>{if(b.dataset.coin===flow.coin)return;flow.coin=b.dataset.coin;flow.usd=0;history.replaceState(null,'','#/trade/'+flow.coin);render()});
    const rg=$('.ranges',el); const knob=()=>{const on=$('.on',rg);$('.knob',rg).style.transform=`translateX(${on.offsetLeft-3}px)`};requestAnimationFrame(knob);
    $$('[data-range]',el).forEach(b=>b.onclick=()=>{flow.range=b.dataset.range;$$('[data-range]',el).forEach(x=>x.classList.toggle('on',x===b));knob();drawChart(el,true)});
    $$('[data-side]',el).forEach(b=>b.onclick=()=>{const was=flow.side;flow.side=b.dataset.side;$$('[data-side]',el).forEach(x=>{x.classList.toggle('fill',x.dataset.side===flow.side);x.classList.toggle('line',x.dataset.side!==flow.side)});if(was!==flow.side){flow.usd=0;}formUpd(el);if(was===flow.side)go('amount')});
    $$('[data-pct]',el).forEach(b=>b.onclick=e=>{e.stopPropagation();const max=maxUSD();flow.usd=Math.floor(max*(+b.dataset.pct)/100*100)/100;$$('[data-pct]',el).forEach(x=>x.classList.toggle('on',x===b));formUpd(el)});
    $('[data-amount]',el).onclick=()=>go('amount');
    $('#tGo',el).onclick=()=>{ if(!flow.usd) return go('amount'); if(flow.usd>maxUSD()+1e-9){shakeHint(el);return} go('review')};
    drawChart(el,true); formUpd(el); chg(el);
  },
  tick(el){const c=flow.coin;const p=$('#tPrice',el);const old=parseFloat(p.dataset.v||PRICE[c]);p.dataset.v=PRICE[c];p.textContent=usdP(PRICE[c]);p.classList.remove('flash-up','flash-down');void p.offsetWidth;p.classList.add(PRICE[c]>=old?'flash-up':'flash-down');$('#tAt',el).textContent=nf(PRICE[c],2,PRICE[c]<1?4:2);chg(el);if(!$('#chart',el).classList.contains('scrub'))drawChart(el,false);formUpd(el)}};
};
function chg(el){const c=flow.coin;const v=chg24(c);const e=$('#tChg',el);if(e){e.innerHTML=`<span class="${v>=0?'up':'down'}">${pct(v)}</span> · 24h`}}
const maxUSD=()=>flow.side==='buy'?S.cash:holdUSD(flow.coin);
function formUpd(el){
  const c=flow.coin; const a=$('#tAmt',el); if(!a)return;
  a.innerHTML=flow.usd?`${nf(flow.usd,0,2)} USD <span style="color:var(--muted);font-size:12px">≈ ${amt(flow.usd/PRICE[c],c)}</span>`:'<span style="color:#9a9aab">0 USD</span>';
  const h=$('#tHint',el); const max=maxUSD();
  h.textContent=flow.side==='buy'?`Cash available: ${usd(S.cash)}`:`You can sell up to ${usd(max)} (${amt(S.hold[c]||0,c)})`;
  h.style.color='';
  const g=$('#tGo',el); g.textContent=flow.usd?`Review ${flow.side==='buy'?'buy':'sale'}`:`${flow.side==='buy'?'Buy':'Sell'} ${c}`;
  g.disabled = flow.side==='sell' && !(S.hold[c]>0);
}
function shakeHint(el){const h=$('#tHint',el);h.style.color='#e8613f';h.textContent=flow.side==='buy'?`Not enough demo cash. Available: ${usd(S.cash)}`:`You only hold ${amt(S.hold[flow.coin]||0,flow.coin)}`}

/* chart: axis fitted to the price range, readable labels */
function niceStep(range,count){const raw=range/count;const mag=Math.pow(10,Math.floor(Math.log10(raw)));const n=raw/mag;return (n<1.5?1:n<3?2:n<7?5:10)*mag}
function axisLabel(v,step){
  if(v>=1000){const k=v/1000;const dec=step>=1000?0:step>=100?1:2;return nf(k,dec,dec)+'k'}
  if(v>=1){const dec=step>=1?0:step>=.1?1:2;return nf(v,dec,dec)}
  const dec=step>=.01?2:step>=.001?3:4;return nf(v,dec,dec);
}
const MON=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], WD=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
function xLabels(series,range){
  const t0=series[0].t,t1=series[series.length-1].t; const out=[];
  if(range==='1W'){ const d=new Date(t0);d.setHours(0,0,0,0);d.setDate(d.getDate()+1); for(;d.getTime()<=t1;d.setDate(d.getDate()+1)) out.push({t:d.getTime(),a:WD[d.getDay()],b:String(d.getDate())}); }
  else if(range==='1D'){ const d=new Date(t0);d.setMinutes(0,0,0);d.setHours(Math.ceil((d.getHours()+1)/4)*4); for(;d.getTime()<=t1;d.setHours(d.getHours()+4)) out.push({t:d.getTime(),a:'',b:String(d.getHours()).padStart(2,'0')+':00'}); }
  else if(range==='1M'){ const d=new Date(t0);d.setHours(0,0,0,0);d.setDate(d.getDate()+2); for(;d.getTime()<=t1;d.setDate(d.getDate()+5)) out.push({t:d.getTime(),a:MON[d.getMonth()],b:String(d.getDate())}); }
  else { const d=new Date(t0);d.setHours(0,0,0,0);d.setDate(1);d.setMonth(d.getMonth()+1); for(;d.getTime()<=t1;d.setMonth(d.getMonth()+2)) out.push({t:d.getTime(),a:MON[d.getMonth()],b:"’"+String(d.getFullYear()).slice(2)}); }
  return out;
}
function drawChart(el,animate){
  const box=$('#chart',el); const svg=$('#chartSvg',el); if(!box||!svg)return;
  const c=flow.coin, range=flow.range, series=HIST[c][range];
  const W=box.clientWidth||326, H=box.clientHeight||230, L=34, R=6, T=10, B=40;
  const ps=series.map(x=>x.p); let mn=Math.min(...ps), mx=Math.max(...ps);
  const step=niceStep((mx-mn)||mx*.01,4); let lo=Math.floor(mn/step)*step, hi=Math.ceil(mx/step)*step; if(hi-lo<step*3){hi+=step;lo-=step*0}
  const X=i=>L+(i/(series.length-1))*(W-L-R), Y=p=>T+(1-(p-lo)/(hi-lo))*(H-T-B);
  let ticks=''; for(let v=lo;v<=hi+step/2;v+=step){const y=Y(v);ticks+=`<line class="grid" x1="${L}" x2="${W-R}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}"/><text class="yl" x="0" y="${(y+3).toFixed(1)}">${axisLabel(v,step)}</text>`}
  const xl=xLabels(series,range).map(o=>{const i=(o.t-series[0].t)/(series[series.length-1].t-series[0].t)*(series.length-1);const x=X(i);if(x<L+8||x>W-R-6)return '';return `<g text-anchor="middle">${o.a?`<text class="xl1" x="${x.toFixed(1)}" y="${H-24}">${o.a}</text>`:''}<text class="xl2" x="${x.toFixed(1)}" y="${H-8}">${o.b}</text></g>`}).join('');
  const d=series.map((x,i)=>`${i?'L':'M'}${X(i).toFixed(1)} ${Y(x.p).toFixed(1)}`).join('');
  const area=d+`L${X(series.length-1).toFixed(1)} ${H-B}L${L} ${H-B}Z`;
  const lx=X(series.length-1), ly=Y(series[series.length-1].p);
  svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  svg.innerHTML=`<defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset=".18" stop-color="#8b8b8b" stop-opacity=".55"/><stop offset="1" stop-color="#434040" stop-opacity="0"/></linearGradient></defs>${ticks}${xl}<path class="ar" d="${area}" fill="url(#cg)" ${animate?'':'style="animation:none"'}/><path class="ln" d="${d}"/><circle class="live-ring" cx="${lx}" cy="${ly}" r="3.5"/><circle class="live" cx="${lx}" cy="${ly}" r="3.5"/><g id="scrub" style="display:none"><line class="cross" y1="${T}" y2="${H-B}"/><circle class="dot" r="5"/></g>`;
  const ln=$('.ln',svg); if(animate){const len=ln.getTotalLength();ln.style.strokeDasharray=len;ln.style.setProperty('--len',len);ln.classList.add('draw');}
  box._g={series,X,Y,L,W,R,H,B};
  if(!box._bound){box._bound=true;
    const mv=e=>{const g=box._g;const r=box.getBoundingClientRect();const x=(e.touches?e.touches[0].clientX:e.clientX)-r.left;let i=Math.round((x-g.L)/(g.W-g.L-g.R)*(g.series.length-1));i=Math.max(0,Math.min(g.series.length-1,i));const pt=g.series[i];const s=$('#scrub',box);s.style.display='';const px=g.X(i),py=g.Y(pt.p);$('line',s).setAttribute('x1',px);$('line',s).setAttribute('x2',px);$('circle',s).setAttribute('cx',px);$('circle',s).setAttribute('cy',py);const tip=$('#tip',box);const dt=new Date(pt.t);tip.innerHTML=`${usdP(pt.p)}<small>${flow.range==='1D'?dt.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'}):dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:flow.range==='1Y'?'numeric':undefined})}</small>`;tip.style.left=Math.max(40,Math.min(g.W-40,px))+'px';box.classList.add('scrub')};
    const end=()=>{box.classList.remove('scrub');const s=$('#scrub',box);if(s)s.style.display='none'};
    box.addEventListener('pointermove',mv);box.addEventListener('pointerdown',mv);box.addEventListener('pointerleave',end);box.addEventListener('pointerup',e=>{if(e.pointerType!=='mouse')end()});box.addEventListener('pointercancel',end);
  }
}

/* ---------- AMOUNT KEYPAD (buy / sell / send) ---------- */
views.amount=()=>{
  const send=flow.mode==='send'; const c=flow.coin;
  const max=send?holdUSD(c):maxUSD();
  const title=send?`Send ${c}`:`${flow.side==='buy'?'Buy':'Sell'} ${COINS[c].name}`;
  let buf=flow.usd?String(+flow.usd.toFixed(2)):'';
  return {html:`<div class="pad"><div style="display:flex;align-items:center;gap:8px;margin-top:14px"><button class="back" data-back aria-label="Back">${ic('angle-left-solid')}</button><h1 class="title" style="font-size:22px">${title}</h1></div>
    <div class="amt" data-rise><div class="amt-v" id="aV">$0</div><div class="amt-c" id="aC"></div>
    <div class="amt-avail">${send?'Available to send':flow.side==='buy'?'Cash available':'Available to sell'}: <b style="margin-left:4px">${usd(max)}</b></div></div>
    <div class="quick" data-rise style="--i:1">${[25,50,100].map(p=>`<button data-q="${p}">${p===100?'Max':p+'%'}</button>`).join('')}</div></div>
    <div class="keys" data-rise style="--i:2">${['1','2','3','4','5','6','7','8','9','.','0','del'].map(k=>`<button data-k="${k}" aria-label="${k==='del'?'Delete':k}">${k==='del'?ic('backspace-solid'):k}</button>`).join('')}</div>
    <div class="k-go"><button class="btn" id="aGo">Review</button></div>`,
  mount(el){
    const upd=()=>{const v=parseFloat(buf||'0');$('#aV',el).textContent='$'+(buf?(buf.includes('.')?nf(Math.floor(v),0,0)+'.'+buf.split('.')[1]:nf(v,0,0)):'0');$('#aC',el).textContent='≈ '+amt(v/PRICE[c],c)+' at '+usdP(PRICE[c]);$('#aGo',el).disabled=!(v>0)};
    $$('[data-k]',el).forEach(b=>b.onclick=()=>{const k=b.dataset.k;if(k==='del')buf=buf.slice(0,-1);else if(k==='.'){if(!buf.includes('.'))buf=(buf||'0')+'.'}else{if(buf.includes('.')&&buf.split('.')[1].length>=2)return;if(buf==='0')buf='';if(buf.replace('.','').length>=9)return;buf+=k}upd()});
    $$('[data-q]',el).forEach(b=>b.onclick=()=>{buf=String(Math.floor(max*(+b.dataset.q)/100*100)/100);upd()});
    $('[data-back]',el).onclick=()=>history.back();
    $('#aGo',el).onclick=()=>{const v=parseFloat(buf||'0');if(v>max+1e-9){const a=$('#aV',el);a.classList.remove('shake');void a.offsetWidth;a.classList.add('shake');toast(send?`You can send up to ${usd(max)}`:flow.side==='buy'?'Not enough demo cash':`You can sell up to ${usd(max)}`,'info-circle-solid');return}flow.usd=v;go('review')};
    upd();
    el._key=e=>{const m={Backspace:'del'};const k=m[e.key]||e.key;const b=$(`[data-k="${k}"]`,el);if(b){b.click();e.preventDefault()}else if(e.key==='Enter')$('#aGo',el).click()};
    document.addEventListener('keydown',el._key);
  }};
};

/* ---------- REVIEW ---------- */
views.review=()=>{
  if(!flow.usd) return views[S.signedIn?'home':'welcome']();
  const c=flow.coin, send=flow.mode==='send'; flow.qp=PRICE[c]; const q=flow.usd/flow.qp;
  const verb=send?'sending':flow.side==='buy'?'buying':'selling';
  const rows=send?[['To',esc(flow.to)],['Network fee','$0.00 · demo'],['You send',amt(q,c)],['Value',usd(flow.usd)]]
    :[['Price',usdP(flow.qp)+' per '+c],[flow.side==='buy'?'You pay':'You receive',usd(flow.usd)],['Fee','$0.00 · demo'],[flow.side==='buy'?'You get':'You sell',amt(q,c)]];
  return {html:`<div class="pad"><div style="display:flex;align-items:center;gap:8px;margin-top:14px"><button class="back" data-back aria-label="Back">${ic('angle-left-solid')}</button><h1 class="title" style="font-size:22px">Review</h1></div>
    <div class="rv-card" data-rise><div class="l">You're ${verb}</div><div class="big">${amt(q,c)}</div><div class="sub">${send?'worth '+usd(flow.usd):(flow.side==='buy'?'for ':'for ')+usd(flow.usd)}</div>${star('bal-sp1')}</div>
    <div class="rv-rows" data-rise style="--i:1">${rows.map(r=>`<div><span>${r[0]}</span><span>${r[1]}</span></div>`).join('')}</div>
    <p class="rv-note" data-rise style="--i:2">${ic('shield-alt-solid')}Price held for this review. Demo build: no real wallet, coins or money move. Prices are simulated.</p>
    <div class="slide" id="slide" data-rise style="--i:3"><div class="slide-fill"></div><div class="slide-txt">Slide to confirm</div><div class="slide-knob" role="button" tabindex="0" aria-label="Confirm">${ic('arrow-right-solid')}</div></div>
    <p class="t-hint">or press the arrow</p></div>`,
  mount(el){
    $('[data-back]',el).onclick=()=>history.back();
    const sl=$('#slide',el),k=$('.slide-knob',sl),fill=$('.slide-fill',sl); let x0=null,dx=0,max=0,done=false;
    const set=v=>{k.style.transform=`translateX(${v}px)`;fill.style.width=(58+v)+'px'};
    const finish=()=>{if(done)return;done=true;sl.classList.add('done');set(max||sl.clientWidth-58);setTimeout(commit,260)};
    k.addEventListener('pointerdown',e=>{x0=e.clientX;max=sl.clientWidth-58;k.setPointerCapture(e.pointerId)});
    k.addEventListener('pointermove',e=>{if(x0===null)return;dx=Math.max(0,Math.min(max,e.clientX-x0));set(dx)});
    k.addEventListener('pointerup',()=>{if(x0===null)return;const moved=dx;x0=null;if(moved>max*.82||moved<4)finish();else{sl.classList.add('done');set(0);setTimeout(()=>sl.classList.remove('done'),260)}dx=0});
    k.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();finish()}});
  }};
};
function commit(){
  const c=flow.coin, qp=flow.qp||PRICE[c], q=flow.usd/qp, send=flow.mode==='send';
  const id='TX-'+(1100+S.txs.length+Math.floor(Math.random()*90));
  if(send){ S.hold[c]=Math.max(0,(S.hold[c]||0)-q); S.txs.unshift({id,type:'send',coin:c,qty:q,usd:flow.usd,price:qp,ts:Date.now(),to:flow.to}); }
  else if(flow.side==='buy'){ S.cash-=flow.usd; S.hold[c]=(S.hold[c]||0)+q; S.txs.unshift({id,type:'buy',coin:c,qty:q,usd:flow.usd,price:qp,ts:Date.now()}); }
  else { S.cash+=flow.usd; S.hold[c]=Math.max(0,(S.hold[c]||0)-q); if(S.hold[c]<1e-9)S.hold[c]=0; S.txs.unshift({id,type:'sell',coin:c,qty:q,usd:flow.usd,price:qp,ts:Date.now()}); }
  S.cash=Math.round(S.cash*100)/100; save(); flow.last=S.txs[0]; flow.usd=0; flow.mode=null; history.replaceState(null,'','#/success'); render();
}

/* ---------- SUCCESS ---------- */
views.success=()=>{
  const t=flow.last; if(!t) return views.home();
  const head={buy:`Bought ${amt(t.qty,t.coin)}`,sell:`Sold ${amt(t.qty,t.coin)}`,send:`Sent ${amt(t.qty,t.coin)}`}[t.type];
  const sub={buy:'It\'s in your demo wallet now.',sell:`${usd(t.usd)} was added to your demo cash.`,send:'On its way to the demo address.'}[t.type];
  return {html:`<div class="ok"><div class="ok-badge"><div class="halo"></div><svg class="chk" viewBox="0 0 132 132"><path d="M44 68l15 15 30-33"/></svg>${star('s1','#b8c8fe')}${star2('s2')}</div>
    <h1 data-rise style="--i:6">${head}</h1><p data-rise style="--i:7">${sub}</p>
    <div class="rv-rows" data-rise style="--i:8"><div><span>Value</span><span>${usd(t.usd)}</span></div><div><span>Price</span><span>${usdP(t.price)}</span></div><div><span>Reference</span><span>${t.id}</span></div></div>
    <div class="ok-btns" data-rise style="--i:9"><button class="btn" data-h="home">Done</button><button class="btn ghost" data-h="activity">View activity</button></div></div>`,
  mount(el){$$('[data-h]',el).forEach(b=>b.onclick=()=>go(b.dataset.h))}};
};

/* ---------- RECEIVE ---------- */
views.receive=arg=>{
  const c=(arg&&COINS[arg])?arg:(flow.rcoin||'BTC'); flow.rcoin=c;
  const q=(window.IP_QR||{})[c]; const addr=(window.IP_ADDR||{})[c]||'';
  const qr=q?`<svg viewBox="0 0 ${q[0]} ${q[0]}" shape-rendering="crispEdges"><path stroke="#000" d="${q[1]}"/></svg>`:'';
  return {html:`<div class="pad"><div style="display:flex;align-items:center;gap:8px;margin-top:14px"><button class="back" data-back aria-label="Back">${ic('angle-left-solid')}</button><h1 class="title" style="font-size:22px">Receive</h1></div>
    <div class="t-tabs" data-rise>${tabsHtml(c,'rc')}</div>
    <div class="qr-wrap" data-rise style="--i:1"><div class="qr">${qr}<div class="qr-scan"></div><div class="qr-logo">${mark(c)}</div></div></div>
    <div class="addr" data-rise style="--i:2"><div class="l">Your ${COINS[c].name} demo address</div><div class="v" id="addr">${esc(addr)}</div></div>
    <div class="r-btns" data-rise style="--i:3"><button class="pillbtn fill" data-copy>${ic('copy')}Copy</button><button class="pillbtn line" data-share>${ic('share-alt-solid')}Share</button></div>
    <div class="warn" data-rise style="--i:4">${ic('info-circle-solid')}<span>This is a demo address. Don't send real crypto to it; nothing would arrive.</span></div>
    <div style="margin-top:18px;--i:5" data-rise><button class="btn ghost" data-cash>${ic('plus-solid')}Add $500 demo cash</button></div>
  </div>`,
  mount(el){
    requestAnimationFrame(()=>placeBar($('.t-tabs',el),false));
    $('[data-back]',el).onclick=()=>history.back();
    $$('[data-rc]',el).forEach(b=>b.onclick=()=>{flow.rcoin=b.dataset.rc;history.replaceState(null,'','#/receive/'+flow.rcoin);render()});
    $('[data-copy]',el).onclick=async()=>{try{await navigator.clipboard.writeText(addr)}catch(e){const r=document.createRange();r.selectNodeContents($('#addr',el));const s=getSelection();s.removeAllRanges();s.addRange(r);try{document.execCommand('copy')}catch(_){}}toast('Address copied')};
    $('[data-share]',el).onclick=async()=>{if(navigator.share){try{await navigator.share({title:`My ${c} demo address`,text:addr})}catch(e){}}else{try{await navigator.clipboard.writeText(addr)}catch(e){}toast('Address copied to share')}};
    $('[data-cash]',el).onclick=()=>{S.cash+=500;S.txs.unshift({id:'TX-'+(1100+S.txs.length+Math.floor(Math.random()*90)),type:'deposit',coin:'USD',qty:500,usd:500,price:1,ts:Date.now()});save();toast('Added $500 demo cash')};
  }};
};

/* ---------- SEND ---------- */
views.send=arg=>{
  if(flow.mode!=='send'){flow.usd=0;flow.mode='send'}
  const owned=ORDER.filter(c=>(S.hold[c]||0)>0);
  let c=(arg&&COINS[arg])?arg:(flow.scoin&&owned.includes(flow.scoin)?flow.scoin:owned[0]||'BTC'); flow.scoin=c;
  return {html:`<div class="pad"><div style="display:flex;align-items:center;gap:8px;margin-top:14px"><button class="back" data-back aria-label="Back">${ic('angle-left-solid')}</button><h1 class="title" style="font-size:22px">Send</h1></div>
    <div class="t-tabs" data-rise>${tabsHtml(c,'sc',owned.length?owned:ORDER)}</div>
    <div class="t-coin" data-rise style="--i:1"><span class="tile">${mark(c)}</span><span><div class="nm">${COINS[c].name}</div><div class="tk">${c}</div></span><span class="rt"><div class="v">${usd(holdUSD(c))}</div><div class="a">${amt(S.hold[c]||0,c)}</div></span></div>
    <div class="field" data-rise style="--i:2;margin-top:26px"><label for="s-to">To</label><div class="val"><input id="s-to" placeholder="Paste a ${c} address" value="${esc(flow.to||'')}" autocomplete="off" spellcheck="false"><button class="paste" type="button" data-paste>${ic('paste-solid')} Demo</button></div></div>
    <div class="err" id="sErr"></div>
    <div class="field" style="cursor:pointer;--i:3" data-rise data-amt><label>Amount</label><div class="val"><span id="sAmt">${flow.usd&&flow.mode==='send'?usd(flow.usd)+' ≈ '+amt(flow.usd/PRICE[c],c):'<span style="color:#9a9aab">Tap to enter</span>'}</span><span class="suffix">${ic('angle-right-solid')}</span></div></div>
    <div style="margin-top:30px;--i:4" data-rise><button class="btn" id="sGo">Continue</button></div>
    <p class="t-hint">Demo build · nothing leaves this browser</p>
  </div>`,
  mount(el){
    requestAnimationFrame(()=>placeBar($('.t-tabs',el),false));
    $('[data-back]',el).onclick=()=>{flow.mode=null;flow.usd=0;history.back()};
    $$('[data-sc]',el).forEach(b=>b.onclick=()=>{flow.scoin=b.dataset.sc;flow.usd=0;history.replaceState(null,'','#/send/'+flow.scoin);render()});
    const to=$('#s-to',el); to.oninput=()=>{flow.to=to.value.trim();$('#sErr',el).textContent=''};
    $('[data-paste]',el).onclick=()=>{const demo={BTC:'bc1qdemo4friend8x2k9m3p7r5t1w6',ETH:'0xDEMO0friend4c9A2b7E31d58A60b29F',LTC:'ltc1qdemo2friend7h5j2k8n4q9s1',XRP:'rDEMOfriend5Kx2Wq8Tz4Ny7Lp3',EOS:'friend.demo'}[c];to.value=demo;flow.to=demo;$('#sErr',el).textContent=''};
    const need=()=>{if((flow.to||'').length<6){$('#sErr',el).textContent='Enter an address (any text works in the demo)';to.focus();return false}return true};
    $('[data-amt]',el).onclick=()=>{if(!need())return;flow.mode='send';flow.coin=c;go('amount')};
    $('#sGo',el).onclick=()=>{if(!need())return;flow.mode='send';flow.coin=c;if(!(flow.usd>0))return go('amount');go('review')};
  }};
};

/* ---------- ACTIVITY ---------- */
const TXI={buy:'arrow-down-solid',sell:'arrow-up-solid',send:'paper-plane-solid',receive:'download-solid',deposit:'plus-solid'};
function txTitle(t){return {buy:`Bought ${t.coin}`,sell:`Sold ${t.coin}`,send:`Sent ${t.coin}`,receive:`Received ${t.coin}`,deposit:'Added demo cash'}[t.type]}
function txRow(t,i,small){
  const d=new Date(t.ts); const tm=d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
  const sign=t.type==='buy'||t.type==='receive'?'+':t.type==='deposit'?'+':'−';
  const main=t.coin==='USD'?usd(t.qty):`${sign}${amt(t.qty,t.coin)}`;
  return `<a class="row tx" href="#" data-tx="${t.id}" ${small?'':'data-rise'} style="--i:${i}"><span class="tile">${ic(TXI[t.type])}</span><span><div class="nm" style="font-size:14.5px">${txTitle(t)}</div><div class="tk" style="font-size:12px">${small?d.toLocaleDateString('en-US',{month:'short',day:'numeric'})+' · ':''}${tm}</div></span><span class="rt" style="margin-left:auto"><div class="v" style="font-size:14px">${main}</div><div class="a" style="font-size:10.5px">${t.coin==='USD'?'Demo cash':usd(t.usd)}</div></span></a>`;
}
function txSheet(t){if(!t)return;const d=new Date(t.ts);
  openSheet(`<h3>${txTitle(t)}</h3><div class="rv-rows">${[
    ['Status','Completed · demo'],['Date',d.toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit'})],
    ...(t.coin==='USD'?[['Amount',usd(t.qty)]]:[['Amount',amt(t.qty,t.coin)],['Value',usd(t.usd)],['Price',usdP(t.price)+' per '+t.coin]]),
    ...(t.to?[['To',esc(t.to)]]:[]),...(t.from?[['From',esc(t.from)]]:[]),['Reference',t.id]].map(r=>`<div><span>${r[0]}</span><span>${r[1]}</span></div>`).join('')}</div><button class="btn dark" data-close>Close</button>`)}
views.activity=()=>{
  const f=flow.afilter||'All'; const map={All:()=>1,Buys:t=>t.type==='buy',Sells:t=>t.type==='sell','Transfers':t=>['send','receive','deposit'].includes(t.type)};
  const list=S.txs.filter(map[f]||map.All);
  let html='',last='',i=2;
  list.forEach(t=>{const d=new Date(t.ts);const today=new Date();const y=new Date(Date.now()-864e5);
    const key=d.toDateString()===today.toDateString()?'Today':d.toDateString()===y.toDateString()?'Yesterday':d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
    if(key!==last){html+=`<div class="a-day" data-rise style="--i:${i}">${key}</div>`;last=key}
    html+=txRow(t,i++);});
  return {html:`<div class="pad"><div style="display:flex;align-items:center;justify-content:space-between;margin-top:22px" data-rise><h1 class="title">Activity</h1><span class="demo-chip">Demo</span></div>
    <div class="a-tabs" data-rise style="--i:1">${tabsHtml(f,'af',['All','Buys','Sells','Transfers'])}</div>
    <div>${html||`<div class="empty">${ic('history-solid')}Nothing here yet.</div>`}</div></div>`,
  mount(el){requestAnimationFrame(()=>placeBar($('.a-tabs',el),false));
    $$('[data-af]',el).forEach(b=>b.onclick=()=>{flow.afilter=b.dataset.af;render()});
    $$('[data-tx]',el).forEach(r=>r.onclick=e=>{e.preventDefault();txSheet(S.txs.find(x=>x.id===r.dataset.tx))});}};
};

/* ---------- PORTFOLIO / MARKETS ---------- */
const PCOL={BTC:'#000',ETH:'#a97ef1',LTC:'#b8c8fe',XRP:'#e2f26a',EOS:'#83839d',CASH:'#e7e7ee'};
views.portfolio=()=>{
  const parts=[...ORDER.filter(c=>holdUSD(c)>0).map(c=>({k:c,v:holdUSD(c)})),{k:'CASH',v:S.cash}];
  const tot=total(); const C=2*Math.PI*54; let off=0;
  const arcs=parts.map(p=>{const len=p.v/tot*C;const s=`<circle r="54" cx="71" cy="71" stroke="${PCOL[p.k]}" stroke-dasharray="0 ${C}" data-len="${len}" data-off="${-off}" stroke-dashoffset="0"/>`;off+=len;return s}).join('');
  return {html:`<div class="pad"><div style="display:flex;align-items:center;justify-content:space-between;margin-top:22px" data-rise><h1 class="title">Portfolio</h1><span class="demo-chip">Demo · simulated</span></div>
    <div class="donut-wrap" data-rise style="--i:1"><div class="donut"><svg viewBox="0 0 142 142">${arcs}</svg><div class="mid"><b id="pTot">${money(tot)}</b><span>Total value</span></div></div>
    <div class="legend">${parts.map(p=>`<div><i style="background:${PCOL[p.k]}"></i>${p.k==='CASH'?'Cash':p.k}<b>${nf(p.v/tot*100,1,1)}%</b></div>`).join('')}</div></div>
    <div class="sec-h" style="padding:26px 0 8px;--i:2" data-rise><h2>Markets</h2><span class="demo-chip">Simulated prices</span></div>
    <div>${ORDER.map((c,i)=>{const v=chg24(c);return `<a class="row" href="#/trade/${c}" data-rise style="--i:${i+3}"><span class="tile">${mark(c)}</span><span><div class="nm">${COINS[c].name}</div><div class="tk">${c}</div></span>${sparkSvg(c)}<span class="rt"><div class="v" data-mp="${c}">${usdP(PRICE[c])}</div><div class="chg ${v>=0?'up':'down'}" data-mc="${c}">${pct(v)}</div></span></a>`}).join('')}</div></div>`,
  mount(el){requestAnimationFrame(()=>requestAnimationFrame(()=>$$('.donut circle',el).forEach((c,i)=>{setTimeout(()=>{c.style.strokeDasharray=`${Math.max(0,+c.dataset.len-2)} ${C}`;c.style.strokeDashoffset=c.dataset.off},i*90)})))},
  tick(el){ORDER.forEach(c=>{const p=$(`[data-mp="${c}"]`,el);if(p)p.textContent=usdP(PRICE[c]);const m=$(`[data-mc="${c}"]`,el);if(m){const v=chg24(c);m.textContent=pct(v);m.className='chg '+(v>=0?'up':'down')}});const t=$('#pTot',el);if(t)t.textContent=money(total())}};
};

/* ---------- PROFILE & SETTINGS ---------- */
views.profile=()=>({html:`<div class="pad"><div style="margin-top:22px" data-rise><h1 class="title">Profile</h1></div>
  <div class="p-card" data-rise style="--i:1"><span class="avatar">${esc(initials(S.name))}</span><div><div class="n">${esc(S.name)}</div><div class="e">${esc(S.email||'jack@example.com')}</div></div>${star('bal-sp1')}</div>
  <div class="p-list" data-rise style="--i:2">
    <button class="p-item" data-hide><span class="pi" style="background:#f1ecfd">${ic(S.hide?'eye-slash':'eye')}</span>Hide balances<span class="tog ${S.hide?'on':''}"></span></button>
    <div class="p-item"><span class="pi" style="background:#f4fbd0">${ic('globe-solid')}</span>Currency<span class="pv">USD</span></div>
    <a class="p-item" href="#/activity"><span class="pi" style="background:#eef2ff">${ic('history-solid')}</span>Activity<span class="pv">${S.txs.length} ${ic('angle-right-solid')}</span></a>
    <a class="p-item" href="#/receive"><span class="pi" style="background:#f1ecfd">${ic('qrcode-solid')}</span>My addresses<span class="pv">${ic('angle-right-solid')}</span></a>
    <button class="p-item" data-reset><span class="pi" style="background:#f4f4f6">${ic('redo-alt-solid')}</span>Reset demo wallet</button>
    <button class="p-item red" data-out><span class="pi" style="background:#fff0eb">${ic('sign-out-alt-solid')}</span>Sign out</button>
  </div>
  <div class="about" data-rise style="--i:3"><img class="about-mark" src="assets/brand/keelo_mark.svg" alt="" width="15" height="15"><b>Keelo</b> · Demo build · Designed by Olayemi<br>Prices are simulated and every balance is example data. There is no real wallet connection and no real money.</div>
</div>`,mount(el){
  $('[data-hide]',el).onclick=()=>{S.hide=!S.hide;save();render()};
  $('[data-reset]',el).onclick=()=>openSheet(`<h3>Reset demo wallet?</h3><p class="si-p">Your demo balance, holdings and activity go back to the starting example.</p><button class="btn" data-doreset>Reset</button><button class="btn ghost" style="margin-top:12px" data-close>Cancel</button>`)||$('[data-doreset]').addEventListener('click',()=>{const n=S.name,e=S.email;S=seedState();S.signedIn=true;S.name=n;S.email=e;save();closeSheet();toast('Demo wallet reset');setTimeout(render,300)});
  $('[data-out]',el).onclick=()=>{S.signedIn=false;save();go('welcome')};
}});

/* ---------- live price ticker (simulated) ---------- */
function tick(){
  ORDER.forEach(c=>{const b=COINS[c].base;let p=PRICE[c]*(1+(Math.random()-.5)*0.0012*COINS[c].vol);p=Math.min(b*1.03,Math.max(b*.97,p));PRICE[c]=p;
    Object.values(HIST[c]).forEach(s=>{s[s.length-1]={t:Date.now(),p}})});
  $$('[data-wp]').forEach(e=>e.textContent=nf(PRICE[e.dataset.wp],2,2));
  if(cur&&cur._tick) cur._tick(cur);
}

/* ---------- boot ---------- */
$$('[data-icons]').forEach(e=>e.innerHTML=e.dataset.icons.split(' ').map(n=>ic(n)).join(''));
const NAVI={home:'nav-dashboard',trade:'nav-exchange',portfolio:'nav-chart',activity:'nav-folder',profile:'nav-setting'};
$$('#nav a').forEach(a=>a.innerHTML=ic(NAVI[a.dataset.tab]));
render();
setInterval(tick,2600);
})();
