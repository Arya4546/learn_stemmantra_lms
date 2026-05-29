import React, { useState } from 'react';
import { LandingHeader } from '../../components/layout/LandingHeader';
import { LandingFooter } from '../../components/layout/LandingFooter';
import { MapPin, Mail, Phone, ExternalLink, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    schoolName: '',
    subject: '',
    message: '',
    role: 'Principal'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message || !formData.schoolName) {
      toast.error('Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Your message was sent successfully! Our team will contact you shortly.');
      setFormData({
        name: '',
        email: '',
        phone: '',
        schoolName: '',
        subject: '',
        message: '',
        role: 'Principal'
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans antialiased text-[#0F172A] selection:bg-primary selection:text-white grid-pattern flex flex-col">
      <LandingHeader />

      {/* Main Content Area */}
      <main className="flex-grow pt-12 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[90%] mx-auto space-y-16">
          
          {/* Header */}
          <section className="text-left space-y-4 max-w-4xl pt-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-bold text-xs uppercase tracking-wider animate-float">
              <Sparkles size={14} /> Connect With Us
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-text-primary tracking-tight leading-[1.1] font-outfit">
              Get in Touch with STEMmantra
            </h1>
            <p className="text-base text-text-secondary leading-relaxed max-w-2xl">
              Have questions about setting up a laboratory or mapping curriculum? Send us a message or contact our helpline directly.
            </p>
          </section>

          {/* Form & Coordinates Section */}
          <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Contact Form: Col 7 */}
            <div className="lg:col-span-7 bg-white border border-slate-200/80 shadow-premium rounded-3xl p-8 space-y-6">
              <div className="text-left">
                <h2 className="text-2xl font-bold text-text-primary font-outfit">Submit an Inquiry</h2>
                <p className="text-xs text-text-secondary">All fields marked with * are required.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Name *</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your Full Name"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email *</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@school.com"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Designation / Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                    >
                      <option value="Principal">School Principal / Director</option>
                      <option value="Teacher">STEM / Science Teacher</option>
                      <option value="Trustee">School Trustee / Chairman</option>
                      <option value="Student">Student / Parent</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">School Name *</label>
                  <input 
                    type="text" 
                    name="schoolName"
                    required
                    value={formData.schoolName}
                    onChange={handleChange}
                    placeholder="Enter full school name with city"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Subject</label>
                  <input 
                    type="text" 
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Setting up Atal Tinkering Lab"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Message *</label>
                  <textarea 
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Provide details about your query..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    'Sending Message...'
                  ) : (
                    <>
                      Send Message <Send size={14} />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Coordinates and Info: Col 5 */}
            <div className="lg:col-span-5 space-y-6 text-left">
              
              {/* Main HQ Coordinates Card */}
              <div className="bg-white border border-slate-200/80 shadow-premium rounded-3xl p-8 space-y-6">
                <h2 className="text-2xl font-bold text-text-primary font-outfit">Contact Info</h2>
                
                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 text-primary shrink-0">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">Noida Headquarters</h4>
                      <p className="text-xs text-text-secondary mt-0.5">
                        C-104, 2nd Floor, Sector-10, Noida,<br />
                        Uttar Pradesh – 201301
                      </p>
                    </div>
                  </div>

                  {/* Mail */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 text-primary shrink-0">
                      <Mail size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">Inquiries Email</h4>
                      <a href="mailto:sales@stemmantra.com" className="text-xs text-primary hover:underline mt-0.5 block font-semibold">
                        sales@stemmantra.com
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center border border-orange-100 text-primary shrink-0">
                      <Phone size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-text-primary">Phone Helplines</h4>
                      <p className="text-xs text-text-secondary mt-0.5 font-semibold">
                        Helpline: +91-6356631515<br />
                        Landline: 0120-3101774
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* External Site Box */}
              <div className="bg-brandDark text-white border border-slate-800 rounded-3xl p-8 space-y-4 relative overflow-hidden glow-dark-panel">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
                <h3 className="text-xl font-bold font-outfit">Prefer our Corporate Contact?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You can also submit inquiries, request call-backs, or chat directly via WhatsApp using our main corporate website.
                </p>
                <div className="pt-2">
                  <a 
                    href="https://stemmantra.com/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 text-xs font-bold text-primary hover:text-white transition-colors"
                  >
                    Open Corporate Contact Form <ExternalLink size={14} />
                  </a>
                </div>
              </div>

            </div>

          </section>

        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
