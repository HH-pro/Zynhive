import{j as e,_}from"./index-ByRwMgor.js";import{r as s}from"./react-F9Y4d3HK.js";import{fetchClientById as B,fetchClientUpdates as G,fetchUpdateFeedback as L,createUpdateFeedback as Z}from"./firebase-CPuDR_US.js";const R={planning:{label:"Planning",color:"#818CF8",bg:"rgba(129,140,248,0.12)",border:"rgba(129,140,248,0.28)"},"in-progress":{label:"In Progress",color:"#F59E0B",bg:"rgba(245,158,11,0.12)",border:"rgba(245,158,11,0.32)"},review:{label:"In Review",color:"#3B82F6",bg:"rgba(59,130,246,0.12)",border:"rgba(59,130,246,0.28)"},completed:{label:"Completed",color:"#10B981",bg:"rgba(16,185,129,0.12)",border:"rgba(16,185,129,0.28)"},"on-hold":{label:"On Hold",color:"#EF4444",bg:"rgba(239,68,68,0.12)",border:"rgba(239,68,68,0.28)"}},K={seo:{label:"SEO",subtitle:"Search engine optimization",badge:"Search & Visibility",icon:"🔍",color:"#2563EB",colorLight:"#3B82F6",colorDim:"rgba(59,130,246,0.1)",colorBorder:"rgba(59,130,246,0.2)",gradHead:"linear-gradient(135deg, #1D4ED8 0%, #2563EB 60%, #3B82F6 100%)",gradBody:"linear-gradient(180deg, rgba(59,130,246,0.06) 0%, transparent 100%)"},"digital-marketing":{label:"Digital Marketing",subtitle:"Campaigns & brand growth",badge:"Marketing & Social",icon:"📣",color:"#7C3AED",colorLight:"#8B5CF6",colorDim:"rgba(139,92,246,0.1)",colorBorder:"rgba(139,92,246,0.2)",gradHead:"linear-gradient(135deg, #6D28D9 0%, #7C3AED 60%, #8B5CF6 100%)",gradBody:"linear-gradient(180deg, rgba(139,92,246,0.06) 0%, transparent 100%)"},general:{label:"General Updates",subtitle:"Project milestones & activities",badge:"Project Updates",icon:"📋",color:"#4F46E5",colorLight:"#6366F1",colorDim:"rgba(99,102,241,0.1)",colorBorder:"rgba(99,102,241,0.2)",gradHead:"linear-gradient(135deg, #4338CA 0%, #4F46E5 60%, #6366F1 100%)",gradBody:"linear-gradient(180deg, rgba(99,102,241,0.06) 0%, transparent 100%)"}};function X(){try{return localStorage.getItem("cp-theme")!=="light"}catch{return!0}}function q(t){try{localStorage.setItem("cp-theme",t?"dark":"light")}catch{}}const T=`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Dark theme ── */
  .cp-root[data-cp-theme="dark"] {
    --cp-bg:            #080C14;
    --cp-bg-nav:        rgba(8,12,20,.96);
    --cp-bg-glass:      rgba(12,18,32,.9);
    --cp-bg-card:       rgba(255,255,255,.028);
    --cp-bg-card-hover: rgba(255,255,255,.045);
    --cp-bg-card-new:   rgba(99,102,241,.06);
    --cp-bg-input:      rgba(255,255,255,.06);
    --cp-bg-badge:      rgba(255,255,255,.06);
    --cp-bg-stat:       rgba(255,255,255,.038);
    --cp-bg-hero:       rgba(10,14,26,.6);
    --cp-text-h:        #F1F5F9;
    --cp-text-body:     #CBD5E1;
    --cp-text-muted:    #64748B;
    --cp-text-dim:      #475569;
    --cp-text-dimmer:   #334155;
    --cp-border:        rgba(255,255,255,.07);
    --cp-border-md:     rgba(255,255,255,.055);
    --cp-border-div:    rgba(255,255,255,.07);
    --cp-scrollbar:     #1E293B;
    --cp-dots:          rgba(99,102,241,.065);
    --cp-glow:          rgba(99,102,241,.12);
    --cp-shadow-card:   0 2px 16px rgba(0,0,0,.4);
    --cp-shadow-lg:     0 24px 80px rgba(0,0,0,.55);
  }

  /* ── Light theme ── */
  .cp-root[data-cp-theme="light"] {
    --cp-bg:            #F1F5FB;
    --cp-bg-nav:        rgba(241,245,251,.97);
    --cp-bg-glass:      rgba(255,255,255,.94);
    --cp-bg-card:       rgba(255,255,255,.82);
    --cp-bg-card-hover: rgba(255,255,255,1);
    --cp-bg-card-new:   rgba(99,102,241,.055);
    --cp-bg-input:      rgba(0,0,0,.04);
    --cp-bg-badge:      rgba(0,0,0,.05);
    --cp-bg-stat:       rgba(255,255,255,.95);
    --cp-bg-hero:       rgba(255,255,255,.6);
    --cp-text-h:        #0F172A;
    --cp-text-body:     #1E293B;
    --cp-text-muted:    #64748B;
    --cp-text-dim:      #94A3B8;
    --cp-text-dimmer:   #CBD5E1;
    --cp-border:        rgba(0,0,0,.08);
    --cp-border-md:     rgba(0,0,0,.06);
    --cp-border-div:    rgba(0,0,0,.07);
    --cp-scrollbar:     #CBD5E1;
    --cp-dots:          rgba(99,102,241,.055);
    --cp-glow:          rgba(99,102,241,.08);
    --cp-shadow-card:   0 2px 12px rgba(99,102,241,.08);
    --cp-shadow-lg:     0 24px 80px rgba(99,102,241,.12);
  }

  .cp-root {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    min-height: 100vh;
    background: var(--cp-bg);
    color: var(--cp-text-body);
    -webkit-font-smoothing: antialiased;
    transition: background .3s, color .3s;
  }

  /* Scrollbar */
  .cp-root ::-webkit-scrollbar { width: 4px; }
  .cp-root ::-webkit-scrollbar-track { background: transparent; }
  .cp-root ::-webkit-scrollbar-thumb { background: var(--cp-scrollbar); border-radius: 99px; }

  /* Animations */
  @keyframes cp-fadeUp   { from { opacity:0; transform:translateY(18px); } to { opacity:1; transform:translateY(0); } }
  @keyframes cp-fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes cp-spin     { to { transform:rotate(360deg); } }
  @keyframes cp-pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(.88)} }
  @keyframes cp-glow     { 0%,100%{opacity:.5} 50%{opacity:1} }
  @keyframes cp-ring     { from{stroke-dashoffset:var(--ring-full)} to{stroke-dashoffset:var(--ring-val)} }
  @keyframes cp-progress { from{width:0} to{width:var(--w)} }
  @keyframes cp-shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

  .cp-fade-up { animation: cp-fadeUp .55s cubic-bezier(.16,1,.3,1) both; }
  .cp-fade-in { animation: cp-fadeIn .4s ease both; }
  .cp-d1 { animation-delay:.06s }
  .cp-d2 { animation-delay:.12s }
  .cp-d3 { animation-delay:.18s }
  .cp-d4 { animation-delay:.24s }
  .cp-d5 { animation-delay:.30s }
  .cp-d6 { animation-delay:.36s }

  /* Dot grid bg */
  .cp-dots-bg {
    background-image: radial-gradient(circle, var(--cp-dots) 1px, transparent 1px);
    background-size: 28px 28px;
  }

  /* Glass */
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

  /* Metric card */
  .cp-metric {
    background: var(--cp-bg-stat);
    border: 1px solid var(--cp-border);
    border-radius: 14px;
    padding: 18px 20px;
    flex: 1;
    min-width: 120px;
    transition: background .3s, border-color .3s, transform .2s, box-shadow .2s;
  }
  .cp-metric:hover {
    background: var(--cp-bg-card-hover);
    border-color: rgba(99,102,241,.2);
    transform: translateY(-2px);
    box-shadow: var(--cp-shadow-card);
  }

  /* ── Section container ── */
  .cp-section-wrap {
    border-radius: 20px;
    overflow: hidden;
    border: 1px solid var(--cp-border-md);
    box-shadow: var(--cp-shadow-card);
    transition: box-shadow .3s, border-color .3s;
  }
  .cp-section-wrap:hover { box-shadow: 0 8px 40px rgba(0,0,0,.18); }

  .cp-section-head {
    padding: 22px 24px 20px;
    position: relative;
    overflow: hidden;
  }
  .cp-section-head::after {
    content: "";
    position: absolute;
    top: -40px; right: -40px;
    width: 160px; height: 160px;
    border-radius: 50%;
    background: rgba(255,255,255,.06);
    pointer-events: none;
  }

  .cp-section-body {
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  /* Update card */
  .cp-update-card {
    background: var(--cp-bg-card);
    border: 1px solid var(--cp-border-md);
    border-radius: 14px;
    overflow: hidden;
    transition: background .2s, border-color .2s, transform .2s, box-shadow .2s;
  }
  .cp-update-card:hover {
    background: var(--cp-bg-card-hover);
    transform: translateY(-2px);
    box-shadow: 0 6px 24px rgba(0,0,0,.15);
  }
  .cp-update-card.is-latest {
    border-color: rgba(99,102,241,.28);
    background: var(--cp-bg-card-new);
  }

  /* Sections grid — 2 col on desktop */
  .cp-sections-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
  .cp-sections-grid.single { grid-template-columns: 1fr; }
  @media (max-width: 720px) { .cp-sections-grid { grid-template-columns: 1fr !important; } }

  /* Input */
  .cp-input {
    transition: border-color .2s, box-shadow .2s;
    background: var(--cp-bg-input) !important;
    color: var(--cp-text-h) !important;
  }
  .cp-input::placeholder { color: var(--cp-text-dim) !important; }
  .cp-input:focus { outline: none; border-color: #6366F1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,.15); }

  /* Button primary */
  .cp-btn { transition: all .2s; }
  .cp-btn:hover:not(:disabled) { opacity: .87; transform: translateY(-1px); }
  .cp-btn:active:not(:disabled) { transform: translateY(0); }

  /* Theme toggle */
  .cp-toggle {
    position: relative;
    width: 48px; height: 26px;
    border-radius: 99px;
    border: 1.5px solid var(--cp-border);
    background: var(--cp-bg-stat);
    cursor: pointer;
    overflow: hidden;
    flex-shrink: 0;
    transition: border-color .2s, box-shadow .2s, background .3s;
  }
  .cp-toggle:hover {
    border-color: #6366F1 !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,.15);
  }

  /* Logo link */
  .cp-logo-link {
    display: flex; align-items: center; gap: 8px;
    text-decoration: none; cursor: pointer;
    border-radius: 8px; padding: 3px 6px 3px 3px;
    transition: background .15s;
  }
  .cp-logo-link:hover { background: var(--cp-bg-badge); }

  /* Footer */
  .cp-footer {
    border-top: 1px solid var(--cp-border-md);
    transition: border-color .3s;
  }

  /* Update card — clickable */
  .cp-update-card { cursor: pointer; }

  /* Modal backdrop */
  .cp-modal-backdrop {
    position: fixed; inset: 0; z-index: 900;
    background: rgba(0,0,0,.62);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
    padding: 16px;
    animation: cp-fadeIn .22s ease both;
  }

  /* Modal box */
  .cp-modal {
    position: relative;
    background: var(--cp-bg-glass);
    border: 1px solid var(--cp-border);
    border-radius: 20px;
    box-shadow: var(--cp-shadow-lg);
    width: 100%; max-width: 680px;
    max-height: 90vh;
    display: flex; flex-direction: column;
    overflow: hidden;
    animation: cp-fadeUp .3s cubic-bezier(.16,1,.3,1) both;
    transition: border-radius .2s, max-width .2s, max-height .2s, border-radius .2s;
  }
  .cp-modal.is-fullscreen {
    max-width: 100vw !important;
    max-height: 100vh !important;
    width: 100vw;
    height: 100vh;
    border-radius: 0 !important;
    margin: 0 !important;
  }

  /* Modal header */
  .cp-modal-header {
    display: flex; align-items: flex-start; gap: 12;
    padding: 20px 20px 16px;
    border-bottom: 1px solid var(--cp-border-md);
    flex-shrink: 0;
  }

  /* Modal body (scrollable) */
  .cp-modal-body {
    overflow-y: auto;
    padding: 20px;
    flex: 1;
  }

  /* Modal image */
  .cp-modal-img {
    width: 100%; border-radius: 12px; display: block;
    border: 1px solid var(--cp-border-md);
    object-fit: contain;
  }
  .cp-modal.is-fullscreen .cp-modal-img {
    max-height: calc(100vh - 260px);
    object-fit: contain;
  }

  /* Feedback thread */
  .cp-feedback-msg { display: flex; flex-direction: column; gap: 3; max-width: 88%; }
  .cp-feedback-msg.from-client { align-self: flex-start; }
  .cp-feedback-msg.from-team   { align-self: flex-end; }

  /* Responsive */
  @media (max-width: 640px) {
    .cp-hide-mobile { display: none !important; }
    .cp-nav-inner   { padding: 0 16px !important; }
    .cp-hero-inner  { padding: 24px 16px 20px !important; }
    .cp-content     { padding: 0 16px 60px !important; }
    .cp-metrics-grid { grid-template-columns: 1fr 1fr !important; }
    .cp-hero-cols { flex-direction: column !important; }
    .cp-ring-col  { display: none !important; }
    .cp-modal-backdrop { padding: 0; align-items: flex-end; }
    .cp-modal { border-radius: 20px 20px 0 0; max-height: 92vh; max-width: 100%; }
  }
`;function J(t){return t.split(" ").filter(Boolean).map(o=>o[0]).join("").toUpperCase().slice(0,2)}function D(t){if(!t)return"";try{return(t!=null&&t.toDate?t.toDate():new Date(t)).toLocaleDateString("en-US",{day:"numeric",month:"long",year:"numeric"})}catch{return""}}function Q(t){if(!t)return"";try{return(t!=null&&t.toDate?t.toDate():new Date(t)).toLocaleDateString("en-US",{day:"numeric",month:"short"})}catch{return""}}function ee(){const t=new Date().getHours();return t<12?"Good morning":t<17?"Good afternoon":"Good evening"}function M({isDark:t,onToggle:o}){return e.jsxs("button",{className:"cp-toggle",onClick:o,"aria-label":t?"Switch to light mode":"Switch to dark mode",children:[e.jsxs("div",{style:{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 6px",pointerEvents:"none",fontSize:10,lineHeight:1},children:[e.jsx("span",{style:{opacity:t?.3:1,transition:"opacity .3s"},children:"☀"}),e.jsx("span",{style:{opacity:t?1:.3,transition:"opacity .3s"},children:"☽"})]}),e.jsx("div",{style:{position:"absolute",top:3,left:3,width:16,height:16,borderRadius:"50%",background:"linear-gradient(135deg,#6366F1,#818CF8)",transform:t?"translateX(22px)":"translateX(0)",transition:"transform 380ms cubic-bezier(0.16,1,0.3,1)",boxShadow:"0 1px 4px rgba(99,102,241,.4)"}})]})}function H({height:t=36,isDark:o=!0}){return e.jsx("a",{href:"/",className:"cp-logo-link","aria-label":"ZynHive — go to homepage",style:o?{}:{background:"rgba(8,11,20,.82)",borderRadius:10,padding:"4px 10px 4px 6px",backdropFilter:"blur(8px)"},children:e.jsx("img",{src:"/logo.png",alt:"ZynHive",style:{height:t,width:"auto",objectFit:"contain",display:"block"}})})}function P(){return e.jsx("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:16},children:e.jsxs("div",{style:{position:"relative",width:44,height:44},children:[e.jsx("div",{style:{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid rgba(99,102,241,.15)"}}),e.jsx("div",{style:{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid transparent",borderTopColor:"#6366F1",animation:"cp-spin .9s linear infinite"}}),e.jsx("div",{style:{position:"absolute",inset:6,borderRadius:"50%",background:"rgba(99,102,241,.1)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("span",{style:{fontSize:11,fontWeight:800,color:"#6366F1"},children:"ZH"})})]})})}function N({status:t,color:o}){return e.jsx("span",{style:{display:"inline-block",width:8,height:8,borderRadius:"50%",background:o,flexShrink:0,...t==="in-progress"?{animation:"cp-pulse 1.8s ease infinite"}:{}}})}function te({clientId:t,onAuth:o,isDark:a,onToggleTheme:d}){const[i,c]=s.useState(""),[n,b]=s.useState(!1),[g,f]=s.useState(!1),[h,m]=s.useState(""),[v,u]=s.useState(!0),[k,w]=s.useState(!1);s.useEffect(()=>{B(t).then(r=>{r||w(!0)}).catch(()=>w(!0)).finally(()=>u(!1))},[t]);async function j(r){if(r.preventDefault(),!!i.trim()){f(!0),m("");try{const x=await B(t);if(!x){m("Portal not found.");return}if(x.password!==i.trim()){m("Incorrect password. Please try again.");return}sessionStorage.setItem(`client-auth-${t}`,"1"),o(x)}catch{m("Something went wrong. Please try again.")}finally{f(!1)}}}return v?e.jsx(P,{}):k?e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:12,padding:24,textAlign:"center"},children:[e.jsx("div",{style:{width:56,height:56,borderRadius:16,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24},children:"🔍"}),e.jsx("p",{style:{fontSize:18,fontWeight:700,color:"var(--cp-text-h)"},children:"Portal not found"}),e.jsx("p",{style:{fontSize:14,color:"var(--cp-text-muted)",maxWidth:280,lineHeight:1.6},children:"This link is invalid or has been removed. Please contact your project manager."})]}):e.jsxs("div",{className:"cp-dots-bg",style:{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:"24px 16px",position:"relative"},children:[e.jsx("div",{style:{position:"fixed",top:16,right:20,zIndex:100},children:e.jsx(M,{isDark:a,onToggle:d})}),e.jsx("div",{style:{position:"fixed",top:"20%",left:"50%",transform:"translateX(-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle, var(--cp-glow) 0%, transparent 70%)",pointerEvents:"none",animation:"cp-glow 4s ease infinite"}}),e.jsxs("div",{className:"cp-fade-up",style:{width:"100%",maxWidth:420,position:"relative",zIndex:1},children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:36},children:[e.jsx("div",{style:{display:"flex",justifyContent:"center",marginBottom:24},children:e.jsx(H,{height:52,isDark:a})}),e.jsx("h1",{style:{fontSize:26,fontWeight:800,color:"var(--cp-text-h)",letterSpacing:"-0.5px",marginBottom:8},children:"Welcome Back"}),e.jsxs("p",{style:{fontSize:14,color:"var(--cp-text-muted)",lineHeight:1.65},children:["Sign in to your client portal to view",e.jsx("br",{}),"your project progress and updates."]})]}),e.jsxs("div",{className:"cp-glass",style:{borderRadius:20,padding:32,boxShadow:"var(--cp-shadow-lg)"},children:[e.jsx("div",{style:{display:"flex",gap:6,marginBottom:24,flexWrap:"wrap"},children:[{icon:"📊",text:"Live Updates"},{icon:"📈",text:"Progress Tracking"},{icon:"🔒",text:"Secure Access"}].map(({icon:r,text:x})=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:99,background:"var(--cp-bg-badge)",border:"1px solid var(--cp-border)",fontSize:11,color:"var(--cp-text-muted)"},children:[e.jsx("span",{style:{fontSize:11},children:r}),x]},x))}),e.jsxs("form",{onSubmit:j,style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",fontSize:11,fontWeight:600,color:"var(--cp-text-dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8},children:"Portal Password"}),e.jsxs("div",{style:{position:"relative"},children:[e.jsx("input",{type:n?"text":"password",value:i,onChange:r=>{c(r.target.value),m("")},placeholder:"Enter your password",autoFocus:!0,className:"cp-input",style:{width:"100%",padding:"12px 44px 12px 16px",borderRadius:12,fontSize:14,fontFamily:"inherit",border:`1.5px solid ${h?"rgba(239,68,68,.5)":"var(--cp-border)"}`}}),e.jsx("button",{type:"button",onClick:()=>b(r=>!r),style:{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--cp-text-dim)",padding:4},children:n?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 20 20",fill:"none",children:[e.jsx("path",{d:"M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"10",cy:"10",r:"2.5",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M3 3l14 14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}):e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 20 20",fill:"none",children:[e.jsx("path",{d:"M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"10",cy:"10",r:"2.5",stroke:"currentColor",strokeWidth:"1.5"})]})})]}),h&&e.jsxs("div",{style:{marginTop:8,display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#EF4444"},children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("circle",{cx:"7",cy:"7",r:"6",stroke:"currentColor",strokeWidth:"1.2"}),e.jsx("path",{d:"M7 4.5v3M7 9v.5",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round"})]}),h]})]}),e.jsx("button",{type:"submit",disabled:g||!i.trim(),className:"cp-btn",style:{width:"100%",padding:"13px 0",borderRadius:12,border:"none",background:g||!i.trim()?"rgba(99,102,241,.2)":"linear-gradient(135deg,#6366F1 0%,#818CF8 100%)",color:g||!i.trim()?"#4C5580":"white",fontSize:14,fontWeight:600,cursor:g||!i.trim()?"default":"pointer",letterSpacing:"0.01em"},children:g?e.jsxs("span",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:8},children:[e.jsx("span",{style:{width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,.2)",borderTopColor:"white",animation:"cp-spin .8s linear infinite",display:"inline-block"}}),"Verifying…"]}):"Access My Portal →"})]})]}),e.jsx("p",{style:{textAlign:"center",fontSize:11,color:"var(--cp-text-dimmer)",marginTop:20},children:"🔒 Secured by ZynHive · Need help? Contact your project manager"})]})]})}function re({client:t,isDark:o,onToggleTheme:a,onLogout:d,onOpenEmailSettings:i}){return e.jsx("nav",{className:"cp-nav",children:e.jsxs("div",{className:"cp-nav-inner",style:{maxWidth:940,margin:"0 auto",padding:"0 24px",height:60,display:"flex",alignItems:"center",gap:12},children:[e.jsx(H,{isDark:o}),e.jsx("div",{style:{width:1,height:18,background:"var(--cp-border-div)"},className:"cp-hide-mobile"}),e.jsx("span",{className:"cp-hide-mobile",style:{fontSize:12,color:"var(--cp-text-dim)",fontWeight:500},children:"Client Portal"}),e.jsx("div",{style:{flex:1}}),e.jsx(M,{isDark:o,onToggle:a}),e.jsxs("button",{onClick:i,title:"Email notification settings",style:{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:8,border:"1px solid var(--cp-border)",background:t.notificationEmail?"rgba(16,185,129,.08)":"transparent",color:t.notificationEmail?"#10B981":"var(--cp-text-dim)",cursor:"pointer",fontSize:11,transition:"all .15s"},children:[e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("rect",{x:"1",y:"3",width:"12",height:"8.5",rx:"1.5",stroke:"currentColor",strokeWidth:"1.1"}),e.jsx("path",{d:"M1 4l6 4 6-4",stroke:"currentColor",strokeWidth:"1.1",strokeLinecap:"round"})]}),e.jsx("span",{className:"cp-hide-mobile",children:t.notificationEmail?"Alerts On":"Setup Alerts"})]}),e.jsx("div",{style:{width:1,height:18,background:"var(--cp-border-div)"}}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsxs("div",{style:{textAlign:"right"},className:"cp-hide-mobile",children:[e.jsx("div",{style:{fontSize:12,fontWeight:600,color:"var(--cp-text-body)",lineHeight:1.3},children:t.name}),t.company&&e.jsx("div",{style:{fontSize:10,color:"var(--cp-text-dim)"},children:t.company})]}),e.jsx("div",{style:{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,rgba(99,102,241,.28),rgba(129,140,248,.12))",border:"1px solid rgba(99,102,241,.22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#818CF8",flexShrink:0},children:J(t.name)})]}),e.jsxs("button",{onClick:d,title:"Sign out",style:{display:"flex",alignItems:"center",gap:5,padding:"6px 10px",borderRadius:8,border:"1px solid var(--cp-border)",background:"transparent",color:"var(--cp-text-dim)",cursor:"pointer",fontSize:11,transition:"all .15s"},onMouseEnter:c=>{const n=c.currentTarget;n.style.borderColor="rgba(239,68,68,.35)",n.style.color="#EF4444",n.style.background="rgba(239,68,68,.07)"},onMouseLeave:c=>{const n=c.currentTarget;n.style.borderColor="var(--cp-border)",n.style.color="var(--cp-text-dim)",n.style.background="transparent"},children:[e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("path",{d:"M5 7h7M9.5 4.5L12 7l-2.5 2.5",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2",stroke:"currentColor",strokeWidth:"1.3",strokeLinecap:"round"})]}),e.jsx("span",{className:"cp-hide-mobile",children:"Sign out"})]})]})})}function ie({pct:t,color:o="#6366F1",size:a=100}){const d=(a-10)/2,i=2*Math.PI*d,c=i-t/100*i;return e.jsxs("svg",{width:a,height:a,style:{display:"block",transform:"rotate(-90deg)"},children:[e.jsx("circle",{cx:a/2,cy:a/2,r:d,fill:"none",stroke:"var(--cp-border)",strokeWidth:6}),e.jsx("circle",{cx:a/2,cy:a/2,r:d,fill:"none",stroke:o,strokeWidth:6,strokeLinecap:"round",strokeDasharray:i,strokeDashoffset:c,style:{transition:"stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)"}})]})}function oe({u:t,client:o,onClose:a}){const d=R[t.status],[i,c]=s.useState(!1),[n,b]=s.useState([]),[g,f]=s.useState(!0),[h,m]=s.useState(""),[v,u]=s.useState(!1),k=s.useRef(null);s.useEffect(()=>{t.id&&L(t.id).then(b).catch(()=>{}).finally(()=>f(!1))},[t.id]),s.useEffect(()=>{var r;(r=k.current)==null||r.scrollIntoView({behavior:"smooth"})},[n]);async function w(){const r=h.trim();if(!(!r||!t.id)){u(!0);try{await Z({updateId:t.id,clientId:o.id,message:r,fromClient:!0,senderName:o.name}),m(""),b(await L(t.id))}catch(x){console.error("[Feedback] send error:",x)}finally{u(!1)}}}function j(r){if(!r)return"";try{return(r!=null&&r.toDate?r.toDate():new Date(r)).toLocaleString("en-US",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}catch{return""}}return s.useEffect(()=>{function r(x){x.key==="Escape"&&a()}return window.addEventListener("keydown",r),()=>window.removeEventListener("keydown",r)},[a]),s.useEffect(()=>{const r=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=r}},[]),e.jsx("div",{className:"cp-modal-backdrop",onClick:a,children:e.jsxs("div",{className:`cp-modal${i?" is-fullscreen":""}`,onClick:r=>r.stopPropagation(),children:[e.jsxs("div",{className:"cp-modal-header",style:{gap:12},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0},children:[e.jsx("div",{style:{width:4,height:36,borderRadius:99,background:d.color,flexShrink:0}}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:4},children:[e.jsx(N,{status:t.status,color:d.color}),e.jsx("span",{style:{fontSize:16,fontWeight:800,color:"var(--cp-text-h)",lineHeight:1.3},children:t.title})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"},children:[e.jsx("span",{style:{fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:99,background:d.bg,color:d.color,border:`1px solid ${d.border}`},children:d.label}),t.phase&&e.jsxs("span",{style:{fontSize:11,color:"var(--cp-text-dim)",display:"flex",alignItems:"center",gap:3},children:[e.jsx("svg",{width:"8",height:"8",viewBox:"0 0 10 10",fill:"none",children:e.jsx("path",{d:"M2 5h6M5 2l3 3-3 3",stroke:"currentColor",strokeWidth:"1.3",strokeLinecap:"round",strokeLinejoin:"round"})}),t.phase]}),t.createdAt&&e.jsx("span",{style:{fontSize:11,color:"var(--cp-text-dim)"},children:D(t.createdAt)})]})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,flexShrink:0},children:[e.jsx("button",{onClick:()=>c(r=>!r),title:i?"Exit fullscreen":"Fullscreen",style:{display:"flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:8,border:"1px solid var(--cp-border)",background:"var(--cp-bg-badge)",color:"var(--cp-text-dim)",cursor:"pointer"},children:i?e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",children:e.jsx("path",{d:"M5 2H2v3M9 2h3v3M5 12H2V9M9 12h3V9",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"})}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",children:e.jsx("path",{d:"M2 5V2h3M9 2h3v3M2 9v3h3M12 9v3H9",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{onClick:a,title:"Close",style:{display:"flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:8,border:"1px solid var(--cp-border)",background:"var(--cp-bg-badge)",color:"var(--cp-text-dim)",cursor:"pointer"},children:e.jsx("svg",{width:"13",height:"13",viewBox:"0 0 13 13",fill:"none",children:e.jsx("path",{d:"M2 2l9 9M11 2L2 11",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]})]}),e.jsxs("div",{className:"cp-modal-body",children:[(()=>{const r=t.images&&t.images.length>0?t.images:t.imageUrl?[t.imageUrl]:[];return r.length===0?null:e.jsx("div",{style:{marginBottom:20},children:r.length===1?e.jsx("img",{src:r[0],alt:"update attachment",className:"cp-modal-img"}):e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))",gap:10},children:r.map((x,p)=>e.jsx("img",{src:x,alt:`attachment-${p+1}`,style:{width:"100%",borderRadius:10,objectFit:"cover",aspectRatio:"4/3",display:"block",border:"1px solid var(--cp-border-md)"}},p))})})})(),t.description&&e.jsx("div",{style:{marginBottom:20},children:e.jsx("p",{style:{fontSize:14,color:"var(--cp-text-body)",lineHeight:1.78},children:t.description})}),e.jsxs("div",{style:{padding:"16px",borderRadius:12,background:"var(--cp-bg-stat)",border:"1px solid var(--cp-border)",marginBottom:24},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10},children:[e.jsx("span",{style:{fontSize:12,color:"var(--cp-text-muted)",fontWeight:600},children:"Task Progress"}),e.jsxs("span",{style:{fontSize:20,fontWeight:800,color:d.color,fontFamily:"monospace"},children:[t.completionPercent,"%"]})]}),e.jsx("div",{style:{height:8,borderRadius:99,background:"var(--cp-border)",overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${t.completionPercent}%`,borderRadius:99,background:`linear-gradient(90deg, ${d.color}, ${d.color}99)`,transition:"width .9s cubic-bezier(.16,1,.3,1)"}})}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginTop:6},children:[e.jsx("span",{style:{fontSize:11,color:"var(--cp-text-dim)"},children:"Started"}),e.jsxs("span",{style:{fontSize:11,color:d.color,fontWeight:600},children:[t.completionPercent,"% complete"]})]})]}),e.jsxs("div",{style:{borderTop:"1px solid var(--cp-border-md)",paddingTop:20},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:14},children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 16 16",fill:"none",children:e.jsx("path",{d:"M2 2h12v9H9l-3 3v-3H2V2z",stroke:"var(--cp-text-muted)",strokeWidth:"1.3",strokeLinejoin:"round"})}),e.jsx("span",{style:{fontSize:13,fontWeight:700,color:"var(--cp-text-h)"},children:"Feedback"}),n.length>0&&e.jsx("span",{style:{fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:99,background:"rgba(99,102,241,.12)",color:"#818CF8",border:"1px solid rgba(99,102,241,.22)"},children:n.length})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10,marginBottom:14,maxHeight:220,overflowY:"auto",paddingRight:4},children:[g?e.jsx("div",{style:{fontSize:12,color:"var(--cp-text-dim)",padding:"8px 0"},children:"Loading…"}):n.length===0?e.jsx("div",{style:{fontSize:12,color:"var(--cp-text-dim)",padding:"6px 0",fontStyle:"italic"},children:"No feedback yet. Share your thoughts below."}):n.map(r=>e.jsxs("div",{className:`cp-feedback-msg ${r.fromClient?"from-client":"from-team"}`,children:[e.jsx("div",{style:{padding:"9px 13px",borderRadius:r.fromClient?"4px 14px 14px 14px":"14px 4px 14px 14px",background:r.fromClient?"var(--cp-bg-stat)":"rgba(99,102,241,.12)",border:`1px solid ${r.fromClient?"var(--cp-border)":"rgba(99,102,241,.22)"}`,fontSize:13,color:"var(--cp-text-body)",lineHeight:1.6},children:r.message}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:5,padding:"2px 4px"},children:[e.jsx("span",{style:{fontSize:10,fontWeight:600,color:r.fromClient?"var(--cp-text-dim)":"#818CF8"},children:r.fromClient?r.senderName||"You":r.senderName||"ZynHive Team"}),e.jsx("span",{style:{fontSize:10,color:"var(--cp-text-dimmer)"},children:j(r.createdAt)})]})]},r.id)),e.jsx("div",{ref:k})]}),e.jsxs("div",{style:{display:"flex",gap:8,alignItems:"flex-end"},children:[e.jsx("textarea",{value:h,onChange:r=>m(r.target.value),onKeyDown:r=>{r.key==="Enter"&&!r.shiftKey&&(r.preventDefault(),w())},placeholder:"Leave your feedback or ask a question…",rows:2,className:"cp-input",style:{flex:1,padding:"10px 14px",borderRadius:12,fontSize:13,fontFamily:"inherit",border:"1.5px solid var(--cp-border)",resize:"none",lineHeight:1.55}}),e.jsx("button",{onClick:w,disabled:v||!h.trim(),className:"cp-btn",style:{padding:"10px 16px",borderRadius:12,border:"none",flexShrink:0,background:v||!h.trim()?"rgba(99,102,241,.2)":"linear-gradient(135deg,#6366F1 0%,#818CF8 100%)",color:v||!h.trim()?"#4C5580":"white",fontSize:13,fontWeight:600,cursor:v||!h.trim()?"default":"pointer"},children:v?e.jsx("span",{style:{width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,.2)",borderTopColor:"white",animation:"cp-spin .8s linear infinite",display:"inline-block"}}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 16 16",fill:"none",children:e.jsx("path",{d:"M14 2L2 7l5 2 2 5L14 2z",stroke:"currentColor",strokeWidth:"1.5",strokeLinejoin:"round"})})})]}),e.jsx("p",{style:{fontSize:10,color:"var(--cp-text-dimmer)",marginTop:6},children:"Enter to send · Shift+Enter for new line"})]})]})]})})}function ne({u:t,isLatest:o,sectionColor:a,onClick:d}){const i=R[t.status];return e.jsxs("div",{className:`cp-update-card${o?" is-latest":""}`,style:{position:"relative",cursor:"pointer"},onClick:d,children:[e.jsx("div",{style:{height:3,background:`linear-gradient(90deg, ${i.color}, ${i.color}55)`,borderRadius:"14px 14px 0 0"}}),e.jsxs("div",{style:{padding:"14px 16px 15px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,marginBottom:8},children:[e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:7,marginBottom:5,flexWrap:"wrap"},children:[e.jsx(N,{status:t.status,color:i.color}),e.jsx("span",{style:{fontSize:13.5,fontWeight:700,color:"var(--cp-text-h)",lineHeight:1.35,flex:1},children:t.title})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"},children:[e.jsx("span",{style:{fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:99,background:i.bg,color:i.color,border:`1px solid ${i.border}`},children:i.label}),o&&e.jsx("span",{style:{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:99,background:"rgba(99,102,241,.12)",color:"#818CF8",border:"1px solid rgba(99,102,241,.22)",textTransform:"uppercase",letterSpacing:"0.07em"},children:"Latest"}),t.phase&&e.jsx("span",{style:{fontSize:10,color:"var(--cp-text-dim)",fontStyle:"italic"},children:t.phase})]})]}),t.createdAt&&e.jsx("span",{style:{fontSize:10,color:"var(--cp-text-dim)",flexShrink:0,marginTop:2,whiteSpace:"nowrap"},children:Q(t.createdAt)})]}),(()=>{const c=t.images&&t.images.length>0?t.images:t.imageUrl?[t.imageUrl]:[];return c.length===0?null:e.jsxs("div",{style:{position:"relative",marginBottom:10,borderRadius:8,overflow:"hidden",maxHeight:100},children:[e.jsx("img",{src:c[0],alt:"thumbnail",style:{width:"100%",height:100,objectFit:"cover",display:"block"}}),c.length>1&&e.jsxs("span",{style:{position:"absolute",bottom:6,right:6,fontSize:10,fontWeight:700,background:"rgba(0,0,0,.6)",color:"white",borderRadius:6,padding:"2px 7px"},children:["+",c.length-1," more"]})]})})(),t.description&&e.jsx("p",{style:{fontSize:12.5,color:"var(--cp-text-muted)",lineHeight:1.65,marginBottom:12,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"},children:t.description}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsx("div",{style:{flex:1,height:5,borderRadius:99,background:"var(--cp-border)",overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${t.completionPercent}%`,borderRadius:99,background:`linear-gradient(90deg, ${a}, ${a}88)`,transition:"width 1s cubic-bezier(.16,1,.3,1)"}})}),e.jsxs("span",{style:{fontSize:11,fontWeight:800,color:a,fontFamily:"monospace",flexShrink:0},children:[t.completionPercent,"%"]})]}),e.jsxs("div",{style:{marginTop:10,display:"flex",alignItems:"center",gap:4,color:"var(--cp-text-dimmer)"},children:[e.jsx("svg",{width:"10",height:"10",viewBox:"0 0 12 12",fill:"none",children:e.jsx("path",{d:"M2 6h8M6 2l4 4-4 4",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"})}),e.jsx("span",{style:{fontSize:10},children:"Click to view details & leave feedback"})]})]})]})}function F({sectionKey:t,items:o,latestId:a,onCardClick:d}){const i=K[t],c=o.filter(g=>g.status==="completed").length,n=o.filter(g=>g.status==="in-progress").length,b=o.length>0?Math.round(c/o.length*100):0;return e.jsxs("div",{className:"cp-section-wrap",style:{background:"var(--cp-bg-card)"},children:[e.jsxs("div",{className:"cp-section-head",style:{background:i.gradHead},children:[e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",gap:14,marginBottom:16,position:"relative",zIndex:1},children:[e.jsx("div",{style:{width:48,height:48,borderRadius:14,background:"rgba(255,255,255,0.18)",border:"1px solid rgba(255,255,255,0.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0,backdropFilter:"blur(8px)"},children:i.icon}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:4,flexWrap:"wrap"},children:[e.jsx("h2",{style:{fontSize:17,fontWeight:800,color:"#fff",letterSpacing:"-0.3px",margin:0},children:i.label}),e.jsx("span",{style:{fontSize:10,fontWeight:700,padding:"2px 9px",borderRadius:99,background:"rgba(255,255,255,0.18)",color:"rgba(255,255,255,0.95)",border:"1px solid rgba(255,255,255,0.25)",letterSpacing:"0.04em"},children:i.badge})]}),e.jsx("p",{style:{fontSize:12,color:"rgba(255,255,255,0.72)",margin:0,lineHeight:1.5},children:i.subtitle})]}),e.jsxs("div",{style:{textAlign:"center",background:"rgba(255,255,255,0.15)",borderRadius:12,padding:"8px 14px",border:"1px solid rgba(255,255,255,0.2)",flexShrink:0},children:[e.jsxs("div",{style:{fontSize:20,fontWeight:900,color:"#fff",fontFamily:"monospace",lineHeight:1},children:[b,"%"]}),e.jsx("div",{style:{fontSize:9,color:"rgba(255,255,255,0.7)",marginTop:2,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase"},children:"Done"})]})]}),e.jsx("div",{style:{display:"flex",gap:8,marginBottom:14,position:"relative",zIndex:1},children:[{label:"Total",value:o.length,icon:"📋"},{label:"Completed",value:c,icon:"✅"},{label:"Active",value:n,icon:"⚡"}].map(({label:g,value:f,icon:h})=>e.jsxs("div",{style:{flex:1,background:"rgba(255,255,255,0.12)",borderRadius:10,padding:"8px 10px",border:"1px solid rgba(255,255,255,0.15)",textAlign:"center"},children:[e.jsx("div",{style:{fontSize:10,marginBottom:2},children:h}),e.jsx("div",{style:{fontSize:16,fontWeight:800,color:"#fff",fontFamily:"monospace",lineHeight:1},children:f}),e.jsx("div",{style:{fontSize:9,color:"rgba(255,255,255,0.65)",marginTop:2,fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase"},children:g})]},g))}),e.jsxs("div",{style:{position:"relative",zIndex:1},children:[e.jsx("div",{style:{height:6,borderRadius:99,background:"rgba(255,255,255,0.2)",overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${b}%`,borderRadius:99,background:"rgba(255,255,255,0.9)",transition:"width 1.2s cubic-bezier(.16,1,.3,1)"}})}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginTop:6},children:[e.jsxs("span",{style:{fontSize:10,color:"rgba(255,255,255,0.65)"},children:[c," of ",o.length," completed"]}),e.jsxs("span",{style:{fontSize:10,color:"rgba(255,255,255,0.85)",fontWeight:600},children:[o.length-c," remaining"]})]})]})]}),e.jsx("div",{className:"cp-section-body",style:{background:i.gradBody},children:o.map(g=>e.jsx(ne,{u:g,isLatest:g.id===a,sectionColor:i.colorLight,onClick:()=>d(g)},g.id))})]})}function ae({client:t,isDark:o,onToggleTheme:a,onLogout:d}){const[i,c]=s.useState(t),[n,b]=s.useState([]),[g,f]=s.useState(!0),[h,m]=s.useState(null),[v,u]=s.useState(!1),[k,w]=s.useState(t.notificationEmail??""),[j,r]=s.useState(!1);s.useEffect(()=>{G(i.id).then(b).catch(()=>{}).finally(()=>f(!1))},[i.id]);async function x(){if(i.id){r(!0);try{const{updateClient:l}=await _(async()=>{const{updateClient:y}=await import("./firebase-CPuDR_US.js");return{updateClient:y}},[]);await l(i.id,{notificationEmail:k.trim()}),c(y=>({...y,notificationEmail:k.trim()})),u(!1)}catch{}finally{r(!1)}}}const p=n[0],A=n.filter(l=>l.status==="completed").length,U=n.filter(l=>l.status==="in-progress").length,$=n.filter(l=>l.status==="on-hold").length,E=(p==null?void 0:p.completionPercent)??0,O=n.filter(l=>l.category==="seo"),Y=n.filter(l=>l.category==="digital-marketing"),V=n.filter(l=>!l.category||l.category==="general"),W=[{key:"seo",items:O},{key:"digital-marketing",items:Y},{key:"general",items:V}].filter(l=>l.items.length>0),C=p?R[p.status]:null;return e.jsxs("div",{className:"cp-fade-in",style:{minHeight:"100vh"},children:[h&&e.jsx(oe,{u:h,client:i,onClose:()=>m(null)}),v&&e.jsx("div",{className:"cp-modal-backdrop",onClick:()=>u(!1),children:e.jsxs("div",{className:"cp-modal",style:{maxWidth:420},onClick:l=>l.stopPropagation(),children:[e.jsxs("div",{className:"cp-modal-header",style:{gap:10},children:[e.jsx("span",{style:{fontSize:20},children:"📧"}),e.jsxs("div",{style:{flex:1},children:[e.jsx("div",{style:{fontSize:15,fontWeight:800,color:"var(--cp-text-h)"},children:"Email Notifications"}),e.jsx("div",{style:{fontSize:11,color:"var(--cp-text-dim)",marginTop:2},children:"Get notified when a project update is added"})]}),e.jsx("button",{onClick:()=>u(!1),style:{display:"flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:8,border:"1px solid var(--cp-border)",background:"var(--cp-bg-badge)",color:"var(--cp-text-dim)",cursor:"pointer"},children:e.jsx("svg",{width:"13",height:"13",viewBox:"0 0 13 13",fill:"none",children:e.jsx("path",{d:"M2 2l9 9M11 2L2 11",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]}),e.jsxs("div",{className:"cp-modal-body",style:{display:"flex",flexDirection:"column",gap:14},children:[e.jsx("p",{style:{fontSize:12,color:"var(--cp-text-muted)",lineHeight:1.7,margin:0},children:"Enter the email address where you'd like to receive notifications whenever a new update is posted to your project."}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:6},children:[e.jsx("label",{style:{fontSize:11,fontWeight:600,color:"var(--cp-text-dim)",textTransform:"uppercase",letterSpacing:"0.07em"},children:"Notification Email"}),e.jsx("input",{type:"email",value:k,onChange:l=>w(l.target.value),placeholder:"you@example.com",className:"cp-input",style:{width:"100%",padding:"10px 14px",borderRadius:10,fontSize:13,fontFamily:"inherit",border:"1.5px solid var(--cp-border)"}})]}),e.jsxs("div",{style:{display:"flex",gap:10,marginTop:4},children:[e.jsx("button",{onClick:()=>u(!1),style:{flex:1,padding:"11px 0",borderRadius:10,border:"1px solid var(--cp-border)",background:"transparent",color:"var(--cp-text-muted)",cursor:"pointer",fontSize:13},children:"Cancel"}),e.jsx("button",{onClick:x,disabled:j,className:"cp-btn",style:{flex:1,padding:"11px 0",borderRadius:10,border:"none",background:j?"rgba(99,102,241,.2)":"linear-gradient(135deg,#6366F1,#818CF8)",color:j?"#4C5580":"white",cursor:j?"default":"pointer",fontSize:13,fontWeight:600},children:j?"Saving…":"Save"})]})]})]})}),e.jsx(re,{client:i,isDark:o,onToggleTheme:a,onLogout:d,onOpenEmailSettings:()=>u(!0)}),e.jsx("div",{style:{background:"var(--cp-bg-hero)",borderBottom:"1px solid var(--cp-border-md)",transition:"background .3s, border-color .3s"},children:e.jsx("div",{className:"cp-hero-inner",style:{maxWidth:940,margin:"0 auto",padding:"32px 24px 28px"},children:e.jsxs("div",{className:"cp-hero-cols cp-fade-up",style:{display:"flex",alignItems:"center",gap:28},children:[e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{marginBottom:12},children:[e.jsxs("p",{style:{fontSize:13,color:"var(--cp-text-dim)",fontWeight:500,marginBottom:4},children:[ee(),", ",i.name.split(" ")[0],"! 👋"]}),e.jsx("h1",{style:{fontSize:24,fontWeight:800,color:"var(--cp-text-h)",letterSpacing:"-0.5px",lineHeight:1.2,marginBottom:6},children:i.projectName||"Your Project Dashboard"}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},children:[i.company&&e.jsxs("span",{style:{fontSize:12,color:"var(--cp-text-dim)",display:"flex",alignItems:"center",gap:4},children:[e.jsxs("svg",{width:"11",height:"11",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("rect",{x:"2",y:"5",width:"10",height:"7",rx:"1",stroke:"currentColor",strokeWidth:"1.2"}),e.jsx("path",{d:"M5 5V4a2 2 0 014 0v1",stroke:"currentColor",strokeWidth:"1.2"})]}),i.company]}),(p==null?void 0:p.createdAt)&&e.jsxs("span",{style:{fontSize:11,color:"var(--cp-text-dim)",display:"flex",alignItems:"center",gap:4},children:[e.jsxs("svg",{width:"10",height:"10",viewBox:"0 0 12 12",fill:"none",children:[e.jsx("circle",{cx:"6",cy:"6",r:"5",stroke:"currentColor",strokeWidth:"1.1"}),e.jsx("path",{d:"M6 3.5V6l1.5 1.5",stroke:"currentColor",strokeWidth:"1.1",strokeLinecap:"round"})]}),"Last updated ",D(p.createdAt)]})]})]}),p&&C&&e.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:10,background:"var(--cp-bg-badge)",border:"1px solid var(--cp-border)",fontSize:12},children:[e.jsx(N,{status:p.status,color:C.color}),e.jsx("span",{style:{color:"var(--cp-text-muted)"},children:"Latest: "}),e.jsx("span",{style:{color:"var(--cp-text-h)",fontWeight:600},children:p.title}),e.jsx("span",{style:{padding:"1px 7px",borderRadius:99,background:C.bg,color:C.color,border:`1px solid ${C.border}`,fontSize:10,fontWeight:700},children:C.label})]})]}),n.length>0&&e.jsxs("div",{className:"cp-ring-col",style:{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:4},children:[e.jsxs("div",{style:{position:"relative",width:100,height:100},children:[e.jsx(ie,{pct:E,size:100,color:"#6366F1"}),e.jsx("div",{style:{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"},children:e.jsxs("span",{style:{fontSize:18,fontWeight:800,color:"#818CF8",fontFamily:"monospace",lineHeight:1},children:[E,"%"]})})]}),e.jsxs("span",{style:{fontSize:10,color:"var(--cp-text-dim)",fontWeight:500,textAlign:"center"},children:["Overall",e.jsx("br",{}),"Progress"]})]})]})})}),n.length>0&&e.jsx("div",{style:{borderBottom:"1px solid var(--cp-border-md)",transition:"border-color .3s"},children:e.jsx("div",{style:{maxWidth:940,margin:"0 auto",padding:"20px 24px"},children:e.jsx("div",{className:"cp-metrics-grid cp-fade-up cp-d1",style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:12},children:[{label:"Total Tasks",value:n.length,color:"#6366F1",icon:"📋",sub:"all activities"},{label:"Completed",value:A,color:"#10B981",icon:"✅",sub:"tasks done"},{label:"In Progress",value:U,color:"#F59E0B",icon:"⚡",sub:"active now"},{label:"On Hold",value:$,color:"#EF4444",icon:"⏸",sub:"paused"}].map(({label:l,value:y,color:z,icon:I,sub:S})=>e.jsxs("div",{className:"cp-metric",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10},children:[e.jsx("span",{style:{fontSize:18},children:I}),e.jsx("span",{style:{fontSize:22,fontWeight:800,color:z,fontFamily:"monospace",lineHeight:1},children:y})]}),e.jsx("div",{style:{fontSize:12,fontWeight:600,color:"var(--cp-text-body)"},children:l}),e.jsx("div",{style:{fontSize:10,color:"var(--cp-text-dim)",marginTop:2},children:S})]},l))})})}),e.jsx("div",{className:"cp-content",style:{maxWidth:940,margin:"0 auto",padding:"28px 24px 72px"},children:g?e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:72,gap:14},children:[e.jsx("div",{style:{width:36,height:36,borderRadius:"50%",border:"2px solid rgba(99,102,241,.15)",borderTopColor:"#6366F1",animation:"cp-spin .9s linear infinite"}}),e.jsx("span",{style:{fontSize:13,color:"var(--cp-text-dim)",fontWeight:500},children:"Loading your updates…"})]}):n.length===0?e.jsxs("div",{className:"cp-fade-up",style:{textAlign:"center",paddingTop:80},children:[e.jsx("div",{style:{width:80,height:80,borderRadius:22,background:"rgba(99,102,241,.07)",border:"1px solid rgba(99,102,241,.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 20px"},children:"🚀"}),e.jsx("p",{style:{fontSize:18,fontWeight:700,color:"var(--cp-text-h)",marginBottom:10},children:"Work in progress!"}),e.jsx("p",{style:{fontSize:14,color:"var(--cp-text-muted)",lineHeight:1.7,maxWidth:320,margin:"0 auto"},children:"Your project has been kicked off. Updates will appear here as work is completed."})]}):(()=>{const l=W.find(S=>S.key==="seo"),y=W.find(S=>S.key==="digital-marketing"),z=W.find(S=>S.key==="general"),I=!!(l&&y);return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:20},children:[(l||y)&&e.jsxs("div",{className:`cp-sections-grid cp-fade-up cp-d1${I?"":" single"}`,children:[l&&e.jsx(F,{sectionKey:"seo",items:l.items,latestId:p==null?void 0:p.id,onCardClick:m}),y&&e.jsx(F,{sectionKey:"digital-marketing",items:y.items,latestId:p==null?void 0:p.id,onCardClick:m})]}),z&&e.jsx("div",{className:"cp-fade-up cp-d2",children:e.jsx(F,{sectionKey:"general",items:z.items,latestId:p==null?void 0:p.id,onCardClick:m})})]})})()}),e.jsx("footer",{className:"cp-footer",style:{padding:"22px 24px"},children:e.jsxs("div",{style:{maxWidth:940,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("div",{style:{width:22,height:22,borderRadius:7,background:"linear-gradient(135deg,#6366F1,#818CF8)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("span",{style:{fontSize:8,fontWeight:800,color:"white"},children:"ZH"})}),e.jsxs("span",{style:{fontSize:12,color:"var(--cp-text-dim)"},children:["Powered by ",e.jsx("strong",{style:{color:"var(--cp-text-muted)"},children:"ZynHive"})," · Your Digital Growth Partner"]})]}),e.jsx("span",{style:{fontSize:11,color:"var(--cp-text-dimmer)"},children:"🔒 Secure Client Portal"})]})})]})}function ce(){const t=window.location.pathname.split("/")[2]??"",[o,a]=s.useState(null),[d,i]=s.useState(!0),[c,n]=s.useState(X);function b(){n(f=>(q(!f),!f))}s.useEffect(()=>{sessionStorage.getItem(`client-auth-${t}`)==="1"&&t?B(t).then(h=>{h&&a(h)}).catch(()=>{}).finally(()=>i(!1)):i(!1)},[t]);function g(){sessionStorage.removeItem(`client-auth-${t}`),a(null)}return t?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:T}),e.jsx("div",{className:"cp-root","data-cp-theme":c?"dark":"light",children:d?e.jsx(P,{}):o?e.jsx(ae,{client:o,isDark:c,onToggleTheme:b,onLogout:g}):e.jsx(te,{clientId:t,onAuth:a,isDark:c,onToggleTheme:b})})]}):e.jsxs(e.Fragment,{children:[e.jsx("style",{children:T}),e.jsx("div",{className:"cp-root","data-cp-theme":c?"dark":"light",style:{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"},children:e.jsx("p",{style:{color:"var(--cp-text-muted)",fontSize:14},children:"Invalid portal link."})})]})}export{ce as ClientPage};
