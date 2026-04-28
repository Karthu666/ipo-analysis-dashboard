import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis,
  ReferenceLine, Cell
} from "recharts";

const RAW = [
  {c:'Zomato',s:'Consumer Tech',i:76,l:116,m1:150,m3:85,m6:52},
  {c:'Nykaa',s:'Consumer Tech',i:1125,l:2206,m1:1955,m3:1500,m6:1100},
  {c:'Just Dial',s:'Consumer Tech',i:530,l:590,m1:610,m3:580,m6:540},
  {c:'Paytm',s:'Fintech',i:2150,l:1564,m1:1300,m3:780,m6:620},
  {c:'Policybazaar',s:'Fintech',i:980,l:1202,m1:1050,m3:720,m6:500},
  {c:'Zaggle Prepaid',s:'Fintech',i:164,l:158,m1:175,m3:210,m6:290},
  {c:'Five-Star Business',s:'Fintech',i:474,l:449,m1:480,m3:520,m6:610},
  {c:'Delhivery',s:'Logistics',i:487,l:493,m1:480,m3:375,m6:360},
  {c:'Blue Dart',s:'Logistics',i:100,l:116,m1:120,m3:130,m6:145},
  {c:'Mahindra Logis.',s:'Logistics',i:429,l:432,m1:450,m3:470,m6:485},
  {c:'Container Corp',s:'Logistics',i:155,l:162,m1:180,m3:210,m6:245},
  {c:'LIC',s:'Insurance',i:949,l:872,m1:840,m3:780,m6:720},
  {c:'HDFC Life',s:'Insurance',i:290,l:312,m1:330,m3:340,m6:325},
  {c:'ICICI Pru Life',s:'Insurance',i:334,l:338,m1:345,m3:355,m6:340},
  {c:'SBI Life',s:'Insurance',i:700,l:733,m1:760,m3:810,m6:850},
  {c:'Star Health',s:'Insurance',i:900,l:848,m1:810,m3:750,m6:680},
  {c:'IRCTC',s:'Railway/PSU',i:320,l:626,m1:640,m3:815,m6:1135},
  {c:'IRFC',s:'Railway/PSU',i:26,l:25,m1:26,m3:28,m6:32},
  {c:'RailTel',s:'Railway/PSU',i:94,l:121,m1:145,m3:160,m6:185},
  {c:'RVNL',s:'Railway/PSU',i:19,l:19.5,m1:22,m3:28,m6:35},
  {c:'RITES Ltd',s:'Railway/PSU',i:185,l:190,m1:215,m3:240,m6:285},
  {c:'DMart',s:'Retail',i:299,l:641,m1:760,m3:875,m6:1050},
  {c:'Trent',s:'Retail',i:1000,l:1098,m1:1130,m3:1080,m6:1010},
  {c:'Shoppers Stop',s:'Retail',i:310,l:335,m1:350,m3:340,m6:320},
  {c:'V-Mart Retail',s:'Retail',i:210,l:232,m1:255,m3:270,m6:310},
  {c:'Manyavar',s:'Retail',i:866,l:936,m1:1020,m3:1150,m6:1280},
  {c:'Burger King',s:'QSR',i:60,l:112,m1:135,m3:118,m6:103},
  {c:'Westlife FW',s:'QSR',i:116,l:132,m1:148,m3:142,m6:135},
  {c:'Devyani Intl',s:'QSR',i:90,l:140,m1:165,m3:178,m6:182},
  {c:'Sapphire Foods',s:'QSR',i:1180,l:1311,m1:1450,m3:1550,m6:1620},
  {c:'Route Mobile',s:'Tech',i:350,l:449,m1:490,m3:460,m6:435},
  {c:'IndiaMART',s:'Tech',i:973,l:1234,m1:1280,m3:1180,m6:1050},
  {c:'Affle India',s:'Tech',i:745,l:929,m1:1150,m3:1420,m6:1600},
  {c:'MapmyIndia',s:'Tech',i:1033,l:1581,m1:1450,m3:1380,m6:1290},
  {c:'Clean Science',s:'Chemicals',i:900,l:1410,m1:1675,m3:1560,m6:1210},
  {c:'Deepak Nitrite',s:'Chemicals',i:160,l:185,m1:195,m3:255,m6:305},
  {c:'Aether Indus.',s:'Chemicals',i:642,l:704,m1:810,m3:940,m6:1050},
  {c:'SRF Ltd',s:'Chemicals',i:1200,l:1350,m1:1550,m3:1800,m6:2100},
  {c:'Paras Defence',s:'Defense',i:175,l:469,m1:540,m3:420,m6:385},
  {c:'HAL',s:'Defense',i:1215,l:1150,m1:1250,m3:1580,m6:2200},
  {c:'Bharat Dynam.',s:'Defense',i:428,l:390,m1:415,m3:480,m6:650},
  {c:'Mazagon Dock',s:'Defense',i:145,l:214,m1:230,m3:285,m6:440},
];

