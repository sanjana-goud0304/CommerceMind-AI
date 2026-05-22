import axios from "axios";

import { useState, useMemo, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

/* ─── PALETTE ─────────────────────────────────────────────────── */
const P = {
  amber:"#f59e0b", teal:"#14b8a6", blue:"#3b82f6",
  purple:"#8b5cf6", coral:"#f97316", green:"#22c55e",
  bg:"#0d1117", card:"#161b27", cardBorder:"#1e2636",
  surface:"#1c2233", textPrimary:"#f0f4ff",
  textSecondary:"#8b9ab5", textMuted:"#4a5568",
};
const PAY_COLORS = [P.amber, P.teal, P.purple, P.blue];
const BAR_COLORS = [P.amber,P.teal,P.blue,P.purple,P.coral,P.green,"#60a5fa","#a78bfa","#fb923c","#34d399"];

/* ─── HELPERS ──────────────────────────────────────────────────── */
const fmtK = v => v >= 1e6 ? `R$${(v/1e6).toFixed(1)}M` : v >= 1000 ? `R$${(v/1000).toFixed(0)}K` : `R$${Math.round(v)}`;
const fmtN = n => new Intl.NumberFormat("en-US").format(Math.round(n));

/* ─── SHARED COMPONENTS ────────────────────────────────────────── */
const Tip = ({active,payload,label}) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:"#090d14",border:`1px solid ${P.cardBorder}`,borderRadius:8,padding:"10px 14px"}}>
      <p style={{color:P.textSecondary,fontSize:11,margin:"0 0 6px"}}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{color:p.color||P.amber,fontSize:12,fontWeight:600,margin:"2px 0"}}>
          {p.name}: R${fmtN(p.value)}
        </p>
      ))}
    </div>
  );
};

const Card = ({children,style}) => (
  <div style={{background:P.card,border:`1px solid ${P.cardBorder}`,borderRadius:16,padding:24,...style}}>
    {children}
  </div>
);

const KpiCard = ({label,value,sub,accent}) => (
  <div style={{background:P.card,border:`1px solid ${P.cardBorder}`,borderRadius:16,
    padding:"22px 24px",borderTop:`3px solid ${accent}`}}>
    <div style={{fontSize:11,fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",
      color:P.textSecondary,marginBottom:8}}>{label}</div>
    <div style={{fontSize:26,fontWeight:700,color:P.textPrimary,lineHeight:1.1}}>{value}</div>
    {sub && <div style={{fontSize:11,color:P.textMuted,marginTop:4}}>{sub}</div>}
  </div>
);

const Pill = ({label,active,color,onClick}) => (
  <button onClick={onClick} style={{
    background:active ? color+"28" : P.surface,
    border:`1px solid ${active ? color : P.cardBorder}`,
    color:active ? color : P.textSecondary,
    borderRadius:20,padding:"5px 13px",fontSize:12,
    fontWeight:active ? 600 : 400,cursor:"pointer",
    fontFamily:"inherit",transition:"all 0.15s",whiteSpace:"nowrap",
  }}>{label}</button>
);

