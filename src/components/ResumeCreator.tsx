import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Wrench, 
  Plus, 
  Trash2, 
  Save, 
  Send, 
  Sparkles,
  ChevronRight,
  Layout,
  FileText,
  AlertCircle,
  Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { cn } from '../lib/utils';
import DashboardLayout from './DashboardLayout';

// --- Utils ---

const formatPhone = (val: string) => {
  const digits = val.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
};

const formatEmail = (val: string) => val.toLowerCase().trim();

// --- Types ---

interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  gradDate: string;
}

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
    summary: string;
  };
  experiences: Experience[];
  education: Education[];
  skills: string[];
  projects: { id: string; name: string; description: string; link: string; role: string; date: string }[];
}

const INITIAL_DATA: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: '',
    summary: '',
  },
  experiences: [],
  education: [],
  skills: [],
  projects: [],
};

// --- Components ---

const FormSection = ({ title, icon: Icon, children, description }: any) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 shadow-sm">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
          {description && <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{description}</p>}
        </div>
      </div>
    </div>
    <div className="p-6">
      {children}
    </div>
  </div>
);

const InputField = ({ label, value, onChange, placeholder, type = "text", multiline = false }: any) => (
  <div className="space-y-1.5 flex-1">
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">{label}</label>
    {multiline ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none min-h-[100px]"
        placeholder={placeholder}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
        placeholder={placeholder}
      />
    )}
  </div>
);

// --- Resume Preview Component ---

