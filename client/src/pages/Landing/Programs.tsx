import { LandingHeader } from '../../components/layout/LandingHeader';
import { LandingFooter } from '../../components/layout/LandingFooter';
import { Cpu, Terminal, Award, ExternalLink, Sparkles, Box, Hammer } from 'lucide-react';

export function Programs() {
  const programs = [
    {
      id: 'pre-tinkering',
      name: 'Pre-Tinkering Lab',
      badge: 'Early Explorers',
      grades: 'Grades 3 to 5',
      description: 'Targeted at students in grades 3–5, this lab uses child-friendly tools to introduce technology through building blocks, puzzles, art, simple machines, and basic electronic concepts. Its curriculum emphasizes "learning with fun" to nurture natural curiosity.',
      features: [
        'Safe, plug-and-play components & building blocks',
        'Visual programming languages & game design',
        'Teacher guides & creative activity templates',
        'Hands-on physical kits for classroom collaboration'
      ],
      color: 'border-amber-500/20 bg-amber-50/50 text-amber-600',
      icon: <Box className="w-6 h-6" />
    },
    {
      id: 'steamverse',
      name: 'STEMverse Lab',
      badge: 'Core Robotics & IoT',
      grades: 'Grades 6 to 12',
      description: 'Combines cutting-edge technology, hands-on experimentation, and project-based learning. It focuses on equipping students with knowledge in STEM, robotics, and IoT (Internet of Things) to prepare them for a technology-driven future.',
      features: [
        'Complete Arduino & microcontroller development kits',
        'Sensor integration and data logging protocols',
        'Autonomous robotics and motor driver applications',
        'IoT smart home & environmental monitor designs'
      ],
      color: 'border-orange-500/20 bg-orange-50/50 text-primary',
      icon: <Cpu className="w-6 h-6" />
    },
    {
      id: 'ai-coding',
      name: 'AI & Coding Lab',
      badge: 'Software Engineering',
      grades: 'Grades 6 to 12',
      description: 'Focuses on equipping students with essential AI and programming skills through a blend of hardware and software activities. The program ranges from basic programming to advanced AI concepts and is supported by workshops, hackathons, and competitions.',
      features: [
        'Block coding moving to text-based Python programs',
        'Computer Vision algorithms & face tracking simulations',
        'Introductory Machine Learning classification models',
        'Data structures and algorithm design patterns'
      ],
      color: 'border-blue-500/20 bg-blue-50/50 text-blue-600',
      icon: <Terminal className="w-6 h-6" />
    },
    {
      id: 'innoverse',
      name: 'Innoverse Lab',
      badge: '3D Prototyping & CAD',
      grades: 'Grades 3 to 12',
      description: "Designed as a one-stop solution for a school's technological needs, offering hands-on activities for students in grades 3–12. It features a progressive curriculum that caters to diverse skill levels to encourage exploration and growth.",
      features: [
        'Professional CAD modeling & assembly tutorials',
        '3D printing slice operations and hardware calibration',
        'Design thinking frameworks and product design cycles',
        'Materials engineering & mechanical tolerance testing'
      ],
      color: 'border-indigo-500/20 bg-indigo-50/50 text-indigo-600',
      icon: <Hammer className="w-6 h-6" />
    },
    {
      id: 'atl-lab',
      name: 'Atal Tinkering Lab (ATL)',
      badge: 'NITI Aayog Compliant',
      grades: 'Grades 6 to 12',
      description: 'An initiative by the Government of India\'s Atal Innovation Mission, providing workspaces equipped with 3D printers, robotics kits, IoT devices, and electronics. STEMmantra partners with schools to implement ATLs, offering turnkey setup, equipment, curriculum integration, and educator training.',
      features: [
        'NITI Aayog mandated equipment procurement & setups',
        'Hands-on trainer mapping & student-driven hackathons',
        'Mentorship for National ATL Marathon project entries',
        'Compliance audits, maintenance, & documentation support'
      ],
      color: 'border-emerald-500/20 bg-emerald-50/50 text-emerald-600',
      icon: <Award className="w-6 h-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-[#0F172A] selection:bg-primary selection:text-white grid-pattern flex flex-col">
      <LandingHeader />

      {/* Main Content Area */}
      <main className="flex-grow pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[90%] mx-auto space-y-16">
          
          {/* Header */}
          <section className="text-left space-y-4 max-w-4xl pt-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-wider animate-float">
              <Sparkles size={14} /> Comprehensive Curriculum Ecosystem
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-tight leading-[1.1] font-outfit">
              Advanced Laboratory Programs
            </h1>
            <p className="text-base text-text-secondary leading-relaxed max-w-2xl">
              Explore our structured K-12 STEM programs, tailor-made to ignite curiosity and build engineering skills through structured hands-on experiments.
            </p>
          </section>

          {/* Program Cards Grid */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {programs.map((prog) => (
              <div 
                key={prog.id}
                className={`stage-card border rounded-3xl p-8 text-left bg-white shadow-premium flex flex-col justify-between transition-all duration-300 hover:shadow-2xl ${
                  prog.id === 'atl-lab' ? 'lg:col-span-12 border-emerald-500/20 shadow-emerald-500/5' : 'lg:col-span-6'
                }`}
              >
                <div className="space-y-6">
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-sm ${prog.color}`}>
                        {prog.icon}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-text-primary font-outfit tracking-tight">{prog.name}</h3>
                        <span className="text-xs font-bold text-text-secondary">{prog.grades}</span>
                      </div>
                    </div>
                    <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {prog.badge}
                    </span>
                  </div>

                  <p className="text-sm text-text-secondary leading-relaxed max-w-4xl">
                    {prog.description}
                  </p>

                  {/* Features Grid */}
                  <div className={`grid gap-4 pt-2 ${prog.id === 'atl-lab' ? 'sm:grid-cols-2 md:grid-cols-4' : 'sm:grid-cols-2'}`}>
                    {prog.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs font-semibold text-text-primary bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 flex justify-end">
                  <a 
                    href="https://stemmantra.com/"
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white text-xs font-bold rounded-xl transition-all border border-primary/20"
                  >
                    View on Corporate Website <ExternalLink size={13} />
                  </a>
                </div>
              </div>
            ))}
          </section>

          {/* Partner and Support Banner */}
          <section className="bg-brandDark rounded-3xl p-8 sm:p-12 text-left text-white relative overflow-hidden glow-dark-panel">
            <div className="absolute top-0 right-0 w-80 h-80 bg-primary/15 rounded-full blur-3xl" />
            <div className="relative z-10 max-w-3xl space-y-6">
              <h2 className="text-3xl sm:text-4xl font-black font-outfit tracking-tight">Need a custom lab setup for your school?</h2>
              <p className="text-slate-400 leading-relaxed text-sm max-w-2xl">
                Get in touch with our solutions architects to design a bespoke learning environment customized to your school board requirements and space coordinates.
              </p>
              <div className="pt-4 flex flex-wrap gap-4">
                <a 
                  href="https://stemmantra.com/"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                >
                  Request A Lab Setup Proposal <ExternalLink size={14} />
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