/* ─── SLICER BAR ───────────────────────────────────────────────── */
 function SlicerBar({
  filters,
  setFilters,
  activeCount,
  onClear,
  categoryRevenue
}){
  const [open,setOpen] = useState(true);

  const toggle = (key,val) => setFilters(f => {
    const cur = f[key];
    if (val === "All") return {...f,[key]:["All"]};
    const without = cur.filter(v => v !== "All" && v !== val);
    const next = cur.includes(val) ? without : [...without,val];
    return {...f,[key]: next.length === 0 ? ["All"] : next};
  });

  const SLICERS = [
    {key:"year",    label:"Year",    color:P.amber,  opts:["All","2017","2018"]},
    {
  key:"category",
  label:"Category",
  color:P.teal,
  opts:["All", ...new Set(categoryRevenue.map(c => c.category))]
},
    {key:"payment", label:"Payment", color:P.purple, opts:["All","Credit Card","Boleto","Voucher","Debit Card"]},
    {key:"segment", label:"Segment", color:P.blue,   opts:["All","VIP","Premium","Regular"]},
  ];

  return (
    <div style={{background:P.card,borderBottom:`1px solid ${P.cardBorder}`}}>
      {/* Slicer toggle bar */}
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 40px",
        borderBottom:open ? `1px solid ${P.cardBorder}` : "none",flexWrap:"wrap"}}>
        <button onClick={()=>setOpen(o=>!o)} style={{
          display:"flex",alignItems:"center",gap:8,background:"none",
          border:`1px solid ${P.cardBorder}`,color:P.textSecondary,
          borderRadius:8,padding:"6px 12px",fontSize:12,cursor:"pointer",
          fontFamily:"inherit",flexShrink:0,
        }}>
          <span style={{fontSize:14}}>⊞</span>
          <span>Slicers</span>
          {activeCount > 0 && (
            <span style={{background:P.amber,color:"#000",borderRadius:10,
              fontSize:10,fontWeight:700,padding:"1px 7px"}}>{activeCount}</span>
          )}
          <span style={{fontSize:10,opacity:.5}}>{open ? "▲" : "▼"}</span>
        </button>

        {activeCount > 0 && (
          <button onClick={onClear} style={{background:"none",border:"none",
            color:P.textMuted,fontSize:12,cursor:"pointer",fontFamily:"inherit",
            textDecoration:"underline",flexShrink:0}}>
            Clear all
          </button>
        )}

        {/* Active filter chips */}
        <div style={{display:"flex",gap:6,flexWrap:"wrap",flex:1}}>
          {Object.entries(filters).flatMap(([k,vals]) =>
            vals.includes("All") ? [] : vals.map(v => {
              const sl = SLICERS.find(s=>s.key===k);
              return (
                <span key={k+v} style={{
                  background:sl.color+"22",border:`1px solid ${sl.color}44`,
                  color:sl.color,borderRadius:20,fontSize:11,padding:"2px 10px",
                  display:"flex",alignItems:"center",gap:5,
                }}>
                  <span style={{fontSize:10,opacity:.6}}>{sl.label}:</span>{v}
                  <span style={{cursor:"pointer",opacity:.7,marginLeft:2}}
                    onClick={()=>toggle(k,v)}>×</span>
                </span>
              );
            })
          )}
        </div>
      </div>

      {/* Slicer rows */}
      {open && (
        <div style={{padding:"14px 40px 18px",display:"flex",flexDirection:"column",gap:14}}>
          {SLICERS.map(sl => (
            <div key={sl.key} style={{display:"flex",alignItems:"center",gap:12}}>
              <span style={{
                fontSize:11,color:sl.color,fontWeight:600,width:68,flexShrink:0,
                letterSpacing:"0.07em",textTransform:"uppercase",
                borderRight:`2px solid ${sl.color}33`,paddingRight:12,
              }}>{sl.label}</span>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {sl.opts.map(opt => (
                  <Pill key={opt} label={opt}
                    active={filters[sl.key].includes(opt)}
                    color={sl.color}
                    onClick={()=>toggle(sl.key,opt)}/>
                ))}
              </div>
            </div>
          ))}
          <div style={{fontSize:11,color:P.textMuted,marginTop:2,paddingLeft:80}}>
            ✦ Multi-select supported on Category, Payment, and Segment — all charts update live
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── MAIN DASHBOARD ────────────────────────────────────────────── */
  export default function Dashboard() {

  // ─────────────────────────────────────────────
// STATES
// ─────────────────────────────────────────────
const [monthlyRevenue, setMonthlyRevenue] = useState([]);
const [categoryRevenue, setCategoryRevenue] = useState([]);
const [monthlyCategoryRevenue, setMonthlyCategoryRevenue] = useState([]);
const [paymentData, setPaymentData] = useState([]);
const [segmentData, setSegmentData] = useState([]);
const [repeatData, setRepeatData] = useState([]);
const [kpis, setKpis] = useState({});
const [insights, setInsights] = useState([]);
const [topCustomers, setTopCustomers] = useState([]);
// ─────────────────────────────────────────────
// MONTHLY REVENUE API
// ─────────────────────────────────────────────
useEffect(() => {

  axios
    .get("http://127.0.0.1:8000/monthly-revenue")

    .then((response) => {

      const formattedData = response.data.map((item) => ({

        month: `${item.month}/${item.year}`,

        yr: String(item.year),

        revenue: Number(item.revenue),

        orders: Number(item.orders)

      }));

      setMonthlyRevenue(formattedData);

    })

    .catch((error) => {

      console.error(
        "Monthly Revenue API Error:",
        error
      );

    });

}, []);


// ─────────────────────────────────────────────
// CATEGORY REVENUE API
// ─────────────────────────────────────────────
useEffect(() => {

  axios
    .get("http://127.0.0.1:8000/category-revenue")

    .then((response) => {

      const formatted = response.data.map((item) => ({

        category: item.category,

        revenue: Number(item.revenue),

        short: item.category
          .replaceAll("_", " ")
          .slice(0, 12)

      }));

      setCategoryRevenue(formatted);

    })

    .catch((error) => {

      console.error(
        "Category Revenue API Error:",
        error
      );

    });

}, []);


// ─────────────────────────────────────────────
// MONTHLY CATEGORY REVENUE API
// ─────────────────────────────────────────────
useEffect(() => {

  axios
    .get("http://127.0.0.1:8000/monthly-category-revenue")

    .then((response) => {

      const grouped = {};

      response.data.forEach((item) => {

        const key =
          `${item.month}/${item.year}`;

        if (!grouped[key]) {

          grouped[key] = {
            month: key,
            yr: String(item.year)
          };

        }

        grouped[key][item.category] =
          Number(item.revenue);

      });

      const formatted =
        Object.values(grouped);

      setMonthlyCategoryRevenue(formatted);

    })

    .catch((error) => {

      console.error(
        "Monthly Category API Error:",
        error
      );

    });

}, []);


// ─────────────────────────────────────────────
// KPI API
// ─────────────────────────────────────────────
useEffect(() => {

  axios
    .get("http://127.0.0.1:8000/kpis")

    .then((response) => {

      setKpis(response.data[0]);

    })

    .catch((error) => {

      console.error(
        "KPI API Error:",
        error
      );

    });

}, []);


// ─────────────────────────────────────────────
// PAYMENT BREAKDOWN API
// ─────────────────────────────────────────────
useEffect(() => {

  axios
    .get("http://127.0.0.1:8000/payment-breakdown")

    .then((response) => {

      const formatted =
        response.data.map((item) => ({

          name:
            item.payment_type
              .replace("_", " ")
              .replace(/\b\w/g, l => l.toUpperCase()),

          value:
            Number(item.revenue)

        }));

      setPaymentData(formatted);

    })

    .catch((error) => {

      console.error(
        "Payment API Error:",
        error
      );

    });

}, []);


// ─────────────────────────────────────────────
// CUSTOMER SEGMENTS API
// ─────────────────────────────────────────────
useEffect(() => {

  axios
    .get("http://127.0.0.1:8000/customer-segments")

    .then((response) => {

      const totalCustomers =
        response.data.reduce(
          (s,r)=>s + Number(r.count),
          0
        );

      const formatted =
        response.data.map((item) => ({

          name:
            item.customer_segment,

          count:
            Number(item.count),

          revenue:
            Number(item.revenue),

          pct:
            (
              Number(item.count)
              / totalCustomers
            ) * 100,

          color:
            item.customer_segment === "VIP"
              ? P.amber
              : item.customer_segment === "Premium"
              ? P.purple
              : P.blue

        }));

      setSegmentData(formatted);

    })

    .catch((error) => {

      console.error(
        "Segment API Error:",
        error
      );

    });

}, []);


// ─────────────────────────────────────────────
// REPEAT CUSTOMER API
// ─────────────────────────────────────────────
useEffect(() => {

  axios
    .get("http://127.0.0.1:8000/repeat-customers")

    .then((response) => {

      const data =
        response.data[0];

      setRepeatData([
        {
          name: "New",
          value:
            Number(
              data.single_purchase
            )
        },
        {
          name: "Repeat",
          value:
            Number(
              data.repeat_purchase
            )
        }
      ]);

    })

    .catch((error) => {

      console.error(
        "Repeat Customer API Error:",
        error
      );

    });

}, []);

// ─────────────────────────────────────────────
// TOP CUSTOMERS API
// ─────────────────────────────────────────────
useEffect(() => {

  axios
    .get("http://127.0.0.1:8000/top-customers")

    .then((response) => {

      setTopCustomers(response.data);

    })

    .catch((error) => {

      console.error(
        "Top Customers API Error:",
        error
      );

    });

}, []);


// ─────────────────────────────────────────────
// DYNAMIC INSIGHTS
// ─────────────────────────────────────────────

  // rest of dashboard code below
  const [tab, setTab] = useState("overview");
  const [filters, setFilters] = useState({
    year:["All"],category:["All"],payment:["All"],segment:["All"],
  });

  const TABS = ["overview","revenue","customers","products","insights"];
  const clearFilters = () => setFilters({year:["All"],category:["All"],payment:["All"],segment:["All"]});
  const activeCount = Object.values(filters).filter(v=>!v.includes("All")).reduce((a,v)=>a+v.length,0);

// ─────────────────────────────────────────────
// useMemo
// ─────────────────────────────────────────────
const d = useMemo(() => {

  const yrs =
    filters.year.includes("All")
      ? ["2017","2018"]
      : filters.year;

  const cats =
    filters.category.includes("All")
      ? [
          ...new Set(
            monthlyCategoryRevenue.flatMap(
              (item) =>
                Object.keys(item).filter(
                  (key) =>
                    !["month","yr"]
                      .includes(key)
                )
            )
          )
        ]
      : filters.category;

  const pays =
    filters.payment.includes("All")
      ? paymentData.map(p => p.name)
      : filters.payment;
  const segs =
  filters.segment.includes("All")
    ? segmentData.map(s => s.name)
    : filters.segment;


  // Monthly revenue
  const monthly =
    monthlyRevenue
      .filter(r =>
        yrs.includes(r.yr)
      );


  // Monthly category revenue
  const monthlyCat =
    monthlyCategoryRevenue.filter(
      r => yrs.includes(r.yr)
    );


  // Category revenue
  const catRev =
    categoryRevenue
      .filter(c =>
        cats.includes(c.category)
      )
      .sort(
        (a,b) =>
          b.revenue - a.revenue
      );


  // Payment data
  const payFilt =
    paymentData.filter(p =>
      pays.includes(p.name)
    );

  const payTotal =
    payFilt.reduce(
      (s,p)=>s+p.value,
      0
    );

  const payData =
    payFilt.map(p => ({
      ...p,

      pct:
        payTotal > 0
          ? +(
              (p.value/payTotal)
              * 100
            ).toFixed(1)
          : 0,
    }));


  // Segment data
  const segFilt = segmentData
  .filter(
    (s) =>
      segs.includes(s.name)
  )
  .map((s) => ({

    ...s,

    pct:
      (
        Number(s.count) /

        segmentData.reduce(
          (a, b) =>
            a + Number(b.count),
          0
        )

      ) * 100

  }));


  // KPI data
  const totalRevenue =
    Number(
      kpis.total_revenue || 0
    );

  const totalOrders =
    Number(
      kpis.total_orders || 0
    );

  const aov =
    totalOrders > 0
      ? totalRevenue / totalOrders
      : 0;

  const totalCustomers =
    segFilt.reduce(
      (s,r)=>s+r.count,
      0
    );


  // VIP Revenue Share
  const totalSegmentRevenue =
  segFilt.reduce(
    (s,r)=>s + r.revenue,
    0
  );

  const vipRevenue =
    segFilt.find(
      s => s.name === "VIP"
    )?.revenue || 0;

const vipRevenueShare =
  totalSegmentRevenue > 0
    ? (
        (vipRevenue /
        totalSegmentRevenue) * 100
      ).toFixed(1)
    : 0;


  // Repeat Rate
  const repeatCustomers =
    repeatData.find(
      r => r.name === "Repeat"
    )?.value || 0;

  const totalRepeatCustomers =
    repeatData.reduce(
      (s,r)=>s+r.value,
      0
    );

  const repeatRate =
    totalRepeatCustomers > 0
      ? (
          (repeatCustomers /
          totalRepeatCustomers) * 100
        ).toFixed(1)
      : 0;


  // Peak month
  const peakMonth =
    monthly.reduce(
      (p,c) =>
        c.revenue >
        (p?.revenue || 0)
          ? c
          : p,
      null
    );


  // Dynamic product lines
  const dynamicCategoryLines = [
    ...new Set(
      monthlyCategoryRevenue.flatMap(
        (item) =>
          Object.keys(item).filter(
            (key) =>
              !["month","yr"]
                .includes(key)
          )
      )
    )
  ].slice(0, 5); 
  
return {

    monthly,
    monthlyCat,
    catRev,
    payData,
    segFilt,

    totalRevenue,
    totalOrders,
    aov,
    totalCustomers,

    vipRevenueShare,
    repeatRate,

    peakMonth,

    dynamicCategoryLines

  };

}, [

  filters,

  monthlyRevenue,

  categoryRevenue,

  monthlyCategoryRevenue,

  paymentData,

  segmentData,

  repeatData,

  kpis

]);

 const categoryKeys =
  d.monthlyCat.length
    ? Object.keys(d.monthlyCat[0]).filter(
        key =>
          key !== "month" &&
          key !== "yr"
      )
    : [];

  return (
    <div style={{background:P.bg,minHeight:"100vh",fontFamily:"'DM Sans','Helvetica Neue',sans-serif",color:P.textPrimary}}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@500&display=swap" rel="stylesheet"/>

      {/* ── HEADER ── */}
      <div style={{background:P.card,borderBottom:`1px solid ${P.cardBorder}`,padding:"0 40px"}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",height:64}}>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            <div style={{width:36,height:36,borderRadius:10,background:P.amber,
              display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,color:"#000"}}>◈</div>
            <div>
              <div style={{fontSize:16,fontWeight:700}}>Olist Commerce</div>
              <div style={{fontSize:11,color:P.textSecondary}}>Executive Intelligence Dashboard</div>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:14}}>
            {activeCount > 0 && (
              <span style={{fontSize:12,color:P.amber,fontWeight:600}}>
                {activeCount} filter{activeCount>1?"s":""} active
              </span>
            )}
            <span style={{fontSize:12,color:P.textMuted,fontFamily:"'DM Mono',monospace"}}>Sep 2016 – Oct 2018</span>
            <div style={{background:P.surface,border:`1px solid ${P.cardBorder}`,borderRadius:8,
              padding:"6px 14px",fontSize:12,color:P.green,fontWeight:600,
              display:"flex",alignItems:"center",gap:6}}>
              <span style={{width:6,height:6,borderRadius:"50%",background:P.green,display:"inline-block"}}/>
              Live Slicers
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:4}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              background:"none",border:"none",
              borderBottom:`2px solid ${tab===t?P.amber:"transparent"}`,
              color:tab===t?P.amber:P.textSecondary,fontSize:13,
              fontWeight:tab===t?600:400,padding:"12px 18px",
              cursor:"pointer",fontFamily:"inherit",textTransform:"capitalize",
            }}>{t}</button>
          ))}
        </div>
      </div>

      {/* ── SLICER BAR ── */}
      <SlicerBar
  filters={filters}
  setFilters={setFilters}
  activeCount={activeCount}
  onClear={clearFilters}
  categoryRevenue={categoryRevenue}
