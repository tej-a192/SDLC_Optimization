import { motion } from 'framer-motion';
import { CheckCircle2, Clock, Target, Users, Award, TrendingUp, Heart, Lightbulb } from 'lucide-react';

const values = [
  {
    icon: <Target size={32} className="text-primaryDark" />,
    title: 'Clarity Over Clutter',
    desc: 'Most people are not unproductive — they are overwhelmed. NeonDo strips away the noise and shows you exactly what needs to happen today, in a single screen.'
  },
  {
    icon: <Clock size={32} className="text-primaryDark" />,
    title: 'Respect Your Time',
    desc: 'Every feature we build asks: does this save the user time? Due date alerts, calendar syncing, and smart views are all designed to eliminate the mental overhead of staying organised.'
  },
  {
    icon: <Heart size={32} className="text-primaryDark" />,
    title: 'Built For Real Life',
    desc: 'Work tasks, grocery lists, gym goals, bill reminders. NeonDo handles all of it without forcing you into corporate-style project management workflows.'
  },
  {
    icon: <Lightbulb size={32} className="text-primaryDark" />,
    title: 'Data Drives Improvement',
    desc: 'Seeing your completion rate drop on Fridays or seeing "Work" swamp every other category — these are insights that actually change how you plan. That is why analytics are built in, not bolted on.'
  },
];

const productivityTips = [
  {
    number: '1',
    tip: 'Capture everything immediately',
    detail: 'Your brain is for thinking, not for storing. The moment a task, idea, or commitment lands on you — put it in NeonDo. Capture now, prioritise later.'
  },
  {
    number: '2',
    tip: 'Use priorities ruthlessly',
    detail: 'Not everything is High priority. Mark High only what genuinely blocks progress or has a hard deadline. Reserve your attention for what actually matters.'
  },
  {
    number: '3',
    tip: 'Review your Today view every morning',
    detail: 'Spend 5 minutes each morning scanning your Today list. Reschedule anything unrealistic. Set your top 3 must-do items. This single habit changes everything.'
  },
  {
    number: '4',
    tip: 'Use categories as life buckets',
    detail: 'Work, Personal, Health, Finance, Learning. Keep tasks cleanly bucketed so you can context-switch efficiently and understand where your time actually goes.'
  },
  {
    number: '5',
    tip: 'Add to Google Calendar for fixed commitments',
    detail: 'If a task must happen at a specific time — a call, a deadline, a bill payment — use the Google Calendar link in NeonDo to block it in your calendar immediately.'
  },
  {
    number: '6',
    tip: 'Review the Dashboard weekly',
    detail: 'Every Sunday, check your Dashboard. Did your completion rate fall? Did Work tasks crowd out Personal ones? This weekly review is how high performers stay balanced.'
  },
];

