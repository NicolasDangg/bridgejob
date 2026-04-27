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
  const currentPlans = plans(user, userPlan);

  return (
    <section className="w-full bg-background px-4 py-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
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
        </div>

        {/* Pricing Cards */}
        <div className="mb-12">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {currentPlans.map((plan, index) => {
              const Icon = plan.icon;

              return (
                <div
                  key={plan.name}
                  className="relative group"
                >
                  <Card
                    className={`relative h-full overflow-hidden border transition-all duration-200 flex flex-col ${
                      plan.popular
                        ? "border-primary/50 bg-card shadow-md"
                        : "border-border bg-card hover:border-primary/30 hover:shadow-md"
                    }`}
                  >
                    {/* Recommended badge */}
                    {plan.popular && (
                      <div className="absolute top-6 right-6 z-20">
                        <Badge className="gap-1.5 rounded-full border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          <Sparkles className="h-3 w-3" />
                          Popular
                        </Badge>
                      </div>
                    )}

                    <div className="relative z-10 p-8 flex flex-col h-full">
                      {/* Icon */}
                      <div className="mb-6 flex justify-start">
                        <div className="rounded-lg bg-muted p-3">
                          <Icon className={`h-6 w-6 ${plan.iconColor}`} />
                        </div>
                      </div>

                      {/* Plan name and description */}
                      <div className="mb-8">
                        <h3 className="mb-2 text-xl font-semibold tracking-tight">
                          {plan.name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {plan.description}
                        </p>
                      </div>

                      {/* Pricing */}
                      <div className="mb-8">
                        <div className="space-y-1">
                          <span className="text-4xl font-bold tracking-tight">
                            {plan.price}
                          </span>
                          {plan.period && (
                            <div className="text-sm text-muted-foreground">
                              {plan.period}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Features list */}
                      <ul className="mb-8 space-y-3 flex-1">
                        {plan.features.map((feature) => (
                          <li
                            key={feature}
                            className="flex items-start gap-3"
                          >
                            <div className="mt-1 flex-shrink-0">
                              <Check className={`h-4 w-4 ${plan.iconColor}`} />
                            </div>
                            <span className="text-sm text-foreground/85">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {/* CTA Button */}
                      <Link
                        to={plan.path}
                        className={`w-full ${plan.disabled ? "pointer-events-none" : ""}`}
                      >
                        <Button
                          className="w-full h-11 font-medium transition-colors duration-200"
                          variant={plan.popular ? "default" : "outline"}
                          size="lg"
                          disabled={plan.disabled}
                        >
                          {plan.cta}
                        </Button>
                      </Link>
                    </div>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div className="space-y-6">
              {features.map((category) => (
                <div key={category.category}>
                  <h4 className="mb-4 text-base font-semibold">
                    {category.category}
                  </h4>
                  <Card className="overflow-hidden border-border">
                    {category.items.map((feature, featureIndex) => (
                      <div
                        key={feature.name}
                        className={`grid grid-cols-4 gap-4 border-b border-border p-4 last:border-b-0 ${
                          featureIndex % 2 === 0 ? "bg-muted/20" : ""
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
                      </div>
                    ))}
                  </Card>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Need a custom plan?
              </p>
              <Link to="/contact">
                <Button variant="outline" size="lg">
                  Contact Sales
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
