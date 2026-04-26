"use client";

import { Button, ButtonProps } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export interface NativeButtonProps extends ButtonProps {
  children: ReactNode;
  loading?: boolean;
  glow?: boolean;
  shimmer?: boolean;
}

const NativeButton = ({
  className,
  variant = "default",
  size = "lg",
  children,
  loading = false,
  glow = false,
  shimmer = false,
  disabled,
  ...props
}: NativeButtonProps) => {
  const glassmorphismClassName = cn(
    "relative overflow-hidden transition-all duration-300",
    variant === "default" && "bg-slate-900 text-white shadow-xl",
    variant === "outline" && "bg-white/50 backdrop-blur-sm border-slate-200 text-slate-700",
    variant === "ghost" && "text-slate-600 hover:text-slate-900",
    className
  );

  return (
    <Button
      variant={variant}
      size={size}
      className={glassmorphismClassName}
      disabled={disabled || loading}
      loading={loading}
      glow={glow}
      noScale={true} // Disable hover/tap scaling globaly for NativeButton
      {...props}
    >
      {/* Shimmer Effect - Loop continuously if enabled */}
      {shimmer && !disabled && !loading && (
        <motion.div
          className="absolute inset-0 w-[200%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12"
          animate={{ x: ["-100%", "100%"] }}
          transition={{ 
            duration: 2.5, 
            repeat: Infinity, 
            ease: "linear",
            delay: Math.random() * 2 // Stagger multiple buttons
          }}
        />
      )}
      
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </Button>
  );
};

NativeButton.displayName = "NativeButton";

export { NativeButton };
