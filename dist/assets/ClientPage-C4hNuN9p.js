import{j as e}from"./index-U4b7hE79.js";import{r as l}from"./react-F9Y4d3HK.js";import{x as j,n as I}from"./firebase-D6-ONEhV.js";const k={planning:{label:"Planning",color:"#818CF8",bg:"rgba(129,140,248,0.12)",border:"rgba(129,140,248,0.25)"},"in-progress":{label:"In Progress",color:"#F59E0B",bg:"rgba(245,158,11,0.12)",border:"rgba(245,158,11,0.3)"},review:{label:"In Review",color:"#3B82F6",bg:"rgba(59,130,246,0.12)",border:"rgba(59,130,246,0.25)"},completed:{label:"Completed",color:"#10B981",bg:"rgba(16,185,129,0.12)",border:"rgba(16,185,129,0.25)"},"on-hold":{label:"On Hold",color:"#EF4444",bg:"rgba(239,68,68,0.12)",border:"rgba(239,68,68,0.25)"}};function B(){try{return localStorage.getItem("cp-theme")!=="light"}catch{return!0}}function L(t){try{localStorage.setItem("cp-theme",t?"dark":"light")}catch{}}const w=`
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  /* ── Dark theme (default) ── */
  .cp-root[data-cp-theme="dark"] {
    --cp-bg:          #080B12;
    --cp-bg-nav:      rgba(8,11,18,.94);
    --cp-bg-glass:    rgba(15,20,35,.88);
    --cp-bg-card:     rgba(255,255,255,.025);
    --cp-bg-card-new: rgba(99,102,241,.055);
    --cp-bg-input:    rgba(255,255,255,.05);
    --cp-bg-badge:    rgba(255,255,255,.05);
    --cp-bg-stat:     rgba(255,255,255,.035);
    --cp-text-h:      #F1F5F9;
    --cp-text-body:   #CBD5E1;
    --cp-text-muted:  #64748B;
    --cp-text-dim:    #475569;
    --cp-text-dimmer: #334155;
    --cp-border:      rgba(255,255,255,.07);
    --cp-border-md:   rgba(255,255,255,.05);
    --cp-border-div:  rgba(255,255,255,.07);
    --cp-scrollbar:   #1E293B;
    --cp-dots:        rgba(99,102,241,.07);
    --cp-hero-grad:   rgba(99,102,241,.04);
    --cp-glow-color:  rgba(99,102,241,.14);
    --cp-shadow:      0 24px 80px rgba(0,0,0,.55);
    --cp-card-shadow: 0 0 0 1px rgba(99,102,241,.1), 0 4px 24px rgba(0,0,0,.35);
  }

  /* ── Light theme ── */
  .cp-root[data-cp-theme="light"] {
    --cp-bg:          #F0F4FF;
    --cp-bg-nav:      rgba(240,244,255,.97);
    --cp-bg-glass:    rgba(255,255,255,.92);
    --cp-bg-card:     rgba(255,255,255,.75);
    --cp-bg-card-new: rgba(99,102,241,.06);
    --cp-bg-input:    rgba(0,0,0,.04);
    --cp-bg-badge:    rgba(0,0,0,.05);
    --cp-bg-stat:     rgba(255,255,255,.9);
    --cp-text-h:      #0F172A;
    --cp-text-body:   #1E293B;
    --cp-text-muted:  #64748B;
    --cp-text-dim:    #94A3B8;
    --cp-text-dimmer: #CBD5E1;
    --cp-border:      rgba(0,0,0,.09);
    --cp-border-md:   rgba(0,0,0,.07);
    --cp-border-div:  rgba(0,0,0,.08);
    --cp-scrollbar:   #CBD5E1;
    --cp-dots:        rgba(99,102,241,.06);
    --cp-hero-grad:   rgba(99,102,241,.03);
    --cp-glow-color:  rgba(99,102,241,.1);
    --cp-shadow:      0 24px 80px rgba(99,102,241,.12);
    --cp-card-shadow: 0 0 0 1px rgba(99,102,241,.1), 0 4px 20px rgba(99,102,241,.08);
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
  @keyframes cp-fadeUp   { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes cp-fadeIn   { from { opacity:0; } to { opacity:1; } }
  @keyframes cp-spin     { to { transform:rotate(360deg); } }
  @keyframes cp-pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.6;transform:scale(.95)} }
  @keyframes cp-shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes cp-progress { from{width:0} to{width:var(--w)} }
  @keyframes cp-glow     { 0%,100%{opacity:.5} 50%{opacity:1} }

  .cp-fade-up   { animation: cp-fadeUp  .5s cubic-bezier(.16,1,.3,1) both; }
  .cp-fade-in   { animation: cp-fadeIn  .4s ease both; }
  .cp-card-1    { animation-delay:.05s }
  .cp-card-2    { animation-delay:.10s }
  .cp-card-3    { animation-delay:.15s }
  .cp-card-4    { animation-delay:.20s }
  .cp-card-5    { animation-delay:.25s }
  .cp-card-6    { animation-delay:.30s }

  /* Grid background dots */
  .cp-dots-bg {
    background-image: radial-gradient(circle, var(--cp-dots) 1px, transparent 1px);
    background-size: 28px 28px;
  }

  /* Glass card */
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
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    transition: background .3s, border-color .3s;
  }

  /* Hero section */
  .cp-hero {
    border-bottom: 1px solid var(--cp-border-md);
    background: linear-gradient(180deg, var(--cp-hero-grad) 0%, transparent 100%);
    transition: border-color .3s;
  }

  /* Stat card */
  .cp-stat-card {
    display: flex; align-items: center; gap: 8px;
    padding: 8px 14px; border-radius: 10px;
    background: var(--cp-bg-stat);
    border: 1px solid var(--cp-border);
    transition: background .3s, border-color .3s;
  }

  /* Update card */
  .cp-update-card {
    transition: border-color .2s, transform .2s, box-shadow .2s;
    cursor: default;
  }
  .cp-update-card:hover {
    border-color: rgba(99,102,241,.3) !important;
    transform: translateY(-1px);
    box-shadow: 0 8px 32px rgba(0,0,0,.15);
  }

  /* Card base */
  .cp-card-base {
    border-radius: 16px; overflow: hidden;
    background: var(--cp-bg-card);
    border: 1px solid var(--cp-border-md);
    transition: background .3s, border-color .3s;
  }
  .cp-card-base.is-new {
    background: var(--cp-bg-card-new);
    border-color: rgba(99,102,241,.18);
    box-shadow: var(--cp-card-shadow);
  }

  /* Input */
  .cp-input {
    transition: border-color .2s, box-shadow .2s;
    background: var(--cp-bg-input) !important;
    color: var(--cp-text-h) !important;
  }
  .cp-input::placeholder { color: var(--cp-text-dim) !important; }
  .cp-input:focus { outline: none; border-color: #6366F1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,.15); }

  /* Button */
  .cp-btn-primary:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
  .cp-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .cp-btn-primary { transition: all .2s; }

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

  /* Footer */
  .cp-footer {
    border-top: 1px solid var(--cp-border-md);
    transition: border-color .3s;
  }

  /* Logo link */
  .cp-logo-link {
    display: flex; align-items: center; gap: 8px;
    text-decoration: none;
    cursor: pointer;
    border-radius: 8px;
    padding: 3px 6px 3px 3px;
    transition: background .15s;
  }
  .cp-logo-link:hover {
    background: var(--cp-bg-badge);
  }

  /* Responsive */
  @media (max-width: 640px) {
    .cp-hide-mobile { display: none !important; }
    .cp-nav-inner   { padding: 0 16px !important; }
    .cp-hero-inner  { padding: 20px 16px !important; }
    .cp-content     { padding: 0 16px 48px !important; }
  }
`;function C(t){return t.split(" ").filter(Boolean).map(r=>r[0]).join("").toUpperCase().slice(0,2)}function N(t){if(!t)return"";try{return(t!=null&&t.toDate?t.toDate():new Date(t)).toLocaleDateString("en-US",{day:"numeric",month:"short",year:"numeric"})}catch{return""}}function T(t){if(!t)return"";try{return(t!=null&&t.toDate?t.toDate():new Date(t)).toLocaleDateString("en-US",{day:"numeric",month:"short"})}catch{return""}}function z({isDark:t,onToggle:r}){return e.jsxs("button",{className:"cp-toggle",onClick:r,"aria-label":t?"Switch to light mode":"Switch to dark mode",title:t?"Light mode":"Dark mode",children:[e.jsxs("div",{style:{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 6px",pointerEvents:"none",fontSize:10,lineHeight:1},children:[e.jsx("span",{style:{opacity:t?.3:1,transition:"opacity .3s"},children:"☀"}),e.jsx("span",{style:{opacity:t?1:.3,transition:"opacity .3s"},children:"☽"})]}),e.jsx("div",{style:{position:"absolute",top:3,left:3,width:16,height:16,borderRadius:"50%",background:"linear-gradient(135deg, #6366F1, #818CF8)",transform:t?"translateX(22px)":"translateX(0)",transition:"transform 380ms cubic-bezier(0.16,1,0.3,1)",boxShadow:"0 1px 4px rgba(99,102,241,.4)"}})]})}function S({status:t,color:r}){return t==="completed"?e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("circle",{cx:"7",cy:"7",r:"6",fill:r,fillOpacity:".15"}),e.jsx("path",{d:"M4 7l2.2 2.2L10 5",stroke:r,strokeWidth:"1.8",strokeLinecap:"round",strokeLinejoin:"round"})]}):t==="in-progress"?e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("circle",{cx:"7",cy:"7",r:"6",fill:r,fillOpacity:".15"}),e.jsx("circle",{cx:"7",cy:"7",r:"2.5",fill:r,style:{animation:"cp-pulse 1.8s ease infinite"}})]}):t==="review"?e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("circle",{cx:"7",cy:"7",r:"6",fill:r,fillOpacity:".15"}),e.jsx("circle",{cx:"7",cy:"7",r:"3",stroke:r,strokeWidth:"1.3",fill:"none"}),e.jsx("path",{d:"M7 5.5V7l1 1",stroke:r,strokeWidth:"1.3",strokeLinecap:"round"})]}):t==="on-hold"?e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("circle",{cx:"7",cy:"7",r:"6",fill:r,fillOpacity:".15"}),e.jsx("path",{d:"M5.5 4.5v5M8.5 4.5v5",stroke:r,strokeWidth:"1.6",strokeLinecap:"round"})]}):e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("circle",{cx:"7",cy:"7",r:"6",fill:r,fillOpacity:".15"}),e.jsx("circle",{cx:"7",cy:"7",r:"2",fill:r,fillOpacity:".5"})]})}function W(){return e.jsx("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:16},children:e.jsxs("div",{style:{position:"relative",width:44,height:44},children:[e.jsx("div",{style:{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid rgba(99,102,241,.15)"}}),e.jsx("div",{style:{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid transparent",borderTopColor:"#6366F1",animation:"cp-spin .9s linear infinite"}}),e.jsx("div",{style:{position:"absolute",inset:6,borderRadius:"50%",background:"rgba(99,102,241,.1)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("span",{style:{fontSize:11,fontWeight:800,color:"#6366F1"},children:"ZH"})})]})})}function F({height:t=36,isDark:r=!0}){return e.jsx("a",{href:"/",className:"cp-logo-link","aria-label":"ZynHive — go to homepage",style:r?{}:{background:"rgba(8,11,20,.82)",borderRadius:10,padding:"4px 10px 4px 6px",backdropFilter:"blur(8px)"},children:e.jsx("img",{src:"/logo.png",alt:"ZynHive",style:{height:t,width:"auto",objectFit:"contain",display:"block"}})})}function R({clientId:t,onAuth:r,isDark:d,onToggleTheme:x}){const[o,s]=l.useState(""),[m,f]=l.useState(!1),[n,c]=l.useState(!1),[g,b]=l.useState(""),[h,i]=l.useState(!0),[u,a]=l.useState(!1);l.useEffect(()=>{j(t).then(p=>{p||a(!0)}).catch(()=>a(!0)).finally(()=>i(!1))},[t]);async function y(p){if(p.preventDefault(),!!o.trim()){c(!0),b("");try{const v=await j(t);if(!v){b("Portal not found.");return}if(v.password!==o.trim()){b("Incorrect password. Please try again.");return}sessionStorage.setItem(`client-auth-${t}`,"1"),r(v)}catch{b("Something went wrong. Please try again.")}finally{c(!1)}}}return h?e.jsx(W,{}):u?e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:12,padding:24,textAlign:"center"},children:[e.jsx("div",{style:{width:56,height:56,borderRadius:16,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24},children:"🔍"}),e.jsx("p",{style:{fontSize:18,fontWeight:700,color:"var(--cp-text-h)"},children:"Portal not found"}),e.jsx("p",{style:{fontSize:14,color:"var(--cp-text-muted)",maxWidth:280,lineHeight:1.6},children:"This client portal link is invalid or has been removed. Please contact your project manager."})]}):e.jsxs("div",{className:"cp-dots-bg",style:{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:"24px 16px",position:"relative"},children:[e.jsx("div",{style:{position:"fixed",top:16,right:20,zIndex:100},children:e.jsx(z,{isDark:d,onToggle:x})}),e.jsx("div",{style:{position:"fixed",top:"20%",left:"50%",transform:"translateX(-50%)",width:400,height:400,borderRadius:"50%",background:"radial-gradient(circle, var(--cp-glow-color) 0%, transparent 70%)",pointerEvents:"none",animation:"cp-glow 4s ease infinite"}}),e.jsxs("div",{className:"cp-fade-up",style:{width:"100%",maxWidth:420,position:"relative",zIndex:1},children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:36},children:[e.jsx("div",{style:{display:"flex",justifyContent:"center",marginBottom:24},children:e.jsx(F,{height:52,isDark:d})}),e.jsx("h1",{style:{fontSize:26,fontWeight:800,color:"var(--cp-text-h)",letterSpacing:"-0.5px",marginBottom:8},children:"Welcome Back"}),e.jsxs("p",{style:{fontSize:14,color:"var(--cp-text-muted)",lineHeight:1.6},children:["Sign in to your client portal to view",e.jsx("br",{}),"your project updates and progress."]})]}),e.jsxs("div",{className:"cp-glass",style:{borderRadius:20,padding:32,boxShadow:"var(--cp-shadow)"},children:[e.jsx("div",{style:{display:"flex",gap:6,marginBottom:24,flexWrap:"wrap"},children:[{icon:"📊",text:"Live Updates"},{icon:"📈",text:"Progress Tracking"},{icon:"🔒",text:"Secure Access"}].map(({icon:p,text:v})=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:99,background:"var(--cp-bg-badge)",border:"1px solid var(--cp-border)",fontSize:11,color:"var(--cp-text-muted)"},children:[e.jsx("span",{style:{fontSize:11},children:p}),v]},v))}),e.jsxs("form",{onSubmit:y,style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",fontSize:11,fontWeight:600,color:"var(--cp-text-dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8},children:"Portal Password"}),e.jsxs("div",{style:{position:"relative"},children:[e.jsx("input",{type:m?"text":"password",value:o,onChange:p=>{s(p.target.value),b("")},placeholder:"Enter your password",autoFocus:!0,className:"cp-input",style:{width:"100%",padding:"12px 44px 12px 16px",borderRadius:12,fontSize:14,fontFamily:"inherit",border:`1.5px solid ${g?"rgba(239,68,68,.5)":"var(--cp-border)"}`}}),e.jsx("button",{type:"button",onClick:()=>f(p=>!p),style:{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--cp-text-dim)",padding:4},children:m?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 20 20",fill:"none",children:[e.jsx("path",{d:"M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"10",cy:"10",r:"2.5",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M3 3l14 14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}):e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 20 20",fill:"none",children:[e.jsx("path",{d:"M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"10",cy:"10",r:"2.5",stroke:"currentColor",strokeWidth:"1.5"})]})})]}),g&&e.jsxs("div",{style:{marginTop:8,display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#EF4444"},children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("circle",{cx:"7",cy:"7",r:"6",stroke:"currentColor",strokeWidth:"1.2"}),e.jsx("path",{d:"M7 4.5v3M7 9v.5",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round"})]}),g]})]}),e.jsx("button",{type:"submit",disabled:n||!o.trim(),className:"cp-btn-primary",style:{width:"100%",padding:"13px 0",borderRadius:12,border:"none",background:n||!o.trim()?"rgba(99,102,241,.2)":"linear-gradient(135deg, #6366F1 0%, #818CF8 100%)",color:n||!o.trim()?"#4C5580":"white",fontSize:14,fontWeight:600,cursor:n||!o.trim()?"default":"pointer",letterSpacing:"0.01em"},children:n?e.jsxs("span",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:8},children:[e.jsx("span",{style:{width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,.2)",borderTopColor:"white",animation:"cp-spin .8s linear infinite",display:"inline-block"}}),"Verifying…"]}):"Access My Portal →"})]})]}),e.jsx("p",{style:{textAlign:"center",fontSize:11,color:"var(--cp-text-dimmer)",marginTop:20},children:"🔒 Secured by ZynHive · Need help? Contact your project manager"})]})]})}function H({client:t,isDark:r,onToggleTheme:d,onLogout:x}){return e.jsx("nav",{className:"cp-nav",children:e.jsxs("div",{className:"cp-nav-inner",style:{maxWidth:800,margin:"0 auto",padding:"0 24px",height:58,display:"flex",alignItems:"center",gap:12},children:[e.jsx(F,{isDark:r}),e.jsx("div",{style:{width:1,height:18,background:"var(--cp-border-div)"},className:"cp-hide-mobile"}),e.jsx("span",{className:"cp-hide-mobile",style:{fontSize:12,color:"var(--cp-text-dim)"},children:"Client Portal"}),e.jsx("div",{style:{flex:1}}),e.jsx(z,{isDark:r,onToggle:d}),e.jsx("div",{style:{width:1,height:18,background:"var(--cp-border-div)"}}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsxs("div",{style:{textAlign:"right"},className:"cp-hide-mobile",children:[e.jsx("div",{style:{fontSize:12,fontWeight:600,color:"var(--cp-text-body)"},children:t.name}),t.company&&e.jsx("div",{style:{fontSize:10,color:"var(--cp-text-dim)"},children:t.company})]}),e.jsx("div",{style:{width:32,height:32,borderRadius:10,background:"linear-gradient(135deg, rgba(99,102,241,.3), rgba(129,140,248,.15))",border:"1px solid rgba(99,102,241,.25)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#818CF8",flexShrink:0},children:C(t.name)})]}),e.jsxs("button",{onClick:x,title:"Sign out",style:{display:"flex",alignItems:"center",gap:5,padding:"6px 10px",borderRadius:8,border:"1px solid var(--cp-border)",background:"transparent",color:"var(--cp-text-dim)",cursor:"pointer",fontSize:11,transition:"all .15s"},onMouseEnter:o=>{const s=o.currentTarget;s.style.borderColor="rgba(239,68,68,.35)",s.style.color="#EF4444",s.style.background="rgba(239,68,68,.07)"},onMouseLeave:o=>{const s=o.currentTarget;s.style.borderColor="var(--cp-border)",s.style.color="var(--cp-text-dim)",s.style.background="transparent"},children:[e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("path",{d:"M5 7h7M9.5 4.5L12 7l-2.5 2.5",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2",stroke:"currentColor",strokeWidth:"1.3",strokeLinecap:"round"})]}),e.jsx("span",{className:"cp-hide-mobile",children:"Sign out"})]})]})})}function P({client:t,isDark:r,onToggleTheme:d,onLogout:x}){const[o,s]=l.useState([]),[m,f]=l.useState(!0);l.useEffect(()=>{I(t.id).then(s).catch(()=>{}).finally(()=>f(!1))},[t.id]);const n=o[0],c=(n==null?void 0:n.completionPercent)??0,g=o.filter(i=>i.status==="completed").length,b=o.filter(i=>i.status==="in-progress"||i.status==="review").length,h=n?k[n.status]:null;return e.jsxs("div",{className:"cp-fade-in",style:{minHeight:"100vh"},children:[e.jsx(H,{client:t,isDark:r,onToggleTheme:d,onLogout:x}),e.jsx("div",{className:"cp-hero cp-hero-inner",style:{padding:"32px 24px 28px"},children:e.jsxs("div",{style:{maxWidth:800,margin:"0 auto"},children:[e.jsxs("div",{className:"cp-fade-up",style:{display:"flex",alignItems:"flex-start",gap:16,marginBottom:24},children:[e.jsx("div",{style:{width:52,height:52,borderRadius:14,background:"linear-gradient(135deg, rgba(99,102,241,.25), rgba(129,140,248,.1))",border:"1px solid rgba(99,102,241,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:17,fontWeight:800,color:"#818CF8",flexShrink:0},children:C(t.name)}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:4},children:[e.jsx("h1",{style:{fontSize:22,fontWeight:800,color:"var(--cp-text-h)",letterSpacing:"-0.4px",lineHeight:1.2},children:t.projectName||"Your Project"}),h&&e.jsx("span",{style:{fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:99,background:h.bg,color:h.color,border:`1px solid ${h.border}`,letterSpacing:"0.03em"},children:h.label})]}),e.jsxs("p",{style:{fontSize:13,color:"var(--cp-text-muted)",lineHeight:1.5},children:["Hi ",t.name.split(" ")[0],"! 👋  Here's a real-time view of your project progress.",t.company&&e.jsxs("span",{style:{color:"var(--cp-text-dim)"},children:[" · ",t.company]})]})]})]}),e.jsx("div",{className:"cp-fade-up cp-card-1",style:{display:"flex",gap:10,flexWrap:"wrap",marginBottom:20},children:[{label:"Total Updates",value:o.length,color:"#818CF8",icon:"📋"},{label:"Completed",value:g,color:"#10B981",icon:"✅"},{label:"In Progress",value:b,color:"#F59E0B",icon:"⚡"}].map(({label:i,value:u,color:a,icon:y})=>e.jsxs("div",{className:"cp-stat-card",children:[e.jsx("span",{style:{fontSize:13},children:y}),e.jsx("span",{style:{fontSize:18,fontWeight:800,color:a,lineHeight:1},children:u}),e.jsx("span",{style:{fontSize:11,color:"var(--cp-text-muted)",fontWeight:500},children:i})]},i))}),o.length>0&&e.jsxs("div",{className:"cp-fade-up cp-card-2",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8},children:[e.jsx("span",{style:{fontSize:12,color:"var(--cp-text-muted)",fontWeight:500},children:"Overall Project Progress"}),e.jsxs("span",{style:{fontSize:14,fontWeight:800,color:"#818CF8",fontFamily:"monospace"},children:[c,"%"]})]}),e.jsx("div",{style:{height:8,borderRadius:99,background:"var(--cp-border)",overflow:"hidden",position:"relative"},children:e.jsx("div",{style:{height:"100%",width:`${c}%`,borderRadius:99,background:"linear-gradient(90deg, #6366F1, #818CF8, #A5B4FC)",transition:"width 1s cubic-bezier(.16,1,.3,1)",boxShadow:"0 0 12px rgba(99,102,241,.4)"}})}),n&&e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,marginTop:8},children:[e.jsx(S,{status:n.status,color:h.color}),e.jsxs("span",{style:{fontSize:11,color:"var(--cp-text-muted)"},children:["Latest: ",e.jsx("strong",{style:{color:"var(--cp-text-body)",fontWeight:600},children:n.title})]}),n.createdAt&&e.jsx("span",{style:{fontSize:10,color:"var(--cp-text-dim)",marginLeft:"auto"},children:N(n.createdAt)})]})]})]})}),e.jsx("div",{className:"cp-content",style:{maxWidth:800,margin:"0 auto",padding:"24px 24px 64px"},children:m?e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:60,gap:14},children:[e.jsx("div",{style:{width:32,height:32,borderRadius:"50%",border:"2px solid rgba(99,102,241,.15)",borderTopColor:"#6366F1",animation:"cp-spin .9s linear infinite"}}),e.jsx("span",{style:{fontSize:12,color:"var(--cp-text-dim)",fontWeight:500},children:"Loading your updates…"})]}):o.length===0?e.jsxs("div",{className:"cp-fade-up",style:{textAlign:"center",paddingTop:64},children:[e.jsx("div",{style:{width:72,height:72,borderRadius:20,background:"rgba(99,102,241,.08)",border:"1px solid rgba(99,102,241,.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,margin:"0 auto 16px"},children:"🚀"}),e.jsx("p",{style:{fontSize:17,fontWeight:700,color:"var(--cp-text-h)",marginBottom:8},children:"Work in progress!"}),e.jsx("p",{style:{fontSize:13,color:"var(--cp-text-muted)",lineHeight:1.65,maxWidth:300,margin:"0 auto"},children:"Your project has been kicked off. Updates will appear here as milestones are completed."})]}):e.jsxs(e.Fragment,{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:16},children:[e.jsx("h2",{style:{fontSize:13,fontWeight:600,color:"var(--cp-text-muted)",textTransform:"uppercase",letterSpacing:"0.08em"},children:"Project Updates"}),e.jsxs("span",{style:{fontSize:11,color:"var(--cp-text-dim)"},children:[o.length," total"]})]}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:10},children:o.map((i,u)=>{const a=k[i.status],y=u===0;return e.jsxs("div",{className:`cp-update-card cp-card-base cp-fade-up cp-card-${Math.min(u+1,6)}${y?" is-new":""}`,children:[e.jsx("div",{style:{height:3,background:`linear-gradient(90deg, ${a.color}, ${a.color}55)`}}),e.jsxs("div",{style:{padding:"16px 20px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",gap:12,marginBottom:i.description?10:0},children:[e.jsx("div",{style:{width:32,height:32,borderRadius:9,background:a.bg,border:`1px solid ${a.border}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1},children:e.jsx(S,{status:i.status,color:a.color})}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:4},children:[e.jsx("span",{style:{fontSize:14,fontWeight:700,color:"var(--cp-text-h)",lineHeight:1.3},children:i.title}),y&&e.jsx("span",{style:{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:99,background:"rgba(99,102,241,.15)",color:"#818CF8",border:"1px solid rgba(99,102,241,.25)",textTransform:"uppercase",letterSpacing:"0.07em"},children:"Latest"}),e.jsx("span",{style:{fontSize:10,fontWeight:600,padding:"2px 8px",borderRadius:99,background:a.bg,color:a.color,border:`1px solid ${a.border}`},children:a.label})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},children:[i.phase&&e.jsxs("span",{style:{fontSize:11,color:"var(--cp-text-muted)",display:"flex",alignItems:"center",gap:4},children:[e.jsx("svg",{width:"9",height:"9",viewBox:"0 0 10 10",fill:"none",children:e.jsx("path",{d:"M2 5h6M5 2l3 3-3 3",stroke:"currentColor",strokeWidth:"1.2",strokeLinecap:"round",strokeLinejoin:"round"})}),i.phase]}),i.createdAt&&e.jsx("span",{style:{fontSize:10,color:"var(--cp-text-dim)",marginLeft:"auto"},children:T(i.createdAt)})]})]})]}),i.description&&e.jsx("p",{style:{fontSize:13,color:"var(--cp-text-muted)",lineHeight:1.7,marginBottom:12,paddingLeft:44},children:i.description}),i.imageUrl&&e.jsx("div",{style:{paddingLeft:44,marginBottom:12},children:e.jsx("img",{src:i.imageUrl,alt:"update attachment",style:{width:"100%",borderRadius:10,display:"block",border:`1px solid ${a.border}`,maxHeight:320,objectFit:"cover"}})}),e.jsxs("div",{style:{paddingLeft:44,display:"flex",alignItems:"center",gap:10},children:[e.jsx("div",{style:{flex:1,height:4,borderRadius:99,background:"var(--cp-border)",overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${i.completionPercent}%`,borderRadius:99,background:`linear-gradient(90deg, ${a.color}, ${a.color}88)`,transition:"width .8s ease"}})}),e.jsxs("span",{style:{fontSize:11,fontWeight:700,color:a.color,fontFamily:"monospace",minWidth:34,textAlign:"right"},children:[i.completionPercent,"%"]})]})]})]},i.id)})})]})}),e.jsx("footer",{className:"cp-footer",style:{padding:"20px 24px",textAlign:"center"},children:e.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:8},children:[e.jsx("div",{style:{width:20,height:20,borderRadius:6,background:"linear-gradient(135deg, #6366F1, #818CF8)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("span",{style:{fontSize:8,fontWeight:800,color:"white"},children:"ZH"})}),e.jsxs("span",{style:{fontSize:11,color:"var(--cp-text-dim)"},children:["Powered by ",e.jsx("strong",{style:{color:"var(--cp-text-muted)"},children:"ZynHive"})," · Your Digital Growth Partner"]})]})})]})}function D(){const t=window.location.pathname.split("/")[2]??"",[r,d]=l.useState(null),[x,o]=l.useState(!0),[s,m]=l.useState(B);function f(){m(c=>(L(!c),!c))}l.useEffect(()=>{sessionStorage.getItem(`client-auth-${t}`)==="1"&&t?j(t).then(g=>{g&&d(g)}).catch(()=>{}).finally(()=>o(!1)):o(!1)},[t]);function n(){sessionStorage.removeItem(`client-auth-${t}`),d(null)}return t?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:w}),e.jsx("div",{className:"cp-root","data-cp-theme":s?"dark":"light",children:x?e.jsx(W,{}):r?e.jsx(P,{client:r,isDark:s,onToggleTheme:f,onLogout:n}):e.jsx(R,{clientId:t,onAuth:d,isDark:s,onToggleTheme:f})})]}):e.jsxs(e.Fragment,{children:[e.jsx("style",{children:w}),e.jsx("div",{className:"cp-root","data-cp-theme":s?"dark":"light",style:{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"},children:e.jsx("p",{style:{color:"var(--cp-text-muted)",fontSize:14},children:"Invalid portal link."})})]})}export{D as ClientPage};
