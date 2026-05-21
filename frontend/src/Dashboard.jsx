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

/* ─── RAW DATA ─────────────────────────────────────────────────── */

const RAW_CATEGORY = [
  {category:"Health & Beauty",    short:"Health",    "2017":479407,"2018":753725},
  {category:"Watches & Gifts",    short:"Watches",   "2017":484322,"2018":681855},
  {category:"Bed, Bath & Table",  short:"Bed/Bath",  "2017":490324,"2018":533111},
  {category:"Sports & Leisure",   short:"Sports",    "2017":437686,"2018":517167},
  {category:"Computers & Acc.",   short:"Computers", "2017":392456,"2018":496269},
  {category:"Furniture & Decor",  short:"Furniture", "2017":308501,"2018":403427},
  {category:"Housewares",         short:"Housewares","2017":267621,"2018":348008},
  {category:"Cool Stuff",         short:"Cool Stuff","2017":265091,"2018":345113},
  {category:"Auto",               short:"Auto",      "2017":251542,"2018":327425},
  {category:"Toys",               short:"Toys",      "2017":204815,"2018":266471},
];

const RAW_PAYMENT = {
  "All":  [{name:"Credit Card",value:12101095},{name:"Boleto",value:2769933},{name:"Voucher",value:343013},{name:"Debit Card",value:208421}],
  "2017": [{name:"Credit Card",value:5432980}, {name:"Boleto",value:1244214},{name:"Voucher",value:154157},{name:"Debit Card",value:93640}],
  "2018": [{name:"Credit Card",value:6668115}, {name:"Boleto",value:1525719},{name:"Voucher",value:188856},{name:"Debit Card",value:114781}],
};

const RAW_SEGMENT = [
  {name:"Regular",count:74682,revenue:7166962,pct:80.1,color:P.blue},
  {name:"Premium",count:14007,revenue:4122939,pct:15.0,color:P.purple},
  {name:"VIP",    count:4668, revenue:4132561,pct:5.0, color:P.amber},
];

const monthlyRevenue_CAT = [
  {month:"Jun'17",yr:"2017",health_beauty:31677,watches_gifts:27338,bed_bath:33803,sports:32067,computers:36194},
  {month:"Jul'17",yr:"2017",health_beauty:34239,watches_gifts:33702,bed_bath:62787,sports:36619,computers:38176},
  {month:"Aug'17",yr:"2017",health_beauty:49030,watches_gifts:36171,bed_bath:56581,sports:40625,computers:33826},
  {month:"Sep'17",yr:"2017",health_beauty:50649,watches_gifts:44749,bed_bath:52106,sports:48972,computers:28041},
  {month:"Oct'17",yr:"2017",health_beauty:40699,watches_gifts:64875,bed_bath:46008,sports:48569,computers:42009},
  {month:"Nov'17",yr:"2017",health_beauty:78274,watches_gifts:95292,bed_bath:87958,sports:62686,computers:69676},
  {month:"Dec'17",yr:"2017",health_beauty:60689,watches_gifts:69557,bed_bath:50081,sports:58722,computers:37429},
  {month:"Jan'18",yr:"2018",health_beauty:71406,watches_gifts:73521,bed_bath:75408,sports:86173,computers:80504},
  {month:"Feb'18",yr:"2018",health_beauty:84577,watches_gifts:60725,bed_bath:60366,sports:74541,computers:100132},
  {month:"Mar'18",yr:"2018",health_beauty:84489,watches_gifts:95661,bed_bath:67786,sports:81657,computers:84708},
  {month:"Apr'18",yr:"2018",health_beauty:91058,watches_gifts:88623,bed_bath:71380,sports:65794,computers:57371},
  {month:"May'18",yr:"2018",health_beauty:94534,watches_gifts:119365,bed_bath:71265,sports:59210,computers:50632},
  {month:"Jun'18",yr:"2018",health_beauty:106746,watches_gifts:85028,bed_bath:70857,sports:44916,computers:41806},
  {month:"Jul'18",yr:"2018",health_beauty:103524,watches_gifts:95165,bed_bath:54405,sports:54016,computers:41063},
  {month:"Aug'18",yr:"2018",health_beauty:119391,watches_gifts:69767,bed_bath:60891,sports:50860,computers:40053},
];

const TOP_CUSTOMERS = [
  {id:"0a0a92…fa872",spend:13664.08,orders:1},
  {id:"da122d…690c", spend:7571.63, orders:2},
  {id:"763c8b…2b93", spend:7274.88, orders:1},
  {id:"dc4802…526",  spend:6929.31, orders:1},
  {id:"459bef…2a62", spend:6922.21, orders:1},
  {id:"ff4159…d66",  spend:6726.66, orders:1},
  {id:"400766…987",  spend:6081.54, orders:1},
  {id:"eebb5d…ccb",  spend:4764.34, orders:1},
];

