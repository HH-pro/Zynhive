import{j as e,_}from"./index-ps6DciPa.js";import{r as a}from"./react-F9Y4d3HK.js";import{fetchClientById as z,fetchClientUpdates as G,fetchUpdateFeedback as B,createUpdateFeedback as V}from"./firebase-D4kBdkLj.js";const W={planning:{label:"Planning",color:"#818CF8",bg:"rgba(129,140,248,0.12)",border:"rgba(129,140,248,0.28)"},"in-progress":{label:"In Progress",color:"#F59E0B",bg:"rgba(245,158,11,0.12)",border:"rgba(245,158,11,0.32)"},review:{label:"In Review",color:"#3B82F6",bg:"rgba(59,130,246,0.12)",border:"rgba(59,130,246,0.28)"},completed:{label:"Completed",color:"#10B981",bg:"rgba(16,185,129,0.12)",border:"rgba(16,185,129,0.28)"},"on-hold":{label:"On Hold",color:"#EF4444",bg:"rgba(239,68,68,0.12)",border:"rgba(239,68,68,0.28)"}},Z={seo:{label:"SEO",subtitle:"Search engine optimization — improving your visibility on Google",icon:"🔍",color:"#3B82F6",colorDim:"rgba(59,130,246,0.14)",colorBorder:"rgba(59,130,246,0.22)",grad:"linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(59,130,246,0.03) 100%)"},"digital-marketing":{label:"Digital Marketing",subtitle:"Campaigns, social media, ads & brand growth activities",icon:"📣",color:"#8B5CF6",colorDim:"rgba(139,92,246,0.14)",colorBorder:"rgba(139,92,246,0.22)",grad:"linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(139,92,246,0.03) 100%)"},general:{label:"General Updates",subtitle:"Project milestones and other activities",icon:"📋",color:"#6366F1",colorDim:"rgba(99,102,241,0.14)",colorBorder:"rgba(99,102,241,0.22)",grad:"linear-gradient(135deg, rgba(99,102,241,0.1) 0%, rgba(99,102,241,0.03) 100%)"}};function K(){try{return localStorage.getItem("cp-theme")!=="light"}catch{return!0}}function X(t){try{localStorage.setItem("cp-theme",t?"dark":"light")}catch{}}const N=`
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
`;function q(t){return t.split(" ").filter(Boolean).map(i=>i[0]).join("").toUpperCase().slice(0,2)}function R(t){if(!t)return"";try{return(t!=null&&t.toDate?t.toDate():new Date(t)).toLocaleDateString("en-US",{day:"numeric",month:"long",year:"numeric"})}catch{return""}}function J(t){if(!t)return"";try{return(t!=null&&t.toDate?t.toDate():new Date(t)).toLocaleDateString("en-US",{day:"numeric",month:"short"})}catch{return""}}function Q(){const t=new Date().getHours();return t<12?"Good morning":t<17?"Good afternoon":"Good evening"}function T({isDark:t,onToggle:i}){return e.jsxs("button",{className:"cp-toggle",onClick:i,"aria-label":t?"Switch to light mode":"Switch to dark mode",children:[e.jsxs("div",{style:{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 6px",pointerEvents:"none",fontSize:10,lineHeight:1},children:[e.jsx("span",{style:{opacity:t?.3:1,transition:"opacity .3s"},children:"☀"}),e.jsx("span",{style:{opacity:t?1:.3,transition:"opacity .3s"},children:"☽"})]}),e.jsx("div",{style:{position:"absolute",top:3,left:3,width:16,height:16,borderRadius:"50%",background:"linear-gradient(135deg,#6366F1,#818CF8)",transform:t?"translateX(22px)":"translateX(0)",transition:"transform 380ms cubic-bezier(0.16,1,0.3,1)",boxShadow:"0 1px 4px rgba(99,102,241,.4)"}})]})}function L({height:t=36,isDark:i=!0}){return e.jsx("a",{href:"/",className:"cp-logo-link","aria-label":"ZynHive — go to homepage",style:i?{}:{background:"rgba(8,11,20,.82)",borderRadius:10,padding:"4px 10px 4px 6px",backdropFilter:"blur(8px)"},children:e.jsx("img",{src:"/logo.png",alt:"ZynHive",style:{height:t,width:"auto",objectFit:"contain",display:"block"}})})}function M(){return e.jsx("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:16},children:e.jsxs("div",{style:{position:"relative",width:44,height:44},children:[e.jsx("div",{style:{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid rgba(99,102,241,.15)"}}),e.jsx("div",{style:{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid transparent",borderTopColor:"#6366F1",animation:"cp-spin .9s linear infinite"}}),e.jsx("div",{style:{position:"absolute",inset:6,borderRadius:"50%",background:"rgba(99,102,241,.1)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("span",{style:{fontSize:11,fontWeight:800,color:"#6366F1"},children:"ZH"})})]})})}function I({status:t,color:i}){return e.jsx("span",{style:{display:"inline-block",width:8,height:8,borderRadius:"50%",background:i,flexShrink:0,...t==="in-progress"?{animation:"cp-pulse 1.8s ease infinite"}:{}}})}function ee({clientId:t,onAuth:i,isDark:s,onToggleTheme:l}){const[r,c]=a.useState(""),[n,p]=a.useState(!1),[b,f]=a.useState(!1),[g,m]=a.useState(""),[y,u]=a.useState(!0),[j,k]=a.useState(!1);a.useEffect(()=>{z(t).then(o=>{o||k(!0)}).catch(()=>k(!0)).finally(()=>u(!1))},[t]);async function v(o){if(o.preventDefault(),!!r.trim()){f(!0),m("");try{const x=await z(t);if(!x){m("Portal not found.");return}if(x.password!==r.trim()){m("Incorrect password. Please try again.");return}sessionStorage.setItem(`client-auth-${t}`,"1"),i(x)}catch{m("Something went wrong. Please try again.")}finally{f(!1)}}}return y?e.jsx(M,{}):j?e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",gap:12,padding:24,textAlign:"center"},children:[e.jsx("div",{style:{width:56,height:56,borderRadius:16,background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24},children:"🔍"}),e.jsx("p",{style:{fontSize:18,fontWeight:700,color:"var(--cp-text-h)"},children:"Portal not found"}),e.jsx("p",{style:{fontSize:14,color:"var(--cp-text-muted)",maxWidth:280,lineHeight:1.6},children:"This link is invalid or has been removed. Please contact your project manager."})]}):e.jsxs("div",{className:"cp-dots-bg",style:{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:"24px 16px",position:"relative"},children:[e.jsx("div",{style:{position:"fixed",top:16,right:20,zIndex:100},children:e.jsx(T,{isDark:s,onToggle:l})}),e.jsx("div",{style:{position:"fixed",top:"20%",left:"50%",transform:"translateX(-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle, var(--cp-glow) 0%, transparent 70%)",pointerEvents:"none",animation:"cp-glow 4s ease infinite"}}),e.jsxs("div",{className:"cp-fade-up",style:{width:"100%",maxWidth:420,position:"relative",zIndex:1},children:[e.jsxs("div",{style:{textAlign:"center",marginBottom:36},children:[e.jsx("div",{style:{display:"flex",justifyContent:"center",marginBottom:24},children:e.jsx(L,{height:52,isDark:s})}),e.jsx("h1",{style:{fontSize:26,fontWeight:800,color:"var(--cp-text-h)",letterSpacing:"-0.5px",marginBottom:8},children:"Welcome Back"}),e.jsxs("p",{style:{fontSize:14,color:"var(--cp-text-muted)",lineHeight:1.65},children:["Sign in to your client portal to view",e.jsx("br",{}),"your project progress and updates."]})]}),e.jsxs("div",{className:"cp-glass",style:{borderRadius:20,padding:32,boxShadow:"var(--cp-shadow-lg)"},children:[e.jsx("div",{style:{display:"flex",gap:6,marginBottom:24,flexWrap:"wrap"},children:[{icon:"📊",text:"Live Updates"},{icon:"📈",text:"Progress Tracking"},{icon:"🔒",text:"Secure Access"}].map(({icon:o,text:x})=>e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:5,padding:"4px 10px",borderRadius:99,background:"var(--cp-bg-badge)",border:"1px solid var(--cp-border)",fontSize:11,color:"var(--cp-text-muted)"},children:[e.jsx("span",{style:{fontSize:11},children:o}),x]},x))}),e.jsxs("form",{onSubmit:v,style:{display:"flex",flexDirection:"column",gap:16},children:[e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",fontSize:11,fontWeight:600,color:"var(--cp-text-dim)",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8},children:"Portal Password"}),e.jsxs("div",{style:{position:"relative"},children:[e.jsx("input",{type:n?"text":"password",value:r,onChange:o=>{c(o.target.value),m("")},placeholder:"Enter your password",autoFocus:!0,className:"cp-input",style:{width:"100%",padding:"12px 44px 12px 16px",borderRadius:12,fontSize:14,fontFamily:"inherit",border:`1.5px solid ${g?"rgba(239,68,68,.5)":"var(--cp-border)"}`}}),e.jsx("button",{type:"button",onClick:()=>p(o=>!o),style:{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--cp-text-dim)",padding:4},children:n?e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 20 20",fill:"none",children:[e.jsx("path",{d:"M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"10",cy:"10",r:"2.5",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("path",{d:"M3 3l14 14",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})]}):e.jsxs("svg",{width:"16",height:"16",viewBox:"0 0 20 20",fill:"none",children:[e.jsx("path",{d:"M2 10s3-6 8-6 8 6 8 6-3 6-8 6-8-6-8-6z",stroke:"currentColor",strokeWidth:"1.5"}),e.jsx("circle",{cx:"10",cy:"10",r:"2.5",stroke:"currentColor",strokeWidth:"1.5"})]})})]}),g&&e.jsxs("div",{style:{marginTop:8,display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#EF4444"},children:[e.jsxs("svg",{width:"12",height:"12",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("circle",{cx:"7",cy:"7",r:"6",stroke:"currentColor",strokeWidth:"1.2"}),e.jsx("path",{d:"M7 4.5v3M7 9v.5",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round"})]}),g]})]}),e.jsx("button",{type:"submit",disabled:b||!r.trim(),className:"cp-btn",style:{width:"100%",padding:"13px 0",borderRadius:12,border:"none",background:b||!r.trim()?"rgba(99,102,241,.2)":"linear-gradient(135deg,#6366F1 0%,#818CF8 100%)",color:b||!r.trim()?"#4C5580":"white",fontSize:14,fontWeight:600,cursor:b||!r.trim()?"default":"pointer",letterSpacing:"0.01em"},children:b?e.jsxs("span",{style:{display:"flex",alignItems:"center",justifyContent:"center",gap:8},children:[e.jsx("span",{style:{width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,.2)",borderTopColor:"white",animation:"cp-spin .8s linear infinite",display:"inline-block"}}),"Verifying…"]}):"Access My Portal →"})]})]}),e.jsx("p",{style:{textAlign:"center",fontSize:11,color:"var(--cp-text-dimmer)",marginTop:20},children:"🔒 Secured by ZynHive · Need help? Contact your project manager"})]})]})}function te({client:t,isDark:i,onToggleTheme:s,onLogout:l,onOpenWaSettings:r}){return e.jsx("nav",{className:"cp-nav",children:e.jsxs("div",{className:"cp-nav-inner",style:{maxWidth:940,margin:"0 auto",padding:"0 24px",height:60,display:"flex",alignItems:"center",gap:12},children:[e.jsx(L,{isDark:i}),e.jsx("div",{style:{width:1,height:18,background:"var(--cp-border-div)"},className:"cp-hide-mobile"}),e.jsx("span",{className:"cp-hide-mobile",style:{fontSize:12,color:"var(--cp-text-dim)",fontWeight:500},children:"Client Portal"}),e.jsx("div",{style:{flex:1}}),e.jsx(T,{isDark:i,onToggle:s}),e.jsxs("button",{onClick:r,title:"WhatsApp notification settings",style:{display:"flex",alignItems:"center",gap:5,padding:"5px 10px",borderRadius:8,border:"1px solid var(--cp-border)",background:t.whatsappNumber?"rgba(16,185,129,.08)":"transparent",color:t.whatsappNumber?"#10B981":"var(--cp-text-dim)",cursor:"pointer",fontSize:11,transition:"all .15s"},children:[e.jsx("span",{style:{fontSize:13},children:"📱"}),e.jsx("span",{className:"cp-hide-mobile",children:t.whatsappNumber?"Notifications On":"Setup Alerts"})]}),e.jsx("div",{style:{width:1,height:18,background:"var(--cp-border-div)"}}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10},children:[e.jsxs("div",{style:{textAlign:"right"},className:"cp-hide-mobile",children:[e.jsx("div",{style:{fontSize:12,fontWeight:600,color:"var(--cp-text-body)",lineHeight:1.3},children:t.name}),t.company&&e.jsx("div",{style:{fontSize:10,color:"var(--cp-text-dim)"},children:t.company})]}),e.jsx("div",{style:{width:34,height:34,borderRadius:10,background:"linear-gradient(135deg,rgba(99,102,241,.28),rgba(129,140,248,.12))",border:"1px solid rgba(99,102,241,.22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#818CF8",flexShrink:0},children:q(t.name)})]}),e.jsxs("button",{onClick:l,title:"Sign out",style:{display:"flex",alignItems:"center",gap:5,padding:"6px 10px",borderRadius:8,border:"1px solid var(--cp-border)",background:"transparent",color:"var(--cp-text-dim)",cursor:"pointer",fontSize:11,transition:"all .15s"},onMouseEnter:c=>{const n=c.currentTarget;n.style.borderColor="rgba(239,68,68,.35)",n.style.color="#EF4444",n.style.background="rgba(239,68,68,.07)"},onMouseLeave:c=>{const n=c.currentTarget;n.style.borderColor="var(--cp-border)",n.style.color="var(--cp-text-dim)",n.style.background="transparent"},children:[e.jsxs("svg",{width:"13",height:"13",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("path",{d:"M5 7h7M9.5 4.5L12 7l-2.5 2.5",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"}),e.jsx("path",{d:"M5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2",stroke:"currentColor",strokeWidth:"1.3",strokeLinecap:"round"})]}),e.jsx("span",{className:"cp-hide-mobile",children:"Sign out"})]})]})})}function re({pct:t,color:i="#6366F1",size:s=100}){const l=(s-10)/2,r=2*Math.PI*l,c=r-t/100*r;return e.jsxs("svg",{width:s,height:s,style:{display:"block",transform:"rotate(-90deg)"},children:[e.jsx("circle",{cx:s/2,cy:s/2,r:l,fill:"none",stroke:"var(--cp-border)",strokeWidth:6}),e.jsx("circle",{cx:s/2,cy:s/2,r:l,fill:"none",stroke:i,strokeWidth:6,strokeLinecap:"round",strokeDasharray:r,strokeDashoffset:c,style:{transition:"stroke-dashoffset 1.2s cubic-bezier(.16,1,.3,1)"}})]})}function oe({u:t,client:i,onClose:s}){const l=W[t.status],[r,c]=a.useState(!1),[n,p]=a.useState([]),[b,f]=a.useState(!0),[g,m]=a.useState(""),[y,u]=a.useState(!1),j=a.useRef(null);a.useEffect(()=>{t.id&&B(t.id).then(p).catch(()=>{}).finally(()=>f(!1))},[t.id]),a.useEffect(()=>{var o;(o=j.current)==null||o.scrollIntoView({behavior:"smooth"})},[n]);async function k(){const o=g.trim();if(!(!o||!t.id)){u(!0);try{await V({updateId:t.id,clientId:i.id,message:o,fromClient:!0,senderName:i.name}),m(""),p(await B(t.id))}catch(x){console.error("[Feedback] send error:",x)}finally{u(!1)}}}function v(o){if(!o)return"";try{return(o!=null&&o.toDate?o.toDate():new Date(o)).toLocaleString("en-US",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}catch{return""}}return a.useEffect(()=>{function o(x){x.key==="Escape"&&s()}return window.addEventListener("keydown",o),()=>window.removeEventListener("keydown",o)},[s]),a.useEffect(()=>{const o=document.body.style.overflow;return document.body.style.overflow="hidden",()=>{document.body.style.overflow=o}},[]),e.jsx("div",{className:"cp-modal-backdrop",onClick:s,children:e.jsxs("div",{className:`cp-modal${r?" is-fullscreen":""}`,onClick:o=>o.stopPropagation(),children:[e.jsxs("div",{className:"cp-modal-header",style:{gap:12},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0},children:[e.jsx("div",{style:{width:4,height:36,borderRadius:99,background:l.color,flexShrink:0}}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap",marginBottom:4},children:[e.jsx(I,{status:t.status,color:l.color}),e.jsx("span",{style:{fontSize:16,fontWeight:800,color:"var(--cp-text-h)",lineHeight:1.3},children:t.title})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"},children:[e.jsx("span",{style:{fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:99,background:l.bg,color:l.color,border:`1px solid ${l.border}`},children:l.label}),t.phase&&e.jsxs("span",{style:{fontSize:11,color:"var(--cp-text-dim)",display:"flex",alignItems:"center",gap:3},children:[e.jsx("svg",{width:"8",height:"8",viewBox:"0 0 10 10",fill:"none",children:e.jsx("path",{d:"M2 5h6M5 2l3 3-3 3",stroke:"currentColor",strokeWidth:"1.3",strokeLinecap:"round",strokeLinejoin:"round"})}),t.phase]}),t.createdAt&&e.jsx("span",{style:{fontSize:11,color:"var(--cp-text-dim)"},children:R(t.createdAt)})]})]})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:6,flexShrink:0},children:[e.jsx("button",{onClick:()=>c(o=>!o),title:r?"Exit fullscreen":"Fullscreen",style:{display:"flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:8,border:"1px solid var(--cp-border)",background:"var(--cp-bg-badge)",color:"var(--cp-text-dim)",cursor:"pointer"},children:r?e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",children:e.jsx("path",{d:"M5 2H2v3M9 2h3v3M5 12H2V9M9 12h3V9",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"})}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 14 14",fill:"none",children:e.jsx("path",{d:"M2 5V2h3M9 2h3v3M2 9v3h3M12 9v3H9",stroke:"currentColor",strokeWidth:"1.4",strokeLinecap:"round",strokeLinejoin:"round"})})}),e.jsx("button",{onClick:s,title:"Close",style:{display:"flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:8,border:"1px solid var(--cp-border)",background:"var(--cp-bg-badge)",color:"var(--cp-text-dim)",cursor:"pointer"},children:e.jsx("svg",{width:"13",height:"13",viewBox:"0 0 13 13",fill:"none",children:e.jsx("path",{d:"M2 2l9 9M11 2L2 11",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]})]}),e.jsxs("div",{className:"cp-modal-body",children:[t.imageUrl&&e.jsx("div",{style:{marginBottom:20},children:e.jsx("img",{src:t.imageUrl,alt:"update attachment",className:"cp-modal-img"})}),t.description&&e.jsx("div",{style:{marginBottom:20},children:e.jsx("p",{style:{fontSize:14,color:"var(--cp-text-body)",lineHeight:1.78},children:t.description})}),e.jsxs("div",{style:{padding:"16px",borderRadius:12,background:"var(--cp-bg-stat)",border:"1px solid var(--cp-border)",marginBottom:24},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10},children:[e.jsx("span",{style:{fontSize:12,color:"var(--cp-text-muted)",fontWeight:600},children:"Task Progress"}),e.jsxs("span",{style:{fontSize:20,fontWeight:800,color:l.color,fontFamily:"monospace"},children:[t.completionPercent,"%"]})]}),e.jsx("div",{style:{height:8,borderRadius:99,background:"var(--cp-border)",overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${t.completionPercent}%`,borderRadius:99,background:`linear-gradient(90deg, ${l.color}, ${l.color}99)`,transition:"width .9s cubic-bezier(.16,1,.3,1)"}})}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginTop:6},children:[e.jsx("span",{style:{fontSize:11,color:"var(--cp-text-dim)"},children:"Started"}),e.jsxs("span",{style:{fontSize:11,color:l.color,fontWeight:600},children:[t.completionPercent,"% complete"]})]})]}),e.jsxs("div",{style:{borderTop:"1px solid var(--cp-border-md)",paddingTop:20},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,marginBottom:14},children:[e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 16 16",fill:"none",children:e.jsx("path",{d:"M2 2h12v9H9l-3 3v-3H2V2z",stroke:"var(--cp-text-muted)",strokeWidth:"1.3",strokeLinejoin:"round"})}),e.jsx("span",{style:{fontSize:13,fontWeight:700,color:"var(--cp-text-h)"},children:"Feedback"}),n.length>0&&e.jsx("span",{style:{fontSize:10,fontWeight:700,padding:"1px 7px",borderRadius:99,background:"rgba(99,102,241,.12)",color:"#818CF8",border:"1px solid rgba(99,102,241,.22)"},children:n.length})]}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:10,marginBottom:14,maxHeight:220,overflowY:"auto",paddingRight:4},children:[b?e.jsx("div",{style:{fontSize:12,color:"var(--cp-text-dim)",padding:"8px 0"},children:"Loading…"}):n.length===0?e.jsx("div",{style:{fontSize:12,color:"var(--cp-text-dim)",padding:"6px 0",fontStyle:"italic"},children:"No feedback yet. Share your thoughts below."}):n.map(o=>e.jsxs("div",{className:`cp-feedback-msg ${o.fromClient?"from-client":"from-team"}`,children:[e.jsx("div",{style:{padding:"9px 13px",borderRadius:o.fromClient?"4px 14px 14px 14px":"14px 4px 14px 14px",background:o.fromClient?"var(--cp-bg-stat)":"rgba(99,102,241,.12)",border:`1px solid ${o.fromClient?"var(--cp-border)":"rgba(99,102,241,.22)"}`,fontSize:13,color:"var(--cp-text-body)",lineHeight:1.6},children:o.message}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:5,padding:"2px 4px"},children:[e.jsx("span",{style:{fontSize:10,fontWeight:600,color:o.fromClient?"var(--cp-text-dim)":"#818CF8"},children:o.fromClient?o.senderName||"You":o.senderName||"ZynHive Team"}),e.jsx("span",{style:{fontSize:10,color:"var(--cp-text-dimmer)"},children:v(o.createdAt)})]})]},o.id)),e.jsx("div",{ref:j})]}),e.jsxs("div",{style:{display:"flex",gap:8,alignItems:"flex-end"},children:[e.jsx("textarea",{value:g,onChange:o=>m(o.target.value),onKeyDown:o=>{o.key==="Enter"&&!o.shiftKey&&(o.preventDefault(),k())},placeholder:"Leave your feedback or ask a question…",rows:2,className:"cp-input",style:{flex:1,padding:"10px 14px",borderRadius:12,fontSize:13,fontFamily:"inherit",border:"1.5px solid var(--cp-border)",resize:"none",lineHeight:1.55}}),e.jsx("button",{onClick:k,disabled:y||!g.trim(),className:"cp-btn",style:{padding:"10px 16px",borderRadius:12,border:"none",flexShrink:0,background:y||!g.trim()?"rgba(99,102,241,.2)":"linear-gradient(135deg,#6366F1 0%,#818CF8 100%)",color:y||!g.trim()?"#4C5580":"white",fontSize:13,fontWeight:600,cursor:y||!g.trim()?"default":"pointer"},children:y?e.jsx("span",{style:{width:16,height:16,borderRadius:"50%",border:"2px solid rgba(255,255,255,.2)",borderTopColor:"white",animation:"cp-spin .8s linear infinite",display:"inline-block"}}):e.jsx("svg",{width:"14",height:"14",viewBox:"0 0 16 16",fill:"none",children:e.jsx("path",{d:"M14 2L2 7l5 2 2 5L14 2z",stroke:"currentColor",strokeWidth:"1.5",strokeLinejoin:"round"})})})]}),e.jsx("p",{style:{fontSize:10,color:"var(--cp-text-dimmer)",marginTop:6},children:"Enter to send · Shift+Enter for new line"})]})]})]})})}function ie({u:t,isLatest:i,sectionColor:s,onClick:l}){const r=W[t.status];return e.jsxs("div",{className:`cp-update-card${i?" is-latest":""}`,style:{position:"relative"},onClick:l,children:[e.jsx("div",{style:{position:"absolute",top:0,left:0,width:3,height:"100%",background:r.color,borderRadius:"14px 0 0 14px"}}),e.jsxs("div",{style:{padding:"18px 20px 18px 22px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:12,marginBottom:10},children:[e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:6},children:[e.jsx(I,{status:t.status,color:r.color}),e.jsx("span",{style:{fontSize:15,fontWeight:700,color:"var(--cp-text-h)",lineHeight:1.3},children:t.title}),i&&e.jsx("span",{style:{fontSize:9,fontWeight:700,padding:"2px 7px",borderRadius:99,background:"rgba(99,102,241,.15)",color:"#818CF8",border:"1px solid rgba(99,102,241,.25)",textTransform:"uppercase",letterSpacing:"0.07em",flexShrink:0},children:"Latest"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},children:[e.jsx("span",{style:{fontSize:11,fontWeight:600,padding:"2px 9px",borderRadius:99,background:r.bg,color:r.color,border:`1px solid ${r.border}`},children:r.label}),t.phase&&e.jsxs("span",{style:{fontSize:11,color:"var(--cp-text-dim)",display:"flex",alignItems:"center",gap:3},children:[e.jsx("svg",{width:"8",height:"8",viewBox:"0 0 10 10",fill:"none",children:e.jsx("path",{d:"M2 5h6M5 2l3 3-3 3",stroke:"currentColor",strokeWidth:"1.3",strokeLinecap:"round",strokeLinejoin:"round"})}),t.phase]})]})]}),t.createdAt&&e.jsx("span",{style:{fontSize:11,color:"var(--cp-text-dim)",flexShrink:0,marginTop:2},children:J(t.createdAt)})]}),t.description&&e.jsx("p",{style:{fontSize:13.5,color:"var(--cp-text-muted)",lineHeight:1.72,marginBottom:14},children:t.description}),t.imageUrl&&e.jsx("div",{style:{marginBottom:14},children:e.jsx("img",{src:t.imageUrl,alt:"update attachment",style:{width:"100%",borderRadius:10,display:"block",border:"1px solid var(--cp-border-md)",maxHeight:300,objectFit:"cover"}})}),e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:6},children:[e.jsx("span",{style:{fontSize:11,color:"var(--cp-text-dim)",fontWeight:500},children:"Task Progress"}),e.jsxs("span",{style:{fontSize:12,fontWeight:800,color:r.color,fontFamily:"monospace"},children:[t.completionPercent,"%"]})]}),e.jsx("div",{style:{height:6,borderRadius:99,background:"var(--cp-border)",overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${t.completionPercent}%`,borderRadius:99,background:`linear-gradient(90deg, ${r.color}, ${r.color}99)`,transition:"width .9s cubic-bezier(.16,1,.3,1)"}})})]})]})]})}function ne({sectionKey:t,items:i,latestId:s,onCardClick:l}){const r=Z[t],c=i.filter(p=>p.status==="completed").length,n=i.length>0?Math.round(c/i.length*100):0;return e.jsxs("div",{children:[e.jsxs("div",{className:"cp-section-banner",style:{background:r.grad},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:14},children:[e.jsx("div",{style:{width:44,height:44,borderRadius:12,background:r.colorDim,border:`1px solid ${r.colorBorder}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0},children:r.icon}),e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:10,marginBottom:3,flexWrap:"wrap"},children:[e.jsx("h2",{style:{fontSize:16,fontWeight:800,color:"var(--cp-text-h)",letterSpacing:"-0.2px"},children:r.label}),e.jsxs("span",{style:{fontSize:10,fontWeight:700,padding:"2px 9px",borderRadius:99,background:r.colorDim,color:r.color,border:`1px solid ${r.colorBorder}`},children:[i.length," ",i.length===1?"task":"tasks"]})]}),e.jsx("p",{style:{fontSize:12,color:"var(--cp-text-muted)",lineHeight:1.5},children:r.subtitle})]}),e.jsxs("div",{style:{textAlign:"center",flexShrink:0},className:"cp-hide-mobile",children:[e.jsxs("div",{style:{fontSize:18,fontWeight:800,color:r.color,fontFamily:"monospace",lineHeight:1},children:[n,"%"]}),e.jsx("div",{style:{fontSize:10,color:"var(--cp-text-dim)",marginTop:2},children:"done"})]})]}),e.jsxs("div",{style:{marginTop:14},children:[e.jsx("div",{style:{height:4,borderRadius:99,background:"var(--cp-border)",overflow:"hidden"},children:e.jsx("div",{style:{height:"100%",width:`${n}%`,borderRadius:99,background:`linear-gradient(90deg, ${r.color}, ${r.color}99)`,transition:"width 1s cubic-bezier(.16,1,.3,1)"}})}),e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginTop:5},children:[e.jsxs("span",{style:{fontSize:10,color:"var(--cp-text-dim)"},children:[c," of ",i.length," completed"]}),e.jsxs("span",{style:{fontSize:10,color:r.color,fontWeight:600},children:[i.length-c," remaining"]})]})]})]}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:10},children:i.map(p=>e.jsx(ie,{u:p,isLatest:p.id===s,sectionColor:r.color,onClick:()=>l(p)},p.id))})]})}function ae({client:t,isDark:i,onToggleTheme:s,onLogout:l}){const[r,c]=a.useState(t),[n,p]=a.useState([]),[b,f]=a.useState(!0),[g,m]=a.useState(null),[y,u]=a.useState(!1),[j,k]=a.useState(t.whatsappNumber??""),[v,o]=a.useState(!1);a.useEffect(()=>{G(r.id).then(p).catch(()=>{}).finally(()=>f(!1))},[r.id]);async function x(){if(r.id){o(!0);try{const{updateClient:d}=await _(async()=>{const{updateClient:w}=await import("./firebase-D4kBdkLj.js");return{updateClient:w}},[]);await d(r.id,{whatsappNumber:j.trim()}),c(w=>({...w,whatsappNumber:j.trim()})),u(!1)}catch{}finally{o(!1)}}}const h=n[0],D=n.filter(d=>d.status==="completed").length,H=n.filter(d=>d.status==="in-progress").length,P=n.filter(d=>d.status==="on-hold").length,F=(h==null?void 0:h.completionPercent)??0,E=n.filter(d=>d.category==="seo"),A=n.filter(d=>d.category==="digital-marketing"),U=n.filter(d=>!d.category||d.category==="general"),$=[{key:"seo",items:E},{key:"digital-marketing",items:A},{key:"general",items:U}].filter(d=>d.items.length>0),S=h?W[h.status]:null;return e.jsxs("div",{className:"cp-fade-in",style:{minHeight:"100vh"},children:[g&&e.jsx(oe,{u:g,client:r,onClose:()=>m(null)}),y&&e.jsx("div",{className:"cp-modal-backdrop",onClick:()=>u(!1),children:e.jsxs("div",{className:"cp-modal",style:{maxWidth:420},onClick:d=>d.stopPropagation(),children:[e.jsxs("div",{className:"cp-modal-header",style:{gap:10},children:[e.jsx("span",{style:{fontSize:20},children:"📱"}),e.jsxs("div",{style:{flex:1},children:[e.jsx("div",{style:{fontSize:15,fontWeight:800,color:"var(--cp-text-h)"},children:"WhatsApp Alerts"}),e.jsx("div",{style:{fontSize:11,color:"var(--cp-text-dim)",marginTop:2},children:"Get notified when a project update is added"})]}),e.jsx("button",{onClick:()=>u(!1),style:{display:"flex",alignItems:"center",justifyContent:"center",width:32,height:32,borderRadius:8,border:"1px solid var(--cp-border)",background:"var(--cp-bg-badge)",color:"var(--cp-text-dim)",cursor:"pointer"},children:e.jsx("svg",{width:"13",height:"13",viewBox:"0 0 13 13",fill:"none",children:e.jsx("path",{d:"M2 2l9 9M11 2L2 11",stroke:"currentColor",strokeWidth:"1.5",strokeLinecap:"round"})})})]}),e.jsxs("div",{className:"cp-modal-body",style:{display:"flex",flexDirection:"column",gap:14},children:[e.jsx("p",{style:{fontSize:12,color:"var(--cp-text-muted)",lineHeight:1.7,margin:0},children:"Enter your WhatsApp number to receive notifications whenever a new update is posted to your project."}),e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:6},children:[e.jsx("label",{style:{fontSize:11,fontWeight:600,color:"var(--cp-text-dim)",textTransform:"uppercase",letterSpacing:"0.07em"},children:"Your WhatsApp Number"}),e.jsx("input",{value:j,onChange:d=>k(d.target.value),placeholder:"923001234567 (with country code, no +)",className:"cp-input",style:{width:"100%",padding:"10px 14px",borderRadius:10,fontSize:13,fontFamily:"inherit",border:"1.5px solid var(--cp-border)"}})]}),e.jsxs("div",{style:{display:"flex",gap:10,marginTop:4},children:[e.jsx("button",{onClick:()=>u(!1),style:{flex:1,padding:"11px 0",borderRadius:10,border:"1px solid var(--cp-border)",background:"transparent",color:"var(--cp-text-muted)",cursor:"pointer",fontSize:13},children:"Cancel"}),e.jsx("button",{onClick:x,disabled:v,className:"cp-btn",style:{flex:1,padding:"11px 0",borderRadius:10,border:"none",background:v?"rgba(99,102,241,.2)":"linear-gradient(135deg,#6366F1,#818CF8)",color:v?"#4C5580":"white",cursor:v?"default":"pointer",fontSize:13,fontWeight:600},children:v?"Saving…":"Save"})]})]})]})}),e.jsx(te,{client:r,isDark:i,onToggleTheme:s,onLogout:l,onOpenWaSettings:()=>u(!0)}),e.jsx("div",{style:{background:"var(--cp-bg-hero)",borderBottom:"1px solid var(--cp-border-md)",transition:"background .3s, border-color .3s"},children:e.jsx("div",{className:"cp-hero-inner",style:{maxWidth:940,margin:"0 auto",padding:"32px 24px 28px"},children:e.jsxs("div",{className:"cp-hero-cols cp-fade-up",style:{display:"flex",alignItems:"center",gap:28},children:[e.jsxs("div",{style:{flex:1,minWidth:0},children:[e.jsxs("div",{style:{marginBottom:12},children:[e.jsxs("p",{style:{fontSize:13,color:"var(--cp-text-dim)",fontWeight:500,marginBottom:4},children:[Q(),", ",r.name.split(" ")[0],"! 👋"]}),e.jsx("h1",{style:{fontSize:24,fontWeight:800,color:"var(--cp-text-h)",letterSpacing:"-0.5px",lineHeight:1.2,marginBottom:6},children:r.projectName||"Your Project Dashboard"}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"},children:[r.company&&e.jsxs("span",{style:{fontSize:12,color:"var(--cp-text-dim)",display:"flex",alignItems:"center",gap:4},children:[e.jsxs("svg",{width:"11",height:"11",viewBox:"0 0 14 14",fill:"none",children:[e.jsx("rect",{x:"2",y:"5",width:"10",height:"7",rx:"1",stroke:"currentColor",strokeWidth:"1.2"}),e.jsx("path",{d:"M5 5V4a2 2 0 014 0v1",stroke:"currentColor",strokeWidth:"1.2"})]}),r.company]}),(h==null?void 0:h.createdAt)&&e.jsxs("span",{style:{fontSize:11,color:"var(--cp-text-dim)",display:"flex",alignItems:"center",gap:4},children:[e.jsxs("svg",{width:"10",height:"10",viewBox:"0 0 12 12",fill:"none",children:[e.jsx("circle",{cx:"6",cy:"6",r:"5",stroke:"currentColor",strokeWidth:"1.1"}),e.jsx("path",{d:"M6 3.5V6l1.5 1.5",stroke:"currentColor",strokeWidth:"1.1",strokeLinecap:"round"})]}),"Last updated ",R(h.createdAt)]})]})]}),h&&S&&e.jsxs("div",{style:{display:"inline-flex",alignItems:"center",gap:8,padding:"8px 14px",borderRadius:10,background:"var(--cp-bg-badge)",border:"1px solid var(--cp-border)",fontSize:12},children:[e.jsx(I,{status:h.status,color:S.color}),e.jsx("span",{style:{color:"var(--cp-text-muted)"},children:"Latest: "}),e.jsx("span",{style:{color:"var(--cp-text-h)",fontWeight:600},children:h.title}),e.jsx("span",{style:{padding:"1px 7px",borderRadius:99,background:S.bg,color:S.color,border:`1px solid ${S.border}`,fontSize:10,fontWeight:700},children:S.label})]})]}),n.length>0&&e.jsxs("div",{className:"cp-ring-col",style:{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:4},children:[e.jsxs("div",{style:{position:"relative",width:100,height:100},children:[e.jsx(re,{pct:F,size:100,color:"#6366F1"}),e.jsx("div",{style:{position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"},children:e.jsxs("span",{style:{fontSize:18,fontWeight:800,color:"#818CF8",fontFamily:"monospace",lineHeight:1},children:[F,"%"]})})]}),e.jsxs("span",{style:{fontSize:10,color:"var(--cp-text-dim)",fontWeight:500,textAlign:"center"},children:["Overall",e.jsx("br",{}),"Progress"]})]})]})})}),n.length>0&&e.jsx("div",{style:{borderBottom:"1px solid var(--cp-border-md)",transition:"border-color .3s"},children:e.jsx("div",{style:{maxWidth:940,margin:"0 auto",padding:"20px 24px"},children:e.jsx("div",{className:"cp-metrics-grid cp-fade-up cp-d1",style:{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:12},children:[{label:"Total Tasks",value:n.length,color:"#6366F1",icon:"📋",sub:"all activities"},{label:"Completed",value:D,color:"#10B981",icon:"✅",sub:"tasks done"},{label:"In Progress",value:H,color:"#F59E0B",icon:"⚡",sub:"active now"},{label:"On Hold",value:P,color:"#EF4444",icon:"⏸",sub:"paused"}].map(({label:d,value:w,color:C,icon:O,sub:Y})=>e.jsxs("div",{className:"cp-metric",children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10},children:[e.jsx("span",{style:{fontSize:18},children:O}),e.jsx("span",{style:{fontSize:22,fontWeight:800,color:C,fontFamily:"monospace",lineHeight:1},children:w})]}),e.jsx("div",{style:{fontSize:12,fontWeight:600,color:"var(--cp-text-body)"},children:d}),e.jsx("div",{style:{fontSize:10,color:"var(--cp-text-dim)",marginTop:2},children:Y})]},d))})})}),e.jsx("div",{className:"cp-content",style:{maxWidth:940,margin:"0 auto",padding:"28px 24px 72px"},children:b?e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",paddingTop:72,gap:14},children:[e.jsx("div",{style:{width:36,height:36,borderRadius:"50%",border:"2px solid rgba(99,102,241,.15)",borderTopColor:"#6366F1",animation:"cp-spin .9s linear infinite"}}),e.jsx("span",{style:{fontSize:13,color:"var(--cp-text-dim)",fontWeight:500},children:"Loading your updates…"})]}):n.length===0?e.jsxs("div",{className:"cp-fade-up",style:{textAlign:"center",paddingTop:80},children:[e.jsx("div",{style:{width:80,height:80,borderRadius:22,background:"rgba(99,102,241,.07)",border:"1px solid rgba(99,102,241,.14)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,margin:"0 auto 20px"},children:"🚀"}),e.jsx("p",{style:{fontSize:18,fontWeight:700,color:"var(--cp-text-h)",marginBottom:10},children:"Work in progress!"}),e.jsx("p",{style:{fontSize:14,color:"var(--cp-text-muted)",lineHeight:1.7,maxWidth:320,margin:"0 auto"},children:"Your project has been kicked off. Updates will appear here as work is completed."})]}):e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:40},children:$.map(({key:d,items:w},C)=>e.jsx("div",{className:`cp-fade-up cp-d${Math.min(C+2,6)}`,children:e.jsx(ne,{sectionKey:d,items:w,latestId:h==null?void 0:h.id,onCardClick:m})},d))})}),e.jsx("footer",{className:"cp-footer",style:{padding:"22px 24px"},children:e.jsxs("div",{style:{maxWidth:940,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:12},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:8},children:[e.jsx("div",{style:{width:22,height:22,borderRadius:7,background:"linear-gradient(135deg,#6366F1,#818CF8)",display:"flex",alignItems:"center",justifyContent:"center"},children:e.jsx("span",{style:{fontSize:8,fontWeight:800,color:"white"},children:"ZH"})}),e.jsxs("span",{style:{fontSize:12,color:"var(--cp-text-dim)"},children:["Powered by ",e.jsx("strong",{style:{color:"var(--cp-text-muted)"},children:"ZynHive"})," · Your Digital Growth Partner"]})]}),e.jsx("span",{style:{fontSize:11,color:"var(--cp-text-dimmer)"},children:"🔒 Secure Client Portal"})]})})]})}function ce(){const t=window.location.pathname.split("/")[2]??"",[i,s]=a.useState(null),[l,r]=a.useState(!0),[c,n]=a.useState(K);function p(){n(f=>(X(!f),!f))}a.useEffect(()=>{sessionStorage.getItem(`client-auth-${t}`)==="1"&&t?z(t).then(g=>{g&&s(g)}).catch(()=>{}).finally(()=>r(!1)):r(!1)},[t]);function b(){sessionStorage.removeItem(`client-auth-${t}`),s(null)}return t?e.jsxs(e.Fragment,{children:[e.jsx("style",{children:N}),e.jsx("div",{className:"cp-root","data-cp-theme":c?"dark":"light",children:l?e.jsx(M,{}):i?e.jsx(ae,{client:i,isDark:c,onToggleTheme:p,onLogout:b}):e.jsx(ee,{clientId:t,onAuth:s,isDark:c,onToggleTheme:p})})]}):e.jsxs(e.Fragment,{children:[e.jsx("style",{children:N}),e.jsx("div",{className:"cp-root","data-cp-theme":c?"dark":"light",style:{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"100vh"},children:e.jsx("p",{style:{color:"var(--cp-text-muted)",fontSize:14},children:"Invalid portal link."})})]})}export{ce as ClientPage};
