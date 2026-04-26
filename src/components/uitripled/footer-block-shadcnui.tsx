"use client";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUp,
  Facebook,
  Github,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Twitter,
} from "lucide-react";
import { Link } from "react-router-dom";

const footerLinks = [
  {
    title: "Product",
    links: [
      { name: "Features", path: "/features" },
      { name: "Pricing", path: "/pricing" },
      { name: "Dashboard", path: "/dashboard" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "About Us", path: "/contact" },
      { name: "Contact", path: "/contact" },
      { name: "Support", path: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { name: "Privacy Policy", path: "/privacy" },
      { name: "Terms of Service", path: "/terms" },
      { name: "Security", path: "/security" },
    ],
  },
];

const socialLinks = [
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Linkedin, label: "LinkedIn", href: "#" },
  { icon: Github, label: "GitHub", href: "#" },
];

export function FooterBlock() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const shouldReduceMotion = useReducedMotion();

  return (
    <footer
      aria-labelledby="footer-heading"
      className="relative w-full overflow-hidden border-t border-border bg-card/90 backdrop-blur-xl"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          className="absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-primary/20 blur-[160px]"
          animate={
            shouldReduceMotion
              ? undefined
              : { opacity: [0.2, 0.45, 0.2], scale: [0.9, 1.05, 0.95] }
          }
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 12, repeat: Infinity, ease: "easeInOut" }
          }
        />
        <motion.div
          className="absolute -bottom-36 right-0 h-96 w-96 rounded-full bg-[hsl(var(--primary)_/_0.18)] blur-[200px]"
          animate={
            shouldReduceMotion
              ? undefined
              : { opacity: [0.18, 0.4, 0.18], rotate: [0, 25, 0] }
          }
          transition={
            shouldReduceMotion
              ? undefined
              : { duration: 16, repeat: Infinity, ease: "linear" }
          }
        />
      </div>
      <h2 id="footer-heading" className="sr-only">
        Site footer
      </h2>
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-6">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-3">
            <motion.div
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="mb-6 inline-flex items-center gap-3"
            >
              <Link to="/" className="flex items-center gap-2.5">
                <img
                  src="https://jxpnnzaddesjmkcl.public.blob.vercel-storage.com/Generated%20Image%20April%2022%2C%202026%20-%208_25AM.svg"
                  alt="gapless logo"
                  className="w-10 h-10 object-contain"
                />
                <span className="text-2xl font-bold tracking-tighter text-slate-900">gapless</span>
              </Link>
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-widest text-muted-foreground"
              >
                Intelligence
              </Badge>
            </motion.div>
            <p className="mb-6 max-w-md text-sm text-muted-foreground leading-relaxed">
              Close the gap between you and your dream job. gapless analyzes job descriptions against your experience to provide ranked readiness scores and actionable roadmaps.
            </p>

            {/* Newsletter */}
            <div className="mb-8 max-w-sm">
              <p className="mb-3 text-sm font-semibold text-foreground">
                Subscribe to our intelligence newsletter
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="h-10 rounded-xl border-border/60 bg-background/60 backdrop-blur placeholder:text-muted-foreground"
                />
                <Button
                  size="sm"
                  className="h-10 rounded-xl border border-border/60 bg-primary/90 px-4 text-primary-foreground shadow-lg hover:bg-primary"
                  aria-label="Subscribe"
                >
                  <Mail className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </div>
          </div>

          {/* Footer Links */}
          {footerLinks.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: sectionIndex * 0.1 }}
              className="lg:col-span-1"
            >
              <h4 className="mb-4 text-sm font-bold uppercase tracking-widest text-foreground/90">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="my-10 h-px bg-border/70"
        />

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Social Links */}
          <div className="flex gap-4">
            {socialLinks.map((social, index) => (
              <a
                key={social.label}
                href={social.href}
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label={social.label}
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>

          {/* Copyright */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>© 2026 gapless Career Intelligence. All rights reserved.</span>
          </div>

          {/* Scroll to Top */}
          <Button
            size="icon"
            variant="outline"
            className="h-10 w-10 rounded-full border-border/60 shadow-sm"
            onClick={scrollToTop}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </footer>
  );
}
