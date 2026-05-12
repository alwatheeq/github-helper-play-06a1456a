import React from 'react';
import type { Theme } from './theme';

// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  Scholar v4 — Arabic RTL Design System                                   ║
// ║  direction: rtl · font: Cairo · language: Arabic                         ║
// ╚══════════════════════════════════════════════════════════════════════════╝

export const SfAr = { fontFamily:"'Cairo','Noto Sans Arabic',sans-serif" };

// ─────────────────────────────────────────────────────────────────────────────
// Icons (shared, direction-agnostic)
// ─────────────────────────────────────────────────────────────────────────────
const IGrid    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>;
const IBook    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>;
const IUsers   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const ICap     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>;
const IClip    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
const IGame    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/><rect x="2" y="6" width="20" height="12" rx="2"/></svg>;
const IClock   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IMsg     = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
const IBell    = ({c,s}) => <svg width={s||15} height={s||15} viewBox="0 0 24 24" fill="none" stroke={c||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
const ISearch  = ({c}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const IChevL   = ({c}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||"currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
const IUpload  = ({c}) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>;
const IStar    = ({c}) => <svg width="13" height="13" viewBox="0 0 24 24" fill={c||"none"} stroke={c||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
const ILock    = ({c}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
const IMail    = ({c}) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>;
const IPlus    = ({c,s}) => <svg width={s||14} height={s||14} viewBox="0 0 24 24" fill="none" stroke={c||"currentColor"} strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>;
const ISend    = ({c}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||"currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>;
const IFile    = ({c}) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>;
const ICheck   = ({c}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||"currentColor"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IMap     = ({c}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>;
const IAward   = ({c}) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c||"currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>;

// ─────────────────────────────────────────────────────────────────────────────
// Shell4Ar — RTL shell (sidebar appears on the RIGHT)
// ─────────────────────────────────────────────────────────────────────────────
export const Shell4Ar: React.FC<{ t: Theme; active: string; children?: React.ReactNode }> = ({ t, active, children }) => {
  const nav = [
    { id:'dashboard', ar:'لوحة التحكم',    sub:'المهام واليوم',          Icon:IGrid  },
    { id:'library',   ar:'مكتبتي',         sub:'الأعمال المحفوظة',       Icon:IBook  },
    { id:'rooms',     ar:'غرف الدراسة',    sub:'الدراسة مع الأقران',     Icon:IUsers },
    { id:'academics', ar:'الأكاديمية',     sub:'المقررات والتقدم',        Icon:ICap   },
    { id:'exams',     ar:'الاختبارات',     sub:'الاختبارات والتقييمات',   Icon:IClip  },
    { id:'play',      ar:'التعلم التفاعلي',sub:'العب وتعلم',              Icon:IGame  },
    { id:'history',   ar:'السجل',          sub:'النشاط الأخير',           Icon:IClock },
    { id:'feedback',  ar:'التغذية الراجعة',sub:'اكتب لنا',                Icon:IMsg   },
  ];
  return (
    <div dir="rtl" style={{ width:'100%', height:'100%', display:'flex', flexDirection:'row', overflow:'hidden', ...SfAr }}>
      {/* Sidebar — first in RTL flex row → appears on RIGHT */}
      <div style={{ width:242, background:t.sb, display:'flex', flexDirection:'column', flexShrink:0, borderLeft:`1px solid rgba(0,0,0,0.06)` }}>
        {/* Logo */}
        <div style={{ padding:'18px 16px 16px', borderBottom:`1px solid ${t.rule}20`, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ width:34, height:34, borderRadius:10, background:t.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:800, color:'white', boxShadow:`0 2px 8px ${t.accent}40` }}>م</div>
          <div>
            <div style={{ fontSize:15, fontWeight:800, color:t.sbInk, letterSpacing:'-0.3px' }}>مِشفهم</div>
            <div style={{ fontSize:10, color:t.muted, marginTop:1 }}>منصة التعلم الذكي</div>
          </div>
        </div>
        {/* Nav */}
        <nav style={{ flex:1, padding:'10px 8px', display:'flex', flexDirection:'column', gap:1, overflowY:'auto' }}>
          {nav.map(({ id, ar, sub, Icon }) => {
            const on = active === id;
            return (
              <div key={id} style={{ padding:'9px 10px', borderRadius:10, background: on ? `${t.accent}18` : 'transparent', borderRight: on ? `3px solid ${t.accent}` : '3px solid transparent', cursor:'pointer', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ color: on ? t.accent : t.muted, flexShrink:0 }}><Icon /></div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight: on ? 700 : 500, color: on ? t.accent : t.sbInk, lineHeight:1.2 }}>{ar}</div>
                  <div style={{ fontSize:10, color:t.muted, marginTop:2 }}>{sub}</div>
                </div>
              </div>
            );
          })}
        </nav>
        {/* User */}
        <div style={{ padding:'12px 14px', borderTop:`1px solid ${t.rule}20`, display:'flex', alignItems:'center', gap:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:12, fontWeight:700, color:t.sbInk }}>أحمد الرشيدي</div>
            <div style={{ fontSize:10, color:t.muted, marginTop:1 }}>عضو مميز · المستوى الرابع</div>
          </div>
          <div style={{ width:32, height:32, borderRadius:9, background:t.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'white' }}>أ</div>
        </div>
        <div style={{ padding:'8px 14px 12px', textAlign:'center' }}>
          <span style={{ fontSize:9, color:t.muted, letterSpacing:'0.05em' }}>© 2026 مِشفهم</span>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:t.bg }}>
        {/* Header */}
        <div style={{ height:56, background:t.panel, borderBottom:`1px solid ${t.rule}`, display:'flex', alignItems:'center', padding:'0 22px', gap:14, flexShrink:0 }}>
          <div style={{ flex:1, background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:22, padding:'8px 16px', display:'flex', alignItems:'center', gap:8, maxWidth:340 }}>
            <ISearch c={t.muted} />
            <span style={{ fontSize:13, color:t.muted }}>ابحث في المكتبة، الاختبارات...</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:20, padding:'6px 14px' }}>
              <span style={{ fontSize:11, color:t.muted }}>الرصيد</span>
              <span style={{ fontSize:13, fontWeight:700, color:t.ink }}>٥٬٢٠٠</span>
            </div>
            <div style={{ width:34, height:34, borderRadius:9, background:t.panel2, border:`1px solid ${t.rule}`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', cursor:'pointer' }}>
              <IBell c={t.muted} />
              <div style={{ position:'absolute', top:7, right:7, width:7, height:7, borderRadius:'50%', background:'#ef4444', border:`1.5px solid ${t.panel}` }} />
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer' }}>
              <div>
                <div style={{ fontSize:12, fontWeight:700, color:t.ink, textAlign:'right' }}>أحمد الرشيدي</div>
                <div style={{ fontSize:10, color:t.muted, textAlign:'right' }}>عضو مميز</div>
              </div>
              <div style={{ width:32, height:32, borderRadius:8, background:t.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'white' }}>أ</div>
            </div>
          </div>
        </div>
        <div style={{ flex:1, overflow:'hidden' }}>{children}</div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Dash4Ar — Dashboard (Arabic RTL)
// ─────────────────────────────────────────────────────────────────────────────
export const Dash4Ar: React.FC<{ t: Theme }> = ({ t }) => {
  const stats = [
    { label:'وقت الدراسة اليوم', value:'٢ س ١٥ د', sub:'↑ ١٨٪ عن الأمس',   color:t.accent },
    { label:'بطاقات مكتملة',     value:'٤٨',        sub:'من أصل ٦٠ بطاقة',   color:'#16a34a' },
    { label:'درجة آخر اختبار',   value:'٨٩٪',       sub:'ممتاز · أعلى ٦٪',   color:'#d97706' },
    { label:'وحدات مكتملة',      value:'٣ / ١٢',    sub:'الفصل الدراسي الثاني',color:'#7c3aed' },
  ];
  const tasks = [
    { title:'مراجعة وظائف الأعضاء — الفصل الخامس',  time:'اليوم الساعة ٣ م',  tag:'قيد التقدم', tagC:'#d97706' },
    { title:'اختبار أساسيات علم الأحياء الخلوي',      time:'غداً الساعة ١٠ ص',  tag:'لم يبدأ',    tagC:t.accent },
    { title:'مشروع جماعي · دراسة الأدوية السريرية',   time:'بعد ٣ أيام',         tag:'جديد',       tagC:'#16a34a' },
  ];
  const recent = [
    { name:'علم التشريح البشري — الوحدة ٤', type:'كتاب', date:'منذ ساعتين' },
    { name:'بطاقات الكيمياء الحيوية',        type:'بطاقات',date:'منذ ٥ ساعات' },
    { name:'اختبار الفيزيولوجيا التجريبي',  type:'اختبار',date:'أمس' },
  ];
  return (
    <Shell4Ar t={t} active="dashboard">
      <div style={{ width:'100%', height:'100%', overflowY:'auto', background:t.bg, padding:'24px 28px' }}>
        {/* Welcome */}
        <div style={{ marginBottom:22 }}>
          <div style={{ fontSize:22, fontWeight:800, color:t.ink, ...SfAr }}>مرحباً، أحمد 👋</div>
          <div style={{ fontSize:13, color:t.muted, marginTop:4 }}>هذا ما ينتظرك اليوم — استمر في التقدم!</div>
        </div>
        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14, marginBottom:22 }}>
          {stats.map((s,i) => (
            <div key={i} style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:14, padding:'18px 16px', borderTop:`3px solid ${s.color}` }}>
              <div style={{ fontSize:22, fontWeight:800, color:s.color, ...SfAr }}>{s.value}</div>
              <div style={{ fontSize:12, fontWeight:600, color:t.ink, marginTop:4 }}>{s.label}</div>
              <div style={{ fontSize:11, color:t.muted, marginTop:3 }}>{s.sub}</div>
            </div>
          ))}
        </div>
        {/* Today + Recent */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          {/* Today's Tasks */}
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:14, padding:'18px 18px' }}>
            <div style={{ fontSize:13, fontWeight:700, color:t.ink, marginBottom:14 }}>مهام اليوم</div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {tasks.map((task, i) => (
                <div key={i} style={{ background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:10, padding:'12px 14px' }}>
                  <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:8, marginBottom:6 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:t.ink, flex:1, lineHeight:1.4 }}>{task.title}</div>
                    <div style={{ padding:'2px 8px', borderRadius:10, background:`${task.tagC}20`, color:task.tagC, fontSize:10, fontWeight:700, flexShrink:0 }}>{task.tag}</div>
                  </div>
                  <div style={{ fontSize:11, color:t.muted }}>{task.time}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Recent Activity */}
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:14, padding:'18px 18px' }}>
            <div style={{ fontSize:13, fontWeight:700, color:t.ink, marginBottom:14 }}>النشاط الأخير</div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {recent.map((r, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 12px', background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:10 }}>
                  <div style={{ width:34, height:34, borderRadius:9, background:`${t.accent}18`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <IFile c={t.accent} />
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:12, fontWeight:600, color:t.ink, lineHeight:1.3 }}>{r.name}</div>
                    <div style={{ fontSize:10, color:t.muted, marginTop:2 }}>{r.type} · {r.date}</div>
                  </div>
                  <IChevL c={t.muted} />
                </div>
              ))}
            </div>
            {/* Progress bar */}
            <div style={{ marginTop:16, padding:'14px', background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8 }}>
                <span style={{ fontSize:12, color:t.muted }}>التقدم الأسبوعي</span>
                <span style={{ fontSize:12, fontWeight:700, color:t.accent }}>٦٨٪</span>
              </div>
              <div style={{ height:6, background:t.rule, borderRadius:3, overflow:'hidden' }}>
                <div style={{ width:'68%', height:'100%', background:t.accent, borderRadius:3 }} />
              </div>
              <div style={{ fontSize:10, color:t.muted, marginTop:6 }}>١٧ من أصل ٢٥ مهمة مكتملة هذا الأسبوع</div>
            </div>
          </div>
        </div>
      </div>
    </Shell4Ar>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Lib4Ar — Library (Arabic RTL)
// ─────────────────────────────────────────────────────────────────────────────
export const Lib4Ar: React.FC<{ t: Theme }> = ({ t }) => {
  const docs = [
    { title:'علم وظائف الأعضاء',           sub:'الوحدة الخامسة',        pages:387,  type:'كتاب',   stars:4, progress:72 },
    { title:'أساسيات علم الأحياء الخلوي',   sub:'د. رنا الحسن',         pages:214,  type:'ملاحظات', stars:5, progress:100 },
    { title:'علم الأدوية السريري',           sub:'المرجع الشامل',        pages:552,  type:'مرجع',   stars:4, progress:35 },
    { title:'مقدمة في الكيمياء الحيوية',    sub:'الفصل الدراسي الثاني', pages:189,  type:'كتاب',   stars:3, progress:60 },
    { title:'علم التشريح البشري',            sub:'مع الرسوم التفصيلية',  pages:643,  type:'مرجع',   stars:5, progress:18 },
    { title:'أساسيات علم الأعصاب',          sub:'الدورة المتقدمة',      pages:295,  type:'ملاحظات', stars:4, progress:0  },
  ];
  const typeC = { 'كتاب':'#6366f1', 'ملاحظات':'#0ea5e9', 'مرجع':'#d97706' };
  const cats = ['الكل','الكتب','الملاحظات','المراجع','المفضلة'];
  return (
    <Shell4Ar t={t} active="library">
      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', background:t.bg }}>
        {/* Subheader */}
        <div style={{ background:t.panel, borderBottom:`1px solid ${t.rule}`, padding:'0 24px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', gap:6 }}>
            {cats.map((c,i) => (
              <div key={i} style={{ padding:'5px 14px', borderRadius:20, background: i===0 ? t.accent : t.panel2, color: i===0 ? 'white' : t.muted, fontSize:12, fontWeight:600, cursor:'pointer', border:`1px solid ${i===0 ? t.accent : t.rule}` }}>{c}</div>
            ))}
          </div>
          <button style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, background:t.accent, border:'none', color:'white', fontSize:13, fontWeight:700, cursor:'pointer', boxShadow:`0 2px 8px ${t.accent}40` }}>
            <IUpload c="white" /><span>رفع ملف</span>
          </button>
        </div>
        {/* Grid */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, alignContent:'start' }}>
          {docs.map((d, i) => {
            const col = typeC[d.type] || t.accent;
            return (
              <div key={i} style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:14, padding:'16px', cursor:'pointer', position:'relative', overflow:'hidden' }}>
                {/* Type tag */}
                <div style={{ position:'absolute', top:12, left:12, padding:'2px 8px', background:`${col}20`, color:col, borderRadius:10, fontSize:10, fontWeight:700 }}>{d.type}</div>
                {/* File icon */}
                <div style={{ width:44, height:44, borderRadius:12, background:`${col}18`, border:`1px solid ${col}30`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                  <IFile c={col} />
                </div>
                <div style={{ fontSize:13, fontWeight:700, color:t.ink, marginBottom:3, lineHeight:1.3 }}>{d.title}</div>
                <div style={{ fontSize:11, color:t.muted, marginBottom:10 }}>{d.sub}</div>
                {/* Stars */}
                <div style={{ display:'flex', gap:2, marginBottom:10 }}>
                  {[...Array(5)].map((_,j) => (
                    <IStar key={j} c={j < d.stars ? '#d97706' : t.rule} />
                  ))}
                </div>
                {/* Progress */}
                {d.progress > 0 && (
                  <div>
                    <div style={{ height:4, background:t.rule, borderRadius:2, overflow:'hidden', marginBottom:4 }}>
                      <div style={{ width:`${d.progress}%`, height:'100%', background:col, borderRadius:2 }} />
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between' }}>
                      <span style={{ fontSize:10, color:t.muted }}>{d.pages} صفحة</span>
                      <span style={{ fontSize:10, fontWeight:700, color:col }}>{d.progress}٪</span>
                    </div>
                  </div>
                )}
                {d.progress === 0 && (
                  <div style={{ fontSize:10, color:t.muted }}>{d.pages} صفحة · لم يُقرأ بعد</div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Shell4Ar>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Rooms4Ar — Study Rooms (Arabic RTL)
// ─────────────────────────────────────────────────────────────────────────────
export const Rooms4Ar: React.FC<{ t: Theme }> = ({ t }) => {
  const rooms = [
    { name:'غرفة الفيزيولوجيا الطبية',  subject:'فيزيولوجيا', members:8, max:12, live:true,  tags:['بث مباشر','اختبارات'],       host:'د. نورة', color:'#6366f1' },
    { name:'مجموعة الأحياء الجزيئية',   subject:'أحياء',      members:5, max:8,  live:true,  tags:['مذاكرة','بطاقات'],            host:'سارة ك.',  color:'#0ea5e9' },
    { name:'مراجعة الكيمياء العضوية',   subject:'كيمياء',     members:3, max:6,  live:false, tags:['مجدولة','٧ م'],               host:'عمر ر.',   color:'#10b981' },
    { name:'دراسة علم الأعصاب',          subject:'أعصاب',      members:6, max:10, live:true,  tags:['بث مباشر','نقاش'],            host:'لينا م.',  color:'#f59e0b' },
    { name:'مراجعة شاملة للاختبار',     subject:'عام',         members:12,max:20, live:false, tags:['غداً','٩ ص'],                 host:'أحمد ع.',  color:'#8b5cf6' },
    { name:'تشريح الجهاز الهضمي',       subject:'تشريح',      members:4, max:8,  live:false, tags:['مجدولة','الثلاثاء'],          host:'منى ح.',   color:'#ef4444' },
  ];
  return (
    <Shell4Ar t={t} active="rooms">
      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', background:t.bg }}>
        <div style={{ background:t.panel, borderBottom:`1px solid ${t.rule}`, padding:'0 24px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', gap:6 }}>
            {['الكل','بث مباشر','مجدولة','أصدقائي'].map((c,i) => (
              <div key={i} style={{ padding:'5px 14px', borderRadius:20, background: i===0 ? t.accent : t.panel2, color: i===0 ? 'white' : t.muted, fontSize:12, fontWeight:600, cursor:'pointer', border:`1px solid ${i===0 ? t.accent : t.rule}` }}>{c}</div>
            ))}
          </div>
          <button style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, background:t.accent, border:'none', color:'white', fontSize:13, fontWeight:700, cursor:'pointer' }}>
            <IPlus c="white" /><span>إنشاء غرفة</span>
          </button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14, alignContent:'start' }}>
          {rooms.map((r, i) => (
            <div key={i} style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:14, padding:'16px', cursor:'pointer', position:'relative', overflow:'hidden' }}>
              {/* Color bar at top */}
              <div style={{ position:'absolute', top:0, right:0, left:0, height:3, background:`linear-gradient(90deg, ${r.color}, ${r.color}99)` }} />
              {/* Live badge */}
              {r.live && (
                <div style={{ position:'absolute', top:12, left:12, display:'flex', alignItems:'center', gap:4, padding:'2px 8px', background:'#ef444420', border:'1px solid #ef444440', borderRadius:10 }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:'#ef4444' }} />
                  <span style={{ fontSize:9, fontWeight:700, color:'#ef4444' }}>مباشر</span>
                </div>
              )}
              <div style={{ marginTop:16, marginBottom:10 }}>
                <div style={{ fontSize:13, fontWeight:700, color:t.ink, marginBottom:3, lineHeight:1.3 }}>{r.name}</div>
                <div style={{ fontSize:11, color:t.muted }}>مضيف: {r.host} · {r.subject}</div>
              </div>
              {/* Tags */}
              <div style={{ display:'flex', flexWrap:'wrap', gap:5, marginBottom:12 }}>
                {r.tags.map((tag, j) => (
                  <span key={j} style={{ padding:'2px 8px', background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:10, fontSize:10, color:t.muted }}>{tag}</span>
                ))}
              </div>
              {/* Members progress */}
              <div>
                <div style={{ height:4, background:t.rule, borderRadius:2, overflow:'hidden', marginBottom:5 }}>
                  <div style={{ width:`${(r.members/r.max)*100}%`, height:'100%', background:r.color, borderRadius:2 }} />
                </div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <button style={{ padding:'5px 12px', borderRadius:8, background: r.live ? r.color : t.panel2, border:`1px solid ${r.live ? r.color : t.rule}`, color: r.live ? 'white' : t.muted, fontSize:11, fontWeight:700, cursor:'pointer' }}>
                    {r.live ? 'انضم الآن' : 'تذكيرني'}
                  </button>
                  <span style={{ fontSize:11, color:t.muted }}>{r.members}/{r.max} عضو</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Shell4Ar>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ContentRead4Ar — Reading View (Arabic RTL — shows bidirectional text flow)
// ─────────────────────────────────────────────────────────────────────────────
export const ContentRead4Ar: React.FC<{ t: Theme }> = ({ t }) => {
  const modes = ['قراءة','كتاب','صوت','بطاقات'];
  return (
    <Shell4Ar t={t} active="library">
      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', background:t.bg }}>
        {/* Mode tabs */}
        <div style={{ background:t.panel, borderBottom:`1px solid ${t.rule}`, padding:'0 24px', display:'flex', alignItems:'center', gap:0, height:44, flexShrink:0 }}>
          {modes.map((m, i) => {
            const active = i === 0;
            return (
              <div key={i} style={{ padding:'10px 16px', fontSize:12, fontWeight:active?700:500, color:active?t.accent:t.muted, borderBottom:active?`2px solid ${t.accent}`:'2px solid transparent', marginBottom:active?'-1px':'0', cursor:'pointer', whiteSpace:'nowrap' }}>{m}</div>
            );
          })}
          <div style={{ flex:1 }} />
          <div style={{ fontSize:11, color:t.muted }}>صفحة <span style={{ fontWeight:700, color:t.ink }}>٤٧</span> من ٣٨٧</div>
        </div>

        <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
          {/* Reading area */}
          <div style={{ flex:1, overflowY:'auto', padding:'36px 80px' }}>
            {/* Breadcrumb */}
            <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:28, fontSize:11, color:t.muted }}>
              <span>مكتبتي</span>
              <IChevL c={t.muted} />
              <span>علم وظائف الأعضاء</span>
              <IChevL c={t.muted} />
              <span style={{ color:t.ink, fontWeight:600 }}>الفصل الخامس</span>
            </div>
            {/* Chapter heading */}
            <div style={{ fontSize:10, letterSpacing:'0.12em', color:t.accent, fontWeight:700, textTransform:'uppercase', marginBottom:8 }}>الفصل الخامس</div>
            <div style={{ fontSize:28, fontWeight:800, color:t.ink, lineHeight:1.35, marginBottom:6, fontFamily:"'Amiri','Cairo',serif" }}>فيزيولوجيا القلب والأوعية الدموية</div>
            <div style={{ fontSize:13, color:t.muted, marginBottom:28 }}>د. رنا الحسن · تحرير: د. خالد المنصور</div>

            {/* Body text in Arabic */}
            <div style={{ fontSize:15, color:t.body, lineHeight:2.0, marginBottom:20, textAlign:'justify' }}>
              يُعدّ القلب المضخّة الرئيسية لجهاز الدوران، إذ يعمل بصفة مستمرة لضخّ الدم إلى سائر أنحاء الجسم. يتكوّن القلب من أربع حجرات: الأذين الأيمن والأذين الأيسر والبطين الأيمن والبطين الأيسر. تتمثّل المهمة الرئيسية للبطين الأيسر في ضخّ الدم المؤكسج عبر الشريان الأورطي إلى سائر أنحاء الجسم.
            </div>
            <div style={{ fontSize:15, color:t.body, lineHeight:2.0, marginBottom:24, textAlign:'justify' }}>
              يعمل جهاز الدوران وفق مبدأ الدائرة المغلقة، حيث يُضخّ الدم من القلب إلى الشرايين، ثم يتوزّع عبر الشعيرات الدموية إلى الأنسجة، وأخيراً يعود عن طريق الأوردة إلى القلب من جديد. تنظّم هذه الدورة الدموية المستمرة عمليات التبادل الغذائي وإزالة الفضلات في مختلف خلايا الجسم.
            </div>

            {/* Key concept box */}
            <div style={{ background:`${t.accent}12`, border:`1.5px solid ${t.accent}30`, borderRight:`4px solid ${t.accent}`, borderRadius:'0 10px 10px 0', padding:'16px 18px', marginBottom:24 }}>
              <div style={{ fontSize:11, fontWeight:800, color:t.accent, letterSpacing:'0.05em', marginBottom:8 }}>مفهوم أساسي</div>
              <div style={{ fontSize:14, color:t.body, lineHeight:1.8, fontWeight:600 }}>
                معادل فرانك-ستارلينغ: تتناسب قوة انقباض عضلة القلب طرديّاً مع مقدار الامتداد الأوّلي لألياف العضلة القلبية. وهذا يعني أن زيادة حجم الدم العائد إلى القلب تؤدي إلى زيادة في قوة الانقباض.
              </div>
            </div>

            <div style={{ fontSize:15, color:t.body, lineHeight:2.0, marginBottom:20, textAlign:'justify' }}>
              تُحدَّد كفاءة القلب عبر عدة مؤشرات حيوية أبرزها: حجم الضربة، ومعدل ضربات القلب، والنتاج القلبي الإجمالي. في الحالة الطبيعية يتراوح النتاج القلبي بين ٤ و٨ لترات في الدقيقة، غير أنه قابل للارتفاع إلى نحو خمسة أضعاف هذه القيمة خلال النشاط البدني المكثّف.
            </div>

            {/* Page navigation */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginTop:32, paddingTop:20, borderTop:`1px solid ${t.rule}` }}>
              <button style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, background:t.panel2, border:`1px solid ${t.rule}`, color:t.muted, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                <span>الصفحة التالية</span>
              </button>
              <span style={{ fontSize:11, color:t.muted }}>٤٧ / ٣٨٧</span>
              <button style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:10, background:t.panel2, border:`1px solid ${t.rule}`, color:t.muted, fontSize:12, fontWeight:600, cursor:'pointer' }}>
                <span>الصفحة السابقة</span>
              </button>
            </div>
          </div>

          {/* Sidebar — Table of contents */}
          <div style={{ width:220, borderLeft:`1px solid ${t.rule}`, background:t.panel, padding:'16px 14px', overflowY:'auto', flexShrink:0 }}>
            <div style={{ fontSize:11, fontWeight:700, color:t.muted, letterSpacing:'0.06em', marginBottom:12 }}>المحتويات</div>
            {[
              { ch:'١', title:'مقدمة الجهاز الدوراني', done:true },
              { ch:'٢', title:'تشريح القلب',            done:true },
              { ch:'٣', title:'الدورة الدموية',          done:true },
              { ch:'٤', title:'ضغط الدم والتنظيم',       done:true },
              { ch:'٥', title:'فيزيولوجيا القلب',        done:false, active:true },
              { ch:'٦', title:'الجهاز اللمفاوي',         done:false },
              { ch:'٧', title:'أمراض الجهاز الدوراني',   done:false },
            ].map((item, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 8px', borderRadius:8, background: item.active ? `${t.accent}15` : 'transparent', marginBottom:2, cursor:'pointer' }}>
                <div style={{ width:20, height:20, borderRadius:6, background: item.done ? t.accent : item.active ? `${t.accent}30` : t.panel2, border:`1px solid ${item.done || item.active ? t.accent : t.rule}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  {item.done ? <ICheck c="white" /> : <span style={{ fontSize:9, color: item.active ? t.accent : t.muted, fontWeight:700 }}>{item.ch}</span>}
                </div>
                <span style={{ fontSize:11, color: item.active ? t.accent : item.done ? t.muted : t.body, fontWeight: item.active ? 700 : 400, lineHeight:1.3 }}>{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell4Ar>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// GroupChat4Ar — Group Chat (Arabic RTL messages)
// ─────────────────────────────────────────────────────────────────────────────
export const GroupChat4Ar: React.FC<{ t: Theme }> = ({ t }) => {
  const uCol = { 'سارة ك.':'#6366f1', 'عمر ر.':'#0ea5e9', 'لينا م.':'#10b981' };
  const msgs = [
    { own:false, name:'سارة ك.',  ini:'سك', time:'٩:٤١ ص', text:'انتهيت للتو من قسم توازن ناش — هل وجد أحد استراتيجيات الهيمنة صعبة؟',   rx:[{e:'🤔',n:3}] },
    { own:false, name:'عمر ر.',   ini:'عر', time:'٩:٤٣ ص', text:'مثال معضلة السجين أوضح الأمر لي. الجميع يتصرف بأنانية فيخسر الجميع.',    rx:[{e:'💡',n:4}] },
    { own:true,  name:'أنت',      ini:'أن', time:'٩:٤٤ ص', text:'هذا المثال رائع! صنعت بطاقات لكل نوع توازن — هل أشاركها معكم؟',           rx:[{e:'🙌',n:5}] },
    { own:false, name:'لينا م.',  ini:'لم', time:'٩:٤٦ ص', text:'من فضلك افعل! وهل سينضم أحد للجلسة المباشرة الساعة ٧ م؟',               rx:[{e:'✅',n:3},{e:'📅',n:2}] },
    { own:true,  name:'أنت',      ini:'أن', time:'٩:٤٨ ص', text:'سأكون موجوداً. سأشارك الآن.',                                              rx:[] },
    { own:false, name:'سارة ك.',  ini:'سك', time:'٩:٤٩ ص', text:'رائع، شكراً جزيلاً! هذه المجموعة مفيدة جداً.',                             rx:[{e:'❤️',n:4}] },
  ];
  const members = [
    { name:'سارة ك.', ini:'سك', color:'#6366f1', online:true  },
    { name:'عمر ر.',  ini:'عر', color:'#0ea5e9', online:true  },
    { name:'لينا م.', ini:'لم', color:'#10b981', online:true  },
    { name:'علي ح.',  ini:'عح', color:'#f59e0b', online:false },
    { name:'نور ب.',  ini:'نب', color:'#8b5cf6', online:false },
  ];
  return (
    <Shell4Ar t={t} active="rooms">
      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', background:t.bg }}>
        {/* Chat header */}
        <div style={{ background:t.panel, borderBottom:`1px solid ${t.rule}`, padding:'0 20px', height:56, display:'flex', alignItems:'center', gap:12, flexShrink:0, boxShadow:'0 1px 6px rgba(0,0,0,0.06)' }}>
          <div style={{ width:36, height:36, borderRadius:10, background:`linear-gradient(135deg, ${t.accent}, ${t.accent}bb)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, fontWeight:700, color:'white' }}>م</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:t.ink }}>مجموعة الطب</div>
            <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:1 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e' }} />
              <span style={{ fontSize:11, color:t.muted }}>٣ متصلون · ٨ أعضاء</span>
            </div>
          </div>
          <div style={{ display:'flex' }}>
            {members.filter(m => m.online).map((m,i) => (
              <div key={i} style={{ width:26, height:26, borderRadius:7, background:m.color, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:700, color:'white', marginRight: i===0?0:-8, border:`2px solid ${t.panel}`, zIndex:10-i }}>{m.ini}</div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 20px', display:'flex', flexDirection:'column', gap:4, background:t.panel2, backgroundImage:`radial-gradient(${t.rule}80 1px, transparent 1px)`, backgroundSize:'22px 22px' }}>
          <div style={{ display:'flex', justifyContent:'center', margin:'4px 0 10px' }}>
            <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:20, padding:'4px 14px', fontSize:10, fontWeight:600, color:t.muted }}>اليوم · ١١ مايو ٢٠٢٦</div>
          </div>
          {msgs.map((m, i) => {
            const col = uCol[m.name] || t.accent;
            const showName = !m.own && (i === 0 || msgs[i-1].name !== m.name);
            return (
              <div key={i} style={{ display:'flex', flexDirection: m.own ? 'row' : 'row-reverse', alignItems:'flex-start', gap:8, marginBottom: m.reactions&&m.reactions.length ? 14 : 6 }}>
                {/* Avatar for others — in Arabic RTL, others are on the left */}
                {!m.own ? (
                  <div style={{ width:30, height:30, borderRadius:9, background:col, display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:700, color:'white', flexShrink:0, opacity: showName?1:0 }}>{m.ini}</div>
                ) : null}
                <div style={{ maxWidth:'64%', display:'flex', flexDirection:'column', alignItems: m.own ? 'flex-end' : 'flex-start' }}>
                  {showName && <div style={{ fontSize:10, fontWeight:700, color:col, marginBottom:4, marginRight:2 }}>{m.name}</div>}
                  <div style={{ background: m.own ? t.accent : t.panel, color: m.own ? 'white' : t.body, padding:'10px 14px', borderRadius: m.own ? '14px 14px 14px 4px' : '14px 14px 4px 14px', fontSize:13, lineHeight:1.65, boxShadow: m.own ? `0 2px 10px ${t.accent}40` : '0 1px 4px rgba(0,0,0,0.08)', textAlign:'right' }}>
                    {m.text}
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:4, flexDirection: m.own ? 'row' : 'row-reverse' }}>
                    <span style={{ fontSize:9, color:t.muted }}>{m.time}</span>
                    {m.rx && m.rx.length > 0 && (
                      <div style={{ display:'flex', gap:3 }}>
                        {m.rx.map((r,j) => (
                          <div key={j} style={{ display:'inline-flex', alignItems:'center', gap:2, padding:'2px 6px', background:t.panel, border:`1px solid ${t.rule}`, borderRadius:10, fontSize:10 }}>
                            <span>{r.e}</span><span style={{ fontSize:9, fontWeight:700, color:t.muted }}>{r.n}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div style={{ background:t.panel, borderTop:`1px solid ${t.rule}`, padding:'12px 20px', display:'flex', alignItems:'center', gap:10, flexShrink:0 }}>
          <div style={{ width:38, height:38, borderRadius:10, background:t.accent, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:`0 3px 10px ${t.accent}50` }}>
            <ISend c="white" />
          </div>
          <div style={{ flex:1, background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:22, padding:'9px 16px', fontSize:13, color:t.muted, textAlign:'right' }}>اكتب رسالة لمجموعة الطب...</div>
          <div style={{ width:34, height:34, borderRadius:9, background:t.panel2, border:`1px solid ${t.rule}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </div>
          <div style={{ width:34, height:34, borderRadius:9, background:t.panel2, border:`1px solid ${t.rule}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
          </div>
        </div>
      </div>
    </Shell4Ar>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Auth4Ar — Login / Sign-up (standalone, Arabic RTL)
// ─────────────────────────────────────────────────────────────────────────────
export const Auth4Ar: React.FC<{ t: Theme }> = ({ t }) => (
  <div dir="rtl" style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:t.bg, ...SfAr }}>
    <div style={{ width:420 }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:12, justifyContent:'center', marginBottom:32 }}>
        <div style={{ width:42, height:42, borderRadius:12, background:t.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, fontWeight:800, color:'white', boxShadow:`0 3px 14px ${t.accent}50` }}>م</div>
        <div>
          <div style={{ fontSize:20, fontWeight:800, color:t.ink }}>مِشفهم</div>
          <div style={{ fontSize:11, color:t.muted }}>منصة التعلم الذكي</div>
        </div>
      </div>
      {/* Card */}
      <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:18, padding:'32px 32px', boxShadow:'0 8px 32px rgba(0,0,0,0.1)' }}>
        <div style={{ fontSize:22, fontWeight:800, color:t.ink, marginBottom:6, textAlign:'center' }}>مرحباً بعودتك</div>
        <div style={{ fontSize:13, color:t.muted, textAlign:'center', marginBottom:28 }}>سجّل دخولك للمتابعة</div>
        {/* Social login */}
        <div style={{ display:'flex', gap:10, marginBottom:20 }}>
          {['Google','Apple'].map((p,i) => (
            <button key={i} style={{ flex:1, padding:'10px', borderRadius:10, background:t.panel2, border:`1px solid ${t.rule}`, color:t.ink, fontSize:13, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
              <span style={{ fontSize:15 }}>{i===0?'G':'🍎'}</span> {p}
            </button>
          ))}
        </div>
        {/* Divider */}
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:20 }}>
          <div style={{ flex:1, height:1, background:t.rule }} />
          <span style={{ fontSize:11, color:t.muted }}>أو</span>
          <div style={{ flex:1, height:1, background:t.rule }} />
        </div>
        {/* Fields */}
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:t.ink, display:'block', marginBottom:6 }}>البريد الإلكتروني</label>
            <div style={{ display:'flex', alignItems:'center', gap:10, background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:10, padding:'10px 14px' }}>
              <IMail c={t.muted} />
              <span style={{ fontSize:13, color:t.muted }}>example@email.com</span>
            </div>
          </div>
          <div>
            <label style={{ fontSize:12, fontWeight:600, color:t.ink, display:'block', marginBottom:6 }}>كلمة المرور</label>
            <div style={{ display:'flex', alignItems:'center', gap:10, background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:10, padding:'10px 14px' }}>
              <ILock c={t.muted} />
              <span style={{ fontSize:13, color:t.muted, flex:1 }}>••••••••••</span>
              <span style={{ fontSize:11, color:t.accent, fontWeight:600, cursor:'pointer' }}>نسيت؟</span>
            </div>
          </div>
        </div>
        {/* Submit */}
        <button style={{ width:'100%', marginTop:22, padding:'12px', borderRadius:12, background:t.accent, border:'none', color:'white', fontSize:15, fontWeight:700, cursor:'pointer', boxShadow:`0 4px 14px ${t.accent}40` }}>
          تسجيل الدخول
        </button>
        {/* Sign-up link */}
        <div style={{ textAlign:'center', marginTop:18, fontSize:13, color:t.muted }}>
          ليس لديك حساب؟ <span style={{ color:t.accent, fontWeight:700, cursor:'pointer' }}>أنشئ حساباً</span>
        </div>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Profile4Ar — User Profile (Arabic RTL)
// ─────────────────────────────────────────────────────────────────────────────
export const Profile4Ar: React.FC<{ t: Theme }> = ({ t }) => {
  const stats = [
    { label:'ساعات الدراسة', value:'٢٤٦', icon:<IClock />, color:t.accent },
    { label:'الإنجازات',     value:'١٨',  icon:<IAward />, color:'#d97706' },
    { label:'الاختبارات',   value:'٣٢',  icon:<IClip />,  color:'#16a34a' },
    { label:'الغرف',         value:'١٥',  icon:<IUsers />, color:'#7c3aed' },
  ];
  const badges = [
    { label:'أول تحميل',  color:'#b45309', bg:'#fef3c7', tier:'برونز' },
    { label:'سباق الذاكرة',color:'#6366f1', bg:'#ede9fe', tier:'ذهب'  },
    { label:'١٤ يوم متواصل',color:'#0ea5e9', bg:'#e0f2fe', tier:'فضة'  },
    { label:'الأفضل دراسةً',color:'#d97706', bg:'#fef9c3', tier:'بلاتين'},
  ];
  return (
    <Shell4Ar t={t} active="profile">
      <div style={{ width:'100%', height:'100%', overflowY:'auto', background:t.bg }}>
        {/* Cover + Avatar */}
        <div style={{ height:140, background:`linear-gradient(135deg, ${t.accent}, ${t.accent}99)`, position:'relative' }}>
          <div style={{ position:'absolute', bottom:-36, right:28, width:72, height:72, borderRadius:18, background:t.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:800, color:'white', border:`4px solid ${t.panel}`, boxShadow:`0 4px 16px ${t.accent}50` }}>أ</div>
        </div>
        <div style={{ padding:'44px 28px 28px' }}>
          <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:20 }}>
            <div>
              <div style={{ fontSize:20, fontWeight:800, color:t.ink }}>أحمد الرشيدي</div>
              <div style={{ fontSize:13, color:t.muted, marginTop:2 }}>@ahmed.rashidi · عضو مميز</div>
              <div style={{ fontSize:12, color:t.muted, marginTop:4 }}>طالب طب · جامعة الملك سعود · المستوى الرابع</div>
            </div>
            <button style={{ padding:'9px 20px', borderRadius:10, background:t.accent, border:'none', color:'white', fontSize:13, fontWeight:700, cursor:'pointer' }}>تعديل الملف</button>
          </div>

          {/* Stats */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:22 }}>
            {stats.map((s,i) => (
              <div key={i} style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:12, padding:'14px 16px', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:34, height:34, borderRadius:9, background:`${s.color}18`, border:`1px solid ${s.color}30`, display:'flex', alignItems:'center', justifyContent:'center', color:s.color, flexShrink:0 }}>{s.icon}</div>
                <div>
                  <div style={{ fontSize:18, fontWeight:800, color:t.ink }}>{s.value}</div>
                  <div style={{ fontSize:10, color:t.muted, marginTop:1 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Badges + Level */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:14, padding:'18px' }}>
              <div style={{ fontSize:13, fontWeight:700, color:t.ink, marginBottom:14 }}>الإنجازات المكتسبة</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                {badges.map((b,i) => (
                  <div key={i} style={{ background:b.bg, border:`1.5px solid ${b.color}40`, borderRadius:10, padding:'10px 12px' }}>
                    <div style={{ width:30, height:30, borderRadius:8, background:`${b.color}25`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:6 }}>
                      <IAward c={b.color} />
                    </div>
                    <div style={{ fontSize:11, fontWeight:700, color:b.color, lineHeight:1.3 }}>{b.label}</div>
                    <div style={{ fontSize:9, color:b.color, opacity:0.7, marginTop:2 }}>{b.tier}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:14, padding:'18px' }}>
              <div style={{ fontSize:13, fontWeight:700, color:t.ink, marginBottom:14 }}>مستوى التعلم</div>
              <div style={{ textAlign:'center', marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:t.accent, letterSpacing:'0.08em', marginBottom:4 }}>عالم · المستوى ٤</div>
                <div style={{ fontSize:36, fontWeight:900, color:t.ink, lineHeight:1 }}>١١٠٠</div>
                <div style={{ fontSize:11, color:t.muted, marginTop:4 }}>نقطة خبرة · ٦٨٠ للمستوى ٥</div>
              </div>
              <div style={{ height:8, background:t.rule, borderRadius:4, overflow:'hidden', marginBottom:8 }}>
                <div style={{ width:'62%', height:'100%', background:`linear-gradient(90deg, ${t.accent}, ${t.accent}cc)`, borderRadius:4 }} />
              </div>
              <div style={{ fontSize:11, color:t.muted, textAlign:'center' }}>٦٢٪ نحو المستوى التالي</div>
            </div>
          </div>
        </div>
      </div>
    </Shell4Ar>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Notifications4Ar — Notifications (Arabic RTL)
// ─────────────────────────────────────────────────────────────────────────────
export const Notifications4Ar: React.FC<{ t: Theme }> = ({ t }) => {
  const notifs = [
    { type:'room',    icon:'👥', title:'انضم عمر ر. إلى غرفتك',          sub:'غرفة الفيزيولوجيا الطبية',  time:'منذ ٣ د',   unread:true  },
    { type:'badge',   icon:'🏆', title:'حصلت على إنجاز جديد!',            sub:'٧ أيام متواصلة من الدراسة', time:'منذ ١ س',   unread:true  },
    { type:'exam',    icon:'📋', title:'اختبار قادم غداً',                 sub:'أساسيات علم الأحياء الخلوي',time:'منذ ٢ س',   unread:true  },
    { type:'share',   icon:'📤', title:'شاركت سارة ك. بطاقات معك',         sub:'مجموعة الكيمياء العضوية',   time:'منذ ٣ س',   unread:false },
    { type:'room',    icon:'👥', title:'بدأت الجلسة المباشرة لغرفتك',      sub:'مجموعة الأحياء الجزيئية',   time:'منذ ٥ س',   unread:false },
    { type:'system',  icon:'✅', title:'اكتمل تحليل ملفك',                 sub:'علم التشريح البشري — الوحدة ٤',time:'أمس',      unread:false },
  ];
  const typeColor = { room:'#6366f1', badge:'#d97706', exam:'#ef4444', share:'#10b981', system:'#0ea5e9' };
  const cats = ['الكل','غير مقروءة','الغرف','الإنجازات','النظام'];
  return (
    <Shell4Ar t={t} active="notifications">
      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', background:t.bg }}>
        <div style={{ background:t.panel, borderBottom:`1px solid ${t.rule}`, padding:'0 24px', height:52, display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ display:'flex', gap:6 }}>
            {cats.map((c,i) => (
              <div key={i} style={{ padding:'5px 14px', borderRadius:20, background: i===0 ? t.accent : t.panel2, color: i===0 ? 'white' : t.muted, fontSize:12, fontWeight:600, cursor:'pointer', border:`1px solid ${i===0 ? t.accent : t.rule}` }}>{c}</div>
            ))}
          </div>
          <span style={{ fontSize:12, color:t.accent, fontWeight:600, cursor:'pointer' }}>تحديد الكل كمقروء</span>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'14px 24px', display:'flex', flexDirection:'column', gap:8 }}>
          {notifs.map((n, i) => {
            const col = typeColor[n.type] || t.accent;
            return (
              <div key={i} style={{ background:t.panel, border:`1px solid ${n.unread ? col+'40' : t.rule}`, borderRadius:14, padding:'14px 16px', display:'flex', alignItems:'flex-start', gap:12, position:'relative' }}>
                {n.unread && <div style={{ position:'absolute', top:14, left:16, width:8, height:8, borderRadius:'50%', background:col }} />}
                <div style={{ width:40, height:40, borderRadius:12, background:`${col}18`, border:`1px solid ${col}30`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, flexShrink:0 }}>{n.icon}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight: n.unread ? 700 : 500, color:t.ink, marginBottom:3 }}>{n.title}</div>
                  <div style={{ fontSize:12, color:t.muted }}>{n.sub}</div>
                </div>
                <div style={{ fontSize:11, color:t.muted, flexShrink:0 }}>{n.time}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Shell4Ar>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Quiz4Ar — Quiz Active (Arabic RTL)
// ─────────────────────────────────────────────────────────────────────────────
export const Quiz4Ar: React.FC<{ t: Theme }> = ({ t }) => {
  const opts = [
    { label:'أ', text:'تزيد قوة انقباض عضلة القلب مع زيادة الامتداد الأولي', correct:true  },
    { label:'ب', text:'تقل قوة انقباض عضلة القلب مع زيادة حجم الدم العائد', correct:false },
    { label:'ج', text:'لا تتأثر قوة الانقباض بحجم الامتداد الأولي للألياف',  correct:false },
    { label:'د', text:'تعتمد قوة الانقباض فقط على تركيز الكالسيوم في الدم',  correct:false },
  ];
  return (
    <Shell4Ar t={t} active="exams">
      <div dir="rtl" style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', background:t.bg, ...SfAr }}>
        {/* Progress header */}
        <div style={{ background:t.panel, borderBottom:`1px solid ${t.rule}`, padding:'0 24px', height:52, display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
          <div style={{ flex:1, height:6, background:t.rule, borderRadius:3, overflow:'hidden' }}>
            <div style={{ width:'40%', height:'100%', background:t.accent, borderRadius:3 }} />
          </div>
          <span style={{ fontSize:13, fontWeight:700, color:t.ink, flexShrink:0 }}>٤ / ١٠</span>
          <div style={{ display:'flex', alignItems:'center', gap:6, background:'#ef444420', border:'1px solid #ef444440', borderRadius:20, padding:'4px 12px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span style={{ fontSize:12, fontWeight:700, color:'#ef4444' }}>٠١:٤٥</span>
          </div>
        </div>
        {/* Question */}
        <div style={{ flex:1, overflowY:'auto', padding:'32px 48px' }}>
          <div style={{ fontSize:11, fontWeight:700, color:t.accent, letterSpacing:'0.08em', marginBottom:10 }}>السؤال الرابع</div>
          <div style={{ fontSize:17, fontWeight:700, color:t.ink, lineHeight:1.7, marginBottom:28, textAlign:'right' }}>
            وفقاً لقانون فرانك-ستارلينغ في فيزيولوجيا القلب، ما هي العلاقة بين الامتداد الأولي لألياف عضلة القلب وقوة انقباضها؟
          </div>
          {/* Options */}
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {opts.map((o, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', borderRadius:12, background: i===0 ? `${t.accent}15` : t.panel, border:`1.5px solid ${i===0 ? t.accent : t.rule}`, cursor:'pointer' }}>
                <div style={{ width:32, height:32, borderRadius:9, background: i===0 ? t.accent : t.panel2, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:`1.5px solid ${i===0 ? t.accent : t.rule}` }}>
                  <span style={{ fontSize:13, fontWeight:700, color: i===0 ? 'white' : t.muted }}>{o.label}</span>
                </div>
                <span style={{ fontSize:14, color: i===0 ? t.ink : t.body, fontWeight: i===0 ? 600 : 400, lineHeight:1.5, flex:1, textAlign:'right' }}>{o.text}</span>
              </div>
            ))}
          </div>
          {/* Nav buttons */}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:28 }}>
            <button style={{ padding:'10px 24px', borderRadius:10, background:t.panel2, border:`1px solid ${t.rule}`, color:t.muted, fontSize:13, fontWeight:600, cursor:'pointer' }}>التالي ←</button>
            <button style={{ padding:'10px 24px', borderRadius:10, background:t.panel2, border:`1px solid ${t.rule}`, color:t.muted, fontSize:13, fontWeight:600, cursor:'pointer' }}>→ السابق</button>
          </div>
        </div>
      </div>
    </Shell4Ar>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// makeAr — generates all Arabic RTL artboards for a theme key
// ─────────────────────────────────────────────────────────────────────────────