const ResumeLivePreview = ({ data }: { data: ResumeData }) => (
  <div className="bg-white min-h-[1100px] shadow-2xl p-12 font-sans text-gray-900 break-words overflow-x-hidden border border-gray-100">
    {/* Header */}
    <div className="mb-10 text-left border-b-2 border-black pb-6">
      <h1 className="text-4xl font-extrabold uppercase tracking-tight mb-3 text-black">{data.personalInfo.fullName || 'FULL NAME'}</h1>
      <div className="flex flex-wrap items-center gap-x-4 text-[11px] font-medium text-gray-600">
        {data.personalInfo.location && <span className="flex items-center gap-1">{data.personalInfo.location}</span>}
        {data.personalInfo.phone && <span className="flex items-center gap-1">| {data.personalInfo.phone}</span>}
        {data.personalInfo.email && <span className="flex items-center gap-1 text-blue-600 font-bold underline decoration-blue-200 underline-offset-4">| {data.personalInfo.email}</span>}
      </div>
      <div className="flex flex-wrap items-center gap-x-4 mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
        {data.personalInfo.linkedin && <span>LinkedIn: {data.personalInfo.linkedin}</span>}
        {data.personalInfo.website && <span>| Portfolio: {data.personalInfo.website}</span>}
      </div>
    </div>

    {/* Section Generator Helper */}
    <div className="space-y-8">
      {/* Summary */}
      {data.personalInfo.summary && (
        <section>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-gray-200 pb-1 mb-4 text-gray-900">Professional Summary</h2>
          <p className="text-[13.5px] leading-relaxed text-gray-700 font-medium">{data.personalInfo.summary}</p>
        </section>
      )}

      {/* Experience */}
      {data.experiences.length > 0 && (
        <section>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-gray-200 pb-1 mb-6 text-gray-900">Professional Experience</h2>
          <div className="space-y-7">
            {data.experiences.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between items-end mb-1">
                  <h3 className="text-[15px] font-bold text-black tracking-tight">{exp.company}</h3>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter bg-gray-50 px-2 py-0.5 rounded">{exp.startDate} – {exp.current ? 'Present' : exp.endDate}</span>
                </div>
                <div className="flex justify-between items-baseline mb-3">
                  <span className="text-[13px] font-bold text-blue-600 italic underline underline-offset-4 decoration-blue-100">{exp.role}</span>
                  <span className="text-[11px] font-semibold text-gray-400 italic uppercase">{exp.location}</span>
                </div>
                <ul className="list-disc ml-5 space-y-2">
                  {exp.description.split('\n').filter(line => line.trim()).map((bullet, i) => (
                    <li key={i} className="text-[13px] leading-relaxed text-gray-700 pl-1">{bullet.trim().startsWith('•') ? bullet.trim().substring(1).trim() : bullet.trim()}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {data.projects.length > 0 && (
        <section>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-gray-200 pb-1 mb-6 text-gray-900">Key Projects</h2>
          <div className="space-y-7">
            {data.projects.map(proj => (
              <div key={proj.id}>
                <div className="flex justify-between items-end mb-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-[15px] font-bold text-black tracking-tight">{proj.name}</h3>
                    {proj.link && <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded-full lowercase">{proj.link.replace(/^https?:\/\//, '')}</span>}
                  </div>
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter bg-gray-50 px-2 py-0.5 rounded">{proj.date}</span>
                </div>
                <div className="text-[11px] font-bold text-gray-500 mb-3 ml-0.5 uppercase tracking-widest">{proj.role}</div>
                <ul className="list-disc ml-5 space-y-2">
                  {proj.description.split('\n').filter(line => line.trim()).map((bullet, i) => (
                    <li key={i} className="text-[13px] leading-relaxed text-gray-700 pl-1">{bullet.trim().startsWith('•') ? bullet.trim().substring(1).trim() : bullet.trim()}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <section>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-gray-200 pb-1 mb-5 text-gray-900">Education</h2>
          <div className="space-y-4">
            {data.education.map(edu => (
              <div key={edu.id} className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <h3 className="text-[15px] font-bold text-black tracking-tight">{edu.school}</h3>
                  <p className="text-[13px] font-semibold text-gray-600 italic tracking-wide">{edu.degree}</p>
                </div>
                <span className="text-[11px] font-bold text-gray-500 uppercase pt-1 bg-gray-50 px-2 py-0.5 rounded">{edu.gradDate}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <section>
          <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b border-gray-200 pb-1 mb-4 text-gray-900">Technical Skills & Expertise</h2>
          <div className="flex flex-wrap gap-x-3 gap-y-2">
            {data.skills.map((skill, i) => (
              <React.Fragment key={skill}>
                <span className="text-[13px] font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-md border border-gray-100">{skill}</span>
              </React.Fragment>
            ))}
          </div>
        </section>
      )}
    </div>
  </div>
);

export default function ResumeCreator() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<ResumeData>(INITIAL_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('Personal');
  const [showPreview, setShowPreview] = useState(false);

  // Auto-formatting triggers
  useEffect(() => {
    const phone = data.personalInfo.phone;
    if (phone && !phone.startsWith('(') && phone.replace(/\D/g, '').length >= 10) {
      const formatted = formatPhone(phone);
      if (formatted !== phone) {
        updatePersonalInfo('phone', formatted);
      }
    }
  }, [data.personalInfo.phone]);

  // Load existing data from Supabase
  useEffect(() => {
    async function loadResume() {
      if (!user?.id) return;
      try {
        const { data: resumes, error } = await supabase
          .from('user_resumes')
          .select('resume_data, updated_at')
          .eq('user_id', user.id)
          .eq('is_primary', true)
          .single();

        if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
          console.error("Error loading resume:", error);
          return;
        }

        if (resumes) {
          setData(resumes.resume_data as ResumeData);
          setLastSaved(new Date(resumes.updated_at));
        }
      } catch (err) {
        console.error("Failed to fetch resume:", err);
      }
    }
    loadResume();
  }, [user?.id]);

  const saveResume = async () => {
    if (!user?.id) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_resumes')
        .upsert({
          user_id: user.id,
          resume_data: data,
          is_primary: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (error) throw error;
      setLastSaved(new Date());
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save resume. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImport = () => {
    // Format the resume as a plain text summary for the analysis engine
    const formattedExperience = data.experiences.map(exp => (
      `${exp.role} at ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate})\n${exp.description}`
    )).join('\n\n');

    const formattedEducation = data.education.map(edu => (
      `${edu.degree} from ${edu.school} (${edu.gradDate})`
    )).join('\n');

    const profileText = `
${data.personalInfo.fullName}
${data.personalInfo.summary}

EXPERIENCE:
${formattedExperience}

EDUCATION:
${formattedEducation}

SKILLS:
${data.skills.join(', ')}

PROJECTS:
${data.projects.map(p => `${p.name} (${p.role}): ${p.description}`).join('\n\n')}
    `.trim();

    navigate('/dashboard', { state: { prefilledCandidate: profileText } });
  };

  // State update helpers
  const updatePersonalInfo = (field: string, value: string) => {
    setData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const addExperience = () => {
    setData(prev => ({
      ...prev,
      experiences: [...prev.experiences, {
        id: crypto.randomUUID(),
        company: '',
        role: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }]
    }));
  };

  const updateExperience = (id: string, field: string, value: any) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const deleteExperience = (id: string) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    setData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: crypto.randomUUID(),
        school: '',
        degree: '',
        gradDate: ''
      }]
    }));
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    }));
  };

  const deleteEducation = (id: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addSkill = (skill: string) => {
    if (skill.trim() && !data.skills.includes(skill.trim())) {
      setData(prev => ({ ...prev, skills: [...prev.skills, skill.trim()] }));
    }
  };

  const deleteSkill = (skill: string) => {
    setData(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const addProject = () => {
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, {
        id: crypto.randomUUID(),
        name: '',
        role: '',
        description: '',
        date: '',
        link: ''
      }]
    }));
  };

  const updateProject = (id: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(proj => proj.id === id ? { ...proj, [field]: value } : proj)
    }));
  };

  const deleteProject = (id: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(proj => proj.id !== id)
    }));
  };

  return (
    <DashboardLayout activeLabel="Resume Creator">
      <div className={cn("mx-auto pb-20 transition-all duration-300", showPreview ? "max-w-[1700px]" : "max-w-5xl")}>
        {/* Header Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm sticky top-0 z-10">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Resume Creator</h1>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <Clock size={12} />
                {lastSaved ? `Last saved at ${lastSaved.toLocaleTimeString()}` : 'Not saved yet'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={cn(
                "flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all border",
                showPreview 
                  ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-200" 
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              )}
            >
              <Layout size={14} />
              {showPreview ? 'Close Preview' : 'Live Preview'}
            </button>
            <button
              onClick={saveResume}
              disabled={isSaving}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-all"
            >
              <Save size={14} className={isSaving ? "animate-spin" : ""} />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={handleImport}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Send size={14} />
              Import to Analysis
            </button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          {/* Navigation Sidebar */}
          <div className={cn("col-span-12", showPreview ? "lg:col-span-2" : "lg:col-span-3")}>
            <div className="space-y-1 sticky top-32">
              {['Personal', 'Experience', 'Education', 'Skills', 'Projects'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all group",
                    activeTab === tab 
                      ? "bg-slate-900 text-white shadow-md shadow-slate-200" 
                      : "text-gray-500 hover:bg-white hover:border-gray-200 border border-transparent"
                  )}
                >
                  <span>{tab}</span>
                  <ChevronRight size={14} className={cn("transition-transform", activeTab === tab ? "translate-x-1" : "opacity-0")} />
                </button>
              ))}
            </div>
          </div>

          {/* Form Content Area */}
          <div className={cn("col-span-12", showPreview ? "lg:col-span-10 grid grid-cols-1 lg:grid-cols-2 gap-8" : "lg:col-span-9")}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {activeTab === 'Personal' && (
                  <FormSection title="Personal Information" icon={User} description="Primary Contact Details">
                    <div className="space-y-6">
                      <div className={cn("grid gap-6", showPreview ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                        <InputField 
                          label="Full Name" 
                          value={data.personalInfo.fullName} 
                          onChange={(v: string) => updatePersonalInfo('fullName', v)} 
                          placeholder="John Doe" 
                        />
                        <InputField 
                          label="Email Address" 
                          value={data.personalInfo.email} 
                          onChange={(v: string) => updatePersonalInfo('email', v)} 
                          placeholder="john@example.com" 
                          type="email" 
                        />
                      </div>
                      <div className={cn("grid gap-6", showPreview ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                        <InputField 
                          label="Phone Number" 
                          value={data.personalInfo.phone} 
                          onChange={(v: string) => updatePersonalInfo('phone', v)} 
                          placeholder="+1 (555) 000-0000" 
                        />
                        <InputField 
                          label="Location" 
                          value={data.personalInfo.location} 
                          onChange={(v: string) => updatePersonalInfo('location', v)} 
                          placeholder="San Francisco, CA" 
                        />
                      </div>
                      <div className={cn("grid gap-6", showPreview ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                        <InputField 
                          label="LinkedIn Profile" 
                          value={data.personalInfo.linkedin} 
                          onChange={(v: string) => updatePersonalInfo('linkedin', v)} 
                          placeholder="linkedin.com/in/johndoe" 
                        />
                        <InputField 
                          label="Personal Website" 
                          value={data.personalInfo.website} 
                          onChange={(v: string) => updatePersonalInfo('website', v)} 
                          placeholder="johndoe.com" 
                        />
                      </div>
                      <InputField 
                        label="Professional Summary" 
                        value={data.personalInfo.summary} 
                        onChange={(v: string) => updatePersonalInfo('summary', v)} 
                        placeholder="Write a brief overview of your professional career..." 
                        multiline 
                      />
                    </div>
                  </FormSection>
                )}

                {activeTab === 'Experience' && (
                  <div className="space-y-8">
                    {data.experiences.map((exp, idx) => (
                      <FormSection key={exp.id} title={`Experience ${idx + 1}`} icon={Briefcase}>
                        <div className="space-y-6">
                          <div className="flex justify-end">
                            <button 
                              onClick={() => deleteExperience(exp.id)} 
                              className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>
                          <div className={cn("grid gap-6", showPreview ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                            <InputField 
                              label="Company Name" 
                              value={exp.company} 
                              onChange={(v: string) => updateExperience(exp.id, 'company', v)} 
                              placeholder="Tech Corp" 
                            />
                            <InputField 
                              label="Role / Title" 
                              value={exp.role} 
                              onChange={(v: string) => updateExperience(exp.id, 'role', v)} 
                              placeholder="Senior Software Engineer" 
                            />
                          </div>
                          <div className={cn("grid gap-6", showPreview ? "grid-cols-1 xl:grid-cols-3" : "grid-cols-1 md:grid-cols-3")}>
                            <InputField 
                              label="Start Date" 
                              value={exp.startDate} 
                              onChange={(v: string) => updateExperience(exp.id, 'startDate', v)} 
                              placeholder="Jan 2022" 
                            />
                            {!exp.current && (
                              <InputField 
                                label="End Date" 
                                value={exp.endDate} 
                                onChange={(v: string) => updateExperience(exp.id, 'endDate', v)} 
                                placeholder="Present" 
                              />
                            )}
                            <div className="flex items-end pb-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  checked={exp.current} 
                                  onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                                />
                                <span className={cn("text-[10px] font-bold text-gray-500 uppercase tracking-widest", showPreview && "xl:text-[10px]")}>Current Role</span>
                              </label>
                            </div>
                          </div>
                          <InputField 
                            label="Key Accomplishments" 
                            value={exp.description} 
                            onChange={(v: string) => updateExperience(exp.id, 'description', v)} 
                            placeholder="Describe your impact and responsibilities..." 
                            multiline 
                          />
                        </div>
                      </FormSection>
                    ))}
                    <button 
                      onClick={addExperience}
                      className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:border-blue-200 hover:text-blue-500 transition-all bg-white/50"
                    >
                      <Plus size={18} /> Add Professional Experience
                    </button>
                  </div>
                )}

                {activeTab === 'Education' && (
                  <div className="space-y-8">
                    {data.education.map((edu, idx) => (
                      <FormSection key={edu.id} title={`Education ${idx + 1}`} icon={GraduationCap}>
                        <div className="space-y-6">
                          <div className="flex justify-end">
                            <button 
                              onClick={() => deleteEducation(edu.id)} 
                              className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>
                          <div className={cn("grid gap-6", showPreview ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                            <InputField 
                              label="School / University" 
                              value={edu.school} 
                              onChange={(v: string) => updateEducation(edu.id, 'school', v)} 
                              placeholder="Stanford University" 
                            />
                            <InputField 
                              label="Degree / Major" 
                              value={edu.degree} 
                              onChange={(v: string) => updateEducation(edu.id, 'degree', v)} 
                              placeholder="B.S. Computer Science" 
                            />
                          </div>
                          <InputField 
                            label="Graduation Date" 
                            value={edu.gradDate} 
                            onChange={(v: string) => updateEducation(edu.id, 'gradDate', v)} 
                            placeholder="May 2021" 
                          />
                        </div>
                      </FormSection>
                    ))}
                    <button 
                      onClick={addEducation}
                      className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:border-blue-200 hover:text-blue-500 transition-all bg-white/50"
                    >
                      <Plus size={18} /> Add Education
                    </button>
                  </div>
                )}

                {activeTab === 'Skills' && (
                  <FormSection title="Skills & Competencies" icon={Wrench} description="Technical and Soft Skills">
                    <div className="space-y-6">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              addSkill((e.target as HTMLInputElement).value);
                              (e.target as HTMLInputElement).value = '';
                            }
                          }}
                          className="flex-1 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                          placeholder="Type a skill and press Enter (e.g. React, Python, Leadership)"
                        />
                        <button 
                          onClick={() => {
                            const input = document.querySelector('input[placeholder*="Type a skill"]') as HTMLInputElement;
                            addSkill(input.value);
                            input.value = '';
                          }}
                          className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                        >
                          Add
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {data.skills.map(skill => (
                          <span key={skill} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 group">
                            {skill}
                            <button 
                              onClick={() => deleteSkill(skill)}
                              className="text-slate-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 size={12} />
                            </button>
                          </span>
                        ))}
                        {data.skills.length === 0 && (
                          <div className="w-full py-12 text-center text-gray-400">
                            <Wrench size={32} className="mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-medium">No skills added yet.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </FormSection>
                )}

                {activeTab === 'Projects' && (
                  <div className="space-y-8">
                    {data.projects.map((proj, idx) => (
                      <FormSection key={proj.id} title={`Project ${idx + 1}`} icon={Layout}>
                        <div className="space-y-6">
                          <div className="flex justify-end">
                            <button 
                              onClick={() => deleteProject(proj.id)} 
                              className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase flex items-center gap-1"
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>
                          <div className={cn("grid gap-6", showPreview ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                            <InputField 
                              label="Project Name" 
                              value={proj.name} 
                              onChange={(v: string) => updateProject(proj.id, 'name', v)} 
                              placeholder="E-commerce Platform" 
                            />
                            <InputField 
                              label="Your Role" 
                              value={proj.role} 
                              onChange={(v: string) => updateProject(proj.id, 'role', v)} 
                              placeholder="Lead Developer" 
                            />
                          </div>
                          <div className={cn("grid gap-6", showPreview ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2")}>
                            <InputField 
                              label="Date Range / Status" 
                              value={proj.date} 
                              onChange={(v: string) => updateProject(proj.id, 'date', v)} 
                              placeholder="Oct 2023 - Present" 
                            />
                            <InputField 
                              label="Project Link / URL" 
                              value={proj.link} 
                              onChange={(v: string) => updateProject(proj.id, 'link', v)} 
                              placeholder="github.com/myusername/project" 
                            />
                          </div>
                          <InputField 
                            label="Project Description" 
                            value={proj.description} 
                            onChange={(v: string) => updateProject(proj.id, 'description', v)} 
                            placeholder="Detail the technical stack and what you accomplished..." 
                            multiline 
                          />
                        </div>
                      </FormSection>
                    ))}
                    <button 
                      onClick={addProject}
                      className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-gray-400 hover:border-blue-200 hover:text-blue-500 transition-all bg-white/50"
                    >
                      <Plus size={18} /> Add Project
                    </button>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Live Preview Pane */}
            {showPreview && (
              <div className="hidden lg:block sticky top-32 h-[calc(100vh-160px)] overflow-y-auto pr-2 custom-scrollbar">
                <ResumeLivePreview data={data} />
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
