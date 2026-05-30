import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Dumbbell, History as Hist, Plus, ArrowLeft, Check, X, Save, Play, Pause,
  Edit3, Trash2, TrendingUp, BookOpen, Clock, RotateCcw, ChevronDown,
  ChevronUp, Flame
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
// ── Firebase SDK ──────────────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC0M2zy9SXEcX1jHqSOX03P0vOmyeEZvVw",
  authDomain: "gym-app-ac6a9.firebaseapp.com",
  projectId: "gym-app-ac6a9",
  storageBucket: "gym-app-ac6a9.firebasestorage.app",
  messagingSenderId: "635808506550",
  appId: "1:635808506550:web:818f3b1bf2aa2c94b8fc17"
};

const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);
const DOC_REF = doc(db, "gymapp", "luiz");


// ── Forest Theme ──────────────────────────────────────────────────────────────
const A   = "#C9A84C";   // ouro
const BLK = "#141A0F";   // verde-preto profundo
const BG  = "#1A1F14";   // fundo geral
const C1  = "#242E1C";   // card principal
const C2  = "#1E2718";   // card secundário
const C3  = "#192015";   // card terciário
const B1  = "#3A4D30";   // borda
const T1  = "#EDE5C8";   // texto principal (creme)
const T2  = "#9E9070";   // texto secundário
const T3  = "#6A6048";   // texto muted
const RED = "#C4503A";   // vermelho quente

// ── Weight Slider ─────────────────────────────────────────────────────────────
if (typeof document !== "undefined") {
  const s = document.createElement("style");
  s.textContent = `
    body { background: #1A1F14 }
    .wslider { -webkit-appearance: none; appearance: none; width: 100%; height: 8px; background: transparent; cursor: pointer; outline: none; }
    .wslider::-webkit-slider-runnable-track { height: 8px; background: #3A4D30; border-radius: 99px; }
    .wslider::-webkit-slider-thumb { -webkit-appearance: none; width: 30px; height: 30px; background: #C9A84C; border-radius: 50%; margin-top: -11px; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.4); }
    .wslider::-moz-range-track { height: 8px; background: #3A4D30; border-radius: 99px; }
    .wslider::-moz-range-thumb { width: 30px; height: 30px; background: #C9A84C; border-radius: 50%; border: none; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.4); }
  `;
  document.head.appendChild(s);
}

function WeightSlider({ value = 0, onChange }) {
  const snap = v => parseFloat(Math.max(0, Math.min(150, v)).toFixed(1));
  const display = value % 1 === 0 ? String(value) : value.toFixed(1);
  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <button onClick={() => onChange(snap(value - 0.5))}
          style={{ width: 46, height: 46, borderRadius: 12, background: C3, border: `1.5px solid ${B1}`, fontSize: 25, fontWeight: 900, color: T2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "inherit", lineHeight: 1 }}>−</button>
        <div style={{ flex: 1, background: BLK, borderRadius: 10, padding: "7px 0", textAlign: "center", border: `1px solid ${B1}` }}>
          <span style={{ fontSize: 25, fontWeight: 900, color: A, fontVariantNumeric: "tabular-nums" }}>{display}</span>
          <span style={{ fontSize: 18, color: T3, fontWeight: 600 }}> kg</span>
        </div>
        <button onClick={() => onChange(snap(value + 0.5))}
          style={{ width: 46, height: 46, borderRadius: 12, background: C3, border: `1.5px solid ${B1}`, fontSize: 25, fontWeight: 900, color: T2, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "inherit", lineHeight: 1 }}>+</button>
      </div>
      <input type="range" min="0" max="150" step="0.5" value={value}
        onChange={ev => onChange(parseFloat(ev.target.value))}
        className="wslider" />
    </div>
  );
}