const teamValues = [
  { icon: <Award size={24} />, label: 'Excellence First' },
  { icon: <Users size={24} />, label: 'User Obsessed' },
  { icon: <TrendingUp size={24} />, label: 'Data Driven' },
  { icon: <CheckCircle2 size={24} />, label: 'Ship Fast, Fix Faster' },
];

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const AboutPage = () => {
  return (
    <div className="w-full">

      {/* ═══ HERO ═══ */}
      <section className="relative py-28 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] absolute -right-32 -top-20" />
          <div className="w-[400px] h-[400px] bg-secondary/30 rounded-full blur-[100px] absolute -left-20 bottom-0" />
        </div>
        <motion.div {...fadeUp} transition={{ duration: 0.8 }} className="max-w-4xl mx-auto">
          <div className="inline-block mb-6 px-4 py-2 rounded-full bg-primary/20 border border-primary text-primaryDark font-bold text-sm">
            Our Story
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-primaryDark mb-8 leading-tight">
            We built the app <br />we wished existed.
          </h1>
          <p className="text-xl md:text-2xl text-textMuted max-w-3xl mx-auto leading-relaxed">
            Every productivity tool we tried was either too complex, too simple, or too ugly to use consistently. So we started from scratch — with a clear question: what does a person actually need to manage their commitments effectively?
          </p>
        </motion.div>
      </section>

      {/* ═══ THE PROBLEM ═══ */}
      <section className="py-24 bg-primaryDark">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <motion.div {...fadeUp} className="text-primary">
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                The average person has 150+ open tasks at any time.
              </h2>
              <p className="text-secondary/80 text-xl leading-relaxed mb-6">
                They lose track of deadlines. They avoid priorities. They rely on memory and sticky notes. They miss things that matter.
              </p>
              <p className="text-secondary/80 text-xl leading-relaxed">
                That is not a willpower problem. It is a system problem. NeonDo is the system.
              </p>
            </motion.div>
            <motion.div
              {...fadeUp}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { stat: '41%', label: 'of to-do items are never completed (MIT Study)' },
                { stat: '1.5hrs', label: 'lost per day due to poor task management' },
                { stat: '68%', label: 'of professionals feel overwhelmed weekly' },
                { stat: '3x', label: 'more output when using a structured task system' },
              ].map((item, i) => (
                <div key={i} className="glass-panel p-6 bg-white/5 border-primary/20">
                  <div className="text-4xl font-black text-primary mb-2">{item.stat}</div>
                  <div className="text-secondary/70 text-sm leading-snug">{item.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ OUR VALUES ═══ */}
      <section className="py-28 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-primaryDark mb-4">The principles behind every feature</h2>
            <p className="text-xl text-textMuted">Everything we ship comes back to these four beliefs.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {values.map((v, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.12 }}
                className="glass-panel p-10 bg-white/70 hover:shadow-neon transition-all group"
                whileHover={{ y: -6 }}
              >
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/40 transition-colors">
                  {v.icon}
                </div>
                <h3 className="text-2xl font-bold text-primaryDark mb-4">{v.title}</h3>
                <p className="text-textMuted text-lg leading-relaxed">{v.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PRODUCTIVITY TIPS ═══ */}
      <section className="py-28 bg-surface/40 px-6">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-primaryDark mb-4">6 habits that transform your productivity</h2>
            <p className="text-xl text-textMuted">These are the patterns we observed in our highest-performing users.</p>
          </div>
          <div className="space-y-6">
            {productivityTips.map((tip, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ delay: i * 0.08 }}
                className="glass-panel p-8 bg-white/70 flex gap-8 items-start hover:shadow-neon transition-all"
              >
                <div className="text-5xl font-black text-primary/30 leading-none flex-shrink-0 w-16 text-center">
                  {tip.number}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-primaryDark mb-2">{tip.tip}</h3>
                  <p className="text-textMuted leading-relaxed">{tip.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TEAM + CTA ═══ */}
      <section className="py-28 px-6 bg-primaryDark text-center">
        <motion.div {...fadeUp} className="container mx-auto max-w-4xl">
          <h2 className="text-4xl md:text-5xl font-black text-primary mb-8">Built by people obsessed with getting things done</h2>
          <p className="text-secondary/80 text-xl mb-16 leading-relaxed max-w-2xl mx-auto">
            We are a small, focused team that uses NeonDo every single day. When something annoys us, we fix it. When users request something smart, we ship it.
          </p>
          <div className="flex flex-wrap justify-center gap-6 mb-16">
            {teamValues.map((v, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-3 rounded-full border border-primary/40 text-primary font-bold">
                {v.icon} {v.label}
              </div>
            ))}
          </div>
          <a href="/tasks" className="inline-flex items-center gap-3 bg-primary text-primaryDark font-black px-10 py-5 rounded-2xl text-xl hover:shadow-neon transition-all hover:-translate-y-1">
            Start Getting Organised
          </a>
        </motion.div>
      </section>
    </div>
  );
};

export default AboutPage;
