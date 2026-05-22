import{j as e,_ as xe}from"./index-Br7Cas8L.js";import{r as a}from"./react-F9Y4d3HK.js";import{fetchClientById as E,subscribeClientUpdates as he,fetchUpdateFeedback as $,updateClientUpdate as Y,createUpdateFeedback as be}from"./firebase-CLCaQaZy.js";const N={planning:{label:"Planning",color:"#818CF8",bg:"rgba(129,140,248,0.13)",border:"rgba(129,140,248,0.28)",emoji:"📋"},"in-progress":{label:"In Progress",color:"#F59E0B",bg:"rgba(245,158,11,0.13)",border:"rgba(245,158,11,0.32)",emoji:"⚡"},review:{label:"Under Review",color:"#3B82F6",bg:"rgba(59,130,246,0.13)",border:"rgba(59,130,246,0.28)",emoji:"🔍"},completed:{label:"Completed",color:"#10B981",bg:"rgba(16,185,129,0.13)",border:"rgba(16,185,129,0.28)",emoji:"✅"},"on-hold":{label:"On Hold",color:"#EF4444",bg:"rgba(239,68,68,0.13)",border:"rgba(239,68,68,0.28)",emoji:"⏸️"}},M={seo:{label:"SEO & Search",subtitle:"Improving your visibility on Google and search engines",icon:"🔍",color:"#3B82F6",colorDim:"rgba(59,130,246,0.12)",colorBorder:"rgba(59,130,246,0.2)",grad:"linear-gradient(135deg, rgba(59,130,246,0.08) 0%, transparent 100%)"},"digital-marketing":{label:"Digital Marketing",subtitle:"Campaigns, ads, social media & brand growth",icon:"📣",color:"#8B5CF6",colorDim:"rgba(139,92,246,0.12)",colorBorder:"rgba(139,92,246,0.2)",grad:"linear-gradient(135deg, rgba(139,92,246,0.08) 0%, transparent 100%)"},general:{label:"Project Updates",subtitle:"Milestones and general progress updates",icon:"📋",color:"#6366F1",colorDim:"rgba(99,102,241,0.12)",colorBorder:"rgba(99,102,241,0.2)",grad:"linear-gradient(135deg, rgba(99,102,241,0.08) 0%, transparent 100%)"}};function me(){try{return localStorage.getItem("cp-theme")!=="light"}catch{return!0}}function fe(t){try{localStorage.setItem("cp-theme",t?"dark":"light")}catch{}}const U=`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Dark ── */
  .cp-root[data-cp-theme="dark"] {
    --cp-bg:          #07090F;
    --cp-bg-nav:      rgba(7,9,15,.97);
    --cp-bg-glass:    rgba(11,15,28,.92);
    --cp-bg-card:     rgba(255,255,255,.026);
    --cp-bg-hover:    rgba(255,255,255,.042);
    --cp-bg-new:      rgba(79,125,255,.08);
    --cp-bg-input:    rgba(255,255,255,.06);
    --cp-bg-badge:    rgba(255,255,255,.06);
    --cp-bg-stat:     rgba(255,255,255,.034);
    --cp-bg-hero:     rgba(9,12,24,.55);
    --cp-text-h:      #F1F5F9;
    --cp-text-body:   #CBD5E1;
    --cp-text-muted:  #64748B;
    --cp-text-dim:    #475569;
    --cp-text-dimmer: #334155;
    --cp-border:      rgba(255,255,255,.068);
    --cp-border-md:   rgba(255,255,255,.052);
    --cp-scrollbar:   #1E293B;
    --cp-dots:        rgba(79,125,255,.08);
    --cp-glow:        rgba(79,125,255,.14);
    --cp-shadow-card: 0 2px 20px rgba(0,0,0,.38);
    --cp-shadow-lg:   0 24px 80px rgba(0,0,0,.52);
    --cp-approved-bg: rgba(16,185,129,.08);
    --cp-approved-border: rgba(16,185,129,.22);
  }

  /* ── Light ── */
  .cp-root[data-cp-theme="light"] {
    --cp-bg:          #F0F4FA;
    --cp-bg-nav:      rgba(240,244,250,.97);
    --cp-bg-glass:    rgba(255,255,255,.95);
    --cp-bg-card:     rgba(255,255,255,.85);
    --cp-bg-hover:    #fff;
    --cp-bg-new:      rgba(30,58,138,.05);
    --cp-bg-input:    rgba(0,0,0,.04);
    --cp-bg-badge:    rgba(0,0,0,.05);
    --cp-bg-stat:     rgba(255,255,255,.96);
    --cp-bg-hero:     rgba(255,255,255,.58);
    --cp-text-h:      #0F172A;
    --cp-text-body:   #1E293B;
    --cp-text-muted:  #64748B;
    --cp-text-dim:    #94A3B8;
    --cp-text-dimmer: #CBD5E1;
    --cp-border:      rgba(0,0,0,.08);
    --cp-border-md:   rgba(0,0,0,.058);
    --cp-scrollbar:   #CBD5E1;
    --cp-dots:        rgba(99,102,241,.05);
    --cp-glow:        rgba(30,58,138,.07);
    --cp-shadow-card: 0 2px 14px rgba(30,58,138,.07);
    --cp-shadow-lg:   0 24px 80px rgba(79,125,255,.14);
    --cp-approved-bg: rgba(16,185,129,.07);
    --cp-approved-border: rgba(16,185,129,.2);
  }

  .cp-root {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    min-height: 100vh;
    background: var(--cp-bg);
    color: var(--cp-text-body);
    -webkit-font-smoothing: antialiased;
    transition: background .3s, color .3s;
  }

  .cp-root ::-webkit-scrollbar { width: 4px; }
  .cp-root ::-webkit-scrollbar-track { background: transparent; }
  .cp-root ::-webkit-scrollbar-thumb { background: var(--cp-scrollbar); border-radius: 99px; }

  @keyframes cp-fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes cp-fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes cp-slideUp  { from { opacity:0; transform:translateY(40px); } to { opacity:1; transform:translateY(0); } }
  @keyframes cp-spin     { to { transform:rotate(360deg); } }
  @keyframes cp-pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.86)} }
  @keyframes cp-glow-an  { 0%,100%{opacity:.45} 50%{opacity:1} }
  @keyframes cp-checkpop { 0%{transform:scale(0) rotate(-10deg);opacity:0} 70%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
  @keyframes cp-slideRight { from{opacity:0;transform:translateX(28px) scale(.96)} to{opacity:1;transform:translateX(0) scale(1)} }

  .cp-fade-up  { animation: cp-fadeUp .5s cubic-bezier(.16,1,.3,1) both; }
  .cp-fade-in  { animation: cp-fadeIn .35s ease both; }
  .cp-d1{animation-delay:.06s} .cp-d2{animation-delay:.12s}
  .cp-d3{animation-delay:.18s} .cp-d4{animation-delay:.24s}
  .cp-d5{animation-delay:.30s} .cp-d6{animation-delay:.36s}

  .cp-dots-bg {
    background-image: radial-gradient(circle, var(--cp-dots) 1px, transparent 1px);
    background-size: 28px 28px;
  }
  .cp-glass {
    background: var(--cp-bg-glass);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid var(--cp-border);
  }

  /* Nav */
  .cp-nav {
    position: sticky; top: 0; z-index: 50;
    border-bottom: 1px solid var(--cp-border-md);
    background: var(--cp-bg-nav);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    transition: background .3s, border-color .3s;
  }

  /* Cards */
  .cp-card {
    background: var(--cp-bg-card);
    border: 1px solid var(--cp-border-md);
    border-radius: 16px;
    overflow: hidden;
    transition: background .2s, border-color .2s, transform .18s, box-shadow .18s;
    cursor: pointer;
  }
  .cp-card:hover { background: var(--cp-bg-hover); transform: translateY(-2px); box-shadow: var(--cp-shadow-card); }
  .cp-card.is-latest { border-color: rgba(99,102,241,.24); background: var(--cp-bg-new); }
  .cp-card.is-approved { border-color: var(--cp-approved-border); background: var(--cp-approved-bg); }

  /* Stat metric */
  .cp-metric {
    background: var(--cp-bg-stat); border: 1px solid var(--cp-border);
    border-radius: 14px; padding: 16px 18px;
    transition: background .3s, border-color .3s, transform .18s;
  }
  .cp-metric:hover { transform: translateY(-1px); }

  /* Input */
  .cp-input {
    transition: border-color .2s, box-shadow .2s;
    background: var(--cp-bg-input) !important;
    color: var(--cp-text-h) !important;
  }
  .cp-input::placeholder { color: var(--cp-text-dim) !important; }
  .cp-input:focus { outline: none; border-color: #6366F1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,.14); }

  /* Primary button */
  .cp-btn { transition: all .18s; }
  .cp-btn:hover:not(:disabled) { opacity:.88; transform:translateY(-1px); }
  .cp-btn:active:not(:disabled) { transform:translateY(0); }

  /* Mark Done button */
  .cp-done-btn {
    display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 10px 18px; border-radius: 10px; border: 1.5px solid rgba(16,185,129,.35);
    background: rgba(16,185,129,.08); color: #10B981;
    font-size: 13px; font-weight: 600; cursor: pointer;
    transition: all .18s; font-family: inherit;
  }
  .cp-done-btn:hover { background: rgba(16,185,129,.15); border-color: rgba(16,185,129,.5); transform: translateY(-1px); }
  .cp-done-btn.done  { background: rgba(16,185,129,.12); border-color: rgba(16,185,129,.3); color: #10B981; cursor: default; }

  /* Theme toggle */
  .cp-toggle {
    position: relative; width: 46px; height: 25px;
    border-radius: 99px; border: 1.5px solid var(--cp-border);
    background: var(--cp-bg-stat); cursor: pointer; overflow: hidden;
    flex-shrink: 0; transition: border-color .2s, box-shadow .2s, background .3s;
  }
  .cp-toggle:hover { border-color: #6366F1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,.14); }

  .cp-logo-link {
    display: flex; align-items: center;
    text-decoration: none; cursor: pointer;
    border-radius: 8px; padding: 2px 6px 2px 2px;
    transition: background .15s;
  }
  .cp-logo-link:hover { background: var(--cp-bg-badge); }

  /* Section banner */
  .cp-section-banner {
    border-radius: 14px; border: 1px solid var(--cp-border-md);
    padding: 18px 20px; margin-bottom: 14px;
    transition: background .3s, border-color .3s;
  }

  /* Modal backdrop */
  .cp-modal-backdrop {
    position: fixed; inset: 0; z-index: 900;
    background: rgba(0,0,0,.62); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center; padding: 16px;
    animation: cp-fadeIn .2s ease both;
  }
  .cp-modal {
    position: relative; background: var(--cp-bg-glass);
    border: 1px solid var(--cp-border); border-radius: 22px;
    box-shadow: var(--cp-shadow-lg); width: 100%; max-width: 700px;
    max-height: 90vh; display: flex; flex-direction: column; overflow: hidden;
    animation: cp-fadeUp .3s cubic-bezier(.16,1,.3,1) both;
  }
  .cp-modal-header {
    display: flex; align-items: flex-start; gap: 12;
    padding: 20px 20px 16px; border-bottom: 1px solid var(--cp-border-md); flex-shrink: 0;
  }
  .cp-modal-body { overflow-y: auto; padding: 20px; flex: 1; }
  .cp-modal-img  { width:100%; border-radius:12px; display:block; border:1px solid var(--cp-border-md); object-fit:contain; }

  /* Chat bubbles */
  .cp-chat-wrap { display:flex; flex-direction:column; gap:10; }
  .cp-bubble-row { display:flex; align-items:flex-end; gap:8; }
  .cp-bubble-row.from-team { flex-direction: row-reverse; }
  .cp-bubble {
    padding: 10px 14px; border-radius: 16px; font-size: 13.5px;
    line-height: 1.62; max-width: 80%;
    color: var(--cp-text-body);
  }
  .cp-bubble.from-client {
    background: var(--cp-bg-stat); border: 1px solid var(--cp-border);
    border-bottom-left-radius: 4px;
  }
  .cp-bubble.from-team {
    background: rgba(99,102,241,.12); border: 1px solid rgba(99,102,241,.22); color: var(--cp-text-h);
    border-bottom-right-radius: 4px;
  }
  .cp-bubble-avatar {
    width: 28px; height: 28px; border-radius: 8px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 11px; font-weight: 800;
  }
  .cp-bubble-meta { font-size: 10px; color: var(--cp-text-dim); margin-top: 3px; padding: 0 4px; }

  /* Notification popup */
  .cp-notif-popup {
    display: flex; align-items: flex-start; gap: 12;
    padding: 14px 16px; background: var(--cp-bg-glass);
    backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(99,102,241,.28); border-radius: 14px;
    box-shadow: 0 8px 32px rgba(0,0,0,.35), 0 0 0 1px rgba(99,102,241,.09);
    max-width: 320px; width: 100%;
    animation: cp-slideRight .32s cubic-bezier(.16,1,.3,1) both;
  }
  .cp-notif-dismiss {
    background: transparent; border: none; cursor: pointer;
    width: 22px; height: 22px; border-radius: 6px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    color: var(--cp-text-dim); font-size: 16px; line-height: 1;
    transition: background .15s, color .15s;
  }
  .cp-notif-dismiss:hover { background: rgba(239,68,68,.1); color: #EF4444; }

  /* Footer */
  .cp-footer { border-top: 1px solid var(--cp-border-md); transition: border-color .3s; }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .cp-hide-tab { display: none !important; }
  }
  @media (max-width: 640px) {
    .cp-hide-mobile { display: none !important; }
    .cp-nav-inner   { padding: 0 14px !important; height: 54px !important; }
    .cp-hero-inner  { padding: 20px 16px 18px !important; }
    .cp-content     { padding: 0 14px 80px !important; }
    .cp-metrics-grid { grid-template-columns: 1fr 1fr !important; gap: 10px !important; }
    .cp-hero-cols   { flex-direction: column !important; gap: 16px !important; }
    .cp-section-banner { padding: 14px 16px !important; }
    .cp-card-inner  { padding: 14px 16px 14px 18px !important; }
    .cp-notif-popup { max-width: calc(100vw - 28px); }
    .cp-modal-backdrop { padding: 0; align-items: flex-end; }
    .cp-modal {
      border-radius: 22px 22px 0 0 !important; max-height: 93vh !important;
      max-width: 100% !important; animation: cp-slideUp .32s cubic-bezier(.16,1,.3,1) both !important;
    }
    .cp-modal-header { padding: 16px 16px 14px !important; }
    .cp-modal-body  { padding: 16px !important; }
    .cp-bubble      { max-width: 90% !important; }
    .cp-done-btn    { width: 100%; }
    .cp-metric      { padding: 13px 14px !important; }
  }
  @media (max-width: 420px) {
    .cp-metrics-grid { grid-template-columns: 1fr 1fr !important; }
  }

  /* ── Filter bar ── */
  .cp-filter-bar {
    display: flex; align-items: center; gap: 6px;
    overflow-x: auto; -webkit-overflow-scrolling: touch;
    scrollbar-width: none; padding-bottom: 2px;
  }
  .cp-filter-bar::-webkit-scrollbar { display: none; }
  .cp-filter-tab {
    display: flex; align-items: center; gap: 5px;
    padding: 7px 14px; border-radius: 99px;
    border: 1px solid var(--cp-border);
    background: transparent; color: var(--cp-text-muted);
    font-size: 12px; font-weight: 600; cursor: pointer; white-space: nowrap;
    transition: all .15s; font-family: inherit; flex-shrink: 0;
  }
  .cp-filter-tab:hover { border-color: rgba(99,102,241,.3); color: var(--cp-text-body); }
  .cp-filter-tab.cp-tab-active {
    background: rgba(99,102,241,.12); border-color: rgba(99,102,241,.3); color: #818CF8;
  }

  /* View mode toggle */
  .cp-view-btn {
    display: flex; align-items: center; gap: 5px;
    padding: 7px 12px; border-radius: 8px;
    border: 1px solid var(--cp-border); background: transparent;
    color: var(--cp-text-muted); font-size: 12px; font-weight: 600;
    cursor: pointer; white-space: nowrap; transition: all .15s; font-family: inherit;
  }
  .cp-view-btn:hover { border-color: rgba(99,102,241,.3); color: var(--cp-text-body); }
  .cp-view-btn.cp-tab-active {
    background: rgba(99,102,241,.1); border-color: rgba(99,102,241,.28); color: #818CF8;
  }

  /* ── Alert banner ── */
  .cp-alert-banner {
    display: flex; align-items: center; gap: 12px;
    padding: 12px 16px; border-radius: 12px;
    background: rgba(245,158,11,.07); border: 1px solid rgba(245,158,11,.24);
    margin-bottom: 20px; animation: cp-fadeUp .4s cubic-bezier(.16,1,.3,1) both;
  }

  /* ── Timeline ── */
  .cp-timeline-wrap { display: flex; flex-direction: column; gap: 0; position: relative; padding-left: 28px; }
  .cp-timeline-wrap::before {
    content: ""; position: absolute; left: 9px; top: 5px; bottom: 5px; width: 2px;
    background: linear-gradient(180deg, rgba(99,102,241,.5), rgba(139,92,246,.2), transparent);
    border-radius: 99px;
  }
  .cp-timeline-item {
    display: flex; gap: 14px; cursor: pointer;
    padding: 14px 16px; border-radius: 14px;
    border: 1px solid var(--cp-border-md);
    background: var(--cp-bg-card);
    margin-bottom: 10px;
    transition: background .2s, transform .18s, box-shadow .18s;
    position: relative;
  }
  .cp-timeline-item:hover {
    background: var(--cp-bg-hover); transform: translateX(4px);
    box-shadow: var(--cp-shadow-card);
  }
  .cp-timeline-dot {
    position: absolute; left: -32px; top: 18px;
    width: 12px; height: 12px; border-radius: 50%;
    border: 2px solid var(--cp-bg); box-shadow: 0 0 0 2px currentColor;
  }
  .cp-section-grad-label {
    background: linear-gradient(135deg, currentColor, color-mix(in srgb, currentColor 70%, transparent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-weight: 800;
  }

  /* ── Section collapse ── */
  .cp-section-hdr {
    cursor: pointer; user-select: none; transition: opacity .15s;
  }
  .cp-section-hdr:hover { opacity: .88; }
  .cp-chevron {
    display: flex; align-items: center; justify-content: center;
    width: 24px; height: 24px; border-radius: 7px;
    border: 1px solid var(--cp-border); flex-shrink: 0;
    color: var(--cp-text-dim); transition: transform .22s cubic-bezier(.16,1,.3,1), background .15s;
  }
  .cp-chevron.open { transform: rotate(0deg); }
  .cp-chevron.closed { transform: rotate(-90deg); }
`;function O(t){return t.split(" ").filter(Boolean).map(o=>o[0]).join("").toUpperCase().slice(0,2)}function _(t){if(!t)return"";try{return(t!=null&&t.toDate?t.toDate():new Date(t)).toLocaleDateString("en-US",{day:"numeric",month:"long",year:"numeric"})}catch{return""}}function V(t){if(!t)return"";try{return(t!=null&&t.toDate?t.toDate():new Date(t)).toLocaleDateString("en-US",{day:"numeric",month:"short"})}catch{return""}}function ue(t){if(!t)return"";try{return(t!=null&&t.toDate?t.toDate():new Date(t)).toLocaleString("en-US",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}catch{return""}}function ye(){const t=new Date().getHours();return t<12?"Good morning":t<17?"Good afternoon":"Good evening"}function Z({isDark:t,onToggle:o}){return e.jsxs("button",{className:"cp-toggle",onClick:o,"aria-label":t?"Switch to light":"Switch to dark",children:[e.jsxs("div",{style:{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 5px",pointerEvents:"none",fontSize:10},children:[e.jsx("span",{style:{opacity:t?.3:1,transition:"opacity .3s"},children:"☀"}),e.jsx("span",{style:{opacity:t?1:.3,transition:"opacity .3s"},children:"☽"})]}),e.jsx("div",{style:{position:"absolute",top:3,left:3,width:15,height:15,borderRadius:"50%",background:"linear-gradient(135deg,#6366F1,#818CF8)",transform:t?"translateX(21px)":"translateX(0)",transition:"transform 360ms cubic-bezier(.16,1,.3,1)",boxShadow:"0 1px 4px rgba(99,102,241,.4)"}})]})}function G({height:t=34,isDark:o=!0}){return e.jsx("a",{href:"/",className:"cp-logo-link","aria-label":"ZynHive",children:e.jsx("img",{src:"/logo.png",alt:"ZynHive",style:{height:t,width:"auto",objectFit:"contain",display:"block",...o?{}:{filter:"brightness(0) invert(1)",background:"rgba(8,11,20,.8)",borderRadius:8,padding:"3px 8px"}}})})}function X(){return e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:16},children:[e.jsxs("div",{style:{position:"relative",width:44,height:44},children:[e.jsx("div",{style:{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid rgba(99,102,241,.15)"}}),e.jsx("div",{style:{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid transparent",borderTopColor:"#6366F1",animation:"cp-spin .9s linear infinite"}}),e.jsx("div",{style:{position:"absolute",inset:6,borderRadius:"50%",background:"rgba(99,102,241,.1)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("span",{style:{fontSize:10,fontWeight:800,color:"#6366F1"},children:"ZH"})})]}),e.jsx("span",{style:{fontSize:13,color:"var(--cp-text-dim)",fontWeight:500},children:"Loading your portal…"})]})}function K({status:t,color:o}){return e.jsx("span",{style:{display:"inline-block",width:8,height:8,borderRadius:"50%",background:o,flexShrink:0,...t==="in-progress"?{animation:"cp-pulse 1.8s ease infinite"}:{}}})}function ve({pct:t,color:o="#6366F1",size:c=96}){const m=(c-10)/2,i=2*Math.PI*m,x=i-t/100*i;return e.jsxs("svg",{width:c,height:c,style:{display:"block",transform:"rotate(-90deg)"},children:[e.jsx("circle",{cx:c/2,cy:c/2,r:m,fill:"none",stroke:"var(--cp-border)",strokeWidth:7}),e.jsx("circle",{cx:c/2,cy:c/2,r:m,fill:"none",stroke:o,strokeWidth:7,strokeLinecap:"round",strokeDasharray:i,strokeDashoffset:x,style:{transition:"stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)"}})]})}function je({clientId:t,onAuth:o,isDark:c,onToggleTheme:m}){const[i,x]=a.useState(""),[s,d]=a.useState(!1),[p,f]=a.useState(!1),[b,g]=a.useState(""),[W,y]=a.useState(!0),[w,S]=a.useState(!1);a.useEffect(()=>{E(t).then(v=>{v||S(!0)}).catch(()=>S(!0)).finally(()=>y(!1))},[t]);async function j(v){if(v.preventDefault(),!!i.trim()){f(!0),g("");try{const k=await E(t);if(!k){g("Portal not found.");return}if(k.password!==i.trim()){g("Incorrect password. Please try again.");return}sessionStorage.setItem(`client-auth-${t}`,"1"),o(k)}catch{g("Something went wrong. Please try again.")}finally{f(!1)}}}return W?e.jsx(X,{}):w?e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:12,padding:24,textAlign:"center"},children:[e.jsx("div",{style:{width:56,height:56,borderRadius:16,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24},children:"🔍"}),e.jsx("p",{style:{fontSize:18,fontWeight:700,color:"var(--cp-text-h)"},children:"Portal not found"}),e.jsx("p",{style:{fontSize:14,color:"var(--cp-text-muted)",maxWidth:280,lineHeight:1.6},children:"This link is invalid or has been removed."})]}):e.jsxs("div",{className:"cp-dots-bg",style:{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:"24px 16px",position:"relative"},children:[e.jsx("div",{style:{position:"fixed",top:16,right:20,zIndex:100},children:e.jsx(Z,{isDark:c,onToggle:m})}),e.jsx("div",{style:{position:"fixed",top:"18%",left:"50%",transform:"translateX(-50%)",width:480,height:480,borderRadius:"50%",background:"radial-gradient(circle, var(--cp-glow) 0%, transparent 70%)",pointerEvents:"none",animation:"cp-glow-an 4s ease infinite"}}),e.jsxs("div",{className:"cp-fade-up",style:{width:"100%",maxWidth:400,position:"relative",zIndex:1},children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:32},children:[e.jsx("div",{style:{display:"flex",justifyContent:"center",marginBottom:20},children:e.jsx(G,{height:48,isDark:c})}),e.jsx("h1",{style:{fontSize:24,fontWeight:800,color:"var(--cp-text-h)",letterSpacing:"-0.5px",marginBottom:8},children:"Welcome Back"}),e.jsx("p",{style:{fontSize:14,color:"var(--cp-text-muted)",lineHeight:1.65},children:"Sign in to view your project progress and updates."})]}),e.jsx("div",{className:"cp-glass",style:{borderRadius:20,padding:"28px 28px 24px",boxShadow:"var(--cp-shadow-lg)"},children:e.jsxs("form",{onSubmit:j,style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:6},children:[e.jsx("label",{style:{fontSize:11,fontWeight:700,color:"var(--cp-text-dim)",textTransform:"uppercase",letterSpacing:"0.07em"},children:"Password"}),e.jsxs("div",{style:{position:"relative"},children:[e.jsx("input",{type:s?"text":"password",value:i,onChange:v=>x(v.target.value),placeholder:"Enter your portal password",className:"cp-input",style:{width:"100%",padding:"11px 42px 11px 14px",borderRadius:11,fontSize:14,fontFamily:"inherit",border:"1.5px solid var(--cp-border)"},autoFocus:!0}),e.jsx("button",{type:"button",onClick:()=>d(v=>!v),style:{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"transparent",border:"none",cursor:"pointer",color:"var(--cp-text-dim)",display:"flex",alignItems:"center",justifyContent:"center",padding:4},children:s?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 20 20",fill:"none",children:[e.jsx("path",{d:"M2 10c2-4 5-6 8-6s6 2 8 6c-2 4-5 6-8 6s-6-2-8-6z",stroke:"currentColor",strokeWidth:"1.4"}),e.jsx("circle",{cx:"10",cy:"10",r:"2.5",stroke:"currentColor",strokeWidth:"1.4"}),e.jsx("path",{d:"M3 3l14 14",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round"})]}):e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 20 20",fill:"none",children:[e.jsx("path",{d:"M2 10c2-4 5-6 8-6s6 2 8 6c-2 4-5 6-8 6s-6-2-8-6z",stroke:"currentColor",strokeWidth:"1.4"}),e.jsx("circle",{cx:"10",cy:"10",r:"2.5",stroke:"currentColor",strokeWidth:"1.4"})]})})]})]}),b&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"9px 12px",borderRadius:9,background:"rgba(239,68,68,.09)",border:"1px solid rgba(239,68,68,.22)"},children:[e.jsx("span",{style:{fontSize:14},children:"⚠️"}),e.jsx("span",{style:{fontSize:12,color:"#EF4444"},children:b})]}),e.jsx("button",{type:"submit",disabled:p||!i.trim(),className:"cp-btn",style:{padding:"12px 0",borderRadius:11,border:"none",background:p||!i.trim()?"rgba(99,102,241,.2)":"linear-gradient(135deg,#6366F1,#818CF8)",color:p||!i.trim()?"#4C5580":"white",fontSize:14,fontWeight:700,cursor:p||!i.trim()?"default":"pointer",width:"100%",display:"flex",alignItems:"center",justifyContent:"center",gap:8},children:p?e.jsxs(e.Fragment,{children:[e.jsx("span",{style:{width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,.25)",borderTopColor:"white",animation:"cp-spin .8s linear infinite",display:"inline-block"}})," Signing in…"]}):"Sign in to Portal →"})]})}),e.jsx("p",{style:{textAlign:"center",fontSize:11,color:"var(--cp-text-dimmer)",marginTop:20},children:"🔒 Secure · Encrypted · Private"})]})]})}function ke({client:t,isDark:o,onToggleTheme:c,onLogout:m,onOpenEmailSettings:i}){const[x,s]=a.useState(!1);return e.jsx("nav",{className:"cp-nav",children:e.jsxs("div",{className:"cp-nav-inner",style:{maxWidth:960,margin:"0 auto",padding:"0 20px",height:58,display:"flex",alignItems:"center",gap:10},children:[e.jsx(G,{isDark:o}),e.jsx("div",{style:{width:1,height:16,background:"var(--cp-border)"},className:"cp-hide-mobile"}),e.jsx("span",{className:"cp-hide-mobile",style:{fontSize:11,color:"var(--cp-text-dim)",fontWeight:500},children:"Client Portal"}),e.jsx("div",{style:{flex:1}}),e.jsx(Z,{isDark:o,onToggle:c}),e.jsxs("button",{onClick:i,title:"Email notification settings",className:"cp-hide-tab",style:{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:8,border:"1px solid var(--cp-border)",background:t.notificationEmail?"rgba(16,185,129,.08)":"transparent",color:t.notificationEmail?"#10B981":"var(--cp-text-dim)",cursor:"pointer",fontSize:11,transition:"all .15s",fontFamily:"inherit"},children:[e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("rect",{x:"1",y:"3",width:"12",height:"8.5",rx:"1.5",stroke:"currentColor",strokeWidth:"1.1"}),e.jsx("path",{d:"M1 4l6 4 6-4",stroke:"currentColor",strokeWidth:"1.1",strokeLinecap:"round"})]}),t.notificationEmail?"Alerts On":"Email Alerts"]}),e.jsxs("div",{className:"cp-hide-mobile",style:{display:"flex",alignItems:"center",gap:10},children:[e.jsxs("div",{style:{textAlign:"right"},children:[e.jsx("div",{style:{fontSize:12,fontWeight:600,color:"var(--cp-text-body)",lineHeight:1.3},children:t.name}),t.company&&e.jsx("div",{style:{fontSize:10,color:"var(--cp-text-dim)"},children:t.company})]}),e.jsx("div",{style:{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg, #4F7DFF 0%, #22B8D4 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:800,color:"#fff",flexShrink:0,boxShadow:"0 4px 14px rgba(79,125,255,0.35), inset 0 1px 0 rgba(255,255,255,0.20)",letterSpacing:"-0.02em",textShadow:"0 1px 2px rgba(0,0,0,0.25)"},children:O(t.name)}),e.jsxs("button",{onClick:m,style:{display:"flex",alignItems:"center",gap:4,padding:"5px 9px",borderRadius:7,border:"1px solid var(--cp-border)",background:"transparent",color:"var(--cp-text-dim)",cursor:"pointer",fontSize:11,transition:"all .15s",fontFamily:"inherit"},onMouseEnter:d=>{const p=d.currentTarget;p.style.borderColor="rgba(239,68,68,.35)",p.style.color="#EF4444",p.style.background="rgba(239,68,68,.07)"},onMouseLeave:d=>{const p=d.currentTarget;p.style.borderColor="var(--cp-border)",p.style.color="var(--cp-text-dim)",p.style.background="transparent"},children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("path",{d:"M5 7h7M9.5 4.5L12 7l-2.5 2.5",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2",stroke:"currentColor",strokeWidth:"1.3",strokeLinecap:"round"})]}),"Sign out"]})]}),e.jsxs("div",{style:{position:"relative"},className:"cp-show-mobile",children:[e.jsx("button",{onClick:()=>s(d=>!d),style:{display:"flex",alignItems:"center",justifyContent:"center",width:36,height:36,borderRadius:9,border:"1px solid var(--cp-border)",background:"var(--cp-bg-badge)",cursor:"pointer",color:"var(--cp-text-dim)"},children:e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",children:e.jsx("path",{d:"M2 4h10M2 7h10M2 10h10",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round"})})}),x&&e.jsxs("div",{style:{position:"absolute",right:0,top:"calc(100% + 8px)",zIndex:999,background:"var(--cp-bg-glass)",border:"1px solid var(--cp-border)",borderRadius:12,padding:8,minWidth:200,boxShadow:"var(--cp-shadow-lg)",backdropFilter:"blur(16px)"},onClick:()=>s(!1),children:[e.jsxs("div",{style:{padding:"8px 12px",borderBottom:"1px solid var(--cp-border)",marginBottom:4},children:[e.jsx("div",{style:{fontSize:13,fontWeight:600,color:"var(--cp-text-h)"},children:t.name}),t.company&&e.jsx("div",{style:{fontSize:11,color:"var(--cp-text-dim)"},children:t.company})]}),e.jsxs("button",{onClick:i,style:{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 12px",borderRadius:8,border:"none",background:"transparent",color:"var(--cp-text-body)",cursor:"pointer",fontSize:13,textAlign:"left",fontFamily:"inherit"},children:[e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("rect",{x:"1",y:"3",width:"12",height:"8.5",rx:"1.5",stroke:"currentColor",strokeWidth:"1.1"}),e.jsx("path",{d:"M1 4l6 4 6-4",stroke:"currentColor",strokeWidth:"1.1",strokeLinecap:"round"})]}),t.notificationEmail?"Email Alerts ✓":"Setup Email Alerts"]}),e.jsxs("button",{onClick:m,style:{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 12px",borderRadius:8,border:"none",background:"transparent",color:"#EF4444",cursor:"pointer",fontSize:13,textAlign:"left",fontFamily:"inherit"},children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("path",{d:"M5 7h7M9.5 4.5L12 7l-2.5 2.5",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2",stroke:"currentColor",strokeWidth:"1.3",strokeLinecap:"round"})]}),"Sign out"]})]})]})]})})}function we({u:t,client:o,onClose:c,onApprove:m}){const[i,x]=a.useState(t),s=N[i.status],[d,p]=a.useState([]),[f,b]=a.useState(!0),[g,W]=a.useState(""),[y,w]=a.useState(!1),[S,j]=a.useState(!1),v=a.useRef(null);a.useEffect(()=>{i.id&&$(i.id).then(p).catch(()=>{}).finally(()=>b(!1))},[i.id]),a.useEffect(()=>{var n;(n=v.current)==null||n.scrollIntoView({behavior:"smooth"})},[d]),a.useEffect(()=>{function n(B){B.key==="Escape"&&c()}return window.addEventListener("keydown",n),()=>window.removeEventListener("keydown",n)},[c]),a.useEffect(()=>{const n=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=n}},[]);async function k(){const n=g.trim();if(!(!n||!i.id)){w(!0);try{await be({updateId:i.id,clientId:o.id,message:n,fromClient:!0,senderName:o.name}),W(""),p(await $(i.id))}catch(B){console.error("[Feedback]",B)}finally{w(!1)}}}async function I(){if(!(!i.id||i.clientApproved||S)){j(!0);try{await Y(i.id,{clientApproved:!0}),x(n=>({...n,clientApproved:!0})),m(i.id)}catch{}finally{j(!1)}}}return e.jsx("div",{className:"cp-modal-backdrop",onClick:c,children:e.jsxs("div",{className:"cp-modal",onClick:n=>n.stopPropagation(),children:[e.jsxs("div",{className:"cp-modal-header",style:{gap:12},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,flex:1,minWidth:0},children:[e.jsx("div",{style:{width:40,height:40,borderRadius:11,background:s.bg,border:`1px solid ${s.border}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0},children:s.emoji}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsx("h2",{style:{fontSize:16,fontWeight:800,color:"var(--cp-text-h)",lineHeight:1.3,marginBottom:4,wordBreak:"break-word"},children:i.title}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"},children:[e.jsx("span",{style:{fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:99,background:s.bg,color:s.color,border:`1px solid ${s.border}`},children:s.label}),i.phase&&e.jsxs("span",{style:{fontSize:11,color:"var(--cp-text-dim)"},children:["· ",i.phase]}),i.createdAt&&e.jsxs("span",{style:{fontSize:11,color:"var(--cp-text-dim)"},children:["· ",_(i.createdAt)]}),i.clientApproved&&e.jsxs("span",{style:{fontSize:11,fontWeight:700,padding:"2px 8px",borderRadius:99,background:"rgba(16,185,129,.12)",color:"#10B981",border:"1px solid rgba(16,185,129,.25)",display:"flex",alignItems:"center",gap:4},children:[e.jsx("svg",{width:"9",height:"9",viewBox:"0 0 10 10",fill:"none",children:e.jsx("path",{d:"M2 5l2.5 2.5L8 3",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})}),"Reviewed"]})]})]})]}),e.jsx("button",{onClick:c,style:{display:"flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:9,border:"1px solid var(--cp-border)",background:"var(--cp-bg-badge)",color:"var(--cp-text-dim)",cursor:"pointer",flexShrink:0},children:e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 13 13",fill:"none",children:e.jsx("path",{d:"M2 2l9 9M11 2L2 11",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]}),e.jsxs("div",{className:"cp-modal-body",style:{display:"flex",flexDirection:"column",gap:20},children:[i.imageUrl&&e.jsx("div",{children:e.jsx("img",{src:i.imageUrl,alt:"update",className:"cp-modal-img",style:{maxHeight:260}})}),i.description&&e.jsx("div",{style:{padding:"14px 16px",borderRadius:12,background:"var(--cp-bg-stat)",border:"1px solid var(--cp-border)"},children:e.jsx("p",{style:{fontSize:14,color:"var(--cp-text-body)",lineHeight:1.75},children:i.description})}),e.jsxs("div",{style:{padding:"16px",borderRadius:12,background:"var(--cp-bg-stat)",border:"1px solid var(--cp-border)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10},children:[e.jsx("span",{style:{fontSize:13,color:"var(--cp-text-muted)",fontWeight:600},children:"Task Progress"}),e.jsxs("span",{style:{fontSize:22,fontWeight:800,color:s.color,fontFamily:"monospace",lineHeight:1},children:[i.completionPercent,"%"]})]}),e.jsx("div",{style:{height:10,borderRadius:99,background:"var(--cp-border)",overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${i.completionPercent}%`,borderRadius:99,background:`linear-gradient(90deg, ${s.color}, ${s.color}99)`,transition:"width .9s cubic-bezier(.16,1,.3,1)"}})}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginTop:8},children:[e.jsx("span",{style:{fontSize:11,color:"var(--cp-text-dim)"},children:"0%"}),e.jsxs("span",{style:{fontSize:11,color:s.color,fontWeight:600},children:[i.completionPercent,"% complete"]}),e.jsx("span",{style:{fontSize:11,color:"var(--cp-text-dim)"},children:"100%"})]})]}),i.clientApproved?e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",borderRadius:10,background:"rgba(16,185,129,.09)",border:"1px solid rgba(16,185,129,.22)",alignSelf:"flex-start"},children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 16 16",fill:"none",style:{animation:"cp-checkpop .4s cubic-bezier(.16,1,.3,1)"},children:e.jsx("path",{d:"M3 8l3.5 3.5L13 4",stroke:"#10B981",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsx("span",{style:{fontSize:13,fontWeight:600,color:"#10B981"},children:"You reviewed this update"})]}):e.jsx("button",{onClick:I,disabled:S,className:"cp-done-btn",style:{alignSelf:"flex-start"},children:S?e.jsxs(e.Fragment,{children:[e.jsx("span",{style:{width:14,height:14,borderRadius:"50%",border:"2px solid rgba(16,185,129,.3)",borderTopColor:"#10B981",animation:"cp-spin .8s linear infinite",display:"inline-block"}})," Marking…"]}):e.jsxs(e.Fragment,{children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 16 16",fill:"none",children:e.jsx("path",{d:"M3 8l3.5 3.5L13 4",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})})," Mark as Reviewed"]})}),e.jsxs("div",{style:{borderTop:"1px solid var(--cp-border-md)",paddingTop:20},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:16},children:[e.jsx("svg",{width:"15",height:"15",viewBox:"0 0 16 16",fill:"none",children:e.jsx("path",{d:"M2 2h12v9H9l-3 3v-3H2V2z",stroke:"var(--cp-text-muted)",strokeWidth:"1.3",strokeLinejoin:"round"})}),e.jsx("span",{style:{fontSize:14,fontWeight:700,color:"var(--cp-text-h)"},children:"Conversation"}),d.length>0&&e.jsx("span",{style:{fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:99,background:"rgba(99,102,241,.12)",color:"#818CF8",border:"1px solid rgba(99,102,241,.22)"},children:d.length})]}),e.jsxs("div",{className:"cp-chat-wrap",style:{maxHeight:240,overflowY:"auto",paddingRight:2,marginBottom:14},children:[f?e.jsx("div",{style:{fontSize:13,color:"var(--cp-text-dim)",padding:"8px 0",textAlign:"center"},children:"Loading messages…"}):d.length===0?e.jsxs("div",{style:{textAlign:"center",padding:"20px 0"},children:[e.jsx("div",{style:{fontSize:24,marginBottom:8},children:"💬"}),e.jsx("p",{style:{fontSize:13,color:"var(--cp-text-dim)",lineHeight:1.6},children:"No messages yet. Ask a question or share your thoughts!"})]}):d.map(n=>e.jsxs("div",{className:`cp-bubble-row ${n.fromClient?"":"from-team"}`,children:[e.jsx("div",{className:"cp-bubble-avatar",style:{background:n.fromClient?"var(--cp-bg-stat)":"rgba(99,102,241,.15)",color:n.fromClient?"var(--cp-text-dim)":"#818CF8",border:`1px solid ${n.fromClient?"var(--cp-border)":"rgba(99,102,241,.22)"}`},children:n.fromClient?O(n.senderName||o.name):"ZH"}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:2,alignItems:n.fromClient?"flex-start":"flex-end"},children:[e.jsx("div",{className:`cp-bubble ${n.fromClient?"from-client":"from-team"}`,children:n.message}),e.jsxs("div",{className:"cp-bubble-meta",children:[n.fromClient?n.senderName||"You":n.senderName||"ZynHive Team"," · ",ue(n.createdAt)]})]})]},n.id)),e.jsx("div",{ref:v})]}),e.jsxs("div",{style:{display:"flex",gap:8,alignItems:"flex-end"},children:[e.jsx("textarea",{value:g,onChange:n=>W(n.target.value),onKeyDown:n=>{n.key==="Enter"&&!n.shiftKey&&(n.preventDefault(),k())},placeholder:"Ask a question or share your feedback…",rows:2,className:"cp-input",style:{flex:1,padding:"10px 14px",borderRadius:12,fontSize:13,fontFamily:"inherit",border:"1.5px solid var(--cp-border)",resize:"none",lineHeight:1.5}}),e.jsx("button",{onClick:k,disabled:y||!g.trim(),className:"cp-btn",style:{padding:"11px 16px",borderRadius:12,border:"none",flexShrink:0,background:y||!g.trim()?"rgba(99,102,241,.18)":"linear-gradient(135deg,#6366F1,#818CF8)",color:y||!g.trim()?"#4C5580":"white",fontSize:13,fontWeight:600,cursor:y||!g.trim()?"default":"pointer",fontFamily:"inherit"},children:y?e.jsx("span",{style:{width:15,height:15,borderRadius:"50%",border:"2px solid rgba(255,255,255,.2)",borderTopColor:"white",animation:"cp-spin .8s linear infinite",display:"inline-block"}}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 16 16",fill:"none",children:e.jsx("path",{d:"M14 2L2 7l5 2 2 5L14 2z",stroke:"currentColor",strokeWidth:"1.5",strokeLinejoin:"round"})})})]}),e.jsx("p",{style:{fontSize:10,color:"var(--cp-text-dimmer)",marginTop:6},children:"Press Enter to send · Shift+Enter for new line"})]})]})]})})}function Se({u:t,isLatest:o,onClick:c,onApprove:m}){const i=N[t.status],[x,s]=a.useState(!1);async function d(p){if(p.stopPropagation(),!(!t.id||t.clientApproved||x)){s(!0);try{await Y(t.id,{clientApproved:!0}),m(t.id)}catch{}finally{s(!1)}}}return e.jsxs("div",{className:`cp-card${o&&!t.clientApproved?" is-latest":""}${t.clientApproved?" is-approved":""}`,style:{position:"relative"},onClick:c,children:[e.jsx("div",{style:{position:"absolute",top:0,left:0,width:4,height:"100%",background:t.clientApproved?"#10B981":i.color,borderRadius:"16px 0 0 16px",opacity:t.clientApproved?.7:1}}),e.jsxs("div",{className:"cp-card-inner",style:{padding:"16px 18px 16px 22px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:10},children:[e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6},children:[t.clientApproved?e.jsxs("svg",{width:"14",height:"14",viewBox:"0 0 16 16",fill:"none",style:{flexShrink:0},children:[e.jsx("circle",{cx:"8",cy:"8",r:"7",fill:"rgba(16,185,129,.15)",stroke:"#10B981",strokeWidth:"1.2"}),e.jsx("path",{d:"M5 8l2.5 2.5L11 5.5",stroke:"#10B981",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})]}):e.jsx(K,{status:t.status,color:i.color}),e.jsx("span",{style:{fontSize:15,fontWeight:700,color:"var(--cp-text-h)",lineHeight:1.3},children:t.title}),o&&!t.clientApproved&&e.jsx("span",{style:{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:99,background:"rgba(99,102,241,.15)",color:"#818CF8",border:"1px solid rgba(99,102,241,.25)",textTransform:"uppercase",letterSpacing:"0.07em",flexShrink:0},children:"New"}),t.clientApproved&&e.jsx("span",{style:{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:99,background:"rgba(16,185,129,.12)",color:"#10B981",border:"1px solid rgba(16,185,129,.22)",textTransform:"uppercase",letterSpacing:"0.07em",flexShrink:0},children:"Reviewed"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},children:[e.jsxs("span",{style:{fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:99,background:i.bg,color:i.color,border:`1px solid ${i.border}`},children:[i.emoji," ",i.label]}),t.phase&&e.jsxs("span",{style:{fontSize:11,color:"var(--cp-text-dim)"},children:["· ",t.phase]})]})]}),t.createdAt&&e.jsx("span",{style:{fontSize:11,color:"var(--cp-text-dim)",flexShrink:0,marginTop:2},children:V(t.createdAt)})]}),t.description&&e.jsx("p",{style:{fontSize:13,color:"var(--cp-text-muted)",lineHeight:1.7,marginBottom:12,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"},children:t.description}),t.imageUrl&&e.jsx("div",{style:{marginBottom:12},children:e.jsx("img",{src:t.imageUrl,alt:"attachment",style:{width:"100%",borderRadius:9,display:"block",border:"1px solid var(--cp-border-md)",maxHeight:180,objectFit:"cover"}})}),e.jsxs("div",{style:{marginBottom:14},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6},children:[e.jsx("span",{style:{fontSize:11,color:"var(--cp-text-dim)",fontWeight:500},children:"Progress"}),e.jsxs("span",{style:{fontSize:12,fontWeight:800,color:t.clientApproved?"#10B981":i.color,fontFamily:"monospace"},children:[t.completionPercent,"%"]})]}),e.jsx("div",{style:{height:6,borderRadius:99,background:"var(--cp-border)",overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${t.completionPercent}%`,borderRadius:99,background:`linear-gradient(90deg, ${t.clientApproved?"#10B981":i.color}, ${t.clientApproved?"#10B981":i.color}99)`,transition:"width .9s cubic-bezier(.16,1,.3,1)"}})})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10},children:[e.jsx("span",{style:{fontSize:11,color:"var(--cp-text-dim)"},children:"Click to view details & give feedback"}),t.clientApproved?e.jsxs("span",{style:{fontSize:11,color:"#10B981",fontWeight:600,display:"flex",alignItems:"center",gap:4,flexShrink:0},children:[e.jsx("svg",{width:"11",height:"11",viewBox:"0 0 16 16",fill:"none",children:e.jsx("path",{d:"M3 8l3.5 3.5L13 4",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round"})}),"Reviewed"]}):e.jsx("button",{onClick:d,disabled:x,className:"cp-done-btn",style:{padding:"7px 13px",fontSize:12,flexShrink:0,alignSelf:"flex-end"},children:x?e.jsx("span",{style:{width:12,height:12,borderRadius:"50%",border:"2px solid rgba(16,185,129,.3)",borderTopColor:"#10B981",animation:"cp-spin .8s linear infinite",display:"inline-block"}}):e.jsxs(e.Fragment,{children:[e.jsx("svg",{width:"11",height:"11",viewBox:"0 0 16 16",fill:"none",children:e.jsx("path",{d:"M3 8l3.5 3.5L13 4",stroke:"currentColor",strokeWidth:"2.2",strokeLinecap:"round",strokeLinejoin:"round"})})," Mark Reviewed"]})})]})]})]})}function Ce({sectionKey:t,items:o,latestId:c,onCardClick:m,onApprove:i,collapsed:x,onToggle:s}){const d=M[t],p=o.filter(g=>g.status==="completed").length,f=o.filter(g=>g.clientApproved).length,b=o.length>0?Math.round(p/o.length*100):0;return e.jsxs("div",{children:[e.jsxs("div",{className:"cp-section-banner cp-section-hdr",style:{background:d.grad},onClick:s,children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:14},children:[e.jsx("div",{style:{width:42,height:42,borderRadius:11,background:d.colorDim,border:`1px solid ${d.colorBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0},children:d.icon}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:4,flexWrap:"wrap"},children:[e.jsx("h2",{style:{fontSize:15,fontWeight:800,color:"var(--cp-text-h)",letterSpacing:"-0.2px"},children:d.label}),e.jsxs("span",{style:{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,background:d.colorDim,color:d.color,border:`1px solid ${d.colorBorder}`},children:[o.length," ",o.length===1?"task":"tasks"]}),f>0&&e.jsxs("span",{style:{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,background:"rgba(16,185,129,.1)",color:"#10B981",border:"1px solid rgba(16,185,129,.2)"},children:[f," reviewed"]})]}),e.jsx("p",{style:{fontSize:12,color:"var(--cp-text-muted)",lineHeight:1.5},children:d.subtitle})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,flexShrink:0},children:[e.jsxs("div",{style:{textAlign:"center"},className:"cp-hide-mobile",children:[e.jsxs("div",{style:{fontSize:18,fontWeight:800,color:d.color,fontFamily:"monospace",lineHeight:1},children:[b,"%"]}),e.jsx("div",{style:{fontSize:10,color:"var(--cp-text-dim)",marginTop:2},children:"done"})]}),e.jsx("div",{className:`cp-chevron ${x?"closed":"open"}`,children:e.jsx("svg",{width:"10",height:"10",viewBox:"0 0 10 10",fill:"none",children:e.jsx("path",{d:"M2 3.5l3 3 3-3",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round",strokeLinejoin:"round"})})})]})]}),!x&&e.jsxs("div",{style:{marginTop:14},children:[e.jsx("div",{style:{height:4,borderRadius:99,background:"var(--cp-border)",overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${b}%`,borderRadius:99,background:`linear-gradient(90deg, ${d.color}, ${d.color}99)`,transition:"width 1s cubic-bezier(.16,1,.3,1)"}})}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginTop:5},children:[e.jsxs("span",{style:{fontSize:10,color:"var(--cp-text-dim)"},children:[p," of ",o.length," completed"]}),e.jsxs("span",{style:{fontSize:10,color:d.color,fontWeight:600},children:[o.length-p," remaining"]})]})]})]}),!x&&e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:10},children:o.map(g=>e.jsx(Se,{u:g,isLatest:g.id===c,onClick:()=>m(g),onApprove:i},g.id))})]})}function ze({notif:t,onDismiss:o}){return a.useEffect(()=>{const c=setTimeout(o,6e3);return()=>clearTimeout(c)},[o]),e.jsxs("div",{className:"cp-notif-popup",children:[e.jsx("div",{style:{width:36,height:36,borderRadius:10,background:"rgba(99,102,241,0.15)",border:"1px solid rgba(99,102,241,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0},children:"🔔"}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsx("div",{style:{fontSize:10,fontWeight:700,color:"#818CF8",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:3},children:"New Update"}),e.jsx("div",{style:{fontSize:13,fontWeight:700,color:"var(--cp-text-h)",marginBottom:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"},children:t.title}),t.message&&e.jsx("div",{style:{fontSize:12,color:"var(--cp-text-muted)",lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"},children:t.message})]}),e.jsx("button",{className:"cp-notif-dismiss",onClick:o,children:"×"})]})}function We({client:t,isDark:o,onToggleTheme:c,onLogout:m}){const[i,x]=a.useState(t),[s,d]=a.useState([]),[p,f]=a.useState(!0),[b,g]=a.useState(null),[W,y]=a.useState(!1),[w,S]=a.useState(t.notificationEmail??""),[j,v]=a.useState(!1),[k,I]=a.useState([]),[n,B]=a.useState("all"),[R,H]=a.useState("sections"),[q,J]=a.useState(!1),[Q,ee]=a.useState(new Set),te=a.useCallback(r=>I(l=>l.filter(h=>h.id!==r)),[]);function re(r){ee(l=>{const h=new Set(l);return h.has(r)?h.delete(r):h.add(r),h})}const P=a.useCallback(r=>{d(l=>l.map(h=>h.id===r?{...h,clientApproved:!0}:h)),(b==null?void 0:b.id)===r&&g(l=>l&&{...l,clientApproved:!0})},[b==null?void 0:b.id]);a.useEffect(()=>he(i.id,l=>{d(l),f(!1)},l=>{const h=l.id??Date.now().toString();I(L=>[...L,{id:h,title:l.title,message:l.description}])}),[i.id]);async function ie(){if(i.id){v(!0);try{const{updateClient:r}=await xe(async()=>{const{updateClient:l}=await import("./firebase-CLCaQaZy.js");return{updateClient:l}},[]);await r(i.id,{notificationEmail:w.trim()}),x(l=>({...l,notificationEmail:w.trim()})),y(!1)}catch{}finally{v(!1)}}}const u=s[0],oe=s.filter(r=>r.status==="completed").length,ne=s.filter(r=>r.status==="in-progress").length,ae=s.filter(r=>r.clientApproved).length,D=(u==null?void 0:u.completionPercent)??0,A=s.filter(r=>!r.clientApproved).length,C=s.filter(r=>n==="needs-review"?!r.clientApproved:n==="in-progress"?r.status==="in-progress":n==="completed"?r.status==="completed":!0),se=C.filter(r=>r.category==="seo"),le=C.filter(r=>r.category==="digital-marketing"),de=C.filter(r=>!r.category||r.category==="general"),ce=[{key:"seo",items:se},{key:"digital-marketing",items:le},{key:"general",items:de}].filter(r=>r.items.length>0),F=u?N[u.status]:null,pe=[{key:"all",label:"All Updates",icon:"📋"},{key:"needs-review",label:"Needs Review",icon:"👀"},{key:"in-progress",label:"In Progress",icon:"⚡"},{key:"completed",label:"Completed",icon:"✅"}];return e.jsxs("div",{className:"cp-fade-in",style:{minHeight:"100vh"},children:[b&&e.jsx(we,{u:b,client:i,onClose:()=>g(null),onApprove:P}),k.length>0&&e.jsx("div",{style:{position:"fixed",bottom:24,right:16,zIndex:9999,display:"flex",flexDirection:"column",gap:10,alignItems:"flex-end"},children:k.map(r=>e.jsx(ze,{notif:r,onDismiss:()=>te(r.id)},r.id))}),W&&e.jsx("div",{className:"cp-modal-backdrop",onClick:()=>y(!1),children:e.jsxs("div",{className:"cp-modal",style:{maxWidth:420},onClick:r=>r.stopPropagation(),children:[e.jsxs("div",{className:"cp-modal-header",style:{gap:10},children:[e.jsx("span",{style:{fontSize:22},children:"📧"}),e.jsxs("div",{style:{flex:1},children:[e.jsx("div",{style:{fontSize:15,fontWeight:800,color:"var(--cp-text-h)"},children:"Email Notifications"}),e.jsx("div",{style:{fontSize:11,color:"var(--cp-text-dim)",marginTop:2},children:"Get emailed when your project has a new update"})]}),e.jsx("button",{onClick:()=>y(!1),style:{display:"flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:8,border:"1px solid var(--cp-border)",background:"var(--cp-bg-badge)",color:"var(--cp-text-dim)",cursor:"pointer"},children:e.jsx("svg",{width:"12",height:"12",viewBox:"0 0 13 13",fill:"none",children:e.jsx("path",{d:"M2 2l9 9M11 2L2 11",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]}),e.jsxs("div",{className:"cp-modal-body",style:{display:"flex",flexDirection:"column",gap:14},children:[e.jsx("p",{style:{fontSize:13,color:"var(--cp-text-muted)",lineHeight:1.7,margin:0},children:"Enter your email and we'll send you a notification whenever a new update is posted to your project."}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:6},children:[e.jsx("label",{style:{fontSize:11,fontWeight:700,color:"var(--cp-text-dim)",textTransform:"uppercase",letterSpacing:"0.07em"},children:"Your Email"}),e.jsx("input",{type:"email",value:w,onChange:r=>S(r.target.value),placeholder:"you@example.com",className:"cp-input",style:{width:"100%",padding:"11px 14px",borderRadius:10,fontSize:13,fontFamily:"inherit",border:"1.5px solid var(--cp-border)"}})]}),e.jsxs("div",{style:{display:"flex",gap:10,marginTop:4},children:[e.jsx("button",{onClick:()=>y(!1),style:{flex:1,padding:"11px 0",borderRadius:10,border:"1px solid var(--cp-border)",background:"transparent",color:"var(--cp-text-muted)",cursor:"pointer",fontSize:13,fontFamily:"inherit"},children:"Cancel"}),e.jsx("button",{onClick:ie,disabled:j,className:"cp-btn",style:{flex:1,padding:"11px 0",borderRadius:10,border:"none",background:j?"rgba(99,102,241,.2)":"linear-gradient(135deg,#6366F1,#818CF8)",color:j?"#4C5580":"white",cursor:j?"default":"pointer",fontSize:13,fontWeight:600,fontFamily:"inherit"},children:j?"Saving…":"Save"})]})]})]})}),e.jsx(ke,{client:i,isDark:o,onToggleTheme:c,onLogout:m,onOpenEmailSettings:()=>y(!0)}),e.jsxs("div",{style:{position:"relative",background:o?"linear-gradient(135deg, rgba(79,125,255,0.10) 0%, rgba(34,184,212,0.04) 60%, transparent 100%), var(--cp-bg-hero)":"linear-gradient(135deg, rgba(30,58,138,0.06) 0%, rgba(8,145,178,0.03) 60%, transparent 100%), var(--cp-bg-hero)",borderBottom:"1px solid var(--cp-border-md)",transition:"background .3s, border-color .3s",overflow:"hidden"},children:[e.jsx("div",{style:{position:"absolute",inset:0,pointerEvents:"none",opacity:.5,backgroundImage:o?"linear-gradient(rgba(140,170,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(140,170,255,0.05) 1px, transparent 1px)":"linear-gradient(rgba(30,58,138,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(30,58,138,0.05) 1px, transparent 1px)",backgroundSize:"48px 48px",maskImage:"radial-gradient(ellipse 60% 60% at 50% 0%, black 30%, transparent 100%)"}}),e.jsx("div",{className:"cp-hero-inner",style:{maxWidth:960,margin:"0 auto",padding:"32px 24px 28px",position:"relative",zIndex:1},children:e.jsxs("div",{className:"cp-hero-cols cp-fade-up",style:{display:"flex",alignItems:"center",gap:24},children:[e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:7,padding:"5px 11px",borderRadius:99,marginBottom:12,background:o?"rgba(79,125,255,0.12)":"rgba(30,58,138,0.07)",border:`1px solid ${o?"rgba(79,125,255,0.25)":"rgba(30,58,138,0.15)"}`,fontSize:10.5,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase",color:o?"#7099FF":"#1E3A8A"},children:[e.jsx("span",{style:{width:5,height:5,borderRadius:"50%",background:"#10B981",boxShadow:"0 0 8px #10B981"}}),"Client Portal"]}),e.jsxs("p",{style:{fontSize:13.5,color:"var(--cp-text-muted)",fontWeight:500,marginBottom:6},children:[ye(),", ",i.name.split(" ")[0],"! 👋"]}),e.jsx("h1",{style:{fontSize:28,fontWeight:800,color:"var(--cp-text-h)",letterSpacing:"-0.025em",lineHeight:1.15,marginBottom:10},children:i.projectName||"Your Project Dashboard"}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:14,flexWrap:"wrap",marginBottom:14},children:[i.company&&e.jsxs("span",{style:{fontSize:12.5,color:"var(--cp-text-muted)",display:"flex",alignItems:"center",gap:5,fontWeight:500},children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("rect",{x:"2",y:"5",width:"10",height:"7",rx:"1",stroke:"currentColor",strokeWidth:"1.3"}),e.jsx("path",{d:"M5 5V4a2 2 0 014 0v1",stroke:"currentColor",strokeWidth:"1.3"})]}),i.company]}),(u==null?void 0:u.createdAt)&&e.jsxs("span",{style:{fontSize:12,color:"var(--cp-text-dim)",display:"flex",alignItems:"center",gap:5},children:[e.jsxs("svg",{width:"11",height:"11",viewBox:"0 0 12 12",fill:"none",children:[e.jsx("circle",{cx:"6",cy:"6",r:"5",stroke:"currentColor",strokeWidth:"1.2"}),e.jsx("path",{d:"M6 3.5V6l1.5 1.5",stroke:"currentColor",strokeWidth:"1.2",strokeLinecap:"round"})]}),"Last updated ",_(u.createdAt)]})]}),u&&F&&e.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:8,padding:"9px 16px",borderRadius:12,background:o?"rgba(16,25,55,0.6)":"rgba(255,255,255,0.85)",border:"1px solid var(--cp-border)",fontSize:12.5,backdropFilter:"blur(8px)",boxShadow:o?"0 4px 14px rgba(0,0,0,0.3)":"0 2px 8px rgba(10,19,48,0.06)"},children:[e.jsx(K,{status:u.status,color:F.color}),e.jsx("span",{style:{color:"var(--cp-text-muted)",fontWeight:500},children:"Latest:"}),e.jsx("span",{style:{color:"var(--cp-text-h)",fontWeight:700},children:u.title}),e.jsx("span",{style:{padding:"2px 8px",borderRadius:99,background:F.bg,color:F.color,border:`1px solid ${F.border}`,fontSize:10,fontWeight:700,letterSpacing:"0.04em",textTransform:"uppercase"},children:F.label})]})]}),s.length>0&&e.jsxs("div",{className:"cp-ring-col",style:{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:6},children:[e.jsxs("div",{style:{position:"relative",width:108,height:108},children:[e.jsx(ve,{pct:D,size:108,color:o?"#4F7DFF":"#1E3A8A"}),e.jsxs("div",{style:{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"},children:[e.jsxs("span",{style:{fontSize:22,fontWeight:800,color:o?"#7099FF":"#1E3A8A",letterSpacing:"-0.02em",lineHeight:1},children:[D,"%"]}),e.jsx("span",{style:{fontSize:9,marginTop:3,color:"var(--cp-text-dim)",letterSpacing:"0.08em",textTransform:"uppercase",fontWeight:600},children:"Done"})]})]}),e.jsx("span",{style:{fontSize:10.5,color:"var(--cp-text-dim)",fontWeight:600,textAlign:"center",lineHeight:1.4,letterSpacing:"0.06em",textTransform:"uppercase"},children:"Overall Progress"})]})]})})]}),s.length>0&&e.jsx("div",{style:{borderBottom:"1px solid var(--cp-border-md)",transition:"border-color .3s"},children:e.jsx("div",{style:{maxWidth:960,margin:"0 auto",padding:"18px 20px"},children:e.jsx("div",{className:"cp-metrics-grid cp-fade-up cp-d1",style:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12},children:[{label:"Total",value:s.length,color:o?"#4F7DFF":"#1E3A8A",icon:"📋",sub:"updates"},{label:"Completed",value:oe,color:"#10B981",icon:"✅",sub:"tasks done"},{label:"In Progress",value:ne,color:"#F59E0B",icon:"⚡",sub:"active"},{label:"You Reviewed",value:ae,color:o?"#22B8D4":"#0891B2",icon:"👍",sub:"approved"}].map(({label:r,value:l,color:h,icon:L,sub:ge})=>e.jsxs("div",{className:"cp-metric",style:{background:o?"rgba(16,25,55,0.55)":"rgba(255,255,255,0.85)",border:`1px solid ${o?"rgba(190,210,255,0.10)":"rgba(15,30,80,0.08)"}`,borderRadius:14,padding:"16px 18px",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)",boxShadow:o?"0 2px 8px rgba(0,0,0,0.25)":"0 2px 8px rgba(10,19,48,0.05)",transition:"transform .18s, box-shadow .22s, border-color .18s"},onMouseEnter:T=>{const z=T.currentTarget;z.style.transform="translateY(-2px)",z.style.boxShadow=o?"0 8px 22px rgba(0,0,0,0.45)":"0 8px 22px rgba(10,19,48,0.10)",z.style.borderColor=`${h}50`},onMouseLeave:T=>{const z=T.currentTarget;z.style.transform="translateY(0)",z.style.boxShadow=o?"0 2px 8px rgba(0,0,0,0.25)":"0 2px 8px rgba(10,19,48,0.05)",z.style.borderColor=o?"rgba(190,210,255,0.10)":"rgba(15,30,80,0.08)"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8},children:[e.jsx("span",{style:{width:26,height:26,borderRadius:8,fontSize:13,background:`${h}1A`,border:`1px solid ${h}30`,display:"flex",alignItems:"center",justifyContent:"center"},children:L}),e.jsx("span",{style:{fontSize:24,fontWeight:800,color:h,letterSpacing:"-0.02em",lineHeight:1},children:l})]}),e.jsx("div",{style:{fontSize:12.5,fontWeight:700,color:"var(--cp-text-body)",letterSpacing:"-0.005em"},children:r}),e.jsx("div",{style:{fontSize:10.5,color:"var(--cp-text-dim)",marginTop:2,fontWeight:500},children:ge})]},r))})})}),e.jsx("div",{className:"cp-content",style:{maxWidth:960,margin:"0 auto",padding:"24px 20px 80px"},children:p?e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:72,gap:14},children:[e.jsx("div",{style:{width:34,height:34,borderRadius:"50%",border:"2px solid rgba(99,102,241,.15)",borderTopColor:"#6366F1",animation:"cp-spin .9s linear infinite"}}),e.jsx("span",{style:{fontSize:13,color:"var(--cp-text-dim)",fontWeight:500},children:"Loading your updates…"})]}):s.length===0?e.jsxs("div",{className:"cp-fade-up",style:{textAlign:"center",paddingTop:80},children:[e.jsx("div",{style:{width:76,height:76,borderRadius:20,background:"rgba(30,58,138,.07)",border:"1px solid rgba(99,102,241,.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,margin:"0 auto 20px"},children:"🚀"}),e.jsx("p",{style:{fontSize:18,fontWeight:700,color:"var(--cp-text-h)",marginBottom:10},children:"Your project has kicked off!"}),e.jsx("p",{style:{fontSize:14,color:"var(--cp-text-muted)",lineHeight:1.7,maxWidth:300,margin:"0 auto"},children:"Updates will appear here as the team completes work on your project."})]}):e.jsxs(e.Fragment,{children:[A>0&&!q&&e.jsxs("div",{className:"cp-alert-banner",children:[e.jsx("span",{style:{fontSize:20,flexShrink:0},children:"👀"}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("span",{style:{fontSize:13,fontWeight:700,color:"#D97706"},children:[A," ",A===1?"update needs":"updates need"," your review"]}),e.jsx("p",{style:{fontSize:12,color:"var(--cp-text-muted)",marginTop:2,lineHeight:1.5},children:`Open each update, read through it, and click "Mark as Reviewed" to let the team know you've seen it.`})]}),e.jsx("button",{onClick:()=>J(!0),style:{background:"transparent",border:"none",cursor:"pointer",color:"var(--cp-text-dim)",fontSize:18,lineHeight:1,flexShrink:0,padding:4,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center"},children:"×"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:24,flexWrap:"wrap"},children:[e.jsx("div",{className:"cp-filter-bar",style:{flex:1},children:pe.map(r=>e.jsxs("button",{className:`cp-filter-tab${n===r.key?" cp-tab-active":""}`,onClick:()=>B(r.key),children:[e.jsx("span",{children:r.icon}),r.label,r.key!=="all"&&e.jsx("span",{style:{padding:"0 5px",borderRadius:99,background:"rgba(99,102,241,.1)",fontSize:10,fontWeight:700,color:n===r.key?"#818CF8":"var(--cp-text-dim)"},children:r.key==="needs-review"?s.filter(l=>!l.clientApproved).length:r.key==="in-progress"?s.filter(l=>l.status==="in-progress").length:s.filter(l=>l.status==="completed").length})]},r.key))}),e.jsxs("div",{style:{display:"flex",gap:6,flexShrink:0},children:[e.jsxs("button",{className:`cp-view-btn${R==="sections"?" cp-tab-active":""}`,onClick:()=>H("sections"),children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 12 12",fill:"none",children:[e.jsx("rect",{x:"1",y:"1",width:"10",height:"3",rx:"1",stroke:"currentColor",strokeWidth:"1.2"}),e.jsx("rect",{x:"1",y:"5.5",width:"10",height:"3",rx:"1",stroke:"currentColor",strokeWidth:"1.2"})]}),"Sections"]}),e.jsxs("button",{className:`cp-view-btn${R==="timeline"?" cp-tab-active":""}`,onClick:()=>H("timeline"),children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 12 12",fill:"none",children:[e.jsx("circle",{cx:"2",cy:"2.5",r:"1",fill:"currentColor"}),e.jsx("line",{x1:"4",y1:"2.5",x2:"11",y2:"2.5",stroke:"currentColor",strokeWidth:"1.2",strokeLinecap:"round"}),e.jsx("circle",{cx:"2",cy:"6",r:"1",fill:"currentColor"}),e.jsx("line",{x1:"4",y1:"6",x2:"11",y2:"6",stroke:"currentColor",strokeWidth:"1.2",strokeLinecap:"round"}),e.jsx("circle",{cx:"2",cy:"9.5",r:"1",fill:"currentColor"}),e.jsx("line",{x1:"4",y1:"9.5",x2:"11",y2:"9.5",stroke:"currentColor",strokeWidth:"1.2",strokeLinecap:"round"})]}),"Timeline"]})]})]}),C.length===0&&e.jsxs("div",{className:"cp-fade-up",style:{textAlign:"center",paddingTop:48},children:[e.jsx("div",{style:{fontSize:36,marginBottom:12},children:"🔍"}),e.jsx("p",{style:{fontSize:16,fontWeight:700,color:"var(--cp-text-h)",marginBottom:8},children:"No updates match this filter"}),e.jsx("button",{onClick:()=>B("all"),style:{padding:"8px 18px",borderRadius:99,border:"1px solid rgba(99,102,241,.3)",background:"rgba(99,102,241,.08)",color:"#818CF8",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"},children:"View all updates"})]}),R==="timeline"&&C.length>0&&e.jsx("div",{className:"cp-timeline-wrap cp-fade-in",children:C.map(r=>{const l=N[r.status];return e.jsxs("div",{className:"cp-timeline-item",onClick:()=>g(r),children:[e.jsx("div",{className:"cp-timeline-dot",style:{color:r.clientApproved?"#10B981":l.color,background:r.clientApproved?"#10B981":l.color,...r.status==="in-progress"?{animation:"cp-pulse 1.8s ease infinite"}:{}}}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:6},children:[e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:4},children:[e.jsx("span",{style:{fontSize:14,fontWeight:700,color:"var(--cp-text-h)",lineHeight:1.3},children:r.title}),r.clientApproved&&e.jsx("span",{style:{fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:99,background:"rgba(16,185,129,.1)",color:"#10B981",border:"1px solid rgba(16,185,129,.2)",flexShrink:0},children:"Reviewed"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},children:[e.jsxs("span",{style:{fontSize:11,fontWeight:600,padding:"1px 8px",borderRadius:99,background:l.bg,color:l.color,border:`1px solid ${l.border}`},children:[l.emoji," ",l.label]}),r.phase&&e.jsxs("span",{style:{fontSize:11,color:"var(--cp-text-dim)"},children:["· ",r.phase]}),(()=>{const h=r.category&&r.category!=="general"?M[r.category]:M.general;return e.jsxs("span",{style:{fontSize:11,color:"var(--cp-text-dim)"},children:["· ",h.icon," ",h.label]})})()]})]}),e.jsxs("div",{style:{textAlign:"right",flexShrink:0},children:[e.jsxs("div",{style:{fontSize:13,fontWeight:800,color:r.clientApproved?"#10B981":l.color,fontFamily:"monospace"},children:[r.completionPercent,"%"]}),r.createdAt&&e.jsx("div",{style:{fontSize:10,color:"var(--cp-text-dim)",marginTop:2},children:V(r.createdAt)})]})]}),r.description&&e.jsx("p",{style:{fontSize:12,color:"var(--cp-text-muted)",lineHeight:1.65,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:1,WebkitBoxOrient:"vertical"},children:r.description})]})]},r.id)})}),R==="sections"&&C.length>0&&e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:36},children:ce.map(({key:r,items:l},h)=>e.jsx("div",{className:`cp-fade-up cp-d${Math.min(h+2,6)}`,children:e.jsx(Ce,{sectionKey:r,items:l,latestId:u==null?void 0:u.id,onCardClick:g,onApprove:P,collapsed:Q.has(r),onToggle:()=>re(r)})},r))})]})}),e.jsx("footer",{className:"cp-footer",style:{padding:"20px 24px"},children:e.jsxs("div",{style:{maxWidth:960,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("div",{style:{width:20,height:20,borderRadius:6,background:"linear-gradient(135deg,#6366F1,#818CF8)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("span",{style:{fontSize:7,fontWeight:800,color:"white"},children:"ZH"})}),e.jsxs("span",{style:{fontSize:12,color:"var(--cp-text-dim)"},children:["Powered by ",e.jsx("strong",{style:{color:"var(--cp-text-muted)"},children:"ZynHive"})]})]}),e.jsx("span",{style:{fontSize:11,color:"var(--cp-text-dimmer)"},children:"🔒 Secure Client Portal"})]})})]})}function Re(){const t=window.location.pathname.split("/")[2]??"",[o,c]=a.useState(null),[m,i]=a.useState(!0),[x,s]=a.useState(me);function d(){s(f=>(fe(!f),!f))}a.useEffect(()=>{sessionStorage.getItem(`client-auth-${t}`)==="1"&&t?E(t).then(b=>{b&&c(b)}).catch(()=>{}).finally(()=>i(!1)):i(!1)},[t]);function p(){sessionStorage.removeItem(`client-auth-${t}`),c(null)}return a.useEffect(()=>{const f=document.createElement("style");return f.textContent=".cp-show-mobile { display: none; } @media (max-width: 640px) { .cp-show-mobile { display: flex !important; } }",document.head.appendChild(f),()=>{document.head.removeChild(f)}},[]),t?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:U}),e.jsx("div",{className:"cp-root","data-cp-theme":x?"dark":"light",children:m?e.jsx(X,{}):o?e.jsx(We,{client:o,isDark:x,onToggleTheme:d,onLogout:p}):e.jsx(je,{clientId:t,onAuth:c,isDark:x,onToggleTheme:d})})]}):e.jsxs(e.Fragment,{children:[e.jsx("style",{children:U}),e.jsx("div",{className:"cp-root","data-cp-theme":x?"dark":"light",style:{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"},children:e.jsx("p",{style:{color:"var(--cp-text-muted)",fontSize:14},children:"Invalid portal link."})})]})}export{Re as ClientPage};
