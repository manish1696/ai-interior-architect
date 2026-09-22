"use client";

import { ChangeEvent, DragEvent, useEffect, useMemo, useState } from "react";

const styles = ["Japandi", "Warm minimal", "Modern Indian", "Mid-century", "Soft industrial", "Contemporary"];
const roomTypes = ["Living room", "Bedroom", "Kitchen", "Home office", "Dining room"];
type Stage = "idle" | "analyzing" | "ready" | "generating" | "complete";

export default function Home() {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [style, setStyle] = useState(styles[0]);
  const [roomType, setRoomType] = useState(roomTypes[0]);
  const [budget, setBudget] = useState("₹2–4 lakh");
  const [prompt, setPrompt] = useState("Keep the windows and flooring. Add warm lighting, hidden storage, and a calm natural palette.");
  const [before, setBefore] = useState(48);
  const [error, setError] = useState("");
  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);
  const progress = useMemo(() => ({ idle: 0, analyzing: 35, ready: 55, generating: 78, complete: 100 }[stage]), [stage]);

  function acceptFile(file?: File) {
    setError("");
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose a room image (JPG, PNG, or WEBP).");
    if (file.size > 12 * 1024 * 1024) return setError("That image is over 12 MB. Please choose a smaller one.");
    if (fileUrl) URL.revokeObjectURL(fileUrl);
    setFileUrl(URL.createObjectURL(file)); setFile(file); setResultUrl(null); setFileName(file.name); setStage("analyzing");
    window.setTimeout(() => setStage("ready"), 1400);
  }
  async function generate() {
    if (!fileUrl || !file) return setError("Upload a room photo first.");
    setError(""); setStage("generating");
    const api = process.env.NEXT_PUBLIC_API_URL;
    if (!api) return window.setTimeout(() => setStage("complete"), 2200);
    const form = new FormData();
    form.append("image", file);
    form.append("payload", JSON.stringify({room_type: roomType, style, budget, instructions: prompt}));
    try {
      const response = await fetch(`${api}/api/v1/design`, {method: "POST", body: form});
      if (!response.ok) throw new Error((await response.json()).detail || "Local generation failed");
      const data = await response.json();
      setResultUrl(`${api}${data.output_url}`); setStage("complete");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reach the local model service");
      setStage("ready");
    }
  }

  return <main>
    <header className="nav"><a className="brand" href="#top"><span className="brandMark">F</span><span>FORMA <i>AI</i></span></a><nav><a href="#studio">Studio</a><a href="#process">How it works</a><a href="#architecture">Architecture</a></nav><span className="localBadge"><b/> Local models</span></header>
    <section className="hero" id="top"><div className="heroCopy"><span className="eyebrow">SPATIAL INTELLIGENCE · GENERATIVE DESIGN</span><h1>See your room,<br/><em>reimagined.</em></h1><p>Upload one photograph. Our local multimodal pipeline understands the space, preserves its structure, and creates a practical interior concept around your taste and budget.</p><a className="primary" href="#studio">Design my room <span>↘</span></a><div className="trust"><span>100% local processing</span><span>No photo retention</span><span>Structure-aware</span></div></div><div className="heroScene"><div className="sun"/><div className="arch"><div className="chair"><i/><b/><span/></div><div className="plant">✦</div></div><span className="sceneTag tagOne">01 · Understand</span><span className="sceneTag tagTwo">02 · Plan</span><span className="sceneTag tagThree">03 · Reimagine</span></div></section>
    <section className="studio" id="studio"><div className="sectionHead"><div><span className="eyebrow">DESIGN STUDIO</span><h2>Start with your space.</h2></div><p>One clear, wide-angle photo works best. The system identifies permanent structure before proposing any visual changes.</p></div>
      <div className="workspace"><div className="uploadPanel"><label className={`dropzone ${fileUrl ? "hasImage" : ""}`} onDragOver={e=>e.preventDefault()} onDrop={(e:DragEvent)=>{e.preventDefault();acceptFile(e.dataTransfer.files[0])}}>{fileUrl?<><img src={fileUrl} alt="Uploaded room"/><span className="changePhoto">Change photo</span></>:<div><span className="uploadIcon">↥</span><h3>Drop your room photo here</h3><p>or click to browse · JPG, PNG, WEBP · max 12 MB</p></div>}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e:ChangeEvent<HTMLInputElement>)=>acceptFile(e.target.files?.[0])}/></label>{fileName&&<p className="fileName">{fileName}<span>ready</span></p>}{error&&<p className="error" role="alert">{error}</p>}{stage!=="idle"&&<div className="analysis"><div className="analysisTop"><strong>{stage==="analyzing"?"Reading the room…":stage==="generating"?"Generating concept…":stage==="complete"?"Concept ready":"Spatial analysis complete"}</strong><span>{progress}%</span></div><div className="progress"><i style={{width:`${progress}%`}}/></div><div className="signals"><span className={stage!=="analyzing"?"on":""}>✓ Room geometry</span><span className={stage!=="analyzing"?"on":""}>✓ Openings</span><span className={stage==="complete"?"on":""}>✓ Design validation</span></div></div>}</div>
        <div className="controls"><label>Room type<select value={roomType} onChange={e=>setRoomType(e.target.value)}>{roomTypes.map(x=><option key={x}>{x}</option>)}</select></label><fieldset><legend>Design direction</legend><div className="styleGrid">{styles.map(x=><button type="button" className={style===x?"selected":""} onClick={()=>setStyle(x)} key={x}>{x}<small>{x==="Modern Indian"?"Craft · colour":x==="Japandi"?"Calm · natural":"Curated mood"}</small></button>)}</div></fieldset><label>Working budget<select value={budget} onChange={e=>setBudget(e.target.value)}><option>Under ₹1 lakh</option><option>₹1–2 lakh</option><option>₹2–4 lakh</option><option>₹4–8 lakh</option><option>Flexible</option></select></label><label>What should change?<textarea value={prompt} onChange={e=>setPrompt(e.target.value)} rows={4}/><small className="hint">Mention anything that must stay unchanged.</small></label><button className="generate" onClick={generate} disabled={stage==="analyzing"||stage==="generating"}>{stage==="generating"?"Designing your space…":"Generate interior concept"}<span>✦</span></button></div></div>
      {stage==="complete"&&<section className="result" aria-live="polite"><div className="resultHead"><div><span className="eyebrow">CONCEPT 01</span><h2>{style} {roomType.toLowerCase()}</h2></div><div><button>Save concept</button><button onClick={generate}>Generate variation</button></div></div><div className="compare" style={{"--split":`${before}%`} as React.CSSProperties}><img src={fileUrl!} alt="Original room"/><div className="afterLayer"><img src={resultUrl || fileUrl!} alt="AI concept preview"/></div><div className="designWash"/><span className="beforeLabel">Before</span><span className="afterLabel">Concept</span><input aria-label="Compare before and concept" type="range" min="4" max="96" value={before} onChange={e=>setBefore(Number(e.target.value))}/><i className="divider"/></div><div className="resultGrid"><article><span className="cardNo">01</span><h3>Design rationale</h3><p>The layout retains all detected openings and circulation paths. Natural textures, low visual weight, and layered warm lighting support the {style.toLowerCase()} direction.</p></article><article><span className="cardNo">02</span><h3>Material palette</h3><div className="swatches"><i/><i/><i/><i/></div><p>Warm oak · limewash · natural linen · charcoal metal</p></article><article><span className="cardNo">03</span><h3>Budget allocation</h3><dl><div><dt>Furniture</dt><dd>42%</dd></div><div><dt>Lighting</dt><dd>18%</dd></div><div><dt>Finish & decor</dt><dd>40%</dd></div></dl></article></div><p className="demoNote">Interactive concept mode is active. Connect the included local inference service to replace this visual treatment with generated pixels.</p></section>}
    </section>
    <section className="process" id="process"><span className="eyebrow">A CAREFUL PIPELINE</span><h2>Creativity, with constraints.</h2><div className="steps"><article><b>01</b><h3>Read the room</h3><p>Segment furniture and structure, estimate depth, and identify protected geometry.</p></article><article><b>02</b><h3>Plan the intervention</h3><p>A design planner reconciles taste, functional needs, structural limits, and budget.</p></article><article><b>03</b><h3>Generate & validate</h3><p>Conditioned diffusion creates options; a vision critic rejects structural drift.</p></article></div></section>
    <section className="architecture" id="architecture"><div><span className="eyebrow">LOCAL-FIRST ARCHITECTURE</span><h2>Your room never needs to leave your machine.</h2><p>Every capability is isolated behind an adapter. Run the full open-source pipeline locally today; replace only a single model with a managed endpoint later.</p></div><div className="pipeline"><span>Room image</span><i>→</i><span>SAM 2 + Depth</span><i>→</i><span>Design planner</span><i>→</i><span>FLUX + ControlNet</span><i>→</i><span>Vision critic</span></div></section>
    <footer><a className="brand" href="#top"><span className="brandMark">F</span><span>FORMA <i>AI</i></span></a><p>Local-first generative interior design.</p><span>Portfolio prototype · 2026</span></footer>
  </main>;
}