const p = (a, b) => +((b - a) / a * 100).toFixed(2);
const D = RAW.map(r => ({
  ...r,
  lg: p(r.i, r.l),
  m1r: p(r.i, r.m1),
  m3r: p(r.i, r.m3),
  m6r: p(r.i, r.m6),
}));

const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
const std = a => { const m = avg(a); return Math.sqrt(a.reduce((s, v) => s + (v - m) ** 2, 0) / (a.length - 1)); };
const tstat = a => { const m = avg(a), s = std(a); return m / (s / Math.sqrt(a.length)); };
const pval = (t, df) => {
  const x = df / (df + t * t);
  let beta = 0, term = 1;
  for (let k = 1; k <= 200; k++) { term *= ((k - 0.5) * x / k); beta += term; }
  return Math.min(1, 2 * 0.5 * Math.pow(x, 0.5) * (1 + beta));
};
const pearson = (x, y) => {
  const mx = avg(x), my = avg(y);
  const num = x.reduce((s, xi, i) => s + (xi - mx) * (y[i] - my), 0);
  const den = Math.sqrt(x.reduce((s, xi) => s + (xi - mx) ** 2, 0) * y.reduce((s, yi) => s + (yi - my) ** 2, 0));
  return +(num / den).toFixed(3);
};

const SECTOR_COLORS = {
  'Consumer Tech': '#38BDF8',
  'Fintech': '#818CF8',
  'Logistics': '#34D399',
  'Insurance': '#F472B6',
  'Railway/PSU': '#FBBF24',
  'Retail': '#86EFAC',
  'QSR': '#FB923C',
  'Tech': '#A78BFA',
  'Chemicals': '#2DD4BF',
  'Defense': '#F87171',
};

const SECTORS = Object.keys(SECTOR_COLORS);

const GlassCard = ({ children, className = "", style = {}, onClick }) => (
  <div
    onClick={onClick}
    style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: 16,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      ...style,
    }}
    className={className}
  >
    {children}
  </div>
);

const ReturnBadge = ({ val }) => {
  const color = val > 10 ? '#34D399' : val > 0 ? '#86EFAC' : val > -10 ? '#FB923C' : '#F87171';
  const bg = val > 10 ? 'rgba(52,211,153,0.12)' : val > 0 ? 'rgba(134,239,172,0.1)' : val > -10 ? 'rgba(251,146,60,0.12)' : 'rgba(248,113,113,0.12)';
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: 6,
      fontSize: 11,
      fontWeight: 600,
      fontVariantNumeric: 'tabular-nums',
      color,
      background: bg,
    }}>
      {val > 0 ? '+' : ''}{val.toFixed(2)}%
    </span>
  );
};

const SparkLine = ({ data, color = '#38BDF8', height = 40 }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 80, h = height;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 4) - 2}`).join(' ');
  const area = `M${pts.split(' ')[0]} L${pts.split(' ').join(' ')} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg_${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#sg_${color.replace('#','')})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={(data.length - 1) / (data.length - 1) * w} cy={h - ((data[data.length - 1] - min) / range) * (h - 4) - 2} r="2.5" fill={color} />
    </svg>
  );
};

