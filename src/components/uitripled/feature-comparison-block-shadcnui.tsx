"use client";

import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { motion } from "framer-motion";
import { Check, Crown, Rocket, Sparkles, Star, X, Zap } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/src/lib/AuthContext";

const plans = (user: any, userPlan: string) => [
  {
    name: "Starter",
    popular: false,
    price: "$0",
    period: "",
    description: "For individuals starting their search.",
    icon: Rocket,
    gradient: "from-slate-500/10 via-slate-500/5 to-transparent",
    iconColor: "text-slate-500",
    features: ["3 analysis runs / mo", "Basic fit summaries", "Gap identification"],
    cta: user && userPlan.toLowerCase().includes('free') ? "Current Plan" : "Get Started",
    path: user && userPlan.toLowerCase().includes('free') ? "/accounts" : "/signup",
    disabled: user && userPlan.toLowerCase().includes('free'),
  },
  {
    name: "Growth",
    popular: true,
    price: "$12",
    period: "/mo",
    description: "Most popular for active job seekers.",
    icon: Star,
    gradient: "from-primary/20 via-primary/10 to-transparent",
    iconColor: "text-primary",
    features: [
      "Unlimited analysis",
      "Saved history",
      "Detailed bridge roadmaps",
      "PDF Exports",
    ],
    cta: user && userPlan.toLowerCase().includes('growth') || userPlan.toLowerCase().includes('pro') ? "Current Plan" : "Subscribe to Growth",
    path: user && (userPlan.toLowerCase().includes('growth') || userPlan.toLowerCase().includes('pro')) ? "/billing" : "/signup",
    disabled: user && (userPlan.toLowerCase().includes('growth') || userPlan.toLowerCase().includes('pro')),
  },
  {
    name: "Enterprise",
    popular: false,
    price: "Contact",
    period: "",
    description: "For agencies and HR teams.",
    icon: Crown,
    gradient: "from-purple-500/20 via-purple-500/10 to-transparent",
    iconColor: "text-purple-500",
    features: [
      "Team workspaces",
      "Resume checker (specialized for HR)",
      "Bulk processes",
      "Priority support",
    ],
    cta: user && userPlan.toLowerCase().includes('enterprise') ? "Current Plan" : "Contact Sales",
    path: "/contact",
    disabled: user && userPlan.toLowerCase().includes('enterprise'),
  },
];

const features = [
  {
    category: "Analysis & Intelligence",
    items: [
      { name: "Analysis Runs", starter: "3 / mo", growth: "Unlimited", enterprise: "Unlimited" },
      { name: "Gap Identification", starter: true, growth: true, enterprise: true },
      { name: "Detailed Roadmaps", starter: false, growth: true, enterprise: true },
      { name: "Historical Tracking", starter: false, growth: true, enterprise: true },
    ],
  },
  {
    category: "Tools & Exports",
    items: [
      { name: "Resume Creator", starter: true, growth: true, enterprise: true },
      { name: "PDF Exports", starter: false, growth: true, enterprise: true },
      { name: "Team Workspaces", starter: false, growth: false, enterprise: true },
      { name: "Bulk Processing", starter: false, growth: false, enterprise: true },
    ],
  },
  {
    category: "Support",
    items: [
      { name: "Community Support", starter: true, growth: true, enterprise: true },
      { name: "Priority Support", starter: false, growth: false, enterprise: true },
      { name: "Dedicated Manager", starter: false, growth: false, enterprise: true },
    ],
  },
];

