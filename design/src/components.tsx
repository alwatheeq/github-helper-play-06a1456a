import React from 'react';
import type { Theme } from './theme';

// Scholar v4 — themed sidebar (navy/oxblood/etc), custom SVG icons, light + dark per theme

// ===== Custom inline SVG icon set (single stroke style) =====
export const Ic = {
  dash: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h10l4 4v12H5z" /><path d="M15 4v4h4" /><path d="M9 13l2 2 4-4" /></svg>,
  lib: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h4a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2H4z" /><path d="M20 4h-4a2 2 0 0 0-2 2v14a2 2 0 0 1 2-2h4z" /><path d="M12 6v14" /></svg>,
  qz: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 4h11l4 4v12H5z" /><path d="M16 4v4h4" /><path d="M9 12h6M9 15h4" /></svg>,
  play: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="7" width="18" height="12" rx="3" /><path d="M7 12h2M8 11v2" /><circle cx="15" cy="11" r=".7" fill={c} /><circle cx="17" cy="13" r=".7" fill={c} /></svg>,
  room: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="6" width="14" height="10" rx="1.5" /><path d="M17 9l4-2v10l-4-2z" /></svg>,
  aca: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6l8-3 8 3-8 3z" /><path d="M8 8v7M16 8v7M4 6v9M20 6v9" /><path d="M4 15h16" /></svg>,
  hist: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7" /><path d="M3 4v5h5" /><path d="M12 8v5l3 2" /></svg>,
  about: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M12 11v5" /><circle cx="12" cy="8" r=".7" fill={c} /></svg>,
  fb: (c) => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v9H10l-4 4v-4H4z" /><path d="M8 8h8M8 11h5" /></svg>,
  bell: (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 16V11a6 6 0 1 1 12 0v5l1.5 2H4.5z" /><path d="M10 20a2 2 0 0 0 4 0" /></svg>,
  spark: (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6" /></svg>,
  search: (c) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="6" /><path d="m20 20-4.3-4.3" /></svg>,
  upload: (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4m0 0-4 4m4-4 4 4" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></svg>,
  doc: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" /><path d="M14 3v5h5" /></svg>,
  paste: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4h6v3H9z" /><path d="M5 7h14v13H5z" /><path d="M8 12h8M8 15h6" /></svg>,
  ocr: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3" /><path d="M8 12h8" /></svg>,
  plus: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>,
  arrow: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>,
  globe: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" /></svg>,
  user: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6" /></svg>,
  heart: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" /></svg>,
  group: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="9" r="3" /><circle cx="17" cy="10" r="2.2" /><path d="M3 19c.5-3 3-5 6-5s5.5 2 6 5" /></svg>,
  bulb: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1.5 2 1.5 3h5c0-1 .5-2 1.5-3a6 6 0 0 0-4-10z" /></svg>,
  chat: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5h16v11H8l-4 4z" /></svg>,
  trend: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 17l6-6 4 4 8-8" /><path d="M14 7h7v7" /></svg>,
  target: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill={c} /></svg>,
  folder: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></svg>,
  mail: (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
};

// ===== Theme palettes — both light & dark per family =====
// Sidebar uses INK as background (the brand-dark color) for strong identity

export const Sf4 = { fontFamily: "'Fraunces', Georgia, serif" };

export const Header4: React.FC<{ t: Theme }> = ({ t }) =>
<div style={{ height: 60, borderBottom: `1px solid ${t.rule}`, background: t.panel, display: "flex", alignItems: "center", padding: "0 24px", gap: 18, flexShrink: 0 }}>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 30, height: 30, background: t.ink, color: t.bg, display: "grid", placeItems: "center", ...Sf4, fontSize: 17, fontWeight: 700, borderRadius: 6 }}>M</div>
      <div style={{ ...Sf4, fontSize: 19, fontWeight: 600, color: t.ink, letterSpacing: -0.3 }}>MeshFahem</div>
    </div>
    <div style={{ flex: 1, textAlign: "center", ...Sf4, fontSize: 14, color: t.muted }}>This is just the beginning, there is better to come</div>
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 14px", border: `1px solid ${t.rule}`, borderRadius: 999, background: t.panel2 }}>
      {Ic.spark(t.accent)}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.1 }}>
        <span style={{ fontSize: 9, letterSpacing: 1.5, color: t.muted, textTransform: "uppercase", fontWeight: 700 }}>Credits</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: t.ink }}>5,200</span>
      </div>
    </div>
    <div style={{ width: 36, height: 36, borderRadius: 999, background: t.chip, border: `1px solid ${t.rule}`, display: "grid", placeItems: "center" }}>{Ic.bell(t.body)}</div>
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: 999, background: t.accent, color: t.panel, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 700 }}>J</div>
      <div style={{ lineHeight: 1.2 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: t.ink }}>johntommy <span style={{ fontSize: 10, color: t.accent, fontWeight: 700, marginLeft: 4 }}>Standard</span></div>
        <div style={{ fontSize: 11, color: t.muted }}>johntommy@tt.com</div>
      </div>
    </div>
  </div>;


export const Side4: React.FC<{ t: Theme; active: string }> = ({ t, active }) => {
  const items = [
  { l: "Dashboard", d: "process & today", k: "dash", I: Ic.dash },
  { l: "My Library", d: "saved works", k: "lib", I: Ic.lib },
  { l: "Study Rooms", d: "live with peers", k: "room", I: Ic.room },
  { l: "Academics", d: "courses & progress", k: "aca", I: Ic.aca },
  { l: "Examinations", d: "quizzes & exams", k: "qz", I: Ic.qz },
  { l: "EduPlay", d: "play & learn", k: "play", I: Ic.play },
  { l: "History", d: "recent activity", k: "hist", I: Ic.hist },
  { l: "Feedback", d: "write to us", k: "fb", I: Ic.fb }];

  return (
    <div style={{ width: 244, background: t.sb, color: t.sbInk, display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden", borderRight: `1px solid ${t.sbActive}33`, position: "relative" }}>
      <div style={{ padding: "20px 0 10px", flex: 1 }}>
        {items.map((it) => {
          const on = it.k === active;
          return (
            <div key={it.k} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 20px", background: on ? t.sbActive + "1A" : "transparent", cursor: "pointer", position: "relative" }}>
              {on && <div style={{ position: "absolute", left: 0, top: 6, bottom: 6, width: 3, background: t.sbActive }} />}
              <div style={{ width: 18, display: "grid", placeItems: "center", flexShrink: 0 }}>{it.I(on ? t.sbActive : t.sbMuted)}</div>
              <div style={{ lineHeight: 1.2, flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: on ? t.sbActive : t.sbInk, letterSpacing: -0.1 }}>{it.l}</div>
                <div style={{ ...Sf4, fontSize: 10.5, color: t.sbMuted, marginTop: 1 }}>{it.d}</div>
              </div>
            </div>);

        })}
      </div>

      {/* Pull-quote footer */}
      <div style={{ padding: "14px 20px 16px", borderTop: `1px solid ${t.sbActive}26` }}>
        <div style={{ ...Sf4, fontSize: 11.5, color: t.sbInk, lineHeight: 1.45 }}>"Read with the pen, write with the mind."</div>
        <div style={{ fontSize: 10, color: t.sbMuted, fontWeight: 600, marginTop: 8, letterSpacing: 0.3 }}>© 2026 MeshFahem</div>
      </div>
    </div>);

};

export const Shell4: React.FC<{ t: Theme; active: string; children?: React.ReactNode }> = ({ t, active, children }) =>
<div style={{ width: 1280, height: 820, background: t.bg, color: t.body, fontFamily: "Inter, sans-serif", display: "flex", flexDirection: "column", overflow: "hidden" }}>
    <Header4 t={t} />
    <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
      <Side4 t={t} active={active} />
      <div style={{ flex: 1, overflow: "hidden", padding: "26px 32px" }}>{children}</div>
    </div>
  </div>;


export const Btn4: React.FC<{ t: Theme; primary?: boolean; children?: React.ReactNode; icon?: React.ReactNode }> = ({ t, primary, children, icon }) =>
<button style={{ padding: "9px 16px", background: primary ? t.ink : t.panel, color: primary ? t.bg : t.ink, border: primary ? `1px solid ${t.ink}` : `1px solid ${t.rule}`, fontSize: 13, fontWeight: 600, fontFamily: "inherit", borderRadius: 6, display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
    {icon}{children}
  </button>;


export const Title4: React.FC<{ t: Theme; title: string; sub?: string; right?: React.ReactNode; IconC?: (c: string, s?: number) => React.ReactNode }> = ({ t, title, sub, right, IconC }) =>
<div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, paddingBottom: 14, borderBottom: `1px solid ${t.rule}` }}>
    <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      {IconC && <div style={{ width: 44, height: 44, borderRadius: 10, background: t.accentSoft, display: "grid", placeItems: "center", flexShrink: 0 }}>{IconC(t.accent, 24)}</div>}
      <div>
        <h1 style={{ ...Sf4, fontSize: 32, fontWeight: 600, color: t.ink, margin: "0 0 4px", letterSpacing: -0.6 }}>{title}</h1>
        <p style={{ fontSize: 13, color: t.muted, margin: 0 }}>{sub}</p>
      </div>
    </div>
    {right}
  </div>;


// ============== DASHBOARD = Process content ==============
export const Dash4: React.FC<{ t: Theme }> = ({ t }) => {
  const [qCount, setQCount] = React.useState(10);
  const [tipIdx, setTipIdx] = React.useState(0);

  const tips = [
    "Drop a chapter and its lecture slides together — the overlap sharpens every card.",
    "Use the Scan tab for handwritten notes or printed pages without a digital copy.",
    "Long PDFs? Focus on one chapter at a time for cleaner, more precise output.",
    "Run an Examination right after Flashcards to test what you just studied.",
    "The more context you give, the richer and more accurate the mind map.",
    "Arabic and English sources can be mixed — we handle both fluently.",
    "Open-ended questions push deeper recall than multiple choice alone.",
    "Combine a textbook chapter with your lecture notes for the sharpest cards.",
  ];

  React.useEffect(() => {
    const id = setInterval(() => setTipIdx(i => (i + 1) % tips.length), 4500);
    return () => clearInterval(id);
  }, []);

  const TI = {
    File: (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3h9l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 16h4"/></svg>,
    Text: (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 10h16M4 14h12M4 18h8"/></svg>,
    Scan: (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8V6a2 2 0 0 1 2-2h2M20 8V6a2 2 0 0 0-2-2h-2M4 16v2a2 2 0 0 0 2 2h2M20 16v2a2 2 0 0 1-2 2h-2"/><path d="M4 12h16"/></svg>,
    URL:  (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>,
  };

  return (
    <Shell4 t={t} active="dash">
      <div style={{ marginBottom: 22 }}>
        <div style={{ fontSize: 10, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>The Workshop</div>
        <h1 style={{ ...Sf4, fontSize: 38, fontWeight: 600, color: t.ink, margin: "6px 0 4px", letterSpacing: -0.8 }}>Process your content.</h1>
        <p style={{ ...Sf4, fontSize: 13, color: t.muted, margin: 0 }}>bring in a document, paste text, or scan a page — we'll do the rest.</p>
        <div style={{ height: 1, background: t.ink, marginTop: 16, opacity: 0.8 }} />
      </div>

      <div style={{ display: "flex", gap: 28, marginBottom: 20, paddingLeft: 2 }}>
        {[{ l: "File", a: 1 }, { l: "Text" }, { l: "Scan" }, { l: "URL" }].map((tab, i) =>
          <div key={i} style={{ height: 38, padding: "0 2px", cursor: "pointer", color: tab.a ? t.ink : t.muted, fontSize: 13, fontWeight: tab.a ? 600 : 500, borderBottom: tab.a ? `2px solid ${t.accent}` : "2px solid transparent", display: "flex", alignItems: "center", gap: 7 }}>
            {TI[tab.l](tab.a ? t.accent : t.muted)}
            {tab.l}
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 22 }}>
        <div>
          <div style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: "18px" }}>
            <div style={{ border: `1.5px dashed ${t.rule}`, padding: "26px 20px", textAlign: "center" }}>
              <div style={{ width: 36, height: 36, margin: "0 auto", display: "grid", placeItems: "center" }}>{Ic.upload(t.muted)}</div>
              <div style={{ ...Sf4, fontSize: 22, fontWeight: 600, color: t.ink, marginTop: 12, lineHeight: 1.25 }}>Drop your file here,<br /><span style={{ color: t.muted, fontWeight: 400 }}>or click to browse.</span></div>
              <div style={{ fontSize: 12, color: t.muted, marginTop: 8, ...Sf4 }}>PDF, PPTX, DOCX · up to 400 pages</div>
              <div style={{ marginTop: 18 }}><span style={{ display: "inline-block", padding: "10px 24px", background: t.ink, color: t.bg, fontSize: 13, ...Sf4, fontWeight: 500 }}>Choose a file →</span></div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: t.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Recently processed</div>
            {[
              { i: "i.",   n: "Microeconomics-Ch7.pdf",       s: "32 cards drawn",    d: "2 min ago" },
              { i: "ii.",  n: "Anatomy-Lecture-12.pptx",      s: "summary written",   d: "1 hour ago" },
              { i: "iii.", n: "Cell-signaling.pdf",            s: "processing · 76%",  d: "now" },
              { i: "iv.",  n: "Linear-Algebra-midterm.pdf",   s: "48 cards drawn",    d: "yesterday" },
              { i: "v.",   n: "WW2-timeline.docx",             s: "summary written",   d: "Apr 24" }].
            map((r, i) =>
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 12, padding: "10px 0", borderBottom: i < 4 ? `1px solid ${t.rule}` : "none" }}>
                <span style={{ ...Sf4, fontSize: 12, color: t.accent, width: 22 }}>{r.i}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.ink }}>{r.n}</div>
                  <div style={{ ...Sf4, fontSize: 11.5, color: t.muted, marginTop: 1 }}>{r.s} · {r.d}</div>
                </div>
                <Btn4 t={t}>Open</Btn4>
              </div>
            )}
          </div>
        </div>

        <div>
          <div style={{ background: t.ink, color: t.bg, padding: 22, marginBottom: 14 }}>
            <div style={{ fontSize: 10, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>What to generate</div>
            <div style={{ marginTop: 14 }}>
              {[
                { l: "Summary",     d: "concise notes",              on: 1 },
                { l: "Flashcards",  d: "for spaced review",          on: 1 },
                { l: "Examination", d: "MCQ · fill-in · open ended", on: 0 },
                { l: "Mind map",    d: "visual outline",              on: 0 }
              ].map((o, i) =>
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 3 ? `1px solid ${t.accent}33` : "none" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.bg }}>{o.l}</div>
                    <div style={{ ...Sf4, fontSize: 11, color: t.accent, marginTop: 1 }}>{o.d}</div>
                  </div>
                  <div style={{ width: 34, height: 18, background: o.on ? t.accent : t.accent + "33", borderRadius: 999, padding: 3, flexShrink: 0 }}>
                    <div style={{ width: 12, height: 12, background: t.bg, borderRadius: 999, marginLeft: o.on ? 16 : 0 }} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderTop: `1px solid ${t.accent}33`, marginTop: 2 }}>
              <div>
                <div style={{ fontSize: 10, letterSpacing: 1.5, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>Questions</div>
                <div style={{ ...Sf4, fontSize: 10.5, color: t.bg, opacity: 0.45, marginTop: 1 }}>per examination</div>
              </div>
              <div style={{ display: "flex", alignItems: "stretch" }}>
                <button onClick={() => setQCount(c => Math.max(5, c - 5))} style={{ width: 28, height: 28, background: "transparent", border: `1px solid ${t.accent}55`, color: t.accent, fontSize: 18, fontWeight: 300, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "inherit", lineHeight: 1 }}>−</button>
                <div style={{ width: 38, height: 28, borderTop: `1px solid ${t.accent}55`, borderBottom: `1px solid ${t.accent}55`, display: "grid", placeItems: "center", ...Sf4, fontSize: 14, color: t.bg }}>{qCount}</div>
                <button onClick={() => setQCount(c => Math.min(50, c + 5))} style={{ width: 28, height: 28, background: "transparent", border: `1px solid ${t.accent}55`, color: t.accent, fontSize: 18, fontWeight: 300, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "inherit", lineHeight: 1 }}>+</button>
              </div>
            </div>

            <div style={{ paddingTop: 14, borderTop: `1px solid ${t.accent}40` }}>
              <div style={{ ...Sf4, fontSize: 11, color: t.accent, marginBottom: 10 }}>8 credits</div>
              <span style={{ display: "block", width: "100%", padding: "10px 0", background: t.accent, color: t.ink, fontSize: 13, ...Sf4, fontWeight: 600, textAlign: "center" }}>Generate →</span>
            </div>
          </div>

          <div style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: "16px 18px", minHeight: 76 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>
              {String(tipIdx + 1).padStart(2, "0")} / {String(tips.length).padStart(2, "0")}
            </div>
            <div style={{ ...Sf4, fontSize: 13, color: t.ink, lineHeight: 1.6 }}>{tips[tipIdx]}</div>
          </div>
        </div>
      </div>
    </Shell4>
  );
};

// ============== LIBRARY ==============
export const Lib4: React.FC<{ t: Theme }> = ({ t }) => {
  const [tab, setTab] = React.useState("all");
  const [topic, setTopic] = React.useState("all");
  const [filterOpen, setFilterOpen] = React.useState(false);
  const [activeTag, setActiveTag] = React.useState(null);
  const [sortBy, setSortBy] = React.useState("date");

  const SCOL = {
    math:    { bg: "#1C3555", txt: "#E8DFC8" },
    physics: { bg: "#2A3E4A", txt: "#D8E8E0" },
    chem:    { bg: "#3A2E1E", txt: "#F0DCBC" },
    bio:     { bg: "#2E4228", txt: "#D8E8C8" },
    cs:      { bg: "#1A2A48", txt: "#C8D8F0" },
    econ:    { bg: "#6B4E1A", txt: "#F8EDD0" },
    psy:     { bg: "#4A2830", txt: "#F0D8DC" },
    hist:    { bg: "#3A3020", txt: "#F0E8C8" },
    lit:     { bg: "#DDD5B8", txt: "#2A2218" },
  };

  const topics = [
    { k: "all",     l: "All topics",    n: 24 },
    { k: "math",    l: "Mathematics",   n: 5  },
    { k: "bio",     l: "Biology",       n: 4  },
    { k: "cs",      l: "Computer Sci.", n: 4  },
    { k: "physics", l: "Physics",       n: 3  },
    { k: "econ",    l: "Economics",     n: 2  },
    { k: "chem",    l: "Chemistry",     n: 2  },
    { k: "hist",    l: "History",       n: 2  },
    { k: "psy",     l: "Psychology",    n: 1  },
    { k: "lit",     l: "Literature",    n: 1  },
  ];

  const tabs = [
    { k: "all",       l: "All",       n: 24 },
    { k: "mine",      l: "Mine",      n: 19 },
    { k: "community", l: "Community", n: 5  },
    { k: "liked",     l: "Liked",     n: 7  },
  ];

  const volumes = [
    { title: "Microeconomics — Ch. 7", subj: "ECN101", topic: "econ",    format: "32 cards", m: 78,  date: "today"     },
    { title: "Anatomy Lecture XII",     subj: "BIO205", topic: "bio",     format: "Summary",  m: 100, date: "yesterday" },
    { title: "Notes on Kahneman",       subj: "PSY110", topic: "psy",     format: "24 cards", m: 45,  date: "Apr 24"    },
    { title: "Linear Algebra Midterm",  subj: "MAT201", topic: "math",    format: "Quiz",     m: 92,  date: "Apr 22"    },
    { title: "CS161 — Algorithms",      subj: "CSC161", topic: "cs",      format: "48 cards", m: 60,  date: "Apr 20"    },
    { title: "WW2 Timeline",            subj: "HIS210", topic: "hist",    format: "Summary",  m: 100, date: "Apr 18"    },
    { title: "Cell Signaling",          subj: "BIO320", topic: "bio",     format: "Mind map", m: 100, date: "Apr 16"    },
    { title: "Quantum Mechanics",       subj: "PHY301", topic: "physics", format: "Summary",  m: 64,  date: "Apr 14"    },
    { title: "Organic Synthesis",       subj: "CHM240", topic: "chem",    format: "32 cards", m: 52,  date: "Apr 12"    },
    { title: "Borges — Labyrinths",     subj: "LIT110", topic: "lit",     format: "Notes",    m: 30,  date: "Apr 10"    },
  ];

  const tagOptions = ["Flashcards", "Summary", "Mind map", "Quiz", "Notes"];
  const sortOptions = [
    { k: "date",    l: "Date added" },
    { k: "mastery", l: "Mastery" },
    { k: "title",   l: "Title A–Z" },
    { k: "format",  l: "Format" },
  ];

  const tagMatches = (v, tag) => {
    if (!tag) return true;
    const f = v.format.toLowerCase();
    if (tag === "Flashcards") return f.includes("card");
    if (tag === "Mind map")   return f.includes("mind");
    return f.includes(tag.toLowerCase());
  };

  const visible = volumes
    .filter(v => (topic === "all" || v.topic === topic) && tagMatches(v, activeTag))
    .sort((a, b) => {
      if (sortBy === "mastery") return b.m - a.m;
      if (sortBy === "title")   return a.title.localeCompare(b.title);
      if (sortBy === "format")  return a.format.localeCompare(b.format);
      return 0; // date: keep original order
    });

  const hasFilters = activeTag || sortBy !== "date";

  // Bookshelf ranking: "all" = one spine per subject sorted by count; filtered = individual volumes sorted by mastery desc
  const shelfItems = topic === "all"
    ? topics.filter(tp => tp.k !== "all").map(tp => {
        const vols = volumes.filter(v => v.topic === tp.k);
        const avgM = vols.length ? Math.round(vols.reduce((s, v) => s + v.m, 0) / vols.length) : 50;
        return { key: tp.k, label: tp.l, sub: tp.n + " vol.", col: SCOL[tp.k] || SCOL.hist, m: avgM };
      })
    : [...volumes.filter(v => v.topic === topic)].sort((a, b) => b.m - a.m)
        .map(v => ({ key: v.subj, label: v.title, sub: v.subj, col: SCOL[v.topic] || SCOL.hist, m: v.m }));

  const activeLabel = topics.find(tp => tp.k === topic)?.l || "All";

  return (
    <Shell4 t={t} active="lib">
      {/* Header */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>Twenty-four volumes catalogued</div>
        <h1 style={{ ...Sf4, fontSize: 38, fontWeight: 600, color: t.ink, margin: "6px 0 4px", letterSpacing: -0.8 }}>The Library.</h1>
        <p style={{ ...Sf4, fontSize: 13, color: t.muted, margin: 0 }}>indexed by subject, by date, by hand.</p>
        <div style={{ height: 1, background: t.ink, marginTop: 14, opacity: 0.8 }} />
      </div>

      {/* Bookshelf ranking bar */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 7 }}>
          <span style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>
            {topic === "all" ? "By subject — most volumes first" : `${activeLabel} — ranked by mastery`}
          </span>
          <div style={{ flex: 1, height: 1, background: t.rule }} />
          <span style={{ ...Sf4, fontSize: 10, color: t.muted }}>scroll →</span>
        </div>
        <div style={{ overflowX: "auto", paddingBottom: 2 }}>
          <div style={{ display: "flex", gap: 4, alignItems: "flex-end", minWidth: "max-content" }}>
            {shelfItems.map((item) => (
              <div key={item.key} style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ width: 56, height: 155, background: item.col.bg, position: "relative", overflow: "hidden", cursor: "pointer" }}>
                  {/* Mastery fill from bottom */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: `${item.m}%`, background: t.accent, opacity: 0.3 }} />
                  {/* Rotated title — centered by transform-origin */}
                  <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%) rotate(-90deg)", whiteSpace: "nowrap", maxWidth: 148, overflow: "hidden", textOverflow: "ellipsis", textAlign: "center", ...Sf4, fontSize: 11, fontWeight: 600, color: item.col.txt }}>
                    {item.label}
                  </div>
                </div>
                <div style={{ fontSize: 7.5, letterSpacing: 1.2, color: t.muted, fontWeight: 700, textTransform: "uppercase", marginTop: 4, textAlign: "center", lineHeight: 1.3 }}>
                  {item.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height: 5, background: t.ink, opacity: 0.85, marginTop: 3 }} />
      </div>

      {/* Body: topics sidebar + catalogue */}
      <div style={{ display: "grid", gridTemplateColumns: "190px 1fr", gap: 28 }}>
        {/* Topics sidebar */}
        <aside>
          <div style={{ fontSize: 10, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Topics</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {topics.map(tp => {
              const active = topic === tp.k;
              return (
                <button key={tp.k} onClick={() => setTopic(tp.k)}
                  style={{ background: active ? t.accentSoft : "transparent", border: "none", borderLeft: active ? `2px solid ${t.accent}` : "2px solid transparent", padding: "8px 10px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "baseline", color: active ? t.accent : t.body, fontSize: 13, fontWeight: active ? 600 : 500, textAlign: "left" }}>
                  <span>{tp.l}</span>
                  <span style={{ ...Sf4, fontSize: 11, color: active ? t.accent : t.muted }}>{tp.n}</span>
                </button>
              );
            })}
          </div>
          <div style={{ height: 1, background: t.rule, margin: "14px 0" }} />
          <button style={{ background: "transparent", border: "none", color: t.muted, ...Sf4, fontSize: 12, cursor: "pointer", padding: 0 }}>+ new topic</button>
        </aside>

        {/* Catalogue */}
        <div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 16, borderBottom: `1px solid ${t.rule}`, paddingBottom: 2 }}>
            <div style={{ display: "flex", gap: 22, alignItems: "baseline", flex: 1 }}>
              {tabs.map(tb => {
                const active = tab === tb.k;
                return (
                  <button key={tb.k} onClick={() => setTab(tb.k)}
                    style={{ background: "transparent", border: "none", cursor: "pointer", padding: "2px 0 6px", color: active ? t.ink : t.muted, borderBottom: active ? `2px solid ${t.accent}` : "2px solid transparent", fontSize: 14, fontWeight: active ? 600 : 500, ...Sf4, marginBottom: -3 }}>
                    <span style={{  }}>{tb.l}</span>
                    <span style={{ fontSize: 12, color: t.muted, marginLeft: 4 }}>({tb.n})</span>
                  </button>
                );
              })}
            </div>

            {/* Filter/sort icon button */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setFilterOpen(o => !o)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 0 6px", background: "transparent", border: "none", borderBottom: (filterOpen || hasFilters) ? `2px solid ${t.accent}` : "2px solid transparent", cursor: "pointer", color: (filterOpen || hasFilters) ? t.accent : t.muted, marginBottom: -3 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M7 12h10M10 18h4"/></svg>
                <span style={{ fontSize: 13, fontWeight: (filterOpen || hasFilters) ? 600 : 500, fontFamily: "inherit", ...Sf4 }}>Filter &amp; Sort</span>
                {hasFilters && <span style={{ width: 5, height: 5, borderRadius: 999, background: t.accent }} />}
              </button>

              {filterOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 6px)", right: 0, width: 240, background: t.panel, border: `1px solid ${t.rule}`, borderRadius: 4, zIndex: 10, padding: 16, boxShadow: "0 6px 20px rgba(0,0,0,0.1)" }}>

                  {/* Tags */}
                  <div style={{ fontSize: 9, letterSpacing: 2, color: t.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Tag</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 14 }}>
                    {tagOptions.map(tag => {
                      const on = activeTag === tag;
                      return (
                        <button key={tag} onClick={() => setActiveTag(on ? null : tag)}
                          style={{ padding: "4px 10px", border: `1px solid ${on ? t.accent : t.rule}`, background: on ? t.accentSoft : "transparent", color: on ? t.accent : t.body, borderRadius: 999, fontSize: 11.5, fontWeight: on ? 600 : 400, cursor: "pointer", fontFamily: "inherit" }}>
                          {tag}
                        </button>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: t.rule, marginBottom: 12 }} />

                  {/* Sort */}
                  <div style={{ fontSize: 9, letterSpacing: 2, color: t.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Sort by</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {sortOptions.map(opt => {
                      const on = sortBy === opt.k;
                      return (
                        <button key={opt.k} onClick={() => setSortBy(opt.k)}
                          style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", background: on ? t.accentSoft : "transparent", border: "none", borderRadius: 3, cursor: "pointer", color: on ? t.accent : t.body, fontSize: 12.5, fontWeight: on ? 600 : 400, textAlign: "left", fontFamily: "inherit" }}>
                          <div style={{ width: 14, height: 14, borderRadius: 999, border: `1.5px solid ${on ? t.accent : t.rule}`, background: on ? t.accent : "transparent", flexShrink: 0, display: "grid", placeItems: "center" }}>
                            {on && <div style={{ width: 6, height: 6, borderRadius: 999, background: t.panel }} />}
                          </div>
                          {opt.l}
                        </button>
                      );
                    })}
                  </div>

                  {/* Clear */}
                  {hasFilters && (
                    <button onClick={() => { setActiveTag(null); setSortBy("date"); }}
                      style={{ marginTop: 12, width: "100%", padding: "7px 0", background: "transparent", border: `1px solid ${t.rule}`, borderRadius: 3, fontSize: 12, color: t.muted, cursor: "pointer", fontFamily: "inherit" }}>
                      Clear all
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 110px", gap: 14, padding: "8px 0", borderBottom: `1px solid ${t.rule}`, fontSize: 10, letterSpacing: 2, color: t.muted, fontWeight: 700, textTransform: "uppercase" }}>
            <span>Title</span><span>Subject</span><span>Format</span><span>Catalogued</span>
          </div>
          {visible.map((v, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px 110px", gap: 14, padding: "14px 0", borderBottom: i < visible.length - 1 ? `1px solid ${t.rule}` : "none", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 3, height: 20, background: SCOL[v.topic]?.bg || t.accent, flexShrink: 0, opacity: 0.8 }} />
                <span style={{ ...Sf4, fontSize: 14, fontWeight: 600, color: t.ink }}>{v.title}</span>
              </div>
              <span style={{ fontSize: 11, letterSpacing: 1.5, fontWeight: 700, color: t.body, textTransform: "uppercase" }}>{v.subj}</span>
              <span style={{ ...Sf4, fontSize: 12.5, color: t.muted }}>{v.format}</span>
              <span style={{ ...Sf4, fontSize: 12, color: t.muted }}>{v.date}</span>
            </div>
          ))}
        </div>
      </div>
    </Shell4>
  );
};



// ============== ROOMS (browse-style video lobby) ==============
// ─── shared room header + tab strip helper ───────────────────
const _RoomsHeader = ({ t, activeTab }) => (
  <>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <div>
        <div style={{ fontSize: 10, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>MeshFahem · Live</div>
        <h1 style={{ ...Sf4, fontSize: 38, fontWeight: 600, color: t.ink, margin: "6px 0 4px", letterSpacing: -0.8 }}>Study Rooms.</h1>
        <p style={{ fontSize: 13, color: t.muted, margin: 0 }}>Collaborate live with peers. Join a session or start your own.</p>
      </div>
      <button style={{ padding: "9px 18px", background: activeTab === "create" ? t.accent : t.ink, color: t.bg, border: "none", fontSize: 13, fontWeight: 600, ...Sf4, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 }}>
        {Ic.plus(t.bg)} Create Room
      </button>
    </div>
    <div style={{ height: 1, background: t.ink, marginTop: 14, marginBottom: 16, opacity: 0.8 }} />
    <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 18, borderBottom: `1px solid ${t.rule}`, paddingBottom: 2 }}>
      {[{ k: "browse", l: "Browse Rooms" }, { k: "mine", l: "My Rooms", n: 2 }, { k: "friends", l: "Friends", n: 12 }, { k: "groups", l: "Groups", n: 3 }].map(it => {
        const on = it.k === activeTab;
        return <button key={it.k} style={{ background: "transparent", border: "none", borderBottom: on ? `2px solid ${t.accent}` : "2px solid transparent", padding: "2px 0 6px", cursor: "pointer", color: on ? t.ink : t.muted, fontSize: 13.5, fontWeight: on ? 600 : 500, ...Sf4, marginBottom: -3, display: "inline-flex", alignItems: "baseline", gap: 5 }}>{it.l}{typeof it.n === "number" && <span style={{ fontSize: 11, color: t.muted }}> ({it.n})</span>}</button>;
      })}
      <div style={{ flex: 1 }} />
      {activeTab === "browse" && <span style={{ fontSize: 11, color: t.muted }}>Sort: most active ▾</span>}
      {activeTab === "friends" && <button style={{ padding: "5px 12px", background: "transparent", border: `1px solid ${t.rule}`, color: t.body, fontSize: 11, cursor: "pointer" }}>+ Add friend</button>}
      {activeTab === "groups" && <button style={{ padding: "5px 12px", background: "transparent", border: `1px solid ${t.rule}`, color: t.body, fontSize: 11, cursor: "pointer" }}>+ Create Group</button>}
    </div>
  </>
);

// ─────────────────────────────────────────────────────────────
// Study Rooms — Browse (refined)
// ─────────────────────────────────────────────────────────────
export const Rooms4: React.FC<{ t: Theme }> = ({ t }) => {
  const liveRooms = [
    { title: "Series Convergence Review", host: "Layla A.",  course: "Calculus II",   n: 8,  cap: 20, desc: "Walking through ratio-test problems together. Bring chapter 11.", avatars: ["L","K","R","Y","M"], tools: ["Video","Whiteboard"] },
    { title: "Anatomy Cram Session",      host: "Karim H.", course: "Biology 220",   n: 4,  cap: 15, desc: "Final exam prep — covering chapters 8 to 12.",                   avatars: ["K","R","Y"],        tools: ["Video","Chat"] },
    { title: "Linear Algebra Q&A",        host: "Reem S.",  course: "Math 110",      n: 3,  cap: 10, desc: "Bring your questions from this week's problem sets.",            avatars: ["R","E"],            tools: ["Whiteboard","Screen"] },
  ];
  const scheduled = [
    { title: "Tajweed Reading Circle",  host: "Hassan M.", course: "Quranic Arabic", n: 8, cap: 12, when: "Today · 6:00 PM",    desc: "Group recitation and peer feedback.",     avatars: ["H","L","M","K"], tools: ["Video","Mic"] },
    { title: "CS Algorithms Deep Dive", host: "Yusuf B.",  course: "CS 161",         n: 5, cap: 20, when: "Today · 8:00 PM",    desc: "Dynamic programming — practice problems.", avatars: ["Y","K","R"],     tools: ["Video","Whiteboard","Chat"] },
    { title: "Borges Book Club",        host: "Adel R.",   course: "Literature",     n: 2, cap: 8,  when: "Tomorrow · 5:00 PM", desc: "Weekly discussion of one short story.",    avatars: ["A","D"],         tools: ["Video","Chat"] },
  ];
  const pal = [t.accent, t.body, t.ink, t.muted, t.body];

  const AvatarStack = ({ avatars }) => (
    <div style={{ display: "flex" }}>
      {avatars.slice(0, 4).map((a, i) => (
        <div key={i} style={{ width: 22, height: 22, borderRadius: 999, background: pal[i % pal.length], color: t.bg, display: "grid", placeItems: "center", fontSize: 9.5, fontWeight: 700, border: `2px solid ${t.panel}`, marginLeft: i ? -7 : 0 }}>{a}</div>
      ))}
    </div>
  );

  const RoomCard = ({ r, live }) => (
    <div style={{ background: t.panel, border: `1px solid ${t.rule}`, display: "flex", flexDirection: "column" }}>
      <div style={{ background: live ? t.ink : t.panel2, padding: "11px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ fontSize: 9.5, letterSpacing: 1.5, color: live ? t.accent : t.muted, fontWeight: 700, textTransform: "uppercase" }}>{r.course}</div>
        {live
          ? <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "3px 9px", background: t.accent, color: t.bg, fontSize: 9, letterSpacing: 1.5, fontWeight: 700, textTransform: "uppercase" }}>
              <div style={{ width: 4, height: 4, borderRadius: 999, background: t.bg }} />Live
            </div>
          : <div style={{ fontSize: 11, color: t.accent, fontWeight: 600 }}>{r.when}</div>
        }
      </div>
      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 9 }}>
        <div>
          <div style={{ ...Sf4, fontSize: 17, fontWeight: 600, color: t.ink, lineHeight: 1.2, marginBottom: 3 }}>{r.title}.</div>
          <div style={{ fontSize: 11, color: t.muted }}>hosted by {r.host}</div>
        </div>
        <div style={{ fontSize: 12.5, color: t.body, lineHeight: 1.6 }}>{r.desc}</div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {r.tools.map(tool => (
            <span key={tool} style={{ fontSize: 9, letterSpacing: 1.2, color: t.muted, fontWeight: 700, padding: "2px 7px", border: `1px solid ${t.rule}`, textTransform: "uppercase" }}>{tool}</span>
          ))}
        </div>
      </div>
      <div style={{ padding: "10px 16px", borderTop: `1px solid ${t.rule}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <AvatarStack avatars={r.avatars} />
          <span style={{ fontSize: 11, color: t.muted }}>{r.n} / {r.cap}</span>
        </div>
        {live
          ? <button style={{ padding: "6px 14px", background: t.accent, color: t.bg, border: "none", fontSize: 12, fontWeight: 600, ...Sf4, cursor: "pointer" }}>Join Now</button>
          : <button style={{ padding: "6px 12px", background: "transparent", border: `1px solid ${t.rule}`, color: t.body, fontSize: 11, cursor: "pointer" }}>View</button>
        }
      </div>
    </div>
  );

  const SecHead = ({ label, count, sort }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>{label}</div>
      <span style={{ fontSize: 11, color: t.muted }}>· {count}</span>
      <div style={{ flex: 1, height: 1, background: t.rule }} />
      <span style={{ fontSize: 10, color: t.muted }}>{sort}</span>
    </div>
  );

  return (
    <Shell4 t={t} active="room">
      <_RoomsHeader t={t} activeTab="browse" />
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", background: t.panel, border: `1px solid ${t.rule}`, marginBottom: 22 }}>
        {Ic.search(t.muted)}
        <span style={{ fontSize: 13, color: t.muted }}>Search rooms by name, course, or host…</span>
      </div>
      <SecHead label="Live Now" count="3 rooms" sort="most active" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 22 }}>
        {liveRooms.map((r, i) => <RoomCard key={i} r={r} live />)}
      </div>
      <SecHead label="Scheduled" count="3 upcoming" sort="soonest first" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {scheduled.map((r, i) => <RoomCard key={i} r={r} />)}
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Study Rooms — Create Room composer
// ─────────────────────────────────────────────────────────────
export const Rooms4Create: React.FC<{ t: Theme }> = ({ t }) => {
  const tools = [
    { l: "Video",       on: true  }, { l: "Microphone", on: true  }, { l: "Whiteboard",  on: true  },
    { l: "Screen",      on: false }, { l: "Chat",       on: true  }, { l: "File Share",  on: false },
    { l: "Pomodoro",    on: false }, { l: "AI Tutor",   on: false }, { l: "Recording",   on: false },
  ];
  const invited = ["Layla A.", "Karim H.", "Reem S."];

  return (
    <Shell4 t={t} active="room">
      <_RoomsHeader t={t} activeTab="create" />
      <div style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: "26px 30px" }}>
        <div style={{ fontSize: 9, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 20 }}>New Room</div>

        {/* Room name */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: t.muted, marginBottom: 6 }}>Room name</div>
          <div style={{ borderBottom: `1px solid ${t.ink}`, paddingBottom: 8 }}>
            <span style={{ ...Sf4, fontSize: 20, color: t.muted }}>Name your room…</span>
          </div>
        </div>

        {/* Course */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: t.muted, marginBottom: 6 }}>Course</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: t.bg, border: `1px solid ${t.rule}` }}>
            <span style={{ fontSize: 13, color: t.body }}>Calculus II</span>
            <span style={{ fontSize: 11, color: t.muted }}>▾</span>
          </div>
        </div>

        {/* When — start now or schedule */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: t.muted, marginBottom: 8 }}>When</div>
          <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
            {[["Start now", false], ["Schedule for later", true]].map(([label, active]) => (
              <div key={label} style={{ padding: "7px 16px", border: active ? `2px solid ${t.accent}` : `1px solid ${t.rule}`, background: active ? t.accentSoft : "transparent", color: active ? t.accent : t.body, fontSize: 12, fontWeight: active ? 600 : 400, cursor: "pointer" }}>{label}</div>
            ))}
          </div>
          {/* Schedule fields — shown when "Schedule for later" is active */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[["Date", "Wednesday, May 8"], ["Time", "8:00 PM"]].map(([label, val]) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: t.muted, marginBottom: 5 }}>{label}</div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 12px", background: t.bg, border: `1px solid ${t.rule}` }}>
                  <span style={{ fontSize: 12, color: t.body }}>{val}</span>
                  <span style={{ fontSize: 11, color: t.muted }}>▾</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Privacy */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 11, color: t.muted, marginBottom: 8 }}>Privacy</div>
          <div style={{ display: "flex", gap: 10 }}>
            {[["Private with link", true], ["Public", false]].map(([label, active]) => (
              <div key={label} style={{ padding: "7px 16px", border: active ? `2px solid ${t.accent}` : `1px solid ${t.rule}`, background: active ? t.accentSoft : "transparent", color: active ? t.accent : t.body, fontSize: 12, fontWeight: active ? 600 : 400, cursor: "pointer" }}>{label}</div>
            ))}
          </div>
        </div>

        {/* Tools grid */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>Tools in this room</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: 8 }}>
            {tools.map(tool => (
              <div key={tool.l} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "10px 6px", border: tool.on ? `2px solid ${t.accent}` : `1px solid ${t.rule}`, background: tool.on ? t.accentSoft : "transparent", cursor: "pointer" }}>
                <div style={{ width: 14, height: 14, background: tool.on ? t.accent : t.rule }} />
                <span style={{ fontSize: 9, color: tool.on ? t.accent : t.muted, textAlign: "center", fontWeight: tool.on ? 700 : 400, lineHeight: 1.2 }}>{tool.l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Invite link */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Invite link</div>
          <div style={{ display: "flex", border: `1px solid ${t.rule}` }}>
            <div style={{ flex: 1, padding: "9px 12px", fontSize: 12, color: t.muted, background: t.bg }}>meshfahem.app/rooms/invite/s8kxq7</div>
            <button style={{ padding: "9px 16px", background: t.ink, color: t.bg, border: "none", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Copy</button>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
            {invited.map(name => (
              <div key={name} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", background: t.panel2, border: `1px solid ${t.rule}`, fontSize: 11, color: t.body }}>
                <div style={{ width: 16, height: 16, borderRadius: 999, background: t.accent, color: t.bg, display: "grid", placeItems: "center", fontSize: 8, fontWeight: 700 }}>{name[0]}</div>
                {name}
                <span style={{ color: t.muted, cursor: "pointer" }}>×</span>
              </div>
            ))}
            <div style={{ display: "inline-flex", alignItems: "center", padding: "4px 10px", border: `1px dashed ${t.rule}`, fontSize: 11, color: t.muted, cursor: "pointer" }}>+ Invite someone</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button style={{ padding: "9px 18px", background: "transparent", border: `1px solid ${t.rule}`, color: t.body, fontSize: 13, cursor: "pointer" }}>Cancel</button>
          <button style={{ padding: "9px 22px", background: t.ink, color: t.bg, border: "none", fontSize: 13, fontWeight: 600, ...Sf4, cursor: "pointer" }}>Send the invitation →</button>
        </div>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Study Rooms — Friends tab
// ─────────────────────────────────────────────────────────────
export const Rooms4Friends: React.FC<{ t: Theme }> = ({ t }) => {
  const online = [
    { name:"Layla Al-Ameen", init:"L", status:"studying", studying:"Calculus II — Ch.8",      mutual:3 },
    { name:"Karim Hassan",   init:"K", status:"studying", studying:"Biology 220 — Anatomy",    mutual:5 },
    { name:"Reem Saleh",     init:"R", status:"online",   studying:null,                        mutual:2 },
  ];
  const offline = [
    { name:"Yusuf Bakr",    init:"Y", mutual:4, lastSeen:"2h ago"    },
    { name:"Hassan Mourad", init:"H", mutual:1, lastSeen:"yesterday" },
    { name:"Adel Rashid",   init:"A", mutual:2, lastSeen:"2 days ago"},
    { name:"Dana Khalil",   init:"D", mutual:3, lastSeen:"1 week ago"},
  ];
  const suggestions = [
    { name:"Mona S.", init:"M", course:"Calculus II", mutual:2 },
    { name:"Ali R.",  init:"A", course:"CS 161",      mutual:3 },
  ];
  const dot = (s) => s==="studying"?t.accent:s==="online"?t.body:t.muted;
  return (
    <Shell4 t={t} active="room">
      <_RoomsHeader t={t} activeTab="friends" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 260px", gap:22 }}>

        {/* LEFT — friend list */}
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 14px", background:t.panel, border:`1px solid ${t.rule}`, marginBottom:22 }}>
            {Ic.search(t.muted)}
            <span style={{ fontSize:13, color:t.muted }}>Search friends by name or email…</span>
          </div>

          {/* Active */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>Active Now</div>
            <span style={{ fontSize:11, color:t.muted }}>· {online.length}</span>
            <div style={{ flex:1, height:1, background:t.rule }} />
          </div>
          {online.map((f,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 0", borderBottom:`1px solid ${t.rule}` }}>
              <div style={{ position:"relative", flexShrink:0 }}>
                <div style={{ width:42, height:42, borderRadius:999, background:t.ink, color:t.bg, display:"grid", placeItems:"center", fontSize:15, fontWeight:700 }}>{f.init}</div>
                <div style={{ position:"absolute", bottom:1, right:1, width:11, height:11, borderRadius:999, background:dot(f.status), border:`2px solid ${t.bg}` }} />
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ ...Sf4, fontSize:14.5, fontWeight:600, color:t.ink }}>{f.name}</div>
                {f.studying
                  ? <div style={{ fontSize:11.5, color:t.accent, marginTop:2 }}>Studying · {f.studying}</div>
                  : <div style={{ fontSize:11.5, color:t.muted, marginTop:2 }}>Online — not in a session</div>
                }
                <div style={{ fontSize:10.5, color:t.muted, marginTop:2 }}>{f.mutual} mutual rooms</div>
              </div>
              <div style={{ display:"flex", gap:7, flexShrink:0 }}>
                <button style={{ padding:"5px 10px", background:"transparent", border:`1px solid ${t.rule}`, color:t.muted, fontSize:11, cursor:"pointer" }}>Profile</button>
                <button style={{ padding:"5px 14px", background:t.accent, border:"none", color:t.bg, fontSize:11, fontWeight:700, cursor:"pointer" }}>Invite</button>
              </div>
            </div>
          ))}

          {/* Offline */}
          <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:22, marginBottom:12 }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.muted, fontWeight:700, textTransform:"uppercase" }}>Offline</div>
            <span style={{ fontSize:11, color:t.muted }}>· {offline.length}</span>
            <div style={{ flex:1, height:1, background:t.rule }} />
          </div>
          {offline.map((f,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"11px 0", borderBottom:i<offline.length-1?`1px solid ${t.rule}`:"none", opacity:0.68 }}>
              <div style={{ width:38, height:38, borderRadius:999, background:t.panel2, border:`1px solid ${t.rule}`, color:t.muted, display:"grid", placeItems:"center", fontSize:13, fontWeight:600, flexShrink:0 }}>{f.init}</div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ ...Sf4, fontSize:13.5, fontWeight:600, color:t.ink }}>{f.name}</div>
                <div style={{ fontSize:11, color:t.muted, marginTop:2 }}>Last seen {f.lastSeen} · {f.mutual} mutual rooms</div>
              </div>
              <button style={{ padding:"4px 10px", background:"transparent", border:`1px solid ${t.rule}`, color:t.muted, fontSize:11, cursor:"pointer", flexShrink:0 }}>Invite</button>
            </div>
          ))}
        </div>

        {/* RIGHT rail */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Add Friend */}
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, padding:"16px 16px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>Add a Friend</div>
            <div style={{ border:`1px solid ${t.rule}`, padding:"8px 12px", background:t.bg, fontSize:12, color:t.muted, marginBottom:10 }}>Name or email address…</div>
            <button style={{ width:"100%", padding:"8px 0", background:t.accent, border:"none", color:t.bg, fontSize:12, fontWeight:700, cursor:"pointer" }}>Send Request</button>
          </div>

          {/* Pending request */}
          <div style={{ background:t.ink, padding:"16px 16px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>Pending Request · 1</div>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ width:32, height:32, borderRadius:999, background:t.accent, color:t.bg, display:"grid", placeItems:"center", fontSize:12, fontWeight:700 }}>N</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:12.5, fontWeight:600, color:t.bg }}>Nour Faris</div>
                <div style={{ fontSize:10, color:`${t.bg}55` }}>1 mutual room</div>
              </div>
            </div>
            <div style={{ display:"flex", gap:7 }}>
              <button style={{ flex:1, padding:"6px 0", background:t.accent, border:"none", color:t.bg, fontSize:11, fontWeight:700, cursor:"pointer" }}>Accept</button>
              <button style={{ flex:1, padding:"6px 0", background:"transparent", border:`1px solid ${t.bg}22`, color:`${t.bg}55`, fontSize:11, cursor:"pointer" }}>Decline</button>
            </div>
          </div>

          {/* Suggested */}
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, padding:"14px 16px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>People You May Know</div>
            {suggestions.map((s,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:i<suggestions.length-1?12:0 }}>
                <div style={{ width:32, height:32, borderRadius:999, background:t.panel2, border:`1px solid ${t.rule}`, color:t.ink, display:"grid", placeItems:"center", fontSize:12, fontWeight:700 }}>{s.init}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12.5, fontWeight:600, color:t.ink }}>{s.name}</div>
                  <div style={{ fontSize:10, color:t.muted }}>{s.course} · {s.mutual} mutual</div>
                </div>
                <button style={{ padding:"4px 10px", background:"transparent", border:`1px solid ${t.accent}`, color:t.accent, fontSize:11, fontWeight:600, cursor:"pointer" }}>Add</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Study Rooms — Groups tab
// ─────────────────────────────────────────────────────────────
export const Rooms4Groups: React.FC<{ t: Theme }> = ({ t }) => {
  const groups = [
    { name:"CS161 Study Circle",    course:"CS 161",        members:12, leader:"Yusuf B.",  lastActive:"2h ago",      unread:4,  avatars:["Y","L","K","R"], desc:"Weekly problem-solving sessions and exam prep for algorithms.",       joined:true  },
    { name:"Micro Study Hall",      course:"Economics 101", members:8,  leader:"Layla A.",  lastActive:"yesterday",   unread:0,  avatars:["L","K","R","H"], desc:"Covers microeconomics fundamentals — consumer theory, market structures.", joined:true  },
    { name:"Quranic Arabic Circle", course:"Arabic 110",    members:15, leader:"Hassan M.", lastActive:"active now",  unread:0,  avatars:["H","L","M","K"], desc:"Tajweed reading, vocabulary building, and weekly recitation review.", joined:false },
    { name:"Bio 220 Crammers",      course:"Biology 220",   members:6,  leader:"Karim H.",  lastActive:"3 days ago",  unread:0,  avatars:["K","R","Y"],     desc:"Anatomy and physiology deep dives — final exam focused.",             joined:false },
  ];
  const pal = [t.accent, t.body, t.ink, t.muted];
  const courses = ["All","CS 161","Economics 101","Arabic 110","Biology 220","Math 110"];

  const AvatarStack = ({ avatars, bg }) => (
    <div style={{ display:"flex" }}>
      {avatars.slice(0,4).map((a,i) => (
        <div key={i} style={{ width:22, height:22, borderRadius:999, background:pal[i%pal.length], color:t.bg, display:"grid", placeItems:"center", fontSize:9, fontWeight:700, border:`2px solid ${bg||t.panel}`, marginLeft:i?-7:0 }}>{a}</div>
      ))}
    </div>
  );

  const GroupCard = ({ g }) => (
    <div style={{ background:t.panel, border:`1px solid ${g.joined?t.rule:t.rule}`, display:"flex", flexDirection:"column" }}>
      <div style={{ background:g.joined?t.ink:t.panel2, padding:"12px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <AvatarStack avatars={g.avatars} bg={g.joined?t.ink:t.panel2} />
          {g.members>4 && <span style={{ fontSize:10, color:g.joined?`${t.bg}66`:t.muted, marginLeft:2 }}>+{g.members-4}</span>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          {g.unread>0 && <div style={{ minWidth:18, height:18, borderRadius:999, background:t.accent, color:t.bg, display:"grid", placeItems:"center", fontSize:9, fontWeight:700, padding:"0 4px" }}>{g.unread}</div>}
          <div style={{ fontSize:9, letterSpacing:1.5, color:g.joined?t.accent:t.muted, fontWeight:700, textTransform:"uppercase" }}>{g.course}</div>
        </div>
      </div>
      <div style={{ padding:"14px 16px", flex:1 }}>
        <div style={{ ...Sf4, fontSize:16, fontWeight:600, color:t.ink, marginBottom:3 }}>{g.name}.</div>
        <div style={{ fontSize:11, color:t.muted, marginBottom:10 }}>led by {g.leader} · {g.members} members</div>
        <div style={{ fontSize:12.5, color:t.body, lineHeight:1.65 }}>{g.desc}</div>
      </div>
      <div style={{ padding:"10px 16px", borderTop:`1px solid ${t.rule}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div style={{ display:"flex", alignItems:"center", gap:5 }}>
          <div style={{ width:5, height:5, borderRadius:999, background:g.lastActive==="active now"?t.accent:t.rule }} />
          <span style={{ fontSize:10.5, color:t.muted }}>{g.lastActive}</span>
        </div>
        <button style={{ padding:"5px 14px", background:g.joined?t.accent:"transparent", border:g.joined?"none":`1px solid ${t.rule}`, color:g.joined?t.bg:t.body, fontSize:11, fontWeight:g.joined?600:400, ...Sf4, cursor:"pointer" }}>
          {g.joined?"Open group":"Request to join"}
        </button>
      </div>
    </div>
  );

  return (
    <Shell4 t={t} active="room">
      <_RoomsHeader t={t} activeTab="groups" />
      <div style={{ display:"grid", gridTemplateColumns:"1fr 250px", gap:22 }}>

        {/* LEFT — group cards */}
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>Your Groups</div>
            <span style={{ fontSize:11, color:t.muted }}>· 2</span>
            <div style={{ flex:1, height:1, background:t.rule }} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:26 }}>
            {groups.filter(g=>g.joined).map((g,i) => <GroupCard key={i} g={g} />)}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.muted, fontWeight:700, textTransform:"uppercase" }}>Discover</div>
            <span style={{ fontSize:11, color:t.muted }}>· 2 suggested</span>
            <div style={{ flex:1, height:1, background:t.rule }} />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            {groups.filter(g=>!g.joined).map((g,i) => <GroupCard key={i} g={g} />)}
          </div>
        </div>

        {/* RIGHT rail */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>

          {/* Create group CTA */}
          <div style={{ background:t.ink, padding:"20px 18px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Start a Group</div>
            <div style={{ ...Sf4, fontSize:15, color:t.bg, lineHeight:1.55, marginBottom:14 }}>
              Gather your study circle — invite peers by course or name.
            </div>
            <button style={{ width:"100%", padding:"9px 0", background:t.accent, border:"none", color:t.bg, fontSize:12, fontWeight:700, cursor:"pointer" }}>Create Group →</button>
          </div>

          {/* Filter by course */}
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, padding:"14px 16px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>Filter by Course</div>
            <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
              {courses.map((c,i) => (
                <div key={c} style={{ padding:"8px 0", borderBottom:i<courses.length-1?`1px solid ${t.rule}`:"none", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:12, color:i===0?t.accent:t.body, fontWeight:i===0?600:400 }}>{c}</span>
                  {i===0 && <span style={{ fontSize:10, color:t.accent, fontWeight:700 }}>✓</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Active now */}
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, padding:"14px 16px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>Active Now</div>
            <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
              <div style={{ width:6, height:6, borderRadius:999, background:t.accent, marginTop:5, flexShrink:0 }} />
              <div>
                <div style={{ fontSize:12.5, fontWeight:600, color:t.ink }}>Quranic Arabic Circle</div>
                <div style={{ fontSize:11, color:t.muted, marginTop:2 }}>15 members · live session now</div>
                <button style={{ marginTop:8, padding:"5px 12px", background:t.accent, border:"none", color:t.bg, fontSize:11, fontWeight:700, cursor:"pointer" }}>Join Session</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell4>
  );
};

// ============== ACADEMICS (calendar + courses + topic mastery) ============== (calendar + courses + topic mastery) ==============
export const Aca4: React.FC<{ t: Theme }> = ({ t }) => {
  const courses = [
    { code: "SWE 022", name: "Analysis of Algorithms", prof: "Dr. Hadi",  hours: 23, grade: "A−", color: "ink",    topics: 14, done: 11, avgScore: 85, cardsDue: 8  },
    { code: "ECN 101", name: "Microeconomics",          prof: "Dr. Saab",  hours: 14, grade: "A",  color: "accent", topics: 9,  done: 8,  avgScore: 91, cardsDue: 3  },
    { code: "BIO 220", name: "Human Anatomy",           prof: "Dr. Karim", hours: 31, grade: "B+", color: "body",   topics: 12, done: 7,  avgScore: 72, cardsDue: 17 },
    { code: "MAT 110", name: "Linear Algebra",          prof: "Dr. Reem",  hours: 19, grade: "A−", color: "muted",  topics: 10, done: 9,  avgScore: 88, cardsDue: 5  },
    { code: "PSY 110", name: "Cognitive Science",       prof: "Dr. Adel",  hours: 8,  grade: "C+", color: "accent", topics: 7,  done: 3,  avgScore: 61, cardsDue: 22 },
    { code: "ARB 100", name: "Quranic Arabic",          prof: "Sh. Yasin", hours: 17, grade: "A−", color: "body",   topics: 11, done: 9,  avgScore: 90, cardsDue: 4  },
  ];

  const week = [
    { d: "Mon", n: 27, items: [{ c: "ECN 101", l: "Game Theory",   time: "10:00", color: "accent" }] },
    { d: "Tue", n: 28, items: [{ c: "SWE 022", l: "Lecture",       time: "14:00", color: "ink"    }, { c: "SWE 022", l: "DP review",    time: "18:00", color: "ink"  }] },
    { d: "Wed", n: 29, items: [{ c: "MAT 110", l: "Eigenvectors",  time: "09:00", color: "muted"  }], today: 1 },
    { d: "Thu", n: 30, items: [{ c: "BIO 220", l: "Lab",           time: "11:00", color: "body"   }, { c: "BIO 220", l: "Skeletal",     time: "15:00", color: "body" }] },
    { d: "Fri", n: 1,  items: [{ c: "PSY 110", l: "Memory",        time: "13:00", color: "accent" }] },
    { d: "Sat", n: 2,  items: [] },
    { d: "Sun", n: 3,  items: [{ c: "ARB 100", l: "Form II Verbs", time: "16:00", color: "body"   }] },
  ];

  const topicMastery = [
    { course: "SWE 022", topic: "Sorting & Searching",   m: 95, color: "ink"    },
    { course: "MAT 110", topic: "Vector Spaces",          m: 92, color: "muted"  },
    { course: "ECN 101", topic: "Supply & Demand",        m: 90, color: "accent" },
    { course: "ARB 100", topic: "Tajweed Basics",         m: 88, color: "body"   },
    { course: "SWE 022", topic: "Greedy Algorithms",      m: 82, color: "ink"    },
    { course: "BIO 220", topic: "Cell Signaling",         m: 78, color: "body"   },
    { course: "ECN 101", topic: "Welfare Economics",      m: 70, color: "accent" },
    { course: "SWE 022", topic: "Dynamic Programming",    m: 64, color: "ink"    },
    { course: "BIO 220", topic: "Skeletal System",        m: 55, color: "body"   },
    { course: "PSY 110", topic: "Working Memory",         m: 45, color: "accent" },
    { course: "PSY 110", topic: "Attention",              m: 38, color: "accent" },
    { course: "SWE 022", topic: "NP-Completeness",        m: 22, color: "ink"    },
  ];

  const colorOf = (k) => k === "ink" ? t.ink : k === "body" ? t.body : k === "muted" ? t.muted : t.accent;

  const NavBtn = ({ children }) => (
    <button style={{ background: "transparent", border: `1px solid ${t.accent}55`, padding: "4px 13px", fontSize: 11, letterSpacing: 0.8, fontWeight: 700, color: t.accent, cursor: "pointer", textTransform: "uppercase" }}>
      {children}
    </button>
  );

  const CourseCard = ({ c, big }) => {
    const ac = colorOf(c.color);
    return (
      <div style={{ background: t.panel2, border: `1px solid ${t.rule}`, borderTop: `3px solid ${ac}`, padding: big ? 20 : 16, display: "flex", flexDirection: "column", gap: big ? 12 : 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ flex: 1, paddingRight: 8 }}>
            <div style={{ fontSize: 10, letterSpacing: 1.5, color: ac, fontWeight: 700, textTransform: "uppercase" }}>{c.code} · {c.prof}</div>
            <div style={{ ...Sf4, fontSize: big ? 20 : 16, fontWeight: 600, color: t.ink, marginTop: 4, lineHeight: 1.2 }}>{c.name}</div>
          </div>
          <div style={{ textAlign: "right", flexShrink: 0 }}>
            <div style={{ fontSize: 9, letterSpacing: 1.5, color: t.muted, fontWeight: 700, textTransform: "uppercase" }}>Grade</div>
            <div style={{ ...Sf4, fontSize: big ? 24 : 19, fontWeight: 600, color: ac, lineHeight: 1, marginTop: 2 }}>{c.grade}</div>
          </div>
        </div>
        <div style={{ height: 1, background: t.rule }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
          {[[c.hours + "h", "studied"], [c.topics, "topics"], [c.avgScore + "%", "avg score"], [c.cardsDue, "cards due"]].map(([v, l]) => (
            <div key={l}>
              <div style={{ ...Sf4, fontSize: big ? 17 : 14, fontWeight: 600, color: t.ink }}>{v}</div>
              <div style={{ fontSize: 9, color: t.muted, marginTop: 1, letterSpacing: 0.5 }}>{l}</div>
            </div>
          ))}
        </div>
        <button style={{ padding: "7px 0", background: t.ink, color: t.bg, border: "none", fontSize: 12, fontWeight: 600, ...Sf4, cursor: "pointer", width: "100%", textAlign: "center", letterSpacing: 0.5 }}>
          Open →
        </button>
      </div>
    );
  };

  return (
    <Shell4 t={t} active="aca">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 0 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>Spring '26 · 6 enrolled</div>
          <h1 style={{ ...Sf4, fontSize: 38, fontWeight: 600, color: t.ink, margin: "6px 0 4px", letterSpacing: -0.8 }}>Academics.</h1>
          <p style={{ fontSize: 13, color: t.muted, margin: 0 }}>Courses, uploads, and topic-level progress.</p>
        </div>
        {/* Enrol button — accent-filled, sharp corners, uppercase serif */}
        <button style={{ padding: "9px 18px", background: t.accent, color: t.bg, border: "none", fontSize: 13, fontWeight: 600, ...Sf4, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 7 }}>
          {Ic.plus(t.bg)} Enrol a Course
        </button>
      </div>
      <div style={{ height: 1, background: t.ink, marginTop: 14, marginBottom: 18, opacity: 0.8 }} />

      {/* Weekly calendar strip */}
      <div style={{ background: t.panel2, border: `1px solid ${t.rule}`, padding: 16, marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>This week</div>
            <div style={{ ...Sf4, fontSize: 17, fontWeight: 600, color: t.ink, marginTop: 3 }}>April 27 — May 3</div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <NavBtn>‹ Prev</NavBtn>
            <NavBtn>Today</NavBtn>
            <NavBtn>Next ›</NavBtn>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {week.map((d, i) => (
            <div key={i} style={{ background: d.today ? t.accentSoft : t.panel, border: `1px solid ${d.today ? t.accent : t.rule}`, padding: "8px 8px 10px", minHeight: 100, display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 4 }}>
                <span style={{ fontSize: 9, letterSpacing: 1.5, fontWeight: 700, color: d.today ? t.accent : t.muted, textTransform: "uppercase" }}>{d.d}</span>
                <span style={{ ...Sf4, fontSize: 15, fontWeight: 600, color: d.today ? t.accent : t.ink }}>{d.n}</span>
              </div>
              {d.items.length === 0 && <span style={{ fontSize: 10, color: t.muted, marginTop: "auto" }}>open</span>}
              {d.items.map((it, j) => (
                <div key={j} style={{ borderLeft: `2px solid ${colorOf(it.color)}`, padding: "3px 6px", background: t.panel2, fontSize: 10, lineHeight: 1.3 }}>
                  <div style={{ fontWeight: 600, color: t.ink }}>{it.l}</div>
                  <div style={{ color: t.muted, fontSize: 9 }}>{it.c} · {it.time}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Body: course cards left, mastery right */}
      <div style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr", gap: 20 }}>
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <CourseCard c={courses[0]} big />
            <CourseCard c={courses[1]} big />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {courses.slice(2).map((c, i) => <CourseCard key={i} c={c} />)}
          </div>
        </div>

        {/* Topic mastery panel */}
        <div style={{ background: t.panel2, border: `1px solid ${t.rule}`, padding: 18, alignSelf: "flex-start" }}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>Mastery</div>
            <div style={{ ...Sf4, fontSize: 17, fontWeight: 600, color: t.ink, marginTop: 3 }}>Topics — strongest first</div>
            <div style={{ fontSize: 11, color: t.muted, marginTop: 3 }}>Sorted by mastery score, high to low.</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {topicMastery.map((tp, i) => {
              const c = colorOf(tp.color);
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 3 }}>
                    <div style={{ flex: 1, paddingRight: 8, minWidth: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: t.ink }}>{tp.topic}</span>
                      <span style={{ fontSize: 10, color: t.muted, marginLeft: 6 }}>{tp.course}</span>
                    </div>
                    <span style={{ ...Sf4, fontSize: 12, fontWeight: 600, color: c, flexShrink: 0 }}>{tp.m}<span style={{ fontSize: 9, color: t.muted }}>%</span></span>
                  </div>
                  <div style={{ height: 3, background: t.rule, position: "relative" }}>
                    <div style={{ position: "absolute", inset: 0, width: `${tp.m}%`, background: c }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${t.rule}`, fontSize: 11, color: t.muted, textAlign: "center" }}>
            Average across topics — <span style={{ color: t.ink, fontWeight: 600 }}>68%</span>
          </div>
        </div>
      </div>
    </Shell4>
  );
};

// ============== EXAMINATIONS ==============
export const Quiz4: React.FC<{ t: Theme }> = ({ t }) => {
  const [mode, setMode] = React.useState("quizzes");
  const [tab,  setTab]  = React.useState("create");
  const [qCount, setQCount] = React.useState(20);
  const [diff,   setDiff]   = React.useState(1);
  const [lang,   setLang]   = React.useState("English");
  const [langOpen,  setLangOpen]  = React.useState(false);
  const [qtype,     setQtype]     = React.useState("mcq");
  const [qtypeOpen, setQtypeOpen] = React.useState(false);
  const [source,    setSource]    = React.useState("library");

  const langs = ["English", "Arabic", "French", "Spanish"];
  const qtypeOptions = [
    { k: "mcq",  l: "Multiple choice"   },
    { k: "fill", l: "Fill in the blank" },
    { k: "open", l: "Open ended"        },
    { k: "tf",   l: "True / False"      },
  ];

  const intlExams = [
    { name: "A-Levels",       code: "A-LEVEL",    country: "UK",      region: "England, Wales, N. Ireland", q: 90,  level: "advanced",     desc: "Advanced Level qualifications. UK pre-university qualification widely recognised for global university admissions." },
    { name: "Abitur",         code: "ABITUR-24",  country: "Germany", region: "Nationwide",                 q: 120, level: "advanced",     desc: "German university entrance qualification. Comprehensive assessment across core and elective subjects." },
    { name: "ACT",            code: "ACT-2024",   country: "USA",     region: "Nationwide",                 q: 215, level: "intermediate", desc: "Standardised test for US college admissions. Covers English, Mathematics, Reading and Science." },
    { name: "SAT",            code: "SAT-2024",   country: "USA",     region: "Nationwide",                 q: 154, level: "intermediate", desc: "College Board exam widely used for US admissions. Tests evidence-based reading and mathematics." },
    { name: "IELTS Academic", code: "IELTS-AC",   country: "Global",  region: "Worldwide",                  q: 80,  level: "intermediate", desc: "Measures English proficiency for academic study and migration to English-speaking countries." },
    { name: "Baccalauréat",   code: "BAC-2024",   country: "France",  region: "Nationwide",                 q: 60,  level: "advanced",     desc: "French secondary diploma providing access to higher education in France and internationally." },
    { name: "Gaokao",         code: "GAOKAO-24",  country: "China",   region: "Nationwide",                 q: 150, level: "advanced",     desc: "National College Entrance Examination required for entry to Chinese universities. Highly competitive." },
    { name: "Tawjihi",        code: "TAWJIHI-24", country: "Jordan",  region: "Nationwide",                 q: 100, level: "intermediate", desc: "General Secondary Education Certificate for university admission in Jordan and the wider Arab world." },
    { name: "TOEFL iBT",      code: "TOEFL-IBT",  country: "Global",  region: "Worldwide",                  q: 54,  level: "intermediate", desc: "Test of English as a Foreign Language. Accepted by over 11,000 universities and institutions worldwide." },
  ];

  const switchMode = (m) => { setMode(m); setTab(m === "exams" ? "explore" : "create"); };

  const subTabItems = mode === "quizzes"
    ? [{ k: "create", l: "Create Quiz" }, { k: "mine", l: "My Quizzes", n: 2 }, { k: "explore", l: "Explore" }, { k: "history", l: "History", n: 2 }]
    : [{ k: "create", l: "Create Quiz" }, { k: "mine", l: "My Exams",   n: 0 }, { k: "explore", l: "Explore" }, { k: "history", l: "Exam History", n: 0 }];

  const EmptyState = ({ icon, title, sub, action }) => (
    <div style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: "64px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
      {icon}
      <div style={{ ...Sf4, fontSize: 18, fontWeight: 600, color: t.ink, marginTop: 16 }}>{title}</div>
      {sub && <div style={{ ...Sf4, fontSize: 13, color: t.muted, marginTop: 6 }}>{sub}</div>}
      {action}
    </div>
  );

  const GlobeIcon = ({ c }) => (
    <svg width="38" height="38" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="6.5" stroke={c} strokeWidth="1.2"/>
      <path d="M1.5 8h13M8 1.5c2 1.7 3 3.9 3 6.5s-1 4.8-3 6.5c-2-1.7-3-3.9-3-6.5s1-4.8 3-6.5Z" stroke={c} strokeWidth="1.2"/>
    </svg>
  );
  const ClockIcon = ({ c }) => (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={c} strokeWidth="1.4"/>
      <path d="M12 7v5l3 3" stroke={c} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  return (
    <Shell4 t={t} active="qz">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 0 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>Examinations</div>
          <h1 style={{ ...Sf4, fontSize: 38, fontWeight: 600, color: t.ink, margin: "6px 0 4px", letterSpacing: -0.8 }}>Quizzes & Exams.</h1>
          <p style={{ ...Sf4, fontSize: 13, color: t.muted, margin: 0 }}>Compose a new quiz, sit a global exam, or revisit your previous attempts.</p>
        </div>
        {/* Mode toggle — text underline, consistent with app tab style */}
        <div style={{ display: "flex", gap: 24, alignItems: "baseline", paddingBottom: 4, borderBottom: `1px solid ${t.rule}` }}>
          {[
            { k: "quizzes", l: "My Quizzes" },
            { k: "exams",   l: "Global Exams" },
          ].map(o => {
            const on = mode === o.k;
            return (
              <button key={o.k} onClick={() => switchMode(o.k)}
                style={{ background: "transparent", border: "none", borderBottom: on ? `2px solid ${t.accent}` : "2px solid transparent", padding: "2px 0 6px", cursor: "pointer", color: on ? t.ink : t.muted, fontSize: 14, fontWeight: on ? 600 : 500, ...Sf4, marginBottom: -5 }}>
                {o.l}
              </button>
            );
          })}
        </div>
      </div>
      <div style={{ height: 1, background: t.ink, marginTop: 14, marginBottom: 16, opacity: 0.8 }} />

      {/* Sub-tabs — same in both modes, labels change by mode */}
      <div style={{ display: "flex", gap: 22, marginBottom: 18, borderBottom: `1px solid ${t.rule}`, paddingBottom: 2 }}>
        {subTabItems.map(it => {
          const on = tab === it.k;
          return (
            <button key={it.k} onClick={() => setTab(it.k)}
              style={{ background: "transparent", border: "none", borderBottom: on ? `2px solid ${t.accent}` : "2px solid transparent", padding: "2px 0 6px", cursor: "pointer", color: on ? t.ink : t.muted, fontSize: 13.5, fontWeight: on ? 600 : 500, ...Sf4, marginBottom: -3 }}>
              {it.l}{typeof it.n === "number" ? ` ${it.n}` : ""}
            </button>
          );
        })}
      </div>

      {/* ── My Quizzes · Create ── */}
      {mode === "quizzes" && tab === "create" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 22 }}>
          <div style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: "20px 24px" }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 5 }}>Subject of examination</div>
            <div style={{ paddingBottom: 8, borderBottom: `1px solid ${t.ink}`, marginBottom: 16 }}>
              <span style={{ ...Sf4, fontSize: 21, color: t.muted }}>An examination on…</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
              {[{ k: "library", l: "From Library", sub: "24 volumes" }, { k: "upload", l: "Submit anew", sub: "upload a file" }].map(s => {
                const on = source === s.k;
                return (
                  <button key={s.k} onClick={() => setSource(s.k)}
                    style={{ padding: "16px 14px", border: on ? `2px solid ${t.accent}` : `1px solid ${t.rule}`, background: on ? t.accentSoft : t.bg, textAlign: "center", cursor: "pointer" }}>
                    <div style={{ ...Sf4, fontSize: 15, fontWeight: 600, color: on ? t.accent : t.body }}>{s.l}</div>
                    <div style={{ ...Sf4, fontSize: 11, color: on ? t.accent : t.muted, marginTop: 3 }}>{s.sub}</div>
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ ...Sf4, fontSize: 12, color: t.body }}>Question type</span>
              <div style={{ position: "relative" }}>
                <button onClick={() => setQtypeOpen(o => !o)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, minWidth: 170, padding: "7px 12px", border: `1px solid ${t.rule}`, background: t.bg, color: t.ink, fontSize: 13, fontWeight: 600, ...Sf4, cursor: "pointer", justifyContent: "space-between" }}>
                  <span>{qtypeOptions.find(o => o.k === qtype)?.l}</span>
                  <span style={{ color: t.muted, fontSize: 10 }}>▾</span>
                </button>
                {qtypeOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, minWidth: 170, background: t.bg, border: `1px solid ${t.rule}`, zIndex: 5 }}>
                    {qtypeOptions.map(o => (
                      <button key={o.k} onClick={() => { setQtype(o.k); setQtypeOpen(false); }}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", border: "none", background: qtype === o.k ? t.accentSoft : "transparent", color: qtype === o.k ? t.accent : t.body, fontSize: 13, ...Sf4, cursor: "pointer", fontWeight: qtype === o.k ? 600 : 400 }}>
                        {o.l}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ ...Sf4, fontSize: 12, color: t.body }}>Number of questions</span>
              <div style={{ display: "flex", alignItems: "stretch" }}>
                <button onClick={() => setQCount(c => Math.max(5, c - 5))} style={{ width: 28, height: 28, background: "transparent", border: `1px solid ${t.rule}`, color: t.muted, fontSize: 18, fontWeight: 300, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "inherit" }}>−</button>
                <div style={{ width: 44, height: 28, borderTop: `1px solid ${t.rule}`, borderBottom: `1px solid ${t.rule}`, display: "grid", placeItems: "center", ...Sf4, fontSize: 14, fontWeight: 600, color: t.ink }}>{qCount}</div>
                <button onClick={() => setQCount(c => Math.min(50, c + 5))} style={{ width: 28, height: 28, background: "transparent", border: `1px solid ${t.rule}`, color: t.muted, fontSize: 18, fontWeight: 300, cursor: "pointer", display: "grid", placeItems: "center", fontFamily: "inherit" }}>+</button>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <span style={{ ...Sf4, fontSize: 12, color: t.body }}>Difficulty</span>
              <div style={{ display: "flex", border: `1px solid ${t.rule}`, overflow: "hidden" }}>
                {["Easy", "Medium", "Hard"].map((d, j) => (
                  <button key={d} onClick={() => setDiff(j)}
                    style={{ padding: "7px 16px", border: "none", borderRight: j < 2 ? `1px solid ${t.rule}` : "none", cursor: "pointer", fontSize: 12, fontWeight: 600, ...Sf4, background: j === diff ? t.ink : t.panel, color: j === diff ? t.bg : t.body }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ ...Sf4, fontSize: 12, color: t.body }}>Language</span>
              <div style={{ position: "relative" }}>
                <button onClick={() => setLangOpen(!langOpen)}
                  style={{ display: "inline-flex", alignItems: "center", gap: 10, minWidth: 170, padding: "7px 12px", border: `1px solid ${t.rule}`, background: t.bg, color: t.ink, fontSize: 13, fontWeight: 600, ...Sf4, cursor: "pointer", justifyContent: "space-between" }}>
                  <span>{lang}</span>
                  <span style={{ color: t.muted, fontSize: 10 }}>▾</span>
                </button>
                {langOpen && (
                  <div style={{ position: "absolute", top: "calc(100% + 4px)", right: 0, minWidth: 170, background: t.bg, border: `1px solid ${t.rule}`, zIndex: 5 }}>
                    {langs.map(L => (
                      <button key={L} onClick={() => { setLang(L); setLangOpen(false); }}
                        style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", border: "none", background: lang === L ? t.accentSoft : "transparent", color: lang === L ? t.accent : t.body, fontSize: 13, ...Sf4, cursor: "pointer", fontWeight: lang === L ? 600 : 400 }}>
                        {L}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <span style={{ display: "block", width: "100%", padding: "11px 0", background: t.ink, color: t.bg, fontSize: 13, ...Sf4, fontWeight: 500, textAlign: "center", cursor: "pointer" }}>
              Compose the examination →
            </span>
          </div>

          <div>
            <div style={{ background: t.ink, color: t.bg, padding: 22, marginBottom: 16 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>Highest mark</div>
              <div style={{ ...Sf4, fontSize: 58, fontWeight: 600, color: t.bg, lineHeight: 1, marginTop: 8 }}>92<span style={{ fontSize: 22, color: t.accent }}>%</span></div>
              <div style={{ ...Sf4, fontSize: 12, color: t.accent, marginTop: 6 }}>Microeconomics · Ch. VII</div>
              <div style={{ height: 1, background: t.accent, opacity: 0.2, marginTop: 14 }} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                {[["12","sittings"],["81%","average"],["240","questions"]].map(([v,l]) => (
                  <div key={l} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 18, fontWeight: 700, color: t.bg, ...Sf4 }}>{v}</div>
                    <div style={{ fontSize: 9, letterSpacing: 1.5, color: t.accent, textTransform: "uppercase", marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Recent sittings</div>
            {[
              { i: "i.",   title: "Anatomy lecture XII",  d: "yesterday",  s: 78 },
              { i: "ii.",  title: "Linear algebra mid",   d: "3 days ago", s: 85 },
              { i: "iii.", title: "CS161 algorithms",     d: "1 week ago", s: 81 },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 0", borderBottom: i < 2 ? `1px solid ${t.rule}` : "none" }}>
                <span style={{ ...Sf4, fontSize: 12, color: t.accent, width: 24, paddingTop: 1 }}>{r.i}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.ink }}>{r.title}</div>
                  <div style={{ ...Sf4, fontSize: 10.5, color: t.muted, marginTop: 2 }}>{r.d}</div>
                </div>
                <span style={{ ...Sf4, fontSize: 16, fontWeight: 600, color: t.ink, flexShrink: 0 }}>{r.s}<span style={{ fontSize: 10, color: t.accent }}>%</span></span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Global Exams · Create → cannot create ── */}
      {mode === "exams" && tab === "create" && (
        <EmptyState
          icon={<GlobeIcon c={t.muted} />}
          title="Global exams cannot be created."
          sub="Switch to My Quizzes mode to compose a custom examination."
          action={
            <button onClick={() => switchMode("quizzes")}
              style={{ marginTop: 20, padding: "10px 24px", background: t.accent, color: t.bg, border: "none", ...Sf4, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Switch to My Quizzes
            </button>
          }
        />
      )}

      {/* ── Global Exams · My Exams → no incomplete exams ── */}
      {mode === "exams" && tab === "mine" && (
        <EmptyState icon={<ClockIcon c={t.muted} />} title="No incomplete exams." sub="Start an exam to continue it later." />
      )}

      {/* ── Global Exams · Explore → international exams browse ── */}
      {mode === "exams" && tab === "explore" && (
        <div>
          {/* Filter panel */}
          <div style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: "16px 20px", marginBottom: 20, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
            {[
              { label: "Country / Region", opts: ["All Countries", "USA", "UK", "Germany", "France", "China", "Jordan", "Global"] },
              { label: "Exam Type",        opts: ["All Types", "University entrance", "Language proficiency", "Professional certification"] },
            ].map(({ label, opts }) => (
              <div key={label}>
                <div style={{ fontSize: 9, letterSpacing: 2, color: t.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>{label}</div>
                <div style={{ position: "relative" }}>
                  <select style={{ width: "100%", padding: "9px 28px 9px 12px", border: `1px solid ${t.rule}`, background: t.bg, color: t.ink, fontSize: 13, ...Sf4, appearance: "none", cursor: "pointer" }}>
                    {opts.map(o => <option key={o}>{o}</option>)}
                  </select>
                  <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: t.muted, fontSize: 10, pointerEvents: "none" }}>▾</span>
                </div>
              </div>
            ))}
            <div>
              <div style={{ fontSize: 9, letterSpacing: 2, color: t.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Search</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", border: `1px solid ${t.rule}`, background: t.bg }}>
                {Ic.search(t.muted)}
                <span style={{ ...Sf4, fontSize: 13, color: t.muted }}>Search exams…</span>
              </div>
            </div>
          </div>

          {/* Exam cards grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {intlExams.map((ex, i) => {
              const adv = ex.level === "advanced";
              return (
                <div key={i} style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: 18, position: "relative", display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ position: "absolute", top: 14, right: 14, padding: "3px 9px", background: adv ? `${t.ink}14` : t.accentSoft, color: adv ? t.ink : t.accent, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5 }}>{ex.level}</div>
                  <div style={{ paddingRight: 82 }}>
                    <div style={{ ...Sf4, fontSize: 10.5, color: t.accent, letterSpacing: 1, marginBottom: 2 }}>{ex.code}</div>
                    <div style={{ ...Sf4, fontSize: 17, fontWeight: 600, color: t.ink, lineHeight: 1.2 }}>{ex.name}</div>
                  </div>
                  <div style={{ fontSize: 12, color: t.body, lineHeight: 1.55 }}>{ex.desc.length > 88 ? ex.desc.slice(0, 88) + "…" : ex.desc}</div>
                  <div style={{ height: 1, background: t.rule, marginTop: 2 }} />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ ...Sf4, fontSize: 10.5, color: t.muted }}>
                      <span style={{ fontWeight: 600, color: t.body }}>{ex.country}</span> · {ex.region}
                    </div>
                    <div style={{ ...Sf4, fontSize: 10.5, color: t.muted }}>{ex.q} q.</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Global Exams · History ── */}
      {mode === "exams" && tab === "history" && (
        <EmptyState icon={<ClockIcon c={t.muted} />} title="No examination history yet." sub="Completed sittings will appear here." />
      )}

      {/* ── My Quizzes · non-create tabs ── */}
      {mode === "quizzes" && tab !== "create" && (
        <EmptyState icon={<ClockIcon c={t.muted} />} title="Nothing here yet." sub="Your saved quizzes and results will appear here." />
      )}
    </Shell4>
  );
};


// ============== FEEDBACK ==============
export const Fb4: React.FC<{ t: Theme }> = ({ t }) => {
  const NoteIc    = ({ c }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>;
  const IdeaIc    = ({ c }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
  const FlagIc    = ({ c }) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>;
  const categories = [
    { k:"note",       l:"A Note",       Ic:NoteIc,  desc:"A thought, observation, or anything on your mind." },
    { k:"suggestion", l:"A Suggestion", Ic:IdeaIc,  desc:"Something you wish existed, or how to make it better." },
    { k:"complaint",  l:"A Complaint",  Ic:FlagIc,  desc:"Something broke or frustrated you — we want to know." },
  ];
  const [tab, setTab] = React.useState("note");
  const active = categories.find(c => c.k === tab);
  const shipped = [
    { v:"v2.4.1", n:"Improved Arabic OCR accuracy",      date:"May 3" },
    { v:"v2.4.0", n:"Faster flashcard generation",        date:"Apr 28" },
    { v:"v2.3.7", n:"Study Rooms — live collaboration",   date:"Apr 21" },
    { v:"v2.3.5", n:"Tags and topic filters in Library",  date:"Apr 12" },
    { v:"v2.3.2", n:"Dark mode for all six themes",       date:"Apr 4"  },
  ];
  return (
    <Shell4 t={t} active="fb">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>Correspondence</div>
          <h1 style={{ ...Sf4, fontSize:38, fontWeight:600, color:t.ink, margin:"6px 0 4px", letterSpacing:-0.8 }}>A letter to the editors.</h1>
          <p style={{ fontSize:13, color:t.muted, margin:0 }}>Tell us what worked, what broke, or what could be lovelier.</p>
        </div>
      </div>
      <div style={{ height:1, background:t.ink, marginTop:14, marginBottom:22, opacity:0.8 }} />

      <div style={{ display:"grid", gridTemplateColumns:"1.5fr 1fr", gap:28 }}>
        {/* LEFT — form */}
        <div>
          {/* Category selector — three editorial cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10, marginBottom:22 }}>
            {categories.map(c => {
              const on = tab === c.k;
              return (
                <button key={c.k} onClick={() => setTab(c.k)}
                  style={{ background:on?t.ink:t.panel2, border:`1px solid ${on?t.ink:t.rule}`, borderRadius:0, padding:"16px 16px 14px", cursor:"pointer", textAlign:"left", position:"relative", outline:"none" }}>
                  {on && <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:t.accent }} />}
                  <div style={{ marginBottom:10, opacity: on ? 1 : 0.6 }}>
                    <c.Ic c={on ? t.accent : t.ink} />
                  </div>
                  <div style={{ ...Sf4, fontSize:13.5, fontWeight:600, color:on?t.bg:t.ink, marginBottom:5 }}>{c.l}</div>
                  <div style={{ fontSize:10.5, color:on?`${t.bg}88`:t.muted, lineHeight:1.55 }}>{c.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Letter panel */}
          <div style={{ background:t.panel2, border:`1px solid ${t.rule}`, padding:"22px 26px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>To the editors of MeshFahem</div>
            <div style={{ ...Sf4, fontSize:14, color:t.muted, marginBottom:14 }}>Dear MeshFahem,</div>
            <div style={{ minHeight:160, fontSize:13, color:t.muted, lineHeight:1.8, paddingBottom:14, borderBottom:`1px solid ${t.rule}` }}>
              {active.desc.charAt(0).toUpperCase() + active.desc.slice(1)}…
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginTop:14 }}>
              <span style={{ fontSize:11, color:t.muted }}>0 / 2000 characters</span>
              <div style={{ textAlign:"right" }}>
                <div style={{ ...Sf4, fontSize:12, color:t.body }}>Yours sincerely,</div>
                <div style={{ ...Sf4, fontSize:13, fontWeight:600, color:t.ink, marginTop:2 }}>— Karim H.</div>
              </div>
            </div>
            <div style={{ marginTop:16, paddingTop:14, borderTop:`1px solid ${t.rule}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <button style={{ background:"transparent", border:"none", cursor:"pointer", ...Sf4, fontSize:12, color:t.accent, textDecoration:"underline", padding:0 }}>+ attach a file or screenshot</button>
              <div style={{ display:"flex", gap:8 }}>
                <button style={{ padding:"9px 16px", background:"transparent", border:`1px solid ${t.rule}`, color:t.muted, fontSize:13, fontWeight:600, ...Sf4, cursor:"pointer" }}>Discard</button>
                <button style={{ padding:"9px 18px", background:t.ink, color:t.bg, border:"none", fontSize:13, fontWeight:600, ...Sf4, cursor:"pointer" }}>Send the letter</button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {/* From the editors */}
          <div style={{ background:t.ink, padding:"22px 24px", marginBottom:22 }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>From the editors</div>
            <div style={{ ...Sf4, fontSize:16, color:t.bg, lineHeight:1.6 }}>
              "This is just the beginning — there is better still to come."
            </div>
            <div style={{ ...Sf4, fontSize:11, color:t.accent, marginTop:12 }}>— the MeshFahem team</div>
          </div>
          {/* Recently shipped */}
          <div style={{ marginBottom:22 }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>Recently Shipped</div>
              <div style={{ flex:1, height:1, background:t.rule }} />
            </div>
            {shipped.map((r,i) => (
              <div key={i} style={{ display:"flex", alignItems:"baseline", gap:12, padding:"9px 0", borderBottom:i<shipped.length-1?`1px solid ${t.rule}`:"none" }}>
                <span style={{ ...Sf4, fontSize:11, color:t.accent, fontWeight:700, minWidth:46 }}>{r.v}</span>
                <span style={{ fontSize:12.5, color:t.body, lineHeight:1.4, flex:1 }}>{r.n}</span>
                <span style={{ fontSize:10, color:t.muted, flexShrink:0 }}>{r.date}</span>
              </div>
            ))}
          </div>
          {/* Contact */}
          <div style={{ paddingTop:14, borderTop:`1px solid ${t.rule}` }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ fontSize:9, letterSpacing:2, color:t.muted, fontWeight:700, textTransform:"uppercase" }}>Other Ways to Reach Us</div>
              <div style={{ flex:1, height:1, background:t.rule }} />
            </div>
            {[["Support","support@meshfahem.com"],["Community","Discord · @meshfahem"],["Response","Within 36 hours"]].map(([k,v],i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:10 }}>
                <span style={{ fontSize:12, color:t.muted }}>{k}</span>
                <span style={{ ...Sf4, fontSize:12, color:t.body }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell4>
  );
};


// ─────────────────────────────────────────────────────────────
// Dash · State 2 — Processing
// ─────────────────────────────────────────────────────────────
export const Dash4Proc: React.FC<{ t: Theme }> = ({ t }) => {
  const ZapSVG = (c) => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>;
  const SpinnerSVG = (c) => <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>;
  const XSvg = (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>;
  return (
    <Shell4 t={t} active="dash">
      {/* Page title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>The Workshop · Processing</div>
          <h1 style={{ ...Sf4, fontSize: 38, fontWeight: 600, color: t.ink, margin: "6px 0 4px", letterSpacing: -0.8 }}>Composing your materials.</h1>
          <p style={{ fontSize: 13, color: t.muted, margin: 0 }}>Microeconomics — Chapter 7.pdf · 42 pages detected</p>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", background: t.accentSoft, border: `1px solid ${t.accent}`, fontSize: 10, letterSpacing: 1.2, fontWeight: 700, color: t.accent, textTransform: "uppercase" }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          Fast mode
        </div>
      </div>
      <div style={{ height: 1, background: t.ink, marginTop: 14, marginBottom: 18, opacity: 0.8 }} />

      {/* Progress bar */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
          <span style={{ fontSize: 12.5, color: t.body }}>Generating flashcards…</span>
          <span style={{ ...Sf4, fontSize: 12, fontWeight: 700, color: t.accent, letterSpacing: 0.5 }}>72%</span>
        </div>
        <div style={{ width: "100%", background: t.panel2, height: 5 }}>
          <div style={{ width: "72%", height: "100%", background: t.accent }} />
        </div>
      </div>

      {/* 2-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 22 }}>

        {/* Left — composing panel with editorial left-border accent */}
        <div style={{ background: t.panel2, borderLeft: `3px solid ${t.accent}`, border: `1px solid ${t.rule}`, borderLeft: `3px solid ${t.accent}` }}>
          {/* Header */}
          <div style={{ padding: "14px 20px 14px 20px", borderBottom: `1px solid ${t.rule}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 38, height: 38, background: t.accentSoft, border: `1px solid ${t.rule}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                {ZapSVG(t.accent)}
              </div>
              <div>
                <div style={{ ...Sf4, fontSize: 15, fontWeight: 600, color: t.ink }}>Fast Processing</div>
                <div style={{ fontSize: 11, color: t.muted, marginTop: 1 }}>AI extraction · est. 40 seconds remaining</div>
              </div>
            </div>
            <button style={{ background: "transparent", border: "none", padding: 6, cursor: "pointer", opacity: 0.35, display: "grid", placeItems: "center" }}>
              {XSvg(t.ink)}
            </button>
          </div>

          {/* Pull-quote area — treat the rotating fact as an editorial quote */}
          <div style={{ padding: "40px 32px 32px", display: "flex", alignItems: "flex-start", gap: 18 }}>
            <div style={{ flexShrink: 0, opacity: 0.55, marginTop: 3 }}>{SpinnerSVG(t.accent)}</div>
            <div>
              <div style={{ ...Sf4, fontSize: 16, color: t.ink, lineHeight: 1.72 }}>
                "Active recall (like flashcards) is 50% more effective than passive reading."
              </div>
              <div style={{ ...Sf4, fontSize: 10.5, color: t.accent, marginTop: 12, letterSpacing: 0.3 }}>— Study science</div>
              <div style={{ fontSize: 11.5, color: t.muted, marginTop: 14 }}>Processing your content in the background.</div>
            </div>
          </div>
        </div>

        {/* Right — dark editorial panel */}
        <div style={{ background: t.ink, padding: "24px 26px", display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 9, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 18 }}>While you wait</div>
          <div style={{ ...Sf4, fontSize: 15, color: t.bg, lineHeight: 1.72, flex: 1 }}>
            "Reading in short bursts with intentional pauses activates your brain's consolidation process — what you're doing right now."
          </div>
          <div style={{ ...Sf4, fontSize: 10.5, color: t.accent, marginTop: 12, marginBottom: 22 }}>— On spaced learning</div>
          <div style={{ height: 1, background: `${t.bg}18`, marginBottom: 18 }} />
          <div style={{ fontSize: 9, letterSpacing: 2, color: `${t.bg}4D`, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>This session</div>
          {[["Source", "42 pages"], ["Output", "Summary + Flashcards"], ["Cost", "8 credits"]].map(([k, v], i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", padding: "6px 0", borderBottom: i < 2 ? `1px solid ${t.bg}0D` : "none" }}>
              <span style={{ fontSize: 11.5, color: `${t.bg}55` }}>{k}</span>
              <span style={{ ...Sf4, fontSize: 11.5, fontWeight: 600, color: t.bg }}>{v}</span>
            </div>
          ))}
          <button style={{ marginTop: 20, display: "inline-flex", alignItems: "center", padding: "7px 16px", background: "transparent", border: `1px solid ${t.bg}22`, color: `${t.bg}55`, fontSize: 12, cursor: "pointer", alignSelf: "flex-start" }}>
            Cancel processing
          </button>
        </div>

      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Dash · State 3 — Results (Book mode)
// ─────────────────────────────────────────────────────────────
export const Dash4Result: React.FC<{ t: Theme }> = ({ t }) => {
  const ChevL   = (c) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
  const ChevR   = (c) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>;
  const XIcon   = (c) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>;
  const ChevDn  = (c) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9l6 6 6-6"/></svg>;
  const ArrowL  = (c) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>;
  const MoreV   = (c) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="5" r="1" fill={c}/><circle cx="12" cy="12" r="1" fill={c}/><circle cx="12" cy="19" r="1" fill={c}/></svg>;
  const GlobeIc = (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>;
  const CopyIc  = (c) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="1"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/></svg>;
  const DualIc  = (c) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><circle cx="11" cy="15" r="2"/><path d="m13 17 2 2"/></svg>;
  const DlIc    = (c) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>;
  const BookIc  = (c) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
  const RefreshIc = (c) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>;
  const RotateIc = (c) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 .49-8.4"/></svg>;
  const Edit3Ic  = (c) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>;
  const ListIc   = (c) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>;
  const FileTextIc = (c) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></svg>;
  const HelpIc   = (c) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>;
  const ShuffleIc = (c) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>;
  const BrainIc  = (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.46 2.5 2.5 0 0 1-1.07-4.68 3 3 0 0 1 .34-5.58 2.5 2.5 0 0 1 1.32-4.24A2.5 2.5 0 0 1 9.5 2z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96-.46 2.5 2.5 0 0 0 1.07-4.68 3 3 0 0 0-.34-5.58 2.5 2.5 0 0 0-1.32-4.24A2.5 2.5 0 0 0 14.5 2z"/></svg>;
  const PlusIc   = (c) => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>;
  const NoteIc   = (c) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></svg>;

  const studyModes = [
    { icon: RotateIc, active: true },
    { icon: Edit3Ic },
    { icon: ListIc },
    { icon: FileTextIc },
    { icon: HelpIc },
  ];

  // Editorial widget header — thin accent left-border treatment
  const WHead = ({ title, showX }) => (
    <div style={{ padding: "8px 14px 8px 16px", borderBottom: `1px solid ${t.rule}`, borderLeft: `3px solid ${t.accent}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2.2, color: t.ink, opacity: 0.45, textTransform: "uppercase" }}>{title}</span>
      {showX && (
        <button style={{ background: "transparent", border: "none", padding: 3, cursor: "pointer", opacity: 0.45, display: "grid", placeItems: "center" }}>
          {XIcon(t.ink)}
        </button>
      )}
    </div>
  );

  return (
    <Shell4 t={t} active="dash">
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column" }}>

        {/* Page title + language selector inline */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>The Workshop · Results</div>
            <h1 style={{ ...Sf4, fontSize: 34, fontWeight: 600, color: t.ink, margin: "5px 0 3px", letterSpacing: -0.7 }}>Microeconomics — Ch. 7</h1>
            <p style={{ fontSize: 12, color: t.muted, margin: 0 }}>ECN101 · 32 flashcards · Summary · 3 pages · generated just now</p>
          </div>
          {/* Language selector — minimal, inline */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", border: `1px solid ${t.rule}`, background: t.panel, cursor: "pointer", flexShrink: 0 }}>
            {GlobeIc(t.accent)}
            <span style={{ fontSize: 11, color: t.body }}>English</span>
            {ChevDn(t.muted)}
          </div>
        </div>

        <div style={{ height: 1, background: t.ink, marginBottom: 10, opacity: 0.8 }} />

        {/* Action bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, paddingBottom: 10, borderBottom: `1px solid ${t.rule}`, marginBottom: 12, flexShrink: 0 }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 11px", background: "transparent", border: `1px solid ${t.rule}`, fontSize: 11, color: t.body, cursor: "pointer" }}>
            {ArrowL(t.body)} Back to History
          </button>
          <div style={{ width: 1, height: 14, background: t.rule, margin: "0 5px" }} />
          {[
            [CopyIc, "Copy All"],
            [DualIc, "Dual Mode"],
            [DlIc, "Export TXT"],
            [DlIc, "Export PDF"],
          ].map(([Ic, label], i) => (
            <button key={i} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px", background: "transparent", border: "none", fontSize: 11.5, color: t.body, cursor: "pointer" }}>
              {Ic(t.muted)} {label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 13px", background: t.ink, border: "none", fontSize: 11.5, fontWeight: 600, color: t.bg, cursor: "pointer" }}>
            {BookIc(t.bg)} Publish to Library
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 11px", background: "transparent", border: `1px solid ${t.rule}`, fontSize: 11.5, color: t.body, cursor: "pointer", marginLeft: 4 }}>
            {RefreshIc(t.muted)} New Document
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", background: "transparent", border: `1px solid ${t.rule}`, fontSize: 11.5, color: t.body, cursor: "pointer", marginLeft: 2 }}>
            {MoreV(t.body)} Actions
          </button>
        </div>

        {/* 2-column grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 14, flex: 1, minHeight: 0 }}>

          {/* Left — BOOK widget */}
          <div style={{ background: t.panel2, border: `1px solid ${t.rule}`, display: "flex", flexDirection: "column" }}>
            <WHead title="BOOK" showX={false} />
            <div style={{ padding: "18px 22px", flex: 1, overflowY: "auto" }}>
              <p style={{ fontSize: 13, color: t.body, lineHeight: 1.82, margin: "0 0 16px" }}>
                Supply and demand is the foundational model of price determination in a market economy. When demand exceeds supply, prices rise; when supply exceeds demand, prices fall. The equilibrium price is where quantity demanded equals quantity supplied.
              </p>
              <p style={{ fontSize: 13, color: t.body, lineHeight: 1.82, margin: "0 0 16px" }}>
                Opportunity cost represents the value of the next best alternative foregone. Every choice involves a trade-off, and rational agents weigh marginal costs against marginal benefits at the margin.
              </p>
              <p style={{ fontSize: 13, color: t.body, lineHeight: 1.82, margin: 0 }}>
                Elasticity measures the responsiveness of quantity demanded or supplied to a change in price. A good is price-elastic when consumers significantly reduce purchases as prices rise; inelastic when they do not.
              </p>
            </div>
            <div style={{ padding: "8px 16px", borderTop: `1px solid ${t.rule}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
              <button style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", background: "transparent", border: `1px solid ${t.rule}`, fontSize: 11.5, color: t.muted, cursor: "pointer", opacity: 0.5 }}>
                {ChevL(t.muted)} Prev
              </button>
              <span style={{ ...Sf4, fontSize: 11, fontWeight: 600, padding: "3px 14px", background: t.accentSoft, color: t.accent }}>1 / 3</span>
              <button style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", background: "transparent", border: `1px solid ${t.rule}`, fontSize: 11.5, color: t.ink, cursor: "pointer" }}>
                Next {ChevR(t.ink)}
              </button>
            </div>
          </div>

          {/* Right column — FLASHCARDS + NOTES */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {/* FLASHCARDS widget */}
            <div style={{ background: t.panel2, border: `1px solid ${t.rule}` }}>
              <WHead title="FLASHCARDS" showX={false} />
              {/* Viewer header */}
              <div style={{ padding: "9px 13px", borderBottom: `1px solid ${t.rule}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div style={{ width: 28, height: 28, background: t.accentSoft, border: `1px solid ${t.rule}`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                    {RotateIc(t.accent)}
                  </div>
                  <div>
                    <div style={{ ...Sf4, fontSize: 12.5, fontWeight: 600, color: t.ink, lineHeight: 1.2 }}>Flip Cards</div>
                    <div style={{ fontSize: 10, color: t.muted }}>32 cards · 0 reviewed</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  {/* 5-mode study pill tabs */}
                  <div style={{ display: "flex", alignItems: "center", gap: 1, background: t.panel, padding: "2px 3px" }}>
                    {studyModes.map((m, i) => (
                      <div key={i} style={{ width: 23, height: 23, background: m.active ? t.accentSoft : "transparent", display: "grid", placeItems: "center", cursor: "pointer" }}>
                        {m.icon(m.active ? t.accent : t.muted)}
                      </div>
                    ))}
                  </div>
                  <button style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", border: `1px solid ${t.rule}`, background: "transparent", fontSize: 10, color: t.body, cursor: "pointer" }}>
                    {DlIc(t.body)} Export
                  </button>
                  <button style={{ display: "inline-flex", alignItems: "center", gap: 3, padding: "3px 8px", border: `1px solid ${t.rule}`, background: "transparent", fontSize: 10, color: t.body, cursor: "pointer" }}>
                    {ShuffleIc(t.body)} Restart
                  </button>
                </div>
              </div>
              {/* Flip card — Scholar v4 style: accent top bar, rule border */}
              <div style={{ padding: "12px 13px" }}>
                <div style={{ width: "100%", height: 142, border: `1px solid ${t.rule}`, cursor: "pointer", overflow: "hidden", display: "flex", flexDirection: "column", background: t.panel }}>
                  <div style={{ height: 3, background: t.accent, flexShrink: 0 }} />
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 22px" }}>
                    <div style={{ textAlign: "center" }}>
                      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, color: t.ink, opacity: 0.35, textTransform: "uppercase", margin: "0 0 10px" }}>Question</p>
                      <p style={{ ...Sf4, fontSize: 14, fontWeight: 500, color: t.ink, lineHeight: 1.55, margin: "0 0 10px" }}>
                        What is opportunity cost and why is it central to economic reasoning?
                      </p>
                      <p style={{ fontSize: 10, color: t.muted, opacity: 0.55, margin: 0 }}>Click to reveal answer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* NOTES widget */}
            <div style={{ background: t.panel2, border: `1px solid ${t.rule}`, flex: 1 }}>
              <WHead title="NOTES" showX={true} />
              <div style={{ background: t.accentSoft, padding: "10px 13px", height: "calc(100% - 36px)" }}>
                <div style={{ marginBottom: 9 }}>
                  <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", background: t.ink, color: t.bg, border: "none", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={t.bg} strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                    Add Note
                  </button>
                </div>
                {/* Note card — editorial marginalia style */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: 7, padding: "8px 10px", background: t.panel, borderLeft: `2px solid ${t.accent}`, border: `1px solid ${t.rule}` }}>
                  {NoteIc(t.accent)}
                  <span style={{ fontSize: 11, color: t.body, flex: 1, lineHeight: 1.5 }}>Page 1 · Opportunity cost = value of best foregone alternative</span>
                  <button style={{ background: "none", border: "none", cursor: "pointer", ...Sf4, fontSize: 10, color: t.accent, fontWeight: 600 }}>Edit</button>
                  <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 10, color: t.muted, opacity: 0.6 }}>✕</button>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Floating action buttons */}
        <div style={{ position: "absolute", bottom: 0, right: 0, display: "flex", flexDirection: "column", gap: 10 }}>
          <button style={{ width: 40, height: 40, background: t.ink, border: "none", display: "grid", placeItems: "center", cursor: "pointer" }} title="Mind Map">
            {BrainIc(t.bg)}
          </button>
          <button style={{ width: 40, height: 40, background: t.accent, border: "none", display: "grid", placeItems: "center", cursor: "pointer" }} title="Add Widget">
            {PlusIc(t.bg)}
          </button>
        </div>

      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Quiz · State 2 — Active (Taking the quiz)
// qtype: "mcq" | "tf" | "fill" | "open"
// ─────────────────────────────────────────────────────────────
export const Quiz4Active: React.FC<{ t: Theme; qtype?: string }> = ({ t, qtype = "mcq" }) => {
  const ChevL    = (c) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
  const ChevR    = (c) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>;
  const VolumeIc = (c) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>;

  const mcqOptions = [
    { l: "A", text: "The value of the next best alternative foregone when a choice is made." },
    { l: "B", text: "The total cost of producing a good or service including materials and labour." },
    { l: "C", text: "The additional cost incurred by producing one more unit of output." },
    { l: "D", text: "A fixed cost that does not change regardless of the level of production." },
  ];

  const questions = {
    mcq:  "What is the definition of opportunity cost in economic theory?",
    tf:   "The law of diminishing marginal returns states that, as more variable input is added to a fixed factor, marginal output will eventually decline.",
    fill: "The __________ measures the responsiveness of quantity demanded to a change in the price of a good.",
    open: "Explain the relationship between supply, demand, and equilibrium price. How does a rightward shift in demand affect market outcomes?",
  };
  const qtypeLabel = { mcq: "Multiple choice", tf: "True / False", fill: "Fill in the blank", open: "Open ended" };

  const [sel, setSel] = React.useState(0);

  return (
    <Shell4 t={t} active="qz">

      {/* Compact header row — eyebrow + title + language pill */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>The Examination · In Progress</div>
          <h1 style={{ ...Sf4, fontSize: 32, fontWeight: 600, color: t.ink, margin: "5px 0 3px", letterSpacing: -0.7 }}>Microeconomics — Ch. 7</h1>
        </div>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", border: `1px solid ${t.rule}`, background: t.panel, flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: t.body }}>English</span>
          <span style={{ fontSize: 9, color: t.muted }}>▾</span>
        </div>
      </div>

      {/* Progress strip — inline label + bar + answered count */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: t.muted, flexShrink: 0 }}>Q 7 / 20</span>
        <div style={{ flex: 1, background: t.panel2, height: 3 }}>
          <div style={{ width: "35%", height: "100%", background: t.accent }} />
        </div>
        <span style={{ ...Sf4, fontSize: 11, fontWeight: 700, color: t.accent, flexShrink: 0 }}>6 answered</span>
      </div>

      {/* Main 2-col layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.45fr 1fr", gap: 0, flex: 1 }}>

        {/* LEFT — question zone: open, editorial, no heavy card box */}
        <div style={{ borderRight: `1px solid ${t.rule}`, paddingRight: 28, display: "flex", flexDirection: "column" }}>

          {/* Question number watermark + question text */}
          <div style={{ position: "relative", flex: 1 }}>
            {/* Faint watermark */}
            <div style={{ ...Sf4, position: "absolute", top: -10, left: -6, fontSize: 110, fontWeight: 700, color: t.ink, opacity: 0.04, lineHeight: 1, userSelect: "none", pointerEvents: "none" }}>07</div>

            <div style={{ position: "relative", paddingTop: 4 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 9, letterSpacing: 2.5, color: t.muted, fontWeight: 700, textTransform: "uppercase" }}>{qtypeLabel[qtype]}</span>
                <button style={{ background: "transparent", border: `1px solid ${t.rule}`, padding: "4px 8px", cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
                  {VolumeIc(t.muted)}
                  <span style={{ fontSize: 10, color: t.muted }}>Read aloud</span>
                </button>
              </div>

              {/* Question text — fill-in-blank shows the gap visually */}
              {qtype === "fill" ? (
                <div style={{ ...Sf4, fontSize: 18, fontWeight: 600, color: t.ink, lineHeight: 1.82, marginBottom: 24 }}>
                  The{" "}
                  <span style={{ display: "inline-block", borderBottom: `2.5px solid ${t.accent}`, minWidth: 160, height: 22, verticalAlign: "bottom", margin: "0 4px" }}></span>
                  {" "}measures the responsiveness of quantity demanded to a change in the price of a good.
                </div>
              ) : (
                <div style={{ ...Sf4, fontSize: qtype === "open" ? 17 : 19, fontWeight: 600, color: t.ink, lineHeight: 1.65, marginBottom: 24 }}>
                  {questions[qtype]}
                </div>
              )}

              {/* ── MCQ — letter-badge + text rows ── */}
              {qtype === "mcq" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {mcqOptions.map((opt, i) => {
                    const on = sel === i;
                    return (
                      <button key={i} onClick={() => setSel(i)}
                        style={{ display: "flex", alignItems: "stretch", background: on ? t.ink : t.bg, border: `1px solid ${on ? t.ink : t.rule}`, cursor: "pointer", width: "100%", overflow: "hidden", textAlign: "left" }}>
                        {/* Letter badge */}
                        <div style={{ width: 44, flexShrink: 0, display: "grid", placeItems: "center", background: on ? t.accent : t.panel2, borderRight: `1px solid ${on ? t.accent : t.rule}` }}>
                          <span style={{ ...Sf4, fontSize: 13, fontWeight: 700, color: on ? t.bg : t.muted }}>{opt.l}</span>
                        </div>
                        <span style={{ fontSize: 13, color: on ? t.bg : t.body, lineHeight: 1.58, padding: "12px 16px" }}>{opt.text}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── True / False — two large dramatic blocks ── */}
              {qtype === "tf" && (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  {[{ l: "True", icon: "✓", i: 0 }, { l: "False", icon: "✗", i: 1 }].map((opt) => {
                    const on = sel === opt.i;
                    return (
                      <button key={opt.i} onClick={() => setSel(opt.i)}
                        style={{ height: 128, background: on ? t.ink : t.bg, border: `1px solid ${on ? t.ink : t.rule}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, cursor: "pointer" }}>
                        <span style={{ fontSize: 20, color: on ? t.accent : t.muted, lineHeight: 1 }}>{opt.icon}</span>
                        <span style={{ ...Sf4, fontSize: 28, fontWeight: 600, color: on ? t.bg : t.ink, letterSpacing: -0.5 }}>{opt.l}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* ── Fill in blank — editorial underline input ── */}
              {qtype === "fill" && (
                <div>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: t.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Your answer</div>
                  <div style={{ borderBottom: `2px solid ${t.ink}`, paddingBottom: 10, marginBottom: 8 }}>
                    <span style={{ ...Sf4, fontSize: 17, color: t.muted, fontStyle: "italic" }}>price elasticity of demand</span>
                    <span style={{ display: "inline-block", width: 2, height: 18, background: t.ink, verticalAlign: "middle", marginLeft: 3, opacity: 0.7 }}></span>
                  </div>
                  <span style={{ fontSize: 11, color: t.muted }}>Exact or partial match accepted · press Enter to confirm</span>
                </div>
              )}

              {/* ── Open ended — paragraph textarea ── */}
              {qtype === "open" && (
                <div>
                  <div style={{ fontSize: 9, letterSpacing: 2, color: t.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Your response</div>
                  <div style={{ background: t.panel2, border: `1px solid ${t.rule}`, borderLeft: `3px solid ${t.accent}`, padding: "14px 16px", minHeight: 148 }}>
                    <span style={{ ...Sf4, fontSize: 13, color: t.body, lineHeight: 1.78 }}>
                      In a free market, the equilibrium price is set at the intersection of the supply and demand curves. A rightward shift in demand—caused by rising incomes or changing preferences—pushes the equilibrium price upward and increases the quantity exchanged…
                    </span>
                    <span style={{ display: "inline-block", width: 2, height: 14, background: t.ink, verticalAlign: "middle", marginLeft: 2, opacity: 0.6 }}></span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 7 }}>
                    <span style={{ fontSize: 11, color: t.muted }}>78 words</span>
                    <span style={{ fontSize: 11, color: t.muted }}>Keyword matching</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: `1px solid ${t.rule}`, marginTop: 16 }}>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px", background: "transparent", border: `1px solid ${t.rule}`, fontSize: 12, color: t.muted, cursor: "pointer", opacity: 0.5 }}>
              {ChevL(t.muted)} Previous
            </button>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 22px", background: t.ink, border: "none", fontSize: 12, fontWeight: 600, color: t.bg, cursor: "pointer" }}>
              Next {ChevR(t.bg)}
            </button>
          </div>
        </div>

        {/* RIGHT — single unified dark ink panel: timer + map + exit */}
        <div style={{ background: t.ink, paddingLeft: 28, display: "flex", flexDirection: "column" }}>

          {/* Timer */}
          <div style={{ paddingTop: 6, paddingBottom: 22, borderBottom: `1px solid ${t.bg}12` }}>
            <div style={{ fontSize: 9, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Time remaining</div>
            <div style={{ ...Sf4, fontSize: 60, fontWeight: 600, color: t.bg, lineHeight: 1, letterSpacing: -3 }}>
              18<span style={{ color: t.accent, letterSpacing: 0 }}>:</span>42
            </div>
            <div style={{ ...Sf4, fontSize: 10, color: t.accent, marginTop: 10, letterSpacing: 0.5 }}>— minutes · seconds</div>
            <div style={{ display: "flex", gap: 22, marginTop: 18 }}>
              {[["6", "done"], ["13", "left"]].map(([v, l]) => (
                <div key={l}>
                  <div style={{ ...Sf4, fontSize: 24, fontWeight: 600, color: t.bg }}>{v}</div>
                  <div style={{ fontSize: 9, letterSpacing: 1.5, color: t.accent, textTransform: "uppercase", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Question map — compact dots */}
          <div style={{ paddingTop: 20, paddingBottom: 20, borderBottom: `1px solid ${t.bg}12`, flex: 1 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: `${t.bg}4D`, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Question map</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Array.from({ length: 20 }, (_, i) => {
                const n = i + 1;
                const isCurrent  = n === 7;
                const isAnswered = n < 7;
                return (
                  <div key={i} style={{ width: 26, height: 26, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 600, cursor: "pointer",
                    background: isCurrent ? t.accent : isAnswered ? `${t.bg}22` : "transparent",
                    color: isCurrent ? t.bg : isAnswered ? `${t.bg}88` : `${t.bg}33`,
                    border: isCurrent ? "none" : `1px solid ${t.bg}18`,
                  }}>
                    {n}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Exit */}
          <div style={{ paddingTop: 18 }}>
            <button style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", background: "transparent", border: `1px solid ${t.bg}22`, fontSize: 11, color: `${t.bg}55`, cursor: "pointer" }}>
              Exit quiz
            </button>
          </div>

        </div>
      </div>
    </Shell4>
  );
};


export const Quiz4ActiveTF: React.FC<{ t: Theme }> = ({ t }) => <Quiz4Active t={t} qtype="tf" />;
export const Quiz4ActiveFill: React.FC<{ t: Theme }> = ({ t }) => <Quiz4Active t={t} qtype="fill" />;
export const Quiz4ActiveOpen: React.FC<{ t: Theme }> = ({ t }) => <Quiz4Active t={t} qtype="open" />;

// ─────────────────────────────────────────────────────────────
// Quiz · State 3 — Results (Score + Answer review)
// ─────────────────────────────────────────────────────────────
export const Quiz4Result: React.FC<{ t: Theme }> = ({ t }) => {
  const CheckIc  = (c) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
  const XMarkIc  = (c) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>;
  const DashIc   = (c) => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14"/></svg>;
  const RotateIc = (c) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 4v6h6"/><path d="M3.51 15a9 9 0 1 0 .49-8.4"/></svg>;
  const ChevL    = (c) => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;

  const review = [
    { q: "What is the definition of opportunity cost?",
      ans: "The value of the next best alternative foregone when a choice is made.", ok: true },
    { q: "Elasticity of demand measures…",
      ans: "The total quantity produced in a factory.", ok: false,
      correct: "The responsiveness of quantity demanded to a price change.",
      note: "Price elasticity reflects how sensitively consumers react to price movements." },
    { q: "A characteristic of a perfectly competitive market is…",
      ans: null, ok: false, correct: "Many buyers and sellers with homogeneous products." },
    { q: "The law of diminishing marginal returns states that…",
      ans: "As more variable input is added, marginal product eventually falls.", ok: true },
    { q: "Sunk costs are best described as…",
      ans: "Costs that cannot be recovered regardless of future decisions.", ok: true },
  ];

  return (
    <Shell4 t={t} active="qz">

      {/* Compact title + action buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>The Examination · Complete</div>
          <h1 style={{ ...Sf4, fontSize: 30, fontWeight: 600, color: t.ink, margin: "5px 0 3px", letterSpacing: -0.6 }}>Microeconomics — Ch. 7</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 13px", background: "transparent", border: `1px solid ${t.rule}`, fontSize: 11.5, color: t.body, cursor: "pointer" }}>
            {RotateIc(t.muted)} Try again
          </button>
          <button style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 15px", background: t.ink, border: "none", fontSize: 11.5, fontWeight: 600, color: t.bg, cursor: "pointer" }}>
            {ChevL(t.bg)} Back to quizzes
          </button>
        </div>
      </div>

      {/* FULL-WIDTH score banner — dark ink, horizontal layout */}
      <div style={{ background: t.ink, padding: "22px 30px", display: "flex", alignItems: "center", gap: 0, marginBottom: 16 }}>
        {/* Score */}
        <div style={{ paddingRight: 30, borderRight: `1px solid ${t.bg}14`, flexShrink: 0 }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Final score</div>
          <div style={{ ...Sf4, fontSize: 64, fontWeight: 600, color: t.bg, lineHeight: 1, letterSpacing: -3 }}>78<span style={{ fontSize: 26, color: t.accent }}>%</span></div>
          <div style={{ ...Sf4, fontSize: 10.5, color: t.accent, marginTop: 8 }}>— Good standing</div>
        </div>
        {/* Stats — horizontal */}
        <div style={{ flex: 1, display: "flex", justifyContent: "space-evenly", paddingLeft: 30 }}>
          {[
            ["14", "Correct",    CheckIc],
            ["4",  "Incorrect",  XMarkIc],
            ["2",  "Unanswered", DashIc],
          ].map(([v, l, Ic], i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>{Ic(t.accent)}</div>
              <div style={{ ...Sf4, fontSize: 32, fontWeight: 600, color: t.bg, lineHeight: 1 }}>{v}</div>
              <div style={{ fontSize: 9, letterSpacing: 1.5, color: `${t.bg}55`, textTransform: "uppercase", marginTop: 5 }}>{l}</div>
            </div>
          ))}
          {/* Time */}
          <div style={{ textAlign: "center", borderLeft: `1px solid ${t.bg}14`, paddingLeft: 28 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Time taken</div>
            <div style={{ ...Sf4, fontSize: 26, fontWeight: 600, color: t.bg, lineHeight: 1 }}>18<span style={{ fontSize: 13, color: `${t.bg}55` }}>m </span>42<span style={{ fontSize: 13, color: `${t.bg}55` }}>s</span></div>
            <div style={{ fontSize: 10, color: `${t.bg}44`, marginTop: 6 }}>56 sec / question avg</div>
          </div>
        </div>
      </div>

      {/* 2-col: performance note + answer review */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.8fr", gap: 22, flex: 1 }}>

        {/* Left — standing + prev attempts */}
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{ background: t.panel2, border: `1px solid ${t.rule}`, padding: "18px 20px", flex: 1 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>Your standing</div>
            <div style={{ ...Sf4, fontSize: 14, color: t.ink, lineHeight: 1.7, marginBottom: 16 }}>
              You answered correctly on 14 of 20 questions, placing you in the top 35% of sittings for this subject.
            </div>
            <div style={{ height: 1, background: t.rule, marginBottom: 14 }} />
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Previous sittings</div>
            {[
              { n: "i.",   s: 65, d: "3 days ago"  },
              { n: "ii.",  s: 71, d: "1 week ago"  },
              { n: "iii.", s: 58, d: "2 weeks ago" },
            ].map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "7px 0", borderBottom: i < 2 ? `1px solid ${t.rule}` : "none" }}>
                <span style={{ ...Sf4, fontSize: 11, color: t.accent, width: 22 }}>{r.n}</span>
                <span style={{ fontSize: 12, color: t.body, flex: 1 }}>{r.d}</span>
                <span style={{ ...Sf4, fontSize: 15, fontWeight: 600, color: t.ink }}>{r.s}<span style={{ fontSize: 10, color: t.accent }}>%</span></span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — answer review editorial column */}
        <div style={{ background: t.panel2, border: `1px solid ${t.rule}`, borderLeft: `3px solid ${t.accent}`, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "9px 18px", borderBottom: `1px solid ${t.rule}` }}>
            <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 2.2, color: t.ink, opacity: 0.45, textTransform: "uppercase" }}>Answer review</span>
          </div>
          <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", flex: 1 }}>
            {review.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 12, paddingBottom: i < review.length - 1 ? 12 : 0, borderBottom: i < review.length - 1 ? `1px solid ${t.rule}` : "none" }}>
                {/* Status column */}
                <div style={{ width: 22, height: 22, flexShrink: 0, display: "grid", placeItems: "center", marginTop: 2,
                  background: item.ok ? t.accentSoft : item.ans === null ? t.panel : `${t.ink}10` }}>
                  {item.ok ? CheckIc(t.accent) : item.ans === null ? DashIc(t.muted) : XMarkIc(t.ink)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ ...Sf4, fontSize: 12.5, fontWeight: 600, color: t.ink, lineHeight: 1.5, marginBottom: 5 }}>{item.q}</div>
                  {item.ans && (
                    <div style={{ fontSize: 11.5, color: item.ok ? t.body : t.muted, lineHeight: 1.5, marginBottom: item.ok ? 0 : 5 }}>
                      <span style={{ fontSize: 9, letterSpacing: 1, color: t.muted, textTransform: "uppercase", fontWeight: 700, marginRight: 5 }}>Yours:</span>
                      {item.ans}
                    </div>
                  )}
                  {item.ans === null && <div style={{ fontSize: 11, color: t.muted, marginBottom: 5 }}>Not answered</div>}
                  {!item.ok && item.correct && (
                    <div style={{ fontSize: 11.5, color: t.body, lineHeight: 1.5, padding: "5px 9px", background: t.accentSoft, borderLeft: `2px solid ${t.accent}`, marginBottom: item.note ? 5 : 0 }}>
                      <span style={{ fontSize: 9, letterSpacing: 1, color: t.accent, textTransform: "uppercase", fontWeight: 700, marginRight: 5 }}>Correct:</span>
                      {item.correct}
                    </div>
                  )}
                  {item.note && <div style={{ fontSize: 11, color: t.muted, lineHeight: 1.6, marginTop: 4 }}>{item.note}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </Shell4>
  );
};


// ─────────────────────────────────────────────────────────────
// Quiz · My Quizzes — list of user's generated quizzes
// ─────────────────────────────────────────────────────────────
export const Quiz4MyQuizzes: React.FC<{ t: Theme }> = ({ t }) => {
  const quizzes = [
    { title: "Microeconomics — Ch. VII",    source: "From library",  date: "2 weeks ago",  score: 92, q: 30, diff: "Hard",   type: "MCQ" },
    { title: "Anatomy — Lecture XII",       source: "From library",  date: "yesterday",    score: 78, q: 20, diff: "Medium", type: "Mixed" },
    { title: "Linear Algebra — Midterm",    source: "Uploaded file", date: "3 days ago",   score: 85, q: 15, diff: "Hard",   type: "MCQ" },
    { title: "CS161 — Algorithms",          source: "From library",  date: "1 week ago",   score: 81, q: 25, diff: "Medium", type: "Mixed" },
    { title: "Modern World History",        source: "From library",  date: "3 weeks ago",  score: 95, q: 20, diff: "Easy",   type: "T/F + MCQ" },
    { title: "Organic Chemistry I",         source: "Uploaded file", date: "1 month ago",  score: null, q: 35, diff: "Hard", type: "Fill + MCQ" },
  ];
  const scored = quizzes.filter(q => q.score !== null);
  const avg = Math.round(scored.reduce((a, b) => a + b.score, 0) / scored.length);

  const ModeToggle = ({ active }) => (
    <div style={{ display: "flex", gap: 24, alignItems: "baseline", paddingBottom: 4, borderBottom: `1px solid ${t.rule}` }}>
      {[{ k: "quizzes", l: "My Quizzes" }, { k: "exams", l: "Global Exams" }].map(o => {
        const on = o.k === active;
        return (
          <button key={o.k} style={{ background: "transparent", border: "none", borderBottom: on ? `2px solid ${t.accent}` : "2px solid transparent", padding: "2px 0 6px", cursor: "pointer", color: on ? t.ink : t.muted, fontSize: 14, fontWeight: on ? 600 : 500, ...Sf4, marginBottom: -5 }}>{o.l}</button>
        );
      })}
    </div>
  );

  return (
    <Shell4 t={t} active="qz">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>Examinations</div>
          <h1 style={{ ...Sf4, fontSize: 36, fontWeight: 600, color: t.ink, margin: "6px 0 4px", letterSpacing: -0.8 }}>My Quizzes.</h1>
          <p style={{ ...Sf4, fontSize: 13, color: t.muted, margin: 0 }}>All your generated sittings, scores and history.</p>
        </div>
        <ModeToggle active="quizzes" />
      </div>
      <div style={{ height: 1, background: t.ink, marginTop: 14, marginBottom: 14, opacity: 0.8 }} />

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 22, marginBottom: 16, borderBottom: `1px solid ${t.rule}`, paddingBottom: 2 }}>
        {[{ k: "create", l: "Create Quiz" }, { k: "mine", l: "My Quizzes", n: quizzes.length }, { k: "explore", l: "Explore" }, { k: "history", l: "History", n: 12 }].map(it => {
          const on = it.k === "mine";
          return (
            <button key={it.k} style={{ background: "transparent", border: "none", borderBottom: on ? `2px solid ${t.accent}` : "2px solid transparent", padding: "2px 0 6px", cursor: "pointer", color: on ? t.ink : t.muted, fontSize: 13.5, fontWeight: on ? 600 : 500, ...Sf4, marginBottom: -3 }}>
              {it.l}{typeof it.n === "number" ? ` ${it.n}` : ""}
            </button>
          );
        })}
      </div>

      {/* Stats strip */}
      <div style={{ display: "flex", background: t.ink, marginBottom: 16 }}>
        {[[scored.length + "/" + quizzes.length, "completed"], [avg + "%", "average score"], ["145", "total questions"], ["4", "question types"]].map(([v, l], i) => (
          <div key={i} style={{ flex: 1, padding: "12px 20px", borderRight: i < 3 ? `1px solid ${t.bg}14` : "none", textAlign: "center" }}>
            <div style={{ ...Sf4, fontSize: 22, fontWeight: 600, color: t.bg, lineHeight: 1 }}>{v}</div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, textTransform: "uppercase", marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Quiz cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {quizzes.map((q, i) => (
          <div key={i} style={{ background: t.panel, border: `1px solid ${t.rule}`, borderLeft: `3px solid ${q.score !== null ? t.accent : t.rule}`, padding: "14px 16px", display: "flex", gap: 14 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: t.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{q.source} · {q.date}</div>
              <div style={{ ...Sf4, fontSize: 14, fontWeight: 600, color: t.ink, lineHeight: 1.3, marginBottom: 9 }}>{q.title}</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {[q.diff, `${q.q} q.`, q.type].map((chip, ci) => (
                  <span key={ci} style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, padding: "3px 7px", background: t.panel2, color: t.body, border: `1px solid ${t.rule}` }}>{chip}</span>
                ))}
              </div>
            </div>
            <div style={{ flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "space-between" }}>
              {q.score !== null
                ? <div style={{ ...Sf4, fontSize: 30, fontWeight: 600, color: t.ink, lineHeight: 1, textAlign: "right" }}>{q.score}<span style={{ fontSize: 12, color: t.accent }}>%</span></div>
                : <div style={{ ...Sf4, fontSize: 11, color: t.muted, textAlign: "right" }}>Not started</div>
              }
              <div style={{ display: "flex", flexDirection: "column", gap: 5, alignItems: "flex-end" }}>
                {q.score !== null && (
                  <button style={{ display: "inline-flex", padding: "4px 10px", background: "transparent", border: `1px solid ${t.rule}`, color: t.body, fontSize: 11, ...Sf4, cursor: "pointer" }}>Review</button>
                )}
                <button style={{ display: "inline-flex", padding: "4px 10px", background: t.ink, border: `1px solid ${t.ink}`, color: t.bg, fontSize: 11, ...Sf4, fontWeight: 600, cursor: "pointer" }}>
                  {q.score !== null ? "Retake →" : "Begin →"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Shell4>
  );
};


// ─────────────────────────────────────────────────────────────
// Quiz · Global Exams — institutional / community exam browse
// ─────────────────────────────────────────────────────────────
export const Quiz4Global: React.FC<{ t: Theme }> = ({ t }) => {
  const intlExams = [
    { name: "A-Levels",       code: "A-LEVEL",    country: "UK",      region: "England, Wales, N. Ireland", q: 90,  level: "advanced",     desc: "Advanced Level qualifications. UK pre-university qualification widely recognised for global university admissions." },
    { name: "Abitur",         code: "ABITUR-24",  country: "Germany", region: "Nationwide",                 q: 120, level: "advanced",     desc: "German university entrance qualification. Comprehensive assessment across core and elective subjects." },
    { name: "ACT",            code: "ACT-2024",   country: "USA",     region: "Nationwide",                 q: 215, level: "intermediate", desc: "Standardised test for US college admissions. Covers English, Mathematics, Reading and Science." },
    { name: "SAT",            code: "SAT-2024",   country: "USA",     region: "Nationwide",                 q: 154, level: "intermediate", desc: "College Board exam widely used for US admissions. Tests evidence-based reading and mathematics." },
    { name: "IELTS Academic", code: "IELTS-AC",   country: "Global",  region: "Worldwide",                  q: 80,  level: "intermediate", desc: "Measures English proficiency for academic study and migration to English-speaking countries." },
    { name: "Baccalauréat",   code: "BAC-2024",   country: "France",  region: "Nationwide",                 q: 60,  level: "advanced",     desc: "French secondary diploma providing access to higher education in France and internationally." },
    { name: "Gaokao",         code: "GAOKAO-24",  country: "China",   region: "Nationwide",                 q: 150, level: "advanced",     desc: "National College Entrance Examination required for entry to Chinese universities. Highly competitive." },
    { name: "Tawjihi",        code: "TAWJIHI-24", country: "Jordan",  region: "Nationwide",                 q: 100, level: "intermediate", desc: "General Secondary Education Certificate for university admission in Jordan and the wider Arab world." },
    { name: "TOEFL iBT",      code: "TOEFL-IBT",  country: "Global",  region: "Worldwide",                  q: 54,  level: "intermediate", desc: "Test of English as a Foreign Language. Accepted by over 11,000 universities and institutions worldwide." },
  ];

  return (
    <Shell4 t={t} active="qz">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>Examinations</div>
          <h1 style={{ ...Sf4, fontSize: 36, fontWeight: 600, color: t.ink, margin: "6px 0 4px", letterSpacing: -0.8 }}>Global Exams.</h1>
          <p style={{ ...Sf4, fontSize: 13, color: t.muted, margin: 0 }}>Official standardised examinations from around the world.</p>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "baseline", paddingBottom: 4, borderBottom: `1px solid ${t.rule}` }}>
          {[{ k: "quizzes", l: "My Quizzes" }, { k: "exams", l: "Global Exams" }].map(o => {
            const on = o.k === "exams";
            return (
              <button key={o.k} style={{ background: "transparent", border: "none", borderBottom: on ? `2px solid ${t.accent}` : "2px solid transparent", padding: "2px 0 6px", cursor: "pointer", color: on ? t.ink : t.muted, fontSize: 14, fontWeight: on ? 600 : 500, ...Sf4, marginBottom: -5 }}>{o.l}</button>
            );
          })}
        </div>
      </div>
      <div style={{ height: 1, background: t.ink, marginTop: 14, marginBottom: 16, opacity: 0.8 }} />

      {/* Filter bar */}
      <div style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: "14px 18px", marginBottom: 18, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        {[
          { label: "Country / Region", opts: ["All Countries", "USA", "UK", "Germany", "France", "China", "Jordan", "Global"] },
          { label: "Exam Type",        opts: ["All Types", "University entrance", "Language proficiency", "Professional certification"] },
        ].map(({ label, opts }) => (
          <div key={label}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 7 }}>{label}</div>
            <div style={{ position: "relative" }}>
              <select style={{ width: "100%", padding: "8px 28px 8px 11px", border: `1px solid ${t.rule}`, background: t.bg, color: t.body, fontSize: 13, ...Sf4, appearance: "none", cursor: "pointer" }}>
                {opts.map(o => <option key={o}>{o}</option>)}
              </select>
              <span style={{ position: "absolute", right: 9, top: "50%", transform: "translateY(-50%)", color: t.muted, fontSize: 10, pointerEvents: "none" }}>▾</span>
            </div>
          </div>
        ))}
        <div>
          <div style={{ fontSize: 9, letterSpacing: 2, color: t.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 7 }}>Search</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 11px", border: `1px solid ${t.rule}`, background: t.bg }}>
            {Ic.search(t.muted)}
            <span style={{ ...Sf4, fontSize: 13, color: t.muted }}>Search exams…</span>
          </div>
        </div>
      </div>

      {/* Card grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
        {intlExams.map((ex, i) => {
          const adv = ex.level === "advanced";
          return (
            <div key={i} style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: 16, position: "relative", display: "flex", flexDirection: "column", gap: 7 }}>
              {/* Level badge */}
              <div style={{ position: "absolute", top: 13, right: 13, padding: "3px 9px", background: adv ? `${t.ink}12` : t.accentSoft, color: adv ? t.ink : t.accent, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5 }}>{ex.level}</div>
              {/* Code + name */}
              <div style={{ paddingRight: 80 }}>
                <div style={{ fontSize: 10, color: t.accent, letterSpacing: 1.5, fontWeight: 700, marginBottom: 3 }}>{ex.code}</div>
                <div style={{ ...Sf4, fontSize: 17, fontWeight: 600, color: t.ink, lineHeight: 1.2 }}>{ex.name}</div>
              </div>
              {/* Description */}
              <div style={{ fontSize: 12, color: t.body, lineHeight: 1.55, flex: 1 }}>
                {ex.desc.length > 90 ? ex.desc.slice(0, 90) + "…" : ex.desc}
              </div>
              {/* Footer */}
              <div style={{ height: 1, background: t.rule, marginTop: 4 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 11.5, color: t.muted }}>
                  <span style={{ fontWeight: 600, color: t.body }}>{ex.country}</span>
                  <span style={{ ...Sf4, fontStyle: "italic" }}> · {ex.region}</span>
                </div>
                <div style={{ fontSize: 11, color: t.muted }}>{ex.q} q.</div>
              </div>
            </div>
          );
        })}
      </div>
    </Shell4>
  );
};


// ─────────────────────────────────────────────────────────────
// Quiz · Preview — pre-exam start screen (before timer begins)
// ─────────────────────────────────────────────────────────────
export const Quiz4Preview: React.FC<{ t: Theme }> = ({ t }) => {
  const qtypes = [
    { l: "Multiple choice", n: 20 },
    { l: "True / False",    n:  8 },
    { l: "Fill in blank",   n:  7 },
    { l: "Open ended",      n:  5 },
  ];
  const rules = [
    "Timer starts the moment you press Begin — it cannot be paused.",
    "Flag questions and return to them before final submission.",
    "Answers are saved automatically as you progress.",
    "Closing this tab does not stop the timer.",
  ];

  return (
    <Shell4 t={t} active="qz">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>Examinations · Preview</div>
          <h1 style={{ ...Sf4, fontSize: 36, fontWeight: 600, color: t.ink, margin: "6px 0 4px", letterSpacing: -0.8 }}>Ready to begin?</h1>
          <p style={{ ...Sf4, fontSize: 13, color: t.muted, margin: 0 }}>Review the details below before the timer starts.</p>
        </div>
      </div>
      <div style={{ height: 1, background: t.ink, marginTop: 14, marginBottom: 20, opacity: 0.8 }} />

      <div style={{ display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: 20 }}>

        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Exam identity */}
          <div style={{ background: t.panel, border: `1px solid ${t.rule}`, borderLeft: `3px solid ${t.accent}`, padding: "18px 20px" }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>Examination</div>
            <div style={{ ...Sf4, fontSize: 21, fontWeight: 600, color: t.ink, lineHeight: 1.25, marginBottom: 4 }}>Microeconomics — Principles</div>
            <div style={{ ...Sf4, fontSize: 11, color: t.muted }}>ECN101 · From Library · Global exam</div>
            <div style={{ height: 1, background: t.rule, margin: "14px 0" }} />
            <div style={{ display: "flex", gap: 0 }}>
              {[["40", "Questions"], ["45 min", "Time limit"], ["Medium", "Difficulty"]].map(([v, l], i) => (
                <div key={l} style={{ flex: 1, paddingRight: 20, borderRight: i < 2 ? `1px solid ${t.rule}` : "none", paddingLeft: i > 0 ? 20 : 0 }}>
                  <div style={{ ...Sf4, fontSize: 20, fontWeight: 600, color: t.ink, lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 9, letterSpacing: 1.5, color: t.muted, textTransform: "uppercase", marginTop: 5 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Question breakdown */}
          <div style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: "16px 20px" }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Question breakdown</div>
            {qtypes.map((qt, i) => {
              const pct = Math.round((qt.n / 40) * 100);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < qtypes.length - 1 ? 11 : 0 }}>
                  <div style={{ fontSize: 12, color: t.body, width: 120, flexShrink: 0 }}>{qt.l}</div>
                  <div style={{ flex: 1, height: 3, background: t.rule }}>
                    <div style={{ width: pct + "%", height: "100%", background: t.accent }} />
                  </div>
                  <div style={{ ...Sf4, fontSize: 11, color: t.muted, width: 36, textAlign: "right", flexShrink: 0 }}>{qt.n} q.</div>
                </div>
              );
            })}
          </div>

          {/* Rules */}
          <div style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: "16px 20px" }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>Before you begin</div>
            {rules.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 10, marginBottom: i < rules.length - 1 ? 9 : 0, alignItems: "flex-start" }}>
                <span style={{ ...Sf4, fontSize: 13, color: t.accent, flexShrink: 0, lineHeight: 1.6 }}>–</span>
                <span style={{ fontSize: 12, color: t.body, lineHeight: 1.6 }}>{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — dark action panel */}
        <div style={{ background: t.ink, padding: "22px 20px", display: "flex", flexDirection: "column" }}>

          {/* Best score */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: `${t.bg}55`, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Your best</div>
            <div style={{ ...Sf4, fontSize: 52, fontWeight: 600, color: t.bg, lineHeight: 1 }}>81<span style={{ fontSize: 20, color: t.accent }}>%</span></div>
            <div style={{ ...Sf4, fontSize: 11, color: t.accent, marginTop: 5 }}>— Attempt 2 · 1 week ago</div>
          </div>

          <div style={{ height: 1, background: `${t.bg}0D`, marginBottom: 16 }} />

          {/* Previous attempts */}
          <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Previous attempts</div>
          {[{ n: 1, s: 74, d: "2 weeks ago" }, { n: 2, s: 81, d: "1 week ago" }].map((a, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${t.bg}14` }}>
              <div>
                <div style={{ fontSize: 12, color: `${t.bg}BB` }}>Attempt {a.n}</div>
                <div style={{ ...Sf4, fontSize: 10.5, color: `${t.bg}55`, marginTop: 2 }}>{a.d}</div>
              </div>
              <div style={{ ...Sf4, fontSize: 22, fontWeight: 600, color: t.bg }}>{a.s}<span style={{ fontSize: 10, color: t.accent }}>%</span></div>
            </div>
          ))}

          <div style={{ height: 1, background: `${t.bg}0D`, margin: "16px 0" }} />

          {/* Cost */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Cost of sitting</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: `${t.bg}BB` }}>Credits required</span>
              <span style={{ ...Sf4, fontSize: 15, fontWeight: 600, color: t.bg }}>35 cr.</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: `${t.bg}BB` }}>Your balance</span>
              <span style={{ ...Sf4, fontSize: 15, fontWeight: 600, color: t.accent }}>5,200 cr.</span>
            </div>
          </div>

          {/* CTA */}
          <button style={{ display: "block", width: "100%", padding: "14px 0", background: t.accent, border: "none", color: t.bg, ...Sf4, fontSize: 15, fontWeight: 700, cursor: "pointer", letterSpacing: 0.3 }}>
            Begin Examination →
          </button>
          <button style={{ display: "block", width: "100%", padding: "9px 0", background: "transparent", border: `1px solid ${t.bg}1A`, color: `${t.bg}55`, ...Sf4, fontSize: 12, cursor: "pointer", marginTop: 8 }}>
            ← Back to examinations
          </button>
        </div>
      </div>
    </Shell4>
  );
};


// ─────────────────────────────────────────────────────────────
// Quiz · Explore — community / peer-shared quizzes
// ─────────────────────────────────────────────────────────────
export const Quiz4Explore: React.FC<{ t: Theme }> = ({ t }) => {
  const community = [
    { title: "Macroeconomics — Fiscal Policy",     author: "sara.k",      subject: "Economics",   q: 25, diff: "Medium", rating: 4.8, uses: "1.2k", tags: ["MCQ", "T/F"] },
    { title: "Cell Biology — Mitosis & Meiosis",   author: "dr.hamza",    subject: "Biology",     q: 30, diff: "Hard",   rating: 4.6, uses: "876",  tags: ["MCQ", "Fill"] },
    { title: "Calculus I — Limits & Derivatives",  author: "math_omar",   subject: "Mathematics", q: 20, diff: "Hard",   rating: 4.9, uses: "3.1k", tags: ["Open", "Fill"] },
    { title: "World War II — Causes & Outcomes",   author: "historian22", subject: "History",     q: 18, diff: "Easy",   rating: 4.3, uses: "560",  tags: ["MCQ"] },
    { title: "Newton's Laws of Motion",            author: "physics_lab", subject: "Physics",     q: 22, diff: "Medium", rating: 4.7, uses: "2.4k", tags: ["MCQ", "Open"] },
    { title: "Shakespearean Tragedy — Themes",     author: "lit.notes",   subject: "Literature",  q: 15, diff: "Medium", rating: 4.5, uses: "430",  tags: ["Open", "T/F"] },
    { title: "SQL Fundamentals",                   author: "dev.layla",   subject: "Comp. Sci.",  q: 28, diff: "Easy",   rating: 4.4, uses: "1.8k", tags: ["Fill", "MCQ"] },
    { title: "The French Revolution — Timeline",   author: "historian22", subject: "History",     q: 20, diff: "Medium", rating: 4.2, uses: "310",  tags: ["MCQ", "T/F"] },
    { title: "Organic Reactions — Substitution",   author: "dr.hamza",    subject: "Chemistry",   q: 24, diff: "Hard",   rating: 4.7, uses: "920",  tags: ["MCQ", "Fill"] },
  ];

  const subjects = ["All Subjects", "Economics", "Biology", "Mathematics", "History", "Physics", "Chemistry", "Literature", "Comp. Sci."];

  const StarIc = () => (
    <svg width="10" height="10" viewBox="0 0 24 24" fill={t.accent} stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
  );

  return (
    <Shell4 t={t} active="qz">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>Examinations</div>
          <h1 style={{ ...Sf4, fontSize: 36, fontWeight: 600, color: t.ink, margin: "6px 0 4px", letterSpacing: -0.8 }}>Explore.</h1>
          <p style={{ ...Sf4, fontSize: 13, color: t.muted, margin: 0 }}>Community-made quizzes shared across the platform.</p>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "baseline", paddingBottom: 4, borderBottom: `1px solid ${t.rule}` }}>
          {[{ k: "quizzes", l: "My Quizzes" }, { k: "exams", l: "Global Exams" }].map(o => {
            const on = o.k === "quizzes";
            return (
              <button key={o.k} style={{ background: "transparent", border: "none", borderBottom: on ? `2px solid ${t.accent}` : "2px solid transparent", padding: "2px 0 6px", cursor: "pointer", color: on ? t.ink : t.muted, fontSize: 14, fontWeight: on ? 600 : 500, ...Sf4, marginBottom: -5 }}>{o.l}</button>
            );
          })}
        </div>
      </div>
      <div style={{ height: 1, background: t.ink, marginTop: 14, marginBottom: 16, opacity: 0.8 }} />

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 22, marginBottom: 16, borderBottom: `1px solid ${t.rule}`, paddingBottom: 2 }}>
        {[{ k: "create", l: "Create Quiz" }, { k: "mine", l: "My Quizzes", n: 6 }, { k: "explore", l: "Explore" }, { k: "history", l: "History", n: 12 }].map(it => {
          const on = it.k === "explore";
          return (
            <button key={it.k} style={{ background: "transparent", border: "none", borderBottom: on ? `2px solid ${t.accent}` : "2px solid transparent", padding: "2px 0 6px", cursor: "pointer", color: on ? t.ink : t.muted, fontSize: 13.5, fontWeight: on ? 600 : 500, ...Sf4, marginBottom: -3 }}>
              {it.l}{typeof it.n === "number" ? ` ${it.n}` : ""}
            </button>
          );
        })}
      </div>

      {/* Search + subject filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "stretch" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, padding: "9px 13px", border: `1px solid ${t.rule}`, background: t.panel }}>
          {Ic.search(t.muted)}
          <span style={{ ...Sf4, fontSize: 13, color: t.muted }}>Search community quizzes…</span>
        </div>
        <div style={{ position: "relative" }}>
          <select style={{ height: "100%", padding: "9px 32px 9px 13px", border: `1px solid ${t.rule}`, background: t.panel, color: t.body, fontSize: 13, ...Sf4, appearance: "none", cursor: "pointer", minWidth: 160 }}>
            {subjects.map(s => <option key={s}>{s}</option>)}
          </select>
          <span style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: t.muted, fontSize: 10, pointerEvents: "none" }}>▾</span>
        </div>
        <div style={{ display: "flex", border: `1px solid ${t.rule}`, overflow: "hidden" }}>
          {["Top rated", "Most used", "Newest"].map((s, i) => (
            <button key={s} style={{ padding: "9px 14px", border: "none", borderRight: i < 2 ? `1px solid ${t.rule}` : "none", background: i === 0 ? t.ink : t.panel, color: i === 0 ? t.bg : t.body, fontSize: 12, fontWeight: i === 0 ? 700 : 500, ...Sf4, cursor: "pointer", whiteSpace: "nowrap" }}>{s}</button>
          ))}
        </div>
      </div>

      {/* Card grid — 3 col */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
        {community.map((q, i) => (
          <div key={i} style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            <div>
              <div style={{ fontSize: 9, letterSpacing: 1.5, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 4 }}>{q.subject}</div>
              <div style={{ ...Sf4, fontSize: 14, fontWeight: 600, color: t.ink, lineHeight: 1.3 }}>{q.title}</div>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              {q.tags.map((tag, ti) => (
                <span key={ti} style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, padding: "2px 7px", background: t.panel2, color: t.body, border: `1px solid ${t.rule}` }}>{tag}</span>
              ))}
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, padding: "2px 7px", background: t.panel2, color: t.body, border: `1px solid ${t.rule}` }}>{q.q} q.</span>
              <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, padding: "2px 7px", background: q.diff === "Hard" ? `${t.ink}0D` : t.panel2, color: q.diff === "Hard" ? t.ink : t.body, border: `1px solid ${t.rule}` }}>{q.diff}</span>
            </div>
            <div style={{ height: 1, background: t.rule }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <StarIc />
                <span style={{ ...Sf4, fontSize: 11.5, fontWeight: 600, color: t.ink }}>{q.rating}</span>
                <span style={{ fontSize: 11, color: t.muted }}>· {q.uses} uses</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ ...Sf4, fontSize: 11, color: t.muted }}>{q.author}</span>
                <button style={{ display: "inline-flex", padding: "4px 10px", background: t.ink, border: "none", color: t.bg, fontSize: 11, ...Sf4, fontWeight: 600, cursor: "pointer" }}>Use →</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Shell4>
  );
};


// ─────────────────────────────────────────────────────────────
// Quiz · History — full log of past sittings
// ─────────────────────────────────────────────────────────────
export const Quiz4History: React.FC<{ t: Theme }> = ({ t }) => {
  const allScores = [78, 85, 81, 88, 92, 74, 95, 74, 91];
  const allAvg  = Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length);
  const allBest = Math.max(...allScores);

  const entries = [
    { title: "CS161 — Algorithms",           type: "My Quiz", score: 81, q: 25, time: "22 min", date: "Apr 28", correct: 20, wrong: 4, skip: 1 },
    { title: "Microeconomics — Principles",  type: "Global",  score: 88, q: 40, time: "41 min", date: "Apr 21", correct: 35, wrong: 4, skip: 1 },
    { title: "Microeconomics — Ch. VII",     type: "My Quiz", score: 92, q: 30, time: "26 min", date: "Apr 14", correct: 28, wrong: 2, skip: 0 },
    { title: "Linear Algebra — Midterm Set", type: "Global",  score: 74, q: 30, time: "34 min", date: "Apr 7",  correct: 22, wrong: 7, skip: 1 },
  ];
  const monthAvg  = Math.round(entries.reduce((a, b) => a + b.score, 0) / entries.length);
  const monthBest = Math.max(...entries.map(e => e.score));
  const tier = (s) => s >= 90 ? t.accent : s >= 80 ? t.body : t.muted;

  return (
    <Shell4 t={t} active="qz">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>Examinations</div>
          <h1 style={{ ...Sf4, fontSize: 36, fontWeight: 600, color: t.ink, margin: "6px 0 4px", letterSpacing: -0.8 }}>History.</h1>
          <p style={{ ...Sf4, fontSize: 13, color: t.muted, margin: 0 }}>Every sitting, in full.</p>
        </div>
        <div style={{ display: "flex", gap: 24, alignItems: "baseline", paddingBottom: 4, borderBottom: `1px solid ${t.rule}` }}>
          {[{ k: "quizzes", l: "My Quizzes" }, { k: "exams", l: "Global Exams" }].map(o => {
            const on = o.k === "quizzes";
            return <button key={o.k} style={{ background: "transparent", border: "none", borderBottom: on ? `2px solid ${t.accent}` : "2px solid transparent", padding: "2px 0 6px", cursor: "pointer", color: on ? t.ink : t.muted, fontSize: 14, fontWeight: on ? 600 : 500, ...Sf4, marginBottom: -5 }}>{o.l}</button>;
          })}
        </div>
      </div>
      <div style={{ height: 1, background: t.ink, marginTop: 14, marginBottom: 14, opacity: 0.8 }} />

      {/* Sub-tabs */}
      <div style={{ display: "flex", gap: 22, marginBottom: 16, borderBottom: `1px solid ${t.rule}`, paddingBottom: 2 }}>
        {[{ k: "create", l: "Create Quiz" }, { k: "mine", l: "My Quizzes", n: 6 }, { k: "explore", l: "Explore" }, { k: "history", l: "History", n: allScores.length }].map(it => {
          const on = it.k === "history";
          return <button key={it.k} style={{ background: "transparent", border: "none", borderBottom: on ? `2px solid ${t.accent}` : "2px solid transparent", padding: "2px 0 6px", cursor: "pointer", color: on ? t.ink : t.muted, fontSize: 13.5, fontWeight: on ? 600 : 500, ...Sf4, marginBottom: -3 }}>{it.l}{typeof it.n === "number" ? ` ${it.n}` : ""}</button>;
        })}
      </div>

      {/* Summary strip */}
      <div style={{ display: "flex", background: t.ink, marginBottom: 20 }}>
        {[[allScores.length.toString(), "total sittings"], [allAvg + "%", "all-time average"], [allBest + "%", "best score"], ["3 mo.", "span"]].map(([v, l], i) => (
          <div key={i} style={{ flex: 1, padding: "11px 20px", borderRight: i < 3 ? `1px solid ${t.bg}14` : "none", textAlign: "center" }}>
            <div style={{ ...Sf4, fontSize: 22, fontWeight: 600, color: t.bg, lineHeight: 1 }}>{v}</div>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, textTransform: "uppercase", marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Month navigator */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
        <button style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, background: t.panel, border: `1px solid ${t.rule}`, color: t.muted, fontSize: 14, cursor: "pointer" }}>‹</button>
        <span style={{ ...Sf4, fontSize: 15, fontWeight: 600, color: t.ink }}>April 2026</span>
        <button style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 30, height: 30, background: t.panel, border: `1px solid ${t.rule}`, color: t.muted, fontSize: 14, cursor: "pointer" }}>›</button>
      </div>

      {/* 2-col: left summary panel + right entry list */}
      <div style={{ display: "grid", gridTemplateColumns: "210px 1fr", gap: 16 }}>

        {/* Left: month summary */}
        <div style={{ background: t.ink, padding: "20px 18px", alignSelf: "start" }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: `${t.bg}55`, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>April 2026</div>
          <div style={{ ...Sf4, fontSize: 48, fontWeight: 600, color: t.bg, lineHeight: 1 }}>{monthAvg}<span style={{ fontSize: 18, color: t.accent }}>%</span></div>
          <div style={{ ...Sf4, fontSize: 11, color: t.accent, marginTop: 5, marginBottom: 16 }}>— monthly average</div>
          <div style={{ height: 1, background: `${t.bg}14`, marginBottom: 14 }} />
          {[["4", "sittings this month"], [monthBest + "%", "best this month"], ["2", "global exams"]].map(([v, l]) => (
            <div key={l} style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 9 }}>
              <span style={{ fontSize: 11, color: `${t.bg}77` }}>{l}</span>
              <span style={{ ...Sf4, fontSize: 14, fontWeight: 600, color: t.bg }}>{v}</span>
            </div>
          ))}
          <div style={{ height: 1, background: `${t.bg}14`, marginTop: 6, marginBottom: 12 }} />
          <div style={{ fontSize: 9, letterSpacing: 1.5, color: `${t.bg}44`, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>vs. all-time avg</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ flex: 1, height: 3, background: `${t.bg}22` }}>
              <div style={{ width: monthAvg + "%", height: "100%", background: t.accent }} />
            </div>
            <span style={{ ...Sf4, fontSize: 11, color: t.accent }}>+{monthAvg - allAvg}%</span>
          </div>
        </div>

        {/* Right: entry rows */}
        <div>
          {entries.map((e, i) => {
            const correctPct = (e.correct / e.q) * 100;
            const wrongPct   = (e.wrong  / e.q) * 100;
            const skipPct    = (e.skip   / e.q) * 100;
            const scoreColor = tier(e.score);
            return (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16, padding: "16px 0", borderBottom: i < entries.length - 1 ? `1px solid ${t.rule}` : "none" }}>
                {/* Score — tier-colored left stroke, no box */}
                <div style={{ flexShrink: 0, borderLeft: `3px solid ${scoreColor}`, paddingLeft: 10, minWidth: 46 }}>
                  <div style={{ ...Sf4, fontSize: 26, fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{e.score}</div>
                  <div style={{ fontSize: 9, color: scoreColor, opacity: 0.65, letterSpacing: 1 }}>%</div>
                </div>
                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ ...Sf4, fontSize: 14, fontWeight: 600, color: t.ink, marginBottom: 5 }}>{e.title}</div>
                  <div style={{ display: "flex", gap: 7, alignItems: "center", marginBottom: 9 }}>
                    <span style={{ fontSize: 11, color: t.muted }}>{e.date}</span>
                    <span style={{ fontSize: 11, color: t.rule }}>·</span>
                    <span style={{ fontSize: 11, color: t.muted }}>{e.q} q.</span>
                    <span style={{ fontSize: 11, color: t.rule }}>·</span>
                    <span style={{ fontSize: 11, color: t.muted }}>{e.time}</span>
                    <span style={{ fontSize: 10, padding: "1px 7px", background: e.type === "Global" ? `${t.ink}12` : t.accentSoft, color: e.type === "Global" ? t.ink : t.accent, fontWeight: 700 }}>{e.type}</span>
                  </div>
                  {/* Segmented answer bar */}
                  <div style={{ display: "flex", height: 3, marginBottom: 6, gap: 1 }}>
                    <div style={{ width: correctPct + "%", background: t.accent, opacity: 0.75 }} />
                    <div style={{ width: wrongPct  + "%", background: t.muted,  opacity: 0.45 }} />
                    {e.skip > 0 && <div style={{ width: skipPct + "%", background: t.rule }} />}
                  </div>
                  {/* Count text */}
                  <div style={{ display: "flex", gap: 14 }}>
                    <span style={{ fontSize: 10, color: t.accent }}>{e.correct} correct</span>
                    <span style={{ fontSize: 10, color: t.muted }}>{e.wrong} wrong</span>
                    {e.skip > 0 && <span style={{ fontSize: 10, color: t.rule }}>{e.skip} skipped</span>}
                  </div>
                </div>
                <button style={{ display: "inline-flex", padding: "5px 12px", background: "transparent", border: `1px solid ${t.rule}`, color: t.body, fontSize: 11, ...Sf4, cursor: "pointer", flexShrink: 0, marginTop: 2 }}>Retake</button>
              </div>
            );
          })}
        </div>
      </div>
    </Shell4>
  );
};


// ─────────────────────────────────────────────────────────────
// EduPlay — The Games Room · Hub (game selection grid)
// ─────────────────────────────────────────────────────────────
export const Play4: React.FC<{ t: Theme }> = ({ t }) => {
  const leaderboard = [
    { rank: 1, init: "Y", name: "Yusuf B.",  pts: 2840, you: false },
    { rank: 2, init: "J", name: "You",        pts: 2610, you: true  },
    { rank: 3, init: "L", name: "Layla A.",  pts: 2480, you: false },
    { rank: 4, init: "K", name: "Karim H.",  pts: 1920, you: false },
    { rank: 5, init: "R", name: "Reem S.",   pts: 1750, you: false },
  ];
  const games = [
    {
      k: "rush", live: true, badge: "Live",
      sub: "Multiplayer · Real-time",
      title: "Brain Rush.",
      desc: "Head-to-head quiz duels against classmates. First to 7 correct wins. Host a room, join a friend's game, or enter a ranked online match.",
      cta: "Enter the arena →",
    },
    { k: "flash", live: false, sub: "Solo · Flashcards",       title: "Flash Sprint.",    desc: "Race through a deck against the clock. Every correct answer extends your time." },
    { k: "daily", live: false, sub: "Community · Shared set",  title: "Daily Challenge.", desc: "One curated question set per day, shared across the whole community." },
    { k: "tourn", live: false, sub: "Competitive · Bracket",   title: "Tournament.",      desc: "Bracket-style competitions across a full course. Win rounds to advance." },
  ];
  const recentSessions = [
    { mode: "Brain Rush", detail: "vs. Layla A.",    result: "Won 7–4",  pts: "+350", date: "Today" },
    { mode: "Brain Rush", detail: "vs. Karim H.",    result: "Won 7–5",  pts: "+350", date: "Today" },
    { mode: "Brain Rush", detail: "vs. Reem S.",     result: "Lost 4–7", pts: "+80",  date: "Yesterday" },
    { mode: "Brain Rush", detail: "Ranked Online",   result: "Won 7–3",  pts: "+420", date: "Monday" },
  ];
  return (
    <Shell4 t={t} active="play">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>The Games Room</div>
          <h1 style={{ ...Sf4, fontSize: 38, fontWeight: 600, color: t.ink, margin: "6px 0 4px", letterSpacing: -0.8 }}>Play & Learn.</h1>
          <p style={{ fontSize: 13, color: t.muted, margin: 0 }}>choose your game — every session sharpens your edge.</p>
        </div>
      </div>
      <div style={{ height: 1, background: t.ink, marginTop: 14, marginBottom: 22, opacity: 0.8 }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 22 }}>
        {/* Left: game cards */}
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            {games.map((g) => {
              const on = g.live;
              return (
                <div key={g.k} style={{ background: on ? t.ink : t.panel, border: on ? "none" : `1px solid ${t.rule}`, padding: "22px 22px 20px", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div>
                      <div style={{ fontSize: 9, letterSpacing: 1.5, color: on ? t.accent : t.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 5 }}>{g.sub}</div>
                      <div style={{ ...Sf4, fontSize: 18, fontWeight: 600, color: on ? t.bg : t.ink, letterSpacing: -0.3 }}>{g.title}</div>
                    </div>
                    {on
                      ? <div style={{ fontSize: 9, letterSpacing: 1.5, padding: "3px 10px", background: t.accent, color: t.bg, fontWeight: 700, textTransform: "uppercase", borderRadius: 20, flexShrink: 0 }}>Live</div>
                      : <div style={{ fontSize: 9, letterSpacing: 1.5, padding: "3px 8px", border: `1px solid ${t.rule}`, color: t.muted, fontWeight: 700, textTransform: "uppercase", borderRadius: 3, flexShrink: 0 }}>Soon</div>
                    }
                  </div>
                  <div style={{ fontSize: 12, color: on ? `${t.bg}77` : t.muted, lineHeight: 1.65, flex: 1, marginBottom: 16 }}>{g.desc}</div>
                  {on
                    ? <button style={{ padding: "8px 0", background: t.accent, color: t.bg, border: "none", fontSize: 12.5, fontWeight: 700, ...Sf4, cursor: "pointer", borderRadius: 3, textAlign: "center" }}>{g.cta}</button>
                    : <div style={{ fontSize: 11, color: t.muted, fontStyle: "italic" }}>Coming soon.</div>
                  }
                </div>
              );
            })}
          </div>

          {/* Recent Sessions */}
          <div style={{ marginTop: 22 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Recent Sessions</div>
            <div style={{ background: t.panel, border: `1px solid ${t.rule}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px 70px", padding: "6px 16px", borderBottom: `1px solid ${t.rule}` }}>
                {["Game · Details", "Result", "Pts", "Date"].map(h => (
                  <div key={h} style={{ fontSize: 9, letterSpacing: 1.5, color: t.muted, fontWeight: 700, textTransform: "uppercase" }}>{h}</div>
                ))}
              </div>
              {recentSessions.map((r, i) => (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px 70px", padding: "10px 16px", borderBottom: i < recentSessions.length - 1 ? `1px solid ${t.rule}` : "none", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 600, color: t.ink }}>{r.mode}</div>
                    <div style={{ fontSize: 11, color: t.muted, marginTop: 1 }}>{r.detail}</div>
                  </div>
                  <div style={{ fontSize: 12, color: r.result.startsWith("Won") ? t.accent : t.muted, fontWeight: r.result.startsWith("Won") ? 600 : 400 }}>{r.result}</div>
                  <div style={{ ...Sf4, fontSize: 13, fontWeight: 600, color: t.accent }}>{r.pts}</div>
                  <div style={{ fontSize: 11, color: t.muted }}>{r.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Your Record */}
          <div style={{ background: t.ink, padding: "20px 18px" }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: `${t.bg}44`, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>Your Record</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
              <span style={{ ...Sf4, fontSize: 36, fontWeight: 700, color: t.bg }}>7</span>
              <span style={{ fontSize: 14, color: t.accent, fontWeight: 600 }}>W</span>
              <span style={{ ...Sf4, fontSize: 22, fontWeight: 400, color: `${t.bg}33`, margin: "0 4px" }}>—</span>
              <span style={{ ...Sf4, fontSize: 36, fontWeight: 700, color: `${t.bg}55` }}>3</span>
              <span style={{ fontSize: 14, color: `${t.bg}44`, fontWeight: 600 }}>L</span>
            </div>
            <div style={{ fontSize: 11, color: `${t.bg}55`, marginBottom: 14 }}>this week · Brain Rush</div>
            <div style={{ height: 1, background: `${t.bg}14`, marginBottom: 14 }} />
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["70%", "win rate"], ["2,610", "total pts"], ["10", "games"], ["8.2s", "avg time"]].map(([v, l]) => (
                <div key={l}>
                  <div style={{ ...Sf4, fontSize: 16, fontWeight: 600, color: t.bg }}>{v}</div>
                  <div style={{ fontSize: 9, color: `${t.bg}44`, letterSpacing: 1, textTransform: "uppercase", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Leaderboard */}
          <div style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: "16px 16px" }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>Leaderboard · This Week</div>
            {leaderboard.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 6px", borderBottom: i < leaderboard.length - 1 ? `1px solid ${t.rule}` : "none", background: p.you ? t.accentSoft : "transparent", borderRadius: p.you ? 2 : 0 }}>
                <span style={{ ...Sf4, fontSize: 12, color: p.rank === 1 ? t.accent : t.muted, fontWeight: p.rank === 1 ? 700 : 400, width: 13 }}>{p.rank}</span>
                <div style={{ width: 24, height: 24, borderRadius: 999, background: p.you ? t.accent : t.ink, color: t.bg, display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{p.init}</div>
                <span style={{ fontSize: 12, fontWeight: p.you ? 700 : 500, color: p.you ? t.ink : t.body, flex: 1 }}>{p.name}</span>
                <span style={{ ...Sf4, fontSize: 12, color: p.you ? t.accent : t.muted }}>{p.pts.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// EduPlay — Brain Rush · Lobby (host / join / online)
// ─────────────────────────────────────────────────────────────
export const Play4Lobby: React.FC<{ t: Theme }> = ({ t }) => {
  const recentSessions = [
    { type: "class", label: "Brain Rush · Room MFHX-2847", detail: "18 players · Game Theory",        result: "You: #2 / 18",  pts: "+850",  date: "Today"     },
    { type: "1v1",   label: "Brain Rush vs. Layla A.",     detail: "1v1 Ranked · Microeconomics",      result: "Won  7–4",      pts: "+350",  date: "Yesterday" },
    { type: "class", label: "Brain Rush · Room KPLX-1234", detail: "12 players · Calculus II",         result: "You: #1 / 12",  pts: "+1,200",date: "Monday"    },
    { type: "1v1",   label: "Brain Rush · Ranked Queue",   detail: "1v1 Ranked · Anatomy",             result: "Lost  4–7",     pts: "+80",   date: "Monday"    },
  ];
  const leaderboard = [
    { rank: 1, init: "Y", name: "Yusuf B.", pts: 2840, you: false },
    { rank: 2, init: "J", name: "You",       pts: 2610, you: true  },
    { rank: 3, init: "L", name: "Layla A.", pts: 2480, you: false },
    { rank: 4, init: "K", name: "Karim H.", pts: 1920, you: false },
    { rank: 5, init: "R", name: "Reem S.",  pts: 1750, you: false },
  ];
  return (
    <Shell4 t={t} active="play">
      {/* Game header banner */}
      <div style={{ background: t.ink, padding: "20px 26px", marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 5 }}>The Games Room · Brain Rush</div>
          <div style={{ ...Sf4, fontSize: 26, fontWeight: 600, color: t.bg, letterSpacing: -0.5, marginBottom: 5 }}>Brain Rush.</div>
          <div style={{ fontSize: 12, color: `${t.bg}55` }}>Real-time quiz duels · First to 7 correct wins · +350 pts per win</div>
        </div>
        <button style={{ padding: "7px 16px", background: t.accent, border: "none", color: t.bg, fontSize: 12, fontWeight: 700, cursor: "pointer", borderRadius: 3 }}>← Back</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 22 }}>
        <div>
          {/* Lobby options */}
          <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>How do you want to play?</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 22 }}>
            {[
              { k: "host",   icon: "⊕", label: "Host a Game",   sub: "Create a private room and share a code with your classmate.", cta: "Host →",        primary: true  },
              { k: "join",   icon: "→", label: "Join a Game",    sub: "Enter a room code from your classmate to join their session.", cta: "Join →",       primary: false },
              { k: "ranked", icon: "◈", label: "Play Online",    sub: "Enter the ranked queue and get matched against players live.",  cta: "Find match →", primary: false },
            ].map(o => (
              <div key={o.k} style={{ background: o.primary ? t.ink : t.panel, border: o.primary ? "none" : `1px solid ${t.rule}`, padding: "20px 18px", display: "flex", flexDirection: "column" }}>
                <div style={{ fontSize: 18, marginBottom: 8, color: o.primary ? t.accent : t.muted }}>{o.icon}</div>
                <div style={{ ...Sf4, fontSize: 15, fontWeight: 600, color: o.primary ? t.bg : t.ink, marginBottom: 6 }}>{o.label}.</div>
                <div style={{ fontSize: 11.5, color: o.primary ? `${t.bg}66` : t.muted, lineHeight: 1.65, flex: 1, marginBottom: 14 }}>{o.sub}</div>
                <button style={{ padding: "7px 0", background: o.primary ? t.accent : "transparent", border: o.primary ? "none" : `1px solid ${t.rule}`, color: o.primary ? t.bg : t.body, fontSize: 12, fontWeight: o.primary ? 700 : 400, cursor: "pointer", borderRadius: 3, textAlign: "center" }}>{o.cta}</button>
              </div>
            ))}
          </div>

          {/* Recent Sessions */}
          <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Recent Sessions</div>
          <div style={{ background: t.panel, border: `1px solid ${t.rule}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 110px 80px 60px", padding: "6px 16px", borderBottom: `1px solid ${t.rule}` }}>
              {["Session","Result","Pts","Date"].map(h => (
                <div key={h} style={{ fontSize: 9, letterSpacing: 1.5, color: t.muted, fontWeight: 700, textTransform: "uppercase" }}>{h}</div>
              ))}
            </div>
            {recentSessions.map((s, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 110px 80px 60px", padding: "11px 16px", borderBottom: i < recentSessions.length - 1 ? `1px solid ${t.rule}` : "none", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: t.ink }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: t.muted, marginTop: 1 }}>{s.detail}</div>
                </div>
                <div style={{ fontSize: 12, color: s.result.startsWith("Won") || s.result.startsWith("You: #1") ? t.accent : t.muted, fontWeight: 600 }}>{s.result}</div>
                <div style={{ ...Sf4, fontSize: 13, fontWeight: 600, color: t.accent }}>{s.pts}</div>
                <div style={{ fontSize: 11, color: t.muted }}>{s.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Online counter */}
          <div style={{ background: t.ink, padding: "18px 18px" }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: `${t.bg}44`, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Online Now</div>
            <div style={{ ...Sf4, fontSize: 34, fontWeight: 600, color: t.bg }}>248</div>
            <div style={{ fontSize: 11, color: `${t.bg}55`, marginTop: 2 }}>players in the arena</div>
            <div style={{ height: 1, background: `${t.bg}14`, margin: "12px 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
              <div style={{ fontSize: 10, color: `${t.bg}44` }}>In matches</div>
              <div style={{ fontSize: 10, color: t.accent }}>186</div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ fontSize: 10, color: `${t.bg}44` }}>In queue</div>
              <div style={{ fontSize: 10, color: t.accent }}>62</div>
            </div>
          </div>

          {/* Leaderboard */}
          <div style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: "16px 16px" }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>Leaderboard · This Week</div>
            {leaderboard.map((p, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 6px", borderBottom: i < leaderboard.length - 1 ? `1px solid ${t.rule}` : "none", background: p.you ? t.accentSoft : "transparent", borderRadius: p.you ? 2 : 0 }}>
                <span style={{ ...Sf4, fontSize: 12, color: p.rank === 1 ? t.accent : t.muted, fontWeight: p.rank === 1 ? 700 : 400, width: 13 }}>{p.rank}</span>
                <div style={{ width: 24, height: 24, borderRadius: 999, background: p.you ? t.accent : t.ink, color: t.bg, display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700, flexShrink: 0 }}>{p.init}</div>
                <span style={{ fontSize: 12, fontWeight: p.you ? 700 : 500, color: p.you ? t.ink : t.body, flex: 1 }}>{p.name}</span>
                <span style={{ ...Sf4, fontSize: 12, color: p.you ? t.accent : t.muted }}>{p.pts.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// EduPlay — Brain Rush · Active match (classroom / multi-player)
// ─────────────────────────────────────────────────────────────
export const Play4Battle: React.FC<{ t: Theme }> = ({ t }) => {
  const players = [
    { rank: 1,  init: "J", name: "You",       score: 4, you: true  },
    { rank: 2,  init: "L", name: "Layla A.",  score: 4, you: false },
    { rank: 3,  init: "K", name: "Karim H.",  score: 3, you: false },
    { rank: 4,  init: "A", name: "Ahmad M.",  score: 3, you: false },
    { rank: 5,  init: "R", name: "Reem S.",   score: 2, you: false },
    { rank: 6,  init: "S", name: "Sara O.",   score: 2, you: false },
    { rank: 7,  init: "N", name: "Nour F.",   score: 2, you: false },
    { rank: 8,  init: "D", name: "Dina T.",   score: 1, you: false },
    { rank: 9,  init: "M", name: "Mariam Y.", score: 1, you: false },
    { rank: 10, init: "H", name: "Hassan B.", score: 1, you: false },
    { rank: 11, init: "Y", name: "Yusuf S.",  score: 0, you: false },
    { rank: 12, init: "F", name: "Fatima N.", score: 0, you: false },
  ];
  const opts = [
    "A strategy that maximises total social welfare",
    "A set of strategies where no player benefits from deviating unilaterally",
    "The outcome where all players choose the same strategy",
    "An equilibrium achieved only in zero-sum games",
  ];
  const strip = players.slice(0, 7);
  return (
    <Shell4 t={t} active="play">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>Brain Rush · Question 6 / 10</div>
          <div style={{ fontSize: 11, color: t.muted, marginTop: 2 }}>Game Theory — Nash Equilibria · 20 players</div>
        </div>
        <button style={{ padding: "4px 12px", background: "transparent", border: `1px solid ${t.rule}`, color: t.muted, fontSize: 11, cursor: "pointer", borderRadius: 3 }}>Leave Game</button>
      </div>
      <div style={{ height: 1, background: t.ink, marginTop: 10, marginBottom: 14, opacity: 0.8 }} />

      {/* Live Rankings Strip */}
      <div style={{ display: "flex", gap: 5, marginBottom: 14 }}>
        {strip.map((p, i) => (
          <div key={i} style={{ flex: i < 2 ? "0 0 auto" : 1, display: "flex", alignItems: "center", gap: 7, padding: "7px 11px", background: p.you ? t.ink : (i === 0 ? t.accentSoft : t.panel), border: p.you ? `1px solid ${t.accent}` : `1px solid ${t.rule}`, minWidth: 0 }}>
            <span style={{ fontSize: 9, color: i === 0 ? t.accent : (p.you ? t.accent : t.muted), fontWeight: 700, flexShrink: 0 }}>#{p.rank}</span>
            <div style={{ width: 22, height: 22, borderRadius: 999, background: p.you ? t.accent : (i === 0 ? t.ink : t.panel2), color: p.you ? t.bg : (i === 0 ? t.bg : t.muted), display: "grid", placeItems: "center", fontSize: 9, fontWeight: 700, flexShrink: 0, border: `1px solid ${t.rule}` }}>{p.init}</div>
            <span style={{ fontSize: 11, color: p.you ? t.bg : t.ink, fontWeight: p.you ? 700 : 500, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{p.name}</span>
            <span style={{ ...Sf4, fontSize: 14, fontWeight: 700, color: p.you ? t.accent : (i === 0 ? t.accent : t.muted), flexShrink: 0 }}>{p.score}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", padding: "7px 11px", background: t.panel2, border: `1px solid ${t.rule}`, flexShrink: 0, gap: 3 }}>
          {players.slice(7, 10).map((p, i) => (
            <div key={i} style={{ width: 20, height: 20, borderRadius: 999, background: t.ink, color: t.bg, display: "grid", placeItems: "center", fontSize: 8, fontWeight: 700 }}>{p.init}</div>
          ))}
          <span style={{ fontSize: 10, color: t.muted, marginLeft: 3 }}>+10</span>
        </div>
      </div>

      {/* Timer */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ height: 4, background: t.rule, borderRadius: 2 }}>
          <div style={{ width: "55%", height: "100%", background: t.accent, borderRadius: 2 }} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          <span style={{ fontSize: 10, color: t.muted }}>time remaining</span>
          <span style={{ ...Sf4, fontSize: 13, fontWeight: 600, color: t.ink }}>11s</span>
        </div>
      </div>

      {/* Question — full width, bigger */}
      <div style={{ ...Sf4, fontSize: 20, fontWeight: 600, color: t.ink, lineHeight: 1.5, marginBottom: 18, borderLeft: `3px solid ${t.accent}`, paddingLeft: 18 }}>
        Which of the following best describes a Nash Equilibrium?
      </div>

      {/* Answer options — bigger, 2×2 */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {opts.map((opt, i) => {
          const selected = i === 1;
          return (
            <div key={i} style={{ display: "flex", gap: 14, alignItems: "flex-start", padding: "18px 20px", background: selected ? t.accentSoft : t.panel, border: selected ? `2px solid ${t.accent}` : `1px solid ${t.rule}`, cursor: "pointer", borderRadius: 3, minHeight: 80 }}>
              <span style={{ fontSize: 11, letterSpacing: 1, color: selected ? t.accent : t.muted, fontWeight: 700, flexShrink: 0, marginTop: 2 }}>{["A","B","C","D"][i]}</span>
              <span style={{ fontSize: 13.5, color: selected ? t.ink : t.body, fontWeight: selected ? 600 : 400, lineHeight: 1.55 }}>{opt}</span>
            </div>
          );
        })}
      </div>

      {/* Game info strip */}
      <div style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: "9px 16px", display: "flex", gap: 24, marginBottom: 18 }}>
        {[["Topic","Game Theory — Microeconomics"],["Format","Most correct answers wins"],["Points","+100 correct · −20 wrong"]].map(([k,v]) => (
          <div key={k} style={{ display: "flex", gap: 6, alignItems: "baseline" }}>
            <span style={{ fontSize: 9, color: t.muted, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700 }}>{k}</span>
            <span style={{ fontSize: 11, color: t.ink, fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>

      {/* Live Leaderboard grid — 3-col, rank 1 wider */}
      <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Live Standings · 20 Players</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
        {/* Rank 1 spans full row */}
        {players.slice(0, 1).map((p) => (
          <div key={p.rank} style={{ gridColumn: "span 3", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: p.you ? t.ink : t.accentSoft, border: `2px solid ${t.accent}` }}>
            <span style={{ ...Sf4, fontSize: 22, fontWeight: 700, color: t.accent, minWidth: 26 }}>1</span>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: p.you ? t.accent : t.ink, color: t.bg, display: "grid", placeItems: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{p.init}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: p.you ? t.bg : t.ink }}>{p.name}</div>
              <div style={{ fontSize: 10, color: p.you ? `${t.bg}55` : t.muted }}>Leading the room</div>
            </div>
            <span style={{ ...Sf4, fontSize: 26, fontWeight: 700, color: t.accent }}>{p.score}</span>
          </div>
        ))}
        {/* Ranks 2–3 beside rank 1 */}
        {players.slice(1, 3).map((p, i) => (
          <div key={p.rank} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 12px", background: p.you ? t.ink : t.panel, border: p.you ? `1px solid ${t.accent}` : `1px solid ${t.rule}` }}>
            <span style={{ ...Sf4, fontSize: 16, fontWeight: 700, color: t.muted, minWidth: 20 }}>{p.rank}</span>
            <div style={{ width: 26, height: 26, borderRadius: 999, background: p.you ? t.accent : t.ink, color: t.bg, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{p.init}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: p.you ? 700 : 500, color: p.you ? t.bg : t.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
            </div>
            <span style={{ ...Sf4, fontSize: 15, fontWeight: 700, color: p.score > 0 ? t.muted : t.muted }}>{p.score}</span>
          </div>
        ))}
        {/* Ranks 4–12 flow 3-per-row */}
        {players.slice(3).map((p, i) => (
          <div key={p.rank} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", background: p.you ? t.accentSoft : t.panel, border: p.you ? `1px solid ${t.accent}` : `1px solid ${t.rule}` }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: t.muted, minWidth: 18 }}>{p.rank}</span>
            <div style={{ width: 22, height: 22, borderRadius: 999, background: p.you ? t.accent : t.ink, color: t.bg, display: "grid", placeItems: "center", fontSize: 8, fontWeight: 700, flexShrink: 0 }}>{p.init}</div>
            <span style={{ fontSize: 11, color: p.you ? t.ink : t.body, fontWeight: p.you ? 700 : 400, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
            <span style={{ ...Sf4, fontSize: 12, fontWeight: 600, color: p.score > 0 ? t.accent : t.muted }}>{p.score}</span>
          </div>
        ))}
        {/* +8 more chip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "9px 12px", background: t.panel2, border: `1px solid ${t.rule}` }}>
          <span style={{ fontSize: 11, color: t.muted, fontStyle: "italic" }}>+ 8 more</span>
        </div>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// EduPlay — Brain Rush · Between-question leaderboard (classroom)
// ─────────────────────────────────────────────────────────────
export const Play4BattleLeader: React.FC<{ t: Theme }> = ({ t }) => {
  const allPlayers = [
    { rank:1, prev:2, init:"J", name:"You",       correct:true,  pts:"+100", score:4, total:480, you:true  },
    { rank:2, prev:1, init:"L", name:"Layla A.",  correct:true,  pts:"+100", score:4, total:440, you:false },
    { rank:3, prev:3, init:"K", name:"Karim H.",  correct:false, pts:"−20",  score:3, total:360, you:false },
    { rank:4, prev:5, init:"A", name:"Ahmad M.",  correct:true,  pts:"+100", score:3, total:320, you:false },
    { rank:5, prev:4, init:"R", name:"Reem S.",   correct:false, pts:"−20",  score:2, total:200, you:false },
    { rank:6, prev:6, init:"S", name:"Sara O.",   correct:true,  pts:"+100", score:2, total:180, you:false },
    { rank:7, prev:8, init:"N", name:"Nour F.",   correct:false, pts:"−20",  score:2, total:160, you:false },
    { rank:8, prev:7, init:"D", name:"Dina T.",   correct:false, pts:"−20",  score:1, total:80,  you:false },
    { rank:9, prev:9, init:"M", name:"Mariam Y.", correct:true,  pts:"+100", score:1, total:60,  you:false },
  ];
  return (
    <Shell4 t={t} active="play">
      {/* Label row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
        <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>Brain Rush · After Question 6 of 10</div>
        <div style={{ fontSize:11, color:t.muted }}>20 players · 4 questions remaining</div>
      </div>
      <div style={{ height:1, background:t.rule, marginTop:8, marginBottom:14 }} />

      {/* Your result — dramatic full-width banner */}
      <div style={{ background:t.ink, padding:"20px 28px", marginBottom:12, display:"flex", alignItems:"center", gap:28 }}>
        <div style={{ paddingRight:28, borderRight:`1px solid ${t.bg}14`, flexShrink:0 }}>
          <div style={{ fontSize:9, letterSpacing:2, color:`${t.bg}44`, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Your Rank</div>
          <div style={{ ...Sf4, fontSize:54, fontWeight:700, color:t.bg, lineHeight:1, letterSpacing:-2 }}>#1</div>
          <div style={{ fontSize:9, letterSpacing:1.5, color:t.accent, fontWeight:700, marginTop:6, textTransform:"uppercase" }}>↑ Moved up from #2</div>
        </div>
        {[["480","Total pts"],["4 / 6","Correct"],["8.2s","Avg time"]].map(([v,l],i) => (
          <div key={i} style={{ paddingRight:i<2?28:0, borderRight:i<2?`1px solid ${t.bg}14`:"none", textAlign:"center" }}>
            <div style={{ ...Sf4, fontSize:30, fontWeight:700, color:t.bg, lineHeight:1 }}>{v}</div>
            <div style={{ fontSize:9, letterSpacing:1.5, color:`${t.bg}44`, textTransform:"uppercase", marginTop:5 }}>{l}</div>
          </div>
        ))}
        <div style={{ marginLeft:"auto", textAlign:"right" }}>
          <div style={{ fontSize:9, letterSpacing:2, color:`${t.bg}33`, textTransform:"uppercase", marginBottom:4 }}>This round</div>
          <div style={{ ...Sf4, fontSize:36, fontWeight:700, color:t.accent, lineHeight:1 }}>+100</div>
        </div>
      </div>

      {/* Answer reveal */}
      <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderLeft:`3px solid ${t.accent}`, padding:"14px 20px", marginBottom:14 }}>
        <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Correct Answer — Round 6</div>
        <div style={{ ...Sf4, fontSize:15, fontWeight:600, color:t.ink, marginBottom:6 }}>B — A set of strategies where no player benefits from deviating unilaterally</div>
        <div style={{ fontSize:12, color:t.muted, lineHeight:1.65 }}>Nash equilibrium: each player's strategy is a best response to all others — no one gains by switching alone. <strong style={{ color:t.body }}>12 of 20 players</strong> answered correctly.</div>
      </div>

      {/* Two-column: leaderboard + countdown */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 200px", gap:18 }}>
        {/* Leaderboard table */}
        <div>
          <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Class Standing · After Round 6</div>
          <div style={{ background:t.panel, border:`1px solid ${t.rule}` }}>
            <div style={{ display:"grid", gridTemplateColumns:"30px 1fr 44px 52px 64px", padding:"6px 14px", borderBottom:`1px solid ${t.rule}` }}>
              {["#","Player","Chg","Score","Pts"].map(h => (
                <div key={h} style={{ fontSize:9, letterSpacing:1.5, color:t.muted, fontWeight:700, textTransform:"uppercase" }}>{h}</div>
              ))}
            </div>
            {allPlayers.map((p,i) => {
              const chg = p.prev - p.rank;
              return (
                <div key={i} style={{ display:"grid", gridTemplateColumns:"30px 1fr 44px 52px 64px", padding:"9px 14px", borderBottom:i<allPlayers.length-1?`1px solid ${t.rule}`:"none", alignItems:"center", background:p.you?t.accentSoft:"transparent" }}>
                  <span style={{ ...Sf4, fontSize:14, fontWeight:700, color:p.rank<=3?t.accent:t.muted }}>{p.rank}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
                    <div style={{ width:26, height:26, borderRadius:999, background:p.you?t.accent:t.ink, color:t.bg, display:"grid", placeItems:"center", fontSize:9, fontWeight:700, flexShrink:0 }}>{p.init}</div>
                    <div style={{ minWidth:0 }}>
                      <div style={{ fontSize:12, fontWeight:p.you?700:500, color:t.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</div>
                      <div style={{ fontSize:9, color:p.correct?t.accent:t.muted }}>{p.pts} this round</div>
                    </div>
                  </div>
                  <div style={{ fontSize:11, fontWeight:700, color:chg>0?"#5cb85c":chg<0?"#d9534f":t.muted }}>
                    {chg>0?`↑${chg}`:chg<0?`↓${Math.abs(chg)}`:"—"}
                  </div>
                  <span style={{ ...Sf4, fontSize:16, fontWeight:700, color:p.you?t.accent:t.muted }}>{p.score}</span>
                  <span style={{ ...Sf4, fontSize:12, fontWeight:600, color:t.accent }}>{p.total}</span>
                </div>
              );
            })}
            <div style={{ padding:"9px 14px", textAlign:"center" }}>
              <span style={{ fontSize:11, color:t.muted, fontStyle:"italic" }}>+ 11 more players · Ranks 10 – 20</span>
            </div>
          </div>
        </div>

        {/* Right: countdown + round stats */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ background:t.ink, padding:"20px 16px", textAlign:"center" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:`${t.bg}44`, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Next Question In</div>
            <div style={{ ...Sf4, fontSize:64, fontWeight:700, color:t.bg, lineHeight:1 }}>3</div>
            <div style={{ height:4, background:`${t.bg}18`, borderRadius:2, marginTop:14 }}>
              <div style={{ width:"30%", height:"100%", background:t.accent, borderRadius:2 }} />
            </div>
          </div>
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, padding:"14px 14px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.muted, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Round 6 Stats</div>
            {[["Correct","12 / 20"],["Avg time","8.4s"],["Fastest","Layla A. · 4.1s"],["Rank Δ","↑1"]].map(([k,v],i) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:10.5, color:t.muted }}>{k}</span>
                <span style={{ ...Sf4, fontSize:11, fontWeight:600, color:t.accent }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell4>
  );
};


// ─────────────────────────────────────────────────────────────
// EduPlay — Host a Game (question source + settings)
// ─────────────────────────────────────────────────────────────
export const Play4Host: React.FC<{ t: Theme }> = ({ t }) => (
  <Shell4 t={t} active="play">
    <div style={{ background: t.ink, padding: "20px 26px", marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 9, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 5 }}>The Games Room · Brain Rush</div>
        <div style={{ ...Sf4, fontSize: 24, fontWeight: 600, color: t.bg, letterSpacing: -0.5 }}>Host a Game.</div>
      </div>
      <button style={{ padding: "7px 16px", background: t.accent, border: "none", color: t.bg, fontSize: 12, fontWeight: 700, cursor: "pointer", borderRadius: 3 }}>← Back</button>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 22 }}>
      <div>
        {/* Question Source */}
        <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>Question Source</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
          <div style={{ background: t.ink, border: `2px solid ${t.accent}`, padding: "22px 20px", cursor: "pointer" }}>
            <div style={{ fontSize: 26, marginBottom: 10 }}>✦</div>
            <div style={{ ...Sf4, fontSize: 16, fontWeight: 600, color: t.bg, marginBottom: 6 }}>AI Generate.</div>
            <div style={{ fontSize: 12, color: `${t.bg}55`, lineHeight: 1.65, marginBottom: 14 }}>Let AI create questions on any topic you choose — set the difficulty and count.</div>
            <div style={{ fontSize: 9, letterSpacing: 1.5, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>Selected ✓</div>
          </div>
          <div style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: "22px 20px", cursor: "pointer", opacity: 0.7 }}>
            <div style={{ fontSize: 26, color: t.muted, marginBottom: 10 }}>✎</div>
            <div style={{ ...Sf4, fontSize: 16, fontWeight: 600, color: t.ink, marginBottom: 6 }}>Manual Build.</div>
            <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.65, marginBottom: 14 }}>Write your own custom questions from scratch or pick from your library.</div>
            <div style={{ fontSize: 9, letterSpacing: 1.5, color: t.muted, fontWeight: 700, textTransform: "uppercase" }}>Click to select</div>
          </div>
        </div>

        {/* AI Generate Settings */}
        <div style={{ border: `1px solid ${t.rule}`, background: t.panel }}>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.rule}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.ink }}>Topic *</div>
          </div>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.rule}` }}>
            <div style={{ border: `1.5px solid ${t.accent}`, padding: "12px 16px", fontSize: 13, color: t.ink, background: t.accentSoft, marginBottom: 5 }}>Game Theory — Nash Equilibria</div>
            <div style={{ fontSize: 11, color: t.muted }}>e.g., Ancient Rome, Photosynthesis, World War II… Be specific for better questions.</div>
          </div>
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${t.rule}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: t.ink, marginBottom: 10 }}>Subject Category <span style={{ fontSize: 12, color: t.muted, fontWeight: 400 }}>(Optional)</span></div>
            <div style={{ border: `1px solid ${t.rule}`, padding: "10px 14px", fontSize: 13, color: t.ink, background: t.panel2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span>Sciences</span>
              <span style={{ color: t.muted, fontSize: 11 }}>▾</span>
            </div>
          </div>
          <div style={{ padding: "16px 20px", background: t.panel2 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.ink, marginBottom: 12 }}>Generation Settings</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <div>
                <div style={{ fontSize: 10, color: t.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Questions</div>
                <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                  {["10","15","20","30"].map((n, i) => (
                    <div key={n} style={{ padding: "5px 10px", border: i === 0 ? `1.5px solid ${t.accent}` : `1px solid ${t.rule}`, background: i === 0 ? t.accentSoft : t.panel, color: i === 0 ? t.accent : t.muted, fontSize: 11, fontWeight: i === 0 ? 700 : 400, cursor: "pointer", borderRadius: 3 }}>{n}</div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: t.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Difficulty</div>
                <div style={{ display: "flex", gap: 5 }}>
                  {["Easy","Medium","Hard"].map((d, i) => (
                    <div key={d} style={{ padding: "5px 10px", border: i === 1 ? `1.5px solid ${t.accent}` : `1px solid ${t.rule}`, background: i === 1 ? t.accentSoft : t.panel, color: i === 1 ? t.accent : t.muted, fontSize: 11, fontWeight: i === 1 ? 700 : 400, cursor: "pointer", borderRadius: 3 }}>{d}</div>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: t.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Time / Q</div>
                <div style={{ display: "flex", gap: 5 }}>
                  {["10s","20s","30s"].map((s, i) => (
                    <div key={s} style={{ padding: "5px 8px", border: i === 1 ? `1.5px solid ${t.accent}` : `1px solid ${t.rule}`, background: i === 1 ? t.accentSoft : t.panel, color: i === 1 ? t.accent : t.muted, fontSize: 11, fontWeight: i === 1 ? 700 : 400, cursor: "pointer", borderRadius: 3 }}>{s}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right rail */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: t.ink, padding: "20px 18px" }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: `${t.bg}44`, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>How it works</div>
          {[
            "AI generates questions based on your topic",
            "Share the room code or QR with your class",
            "Players join from any device — no account needed",
            "Host starts when everyone's in",
            "Most correct answers across all rounds wins",
          ].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 20, height: 20, borderRadius: 999, background: `${t.bg}14`, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 9, color: t.accent, fontWeight: 700 }}>{i + 1}</span>
              </div>
              <div style={{ fontSize: 11.5, color: `${t.bg}66`, lineHeight: 1.6 }}>{tip}</div>
            </div>
          ))}
        </div>
        <button style={{ padding: "14px 0", background: t.accent, color: t.bg, border: "none", fontSize: 14, fontWeight: 700, ...Sf4, cursor: "pointer", borderRadius: 3, letterSpacing: 0.3 }}>✦ Generate Questions →</button>
      </div>
    </div>
  </Shell4>
);


// ─────────────────────────────────────────────────────────────
// EduPlay — Host a Game · Manual Build state
// ─────────────────────────────────────────────────────────────
export const Play4HostManual: React.FC<{ t: Theme }> = ({ t }) => {
  const addedQs = [
    { n: 1, q: "What is the primary function of the mitochondria?", opts: ["Energy synthesis","Protein folding","DNA replication","Waste removal"], correct: 0, diff: "Easy" },
    { n: 2, q: "Which law states that for every action there is an equal and opposite reaction?", opts: ["Newton's First","Newton's Second","Newton's Third","Hooke's Law"], correct: 2, diff: "Easy" },
  ];
  return (
    <Shell4 t={t} active="play">
      <div style={{ background: t.ink, padding: "20px 26px", marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 5 }}>The Games Room · Brain Rush</div>
          <div style={{ ...Sf4, fontSize: 24, fontWeight: 600, color: t.bg, letterSpacing: -0.5 }}>Host a Game.</div>
        </div>
        <button style={{ padding: "7px 16px", background: t.accent, border: "none", color: t.bg, fontSize: 12, fontWeight: 700, cursor: "pointer", borderRadius: 3 }}>← Back</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 22 }}>
        <div>
          {/* Source selector */}
          <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>Question Source</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 22 }}>
            <div style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: "18px 20px", cursor: "pointer", opacity: 0.7 }}>
              <div style={{ fontSize: 22, color: t.muted, marginBottom: 8 }}>✦</div>
              <div style={{ ...Sf4, fontSize: 15, fontWeight: 600, color: t.ink, marginBottom: 4 }}>AI Generate.</div>
              <div style={{ fontSize: 11, color: t.muted, lineHeight: 1.6 }}>Let AI create questions on any topic.</div>
              <div style={{ fontSize: 9, letterSpacing: 1.5, color: t.muted, fontWeight: 700, textTransform: "uppercase", marginTop: 10 }}>Click to select</div>
            </div>
            <div style={{ background: t.ink, border: `2px solid ${t.accent}`, padding: "18px 20px", cursor: "pointer" }}>
              <div style={{ fontSize: 22, marginBottom: 8 }}>✎</div>
              <div style={{ ...Sf4, fontSize: 15, fontWeight: 600, color: t.bg, marginBottom: 4 }}>Manual Build.</div>
              <div style={{ fontSize: 11, color: `${t.bg}55`, lineHeight: 1.6 }}>Write your own custom questions.</div>
              <div style={{ fontSize: 9, letterSpacing: 1.5, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginTop: 10 }}>Selected ✓</div>
            </div>
          </div>

          {/* Add Question form */}
          <div style={{ border: `1px solid ${t.rule}`, background: t.panel, marginBottom: 16 }}>
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${t.rule}` }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: t.ink }}>Add New Question</div>
            </div>
            <div style={{ padding: "18px 20px" }}>
              {/* Question textarea */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: t.ink, marginBottom: 8 }}>Question</div>
                <div style={{ border: `1px solid ${t.rule}`, padding: "12px 14px", minHeight: 72, color: t.muted, fontSize: 13, background: t.panel, lineHeight: 1.6 }}>Enter your question here…</div>
              </div>

              {/* Options 2x2 */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
                {[["Option 1","Enter option 1…",true],["Option 2","Enter option 2…",false],["Option 3","Enter option 3…",false],["Option 4","Enter option 4…",false]].map(([lbl, ph, correct], i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, color: t.muted, marginBottom: 5, display: "flex", alignItems: "center", gap: 6 }}>
                      {lbl}
                      {correct && <span style={{ fontSize: 9, letterSpacing: 1, color: "#4caf50", fontWeight: 700, border: "1px solid #4caf5044", padding: "1px 8px", borderRadius: 20 }}>Correct</span>}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <div style={{ flex: 1, border: `1px solid ${correct ? "#4caf5066" : t.rule}`, padding: "10px 12px", fontSize: 12.5, color: t.muted, background: correct ? "#4caf5011" : t.panel }}>{ph}</div>
                      <div style={{ width: 38, height: 38, borderRadius: 4, background: correct ? "#4caf50" : t.panel2, border: `1px solid ${correct ? "#4caf50" : t.rule}`, display: "grid", placeItems: "center", flexShrink: 0, cursor: "pointer" }}>
                        <span style={{ color: correct ? "white" : t.muted, fontSize: 14 }}>✓</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Difficulty + Add button */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: t.ink }}>Difficulty</span>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["Easy","Medium","Hard"].map((d, i) => (
                      <div key={d} style={{ padding: "5px 14px", border: i === 1 ? `1.5px solid ${t.accent}` : `1px solid ${t.rule}`, background: i === 1 ? t.accentSoft : "transparent", color: i === 1 ? t.accent : t.muted, fontSize: 11, fontWeight: i === 1 ? 700 : 400, cursor: "pointer", borderRadius: 20 }}>{d}</div>
                    ))}
                  </div>
                </div>
                <button style={{ padding: "9px 20px", background: t.accent, color: t.bg, border: "none", fontSize: 13, fontWeight: 700, ...Sf4, cursor: "pointer", borderRadius: 3 }}>+ Add Question</button>
              </div>
            </div>
          </div>

          {/* Added questions list */}
          <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Added Questions ({addedQs.length})</div>
          <div style={{ background: t.panel, border: `1px solid ${t.rule}` }}>
            {addedQs.map((q, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 16px", borderBottom: i < addedQs.length - 1 ? `1px solid ${t.rule}` : "none" }}>
                <div style={{ width: 28, height: 28, borderRadius: 3, background: t.ink, color: t.bg, display: "grid", placeItems: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{q.n}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: t.ink, marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{q.q}</div>
                  <div style={{ fontSize: 11, color: t.muted }}>Correct: {q.opts[q.correct]} · {q.diff}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button style={{ padding: "3px 10px", background: "transparent", border: `1px solid ${t.rule}`, color: t.muted, fontSize: 10, cursor: "pointer", borderRadius: 3 }}>Edit</button>
                  <button style={{ padding: "3px 10px", background: "transparent", border: `1px solid ${t.rule}`, color: t.muted, fontSize: 10, cursor: "pointer", borderRadius: 3 }}>✕</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ background: t.ink, padding: "18px 18px" }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: `${t.bg}44`, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>Game Settings</div>
            {[["Difficulty","Medium (per question)"],["Time / Q","30s"],["Format","Most correct wins"]].map(([k,v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${t.bg}14` }}>
                <span style={{ fontSize: 11, color: `${t.bg}55` }}>{k}</span>
                <span style={{ fontSize: 11, color: t.bg, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: "16px 16px" }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Tips</div>
            {["Mark one option per question as correct","Add at least 3 questions to start","You can reorder questions after adding them"].map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 11, color: t.accent, flexShrink: 0 }}>·</span>
                <span style={{ fontSize: 11.5, color: t.muted, lineHeight: 1.6 }}>{tip}</span>
              </div>
            ))}
          </div>
          <button style={{ padding: "14px 0", background: t.accent, color: t.bg, border: "none", fontSize: 14, fontWeight: 700, ...Sf4, cursor: "pointer", borderRadius: 3, opacity: 1 }}>Create Room →</button>
        </div>
      </div>
    </Shell4>
  );
};


// ─────────────────────────────────────────────────────────────
// EduPlay — Host Waiting Room (QR + live join list)
// ─────────────────────────────────────────────────────────────
export const Play4HostWait: React.FC<{ t: Theme }> = ({ t }) => {
  const joined = [
    { init: "J", name: "You (Host)", host: true  },
    { init: "L", name: "Layla A.",   host: false },
    { init: "K", name: "Karim H.",   host: false },
    { init: "R", name: "Reem S.",    host: false },
    { init: "A", name: "Ahmad M.",   host: false },
    { init: "S", name: "Sara O.",    host: false },
    { init: "N", name: "Nour F.",    host: false },
    { init: "D", name: "Dina T.",    host: false },
  ];
  const waiting = Array.from({ length: 12 }, (_, i) => ({ init: "?", name: "Waiting..." }));
  const all = [...joined, ...waiting];
  return (
    <Shell4 t={t} active="play">
      {/* Banner */}
      <div style={{ background: t.ink, padding: "18px 26px", marginBottom: 20, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 5 }}>Brain Rush · Waiting Room</div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ ...Sf4, fontSize: 22, fontWeight: 600, color: t.bg }}>Room Open.</div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: 999, background: t.accent }} />
              <span style={{ fontSize: 12, color: `${t.bg}66` }}>8 of 20 players joined</span>
            </div>
          </div>
        </div>
        <button style={{ padding: "9px 20px", background: t.accent, color: t.bg, border: "none", fontSize: 13, fontWeight: 700, ...Sf4, cursor: "pointer", borderRadius: 3 }}>Start Game →</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: 22 }}>
        {/* Left: QR + code */}
        <div>
          <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Share with your class</div>

          {/* QR visual */}
          <div style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: 12, marginBottom: 12 }}>
            <svg width="216" height="216" viewBox="0 0 27 27" style={{ display: "block" }}>
              <rect width="27" height="27" fill="white"/>
              <rect x="1" y="1" width="7" height="7" fill="black"/>
              <rect x="2" y="2" width="5" height="5" fill="white"/>
              <rect x="3" y="3" width="3" height="3" fill="black"/>
              <rect x="19" y="1" width="7" height="7" fill="black"/>
              <rect x="20" y="2" width="5" height="5" fill="white"/>
              <rect x="21" y="3" width="3" height="3" fill="black"/>
              <rect x="1" y="19" width="7" height="7" fill="black"/>
              <rect x="2" y="20" width="5" height="5" fill="white"/>
              <rect x="3" y="21" width="3" height="3" fill="black"/>
              {[9,11,13,15,17].map((x,i)=><rect key={i} x={x} y={1+(i%2)} width="1" height="1" fill="black"/>)}
              {[9,11,13,15,17].map((x,i)=><rect key={i+5} x={x} y={3+(i%3)} width="1" height="1" fill="black"/>)}
              {[9,11,13,15,17].map((x,i)=><rect key={i+10} x={x} y={6-(i%2)} width="1" height="1" fill="black"/>)}
              {[1,3,5,7].map((y,i)=><rect key={`r${i}`} x={9+(i%3)} y={y} width="1" height="1" fill="black"/>)}
              {[9,11,13,15,17,19,21,23,25].map((x,i)=>[8,10,12,14,16,18].filter((_,j)=>(i+j)%3!==1).map((y,j)=>(
                <rect key={`d${i}-${j}`} x={x} y={y} width="1" height="1" fill="black"/>
              ))).flat()}
              {[1,2,3,4,5,6,7].map((x,i)=>[9,11,13,15,17].filter((_,j)=>(i*2+j)%3!==0).map((y,j)=>(
                <rect key={`e${i}-${j}`} x={x} y={y} width="1" height="1" fill="black"/>
              ))).flat()}
              {[9,11,13,15,17,19,21,23,25].map((x,i)=>[19,21,23,25].filter((_,j)=>(i+j*2+1)%3!==2).map((y,j)=>(
                <rect key={`f${i}-${j}`} x={x} y={y} width="1" height="1" fill="black"/>
              ))).flat()}
            </svg>
          </div>

          {/* Room code */}
          <div style={{ background: t.ink, padding: "16px 18px", textAlign: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: `${t.bg}44`, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Room Code</div>
            <div style={{ display: "flex", justifyContent: "center", gap: 10, alignItems: "baseline" }}>
              <div style={{ ...Sf4, fontSize: 30, fontWeight: 700, color: t.bg, letterSpacing: 6 }}>MFHX</div>
              <div style={{ ...Sf4, fontSize: 18, color: `${t.bg}33`, fontWeight: 300 }}>–</div>
              <div style={{ ...Sf4, fontSize: 30, fontWeight: 700, color: t.accent, letterSpacing: 6 }}>2847</div>
            </div>
            <div style={{ fontSize: 10, color: `${t.bg}44`, marginTop: 8 }}>Share this code with your class</div>
          </div>

          {/* Settings summary */}
          <div style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: "12px 14px" }}>
            <div style={{ fontSize: 9, letterSpacing: 1.5, color: t.muted, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Room Settings</div>
            {[["Topic","Game Theory — Nash Eq."],["Questions","10"],["Difficulty","Medium"],["Time / Q","20s"],["Source","AI Generate"]].map(([k,v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: `1px solid ${t.rule}44` }}>
                <span style={{ fontSize: 11, color: t.muted }}>{k}</span>
                <span style={{ fontSize: 11, color: t.ink, fontWeight: 600 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: player grid */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>Players in Room</div>
            <div style={{ fontSize: 12, color: t.muted }}>8 / 20 joined</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8 }}>
            {all.map((p, i) => {
              const isIn = i < joined.length;
              return (
                <div key={i} style={{ background: isIn ? (p.host ? t.ink : t.panel) : t.panel2, border: `1px solid ${isIn ? t.rule : t.rule + "55"}`, padding: "10px 12px", display: "flex", alignItems: "center", gap: 8, opacity: isIn ? 1 : 0.35 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 999, background: p.host ? t.accent : (isIn ? t.ink : t.rule), color: isIn ? t.bg : t.muted, display: "grid", placeItems: "center", fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{p.init}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 11, fontWeight: isIn ? 600 : 400, color: p.host ? t.bg : t.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    {p.host && <div style={{ fontSize: 9, color: t.accent, letterSpacing: 1, fontWeight: 700, textTransform: "uppercase" }}>Host</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Shell4>
  );
};


// ─────────────────────────────────────────────────────────────
// EduPlay — Join a Game
// ─────────────────────────────────────────────────────────────
export const Play4Join: React.FC<{ t: Theme }> = ({ t }) => (
  <Shell4 t={t} active="play">
    <div style={{ background: t.ink, padding: "20px 26px", marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <div>
        <div style={{ fontSize: 9, letterSpacing: 2.5, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 5 }}>The Games Room · Brain Rush</div>
        <div style={{ ...Sf4, fontSize: 24, fontWeight: 600, color: t.bg }}>Join a Game.</div>
      </div>
      <button style={{ padding: "7px 16px", background: t.accent, border: "none", color: t.bg, fontSize: 12, fontWeight: 700, cursor: "pointer", borderRadius: 3 }}>← Back</button>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 22 }}>
      <div>
        <div style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: "30px 32px" }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 20 }}>Enter Room Code</div>

          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 6 }}>
            <div style={{ flex: 1, border: `2px solid ${t.accent}`, padding: "14px 20px", textAlign: "center", background: t.accentSoft }}>
              <div style={{ ...Sf4, fontSize: 30, fontWeight: 700, color: t.ink, letterSpacing: 8 }}>MFHX</div>
            </div>
            <div style={{ ...Sf4, fontSize: 22, color: t.muted, flexShrink: 0 }}>–</div>
            <div style={{ flex: 1, border: `1px dashed ${t.rule}`, padding: "14px 20px", textAlign: "center", background: t.panel2 }}>
              <div style={{ ...Sf4, fontSize: 30, fontWeight: 300, color: t.muted, letterSpacing: 8, opacity: 0.5 }}>????</div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <div style={{ fontSize: 11, color: t.muted }}>Ask your host or teacher for the 8-character room code</div>
            <button style={{ display: "flex", alignItems: "center", gap: 7, padding: "6px 14px", background: "transparent", border: `1px solid ${t.rule}`, color: t.body, fontSize: 11, fontWeight: 600, cursor: "pointer", borderRadius: 3 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h2v2h-2zM18 14h3M14 18v3M18 18h3v3h-3z"/></svg>
              Scan QR
            </button>
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 10, color: t.muted, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Your Display Name</div>
            <div style={{ border: `1.5px solid ${t.accent}`, padding: "10px 14px", fontSize: 13, color: t.ink, background: t.accentSoft, marginBottom: 4 }}>johntommy</div>
            <div style={{ fontSize: 11, color: t.muted }}>This is how you'll appear to others in the game</div>
          </div>

          <button style={{ width: "100%", padding: "13px 0", background: t.accent, color: t.bg, border: "none", fontSize: 14, fontWeight: 700, ...Sf4, cursor: "pointer", borderRadius: 3 }}>Join Game →</button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ background: t.ink, padding: "18px 18px" }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: `${t.bg}44`, fontWeight: 700, textTransform: "uppercase", marginBottom: 8 }}>Online Now</div>
          <div style={{ ...Sf4, fontSize: 34, fontWeight: 600, color: t.bg }}>248</div>
          <div style={{ fontSize: 11, color: `${t.bg}55`, marginTop: 2 }}>players in the arena</div>
          <div style={{ height: 1, background: `${t.bg}14`, margin: "12px 0" }} />
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: `${t.bg}44` }}>In matches</span>
            <span style={{ fontSize: 10, color: t.accent }}>186</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 10, color: `${t.bg}44` }}>Open lobbies</span>
            <span style={{ fontSize: 10, color: t.accent }}>24</span>
          </div>
        </div>
        <div style={{ background: t.panel, border: `1px solid ${t.rule}`, padding: "16px 16px" }}>
          <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 12 }}>How to Join</div>
          {["Get the room code from your host or teacher","Enter the code above and press Join","Wait in the lobby until the host starts","Answer as fast as you can — speed counts!"].map((tip, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
              <div style={{ width: 18, height: 18, borderRadius: 999, background: t.accentSoft, display: "grid", placeItems: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 9, color: t.accent, fontWeight: 700 }}>{i + 1}</span>
              </div>
              <div style={{ fontSize: 11.5, color: t.muted, lineHeight: 1.6 }}>{tip}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Shell4>
);


// ─────────────────────────────────────────────────────────────
// EduPlay — Find a Match (ranked matchmaking)
// ─────────────────────────────────────────────────────────────
export const Play4FindMatch: React.FC<{ t: Theme }> = ({ t }) => {
  const recent = [
    { opp:"Layla A.", result:"Win",  score:"7–4",  pts:"+80",  subject:"Microeconomics"  },
    { opp:"Karim H.", result:"Loss", score:"3–7",  pts:"−40",  subject:"Calculus II"     },
    { opp:"Reem S.",  result:"Win",  score:"9–2",  pts:"+90",  subject:"Game Theory"     },
  ];
  const leaderboard = [
    { rank:1, init:"Y", name:"Yusuf B.", pts:2840, you:false },
    { rank:2, init:"J", name:"You",      pts:2610, you:true  },
    { rank:3, init:"L", name:"Layla A.", pts:2480, you:false },
    { rank:4, init:"K", name:"Karim H.", pts:1920, you:false },
    { rank:5, init:"R", name:"Reem S.",  pts:1750, you:false },
  ];
  return (
    <Shell4 t={t} active="play">
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
        <div>
          <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>The Games Room · Brain Rush · Ranked</div>
          <h1 style={{ ...Sf4, fontSize:30, fontWeight:600, color:t.ink, margin:"5px 0 0", letterSpacing:-0.5 }}>Find a Match.</h1>
        </div>
        <button style={{ padding:"7px 16px", background:"transparent", border:`1px solid ${t.rule}`, color:t.body, fontSize:12, cursor:"pointer" }}>Cancel Search</button>
      </div>
      <div style={{ height:1, background:t.ink, marginTop:12, marginBottom:18, opacity:0.8 }} />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 260px", gap:22 }}>

        {/* LEFT — searching + stats */}
        <div>
          {/* Searching panel */}
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderTop:`3px solid ${t.accent}`, padding:"40px 28px 36px", textAlign:"center", marginBottom:16 }}>
            {/* Concentric ring animation */}
            <div style={{ position:"relative", width:110, height:110, margin:"0 auto 28px" }}>
              <div style={{ position:"absolute", inset:0, borderRadius:999, border:`1px solid ${t.accent}`, opacity:0.12 }} />
              <div style={{ position:"absolute", inset:12, borderRadius:999, border:`1px solid ${t.accent}`, opacity:0.22 }} />
              <div style={{ position:"absolute", inset:24, borderRadius:999, border:`1.5px solid ${t.accent}`, opacity:0.45 }} />
              <div style={{ position:"absolute", inset:36, borderRadius:999, background:t.accent, display:"flex", alignItems:"center", justifyContent:"center" }}>
                {Ic.play(t.bg)}
              </div>
            </div>
            <div style={{ ...Sf4, fontSize:22, fontWeight:600, color:t.ink, marginBottom:8 }}>Searching for an opponent…</div>
            <div style={{ fontSize:12.5, color:t.muted, marginBottom:26 }}>Matching you with a player near your skill level</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, maxWidth:400, margin:"0 auto" }}>
              {[["Skill range","1,800 – 3,200"],["Est. wait","~30s"],["In queue","62 players"]].map(([k,v]) => (
                <div key={k} style={{ background:t.panel2, padding:"13px 10px", border:`1px solid ${t.rule}`, textAlign:"center" }}>
                  <div style={{ ...Sf4, fontSize:16, fontWeight:700, color:t.ink, marginBottom:4 }}>{v}</div>
                  <div style={{ fontSize:9, color:t.muted, letterSpacing:1.2, textTransform:"uppercase" }}>{k}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Your ranked stats */}
          <div style={{ background:t.ink, padding:"18px 22px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:14 }}>Your Ranked Profile</div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18 }}>
              {[["2,610","Ranked pts"],["7W – 3L","Record"],["70%","Win rate"],["Gold II","Division"]].map(([v,l]) => (
                <div key={l}>
                  <div style={{ ...Sf4, fontSize:20, fontWeight:700, color:t.bg, lineHeight:1 }}>{v}</div>
                  <div style={{ fontSize:9, color:`${t.bg}55`, letterSpacing:1.2, textTransform:"uppercase", marginTop:5 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent matches */}
          <div style={{ marginTop:16 }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>Recent Matches</div>
            <div style={{ background:t.panel, border:`1px solid ${t.rule}` }}>
              {recent.map((r,i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"10px 16px", borderBottom:i<recent.length-1?`1px solid ${t.rule}`:"none" }}>
                  <div style={{ fontSize:9, fontWeight:700, letterSpacing:1.2, color:r.result==="Win"?"#5cb85c":"#d9534f", textTransform:"uppercase", minWidth:26 }}>{r.result}</div>
                  <span style={{ ...Sf4, fontSize:14, fontWeight:600, color:t.ink, minWidth:60 }}>vs. {r.opp}</span>
                  <span style={{ ...Sf4, fontSize:14, color:t.muted }}>{r.score}</span>
                  <span style={{ fontSize:11, color:t.muted, flex:1 }}>{r.subject}</span>
                  <span style={{ ...Sf4, fontSize:12, color:r.result==="Win"?"#5cb85c":"#d9534f", fontWeight:700 }}>{r.pts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT rail */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ background:t.ink, padding:"18px 18px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:`${t.bg}44`, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Online Now</div>
            <div style={{ ...Sf4, fontSize:38, fontWeight:700, color:t.bg, lineHeight:1 }}>248</div>
            <div style={{ fontSize:11, color:`${t.bg}55`, marginTop:4 }}>players in the arena</div>
            <div style={{ height:1, background:`${t.bg}14`, margin:"12px 0" }} />
            {[["In matches","186"],["In queue","62"]].map(([k,v],i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", marginBottom:i<1?6:0 }}>
                <span style={{ fontSize:11, color:`${t.bg}44` }}>{k}</span>
                <span style={{ fontSize:11, color:t.accent, fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, padding:"14px 14px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>Top Ranked · This Week</div>
            {leaderboard.map((p,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"7px 4px", borderBottom:i<leaderboard.length-1?`1px solid ${t.rule}`:"none", background:p.you?t.accentSoft:"transparent" }}>
                <span style={{ ...Sf4, fontSize:12, color:p.rank===1?t.accent:t.muted, fontWeight:p.rank===1?700:400, width:14 }}>{p.rank}</span>
                <div style={{ width:26, height:26, borderRadius:999, background:p.you?t.accent:t.ink, color:t.bg, display:"grid", placeItems:"center", fontSize:9, fontWeight:700, flexShrink:0 }}>{p.init}</div>
                <span style={{ fontSize:12, fontWeight:p.you?700:500, color:p.you?t.ink:t.body, flex:1 }}>{p.name}</span>
                <span style={{ ...Sf4, fontSize:12, color:p.you?t.accent:t.muted }}>{p.pts.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell4>
  );
};


// ─────────────────────────────────────────────────────────────
// History — The Ledger · activity log
// ─────────────────────────────────────────────────────────────
export const Hist4: React.FC<{ t: Theme }> = ({ t }) => {
  const stats = [["34","items this week"],["12h","study time"],["6","exams taken"],["3","rooms joined"]];
  const filters = ["All","Library","Rooms","Exams","EduPlay"];
  const typeColor = { library:"#5B7A3A", room:"#3A6B8A", exam:"#B8893A", play:"#C5708A" };
  const typeLabel = { library:"Library", room:"Room", exam:"Exam", play:"EduPlay" };
  const groups = [
    { date:"Today", items:[
      { type:"exam",    title:"Microeconomics — Ch. VII Quiz",   meta:"Scored 92% · 30 questions · 26 min",    time:"2:14 PM" },
      { type:"library", title:"Anatomy Lecture XII — processed", meta:"Summary + 32 flashcards generated",     time:"11:40 AM" },
      { type:"room",    title:"Joined: Linear Algebra Q&A",      meta:"with Reem S. · 45 min session",         time:"9:15 AM" },
    ]},
    { date:"Yesterday", items:[
      { type:"play",    title:"Flash Sprint — Calculus II",      meta:"Score: 18 / 20 · New personal best",    time:"8:30 PM" },
      { type:"exam",    title:"CS161 — Algorithms Quiz",         meta:"Scored 81% · 25 questions · 22 min",    time:"3:20 PM" },
      { type:"library", title:"Notes on Kahneman — processed",   meta:"Flashcards · 24 cards generated",       time:"1:05 PM" },
    ]},
    { date:"Monday, May 5", items:[
      { type:"room",    title:"Hosted: CS161 Study Circle",      meta:"12 attendees · 1h 20 min",              time:"7:00 PM" },
      { type:"play",    title:"Brain Battle vs. Layla A.",       meta:"Won 7 – 4 · Microeconomics theme",      time:"4:45 PM" },
    ]},
  ];
  const days = [["M","3"],["T","5"],["W","8"],["T","4"],["F","7"],["S","2"],["S","1"]];
  return (
    <Shell4 t={t} active="hist">
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>The Ledger</div>
          <h1 style={{ ...Sf4, fontSize:38, fontWeight:600, color:t.ink, margin:"6px 0 4px", letterSpacing:-0.8 }}>History.</h1>
          <p style={{ fontSize:13, color:t.muted, margin:0 }}>everything you have done, in order.</p>
        </div>
        <button style={{ padding:"7px 16px", background:"transparent", border:`1px solid ${t.rule}`, color:t.body, fontSize:12, cursor:"pointer", borderRadius:2 }}>Export →</button>
      </div>
      <div style={{ height:1, background:t.ink, marginTop:14, marginBottom:16, opacity:0.8 }} />

      {/* Stats strip */}
      <div style={{ display:"flex", background:t.ink, marginBottom:20 }}>
        {stats.map(([v,l],i) => (
          <div key={i} style={{ flex:1, padding:"14px 20px", borderRight:i<stats.length-1?`1px solid ${t.bg}14`:"none", textAlign:"center" }}>
            <div style={{ ...Sf4, fontSize:24, fontWeight:700, color:t.bg, lineHeight:1 }}>{v}</div>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, textTransform:"uppercase", marginTop:5 }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display:"flex", gap:0, marginBottom:22, borderBottom:`1px solid ${t.rule}` }}>
        {filters.map((f,i) => {
          const on = i===0;
          return <button key={f} style={{ padding:"6px 18px", background:"transparent", border:"none", borderBottom:on?`2px solid ${t.accent}`:"2px solid transparent", color:on?t.ink:t.muted, fontSize:12.5, fontWeight:on?700:400, cursor:"pointer", marginBottom:-1 }}>{f}</button>;
        })}
        <div style={{ flex:1 }} />
        <span style={{ fontSize:11, color:t.muted, alignSelf:"center", paddingRight:4 }}>8 items</span>
      </div>

      {/* Two-column body */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 260px", gap:24 }}>
        {/* Activity feed */}
        <div>
          {groups.map((g,gi) => (
            <div key={gi} style={{ marginBottom:22 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
                <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>{g.date}</div>
                <div style={{ flex:1, height:1, background:t.rule }} />
              </div>
              {g.items.map((item,ii) => (
                <div key={ii} style={{ display:"flex", alignItems:"flex-start", gap:14, padding:"14px 0", borderBottom:ii<g.items.length-1?`1px solid ${t.rule}`:"none" }}>
                  <div style={{ width:3, alignSelf:"stretch", background:typeColor[item.type], flexShrink:0, borderRadius:2, minHeight:44 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                      <div style={{ fontSize:9, letterSpacing:1.2, color:typeColor[item.type], fontWeight:700, padding:"2px 8px", border:`1px solid ${typeColor[item.type]}44` }}>{typeLabel[item.type].toUpperCase()}</div>
                      <span style={{ fontSize:11, color:t.muted }}>{item.time}</span>
                    </div>
                    <div style={{ ...Sf4, fontSize:14.5, fontWeight:600, color:t.ink, marginBottom:3, lineHeight:1.35 }}>{item.title}</div>
                    <div style={{ fontSize:12, color:t.muted, lineHeight:1.5 }}>{item.meta}</div>
                  </div>
                  <button style={{ padding:"4px 12px", background:"transparent", border:`1px solid ${t.rule}`, color:t.muted, fontSize:11, cursor:"pointer", borderRadius:2, flexShrink:0, marginTop:2 }}>View</button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Right rail */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {/* Weekly bar chart */}
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, padding:"16px 18px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:14 }}>This Week</div>
            <div style={{ display:"flex", alignItems:"flex-end", gap:6, height:60, marginBottom:8 }}>
              {days.map(([day,n],i) => (
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                  <div style={{ width:"100%", background:i===4?t.accent:t.accentSoft, height:`${(parseInt(n)/8)*52+4}px`, borderRadius:"2px 2px 0 0" }} />
                  <span style={{ fontSize:9, color:i===4?t.accent:t.muted, fontWeight:i===4?700:400 }}>{day}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize:11, color:t.muted }}>30 events · 7 days</div>
          </div>

          {/* Streak */}
          <div style={{ background:t.ink, padding:"18px 18px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:`${t.bg}44`, fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>Current Streak</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
              <div style={{ ...Sf4, fontSize:48, fontWeight:700, color:t.bg, lineHeight:1 }}>14</div>
              <span style={{ fontSize:14, color:t.accent }}>days</span>
            </div>
            <div style={{ fontSize:11, color:`${t.bg}44`, marginTop:8 }}>Best: 21 days · Last month</div>
          </div>

          {/* Top categories */}
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, padding:"16px 18px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:14 }}>Top Categories</div>
            {[["Library","42%","#5B7A3A"],["Exams","28%","#B8893A"],["EduPlay","18%","#C5708A"],["Rooms","12%","#3A6B8A"]].map(([label,pct,color],i) => (
              <div key={i} style={{ marginBottom:i<3?12:0 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:12, color:t.body }}>{label}</span>
                  <span style={{ ...Sf4, fontSize:11, fontWeight:600, color:t.accent }}>{pct}</span>
                </div>
                <div style={{ height:3, background:t.rule, borderRadius:1 }}>
                  <div style={{ width:pct, height:"100%", background:color, borderRadius:1 }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell4>
  );
};




// ─────────────────────────────────────────────────────────────────────────────
// CONTENT VIEW SHELL (no sidebar — full reading experience)
// ─────────────────────────────────────────────────────────────────────────────
export const ViewShell4: React.FC<{ t: Theme; title: string; activeTab: string; tabs: { k: string; l: string }[]; children?: React.ReactNode }> = ({ t, title, activeTab, tabs, children }) => (
  <div style={{ width: 1280, height: 820, background: t.bg, display: "flex", flexDirection: "column", overflow: "hidden", fontFamily: "Inter, sans-serif" }}>
    <div style={{ height: 52, background: t.sb, display: "flex", alignItems: "center", padding: "0 18px", gap: 14, flexShrink: 0, borderBottom: `1px solid rgba(255,255,255,0.07)` }}>
      <button style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: t.sbMuted, fontSize: 12, fontWeight: 500, padding: "4px 8px", borderRadius: 6 }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5m7-7-7 7 7 7" /></svg>
        Library
      </button>
      <div style={{ width: 1, height: 16, background: t.rule, opacity: 0.6 }} />
      <span style={{ color: t.sbInk, fontSize: 13, fontWeight: 600, flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{title}</span>
      <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,0.07)", borderRadius: 8, padding: 3 }}>
        {tabs.map(tab => (
          <button key={tab.k} style={{ padding: "5px 14px", borderRadius: 6, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
            background: tab.k === activeTab ? t.accent : "transparent",
            color: tab.k === activeTab ? (t.mode === "dark" ? t.bg : "#fff") : t.sbMuted
          }}>{tab.l}</button>
        ))}
      </div>
      <div style={{ width: 28, height: 28, borderRadius: "50%", background: t.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ color: t.mode === "dark" ? t.bg : "#fff", fontSize: 11, fontWeight: 700 }}>A</span>
      </div>
    </div>
    <div style={{ flex: 1, overflow: "hidden" }}>{children}</div>
  </div>
);

const viewTabs = [{ k: "read", l: "Read" }, { k: "book", l: "Book Mode" }, { k: "audio", l: "Audio" }];

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT VIEW — Read Mode
// ─────────────────────────────────────────────────────────────────────────────
export const Content4View: React.FC<{ t: Theme }> = ({ t }) => {
  const docTitle = "Game Theory — Week 3: Strategic Interactions";
  const paragraphs = [
    { h: "Nash Equilibrium", b: "A Nash Equilibrium is a set of strategies, one for each player in a game, such that no player has an incentive to deviate unilaterally. It represents a stable state where each player's strategy is a best response to the strategies of all other players." },
    { h: "Dominant Strategies", b: "A dominant strategy is one that yields the highest payoff for a player regardless of the strategies chosen by other players. When a dominant strategy exists, rational players will always choose it, simplifying the analysis of strategic interactions considerably." },
    { h: "The Prisoner's Dilemma", b: "The Prisoner's Dilemma illustrates a situation where two individually rational decisions lead to a collectively suboptimal outcome. Both prisoners, reasoning individually, choose to defect — even though both would be better off cooperating. This paradox has wide implications in economics, politics, and biology." },
    { h: "Repeated Games", b: "When a game is played repeatedly, players can adopt strategies that reward cooperation and punish defection. The Folk Theorem establishes that in infinitely repeated games, cooperative outcomes can be sustained as Nash equilibria if players are sufficiently patient." },
  ];
  const flashcards = [
    { q: "What is a Nash Equilibrium?", a: "A state where no player benefits by changing strategy unilaterally." },
    { q: "Define dominant strategy", a: "A strategy that yields the highest payoff regardless of opponent's choices." },
    { q: "Prisoner's Dilemma outcome", a: "Both defect — despite mutual cooperation being Pareto superior." },
  ];
  return (
    <ViewShell4 t={t} title={docTitle} activeTab="read" tabs={viewTabs}>
      <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
        {/* Reading pane */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 36px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            {/* Page nav — top */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <button style={{ padding: "4px 12px", border: `1px solid ${t.rule}`, background: "transparent", color: t.muted, fontSize: 11, cursor: "pointer", borderRadius: 4 }}>← Prev</button>
                <span style={{ fontSize: 11, color: t.muted, padding: "0 6px" }}>Page 1 of 4</span>
                <button style={{ padding: "4px 12px", border: `1px solid ${t.rule}`, background: t.accentSoft, color: t.accent, fontSize: 11, fontWeight: 600, cursor: "pointer", borderRadius: 4 }}>Next →</button>
              </div>
              <span style={{ fontSize: 11, color: t.muted }}>1,240 words</span>
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: t.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Game Theory · Course Materials</div>
              <h1 style={{ ...Sf4, fontSize: 22, fontWeight: 700, color: t.ink, margin: 0, lineHeight: 1.3 }}>{docTitle}</h1>
              <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
                {["Nash Equilibrium","Game Theory","Strategy"].map(tag => (
                  <span key={tag} style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: t.accentSoft, color: t.accent, fontWeight: 600 }}>{tag}</span>
                ))}
              </div>
            </div>
            {paragraphs.map((p, i) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: t.ink, margin: "0 0 8px" }}>{p.h}</h2>
                <p style={{ fontSize: 13.5, color: t.body, lineHeight: 1.75, margin: 0 }}>{p.b}</p>
              </div>
            ))}
            <div style={{ height: 1, background: t.rule, margin: "24px 0" }} />
          </div>
        </div>
        {/* Tools rail */}
        <div style={{ width: 300, borderLeft: `1px solid ${t.rule}`, display: "flex", flexDirection: "column", overflow: "hidden", background: t.panel }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${t.rule}` }}>
            {["Flashcards","Notes","Chat"].map((tab, i) => (
              <button key={tab} style={{ flex: 1, padding: "12px 0", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer",
                background: i === 0 ? t.accentSoft : "transparent",
                color: i === 0 ? t.accent : t.muted,
                borderBottom: i === 0 ? `2px solid ${t.accent}` : "2px solid transparent"
              }}>{tab}</button>
            ))}
          </div>
          <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
            <div style={{ fontSize: 11, color: t.muted, fontWeight: 600, marginBottom: 12 }}>3 CARDS</div>
            {flashcards.map((fc, i) => (
              <div key={i} style={{ border: `1px solid ${t.rule}`, borderRadius: 8, padding: 14, marginBottom: 10, background: i === 0 ? t.accentSoft : t.bg }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: t.ink, marginBottom: 6 }}>{fc.q}</div>
                {i === 0 && <div style={{ fontSize: 11.5, color: t.body, lineHeight: 1.5 }}>{fc.a}</div>}
                {i !== 0 && <div style={{ fontSize: 11, color: t.muted, fontStyle: "italic" }}>Tap to reveal answer</div>}
              </div>
            ))}
            <button style={{ width: "100%", marginTop: 6, padding: "9px 0", borderRadius: 8, background: t.accent, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: t.mode === "dark" ? t.bg : "#fff" }}>
              Start Review Session
            </button>
          </div>
        </div>
      </div>
    </ViewShell4>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// CONTENT VIEW — Book Mode
// ─────────────────────────────────────────────────────────────────────────────
export const Content4Book: React.FC<{ t: Theme }> = ({ t }) => {
  const docTitle = "Game Theory — Week 3: Strategic Interactions";
  const sections = [
    { h:"Nash Equilibrium", b:"A Nash Equilibrium is a set of strategies, one for each player in a game, such that no player has an incentive to deviate unilaterally. It represents a stable state where each player's strategy is a best response to the strategies of all other players." },
    { h:"Dominant Strategies", b:"A dominant strategy is one that yields the highest payoff for a player regardless of the strategies chosen by other players. When a dominant strategy exists, rational players will always choose it, simplifying the analysis of strategic interactions." },
    { h:"The Prisoner's Dilemma", b:"The Prisoner's Dilemma illustrates a situation where two individually rational decisions lead to a collectively suboptimal outcome. Both prisoners, reasoning individually, choose to defect — even though both would be better off cooperating." },
  ];
  return (
    <ViewShell4 t={t} title={docTitle} activeTab="book" tabs={viewTabs}>
      <div style={{ display:"flex", height:"100%", overflow:"hidden" }}>

        {/* LEFT — book reader, 3/5 width */}
        <div style={{ flex:3, display:"flex", flexDirection:"column", overflow:"hidden", borderRight:`1px solid ${t.rule}` }}>
          {/* Page heading */}
          <div style={{ padding:"12px 32px 0", borderBottom:`1px solid ${t.rule}`, flexShrink:0 }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>Game Theory · Course Materials</div>
            <div style={{ display:"flex", alignItems:"baseline", justifyContent:"space-between", paddingBottom:10 }}>
              <h2 style={{ ...Sf4, fontSize:16, fontWeight:600, color:t.ink, margin:0 }}>{docTitle}</h2>
              <span style={{ fontSize:10, color:t.muted }}>Page 1 of 4</span>
            </div>
          </div>
          {/* Content — overflow hidden so it ends cleanly at nav bar like a real page */}
          <div style={{ flex:1, overflow:"hidden", padding:"16px 32px 0" }}>
            {sections.map((s,i) => (
              <div key={i} style={{ marginBottom:20 }}>
                <div style={{ fontSize:9, letterSpacing:2, color:t.muted, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>{s.h}</div>
                <p style={{ fontSize:13.5, color:t.body, lineHeight:1.85, margin:0 }}>{s.b}</p>
              </div>
            ))}
          </div>
          {/* Page nav */}
          <div style={{ padding:"8px 24px", borderTop:`1px solid ${t.rule}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
            <button style={{ padding:"5px 14px", border:`1px solid ${t.rule}`, background:"transparent", color:t.muted, fontSize:11, cursor:"pointer" }}>← Prev</button>
            <div style={{ display:"flex", gap:6, alignItems:"center" }}>
              {[1,2,3,4].map(n => <div key={n} style={{ width:n===1?20:7, height:7, borderRadius:4, background:n===1?t.accent:t.rule }} />)}
            </div>
            <button style={{ padding:"5px 14px", border:`1px solid ${t.rule}`, background:"transparent", color:t.ink, fontSize:11, cursor:"pointer" }}>Next →</button>
          </div>
        </div>

        {/* RIGHT — stacked panels, 2/5 width */}
        <div style={{ flex:2, display:"flex", flexDirection:"column", overflow:"hidden" }}>

          {/* TOP half — flashcard (editorial style) */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", borderBottom:`1px solid ${t.rule}`, overflow:"hidden" }}>
            <div style={{ padding:"10px 18px", borderBottom:`1px solid ${t.rule}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
              <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>Flashcards</div>
              <span style={{ fontSize:10, color:t.muted }}>Card 1 / 3</span>
            </div>
            <div style={{ flex:1, padding:"14px 18px", display:"flex", flexDirection:"column", gap:10 }}>
              {/* Card */}
              <div style={{ flex:1, border:`1px solid ${t.rule}`, borderTop:`3px solid ${t.accent}`, background:t.panel, display:"flex", flexDirection:"column" }}>
                <div style={{ padding:"12px 16px", borderBottom:`1px solid ${t.rule}`, background:t.accentSoft }}>
                  <div style={{ fontSize:8.5, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Question</div>
                  <p style={{ ...Sf4, fontSize:13.5, fontWeight:600, color:t.ink, margin:0, lineHeight:1.45 }}>
                    What is a Nash Equilibrium, and why is it "stable"?
                  </p>
                </div>
                <div style={{ padding:"12px 16px", flex:1 }}>
                  <div style={{ fontSize:8.5, letterSpacing:2, color:t.muted, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Answer</div>
                  <p style={{ fontSize:12.5, color:t.body, margin:0, lineHeight:1.65 }}>
                    A state where no player can improve their outcome by changing strategy alone. Stable because each player's strategy is already optimal given others' choices.
                  </p>
                </div>
              </div>
              {/* Rating */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:5 }}>
                {[["Again","#ef4444"],["Hard","#f97316"],["Good","#22c55e"],["Easy","#3b82f6"]].map(([l,c]) => (
                  <button key={l} style={{ padding:"7px 0", border:"none", cursor:"pointer", background:c, color:"#fff", fontSize:10, fontWeight:700 }}>{l}</button>
                ))}
              </div>
            </div>
          </div>

          {/* BOTTOM half — notes + quick stats */}
          <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
            <div style={{ padding:"10px 18px", borderBottom:`1px solid ${t.rule}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0 }}>
              <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>Notes</div>
              <button style={{ fontSize:10, color:t.accent, background:"none", border:"none", cursor:"pointer", fontWeight:600 }}>Save</button>
            </div>
            <div style={{ flex:1, padding:"12px 18px", overflowY:"auto", fontSize:12.5, color:t.body, lineHeight:1.75, background:t.bg }}>
              <span style={{ color:t.muted, fontStyle:"italic" }}>Nash Eq = no unilateral gain</span><br />
              Dominant strategy → always best regardless of opponent<br />
              Prisoner's Dilemma = collective action failure<br />
              Folk Theorem → cooperation sustainable if δ high<br />
              <span style={{ display:"inline-block", width:2, height:13, background:t.accent, marginLeft:2, verticalAlign:"middle" }} />
            </div>
            {/* Quick-stats strip */}
            <div style={{ padding:"8px 18px", borderTop:`1px solid ${t.rule}`, display:"flex", gap:18, flexShrink:0 }}>
              {[["Page","1 / 4"],["Cards","3"],["Mastered","1 / 3"]].map(([l,v]) => (
                <div key={l} style={{ display:"flex", gap:5, alignItems:"center" }}>
                  <span style={{ fontSize:9, color:t.muted, textTransform:"uppercase", letterSpacing:1, fontWeight:700 }}>{l}</span>
                  <span style={{ ...Sf4, fontSize:12, fontWeight:600, color:t.ink }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ViewShell4>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// CONTENT VIEW — Audio Study
// ─────────────────────────────────────────────────────────────────────────────
export const Content4Audio: React.FC<{ t: Theme }> = ({ t }) => {
  const docTitle = "Game Theory — Week 3: Strategic Interactions";
  const transcriptLines = [
    { ts: "0:00", text: "Today we'll be exploring the foundational concepts of game theory, specifically Nash Equilibria and how they apply to real-world strategic interactions." },
    { ts: "0:42", text: "A Nash Equilibrium is a stable state of a system where no participant can gain by changing only their own strategy, assuming all other players keep their strategies unchanged." },
    { ts: "1:18", text: "Let's consider a classic example: the Prisoner's Dilemma. Two suspects are questioned separately. Each can either cooperate with the other or betray them." },
    { ts: "2:05", text: "Regardless of what the other does, each prisoner gets a better deal by betraying. So both betray. Yet if both had cooperated, both would have been better off. This is the paradox at the heart of the dilemma." },
  ];
  return (
    <ViewShell4 t={t} title={docTitle} activeTab="audio" tabs={viewTabs}>
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>

        {/* ── Horizontal audio player bar (full-width, compact) ── */}
        <div style={{ flexShrink: 0, borderBottom: `1px solid ${t.rule}`, background: t.panel, padding: "10px 24px", display: "flex", alignItems: "center", gap: 18 }}>
          <button style={{ width: 38, height: 38, borderRadius: "50%", background: t.accent, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill={t.mode === "dark" ? t.bg : "#fff"}><polygon points="5,3 19,12 5,21"/></svg>
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 5 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: t.ink }}>Week 3 Lecture</span>
              <span style={{ fontSize: 11, color: t.muted, fontFamily: "monospace" }}>4:02 / 14:22</span>
            </div>
            <div style={{ height: 4, borderRadius: 2, background: t.rule, position: "relative", cursor: "pointer" }}>
              <div style={{ width: "28%", height: "100%", borderRadius: 2, background: t.accent }} />
              <div style={{ position: "absolute", top: "50%", left: "28%", transform: "translate(-50%,-50%)", width: 10, height: 10, borderRadius: "50%", background: t.accent, border: `2px solid ${t.panel}` }} />
            </div>
          </div>
          {/* Skip controls */}
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button style={{ padding: "4px 8px", border: `1px solid ${t.rule}`, background: "transparent", fontSize: 10, color: t.muted, cursor: "pointer", borderRadius: 4 }}>⏮ 15s</button>
            <button style={{ padding: "4px 8px", border: `1px solid ${t.rule}`, background: "transparent", fontSize: 10, color: t.muted, cursor: "pointer", borderRadius: 4 }}>15s ⏭</button>
          </div>
          {/* Speed pills */}
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            {["0.75×","1×","1.25×","1.5×"].map((s, i) => (
              <button key={s} style={{ padding: "4px 8px", border: `1px solid ${i === 1 ? t.accent : t.rule}`, background: i === 1 ? t.accentSoft : "transparent", fontSize: 10.5, fontWeight: 600, color: i === 1 ? t.accent : t.muted, cursor: "pointer", borderRadius: 4 }}>{s}</button>
            ))}
          </div>
          {/* File label */}
          <span style={{ fontSize: 10.5, color: t.muted, flexShrink: 0 }}>lecture_week3.mp3</span>
          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
            <button style={{ padding: "4px 10px", border: `1px solid ${t.rule}`, background: "transparent", fontSize: 10.5, color: t.muted, cursor: "pointer", borderRadius: 4 }}>Original</button>
            <button style={{ padding: "4px 10px", border: `1px solid ${t.accent}`, background: t.accentSoft, fontSize: 10.5, color: t.accent, fontWeight: 600, cursor: "pointer", borderRadius: 4 }}>Transcript</button>
          </div>
        </div>

        {/* ── Body: transcript (left) | AI chat + flashcards (right) ── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* Transcript */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
            <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 14 }}>Transcript</div>
            {transcriptLines.map((line, i) => (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: 22, borderLeft: i === 1 ? `2px solid ${t.accent}` : "2px solid transparent", paddingLeft: 14, background: "transparent" }}>
                <span style={{ fontSize: 11, color: t.accent, fontWeight: 700, fontFamily: "monospace", flexShrink: 0, paddingTop: 2, minWidth: 32 }}>{line.ts}</span>
                <p style={{ margin: 0, fontSize: 13.5, color: i === 1 ? t.ink : t.body, lineHeight: 1.8, fontWeight: i === 1 ? 500 : 400 }}>{line.text}</p>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div style={{ width: 1, background: t.rule, flexShrink: 0 }} />

          {/* AI chat + flashcards */}
          <div style={{ width: 380, display: "flex", flexDirection: "column", overflow: "hidden" }}>

            {/* Chat header */}
            <div style={{ padding: "14px 20px 8px", flexShrink: 0, borderBottom: `1px solid ${t.rule}` }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase" }}>AI Summary</div>
            </div>

            {/* Chat thread — scrollable */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "flex-start" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${t.accent},${t.sb})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={t.sbInk} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M6 14c0-2 2-3 6-3s6 1 6 3"/></svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: t.accent, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>AI · Summary</div>
                  <p style={{ fontSize: 13, color: t.body, lineHeight: 1.8, margin: 0 }}>
                    This lecture introduces <strong style={{ color: t.ink }}>Nash Equilibrium</strong> — the foundational concept in non-cooperative game theory. The Professor uses the <strong style={{ color: t.ink }}>Prisoner's Dilemma</strong> to illustrate why individually rational choices produce collectively suboptimal outcomes.
                  </p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 18, alignItems: "flex-start" }}>
                <div style={{ width: 26, flexShrink: 0 }} />
                <p style={{ fontSize: 13, color: t.body, lineHeight: 1.8, margin: 0, flex: 1 }}>
                  Key topics: strategic dominance, backward induction, and the Folk Theorem for repeated games. Approx. <strong style={{ color: t.ink }}>14 minutes</strong>.
                </p>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 18 }}>
                <div style={{ background: t.accent, borderRadius: "14px 14px 3px 14px", padding: "10px 16px", maxWidth: "78%", fontSize: 13, color: t.mode === "dark" ? t.bg : "#fff", lineHeight: 1.6 }}>
                  What's the main takeaway from the Folk Theorem section?
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg,${t.accent},${t.sb})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={t.sbInk} strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M6 14c0-2 2-3 6-3s6 1 6 3"/></svg>
                </div>
                <p style={{ fontSize: 13, color: t.body, lineHeight: 1.8, margin: 0, flex: 1 }}>
                  The Folk Theorem shows cooperation is sustainable in repeated games when players care about the future — removing the Prisoner's Dilemma trap.
                </p>
              </div>
            </div>

            {/* Input */}
            <div style={{ padding: "10px 16px", borderTop: `1px solid ${t.rule}`, flexShrink: 0 }}>
              <div style={{ display: "flex", gap: 8, border: `1px solid ${t.rule}`, borderRadius: 10, padding: "7px 12px", background: t.bg, alignItems: "center" }}>
                <input placeholder="Ask about this lecture…" style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 12.5, color: t.ink }} />
                <button style={{ background: t.accent, border: "none", cursor: "pointer", width: 28, height: 28, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.mode === "dark" ? t.bg : "#fff"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2 15 22l-4-9-9-4z"/></svg>
                </button>
              </div>
            </div>

            {/* Generated flashcards */}
            <div style={{ borderTop: `1px solid ${t.rule}`, padding: "12px 16px 14px", flexShrink: 0 }}>
              <div style={{ fontSize: 9, letterSpacing: 2, color: t.accent, fontWeight: 700, textTransform: "uppercase", marginBottom: 10 }}>Generated Flashcards</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {["Nash Equilibrium definition","Dominant vs. dominated strategies","Prisoner's Dilemma payoff structure"].map((fc, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", border: `1px solid ${t.rule}`, background: t.bg, fontSize: 12.5, color: t.body }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round"><rect x="3" y="5" width="18" height="14" rx="2"/></svg>
                    {fc}
                  </div>
                ))}
              </div>
              <button style={{ width: "100%", marginTop: 8, padding: "9px 0", background: t.accent, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: t.mode === "dark" ? t.bg : "#fff" }}>
                Save to Library
              </button>
            </div>
          </div>
        </div>
      </div>
    </ViewShell4>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// EDUPLAY — Post-Game Results
// ─────────────────────────────────────────────────────────────────────────────
export const Play4Result: React.FC<{ t: Theme }> = ({ t }) => {
  const players = [
    { rank:1, name:"Layla A.",  score:9420, correct:13, total:15, acc:87, avg:3.2, isMe:false },
    { rank:2, name:"You",       score:8760, correct:12, total:15, acc:80, avg:4.1, isMe:true  },
    { rank:3, name:"Sana M.",   score:7540, correct:11, total:15, acc:73, avg:5.4, isMe:false },
    { rank:4, name:"Ali R.",    score:6820, correct:10, total:15, acc:67, avg:5.9, isMe:false },
    { rank:5, name:"Farah J.",  score:5900, correct:9,  total:15, acc:60, avg:6.3, isMe:false },
    { rank:6, name:"Yaseen T.", score:4700, correct:7,  total:15, acc:47, avg:7.1, isMe:false },
    { rank:7, name:"Mona S.",   score:3800, correct:6,  total:15, acc:40, avg:7.8, isMe:false },
  ];
  return (
    <Shell4 t={t} active="play">
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:12 }}>
        <div>
          <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>Brain Rush · Room MFHX-2847</div>
          <h1 style={{ ...Sf4, fontSize:30, fontWeight:600, color:t.ink, margin:"5px 0 3px", letterSpacing:-0.6 }}>Final Results</h1>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 13px", background:"transparent", border:`1px solid ${t.rule}`, fontSize:11.5, color:t.body, cursor:"pointer" }}>← Back to Games</button>
          <button style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 15px", background:t.ink, border:"none", fontSize:11.5, fontWeight:600, color:t.bg, cursor:"pointer" }}>Play Again</button>
        </div>
      </div>

      {/* Dark banner — your result */}
      <div style={{ background:t.ink, padding:"22px 30px", display:"flex", alignItems:"center", marginBottom:16 }}>
        <div style={{ paddingRight:30, borderRight:`1px solid ${t.bg}14`, flexShrink:0 }}>
          <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>Your Rank</div>
          <div style={{ ...Sf4, fontSize:60, fontWeight:600, color:t.bg, lineHeight:1, letterSpacing:-2 }}>
            #2<span style={{ fontSize:22, color:t.accent, marginLeft:6 }}>of 18</span>
          </div>
          <div style={{ ...Sf4, fontSize:10.5, color:t.accent, marginTop:8 }}>— Strong performance</div>
        </div>
        <div style={{ flex:1, display:"flex", justifyContent:"space-evenly", paddingLeft:30 }}>
          {[["8,760","Score"],["12 / 15","Correct"],["80%","Accuracy"]].map(([v,l],i) => (
            <div key={i} style={{ textAlign:"center" }}>
              <div style={{ ...Sf4, fontSize:32, fontWeight:600, color:t.bg, lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:9, letterSpacing:1.5, color:`${t.bg}55`, textTransform:"uppercase", marginTop:5 }}>{l}</div>
            </div>
          ))}
          <div style={{ textAlign:"center", borderLeft:`1px solid ${t.bg}14`, paddingLeft:28 }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Avg Time</div>
            <div style={{ ...Sf4, fontSize:26, fontWeight:600, color:t.bg, lineHeight:1 }}>4.1<span style={{ fontSize:13, color:`${t.bg}55` }}>s</span></div>
            <div style={{ fontSize:10, color:`${t.bg}44`, marginTop:6 }}>per question</div>
          </div>
        </div>
      </div>

      {/* 2-col: podium + game summary left, full standings right */}
      <div style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:20, flex:1 }}>
        {/* Left */}
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Top Finishers</div>
          <div style={{ background:t.panel, border:`1px solid ${t.rule}` }}>
            {players.slice(0,3).map((p,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 18px", borderBottom:i<2?`1px solid ${t.rule}`:"none", background:i===0?t.accentSoft:"transparent", borderLeft:i===0?`3px solid ${t.accent}`:"3px solid transparent" }}>
                <div style={{ ...Sf4, fontSize:24, fontWeight:700, color:i===0?t.accent:t.muted, width:24, flexShrink:0 }}>{p.rank}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:12.5, fontWeight:700, color:t.ink, marginBottom:1 }}>{p.name}{p.isMe&&<span style={{ fontSize:9, letterSpacing:1, color:t.accent, marginLeft:6 }}>YOU</span>}</div>
                  <div style={{ fontSize:10.5, color:t.muted }}>{p.correct}/{p.total} correct · {p.acc}%</div>
                </div>
                <div style={{ ...Sf4, fontSize:17, fontWeight:700, color:i===0?t.accent:t.muted }}>{p.score.toLocaleString()}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop:12, background:t.panel2, border:`1px solid ${t.rule}`, borderTop:`3px solid ${t.accent}`, padding:"14px 18px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.muted, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Game Summary</div>
            {[["Questions","15"],["Players","18"],["Difficulty","Medium"],["Winner",players[0].name]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${t.rule}` }}>
                <span style={{ fontSize:11, color:t.muted }}>{k}</span>
                <span style={{ ...Sf4, fontSize:13, fontWeight:600, color:t.ink }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Right — full standings table */}
        <div>
          <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Final Standings · All 18 Players</div>
          <div style={{ background:t.panel, border:`1px solid ${t.rule}` }}>
            <div style={{ display:"grid", gridTemplateColumns:"36px 1fr 60px 52px 52px 80px", padding:"7px 16px", borderBottom:`1px solid ${t.rule}` }}>
              {["#","Player","Correct","Acc","Avg","Score"].map(h => (
                <div key={h} style={{ fontSize:9, letterSpacing:1.5, color:t.muted, fontWeight:700, textTransform:"uppercase" }}>{h}</div>
              ))}
            </div>
            {players.map((p,i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"36px 1fr 60px 52px 52px 80px", padding:"9px 16px", borderBottom:i<players.length-1?`1px solid ${t.rule}`:"none", alignItems:"center", background:p.isMe?t.accentSoft:"transparent", borderLeft:p.isMe?`3px solid ${t.accent}`:"3px solid transparent" }}>
                <span style={{ ...Sf4, fontSize:14, fontWeight:700, color:p.rank<=3?t.accent:t.muted }}>{p.rank}</span>
                <div style={{ display:"flex", alignItems:"center", gap:8, minWidth:0 }}>
                  <div style={{ width:24, height:24, borderRadius:999, background:p.isMe?t.accent:t.ink, color:t.bg, display:"grid", placeItems:"center", fontSize:8, fontWeight:700, flexShrink:0 }}>{p.name[0]}</div>
                  <span style={{ fontSize:12, fontWeight:p.isMe?700:400, color:t.ink, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{p.name}</span>
                </div>
                <span style={{ fontSize:11.5, color:t.body }}>{p.correct}/{p.total}</span>
                <span style={{ fontSize:11.5, color:t.body }}>{p.acc}%</span>
                <span style={{ fontSize:11.5, color:t.body }}>{p.avg}s</span>
                <span style={{ ...Sf4, fontSize:16, fontWeight:700, color:p.isMe?t.accent:t.muted }}>{p.score.toLocaleString()}</span>
              </div>
            ))}
            <div style={{ padding:"9px 16px", textAlign:"center" }}>
              <span style={{ fontSize:11, color:t.muted, fontStyle:"italic" }}>+ 11 more players · Ranks 8–18</span>
            </div>
          </div>
        </div>
      </div>
    </Shell4>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// EDUPLAY — Multiplayer Lobby (standard quiz game, not Brain Rush)
// ─────────────────────────────────────────────────────────────────────────────
export const Play4LobbyMulti: React.FC<{ t: Theme }> = ({ t }) => {
  const lobbyPlayers = [
    { name:"Ahmed K.", init:"AK", isHost:true,  ready:true  },
    { name:"Layla A.", init:"LA", isHost:false, ready:true  },
    { name:"Omar R.",  init:"OR", isHost:false, ready:true  },
    { name:"Sana M.",  init:"SM", isHost:false, ready:false },
    { name:"Farah J.", init:"FJ", isHost:false, ready:true  },
    { name:"Yaseen T.",init:"YT", isHost:false, ready:true  },
    { name:"Mona S.",  init:"MS", isHost:false, ready:true  },
  ];
  const readyCount = lobbyPlayers.filter(p => p.ready).length;
  return (
    <Shell4 t={t} active="play">
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:12 }}>
        <div>
          <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>EduPlay · Multiplayer</div>
          <h1 style={{ ...Sf4, fontSize:30, fontWeight:600, color:t.ink, margin:"5px 0 3px", letterSpacing:-0.6 }}>Game Theory Finals Prep</h1>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 13px", background:"transparent", border:`1px solid ${t.rule}`, fontSize:11.5, color:t.body, cursor:"pointer" }}>← Leave</button>
          <button style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"6px 14px", background:"transparent", border:`1px solid ${t.rule}`, fontSize:11.5, color:t.body, cursor:"pointer" }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy Code
          </button>
        </div>
      </div>

      {/* Dark room-code banner */}
      <div style={{ background:t.ink, padding:"20px 28px", marginBottom:16, display:"flex", alignItems:"center" }}>
        <div style={{ paddingRight:30, borderRight:`1px solid ${t.bg}14`, flexShrink:0 }}>
          <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>Room Code</div>
          <div style={{ fontFamily:"monospace", fontSize:34, fontWeight:900, color:t.bg, letterSpacing:5, lineHeight:1 }}>MFHX-2847</div>
          <div style={{ fontSize:10, color:`${t.bg}44`, marginTop:5 }}>Share with participants to join</div>
        </div>
        <div style={{ flex:1, display:"flex", justifyContent:"space-evenly", paddingLeft:30 }}>
          {[
            [`${lobbyPlayers.length} / 20`, "Players"],
            [`${readyCount} / ${lobbyPlayers.length}`, "Ready"],
            ["10", "Questions"],
            ["30s", "Per Question"],
          ].map(([v,l],i) => (
            <div key={i} style={{ textAlign:"center" }}>
              <div style={{ ...Sf4, fontSize:28, fontWeight:600, color:i<2?t.accent:t.bg, lineHeight:1 }}>{v}</div>
              <div style={{ fontSize:9, letterSpacing:1.5, color:`${t.bg}55`, textTransform:"uppercase", marginTop:5 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-col */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 220px", gap:20, flex:1 }}>
        {/* Player table */}
        <div>
          <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Players in Lobby</div>
          <div style={{ background:t.panel, border:`1px solid ${t.rule}` }}>
            <div style={{ display:"grid", gridTemplateColumns:"28px 1fr 80px 64px", padding:"7px 16px", borderBottom:`1px solid ${t.rule}` }}>
              {["","Player","Status","Role"].map(h => (
                <div key={h} style={{ fontSize:9, letterSpacing:1.5, color:t.muted, fontWeight:700, textTransform:"uppercase" }}>{h}</div>
              ))}
            </div>
            {lobbyPlayers.map((p,i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"28px 1fr 80px 64px", padding:"9px 16px", borderBottom:i<lobbyPlayers.length-1?`1px solid ${t.rule}`:"none", alignItems:"center" }}>
                <div style={{ width:22, height:22, borderRadius:999, background:p.isHost?t.accent:t.ink, color:t.bg, display:"grid", placeItems:"center", fontSize:8, fontWeight:700 }}>{p.init[0]}</div>
                <span style={{ fontSize:12, color:t.ink, fontWeight:p.isHost?600:400 }}>{p.name}</span>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:6, height:6, borderRadius:"50%", background:p.ready?"#5cb85c":t.muted }} />
                  <span style={{ fontSize:11, color:p.ready?t.ink:t.muted }}>{p.ready?"Ready":"Waiting"}</span>
                </div>
                <span style={{ fontSize:11, color:p.isHost?t.accent:t.muted }}>{p.isHost?"Host":"—"}</span>
              </div>
            ))}
            {[0,1].map(i => (
              <div key={"e"+i} style={{ display:"grid", gridTemplateColumns:"28px 1fr 80px 64px", padding:"9px 16px", borderBottom:`1px solid ${t.rule}`, alignItems:"center", opacity:0.4 }}>
                <div style={{ width:22, height:22, borderRadius:999, background:t.rule }} />
                <span style={{ fontSize:11, color:t.muted, fontStyle:"italic" }}>Waiting for player…</span>
                <span style={{ fontSize:10, color:t.muted }}>—</span>
                <span style={{ fontSize:10, color:t.muted }}>—</span>
              </div>
            ))}
          </div>
        </div>
        {/* Actions + settings */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <div style={{ background:t.ink, padding:"18px 16px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:`${t.bg}44`, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>Host Controls</div>
            <button style={{ width:"100%", padding:"12px 0", border:`1px solid ${t.accent}`, background:t.accent, color:t.bg, fontSize:12, fontWeight:700, cursor:"pointer", marginBottom:8, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill={t.bg}><polygon points="5,3 19,12 5,21"/></svg>
              Start Game
            </button>
            <button style={{ width:"100%", padding:"9px 0", border:`1px solid ${t.bg}22`, background:"transparent", color:`${t.bg}66`, fontSize:11, cursor:"pointer" }}>Cancel Game</button>
          </div>
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderTop:`3px solid ${t.accent}`, padding:"14px 16px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.muted, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Game Settings</div>
            {[["Questions","10"],["Time / Q","30s"],["Difficulty","Medium"],["Max Players","20"]].map(([k,v]) => (
              <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:`1px solid ${t.rule}` }}>
                <span style={{ fontSize:11, color:t.muted }}>{k}</span>
                <span style={{ ...Sf4, fontSize:13, fontWeight:600, color:t.ink }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell4>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// EDUPLAY — Multiplayer Active Game (standard quiz, not Brain Rush speed mode)
// ─────────────────────────────────────────────────────────────────────────────
export const Play4BattleMulti: React.FC<{ t: Theme }> = ({ t }) => {
  const answeredPlayers = ["Ahmed K.","Layla A.","Omar R.","Farah J.","Yaseen T.","Mona S."];
  const waitingPlayers  = ["Sana M.","Ali R.","Lina F.","Hassan M."];
  const options = [
    "A state where no player can benefit by changing strategy unilaterally",
    "A strategy that always results in the highest total payoff for all players",
    "The outcome where all players simultaneously choose cooperative strategies",
    "A solution where one player always dominates regardless of others' choices",
  ];
  return (
    <Shell4 t={t} active="play">
      {/* Label + timer row */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
        <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>Brain Rush Multiplayer · Question 7 of 10</div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:11, color:t.muted }}>10 / 14 answered</span>
          {/* Graceful timer pill — uses accent soft so it fits all themes */}
          <div style={{ display:"flex", alignItems:"center", gap:7, background:t.accentSoft, border:`1.5px solid ${t.accent}`, borderRadius:24, padding:"5px 14px" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2.2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>
            <span style={{ ...Sf4, fontSize:21, fontWeight:700, color:t.accent, lineHeight:1 }}>18</span>
            <span style={{ fontSize:10, color:t.accent, opacity:0.7, fontWeight:600 }}>s</span>
          </div>
        </div>
      </div>
      <div style={{ height:1, background:t.rule, marginBottom:10 }} />
      <div style={{ height:3, background:t.rule, marginBottom:16 }}>
        <div style={{ width:"70%", height:"100%", background:t.accent }} />
      </div>

      {/* Question */}
      <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderTop:`3px solid ${t.accent}`, padding:"16px 24px", marginBottom:12 }}>
        <div style={{ fontSize:9, letterSpacing:2, color:t.muted, fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>Game Theory — Nash Equilibrium</div>
        <p style={{ ...Sf4, fontSize:18, fontWeight:600, color:t.ink, margin:0, lineHeight:1.5 }}>
          In the context of non-cooperative game theory, a Nash Equilibrium is best described as:
        </p>
      </div>

      {/* Options — full width, larger */}
      <div style={{ background:t.panel, border:`1px solid ${t.rule}`, marginBottom:14 }}>
        {options.map((opt,i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:16, padding:"16px 24px", borderBottom:i<options.length-1?`1px solid ${t.rule}`:"none", borderLeft:i===0?`3px solid ${t.accent}`:"3px solid transparent", background:i===0?t.accentSoft:"transparent", cursor:"pointer" }}>
            <span style={{ ...Sf4, fontSize:17, fontWeight:700, color:i===0?t.accent:t.muted, flexShrink:0, width:22 }}>{["A","B","C","D"][i]}</span>
            <span style={{ fontSize:14, color:i===0?t.ink:t.body, lineHeight:1.5, fontWeight:i===0?600:400, flex:1 }}>{opt}</span>
            {i===0 && (
              <div style={{ marginLeft:"auto", width:18, height:18, borderRadius:999, background:t.accent, display:"grid", placeItems:"center", flexShrink:0 }}>
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={t.bg} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Players — below the question, as a compact horizontal panel */}
      <div style={{ background:t.panel, border:`1px solid ${t.rule}` }}>
        <div style={{ padding:"8px 18px", borderBottom:`1px solid ${t.rule}`, display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>Players</span>
          <span style={{ fontSize:10, color:t.muted }}>{answeredPlayers.length} answered · {waitingPlayers.length} waiting</span>
        </div>
        <div style={{ padding:"10px 18px", display:"flex", flexWrap:"wrap", gap:8 }}>
          {answeredPlayers.map((name,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 10px", background:t.accentSoft, border:`1px solid ${t.accent}22` }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <span style={{ fontSize:11.5, color:t.ink, fontWeight:500 }}>{name}</span>
            </div>
          ))}
          {waitingPlayers.map((name,i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:6, padding:"5px 10px", background:t.bg, border:`1px solid ${t.rule}`, opacity:0.65 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", border:`1.5px solid ${t.muted}` }} />
              <span style={{ fontSize:11.5, color:t.muted }}>{name}</span>
            </div>
          ))}
        </div>
      </div>
    </Shell4>
  );
};


// ─────────────────────────────────────────────────────────────────────────────
// ACADEMICS — AI Course Tutor
// ─────────────────────────────────────────────────────────────────────────────
export const Aca4Tutor: React.FC<{ t: Theme }> = ({ t }) => {
  const messages = [
    { role: "system", text: "Context loaded from 3 course materials (Game Theory Week 1–3). I can answer questions about Nash Equilibria, strategic dominance, and cooperative game theory." },
    { role: "user",   text: "Can you explain the Nash Equilibrium in the Prisoner's Dilemma?" },
    { role: "ai",     text: "In the Prisoner's Dilemma, the Nash Equilibrium is for both players to defect — even though mutual cooperation would produce a better outcome for both.\n\nHere's why: if Prisoner A thinks B will cooperate, A gets 3 years by defecting vs. 2 years by cooperating. If A thinks B will defect, A gets 1 year by defecting vs. 5 years by cooperating. So regardless of B's choice, defecting is strictly dominant for A — and the same logic applies to B.\n\nThe tragic result: both defect and serve 3 years each, when both cooperating would have meant only 2 years each." },
    { role: "user",   text: "What makes this different from a coordination game?" },
    { role: "ai",     text: "Great question! In a coordination game, both players want to choose the same action — there's no conflict between individual and collective interests. Classic examples are choosing which side of the road to drive on, or agreeing on a meeting point.\n\nThe key difference with the Prisoner's Dilemma is incentive alignment:\n• Coordination game: individual optimum = collective optimum\n• Prisoner's Dilemma: individual optimum ≠ collective optimum (this is what makes it a dilemma)" },
  ];
  return (
    <Shell4 t={t} active="Academics">
      <div style={{ display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        {/* Course context bar */}
        <div style={{ padding: "12px 28px", borderBottom: `1px solid ${t.rule}`, display: "flex", alignItems: "center", gap: 12, background: t.panel, flexShrink: 0 }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: t.muted, display: "flex", alignItems: "center", gap: 5, fontSize: 12 }}>
            ← Academics
          </button>
          <div style={{ width: 1, height: 14, background: t.rule }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: t.ink }}>Game Theory</span>
          <div style={{ width: 1, height: 14, background: t.rule }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: t.accentSoft, borderRadius: 20, fontSize: 11, fontWeight: 600, color: t.accent }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3M12 17h.01" /></svg>
            AI Tutor
          </div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: t.muted }}>3 materials in context</div>
        </div>
        {/* Message thread */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 28px" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ marginBottom: 16, display: "flex", flexDirection: "column", alignItems: msg.role === "user" ? "flex-end" : "flex-start" }}>
              {msg.role === "system" && (
                <div style={{ background: t.panel2, border: `1px solid ${t.rule}`, borderRadius: 10, padding: "10px 14px", maxWidth: "85%", fontSize: 11.5, color: t.muted, display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="1.7" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="9" /><path d="M9.1 9a3 3 0 0 1 5.82 1c0 2-3 3-3 3M12 17h.01" /></svg>
                  {msg.text}
                </div>
              )}
              {msg.role === "user" && (
                <div style={{ background: t.accent, borderRadius: "12px 12px 2px 12px", padding: "10px 16px", maxWidth: "70%", fontSize: 13, color: t.mode === "dark" ? t.bg : "#fff", lineHeight: 1.5 }}>
                  {msg.text}
                </div>
              )}
              {msg.role === "ai" && (
                <div style={{ display: "flex", gap: 10, maxWidth: "85%", alignItems: "flex-start" }}>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg, ${t.accent}, ${t.sb})`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.sbInk} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M6 14c0-2 2-3 6-3s6 1 6 3" /></svg>
                  </div>
                  <div style={{ background: t.panel, border: `1px solid ${t.rule}`, borderRadius: "2px 12px 12px 12px", padding: "12px 16px", fontSize: 13, color: t.body, lineHeight: 1.75 }}>
                    {msg.text.split("\n").map((line, j) => <span key={j}>{line}{j < msg.text.split("\n").length - 1 && <br />}</span>)}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Input bar */}
        <div style={{ padding: "12px 28px 20px", borderTop: `1px solid ${t.rule}`, flexShrink: 0, background: t.panel }}>
          <div style={{ display: "flex", gap: 10, border: `1.5px solid ${t.rule}`, borderRadius: 12, padding: "8px 14px", background: t.bg, alignItems: "center" }}>
            <input placeholder="Ask anything about Game Theory…" style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 13, color: t.ink, caretColor: t.accent }} />
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: t.muted }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><path d="M12 2a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" /><path d="M19 10a7 7 0 0 1-14 0M12 19v4M8 23h8" /></svg>
            </button>
            <button style={{ background: t.accent, border: "none", cursor: "pointer", width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.mode === "dark" ? t.bg : "#fff"} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13M22 2 15 22l-4-9-9-4z" /></svg>
            </button>
          </div>
        </div>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ACADEMICS — Exam Scheduler
// ─────────────────────────────────────────────────────────────────────────────
export const Aca4Exams: React.FC<{ t: Theme }> = ({ t }) => {
  const exams = [
    { name: "Midterm Examination",          date: "May 14, 2026 · 09:00",  countdown: { d: 6,  h: 12, m: 40 }, past: false },
    { name: "Game Theory Problem Set",      date: "May 10, 2026 · 14:00",  countdown: { d: 2,  h: 8,  m: 15 }, past: false },
    { name: "Weekly Quiz — Chapter 7",      date: "May 9,  2026 · 08:00",  countdown: { d: 1,  h: 3,  m: 22 }, past: false },
    { name: "Final Examination",            date: "May 28, 2026 · 10:00",  countdown: { d: 20, h: 6,  m: 0  }, past: false },
    { name: "Participation Report",         date: "Apr 30, 2026 · 23:59",  countdown: null,                      past: true  },
  ];
  return (
    <Shell4 t={t} active="Academics">
      <div style={{ padding: "0 28px 28px", overflowY: "auto", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0 20px" }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: t.muted, fontSize: 12 }}>← Academics</button>
          <div style={{ width: 1, height: 14, background: t.rule }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: t.ink }}>Game Theory · Exam Schedule</span>
          <button style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 8, background: t.accent, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, color: t.mode === "dark" ? t.bg : "#fff" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
            Add Exam
          </button>
        </div>
        {/* Upcoming banner */}
        <div style={{ background: t.accentSoft, border: `1px solid ${t.accent}`, borderRadius: 10, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: t.accent }}>Next up: Weekly Quiz — Chapter 7</div>
            <div style={{ fontSize: 11, color: t.body }}>Tomorrow · May 9, 2026 at 08:00 — 1d 3h 22m remaining</div>
          </div>
        </div>
        {/* Exam list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {exams.map((exam, i) => (
            <div key={i} style={{ background: t.panel, border: `1px solid ${exam.past ? t.rule : (exam.countdown.d <= 2 ? t.accent : t.rule)}`, borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, opacity: exam.past ? 0.65 : 1 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: exam.past ? t.panel2 : t.accentSoft, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, border: `1px solid ${t.rule}` }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: exam.past ? t.muted : t.accent, lineHeight: 1 }}>
                  {exam.date.split(" ")[1].replace(",","")}
                </span>
                <span style={{ fontSize: 9, color: t.muted, fontWeight: 600 }}>
                  {exam.date.split(" ")[0].toUpperCase().slice(0,3)}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: t.ink, marginBottom: 2 }}>{exam.name}</div>
                <div style={{ fontSize: 11.5, color: t.muted }}>{exam.date}</div>
              </div>
              {exam.past ? (
                <span style={{ fontSize: 11, fontWeight: 600, color: t.muted, background: t.panel2, padding: "3px 10px", borderRadius: 99 }}>Past</span>
              ) : (
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: exam.countdown.d <= 2 ? "#f59e0b" : t.ink }}>
                    {exam.countdown.d > 0 && `${exam.countdown.d}d `}{exam.countdown.h}h {exam.countdown.m}m
                  </div>
                  <div style={{ fontSize: 10, color: t.muted }}>remaining</div>
                </div>
              )}
              <button style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: t.muted }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.7" strokeLinecap="round"><path d="M3 6h18M19 6l-1 14H6L5 6M10 6V4h4v2" /></svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ACADEMICS — SRS Review Panel
// ─────────────────────────────────────────────────────────────────────────────
export const Aca4SRS: React.FC<{ t: Theme }> = ({ t }) => {
  const cardNum = 4; const cardTotal = 12;
  const pct = Math.round((cardNum - 1) / cardTotal * 100);
  return (
    <Shell4 t={t} active="Academics">
      <div style={{ padding: "0 28px 28px", overflowY: "auto", height: "100%" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0 20px" }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: t.muted, fontSize: 12 }}>← Academics</button>
          <div style={{ width: 1, height: 14, background: t.rule }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: t.ink }}>Game Theory · Spaced Repetition</span>
          <button style={{ marginLeft: "auto", fontSize: 12, color: t.muted, background: "none", border: "none", cursor: "pointer" }}>Exit Review</button>
        </div>
        {/* Progress row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
          <div style={{ flex: 1, height: 6, background: t.rule, borderRadius: 3 }}>
            <div style={{ width: `${pct}%`, height: "100%", background: t.accent, borderRadius: 3 }} />
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: t.muted, whiteSpace: "nowrap" }}>Card {cardNum} of {cardTotal}</div>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "rgba(34,197,94,0.12)", color: "#22c55e", fontWeight: 600 }}>3 mastered</span>
            <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 99, background: "rgba(239,68,68,0.1)", color: "#ef4444", fontWeight: 600 }}>1 again</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 260px", gap: 20 }}>
          {/* Flip card */}
          <div>
            <div style={{ border: `1.5px solid ${t.accent}`, borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
              {/* Front */}
              <div style={{ background: t.accentSoft, padding: "20px 24px", borderBottom: `1px solid ${t.rule}` }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: t.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Question</div>
                <p style={{ ...Sf4, fontSize: 17, fontWeight: 600, color: t.ink, margin: 0, lineHeight: 1.5 }}>
                  In a repeated Prisoner's Dilemma, under what condition does the Folk Theorem guarantee that cooperation can be sustained as a Nash Equilibrium?
                </p>
              </div>
              {/* Revealed answer */}
              <div style={{ background: t.panel, padding: "18px 24px" }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Answer</div>
                <p style={{ fontSize: 13.5, color: t.body, margin: 0, lineHeight: 1.75 }}>
                  The Folk Theorem guarantees cooperation can be sustained when players are sufficiently patient — specifically when the discount factor δ is high enough (close to 1). This means players value future payoffs nearly as much as present ones, making the threat of future punishment (e.g., "grim trigger" strategy) a credible deterrent against defection.
                </p>
              </div>
            </div>
            {/* Rating buttons */}
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 11, color: t.muted, marginBottom: 8 }}>How well did you know this?</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
                {[["Again","#ef4444","Forgot completely"],["Hard","#f97316","Recalled with difficulty"],["Good","#22c55e","Recalled correctly"],["Easy","#3b82f6","Recalled instantly"]].map(([label, color, sub]) => (
                  <button key={label} style={{ padding: "10px 6px", borderRadius: 10, border: "none", cursor: "pointer", background: color, color: "#fff", textAlign: "center" }}>
                    <div style={{ fontSize: 13, fontWeight: 800 }}>{label}</div>
                    <div style={{ fontSize: 9.5, opacity: 0.85, marginTop: 2 }}>{sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Right: due cards summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: t.panel, border: `1px solid ${t.rule}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Session Stats</div>
              {[["Due Today","12"],["Reviewed","3"],["Mastered","3"],["Next Review","Tomorrow"]].map(([k,v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: `1px solid ${t.rule}` }}>
                  <span style={{ fontSize: 12, color: t.muted }}>{k}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: t.ink }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ background: t.panel, border: `1px solid ${t.rule}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Upcoming Cards</div>
              {["Dominant strategy definition","Pareto optimality vs. Nash Eq","Backward induction method","Zero-sum vs. non-zero-sum"].map((card, i) => (
                <div key={i} style={{ fontSize: 11.5, color: t.muted, padding: "6px 0", borderBottom: `1px solid ${t.rule}`, display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: t.rule, flexShrink: 0 }} />
                  {card}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// ACADEMICS — Course Analytics
// ─────────────────────────────────────────────────────────────────────────────
export const Aca4Analytics: React.FC<{ t: Theme }> = ({ t }) => {
  const quizData = [
    { label: "Quiz 1", score: 72 }, { label: "Quiz 2", score: 65 },
    { label: "Quiz 3", score: 80 }, { label: "Midterm", score: 75 },
    { label: "Quiz 4", score: 88 }, { label: "Quiz 5", score: 83 },
  ];
  const chartW = 460, chartH = 120, padL = 30, padB = 28, padT = 10;
  const usableW = chartW - padL - 10;
  const usableH = chartH - padB - padT;
  const pts = quizData.map((d, i) => {
    const x = padL + (i / (quizData.length - 1)) * usableW;
    const y = padT + (1 - d.score / 100) * usableH;
    return { x, y, ...d };
  });
  const polyPts = pts.map(p => `${p.x},${p.y}`).join(" ");
  const areaPath = `M${pts[0].x},${pts[0].y} ` + pts.slice(1).map(p => `L${p.x},${p.y}`).join(" ") + ` L${pts[pts.length-1].x},${chartH-padB} L${pts[0].x},${chartH-padB} Z`;
  const masteryPct = 68;
  return (
    <Shell4 t={t} active="Academics">
      <div style={{ padding: "0 28px 28px", overflowY: "auto", height: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0 20px" }}>
          <button style={{ background: "none", border: "none", cursor: "pointer", color: t.muted, fontSize: 12 }}>← Academics</button>
          <div style={{ width: 1, height: 14, background: t.rule }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: t.ink }}>Game Theory · Analytics</span>
        </div>
        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
          {[["Quizzes Taken","6"],["Avg Score","77%"],["Flashcards","35"],["Cards Mastered","24"]].map(([l,v]) => (
            <div key={l} style={{ background: t.panel, border: `1px solid ${t.rule}`, borderRadius: 10, padding: "16px 18px" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: t.ink, marginBottom: 4 }}>{v}</div>
              <div style={{ fontSize: 11, color: t.muted }}>{l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Quiz score chart */}
          <div style={{ background: t.panel, border: `1px solid ${t.rule}`, borderRadius: 12, padding: 20 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Quiz Scores Over Time</div>
            <svg width={chartW} height={chartH} style={{ overflow: "visible", maxWidth: "100%" }}>
              {/* Grid lines */}
              {[0,25,50,75,100].map(v => {
                const y = padT + (1 - v / 100) * usableH;
                return <line key={v} x1={padL} x2={chartW-10} y1={y} y2={y} stroke={t.rule} strokeWidth="0.5" strokeDasharray="3,4" />;
              })}
              {/* Y axis labels */}
              {[0,50,100].map(v => {
                const y = padT + (1 - v / 100) * usableH;
                return <text key={v} x={padL - 5} y={y + 4} fontSize="9" fill={t.muted} textAnchor="end">{v}</text>;
              })}
              {/* Area fill */}
              <path d={areaPath} fill={t.accent} opacity="0.12" />
              {/* Line */}
              <polyline points={polyPts} fill="none" stroke={t.accent} strokeWidth="2" strokeLinejoin="round" />
              {/* Dots */}
              {pts.map((p, i) => (
                <g key={i}>
                  <circle cx={p.x} cy={p.y} r="4" fill={t.panel} stroke={t.accent} strokeWidth="2" />
                  <text x={p.x} y={p.y - 8} fontSize="9" fill={t.ink} textAnchor="middle">{p.score}</text>
                  <text x={p.x} y={chartH - padB + 14} fontSize="9" fill={t.muted} textAnchor="middle">{p.label}</text>
                </g>
              ))}
              {/* X axis */}
              <line x1={padL} x2={chartW-10} y1={chartH-padB} y2={chartH-padB} stroke={t.rule} strokeWidth="1" />
            </svg>
          </div>
          {/* Mastery + study time */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: t.panel, border: `1px solid ${t.rule}`, borderRadius: 12, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: 1 }}>Flashcard Mastery</div>
                <span style={{ fontSize: 13, fontWeight: 700, color: t.ink }}>{masteryPct}%</span>
              </div>
              <div style={{ height: 10, background: t.rule, borderRadius: 5, marginBottom: 8 }}>
                <div style={{ width: `${masteryPct}%`, height: "100%", background: t.accent, borderRadius: 5, transition: "width 0.5s" }} />
              </div>
              <div style={{ fontSize: 11, color: t.muted }}>24 of 35 cards with interval &gt; 21 days</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 16 }}>
                {[["New","5","#3b82f6"],["Learning","6","#f59e0b"],["Mastered","24","#22c55e"]].map(([l,v,c]) => (
                  <div key={l} style={{ textAlign: "center", padding: "8px 0", background: t.bg, borderRadius: 8, border: `1px solid ${t.rule}` }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: c }}>{v}</div>
                    <div style={{ fontSize: 10, color: t.muted }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ background: t.panel, border: `1px solid ${t.rule}`, borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: t.muted, textTransform: "uppercase", letterSpacing: 1, marginBottom: 14 }}>Study Time</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: t.ink }}>4</span>
                <span style={{ fontSize: 16, color: t.muted }}>h</span>
                <span style={{ fontSize: 32, fontWeight: 800, color: t.ink }}>35</span>
                <span style={{ fontSize: 16, color: t.muted }}>m</span>
                <span style={{ fontSize: 11, color: t.muted, marginLeft: 6 }}>this course</span>
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 48 }}>
                {[40,30,65,55,80,72,90].map((h, i) => (
                  <div key={i} style={{ flex: 1, background: i === 6 ? t.accent : t.accentSoft, borderRadius: "3px 3px 0 0", height: `${h}%`, minHeight: 4 }} />
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 9, color: t.muted }}>
                {["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map(d => <span key={d}>{d}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Study Rooms — Active Session (live video room)
// ─────────────────────────────────────────────────────────────
export const Rooms4Active: React.FC<{ t: Theme }> = ({ t }) => {
  const participants = [
    { init:"J", name:"You (Host)",   muted:false, cam:true,  speaking:true  },
    { init:"L", name:"Layla A.",     muted:false, cam:true,  speaking:false },
    { init:"K", name:"Karim H.",     muted:true,  cam:true,  speaking:false },
    { init:"R", name:"Reem S.",      muted:false, cam:false, speaking:false },
    { init:"Y", name:"Yusuf B.",     muted:true,  cam:true,  speaking:false },
    { init:"A", name:"Ahmad M.",     muted:false, cam:false, speaking:false },
  ];
  const messages = [
    { init:"L", name:"Layla A.",  text:"Can we go back to slide 4?",                        time:"9:14" },
    { init:"J", name:"You",       text:"Sure, let me pull it up.",                           time:"9:14" },
    { init:"K", name:"Karim H.",  text:"Nash equilibrium is the key concept here I think",  time:"9:15" },
    { init:"R", name:"Reem S.",   text:"Agree — and it ties into the prisoner's dilemma",   time:"9:15" },
    { init:"L", name:"Layla A.",  text:"Can someone explain the dominant strategy part again?", time:"9:16" },
  ];
  const MicOffIc = (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>;
  const CamOffIc = (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 16v1a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2m5.66 0H14a2 2 0 0 1 2 2v3.34"/><path d="M23 7l-7 5 7 5V7z"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
  const ScreenIc  = (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>;
  const ChatIc    = (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>;
  const UsersIc   = (c) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
  const bgPal = ["#2A3E4A","#3A3020","#1C3555","#2E4228","#4A2830","#1A2A48"];
  return (
    <ViewShell4 t={t} title="Linear Algebra Q&A — Live Session" activeTab="session" tabs={[{k:"session",l:"Session"},{k:"whiteboard",l:"Whiteboard"},{k:"files",l:"Files"}]}>
      <div style={{ display:"flex", height:"100%", background:"#111", overflow:"hidden" }}>
        {/* Video grid */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", overflow:"hidden" }}>
          {/* Top bar */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 18px", background:"#1a1a1a", borderBottom:"1px solid #ffffff14", flexShrink:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:7, height:7, borderRadius:999, background:t.accent }} />
                <span style={{ fontSize:10, letterSpacing:1.5, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>Live</span>
              </div>
              <div style={{ width:1, height:14, background:"#ffffff18" }} />
              <span style={{ ...Sf4, fontSize:13, color:"#fff", fontWeight:600 }}>Linear Algebra Q&A</span>
              <span style={{ fontSize:11, color:"#ffffff55" }}>Math 110 · hosted by You</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <span style={{ ...Sf4, fontSize:13, color:t.accent, fontWeight:700 }}>41:23</span>
              <span style={{ fontSize:10, color:"#ffffff44" }}>session time</span>
              <button style={{ padding:"5px 12px", background:"transparent", border:"1px solid #ffffff22", color:"#ffffff88", fontSize:11, cursor:"pointer" }}>Invite +</button>
            </div>
          </div>
          {/* Tiles */}
          <div style={{ flex:1, display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:2, padding:2, background:"#0d0d0d" }}>
            {participants.map((p, i) => (
              <div key={i} style={{ position:"relative", background:bgPal[i], borderRadius:4, overflow:"hidden", border:p.speaking?`2px solid ${t.accent}`:"2px solid transparent", minHeight:160, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                {!p.cam && (
                  <div style={{ width:60, height:60, borderRadius:999, background:"#ffffff15", display:"grid", placeItems:"center", ...Sf4, fontSize:24, fontWeight:700, color:"#fff" }}>{p.init}</div>
                )}
                {p.cam && (
                  <div style={{ position:"absolute", inset:0, background:`linear-gradient(135deg, ${bgPal[i]} 0%, ${bgPal[(i+2)%6]} 100%)`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ ...Sf4, fontSize:28, fontWeight:700, color:"rgba(255,255,255,0.15)" }}>{p.init}</div>
                  </div>
                )}
                <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"6px 10px", background:"linear-gradient(transparent, rgba(0,0,0,0.7))", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ fontSize:11, fontWeight:600, color:"#fff" }}>{p.name}</span>
                  <div style={{ display:"flex", gap:5 }}>
                    {p.muted && <span style={{ opacity:0.8 }}>{MicOffIc("#ef4444")}</span>}
                    {!p.cam  && <span style={{ opacity:0.8 }}>{CamOffIc("#6b7280")}</span>}
                  </div>
                </div>
                {p.speaking && (
                  <div style={{ position:"absolute", top:8, right:8, display:"flex", gap:2, alignItems:"flex-end", height:16 }}>
                    {[8,14,10,16,6].map((h,j) => <div key={j} style={{ width:3, height:h, background:t.accent, borderRadius:2, opacity:0.9 }} />)}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Controls bar */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px 24px", background:"#1a1a1a", borderTop:"1px solid #ffffff14", flexShrink:0 }}>
            {[
              { label:"Mute",    active:false, icon:(c)=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg> },
              { label:"Camera",  active:false, icon:(c)=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg> },
              { label:"Screen",  active:false, icon:(c)=>ScreenIc(c) },
              { label:"Chat",    active:true,  icon:(c)=>ChatIc(c) },
              { label:"People",  active:false, icon:(c)=>UsersIc(c) },
            ].map((btn, i) => (
              <button key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"8px 16px", background:btn.active?"#ffffff18":"transparent", border:"none", borderRadius:6, cursor:"pointer" }}>
                {btn.icon(btn.active ? t.accent : "#ffffff88")}
                <span style={{ fontSize:9, letterSpacing:1, color:btn.active?t.accent:"#ffffff55", textTransform:"uppercase" }}>{btn.label}</span>
              </button>
            ))}
            <div style={{ width:1, height:32, background:"#ffffff18", margin:"0 8px" }} />
            <button style={{ padding:"8px 20px", background:"#dc2626", border:"none", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", borderRadius:6 }}>Leave</button>
          </div>
        </div>
        {/* Right — Chat panel */}
        <div style={{ width:300, background:"#1a1a1a", borderLeft:"1px solid #ffffff10", display:"flex", flexDirection:"column" }}>
          {/* Panel tabs */}
          <div style={{ display:"flex", borderBottom:"1px solid #ffffff10" }}>
            {["Chat","Participants"].map((tab, i) => (
              <button key={i} style={{ flex:1, padding:"10px 0", background:"transparent", border:"none", borderBottom:i===0?`2px solid ${t.accent}`:"2px solid transparent", color:i===0?t.accent:"#ffffff44", fontSize:11, fontWeight:600, cursor:"pointer", letterSpacing:1, textTransform:"uppercase" }}>{tab}</button>
            ))}
          </div>
          {/* Messages */}
          <div style={{ flex:1, overflowY:"auto", padding:"14px 14px", display:"flex", flexDirection:"column", gap:12 }}>
            {messages.map((m, i) => {
              const isMe = m.name === "You";
              return (
                <div key={i} style={{ display:"flex", gap:8, flexDirection:isMe?"row-reverse":"row" }}>
                  <div style={{ width:26, height:26, borderRadius:999, background:isMe?t.accent:"#ffffff22", display:"grid", placeItems:"center", fontSize:10, fontWeight:700, color:isMe?"#000":"#fff", flexShrink:0 }}>{m.init}</div>
                  <div style={{ maxWidth:"78%" }}>
                    {!isMe && <div style={{ fontSize:9, color:"#ffffff44", marginBottom:3, letterSpacing:0.5 }}>{m.name} · {m.time}</div>}
                    <div style={{ background:isMe?t.accent:"#ffffff14", color:isMe?"#000":"#ffffff99", fontSize:12, padding:"7px 10px", borderRadius:isMe?"10px 10px 2px 10px":"10px 10px 10px 2px", lineHeight:1.5 }}>{m.text}</div>
                    {isMe && <div style={{ fontSize:9, color:"#ffffff33", marginTop:3, textAlign:"right" }}>{m.time}</div>}
                  </div>
                </div>
              );
            })}
          </div>
          {/* Input */}
          <div style={{ padding:"10px 12px", borderTop:"1px solid #ffffff10", display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ flex:1, background:"#ffffff0f", border:"1px solid #ffffff14", padding:"8px 12px", fontSize:12, color:"#ffffff55", borderRadius:6 }}>Message the room…</div>
            <button style={{ padding:"7px 12px", background:t.accent, border:"none", color:"#000", fontSize:11, fontWeight:700, cursor:"pointer", borderRadius:6 }}>→</button>
          </div>
        </div>
      </div>
    </ViewShell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Profile — comprehensive profile page (subscription + achievements + settings + stats)
// ─────────────────────────────────────────────────────────────
export const Profile4: React.FC<{ t: Theme }> = ({ t }) => {
  const themes = [
    { k:"navy_gold",         label:"Navy Gold",          bg:"#F5F0E8", ui:"#C9A85C", isDefault:true  },
    { k:"oxblood_cream",     label:"Oxblood Cream",      bg:"#F7EDE6", ui:"#C47A7A", isDefault:false },
    { k:"forest_parchment",  label:"Forest Parchment",   bg:"#EDF0EB", ui:"#7A9B7A", isDefault:false },
    { k:"ink_blush",         label:"Ink Blush",          bg:"#F5EEF2", ui:"#E8A0B4", isDefault:false },
    { k:"copper_charcoal",   label:"Copper Charcoal",    bg:"#F0EDE8", ui:"#D4956A", isDefault:false },
    { k:"monochrome",        label:"Monochrome",         bg:"#F4F4F4", ui:"#9E9E9E", isDefault:false },
  ];
  const achievements = [
    { icon:"◆", label:"First Upload",      tier:"BRONZE",   xp:50,  earned:true,  date:"Mar 12" },
    { icon:"▲", label:"Flashcard Factory", tier:"SILVER",   xp:100, earned:true,  date:"Mar 29" },
    { icon:"◈", label:"Top Scholar",       tier:"GOLD",     xp:250, earned:true,  date:"Apr 5",  rare:true },
    { icon:"●", label:"Speed Reader",      tier:"BRONZE",   xp:50,  earned:true,  date:"Apr 18" },
    { icon:"◉", label:"14-Day Streak",     tier:"SILVER",   xp:100, earned:true,  date:"May 6" },
    { icon:"★", label:"Brain Rush Pro",    tier:"PLATINUM", xp:300, earned:true,  date:"Apr 30", rare:true },
    { icon:"◇", label:"Room Host",         tier:"SILVER",   xp:100, earned:false, req:"Host 7 more rooms" },
    { icon:"△", label:"Perfect Exam",      tier:"GOLD",     xp:250, earned:false, req:"Score 100% on any exam" },
  ];
  const tierColor = { BRONZE:"#CD7F32", SILVER:"#9E9E9E", GOLD:"#C9A85C", PLATINUM:"#4FC3F7", DIAMOND:"#CE93D8" };
  const stats = [
    { label:"Current Streak", value:"14", sub:"Best: 23 days" },
    { label:"Items Published", value:"24", sub:null },
    { label:"Flashcards Studied", value:"1,284", sub:null },
    { label:"Quizzes Completed", value:"38", sub:null },
    { label:"Total Study Time", value:"47h 22m", sub:null },
  ];
  const credits = [
    { label:"Tools & Services", used:3000, total:1500, refresh:"5/26/2026" },
    { label:"Study Room (Zego)", used:120, total:300, refresh:"5/26/2026" },
    { label:"AI Assistant", used:45, total:100, refresh:"5/26/2026" },
  ];

  const Section = ({ title }) => (
    <div style={{ display:"flex", alignItems:"center", gap:12, margin:"24px 0 14px" }}>
      <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>{title}</div>
      <div style={{ flex:1, height:1, background:t.rule }} />
    </div>
  );

  return (
    <Shell4 t={t} active="dash">

      {/* ── Subscription Status ────────────────────────────────── */}
      <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderTop:`3px solid ${t.accent}`, padding:"16px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          <div>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:4 }}>Subscription Status</div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ ...Sf4, fontSize:17, fontWeight:600, color:t.ink }}>Standard Plan</span>
              <span style={{ fontSize:10, background:t.accentSoft, color:t.accent, padding:"2px 8px", fontWeight:700, letterSpacing:1 }}>ACTIVE</span>
            </div>
          </div>
          <div style={{ width:1, height:30, background:t.rule }} />
          <div style={{ fontSize:12, color:t.muted }}>Expires on <span style={{ color:t.body, fontWeight:600 }}>5/26/2026</span></div>
        </div>
        <button style={{ padding:"8px 18px", background:t.ink, border:"none", color:t.bg, fontSize:12, fontWeight:700, cursor:"pointer" }}>Manage Subscription</button>
      </div>

      {/* ── Credits ────────────────────────────────────────────── */}
      <div style={{ background:t.panel2, border:`1px solid ${t.rule}`, padding:"14px 20px", marginBottom:4 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ fontSize:9, letterSpacing:2, color:t.muted, fontWeight:700, textTransform:"uppercase" }}>Credits</div>
          <div style={{ fontSize:10, color:t.muted }}>Tools & services balance · resets on renewal</div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {credits.map((c, i) => {
            const pct = Math.min((c.used / c.total) * 100, 100);
            const over = c.used > c.total;
            return (
              <div key={i}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:12.5, color:t.body, fontWeight:500 }}>{c.label}</span>
                  <span style={{ ...Sf4, fontSize:13, fontWeight:700, color:over?"#dc2626":t.ink }}>{c.used.toLocaleString()} <span style={{ fontWeight:400, color:t.muted, fontSize:11 }}>/ {c.total.toLocaleString()}</span></span>
                </div>
                <div style={{ height:5, background:t.panel, borderRadius:3 }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:over?"#dc2626":t.accent, borderRadius:3 }} />
                </div>
                <div style={{ fontSize:9.5, color:t.muted, marginTop:3 }}>Credits refresh on {c.refresh}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Settings ───────────────────────────────────────────── */}
      <div style={{ background:t.panel, border:`1px solid ${t.rule}`, padding:"16px 20px", marginBottom:4 }}>
        <div style={{ fontSize:9, letterSpacing:2, color:t.muted, fontWeight:700, textTransform:"uppercase", marginBottom:14 }}>Settings</div>

        {/* Sidebar Behavior */}
        <div style={{ marginBottom:18 }}>
          <div style={{ fontSize:13, fontWeight:600, color:t.ink, marginBottom:4 }}>Sidebar Behavior</div>
          <div style={{ fontSize:11.5, color:t.muted, marginBottom:10 }}>Choose how you want the sidebar to behave on desktop</div>
          {[
            { k:"auto", label:"Auto-collapse Sidebar (Default)", desc:"The sidebar automatically shows when you move your mouse near the left edge and hides when you move away. Perfect for maximizing screen space." },
            { k:"pin",  label:"Pin/Unpin Sidebar",               desc:"Manually control the sidebar with a pin button. Click to pin it open or unpin to collapse it." },
          ].map((opt, i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 14px", border:`1px solid ${i===0?t.accent:t.rule}`, borderRadius:6, marginBottom:8, background:i===0?t.accentSoft:"transparent" }}>
              <div style={{ width:14, height:14, borderRadius:999, border:`2px solid ${i===0?t.accent:t.rule}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1 }}>
                {i===0 && <div style={{ width:6, height:6, borderRadius:999, background:t.accent }} />}
              </div>
              <div>
                <div style={{ fontSize:12.5, fontWeight:i===0?600:400, color:t.ink, marginBottom:2 }}>{opt.label}</div>
                {i===0 && <div style={{ fontSize:11, color:t.muted, lineHeight:1.5 }}>{opt.desc}</div>}
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Voice */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, paddingBottom:18, borderBottom:`1px solid ${t.rule}` }}>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:t.ink, marginBottom:2 }}>Navigation Voice</div>
            <div style={{ fontSize:11.5, color:t.muted }}>Speak the name of navigation items when you hover over them</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:40, height:22, background:`${t.accent}33`, borderRadius:999, padding:3 }}>
              <div style={{ width:16, height:16, background:t.bg, borderRadius:999, marginLeft:0 }} />
            </div>
            <span style={{ fontSize:11.5, color:t.muted }}>Disabled</span>
          </div>
        </div>

        {/* Color Theme */}
        <div>
          <div style={{ fontSize:13, fontWeight:600, color:t.ink, marginBottom:4 }}>Color theme</div>
          <div style={{ fontSize:11.5, color:t.muted, marginBottom:12 }}>Choose your preferred color scheme for the application.</div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10 }}>
            {themes.map((th, i) => (
              <div key={i} style={{ border:`2px solid ${i===0?t.ink:t.rule}`, borderRadius:8, padding:"10px 10px 8px", position:"relative", cursor:"pointer", background:i===0?t.panel2:"transparent" }}>
                {i===0 && (
                  <div style={{ position:"absolute", top:6, right:6, width:18, height:18, borderRadius:999, background:t.ink, display:"grid", placeItems:"center" }}>
                    <span style={{ fontSize:9, color:t.bg, fontWeight:700 }}>✓</span>
                  </div>
                )}
                <div style={{ background:th.bg, borderRadius:4, padding:"8px 8px 6px", marginBottom:6 }}>
                  <div style={{ fontSize:9, color:"#888", textAlign:"center", marginBottom:4 }}>Background</div>
                  <div style={{ background:th.ui, borderRadius:3, padding:"4px 0", textAlign:"center" }}>
                    <span style={{ fontSize:9, color:"#fff", fontWeight:600 }}>UI Elements</span>
                  </div>
                </div>
                <div style={{ fontSize:10.5, fontWeight:i===0?600:400, color:t.ink, textAlign:"center" }}>{th.label}</div>
                {th.isDefault && <div style={{ fontSize:9, color:t.accent, textAlign:"center", marginTop:1 }}>Default</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Profile Header ─────────────────────────────────────── */}
      <div style={{ background:t.panel, border:`1px solid ${t.rule}`, padding:"18px 20px", marginBottom:4 }}>
        <div style={{ display:"flex", alignItems:"center", gap:18 }}>
          <div style={{ position:"relative", flexShrink:0 }}>
            <div style={{ width:64, height:64, borderRadius:999, background:t.accent, display:"grid", placeItems:"center", ...Sf4, fontSize:24, fontWeight:700, color:t.ink }}>A</div>
            <div style={{ position:"absolute", bottom:-4, left:-4, background:t.ink, color:t.bg, fontSize:8, fontWeight:700, padding:"2px 6px", borderRadius:4 }}>Lv 1</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:2 }}>
              <span style={{ ...Sf4, fontSize:18, fontWeight:600, color:t.ink }}>ayyash@ayyash.com</span>
              <button style={{ padding:"1px 8px", background:"transparent", border:`1px solid ${t.rule}`, color:t.muted, fontSize:10, cursor:"pointer" }}>Edit ✎</button>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:10 }}>
              <span style={{ fontSize:11, color:t.muted }}>#</span>
              <span style={{ fontSize:11, color:t.muted, fontFamily:"monospace" }}>u124d</span>
              <span style={{ fontSize:9, color:t.muted }}>(Your Permanent ID)</span>
              <span style={{ fontSize:10, color:t.accent, cursor:"pointer" }}>⧉</span>
            </div>
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                <span style={{ fontSize:11, color:t.muted }}>Level 1</span>
                <span style={{ fontSize:11, color:t.muted }}>33 / 100 XP</span>
              </div>
              <div style={{ height:6, background:t.panel2, borderRadius:3 }}>
                <div style={{ height:"100%", width:"33%", background:t.accent, borderRadius:3 }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────────── */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5, 1fr)", gap:8, marginBottom:4 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background:t.panel, border:`1px solid ${t.rule}`, padding:"14px 14px 12px", display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:11, color:t.muted, marginBottom:6 }}>{s.label}</div>
              <div style={{ ...Sf4, fontSize:22, fontWeight:700, color:t.ink, lineHeight:1 }}>{s.value}</div>
              {s.sub && <div style={{ fontSize:10, color:t.muted, marginTop:4 }}>{s.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Recent Achievements ────────────────────────────────── */}
      <div style={{ background:t.panel, border:`1px solid ${t.rule}`, padding:"16px 20px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>Recent Achievements ({achievements.filter(a=>a.earned).length})</div>
          <button style={{ padding:"3px 10px", background:"transparent", border:`1px solid ${t.rule}`, color:t.muted, fontSize:10, cursor:"pointer" }}>View all →</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10 }}>
          {achievements.map((a, i) => (
            <div key={i} style={{ border:`1px solid ${a.earned?tierColor[a.tier]+"44":t.rule}`, borderTop:`2px solid ${a.earned?tierColor[a.tier]:t.rule}`, padding:"12px 10px 10px", textAlign:"center", background:a.earned?t.panel2:t.panel, opacity:a.earned?1:0.45, position:"relative" }}>
              {a.rare && a.earned && <div style={{ position:"absolute", top:4, right:4, fontSize:7, letterSpacing:1, color:t.accent, fontWeight:700, textTransform:"uppercase", background:t.accentSoft, padding:"1px 4px" }}>Rare</div>}
              <div style={{ fontSize:22, marginBottom:6, color:a.earned?tierColor[a.tier]:t.muted }}>{a.icon}</div>
              <div style={{ ...Sf4, fontSize:11, fontWeight:600, color:t.ink, marginBottom:3, lineHeight:1.3 }}>{a.label}</div>
              <div style={{ fontSize:8, letterSpacing:1, color:tierColor[a.tier], fontWeight:700, marginBottom:4 }}>{a.tier}</div>
              {a.earned
                ? <div style={{ fontSize:9, color:t.muted }}>Earned {a.date} · +{a.xp} XP</div>
                : <div style={{ fontSize:9, color:t.muted, fontStyle:"italic" }}>{a.req}</div>
              }
            </div>
          ))}
        </div>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Goals — study targets and weekly focus
// ─────────────────────────────────────────────────────────────
export const Goals4: React.FC<{ t: Theme }> = ({ t }) => {
  const goals = [
    { title:"Study 12 hours this week",        prog:8,   target:12, unit:"h",   status:"on_track", due:"May 11"  },
    { title:"Review 60 flashcards",            prog:45,  target:60, unit:"",    status:"on_track", due:"May 11"  },
    { title:"Complete 3 exams",                prog:2,   target:3,  unit:"",    status:"on_track", due:"May 11"  },
    { title:"Score 90%+ on Microeconomics",    prog:78,  target:90, unit:"%",   status:"behind",   due:"May 14"  },
    { title:"Finish Anatomy flashcard deck",   prog:32,  target:32, unit:"",    status:"complete", due:"May 9"   },
    { title:"Host 2 study rooms",              prog:1,   target:2,  unit:"",    status:"on_track", due:"May 15"  },
  ];
  const completed = [
    { title:"7-day streak",    date:"May 6" },
    { title:"Anatomy summary", date:"May 3" },
    { title:"10 exams total",  date:"Apr 29" },
  ];
  const statusColor = { on_track:t.accent, behind:"#dc2626", complete:t.accent };
  const statusLabel = { on_track:"On track", behind:"Behind", complete:"Complete" };
  const CircleRing = ({ value, max, label, unit }) => {
    const pct = Math.min(value / max, 1);
    const r = 36, circ = 2 * Math.PI * r;
    return (
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
        <div style={{ position:"relative", width:90, height:90 }}>
          <svg width="90" height="90" style={{ transform:"rotate(-90deg)" }}>
            <circle cx="45" cy="45" r={r} fill="none" stroke={`${t.bg}15`} strokeWidth="6" />
            <circle cx="45" cy="45" r={r} fill="none" stroke={t.accent} strokeWidth="6"
              strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round" />
          </svg>
          <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
            <div style={{ ...Sf4, fontSize:20, fontWeight:700, color:t.bg, lineHeight:1 }}>{value}<span style={{ fontSize:11 }}>{unit}</span></div>
            <div style={{ fontSize:8, color:`${t.bg}55`, letterSpacing:0.5, marginTop:2 }}>/ {max}{unit}</div>
          </div>
        </div>
        <div style={{ fontSize:10, color:`${t.bg}66`, textAlign:"center", lineHeight:1.4 }}>{label}</div>
      </div>
    );
  };
  return (
    <Shell4 t={t} active="dash">
      <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>Study Goals</div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:0 }}>
        <h1 style={{ ...Sf4, fontSize:38, fontWeight:600, color:t.ink, margin:"6px 0 4px", letterSpacing:-0.8 }}>This Week's Targets.</h1>
        <button style={{ padding:"7px 16px", background:t.ink, border:"none", color:t.bg, fontSize:12, fontWeight:600, cursor:"pointer" }}>+ Add Goal</button>
      </div>
      <div style={{ height:1, background:t.ink, marginTop:12, marginBottom:22, opacity:0.8 }} />

      {/* Ink strip — 3 progress rings */}
      <div style={{ background:t.ink, padding:"22px 32px", marginBottom:24, display:"flex", justifyContent:"space-around", alignItems:"center" }}>
        <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", writingMode:"vertical-rl", transform:"rotate(180deg)" }}>Week of May 5</div>
        <CircleRing value={8}  max={12} label="Study Hours"      unit="h" />
        <CircleRing value={45} max={60} label="Cards Reviewed"   unit="" />
        <CircleRing value={2}  max={3}  label="Exams Completed"  unit="" />
        <div style={{ textAlign:"right" }}>
          <div style={{ ...Sf4, fontSize:11, color:t.accent, marginBottom:6 }}>STREAK</div>
          <div style={{ ...Sf4, fontSize:42, fontWeight:700, color:t.bg, lineHeight:1 }}>14</div>
          <div style={{ fontSize:10, color:`${t.bg}55`, marginTop:2 }}>days in a row</div>
        </div>
      </div>

      {/* Two-column: goal cards + right rail */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 240px", gap:22 }}>
        {/* Goal cards */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
          {goals.map((g, i) => {
            const pct = g.status === "complete" ? 100 : Math.round((g.prog / g.target) * 100);
            return (
              <div key={i} style={{ background:t.panel, border:`1px solid ${t.rule}`, borderLeft:`3px solid ${statusColor[g.status]}`, padding:"14px 16px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div style={{ ...Sf4, fontSize:13, fontWeight:600, color:t.ink, lineHeight:1.35, flex:1, paddingRight:8 }}>{g.title}</div>
                  <span style={{ fontSize:8, letterSpacing:1.5, fontWeight:700, textTransform:"uppercase", color:statusColor[g.status], background:`${statusColor[g.status]}15`, padding:"2px 7px", flexShrink:0 }}>{statusLabel[g.status]}</span>
                </div>
                <div style={{ height:4, background:t.panel2, borderRadius:2, marginBottom:8 }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:statusColor[g.status], borderRadius:2 }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline" }}>
                  <span style={{ fontSize:10, color:t.muted }}>Due {g.due}</span>
                  <span style={{ ...Sf4, fontSize:12, fontWeight:600, color:t.ink }}>
                    {g.status==="complete" ? "✓ Done" : `${g.prog} / ${g.target}${g.unit}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        {/* Right rail */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:t.panel2, border:`1px solid ${t.rule}`, borderTop:`3px solid ${t.accent}`, padding:"16px 16px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.muted, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>Completed This Month</div>
            {completed.map((c,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:i<completed.length-1?`1px solid ${t.rule}`:"none", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                  <div style={{ width:14, height:14, borderRadius:999, background:t.accentSoft, border:`1px solid ${t.accent}`, display:"grid", placeItems:"center", fontSize:8, color:t.accent }}>✓</div>
                  <span style={{ fontSize:11.5, color:t.body }}>{c.title}</span>
                </div>
                <span style={{ fontSize:10, color:t.muted }}>{c.date}</span>
              </div>
            ))}
          </div>
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, padding:"16px 16px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Goal Types</div>
            {[["Exam scores","2"],["Study time","1"],["Flashcards","1"],["Rooms","1"],["Streaks","1"]].map(([l,v],i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0" }}>
                <span style={{ fontSize:11.5, color:t.muted }}>{l}</span>
                <span style={{ ...Sf4, fontSize:13, fontWeight:600, color:t.ink }}>{v}</span>
              </div>
            ))}
          </div>
          <button style={{ padding:"11px 0", background:"transparent", border:`1px dashed ${t.rule}`, color:t.muted, fontSize:12, cursor:"pointer", textAlign:"center" }}>+ Add a new goal</button>
        </div>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Achievements — badge gallery with levels and XP
// ─────────────────────────────────────────────────────────────
export const Achievements4: React.FC<{ t: Theme }> = ({ t }) => {
  const badges = [
    { icon:"◆", label:"First Upload",       cat:"library", desc:"Processed your first document",     date:"Mar 12",  rare:false, earned:true  },
    { icon:"▲", label:"Flashcard Factory",  cat:"library", desc:"Generated 100+ flashcards total",  date:"Mar 29",  rare:false, earned:true  },
    { icon:"◈", label:"Top Scholar",        cat:"exams",   desc:"Top 5% in monthly exam scores",    date:"Apr 5",   rare:true,  earned:true  },
    { icon:"●", label:"Speed Reader",       cat:"library", desc:"Processed 10 documents",           date:"Apr 18",  rare:false, earned:true  },
    { icon:"◉", label:"14-Day Streak",      cat:"streak",  desc:"Studied 14 days in a row",         date:"May 6",   rare:false, earned:true  },
    { icon:"★", label:"Brain Rush Pro",     cat:"eduplay", desc:"50 ranked online wins",            date:"Apr 30",  rare:true,  earned:true  },
    { icon:"◇", label:"Room Host",          cat:"rooms",   desc:"Hosted 10+ study sessions",        date:null,      rare:false, earned:false, req:"Host 7 more rooms" },
    { icon:"△", label:"Perfect Exam",       cat:"exams",   desc:"Score 100% on any exam",           date:null,      rare:true,  earned:false, req:"0 wrong answers in one sitting" },
    { icon:"○", label:"30-Day Streak",      cat:"streak",  desc:"Studied 30 days in a row",         date:null,      rare:true,  earned:false, req:"16 more days" },
    { icon:"□", label:"Community Pillar",   cat:"rooms",   desc:"Join 50 different study rooms",    date:null,      rare:false, earned:false, req:"Join 37 more rooms" },
    { icon:"✦", label:"Grand Scholar",      cat:"exams",   desc:"90%+ average across 20 exams",     date:null,      rare:true,  earned:false, req:"11 more exams at 90%+" },
    { icon:"⬟", label:"Deck Master",        cat:"library", desc:"Review 500 flashcards in one week",date:null,      rare:false, earned:false, req:"455 more this week" },
  ];
  const [filter, setFilter] = React.useState("all");
  const cats = ["all","library","exams","eduplay","rooms","streak"];
  const shown = filter === "all" ? badges : badges.filter(b => b.cat === filter);
  const earned = badges.filter(b => b.earned).length;
  const xp = earned * 150 + badges.filter(b=>b.rare&&b.earned).length * 100;
  return (
    <Shell4 t={t} active="dash">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>Achievements</div>
          <h1 style={{ ...Sf4, fontSize:38, fontWeight:600, color:t.ink, margin:"6px 0 4px", letterSpacing:-0.8 }}>Your Badges.</h1>
          <p style={{ fontSize:13, color:t.muted, margin:0 }}>{earned} earned · {badges.length - earned} locked</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <div style={{ fontSize:9, letterSpacing:2, color:t.muted, fontWeight:700, textTransform:"uppercase", marginBottom:5 }}>Scholar — Level 4</div>
          <div style={{ width:200, height:5, background:t.panel2, borderRadius:2, marginBottom:5 }}>
            <div style={{ width:"68%", height:"100%", background:t.accent, borderRadius:2 }} />
          </div>
          <div style={{ ...Sf4, fontSize:11, color:t.muted }}>{xp} XP · 680 to Level 5</div>
        </div>
      </div>
      <div style={{ height:1, background:t.ink, marginTop:14, marginBottom:18, opacity:0.8 }} />

      {/* Two-column */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 240px", gap:24 }}>
        <div>
          {/* Category filter */}
          <div style={{ display:"flex", gap:0, marginBottom:18, borderBottom:`1px solid ${t.rule}` }}>
            {cats.map(c => {
              const on = filter === c;
              return (
                <button key={c} onClick={() => setFilter(c)} style={{ background:"transparent", border:"none", borderBottom:on?`2px solid ${t.accent}`:"2px solid transparent", padding:"4px 14px 8px", cursor:"pointer", color:on?t.ink:t.muted, fontSize:12, fontWeight:on?600:400, textTransform:"capitalize", marginBottom:-1 }}>{c}</button>
              );
            })}
          </div>
          {/* Badge grid */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4, 1fr)", gap:10 }}>
            {shown.map((b, i) => (
              <div key={i} style={{ background:b.earned?t.panel:t.panel2, border:`1px solid ${b.earned?t.rule:t.panel2}`, padding:"14px 12px", textAlign:"center", opacity:b.earned?1:0.45, position:"relative" }}>
                {b.rare && b.earned && (
                  <div style={{ position:"absolute", top:6, right:6, fontSize:7, letterSpacing:1.5, color:t.accent, fontWeight:700, textTransform:"uppercase", background:t.accentSoft, padding:"1px 5px" }}>Rare</div>
                )}
                <div style={{ fontSize:26, marginBottom:8, color:b.earned?t.ink:t.muted }}>{b.icon}</div>
                <div style={{ ...Sf4, fontSize:11, fontWeight:600, color:b.earned?t.ink:t.muted, marginBottom:4, lineHeight:1.3 }}>{b.label}</div>
                <div style={{ fontSize:9.5, color:t.muted, lineHeight:1.4, marginBottom:b.earned?6:8 }}>{b.desc}</div>
                {b.earned
                  ? <div style={{ fontSize:9, color:t.accent, fontWeight:600 }}>Earned {b.date}</div>
                  : <div style={{ fontSize:9, color:t.muted, fontStyle:"italic" }}>{b.req}</div>
                }
              </div>
            ))}
          </div>
        </div>
        {/* Right rail */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* XP total */}
          <div style={{ background:t.ink, padding:"20px 18px", textAlign:"center" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>Total XP</div>
            <div style={{ ...Sf4, fontSize:46, fontWeight:700, color:t.bg, lineHeight:1 }}>{xp}</div>
            <div style={{ fontSize:10, color:`${t.bg}44`, marginTop:6 }}>Scholar · Level 4</div>
            <div style={{ height:3, background:`${t.bg}18`, borderRadius:2, margin:"12px 0 4px" }}>
              <div style={{ width:"68%", height:"100%", background:t.accent, borderRadius:2 }} />
            </div>
            <div style={{ fontSize:9, color:`${t.bg}44` }}>68% to Level 5</div>
          </div>
          {/* Rarest badge */}
          <div style={{ background:t.panel2, border:`1px solid ${t.rule}`, borderTop:`3px solid ${t.accent}`, padding:"16px 16px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Rarest Earned</div>
            {badges.filter(b=>b.rare&&b.earned).map((b,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:i<badges.filter(b=>b.rare&&b.earned).length-1?`1px solid ${t.rule}`:"none" }}>
                <div style={{ width:32, height:32, background:t.accentSoft, border:`1px solid ${t.accent}44`, display:"grid", placeItems:"center", fontSize:14, flexShrink:0 }}>{b.icon}</div>
                <div>
                  <div style={{ fontSize:11.5, fontWeight:600, color:t.ink }}>{b.label}</div>
                  <div style={{ fontSize:9, color:t.muted, marginTop:1 }}>{b.date}</div>
                </div>
              </div>
            ))}
          </div>
          {/* Stats */}
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, padding:"14px 16px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.muted, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>By Category</div>
            {cats.filter(c=>c!=="all").map(c => {
              const total = badges.filter(b=>b.cat===c).length;
              const got   = badges.filter(b=>b.cat===c&&b.earned).length;
              return (
                <div key={c} style={{ display:"flex", justifyContent:"space-between", padding:"5px 0" }}>
                  <span style={{ fontSize:11.5, color:t.muted, textTransform:"capitalize" }}>{c}</span>
                  <span style={{ ...Sf4, fontSize:12, fontWeight:600, color:t.ink }}>{got}/{total}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Subscription — plan management and upgrade
// ─────────────────────────────────────────────────────────────
export const Subscription4: React.FC<{ t: Theme }> = ({ t }) => {
  const plans = [
    {
      k:"free", label:"Free", price:"$0", per:"forever",
      credits:50, volumes:5, desc:"For casual learners just getting started.",
      features:["5 documents / month","50 credits","Flashcards only","No EduPlay ranked","Community rooms"],
    },
    {
      k:"scholar", label:"Scholar", price:"$9", per:"/ month",
      credits:400, volumes:25, desc:"For serious students who study daily.",
      features:["25 documents / month","400 credits","All output types","EduPlay ranked play","Priority processing","History & analytics"],
      current:true,
    },
    {
      k:"pro", label:"Scholar Pro", price:"$19", per:"/ month",
      credits:null, volumes:null, desc:"Unlimited everything — for power users.",
      features:["Unlimited documents","Unlimited credits","All output types","Team study rooms","API access","Dedicated support","Early feature access"],
    },
  ];
  const features = [
    ["Documents / month",   "5",    "25",       "Unlimited"],
    ["Credits",             "50",   "400",       "Unlimited"],
    ["Flashcards",          "✓",    "✓",         "✓"],
    ["Summaries",           "✓",    "✓",         "✓"],
    ["Mind maps",           "✗",    "✓",         "✓"],
    ["Examinations",        "✗",    "✓",         "✓"],
    ["EduPlay ranked",      "✗",    "✓",         "✓"],
    ["AI Tutor",            "✗",    "✗",         "✓"],
    ["API access",          "✗",    "✗",         "✓"],
  ];
  return (
    <Shell4 t={t} active="dash">
      <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>Account</div>
      <h1 style={{ ...Sf4, fontSize:38, fontWeight:600, color:t.ink, margin:"6px 0 4px", letterSpacing:-0.8 }}>Choose your plan.</h1>
      <p style={{ fontSize:13, color:t.muted, margin:0 }}>Upgrade or manage your subscription at any time.</p>
      <div style={{ height:1, background:t.ink, marginTop:14, marginBottom:24, opacity:0.8 }} />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 260px", gap:24 }}>
        <div>
          {/* Plan cards */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:12, marginBottom:28 }}>
            {plans.map(p => (
              <div key={p.k} style={{ background:p.current?t.ink:t.panel, border:p.current?`none`:`1px solid ${t.rule}`, borderTop:p.current?`3px solid ${t.accent}`:`3px solid transparent`, padding:"20px 18px", display:"flex", flexDirection:"column" }}>
                <div style={{ fontSize:9, letterSpacing:2, color:p.current?t.accent:t.muted, fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>
                  {p.current ? "Current plan" : p.k === "pro" ? "Best value" : ""}
                  {(!p.current && p.k !== "pro") ? " " : ""}
                </div>
                <div style={{ ...Sf4, fontSize:18, fontWeight:600, color:p.current?t.bg:t.ink, marginBottom:4 }}>{p.label}</div>
                <div style={{ display:"flex", alignItems:"baseline", gap:3, marginBottom:12 }}>
                  <span style={{ ...Sf4, fontSize:28, fontWeight:700, color:p.current?t.bg:t.ink }}>{p.price}</span>
                  <span style={{ fontSize:11, color:p.current?`${t.bg}55`:t.muted }}>{p.per}</span>
                </div>
                <div style={{ fontSize:12, color:p.current?`${t.bg}66`:t.muted, lineHeight:1.55, flex:1, marginBottom:16 }}>{p.desc}</div>
                <div style={{ display:"flex", flexDirection:"column", gap:5, marginBottom:16 }}>
                  {p.features.map((f,i) => (
                    <div key={i} style={{ display:"flex", alignItems:"center", gap:6, fontSize:11.5, color:p.current?`${t.bg}88`:t.body }}>
                      <span style={{ color:p.current?t.accent:t.accent, fontSize:9 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
                <button style={{ padding:"8px 0", background:p.current?`${t.bg}15`:p.k==="pro"?t.ink:"transparent", border:p.current?`none`:p.k==="pro"?`none`:`1px solid ${t.rule}`, color:p.current?`${t.bg}55`:p.k==="pro"?t.bg:t.body, fontSize:12, fontWeight:600, cursor:p.current?"default":"pointer", textAlign:"center" }}>
                  {p.current ? "Current plan" : p.k === "pro" ? "Upgrade to Pro →" : "Downgrade"}
                </button>
              </div>
            ))}
          </div>

          {/* Feature comparison table */}
          <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Feature Comparison</div>
          <div style={{ background:t.panel, border:`1px solid ${t.rule}` }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px 100px", padding:"7px 16px", borderBottom:`1px solid ${t.rule}`, background:t.panel2 }}>
              {["Feature","Free","Scholar","Pro"].map(h => (
                <div key={h} style={{ fontSize:9, letterSpacing:1.5, color:t.muted, fontWeight:700, textTransform:"uppercase", textAlign:h!=="Feature"?"center":"left" }}>{h}</div>
              ))}
            </div>
            {features.map(([feat, free, scholar, pro], i) => (
              <div key={i} style={{ display:"grid", gridTemplateColumns:"1fr 80px 80px 100px", padding:"9px 16px", borderBottom:i<features.length-1?`1px solid ${t.rule}`:"none", alignItems:"center", background:i%2===0?"transparent":t.panel2 }}>
                <span style={{ fontSize:12.5, color:t.body }}>{feat}</span>
                {[free,scholar,pro].map((v,j) => (
                  <div key={j} style={{ textAlign:"center", ...Sf4, fontSize:12, fontWeight:v==="✗"?400:600, color:v==="✗"?t.muted:j===1?t.accent:t.body }}>{v}</div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Right rail */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:t.ink, padding:"18px 18px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>Current Usage</div>
            {[["Documents","18 / 25"],["Credits","182 / 400"],["Exams taken","12"],["Rooms hosted","3"]].map(([k,v],i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:i<3?`1px solid ${t.bg}12`:"none" }}>
                <span style={{ fontSize:12, color:`${t.bg}66` }}>{k}</span>
                <span style={{ ...Sf4, fontSize:13, fontWeight:600, color:t.bg }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ background:t.panel2, border:`1px solid ${t.rule}`, borderTop:`3px solid ${t.accent}`, padding:"16px 18px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.muted, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Billing</div>
            {[["Next renewal","May 31, 2026"],["Amount","$9.00 / mo"],["Method","Visa ····4242"]].map(([k,v],i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:i<2?`1px solid ${t.rule}`:"none" }}>
                <span style={{ fontSize:11.5, color:t.muted }}>{k}</span>
                <span style={{ ...Sf4, fontSize:12, fontWeight:600, color:t.ink }}>{v}</span>
              </div>
            ))}
            <button style={{ marginTop:12, width:"100%", padding:"8px 0", background:"transparent", border:`1px solid ${t.rule}`, color:t.body, fontSize:11.5, cursor:"pointer" }}>Manage Billing →</button>
          </div>
          <div style={{ fontSize:11, color:t.muted, lineHeight:1.6, padding:"12px 14px", background:t.panel, border:`1px solid ${t.rule}` }}>
            Cancel or change your plan at any time. No lock-in. Credits reset on your renewal date.
          </div>
        </div>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Notifications — full notification center
// ─────────────────────────────────────────────────────────────
export const Notifications4: React.FC<{ t: Theme }> = ({ t }) => {
  const typeColor = { exam:t.accent, room:"#3A6B8A", friend:"#5B7A3A", badge:t.accent, credit:"#dc2626", library:"#B8893A" };
  const groups = [
    { date:"Today", items:[
      { type:"exam",    icon:"◈", title:"Exam results ready",       body:"Your Microeconomics — Ch. VII results are available.",   time:"2:14 PM", unread:true  },
      { type:"room",   icon:"●", title:"Room invite from Layla A.", body:"Join 'Series Convergence Review' starting at 4:00 PM.",   time:"1:40 PM", unread:true  },
      { type:"badge",  icon:"★", title:"Achievement unlocked",      body:"You earned the '14-Day Streak' badge. Keep going!",       time:"9:00 AM", unread:true  },
      { type:"library",icon:"◆", title:"Processing complete",       body:"Anatomy Lecture XII is ready — 32 flashcards generated.", time:"8:55 AM", unread:false },
    ]},
    { date:"Yesterday", items:[
      { type:"friend", icon:"▲", title:"Friend request",            body:"Nour Faris wants to connect with you on MeshFahem.",      time:"7:30 PM", unread:false },
      { type:"exam",   icon:"◈", title:"Exam results ready",        body:"CS161 — Algorithms results: you scored 81%.",              time:"5:10 PM", unread:false },
      { type:"room",   icon:"●", title:"Room starting soon",        body:"'CS Algorithms Deep Dive' begins in 15 minutes.",         time:"7:45 PM", unread:false },
    ]},
    { date:"Earlier", items:[
      { type:"credit", icon:"○", title:"Credits running low",       body:"You have 182 credits remaining. Consider upgrading.",     time:"May 6",   unread:false },
      { type:"friend", icon:"▲", title:"Karim H. is now a friend",  body:"You and Karim Hassan are now connected.",                 time:"May 5",   unread:false },
      { type:"badge",  icon:"★", title:"Achievement unlocked",      body:"You earned 'Flashcard Factory' — 100+ cards generated.",  time:"May 3",   unread:false },
    ]},
  ];
  const prefs = [
    { l:"Exam results",     on:true  }, { l:"Room invites",    on:true  },
    { l:"Friend requests",  on:true  }, { l:"Achievements",    on:true  },
    { l:"Credit alerts",    on:false }, { l:"Processing done", on:true  },
    { l:"Weekly digest",    on:false },
  ];
  const totalUnread = groups.flatMap(g=>g.items).filter(i=>i.unread).length;
  return (
    <Shell4 t={t} active="dash">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>Inbox</div>
          <h1 style={{ ...Sf4, fontSize:38, fontWeight:600, color:t.ink, margin:"6px 0 4px", letterSpacing:-0.8 }}>Notifications.</h1>
          <p style={{ fontSize:13, color:t.muted, margin:0 }}>{totalUnread} unread · {groups.flatMap(g=>g.items).length} total</p>
        </div>
        <button style={{ padding:"7px 16px", background:"transparent", border:`1px solid ${t.rule}`, color:t.muted, fontSize:12, cursor:"pointer" }}>Mark all read</button>
      </div>
      <div style={{ height:1, background:t.ink, marginTop:14, marginBottom:22, opacity:0.8 }} />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 240px", gap:24 }}>
        {/* Notification feed */}
        <div>
          {groups.map((g, gi) => (
            <div key={gi} style={{ marginBottom:22 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
                <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>{g.date}</div>
                <div style={{ flex:1, height:1, background:t.rule }} />
              </div>
              {g.items.map((item, i) => (
                <div key={i} style={{ display:"flex", gap:14, padding:"13px 16px", background:item.unread?t.accentSoft:"transparent", border:`1px solid ${item.unread?t.accent+"33":t.rule}`, borderLeft:`3px solid ${typeColor[item.type]}`, marginBottom:8 }}>
                  <div style={{ width:32, height:32, background:item.unread?t.accentSoft:t.panel2, border:`1px solid ${item.unread?t.accent+"44":t.rule}`, display:"grid", placeItems:"center", fontSize:13, color:typeColor[item.type], flexShrink:0 }}>{item.icon}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
                      <div style={{ fontSize:13, fontWeight:item.unread?700:500, color:t.ink }}>{item.title}</div>
                      <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0, marginLeft:12 }}>
                        {item.unread && <div style={{ width:7, height:7, borderRadius:999, background:t.accent }} />}
                        <span style={{ fontSize:10, color:t.muted }}>{item.time}</span>
                      </div>
                    </div>
                    <div style={{ fontSize:12, color:t.muted, lineHeight:1.5 }}>{item.body}</div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Right rail — preferences */}
        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ background:t.panel2, border:`1px solid ${t.rule}`, borderTop:`3px solid ${t.accent}`, padding:"18px 18px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:14 }}>Preferences</div>
            {prefs.map((p,i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 0", borderBottom:i<prefs.length-1?`1px solid ${t.rule}`:"none" }}>
                <span style={{ fontSize:12.5, color:t.body }}>{p.l}</span>
                <div style={{ width:34, height:18, background:p.on?t.accent:`${t.accent}33`, borderRadius:999, padding:3, flexShrink:0 }}>
                  <div style={{ width:12, height:12, background:t.bg, borderRadius:999, marginLeft:p.on?16:0 }} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ background:t.ink, padding:"16px 18px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Quick Stats</div>
            {[["Unread",totalUnread.toString()],["This week","7"],["All time","34"]].map(([k,v],i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:i<2?`1px solid ${t.bg}12`:"none" }}>
                <span style={{ fontSize:12, color:`${t.bg}66` }}>{k}</span>
                <span style={{ ...Sf4, fontSize:16, fontWeight:700, color:t.bg }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell4>
  );
};


// ─────────────────────────────────────────────────────────────
// Profile — Subscription Management page
// ─────────────────────────────────────────────────────────────
export const ProfileSub4: React.FC<{ t: Theme }> = ({ t }) => {
  const credits = [
    { label:"Tools & Services",  used:3000, total:1500, desc:"Core processing credits" },
    { label:"Study Room (Zego)", used:120,  total:300,  desc:"Live session minutes"   },
    { label:"AI Assistant",      used:45,   total:100,  desc:"AI chat interactions"   },
  ];
  return (
    <Shell4 t={t} active="dash">
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20, cursor:"pointer" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        <span style={{ fontSize:12, color:t.muted }}>Back to Profile</span>
      </div>

      {/* Ink header */}
      <div style={{ background:t.ink, padding:"22px 28px", marginBottom:22 }}>
        <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Account · Plan Details</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ ...Sf4, fontSize:28, fontWeight:600, color:t.bg, letterSpacing:-0.4 }}>Standard Plan</div>
            <div style={{ fontSize:12, color:`${t.bg}55`, marginTop:4 }}>Billed monthly · Renews May 26, 2026</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:9, letterSpacing:1.5, color:`${t.bg}44`, textTransform:"uppercase", marginBottom:2 }}>Auto-renewal</div>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize:12, color:t.accent, fontWeight:600 }}>Enabled</span>
              </div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:9, letterSpacing:1.5, color:`${t.bg}44`, textTransform:"uppercase", marginBottom:2 }}>Payment</div>
              <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontSize:12, color:t.accent, fontWeight:600 }}>Card on file</span>
              </div>
            </div>
            <span style={{ fontSize:10, background:t.accent, color:t.ink, padding:"3px 10px", fontWeight:700, letterSpacing:1 }}>ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Credits — full width */}
      <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>Credit Balance</div>
      <div style={{ display:"flex", flexDirection:"column", gap:1, marginBottom:20, border:`1px solid ${t.rule}` }}>
        {credits.map((c,i) => {
          const over = c.used > c.total;
          const pct = Math.min((c.used / c.total) * 100, 100);
          return (
            <div key={i} style={{ background:t.panel, padding:"14px 20px", borderBottom:i<credits.length-1?`1px solid ${t.rule}`:"none", display:"flex", alignItems:"center", gap:20 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:8 }}>
                  <div>
                    <span style={{ fontSize:13, color:t.body, fontWeight:500 }}>{c.label}</span>
                    <span style={{ fontSize:10, color:t.muted, marginLeft:8 }}>{c.desc}</span>
                  </div>
                  <span style={{ ...Sf4, fontSize:15, fontWeight:700, color:over?t.ink:t.ink }}>
                    {c.used.toLocaleString()} <span style={{ fontSize:11, fontWeight:400, color:t.muted }}>/ {c.total.toLocaleString()}</span>
                  </span>
                </div>
                <div style={{ height:5, background:t.panel2, borderRadius:2 }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:over?t.ink:t.accent, borderRadius:2 }} />
                </div>
              </div>
              <div style={{ fontSize:10, color:t.muted, flexShrink:0, textAlign:"right", minWidth:90 }}>
                <div>Resets May 26</div>
                <div style={{ ...Sf4, fontSize:13, fontWeight:600, color:t.ink, marginTop:2 }}>{Math.round(pct)}%</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Billing cycle — full width */}
      <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderTop:`3px solid ${t.accent}`, padding:"16px 22px", marginBottom:22 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Billing Cycle Resets In</div>
            <div style={{ display:"flex", alignItems:"baseline", gap:8 }}>
              <span style={{ ...Sf4, fontSize:32, fontWeight:700, color:t.ink, lineHeight:1 }}>17</span>
              <span style={{ fontSize:13, color:t.muted }}>days</span>
            </div>
          </div>
          <div style={{ display:"flex", gap:28 }}>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10, color:t.muted, marginBottom:3 }}>Started</div>
              <div style={{ ...Sf4, fontSize:13, fontWeight:600, color:t.ink }}>March 26, 2026</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10, color:t.muted, marginBottom:3 }}>Next billing</div>
              <div style={{ ...Sf4, fontSize:13, fontWeight:600, color:t.ink }}>May 26, 2026</div>
            </div>
            <div style={{ textAlign:"right" }}>
              <div style={{ fontSize:10, color:t.muted, marginBottom:3 }}>Amount</div>
              <div style={{ ...Sf4, fontSize:13, fontWeight:600, color:t.ink }}>$9.00</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display:"flex", gap:10 }}>
        <button style={{ padding:"10px 20px", background:"transparent", border:`1px solid ${t.rule}`, color:t.body, fontSize:12, cursor:"pointer" }}>View Billing History →</button>
        <button style={{ padding:"10px 20px", background:"transparent", border:`1px solid ${t.rule}`, color:t.muted, fontSize:12, cursor:"pointer" }}>Upgrade to Pro →</button>
        <button style={{ padding:"10px 20px", background:"transparent", border:`1px solid ${t.rule}`, color:t.muted, fontSize:12, cursor:"pointer", marginLeft:"auto" }}>Cancel Subscription</button>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Profile — Cancel Subscription modal (overlaid on sub page)
// ─────────────────────────────────────────────────────────────
export const ProfileSubCancel4: React.FC<{ t: Theme }> = ({ t }) => {
  const losing = [
    "25 documents / month",
    "400 processing credits",
    "All output types (summaries, mind maps, exams)",
    "EduPlay ranked play",
    "Priority processing queue",
    "Full history & analytics",
  ];
  const CheckIc = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
  const XSmIc  = () => <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
  return (
    <Shell4 t={t} active="dash">
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20, cursor:"pointer" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        <span style={{ fontSize:12, color:t.muted }}>Back to Subscription</span>
      </div>

      <div style={{ fontSize:9, letterSpacing:2.5, color:t.muted, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Account · Standard Plan</div>
      <h1 style={{ ...Sf4, fontSize:34, fontWeight:600, color:t.ink, margin:"0 0 6px", letterSpacing:-0.5 }}>Cancel your subscription?</h1>
      <p style={{ fontSize:13, color:t.muted, margin:0 }}>Auto-renewal will be turned off. You keep access until <strong style={{ color:t.ink }}>May 26, 2026</strong>.</p>
      <div style={{ height:1, background:t.ink, marginTop:16, marginBottom:24, opacity:0.8 }} />

      <div style={{ display:"grid", gridTemplateColumns:"1fr 300px", gap:22 }}>
        {/* Left — features losing */}
        <div>
          <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>What you'll no longer have</div>
          <div style={{ border:`1px solid ${t.rule}`, marginBottom:16 }}>
            {losing.map((f,i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 16px", borderBottom:i<losing.length-1?`1px solid ${t.rule}`:"none", background:t.panel }}>
                <div style={{ width:18, height:18, background:t.panel2, border:`1px solid ${t.rule}`, display:"grid", placeItems:"center", flexShrink:0 }}><XSmIc /></div>
                <span style={{ fontSize:12.5, color:t.body, opacity:0.55, textDecoration:"line-through" }}>{f}</span>
              </div>
            ))}
          </div>
          <div style={{ background:t.panel2, border:`1px solid ${t.rule}`, padding:"14px 18px" }}>
            {[["Access ends","May 26, 2026"],["Refunds","None issued"],["Your data","Preserved"],["Reactivation","Anytime"]].map(([k,v],i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:i<3?`1px solid ${t.rule}`:"none" }}>
                <span style={{ fontSize:12, color:t.muted }}>{k}</span>
                <span style={{ fontSize:12, fontWeight:600, color:t.ink }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right — confirm */}
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          {/* Current sub summary */}
          <div style={{ background:t.ink, padding:"18px 20px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Current Subscription</div>
            <div style={{ ...Sf4, fontSize:18, fontWeight:600, color:t.bg, marginBottom:10 }}>Standard · $9/mo</div>
            <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
              {[
                { label:"Payment method", ok:true,  val:"Visa ····4242" },
                { label:"Auto-renewal",   ok:true,  val:"Enabled" },
                { label:"Visa ····4242",  ok:true,  val:"Card on file" },
              ].map((row,i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <span style={{ fontSize:11, color:`${t.bg}55` }}>{row.label}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    {row.ok
                      ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      : <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    }
                    <span style={{ fontSize:11, color:row.ok?t.accent:`${t.bg}66` }}>{row.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <button style={{ padding:"13px 0", background:t.accent, border:"none", color:t.ink, fontSize:13, fontWeight:700, cursor:"pointer", width:"100%", letterSpacing:0.3 }}>Keep My Subscription</button>
          <button style={{ padding:"11px 0", background:"transparent", border:`1px solid ${t.rule}`, color:t.muted, fontSize:12, cursor:"pointer", width:"100%" }}>Yes, cancel auto-renewal</button>
          <div style={{ fontSize:10, color:t.muted, textAlign:"center", lineHeight:1.6 }}>You can reactivate at any time.<br/>No data will be lost.</div>
        </div>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Profile — Billing History page
// ─────────────────────────────────────────────────────────────
export const ProfileBilling4: React.FC<{ t: Theme }> = ({ t }) => {
  const txType = { subscription_payment:"Subscription", trial_conversion:"Trial Upgrade", refund:"Refund" };
  const transactions = [
    { date:"May 1",  year:"2026", type:"subscription_payment", card:"Visa ····4242", amount:"$9.00",  status:"succeeded" },
    { date:"Apr 1",  year:"2026", type:"subscription_payment", card:"Visa ····4242", amount:"$9.00",  status:"succeeded" },
    { date:"Mar 1",  year:"2026", type:"subscription_payment", card:"Visa ····4242", amount:"$9.00",  status:"succeeded" },
    { date:"Feb 28", year:"2026", type:"subscription_payment", card:"Visa ····4242", amount:"$9.00",  status:"failed"    },
    { date:"Feb 28", year:"2026", type:"subscription_payment", card:"Visa ····4242", amount:"$9.00",  status:"succeeded" },
    { date:"Jan 1",  year:"2026", type:"trial_conversion",     card:"—",             amount:"$0.00",  status:"succeeded" },
  ];
  const statusIcon = {
    succeeded: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    failed:    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
    pending:   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
    refunded:  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.64"/></svg>,
  };
  const statusLabel = { succeeded:"Paid", failed:"Failed", pending:"Pending", refunded:"Refunded" };
  const statusColor = { succeeded:t.accent, failed:"#dc2626", pending:"#d97706", refunded:t.muted };
  const months = [...new Set(transactions.map(tx => `${tx.date.split(" ")[0].length > 3 ? tx.date : tx.date} ${tx.year}`))];
  const byMonth = { "May 2026":[], "Apr 2026":[], "Mar 2026":[], "Feb 2026":[], "Jan 2026":[] };
  transactions.forEach(tx => {
    const m = tx.date.includes("Jan") ? "Jan 2026" : tx.date.includes("Feb") ? "Feb 2026" : tx.date.includes("Mar") ? "Mar 2026" : tx.date.includes("Apr") ? "Apr 2026" : "May 2026";
    byMonth[m].push(tx);
  });

  return (
    <Shell4 t={t} active="dash">
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20, cursor:"pointer" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        <span style={{ fontSize:12, color:t.muted }}>Back to Subscription</span>
      </div>

      <div style={{ background:t.ink, padding:"20px 28px", marginBottom:22 }}>
        <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Account</div>
        <div style={{ display:"flex", alignItems:"flex-end", justifyContent:"space-between" }}>
          <div style={{ ...Sf4, fontSize:28, fontWeight:600, color:t.bg, letterSpacing:-0.4 }}>Billing History.</div>
          <div style={{ textAlign:"right" }}>
            <div style={{ ...Sf4, fontSize:24, fontWeight:700, color:t.bg }}>$45.00</div>
            <div style={{ fontSize:10, color:`${t.bg}44` }}>total charged · 5 payments</div>
          </div>
        </div>
      </div>

      {Object.entries(byMonth).filter(([,rows]) => rows.length > 0).map(([month, rows]) => (
        <div key={month} style={{ marginBottom:18 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>{month}</div>
            <div style={{ flex:1, height:1, background:t.rule }} />
          </div>
          {rows.map((tx, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", background:t.panel, border:`1px solid ${t.rule}`, borderLeft:`3px solid ${statusColor[tx.status]}`, padding:"12px 16px", gap:14, marginBottom:1 }}>
              <div style={{ width:40, flexShrink:0, textAlign:"center" }}>
                {statusIcon[tx.status]}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ fontSize:12.5, fontWeight:600, color:t.ink, marginBottom:2 }}>{txType[tx.type] || "Payment"}</div>
                <div style={{ fontSize:10.5, color:t.muted }}>{tx.card !== "—" ? tx.card : "Trial upgrade"}</div>
              </div>
              <div style={{ textAlign:"right", flexShrink:0 }}>
                <div style={{ ...Sf4, fontSize:15, fontWeight:700, color:t.ink }}>{tx.amount}</div>
                <div style={{ fontSize:10, color:statusColor[tx.status], fontWeight:600 }}>{statusLabel[tx.status]}</div>
              </div>
              <div style={{ width:1, height:28, background:t.rule, flexShrink:0 }} />
              <div style={{ flexShrink:0, width:88 }}>
                {tx.status === "succeeded"
                  ? <button style={{ padding:"5px 0", background:"transparent", border:`1px solid ${t.rule}`, color:t.body, fontSize:10.5, cursor:"pointer", width:"100%", textAlign:"center" }}>↓ Receipt</button>
                  : <span style={{ fontSize:10.5, color:t.muted, display:"block", textAlign:"center" }}>—</span>
                }
              </div>
            </div>
          ))}
        </div>
      ))}

      <div style={{ marginTop:4, padding:"10px 14px", background:t.panel2, border:`1px solid ${t.rule}`, fontSize:11, color:t.muted }}>
        Receipts are generated as PDFs. For disputes: <span style={{ color:t.body }}>support@meshfahem.com</span>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Profile — Edit mode (inline name + bio editing)
// ─────────────────────────────────────────────────────────────
export const ProfileEdit4: React.FC<{ t: Theme }> = ({ t }) => {
  const CopyIc = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
  const CheckIc = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
  return (
    <Shell4 t={t} active="dash">
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
        <div>
          <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>Account</div>
          <h1 style={{ ...Sf4, fontSize:34, fontWeight:600, color:t.ink, margin:"6px 0 4px", letterSpacing:-0.5 }}>Edit Profile.</h1>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={{ padding:"8px 22px", background:t.ink, border:"none", color:t.bg, fontSize:12, fontWeight:700, cursor:"pointer" }}>✓ Save changes</button>
          <button style={{ padding:"8px 16px", background:"transparent", border:`1px solid ${t.rule}`, color:t.muted, fontSize:12, cursor:"pointer" }}>Cancel</button>
        </div>
      </div>
      <div style={{ height:1, background:t.ink, marginTop:14, marginBottom:24, opacity:0.8 }} />

      <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:32 }}>
        {/* Left col — identity */}
        <div>
          {/* Avatar */}
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:16 }}>
            <div style={{ position:"relative", marginBottom:12 }}>
              <div style={{ width:84, height:84, borderRadius:999, background:t.accent, display:"grid", placeItems:"center", ...Sf4, fontSize:32, fontWeight:700, color:t.ink }}>A</div>
              <div style={{ position:"absolute", bottom:0, right:0, width:26, height:26, borderRadius:999, background:t.ink, display:"grid", placeItems:"center", cursor:"pointer", border:`2px solid ${t.bg}` }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={t.bg} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></svg>
              </div>
            </div>
          </div>

          {/* Identity card */}
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, padding:"14px 16px" }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:10 }}>Identity</div>

            {/* Username */}
            <div style={{ marginBottom:10, paddingBottom:10, borderBottom:`1px solid ${t.rule}` }}>
              <div style={{ fontSize:10, color:t.muted, marginBottom:4 }}>Username</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:6 }}>
                <span style={{ fontSize:12, color:t.ink, fontFamily:"monospace" }}>@karim_h</span>
                <div style={{ display:"flex", gap:6 }}>
                  <button style={{ background:"transparent", border:`1px solid ${t.rule}`, color:t.muted, padding:"2px 7px", fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}><CopyIc /></button>
                  <button style={{ background:"transparent", border:`1px solid ${t.accent}55`, color:t.accent, padding:"2px 8px", fontSize:9, fontWeight:600, cursor:"pointer", letterSpacing:0.5 }}>Change</button>
                </div>
              </div>
            </div>

            {/* Permanent ID */}
            <div>
              <div style={{ fontSize:10, color:t.muted, marginBottom:4 }}>Permanent ID</div>
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                <span style={{ fontSize:12, color:t.muted, fontFamily:"monospace" }}>#u124d</span>
                <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <button style={{ background:"transparent", border:`1px solid ${t.rule}`, color:t.muted, padding:"2px 7px", fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}><CopyIc /></button>
                  <span style={{ fontSize:9, color:t.muted }}>copied!</span>
                  <CheckIc />
                </div>
              </div>
            </div>
          </div>

          {/* Level */}
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, padding:"12px 16px", marginTop:10 }}>
            <div style={{ fontSize:9, letterSpacing:2, color:t.muted, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Level</div>
            <div style={{ ...Sf4, fontSize:20, fontWeight:700, color:t.ink, marginBottom:6 }}>1</div>
            <div style={{ height:4, background:t.panel2, borderRadius:2, marginBottom:4 }}>
              <div style={{ width:"33%", height:"100%", background:t.accent, borderRadius:2 }} />
            </div>
            <div style={{ fontSize:10, color:t.muted }}>33 / 100 XP</div>
          </div>
        </div>

        {/* Right col — editable fields */}
        <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
          {/* Display name */}
          <div style={{ paddingBottom:20, marginBottom:20, borderBottom:`1px solid ${t.rule}` }}>
            <label style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", display:"block", marginBottom:8 }}>Display Name</label>
            <div style={{ border:`2px solid ${t.ink}`, padding:"11px 14px", display:"flex", justifyContent:"space-between", alignItems:"center", background:t.bg }}>
              <span style={{ ...Sf4, fontSize:16, color:t.ink }}>ayyash</span>
              <span style={{ fontSize:10, color:t.muted }}>6 / 50</span>
            </div>
          </div>

          {/* Bio */}
          <div style={{ paddingBottom:20, marginBottom:20, borderBottom:`1px solid ${t.rule}` }}>
            <label style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", display:"block", marginBottom:8 }}>Bio</label>
            <div style={{ border:`1px solid ${t.rule}`, padding:"11px 14px", minHeight:90, background:t.bg, display:"flex", alignItems:"flex-start", justifyContent:"space-between" }}>
              <span style={{ fontSize:13, color:t.muted, fontStyle:"italic" }}>Tell others about yourself…</span>
              <span style={{ fontSize:10, color:t.muted, flexShrink:0, marginLeft:12 }}>0 / 500</span>
            </div>
          </div>

          {/* Email — locked */}
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
              <label style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase" }}>Email</label>
              <span style={{ fontSize:10, color:t.muted }}>Cannot be changed</span>
            </div>
            <div style={{ border:`1px solid ${t.rule}`, padding:"11px 14px", background:t.panel2, display:"flex", justifyContent:"space-between" }}>
              <span style={{ fontSize:13, color:t.muted }}>ayyash@ayyash.com</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity:0.4 }}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
          </div>
        </div>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Profile — Username Setup modal
// ─────────────────────────────────────────────────────────────
export const ProfileUsername4: React.FC<{ t: Theme }> = ({ t }) => {
  /* "available" state */
  return (
    <Shell4 t={t} active="dash">
      <div style={{ filter:"blur(2px)", opacity:0.22, pointerEvents:"none" }}>
        <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderTop:`3px solid ${t.accent}`, padding:"14px 20px", marginBottom:4 }}>
          <div style={{ ...Sf4, fontSize:16, fontWeight:600, color:t.ink }}>Standard Plan <span style={{ fontSize:10, background:t.accentSoft, color:t.accent, padding:"2px 7px", marginLeft:8 }}>ACTIVE</span></div>
        </div>
        <div style={{ background:t.panel, border:`1px solid ${t.rule}`, padding:"16px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ width:56, height:56, borderRadius:999, background:t.accent }} />
            <div>
              <div style={{ ...Sf4, fontSize:16, fontWeight:600, color:t.ink, marginBottom:3 }}>ayyash@ayyash.com</div>
              <div style={{ fontSize:11, color:t.muted }}>Level 1 · @karim_h</div>
            </div>
          </div>
        </div>
        <div style={{ height:100, background:t.panel2, border:`1px solid ${t.rule}`, marginTop:4 }} />
      </div>

      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.58)", display:"grid", placeItems:"center", zIndex:50 }}>
        <div style={{ background:t.bg, width:430, boxShadow:"0 24px 56px rgba(0,0,0,0.3)" }}>
          {/* Ink header */}
          <div style={{ background:t.ink, padding:"20px 24px" }}>
            <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>Account · Profile</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ ...Sf4, fontSize:20, fontWeight:600, color:t.bg }}>Set Username.</div>
              <button style={{ background:"transparent", border:`1px solid ${t.bg}22`, color:`${t.bg}44`, width:26, height:26, cursor:"pointer", fontSize:14, display:"grid", placeItems:"center" }}>✕</button>
            </div>
          </div>

          <div style={{ padding:"22px 24px" }}>
            <p style={{ fontSize:12.5, color:t.muted, lineHeight:1.7, marginBottom:20 }}>
              Choose a public username. Changeable once every <strong style={{ color:t.ink }}>10 days</strong>.
            </p>

            {/* Input — available state */}
            <div style={{ display:"flex", border:`2px solid ${t.ink}`, marginBottom:8, overflow:"hidden" }}>
              <div style={{ padding:"12px 14px", background:t.ink, display:"flex", alignItems:"center" }}>
                <span style={{ ...Sf4, fontSize:20, fontWeight:700, color:t.bg }}>@</span>
              </div>
              <div style={{ flex:1, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", background:t.bg }}>
                <span style={{ fontSize:14, color:t.ink, fontFamily:"monospace" }}>karim_h</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:16, height:18 }}>
              <div style={{ width:6, height:6, borderRadius:999, background:t.accent, flexShrink:0 }} />
              <span style={{ fontSize:11.5, color:t.accent, fontWeight:600 }}>@karim_h is available</span>
            </div>

            <div style={{ fontSize:10.5, color:t.muted, lineHeight:1.6, padding:"9px 12px", background:t.panel2, border:`1px solid ${t.rule}` }}>
              3–20 characters · lowercase, numbers, underscores only
            </div>
          </div>

          <div style={{ display:"flex", gap:10, padding:"0 24px 22px" }}>
            <button style={{ flex:1, padding:"11px 0", background:t.ink, border:"none", color:t.bg, fontSize:13, fontWeight:700, cursor:"pointer" }}>Save Username</button>
            <button style={{ padding:"11px 18px", background:"transparent", border:`1px solid ${t.rule}`, color:t.muted, fontSize:12, cursor:"pointer" }}>Cancel</button>
          </div>
        </div>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Profile — Username modal · taken error state
// ─────────────────────────────────────────────────────────────
export const ProfileUsernameTaken4: React.FC<{ t: Theme }> = ({ t }) => {
  return (
    <Shell4 t={t} active="dash">
      <div style={{ filter:"blur(2px)", opacity:0.22, pointerEvents:"none" }}>
        <div style={{ height:240, background:t.panel, border:`1px solid ${t.rule}` }} />
      </div>
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.58)", display:"grid", placeItems:"center", zIndex:50 }}>
        <div style={{ background:t.bg, width:430, boxShadow:"0 24px 56px rgba(0,0,0,0.3)" }}>
          <div style={{ background:t.ink, padding:"20px 24px" }}>
            <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>Account · Profile</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ ...Sf4, fontSize:20, fontWeight:600, color:t.bg }}>Set Username.</div>
              <button style={{ background:"transparent", border:`1px solid ${t.bg}22`, color:`${t.bg}44`, width:26, height:26, cursor:"pointer", fontSize:14, display:"grid", placeItems:"center" }}>✕</button>
            </div>
          </div>
          <div style={{ padding:"22px 24px" }}>
            <p style={{ fontSize:12.5, color:t.muted, lineHeight:1.7, marginBottom:20 }}>Choose a public username. Changeable once every <strong style={{ color:t.ink }}>10 days</strong>.</p>

            {/* Input — taken state */}
            <div style={{ display:"flex", border:`2px solid #dc2626`, marginBottom:8, overflow:"hidden" }}>
              <div style={{ padding:"12px 14px", background:t.ink, display:"flex", alignItems:"center" }}>
                <span style={{ ...Sf4, fontSize:20, fontWeight:700, color:t.bg }}>@</span>
              </div>
              <div style={{ flex:1, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", background:t.bg }}>
                <span style={{ fontSize:14, color:"#dc2626", fontFamily:"monospace" }}>johndoe</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:16, height:18 }}>
              <div style={{ width:6, height:6, borderRadius:999, background:"#dc2626", flexShrink:0 }} />
              <span style={{ fontSize:11.5, color:"#dc2626", fontWeight:600 }}>@johndoe is already taken</span>
            </div>

            <div style={{ fontSize:10.5, color:t.muted, lineHeight:1.6, padding:"9px 12px", background:t.panel2, border:`1px solid ${t.rule}` }}>
              3–20 characters · lowercase, numbers, underscores only
            </div>
          </div>
          <div style={{ display:"flex", gap:10, padding:"0 24px 22px" }}>
            <button style={{ flex:1, padding:"11px 0", background:t.panel2, border:"none", color:t.muted, fontSize:13, fontWeight:700, cursor:"not-allowed", opacity:0.5 }}>Save Username</button>
            <button style={{ padding:"11px 18px", background:"transparent", border:`1px solid ${t.rule}`, color:t.muted, fontSize:12, cursor:"pointer" }}>Cancel</button>
          </div>
        </div>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Profile — Username modal · cooldown (cannot change yet)
// ─────────────────────────────────────────────────────────────
export const ProfileUsernameCooldown4: React.FC<{ t: Theme }> = ({ t }) => {
  return (
    <Shell4 t={t} active="dash">
      <div style={{ filter:"blur(2px)", opacity:0.22, pointerEvents:"none" }}>
        <div style={{ height:240, background:t.panel, border:`1px solid ${t.rule}` }} />
      </div>
      <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.58)", display:"grid", placeItems:"center", zIndex:50 }}>
        <div style={{ background:t.bg, width:430, boxShadow:"0 24px 56px rgba(0,0,0,0.3)" }}>
          <div style={{ background:t.ink, padding:"20px 24px" }}>
            <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:8 }}>Account · Profile</div>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div style={{ ...Sf4, fontSize:20, fontWeight:600, color:t.bg }}>Set Username.</div>
              <button style={{ background:"transparent", border:`1px solid ${t.bg}22`, color:`${t.bg}44`, width:26, height:26, cursor:"pointer", fontSize:14, display:"grid", placeItems:"center" }}>✕</button>
            </div>
          </div>
          <div style={{ padding:"22px 24px" }}>
            {/* Cooldown notice */}
            <div style={{ background:t.panel2, border:`1px solid ${t.rule}`, borderLeft:`3px solid ${t.accent}`, padding:"16px 18px", marginBottom:18 }}>
              <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:2 }}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <div>
                  <div style={{ fontSize:12.5, fontWeight:600, color:t.ink, marginBottom:4 }}>Username recently changed</div>
                  <div style={{ fontSize:12, color:t.muted, lineHeight:1.6 }}>You can change your username again in <strong style={{ color:t.ink }}>8 days</strong>. Your current username is <strong style={{ color:t.ink, fontFamily:"monospace" }}>@karim_h</strong>.</div>
                </div>
              </div>
            </div>

            {/* Locked input */}
            <div style={{ display:"flex", border:`1px solid ${t.rule}`, overflow:"hidden", opacity:0.5 }}>
              <div style={{ padding:"12px 14px", background:t.panel2, display:"flex", alignItems:"center" }}>
                <span style={{ ...Sf4, fontSize:20, fontWeight:700, color:t.muted }}>@</span>
              </div>
              <div style={{ flex:1, padding:"10px 14px", display:"flex", alignItems:"center", justifyContent:"space-between", background:t.panel2 }}>
                <span style={{ fontSize:14, color:t.muted, fontFamily:"monospace" }}>karim_h</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
            </div>
          </div>
          <div style={{ padding:"0 24px 22px" }}>
            <button style={{ width:"100%", padding:"11px 0", background:"transparent", border:`1px solid ${t.rule}`, color:t.muted, fontSize:12, cursor:"pointer" }}>Close</button>
          </div>
        </div>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Profile — Sub · Canceled state (orange banner + reactivate)
// ─────────────────────────────────────────────────────────────
export const ProfileSubCanceled4: React.FC<{ t: Theme }> = ({ t }) => {
  return (
    <Shell4 t={t} active="dash">
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20, cursor:"pointer" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        <span style={{ fontSize:12, color:t.muted }}>Back to Profile</span>
      </div>

      {/* Canceled banner */}
      <div style={{ background:"#FFF7ED", border:"1px solid #F59E0B", borderLeft:"4px solid #F59E0B", padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"flex-start", gap:12 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:2 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <div>
          <div style={{ fontSize:12.5, fontWeight:700, color:"#92400E", marginBottom:3 }}>Subscription canceled</div>
          <div style={{ fontSize:12, color:"#B45309", lineHeight:1.6 }}>Your Standard Plan remains active until <strong>May 26, 2026</strong>. After that you'll be on the Free plan.</div>
        </div>
        <button style={{ marginLeft:"auto", padding:"6px 14px", background:"#F59E0B", border:"none", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", flexShrink:0 }}>Reactivate →</button>
      </div>

      <div style={{ background:t.ink, padding:"22px 28px", marginBottom:22 }}>
        <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Account · Plan Details</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ ...Sf4, fontSize:28, fontWeight:600, color:t.bg, letterSpacing:-0.4 }}>Standard Plan</div>
            <div style={{ fontSize:12, color:`${t.bg}55`, marginTop:4 }}>Access ends May 26, 2026</div>
          </div>
          <span style={{ fontSize:10, background:"#92400E", color:"#fff", padding:"3px 10px", fontWeight:700, letterSpacing:1 }}>CANCELED</span>
        </div>
      </div>

      {/* Credits — faded (no longer accumulating) */}
      <div style={{ fontSize:9, letterSpacing:2, color:t.muted, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>Remaining Credit Balance</div>
      <div style={{ display:"flex", flexDirection:"column", gap:1, marginBottom:22, border:`1px solid ${t.rule}`, opacity:0.65 }}>
        {[["Tools & Services",800,1500],["Study Room (Zego)",180,300],["AI Assistant",55,100]].map(([l,u,tot],i) => {
          const pct = Math.round((u/tot)*100);
          return (
            <div key={i} style={{ background:t.panel, padding:"12px 20px", borderBottom:i<2?`1px solid ${t.rule}`:"none", display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:13, color:t.body }}>{l}</span>
                  <span style={{ ...Sf4, fontSize:14, fontWeight:600, color:t.ink }}>{u} <span style={{ fontSize:11, fontWeight:400, color:t.muted }}>/ {tot}</span></span>
                </div>
                <div style={{ height:4, background:t.panel2, borderRadius:2 }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:t.muted, borderRadius:2 }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display:"flex", gap:10 }}>
        <button style={{ padding:"10px 22px", background:t.ink, border:"none", color:t.bg, fontSize:12, fontWeight:700, cursor:"pointer" }}>Reactivate Subscription →</button>
        <button style={{ padding:"10px 18px", background:"transparent", border:`1px solid ${t.rule}`, color:t.muted, fontSize:12, cursor:"pointer" }}>View Billing History</button>
      </div>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Profile — Sub · Payment Failed state (red alert)
// ─────────────────────────────────────────────────────────────
export const ProfileSubFailed4: React.FC<{ t: Theme }> = ({ t }) => {
  return (
    <Shell4 t={t} active="dash">
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20, cursor:"pointer" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        <span style={{ fontSize:12, color:t.muted }}>Back to Profile</span>
      </div>

      {/* Failed banner */}
      <div style={{ background:"#FEF2F2", border:"1px solid #FECACA", borderLeft:"4px solid #DC2626", padding:"14px 18px", marginBottom:20, display:"flex", alignItems:"flex-start", gap:12 }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:2 }}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:12.5, fontWeight:700, color:"#991B1B", marginBottom:3 }}>Payment failed</div>
          <div style={{ fontSize:12, color:"#B91C1C", lineHeight:1.6 }}>We couldn't charge your card ending in ····4242. Please update your payment method to keep your plan active.</div>
        </div>
        <button style={{ padding:"6px 14px", background:"#DC2626", border:"none", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer", flexShrink:0 }}>Update Payment →</button>
      </div>

      <div style={{ background:t.ink, padding:"22px 28px", marginBottom:22 }}>
        <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Account · Plan Details</div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ ...Sf4, fontSize:28, fontWeight:600, color:t.bg, letterSpacing:-0.4 }}>Standard Plan</div>
            <div style={{ fontSize:12, color:`${t.bg}55`, marginTop:4 }}>Renewal failed · Action required</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <span style={{ fontSize:10, background:"#DC2626", color:"#fff", padding:"3px 10px", fontWeight:700, letterSpacing:1 }}>PAYMENT FAILED</span>
          </div>
        </div>
      </div>

      {/* Credits still shown but with warning */}
      <div style={{ fontSize:9, letterSpacing:2, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:12 }}>Credit Balance</div>
      <div style={{ display:"flex", flexDirection:"column", gap:1, border:`1px solid ${t.rule}`, marginBottom:22 }}>
        {[["Tools & Services",3000,1500],["Study Room (Zego)",120,300],["AI Assistant",45,100]].map(([l,u,tot],i) => {
          const over = u > tot; const pct = Math.min((u/tot)*100,100);
          return (
            <div key={i} style={{ background:t.panel, padding:"12px 20px", borderBottom:i<2?`1px solid ${t.rule}`:"none", display:"flex", alignItems:"center", gap:16 }}>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                  <span style={{ fontSize:13, color:t.body }}>{l}</span>
                  <span style={{ ...Sf4, fontSize:14, fontWeight:600, color:t.ink }}>{u.toLocaleString()} <span style={{ fontSize:11, fontWeight:400, color:t.muted }}>/ {tot}</span></span>
                </div>
                <div style={{ height:4, background:t.panel2, borderRadius:2 }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:over?t.ink:t.accent, borderRadius:2 }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button style={{ padding:"11px 24px", background:"#DC2626", border:"none", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>Update Payment Method →</button>
    </Shell4>
  );
};

// ─────────────────────────────────────────────────────────────
// Profile — Billing · empty state
// ─────────────────────────────────────────────────────────────
export const ProfileBillingEmpty4: React.FC<{ t: Theme }> = ({ t }) => {
  return (
    <Shell4 t={t} active="dash">
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:20, cursor:"pointer" }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
        <span style={{ fontSize:12, color:t.muted }}>Back to Subscription</span>
      </div>
      <div style={{ background:t.ink, padding:"20px 28px", marginBottom:22 }}>
        <div style={{ fontSize:9, letterSpacing:2.5, color:t.accent, fontWeight:700, textTransform:"uppercase", marginBottom:6 }}>Account</div>
        <div style={{ ...Sf4, fontSize:28, fontWeight:600, color:t.bg, letterSpacing:-0.4 }}>Billing History.</div>
      </div>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 0", background:t.panel, border:`1px solid ${t.rule}` }}>
        <div style={{ width:56, height:56, background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:999, display:"grid", placeItems:"center", marginBottom:18 }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
        </div>
        <div style={{ ...Sf4, fontSize:20, fontWeight:600, color:t.ink, marginBottom:8 }}>No billing history</div>
        <div style={{ fontSize:13, color:t.muted, textAlign:"center", lineHeight:1.7, maxWidth:340 }}>
          Your transactions will appear here once you've made a payment. Free plan users don't have billing history.
        </div>
      </div>
    </Shell4>
  );
};





// ── Auth4 ──────────────────────────────────────────────────────────────────
export const Auth4: React.FC<{ t: Theme }> = ({ t }) => (
  <div style={{ width:'100%', height:'100%', display:'flex', fontFamily:'Inter,sans-serif', background:t.bg, position:'relative' }}>
    {/* Language toggle */}
    <div style={{ position:'absolute', top:20, right:24, display:'flex', alignItems:'center', gap:6, padding:'5px 11px', borderRadius:8, border:`1px solid ${t.rule}`, background:t.panel, fontSize:11, color:t.muted, cursor:'pointer', zIndex:10 }}>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      EN
    </div>

    {/* Left — form column */}
    <div style={{ width:520, display:'flex', flexDirection:'column', justifyContent:'center', padding:'56px 64px', borderRight:`1px solid ${t.rule}` }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:40 }}>
        <div style={{ width:36, height:36, background:t.ink, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.bg} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
        </div>
        <span style={{ ...Sf4, fontSize:20, fontWeight:700, color:t.ink }}>MeshFahem</span>
      </div>

      {/* Heading */}
      <div style={{ marginBottom:28 }}>
        <div style={{ ...Sf4, fontSize:30, fontWeight:700, color:t.ink, lineHeight:1.15, marginBottom:8 }}>
          Welcome back.
        </div>
        <div style={{ fontSize:14, color:t.muted }}>Sign in to continue your studies</div>
      </div>

      {/* Card */}
      <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:12, padding:24 }}>
        {/* Google */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, padding:'10px 0', border:`1px solid ${t.rule}`, borderRadius:8, marginBottom:16, cursor:'pointer' }}>
          <svg width="17" height="17" viewBox="0 0 24 24">
            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span style={{ fontSize:13, fontWeight:500, color:t.ink }}>Continue with Google</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
          <div style={{ flex:1, height:1, background:t.rule }}/>
          <span style={{ fontSize:11, color:t.muted }}>or with email</span>
          <div style={{ flex:1, height:1, background:t.rule }}/>
        </div>
        <div style={{ marginBottom:12 }}>
          <div style={{ fontSize:11, fontWeight:500, color:t.body, marginBottom:4 }}>Email address</div>
          <div style={{ border:`1px solid ${t.rule}`, borderRadius:7, padding:'9px 11px', fontSize:13, color:t.muted, background:t.panel }}>you@example.com</div>
        </div>
        <div style={{ marginBottom:16 }}>
          <div style={{ fontSize:11, fontWeight:500, color:t.body, marginBottom:4 }}>Password</div>
          <div style={{ border:`1px solid ${t.rule}`, borderRadius:7, padding:'9px 11px', fontSize:13, color:t.muted, background:t.panel }}>••••••••••</div>
        </div>
        <div style={{ background:t.ink, color:t.panel, borderRadius:8, padding:'10px 0', fontSize:13, fontWeight:600, textAlign:'center', cursor:'pointer', marginBottom:12 }}>
          Sign In
        </div>
        <div style={{ textAlign:'center', fontSize:12, color:t.muted }}>
          Need an account? <span style={{ color:t.accent, fontWeight:500, cursor:'pointer' }}>Sign up</span>
        </div>
      </div>

      {/* Footnotes */}
      <div style={{ display:'flex', justifyContent:'center', gap:22, marginTop:20, fontSize:11, color:t.muted }}>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          Unlimited pages
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:4 }}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          PDF, DOCX, TXT & more
        </div>
      </div>
    </div>

    {/* Right — editorial panel */}
    <div style={{ flex:1, display:'flex', flexDirection:'column', justifyContent:'center', padding:'56px 64px', background:t.sb }}>
      <div style={{ marginBottom:40 }}>
        <div style={{ fontSize:10, letterSpacing:'0.18em', fontWeight:700, color:t.sbMuted, textTransform:'uppercase', marginBottom:14 }}>MeshFahem · Scholar v4</div>
        <div style={{ ...Sf4, fontSize:52, fontWeight:700, color:t.sbInk, lineHeight:1.1, marginBottom:18 }}>
          Study<br/>smarter,<br/>not harder.
        </div>
        <div style={{ fontSize:14, color:t.sbMuted, lineHeight:1.7, maxWidth:320 }}>
          AI-powered summaries, flashcards, and quizzes from any document. Study in your language, at your own pace.
        </div>
      </div>

      {/* Pull quote at bottom */}
      <div style={{ marginTop:'auto', paddingTop:40, borderTop:`1px solid ${t.sbActive}20` }}>
        <div style={{ ...Sf4, fontSize:12, color:t.sbMuted, fontStyle:'italic', lineHeight:1.5 }}>
          "Read with the pen, write with the mind."
        </div>
        <div style={{ fontSize:10, color:t.sbMuted, marginTop:6, opacity:0.6 }}>© 2026 MeshFahem</div>
      </div>
    </div>
  </div>
);

// ── OnboardingLang4 ────────────────────────────────────────────────────────
export const OnboardingLang4: React.FC<{ t: Theme }> = ({ t }) => {
  const langs = [
    {
      code:'EN', name:'English',
      flag: (
        <svg width="28" height="20" viewBox="0 0 28 20" style={{borderRadius:3,display:'block',flexShrink:0}}>
          <rect width="28" height="20" fill="#012169"/>
          {/* White diagonal crosses */}
          <line x1="0" y1="0" x2="28" y2="20" stroke="white" strokeWidth="4"/>
          <line x1="28" y1="0" x2="0" y2="20" stroke="white" strokeWidth="4"/>
          {/* Red diagonal crosses */}
          <line x1="0" y1="0" x2="28" y2="20" stroke="#C8102E" strokeWidth="2.5"/>
          <line x1="28" y1="0" x2="0" y2="20" stroke="#C8102E" strokeWidth="2.5"/>
          {/* White cross */}
          <rect x="11" y="0" width="6" height="20" fill="white"/>
          <rect x="0" y="7" width="28" height="6" fill="white"/>
          {/* Red cross */}
          <rect x="12.5" y="0" width="3" height="20" fill="#C8102E"/>
          <rect x="0" y="8.5" width="28" height="3" fill="#C8102E"/>
        </svg>
      ),
      sel:true
    },
    {
      code:'AR', name:'العربية',
      flag: (
        <svg width="28" height="20" viewBox="0 0 28 20" style={{borderRadius:3,display:'block',flexShrink:0}}>
          <rect width="28" height="20" fill="#006C35"/>
          {/* Simplified white shahada band */}
          <rect y="8" width="28" height="4" fill="white" opacity="0.15"/>
          {/* White crescent */}
          <circle cx="11" cy="10" r="4" fill="none" stroke="white" strokeWidth="1.6"/>
          <circle cx="12.5" cy="10" r="4" fill="#006C35"/>
          {/* Star */}
          <polygon points="18,10 17,8.5 15.5,8 17,7.5 18,6 19,7.5 20.5,8 19,8.5" fill="white" opacity="0.9"/>
        </svg>
      ),
      sel:false
    },
    {
      code:'FR', name:'Français',
      flag: (
        <svg width="28" height="20" viewBox="0 0 28 20" style={{borderRadius:3,display:'block',flexShrink:0}}>
          <rect width="28" height="20" fill="white"/>
          <rect width="9.3" height="20" fill="#002395"/>
          <rect x="18.7" width="9.3" height="20" fill="#ED2939"/>
        </svg>
      ),
      sel:false
    },
    {
      code:'TR', name:'Türkçe',
      flag: (
        <svg width="28" height="20" viewBox="0 0 28 20" style={{borderRadius:3,display:'block',flexShrink:0}}>
          <rect width="28" height="20" fill="#E30A17"/>
          {/* White crescent */}
          <circle cx="11" cy="10" r="5" fill="white"/>
          <circle cx="13" cy="10" r="4" fill="#E30A17"/>
          {/* White star */}
          <polygon points="19,10 17.8,7.5 17,10.5 14.8,9.2 17.5,11" fill="white"/>
          <polygon points="19,10 17.8,12.5 17,9.5 14.8,10.8 17.5,9" fill="white"/>
        </svg>
      ),
      sel:false
    },
  ];
  return (
    <div style={{ width:'100%', height:'100%', background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif' }}>
      <div style={{ width:440 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:32 }}>
          <div style={{ width:32, height:6, borderRadius:3, background:t.accent }}/>
          <div style={{ width:16, height:6, borderRadius:3, background:t.rule }}/>
          <span style={{ fontSize:11, color:t.muted, marginLeft:4 }}>Step 1 of 2</span>
        </div>
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:t.accent, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
            <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke={t.panel} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          </div>
          <div style={{ ...Sf4, fontSize:26, fontWeight:700, color:t.ink, marginBottom:6 }}>Choose your language</div>
          <div style={{ fontSize:13, color:t.muted }}>Select the language you'd like to study in</div>
        </div>
        <div style={{ border:`1px solid ${t.rule}`, borderRadius:10, overflow:'hidden', marginBottom:20 }}>
          {langs.map((lang, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px', background: lang.sel ? `${t.accent}18` : t.panel, borderBottom: i < langs.length-1 ? `1px solid ${t.rule}` : 'none', cursor:'pointer' }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                {lang.flag}
                <span style={{ fontSize:10, fontWeight:700, background:`${t.accent}22`, color:t.accent, padding:'2px 7px', borderRadius:4 }}>{lang.code}</span>
                <span style={{ fontSize:14, fontWeight: lang.sel ? 600 : 400, color: lang.sel ? t.ink : t.body }}>{lang.name}</span>
              </div>
              {lang.sel && (
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </div>
          ))}
        </div>
        <div style={{ background:t.ink, color:t.panel, borderRadius:8, padding:'12px 0', fontSize:14, fontWeight:600, textAlign:'center', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          Next
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </div>
      </div>
    </div>
  );
};

// ── OnboardingTheme4 ───────────────────────────────────────────────────────
export const OnboardingTheme4: React.FC<{ t: Theme }> = ({ t }) => {
  const themes = [
    { name:'Navy & Gold',        desc:'Classic & scholarly', sel:true,
      stripes:['#0E1F3A','#B8893A','#FAF7EE','#FFFFFF'] },
    { name:'Oxblood & Cream',    desc:'Warm & literary',    sel:false,
      stripes:['#3E1414','#9C2B2B','#F6EFE5','#FFFFFF'] },
    { name:'Forest & Parchment', desc:'Calm & studious',    sel:false,
      stripes:['#1A2E1F','#5B7A3A','#A8C880','#F1EEDE'] },
    { name:'Ink & Blush',        desc:'Soft & considered',  sel:false,
      stripes:['#1B1B1F','#C5708A','#F4DDE3','#F7F2EC'] },
    { name:'Copper & Charcoal',  desc:'Earthy & refined',   sel:false,
      stripes:['#3A2A1E','#B8723A','#F0DCC0','#F4EFE5'] },
    { name:'Monochrome',         desc:'Quiet & clinical',   sel:false,
      stripes:['#111827','#374151','#9CA3AF','#FAFAFA'] },
  ];
  return (
    <div style={{ width:'100%', height:'100%', background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif' }}>
      <div style={{ width:520 }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:28 }}>
          <div style={{ width:32, height:6, borderRadius:3, background:t.accent }}/>
          <div style={{ width:32, height:6, borderRadius:3, background:t.accent }}/>
          <span style={{ fontSize:11, color:t.muted, marginLeft:4 }}>Step 2 of 2</span>
        </div>
        <div style={{ textAlign:'center', marginBottom:24 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', background:t.accent, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
            <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke={t.panel} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r="1.5"/><circle cx="17.5" cy="10.5" r="1.5"/>
              <circle cx="8.5" cy="7.5" r="1.5"/><circle cx="6.5" cy="12.5" r="1.5"/>
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>
            </svg>
          </div>
          <div style={{ ...Sf4, fontSize:26, fontWeight:700, color:t.ink, marginBottom:5 }}>Choose your theme</div>
          <div style={{ fontSize:13, color:t.muted }}>Pick a palette that matches your study style</div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
          {themes.map((theme, i) => (
            <div key={i} style={{ position:'relative', border:`2px solid ${theme.sel ? t.accent : t.rule}`, borderRadius:14, padding:'14px 14px 12px', cursor:'pointer', background:t.panel, transition:'border-color 0.15s' }}>
              {/* Multi-stripe swatch */}
              <div style={{ display:'flex', borderRadius:8, overflow:'hidden', height:32, marginBottom:10 }}>
                {theme.stripes.map((color, j) => (
                  <div key={j} style={{ flex:1, background:color }}/>
                ))}
              </div>
              <div style={{ fontSize:12, fontWeight:700, color:t.ink, marginBottom:2 }}>{theme.name}</div>
              <div style={{ fontSize:10, color:t.muted }}>{theme.desc}</div>
              {theme.sel && (
                <div style={{ position:'absolute', top:9, right:9, width:18, height:18, borderRadius:'50%', background:t.accent, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 16px', border:`1px solid ${t.rule}`, borderRadius:8, fontSize:13, color:t.body, cursor:'pointer', background:t.panel }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
          </div>
          <div style={{ flex:1, background:t.ink, color:t.panel, borderRadius:8, padding:'10px 0', fontSize:14, fontWeight:600, textAlign:'center', cursor:'pointer' }}>
            Get Started
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Pricing4 ───────────────────────────────────────────────────────────────
export const Pricing4: React.FC<{ t: Theme }> = ({ t }) => {
  const features = [
    '1,500 credits for tools & services',
    '500 credits for AI Chat included',
    '600 credits for Study Room (10 hours)',
    'Summaries, flashcards & quiz generation',
    'Save to library with goal tracking',
    'Multi-language support (EN, AR, FR, TR)',
  ];
  return (
    <div style={{ width:'100%', height:'100%', background:t.bg, fontFamily:'Inter,sans-serif', display:'flex', flexDirection:'column', overflowY:'auto' }}>
      {/* Nav bar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 32px', borderBottom:`1px solid ${t.rule}`, background:t.bg, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:7, padding:'7px 14px', borderRadius:8, background:t.accentSoft, border:`1px solid ${t.accent}44`, fontSize:13, fontWeight:500, color:t.accent, cursor:'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
          Back to Dashboard
        </div>
        <div style={{ width:32, height:32, borderRadius:8, background:t.ink, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.panel} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </div>
      </div>

      <div style={{ flex:1, overflowY:'auto' }}>
        <div style={{ maxWidth:560, margin:'0 auto', padding:'28px 24px 40px' }}>
          {/* Hero */}
          <div style={{ textAlign:'center', marginBottom:28 }}>
            <div style={{ ...Sf4, fontSize:34, fontWeight:700, color:t.ink, marginBottom:8 }}>Standard Plan</div>
            <div style={{ fontSize:14, color:t.muted, marginBottom:10 }}>Everything you need to study effectively, powered by AI.</div>
            <span style={{ fontSize:12, color:t.accent, fontWeight:500, cursor:'pointer', borderBottom:`1px dashed ${t.accent}` }}>Have a promo code?</span>
          </div>

          {/* Plan card */}
          <div style={{ border:`1px solid ${t.rule}`, borderRadius:14, overflow:'hidden', marginBottom:16, background:t.panel }}>
            <div style={{ padding:'20px 24px', background:t.panel2, borderBottom:`1px solid ${t.rule}` }}>
              <div style={{ fontSize:11, fontWeight:600, color:t.muted, letterSpacing:'0.05em', textTransform:'uppercase', marginBottom:10 }}>Billing Term</div>
              <div style={{ display:'flex', gap:8, marginBottom:16 }}>
                {[{l:'1 month',sel:true},{l:'3 months',sel:false},{l:'6 months',sel:false}].map(({l,sel},i) => (
                  <div key={i} style={{ padding:'6px 14px', borderRadius:6, border:`1px solid ${sel?t.accent:t.rule}`, background:sel?`${t.accent}18`:t.panel, fontSize:12, fontWeight:sel?600:400, color:sel?t.accent:t.muted, cursor:'pointer' }}>{l}</div>
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'baseline', gap:8, marginBottom:4 }}>
                <span style={{ ...Sf4, fontSize:38, fontWeight:700, color:t.ink }}>$15.00</span>
                <span style={{ fontSize:14, color:t.muted }}>/ month</span>
              </div>
              <div style={{ fontSize:11, color:t.muted }}>Core features included in every plan</div>
            </div>
            <div style={{ padding:'20px 24px' }}>
              {features.map((f, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:10 }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <span style={{ fontSize:13, color:t.body }}>{f}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Add-ons */}
          <div style={{ fontSize:14, fontWeight:600, color:t.ink, marginBottom:10 }}>Optional Add-ons</div>
          {[
            { title:'Extra Study Room Hours',  desc:'Additional live session time · $1.50/hr' },
            { title:'Extra AI Chat Tokens',    desc:'100k token blocks for AI assistant · $1.00/blk' },
          ].map((addon, i) => (
            <div key={i} style={{ border:`1px solid ${t.rule}`, borderRadius:10, padding:'14px 18px', marginBottom:10, background:t.panel, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <div>
                <div style={{ fontSize:13, fontWeight:600, color:t.ink, marginBottom:2 }}>{addon.title}</div>
                <div style={{ fontSize:11, color:t.muted }}>{addon.desc}</div>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:6, border:`1px solid ${t.rule}`, background:t.panel2, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </div>
                <span style={{ fontSize:13, fontWeight:600, color:t.ink, minWidth:28, textAlign:'center' }}>0</span>
                <div style={{ width:28, height:28, borderRadius:6, border:`1px solid ${t.rule}`, background:t.panel2, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2.5" strokeLinecap="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                </div>
              </div>
            </div>
          ))}

          {/* Summary + CTA */}
          <div style={{ border:`1px solid ${t.rule}`, borderRadius:12, padding:'18px 20px', background:t.panel, marginTop:16 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:t.muted, marginBottom:8 }}>
              <span>Base price</span><span style={{ color:t.ink }}>$15.00</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:15, fontWeight:700, color:t.ink, paddingTop:10, borderTop:`1px solid ${t.rule}`, marginBottom:16 }}>
              <span>Total / month</span><span>$15.00</span>
            </div>
            <div style={{ background:t.ink, color:t.panel, borderRadius:10, padding:'12px 0', fontSize:14, fontWeight:700, textAlign:'center', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              Subscribe & Get Access
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Checkout4 ──────────────────────────────────────────────────────────────

export const Checkout4: React.FC<{ t: Theme }> = ({ t }) => (
  <div style={{ width:'100%', height:'100%', background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif' }}>
    <div style={{ width:420, background:t.panel, border:`1px solid ${t.rule}`, borderRadius:16, padding:40, textAlign:'center' }}>
      {/* Spinner ring */}
      <div style={{ margin:'0 auto 24px', width:60, height:60, position:'relative' }}>
        <div style={{ width:60, height:60, borderRadius:'50%', border:`5px solid ${t.rule}`, position:'absolute', top:0, left:0 }}/>
        <div style={{ width:60, height:60, borderRadius:'50%', border:`5px solid transparent`, borderTopColor:t.accent, position:'absolute', top:0, left:0 }}/>
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:20, height:20 }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
      </div>

      <div style={{ ...Sf4, fontSize:24, fontWeight:700, color:t.ink, marginBottom:8 }}>Processing Checkout</div>
      <div style={{ fontSize:13, color:t.muted, marginBottom:28 }}>Redirecting to secure payment...</div>

      <div style={{ background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:10, padding:'16px 20px', marginBottom:20, textAlign:'left' }}>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8 }}>
          <span style={{ color:t.muted }}>Plan</span>
          <span style={{ color:t.ink, fontWeight:600 }}>Standard Plan</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, marginBottom:8 }}>
          <span style={{ color:t.muted }}>Billing</span>
          <span style={{ color:t.ink, fontWeight:600 }}>Monthly</span>
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, borderTop:`1px solid ${t.rule}`, paddingTop:8 }}>
          <span style={{ color:t.muted }}>Total</span>
          <span style={{ color:t.ink, fontWeight:700 }}>$15.00 / month</span>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6, fontSize:11, color:t.muted }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        Secured by Stripe · your payment is safe
      </div>
    </div>
  </div>
);


// ── PaymentSuccess4 ────────────────────────────────────────────────────────
export const PaymentSuccess4: React.FC<{ t: Theme }> = ({ t }) => (
  <div style={{ width:'100%', height:'100%', background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif' }}>
    <div style={{ width:520, background:t.panel, border:`1px solid ${t.rule}`, borderRadius:22, overflow:'hidden', boxShadow:`0 8px 32px ${t.ink}0d` }}>
      {/* Dark top band */}
      <div style={{ background:t.ink, padding:'30px 40px 48px', position:'relative', textAlign:'center', overflow:'hidden' }}>
        {/* Decorative accent dots */}
        {[{l:32,tp:18,s:7,o:.35},{l:460,tp:12,s:5,o:.25},{l:80,tp:52,s:4,o:.2},{l:400,tp:48,s:6,o:.3},{l:220,tp:8,s:3,o:.15}].map((d,i)=>(
          <div key={i} style={{ position:'absolute', left:d.l, top:d.tp, width:d.s, height:d.s, borderRadius:'50%', background:t.accent, opacity:d.o }} />
        ))}
        <div style={{ ...Sf4, fontSize:30, fontWeight:700, color:t.panel, position:'relative' }}>Welcome Aboard!</div>
        <div style={{ fontSize:13, color:`${t.panel}88`, marginTop:6, position:'relative' }}>Your subscription is now active</div>
      </div>
      {/* Floating green badge */}
      <div style={{ display:'flex', justifyContent:'center', marginTop:-28 }}>
        <div style={{ width:56, height:56, borderRadius:'50%', background:'#16a34a', border:`3px solid ${t.panel}`, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px #16a34a33' }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
      </div>
      {/* Content */}
      <div style={{ padding:'18px 36px 32px' }}>
        <div style={{ fontSize:13, color:t.muted, textAlign:'center', lineHeight:1.7, marginBottom:22 }}>
          You now have full access to all premium features. Start exploring what MeshFahem has to offer.
        </div>
        {/* What's Next */}
        <div style={{ background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:14, padding:'16px 20px', marginBottom:22 }}>
          <div style={{ fontSize:10, fontWeight:700, color:t.muted, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:14 }}>What's Next?</div>
          {[
            ["Generate summaries & flashcards from any document","#dcfce7","#16a34a"],
            ["Save your work to library for future reference","#dbeafe","#2563eb"],
            ["Join study rooms and collaborate with peers","#fce7f3","#db2777"],
            ["Track your progress and earn achievements","#fef3c7","#d97706"],
          ].map(([item,bg,col],i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:10, marginBottom: i<3?10:0 }}>
              <div style={{ width:22, height:22, borderRadius:'50%', background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={col} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
              <span style={{ fontSize:13, color:t.body, lineHeight:1.4 }}>{item}</span>
            </div>
          ))}
        </div>
        <div style={{ background:t.accent, color:'white', borderRadius:11, padding:'13px 0', fontSize:14, fontWeight:700, textAlign:'center', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Start Using the App
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
        </div>
        <div style={{ border:`1px solid ${t.rule}`, borderRadius:11, padding:'11px 0', fontSize:13, fontWeight:500, textAlign:'center', color:t.muted, cursor:'pointer' }}>
          View Subscription Details
        </div>
        <div style={{ fontSize:11, color:t.muted, textAlign:'center', marginTop:14 }}>
          Need help? <span style={{ color:t.accent }}>support@meshfahem.com</span>
        </div>
      </div>
    </div>
  </div>
);


// ── PaymentCancel4 ─────────────────────────────────────────────────────────
export const PaymentCancel4: React.FC<{ t: Theme }> = ({ t }) => (
  <div style={{ width:'100%', height:'100%', background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif' }}>
    <div style={{ width:500, background:t.panel, border:`1px solid ${t.rule}`, borderRadius:22, overflow:'hidden' }}>
      {/* Orange header section */}
      <div style={{ background:'#fff7ed', borderBottom:'1px solid #fed7aa', padding:'28px 36px 24px', textAlign:'center' }}>
        <div style={{ width:60, height:60, borderRadius:'50%', background:'#ffedd5', border:'2px solid #fdba74', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px', boxShadow:'0 4px 14px #fb923c22' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <div style={{ ...Sf4, fontSize:26, fontWeight:700, color:'#9a3412' }}>Payment Canceled</div>
        <div style={{ fontSize:12, color:'#c2410c', marginTop:5, lineHeight:1.5 }}>No charges have been made to your account.</div>
      </div>
      {/* Content */}
      <div style={{ padding:'22px 32px 28px' }}>
        {/* Two-col info */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:18 }}>
          {[
            { title:'Common Issues', items:['Card declined','Session timed out','Browser back button'], dot:'#ea580c' },
            { title:'What You Can Do', items:['Review payment info','Try a different card','Contact your bank'], dot:t.accent },
          ].map((col,ci) => (
            <div key={ci} style={{ background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:12, padding:'14px 16px' }}>
              <div style={{ fontSize:10, fontWeight:700, color:t.muted, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:10 }}>{col.title}</div>
              {col.items.map((item,i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:7, marginBottom: i<2?7:0 }}>
                  <div style={{ width:5, height:5, borderRadius:'50%', background:col.dot, flexShrink:0 }} />
                  <span style={{ fontSize:12, color:t.body }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* Support banner */}
        <div style={{ background:t.accentSoft, border:`1px solid ${t.accent}33`, borderRadius:11, padding:'11px 16px', marginBottom:18, display:'flex', alignItems:'center', gap:10 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span style={{ fontSize:12, color:t.body, lineHeight:1.5 }}>Our support team is ready to help you complete your purchase.</span>
        </div>
        <div style={{ background:t.ink, color:t.panel, borderRadius:11, padding:'12px 0', fontSize:14, fontWeight:700, textAlign:'center', cursor:'pointer', marginBottom:10, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.18-3.36"/>
          </svg>
          Try Again
        </div>
        <div style={{ border:`1px solid ${t.rule}`, borderRadius:11, padding:'11px 0', fontSize:13, fontWeight:500, textAlign:'center', color:t.body, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          Return to Dashboard
        </div>
        <div style={{ fontSize:11, color:t.muted, textAlign:'center', marginTop:12 }}>
          Questions? <span style={{ color:t.accent }}>support@meshfahem.com</span>
        </div>
      </div>
    </div>
  </div>
);


// ── AccountSuspended4 ──────────────────────────────────────────────────────
export const AccountSuspended4: React.FC<{ t: Theme }> = ({ t }) => (
  <div style={{ width:'100%', height:'100%', background:t.bg, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Inter,sans-serif' }}>
    <div style={{ width:460, background:t.panel, border:`1px solid ${t.rule}`, borderRadius:22, overflow:'hidden' }}>
      {/* Red header band — semantic, always red */}
      <div style={{ background:'#fef2f2', borderBottom:'1px solid #fecaca', padding:'28px 36px 24px', textAlign:'center' }}>
        <div style={{ width:60, height:60, borderRadius:'50%', background:'#fee2e2', border:'2px solid #fca5a5', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
          </svg>
        </div>
        <div style={{ ...Sf4, fontSize:24, fontWeight:700, color:'#991b1b' }}>Account Suspended</div>
        <div style={{ fontSize:12, color:'#b91c1c', marginTop:6, lineHeight:1.5 }}>Your account cannot access the platform.</div>
      </div>
      {/* Content */}
      <div style={{ padding:'20px 28px 28px' }}>
        {/* Reason box */}
        <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:12, padding:'14px 16px', marginBottom:10, display:'flex', alignItems:'flex-start', gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'#fee2e2', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:'#991b1b', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>Reason</div>
            <div style={{ fontSize:13, color:'#b91c1c', lineHeight:1.5 }}>Violation of community guidelines — repeated policy breach.</div>
          </div>
        </div>
        {/* Expiry box */}
        <div style={{ background:'#eff6ff', border:'1px solid #bfdbfe', borderRadius:12, padding:'14px 16px', marginBottom:14, display:'flex', alignItems:'flex-start', gap:10 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:'#dbeafe', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize:10, fontWeight:700, color:'#1e40af', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>Suspension Expires</div>
            <div style={{ fontSize:13, fontWeight:600, color:'#1d4ed8', marginBottom:3 }}>June 20, 2026 at 12:00 PM</div>
            <div style={{ fontSize:11, color:'#3b82f6' }}>Access restored automatically after this date.</div>
          </div>
        </div>
        {/* Appeal note */}
        <div style={{ background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:10, padding:'10px 14px', marginBottom:18, fontSize:12, color:t.muted, textAlign:'center', lineHeight:1.5 }}>
          If you believe this is an error, contact support to appeal your suspension.
        </div>
        <div style={{ background:t.ink, color:t.panel, borderRadius:11, padding:'11px 0', fontSize:13, fontWeight:600, textAlign:'center', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </div>
        <div style={{ fontSize:11, color:t.muted, textAlign:'center', marginTop:12 }}>
          Need help? <span style={{ color:'#3b82f6', cursor:'pointer' }}>support@meshfahem.com</span>
        </div>
      </div>
    </div>
  </div>
);


// ── ShareView4 ─────────────────────────────────────────────────────────────
export const ShareView4: React.FC<{ t: Theme }> = ({ t }) => (
  <div style={{ width:'100%', height:'100%', fontFamily:'Inter,sans-serif', display:'flex', flexDirection:'column', background:t.bg }}>
    {/* Dark branded header — same visual weight as internal ContentView */}
    <div style={{ background:t.sb, height:52, display:'flex', alignItems:'center', padding:'0 20px', gap:14, flexShrink:0 }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <div style={{ width:26, height:26, background:t.accent, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
          </svg>
        </div>
        <span style={{ fontSize:13, fontWeight:600, color:t.sbInk }}>MeshFahem</span>
      </div>
      <div style={{ width:1, height:18, background:`${t.sbInk}28` }} />
      {/* Document title */}
      <span style={{ fontSize:13, fontWeight:500, color:`${t.sbInk}cc` }}>Game Theory — Week 3: Strategic Interactions</span>
      <div style={{ flex:1 }} />
      {/* Mode tabs */}
      <div style={{ display:'flex', alignItems:'center', gap:3 }}>
        {[['Read', false],['Book Mode', true]].map(([label, active], i) => (
          <div key={i} style={{ padding:'5px 12px', borderRadius:6, fontSize:12, fontWeight: active?700:400, background: active?t.accent:'transparent', color: active?'white':`${t.sbInk}88`, cursor:'pointer' }}>
            {label}
          </div>
        ))}
      </div>
      {/* Public CTA */}
      <div style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', border:`1px solid ${t.accent}66`, borderRadius:7, fontSize:12, color:t.accent, fontWeight:500, cursor:'pointer' }}>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
        Get MeshFahem
      </div>
    </div>

    {/* Two-panel body */}
    <div style={{ flex:1, display:'flex', overflow:'hidden' }}>
      {/* ── Left: document reader ── */}
      <div style={{ flex:'0 0 62%', background:t.bg, display:'flex', flexDirection:'column', borderRight:`1px solid ${t.rule}` }}>
        <div style={{ flex:1, padding:'28px 36px', overflowY:'auto' }}>
          {/* Breadcrumb */}
          <div style={{ fontSize:10, fontWeight:700, color:t.accent, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>
            Game Theory · Course Materials
          </div>
          {/* Title row */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
            <div style={{ ...Sf4, fontSize:22, fontWeight:700, color:t.ink, lineHeight:1.3, flex:1 }}>Game Theory — Week 3: Strategic Interactions</div>
            <div style={{ fontSize:11, color:t.muted, flexShrink:0, marginLeft:16, marginTop:4 }}>Page 1 of 4</div>
          </div>
          {/* Content sections */}
          {[
            { h:"Nash Equilibrium", p:"A Nash Equilibrium is a set of strategies, one for each player in a game, such that no player has an incentive to deviate unilaterally. It represents a stable state where each player's strategy is a best response to the strategies of all other players." },
            { h:"Dominant Strategies", p:"A dominant strategy is one that yields the highest payoff for a player regardless of the strategies chosen by other players. When a dominant strategy exists, rational players will always choose it, simplifying the analysis of strategic interactions." },
            { h:"The Prisoner's Dilemma", p:"The Prisoner's Dilemma illustrates a situation where two individually rational decisions lead to a collectively suboptimal outcome. Both prisoners, reasoning individually, choose to defect — even though both would be better off cooperating." },
          ].map((s, i) => (
            <div key={i} style={{ marginBottom:22 }}>
              <div style={{ fontSize:10, fontWeight:700, color:t.accent, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:9 }}>{s.h}</div>
              <div style={{ fontSize:14, color:t.body, lineHeight:1.85 }}>{s.p}</div>
            </div>
          ))}
          <div style={{ fontSize:13, color:t.muted, fontStyle:'italic', marginTop:16 }}>Continue on the next page →</div>
        </div>
        {/* Pagination bar */}
        <div style={{ borderTop:`1px solid ${t.rule}`, padding:'10px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ padding:'6px 14px', border:`1px solid ${t.rule}`, borderRadius:7, fontSize:12, color:t.muted }}>← Prev</div>
          <div style={{ display:'flex', gap:5, alignItems:'center' }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width:i===0?22:8, height:8, borderRadius:4, background:i===0?t.accent:t.rule }} />
            ))}
          </div>
          <div style={{ padding:'6px 14px', border:`1px solid ${t.rule}`, borderRadius:7, fontSize:12, color:t.body, fontWeight:500, cursor:'pointer' }}>Next →</div>
        </div>
      </div>

      {/* ── Right: flashcards + notes ── */}
      <div style={{ flex:1, background:t.panel, display:'flex', flexDirection:'column' }}>
        {/* Flashcard panel */}
        <div style={{ flex:'0 0 auto', padding:'16px 18px', borderBottom:`1px solid ${t.rule}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontSize:10, fontWeight:700, color:t.muted, letterSpacing:'0.12em', textTransform:'uppercase' }}>Flashcards</div>
            <div style={{ fontSize:11, color:t.muted }}>Card 1 / 3</div>
          </div>
          {/* Question */}
          <div style={{ background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:10, padding:'13px 15px', marginBottom:8 }}>
            <div style={{ fontSize:9, fontWeight:700, color:t.accent, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:7 }}>Question</div>
            <div style={{ fontSize:13, fontWeight:600, color:t.ink, lineHeight:1.5 }}>What is a Nash Equilibrium, and why is it "stable"?</div>
          </div>
          {/* Answer */}
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:10, padding:'13px 15px', marginBottom:12 }}>
            <div style={{ fontSize:9, fontWeight:700, color:t.muted, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:7 }}>Answer</div>
            <div style={{ fontSize:12, color:t.body, lineHeight:1.6 }}>A state where no player can improve their outcome by changing strategy alone. Stable because each player's strategy is already optimal given others' choices.</div>
          </div>
          {/* Public sign-up nudge instead of SRS buttons */}
          <div style={{ background:t.accentSoft, border:`1px solid ${t.accent}33`, borderRadius:9, padding:'9px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:11, color:t.body }}>Track your SRS progress</span>
            <div style={{ padding:'4px 10px', background:t.accent, borderRadius:6, fontSize:11, color:'white', fontWeight:600, cursor:'pointer' }}>Sign Up Free</div>
          </div>
        </div>

        {/* Notes panel */}
        <div style={{ flex:1, padding:'14px 18px', overflowY:'auto' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <div style={{ fontSize:10, fontWeight:700, color:t.muted, letterSpacing:'0.12em', textTransform:'uppercase' }}>Notes</div>
          </div>
          <div style={{ fontSize:13, color:t.body, lineHeight:2 }}>
            {[
              "Nash Eq = no unilateral gain",
              "Dominant strategy → always best regardless of opponent",
              "Prisoner's Dilemma = collective action failure",
              "Folk Theorem → cooperation sustainable if δ high",
            ].map((note, i) => (
              <div key={i} style={{ color: i===0 ? t.accent : t.body }}>{note}</div>
            ))}
          </div>
          <div style={{ marginTop:14, padding:'9px 12px', background:t.panel2, border:`1px dashed ${t.rule}`, borderRadius:8, fontSize:11, color:t.muted, fontStyle:'italic' }}>
            Sign in to save your own notes…
          </div>
        </div>

        {/* Status bar */}
        <div style={{ borderTop:`1px solid ${t.rule}`, padding:'9px 18px', display:'flex', gap:18, fontSize:10, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase', color:t.muted, flexShrink:0 }}>
          <span>Page <strong style={{ color:t.body }}>1 / 4</strong></span>
          <span>Cards <strong style={{ color:t.body }}>3</strong></span>
          <span>Mastered <strong style={{ color:t.accent }}>1 / 3</strong></span>
        </div>
      </div>
    </div>
  </div>
);


// ── Informational4 ─────────────────────────────────────────────────────────
export const Informational4: React.FC<{ t: Theme }> = ({ t }) => {
  const features = [
    { bg:'#dbeafe', stroke:'#2563eb', icon:"M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6", title:"Smart Summaries", desc:"Upload any PDF or text and get a structured AI-generated summary in seconds." },
    { bg:'#d1fae5', stroke:'#059669', icon:"M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", title:"Interactive Flashcards", desc:"Auto-generated flashcards with multiple study modes: flip, MCQ, fill-in-blank." },
    { bg:'#ede9fe', stroke:'#7c3aed', icon:"M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 0 1 6.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129", title:"Multi-language", desc:"Study in English, Arabic, French, or Turkish — switch anytime." },
  ];
  const steps = [
    { n:"1", title:"Upload Content", desc:"Drag & drop a PDF (up to 200 pages) or paste text. OCR available for scanned documents." },
    { n:"2", title:"Configure Settings", desc:"Choose flashcard count, generation source (full text or summary), and toggle Medical Mode." },
    { n:"3", title:"Process & Study", desc:"Choose Fast Mode (quick) or Staged Mode (detailed). Results ready in seconds." },
    { n:"4", title:"Save to Library", desc:"Save with tags and topics. Share via public link. Track progress with SRS scheduling." },
  ];
  const modes = [
    { col:'#2563eb', icon:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 0 0 1 1h3m10-11l2 2m-2-2v10a1 1 0 0 0-1 1h-3m-6 0a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1m-6 0h6", label:"Flip Cards" },
    { col:'#7c3aed', icon:"M11 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-5m-1.414-9.414a2 2 0 1 1 2.828 2.828L11.828 15H9v-2.828l8.586-8.586z", label:"Type Answer" },
    { col:'#059669', icon:"M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9l2 2 4-4", label:"Multiple Choice" },
    { col:'#d97706', icon:"M4 6h16M4 12h8m-8 6h16", label:"Fill in Blank" },
    { col:'#dc2626', icon:"M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z", label:"True / False" },
    { col:'#6b7280', icon:"M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z", label:"View All" },
  ];
  const smartFeatures = [
    { bg:'#d1fae5', stroke:'#059669', title:'Intelligent Deduplication', desc:'Previously processed content loads in seconds. Smart fingerprinting detects duplicates automatically.' },
    { bg:'#fef3c7', stroke:'#d97706', title:'365-Day History Retention', desc:'All processed content is saved for one full year, giving long-term access to your study materials.' },
    { bg:'#ede9fe', stroke:'#7c3aed', title:'Dark Mode & 6 Themes', desc:'6 color themes with light & dark modes. Follows system preference for comfortable studying.' },
  ];
  const tips = [
    { icon:"📝", title:"Better Summaries", items:["Use well-structured PDFs","Include table of contents","Prefer text-selectable files","Split very large docs"] },
    { icon:"🎯", title:"Effective Study", items:["Review flashcards daily","Use SRS scheduling","Mix study modes","Set exam target dates"] },
    { icon:"🏥", title:"Medical Mode", items:["Enable for clinical content","Gets anatomical precision","Covers drug interactions","Includes clinical guidelines"] },
  ];
  return (
    <Shell4 t={t} active="">
      <div style={{ display:'flex', flexDirection:'column', height:'100%', overflow:'hidden' }}>
        <Title4 t={t} title="How to Use" sub="Complete guide to MeshFahem features & workflow"
          IconC={(c,s) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
        />
        <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:16, paddingBottom:20 }}>

          {/* Overview */}
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:14, padding:'20px 24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
              <div style={{ width:30, height:30, background:t.accentSoft, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <span style={{ ...Sf4, fontSize:18, fontWeight:700, color:t.ink }}>Overview</span>
            </div>
            <div style={{ fontSize:13, color:t.body, lineHeight:1.7, marginBottom:14 }}>
              MeshFahem is an AI-powered study platform that transforms any document into structured summaries, flashcards, and quizzes. Study in your language, at your own pace — from a PDF, paste, or URL.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
              {features.map((f,i) => (
                <div key={i} style={{ background:f.bg, borderRadius:12, padding:'16px' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={f.stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:8}}><path d={f.icon}/></svg>
                  <div style={{ fontSize:12, fontWeight:700, color:'#111827', marginBottom:4 }}>{f.title}</div>
                  <div style={{ fontSize:11, color:'#374151', lineHeight:1.5 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Getting Started */}
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:14, padding:'20px 24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:30, height:30, background:'#d1fae5', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
              </div>
              <span style={{ ...Sf4, fontSize:18, fontWeight:700, color:t.ink }}>Getting Started</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
              {steps.map((s,i) => (
                <div key={i} style={{ background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:12, padding:'14px 16px', display:'flex', gap:12 }}>
                  <div style={{ width:28, height:28, borderRadius:8, background:t.accentSoft, color:t.accent, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, flexShrink:0 }}>{s.n}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:t.ink, marginBottom:4 }}>{s.title}</div>
                    <div style={{ fontSize:11, color:t.muted, lineHeight:1.5 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Understanding Results — flashcard study modes */}
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:14, padding:'20px 24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:30, height:30, background:'#dbeafe', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.663 17h4.673M12 3v1m6.364 1.636-.707.707M21 12h-1M4 12H3m3.343-5.657-.707-.707m2.828 9.9a5 5 0 1 1 7.072 0l-.548.547A3.374 3.374 0 0 0 14 18.469V19a2 2 0 1 1-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
              </div>
              <span style={{ ...Sf4, fontSize:18, fontWeight:700, color:t.ink }}>Understanding Results</span>
            </div>
            <div style={{ fontSize:12, color:t.muted, marginBottom:12 }}>Flashcard study modes — choose the one that fits your learning style:</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(6,1fr)', gap:8 }}>
              {modes.map((m,i) => (
                <div key={i} style={{ background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:10, padding:'12px 10px', textAlign:'center' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={m.col} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{margin:'0 auto 6px'}}><path d={m.icon}/></svg>
                  <div style={{ fontSize:10, fontWeight:600, color:t.body, lineHeight:1.3 }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Smart Features */}
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:14, padding:'20px 24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:30, height:30, background:t.accentSoft, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
              </div>
              <span style={{ ...Sf4, fontSize:18, fontWeight:700, color:t.ink }}>Smart Features</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
              {smartFeatures.map((sf,i) => (
                <div key={i} style={{ background:sf.bg, borderRadius:12, padding:'14px 16px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={sf.stroke} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{marginBottom:8}}><path d={sf.icon}/></svg>
                  <div style={{ fontSize:12, fontWeight:700, color:'#111827', marginBottom:4 }}>{sf.title}</div>
                  <div style={{ fontSize:11, color:'#374151', lineHeight:1.5 }}>{sf.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips & Best Practices */}
          <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:14, padding:'20px 24px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
              <div style={{ width:30, height:30, background:t.accentSoft, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={t.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <span style={{ ...Sf4, fontSize:18, fontWeight:700, color:t.ink }}>Tips & Best Practices</span>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:12 }}>
              {tips.map((tip,i) => (
                <div key={i} style={{ background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:12, padding:'14px 16px' }}>
                  <div style={{ fontSize:18, marginBottom:8 }}>{tip.icon}</div>
                  <div style={{ fontSize:12, fontWeight:700, color:t.ink, marginBottom:8 }}>{tip.title}</div>
                  {tip.items.map((item,j) => (
                    <div key={j} style={{ display:'flex', alignItems:'flex-start', gap:6, marginBottom: j<3?5:0 }}>
                      <div style={{ width:4, height:4, borderRadius:'50%', background:t.accent, flexShrink:0, marginTop:5 }} />
                      <span style={{ fontSize:11, color:t.muted, lineHeight:1.4 }}>{item}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          {/* Support */}
          <div style={{ background:t.accentSoft, border:`1px solid ${t.accent}33`, borderRadius:14, padding:'20px 24px', textAlign:'center' }}>
            <div style={{ ...Sf4, fontSize:18, fontWeight:700, color:t.ink, marginBottom:6 }}>Need Help?</div>
            <div style={{ fontSize:13, color:t.body, marginBottom:16, lineHeight:1.6 }}>
              Contact our support team or explore the platform — MeshFahem is designed to be intuitive from day one.
            </div>
            <div style={{ display:'flex', justifyContent:'center', gap:10 }}>
              {[['Quick Start','Upload your first document and get results instantly'],['Experiment','Try different study modes to find what works'],['Organize','Use library tags and folders to stay on track']].map(([title,desc],i) => (
                <div key={i} style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:12, padding:'14px 18px', flex:'0 1 220px', textAlign:'left' }}>
                  <div style={{ fontSize:12, fontWeight:700, color:t.ink, marginBottom:4 }}>{title}</div>
                  <div style={{ fontSize:11, color:t.muted, lineHeight:1.4 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Shell4>
  );
};


// ── GroupChat4 ───────────────────────────────────────────────────────────────
export const GroupChat4: React.FC<{ t: Theme }> = ({ t }) => {
  const uCol = { 'Sara K.':'#6366f1', 'Omar R.':'#0ea5e9', 'Lina M.':'#10b981' };
  const msgs = [
    { own:false, name:'Sara K.',  ini:'SK', time:'9:41 AM', text:'Just finished the Nash Equilibrium section — anyone else find dominant strategies a bit tricky?', rx:[{e:'🤔',n:3}] },
    { own:false, name:'Omar R.',  ini:'OR', time:'9:43 AM', text:"The Prisoner's Dilemma helped me get it. Think of it as everyone acting selfishly leads to a bad outcome for all.", rx:[{e:'💡',n:4}] },
    { own:true,  name:'You',      ini:'ME', time:'9:44 AM', text:'That analogy is perfect. I made flashcards for each equilibrium type — want me to share the deck?', rx:[{e:'🙌',n:5}] },
    { own:false, name:'Lina M.',  ini:'LM', time:'9:46 AM', text:'Please do! Is anyone joining the live session at 7 PM? The TA covers Folk Theorem.', rx:[{e:'✅',n:3},{e:'📅',n:2}] },
    { own:true,  name:'You',      ini:'ME', time:'9:48 AM', text:"I'll be there. Sharing the deck now.", rx:[] },
    { own:false, name:'Sara K.',  ini:'SK', time:'9:49 AM', text:'Amazing, thank you! This group is so helpful.', rx:[{e:'❤️',n:4}] },
  ];
  const members = [
    { ini:'SK', color:'#6366f1', online:true  },
    { ini:'OR', color:'#0ea5e9', online:true  },
    { ini:'LM', color:'#10b981', online:true  },
    { ini:'AH', color:'#f59e0b', online:false },
    { ini:'NB', color:'#8b5cf6', online:false },
  ];
  return (
    <Shell4 t={t} active="rooms">
      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column' }}>

        {/* ── Header ── */}
        <div style={{ background:t.panel, borderBottom:`1px solid ${t.rule}`, padding:'0 18px', height:58, display:'flex', alignItems:'center', gap:12, flexShrink:0, boxShadow:'0 1px 8px rgba(0,0,0,0.07)' }}>
          <div style={{ position:'relative' }}>
            <div style={{ width:38, height:38, borderRadius:11, background:`linear-gradient(140deg, ${t.accent}, ${t.accent}99)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'white', boxShadow:`0 3px 10px ${t.accent}45` }}>M</div>
            <div style={{ position:'absolute', bottom:0, right:0, width:10, height:10, borderRadius:'50%', background:'#22c55e', border:`2px solid ${t.panel}` }} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:14, fontWeight:700, color:t.ink }}>MedStudy Squad</div>
            <div style={{ fontSize:11, color:t.muted, marginTop:1 }}>Game Theory · Week 3 &nbsp;·&nbsp; 8 members</div>
          </div>
          {/* Stacked member avatars */}
          <div style={{ display:'flex', alignItems:'center', marginRight:4 }}>
            {members.map((m, i) => (
              <div key={i} style={{ width:22, height:22, borderRadius:6, background:m.color, border:`2px solid ${t.panel}`, marginLeft: i>0?-7:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:7, fontWeight:700, color:'white', zIndex:10-i, opacity: m.online?1:0.5 }}>{m.ini}</div>
            ))}
            <span style={{ fontSize:10, color:t.muted, marginLeft:8 }}>3 online</span>
          </div>
          {[
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>,
          ].map((icon, i) => (
            <div key={i} style={{ width:30, height:30, borderRadius:7, background:t.panel2, border:`1px solid ${t.rule}`, display:'flex', alignItems:'center', justifyContent:'center', color:t.muted, cursor:'pointer' }}>{icon}</div>
          ))}
        </div>

        {/* ── Messages ── */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px 18px', display:'flex', flexDirection:'column', background:t.bg, backgroundImage:`radial-gradient(${t.rule}55 1px, transparent 1px)`, backgroundSize:'28px 28px' }}>

          {/* Date chip */}
          <div style={{ display:'flex', justifyContent:'center', marginBottom:18 }}>
            <div style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:20, padding:'3px 13px', fontSize:9, fontWeight:700, color:t.muted, letterSpacing:'0.08em', textTransform:'uppercase', boxShadow:'0 1px 4px rgba(0,0,0,0.06)' }}>TODAY · MAY 10</div>
          </div>

          {msgs.map((m, i) => {
            const col = uCol[m.name] || t.accent;
            const prevSame = i > 0 && msgs[i-1].name === m.name;
            const nextSame = i < msgs.length-1 && msgs[i+1].name === m.name;
            const isFirst = !prevSame;
            const isLast  = !nextSame;
            // Grouped bubble radii: flatten the edge facing consecutive messages
            const rOther = `${isFirst?4:4}px 18px ${isLast?18:6}px ${isFirst?18:4}px`;
            const rOwn   = `18px ${isFirst?4:4}px ${isFirst?6:18}px 18px`;
            return (
              <div key={i} style={{ display:'flex', flexDirection: m.own?'row-reverse':'row', alignItems:'flex-start', gap:10, marginBottom: isLast ? 14 : 3 }}>
                {/* Avatar column — fixed 34px width keeps bubbles aligned */}
                <div style={{ width:34, flexShrink:0, paddingTop: isFirst ? 22 : 0 }}>
                  {!m.own && isFirst && (
                    <div style={{ width:34, height:34, borderRadius:10, background:col, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'white', boxShadow:`0 2px 8px ${col}44` }}>{m.ini}</div>
                  )}
                </div>
                {/* Message column */}
                <div style={{ maxWidth:'66%', display:'flex', flexDirection:'column', alignItems: m.own?'flex-end':'flex-start' }}>
                  {/* Name + time — only on first bubble of group */}
                  {!m.own && isFirst && (
                    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:5 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:col }}>{m.name}</span>
                      <span style={{ fontSize:10, color:t.muted }}>{m.time}</span>
                    </div>
                  )}
                  {/* Bubble */}
                  <div style={{ background: m.own?t.accent:t.panel, color: m.own?'white':t.body, padding:'10px 14px', borderRadius: m.own?rOwn:rOther, fontSize:13, lineHeight:1.65, wordBreak:'break-word', boxShadow: m.own?`0 3px 14px ${t.accent}38`:'0 1px 5px rgba(0,0,0,0.08)' }}>{m.text}</div>
                  {/* Foot row — time (own) + reactions, only on last bubble of group */}
                  {isLast && (m.own || m.rx.length > 0) && (
                    <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:5, flexDirection: m.own?'row-reverse':'row', flexWrap:'wrap' }}>
                      {m.own && <span style={{ fontSize:9, color:t.muted }}>{m.time}</span>}
                      {m.rx.map((r, j) => (
                        <div key={j} style={{ display:'inline-flex', alignItems:'center', gap:3, padding:'2px 8px', background:t.panel, border:`1px solid ${t.rule}`, borderRadius:12, fontSize:11, cursor:'pointer', boxShadow:'0 1px 3px rgba(0,0,0,0.05)' }}>
                          {r.e}<span style={{ fontSize:9, fontWeight:700, color:t.muted, marginLeft:2 }}>{r.n}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          <div style={{ display:'flex', alignItems:'flex-end', gap:10, marginTop:4 }}>
            <div style={{ width:34, flexShrink:0 }}>
              <div style={{ width:34, height:34, borderRadius:10, background:'#10b981', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'white', boxShadow:'0 2px 8px #10b98144' }}>LM</div>
            </div>
            <div style={{ background:t.panel, borderRadius:'4px 18px 18px 18px', padding:'12px 16px', display:'flex', gap:5, alignItems:'center', boxShadow:'0 1px 5px rgba(0,0,0,0.08)' }}>
              {[0,1,2].map(d => <div key={d} style={{ width:7, height:7, borderRadius:'50%', background:t.muted, opacity:0.35 + d*0.25 }} />)}
            </div>
          </div>
        </div>

        {/* ── Input bar ── */}
        <div style={{ background:t.panel, borderTop:`1px solid ${t.rule}`, padding:'10px 18px', display:'flex', alignItems:'center', gap:8, flexShrink:0, boxShadow:'0 -2px 10px rgba(0,0,0,0.05)' }}>
          {[
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>,
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
          ].map((icon, i) => (
            <div key={i} style={{ width:32, height:32, borderRadius:8, background:t.panel2, border:`1px solid ${t.rule}`, display:'flex', alignItems:'center', justifyContent:'center', color:t.muted, cursor:'pointer' }}>{icon}</div>
          ))}
          <div style={{ flex:1, background:t.bg, border:`1.5px solid ${t.rule}`, borderRadius:24, padding:'9px 18px', fontSize:13, color:t.muted }}>Message MedStudy Squad…</div>
          <div style={{ width:38, height:38, borderRadius:11, background:t.accent, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:`0 3px 12px ${t.accent}45`, flexShrink:0 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </div>
        </div>

      </div>
    </Shell4>
  );
};



// ── ContentViewMindMap4 ──────────────────────────────────────────────────────
export const ContentViewMindMap4: React.FC<{ t: Theme }> = ({ t }) => {
  const nodes = [
    { id:'root', x:490, y:28,  w:180, h:42, label:'Game Theory',         lvl:0 },
    { id:'n1',   x:60,  y:160, w:172, h:40, label:'Nash Equilibrium',     lvl:1 },
    { id:'n2',   x:460, y:160, w:172, h:40, label:'Dominant Strategies',  lvl:1 },
    { id:'n3',   x:860, y:160, w:165, h:40, label:"Prisoner's Dilemma",   lvl:1 },
    { id:'n4',   x:18,  y:296, w:128, h:36, label:'Best Response',        lvl:2 },
    { id:'n5',   x:165, y:296, w:92,  h:36, label:'Stability',            lvl:2 },
    { id:'n6',   x:418, y:296, w:140, h:36, label:'Rational Choice',      lvl:2 },
    { id:'n7',   x:580, y:296, w:128, h:36, label:'Pareto Efficient',     lvl:2 },
    { id:'n8',   x:832, y:296, w:122, h:36, label:'Defect–Defect',        lvl:2 },
    { id:'n9',   x:978, y:296, w:118, h:36, label:'Folk Theorem',         lvl:2 },
    { id:'n10',  x:962, y:412, w:132, h:34, label:'Repeated Games',       lvl:3 },
  ];
  const edges = [
    ['root','n1'],['root','n2'],['root','n3'],
    ['n1','n4'],['n1','n5'],
    ['n2','n6'],['n2','n7'],
    ['n3','n8'],['n3','n9'],
    ['n9','n10'],
  ];
  const nodeById = {};
  nodes.forEach(n => nodeById[n.id] = n);
  const cx = n => n.x + n.w/2;
  const lvlBg = [t.accent, t.accentSoft, t.panel2, t.panel];
  const lvlColor = ['white', t.ink, t.ink, t.body];
  const lvlBorder = ['none', `1.5px solid ${t.accent}55`, `1px solid ${t.rule}`, `1px solid ${t.rule}`];
  const canvasH = 490;
  const canvasW = 1160;
  return (
    <div style={{ width:'100%', height:'100%', fontFamily:'Inter,sans-serif', display:'flex', flexDirection:'column', background:t.bg }}>
      {/* Header */}
      <div style={{ background:t.sb, height:52, display:'flex', alignItems:'center', padding:'0 20px', gap:14, flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:26, height:26, background:t.accent, borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <span style={{ fontSize:13, fontWeight:600, color:t.sbInk }}>MeshFahem</span>
        </div>
        <div style={{ width:1, height:18, background:`${t.sbInk}28` }} />
        <span style={{ fontSize:13, fontWeight:500, color:`${t.sbInk}cc` }}>Game Theory — Week 3</span>
        <div style={{ flex:1 }} />
        {/* Mode tabs */}
        <div style={{ display:'flex', alignItems:'center', gap:3 }}>
          {[['Read',false],['Book Mode',false],['Audio',false],['Mind Map',true]].map(([label, active], i) => (
            <div key={i} style={{ padding:'5px 12px', borderRadius:6, fontSize:12, fontWeight: active?700:400, background: active?t.accent:'transparent', color: active?'white':`${t.sbInk}88`, cursor:'pointer' }}>
              {label}
            </div>
          ))}
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 12px', border:`1px solid ${t.accent}66`, borderRadius:7, fontSize:12, color:t.accent, fontWeight:500, cursor:'pointer' }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
          </svg>
          Share
        </div>
      </div>

      {/* Hint bar */}
      <div style={{ background:t.panel, borderBottom:`1px solid ${t.rule}`, padding:'7px 24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
        <div style={{ fontSize:11, color:t.muted }}>
          <span style={{ background:t.accentSoft, color:t.accent, padding:'2px 8px', borderRadius:5, fontWeight:600, marginRight:8 }}>AI Generated</span>
          Concept map based on your document · Drag to pan · Scroll to zoom
        </div>
        <div style={{ padding:'5px 14px', background:t.accent, borderRadius:7, fontSize:11, color:'white', fontWeight:600, cursor:'pointer' }}>↺ Regenerate</div>
      </div>

      {/* Canvas */}
      <div style={{ flex:1, overflow:'hidden', position:'relative', background:t.bg,
        backgroundImage:`linear-gradient(${t.rule}40 1px, transparent 1px), linear-gradient(90deg, ${t.rule}40 1px, transparent 1px)`,
        backgroundSize:'32px 32px' }}>
        <div style={{ position:'absolute', top:20, left:20, right:20, bottom:20 }}>
          {/* SVG edges */}
          <svg style={{ position:'absolute', top:0, left:0, width:canvasW, height:canvasH, overflow:'visible', pointerEvents:'none' }}>
            {edges.map(([from, to], i) => {
              const s = nodeById[from], tgt = nodeById[to];
              const sx = cx(s), sy = s.y + s.h;
              const tx = cx(tgt), ty = tgt.y;
              const mid = (sy + ty) / 2;
              return (
                <path key={i}
                  d={`M ${sx} ${sy} C ${sx} ${mid} ${tx} ${mid} ${tx} ${ty}`}
                  fill="none" stroke={`${t.accent}60`} strokeWidth="1.5" strokeDasharray="5,3"
                />
              );
            })}
          </svg>
          {/* Nodes */}
          {nodes.map(n => (
            <div key={n.id} style={{
              position:'absolute', left:n.x, top:n.y, width:n.w, height:n.h,
              background: lvlBg[n.lvl], border: lvlBorder[n.lvl],
              borderRadius: n.lvl===0 ? 12 : n.lvl===1 ? 10 : 8,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize: n.lvl===0 ? 13 : n.lvl===1 ? 12 : 11,
              fontWeight: n.lvl===0 ? 700 : n.lvl===1 ? 600 : 500,
              color: lvlColor[n.lvl],
              boxShadow: n.lvl===0 ? `0 4px 16px ${t.accent}40` : n.lvl===1 ? `0 2px 8px rgba(0,0,0,0.1)` : `0 1px 4px rgba(0,0,0,0.06)`,
              cursor:'pointer', textAlign:'center', padding:'0 10px',
            }}>{n.label}</div>
          ))}
        </div>

        {/* Zoom controls */}
        <div style={{ position:'absolute', bottom:20, left:20, display:'flex', flexDirection:'column', gap:4 }}>
          {['+','−'].map((sym, i) => (
            <div key={i} style={{ width:32, height:32, borderRadius:8, background:t.panel, border:`1px solid ${t.rule}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, color:t.body, cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>{sym}</div>
          ))}
          <div style={{ width:32, height:32, borderRadius:8, background:t.panel, border:`1px solid ${t.rule}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:600, color:t.muted, cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>FIT</div>
        </div>

        {/* Mini-map */}
        <div style={{ position:'absolute', bottom:20, right:20, width:140, height:80, background:t.panel, border:`1px solid ${t.rule}`, borderRadius:10, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.1)', padding:6 }}>
          <div style={{ fontSize:8, fontWeight:700, color:t.muted, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>MAP</div>
          <div style={{ position:'relative', width:'100%', height:54 }}>
            {nodes.map(n => (
              <div key={n.id} style={{
                position:'absolute',
                left: `${(n.x / canvasW) * 100}%`,
                top:  `${(n.y / canvasH) * 100}%`,
                width: `${(n.w / canvasW) * 100}%`,
                height: 4,
                background: n.lvl===0 ? t.accent : n.lvl===1 ? `${t.accent}80` : t.rule,
                borderRadius:2,
              }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ── ContentViewFlashcard4 ────────────────────────────────────────────────────
export const ContentViewFlashcard4: React.FC<{ t: Theme }> = ({ t }) => {
  const modes = ['Flip','Type Answer','MCQ','Fill in Blank','True / False'];
  const srs = [
    { label:'Again', sub:'< 1 min',  color:'#ef4444' },
    { label:'Hard',  sub:'10 min',   color:'#f97316' },
    { label:'Good',  sub:'1 day',    color:'#22c55e' },
    { label:'Easy',  sub:'4 days',   color:'#3b82f6' },
  ];
  const stats = [
    { label:'Total',    val:'12', color:t.body },
    { label:'Mastered', val:'4',  color:'#22c55e' },
    { label:'Due',      val:'5',  color:t.accent },
    { label:'New',      val:'3',  color:'#3b82f6' },
  ];
  return (
    <Shell4 t={t} active="library">
      <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', background:t.bg }}>

        {/* Page header */}
        <div style={{ background:t.panel, borderBottom:`1px solid ${t.rule}`, padding:'0 24px', height:54, display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
          <div style={{ display:'flex', alignItems:'center', gap:7, padding:'5px 10px', background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:7, cursor:'pointer' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
            <span style={{ fontSize:11, color:t.muted }}>Library</span>
          </div>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={t.rule} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
          <div style={{ fontSize:13, fontWeight:700, color:t.ink }}>Game Theory — Week 3</div>
          <div style={{ flex:1 }} />
          <div style={{ fontSize:11, color:t.muted, marginRight:4 }}>Card <strong style={{ color:t.body }}>1</strong> of <strong style={{ color:t.body }}>12</strong></div>
          <div style={{ padding:'6px 14px', background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:7, fontSize:11, fontWeight:600, color:t.body, cursor:'pointer' }}>Shuffle</div>
          <div style={{ padding:'6px 14px', background:t.accent, borderRadius:7, fontSize:11, fontWeight:600, color:'white', cursor:'pointer' }}>Start Over</div>
        </div>

        {/* Study mode tabs */}
        <div style={{ background:t.panel, borderBottom:`1px solid ${t.rule}`, padding:'0 24px', display:'flex', alignItems:'center', flexShrink:0 }}>
          {modes.map((m, i) => {
            const active = i === 0;
            return (
              <div key={i} style={{ padding:'10px 14px', fontSize:12, fontWeight:active?700:500, color:active?t.accent:t.muted, borderBottom:active?`2px solid ${t.accent}`:'2px solid transparent', marginBottom: active?'-1px':'0', cursor:'pointer', whiteSpace:'nowrap' }}>{m}</div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div style={{ height:3, background:t.rule, flexShrink:0 }}>
          <div style={{ width:'33%', height:'100%', background:t.accent, borderRadius:'0 2px 2px 0' }} />
        </div>

        {/* Body: card + sidebar */}
        <div style={{ flex:1, display:'flex', overflow:'hidden' }}>

          {/* Card area */}
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'28px 40px', gap:14 }}>
            {/* Question card */}
            <div style={{ width:'100%', maxWidth:620, background:t.panel, border:`1.5px solid ${t.rule}`, borderRadius:14, padding:'30px 34px', boxShadow:`0 2px 16px rgba(0,0,0,0.07)` }}>
              <div style={{ fontSize:9, fontWeight:700, color:t.accent, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:16 }}>Question</div>
              <div style={{ ...Sf4, fontSize:19, fontWeight:700, color:t.ink, lineHeight:1.5 }}>
                What is a Nash Equilibrium, and why is it considered a "stable" outcome in game theory?
              </div>
            </div>
            {/* Answer card */}
            <div style={{ width:'100%', maxWidth:620, background:t.accentSoft, border:`1.5px solid ${t.accent}44`, borderRadius:14, padding:'24px 34px' }}>
              <div style={{ fontSize:9, fontWeight:700, color:t.accent, letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:12 }}>Answer</div>
              <div style={{ fontSize:14, fontWeight:600, color:t.ink, lineHeight:1.85, letterSpacing:'-0.01em' }}>
                A Nash Equilibrium is a set of strategies where no player benefits from changing strategy unilaterally. Each player's choice is already the best response to others' — stable because no one has incentive to deviate.
              </div>
            </div>
            {/* Nav controls */}
            <div style={{ width:'100%', maxWidth:620, display:'flex', gap:10 }}>
              <div style={{ width:44, height:42, border:`1.5px solid ${t.rule}`, borderRadius:9, background:t.panel, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:t.muted }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </div>
              <div style={{ flex:1, height:42, background:t.accent, borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:600, color:'white', cursor:'pointer', gap:8 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
                Flip Card
              </div>
              <div style={{ width:44, height:42, border:`1.5px solid ${t.rule}`, borderRadius:9, background:t.panel, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:t.muted }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
            {/* SRS */}
            <div style={{ width:'100%', maxWidth:620 }}>
              <div style={{ fontSize:10, fontWeight:600, color:t.muted, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>How well did you know this?</div>
              <div style={{ display:'flex', gap:8 }}>
                {srs.map((btn, i) => (
                  <div key={i} style={{ flex:1, padding:'8px 0', borderRadius:9, background:`${btn.color}14`, border:`1.5px solid ${btn.color}44`, display:'flex', flexDirection:'column', alignItems:'center', gap:1, cursor:'pointer' }}>
                    <span style={{ fontSize:12, fontWeight:700, color:btn.color }}>{btn.label}</span>
                    <span style={{ fontSize:9, color:btn.color, opacity:0.75 }}>{btn.sub}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right stats sidebar */}
          <div style={{ width:196, borderLeft:`1px solid ${t.rule}`, background:t.panel, display:'flex', flexDirection:'column', flexShrink:0 }}>
            <div style={{ padding:'16px 16px 10px', borderBottom:`1px solid ${t.rule}` }}>
              <div style={{ fontSize:10, fontWeight:700, color:t.muted, letterSpacing:'0.12em', textTransform:'uppercase' }}>Deck Stats</div>
            </div>
            <div style={{ padding:'14px 14px', display:'flex', flexDirection:'column', gap:8 }}>
              {stats.map((s, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 10px', background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:8 }}>
                  <span style={{ fontSize:11, color:t.muted }}>{s.label}</span>
                  <span style={{ fontSize:14, fontWeight:700, color:s.color }}>{s.val}</span>
                </div>
              ))}
            </div>
            <div style={{ padding:'0 14px' }}>
              <div style={{ height:1, background:t.rule, marginBottom:14 }} />
              <div style={{ fontSize:10, fontWeight:700, color:t.muted, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:10 }}>Streak</div>
              <div style={{ display:'flex', gap:4 }}>
                {[1,2,3,4,5,6,7].map(d => (
                  <div key={d} style={{ flex:1, height:24, borderRadius:4, background: d<=5 ? t.accent : t.panel2, border:`1px solid ${d<=5 ? t.accent+'40' : t.rule}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:7, fontWeight:700, color: d<=5 ? 'white' : t.muted }}>{['M','T','W','T','F','S','S'][d-1]}</div>
                ))}
              </div>
              <div style={{ marginTop:8, fontSize:11, color:t.accent, fontWeight:700 }}>5-day streak</div>
            </div>
          </div>
        </div>

      </div>
    </Shell4>
  );
};



// ── NotificationsPomodoro4 ───────────────────────────────────────────────────
export const NotificationsPomodoro4: React.FC<{ t: Theme }> = ({ t }) => {
  const circumference = 2 * Math.PI * 70;
  const progress = 0.72;
  const strokeDash = circumference * progress;
  return (
    <Shell4 t={t} active="">
      <div style={{ width:'100%', height:'100%', position:'relative', display:'flex', background:t.bg }}>
        {/* Blurred background content */}
        <div style={{ flex:1, padding:24, opacity:0.22, pointerEvents:'none', display:'flex', flexDirection:'column', gap:14 }}>
          {[['Recent Documents','34px'],['Study Progress','120px'],['Quick Actions','56px']].map(([label, h], i) => (
            <div key={i} style={{ background:t.panel, borderRadius:14, padding:'16px 20px', border:`1px solid ${t.rule}`, height:h }}>
              <div style={{ fontSize:11, fontWeight:700, color:t.muted, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Notification panel */}
        <div style={{ width:360, background:t.panel, borderLeft:`1px solid ${t.rule}`, display:'flex', flexDirection:'column', boxShadow:'-4px 0 20px rgba(0,0,0,0.1)', flexShrink:0 }}>
          {/* Panel header */}
          <div style={{ padding:'16px 20px', borderBottom:`1px solid ${t.rule}`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:14, fontWeight:700, color:t.ink }}>Notifications</span>
            <div style={{ width:28, height:28, borderRadius:7, background:t.panel2, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:`1px solid ${t.rule}` }}>
            {[['Alerts', false],['Pomodoro Timer', true]].map(([label, active], i) => (
              <div key={i} style={{ flex:1, padding:'10px 0', textAlign:'center', fontSize:12, fontWeight: active?700:500, color: active?t.accent:t.muted, borderBottom: active?`2px solid ${t.accent}`:'2px solid transparent', cursor:'pointer' }}>{label}</div>
            ))}
          </div>

          {/* Pomodoro content */}
          <div style={{ flex:1, padding:'20px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:16, overflowY:'auto' }}>
            {/* Mode badge */}
            <div style={{ padding:'4px 14px', background:t.accentSoft, border:`1px solid ${t.accent}44`, borderRadius:20, fontSize:11, fontWeight:700, color:t.accent, letterSpacing:'0.08em', textTransform:'uppercase' }}>Work Session</div>

            {/* Circular timer */}
            <div style={{ position:'relative', width:160, height:160 }}>
              <svg width="160" height="160" style={{ transform:'rotate(-90deg)' }}>
                <circle cx="80" cy="80" r="70" fill="none" stroke={`${t.rule}`} strokeWidth="8" />
                <circle cx="80" cy="80" r="70" fill="none" stroke={t.accent} strokeWidth="8"
                  strokeDasharray={`${strokeDash} ${circumference}`} strokeLinecap="round" />
              </svg>
              <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                <div style={{ fontSize:30, fontWeight:700, color:t.ink, letterSpacing:'-0.02em' }}>22:35</div>
                <div style={{ fontSize:10, fontWeight:600, color:t.muted, textTransform:'uppercase', letterSpacing:'0.1em' }}>remaining</div>
              </div>
            </div>

            {/* Sessions */}
            <div style={{ display:'flex', gap:6 }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{ width:i<2?10:8, height:i<2?10:8, borderRadius:'50%', background:i<2?t.accent:`${t.rule}`, border:`1.5px solid ${i<2?t.accent:t.rule}` }} />
              ))}
            </div>
            <div style={{ fontSize:11, color:t.muted }}>Session <strong style={{ color:t.body }}>2</strong> of 4</div>

            {/* Controls */}
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              <div style={{ width:40, height:40, borderRadius:10, background:t.panel2, border:`1px solid ${t.rule}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.body} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/></svg>
              </div>
              <div style={{ width:52, height:52, borderRadius:14, background:`linear-gradient(135deg, ${t.accent}, ${t.accent}cc)`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:`0 4px 14px ${t.accent}50` }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><polygon points="5 3 19 12 5 21 5 3"/></svg>
              </div>
              <div style={{ width:40, height:40, borderRadius:10, background:t.panel2, border:`1px solid ${t.rule}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={t.body} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>

            {/* Mode cards */}
            <div style={{ width:'100%', display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
              {[
                { label:'Work', time:'25 min', active:true },
                { label:'Short Break', time:'5 min', active:false },
                { label:'Long Break', time:'15 min', active:false },
                { label:'Custom', time:'— min', active:false },
              ].map((c, i) => (
                <div key={i} style={{ padding:'10px 12px', borderRadius:10, background: c.active ? t.accentSoft : t.panel2, border:`1.5px solid ${c.active ? t.accent+'55' : t.rule}`, cursor:'pointer' }}>
                  <div style={{ fontSize:11, fontWeight:700, color: c.active?t.accent:t.body }}>{c.label}</div>
                  <div style={{ fontSize:10, color:t.muted, marginTop:2 }}>{c.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Shell4>
  );
};

// ── InsufficientCredits4 ────────────────────────────────────────────────────
export const InsufficientCredits4: React.FC<{ t: Theme }> = ({ t }) => (
  <Shell4 t={t} active="">
    <div style={{ width:'100%', height:'100%', position:'relative' }}>
      {/* Blurred background */}
      <div style={{ position:'absolute', inset:0, opacity:0.18, pointerEvents:'none', display:'flex', flexDirection:'column', gap:14, padding:24 }}>
        {[['My Library','150px'],['Quick Actions','60px']].map(([label, h], i) => (
          <div key={i} style={{ background:t.panel, borderRadius:10, padding:'16px 20px', border:`1px solid ${t.rule}`, height:h }}>
            <div style={{ fontSize:11, fontWeight:700, color:t.muted, letterSpacing:'0.1em', textTransform:'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>
      {/* Backdrop */}
      <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.5)', backdropFilter:'blur(5px)' }} />

      {/* Modal — horizontal split */}
      <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:540, background:t.panel, borderRadius:12, overflow:'hidden', boxShadow:'0 24px 70px rgba(0,0,0,0.4)' }}>
        {/* Red top band */}
        <div style={{ background:'linear-gradient(135deg, #ef4444, #b91c1c)', padding:'24px 28px', position:'relative' }}>
          {/* Close */}
          <div style={{ position:'absolute', top:14, right:14, width:26, height:26, borderRadius:5, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
          <div style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.65)', letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:6 }}>Credits Exhausted</div>
          <div style={{ ...Sf4, fontSize:22, fontWeight:700, color:'white', marginBottom:16 }}>Insufficient Credits</div>
          {/* Credit meter */}
          <div style={{ marginBottom:6 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.7)', fontWeight:600 }}>0 of 10 credits remaining</span>
              <span style={{ fontSize:11, color:'rgba(255,255,255,0.7)' }}>Free plan</span>
            </div>
            <div style={{ height:7, background:'rgba(255,255,255,0.2)', borderRadius:4 }}>
              <div style={{ width:'0%', height:'100%', background:'white', borderRadius:4 }} />
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:'22px 28px' }}>
          <div style={{ fontSize:14, color:t.body, lineHeight:1.75, marginBottom:20 }}>
            You've used all your credits for this cycle. Upgrade to continue processing documents and generating study materials without interruption.
          </div>

          {/* Two info chips */}
          <div style={{ display:'flex', gap:10, marginBottom:22 }}>
            <div style={{ flex:1, background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:8, padding:'11px 14px' }}>
              <div style={{ fontSize:10, fontWeight:700, color:t.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Refreshes in</div>
              <div style={{ fontSize:15, fontWeight:700, color:t.ink }}>41 days</div>
              <div style={{ fontSize:10, color:t.muted, marginTop:1 }}>June 20, 2026</div>
            </div>
            <div style={{ flex:1, background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:8, padding:'11px 14px' }}>
              <div style={{ fontSize:10, fontWeight:700, color:t.muted, textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:4 }}>Pro plan gives</div>
              <div style={{ fontSize:15, fontWeight:700, color:t.accent }}>200 credits</div>
              <div style={{ fontSize:10, color:t.muted, marginTop:1 }}>per month</div>
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display:'flex', gap:10 }}>
            <div style={{ flex:2, height:42, background:'#ef4444', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'white', cursor:'pointer' }}>
              Upgrade Plan
            </div>
            <div style={{ flex:1, height:42, border:`1.5px solid ${t.rule}`, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:500, color:t.muted, cursor:'pointer' }}>
              Dismiss
            </div>
          </div>
        </div>
      </div>
    </div>
  </Shell4>
);



// ── Tutorial4 ────────────────────────────────────────────────────────────────
export const Tutorial4: React.FC<{ t: Theme }> = ({ t }) => {
  const steps = [
    { title:'Upload Your Content',               content:'Paste text, upload a PDF or image, or record audio. MeshFahem accepts any study material — lecture notes, textbook chapters, or voice recordings.' },
    { title:'AI Generates Your Study Materials', content:'Our AI instantly creates a structured summary, ready-to-review flashcards, a mind map, and audio narration — all tailored to your content.' },
    { title:'Study Your Way',                    content:'Switch between Read Mode, Book Mode, Flashcards, Mind Map, or Audio. Use the Pomodoro timer to stay focused and SRS to master cards for the long term.' },
  ];
  const currentStep = 1;
  const totalSteps = steps.length;
  const step = steps[currentStep];
  return (
    <Shell4 t={t} active="">
      <div style={{ width:'100%', height:'100%', position:'relative' }}>
        {/* Background (dimmed) */}
        <div style={{ position:'absolute', inset:0, opacity:0.14, pointerEvents:'none', display:'flex', flexDirection:'column', gap:14, padding:24 }}>
          {['Welcome back!','Library — 8 items','Recent Documents'].map((label, i) => (
            <div key={i} style={{ background:t.panel, borderRadius:8, padding:'16px 20px', border:`1px solid ${t.rule}`, height: i===1?'120px':'48px' }}>
              <div style={{ fontSize:i===0?16:11, fontWeight:i===0?700:600, color:i===0?t.ink:t.muted }}>{label}</div>
            </div>
          ))}
        </div>
        {/* Backdrop */}
        <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.62)', backdropFilter:'blur(5px)' }} />

        {/* Modal — wide horizontal rectangle, sharp corners */}
        <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', width:740, background:t.panel, borderRadius:6, overflow:'hidden', boxShadow:'0 20px 70px rgba(0,0,0,0.45)' }}>

          {/* Gold header — matches repo */}
          <div style={{ background:t.accent, padding:'20px 28px', position:'relative' }}>
            <div style={{ paddingRight:44 }}>
              <div style={{ ...Sf4, fontSize:21, fontWeight:700, color:'white', marginBottom:3 }}>Dashboard Tutorial</div>
              <div style={{ fontSize:13, color:'rgba(255,255,255,0.82)' }}>Learn the key features of this page</div>
            </div>
            {/* X button */}
            <div style={{ position:'absolute', top:16, right:18, width:28, height:28, borderRadius:5, background:'rgba(255,255,255,0.18)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </div>
          </div>

          {/* Content — matches repo TutorialStep layout */}
          <div style={{ padding:'24px 28px' }}>
            {/* Progress row: label left, dots right */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
              <span style={{ fontSize:13, fontWeight:500, color:t.muted }}>Step {currentStep + 1} of {totalSteps}</span>
              <div style={{ display:'flex', gap:5 }}>
                {steps.map((_, i) => (
                  <div key={i} style={{ height:5, borderRadius:2, background: i <= currentStep ? t.accent : t.rule, width: i <= currentStep ? 22 : 8 }} />
                ))}
              </div>
            </div>

            {/* Step title */}
            <div style={{ ...Sf4, fontSize:20, fontWeight:700, color:t.ink, marginBottom:12 }}>{step.title}</div>

            {/* Step content */}
            <div style={{ fontSize:14, color:t.body, lineHeight:1.8 }}>{step.content}</div>
          </div>

          {/* Footer — accent-soft tint background, matches repo */}
          <div style={{ background:t.accentSoft, borderTop:`1px solid ${t.rule}`, padding:'13px 28px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ fontSize:13, fontWeight:500, color:t.muted, cursor:'pointer' }}>Skip</div>
            <div style={{ display:'flex', gap:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 16px', border:`1.5px solid ${t.rule}`, borderRadius:5, fontSize:13, fontWeight:500, color:t.body, cursor:'pointer', background:t.panel }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                Previous
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 20px', background:t.accent, borderRadius:5, fontSize:13, fontWeight:700, color:'white', cursor:'pointer' }}>
                Next
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </div>
          </div>

        </div>
      </div>
    </Shell4>
  );
};



// ── NotFound4 ─────────────────────────────────────────────────────────────
export const NotFound4: React.FC<{ t: Theme }> = ({ t }) => (
  <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', background:t.bg }}>
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:0, maxWidth:420, textAlign:'center' }}>
      {/* Large 404 */}
      <div style={{ fontSize:120, fontWeight:900, lineHeight:1, color:t.accentSoft, letterSpacing:'-6px', fontFamily:"'Fraunces', Georgia, serif", userSelect:'none' }}>404</div>
      <div style={{ fontSize:22, fontWeight:700, color:t.ink, marginTop:8, ...Sf4 }}>Page Not Found</div>
      <div style={{ fontSize:14, color:t.muted, lineHeight:1.7, marginTop:10, marginBottom:32, padding:'0 20px' }}>
        The page you're looking for has been moved, deleted, or never existed. Let's get you back on track.
      </div>
      {/* Illustration — broken link icon */}
      <div style={{ width:72, height:72, borderRadius:20, background:t.panel2, border:`1px solid ${t.rule}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:28 }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={t.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
          <line x1="8" y1="2" x2="8" y2="5"/>
          <line x1="2" y1="8" x2="5" y2="8"/>
          <line x1="16" y1="19" x2="16" y2="22"/>
          <line x1="19" y1="16" x2="22" y2="16"/>
        </svg>
      </div>
      {/* Buttons */}
      <div style={{ display:'flex', gap:12 }}>
        <button style={{ padding:'11px 24px', borderRadius:10, background:'transparent', border:`1.5px solid ${t.rule}`, color:t.ink, fontSize:14, fontWeight:600, cursor:'pointer' }}>
          ← Go Back
        </button>
        <button style={{ padding:'11px 24px', borderRadius:10, background:t.accent, border:'none', color:'white', fontSize:14, fontWeight:600, cursor:'pointer', boxShadow:`0 3px 12px ${t.accent}40` }}>
          Go Home
        </button>
      </div>
    </div>
  </div>
);

// ── ChatAssistant4 ─────────────────────────────────────────────────────────
export const ChatAssistant4: React.FC<{ t: Theme }> = ({ t }) => {
  const msgs = [
    { role:'user', text:'Can you explain Nash Equilibrium in simple terms?' },
    { role:'ai',   text:"Of course! A Nash Equilibrium is a situation where no player can improve their outcome by changing their strategy alone — assuming everyone else keeps their strategy the same. It's a stable state where everyone is playing their best response. Think of it like this: if you're at a busy intersection and everyone follows traffic rules, no one has incentive to break them unilaterally." },
    { role:'user', text:"Great! What's the difference between dominant and dominated strategies?" },
    { role:'ai',   text:'A dominant strategy is one that gives you the best outcome regardless of what others do. A dominated strategy is always worse than another option, no matter what — so rational players never choose it.' },
  ];
  const suggestions = ['Explain with an example', 'What is Pareto efficiency?', 'Compare to game trees'];
  return (
    <Shell4 t={t} active="dashboard">
      {/* Dimmed background content */}
      <div style={{ width:'100%', height:'100%', position:'relative', overflow:'hidden' }}>
        <div style={{ width:'100%', height:'100%', opacity:0.22, filter:'blur(1px)', padding:'28px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, background:t.bg }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:14, height:120 }} />
          ))}
        </div>
        {/* Chat panel — bottom right */}
        <div style={{ position:'absolute', bottom:24, right:24, width:360, height:520, background:t.panel, borderRadius:18, boxShadow:`0 12px 48px rgba(0,0,0,0.18)`, border:`1px solid ${t.rule}`, display:'flex', flexDirection:'column', overflow:'hidden' }}>
          {/* Header */}
          <div style={{ background:`linear-gradient(135deg, #b45309, #d97706)`, padding:'14px 18px', display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:700, color:'white' }}>AI Study Assistant</div>
              <div style={{ fontSize:10, color:'rgba(255,255,255,0.75)', marginTop:1 }}>Powered by Claude · Always learning</div>
            </div>
            <div style={{ display:'flex', gap:6 }}>
              <div style={{ width:26, height:26, borderRadius:7, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
              </div>
              <div style={{ width:26, height:26, borderRadius:7, background:'rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </div>
            </div>
          </div>
          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'14px', display:'flex', flexDirection:'column', gap:10, background:t.bg }}>
            {msgs.map((m, i) => (
              <div key={i} style={{ display:'flex', flexDirection: m.role==='user'?'row-reverse':'row', gap:8, alignItems:'flex-end' }}>
                {m.role==='ai' && (
                  <div style={{ width:26, height:26, borderRadius:8, background:`linear-gradient(135deg, #b45309, #d97706)`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  </div>
                )}
                <div style={{ maxWidth:'78%', padding:'9px 12px', borderRadius: m.role==='user'?'14px 14px 4px 14px':'14px 14px 14px 4px', background: m.role==='user'?`linear-gradient(135deg, ${t.accent}, ${t.accent}dd)`:`${t.panel}`, border: m.role==='ai'?`1px solid ${t.rule}`:'none', color: m.role==='user'?'white':t.body, fontSize:12, lineHeight:1.65, boxShadow: m.role==='user'?`0 2px 8px ${t.accent}40`:'0 1px 4px rgba(0,0,0,0.06)', whiteSpace:'pre-line' }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          {/* Suggested questions */}
          <div style={{ padding:'8px 12px', display:'flex', gap:6, overflowX:'auto', borderTop:`1px solid ${t.rule}`, background:t.panel }}>
            {suggestions.map((s, i) => (
              <div key={i} style={{ padding:'5px 10px', borderRadius:14, background:t.panel2, border:`1px solid ${t.rule}`, fontSize:10, fontWeight:600, color:t.muted, cursor:'pointer', whiteSpace:'nowrap' }}>{s}</div>
            ))}
          </div>
          {/* Input */}
          <div style={{ padding:'10px 12px', display:'flex', gap:8, alignItems:'center', background:t.panel, borderTop:`1px solid ${t.rule}` }}>
            <div style={{ flex:1, background:t.panel2, border:`1px solid ${t.rule}`, borderRadius:20, padding:'8px 14px', fontSize:12, color:t.muted }}>Ask anything about your studies…</div>
            <div style={{ width:32, height:32, borderRadius:9, background:t.accent, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:`0 2px 8px ${t.accent}40` }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </div>
          </div>
        </div>
        {/* Floating trigger button */}
        <div style={{ position:'absolute', bottom:24, right:400, width:46, height:46, borderRadius:14, background:`linear-gradient(135deg, #b45309, #d97706)`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 4px 18px rgba(180,83,9,0.4)' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        </div>
      </div>
    </Shell4>
  );
};

// ── FloatingMiniPlayer4 ───────────────────────────────────────────────────
export const FloatingMiniPlayer4: React.FC<{ t: Theme }> = ({ t }) => (
  <Shell4 t={t} active="rooms">
    <div style={{ width:'100%', height:'100%', position:'relative', overflow:'hidden' }}>
      {/* Dimmed background */}
      <div style={{ width:'100%', height:'100%', opacity:0.28, filter:'blur(0.5px)', padding:'28px', display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, background:t.bg }}>
        {[...Array(6)].map((_,i) => (
          <div key={i} style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:14, height:110 }} />
        ))}
      </div>
      {/* MiniPlayer widget */}
      <div style={{ position:'absolute', bottom:28, right:28, width:180, borderRadius:14, overflow:'hidden', boxShadow:'0 8px 32px rgba(0,0,0,0.32)', border:'1px solid rgba(255,255,255,0.08)' }}>
        {/* Drag handle */}
        <div style={{ background:'#1a1a2e', padding:'7px 10px', display:'flex', alignItems:'center', gap:6, cursor:'grab' }}>
          <div style={{ display:'flex', gap:2, flex:1 }}>
            {[...Array(3)].map((_,i) => <div key={i} style={{ width:14, height:2, borderRadius:1, background:'rgba(255,255,255,0.25)' }} />)}
          </div>
          <span style={{ fontSize:9, color:'rgba(255,255,255,0.6)', fontWeight:600, flex:1, textAlign:'center' }}>MedStudy Squad</span>
          <div style={{ width:14, height:14, opacity:0.5 }} />
        </div>
        {/* Video preview */}
        <div style={{ width:'100%', height:100, background:'linear-gradient(160deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
          {/* Avatar grid */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:4, padding:8, width:'100%', height:'100%' }}>
            {[{ ini:'SK', col:'#6366f1' },{ ini:'OR', col:'#0ea5e9' },{ ini:'LM', col:'#10b981' },{ ini:'AH', col:'#f59e0b' }].map((p, i) => (
              <div key={i} style={{ borderRadius:6, background: i===2 ? `linear-gradient(135deg, ${p.col}60, ${p.col}30)` : `${p.col}30`, border:`1px solid ${p.col}50`, display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
                <div style={{ width:22, height:22, borderRadius:6, background:p.col, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:700, color:'white' }}>{p.ini}</div>
                {/* Speaking indicator */}
                {i===2 && <div style={{ position:'absolute', bottom:3, right:3, width:6, height:6, borderRadius:'50%', background:'#22c55e', boxShadow:'0 0 4px #22c55e' }} />}
              </div>
            ))}
          </div>
          {/* Live badge */}
          <div style={{ position:'absolute', top:6, left:8, padding:'2px 6px', background:'#ef4444', borderRadius:4, fontSize:8, fontWeight:700, color:'white', letterSpacing:'0.05em' }}>LIVE</div>
        </div>
        {/* Controls */}
        <div style={{ background:'#111827', padding:'8px 10px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          {/* Mic — muted/red */}
          <div style={{ width:28, height:28, borderRadius:8, background:'#ef444420', border:'1px solid #ef444450', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
          </div>
          {/* Expand */}
          <div style={{ width:28, height:28, borderRadius:8, background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>
          </div>
          {/* Close — red */}
          <div style={{ width:28, height:28, borderRadius:8, background:'#ef444420', border:'1px solid #ef444450', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </div>
        </div>
      </div>
    </div>
  </Shell4>
);

// ── LowCreditBanner4 ──────────────────────────────────────────────────────
export const LowCreditBanner4: React.FC<{ t: Theme }> = ({ t }) => {
  const banners = [
    {
      level: 'Critical', credits: 250,
      bg: '#fef2f2', border: '#fecaca', icon: '#dc2626', text: '#991b1b',
      darkBg: '#1f1212', darkBorder: '#7f1d1d', darkIcon: '#ef4444', darkText: '#fca5a5',
      title: 'Credits Critically Low',
      msg: 'You have only 250 credits left. Upgrade now to avoid interruptions to your study sessions.',
      btnBg: '#dc2626', btnText: 'white',
    },
    {
      level: 'Warning', credits: 500,
      bg: '#fff7ed', border: '#fed7aa', icon: '#ea580c', text: '#9a3412',
      darkBg: '#1f1608', darkBorder: '#7c2d12', darkIcon: '#f97316', darkText: '#fdba74',
      title: 'Running Low on Credits',
      msg: 'You have 500 credits remaining. Consider topping up soon to keep your momentum going.',
      btnBg: '#ea580c', btnText: 'white',
    },
    {
      level: 'Caution', credits: 1000,
      bg: '#fefce8', border: '#fde68a', icon: '#ca8a04', text: '#854d0e',
      darkBg: '#1a1800', darkBorder: '#713f12', darkIcon: '#eab308', darkText: '#fde047',
      title: 'Credit Balance Notice',
      msg: "Your credit balance is at 1,000. You're doing great — just a heads up to plan ahead.",
      btnBg: '#ca8a04', btnText: 'white',
    },
  ];
  return (
    <Shell4 t={t} active="dashboard">
      <div style={{ width:'100%', height:'100%', overflowY:'auto', background:t.bg, padding:'24px 28px', display:'flex', flexDirection:'column', gap:16 }}>
        {/* Page label */}
        <div style={{ fontSize:11, fontWeight:700, color:t.muted, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:4 }}>Credit Alerts — All Severity Levels</div>
        {/* Banners */}
        {banners.map((b, i) => {
          const isDark = t.bg.length < 8 && t.bg[1] === '0' || t.bg === '#0d1117' || t.bg === '#0f0e17' || t.bg.startsWith('#0') || t.bg.startsWith('#1');
          const bg     = isDark ? b.darkBg     : b.bg;
          const border = isDark ? b.darkBorder  : b.border;
          const icon   = isDark ? b.darkIcon    : b.icon;
          const text   = isDark ? b.darkText    : b.text;
          return (
            <div key={i} style={{ background:bg, border:`1.5px solid ${border}`, borderRadius:12, padding:'14px 18px', display:'flex', alignItems:'flex-start', gap:14 }}>
              {/* Alert icon */}
              <div style={{ flexShrink:0, marginTop:1 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={icon} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:text }}>{b.title}</span>
                  <span style={{ fontSize:10, fontWeight:700, padding:'2px 8px', background:`${icon}20`, color:icon, borderRadius:10, border:`1px solid ${icon}40` }}>{b.credits} credits</span>
                </div>
                <div style={{ fontSize:12, color:text, lineHeight:1.6, opacity:0.85 }}>{b.msg}</div>
              </div>
              {/* Actions */}
              <div style={{ display:'flex', gap:8, alignItems:'center', flexShrink:0 }}>
                <button style={{ padding:'7px 14px', borderRadius:8, background:b.btnBg, border:'none', color:b.btnText, fontSize:12, fontWeight:700, cursor:'pointer', whiteSpace:'nowrap', boxShadow:`0 2px 8px ${icon}40` }}>Top Up</button>
                <div style={{ width:26, height:26, borderRadius:7, background:'transparent', border:`1px solid ${border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer' }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={icon} strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </div>
              </div>
            </div>
          );
        })}
        {/* Dimmed dashboard content below */}
        <div style={{ marginTop:8, opacity:0.35, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
          {[...Array(6)].map((_,i) => (
            <div key={i} style={{ background:t.panel, border:`1px solid ${t.rule}`, borderRadius:12, height:90 }} />
          ))}
        </div>
      </div>
    </Shell4>
  );
};

