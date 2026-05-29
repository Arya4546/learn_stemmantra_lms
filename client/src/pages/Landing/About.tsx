import { LandingHeader } from '../../components/layout/LandingHeader';
import { LandingFooter } from '../../components/layout/LandingFooter';
import { Sparkles, GraduationCap, Cpu, Award, ExternalLink, CheckCircle } from 'lucide-react';

export function About() {
  const corePhilosophies = [
    {
      title: 'Challenge-Based Learning (CBL)',
      description: 'Focuses on real-world problems that students solve. It encourages active learning and drives deeper engagement through practical, student-driven challenges.',
      icon: <Sparkles className="w-6 h-6 text-primary" />,
      color: 'border-orange-500/20 bg-orange-50/50'
    },
    {
      title: 'Project-Based Learning (PBL)',
      description: 'Students design, build, and test active hardware & software solutions. Develops critical collaboration, troubleshooting, and engineering design cycles.',
      icon: <Cpu className="w-6 h-6 text-orange-600" />,
      color: 'border-blue-500/20 bg-blue-50/50'
    },
    {
      title: 'Inquiry-Based Learning (IBL)',
      description: 'Prioritizes student questions, ideas, and analyses. Motivates learners to research, formulate theories, and validate hypothesis independently.',
      icon: <GraduationCap className="w-6 h-6 text-primary" />,
      color: 'border-green-500/20 bg-green-50/50'
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-[#0F172A] selection:bg-primary selection:text-white grid-pattern flex flex-col">
      <LandingHeader />

      {/* Main Content Area */}
      <main className="flex-grow pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[90%] mx-auto space-y-20">
          
          {/* Hero Section - Asymmetrical Side-by-Side */}
          <section className="pt-8">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 space-y-6 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-wider w-fit animate-float">
                  <Sparkles size={14} /> Shaping K-12 STEM Education
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-tight leading-[1.1] font-outfit">
                  Empowering the Next Generation of <span className="text-primary">Innovators</span>
                </h1>
                <p className="text-lg text-text-secondary leading-relaxed max-w-2xl">
                  STEMmantra provides turn-key Robotics, Coding, AI, and STEM laboratory setups for K-12 educational institutions across India. Our goal is to transform passive learning into active creation.
                </p>
                <div className="pt-2 flex justify-start">
                  <a 
                    href="https://stemmantra.com/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  >
                    Visit Corporate Website <ExternalLink size={16} />
                  </a>
                </div>
              </div>
              <div className="lg:col-span-5 relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/10 z-10 rounded-3xl" />
                <img 
                  src="https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&q=80&w=800" 
                  alt="Kids learning robotics" 
                  className="w-full h-96 object-cover rounded-3xl border border-slate-200/60 shadow-premium"
                />
              </div>
            </div>
          </section>

          {/* Mission & Vision Section */}
          <section className="grid lg:grid-cols-12 gap-12 items-center bg-white border border-slate-200/80 shadow-premium rounded-3xl p-8 sm:p-12">
            <div className="lg:col-span-7 space-y-6 text-left">
              <h2 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight font-outfit">Our Vision & Mission</h2>
              <p className="text-text-secondary leading-relaxed">
                We believe that education must keep pace with technological advancement. Our mission is to integrate hands-on learning ecosystems directly into school curricula, empowering students with the practical skills needed to thrive in an automated future.
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  'Turn-key school laboratory execution conforming to global standards.',
                  'Rigorous mentor training programs for sustainable growth.',
                  'Comprehensive syllabus mapping for grades K to 12.',
                  'Consistent student mentorship for national-level innovation challenges.'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3 text-sm font-semibold text-text-primary bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <CheckCircle size={18} className="text-green-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-5 relative group overflow-hidden rounded-2xl border border-slate-200/60 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-secondary/15 z-10" />
              <img 
                src="https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&q=80&w=800" 
                alt="Technology laboratory setup" 
                className="w-full h-80 object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
          </section>

          {/* Core Philosophy Section */}
          <section className="space-y-12">
            <div className="text-left space-y-4 max-w-3xl">
              <h2 className="text-3xl sm:text-4xl font-black text-text-primary tracking-tight font-outfit">Core Methodological Philosophy</h2>
              <p className="text-text-secondary leading-relaxed max-w-2xl">
                Our pedagogical framework is structured around three key learning pillars designed to stimulate critical thinking and creativity.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {corePhilosophies.map((item, idx) => (
                <div 
                  key={idx} 
                  className={`stage-card border rounded-2xl p-8 flex flex-col text-left space-y-4 ${item.color} shadow-sm transition-all duration-300 hover:shadow-lg`}
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center shadow-sm">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-text-primary font-outfit">{item.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed flex-grow">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Call to Action Footer Panel */}
          <section className="bg-brandDark rounded-3xl p-8 sm:p-12 text-left text-white relative overflow-hidden glow-dark-panel">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/15 rounded-full blur-3xl" />
            <div className="relative z-10 max-w-3xl space-y-6">
              <Award className="w-12 h-12 text-primary animate-float" />
              <h2 className="text-3xl sm:text-4xl font-black font-outfit tracking-tight">Want to learn more about our hardware setups?</h2>
              <p className="text-slate-400 leading-relaxed text-sm max-w-2xl">
                Explore detailed specifications of our school kits, NITI Aayog mandated Atal Tinkering Lab components, and client stories directly on our main site.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <a 
                  href="https://stemmantra.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-8 py-3.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-all"
                >
                  Explore Programs
                </a>
                <a 
                  href="https://stemmantra.com/" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  Corporate Home <ExternalLink size={14} />
                </a>
              </div>
            </div>
          </section>

        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