export function FeatureComparisonBlock() {
  const { user, userPlan } = useAuth();
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);
  const currentPlans = plans(user, userPlan);

  return (
    <section className="w-full bg-background px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <Badge className="mb-4" variant="secondary">
            <Zap className="mr-1 h-3 w-3" />
            Pricing & Tiers
          </Badge>
          <h2 className="mb-4 text-4xl font-bold tracking-tight">
            Plans for active career growth.
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Choose the subscription that matches your analysis volume.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {currentPlans.map((plan, index) => {
              const Icon = plan.icon;
              const isHovered = hoveredPlan === index;

              return (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.1 * index, duration: 0.5 }}
                  onHoverStart={() => setHoveredPlan(index)}
                  onHoverEnd={() => setHoveredPlan(null)}
                  className="relative"
                >
                  {plan.popular && (
                    <motion.div
                      className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary via-primary/50 to-primary opacity-20 blur-xl"
                      animate={{
                        opacity: [0.2, 0.4, 0.2],
                        scale: [1, 1.02, 1],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                  )}

                  <Card
                    className={`group relative h-full overflow-hidden border-border/50 bg-gradient-to-br from-card via-card to-card/80 backdrop-blur-sm transition-all duration-500 ${
                      plan.popular
                        ? "border-primary/50 shadow-2xl shadow-primary/10"
                        : "hover:border-primary/30 hover:shadow-xl"
                    } ${isHovered && !plan.popular ? "scale-[1.02]" : ""} ${
                      plan.popular ? "scale-[1.05] lg:scale-110" : ""
                    }`}
                  >
                    <motion.div
                      className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} opacity-0 transition-opacity duration-500`}
                      animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
                    />

                    {isHovered && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        animate={{ x: ["-200%", "200%"] }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      />
                    )}

                    {plan.popular && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{
                          delay: 0.3 + index * 0.1,
                          type: "spring",
                        }}
                        className="absolute top-4 right-4 z-20"
                      >
                        <Badge className="gap-1 rounded-lg border-primary/20 bg-primary px-3 py-1 shadow-lg">
                          <Sparkles className="h-3 w-3" />
                          Recommended
                        </Badge>
                      </motion.div>
                    )}

                    <div className="relative z-10 p-6 md:p-8 flex flex-col h-full">
                      <motion.div
                        className="mb-4 flex justify-center"
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.6 }}
                      >
                        <div
                          className={`rounded-2xl bg-gradient-to-br ${plan.gradient} p-3 shadow-lg`}
                        >
                          <Icon className={`h-8 w-8 ${plan.iconColor}`} />
                        </div>
                      </motion.div>

                      <div className="mb-6 text-center">
                        <h3 className="mb-2 text-2xl font-bold tracking-tight">
                          {plan.name}
                        </h3>
                        <p className="text-sm text-muted-foreground h-10">
                          {plan.description}
                        </p>
                      </div>

                      <div className="mb-6 text-center">
                        <motion.div
                          animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className="text-5xl font-bold tracking-tight">
                            {plan.price}
                          </span>
                          {plan.period && (
                            <span className="ml-1 text-base text-muted-foreground">
                              {plan.period}
                            </span>
                          )}
                        </motion.div>
                      </div>

                      <motion.ul className="mb-8 space-y-3 flex-1">
                        {plan.features.map((feature, idx) => (
                          <motion.li
                            key={feature}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + idx * 0.1 }}
                            className="flex items-start gap-2"
                          >
                            <motion.div
                              whileHover={{ scale: 1.2, rotate: 360 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Check
                                className={`mt-0.5 h-5 w-5 flex-shrink-0 ${plan.iconColor}`}
                              />
                            </motion.div>
                            <span className="text-sm text-foreground/90">
                              {feature}
                            </span>
                          </motion.li>
                        ))}
                      </motion.ul>

                      <Link
                        to={plan.path}
                        className={`w-full ${plan.disabled ? 'pointer-events-none' : ''}`}
                      >
                        <Button
                          className={`group relative w-full overflow-hidden ${
                            plan.popular ? "shadow-lg shadow-primary/20" : ""
                          }`}
                          variant={plan.popular ? "default" : "outline"}
                          size="lg"
                          disabled={plan.disabled}
                        >
                          <motion.span
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={
                              isHovered
                                ? { x: ["-200%", "200%"] }
                                : { x: "-200%" }
                            }
                            transition={{
                              duration: 0.8,
                              ease: "easeInOut",
                            }}
                          />
                          <span className="relative">
                            {plan.cta}
                          </span>
                          <motion.span
                            className="relative ml-2"
                            animate={isHovered ? { x: [0, 5, 0] } : { x: 0 }}
                            transition={{
                              duration: 0.5,
                              repeat: isHovered ? Infinity : 0,
                            }}
                          >
                            →
                          </motion.span>
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Feature Comparison Table */}
        <div className="overflow-x-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="min-w-[640px]"
          >
            <div className="space-y-6">
              {features.map((category, categoryIndex) => (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * categoryIndex }}
                >
                  <h4 className="mb-4 text-lg font-semibold">
                    {category.category}
                  </h4>
                  <Card className="overflow-hidden border-border">
                    {category.items.map((feature, featureIndex) => (
                      <motion.div
                        key={feature.name}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.05 * featureIndex }}
                        className={`grid grid-cols-4 gap-4 border-b border-border p-4 last:border-b-0 ${
                          featureIndex % 2 === 0 ? "bg-muted/30" : ""
                        }`}
                      >
                        <div className="col-span-1 flex items-center">
                          <span className="text-sm font-medium">
                            {feature.name}
                          </span>
                        </div>

                        {/* Starter */}
                        <div className="flex items-center justify-center">
                          {typeof (feature as any).starter === "string" ? (
                            <span className="text-xs font-semibold">{(feature as any).starter}</span>
                          ) : (feature as any).starter ? (
                            <Check className="h-5 w-5 text-primary" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground/30" />
                          )}
                        </div>

                        {/* Growth */}
                        <div className="flex items-center justify-center">
                          {typeof (feature as any).growth === "string" ? (
                            <span className="text-xs font-semibold">{(feature as any).growth}</span>
                          ) : (feature as any).growth ? (
                            <Check className="h-5 w-5 text-primary" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground/30" />
                          )}
                        </div>

                        {/* Enterprise */}
                        <div className="flex items-center justify-center">
                          {typeof (feature as any).enterprise === "string" ? (
                            <span className="text-xs font-semibold">{(feature as any).enterprise}</span>
                          ) : (feature as any).enterprise ? (
                            <Check className="h-5 w-5 text-primary" />
                          ) : (
                            <X className="h-5 w-5 text-muted-foreground/30" />
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </Card>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-12 text-center"
            >
              <p className="mb-4 text-sm text-muted-foreground">
                Need a custom plan?
              </p>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Contact Sales
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
