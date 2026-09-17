import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import Logo from "../components/Logo.jsx";
import { useTheme } from "../context/ThemeContext.jsx";

const SunIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </svg>
);
const MoonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const navLinks = [];

const tools = [
  {
    title: "AI Chat", desc: "Get instant answers from your personal AI developer assistant, available anytime.",
    status: "Available", href: "/chat",
    icon: (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>),
  },
  {
    title: "Code Review", desc: "Paste any snippet and receive structured, actionable feedback in seconds.",
    status: "Available", href: "/code-review",
    icon: (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>),
  },
  {
    title: "Code Generator", desc: "Generate components, REST APIs, SQL queries, Dockerfiles, READMEs and more.",
    status: "Available", href: "/generate",
    icon: (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" /></svg>),
  },
  {
    title: "Bug Fixer", desc: "Drop in an error message and get a precise, fully-explained fix instantly.",
    status: "Available", href: "/bugfix",
    icon: (<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></svg>),
  },
];

const codeSymbols = [
  { text: "</>",  left: "7%",  top: "22%", delay: 0,    size: "1.4rem", opacity: 0.1  },
  { text: "{ }",  left: "88%", top: "16%", delay: 1.1,  size: "1.1rem", opacity: 0.09 },
  { text: "=>",   left: "83%", top: "68%", delay: 0.6,  size: "1rem",   opacity: 0.09 },
  { text: "[ ]",  left: "9%",  top: "72%", delay: 1.7,  size: "1.1rem", opacity: 0.09 },
  { text: "//",   left: "93%", top: "42%", delay: 0.3,  size: "0.95rem",opacity: 0.07 },
  { text: "( )",  left: "3%",  top: "48%", delay: 2.0,  size: "0.9rem", opacity: 0.07 },
  { text: "&&",   left: "79%", top: "32%", delay: 1.4,  size: "0.85rem",opacity: 0.07 },
  { text: "===",  left: "16%", top: "34%", delay: 0.9,  size: "0.8rem", opacity: 0.07 },
  { text: "fn()", left: "72%", top: "52%", delay: 2.3,  size: "0.8rem", opacity: 0.06 },
  { text: "++",   left: "22%", top: "58%", delay: 1.6,  size: "0.85rem",opacity: 0.06 },
];

function FlashCard({ tool }) {
  const Wrapper = tool.href ? Link : "div";
  const wrapperProps = tool.href ? { to: tool.href } : {};
  return (
    <Wrapper {...wrapperProps} className={`group relative z-0 block h-56 w-full overflow-hidden rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${tool.href ? "cursor-pointer" : ""}`}>
      <div className="absolute bottom-full right-0 z-[-1] h-full w-[200%] origin-bottom-right rounded-xl bg-gray-900 duration-500 group-hover:h-[300%] group-hover:-rotate-90" />
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white duration-300 group-hover:bg-white group-hover:text-gray-900">{tool.icon}</div>
      <h3 className="mb-2 font-semibold text-gray-900 duration-300 group-hover:text-white">{tool.title}</h3>
      <p className="mb-3 text-sm leading-relaxed text-gray-500 duration-300 group-hover:text-white/80">{tool.desc}</p>
      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium duration-300 ${tool.status === "Available" ? "bg-gray-900 text-white group-hover:bg-white group-hover:text-gray-900" : "bg-gray-100 text-gray-500 group-hover:bg-white/15 group-hover:text-white"}`}>{tool.status}</span>
      {tool.href && (
        <span className="absolute bottom-5 right-5 flex items-center gap-1 text-xs font-medium text-gray-400 opacity-0 duration-300 group-hover:text-white group-hover:opacity-100">
          <span className="relative before:absolute before:bottom-0 before:left-0 before:h-px before:w-full before:origin-left before:scale-x-0 before:bg-white before:duration-300 before:content-[''] group-hover:before:scale-x-100">Open</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
        </span>
      )}
    </Wrapper>
  );
}

const heroVariants = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.14, delayChildren: 0.05 } } },
  child: { hidden: { opacity: 0, y: 22 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } },
};
const cardVariants = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.08 } } },
  card: { hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } } },
};

const HEADER_H = 63;
const FOOTER_H = 48;

export default function Landing() {
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-30 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Logo size={30} />
          <nav className="hidden items-center gap-7 sm:flex">
            {navLinks.map((label) => (<span key={label} className="cursor-default text-sm font-medium text-gray-500 transition-colors hover:text-gray-900">{label}</span>))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
              aria-label="Toggle theme"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 cursor-pointer"
            >
              {theme === "dark" ? <SunIcon /> : <MoonIcon />}
            </button>
            <Link to="/login" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer">Log In</Link>
            <Link to="/signup" className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 cursor-pointer">Get Started</Link>
          </div>
        </div>
      </header>

      <div className="min-h-screen bg-white" style={{ paddingTop: HEADER_H, paddingBottom: FOOTER_H }}>
        <section className="relative overflow-hidden">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ backgroundImage: `radial-gradient(circle, ${theme === "dark" ? "#3f3f46" : "#d1d5db"} 1px, transparent 1px)`, backgroundSize: "28px 28px", opacity: 0.6 }} />
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: `radial-gradient(ellipse 72% 65% at 50% 50%, transparent 30%, ${theme === "dark" ? "#111113" : "white"} 100%)` }} />
          {codeSymbols.map((sym, i) => (
            <motion.span key={i} aria-hidden="true" className="pointer-events-none absolute select-none font-mono font-bold text-gray-900"
              style={{ left: sym.left, top: sym.top, fontSize: sym.size, opacity: sym.opacity }}
              animate={{ y: [0, -16, 0] }} transition={{ duration: 4.5 + i * 0.35, delay: sym.delay, repeat: Infinity, ease: "easeInOut" }}>
              {sym.text}
            </motion.span>
          ))}
          <div className="relative mx-auto max-w-3xl px-6 py-24 text-center sm:py-28">
            <motion.div variants={heroVariants.container} initial="hidden" animate="show">
              <motion.h1 variants={heroVariants.child} className="mb-6 text-6xl font-semibold leading-tight tracking-tight text-gray-900 sm:text-7xl">
                Dev<span className="font-normal text-gray-400">ixo</span>
              </motion.h1>
              <motion.p variants={heroVariants.child} className="mx-auto mb-10 max-w-lg text-lg font-light leading-relaxed tracking-wide text-gray-600">
                One clean workspace for chat, code review, code generation, and bug fixing. Ship faster with AI that understands how you work.
              </motion.p>
              <motion.div variants={heroVariants.child}>
                <a href="#features" className="inline-block rounded-lg border border-gray-300 px-7 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 cursor-pointer">See Features</a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section id="features" className="scroll-mt-20 border-t border-gray-200 bg-gray-50/60 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.45, ease: "easeOut" }} className="mb-12 text-center">
              <h2 className="text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">Everything you need to move faster</h2>
              <p className="mt-3 text-gray-500">Four tools, one clean workspace. Hover a card for more.</p>
            </motion.div>
            <motion.div variants={cardVariants.container} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {tools.map((tool) => (<motion.div key={tool.title} variants={cardVariants.card}><FlashCard tool={tool} /></motion.div>))}
            </motion.div>
          </div>
        </section>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-30 border-t border-gray-200 bg-white/95 backdrop-blur-sm px-6 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-center">
          <p className="text-sm text-gray-400">© 2026 Devixo. All rights reserved.</p>
        </div>
      </footer>
    </>
  );
}