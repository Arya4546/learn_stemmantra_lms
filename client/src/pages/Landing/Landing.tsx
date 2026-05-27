import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  ArrowRight, 
  Terminal, 
  Cpu, 
  BookOpen, 
  CheckCircle, 
  GraduationCap, 
  Users, 
  Award, 
  ExternalLink,
  ChevronRight,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Play,
  Check,
  Code
} from 'lucide-react';

interface ProgramDetail {
  id: string;
  name: string;
  badge: string;
  grades: string;
  description: string;
  features: string[];
  color: string;
  icon: React.ReactNode;
  mockSyllabus: string[];
}

export function Landing() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'editor' | 'circuit' | 'dashboard'>('editor');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeProgram, setActiveProgram] = useState<string>('steamverse');

  // Interactive Live Telemetry state for the Sandbox compiler
  const [telemetryDistance, setTelemetryDistance] = useState<number>(28);
  const [isAlertActive, setIsAlertActive] = useState<boolean>(false);
  const [activeLineIdx, setActiveLineIdx] = useState<number>(-1);

  // Dynamic tracking simulation for specialized lab tabs
  const [aiCoords, setAiCoords] = useState({ x: 142, y: 84 });
  const [steamverseMetrics, setSteamverseMetrics] = useState({ temp: 24.5, moisture: 42, rpm: 80 });

  // Interactive control states for individual lab tabs
  const [preTinkerLightValue, setPreTinkerLightValue] = useState<number>(38);
  const [steamverseMotorSpeed, setSteamverseMotorSpeed] = useState<'OFF' | 'LOW' | 'HIGH'>('HIGH');
  const [aiTrackingTarget, setAiTrackingTarget] = useState<'Face' | 'Drone' | 'Arduino'>('Face');
  const [innoverseSyncState, setInnoverseSyncState] = useState<'idle' | 'syncing' | 'completed'>('completed');
  const [innoverseProgress, setInnoverseProgress] = useState<number>(100);
  const [atlSyncState, setAtlSyncState] = useState<'idle' | 'syncing' | 'completed'>('completed');

  // simulated metrics interval loops
  useEffect(() => {
    if (activeProgram !== 'ai-coding') return;
    const interval = setInterval(() => {
      let targetBaseX = 130;
      let targetBaseY = 80;
      if (aiTrackingTarget === 'Drone') {
        targetBaseX = 65;
        targetBaseY = 35;
      } else if (aiTrackingTarget === 'Arduino') {
        targetBaseX = 165;
        targetBaseY = 95;
      }
      
      setAiCoords({
        x: Math.floor(Math.random() * 20) + targetBaseX - 10,
        y: Math.floor(Math.random() * 15) + targetBaseY - 7
      });
    }, 750);
    return () => clearInterval(interval);
  }, [activeProgram, aiTrackingTarget]);

  useEffect(() => {
    if (activeProgram !== 'steamverse') return;
    const interval = setInterval(() => {
      setSteamverseMetrics(prev => {
        let baseRpm = 80;
        if (steamverseMotorSpeed === 'LOW') baseRpm = 45;
        if (steamverseMotorSpeed === 'OFF') baseRpm = 0;
        
        return {
          temp: +(prev.temp + (Math.random() - 0.5) * 0.4).toFixed(1),
          moisture: Math.min(Math.max(prev.moisture + Math.floor((Math.random() - 0.5) * 4), 35), 55),
          rpm: baseRpm === 0 ? 0 : Math.min(Math.max(baseRpm + Math.floor((Math.random() - 0.5) * 8), baseRpm - 10), baseRpm + 10)
        };
      });
    }, 850);
    return () => clearInterval(interval);
  }, [activeProgram, steamverseMotorSpeed]);

  const startInnoverseSync = () => {
    if (innoverseSyncState === 'syncing') return;
    setInnoverseSyncState('syncing');
    setInnoverseProgress(0);
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      if (currentProgress <= 100) {
        setInnoverseProgress(currentProgress);
      } else {
        clearInterval(interval);
        setInnoverseSyncState('completed');
      }
    }, 150);
  };

  const startAtlValidation = () => {
    if (atlSyncState === 'syncing') return;
    setAtlSyncState('syncing');
    
    setTimeout(() => {
      setAtlSyncState('completed');
    }, 1500);
  };

  // Simulated code execution logic
  const startSimulation = () => {
    if (isRunning) return;
    setIsRunning(true);
    setTelemetryDistance(28);
    setIsAlertActive(false);
    setActiveLineIdx(-1);
    setTerminalOutput(['[SYSTEM] Initializing Wandbox environment...', '[SYSTEM] Connecting to remote simulation cloud...']);
  };

  useEffect(() => {
    if (!isRunning) return;
    
    const lines = [
      '[OK] Connected to compiler server.',
      '[OK] Compilation successful (0 warnings, 0 errors).',
      '[SENSOR] Ultrasonic sensor D2 active (value: 28cm).',
      '[MOTOR] Running motors: Left 80% | Right 80%',
      '[TELEMETRY] Forward acceleration active.',
      '[WARNING] Obstacle detected at 12cm!',
      '[ACTION] Halting motors to avoid collision.',
      '[MOTOR] Spinning left. Recalculating route...',
      '[SENSOR] Path cleared (D2: 45cm).',
      '[TELEMETRY] Resuming exploration cycle.',
      '[SYSTEM] Execution cycle completed cleanly.'
    ];

    // Maps terminal log sequence indices to matching executing Python code line indices:
    // 0: while True (OK connect)
    // 1: dist = sensor.read() (sensor D2 active)
    // 2: if dist < 15 (obstacle warning check)
    // 3: robot.stop() (halting action)
    // 4: robot.turn_left() (spinning action)
    // 5: else (path clear check)
    // 6: robot.drive(80) (forward drive acceleration)
    const lineHighlightMap = [-1, -1, 1, 6, 6, 2, 3, 4, 1, 0, -1];

    let currentLine = 0;
    const interval = setInterval(() => {
      if (currentLine < lines.length) {
        setTerminalOutput(prev => [...prev, lines[currentLine]]);
        setActiveLineIdx(lineHighlightMap[currentLine]);
        
        // Dynamically update simulated telemetry widget values based on output logs
        if (currentLine === 2) setTelemetryDistance(28);
        if (currentLine === 5) {
          setTelemetryDistance(12);
          setIsAlertActive(true);
        }
        if (currentLine === 8) {
          setTelemetryDistance(45);
          setIsAlertActive(false);
        }
        
        currentLine++;
      } else {
        clearInterval(interval);
        setIsRunning(false);
        setActiveLineIdx(-1);
      }
    }, 550);

    return () => clearInterval(interval);
  }, [isRunning]);

  const programs: ProgramDetail[] = [
    {
      id: 'pre-tinkering',
      name: 'Pre Tinkering Lab',
      badge: 'FOUNDATION',
      grades: 'Grades 3 to 5',
      description: 'An introductory physical computing gateway designed to spark curiosity in young minds. Through interactive components, elementary mechanics, and basic electronics, students learn design thinking.',
      features: [
        'Introduction to simple machines & structural design',
        'Basic electronics with safe, non-soldering physical boards',
        'Visual programming and conditional statement mapping',
        'Curriculum aligned with elementary cognitive milestones'
      ],
      color: 'from-orange-500 to-amber-500',
      icon: <GraduationCap className="w-5 h-5" />,
      mockSyllabus: [
        'Module 1: Simple Structures & Balancing',
        'Module 2: Basics of Electric Current & LEDs',
        'Module 3: Working with Sensors (Light & Sound)',
        'Module 4: Introductory Logic Blocks'
      ]
    },
    {
      id: 'steamverse',
      name: 'STEAMVERSE Lab',
      badge: 'FLAGSHIP PROGRAM',
      grades: 'Grades 3 to 12',
      description: 'Our core technology integration. Students work with 5+ microcontroller boards, 40+ modular sensors, 3D printing software, IoT cloud nodes, and drone dynamics, turning theoretical physics into actual projects.',
      features: [
        'Microcontroller interfacing (Arduino, ESP32, and Raspberry Pi)',
        'Sensors & Actuators calibration (gases, distance, humidity)',
        'Internet of Things (IoT) cloud dashboards & automation telemetry',
        'Drone mechanics, flight physics, and stabilization programming'
      ],
      color: 'from-blue-600 to-teal-500',
      icon: <Cpu className="w-5 h-5" />,
      mockSyllabus: [
        'Module 1: Interfacing Sensors with STEM Core',
        'Module 2: Serial Monitor Data Logging',
        'Module 3: Smart Irrigation Systems (IoT)',
        'Module 4: Aerodynamics and Drone Flight Control'
      ]
    },
    {
      id: 'ai-coding',
      name: 'AI & Coding Lab',
      badge: 'FUTURE SHIFT',
      grades: 'Grades 5 to 12',
      description: 'Focuses on building software engineering skills. Covers Python syntax logic, computer vision scripts, and basic Machine Learning algorithms to classify datasets and predict values.',
      features: [
        'Python programming essentials & loop structures',
        'Computer Vision using OpenCV libraries',
        'Machine Learning model training on local datasets',
        'Interactive simulation and game development'
      ],
      color: 'from-purple-600 to-indigo-600',
      icon: <Code className="w-5 h-5" />,
      mockSyllabus: [
        'Module 1: Python syntax & variables logic',
        'Module 2: Object Tracking using OpenCV',
        'Module 3: Training Image Classification Models',
        'Module 4: Deploying Predictive AI Scripts'
      ]
    },
    {
      id: 'innoverse',
      name: 'INNOVERSE Lab',
      badge: 'CUSTOM CURRICULUM',
      grades: 'Grades 3 to 12',
      description: 'A tailored, highly integrated school technology solution. It creates personalized learning pathways for each student, mapping standard curriculum concepts directly to hands-on experiments.',
      features: [
        'Aligned directly with CBSE, ICSE, and International boards',
        'Integrated student progress analytics for educators',
        'Curriculum customized to fit within standard school timetables',
        'Personalized digital portfolio building'
      ],
      color: 'from-emerald-600 to-teal-600',
      icon: <BookOpen className="w-5 h-5" />,
      mockSyllabus: [
        'Module 1: Physics Principles in Action',
        'Module 2: Circuit Diagrams and Breadboarding',
        'Module 3: Interactive Project Exhibitions',
        'Module 4: Semester Portfolio Submissions'
      ]
    },
    {
      id: 'atl-lab',
      name: 'Atal Tinkering Lab (ATL)',
      badge: 'GOVT COMPLIANT',
      grades: 'Grades 6 to 12',
      description: 'Complete turn-key execution from procurement of NITI Aayog mandated equipment to ongoing mentor mapping, competition coaching, and national marathon submission guidance.',
      features: [
        'Compliant equipment provisioning based on NITI Aayog guidelines',
        'Hands-on trainer mapping & student-driven hackathons',
        'Expert mentorship for National ATL Marathon submissions',
        'Regular evaluation audits & equipment updates'
      ],
      color: 'from-red-600 to-orange-500',
      icon: <Award className="w-5 h-5" />,
      mockSyllabus: [
        'Module 1: Safety & Lab Equipment Operations',
        'Module 2: Identifying Real-World Problems (SDGs)',
        'Module 3: Prototyping Solutions with STEM Kits',
        'Module 4: ATL Marathon Documentation and Submission'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-[#0F172A] selection:bg-primary selection:text-white grid-pattern">
      
      {/* 1. Header Section - Floating Premium Glass Navbar */}
      <div className="max-w-[90%] mx-auto pt-6">
        <header className="w-full bg-white/75 backdrop-blur-xl border border-slate-200/80 shadow-premium rounded-2xl px-6 py-4 flex items-center justify-between transition-all duration-300">
          <div className="flex items-center gap-2">
            <img 
              src="/logo.png" 
              alt="STEMmantra Logo" 
              className="h-10 w-auto object-contain hover:scale-102 transition-transform"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 font-sans font-bold text-sm">
            <a href="#" className="text-primary hover:text-primary-hover transition-colors">
              LMS Home
            </a>
            <a 
              href="https://stemmantra.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-text-secondary hover:text-primary transition-colors flex items-center gap-1 group"
            >
              Corporate Site <ExternalLink size={13} className="text-slate-400 group-hover:text-primary transition-colors" />
            </a>
            <a 
              href="https://stemmantra.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-text-secondary hover:text-primary transition-colors flex items-center gap-1 group"
            >
              Labs & Programs <ExternalLink size={13} className="text-slate-400 group-hover:text-primary transition-colors" />
            </a>
            <a 
              href="https://stemmantra.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-text-secondary hover:text-primary transition-colors flex items-center gap-1 group"
            >
              Contact Us <ExternalLink size={13} className="text-slate-400 group-hover:text-primary transition-colors" />
            </a>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/login')} 
              className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
            >
              Portal Login
            </button>
          </div>
        </header>
      </div>

      {/* 2. Hero Section - Immersive Side-by-Side Wide Layout */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-16 lg:pb-28">
        <div className="max-w-[90%] mx-auto relative z-10">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Heading and description */}
            <div className="lg:col-span-6 flex flex-col text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-wider w-fit animate-float">
                <Sparkles size={14} /> Structured K-12 STEM Curriculum
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-black text-text-primary tracking-tight leading-[1.1] font-outfit">
                Democratizing Robotics <br />
                & Coding Education <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500">For Indian Schools.</span>
              </h1>
              
              <p className="text-base sm:text-lg text-text-secondary leading-relaxed font-normal">
                Welcome to the digital gateway of STEMmantra LMS. Our platform connects students, school lab directors, and instructors with a year-long physical computing syllabus, embedded sensor diagnostics, and integrated code editors compliant with NEP 2020 and NCF 2023.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <button 
                  onClick={() => navigate('/login')} 
                  className="px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:bg-primary-hover hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  Enter Student Portal
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
                <a 
                  href="https://stemmantra.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-4 bg-white border border-slate-200 text-text-primary font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 flex items-center justify-center gap-2"
                >
                  Explore Corporate Site
                  <ExternalLink size={16} />
                </a>
              </div>

              {/* Statistics row */}
              <div className="pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-6">
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-text-primary font-outfit">300+</div>
                  <div className="text-xs text-text-secondary font-bold uppercase tracking-wider mt-1">Partner Labs</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-text-primary font-outfit">200K+</div>
                  <div className="text-xs text-text-secondary font-bold uppercase tracking-wider mt-1">Students Trained</div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-text-primary font-outfit">NCF 2023</div>
                  <div className="text-xs text-text-secondary font-bold uppercase tracking-wider mt-1">Compliant</div>
                </div>
              </div>
            </div>

            {/* Right Column: High-fidelity interactive compiler mockup (Non-Scrollable) */}
            <div className="lg:col-span-6 relative w-full">
              {/* Glow backdrops */}
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-orange-500/10 rounded-3xl blur-3xl opacity-80" />
              
              {/* Simulated Device Window */}
              <div className="relative bg-[#0A0F1D] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-300 font-mono text-xs glow-dark-panel">
                
                {/* Device Title bar */}
                <div className="px-4 py-3 bg-[#0d1527] border-b border-slate-850 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <div className="text-slate-400 text-[10px] font-bold tracking-wider uppercase flex items-center gap-1.5 font-sans">
                    <Terminal size={12} className="text-primary" /> STEM Core Code Sandbox
                  </div>
                  <div className="w-8" />
                </div>

                {/* Navigation Tabs */}
                <div className="flex border-b border-slate-850 bg-[#0d1527]/50 font-sans">
                  <button 
                    onClick={() => setActiveTab('editor')}
                    className={`flex-1 py-3 px-4 text-center font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 border-b-2 ${
                      activeTab === 'editor' 
                        ? 'text-white border-primary bg-[#0A0F1D]' 
                        : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                  >
                    <Code size={13} className="text-primary" /> Python Sandbox
                  </button>
                  <button 
                    onClick={() => setActiveTab('circuit')}
                    className={`flex-1 py-3 px-4 text-center font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 border-b-2 ${
                      activeTab === 'circuit' 
                        ? 'text-white border-primary bg-[#0A0F1D]' 
                        : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                  >
                    <Cpu size={13} className="text-blue-400" /> Sensor Visualizer
                  </button>
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className={`flex-1 py-3 px-4 text-center font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 border-b-2 ${
                      activeTab === 'dashboard' 
                        ? 'text-white border-primary bg-[#0A0F1D]' 
                        : 'text-slate-400 border-transparent hover:text-slate-200'
                    }`}
                  >
                    <BookOpen size={13} className="text-emerald-400" /> Syllabus Progress
                  </button>
                </div>

                {/* Content Screens (Strictly Non-Scrollable, height-constrained) */}
                <div className="p-5 h-[340px] overflow-hidden flex flex-col justify-between select-none">
                  
                  {activeTab === 'editor' && (
                    <div className="flex-1 flex flex-col justify-between h-full">
                      
                      {/* Code Block and Live Telemetry Side-by-Side */}
                      <div className="grid grid-cols-12 gap-4 items-stretch">
                        <div className="col-span-8 space-y-0.5 text-[10.5px] leading-tight text-slate-400">
                          <p className="text-slate-500 font-sans italic mb-1"># Collision Avoidance Loop</p>
                          <p className={`transition-all duration-150 px-1.5 py-0.5 rounded font-mono ${activeLineIdx === 0 ? 'bg-primary/20 text-white font-bold border-l-2 border-primary pl-2' : 'text-purple-400'}`}>
                            while <span className="text-emerald-400">True</span>:
                          </p>
                          <p className={`transition-all duration-150 px-1.5 py-0.5 rounded font-mono ${activeLineIdx === 1 ? 'bg-primary/20 text-white font-bold border-l-2 border-primary pl-2' : 'text-slate-300'}`}>
                            &nbsp;&nbsp;dist = sensor.read()
                          </p>
                          <p className={`transition-all duration-150 px-1.5 py-0.5 rounded font-mono ${activeLineIdx === 2 ? 'bg-primary/20 text-white font-bold border-l-2 border-primary pl-2' : 'text-purple-400'}`}>
                            &nbsp;&nbsp;if <span className="text-slate-300">dist &lt; 15:</span>
                          </p>
                          <p className={`transition-all duration-150 px-1.5 py-0.5 rounded font-mono ${activeLineIdx === 3 ? 'bg-primary/20 text-white font-bold border-l-2 border-primary pl-2' : 'text-red-400'}`}>
                            &nbsp;&nbsp;&nbsp;&nbsp;robot.stop()
                          </p>
                          <p className={`transition-all duration-150 px-1.5 py-0.5 rounded font-mono ${activeLineIdx === 4 ? 'bg-primary/20 text-white font-bold border-l-2 border-primary pl-2' : 'text-teal-400'}`}>
                            &nbsp;&nbsp;&nbsp;&nbsp;robot.turn_left()
                          </p>
                          <p className={`transition-all duration-150 px-1.5 py-0.5 rounded font-mono ${activeLineIdx === 5 ? 'bg-primary/20 text-white font-bold border-l-2 border-primary pl-2' : 'text-purple-400'}`}>
                            &nbsp;&nbsp;else:
                          </p>
                          <p className={`transition-all duration-150 px-1.5 py-0.5 rounded font-mono ${activeLineIdx === 6 ? 'bg-primary/20 text-white font-bold border-l-2 border-primary pl-2' : 'text-emerald-400'}`}>
                            &nbsp;&nbsp;&nbsp;&nbsp;robot.drive(80)
                          </p>
                        </div>

                        {/* Interactive Telemetry Indicator */}
                        <div className="col-span-4 bg-slate-950/80 border border-slate-850 rounded-xl p-3 flex flex-col justify-between text-center font-sans">
                          <div>
                            <span className="text-[8px] text-slate-500 uppercase tracking-widest font-bold">Ultrasonic D2</span>
                            <div className="text-lg font-black text-white font-mono mt-1 transition-all duration-300">
                              {telemetryDistance} <span className="text-xs font-normal text-slate-400">cm</span>
                            </div>
                          </div>
                          
                          <div className="my-2">
                            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 rounded-full ${isAlertActive ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} 
                                style={{ width: `${Math.min((telemetryDistance / 50) * 100, 100)}%` }}
                              />
                            </div>
                          </div>

                          <div className="h-6 flex items-center justify-center">
                            {isAlertActive ? (
                              <span className="text-[7.5px] text-red-400 bg-red-950/60 border border-red-900/60 px-1.5 py-0.5 rounded-md font-bold animate-pulse">
                                OBSTACLE ALERT
                              </span>
                            ) : (
                              <span className="text-[7.5px] text-emerald-400 bg-emerald-950/60 border border-emerald-900/60 px-1.5 py-0.5 rounded-md font-bold">
                                PATH CLEAR
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Compiler Sandbox console */}
                      <div className="pt-3 border-t border-slate-850 flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] text-slate-500 uppercase tracking-widest font-sans font-semibold">Wandbox Logs</span>
                          <button 
                            onClick={startSimulation}
                            disabled={isRunning}
                            className="px-3.5 py-1.5 bg-primary text-white font-sans font-bold rounded-lg text-[9px] flex items-center gap-1.5 transition-all shadow-md hover:bg-primary-hover active:scale-95 disabled:opacity-50"
                          >
                            <Play size={10} fill="currentColor" /> {isRunning ? 'Running...' : 'Run Simulation'}
                          </button>
                        </div>
                        
                        <div className="h-14 bg-slate-950/60 rounded-lg p-2 border border-slate-850 overflow-hidden text-[9px] font-mono select-none flex flex-col justify-end">
                          {terminalOutput.length === 0 ? (
                            <span className="text-slate-600 italic pb-1">Idle. Click 'Run Simulation' to test compiler logs.</span>
                          ) : (
                            terminalOutput.slice(-3).map((line, idx) => {
                              const isWarn = line && typeof line === 'string' && line.includes('[WARNING]');
                              const isSys = line && typeof line === 'string' && line.includes('[SYSTEM]');
                              return (
                                <div key={idx} className={isWarn ? 'text-amber-400' : isSys ? 'text-slate-500' : 'text-emerald-400'}>
                                  {line}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'circuit' && (
                    <div className="flex-1 flex flex-col justify-center items-center h-full py-4 text-center">
                      <svg className="w-56 h-32 mb-4 drop-shadow-md" viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="200" height="120" rx="8" fill="#13233E" stroke="#1E293B" strokeWidth="2"/>
                        <rect x="10" y="5" width="180" height="10" rx="2" fill="#0A0F1D"/>
                        {Array.from({length: 12}).map((_, i) => (
                          <circle key={i} cx={22 + i*14} cy={10} r="2.5" fill="#D97706" className="animate-sensor-pulse" style={{ animationDelay: `${i * 150}ms` }} />
                        ))}
                        <rect x="75" y="35" width="50" height="50" rx="4" fill="#0A0F1D" stroke="#334155" />
                        <text x="100" y="60" fill="#94A3B8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">STEM</text>
                        <text x="100" y="72" fill="#ea580c" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">CORE</text>
                        <circle cx="20" cy="100" r="3" fill="#10B981" className="animate-ping" />
                        <circle cx="20" cy="100" r="3" fill="#10B981" />
                        <text x="30" y="103" fill="#64748B" fontSize="6.5" fontFamily="sans-serif">PWR</text>
                        <circle cx="55" cy="100" r="3" fill="#3B82F6" className="animate-pulse" />
                        <text x="65" y="103" fill="#64748B" fontSize="6.5" fontFamily="sans-serif">RX/TX</text>
                        <rect x="140" y="80" width="50" height="30" rx="2" fill="#0A0F1D" />
                        <text x="165" y="98" fill="#F8FAFC" fontSize="7" textAnchor="middle">ANALOG INPUT</text>
                      </svg>
                      
                      <div className="space-y-1">
                        <p className="text-slate-200 text-sm font-semibold font-sans">Embedded Sensor Mapping</p>
                        <p className="text-slate-400 text-[11px] font-sans max-w-sm leading-relaxed mx-auto">
                          Our student simulator supports real-time readings from temperature, infrared, gas, and ultrasonic sensor pins, helping students design breadboard circuits virtually.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'dashboard' && (
                    <div className="flex-1 flex flex-col justify-between h-full font-sans">
                      <div className="flex justify-between items-center bg-[#0d1527] p-3 rounded-xl border border-slate-850">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs animate-pulse">SB</div>
                          <div>
                            <p className="text-xs text-white font-bold">STEAMVERSE: Level 2</p>
                            <p className="text-[9px] text-slate-500">Unit: Microcontroller Pin Configurations</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">80% Mastered</span>
                        </div>
                      </div>

                      <div className="space-y-2 mt-4 flex-1">
                        <div className="flex items-center justify-between text-[11px] p-2 bg-[#0A0F1D] border border-slate-850 rounded-lg">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={14} className="text-emerald-500" />
                            <span className="text-slate-300">1. Connecting Breadboards and Resistors</span>
                          </div>
                          <span className="text-[9px] text-slate-500 font-mono">15 mins</span>
                        </div>

                        <div className="flex items-center justify-between text-[11px] p-2 bg-[#0A0F1D] border border-slate-850 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-3.5 h-3.5 rounded-full border-2 border-primary flex items-center justify-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            </div>
                            <span className="text-white font-bold">2. Lab Assignment: Smart Streetlight Model</span>
                          </div>
                          <span className="text-[9px] text-primary font-bold animate-pulse">ACTIVE</span>
                        </div>
                      </div>

                      <button 
                        onClick={() => navigate('/login')}
                        className="w-full mt-4 py-2.5 bg-gradient-to-r from-primary to-orange-500 text-white font-bold text-xs rounded-xl shadow-lg hover:brightness-110 active:scale-95 transition-all text-center flex items-center justify-center gap-1"
                      >
                        Enter Course Viewer <ChevronRight size={14} />
                      </button>
                    </div>
                  )}

                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 3. Core Features - High-Fidelity Details (Wider Screen) */}
      <section className="py-20 bg-white border-y border-slate-200">
        <div className="max-w-[90%] mx-auto">
          
          <div className="max-w-3xl mb-16 space-y-4 text-left">
            <span className="px-3.5 py-1 bg-orange-100 text-primary text-xs font-bold uppercase tracking-widest rounded-full">
              Why STEMmantra LMS?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary font-outfit tracking-tight">
              An Educational Portal Built for Real Physical Lab Computing
            </h2>
            <p className="text-text-secondary text-base">
              Standard LMS platforms fail to support robotics education. We engineered a system that brings physical computing directly into the learning dashboard.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-primary/30 hover:shadow-premium hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-primary mb-6 transition-transform group-hover:scale-105">
                <BookOpen size={24} />
              </div>
              <h3 className="text-lg font-bold text-text-primary font-outfit mb-3">Structured K-12 Syllabus</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Step-by-step modular lessons aligned with CBSE, ICSE, and international frameworks. Lessons are organized into core conceptual, hands-on construction, and testing modules.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-primary/30 hover:shadow-premium hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6 transition-transform group-hover:scale-105">
                <Terminal size={24} />
              </div>
              <h3 className="text-lg font-bold text-text-primary font-outfit mb-3">Compiler Simulation Integrations</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Integrated Python & C++ compilers running on remote sandboxes. Students can test variables, loop functions, and custom sensor thresholds inside the browser dashboard.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#F8FAFC] border border-slate-200 hover:border-primary/30 hover:shadow-premium hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 mb-6 transition-transform group-hover:scale-105">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-text-primary font-outfit mb-3">Secure Document Viewer</h3>
              <p className="text-text-secondary text-sm leading-relaxed">
                Prevents unauthorized print requests and screenshot downloads, protecting proprietary textbook PDF pages and secure lab sheets for partner schools.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. Specialist Lab Showcase - Interactive Double-Sided Showcase (No spacing gaps) */}
      <section className="py-24 bg-[#F8FAFC] border-b border-slate-200">
        <div className="max-w-[90%] mx-auto">
          
          <div className="max-w-3xl mb-16 space-y-4 text-left">
            <span className="px-3.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-widest rounded-full">
              Core Labs
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary font-outfit">
              Review Our Five Specialized Robotics & AI Labs
            </h2>
            <p className="text-text-secondary text-base">
              STEMmantra delivers customized physical hardware sets to schools. Use the interactive menu below to inspect each program's details and active syllabus.
            </p>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Column: Interactive Tabs */}
            <div className="lg:col-span-4 flex flex-col justify-between gap-3">
              {programs.map((prog) => (
                <button
                  key={prog.id}
                  onClick={() => setActiveProgram(prog.id)}
                  className={`w-full text-left p-5 rounded-xl border transition-all duration-300 flex items-center justify-between group ${
                    activeProgram === prog.id 
                      ? 'bg-[#0A0F1D] text-white border-transparent shadow-glow-orange translate-x-1.5' 
                      : 'bg-white text-text-primary border-slate-200 hover:border-slate-350 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-xl transition-colors ${
                      activeProgram === prog.id ? 'bg-primary text-white' : 'bg-orange-50 text-primary'
                    }`}>
                      {prog.icon}
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{prog.name}</p>
                      <p className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${
                        activeProgram === prog.id ? 'text-primary' : 'text-text-secondary'
                      }`}>{prog.grades}</p>
                    </div>
                  </div>
                  <ChevronRight size={16} className={activeProgram === prog.id ? 'text-primary' : 'text-slate-400 group-hover:translate-x-0.5 transition-transform'} />
                </button>
              ))}
            </div>

            {/* Right Column: High Fidelity Simulator Panel specific to active lab */}
            <div className="lg:col-span-8 flex">
              {(() => {
                const prog = programs.find(p => p.id === activeProgram) || programs[1];
                return (
                  <div className="w-full bg-white border border-slate-200 rounded-2xl p-8 sm:p-10 shadow-premium flex flex-col justify-between transition-all duration-300">
                    
                    <div className="space-y-6">
                      
                      {/* Badge / Info Header */}
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <span className={`px-3 py-1 bg-gradient-to-r ${prog.color} text-white text-[10px] font-extrabold tracking-widest rounded-full uppercase`}>
                          {prog.badge}
                        </span>
                        <div className="flex items-center gap-1.5 text-text-secondary text-sm font-semibold">
                          <Users size={16} className="text-primary" /> {prog.grades}
                        </div>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-extrabold text-text-primary font-outfit text-left">
                        {prog.name}
                      </h3>
                      
                      <p className="text-text-secondary text-sm sm:text-base leading-relaxed text-left">
                        {prog.description}
                      </p>

                      {/* Interactive Visual Element depending on Active Program */}
                      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                        
                        {prog.id === 'pre-tinkering' && (
                          <div className="space-y-4">
                            
                            {/* Live Slider Controller */}
                            <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-2.5 shadow-sm">
                              <span className="text-[10px] font-extrabold text-slate-555 uppercase tracking-wide">Simulated Light Sensor Input:</span>
                              <div className="flex items-center gap-3">
                                <input 
                                  type="range" 
                                  min="0" 
                                  max="100" 
                                  value={preTinkerLightValue} 
                                  onChange={(e) => setPreTinkerLightValue(Number(e.target.value))}
                                  className="w-20 sm:w-28 accent-amber-500 cursor-pointer h-1.5 bg-slate-100 rounded-lg appearance-none" 
                                />
                                <span className="text-xs font-mono font-extrabold text-slate-700 w-12 text-right">{preTinkerLightValue} lm</span>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-3">
                              
                              {/* Block 1: Event block */}
                              <div className={`relative flex items-center bg-amber-500 text-white rounded-r-lg border-l-[6px] border-amber-600 shadow-sm pl-4 pr-5 py-2 font-mono text-[11px] font-extrabold select-none transition-all duration-200 ${preTinkerLightValue < 50 ? 'ring-2 ring-amber-400' : 'opacity-60'}`}>
                                <div className="absolute top-1/2 -left-[4px] w-2 h-4 bg-amber-600 rounded-r-full -translate-y-1/2" />
                                <span className="mr-1.5 text-[9px] uppercase bg-amber-600 px-1 py-0.5 rounded">EVENT</span>
                                [WHEN] Light &lt; 50 lm
                              </div>

                              <div className="hidden sm:block text-slate-350 font-bold">➡️</div>

                              {/* Block 2: Action block */}
                              <div className={`relative flex items-center rounded-r-lg border-l-[6px] shadow-sm pl-4 pr-5 py-2 font-mono text-[11px] font-extrabold select-none transition-all duration-300 ${preTinkerLightValue < 50 ? 'bg-blue-500 text-white border-blue-600 animate-pulse-glow font-bold' : 'bg-slate-200 text-slate-400 border-slate-300'}`}>
                                <div className="absolute top-1/2 -left-[4px] w-2 h-4 rounded-r-full -translate-y-1/2 bg-blue-600" />
                                <span className={`mr-1.5 text-[9px] uppercase px-1 py-0.5 rounded ${preTinkerLightValue < 50 ? 'bg-blue-600' : 'bg-slate-300'}`}>ACTION</span>
                                Set LED to {preTinkerLightValue < 50 ? 'HIGH' : 'LOW'}
                              </div>

                              <div className="hidden sm:block text-slate-350 font-bold">➡️</div>

                              {/* Block 3: Control block */}
                              <div className={`relative flex items-center bg-emerald-500 text-white rounded-r-lg border-l-[6px] border-emerald-600 shadow-sm pl-4 pr-5 py-2 font-mono text-[11px] font-extrabold select-none transition-all duration-200 ${preTinkerLightValue < 50 ? 'opacity-100' : 'opacity-55'}`}>
                                <div className="absolute top-1/2 -left-[4px] w-2 h-4 bg-emerald-600 rounded-r-full -translate-y-1/2" />
                                <span className="mr-1.5 text-[9px] uppercase bg-emerald-600 px-1 py-0.5 rounded">CTRL</span>
                                Delay 1000 ms
                              </div>

                            </div>
                          </div>
                        )}

                        {prog.id === 'steamverse' && (
                          <div className="space-y-3">
                            <div className="flex flex-wrap justify-between items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-left">Live IoT Sensor Node Dashboard</span>
                              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
                                <span className="text-[9px] font-bold text-slate-500 px-2">Motor Speed:</span>
                                {['OFF', 'LOW', 'HIGH'].map((speed) => (
                                  <button
                                    key={speed}
                                    onClick={() => setSteamverseMotorSpeed(speed as any)}
                                    className={`px-2 py-0.5 text-[9px] font-extrabold rounded transition-all ${steamverseMotorSpeed === speed ? 'bg-primary text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}
                                  >
                                    {speed}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
                              
                              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Temp Sensor</span>
                                <div className="flex items-baseline justify-between mt-1">
                                  <span className="text-sm font-extrabold text-slate-700 font-mono">{steamverseMetrics.temp} °C</span>
                                  <span className="text-[8px] text-blue-500 font-semibold animate-pulse">Ticking</span>
                                </div>
                                <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                  <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${Math.min((steamverseMetrics.temp / 40) * 100, 100)}%` }} />
                                </div>
                              </div>

                              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-teal-200 transition-colors">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Soil Moisture</span>
                                <div className="flex items-baseline justify-between mt-1">
                                  <span className="text-sm font-extrabold text-slate-700 font-mono">{steamverseMetrics.moisture} %</span>
                                  <span className="text-[8px] text-teal-500 font-semibold">Active</span>
                                </div>
                                <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                  <div className="h-full bg-teal-500 transition-all duration-300" style={{ width: `${steamverseMetrics.moisture}%` }} />
                                </div>
                              </div>

                              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-emerald-200 transition-colors">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">Gas Sensor</span>
                                <div className="flex items-center gap-1.5 mt-2">
                                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-glow text-emerald-500" />
                                  <span className="text-[10px] font-extrabold text-slate-700">SAFE ENVIRONMENT</span>
                                </div>
                              </div>

                              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-orange-200 transition-colors">
                                <span className="text-[9px] font-bold text-slate-400 uppercase block">DC Gearbox Motor</span>
                                <div className="flex items-baseline justify-between mt-1">
                                  <span className="text-sm font-extrabold text-orange-600 font-mono">{steamverseMetrics.rpm} RPM</span>
                                  <span className={`text-[8px] font-semibold ${steamverseMotorSpeed === 'OFF' ? 'text-slate-400' : 'text-orange-500 animate-pulse'}`}>{steamverseMotorSpeed === 'OFF' ? 'Stopped' : 'Running'}</span>
                                </div>
                                <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                  <div className="h-full bg-orange-500 transition-all duration-300" style={{ width: `${Math.min((steamverseMetrics.rpm / 120) * 100, 100)}%` }} />
                                </div>
                              </div>

                            </div>
                          </div>
                        )}

                        {prog.id === 'ai-coding' && (
                          <div className="flex flex-col md:flex-row items-center gap-6 text-left">
                            
                            {/* Immersive Face Tracker camera container */}
                            <div className="relative w-full md:w-44 h-24 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-between p-2 overflow-hidden shadow-inner shrink-0">
                              {/* Video Grid overlay */}
                              <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                              
                              {/* Target scanning vertical line */}
                              <div className="absolute left-0 w-full h-[1.5px] bg-emerald-500/80 shadow-[0_0_6px_#10b981] animate-scan-line pointer-events-none" />
                              
                              {/* Reticle Viewfinder corners */}
                              <div className="absolute top-1.5 left-1.5 border-t border-l border-slate-700 w-2.5 h-2.5" />
                              <div className="absolute top-1.5 right-1.5 border-t border-r border-slate-700 w-2.5 h-2.5" />
                              <div className="absolute bottom-1.5 left-1.5 border-b border-l border-slate-700 w-2.5 h-2.5" />
                              <div className="absolute bottom-1.5 right-1.5 border-b border-r border-slate-700 w-2.5 h-2.5" />
                              
                              <div className="flex justify-between items-center z-10">
                                <span className="text-[6.5px] text-emerald-400 font-mono font-bold uppercase flex items-center gap-1 bg-emerald-950/60 border border-emerald-900/40 px-1 rounded">
                                  <span className="w-1 h-1 bg-emerald-500 rounded-full animate-ping" /> OpenCV Live
                                </span>
                                <span className="text-[6px] text-slate-500 font-mono">60 FPS</span>
                              </div>

                              {/* Bounding box tracking state coordinates */}
                              <div 
                                className="absolute border border-emerald-400 bg-emerald-400/5 rounded transition-all duration-300 flex flex-col justify-end"
                                style={{ 
                                  width: aiTrackingTarget === 'Face' ? '54px' : aiTrackingTarget === 'Drone' ? '68px' : '40px', 
                                  height: aiTrackingTarget === 'Face' ? '42px' : aiTrackingTarget === 'Drone' ? '30px' : '36px', 
                                  left: `${Math.max(20, Math.min(100, aiCoords.x - 80))}px`, 
                                  top: `${Math.max(12, Math.min(45, aiCoords.y - 50))}px` 
                                }}
                              >
                                <span className="absolute -top-3.5 left-0 text-[5px] text-emerald-400 font-mono bg-slate-950 px-1 border border-emerald-400/20 rounded uppercase">
                                  {aiTrackingTarget}: 98%
                                </span>
                              </div>

                              <div className="flex justify-between items-center z-10 text-[6.5px] text-slate-500 font-mono">
                                <span>COORD: X:{aiCoords.x} Y:{aiCoords.y}</span>
                                <span className="text-emerald-400 font-bold uppercase">Locked</span>
                              </div>

                            </div>

                            <div className="space-y-2 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wide">Tracking Target:</span>
                                <div className="flex gap-1.5">
                                  {['Face', 'Drone', 'Arduino'].map((target) => (
                                    <button
                                      key={target}
                                      onClick={() => setAiTrackingTarget(target as any)}
                                      className={`px-2.5 py-0.5 text-[9px] font-extrabold border rounded transition-all ${aiTrackingTarget === target ? 'bg-primary text-white border-primary shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                    >
                                      {target}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs font-bold text-slate-700 font-outfit">OpenCV Object Tracking Simulation</p>
                              <p className="text-[11px] text-slate-500 leading-relaxed">
                                Students write Python scripts employing OpenCV libraries to detect colors, identify shapes, and process facial bounding boxes in real-time, mapping camera inputs to custom logic blocks.
                              </p>
                            </div>
                          </div>
                        )}

                        {prog.id === 'innoverse' && (
                          <div className="flex flex-col gap-4 text-left w-full">
                            <div className="flex flex-wrap items-center justify-between gap-4">
                              <div>
                                <p className="text-xs font-bold text-slate-800 font-outfit">CBSE / ICSE Board Alignment Panel</p>
                                <p className="text-[11px] text-slate-500 mt-0.5">Map lesson plans and student portfolios dynamically to standard textbook structures.</p>
                              </div>
                              <button
                                onClick={startInnoverseSync}
                                disabled={innoverseSyncState === 'syncing'}
                                className="px-4 py-2 bg-[#0A0F1D] text-white hover:bg-slate-800 disabled:bg-slate-400 font-bold rounded-lg text-[10px] tracking-wide uppercase transition-all shadow-sm flex items-center gap-1.5"
                              >
                                {innoverseSyncState === 'syncing' ? 'Syncing...' : 'Sync Curriculum'}
                              </button>
                            </div>

                            <div className="grid sm:grid-cols-3 gap-3">
                              
                              {/* Subject card 1 */}
                              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase">Grade 6 Science</span>
                                  <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold">100% Synced</span>
                                </div>
                                <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                                </div>
                              </div>

                              {/* Subject card 2 */}
                              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase">Grade 8 Physics</span>
                                  <span className="text-[8px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold">100% Synced</span>
                                </div>
                                <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                  <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
                                </div>
                              </div>

                              {/* Subject card 3 */}
                              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                                <div className="flex justify-between items-center">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase">Grade 10 Coding</span>
                                  <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ${innoverseSyncState === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                                    {innoverseProgress}% {innoverseSyncState === 'completed' ? 'Completed' : 'Syncing'}
                                  </span>
                                </div>
                                <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                  <div className="h-full bg-primary transition-all duration-150" style={{ width: `${innoverseProgress}%` }} />
                                </div>
                              </div>

                            </div>

                            {/* Sync progress telemetry bar */}
                            {innoverseSyncState === 'syncing' && (
                              <div className="w-full bg-slate-100 border border-slate-200/60 rounded-lg p-2.5 flex items-center justify-between text-[10px] font-mono text-slate-650">
                                <span className="flex items-center gap-1.5">
                                  <span className="w-2 h-2 bg-primary rounded-full animate-ping" /> Alignment mapping: Grade 10 logic streams...
                                </span>
                                <span>{innoverseProgress}%</span>
                              </div>
                            )}

                            {innoverseSyncState === 'completed' && (
                              <div className="w-full bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 flex items-center gap-2 text-[11px] text-emerald-800 font-semibold">
                                <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                                All curriculum components are 100% mapped to NEP 2020 and CBSE/ICSE Board parameters.
                              </div>
                            )}

                          </div>
                        )}

                        {prog.id === 'atl-lab' && (
                          <div className="space-y-4">
                            <div className="flex flex-wrap justify-between items-center gap-3">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-left">NITI Aayog Compliance Milestones</span>
                              <button
                                onClick={startAtlValidation}
                                disabled={atlSyncState === 'syncing'}
                                className="px-3.5 py-1.5 bg-[#0A0F1D] text-white hover:bg-slate-800 disabled:bg-slate-400 font-bold rounded-lg text-[9px] uppercase tracking-wide transition-all shadow-sm"
                              >
                                {atlSyncState === 'syncing' ? 'Validating...' : 'Validate Compliance'}
                              </button>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                              
                              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-center items-center gap-1.5">
                                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                  <Check size={12} strokeWidth={3} />
                                </div>
                                <span className="text-[9px] text-slate-700 font-extrabold uppercase tracking-wide">1. Equipment Setup</span>
                              </div>

                              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-center items-center gap-1.5">
                                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                  <Check size={12} strokeWidth={3} />
                                </div>
                                <span className="text-[9px] text-slate-700 font-extrabold uppercase tracking-wide">2. Syllabus Sync</span>
                              </div>

                              <div className="p-3 bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col justify-center items-center gap-1.5">
                                <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                  <Check size={12} strokeWidth={3} />
                                </div>
                                <span className="text-[9px] text-slate-700 font-extrabold uppercase tracking-wide">3. Trainer Mapping</span>
                              </div>

                              <div className={`p-3 rounded-xl shadow-sm flex flex-col justify-center items-center gap-1.5 border transition-all duration-300 ${atlSyncState === 'completed' ? 'bg-white border-slate-200' : 'bg-orange-50/50 border-primary/20'}`}>
                                {atlSyncState === 'syncing' ? (
                                  <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin my-0.5" />
                                ) : (
                                  <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500">
                                    <Check size={12} strokeWidth={3} />
                                  </div>
                                )}
                                <span className="text-[9px] text-slate-700 font-extrabold uppercase tracking-wide">4. ATL Submission</span>
                              </div>

                            </div>
                          </div>
                        )}

                      </div>

                      <div className="grid md:grid-cols-2 gap-6 pt-2 text-left">
                        {/* Outcomes */}
                        <div>
                          <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-3">
                            LMS CURRICULUM POINTS
                          </h4>
                          <div className="space-y-2.5">
                            {prog.features.map((feat, idx) => (
                              <div key={idx} className="flex items-start gap-2.5">
                                <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                                  <Check size={12} className="text-emerald-600" />
                                </div>
                                <span className="text-xs text-text-secondary font-medium leading-normal">{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Syllabus */}
                        <div className="p-5 bg-[#F8FAFC] border border-slate-200/80 rounded-xl">
                          <h4 className="text-xs font-bold text-text-primary uppercase tracking-widest mb-3">
                            SAMPLE LAB SYLLABUS
                          </h4>
                          <div className="space-y-2">
                            {prog.mockSyllabus.map((module, idx) => (
                              <div key={idx} className="flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                <span className="text-xs text-text-secondary font-semibold">{module}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <p className="text-xs text-text-secondary font-medium text-left">
                        Need help matching hardware modules? Consult the coordinator.
                      </p>
                      <button 
                        onClick={() => navigate('/login')}
                        className="w-full sm:w-auto px-6 py-3 bg-[#0A0F1D] text-white font-bold rounded-xl text-xs hover:bg-[#13233E] transition-all flex items-center justify-center gap-2 group"
                      >
                        Enter Course Catalog
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform text-primary" />
                      </button>
                    </div>

                  </div>
                );
              })()}
            </div>

          </div>

        </div>
      </section>

      {/* 5. 8-Step School Deployment Lifecycle Timeline - Correctly Aligned, Left-to-Right Flow */}
      <section className="py-20 bg-white">
        <div className="max-w-[90%] mx-auto font-sans">
          
          <div className="max-w-3xl mb-16 space-y-4 text-left">
            <span className="px-3.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-widest rounded-full">
              Deploy Timeline
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary font-outfit">
              Turn-Key Deployments In 8 Sequential Stages
            </h2>
            <p className="text-text-secondary text-base">
              From physical electronics provisioning to online curriculum compiler logins, here is our deployment pipeline:
            </p>
          </div>

          {/* Timeline Linear Row Grid (Left-to-Right reading flow) */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
            
            {/* Step 01 */}
            <div className="p-6 bg-[#F8FAFC] border border-slate-200 rounded-xl relative stage-card group">
              <span className="absolute -top-3.5 left-5 px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-extrabold text-primary tracking-wider uppercase">Stage 01</span>
              <h4 className="font-bold text-sm text-text-primary font-outfit mt-2 mb-1.5 text-left">Needs Assessment</h4>
              <p className="text-xs text-text-secondary leading-relaxed text-left">Assessing grade levels and existing lab hardware infrastructure.</p>
            </div>

            {/* Step 02 */}
            <div className="p-6 bg-[#F8FAFC] border border-slate-200 rounded-xl relative stage-card group">
              <span className="absolute -top-3.5 left-5 px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-extrabold text-primary tracking-wider uppercase">Stage 02</span>
              <h4 className="font-bold text-sm text-text-primary font-outfit mt-2 mb-1.5 text-left">Lab Proposal</h4>
              <p className="text-xs text-text-secondary leading-relaxed text-left">Designing layout models and selecting microchip kits required.</p>
            </div>

            {/* Step 03 */}
            <div className="p-6 bg-[#F8FAFC] border border-slate-200 rounded-xl relative stage-card group">
              <span className="absolute -top-3.5 left-5 px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-extrabold text-primary tracking-wider uppercase">Stage 03</span>
              <h4 className="font-bold text-sm text-text-primary font-outfit mt-2 mb-1.5 text-left">MoU Agreement</h4>
              <p className="text-xs text-text-secondary leading-relaxed text-left">Defining academic terms, hardware ownership, and session timings.</p>
            </div>

            {/* Step 04 */}
            <div className="p-6 bg-[#F8FAFC] border border-slate-200 rounded-xl relative stage-card group">
              <span className="absolute -top-3.5 left-5 px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-extrabold text-primary tracking-wider uppercase">Stage 04</span>
              <h4 className="font-bold text-sm text-text-primary font-outfit mt-2 mb-1.5 text-left">Curriculum Sync</h4>
              <p className="text-xs text-text-secondary leading-relaxed text-left">Mapping textbook chapters directly to school board terms.</p>
            </div>

            {/* Step 05 */}
            <div className="p-6 bg-[#F8FAFC] border border-slate-200 rounded-xl relative stage-card group">
              <span className="absolute -top-3.5 left-5 px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-extrabold text-primary tracking-wider uppercase">Stage 05</span>
              <h4 className="font-bold text-sm text-text-primary font-outfit mt-2 mb-1.5 text-left">LMS Portal Access</h4>
              <p className="text-xs text-text-secondary leading-relaxed text-left">Generating school student credentials and starting remote sandbox compilers.</p>
            </div>

            {/* Step 06 */}
            <div className="p-6 bg-[#F8FAFC] border border-slate-200 rounded-xl relative stage-card group">
              <span className="absolute -top-3.5 left-5 px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-extrabold text-primary tracking-wider uppercase">Stage 06</span>
              <h4 className="font-bold text-sm text-text-primary font-outfit mt-2 mb-1.5 text-left">Physical Kit Delivery</h4>
              <p className="text-xs text-text-secondary leading-relaxed text-left">Deploying sensors, breadboards, 3D printers, and robotics boxes.</p>
            </div>

            {/* Step 07 */}
            <div className="p-6 bg-[#F8FAFC] border border-slate-200 rounded-xl relative stage-card group">
              <span className="absolute -top-3.5 left-5 px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-extrabold text-primary tracking-wider uppercase">Stage 07</span>
              <h4 className="font-bold text-sm text-text-primary font-outfit mt-2 mb-1.5 text-left">Student Diagnostics</h4>
              <p className="text-xs text-text-secondary leading-relaxed text-left">Evaluating code submissions and tracking lessons viewed.</p>
            </div>

            {/* Step 08 */}
            <div className="p-6 bg-[#F8FAFC] border border-slate-200 rounded-xl relative stage-card group">
              <span className="absolute -top-3.5 left-5 px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[9px] font-extrabold text-primary tracking-wider uppercase">Stage 08</span>
              <h4 className="font-bold text-sm text-text-primary font-outfit mt-2 mb-1.5 text-left">Innovation Support</h4>
              <p className="text-xs text-text-secondary leading-relaxed text-left">Guiding students for national science marathons and regional awards.</p>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Portal Access CTA - Dark High-Contrast Workspace */}
      <section className="py-20 bg-[#0A0F1D] text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-[90%] mx-auto text-center relative z-10 space-y-6">
          <div className="w-14 h-14 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary mx-auto">
            <ShieldCheck size={28} />
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-outfit">
            Access The Secure Portal Gateway
          </h2>
          
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            School administrators, students, and coordinators can sign in using their registration IDs. Contact your school lab program lead if you need key setup credentials.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button 
              onClick={() => navigate('/login')} 
              className="w-full sm:w-auto px-8 py-4 bg-primary text-white font-bold rounded-xl shadow-xl shadow-primary/20 hover:bg-primary-hover hover:-translate-y-1 active:translate-y-0 transition-all duration-300 flex items-center justify-center gap-2 group text-sm"
            >
              Sign In to LMS Portal
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <a 
              href="https://wa.me/916356631515"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 text-slate-300 hover:text-white font-semibold rounded-xl hover:bg-slate-850 hover:border-slate-700 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
            >
              <Phone size={14} className="text-green-500" /> WhatsApp Direct Support
            </a>
          </div>

          <p className="text-slate-600 text-xs">
            Secured and Monitored Environment. Unauthorized attempts will be logged automatically.
          </p>
        </div>
      </section>

      {/* 7. Footer Section - Noida coordinates */}
      <footer className="bg-[#030712] border-t border-slate-950 text-slate-400 py-16">
        <div className="max-w-[90%] mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 pb-12 border-b border-slate-900">
            
            <div className="md:col-span-5 flex flex-col gap-4 text-left">
              <img 
                src="/logo.png" 
                alt="STEMmantra Logo" 
                className="h-10 w-auto object-contain self-start"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <p className="text-sm leading-relaxed max-w-sm font-light text-slate-400">
                India's leading provider of turn-key Robotics, Artificial Intelligence, Coding, and STEM Laboratory ecosystems for K-12 educational institutions.
              </p>
            </div>

            <nav className="md:col-span-3 text-left">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Quick Redirects</h4>
              <ul className="space-y-2.5 text-sm font-semibold">
                <li>
                  <a href="https://stemmantra.com/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                    STEMmantra Corporate <ExternalLink size={12} />
                  </a>
                </li>
                <li>
                  <a href="https://stemmantra.com/programs" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                    About Programs <ExternalLink size={12} />
                  </a>
                </li>
                <li>
                  <a href="https://stemmantra.com/about" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                    Innovation Labs <ExternalLink size={12} />
                  </a>
                </li>
                <li>
                  <a href="https://stemmantra.com/career" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                    Career Opportunities <ExternalLink size={12} />
                  </a>
                </li>
              </ul>
            </nav>

            <div className="md:col-span-4 text-left space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-widest">Noida Headquarters</h4>
              
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={18} className="text-primary shrink-0 mt-0.5" />
                <span>
                  C-104, 2nd Floor, Sector-10, Noida, <br />
                  Uttar Pradesh – 201301
                </span>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <Mail size={18} className="text-primary shrink-0" />
                <a href="mailto:sales@stemmantra.com" className="hover:text-primary transition-colors">
                  sales@stemmantra.com
                </a>
              </div>

              <div className="flex flex-col gap-1 text-sm pl-7">
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-slate-500" />
                  <span>Helpline: +91-6356631515</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-slate-500" />
                  <span>Landline: 0120-3101774</span>
                </div>
              </div>
            </div>

          </div>

          <div className="pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <p>&copy; {new Date().getFullYear()} STEMmantra. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="https://stemmantra.com/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="https://stemmantra.com/terms-of-service" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="https://stemmantra.com/refund-policy" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Refund Policy</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
