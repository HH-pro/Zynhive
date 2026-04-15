import{j as e}from"./index-Dc-n5F_v.js";import{r as d}from"./react-F9Y4d3HK.js";import{x as w,n as N}from"./firebase-D6-ONEhV.js";const C={planning:{label:"Planning",color:"#818CF8",bg:"rgba(129,140,248,0.12)",border:"rgba(129,140,248,0.28)"},"in-progress":{label:"In Progress",color:"#F59E0B",bg:"rgba(245,158,11,0.12)",border:"rgba(245,158,11,0.32)"},review:{label:"In Review",color:"#3B82F6",bg:"rgba(59,130,246,0.12)",border:"rgba(59,130,246,0.28)"},completed:{label:"Completed",color:"#10B981",bg:"rgba(16,185,129,0.12)",border:"rgba(16,185,129,0.28)"},"on-hold":{label:"On Hold",color:"#EF4444",bg:"rgba(239,68,68,0.12)",border:"rgba(239,68,68,0.28)"}},R={seo:{label:"SEO",subtitle:"Search engine optimization — improving your visibility on Google",icon:"🔍",color:"#3B82F6",colorDim:"rgba(59,130,246,0.14)",colorBorder:"rgba(59,130,246,0.22)",grad:"linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.03) 100%)"},"digital-marketing":{label:"Digital Marketing",subtitle:"Campaigns, social media, ads & brand growth activities",icon:"📣",color:"#8B5CF6",colorDim:"rgba(139,92,246,0.14)",colorBorder:"rgba(139,92,246,0.22)",grad:"linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.03) 100%)"},general:{label:"General Updates",subtitle:"Project milestones and other activities",icon:"📋",color:"#6366F1",colorDim:"rgba(99,102,241,0.14)",colorBorder:"rgba(99,102,241,0.22)",grad:"linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.03) 100%)"}};function D(){try{return localStorage.getItem("cp-theme")!=="light"}catch{return!0}}function P(t){try{localStorage.setItem("cp-theme",t?"dark":"light")}catch{}}const S=`
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

  /* Section banner */
  .cp-section-banner {
    border-radius: 16px;
    border: 1px solid var(--cp-border-md);
    padding: 20px 24px;
    margin-bottom: 16px;
    transition: background .3s, border-color .3s;
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
    transform: translateY(-1px);
    box-shadow: var(--cp-shadow-card);
  }
  .cp-update-card.is-latest {
    border-color: rgba(99,102,241,.22);
    background: var(--cp-bg-card-new);
  }

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

  /* Responsive */
  @media (max-width: 640px) {
    .cp-hide-mobile { display: none !important; }
    .cp-nav-inner   { padding: 0 16px !important; }
    .cp-hero-inner  { padding: 24px 16px 20px !important; }
    .cp-content     { padding: 0 16px 60px !important; }
    .cp-metrics-grid { grid-template-columns: 1fr 1fr !important; }
    .cp-hero-cols { flex-direction: column !important; }
    .cp-ring-col  { display: none !important; }
  }
`;function H(t){return t.split(" ").filter(Boolean).map(i=>i[0]).join("").toUpperCase().slice(0,2)}function L(t){if(!t)return"";try{return(t!=null&&t.toDate?t.toDate():new Date(t)).toLocaleDateString("en-US",{day:"numeric",month:"long",year:"numeric"})}catch{return""}}function E(t){if(!t)return"";try{return(t!=null&&t.toDate?t.toDate():new Date(t)).toLocaleDateString("en-US",{day:"numeric",month:"short"})}catch{return""}}function M(){const t=new Date().getHours();return t<12?"Good morning":t<17?"Good afternoon":"Good evening"}function z({isDark:t,onToggle:i}){return e.jsxs("button",{className:"cp-toggle",onClick:i,"aria-label":t?"Switch to light mode":"Switch to dark mode",children:[e.jsxs("div",{style:{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 6px",pointerEvents:"none",fontSize:10,lineHeight:1},children:[e.jsx("span",{style:{opacity:t?.3:1,transition:"opacity .3s"},children:"☀"}),e.jsx("span",{style:{opacity:t?1:.3,transition:"opacity .3s"},children:"☽"})]}),e.jsx("div",{style:{position:"absolute",top:3,left:3,width:16,height:16,borderRadius:"50%",background:"linear-gradient(135deg,#6366F1,#818CF8)",transform:t?"translateX(22px)":"translateX(0)",transition:"transform 380ms cubic-bezier(0.16,1,0.3,1)",boxShadow:"0 1px 4px rgba(99,102,241,.4)"}})]})}function W({height:t=36,isDark:i=!0}){return e.jsx("a",{href:"/",className:"cp-logo-link","aria-label":"ZynHive — go to homepage",style:i?{}:{background:"rgba(8,11,20,.82)",borderRadius:10,padding:"4px 10px 4px 6px",backdropFilter:"blur(8px)"},children:e.jsx("img",{src:"/logo.png",alt:"ZynHive",style:{height:t,width:"auto",objectFit:"contain",display:"block"}})})}function I(){return e.jsx("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:16},children:e.jsxs("div",{style:{position:"relative",width:44,height:44},children:[e.jsx("div",{style:{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid rgba(99,102,241,.15)"}}),e.jsx("div",{style:{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid transparent",borderTopColor:"#6366F1",animation:"cp-spin .9s linear infinite"}}),e.jsx("div",{style:{position:"absolute",inset:6,borderRadius:"50%",background:"rgba(99,102,241,.1)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("span",{style:{fontSize:11,fontWeight:800,color:"#6366F1"},children:"ZH"})})]})})}function B({status:t,color:i}){return e.jsx("span",{style:{display:"inline-block",width:8,height:8,borderRadius:"50%",background:i,flexShrink:0,...t==="in-progress"?{animation:"cp-pulse 1.8s ease infinite"}:{}}})}function A({clientId:t,onAuth:i,isDark:s,onToggleTheme:r}){const[o,l]=d.useState(""),[p,b]=d.useState(!1),[a,g]=d.useState(!1),[h,x]=d.useState(""),[m,f]=d.useState(!0),[y,u]=d.useState(!1);d.useEffect(()=>{w(t).then(c=>{c||u(!0)}).catch(()=>u(!0)).finally(()=>f(!1))},[t]);async function v(c){if(c.preventDefault(),!!o.trim()){g(!0),x("");try{const n=await w(t);if(!n){x("Portal not found.");return}if(n.password!==o.trim()){x("Incorrect password. Please try again.");return}sessionStorage.setItem(`client-auth-${t}`,"1"),i(n)}catch{x("Something went wrong. Please try again.")}finally{g(!1)}}}return m?e.jsx(I,{}):y?e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:12,padding:24,textAlign:"center"},children:[e.jsx("div",{style:{width:56,height:56,borderRadius:16,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24},children:"🔍"}),e.jsx("p",{style:{fontSize:18,fontWeight:700,color:"var(--cp-text-h)"},children:"Portal not found"}),e.jsx("p",{style:{fontSize:14,color:"var(--cp-text-muted)",maxWidth:280,lineHeight:1.6},children:"This link is invalid or has been removed. Please contact your project manager."})]}):e.jsxs("div",{className:"cp-dots-bg",style:{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:"24px 16px",position:"relative"},children:[e.jsx("div",{style:{position:"fixed",top:16,right:20,zIndex:100},children:e.jsx(z,{isDark:s,onToggle:r})}),e.jsx("div",{style:{position:"fixed",top:"20%",left:"50%",transform:"translateX(-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle, var(--cp-glow) 0%, transparent 70%)",pointerEvents:"none",animation:"cp-glow 4s ease infinite"}}),e.jsxs("div",{className:"cp-fade-up",style:{width:"100%",maxWidth:420,position:"relative",zIndex:1},children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:36},children:[e.jsx("div",{style:{display:"flex",justifyContent:"center",marginBottom:24},children:e.jsx(W,{height:52,isDark:s})}),e.jsx("h1",{style:{fontSize:26,fontWeight:800,color:"var(--cp-text-h)",letterSpacing:"-0.5px",marginBottom:8},children:"Welcome Back"}),e.jsxs("p",{style:{fontSize:14,color:"var(--cp-text-muted)",lineHeight:1.65},children:["Sign in to your client portal to view",e.jsx("br",{}),"your project progress and updates."]})]}),e.jsxs("div",{className:"cp-glass",style:{borderRadius:20,padding:32,boxShadow:"var(--cp-shadow-lg)"},children:[e.jsx("div",{style:{display:"flex",gap:6,marginBottom:24,flexWrap:"wrap"},children:[{icon:"📊",text:"Live Updates"},{icon:"📈",text:"Progress Tracking"},{icon:"🔒",text:"Secure Access"}].map(({icon:c,text:n})=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:99,background:"var(--cp-bg-badge)",border:"1px solid var(--cp-border)",fontSize:11,color:"var(--cp-text-muted)"},children:[e.jsx("span",{style:{fontSize:11},children:c}),n]},n))}),e.jsxs("form",{onSubmit:v,style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",fontSize:11,fontWeight:600,color:"var(--cp-text-dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8},children:"Portal Password"}),e.jsxs("div",{style:{position:"relative"},children:[e.jsx("input",{type:p?"text":"password",value:o,onChange:c=>{l(c.target.value),x("")},placeholder:"Enter your password",autoFocus:!0,className:"cp-input",style:{width:"100%",padding:"12px 44px 12px 16px",borderRadius:12,fontSize:14,fontFamily:"inherit",border:`1.5px solid ${h?"rgba(239,68,68,.5)":"var(--cp-border)"}`}}),e.jsx("button",{type:"button",onClick:()=>b(c=>!c),style:{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--cp-text-dim)",padding:4},children:p?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 20 20",fill:"none",children:[e.jsx("path",{d:"M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"10",cy:"10",r:"2.5",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M3 3l14 14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}):e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 20 20",fill:"none",children:[e.jsx("path",{d:"M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"10",cy:"10",r:"2.5",stroke:"currentColor",strokeWidth:"1.5"})]})})]}),h&&e.jsxs("div",{style:{marginTop:8,display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#EF4444"},children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("circle",{cx:"7",cy:"7",r:"6",stroke:"currentColor",strokeWidth:"1.2"}),e.jsx("path",{d:"M7 4.5v3M7 9v.5",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round"})]}),h]})]}),e.jsx("button",{type:"submit",disabled:a||!o.trim(),className:"cp-btn",style:{width:"100%",padding:"13px 0",borderRadius:12,border:"none",background:a||!o.trim()?"rgba(99,102,241,.2)":"linear-gradient(135deg,#6366F1 0%,#818CF8 100%)",color:a||!o.trim()?"#4C5580":"white",fontSize:14,fontWeight:600,cursor:a||!o.trim()?"default":"pointer",letterSpacing:"0.01em"},children:a?e.jsxs("span",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:8},children:[e.jsx("span",{style:{width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,.2)",borderTopColor:"white",animation:"cp-spin .8s linear infinite",display:"inline-block"}}),"Verifying…"]}):"Access My Portal →"})]})]}),e.jsx("p",{style:{textAlign:"center",fontSize:11,color:"var(--cp-text-dimmer)",marginTop:20},children:"🔒 Secured by ZynHive · Need help? Contact your project manager"})]})]})}function U({client:t,isDark:i,onToggleTheme:s,onLogout:r}){return e.jsx("nav",{className:"cp-nav",children:e.jsxs("div",{className:"cp-nav-inner",style:{maxWidth:940,margin:"0 auto",padding:"0 24px",height:60,display:"flex",alignItems:"center",gap:12},children:[e.jsx(W,{isDark:i}),e.jsx("div",{style:{width:1,height:18,background:"var(--cp-border-div)"},className:"cp-hide-mobile"}),e.jsx("span",{className:"cp-hide-mobile",style:{fontSize:12,color:"var(--cp-text-dim)",fontWeight:500},children:"Client Portal"}),e.jsx("div",{style:{flex:1}}),e.jsx(z,{isDark:i,onToggle:s}),e.jsx("div",{style:{width:1,height:18,background:"var(--cp-border-div)"}}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsxs("div",{style:{textAlign:"right"},className:"cp-hide-mobile",children:[e.jsx("div",{style:{fontSize:12,fontWeight:600,color:"var(--cp-text-body)",lineHeight:1.3},children:t.name}),t.company&&e.jsx("div",{style:{fontSize:10,color:"var(--cp-text-dim)"},children:t.company})]}),e.jsx("div",{style:{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,rgba(99,102,241,.28),rgba(129,140,248,.12))",border:"1px solid rgba(99,102,241,.22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#818CF8",flexShrink:0},children:H(t.name)})]}),e.jsxs("button",{onClick:r,title:"Sign out",style:{display:"flex",alignItems:"center",gap:5,padding:"6px 10px",borderRadius:8,border:"1px solid var(--cp-border)",background:"transparent",color:"var(--cp-text-dim)",cursor:"pointer",fontSize:11,transition:"all .15s"},onMouseEnter:o=>{const l=o.currentTarget;l.style.borderColor="rgba(239,68,68,.35)",l.style.color="#EF4444",l.style.background="rgba(239,68,68,.07)"},onMouseLeave:o=>{const l=o.currentTarget;l.style.borderColor="var(--cp-border)",l.style.color="var(--cp-text-dim)",l.style.background="transparent"},children:[e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("path",{d:"M5 7h7M9.5 4.5L12 7l-2.5 2.5",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2",stroke:"currentColor",strokeWidth:"1.3",strokeLinecap:"round"})]}),e.jsx("span",{className:"cp-hide-mobile",children:"Sign out"})]})]})})}function $({pct:t,color:i="#6366F1",size:s=100}){const r=(s-10)/2,o=2*Math.PI*r,l=o-t/100*o;return e.jsxs("svg",{width:s,height:s,style:{display:"block",transform:"rotate(-90deg)"},children:[e.jsx("circle",{cx:s/2,cy:s/2,r,fill:"none",stroke:"var(--cp-border)",strokeWidth:6}),e.jsx("circle",{cx:s/2,cy:s/2,r,fill:"none",stroke:i,strokeWidth:6,strokeLinecap:"round",strokeDasharray:o,strokeDashoffset:l,style:{transition:"stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)"}})]})}function Y({u:t,isLatest:i,sectionColor:s}){const r=C[t.status];return e.jsxs("div",{className:`cp-update-card${i?" is-latest":""}`,style:{position:"relative"},children:[e.jsx("div",{style:{position:"absolute",top:0,left:0,width:3,height:"100%",background:r.color,borderRadius:"14px 0 0 14px"}}),e.jsxs("div",{style:{padding:"18px 20px 18px 22px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:10},children:[e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6},children:[e.jsx(B,{status:t.status,color:r.color}),e.jsx("span",{style:{fontSize:15,fontWeight:700,color:"var(--cp-text-h)",lineHeight:1.3},children:t.title}),i&&e.jsx("span",{style:{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:99,background:"rgba(99,102,241,.15)",color:"#818CF8",border:"1px solid rgba(99,102,241,.25)",textTransform:"uppercase",letterSpacing:"0.07em",flexShrink:0},children:"Latest"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},children:[e.jsx("span",{style:{fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:99,background:r.bg,color:r.color,border:`1px solid ${r.border}`},children:r.label}),t.phase&&e.jsxs("span",{style:{fontSize:11,color:"var(--cp-text-dim)",display:"flex",alignItems:"center",gap:3},children:[e.jsx("svg",{width:"8",height:"8",viewBox:"0 0 10 10",fill:"none",children:e.jsx("path",{d:"M2 5h6M5 2l3 3-3 3",stroke:"currentColor",strokeWidth:"1.3",strokeLinecap:"round",strokeLinejoin:"round"})}),t.phase]})]})]}),t.createdAt&&e.jsx("span",{style:{fontSize:11,color:"var(--cp-text-dim)",flexShrink:0,marginTop:2},children:E(t.createdAt)})]}),t.description&&e.jsx("p",{style:{fontSize:13.5,color:"var(--cp-text-muted)",lineHeight:1.72,marginBottom:14},children:t.description}),t.imageUrl&&e.jsx("div",{style:{marginBottom:14},children:e.jsx("img",{src:t.imageUrl,alt:"update attachment",style:{width:"100%",borderRadius:10,display:"block",border:"1px solid var(--cp-border-md)",maxHeight:300,objectFit:"cover"}})}),e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6},children:[e.jsx("span",{style:{fontSize:11,color:"var(--cp-text-dim)",fontWeight:500},children:"Task Progress"}),e.jsxs("span",{style:{fontSize:12,fontWeight:800,color:r.color,fontFamily:"monospace"},children:[t.completionPercent,"%"]})]}),e.jsx("div",{style:{height:6,borderRadius:99,background:"var(--cp-border)",overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${t.completionPercent}%`,borderRadius:99,background:`linear-gradient(90deg, ${r.color}, ${r.color}99)`,transition:"width .9s cubic-bezier(.16,1,.3,1)"}})})]})]})]})}function G({sectionKey:t,items:i,latestId:s}){const r=R[t],o=i.filter(p=>p.status==="completed").length,l=i.length>0?Math.round(o/i.length*100):0;return e.jsxs("div",{children:[e.jsxs("div",{className:"cp-section-banner",style:{background:r.grad},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:14},children:[e.jsx("div",{style:{width:44,height:44,borderRadius:12,background:r.colorDim,border:`1px solid ${r.colorBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0},children:r.icon}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:3,flexWrap:"wrap"},children:[e.jsx("h2",{style:{fontSize:16,fontWeight:800,color:"var(--cp-text-h)",letterSpacing:"-0.2px"},children:r.label}),e.jsxs("span",{style:{fontSize:10,fontWeight:700,padding:"2px 9px",borderRadius:99,background:r.colorDim,color:r.color,border:`1px solid ${r.colorBorder}`},children:[i.length," ",i.length===1?"task":"tasks"]})]}),e.jsx("p",{style:{fontSize:12,color:"var(--cp-text-muted)",lineHeight:1.5},children:r.subtitle})]}),e.jsxs("div",{style:{textAlign:"center",flexShrink:0},className:"cp-hide-mobile",children:[e.jsxs("div",{style:{fontSize:18,fontWeight:800,color:r.color,fontFamily:"monospace",lineHeight:1},children:[l,"%"]}),e.jsx("div",{style:{fontSize:10,color:"var(--cp-text-dim)",marginTop:2},children:"done"})]})]}),e.jsxs("div",{style:{marginTop:14},children:[e.jsx("div",{style:{height:4,borderRadius:99,background:"var(--cp-border)",overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${l}%`,borderRadius:99,background:`linear-gradient(90deg, ${r.color}, ${r.color}99)`,transition:"width 1s cubic-bezier(.16,1,.3,1)"}})}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginTop:5},children:[e.jsxs("span",{style:{fontSize:10,color:"var(--cp-text-dim)"},children:[o," of ",i.length," completed"]}),e.jsxs("span",{style:{fontSize:10,color:r.color,fontWeight:600},children:[i.length-o," remaining"]})]})]})]}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:10},children:i.map(p=>e.jsx(Y,{u:p,isLatest:p.id===s,sectionColor:r.color},p.id))})]})}function O({client:t,isDark:i,onToggleTheme:s,onLogout:r}){const[o,l]=d.useState([]),[p,b]=d.useState(!0);d.useEffect(()=>{N(t.id).then(l).catch(()=>{}).finally(()=>b(!1))},[t.id]);const a=o[0],g=o.filter(n=>n.status==="completed").length,h=o.filter(n=>n.status==="in-progress").length,x=o.filter(n=>n.status==="on-hold").length,m=(a==null?void 0:a.completionPercent)??0,f=o.filter(n=>n.category==="seo"),y=o.filter(n=>n.category==="digital-marketing"),u=o.filter(n=>!n.category||n.category==="general"),v=[{key:"seo",items:f},{key:"digital-marketing",items:y},{key:"general",items:u}].filter(n=>n.items.length>0),c=a?C[a.status]:null;return e.jsxs("div",{className:"cp-fade-in",style:{minHeight:"100vh"},children:[e.jsx(U,{client:t,isDark:i,onToggleTheme:s,onLogout:r}),e.jsx("div",{style:{background:"var(--cp-bg-hero)",borderBottom:"1px solid var(--cp-border-md)",transition:"background .3s, border-color .3s"},children:e.jsx("div",{className:"cp-hero-inner",style:{maxWidth:940,margin:"0 auto",padding:"32px 24px 28px"},children:e.jsxs("div",{className:"cp-hero-cols cp-fade-up",style:{display:"flex",alignItems:"center",gap:28},children:[e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{marginBottom:12},children:[e.jsxs("p",{style:{fontSize:13,color:"var(--cp-text-dim)",fontWeight:500,marginBottom:4},children:[M(),", ",t.name.split(" ")[0],"! 👋"]}),e.jsx("h1",{style:{fontSize:24,fontWeight:800,color:"var(--cp-text-h)",letterSpacing:"-0.5px",lineHeight:1.2,marginBottom:6},children:t.projectName||"Your Project Dashboard"}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},children:[t.company&&e.jsxs("span",{style:{fontSize:12,color:"var(--cp-text-dim)",display:"flex",alignItems:"center",gap:4},children:[e.jsxs("svg",{width:"11",height:"11",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("rect",{x:"2",y:"5",width:"10",height:"7",rx:"1",stroke:"currentColor",strokeWidth:"1.2"}),e.jsx("path",{d:"M5 5V4a2 2 0 014 0v1",stroke:"currentColor",strokeWidth:"1.2"})]}),t.company]}),(a==null?void 0:a.createdAt)&&e.jsxs("span",{style:{fontSize:11,color:"var(--cp-text-dim)",display:"flex",alignItems:"center",gap:4},children:[e.jsxs("svg",{width:"10",height:"10",viewBox:"0 0 12 12",fill:"none",children:[e.jsx("circle",{cx:"6",cy:"6",r:"5",stroke:"currentColor",strokeWidth:"1.1"}),e.jsx("path",{d:"M6 3.5V6l1.5 1.5",stroke:"currentColor",strokeWidth:"1.1",strokeLinecap:"round"})]}),"Last updated ",L(a.createdAt)]})]})]}),a&&c&&e.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:10,background:"var(--cp-bg-badge)",border:"1px solid var(--cp-border)",fontSize:12},children:[e.jsx(B,{status:a.status,color:c.color}),e.jsx("span",{style:{color:"var(--cp-text-muted)"},children:"Latest: "}),e.jsx("span",{style:{color:"var(--cp-text-h)",fontWeight:600},children:a.title}),e.jsx("span",{style:{padding:"1px 7px",borderRadius:99,background:c.bg,color:c.color,border:`1px solid ${c.border}`,fontSize:10,fontWeight:700},children:c.label})]})]}),o.length>0&&e.jsxs("div",{className:"cp-ring-col",style:{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:4},children:[e.jsxs("div",{style:{position:"relative",width:100,height:100},children:[e.jsx($,{pct:m,size:100,color:"#6366F1"}),e.jsx("div",{style:{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"},children:e.jsxs("span",{style:{fontSize:18,fontWeight:800,color:"#818CF8",fontFamily:"monospace",lineHeight:1},children:[m,"%"]})})]}),e.jsxs("span",{style:{fontSize:10,color:"var(--cp-text-dim)",fontWeight:500,textAlign:"center"},children:["Overall",e.jsx("br",{}),"Progress"]})]})]})})}),o.length>0&&e.jsx("div",{style:{borderBottom:"1px solid var(--cp-border-md)",transition:"border-color .3s"},children:e.jsx("div",{style:{maxWidth:940,margin:"0 auto",padding:"20px 24px"},children:e.jsx("div",{className:"cp-metrics-grid cp-fade-up cp-d1",style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:12},children:[{label:"Total Tasks",value:o.length,color:"#6366F1",icon:"📋",sub:"all activities"},{label:"Completed",value:g,color:"#10B981",icon:"✅",sub:"tasks done"},{label:"In Progress",value:h,color:"#F59E0B",icon:"⚡",sub:"active now"},{label:"On Hold",value:x,color:"#EF4444",icon:"⏸",sub:"paused"}].map(({label:n,value:j,color:k,icon:F,sub:T})=>e.jsxs("div",{className:"cp-metric",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10},children:[e.jsx("span",{style:{fontSize:18},children:F}),e.jsx("span",{style:{fontSize:22,fontWeight:800,color:k,fontFamily:"monospace",lineHeight:1},children:j})]}),e.jsx("div",{style:{fontSize:12,fontWeight:600,color:"var(--cp-text-body)"},children:n}),e.jsx("div",{style:{fontSize:10,color:"var(--cp-text-dim)",marginTop:2},children:T})]},n))})})}),e.jsx("div",{className:"cp-content",style:{maxWidth:940,margin:"0 auto",padding:"28px 24px 72px"},children:p?e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:72,gap:14},children:[e.jsx("div",{style:{width:36,height:36,borderRadius:"50%",border:"2px solid rgba(99,102,241,.15)",borderTopColor:"#6366F1",animation:"cp-spin .9s linear infinite"}}),e.jsx("span",{style:{fontSize:13,color:"var(--cp-text-dim)",fontWeight:500},children:"Loading your updates…"})]}):o.length===0?e.jsxs("div",{className:"cp-fade-up",style:{textAlign:"center",paddingTop:80},children:[e.jsx("div",{style:{width:80,height:80,borderRadius:22,background:"rgba(99,102,241,.07)",border:"1px solid rgba(99,102,241,.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 20px"},children:"🚀"}),e.jsx("p",{style:{fontSize:18,fontWeight:700,color:"var(--cp-text-h)",marginBottom:10},children:"Work in progress!"}),e.jsx("p",{style:{fontSize:14,color:"var(--cp-text-muted)",lineHeight:1.7,maxWidth:320,margin:"0 auto"},children:"Your project has been kicked off. Updates will appear here as work is completed."})]}):e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:40},children:v.map(({key:n,items:j},k)=>e.jsx("div",{className:`cp-fade-up cp-d${Math.min(k+2,6)}`,children:e.jsx(G,{sectionKey:n,items:j,latestId:a==null?void 0:a.id})},n))})}),e.jsx("footer",{className:"cp-footer",style:{padding:"22px 24px"},children:e.jsxs("div",{style:{maxWidth:940,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("div",{style:{width:22,height:22,borderRadius:7,background:"linear-gradient(135deg,#6366F1,#818CF8)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("span",{style:{fontSize:8,fontWeight:800,color:"white"},children:"ZH"})}),e.jsxs("span",{style:{fontSize:12,color:"var(--cp-text-dim)"},children:["Powered by ",e.jsx("strong",{style:{color:"var(--cp-text-muted)"},children:"ZynHive"})," · Your Digital Growth Partner"]})]}),e.jsx("span",{style:{fontSize:11,color:"var(--cp-text-dimmer)"},children:"🔒 Secure Client Portal"})]})})]})}function _(){const t=window.location.pathname.split("/")[2]??"",[i,s]=d.useState(null),[r,o]=d.useState(!0),[l,p]=d.useState(D);function b(){p(g=>(P(!g),!g))}d.useEffect(()=>{sessionStorage.getItem(`client-auth-${t}`)==="1"&&t?w(t).then(h=>{h&&s(h)}).catch(()=>{}).finally(()=>o(!1)):o(!1)},[t]);function a(){sessionStorage.removeItem(`client-auth-${t}`),s(null)}return t?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:S}),e.jsx("div",{className:"cp-root","data-cp-theme":l?"dark":"light",children:r?e.jsx(I,{}):i?e.jsx(O,{client:i,isDark:l,onToggleTheme:b,onLogout:a}):e.jsx(A,{clientId:t,onAuth:s,isDark:l,onToggleTheme:b})})]}):e.jsxs(e.Fragment,{children:[e.jsx("style",{children:S}),e.jsx("div",{className:"cp-root","data-cp-theme":l?"dark":"light",style:{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"},children:e.jsx("p",{style:{color:"var(--cp-text-muted)",fontSize:14},children:"Invalid portal link."})})]})}export{_ as ClientPage};
