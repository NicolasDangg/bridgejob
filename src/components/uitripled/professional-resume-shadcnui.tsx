"use client";

import { Button } from "@/src/components/ui/button";
import { Separator } from "@/src/components/ui/separator";
import { motion, Variants } from "framer-motion";
import { Download, Globe, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import React from "react";

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

export function ProfessionalResume({ data }: { data: ResumeData }) {
  const fadeIn: Variants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const personalInfo = data.personalInfo;

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="show"
        className="p-8 md:p-12 space-y-8"
      >
        {/* Header */}
        <motion.div variants={fadeIn} className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight uppercase">
            {personalInfo.fullName || "Full Name"}
          </h1>
          <p className="text-lg text-muted-foreground font-sans uppercase tracking-widest text-sm">
            {data.experiences[0]?.role || "Professional Title"}
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground font-sans pt-2">
            {personalInfo.email && (
              <div className="flex items-center gap-1.5">
                <Mail className="h-4 w-4" />
                <span>{personalInfo.email}</span>
              </div>
            )}
            {personalInfo.phone && (
              <div className="flex items-center gap-1.5">
                <Phone className="h-4 w-4" />
                <span>{personalInfo.phone}</span>
              </div>
            )}
            {personalInfo.location && (
              <div className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                <span>{personalInfo.location}</span>
              </div>
            )}
            {personalInfo.linkedin && (
              <div className="flex items-center gap-1.5">
                <Linkedin className="h-4 w-4" />
                <span>{personalInfo.linkedin}</span>
              </div>
            )}
            {personalInfo.website && (
              <div className="flex items-center gap-1.5">
                <Globe className="h-4 w-4" />
                <span>{personalInfo.website}</span>
              </div>
            )}
          </div>
        </motion.div>

        <Separator />

        {/* Summary */}
        {personalInfo.summary && (
          <motion.div variants={fadeIn} className="space-y-3">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-1 inline-block uppercase tracking-wider">
              Professional Summary
            </h2>
            <p className="text-card-foreground leading-relaxed font-sans text-sm md:text-base">
              {personalInfo.summary}
            </p>
          </motion.div>
        )}

        {/* Experience */}
        {data.experiences.length > 0 && (
          <motion.div variants={fadeIn} className="space-y-6">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-1 inline-block uppercase tracking-wider">
              Experience
            </h2>

            <div className="space-y-6">
              {data.experiences.map((job) => (
                <div key={job.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className="text-lg font-bold text-foreground">
                      {job.company || "Company Name"}
                    </h3>
                    <span className="text-sm font-sans text-muted-foreground bg-gray-50 px-2 py-0.5 rounded">
                      {job.startDate} – {job.current ? "Present" : job.endDate}
                    </span>
                  </div>
                  <p className="text-card-foreground font-medium italic mb-2 text-blue-600">
                    {job.role || "Job Role"}
                  </p>
                  <ul className="list-disc list-outside ml-5 space-y-1 text-card-foreground font-sans text-sm">
                    {job.description.split('\n').filter(l => l.trim()).map((item, i) => (
                      <li key={i}>{item.trim().startsWith('•') ? item.trim().substring(1).trim() : item.trim()}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Projects */}
        {data.projects.length > 0 && (
          <motion.div variants={fadeIn} className="space-y-6">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-1 inline-block uppercase tracking-wider">
              Key Projects
            </h2>

            <div className="space-y-6">
              {data.projects.map((proj) => (
                <div key={proj.id}>
                  <div className="flex justify-between items-baseline mb-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-foreground">
                        {proj.name || "Project Name"}
                      </h3>
                      {proj.link && <span className="text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded-full">{proj.link}</span>}
                    </div>
                    <span className="text-sm font-sans text-muted-foreground bg-gray-50 px-2 py-0.5 rounded">
                      {proj.date}
                    </span>
                  </div>
                  <p className="text-card-foreground font-medium italic mb-2 text-gray-500 text-xs uppercase tracking-widest">
                    {proj.role}
                  </p>
                  <ul className="list-disc list-outside ml-5 space-y-1 text-card-foreground font-sans text-sm">
                    {proj.description.split('\n').filter(l => l.trim()).map((item, i) => (
                      <li key={i}>{item.trim()}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Skills */}
        {data.skills.length > 0 && (
          <motion.div variants={fadeIn} className="space-y-3">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-1 inline-block uppercase tracking-wider">
              Technical Skills
            </h2>
            <div className="flex flex-wrap gap-2 pt-2">
              {data.skills.map((skill) => (
                <span key={skill} className="text-sm font-bold text-gray-700 bg-gray-50 px-3 py-1 rounded-md border border-gray-100">
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Education */}
        {data.education.length > 0 && (
          <motion.div variants={fadeIn} className="space-y-3">
            <h2 className="text-xl font-bold text-foreground border-b-2 border-foreground pb-1 inline-block uppercase tracking-wider">
              Education
            </h2>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-lg font-bold text-foreground">
                      {edu.school || "School Name"}
                    </h3>
                    <span className="text-sm font-sans text-muted-foreground bg-gray-50 px-2 py-0.5 rounded">
                      {edu.gradDate}
                    </span>
                  </div>
                  <p className="text-card-foreground font-sans italic text-gray-600">
                    {edu.degree || "Degree"}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        <div className="pt-8 flex justify-center no-print">
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