const CAT_LINES = [
  {key:"health_beauty",label:"Health & Beauty",color:P.amber},
  {key:"watches_gifts",label:"Watches & Gifts",color:P.teal},
  {key:"bed_bath",     label:"Bed, Bath & Table",color:P.purple},
  {key:"sports",       label:"Sports & Leisure",color:P.blue},
  {key:"computers",    label:"Computers",color:P.coral},
];

const INSIGHTS = [
  {icon:"📈",tag:"Growth",  col:P.green, title:"9× Revenue Growth in 15 Months",
   body:"Revenue surged from R$127K (Jan 2017) to over R$1.1M/month by mid-2018. November 2017 spiked 53% MoM on Black Friday. Q4 promotional campaigns are the highest-leverage timing opportunity."},
  {icon:"💳",tag:"Payments",col:P.blue,  title:"Credit Card Concentration Risk",
   body:"78.5% of revenue flows through credit cards. Expanding installment options and Pix integration could unlock an underserved segment and reduce chargeback exposure significantly."},
  {icon:"👑",tag:"Customer",col:P.amber, title:"VIP Segment: 5% of Buyers → 26.8% of Revenue",
   body:"4,668 VIP customers generate R$4.13M — nearly matching all 74K Regular customers combined. A structured loyalty programme with early access and free delivery could double VIP order frequency."},
  {icon:"🔁",tag:"Retention",col:P.coral,title:"97% One-and-Done Purchase Pattern",
   body:"Only 3% of customers return. Converting 5% of single-buyers to repeat could add ~R$750K incrementally. Post-purchase email flows and subscription bundles are the highest-ROI levers."},
  {icon:"🧴",tag:"Product", col:P.teal,  title:"Health & Beauty — Emerging Market Leader",
   body:"The category overtook all peers from mid-2018, reaching R$119K in August 2018 (+277% vs Jun 2017). Invest in supplier depth and dedicated ad spend to consolidate this lead."},
  {icon:"🗺️",tag:"Strategy",col:P.purple,title:"42% Geographic Concentration in São Paulo",
   body:"SP represents 42% of customers; RJ and MG add another 25%. Targeted logistics expansion into RS, PR, and SC with regional seller onboarding is a clear incremental revenue unlock."},
];

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
function SlicerBar({filters,setFilters,activeCount,onClear}) {
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
    {key:"category",label:"Category",color:P.teal,   opts:["All",...RAW_CATEGORY.map(c=>c.category)]},
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

  const [monthlyRevenue, setMonthlyRevenue] = useState([]);

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

      console.error("API Error:", error);

    });

}, []);

  // rest of dashboard code below
  const [tab, setTab] = useState("overview");
  const [filters, setFilters] = useState({
    year:["All"],category:["All"],payment:["All"],segment:["All"],
  });

  const TABS = ["overview","revenue","customers","products","insights"];
  const clearFilters = () => setFilters({year:["All"],category:["All"],payment:["All"],segment:["All"]});
  const activeCount = Object.values(filters).filter(v=>!v.includes("All")).reduce((a,v)=>a+v.length,0);

  /* ── DERIVED / FILTERED DATA ── */
  const d = useMemo(() => {
    const yrs  = filters.year.includes("All")     ? ["2017","2018"]                      : filters.year;
    const cats = filters.category.includes("All") ? RAW_CATEGORY.map(c=>c.category)      : filters.category;
    const pays = filters.payment.includes("All")  ? ["Credit Card","Boleto","Voucher","Debit Card"] : filters.payment;
    const segs = filters.segment.includes("All")  ? ["VIP","Premium","Regular"]           : filters.segment;

    // Monthly revenue + orders (year-filtered)
   const monthly = monthlyRevenue
  .filter(r => yrs.includes(r.yr))
  .map(r => ({
    ...r,
    revenue: Number(r.revenue) || 0,
    orders: Number(r.orders) || 1
  }));

    // Monthly category trend (year-filtered)
    const monthlyCat = monthlyRevenue_CAT.filter(r => yrs.includes(r.yr));

    // Category revenue (year + category filtered)
    const catRev = RAW_CATEGORY
      .filter(c => cats.includes(c.category))
      .map(c => ({...c, revenue: yrs.reduce((s,y) => s+(c[y]||0), 0)}))
      .sort((a,b) => b.revenue - a.revenue);

    // Payment data (year + payment filtered)
    const payBase = yrs.length === 2 ? RAW_PAYMENT["All"]
                  : RAW_PAYMENT[yrs[0]] || RAW_PAYMENT["All"];
    const payFilt = payBase.filter(p => pays.includes(p.name));
    const payTotal = payFilt.reduce((s,p)=>s+p.value, 0);
    const payData = payFilt.map(p => ({
      ...p, pct: payTotal > 0 ? +((p.value/payTotal)*100).toFixed(1) : 0,
    }));

    // Segment data (segment filtered)
    const segFilt = RAW_SEGMENT.filter(s => segs.includes(s.name));

    // Compute KPIs with filters applied
    // Scale revenue by category selection ratio
    const allCatRev = RAW_CATEGORY.reduce((s,c)=>s+yrs.reduce((ss,y)=>ss+(c[y]||0),0),0);
    const selCatRev = catRev.reduce((s,c)=>s+c.revenue,0);
    const catScale  = allCatRev > 0 ? selCatRev/allCatRev : 1;
    // Scale by payment selection ratio
    const fullPayTotal = yrs.length===2 ? 15422461 : yrs[0]==="2017" ? 6924991 : 8497470;
    const payScale  = fullPayTotal > 0 ? Math.min(payTotal/fullPayTotal, 1) : 1;

    const baseRev      = monthly.reduce((s,r)=>s+r.revenue, 0);
    const totalRevenue = Math.round(baseRev * catScale * payScale);
    const totalOrders  = monthly.reduce((s,r)=>s+r.orders, 0);
    const aov          = totalOrders > 0 ? totalRevenue/totalOrders : 0;
    const totalCustomers = Math.round(totalOrders * 0.997);

    const peakMonth = monthly.reduce((p,c) => c.revenue > (p?.revenue||0) ? c : p, null);

    return {monthly,monthlyCat,catRev,payData,segFilt,
      totalRevenue,totalOrders,aov,totalCustomers,peakMonth};
  }, [filters, monthlyRevenue]);

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
      <SlicerBar filters={filters} setFilters={setFilters} activeCount={activeCount} onClear={clearFilters}/>

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
                {label:"VIP Revenue Share", value:"26.8%",          col:P.amber},
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
                          <YAxis type="category" dataKey="category" tick={{fill:P.textSecondary,fontSize:11}} axisLine={false} tickLine={false} width={105}/>
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
                            <div style={{fontSize:13,fontWeight:600}}>{s.name}</div>
                            <div style={{fontSize:11,color:P.textMuted}}>{s.pct}% · {fmtN(s.count)} customers</div>
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
                      <Pie data={[{name:"New",value:90556},{name:"Repeat",value:2801}]}
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
                    {label:"Single Purchase",v:"97.0%",sub:"90,556 customers",col:P.textMuted},
                    {label:"Repeat Buyers",  v:"3.0%", sub:"2,801 customers", col:P.amber},
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
                  {TOP_CUSTOMERS.map((c,i)=>(
                    <tr key={i} style={{borderBottom:`1px solid ${P.cardBorder}`,background:i%2===0?"transparent":P.surface}}>
                      <td style={{padding:"10px 12px",color:P.textMuted,fontWeight:700}}>#{i+1}</td>
                      <td style={{padding:"10px 12px",fontFamily:"'DM Mono',monospace",color:P.textSecondary,fontSize:11}}>{c.id}</td>
                      <td style={{padding:"10px 12px",fontWeight:700,color:P.amber}}>R${fmtN(c.spend)}</td>
                      <td style={{padding:"10px 12px",color:P.textPrimary}}>{c.orders}</td>
                      <td style={{padding:"10px 12px"}}>
                        <span style={{background:"#2a1f00",color:P.amber,fontSize:11,fontWeight:600,padding:"3px 10px",borderRadius:20}}>VIP</span>
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
                {CAT_LINES.map(c=>(
                  <div key={c.key} style={{display:"flex",alignItems:"center",gap:6}}>
                    <div style={{width:18,height:3,borderRadius:2,background:c.color}}/>
                    <span style={{fontSize:11,color:P.textSecondary}}>{c.label}</span>
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
                        {CAT_LINES.map((c,i)=>(
                          <Line key={c.key} type="monotone" dataKey={c.key} name={c.label}
                            stroke={c.color} strokeWidth={2} dot={false}
                            strokeDasharray={["none","5 3","3 3","8 3","2 4"][i]}/>
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
              {INSIGHTS.map((ins,i)=>(
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
                  {metric:"Revenue Growth",    score:"Excellent",    detail:"9× in 15 months",col:P.green},
                  {metric:"Customer Retention",score:"Critical",     detail:"3% repeat rate", col:P.coral},
                  {metric:"Product Diversity", score:"Strong",       detail:"10+ categories", col:P.teal},
                  {metric:"Payment Mix",       score:"Concentrated", detail:"78% credit card",col:P.amber},
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
        Olist E-Commerce · Executive Dashboard · 96,477 delivered orders · Sep 2016 – Oct 2018
      </div>
    </div>
  );
}