import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight, CheckCircle2, Calendar, BarChart2, Tag, Bell,
  Repeat, Star, Zap, ChevronRight
} from 'lucide-react';

const features = [
  {
    icon: <CheckCircle2 size={28} className="text-primaryDark" />,
    title: 'Smart Task Capture',
    desc: 'Instantly add tasks from any device. Set priorities, due dates, and categories in seconds — never miss a commitment again.'
  },
  {
    icon: <Calendar size={28} className="text-primaryDark" />,
    title: 'Google Calendar Sync',
    desc: 'Generate Google Calendar invites directly from any task. Your to-dos and events live together so nothing slips through the cracks.'
  },
  {
    icon: <BarChart2 size={28} className="text-primaryDark" />,
    title: 'Productivity Analytics',
    desc: 'Visualize your completion rates, most productive hours, and workload distribution across categories and priorities.'
  },
  {
    icon: <Tag size={28} className="text-primaryDark" />,
    title: 'Categories & Labels',
    desc: 'Organize tasks into Work, Personal, Health, Finance and more. Filter instantly to focus on what matters right now.'
  },
  {
    icon: <Bell size={28} className="text-primaryDark" />,
    title: 'Priority System',
    desc: 'High, Medium, Low priorities with visual urgency indicators. Focus on what is critical, delegate the rest.'
  },
  {
    icon: <Repeat size={28} className="text-primaryDark" />,
    title: 'Due Date Tracking',
    desc: 'See what is due today, this week, or overdue at a glance. The Today and Upcoming views keep you ahead of every deadline.'
  },
];

const stats = [
  { value: '2M+', label: 'Tasks Completed Daily' },
  { value: '98%', label: 'On-time Delivery Rate' },
  { value: '4.9★', label: 'Average User Rating' },
  { value: '150+', label: 'Countries Worldwide' },
];

const testimonials = [
  {
    name: 'Sarah K.',
    role: 'Product Manager at Stripe',
    text: 'NeonDo replaced three different productivity tools for me. The Google Calendar integration alone saved me 30 minutes a day.'
  },
  {
    name: 'Raj M.',
    role: 'Freelance Consultant',
    text: 'The priority system is brilliant. I can see my high-priority tasks the moment I open the app — no digging through lists.'
  },
  {
    name: 'Amara L.',
    role: 'Engineering Lead',
    text: 'The analytics dashboard helps me understand where my team is spending time. It honestly changed how we do sprint planning.'
  },
  {
    name: 'Tom B.',
    role: 'Startup Founder',
    text: 'Clean, fast, and incredibly smart. I have tried Todoist, TickTick, and Notion — NeonDo is the only one I actually stuck with.'
  },
];

const howItWorks = [
  {
    step: '01',
    title: 'Capture It',
    desc: 'Add any task in under 5 seconds. Type a title, pick a priority, set a due date and category. Done.'
  },
  {
    step: '02',
    title: 'Organize It',
    desc: 'Tasks automatically surface in your Today, Upcoming, or Important views based on priority and due date.'
  },
  {
    step: '03',
    title: 'Act On It',
    desc: 'Add it to your Google Calendar with one click. Check it off when done. Watch your completion rate climb.'
  },
  {
    step: '04',
    title: 'Reflect On It',
    desc: 'The analytics dashboard shows patterns in your productivity — what you complete, when, and across which areas of life.'
  },
];