/>
      {/* ── CONTENT ── */}
      <div style={{padding:"28px 40px",maxWidth:1400,margin:"0 auto"}}>

        {/* ════════ OVERVIEW ════════ */}
        {tab==="overview" && (
          <>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
              <KpiCard label="Total Revenue"   value={fmtK(d.totalRevenue)}       sub="Filtered selection" accent={P.amber}/>
              <KpiCard label="Total Orders"    value={fmtN(d.totalOrders)}        sub="Delivered orders"   accent={P.teal}/>
              <KpiCard label="Est. Customers"  value={fmtN(d.totalCustomers)}     sub="Unique buyers"      accent={P.purple}/>
              <KpiCard label="Avg Order Value" value={`R$${d.aov.toFixed(0)}`}    sub="Per order"          accent={P.blue}/>
            </div>

            {/* Secondary KPIs */}
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}}>
              {[
                {label:"Avg Review Score",  value:"4.09 / 5.0",    col:P.green},
                {label:"Repeat Rate",       value:"3.0%",           col:P.coral},
                {
  label:"VIP Revenue Share",
  value:`${d.vipRevenueShare}%`,
  col:P.amber
},
                {label:"Peak Month",        value:d.peakMonth?.month||"—", col:P.teal},
              ].map(s=>(
                <div key={s.label} style={{background:P.surface,borderRadius:12,padding:"14px 18px",border:`1px solid ${P.cardBorder}`}}>
                  <div style={{fontSize:11,color:P.textMuted,marginBottom:5,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase"}}>{s.label}</div>
                  <div style={{fontSize:19,fontWeight:700,color:s.col}}>{s.value}</div>
                </div>
              ))}
            </div>

            <Card style={{marginBottom:16}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                <div>
                  <h3 style={{margin:0,fontSize:15,fontWeight:700}}>Monthly Revenue Trend</h3>
                  <p style={{margin:"4px 0 0",fontSize:12,color:P.textSecondary}}>
                    {d.monthly.length} months · Total: {fmtK(d.totalRevenue)}
                    {d.peakMonth && ` · Peak: ${d.peakMonth.month} (${fmtK(d.peakMonth.revenue)})`}
                  </p>
                </div>
              </div>
              {d.monthly.length === 0
                ? <p style={{color:P.textMuted,textAlign:"center",padding:"32px 0"}}>No data for selected year(s)</p>
                : <div style={{height:240}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={d.monthly} margin={{top:5,right:10,bottom:5,left:10}}>
                        <defs>
                          <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={P.amber} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={P.amber} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke={P.cardBorder} strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="month" tick={{fill:P.textMuted,fontSize:10}} axisLine={false} tickLine={false}/>
                        <YAxis tickFormatter={v=>`R$${(v/1000).toFixed(0)}K`} tick={{fill:P.textMuted,fontSize:10}} axisLine={false} tickLine={false}/>
                        <Tooltip content={<Tip/>}/>
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke={P.amber} strokeWidth={2.5} fill="url(#g1)" dot={false} activeDot={{r:5}}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
              }
            </Card>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <Card>
                <h3 style={{margin:"0 0 14px",fontSize:15,fontWeight:700}}>Revenue by Payment</h3>
                {d.payData.length===0
                  ? <p style={{color:P.textMuted,textAlign:"center",padding:"24px 0"}}>No payment type selected</p>
                  : <>
                      <div style={{height:160}}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={d.payData} cx="50%" cy="50%" innerRadius={44} outerRadius={72} dataKey="value" paddingAngle={3}>
                              {d.payData.map((_,i)=><Cell key={i} fill={PAY_COLORS[i%4]}/>)}
                            </Pie>
                            <Tooltip formatter={v=>[`R$${fmtN(v)}`,""]} contentStyle={{background:"#090d14",border:`1px solid ${P.cardBorder}`,borderRadius:8}}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginTop:8}}>
                        {d.payData.map((p,i)=>(
                          <div key={i} style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:8,height:8,borderRadius:2,background:PAY_COLORS[i%4],flexShrink:0}}/>
                            <div>
                              <div style={{fontSize:11,color:P.textSecondary}}>{p.name}</div>
                              <div style={{fontSize:13,fontWeight:600,color:P.textPrimary}}>{p.pct}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                }
              </Card>

              <Card>
                <h3 style={{margin:"0 0 14px",fontSize:15,fontWeight:700}}>Customer Segments</h3>
                {d.segFilt.length===0
                  ? <p style={{color:P.textMuted,textAlign:"center",padding:"24px 0"}}>No segment selected</p>
                  : d.segFilt.map(s=>(
                    <div key={s.name} style={{marginBottom:14}}>
                      <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{width:10,height:10,borderRadius:2,background:s.color}}/>
                          <span style={{fontSize:13,fontWeight:500}}>{s.name}</span>
                        </div>
                        <div style={{display:"flex",gap:14}}>
                          <span style={{fontSize:12,color:P.textSecondary}}>{fmtN(s.count)}</span>
                          <span style={{fontSize:12,fontWeight:600,color:s.color}}>{fmtK(s.revenue)}</span>
                        </div>
                      </div>
                      <div style={{background:P.surface,borderRadius:4,height:6,overflow:"hidden"}}>
                        <div style={{width:`${s.pct}%`,background:s.color,height:"100%",borderRadius:4}}/>
                      </div>
                    </div>
                  ))
                }
              </Card>
            </div>
          </>
        )}

        {/* ════════ REVENUE ════════ */}
        {tab==="revenue" && (
          <>
            <div style={{marginBottom:20}}>
              <h2 style={{margin:0,fontSize:20,fontWeight:700}}>Revenue Analytics</h2>
              <p style={{margin:"4px 0 0",fontSize:13,color:P.textSecondary}}>
                {d.monthly.length} months · {d.catRev.length} categories · {d.payData.length} payment methods
              </p>
            </div>
            <Card style={{marginBottom:16}}>
              <h3 style={{margin:"0 0 4px",fontSize:15,fontWeight:700}}>Monthly Revenue Trend</h3>
              <p style={{margin:"0 0 16px",fontSize:12,color:P.textSecondary}}>
                Total: {fmtK(d.totalRevenue)} · Avg: {d.monthly.length>0 ? fmtK(Math.round(d.totalRevenue/d.monthly.length)) : "—"}/mo
                {d.peakMonth && ` · Peak: ${d.peakMonth.month} (${fmtK(d.peakMonth.revenue)})`}
              </p>
              {d.monthly.length===0
                ? <p style={{color:P.textMuted,textAlign:"center",padding:"32px 0"}}>No data for selected year</p>
                : <div style={{height:280}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={d.monthly} margin={{top:5,right:10,bottom:5,left:20}}>
                        <defs>
                          <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor={P.amber} stopOpacity={0.3}/>
                            <stop offset="95%" stopColor={P.amber} stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid stroke={P.cardBorder} strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="month" tick={{fill:P.textMuted,fontSize:10}} axisLine={false} tickLine={false}/>
                        <YAxis tickFormatter={v=>`R$${(v/1000).toFixed(0)}K`} tick={{fill:P.textMuted,fontSize:10}} axisLine={false} tickLine={false}/>
                        <Tooltip content={<Tip/>}/>
                        <Area type="monotone" dataKey="revenue" name="Revenue" stroke={P.amber} strokeWidth={2.5} fill="url(#g2)" dot={false} activeDot={{r:5}}/>
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
              }
            </Card>
            <div style={{display:"grid",gridTemplateColumns:"3fr 2fr",gap:16}}>
              <Card>
                <h3 style={{margin:"0 0 4px",fontSize:15,fontWeight:700}}>Revenue by Category</h3>
                <p style={{margin:"0 0 16px",fontSize:12,color:P.textSecondary}}>{d.catRev.length} categories — use Category slicer to filter</p>
                {d.catRev.length===0
                  ? <p style={{color:P.textMuted,textAlign:"center",padding:"32px 0"}}>No categories selected</p>
                  : <div style={{height:Math.max(240,d.catRev.length*36+50)}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={d.catRev} layout="vertical" margin={{top:0,right:20,bottom:0,left:100}}>
                          <CartesianGrid stroke={P.cardBorder} strokeDasharray="3 3" horizontal={false}/>
                          <XAxis type="number" tickFormatter={v=>`R$${(v/1000).toFixed(0)}K`} tick={{fill:P.textMuted,fontSize:10}} axisLine={false} tickLine={false}/>
                          <YAxis
                                dataKey="category"
                                type="category"
                                width={180}
                                tick={{
                                  fill: "#94a3b8",
                                  fontSize: 12
                                }}
                              />
                          <Tooltip content={<Tip/>}/>
                          <Bar dataKey="revenue" name="Revenue" radius={[0,4,4,0]}>
                            {d.catRev.map((_,i)=><Cell key={i} fill={BAR_COLORS[i%10]}/>)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                }
              </Card>
              <Card>
                <h3 style={{margin:"0 0 14px",fontSize:15,fontWeight:700}}>Payment Breakdown</h3>
                {d.payData.length===0
                  ? <p style={{color:P.textMuted,textAlign:"center",padding:"32px 0"}}>No payment type selected</p>
                  : <>
                      <div style={{height:170}}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={d.payData} cx="50%" cy="50%" innerRadius={46} outerRadius={76} dataKey="value" paddingAngle={3}>
                              {d.payData.map((_,i)=><Cell key={i} fill={PAY_COLORS[i%4]}/>)}
                            </Pie>
                            <Tooltip formatter={v=>[`R$${fmtN(v)}`,""]} contentStyle={{background:"#090d14",border:`1px solid ${P.cardBorder}`,borderRadius:8}}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      {d.payData.map((p,i)=>(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                          padding:"8px 12px",background:P.surface,borderRadius:8,marginBottom:6}}>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{width:8,height:8,borderRadius:2,background:PAY_COLORS[i%4]}}/>
                            <span style={{fontSize:12,color:P.textSecondary}}>{p.name}</span>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{fontSize:13,fontWeight:600,color:P.textPrimary}}>{fmtK(p.value)}</div>
                            <div style={{fontSize:11,color:P.textMuted}}>{p.pct}%</div>
                          </div>
                        </div>
                      ))}
                    </>
                }
              </Card>
            </div>
          </>
        )}

        {/* ════════ CUSTOMERS ════════ */}
        {tab==="customers" && (
          <>
            <div style={{marginBottom:20}}>
              <h2 style={{margin:0,fontSize:20,fontWeight:700}}>Customer Analytics</h2>
              <p style={{margin:"4px 0 0",fontSize:13,color:P.textSecondary}}>
                Segment: {filters.segment.join(", ")} · Year: {filters.year.join(", ")}
              </p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
              <Card>
                <h3 style={{margin:"0 0 16px",fontSize:15,fontWeight:700}}>Customer Segmentation</h3>
                {d.segFilt.length===0
                  ? <p style={{color:P.textMuted,textAlign:"center",padding:"32px 0"}}>No segment selected</p>
                  : <>
                      <div style={{height:185}}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={d.segFilt} cx="50%" cy="50%" innerRadius={46} outerRadius={76} dataKey="count" paddingAngle={3}>
                              {d.segFilt.map((s,i)=><Cell key={i} fill={s.color}/>)}
                            </Pie>
                            <Tooltip formatter={v=>[fmtN(v)+" customers",""]} contentStyle={{background:"#090d14",border:`1px solid ${P.cardBorder}`,borderRadius:8}}/>
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      {d.segFilt.map(s=>(
                        <div key={s.name} style={{display:"flex",justifyContent:"space-between",alignItems:"center",
                          padding:"10px 14px",background:P.surface,borderRadius:10,borderLeft:`3px solid ${s.color}`,marginBottom:8}}>
                          <div>
                            <div>
                           <div
                            style={{
                              fontSize:13,
                              fontWeight:600,
                              color:P.textPrimary
                            }}
                          >
                            {s.name}
                          </div>

                          <div
                            style={{
                              fontSize:11,
                              color:P.textSecondary
                            }}
                          >
                            {fmtN(s.count)} customers
                          </div>
                          </div>
                          </div>
                          <div style={{fontSize:16,fontWeight:700,color:s.color}}>{fmtK(s.revenue)}</div>
                        </div>
                      ))}
                    </>
                }
              </Card>

              <Card>
                <h3 style={{margin:"0 0 16px",fontSize:15,fontWeight:700}}>Repeat Purchase Analysis</h3>
                <div style={{height:160}}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={repeatData}
                        cx="50%" cy="50%" innerRadius={44} outerRadius={72} dataKey="value" paddingAngle={3}>
                        <Cell fill={P.surface}/>
                        <Cell fill={P.amber}/>
                      </Pie>
                      <Tooltip formatter={v=>[fmtN(v)+" customers",""]} contentStyle={{background:"#090d14",border:`1px solid ${P.cardBorder}`,borderRadius:8}}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginTop:10}}>
                  {[
  {
    label:"Single Purchase",

    v:`${(100 - d.repeatRate).toFixed(1)}%`,

    sub:`${
      fmtN(
        repeatData.find(
          r => r.name === "New"
        )?.value || 0
      )
    } customers`,

    col:P.textMuted
  },

  {
    label:"Repeat Buyers",

    v:`${d.repeatRate}%`,

    sub:`${
      fmtN(
        repeatData.find(
          r => r.name === "Repeat"
        )?.value || 0
      )
    } customers`,

    col:P.amber
  }
].map(s=>(
                    <div key={s.label} style={{padding:14,background:P.surface,borderRadius:10,textAlign:"center"}}>
                      <div style={{fontSize:22,fontWeight:700,color:s.col}}>{s.v}</div>
                      <div style={{fontSize:12,color:P.textSecondary,marginTop:2}}>{s.label}</div>
                      <div style={{fontSize:11,color:P.textMuted}}>{s.sub}</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:14,padding:"10px 14px",background:"#1a0e00",borderRadius:10,border:"1px solid #3d2800"}}>
                  <div style={{fontSize:12,color:P.amber,fontWeight:600}}>⚠ Retention Opportunity</div>
                  <div style={{fontSize:12,color:P.textSecondary,marginTop:3}}>Converting 5% of single-buyers → ~R$750K incremental revenue.</div>
                </div>
              </Card>
            </div>
            <Card>
              <h3 style={{margin:"0 0 16px",fontSize:15,fontWeight:700}}>Top Spending Customers (VIP)</h3>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                <thead>
                  <tr style={{borderBottom:`1px solid ${P.cardBorder}`}}>
                    {["Rank","Customer ID","Total Spend","Orders","Tier"].map(h=>(
                      <th key={h} style={{textAlign:"left",padding:"8px 12px",color:P.textMuted,
                        fontSize:11,fontWeight:600,letterSpacing:"0.06em",textTransform:"uppercase"}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>

  {topCustomers.map((c, i) => (

    <tr
      key={i}
      style={{
        borderBottom:`1px solid ${P.cardBorder}`,
        background:
          i % 2 === 0
            ? "transparent"
            : P.surface
      }}
    >

      <td
        style={{
          padding:"10px 12px",
          color:P.textMuted,
          fontWeight:700
        }}
      >
        #{i + 1}
      </td>

      <td
        style={{
          padding:"10px 12px",
          fontFamily:"DM Mono, monospace",
          color:P.textSecondary,
          fontSize:11
        }}
      >
        {c.customer_id.slice(0, 12)}...
      </td>

      <td
        style={{
          padding:"10px 12px",
          fontWeight:700,
          color:P.amber
        }}
      >
        {fmtK(c.total_spend)}
      </td>

      <td
        style={{
          padding:"10px 12px",
          color:P.textPrimary
        }}
      >
        {c.orders}
      </td>

      <td style={{padding:"10px 12px"}}>

        <span
          style={{
            background:"#2a1f00",
            color:P.amber,
            fontSize:11,
            fontWeight:600,
            padding:"3px 10px",
            borderRadius:20
          }}
        >
          VIP
        </span>

      </td>

    </tr>

  ))}

</tbody>
              </table>
            </Card>
          </>
        )}

        {/* ════════ PRODUCTS ════════ */}
        {tab==="products" && (
          <>
            <div style={{marginBottom:20}}>
              <h2 style={{margin:0,fontSize:20,fontWeight:700}}>Product Analytics</h2>
              <p style={{margin:"4px 0 0",fontSize:13,color:P.textSecondary}}>
                {d.catRev.length} categories · {d.monthly.length} months selected
              </p>
            </div>
            <Card style={{marginBottom:16}}>
              <h3 style={{margin:"0 0 4px",fontSize:15,fontWeight:700}}>Category Revenue Ranking</h3>
              <p style={{margin:"0 0 16px",fontSize:12,color:P.textSecondary}}>Use the Category slicer to isolate specific categories</p>
              {d.catRev.length===0
                ? <p style={{color:P.textMuted,textAlign:"center",padding:"32px 0"}}>No categories selected</p>
                : <div style={{height:Math.max(260,d.catRev.length*34+60)}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={d.catRev} margin={{top:0,right:20,bottom:10,left:10}}>
                        <CartesianGrid stroke={P.cardBorder} strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="short" tick={{fill:P.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
                        <YAxis tickFormatter={v=>`R$${(v/1000).toFixed(0)}K`} tick={{fill:P.textMuted,fontSize:11}} axisLine={false} tickLine={false}/>
                        <Tooltip content={<Tip/>}/>
                        <Bar dataKey="revenue" name="Revenue" radius={[4,4,0,0]}>
                          {d.catRev.map((_,i)=><Cell key={i} fill={BAR_COLORS[i%10]}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
              }
            </Card>
            <Card>
              <h3 style={{margin:"0 0 4px",fontSize:15,fontWeight:700}}>Monthly Category Performance (Top 5)</h3>
              <p style={{margin:"0 0 14px",fontSize:12,color:P.textSecondary}}>
                {d.monthlyCat.length} months · Health & Beauty accelerating from mid-2018
              </p>
              <div style={{display:"flex",flexWrap:"wrap",gap:12,marginBottom:14}}>
               {d.dynamicCategoryLines.map((category, index) => (

  <div
    key={category}
    style={{
      display:"flex",
      alignItems:"center",
      gap:6
    }}
  >

    <div
      style={{
        width:18,
        height:3,
        borderRadius:2,
        background:[
          P.amber,
          P.teal,
          P.purple,
          P.blue,
          P.coral
        ][index % 5]
      }}
    />

    <span
      style={{
        fontSize:11,
        color:P.textSecondary
      }}
    >
      {category.replaceAll("_"," ")}
    </span>

  </div>

))}
              </div>
              {d.monthlyCat.length===0
                ? <p style={{color:P.textMuted,textAlign:"center",padding:"32px 0"}}>No year selected</p>
                : <div style={{height:300}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={d.monthlyCat} margin={{top:5,right:10,bottom:5,left:20}}>
                        <CartesianGrid stroke={P.cardBorder} strokeDasharray="3 3" vertical={false}/>
                        <XAxis dataKey="month" tick={{fill:P.textMuted,fontSize:10}} axisLine={false} tickLine={false}/>
                        <YAxis tickFormatter={v=>`R$${(v/1000).toFixed(0)}K`} tick={{fill:P.textMuted,fontSize:10}} axisLine={false} tickLine={false}/>
                        <Tooltip content={<Tip/>}/>
                       {d.dynamicCategoryLines.map((category, index) => (


  <Line
    key={category}

    type="monotone"

    dataKey={category}

    name={category.replaceAll("_"," ")}

    stroke={[
      P.amber,
      P.teal,
      P.purple,
      P.blue,
      P.coral
    ][index % 5]}

    strokeWidth={2}

    dot={false}

    strokeDasharray={
      ["none","5 3","3 3","8 3","2 4"]
      [index % 5]
    }

  />

))}
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
              }
            </Card>
          </>
        )}

        {/* ════════ INSIGHTS ════════ */}
        {tab==="insights" && (
          <>
            <div style={{marginBottom:20}}>
              <h2 style={{margin:0,fontSize:20,fontWeight:700}}>Business Insights & Recommendations</h2>
              <p style={{margin:"4px 0 0",fontSize:13,color:P.textSecondary}}>Data-driven strategic priorities from the Olist dataset</p>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              {[
  {
    icon:"📈",
    tag:"Revenue",
    col:P.green,

    title:`Revenue reached ${fmtK(d.totalRevenue)}`,

    body:`${fmtN(d.totalOrders)} orders generated live SQL-backed revenue.`
  },

  {
    icon:"💳",
    tag:"Payments",
    col:P.blue,

    title:`Top payment: ${d.payData?.[0]?.name || "—"}`,

    body:`${d.payData[0].pct}% of transactions use ${d.payData[0].name}.`
  },

  {
    icon:"👑",
    tag:"Customers",
    col:P.amber,

    title:`VIP Revenue Share: ${d.vipRevenueShare}%`,

    body:`VIP customers contribute ${d.vipRevenueShare}% of total platform revenue.`
  },

  {
    icon:"🛒",
    tag:"Orders",
    col:P.teal,

    title:`Repeat Purchase Rate: ${d.repeatRate}%`,

    body:`${d.repeatRate}% of customers placed repeat orders.`
  }

].map((ins,i)=>(
                <Card key={i} style={{borderLeft:`3px solid ${ins.col}`}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:10,marginBottom:10}}>
                    <span style={{fontSize:20}}>{ins.icon}</span>
                    <h3 style={{margin:0,fontSize:14,fontWeight:700,lineHeight:1.3}}>{ins.title}</h3>
                  </div>
                  <p style={{margin:"0 0 14px",fontSize:13,color:P.textSecondary,lineHeight:1.7}}>{ins.body}</p>
                  <span style={{fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20,
                    background:ins.col+"22",color:ins.col}}>{ins.tag}</span>
                </Card>
              ))}
            </div>
            <Card style={{marginTop:16}}>
              <h3 style={{margin:"0 0 16px",fontSize:15,fontWeight:700}}>Executive Scorecard</h3>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
                {[
  {
    metric:"Revenue",

    score:fmtK(d.totalRevenue),

    detail:"Live SQL revenue",

    col:P.green
  },

  {
    metric:"Repeat Rate",

    score:`${d.repeatRate}%`,

    detail:"Returning customers",

    col:P.coral
  },

  {
    metric:"Top Category",

    score:
      d.catRev?.[0]?.short || "—",

    detail:
      d.catRev?.[0]
        ? fmtK(d.catRev[0].revenue)
        : "—",

    col:P.teal
  },

  {
    metric:"Top Payment",

    score:
      d.payData?.[0]?.name || "—",

    detail:
      d.payData?.[0]
        ? `${d.payData[0].pct}% share`
        : "—",

    col:P.amber
  }
].map(s=>(
                  <div key={s.metric} style={{textAlign:"center",padding:16,background:P.surface,borderRadius:12}}>
                    <div style={{fontSize:11,color:P.textMuted,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em"}}>{s.metric}</div>
                    <div style={{fontSize:17,fontWeight:700,color:s.col}}>{s.score}</div>
                    <div style={{fontSize:11,color:P.textSecondary,marginTop:4}}>{s.detail}</div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>

      <div style={{textAlign:"center",padding:20,borderTop:`1px solid ${P.cardBorder}`,color:P.textMuted,fontSize:11}}>
        Olist E-Commerce · Executive Dashboard · {fmtN(d.totalOrders)} delivered orders · Sep 2016 – Oct 2018
      </div>
    </div>
  );
}