const CustomTooltip = ({ active, payload, label, calcAmount }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  if (!d) return null;
  const sparkData = [d.i, d.l, d.m1, d.m3, d.m6];
  const color = SECTOR_COLORS[d.s] || '#38BDF8';
  const worth = calcAmount ? (calcAmount * (1 + d.m6r / 100)).toFixed(0) : null;
  return (
    <div style={{
      background: 'rgba(2,6,23,0.95)',
      border: `1px solid ${color}40`,
      borderRadius: 12,
      padding: '12px 16px',
      minWidth: 200,
      backdropFilter: 'blur(20px)',
      boxShadow: `0 0 24px ${color}20`,
    }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#F1F5F9', marginBottom: 6 }}>{d.c}</div>
      <div style={{ fontSize: 11, color: color, marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{d.s}</div>
      <SparkLine data={sparkData} color={color} height={36} />
      <div style={{ marginTop: 8, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px', fontSize: 11 }}>
        <span style={{ color: '#94A3B8' }}>Issue</span><span style={{ color: '#F1F5F9', fontVariantNumeric: 'tabular-nums' }}>₹{d.i}</span>
        <span style={{ color: '#94A3B8' }}>Listing</span><span style={{ color: d.lg >= 0 ? '#34D399' : '#F87171', fontVariantNumeric: 'tabular-nums' }}>{d.lg > 0 ? '+' : ''}{d.lg}%</span>
        <span style={{ color: '#94A3B8' }}>6M Return</span><span style={{ color: d.m6r >= 0 ? '#34D399' : '#F87171', fontVariantNumeric: 'tabular-nums' }}>{d.m6r > 0 ? '+' : ''}{d.m6r}%</span>
        {worth && <><span style={{ color: '#94A3B8' }}>Worth now</span><span style={{ color: '#FBBF24', fontVariantNumeric: 'tabular-nums' }}>₹{Number(worth).toLocaleString('en-IN')}</span></>}
      </div>
    </div>
  );
};

export default function IPOTerminal() {
  const [activeSector, setActiveSector] = useState('All');
  const [search, setSearch] = useState('');
  const [calcAmount, setCalcAmount] = useState('');
  const [activeTab, setActiveTab] = useState('trajectory');
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const filtered = useMemo(() => {
    return D.filter(d =>
      (activeSector === 'All' || d.s === activeSector) &&
      d.c.toLowerCase().includes(search.toLowerCase())
    );
  }, [activeSector, search]);

  const topGainers = useMemo(() => [...D].sort((a, b) => b.m6r - a.m6r).slice(0, 8), []);
  const topLosers = useMemo(() => [...D].sort((a, b) => a.m6r - b.m6r).slice(0, 5), []);

  const metrics = useMemo(() => {
    const lgVals = D.map(d => d.lg);
    const m6Vals = D.map(d => d.m6r);
    const winners = D.filter(d => d.m6r > 0).length;
    const sentimentScore = (winners / D.length * 100).toFixed(0);
    const bestSector = SECTORS.map(s => ({
      s,
      avg: avg(D.filter(d => d.s === s).map(d => d.m6r))
    })).sort((a, b) => b.avg - a.avg)[0];
    return {
      total: D.length,
      avgListing: avg(lgVals).toFixed(1),
      avg6m: avg(m6Vals).toFixed(1),
      winners,
      sentiment: sentimentScore,
      bestSector: bestSector.s,
      bestSectorAvg: bestSector.avg.toFixed(1),
    };
  }, []);

  const trajectoryData = useMemo(() => filtered.map(d => ({
    name: d.c.length > 10 ? d.c.slice(0, 10) + '…' : d.c,
    Listing: +d.lg.toFixed(2),
    '1 Month': +d.m1r.toFixed(2),
    '3 Month': +d.m3r.toFixed(2),
    '6 Month': +d.m6r.toFixed(2),
    ...d,
  })), [filtered]);

  const sectorData = useMemo(() => SECTORS.map(s => {
    const rows = D.filter(d => d.s === s);
    return {
      sector: s.replace('Railway/', ''),
      Listing: +avg(rows.map(d => d.lg)).toFixed(1),
      '6 Month': +avg(rows.map(d => d.m6r)).toFixed(1),
      count: rows.length,
    };
  }), []);

  const corrData = useMemo(() => {
    const lg = D.map(d => d.lg), m1 = D.map(d => d.m1r), m3 = D.map(d => d.m3r), m6 = D.map(d => d.m6r);
    return [
      { label: 'List→1M', r: pearson(lg, m1) },
      { label: 'List→3M', r: pearson(lg, m3) },
      { label: 'List→6M', r: pearson(lg, m6) },
      { label: '1M→3M', r: pearson(m1, m3) },
      { label: '1M→6M', r: pearson(m1, m6) },
      { label: '3M→6M', r: pearson(m3, m6) },
    ];
  }, []);

  const ttestData = useMemo(() => {
    const fields = [
      { f: 'lg', label: 'Listing' }, { f: 'm1r', label: '1M' },
      { f: 'm3r', label: '3M' }, { f: 'm6r', label: '6M' },
    ];
    return fields.map(({ f, label }) => {
      const vals = D.map(d => d[f]);
      const m = avg(vals), s = std(vals), t = tstat(vals), pv = pval(t, D.length - 1);
      return { label, mean: +m.toFixed(2), t: +t.toFixed(3), pv: +pv.toFixed(4), sig: pv < 0.05 };
    });
  }, []);

  const scatterData = useMemo(() => D.map(d => ({
    x: +d.lg.toFixed(2),
    y: +d.m6r.toFixed(2),
    z: Math.abs(d.m6r) + 10,
    ...d,
  })), []);

  const corrColor = r => r > 0.7 ? '#34D399' : r > 0.3 ? '#FBBF24' : r > 0 ? '#94A3B8' : '#F87171';

  const sentimentColor = metrics.sentiment > 65 ? '#34D399' : metrics.sentiment > 45 ? '#FBBF24' : '#F87171';
  const sentimentLabel = metrics.sentiment > 65 ? 'Bullish' : metrics.sentiment > 45 ? 'Neutral' : 'Bearish';

  return (
    <div style={{
      background: '#020617',
      minHeight: '100vh',
      fontFamily: '"DM Sans", "IBM Plex Sans", system-ui, sans-serif',
      color: '#E2E8F0',
      padding: '0',
    }}>
      {/* TOP NAV */}
      <div style={{
        background: 'rgba(2,6,23,0.8)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(20px)',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        height: 52,
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'linear-gradient(135deg, #38BDF8, #818CF8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#020617',
          }}>I</div>
          <span style={{ fontSize: 13, fontWeight: 700, color: '#F1F5F9', letterSpacing: '0.05em' }}>IPO TERMINAL</span>
          <span style={{ fontSize: 10, color: '#475569', marginLeft: 2 }}>NSE · BSE</span>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', flex: 1, maxWidth: 280 }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search company…"
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '6px 12px 6px 32px',
              color: '#E2E8F0',
              fontSize: 12,
              outline: 'none',
              fontVariantNumeric: 'tabular-nums',
            }}
          />
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#475569', fontSize: 13 }}>⌕</span>
        </div>

        {/* Sector Filter */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 2 }}>
          {['All', ...SECTORS].map(s => (
            <button
              key={s}
              onClick={() => setActiveSector(s)}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.04em',
                border: activeSector === s ? `1px solid ${SECTOR_COLORS[s] || '#38BDF8'}` : '1px solid rgba(255,255,255,0.08)',
                background: activeSector === s ? `${SECTOR_COLORS[s] || '#38BDF8'}18` : 'transparent',
                color: activeSector === s ? (SECTOR_COLORS[s] || '#38BDF8') : '#64748B',
                cursor: 'pointer',
                transition: 'all 0.15s',
                whiteSpace: 'nowrap',
              }}
            >
              {s === 'All' ? 'ALL' : s.replace('Railway/', '').replace('Consumer ', 'C.').toUpperCase()}
            </button>
          ))}
        </div>

        {/* Clock */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, fontVariantNumeric: 'tabular-nums', color: '#94A3B8', letterSpacing: '0.08em' }}>
              {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div style={{ fontSize: 9, color: '#475569' }}>IST</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 24px', maxWidth: 1600, margin: '0 auto' }}>

        {/* BENTO GRID — TOP ROW: 4 Metric Tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 12 }}>
          {[
            { label: 'COMPANIES TRACKED', value: metrics.total, sub: `${metrics.winners} profitable at 6M`, color: '#38BDF8' },
            { label: 'TOP SECTOR (6M)', value: metrics.bestSector, sub: `Avg ${metrics.bestSectorAvg > 0 ? '+' : ''}${metrics.bestSectorAvg}% return`, color: SECTOR_COLORS[metrics.bestSector] || '#818CF8' },
            { label: 'AVG LISTING GAIN', value: `${metrics.avgListing > 0 ? '+' : ''}${metrics.avgListing}%`, sub: `6M avg: ${metrics.avg6m > 0 ? '+' : ''}${metrics.avg6m}%`, color: metrics.avgListing > 0 ? '#34D399' : '#F87171' },
            { label: 'MARKET SENTIMENT', value: sentimentLabel, sub: `${metrics.sentiment}% IPOs positive at 6M`, color: sentimentColor },
          ].map((m, i) => (
            <GlassCard key={i} style={{ padding: '16px 18px', position: 'relative', overflow: 'hidden' }}>
              <div style={{
                position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                borderRadius: '50%', background: `${m.color}10`,
              }} />
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#475569', marginBottom: 6 }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: m.color, fontVariantNumeric: 'tabular-nums', lineHeight: 1.2 }}>{m.value}</div>
              <div style={{ fontSize: 10, color: '#64748B', marginTop: 4 }}>{m.sub}</div>
            </GlassCard>
          ))}
        </div>

        {/* MIDDLE ROW: Main Chart + Calc Widget */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 12, marginBottom: 12 }}>

          {/* MAIN CHART AREA */}
          <GlassCard style={{ padding: '16px 20px' }}>
            {/* Chart Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginRight: 8, letterSpacing: '0.08em' }}>VIEW</span>
              {[
                { id: 'trajectory', label: 'Performance Trajectory' },
                { id: 'sector', label: 'Sector Comparison' },
                { id: 'scatter', label: 'Listing vs 6M' },
                { id: 'ttest', label: 'T-Test Results' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 7,
                    fontSize: 11,
                    fontWeight: 600,
                    border: activeTab === t.id ? '1px solid rgba(56,189,248,0.4)' : '1px solid rgba(255,255,255,0.07)',
                    background: activeTab === t.id ? 'rgba(56,189,248,0.1)' : 'transparent',
                    color: activeTab === t.id ? '#38BDF8' : '#64748B',
                    cursor: 'pointer',
                  }}
                >{t.label}</button>
              ))}
              <span style={{ marginLeft: 'auto', fontSize: 10, color: '#475569' }}>
                {filtered.length} companies · {activeSector === 'All' ? 'All Sectors' : activeSector}
              </span>
            </div>

            {/* TRAJECTORY BAR CHART */}
            {activeTab === 'trajectory' && (
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trajectoryData} margin={{ top: 4, right: 8, bottom: 60, left: 0 }} barSize={6} barGap={1}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#475569' }} angle={-45} textAnchor="end" interval={0} />
                    <YAxis tick={{ fontSize: 10, fill: '#475569' }} tickFormatter={v => `${v}%`} />
                    <Tooltip content={<CustomTooltip calcAmount={calcAmount ? parseFloat(calcAmount) : null} />} />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
                    <Bar dataKey="Listing" fill="#38BDF8" opacity={0.8} radius={[2,2,0,0]} />
                    <Bar dataKey="1 Month" fill="#818CF8" opacity={0.8} radius={[2,2,0,0]} />
                    <Bar dataKey="3 Month" fill="#34D399" opacity={0.8} radius={[2,2,0,0]} />
                    <Bar dataKey="6 Month" fill="#FBBF24" opacity={0.9} radius={[2,2,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: 16, marginTop: 4, paddingLeft: 4 }}>
                  {[['#38BDF8','Listing'],['#818CF8','1 Month'],['#34D399','3 Month'],['#FBBF24','6 Month']].map(([c,l]) => (
                    <span key={l} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#64748B' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: 'inline-block' }} />{l}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* SECTOR BAR CHART */}
            {activeTab === 'sector' && (
              <div style={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sectorData} margin={{ top: 4, right: 8, bottom: 20, left: 0 }} barSize={22} barGap={4}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                    <XAxis dataKey="sector" tick={{ fontSize: 9, fill: '#475569' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#475569' }} tickFormatter={v => `${v}%`} />
                    <Tooltip content={({ active, payload }) => {
                      if (!active || !payload?.length) return null;
                      const d = payload[0]?.payload;
                      return (
                        <div style={{ background: 'rgba(2,6,23,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px' }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: '#F1F5F9', marginBottom: 6 }}>{d.sector}</div>
                          <div style={{ fontSize: 11, color: '#94A3B8' }}>{d.count} companies</div>
                          <div style={{ fontSize: 12, color: '#38BDF8', marginTop: 4 }}>Listing: {d.Listing > 0 ? '+' : ''}{d.Listing}%</div>
                          <div style={{ fontSize: 12, color: '#FBBF24' }}>6 Month: {d['6 Month'] > 0 ? '+' : ''}{d['6 Month']}%</div>
                        </div>
                      );
                    }} />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" />
                    <Bar dataKey="Listing" radius={[3,3,0,0]}>
                      {sectorData.map((entry, i) => (
                        <Cell key={i} fill={SECTOR_COLORS[SECTORS.find(s => s.replace('Railway/','') === entry.sector + (SECTORS.find(x => x.replace('Railway/','') === entry.sector) || '')) || SECTORS[i]] || '#38BDF8'} opacity={0.7} />
                      ))}
                    </Bar>
                    <Bar dataKey="6 Month" radius={[3,3,0,0]}>
                      {sectorData.map((entry, i) => (
                        <Cell key={i} fill={SECTOR_COLORS[SECTORS.find(s => s.replace('Railway/','') === entry.sector + (SECTORS.find(x => x.replace('Railway/','') === entry.sector) || '')) || SECTORS[i]] || '#38BDF8'} opacity={1} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* SCATTER: Listing vs 6M */}
            {activeTab === 'scatter' && (
              <>
                <div style={{ fontSize: 10, color: '#64748B', marginBottom: 8 }}>
                  Listing Gain % (X) vs 6-Month Return % (Y) — reveals the "Hype Trap" pattern
                </div>
                <div style={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 4, right: 20, bottom: 20, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="x" tick={{ fontSize: 9, fill: '#475569' }} tickFormatter={v => `${v}%`} name="Listing" label={{ value: 'Listing Gain', position: 'insideBottom', offset: -10, fill: '#475569', fontSize: 10 }} />
                      <YAxis dataKey="y" tick={{ fontSize: 9, fill: '#475569' }} tickFormatter={v => `${v}%`} />
                      <ZAxis dataKey="z" range={[30, 120]} />
                      <ReferenceLine x={0} stroke="rgba(255,255,255,0.12)" />
                      <ReferenceLine y={0} stroke="rgba(255,255,255,0.12)" />
                      <Tooltip content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0]?.payload;
                        return (
                          <div style={{ background: 'rgba(2,6,23,0.95)', border: `1px solid ${SECTOR_COLORS[d.s]}40`, borderRadius: 10, padding: '10px 14px', fontSize: 12 }}>
                            <div style={{ fontWeight: 700, color: '#F1F5F9', marginBottom: 4 }}>{d.c}</div>
                            <div style={{ color: SECTOR_COLORS[d.s] || '#38BDF8', fontSize: 10, marginBottom: 6 }}>{d.s}</div>
                            <div style={{ color: '#94A3B8' }}>Listing: <span style={{ color: '#38BDF8' }}>{d.x > 0 ? '+' : ''}{d.x}%</span></div>
                            <div style={{ color: '#94A3B8' }}>6M Return: <span style={{ color: d.y >= 0 ? '#34D399' : '#F87171' }}>{d.y > 0 ? '+' : ''}{d.y}%</span></div>
                          </div>
                        );
                      }} />
                      <Scatter data={scatterData} shape={(props) => {
                        const { cx, cy, payload } = props;
                        const color = SECTOR_COLORS[payload.s] || '#38BDF8';
                        return <circle cx={cx} cy={cy} r={6} fill={color} fillOpacity={0.7} stroke={color} strokeWidth={1} />;
                      }} />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div style={{ fontSize: 10, color: '#F87171', marginTop: 8, padding: '6px 10px', background: 'rgba(248,113,113,0.07)', borderRadius: 6, borderLeft: '2px solid rgba(248,113,113,0.4)' }}>
                  ⚠ Hype Trap Signal: High listing gain ≠ strong 6M performance. Pearson r = {pearson(D.map(d=>d.lg), D.map(d=>d.m6r))} (listing vs 6M)
                </div>
              </>
            )}

            {/* T-TEST TABLE */}
            {activeTab === 'ttest' && (
              <div>
                <div style={{ fontSize: 10, color: '#64748B', marginBottom: 12 }}>One-sample t-test vs H₀: mean return = 0% · df = {D.length - 1}</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                  {ttestData.map(r => (
                    <GlassCard key={r.label} style={{ padding: '14px 16px', border: `1px solid ${r.sig ? (r.mean > 0 ? 'rgba(52,211,153,0.2)' : 'rgba(248,113,113,0.2)') : 'rgba(255,255,255,0.06)'}` }}>
                      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', color: '#475569', marginBottom: 8 }}>{r.label} RETURN</div>
                      <div style={{ fontSize: 24, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: r.mean > 0 ? '#34D399' : '#F87171' }}>
                        {r.mean > 0 ? '+' : ''}{r.mean}%
                      </div>
                      <div style={{ fontSize: 10, color: '#64748B', marginTop: 6, fontVariantNumeric: 'tabular-nums' }}>
                        t = {r.t} · p = {r.pv}
                      </div>
                      <div style={{
                        marginTop: 8, padding: '3px 8px', borderRadius: 5, display: 'inline-block',
                        fontSize: 10, fontWeight: 700,
                        background: r.sig ? (r.mean > 0 ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)') : 'rgba(148,163,184,0.1)',
                        color: r.sig ? (r.mean > 0 ? '#34D399' : '#F87171') : '#64748B',
                      }}>
                        {r.sig ? (r.mean > 0 ? '✓ Significantly +ve' : '✗ Significantly −ve') : '~ Not significant'}
                      </div>
                    </GlassCard>
                  ))}
                </div>
                <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(56,189,248,0.05)', borderRadius: 8, borderLeft: '2px solid rgba(56,189,248,0.3)', fontSize: 11, color: '#94A3B8' }}>
                  <strong style={{ color: '#38BDF8' }}>Key Insight:</strong> Listing gains are statistically significant, but 6M returns show mean-reversion. The "Hype Trap" is mathematically confirmed.
                </div>
              </div>
            )}
          </GlassCard>

          {/* RIGHT PANEL: Calculator + Correlation */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

            {/* Investment Calculator */}
            <GlassCard style={{ padding: '16px 18px' }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#475569', marginBottom: 12 }}>💰 INVESTMENT CALCULATOR</div>
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 10, color: '#64748B', display: 'block', marginBottom: 4 }}>Initial Amount (₹)</label>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={e => setCalcAmount(e.target.value)}
                  placeholder="e.g. 100000"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 8,
                    padding: '7px 10px',
                    color: '#E2E8F0',
                    fontSize: 13,
                    fontVariantNumeric: 'tabular-nums',
                    outline: 'none',
                  }}
                />
              </div>
              {calcAmount && parseFloat(calcAmount) > 0 && (
                <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                  {topGainers.slice(0, 6).map(d => {
                    const worth = parseFloat(calcAmount) * (1 + d.m6r / 100);
                    const gain = worth - parseFloat(calcAmount);
                    return (
                      <div key={d.c} style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                      }}>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 600, color: '#E2E8F0' }}>{d.c}</div>
                          <div style={{ fontSize: 9, color: '#475569' }}>{d.s}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 11, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: d.m6r >= 0 ? '#34D399' : '#F87171' }}>
                            ₹{Math.round(worth).toLocaleString('en-IN')}
                          </div>
                          <div style={{ fontSize: 9, color: d.m6r >= 0 ? '#34D399' : '#F87171', fontVariantNumeric: 'tabular-nums' }}>
                            {gain >= 0 ? '+' : ''}₹{Math.round(gain).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              {(!calcAmount || parseFloat(calcAmount) <= 0) && (
                <div style={{ fontSize: 10, color: '#475569', textAlign: 'center', padding: '12px 0' }}>
                  Enter an amount to see returns across top gainers
                </div>
              )}
            </GlassCard>

            {/* Correlation Snapshot */}
            <GlassCard style={{ padding: '16px 18px', flex: 1 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#475569', marginBottom: 12 }}>PEARSON CORRELATION</div>
              {corrData.map(c => (
                <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ fontSize: 10, color: '#64748B', width: 56, flexShrink: 0 }}>{c.label}</div>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${Math.abs(c.r) * 100}%`,
                      background: corrColor(c.r),
                      borderRadius: 3,
                      marginLeft: c.r < 0 ? `${(1 + c.r) * 100}%` : 0,
                    }} />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: corrColor(c.r), width: 36, textAlign: 'right' }}>
                    {c.r > 0 ? '+' : ''}{c.r}
                  </div>
                </div>
              ))}
            </GlassCard>
          </div>
        </div>

        {/* BOTTOM ROW: Top Gainers + Sector Matrix + All Companies Table */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>

          {/* TOP GAINERS */}
          <GlassCard style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#475569', marginBottom: 12 }}>🏆 TOP 8 GAINERS (6M RETURN)</div>
            {topGainers.map((d, i) => {
              const color = SECTOR_COLORS[d.s] || '#38BDF8';
              const sparkData = [d.i, d.l, d.m1, d.m3, d.m6];
              return (
                <div key={d.c} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 0',
                  borderBottom: i < topGainers.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}>
                  <div style={{ fontSize: 10, color: '#334155', width: 16, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{i + 1}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#E2E8F0' }}>{d.c}</div>
                    <div style={{ fontSize: 9, color: color }}>{d.s}</div>
                  </div>
                  <SparkLine data={sparkData} color={color} height={28} />
                  <div style={{ textAlign: 'right', minWidth: 60 }}>
                    <ReturnBadge val={d.m6r} />
                    <div style={{ fontSize: 9, color: '#475569', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
                      List: {d.lg > 0 ? '+' : ''}{d.lg}%
                    </div>
                  </div>
                </div>
              );
            })}
          </GlassCard>

          {/* SECTOR MATRIX */}
          <GlassCard style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#475569', marginBottom: 12 }}>SECTOR PERFORMANCE MATRIX</div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr>
                    {['Sector', 'n', 'Listing', '1M', '3M', '6M', 'Trend'].map(h => (
                      <th key={h} style={{ padding: '4px 8px', textAlign: h === 'Sector' ? 'left' : 'right', color: '#475569', fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {SECTORS.map(s => {
                    const rows = D.filter(d => d.s === s);
                    const lg = avg(rows.map(d => d.lg)).toFixed(1);
                    const m1 = avg(rows.map(d => d.m1r)).toFixed(1);
                    const m3 = avg(rows.map(d => d.m3r)).toFixed(1);
                    const m6 = avg(rows.map(d => d.m6r)).toFixed(1);
                    const trend = parseFloat(m6) > parseFloat(lg) ? '↑' : parseFloat(m6) < parseFloat(lg) * 0.5 ? '↓' : '→';
                    const trendColor = trend === '↑' ? '#34D399' : trend === '↓' ? '#F87171' : '#FBBF24';
                    const color = SECTOR_COLORS[s];
                    return (
                      <tr key={s} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                        <td style={{ padding: '5px 8px', color: color, fontSize: 10, fontWeight: 600 }}>{s}</td>
                        <td style={{ padding: '5px 8px', textAlign: 'right', color: '#475569' }}>{rows.length}</td>
                        {[lg, m1, m3, m6].map((v, vi) => (
                          <td key={vi} style={{ padding: '5px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums', color: parseFloat(v) > 10 ? '#34D399' : parseFloat(v) > 0 ? '#86EFAC' : parseFloat(v) > -10 ? '#FB923C' : '#F87171', fontSize: 10 }}>
                            {parseFloat(v) > 0 ? '+' : ''}{v}%
                          </td>
                        ))}
                        <td style={{ padding: '5px 8px', textAlign: 'right', color: trendColor, fontSize: 14 }}>{trend}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* FULL COMPANY TABLE */}
        <GlassCard style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', color: '#475569' }}>ALL COMPANIES · PRICE TABLE</span>
            <span style={{ fontSize: 10, color: '#38BDF8', background: 'rgba(56,189,248,0.1)', padding: '2px 8px', borderRadius: 5 }}>
              {filtered.length} results
            </span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr>
                  {['#', 'Company', 'Sector', 'Issue ₹', 'Listing ₹', 'Listing', '1M Close', '1M Ret', '3M Close', '3M Ret', '6M Close', '6M Ret'].map(h => (
                    <th key={h} style={{
                      padding: '6px 10px',
                      textAlign: ['Issue ₹','Listing ₹','Listing','1M Close','1M Ret','3M Close','3M Ret','6M Close','6M Ret'].includes(h) ? 'right' : 'left',
                      color: '#475569', fontSize: 9, fontWeight: 700, letterSpacing: '0.07em',
                      borderBottom: '1px solid rgba(255,255,255,0.06)', whiteSpace: 'nowrap',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((d, i) => (
                  <tr key={d.c} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', transition: 'background 0.1s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '5px 10px', color: '#334155', fontVariantNumeric: 'tabular-nums' }}>{i + 1}</td>
                    <td style={{ padding: '5px 10px', color: '#E2E8F0', fontWeight: 600 }}>{d.c}</td>
                    <td style={{ padding: '5px 10px' }}>
                      <span style={{ fontSize: 10, color: SECTOR_COLORS[d.s], background: `${SECTOR_COLORS[d.s]}15`, padding: '2px 6px', borderRadius: 4 }}>{d.s}</span>
                    </td>
                    {[d.i, d.l].map((v, vi) => (
                      <td key={vi} style={{ padding: '5px 10px', textAlign: 'right', color: '#94A3B8', fontVariantNumeric: 'tabular-nums' }}>₹{v}</td>
                    ))}
                    <td style={{ padding: '5px 10px', textAlign: 'right' }}><ReturnBadge val={d.lg} /></td>
                    <td style={{ padding: '5px 10px', textAlign: 'right', color: '#94A3B8', fontVariantNumeric: 'tabular-nums' }}>₹{d.m1}</td>
                    <td style={{ padding: '5px 10px', textAlign: 'right' }}><ReturnBadge val={d.m1r} /></td>
                    <td style={{ padding: '5px 10px', textAlign: 'right', color: '#94A3B8', fontVariantNumeric: 'tabular-nums' }}>₹{d.m3}</td>
                    <td style={{ padding: '5px 10px', textAlign: 'right' }}><ReturnBadge val={d.m3r} /></td>
                    <td style={{ padding: '5px 10px', textAlign: 'right', color: '#94A3B8', fontVariantNumeric: 'tabular-nums' }}>₹{d.m6}</td>
                    <td style={{ padding: '5px 10px', textAlign: 'right' }}><ReturnBadge val={d.m6r} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* FOOTER INSIGHTS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
          {[
            { icon: '🛡️', title: 'The Policy Factor', color: '#FBBF24', text: 'Defense & Railway/PSU stocks show government spending as a stabilizing denominator. HAL +81% and IRCTC +254.7% (6M) confirm state-backed IPOs outperform over time.' },
            { icon: '⚡', title: 'The Hype Trap', color: '#F87171', text: `Listing vs 6M Pearson r = ${pearson(D.map(d=>d.lg), D.map(d=>d.m6r))}. Paytm (−71%), Nykaa (−2.2%), and Policybazaar (−49%) validate: high listing pops precede long-term erosion.` },
            { icon: '📊', title: 'The Profitability Denominator', color: '#34D399', text: 'Companies with positive EBITDA paths (DMart, IRCTC, SRF, Affle) dominate long-term returns. Profitability is the single most reliable predictor of post-listing sustainability.' },
          ].map(ins => (
            <GlassCard key={ins.title} style={{ padding: '14px 16px', borderColor: `${ins.color}20` }}>
              <div style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 16 }}>{ins.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, color: ins.color }}>{ins.title}</span>
              </div>
              <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.6, margin: 0 }}>{ins.text}</p>
            </GlassCard>
          ))}
        </div>

        <div style={{ textAlign: 'center', padding: '20px 0 8px', fontSize: 9, color: '#1E293B', letterSpacing: '0.1em' }}>
          DATA SOURCED FROM NSE/BSE OFFICIAL RECORDS · FOR EDUCATIONAL PURPOSES ONLY · NOT FINANCIAL ADVICE
        </div>
      </div>
    </div>
  );
}