// ── Rest Timer ────────────────────────────────────────────────────────────────
function RestTimer() {
  const [dur, setDur] = useState(60);
  const [rem, setRem] = useState(60);
  const [on, setOn] = useState(false);
  const t = useRef(null);
  useEffect(() => {
    if (on && rem > 0) t.current = setTimeout(() => setRem(r => r - 1), 1000);
    else if (on && rem === 0) setOn(false);
    return () => clearTimeout(t.current);
  }, [on, rem]);
  const changeDur = s => { setDur(s); setRem(s); setOn(false); };
  return (
    <div style={{ background: BLK, borderRadius: 12, padding: "10px 14px", marginTop: 8, border: `1px solid ${B1}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ display: "flex", gap: 5 }}>
          {[40, 60, 90].map(s => (
            <button key={s} onClick={() => changeDur(s)} style={{ background: dur === s ? A : C2, border: `1px solid ${dur === s ? A : B1}`, borderRadius: 7, padding: "4px 8px", fontSize: 17, fontWeight: 700, color: dur === s ? BLK : T3, cursor: "pointer", fontFamily: "inherit" }}>
              {s >= 60 ? `${s / 60}min` : `${s}s`}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 25, fontWeight: 800, color: rem < 10 ? RED : A, fontVariantNumeric: "tabular-nums", minWidth: 44, textAlign: "right" }}>
            {Math.floor(rem / 60)}:{(rem % 60).toString().padStart(2, "0")}
          </span>
          <button onClick={() => { if (!on) setRem(dur); setOn(o => !o); }} style={{ background: on ? "rgba(224,48,48,0.2)" : "rgba(201,168,76,0.18)", border: "none", borderRadius: 8, padding: "7px", color: on ? RED : A, cursor: "pointer", display: "flex" }}>
            {on ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button onClick={() => { setOn(false); setRem(dur); }} style={{ background: C2, border: "none", borderRadius: 8, padding: "7px", color: T3, cursor: "pointer", display: "flex" }}>
            <RotateCcw size={17} />
          </button>
        </div>
      </div>
      <div style={{ marginTop: 8, background: C2, borderRadius: 99, height: 3, overflow: "hidden" }}>
        <div style={{ background: rem < 10 ? RED : A, height: "100%", width: `${(rem / dur) * 100}%`, borderRadius: 99, transition: "width 1s linear" }} />
      </div>
    </div>
  );
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function Modal({ title, onClose, children }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100, backdropFilter: "blur(3px)" }}>
      <div style={{ background: C1, borderRadius: "24px 24px 0 0", width: "100%", maxWidth: 480, padding: "24px 20px 40px", maxHeight: "92vh", overflowY: "auto", boxShadow: "0 -8px 40px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <span style={{ fontSize: 21, fontWeight: 800, color: T1 }}>{title}</span>
          <button onClick={onClose} style={{ background: C3, border: "none", borderRadius: 8, padding: "7px", color: T2, cursor: "pointer", display: "flex" }}><X size={21} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ── UI Atoms ──────────────────────────────────────────────────────────────────
function Inp({ label, value, onChange, placeholder, type = "text" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {label && <label style={{ fontSize: 17, color: T3, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700 }}>{label}</label>}
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ background: C2, border: `1.5px solid ${B1}`, borderRadius: 12, color: T1, padding: "13px 15px", fontSize: 20, outline: "none", fontFamily: "inherit", width: "100%", boxSizing: "border-box" }} />
    </div>
  );
}
function Lbl({ children }) {
  return <div style={{ fontSize: 17, color: T3, letterSpacing: 1.2, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }}>{children}</div>;
}
function PrimBtn({ onClick, children, disabled, danger }) {
  const bg = disabled ? C3 : danger ? RED : BLK;
  const col = disabled ? T3 : "#fff";
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: "100%", background: bg, color: col, border: "none", borderRadius: 16, padding: "17px", fontSize: 21, fontWeight: 800, cursor: disabled ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, fontFamily: "inherit", letterSpacing: 0.3 }}>
      {children}
    </button>
  );
}
function GhostBtn({ onClick, children, accent }) {
  return (
    <button onClick={onClick} style={{ width: "100%", background: accent ? `rgba(201,168,76,0.15)` : C2, color: accent ? A : T2, border: `1.5px solid ${accent ? "rgba(201,168,76,0.4)" : B1}`, borderRadius: 16, padding: "15px", fontSize: 20, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
      {children}
    </button>
  );
}
function BackBtn({ onClick }) {
  return (
    <button onClick={onClick} style={{ background: C1, border: `1.5px solid ${B1}`, borderRadius: 12, color: T1, cursor: "pointer", padding: "9px 11px", display: "flex", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      <ArrowLeft size={23} />
    </button>
  );
}
function PageHeader({ onBack, title, sub }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
      <BackBtn onClick={onBack} />
      <div>
        <div style={{ fontSize: 25, fontWeight: 900, color: T1, letterSpacing: -0.5 }}>{title}</div>
        {sub && <div style={{ fontSize: 16, color: T3, marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}
function Card({ children, style, onClick }) {
  return (
    <div onClick={onClick} style={{ background: C1, borderRadius: 18, padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: `1px solid ${B1}`, ...style }}>
      {children}
    </div>
  );
}

function fmtDate(ts) { return new Date(ts).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "2-digit" }); }
function fmtTime(ts) { return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }); }
function fmtDur(s) { const m = Math.floor(s / 60); return m > 0 ? `${m}min` : `${s}s`; }
function uid() { return Math.random().toString(36).slice(2); }

// ── Exercise Categories ───────────────────────────────────────────────────────
const EX_CATS = {
  "🏋️ Peito":      ["Supino reto","Supino 45","Supino máquina","Supino canadense","Supino reto halter","Supino 45 halter","Crucifixo máquina","Crucifixo halter","Crucifixo invertido","Crossover","Flexão de braço","Flexão 2/1","Pullover","Supino inclinado halter"],
  "🦅 Costas":     ["Pulley frente","Pulley frente supinado","Puxada frontal","Remada baixa","Remada máquina aberta","Remada máquina fechada","Remada cavalete aberto","Remada cavalete fechado","Remada alta","Remada unilateral halter","Remada corda polia","Barra fixa","Graviton","Banco lombar"],
  "💪 Braços":     ["Rosca direta","Rosca scott","Rosca 45","Rosca martelo","Rosca direta polia","Rosca direta halter","Tríceps corda","Tríceps pulley","Tríceps mergulho","Tríceps testa","Tríceps paralela","Tríceps francês halter"],
  "🔺 Ombros":     ["Desenvolvimento halter","Desenvolvimento máquina","Elevação lateral","Elevação frontal corda","Crucifixo invertido máquina","Remada alta polia","Elevação lateral máquina"],
  "🦵 Pernas":     ["Leg 45","Leg horizontal","Leg 45 abduzido","Extensora","Cadeira flexora","Mesa flexora","Agachamento","Agachamento Smitt","Agachamento halter","Hack machine","Afundo","Afundo Smitt","Passada","Stiff","Terra","Swing","Abdutora","Panturrilha máquina","Extensão quadril solo","Agachamento isométrico"],
  "🔥 Abdominais": ["Abdominal supra","Abdominal infra","Abdominal prancha","Abdominal remador","Abdominal canivete","Abdominal oblíquo","Abdominal rolinho","Prancha lateral","Abdominal borboleta","Abdominal supra c/peso","Abdominal infra paralela","Abdominal corda polia","Elevação de pernas","Crunch máquina","Hipopressivo"],
  "🏃 Aeróbico":   ["Esteira HIIT","Esteira caminhada 30min","Remo ergométrico 1000m","Bike HIIT","Bike estacionária 20min","Corda naval","Pular corda","Burpee","Polichinelo","Corrida 30min","Corrida intervalada","Escada (subidas)","Elíptico 20min","Step aeróbico","Circuito funcional"],
};

// ── Dicionário de dicas por exercício ─────────────────────────────────────────
const EX_DESC = {
  // Peito
  "Supino reto":          "Desça a barra controladamente até tocar o peito. Cotovelos a ~75°. Empurre de forma explosiva.",
  "Supino 45":            "Banco inclinado. Foco na parte superior do peitoral. Não arqueie excessivamente a lombar.",
  "Supino máquina":       "Ajuste o banco para que as alças fiquem na linha do peito. Movimento controlado nas duas fases.",
  "Supino canadense":     "Pegada fechada. Trabalha peitoral interno e tríceps. Cotovelos paralelos ao longo do movimento.",
  "Supino reto halter":   "Halters permitem maior amplitude. Desça até sentir o alongamento do peitoral. Empurre explosivo.",
  "Supino 45 halter":     "Banco inclinado com halters. Maior liberdade de movimento. Mantenha os punhos neutros.",
  "Crucifixo máquina":    "Leve flexão nos cotovelos. Sinta o peitoral alongar na abertura. Aperte no fechamento.",
  "Crucifixo halter":     "Movimento em arco. Desça em arco amplo para máximo alongamento. Não trave os cotovelos.",
  "Crucifixo invertido":  "Banco declinado ou máquina inclinada. Foco no peitoral inferior. Controle a abertura.",
  "Crossover":            "Polia alta ou média. Cruze os punhos ao fechar para máxima contração do peitoral.",
  "Flexão de braço":      "Corpo totalmente alinhado. Desça até o peito quase tocar o chão. Empurre explosivo.",
  "Flexão 2/1":           "Suba com os dois braços, desça com apenas um. Aumenta a carga excêntrica no músculo.",
  "Pullover":             "Deitado no banco. Mantenha leve flexão nos cotovelos. Sinta o alongamento do dorsal e peitoral.",
  // Costas
  "Pulley frente":        "Puxe até a barra tocar o peito superior. Cotovelos apontando para baixo. Retração escapular.",
  "Pulley frente supinado":"Pegada supinada ativa mais o bíceps. Pense em apontar os cotovelos para o chão ao puxar.",
  "Puxada frontal":       "Variação do pulley. Mantenha o tronco levemente inclinado para trás. Puxe até a linha do queixo.",
  "Remada baixa":         "Costas retas. Puxe em direção ao abdômen. Aperte as escápulas ao final do movimento.",
  "Remada máquina aberta":"Cotovelos para o lado. Foco no trapézio médio e romboides. Pausa de 1s na contração.",
  "Remada máquina fechada":"Cotovelos próximos ao corpo. Trabalha o dorsal largo. Não arredonde a lombar.",
  "Remada cavalete aberto":"Tronco paralelo ao chão. Puxe para o lado. Foco no trapézio e romboides.",
  "Remada cavalete fechado":"Tronco paralelo. Cotovelos junto ao corpo. Foco no dorsal. Costas neutras.",
  "Remada alta":          "Barra ou halters. Puxe em direção ao queixo. Cotovelos acima dos punhos.",
  "Remada unilateral halter":"Um joelho e mão no banco. Puxe o halter até o quadril. Foco no dorsal.",
  "Remada corda polia":   "Polia baixa com corda. Puxe separando a corda ao final para maior contração.",
  "Barra fixa":           "Puxe até o queixo passar a barra. Escápulas retraídas. Desça de forma controlada.",
  "Graviton":             "Assistência por contrapeso. Ótimo para aprender a barra fixa. Reduza o auxílio progressivamente.",
  "Banco lombar":         "Extensão lombar controlada. Não hiperextenda. Pausa de 1s no topo. Fortalece o core posterior.",
  "Barra fixa supinada":  "Pegada supinada ativa mais o bíceps. Puxe até o peito tocar a barra. Escápulas retraídas.",
  // Braços — bíceps
  "Rosca direta":         "Cotovelos fixos ao lado do corpo. Suba controlado, desça lentamente. Não use impulso do tronco.",
  "Rosca scott":          "Apoie o tríceps no banco Scott. Não deixe o cotovelo levantar. Controle a descida total.",
  "Rosca 45":             "Banco inclinado dá maior amplitude e alongamento máximo do bíceps. Evite balançar.",
  "Rosca martelo":        "Pegada neutra (polegar para cima). Trabalha o braquial e braquiorradial. Ótimo para espessura.",
  "Rosca direta polia":   "Tensão constante do cabo. Mantém o bíceps ativado durante todo o movimento.",
  "Rosca direta halter":  "Unilateral ou bilateral. Pronação leve ao descer para maior amplitude.",
  // Braços — tríceps
  "Tríceps corda":        "Separe a corda ao final do movimento para contração máxima. Cotovelos fixos ao lado do corpo.",
  "Tríceps pulley":       "Cotovelos fixos. Leve inclinação do tronco à frente. Estique totalmente os braços.",
  "Tríceps mergulho":     "Desça até 90° no cotovelo. Tronco levemente inclinado à frente para ativar o tríceps.",
  "Tríceps testa":        "Deitado no banco. Dobre apenas o cotovelo. Não deixe os cotovelos abrirem lateralmente.",
  "Tríceps paralela":     "Similar ao mergulho em barras paralelas. Mais carga. Controle a descida.",
  "Tríceps francês halter":"Deitado ou sentado. Dobre apenas os cotovelos atrás da cabeça. Cotovelos fixos.",
  // Ombros
  "Desenvolvimento halter":"Empurre para cima até os halters ficarem alinhados. Não use impulso das pernas.",
  "Desenvolvimento máquina":"Ajuste o banco para que as alças fiquem na altura dos ombros. Empurre de forma controlada.",
  "Elevação lateral":     "Levante até a altura dos ombros com leve flexão nos cotovelos. Não balanceie o tronco.",
  "Elevação frontal corda":"Polia baixa. Levante até a altura dos ombros. Controle a descida. Sem impulso.",
  "Crucifixo invertido máquina":"Foco no deltoide posterior. Puxe com os cotovelos, não com as mãos.",
  "Remada alta polia":    "Polia alta. Puxe em direção ao queixo. Cotovelos acima dos ombros no topo.",
  "Elevação lateral máquina":"Tensão constante. Regulé a máquina para que o movimento parta do lado do corpo.",
  // Pernas — quadríceps e posterior
  "Leg 45":               "Pés no centro da plataforma. Desça até 90° no joelho. Não deixe os joelhos colapsarem.",
  "Leg horizontal":       "Pés paralelos. Empurre com o calcanhar. Controle a descida. Não trave os joelhos no topo.",
  "Leg 45 abduzido":      "Pés afastados e voltados para fora. Ativa glúteo médio e adutores. Desça até 90°.",
  "Extensora":            "Estique totalmente. Pausa de 1s no topo. Desça controlado. Foco no quadríceps.",
  "Cadeira flexora":      "Puxe os calcanhares em direção ao glúteo. Controle a descida. Trabalha isquiotibiais.",
  "Mesa flexora":         "Deitado de bruços. Puxe os calcanhares. Quadril fixo no banco. Descida lenta.",
  "Agachamento":          "Pés na largura dos ombros. Joelhos alinhados com os pés. Desça até 90°. Tronco ereto.",
  "Agachamento Smitt":    "Smith machine. Posicione os pés levemente à frente. Mais seguro para iniciantes.",
  "Agachamento halter":   "Halter entre as pernas ou nos lados. Ótimo para isolar o quadríceps. Tronco ereto.",
  "Hack machine":         "Posição mais vertical do tronco. Maior foco no quadríceps. Não trave os joelhos.",
  "Afundo":               "Um passo à frente. Joelho traseiro quase toca o chão. Tronco ereto e quadril neutro.",
  "Afundo Smitt":         "Afundo guiado no Smith. Mais controle. Pé da frente levemente à frente da barra.",
  "Passada":              "Caminhe com passadas longas. Cada passo é uma repetição. Mantenha o tronco estável.",
  "Stiff":                "Joelhos levemente flexionados e fixos. Empurre o quadril para trás. Sinta o isquiotibial.",
  "Terra":                "Coluna neutra. Empurre o chão com os pés. Quadril e ombros sobem juntos. Core contraído.",
  "Swing":                "Kettlebell. Use o impulso do quadril — não os braços. Glúteo contrai com força no topo.",
  "Abdutora":             "Mantenha o tronco estável. Trabalha glúteo médio. Controle a fase de retorno.",
  "Panturrilha máquina":  "Suba completamente na ponta dos pés. Pausa de 1s no topo. Desça ao máximo para alongar.",
  "Extensão quadril solo": "De quatro apoios. Estenda uma perna para trás e para cima. Glúteo contrai no topo.",
  "Agachamento isométrico":"Desça e segure a posição. Core ativado. Joelhos não passam a ponta dos pés.",
  // Abdominais
  "Abdominal supra":      "Eleve apenas as escápulas do chão. Expire ao subir. Não puxe o pescoço.",
  "Abdominal infra":      "Leve os joelhos ao peito de forma controlada. Não use impulso. Lombar pressionada.",
  "Abdominal prancha":    "Quadril alinhado com o corpo. Contraia abdômen e glúteo. Respire normalmente.",
  "Abdominal remador":    "Deitado, traga joelhos e tronco simultaneamente em V. Expire ao fechar.",
  "Abdominal canivete":   "Estique braços e pernas, feche simultaneamente como um canivete. Core sempre ativo.",
  "Abdominal oblíquo":    "Rotação controlada do tronco. Foco nos oblíquos laterais. Não puxe o pescoço.",
  "Abdominal rolinho":    "Rolo abdominal. Estenda devagar. Contraia o abdômen ao voltar. Não deixe o quadril cair.",
  "Prancha lateral":      "Quadril elevado e alinhado. Contraia o oblíquo. Progrida aumentando o tempo.",
  "Abdominal borboleta":  "Joelhos dobrados e afastados. Levante o tronco. Varia o ângulo do abdominal supra.",
  "Abdominal supra c/peso":"Segure o peso no peito ou atrás da nuca. Aumenta a resistência do abdominal supra.",
  "Abdominal infra paralela":"Suspenso nas paralelas. Leve os joelhos ao peito. Mais difícil que o solo.",
  "Abdominal corda polia": "Ajoelhado na polia alta. Flexione o tronco em direção aos joelhos. Core contraído.",
  "Elevação de pernas":   "Deitado ou suspenso. Mantenha as pernas retas ou semi-flexionadas. Lombar neutra.",
  "Crunch máquina":       "Ajuste o peso e assento. Flexione o tronco totalmente. Pausa na contração.",
  "Hipopressivo":         "Técnica de respiração. Esvazie o pulmão e suba o diafragma. Ativa o core profundo.",
  // Aeróbico
  "Esteira HIIT":         "Alterne tiros de alta intensidade com recuperação ativa. Ex: 40s corrida × 20s caminhada.",
  "Esteira caminhada 30min":"Ritmo constante e moderado. Ótimo para recuperação ativa e queima de gordura.",
  "Remo ergométrico 1000m":"Pernas → tronco → braços. Inverso na volta. Ritmo constante. Costas retas.",
  "Bike HIIT":            "Sprints máximos intercalados com recuperação. Ótimo condicionamento sem impacto.",
  "Bike estacionária 20min":"Pedalada contínua em ritmo moderado. Boa opção de aquecimento ou cardio leve.",
  "Corda naval":          "Ondas alternadas ou simultâneas. Core contraído. Joelhos levemente flexionados.",
  "Pular corda":          "Mantenha o ritmo. Ative o core. Ótimo para coordenação e condicionamento.",
  "Burpee":               "Agache → prancha → flexão → salto. Movimento completo. Mantenha o ritmo constante.",
  "Polichinelo":          "Salto com abertura lateral de pernas e braços. Ótimo para aquecimento e cardio leve.",
  "Corrida 30min":        "Ritmo conversacional (consiga falar). Foco na respiração e postura.",
  "Corrida intervalada":  "Alterne corrida intensa e trote de recuperação. Melhora VO2 máximo.",
  "Escada (subidas)":     "Suba as escadas em ritmo contínuo. Ativa glúteo, quadríceps e panturrilha.",
  "Elíptico 20min":       "Movimento oval sem impacto. Ative os braços para trabalho de corpo inteiro.",
  // Mobilidade
  "Mobilidade ombros e torácica": "Círculos de ombro, rotação de coluna torácica e abridor de peito. Faça devagar.",
  "Mobilidade tornozelo e quadril": "Rotações de tornozelo, agachamento profundo e abertura de quadril. Essencial antes de pernas.",
};

// Busca a melhor dica para um exercício (ignora sufixos como biset, triset, etc.)
function getDesc(name) {
  if (!name) return "";
  if (EX_DESC[name]) return EX_DESC[name];
  // Remove sufixos comuns entre parênteses e após números para encontrar o exercício base
  const base = name
    .replace(/\s*\([^)]*\)/g, "")                         // remove (biset), (triset), etc.
    .replace(/\s+(biset|triset|drop|rest|clouster|restpause|superset|\d+x|6\/20|3\/7|unil\.?|bilat\.?).*$/i, "")
    .replace(/\s+(halter|barra|polia|maquina|máquina|solo|banco|smitt|graviton|b\/w|b\/h|c\/peso).*$/i, "")
    .trim();
  if (EX_DESC[base]) return EX_DESC[base];
  // Busca parcial: verifica se o nome começa com alguma chave do dicionário
  const nameLow = name.toLowerCase();
  for (const [key, desc] of Object.entries(EX_DESC)) {
    if (nameLow.startsWith(key.toLowerCase())) return desc;
  }
  return "";
}

// ── Preset Programs ───────────────────────────────────────────────────────────
let _eid = 0;
const ex = (name, sets, reps, weight, desc) => ({
  id: `pe_${++_eid}`, name,
  sets: sets || 0, reps: reps || "", weight: weight || 0,
  description: desc !== undefined ? desc : (getDesc(name) || ""),
  mediaUrl: "",
});

const PRESET_PROGRAMS = [
  { id:"pp_0223", name:"Fev/2023 · Personal (atual)", createdAt:1675209600000, workouts:[
    { id:"pp0223A", label:"A", name:"Peito + Tríceps + Pernas", note:"3×6-10 · clouster", exercises:[
      ex("Mobilidade ombros e torácica",0,"",0,"Aquecimento articular"),
      ex("Abdominal remador (biset)",3,"15"),ex("Abdominal supra c/peso",3,"15",5),
      ex("Supino reto (clouster)",3,"6-10",42,"Pausa breve entre reps"),
      ex("Supino 45",3,"6-10",22),ex("Supino 45 máquina (biset)",3,"6-10",23),
      ex("Supino máquina",3,"6-10",23),ex("Tríceps corda (clouster)",3,"6-10",21),
      ex("Crucifixo invertido polia (biset)",3,"10",3.75),
      ex("Extensora",3,"12",65),ex("Leg horizontal (clouster)",3,"10",105),
    ]},
    { id:"pp0223B", label:"B", name:"Costas + Braços + Pernas", note:"3 séries · clouster", exercises:[
      ex("Mobilidade tornozelo e quadril",0,"",0,"Mobilidade antes de pernas"),
      ex("Abdominal oblíquo banco",3,"10"),ex("Banco lombar",3,"10"),
      ex("Pulley frente barra romana (clouster)",3,"8-10",63),
      ex("Pulley frente supinado",3,"8-10",51.6),
      ex("Remada cavalete aberto (biset)",3,"10",40),
      ex("Remada cavalete fechado",3,"10",30),ex("Rosca scott (clouster)",3,"8-10",12),
      ex("Remada alta (biset)",3,"10"),ex("Leg 45 abduzido",3,"15",51.5),
      ex("Cadeira flexora (clouster)",3,"10",51.5),
    ]},
  ]},
  { id:"pp_0123", name:"Jan/2023 · Força A/B", createdAt:1672531200000, workouts:[
    { id:"pp0123A", label:"A", name:"Costas + Peito + Braços", note:"3 séries · triset 4×", exercises:[
      ex("Mobilidade ombros e torácica"),ex("Abdominal corda polia (biset)",3,"15"),
      ex("Abdominal infra paralela",3,"15"),ex("Remada máquina aberta (triset) 4×",4,"12",55),
      ex("Remada máquina fechada",4,"12",45),ex("Barra fixa supinada",3,"8-10"),
      ex("Rosca direta polia (drop)",3,"10",21),ex("Crucifixo máquina (triset) 4×",4,"12",55),
      ex("Supino reto halter",3,"10",16),ex("Flexão de braço",3,"max"),
      ex("Tríceps pulley (drop)",3,"10",21),ex("Desenvolvimento halter (biset)",3,"10",14),
      ex("Elevação lateral",3,"12",8),
    ]},
    { id:"pp0123B", label:"B", name:"Pernas Completo", note:"3 séries · drop set", exercises:[
      ex("Mobilidade tornozelo e quadril"),ex("Banco lombar (biset)",3,"10"),
      ex("Panturrilha máquina",3,"15",75),ex("Abdutora (drop)",3,"15",120),
      ex("Afundo halter (triset)",3,"12"),ex("Terra",3,"10",10,"Coluna neutra"),
      ex("Agachamento isométrico",3,"30s",0,"Segure na posição baixa"),
      ex("Extensora (drop)",3,"15",61.5),ex("Leg horizontal abduzido (triset)",3,"15",81.5),
      ex("Cadeira flexora",3,"15",51.5),ex("Stiff",3,"10"),ex("Mesa flexora (drop)",4,"15",41.5),
    ]},
  ]},
  { id:"pp_1022", name:"Out/2022 · Biset Intenso", createdAt:1664582400000, workouts:[
    { id:"pp1022A", label:"A", name:"Peito + Costas + Braços", note:"3×10-15 · biset", exercises:[
      ex("Abdominal corda polia (biset)",3,"15",21),ex("Abdominal prancha",3,"30s"),
      ex("Pulley frente (biset)",3,"12",49),ex("Pulley frente supinado",3,"12",42),
      ex("Crucifixo invertido máquina (biset)",3,"12",45),ex("Crucifixo máquina",3,"12",45),
      ex("Supino 45 halter (biset)",3,"12",16),ex("Supino reto",3,"12",16),
      ex("Tríceps corda polia (biset)",3,"12",55.6),ex("Rosca direta halter",3,"12",18),
      ex("Desenvolvimento máquina (biset)",3,"12",10),ex("Elevação lateral",3,"15",28),
      ex("Remo 200m + 10 burpies 3×",3,"",0,"Cardio de finalização"),
    ]},
    { id:"pp1022B", label:"B", name:"Pernas + Glúteos", note:"3 séries · biset", exercises:[
      ex("Banco lombar",3,"10"),ex("Panturrilha máquina",3,"15",75),
      ex("Abdutora 2/1 (biset)",3,"15",95),ex("Mesa flexora",3,"15",31.5),
      ex("Stiff (biset)",3,"10",10),ex("Extensora",3,"15",71),ex("Leg 45 (biset)",3,"15",61),
      ex("Swing",3,"15",11.6),ex("Hack abduzido (biset)",3,"10",35),ex("Terra",3,"10",10),
      ex("Esteira HIIT 40″×20″",1,"",0,"Inclinação 6, vel. 14 km/h"),
    ]},
  ]},
  { id:"pp_0822", name:"Ago/2022 · Triset", createdAt:1659312000000, workouts:[
    { id:"pp0822A", label:"A", name:"Costas + Peito + Braços", note:"3 séries · triset", exercises:[
      ex("Remada máquina aberta (triset)",3,"12",45),ex("Remada máquina fechada",3,"12",35),
      ex("Barra fixa graviton (triset)",3,"10",45),ex("Crucifixo máquina",3,"12",43),
      ex("Supino 45 halter (triset)",3,"12",55),ex("Supino reto halter",3,"12",16),
      ex("Tríceps pulley (triset)",3,"12",16),ex("Rosca direta halter",3,"12",21),
      ex("Elevação lateral",3,"12",10),ex("HIIT 40×20 esteira",1,"",0,"5-10 tiros"),
    ]},
    { id:"pp0822B", label:"B", name:"Pernas Completo", note:"3 séries · remo 1000m", exercises:[
      ex("Banco lombar (biset)",3,"10"),ex("Panturrilha máquina",3,"15",95),
      ex("Abdutora (biset)",3,"15",110),ex("Swing",3,"15",11.6),
      ex("Leg 45 (biset)",3,"15",71),ex("Leg 45 abduzido",3,"15",71),
      ex("Leg horizontal (biset)",3,"15",85),ex("Cadeira flexora",3,"12",55),
      ex("Mesa flexora (biset)",3,"12",45),ex("Remo 1000m",1,"",0,"Cardio"),
    ]},
  ]},
  { id:"pp_0622", name:"Jun/2022 · Restpause", createdAt:1654041600000, workouts:[
    { id:"pp0622A", label:"A", name:"Peito + Costas + Braços", note:"3×10-12 · restpause", exercises:[
      ex("Abdominal supra canadense",3,"15"),ex("Supino canadense (biset)",3,"10-12",20),
      ex("Supino 45",3,"10-12",16),ex("Crucifixo máquina (restpause)",3,"10-12",55),
      ex("Pulley frente neutro (biset)",3,"10-12",49),ex("Remada baixa triângulo",3,"10-12",49),
      ex("Remada cavalete aberta (restpause)",3,"10-12",30),ex("Rosca 45 (biset)",3,"10-12",10),
      ex("Tríceps mergulho",3,"12"),ex("Desenvolvimento máquina (restpause)",3,"10",35),
    ]},
    { id:"pp0622B", label:"B", name:"Pernas + Glúteos", note:"3 séries · restpause", exercises:[
      ex("Mobilidade tornozelo e quadril"),ex("Abdutora (restpause)",3,"15",95),
      ex("Afundo Smitt (biset)",3,"12",110),ex("Agachamento Smitt",3,"12",110),
      ex("Leg 45 (restpause)",3,"15",71),ex("Leg 45 abduzido (biset)",3,"15",71),
      ex("Stiff",3,"12",15),ex("Cadeira flexora (restpause)",3,"15",55),
      ex("Remo 1000m",1,"",0,"Cardio"),
    ]},
  ]},
  { id:"pp_0222", name:"Fev/2022 · 6/20 Clássico", createdAt:1643673600000, workouts:[
    { id:"pp0222A", label:"A", name:"Peito + Costas + Braços", note:"3 séries 6/20", exercises:[
      ex("Abdominal supra c/peso",3,"15",5),ex("Prancha lateral",3,"30s"),
      ex("Supino reto (6/20)",3,"6/20",56),ex("Crucifixo máquina",3,"12",55),
      ex("Supino canadense",3,"12",15),ex("Pulley frente (6/20)",3,"6/20",56),
      ex("Pulley supinado",3,"12",42),ex("Remada máquina fechada",3,"12",45),
      ex("Tríceps pulley",3,"12",17.5),ex("Rosca direta polia",3,"12",21),
      ex("Remo 1000m",1,"",0,"Cardio"),
    ]},
    { id:"pp0222B", label:"B", name:"Pernas 6/20", note:"3 séries 6/20", exercises:[
      ex("Banco lombar",3,"12"),ex("Leg horizontal (6/20)",3,"6/20",125),
      ex("Afundo Smitt",3,"12",10),ex("Agachamento Smitt",3,"12",10),
      ex("Leg horizontal abduzido (6/20)",3,"6/20",125),
      ex("Cadeira flexora",3,"15",30),ex("Mesa flexora",3,"15",40),
      ex("Abdutora 3/1",3,"15",105),
    ]},
  ]},
  // ── Extra programs extracted from Drive ──────────────────────────────────
  { id:"pp_1122", name:"Nov-Dez/2022 · 6/20 + HIIT", createdAt:1669161600000, workouts:[
    { id:"pp1122A", label:"A", name:"Peito + Costas + Ombros", note:"3×10/10/15 · 6/20 · intervalo 1'", exercises:[
      ex("Mobilidade ombros e torácica"),
      ex("Abdominal supra banco (biset)",3,"15"),
      ex("Abdominal rolinho",3,"15"),
      ex("Supino máquina (6/20)",3,"6/20",49),
      ex("Supino reto (triset)",3,"10"),
      ex("Flexão de braço + Tríceps testa b/h",3,"10"),
      ex("Remada máquina aberta (6/20)",3,"6/20",49),
      ex("Pulley frente triângulo (triset)",3,"10",42),
      ex("Remada baixa aberta + Rosca direta halter",3,"10"),
      ex("Elevação frontal corda (biset)",3,"12"),
      ex("Elevação lateral",3,"15",7.5),
      ex("Remo 1000m",1,"",0,"Cardio de finalização"),
    ]},
    { id:"pp1122B", label:"B", name:"Pernas + Glúteos + HIIT", note:"3 séries · 6/20 · HIIT bike", exercises:[
      ex("Mobilidade tornozelo e quadril"),
      ex("Banco lombar (biset)",3,"10"),
      ex("Panturrilha máquina",3,"15",75),
      ex("Abdução apolete",3,"15",47),
      ex("Leg horizontal (6/20)",3,"6/20",105),
      ex("Leg 45 (triset)",3,"15",60),
      ex("Leg 45 abduzido + Agach. c/desenvolvimento",3,"12",60),
      ex("Extensora (triset)",3,"15",61),
      ex("Swing + Stiff",3,"15",16),
      ex("Cadeira flexora (6/20)",3,"6/20",60),
      ex("HIIT 30″×30″ bike 7-10 tiros",1,"",0,"Cardio de finalização"),
    ]},
  ]},
  { id:"pp_0922", name:"Set/2022 · A/B Academia", createdAt:1662681600000, workouts:[
    { id:"pp0922A", label:"A", name:"Peito + Costas + Braços", note:"3×10-15 · biset · intervalo 1'", exercises:[
      ex("Mobilidade ombros e torácica"),
      ex("Abdominal supra canadense",3,"15"),
      ex("Abdominal oblíquo kettlebell",3,"12"),
      ex("Supino canadense (biset)",3,"12",15),
      ex("Supino 45 halter",3,"12",16),
      ex("Crossover (biset)",3,"12",12.5),
      ex("Remada baixa",3,"12",49),
      ex("Remada cavalete aberta (biset)",3,"12",30),
      ex("Remada cavalete fechada",3,"12",20),
      ex("Rosca direta polia (biset)",3,"12",18),
      ex("Tríceps pulley",3,"12",21),
      ex("Desenvolvimento máquina (biset)",3,"12",28),
      ex("Elevação frontal corda",3,"15",7.5),
    ]},
    { id:"pp0922B", label:"B", name:"Pernas + Glúteos", note:"3 séries · biset · intervalo 1'", exercises:[
      ex("Mobilidade tornozelo e quadril"),
      ex("Banco lombar (biset)",3,"10"),
      ex("Panturrilha máquina",3,"15",75),
      ex("Abdução apolete",3,"15",40),
      ex("Hack machine (biset)",3,"15",31.5),
      ex("Agachamento c/desenvolvimento",3,"10",10),
      ex("Leg 45 (biset)",3,"15",71),
      ex("Agach. abduzido",3,"16",21.6),
      ex("Leg horizontal abduzido (biset)",3,"15",75),
      ex("Stiff",3,"12",10),
      ex("Mesa flexora + Extensão quadril solo",3,"15",45),
    ]},
  ]},
  { id:"pp_0622b", name:"Jun/2022 · Triset 4x (2)", createdAt:1654473600000, workouts:[
    { id:"pp0622bA", label:"A", name:"Peito + Costas + Braços", note:"3-4 séries · triset · corda naval tabata", exercises:[
      ex("Aquec.: abdominal rolinho + abdominal remador"),
      ex("Supino reto halter (triset) 4×",4,"10-15",14),
      ex("Crucifixo reto",3,"12",14),
      ex("Flexão de braço solo",3,"max"),
      ex("Pulley frente (triset) 4×",4,"10-15",49),
      ex("Remada baixa",3,"12",42),
      ex("Remada corda polia",3,"12",24.5),
      ex("Rosca banco halter (triset)",3,"10",10),
      ex("Tríceps mergulho",3,"12"),
      ex("Elevação lateral frontal",3,"12"),
      ex("Corda naval tabata",1,"",0,"Cardio de finalização"),
    ]},
    { id:"pp0622bB", label:"B", name:"Pernas + Glúteos", note:"3 séries · triset · intervalo 1'", exercises:[
      ex("Mobilidade tornozelo e quadril"),
      ex("Abdominal oblíquo solo + Banco lombar",3,"10"),
      ex("Extensora (triset)",3,"15",55),
      ex("Agach. c/desenvolvimento",3,"12",55),
      ex("Agachamento isométrico",3,"30s",110),
      ex("Leg 45 (triset)",3,"15",55),
      ex("Leg 45 abduzido",3,"15",55),
      ex("Terra",3,"10",10),
      ex("Mesa flexora (triset)",3,"15",45),
      ex("Abdutora + Stiff",3,"15",95),
    ]},
  ]},
  { id:"pp_0422", name:"Abr/2022 · Método 3/7", createdAt:1650931200000, workouts:[
    { id:"pp0422A", label:"A", name:"Costas + Peito + Braços", note:"3×15/15/10 · método 3/7", exercises:[
      ex("Aquec.: abd. supra canadense + abd. prancha 1'"),
      ex("Remada curva fechada (3/7)",3,"15",45),
      ex("Pulley costas (biset)",3,"12",42),
      ex("Pulley frente",3,"10",35),
      ex("Supino máquina (3/7)",3,"10",42),
      ex("Supino canadense (biset) + Flexão braço",3,"12",15),
      ex("Desenvolvimento máquina (3/7)",3,"10",28),
      ex("Rosca scott b/w (biset)",3,"10",7.5),
      ex("Tríceps testa b/w",3,"10",5),
    ]},
    { id:"pp0422B", label:"B", name:"Pernas Método 3/7", note:"3 séries · 3/7 · bike HIIT", exercises:[
      ex("Mobilidade tornozelo e quadril"),
      ex("Abdominal infra paralela + Oblíquo kettlebell",3,"15"),
      ex("Leg horizontal (3/7)",3,"15",85),
      ex("Leg 45 unilateral",3,"20",125),
      ex("Agachamento barra hexa",3,"15",20),
      ex("Extensora (3/7)",3,"15",65),
      ex("Mesa flexora (3/7)",3,"15",40),
      ex("Abdutora",3,"15",95),
      ex("Bike HIIT 10 tiros 30″×30″",1,"",0,"Cardio de finalização"),
    ]},
  ]},
  { id:"pp_0322", name:"Mar/2022 · Triset + Drop", createdAt:1647734400000, workouts:[
    { id:"pp0322A", label:"A", name:"Peito + Costas + Braços", note:"3×8-10 · triset + drop · intervalo 1'", exercises:[
      ex("Aquec.: remo 200m + abdominal remador 20 rep 3×"),
      ex("Supino 45 máquina (triset)",3,"10",42),
      ex("Supino máquina",3,"10",42),
      ex("Flexão de braço",3,"max"),
      ex("Tríceps pulley (drop)",3,"10",21),
      ex("Remada máquina aberta (triset)",3,"12",40),
      ex("Remada máquina fechada",3,"12",35),
      ex("Puxada frontal polia",3,"10",15),
      ex("Rosca direta polia (drop)",3,"10",21),
      ex("Desenvolvimento halter",3,"10",14),
    ]},
    { id:"pp0322B", label:"B", name:"Pernas Drop Set", note:"3 séries · drop · bike 1' ladeira", exercises:[
      ex("Mobilidade tornozelo e quadril"),
      ex("Bike 1' ladeira + Abdominal oblíquo solo 3×"),
      ex("Leg 45 (triset)",3,"15",70),
      ex("Leg 45 abduzido",3,"15",71),
      ex("Agachamento halter",3,"12",20),
      ex("Extensora (drop)",3,"15",55),
      ex("Swing (triset)",3,"15",16),
      ex("Stiff",3,"12",16),
      ex("Mesa flexora",3,"15",45),
      ex("Abdutora (drop)",3,"15",105),
    ]},
  ]},
  { id:"pp_0122", name:"Jan/2022 · Clusterset", createdAt:1641427200000, workouts:[
    { id:"pp0122A", label:"A", name:"Costas + Peito + Braços", note:"3×8-12 · clouster · intervalo 1'", exercises:[
      ex("Aquec.: abdominal supra canadense + abdominal infra solo"),
      ex("Pulley frente (clousterset)",3,"8-12",56),
      ex("Pulldown polia (biset)",3,"12",21),
      ex("Remada corda polia",3,"12",28),
      ex("Supino reto (clousterset)",3,"8-12",20),
      ex("Supino 45 máquina (biset)",3,"12",42),
      ex("Supino máquina",3,"12",49),
      ex("Tríceps corda (triset)",3,"12",21),
      ex("Rosca direta b/w",3,"12",7.5),
      ex("Desenvolvimento halter",3,"10",6),
    ]},
    { id:"pp0122B", label:"B", name:"Pernas Clusterset", note:"3 séries · clouster · intervalo 1'", exercises:[
      ex("Mobilidade tornozelo e quadril"),
      ex("Abdominal rolinho",3,"15"),
      ex("Abdominal infra paralela",3,"15"),
      ex("Leg horizontal (clouster)",3,"10",125),
      ex("Extensora unilateral (biset)",3,"15",35),
      ex("Extensora bilateral",3,"15",45),
      ex("Leg 45 abduzido (clouster)",3,"15",70),
      ex("Agach. abduzido kettlebell (biset)",3,"12",24),
      ex("Stiff",3,"12",15),
      ex("Abdutora atrás e frente",3,"15",105),
    ]},
  ]},
  { id:"pp_1021", name:"Out-Nov/2021 · Drop 1 Tirada", createdAt:1634947200000, workouts:[
    { id:"pp1021A", label:"A", name:"Peito + Costas + Braços", note:"3×10-12 · drop 1 tirada", exercises:[
      ex("Aquec.: deslocamento lateral + burpie solo"),
      ex("Abdominal remador + Prancha 30″",3,"15"),
      ex("Supino máquina (drop) 1 tirada",3,"10",56),
      ex("Supino 45 halter",3,"10",16),
      ex("Crucifixo máquina (drop) 1 tirada",3,"12",55),
      ex("Remada máquina (drop)",3,"12",45),
      ex("Graviton supinado",3,"10",35),
      ex("Remada baixa (drop)",3,"12",49),
      ex("Rosca direta 45 (triset)",3,"10",6),
      ex("Tríceps mergulho",3,"12"),
      ex("Elevação lateral",3,"15",8),
    ]},
    { id:"pp1021B", label:"B", name:"Pernas Drop 1 Tirada", note:"3 séries · drop 1 tirada", exercises:[
      ex("Aquec.: salto banco + corda"),
      ex("Abdominal canivete + Oblíquo halter",3,"15"),
      ex("Leg horizontal (drop) 1 tirada",3,"15",100),
      ex("Leg 45",3,"15",60),
      ex("Extensora (drop) 1 tirada",3,"15",65),
      ex("Leg 45 abduzido",3,"15",65),
      ex("Mesa flexora (drop) 1 tirada",3,"15",45),
      ex("Stiff (biset)",3,"12",15),
      ex("Abdutora",3,"15",105),
    ]},
  ]},
  { id:"pp_0921", name:"Set/2021 · 6/20 Academia", createdAt:1630972800000, workouts:[
    { id:"pp0921A", label:"A", name:"Peito + Costas + Braços", note:"3×10-12 · 6/20 · intervalo 1'", exercises:[
      ex("Aquec.: corda naval + mountain climber"),
      ex("Abdominal borboleta + Abdominal canivete",3,"15"),
      ex("Supino máquina (6/20)",3,"6/20",49),
      ex("Supino canadense (biset)",3,"12",15),
      ex("Flexão máximo",3,"max"),
      ex("Remada cavalete (6/20)",3,"6/20",42),
      ex("Pulley supinado (biset)",3,"12",35),
      ex("Remada baixa",3,"12",42),
      ex("Rosca direta b/w (biset)",3,"12"),
      ex("Tríceps testa b/h",3,"12"),
      ex("Elevação lateral (6/20)",3,"6/20",7.5),
    ]},
    { id:"pp0921B", label:"B", name:"Pernas 6/20", note:"3 séries · 6/20 · intervalo 1'", exercises:[
      ex("Aquec.: bola + corda"),
      ex("Abdominal infra borboleta + Oblíquo girando",3,"15"),
      ex("Leg horizontal (6/20)",3,"6/20",105),
      ex("Leg 45 (biset)",3,"15",60),
      ex("Agachamento halter",3,"12",15),
      ex("Extensora (6/20)",3,"6/20",65),
      ex("Agach. abduzido (biset)",3,"12",20),
      ex("Stiff",3,"12",10),
      ex("Abdutora (6/20)",3,"6/20",105),
    ]},
  ]},
  { id:"pp_0821", name:"Ago/2021 · Rest Pause Academia", createdAt:1628726400000, workouts:[
    { id:"pp0821A", label:"A", name:"Peito + Costas + Braços", note:"3×10-15 · rest pause · intervalo 1'", exercises:[
      ex("Aquec.: corda naval + step"),
      ex("Abdominal remador + Abdominal infra solo",3,"15"),
      ex("Supino reto (rest)",3,"10",10),
      ex("Supino 45 halter (biset)",3,"12",14),
      ex("Supino reto halter",3,"12",14),
      ex("Pulley frente (rest)",3,"10",42),
      ex("Remada máquina aberta (biset)",3,"12",40),
      ex("Remada máquina fechada",3,"12",35),
      ex("Tríceps corda (triset)",3,"12",17.5),
      ex("Rosca direta halter",3,"12",8),
      ex("Desenvolvimento máquina",3,"10",24),
    ]},
    { id:"pp0821B", label:"B", name:"Pernas Rest Pause", note:"3 séries · rest pause", exercises:[
      ex("Aquec.: burpie banco + deslocamento lateral"),
      ex("Abdominal supra c/peso + Oblíquo solo",3,"15"),
      ex("Leg 45 (rest)",3,"15",30),
      ex("Hack machine (biset)",3,"12",40),
      ex("Agachamento isométrico",3,"30s"),
      ex("Extensora (rest)",3,"15",45),
      ex("Agach. abduzido (biset)",3,"12",20),
      ex("Mesa flexora",3,"15",30),
      ex("Abdutora",3,"15",45),
    ]},
  ]},
  { id:"pp_0721", name:"Jul/2021 · TRX A/B", createdAt:1625702400000, workouts:[
    { id:"pp0721A", label:"A", name:"Costas + Peito + Braços (TRX)", note:"3×10-15 · rest pause", exercises:[
      ex("Aquec.: burpie banco + calcanhar na mão"),
      ex("Abdominal canivete + Oblíquo solo",3,"15"),
      ex("Remada TRX (rest)",3,"10"),
      ex("Puxada TRX (biset)",3,"12"),
      ex("Remada halter",3,"12"),
      ex("Crucifixo halter (rest)",3,"10"),
      ex("Supino TRX (biset)",3,"12"),
      ex("Flexão de braço",3,"max"),
      ex("Tríceps testa halter (triset)",3,"12"),
      ex("Rosca martelo",3,"12"),
      ex("Desenvolvimento Arnold",3,"10"),
    ]},
    { id:"pp0721B", label:"B", name:"Pernas + Glúteos (TRX)", note:"3 séries · rest pause", exercises:[
      ex("Aquec.: salto mão no chão + agach. c/salto"),
      ex("Abdominal infra solo + Abdominal supra completo",3,"15"),
      ex("Agachamento halter (rest)",3,"12"),
      ex("Agachamento abduzido (biset)",3,"12"),
      ex("Agachamento isométrico",3,"30s"),
      ex("Passada",3,"12"),
      ex("Swing (biset)",3,"15"),
      ex("Stiff",3,"12"),
    ]},
  ]},
];

// ── Firebase REST API ─────────────────────────────────────────────────────────

// ── Dados compactos (presets nunca gravados — só o que muda) ──────────────────
const PRESET_IDS = new Set(PRESET_PROGRAMS.map(p => p.id));

function buildPayload(st) {
  const weights = {};
  (st.programs || []).forEach(p => {
    if (!PRESET_IDS.has(p.id)) return;
    const orig = PRESET_PROGRAMS.find(pp => pp.id === p.id);
    p.workouts.forEach(wk => {
      const origWk = orig?.workouts.find(w => w.id === wk.id);
      wk.exercises.forEach(e => {
        const origE = origWk?.exercises.find(ex => ex.id === e.id);
        if (origE && origE.weight !== e.weight) weights[`${p.id}:${e.id}`] = e.weight;
      });
    });
  });
  return {
    v: 3,
    cpid: st.currentProgramId,
    sessions: (st.sessions || []).slice(0, 300),
    custom: (st.programs || []).filter(p => !PRESET_IDS.has(p.id)),
    weights,
  };
}

function rebuildState(d) {
  if (!d || d.v !== 3) return null;
  const presets = PRESET_PROGRAMS.map(p => ({
    ...p,
    workouts: p.workouts.map(wk => ({
      ...wk,
      exercises: wk.exercises.map(e => ({
        ...e,
        weight: (d.weights || {})[`${p.id}:${e.id}`] ?? e.weight,
      })),
    })),
  }));
  return {
    currentProgramId: d.cpid || PRESET_PROGRAMS[0]?.id,
    programs: [...(d.custom || []), ...presets],
    sessions: d.sessions || [],
  };
}

async function loadState() {
  try {
    const snap = await getDoc(DOC_REF);
    if (snap.exists()) {
      const state = rebuildState(snap.data().payload);
      if (state) return state;
    }
  } catch (e) {
    console.error("Firestore load error:", e);
  }
  return {
    currentProgramId: PRESET_PROGRAMS[0].id,
    programs: PRESET_PROGRAMS,
    sessions: [],
  };
}

async function persist(st) {
  try {
    await setDoc(DOC_REF, { payload: buildPayload(st) });
  } catch (e) {
    console.error("Firestore save error:", e);
  }
}

// ── WorkoutBuilder (shared by Create & Edit) ──────────────────────────────────
function WorkoutBuilder({ initialProgram, onSave, onBack }) {
  const LABELS = ["A", "B", "C", "D"];
  const isEdit = !!initialProgram;

  const [step, setStep] = useState(isEdit ? 1 : 0);
  const [progName, setProgName] = useState(initialProgram?.name || "");
  const [numW, setNumW] = useState(initialProgram?.workouts.length || 2);
  const [workouts, setWorkouts] = useState(
    initialProgram?.workouts.map(w => ({ ...w, exercises: w.exercises.map(e => ({ ...e })) })) ||
    ["A","B"].map(l => ({ id: uid(), label: l, name: "", exercises: [] }))
  );
  const [activeW, setActiveW] = useState(0);
  const [activeCat, setActiveCat] = useState(Object.keys(EX_CATS)[0]);
  const [customEx, setCustomEx] = useState("");
  const [done, setDone] = useState(false);

  function changeNumW(n) {
    setNumW(n);
    setWorkouts(prev => LABELS.slice(0, n).map((l, i) => prev[i] || { id: uid(), label: l, name: "", exercises: [] }));
    setActiveW(0);
  }

  const w = workouts[activeW] || workouts[0];
  const addedNames = new Set(w?.exercises.map(e => e.name));

  function addEx(name) {
    if (!name.trim() || addedNames.has(name.trim()) || (w?.exercises.length || 0) >= 20) return;
    const newEx = { id: uid(), name: name.trim(), sets: 3, reps: "12", weight: 0, description: getDesc(name.trim()), mediaUrl: "" };
    setWorkouts(ws => ws.map((wk, i) => i === activeW ? { ...wk, exercises: [...wk.exercises, newEx] } : wk));
  }

  function addCustom() { if (customEx.trim()) { addEx(customEx.trim()); setCustomEx(""); } }

  function updEx(exId, field, val) {
    setWorkouts(ws => ws.map((wk, i) => i !== activeW ? wk : {
      ...wk, exercises: wk.exercises.map(e => e.id === exId ? { ...e, [field]: val } : e)
    }));
  }

  function removeEx(exId) {
    setWorkouts(ws => ws.map((wk, i) => i !== activeW ? wk : { ...wk, exercises: wk.exercises.filter(e => e.id !== exId) }));
  }


  // ── Drag-to-reorder ────────────────────────────────────────────────────────
  const dragIdRef = useRef(null);
  const listRef   = useRef(null);
  const [dragId, setDragId] = useState(null);

  function setExercises(newExs) {
    setWorkouts(ws => ws.map((wk, i) => i !== activeW ? wk : { ...wk, exercises: newExs }));
  }

  function onDragHandleTouch(e, exId) {
    e.preventDefault();
    dragIdRef.current = exId;
    setDragId(exId);
  }
  function onDragHandleMouse(e, exId) {
    e.preventDefault();
    dragIdRef.current = exId;
    setDragId(exId);
  }

  function resolvePosition(clientY) {
    if (!listRef.current || !dragIdRef.current) return;
    const rect = listRef.current.getBoundingClientRect();
    const rel  = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const n    = w.exercises.length;
    const newI = Math.min(n - 1, Math.floor(rel * n));
    const dragI = w.exercises.findIndex(ex => ex.id === dragIdRef.current);
    if (dragI === -1 || newI === dragI) return;
    const newExs = [...w.exercises];
    const [item] = newExs.splice(dragI, 1);
    newExs.splice(newI, 0, item);
    setExercises(newExs);
  }

  function onListTouchMove(e) {
    if (!dragIdRef.current) return;
    e.preventDefault();
    resolvePosition(e.touches[0].clientY);
  }
  function onListMouseMove(e) {
    if (!dragIdRef.current || e.buttons !== 1) return;
    resolvePosition(e.clientY);
  }
  function onListEnd() { dragIdRef.current = null; setDragId(null); }

  function save() {
    if (!progName.trim()) return;
    onSave({ id: initialProgram?.id || uid(), name: progName.trim(), createdAt: initialProgram?.createdAt || Date.now(), workouts });
    setDone(true);
  }

  const hasAny = workouts.some(wk => wk.exercises.length > 0);

  if (done) return (
    <div>
      <PageHeader onBack={onBack} title={isEdit ? "Editar Treino" : "Criar Treino"} />
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>{isEdit ? "✏️" : "✅"}</div>
        <div style={{ fontSize: 25, fontWeight: 900, color: T1, marginBottom: 8 }}>{isEdit ? "Treino atualizado!" : "Programa criado!"}</div>
        <div style={{ fontSize: 19, color: T3, marginBottom: 28 }}>Já ativo como seu treino atual.</div>
        <PrimBtn onClick={onBack}>Voltar ao início</PrimBtn>
      </div>
    </div>
  );

  // Step 0: name + division (only for new programs)
  if (step === 0) return (
    <div>
      <PageHeader onBack={onBack} title="Novo Programa" />
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Inp label="Nome do Programa" value={progName} onChange={setProgName} placeholder="Ex: Hipertrofia Jul/2025" />
        <div>
          <Lbl>Divisão semanal</Lbl>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10 }}>
            {[1,2,3,4].map(n => (
              <button key={n} onClick={() => changeNumW(n)} style={{ background: numW===n ? BLK : C2, color: numW===n ? "#fff" : T2, border: `2px solid ${numW===n ? BLK : B1}`, borderRadius: 12, padding: "16px 0", fontSize: 25, fontWeight: 900, cursor: "pointer", fontFamily: "inherit" }}>{n}</button>
            ))}
          </div>
          <div style={{ fontSize: 16, color: T3, marginTop: 8, textAlign: "center" }}>
            {["Um treino (A)","Treinos A + B","Treinos A + B + C","Treinos A + B + C + D"][numW-1]}
          </div>
        </div>
        <PrimBtn onClick={() => setStep(1)} disabled={!progName.trim()}>Montar exercícios →</PrimBtn>
      </div>
    </div>
  );

  // Step 1: build exercises
  return (
    <div>
      <PageHeader onBack={() => isEdit ? onBack() : setStep(0)} title={progName} sub={`Treino ${w.label} · ${w.exercises.length}/20 exercícios`} />

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {workouts.map((wk, i) => (
          <button key={wk.id} onClick={() => setActiveW(i)} style={{ flex: 1, background: activeW===i ? BLK : C2, color: activeW===i ? "#fff" : T2, border: `2px solid ${activeW===i ? BLK : B1}`, borderRadius: 12, padding: "10px 0", fontWeight: 800, fontSize: 20, cursor: "pointer", fontFamily: "inherit", position: "relative" }}>
            {wk.label}
            {wk.exercises.length > 0 && (
              <span style={{ position: "absolute", top: 4, right: 7, fontSize: 14, fontWeight: 800, color: activeW===i ? A : T3 }}>{wk.exercises.length}</span>
            )}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: 14 }}>
        <Inp label={`Nome do Treino ${w.label}`} value={w.name}
          onChange={v => setWorkouts(ws => ws.map((wk,i) => i===activeW ? {...wk, name:v} : wk))}
          placeholder="Ex: Peito + Tríceps" />
      </div>

      {/* Category picker */}
      <div style={{ marginBottom: 10 }}>
        <Lbl>Escolher por grupo muscular</Lbl>
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6 }}>
          {Object.keys(EX_CATS).map(cat => (
            <button key={cat} onClick={() => setActiveCat(cat)} style={{ flexShrink: 0, background: activeCat===cat ? BLK : C2, color: activeCat===cat ? "#fff" : T2, border: `1.5px solid ${activeCat===cat ? BLK : B1}`, borderRadius: 20, padding: "7px 13px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 14, padding: "12px", background: C1, borderRadius: 14, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: `1px solid ${B1}` }}>
        {EX_CATS[activeCat].map(name => {
          const isAdded = addedNames.has(name);
          const isFull = w.exercises.length >= 20;
          return (
            <button key={name} onClick={() => !isAdded && !isFull && addEx(name)}
              style={{ background: isAdded ? BLK : C3, color: isAdded ? A : T1, border: `1.5px solid ${isAdded ? BLK : B1}`, borderRadius: 20, padding: "7px 13px", fontSize: 18, fontWeight: 600, cursor: isAdded||isFull ? "default" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5, opacity: isFull&&!isAdded ? 0.35 : 1, transition: "all 0.15s" }}>
              {isAdded && <Check size={15} strokeWidth={3} />}{name}
            </button>
          );
        })}
      </div>

      {/* Custom input */}
      <div style={{ marginBottom: 14 }}>
        <Lbl>Exercício personalizado</Lbl>
        <div style={{ display: "flex", gap: 8 }}>
          <input value={customEx} onChange={e => setCustomEx(e.target.value)} onKeyDown={e => e.key==="Enter"&&addCustom()}
            placeholder="Digite o nome do exercício..."
            style={{ flex: 1, background: C2, border: `1.5px solid ${B1}`, borderRadius: 10, color: T1, padding: "11px 13px", fontSize: 19, outline: "none", fontFamily: "inherit" }} />
          <button onClick={addCustom} style={{ background: BLK, border: "none", borderRadius: 10, padding: "0 16px", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center" }}>
            <Plus size={23} />
          </button>
        </div>
      </div>

      {/* Exercise list — draggable */}
      {w.exercises.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0", color: T3, fontSize: 20, border: `1.5px dashed ${B1}`, borderRadius: 14, marginBottom: 14, background: C2 }}>
          Toque nos chips acima para adicionar ao Treino {w.label}
        </div>
      ) : (
        <div
          ref={listRef}
          onTouchMove={onListTouchMove}
          onTouchEnd={onListEnd}
          onMouseMove={onListMouseMove}
          onMouseUp={onListEnd}
          onMouseLeave={onListEnd}
          style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14, userSelect: "none" }}
        >
          {w.exercises.map((e, idx) => {
            const isBeingDragged = e.id === dragId;
            return (
              <Card key={e.id} style={{ padding: "14px", border: isBeingDragged ? `2px solid ${A}` : `1px solid ${B1}`, boxShadow: isBeingDragged ? `0 8px 24px rgba(0,0,0,0.15)` : undefined, transform: isBeingDragged ? "scale(1.01)" : "none", transition: "box-shadow 0.15s, transform 0.15s" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                {/* Drag handle */}
                <div
                  onTouchStart={ev => onDragHandleTouch(ev, e.id)}
                  onMouseDown={ev => onDragHandleMouse(ev, e.id)}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, cursor: "grab", padding: "4px 2px", touchAction: "none", flexShrink: 0, marginTop: 2 }}>
                  <span style={{ fontSize: 25, color: isBeingDragged ? A : T3, lineHeight: 1, userSelect: "none" }}>⠿</span>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: isBeingDragged ? A : BLK, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 800, color: isBeingDragged ? BLK : A }}>{idx + 1}</div>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Name + delete row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, color: T3, marginBottom: 4, letterSpacing: 1.2, fontWeight: 700 }}>EXERCÍCIO</div>
                      <input
                        value={e.name}
                        onChange={ev => updEx(e.id, "name", ev.target.value)}
                        style={{ width: "100%", background: "transparent", border: "none", borderBottom: `2px solid ${B1}`, color: T1, padding: "3px 0 6px", fontSize: 20, fontWeight: 800, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                        onFocus={ev => ev.target.style.borderBottomColor = BLK}
                        onBlur={ev => ev.target.style.borderBottomColor = B1}
                      />
                    </div>
                    <button onClick={() => removeEx(e.id)} style={{ background: "rgba(224,48,48,0.08)", border: "none", borderRadius: 10, padding: "9px", color: RED, cursor: "pointer", display: "flex", flexShrink: 0, marginTop: 16 }}>
                      <Trash2 size={23} />
                    </button>
                  </div>
                  {/* Séries + Reps */}
                  <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, color: T3, marginBottom: 4, letterSpacing: 1.2, fontWeight: 700 }}>SÉRIES</div>
                      <input type="number" value={String(e.sets)} min="0" max="10"
                        onChange={ev => updEx(e.id,"sets",Math.max(0,Math.min(10,parseInt(ev.target.value)||0)))}
                        style={{ width:"100%", background:C3, border:`1.5px solid ${B1}`, borderRadius:10, color:T1, padding:"10px 8px", fontSize: 23, fontWeight:900, outline:"none", fontFamily:"inherit", textAlign:"center", boxSizing:"border-box" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, color: T3, marginBottom: 4, letterSpacing: 1.2, fontWeight: 700 }}>REPS</div>
                      <input value={e.reps} onChange={ev => updEx(e.id,"reps",ev.target.value)} placeholder="12"
                        style={{ width:"100%", background:C3, border:`1.5px solid ${B1}`, borderRadius:10, color:T1, padding:"10px 8px", fontSize: 23, fontWeight:900, outline:"none", fontFamily:"inherit", textAlign:"center", boxSizing:"border-box" }} />
                    </div>
                  </div>
                  {/* Weight */}
                  <div>
                    <div style={{ fontSize: 15, color: T3, marginBottom: 6, letterSpacing: 1.2, fontWeight: 700 }}>PESO</div>
                    <WeightSlider value={e.weight} onChange={v => updEx(e.id, "weight", v)} />
                  </div>
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      )}
      <PrimBtn onClick={save} disabled={!hasAny}><Save size={21}/> {isEdit ? "Salvar alterações" : "Salvar Programa"}</PrimBtn>
    </div>
  );
}

// ── HomeScreen ────────────────────────────────────────────────────────────────
function HomeScreen({ appState, navigate }) {
  const cp = appState.programs.find(p => p.id === appState.currentProgramId);
  const weekN = appState.sessions.filter(s => Date.now()-s.date < 7*86400000).length;
  const DAYS = ["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"];
  const today = DAYS[new Date().getDay()];

  const cards = [
    { id:"current", Icon:Dumbbell, label:"TREINO", title:"Atual", sub: cp ? cp.name : "Configure um programa", active: !!cp },
    { id:"saved",   Icon:BookOpen, label:"BIBLIOTECA", title:"Treinos Salvos", sub:`${appState.programs.length} programas` },
    { id:"create",  Icon:Plus,     label:"NOVO", title:"Criar Treino", sub:"Monte seu programa" },
    { id:"history", Icon:Hist,     label:"HISTÓRICO", title:"Histórico", sub:`${weekN} treinos esta semana`, active: weekN > 0 },
  ];

  return (
    <div>
      {/* Hero strip */}
      <div style={{ background: BLK, margin: "0 -20px", padding: "28px 20px 24px", marginTop: -24, marginBottom: 20, borderBottom: `1px solid ${B1}` }}>
        <div style={{ fontSize: 17, color: T3, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>
          {today} · {new Date().toLocaleDateString("pt-BR",{day:"numeric",month:"long",year:"numeric"})}
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, color: T1, letterSpacing: -0.5, lineHeight: 1.15 }}>
          Bom treino,<br/><span style={{ color: A }}>Luiz! 💪</span>
        </div>
        <div style={{ marginTop: 6, fontSize: 16, color: T3, letterSpacing: 1, textTransform: "uppercase" }}>
          Stack your reps. Build your legacy.
        </div>
        {cp && (
          <div style={{ marginTop: 14, background: "rgba(201,168,76,0.1)", borderRadius: 10, padding: "9px 14px", display: "inline-flex", alignItems: "center", gap: 8, border: `1px solid rgba(201,168,76,0.2)` }}>
            <Flame size={18} color={A} />
            <span style={{ fontSize: 16, color: T2, fontWeight: 600 }}>{cp.name}</span>
          </div>
        )}
      </div>

      {/* 2×2 Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {cards.map(({ id, Icon, label, title, sub, active }) => (
          <button key={id} onClick={() => navigate(id)} style={{
            background: active ? BLK : C1,
            border: `2px solid ${active ? BLK : B1}`,
            borderRadius: 22, padding: "24px 18px", cursor: "pointer", textAlign: "left",
            display: "flex", flexDirection: "column", gap: 14, minHeight: 190,
            fontFamily: "inherit", boxShadow: active ? "0 4px 20px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.05)",
            transition: "all 0.15s"
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: 1.5, color: active ? A : T3 }}>{label}</span>
              <div style={{ color: active ? A : BLK, display: "flex" }}><Icon size={44} strokeWidth={2} /></div>
            </div>
            <div>
              <div style={{ fontSize: 23, fontWeight: 900, color: active ? "#fff" : T1, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 16, color: active ? "#888" : T3, lineHeight: 1.4, fontWeight: 500 }}>{sub}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── CurrentWorkoutScreen ──────────────────────────────────────────────────────
function CurrentWorkoutScreen({ appState, onBack, onSaveState }) {
  const cp = appState.programs.find(p => p.id === appState.currentProgramId);
  const [expanded, setExpanded] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [weights, setWeights] = useState({});
  const [done, setDone] = useState({});
  const [showRest, setShowRest] = useState(null);
  const [finished, setFinished] = useState(false);
  const [expandDesc, setExpandDesc] = useState({});
  const [expandMedia, setExpandMedia] = useState({});

  if (!cp) return (
    <div>
      <PageHeader onBack={onBack} title="Treino Atual" />
      <Card style={{ textAlign: "center", padding: "48px 20px" }}>
        <Dumbbell size={46} color={T3} style={{ marginBottom: 12 }} />
        <div style={{ fontSize: 20, fontWeight: 800, color: T1, marginBottom: 6 }}>Nenhum programa ativo</div>
        <div style={{ fontSize: 18, color: T3 }}>Vá em Treinos Salvos e ative um programa</div>
      </Card>
    </div>
  );

  function toggleExpand(wid) {
    if (expanded === wid) { setExpanded(null); setStartTime(null); }
    else { setExpanded(wid); setStartTime(Date.now()); setDone({}); setWeights({}); setShowRest(null); setFinished(false); }
  }

  function getW(e) { return weights[e.id] !== undefined ? weights[e.id] : e.weight; }

  function saveWeight(exId, v, workout) {
    setWeights(w => ({ ...w, [exId]: v }));
    // persist back into the program so next session starts with this weight
    const updatedPrograms = appState.programs.map(p => {
      if (p.id !== cp.id) return p;
      return {
        ...p,
        workouts: p.workouts.map(wk => {
          if (wk.id !== workout.id) return wk;
          return { ...wk, exercises: wk.exercises.map(e => e.id === exId ? { ...e, weight: v } : e) };
        }),
      };
    });
    onSaveState({ ...appState, programs: updatedPrograms });
  }

  function toggleSet(exId, si, total) {
    const cur = done[exId] || Array(total).fill(false);
    const next = cur.map((v,i) => i===si ? !v : v);
    setDone(d => ({...d, [exId]: next}));
    if (!cur[si]) setShowRest(exId);
  }

  function finishWorkout(workout) {
    const dur = startTime ? Math.round((Date.now()-startTime)/1000) : 0;
    const session = {
      id: uid(), date: Date.now(), programId: cp.id, programName: cp.name,
      workoutLabel: workout.label, workoutName: workout.name, duration: dur,
      exercises: workout.exercises.map(e => ({ name: e.name, setsCompleted: (done[e.id]||[]).filter(Boolean).length, weight: getW(e) })),
    };
    onSaveState({ ...appState, sessions: [session, ...appState.sessions] });
    setFinished(true); setExpanded(null);
  }

  if (finished) return (
    <div>
      <PageHeader onBack={onBack} title="Treino Atual" />
      <Card style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🏆</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: T1, marginBottom: 8 }}>Treino concluído!</div>
        <div style={{ fontSize: 19, color: T3, marginBottom: 28 }}>Sessão registrada no histórico.</div>
        <PrimBtn onClick={() => setFinished(false)}>Voltar aos treinos</PrimBtn>
      </Card>
    </div>
  );

  return (
    <div>
      <PageHeader onBack={onBack} title={cp.name} sub={`${cp.workouts.length} treinos`} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {cp.workouts.map(wk => {
          const isOpen = expanded === wk.id;
          const totalSets = wk.exercises.reduce((s,e) => s+Math.max(e.sets,0), 0);
          const doneSets = wk.exercises.reduce((s,e) => s+(done[e.id]||[]).filter(Boolean).length, 0);
          return (
            <div key={wk.id} style={{ background: isOpen ? BLK : C1, borderRadius: 20, overflow: "hidden", boxShadow: isOpen ? "0 8px 30px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.15)", border: `2px solid ${isOpen ? A : B1}`, transition: "all 0.2s" }}>
              <button onClick={() => toggleExpand(wk.id)} style={{ width:"100%", background:"transparent", border:"none", padding:"18px 20px", cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:14, fontFamily:"inherit" }}>
                <div style={{ width:46, height:46, borderRadius:14, background: isOpen ? A : BLK, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <span style={{ fontSize: 25, fontWeight:900, color: isOpen ? BLK : "#fff" }}>{wk.label}</span>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize: 20, fontWeight:800, color: isOpen ? "#fff" : T1 }}>{wk.name}</div>
                  <div style={{ fontSize: 17, color: isOpen ? "#888" : T3, marginTop:2 }}>{wk.note} · {wk.exercises.length} ex.</div>
                </div>
                {isOpen && totalSets > 0 && <span style={{ fontSize: 18, fontWeight:800, color:A }}>{doneSets}/{totalSets}</span>}
                <div style={{ color: isOpen ? "#888" : T3 }}>{isOpen ? <ChevronUp size={23}/> : <ChevronDown size={23}/>}</div>
              </button>

              {isOpen && totalSets > 0 && (
                <div style={{ height:3, background:C2, margin:"0 20px" }}>
                  <div style={{ height:"100%", background:A, width:`${(doneSets/totalSets)*100}%`, borderRadius:99, transition:"width 0.3s" }} />
                </div>
              )}

              {isOpen && (
                <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:10 }}>
                  {wk.exercises.map(e => {
                    const sets = Math.max(e.sets,0);
                    const doneArr = done[e.id] || Array(sets).fill(false);
                    const allDone = sets>0 && doneArr.every(Boolean);
                    const wt = getW(e);
                    return (
                      <div key={e.id} style={{ background: allDone ? `rgba(201,168,76,0.08)` : C2, border:`1px solid ${allDone ? "rgba(201,168,76,0.3)" : B1}`, borderRadius:14, padding:"13px 14px", transition:"all 0.2s" }}>
                        {/* Name + tags */}
                        <div style={{ fontSize: 19, fontWeight:800, color: allDone ? T3 : T1, textDecoration: allDone ? "line-through" : "none", marginBottom:6 }}>{e.name}</div>
                        <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom: 8 }}>
                          {e.sets>0 && <span style={{ background:`rgba(201,168,76,0.15)`, color:A, fontSize: 17, fontWeight:700, padding:"2px 8px", borderRadius:6 }}>{e.sets}×</span>}
                          {e.reps && <span style={{ background:`rgba(201,168,76,0.15)`, color:A, fontSize: 17, fontWeight:700, padding:"2px 8px", borderRadius:6 }}>{e.reps} reps</span>}
                        </div>
                        {e.description && (
                          <button onClick={() => setExpandDesc(d=>({...d,[e.id]:!d[e.id]}))} style={{ background:"none", border:"none", color:T3, fontSize: 17, cursor:"pointer", padding:"0 0 6px", fontFamily:"inherit" }}>
                            {expandDesc[e.id] ? "▲ Ocultar dica" : "▼ Ver dica"}
                          </button>
                        )}
                        {expandDesc[e.id] && e.description && <div style={{ fontSize: 16, color:T3, marginBottom:8, fontStyle:"italic" }}>{e.description}</div>}
                        {e.mediaUrl && (
                          <button onClick={() => setExpandMedia(d=>({...d,[e.id]:!d[e.id]}))} style={{ background:"none", border:"none", color:A, fontSize: 17, cursor:"pointer", padding:"0 0 6px", fontFamily:"inherit" }}>
                            {expandMedia[e.id] ? "▲ Fechar" : "▶ Demonstração"}
                          </button>
                        )}
                        {expandMedia[e.id] && e.mediaUrl && (
                          <div style={{ marginTop:4, marginBottom:8, borderRadius:10, overflow:"hidden" }}>
                            {e.mediaUrl.includes("youtube")||e.mediaUrl.includes("youtu.be")
                              ? <iframe title={`Demonstração: ${e.name}`} src={e.mediaUrl.replace("watch?v=","embed/")} width="100%" height="180" frameBorder="0" allowFullScreen style={{borderRadius:10}} />
                              : <img src={e.mediaUrl} alt={e.name} style={{width:"100%",borderRadius:10,maxHeight:180,objectFit:"cover"}} />}
                          </div>
                        )}
                        {/* Weight slider — full width */}
                        <WeightSlider value={wt} onChange={v => saveWeight(e.id, v, wk)} />
                        {sets>0 && (
                          <div style={{ marginTop:10, display:"flex", gap:7, flexWrap:"wrap" }}>
                            {doneArr.map((d,i) => (
                              <button key={i} onClick={() => toggleSet(e.id,i,sets)} style={{ width:48, height:48, borderRadius:12, background: d ? A : C3, border:`1.5px solid ${d ? A : B1}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize: 18, fontWeight:800, color: d ? BLK : T3 }}>
                                {d ? <Check size={21} strokeWidth={3}/> : i+1}
                              </button>
                            ))}
                          </div>
                        )}
                        {showRest===e.id && <RestTimer />}
                        {showRest!==e.id && sets>0 && doneArr.some(Boolean) && (
                          <button onClick={() => setShowRest(e.id)} style={{ marginTop:8, background:"none", border:"none", color:T3, fontSize: 17, cursor:"pointer", fontFamily:"inherit", display:"flex", alignItems:"center", gap:4 }}>
                            <Clock size={15}/> Timer de descanso
                          </button>
                        )}
                      </div>
                    );
                  })}
                  <div style={{ marginTop:6 }}>
                    <PrimBtn onClick={() => finishWorkout(wk)}><Check size={23} strokeWidth={3}/> Concluir Treino {wk.label}</PrimBtn>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── SavedWorkoutsScreen ───────────────────────────────────────────────────────
