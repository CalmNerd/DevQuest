"use client";

import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitles?: string[];
    size?: "sm" | "md" | "lg";
}

export default function Loader({
    title = "Configuring your profile...",
    subtitles = [
        "Please wait while we prepare everything for you",
        "Fetching your GitHub data...",
        "Calculating your achievements...",
        "Processing your contributions...",
        "This may take a moment for older accounts...",
        "Almost there, loading your stats...",
    ],
    size = "md",
    className,
    ...props
}: LoaderProps) {
    // State for rotating subtitles
    const [currentSubtitleIndex, setCurrentSubtitleIndex] = useState(0);

    // Rotate through subtitles every 5 seconds for better readability
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSubtitleIndex((prev) => (prev + 1) % subtitles.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [subtitles.length]);

    const sizeConfig = {
        sm: {
            container: "size-16",
            titleClass: "text-sm/tight font-medium",
            subtitleClass: "text-xs/relaxed",
            spacing: "space-y-2",
            maxWidth: "max-w-48",
        },
        md: {
            container: "size-24",
            titleClass: "text-base/snug font-medium",
            subtitleClass: "text-sm/relaxed",
            spacing: "space-y-3",
            maxWidth: "max-w-72",
        },
        lg: {
            container: "size-32",
            titleClass: "text-lg/tight font-semibold",
            subtitleClass: "text-base/relaxed",
            spacing: "space-y-4",
            maxWidth: "max-w-80",
        },
    };

    const config = sizeConfig[size];

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center gap-8 p-8",
                className
            )}
            {...props}
        >
            {/* DevQuest Gaming Theme Loader with Primary (Cyan), Accent (Pink), and Secondary (Amber) colors */}
            <motion.div
                className={cn("relative", config.container)}
                animate={{
                    scale: [1, 1.02, 1],
                }}
                transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: [0.4, 0, 0.6, 1],
                }}
            >
                {/* Outer ring with cyan primary - Border based for visibility */}
                <motion.div
                    className="absolute inset-0 rounded-full border-[3px] border-transparent"
                    style={{
                        borderTopColor: "rgb(77, 186, 217)", // Cyan
                        borderRightColor: "rgb(77, 186, 217)",
                    }}
                    animate={{
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                    }}
                />

                {/* Middle ring with pink accent - counter rotation */}
                <motion.div
                    className="absolute inset-1.5 rounded-full border-[3px] border-transparent"
                    style={{
                        borderTopColor: "rgb(226, 105, 203)", // Pink
                        borderLeftColor: "rgb(226, 105, 203)",
                        filter: "drop-shadow(0 0 4px rgba(226, 105, 203, 0.5))",
                    }}
                    animate={{
                        rotate: [0, -360],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                    }}
                />

                {/* Inner ring with amber secondary */}
                <motion.div
                    className="absolute inset-3 rounded-full border-2 border-transparent"
                    style={{
                        borderRightColor: "rgb(255, 176, 59)", // Amber
                        borderBottomColor: "rgb(255, 176, 59)",
                    }}
                    animate={{
                        rotate: [0, 360],
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                    }}
                />

                {/* Center glow effect */}
                <motion.div
                    className="absolute inset-4 rounded-full"
                    style={{
                        background: "radial-gradient(circle, rgba(77, 186, 217, 0.2), transparent 70%)",
                    }}
                    animate={{
                        opacity: [0.4, 0.8, 0.4],
                        scale: [0.95, 1.05, 0.95],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: [0.4, 0, 0.6, 1],
                    }}
                />
            </motion.div>

            {/* Enhanced Typography with Breathing Animation and Rotating Subtitles */}
            <motion.div
                className={cn("text-center w-full", config.spacing, config.maxWidth)}
                initial={{ opacity: 0, y: 12 }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    delay: 0.4,
                    duration: 1,
                    ease: [0.4, 0, 0.2, 1],
                }}
            >
                {/* Title with gradient accent */}
                <motion.h1
                    className={cn(
                        config.titleClass,
                        "text-foreground font-semibold tracking-[-0.02em] leading-[1.15] antialiased",
                        "bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent",
                        "animate-pulse"
                    )}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{
                        opacity: 1,
                        y: 0,
                    }}
                    transition={{
                        delay: 0.6,
                        duration: 0.8,
                        ease: [0.4, 0, 0.2, 1],
                    }}
                >
                    {title}
                </motion.h1>

                {/* Rotating subtitles with AnimatePresence */}
                <div className={cn(config.subtitleClass, "relative min-h-[2.9em] overflow-hidden flex items-center justify-center")}>
                    <AnimatePresence mode="wait">
                        <motion.p
                            key={currentSubtitleIndex}
                            className={cn(
                                "absolute inset-0 text-muted-foreground font-normal tracking-[-0.01em] leading-[1.45] antialiased flex items-center justify-center text-center px-2"
                            )}
                            initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
                            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                            exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
                            transition={{
                                duration: 0.6,
                                ease: [0.4, 0, 0.2, 1],
                            }}
                        >
                            {subtitles[currentSubtitleIndex]}
                        </motion.p>
                    </AnimatePresence>
                </div>
            </motion.div>
        </div>
    );
}