const LandingPage = () => {
  const { scrollYProgress } = useScroll();
  const yBg = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);

  return (
    <div className="relative w-full">

      {/* ═══ HERO ═══ */}
      <section className="relative min-h-[92vh] flex flex-col items-center justify-center overflow-hidden px-6">
        {/* Parallax blobs */}
        <motion.div style={{ y: yBg }} className="absolute inset-0 pointer-events-none -z-10">
          <div className="w-[700px] h-[700px] bg-primary/30 rounded-full blur-[140px] absolute -right-40 -top-20" />
          <div className="w-[500px] h-[500px] bg-secondary/40 rounded-full blur-[120px] absolute -left-20 bottom-0" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9 }}
          className="text-center max-w-5xl z-10"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-2 mb-8 px-5 py-2 rounded-full border-2 border-primary bg-primary/10 text-primaryDark font-bold text-sm"
          >
            <Zap size={14} />  The smarter way to get things done
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl md:text-8xl font-black mb-6 text-primaryDark leading-tight tracking-tighter">
            Stop forgetting.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primaryDark via-primary to-secondary">
              Start doing.
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-textMuted mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
            NeonDo is the task manager that keeps your work, personal goals, and deadlines in one beautifully organised place — with live analytics to show you exactly how productive you really are.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/tasks" className="btn-neon text-lg flex items-center justify-center gap-2 px-8 py-4">
              Start Managing Tasks <ArrowRight size={20} />
            </Link>
            <Link to="/dashboard" className="btn-outline-neon text-lg px-8 py-4">
              View Dashboard
            </Link>
          </div>

          {/* Social proof mini stats */}
          <div className="flex flex-wrap justify-center gap-8 text-sm font-semibold text-textMuted">
            {['No credit card required', '2-minute setup', 'Works on any device'].map(t => (
              <span key={t} className="flex items-center gap-2">
                <CheckCircle2 size={16} className="text-primaryDark" /> {t}
              </span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ═══ STATS BANNER ═══ */}
      <section className="py-16 bg-primaryDark">
        <div className="container mx-auto px-6 max-w-5xl grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-4xl md:text-5xl font-black text-primary mb-2">{s.value}</div>
              <div className="text-secondary/80 font-semibold">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ HOW IT WORKS ═══ */}
      <section className="py-28 bg-surface/40">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-primaryDark mb-4">Four steps to a clearer day</h2>
            <p className="text-xl text-textMuted max-w-2xl mx-auto">No steep learning curve. Go from zero to organised in minutes.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {howItWorks.map((step, i) => (
              <motion.div
                key={i}
                className="relative glass-panel p-8 bg-white/60 group hover:shadow-neon transition-all"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                whileHover={{ y: -6 }}
              >
                <div className="text-6xl font-black text-primary/20 mb-4 group-hover:text-primary/40 transition-colors">{step.step}</div>
                <h3 className="text-xl font-bold text-primaryDark mb-3">{step.title}</h3>
                <p className="text-textMuted leading-relaxed">{step.desc}</p>
                {i < howItWorks.length - 1 && (
                  <ChevronRight size={24} className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-primary z-10" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FEATURES ═══ */}
      <section className="py-28">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-primaryDark mb-4">Everything a power user needs</h2>
            <p className="text-xl text-textMuted">Built by studying how the world's top performers manage their time.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="glass-panel p-8 bg-white/70 hover:shadow-neon transition-all group"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-primary/40 group-hover:shadow-neon transition-all">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-primaryDark mb-3">{f.title}</h3>
                <p className="text-textMuted leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ═══ */}
      <section className="py-28 bg-primaryDark/5">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-primaryDark mb-4">Trusted by people who get things done</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                className="glass-panel p-8 bg-white/80"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex mb-4">
                  {[...Array(5)].map((_, j) => <Star key={j} size={16} className="text-primary fill-primary" />)}
                </div>
                <p className="text-textMuted text-lg leading-relaxed mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primaryDark text-primary font-black flex items-center justify-center">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="font-bold text-primaryDark">{t.name}</div>
                    <div className="text-sm text-textMuted">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className="py-32 text-center bg-primaryDark">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="container mx-auto px-6 max-w-3xl"
        >
          <h2 className="text-4xl md:text-6xl font-black text-primary mb-6">Your most productive day starts here.</h2>
          <p className="text-secondary/80 text-xl mb-10">Add your first task in under 60 seconds. No setup. No confusion.</p>
          <Link to="/tasks" className="inline-flex items-center gap-3 bg-primary text-primaryDark font-black px-10 py-5 rounded-2xl text-xl hover:shadow-neon transition-all hover:-translate-y-1">
            Create My First Task <ArrowRight size={24} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