function SavedWorkoutsScreen({ appState, onBack, onSaveState, onEdit }) {
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  function activate(pid) { onSaveState({ ...appState, currentProgramId: pid }); }
  function del(pid) {
    onSaveState({ ...appState, programs: appState.programs.filter(p => p.id !== pid) });
    setConfirmDeleteId(null);
  }
  function duplicate(p) {
    const copy = { ...JSON.parse(JSON.stringify(p)), id: uid(), name: p.name + " (cópia)", createdAt: Date.now() };
    copy.workouts = copy.workouts.map(wk => ({ ...wk, id: uid(), exercises: wk.exercises.map(e => ({ ...e, id: uid() })) }));
    onSaveState({ ...appState, programs: [copy, ...appState.programs] });
    onEdit(copy);
  }
  function startEditName(p) { setEditingId(p.id); setEditingName(p.name); }
  function confirmEditName(pid) {
    if (!editingName.trim()) { setEditingId(null); return; }
    onSaveState({ ...appState, programs: appState.programs.map(p => p.id === pid ? { ...p, name: editingName.trim() } : p) });
    setEditingId(null);
  }

  return (
    <div>
      <PageHeader onBack={onBack} title="Treinos Salvos" sub={`${appState.programs.length} programas`} />
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {appState.programs.map(p => {
          const isActive = p.id === appState.currentProgramId;
          const isEditingThis = editingId === p.id;
          const isConfirmingDelete = confirmDeleteId === p.id;
          return (
            <Card key={p.id} style={{ border: `2px solid ${isActive ? BLK : B1}`, padding: "16px 18px" }}>
              {/* Name row */}
              <div style={{ marginBottom: 12 }}>
                {isActive && <span style={{ display: "inline-block", background: BLK, color: A, fontSize: 14, fontWeight: 800, padding: "3px 8px", borderRadius: 6, letterSpacing: 1.2, textTransform: "uppercase", marginBottom: 6 }}>ATIVO</span>}
                {isEditingThis ? (
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input autoFocus value={editingName} onChange={e => setEditingName(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") confirmEditName(p.id); if (e.key === "Escape") setEditingId(null); }}
                      style={{ flex: 1, background: C2, border: `2px solid ${BLK}`, borderRadius: 10, color: T1, padding: "10px 12px", fontSize: 20, fontWeight: 800, outline: "none", fontFamily: "inherit" }} />
                    <button onClick={() => confirmEditName(p.id)} style={{ background: BLK, border: "none", borderRadius: 10, padding: "10px 14px", color: A, cursor: "pointer", fontWeight: 800, fontSize: 20, fontFamily: "inherit" }}>✓</button>
                    <button onClick={() => setEditingId(null)} style={{ background: C3, border: "none", borderRadius: 10, padding: "10px 12px", color: T2, cursor: "pointer", display: "flex" }}><X size={21} /></button>
                  </div>
                ) : (
                  <button onClick={() => startEditName(p)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: T1 }}>{p.name}</span>
                    <Edit3 size={20} color={T3} style={{ flexShrink: 0 }} />
                  </button>
                )}
              </div>

              {/* Workout badges */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
                {p.workouts.map(w => (
                  <span key={w.id} style={{ background: C2, border: `1px solid ${B1}`, borderRadius: 8, fontSize: 16, fontWeight: 700, color: T2, padding: "5px 11px" }}>
                    {w.label}: {w.exercises.length} ex.
                  </span>
                ))}
              </div>

              {/* Inline delete confirmation */}
              {isConfirmingDelete && (
                <div style={{ background: "rgba(224,48,48,0.06)", border: `1.5px solid rgba(224,48,48,0.25)`, borderRadius: 12, padding: "12px 14px", marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                  <span style={{ fontSize: 19, fontWeight: 700, color: RED }}>Excluir este programa?</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => del(p.id)} style={{ background: RED, color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 19, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>Excluir</button>
                    <button onClick={() => setConfirmDeleteId(null)} style={{ background: C3, color: T2, border: "none", borderRadius: 10, padding: "9px 14px", fontSize: 19, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>Cancelar</button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                {!isActive && (
                  <button onClick={() => activate(p.id)} style={{ flex: 1, background: BLK, color: "#fff", border: "none", borderRadius: 12, padding: "13px", fontSize: 20, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                    Ativar
                  </button>
                )}
                <button onClick={() => onEdit(p)} style={{ flex: 1, background: C2, color: T1, border: `1.5px solid ${B1}`, borderRadius: 12, padding: "13px", fontSize: 20, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                  <Edit3 size={21} /> Editar
                </button>
                <button onClick={() => duplicate(p)} style={{ background: C2, color: T2, border: `1.5px solid ${B1}`, borderRadius: 12, padding: "13px 14px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }} title="Duplicar">
                  <span style={{ fontSize: 23 }}>⧉</span>
                </button>
                {!isActive && (
                  <button onClick={() => setConfirmDeleteId(isConfirmingDelete ? null : p.id)}
                    style={{ background: isConfirmingDelete ? RED : "rgba(224,48,48,0.08)", border: "none", borderRadius: 12, padding: "13px 14px", color: isConfirmingDelete ? "#fff" : RED, cursor: "pointer", display: "flex", alignItems: "center" }}>
                    <Trash2 size={23} />
                  </button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}


function HistoryScreen({ appState, onBack }) {
  const { sessions } = appState;
  const [chartEx, setChartEx] = useState(null);
  const [showChart, setShowChart] = useState(false);

  const allExNames = useMemo(() => {
    const s = new Set();
    sessions.forEach(sess => sess.exercises.forEach(e => { if (e.weight > 0) s.add(e.name); }));
    return Array.from(s).sort();
  }, [sessions]);

  const chartData = useMemo(() => {
    if (!chartEx) return [];
    return sessions
      .filter(s => s.exercises.some(e => e.name === chartEx))
      .map(s => ({ date: fmtDate(s.date), peso: s.exercises.find(e => e.name === chartEx)?.weight || 0, ts: s.date }))
      .sort((a,b) => a.ts-b.ts);
  }, [sessions, chartEx]);

  const weekN = sessions.filter(s => Date.now()-s.date < 7*86400000).length;
  const monthN = sessions.filter(s => Date.now()-s.date < 30*86400000).length;

  return (
    <div>
      <PageHeader onBack={onBack} title="Histórico" sub={`${sessions.length} sessões`} />

      {/* Stats strip */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 20 }}>
        {[["Semana", weekN], ["Mês", monthN], ["Total", sessions.length]].map(([l, v]) => (
          <Card key={l} style={{ textAlign: "center", padding: "14px 10px" }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: T1 }}>{v}</div>
            <div style={{ fontSize: 15, color: T3, marginTop: 2, fontWeight: 700, letterSpacing: 1 }}>{l.toUpperCase()}</div>
          </Card>
        ))}
      </div>

      {allExNames.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <GhostBtn onClick={() => setShowChart(true)} accent>
            <TrendingUp size={21} /> Ver evolução de carga
          </GhostBtn>
        </div>
      )}

      {sessions.length === 0 ? (
        <Card style={{ textAlign: "center", padding: "50px 20px" }}>
          <Hist size={41} color={T3} style={{ marginBottom: 12 }} />
          <div style={{ fontSize: 20, fontWeight: 800, color: T1, marginBottom: 6 }}>Nenhum treino ainda</div>
          <div style={{ fontSize: 16, color: T3 }}>Conclua um treino para ver aqui</div>
        </Card>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {sessions.map(s => (
            <Card key={s.id} style={{ padding: "14px 16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                    <span style={{ background: BLK, color: A, fontSize: 16, fontWeight: 800, padding: "2px 8px", borderRadius: 6 }}>
                      Treino {s.workoutLabel}
                    </span>
                  </div>
                  <div style={{ fontSize: 19, fontWeight: 800, color: T1 }}>{s.workoutName}</div>
                  <div style={{ fontSize: 17, color: T3 }}>{s.programName}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: T1 }}>{fmtDate(s.date)}</div>
                  <div style={{ fontSize: 17, color: T3 }}>{fmtTime(s.date)} · {fmtDur(s.duration)}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {s.exercises.filter(e => e.setsCompleted > 0).map((e, i) => (
                  <span key={i} style={{ background: C2, border: `1px solid ${B1}`, borderRadius: 6, fontSize: 17, color: T2, padding: "3px 8px", fontWeight: 600 }}>
                    {e.name}{e.weight > 0 ? ` · ${e.weight}kg` : ""}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}

      {showChart && (
        <Modal title="Evolução de Carga" onClose={() => setShowChart(false)}>
          <div style={{ marginBottom: 14 }}>
            <Lbl>Exercício</Lbl>
            <select value={chartEx||""} onChange={e => setChartEx(e.target.value)}
              style={{ width:"100%", background:C2, border:`1.5px solid ${B1}`, borderRadius:10, color: chartEx ? T1 : T3, padding:"11px 13px", fontSize: 19, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }}>
              <option value="">Selecionar exercício...</option>
              {allExNames.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          {chartEx && chartData.length > 0 && (
            <div>
              <div style={{ fontSize: 16, color:T3, marginBottom:12 }}>{chartData.length} sessões com <b style={{color:T1}}>{chartEx}</b></div>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid stroke={B1} />
                  <XAxis dataKey="date" tick={{fill:T3,fontSize: 15}} />
                  <YAxis tick={{fill:T3,fontSize: 15}} unit="kg" />
                  <Tooltip contentStyle={{background:C1,border:`1px solid ${B1}`,borderRadius:10,fontSize: 16}} itemStyle={{color:T1}} formatter={v=>[`${v} kg`,"Peso"]} />
                  <Line type="monotone" dataKey="peso" stroke={BLK} strokeWidth={2.5} dot={{fill:A,r:5,stroke:BLK,strokeWidth:2}} activeDot={{r:7}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [appState, setAppState] = useState(null);
  const [screen, setScreen] = useState("home");
  const [editTarget, setEditTarget] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error

  // Carrega do Firebase na abertura
  useEffect(() => { loadState().then(setAppState); }, []);

  async function saveState(ns) {
    setAppState(ns);
    setSaveStatus("saving");
    const ok = await persist(ns)
      .then(() => true)
      .catch(() => false);
    setSaveStatus(ok !== false ? "saved" : "error");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }

  function handleEdit(prog) { setEditTarget(prog); setScreen("edit"); }

  function handleSaveEdit(updatedProg) {
    const programs = appState.programs.map(p => p.id === updatedProg.id ? updatedProg : p);
    saveState({ ...appState, programs, currentProgramId: updatedProg.id });
  }

  function handleSaveNew(newProg) {
    saveState({ ...appState, programs: [newProg, ...appState.programs], currentProgramId: newProg.id });
  }

  if (!appState) return (
    <div style={{ minHeight: "100vh", background: BG, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 48, height: 48, background: A, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Dumbbell size={30} color={BLK} strokeWidth={2.5} />
          </div>
          <span style={{ fontSize: 37, fontWeight: 900, color: T1, letterSpacing: -1 }}>
            Stack<span style={{ color: A }}>fit</span>
          </span>
        </div>
        <span style={{ fontSize: 17, color: T3, letterSpacing: 3, textTransform: "uppercase" }}>by Luiz Pandolfi</span>
      </div>
      <div style={{ fontSize: 18, color: T3, marginTop: 12 }}>carregando…</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: "'DM Sans','Segoe UI',sans-serif", color: T1, maxWidth: 480, margin: "0 auto" }}>
      {/* Top bar */}
      <div style={{ padding: "18px 20px 0", display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, background: A, borderRadius: 11, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Dumbbell size={21} color={BLK} strokeWidth={2.5} />
        </div>
        <span style={{ fontSize: 23, fontWeight: 900, color: T1, letterSpacing: -0.5 }}>
          Stack<span style={{ color: A }}>fit</span>
        </span>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
          {/* Firebase save status */}
          {saveStatus !== "idle" && (
            <span style={{
              fontSize: 17, fontWeight: 700, letterSpacing: 0.5,
              color: saveStatus === "saved" ? "#4caf50" : saveStatus === "error" ? "#e03030" : T3,
              transition: "color 0.3s"
            }}>
              {saveStatus === "saving" ? "☁️ salvando…" : saveStatus === "saved" ? "☁️ salvo" : "⚠️ erro"}
            </span>
          )}
          {screen !== "home" && (
            <button onClick={() => { setScreen("home"); setEditTarget(null); }} style={{ background: C2, border: `1px solid ${B1}`, borderRadius: 8, color: T2, cursor: "pointer", fontSize: 16, fontWeight: 700, padding: "6px 12px", fontFamily: "inherit" }}>
              ← Início
            </button>
          )}
        </div>
      </div>

      <div style={{ padding: "0 20px 60px" }}>
        {screen === "home"    && <HomeScreen appState={appState} navigate={setScreen} />}
        {screen === "current" && <CurrentWorkoutScreen appState={appState} onBack={() => setScreen("home")} onSaveState={saveState} />}
        {screen === "saved"   && <SavedWorkoutsScreen  appState={appState} onBack={() => setScreen("home")} onSaveState={saveState} onEdit={handleEdit} />}
        {screen === "create"  && <WorkoutBuilder onSave={handleSaveNew} onBack={() => setScreen("home")} />}
        {screen === "edit"    && <WorkoutBuilder initialProgram={editTarget} onSave={handleSaveEdit} onBack={() => setScreen("saved")} />}
        {screen === "history" && <HistoryScreen  appState={appState} onBack={() => setScreen("home")} />}
      </div>
    </div>
  );
}
