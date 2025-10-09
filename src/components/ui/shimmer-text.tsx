"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface Text_01Props {
    text: string;
    className?: string;
}

export default function ShimmerText({
    text = "Text Shimmer",
    className,
}: Text_01Props) {
    return (
        <div className="flex items-center justify-center p-8">
            <motion.div
                className="relative px-4 py-2 overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <motion.h1
                    className={cn(
                        "text-3xl font-bold bg-gradient-to-r from-neutral-950 via-neutral-400 to-neutral-950 dark:from-white dark:via-neutral-600 dark:to-white bg-[length:200%_100%] bg-clip-text text-transparent",
                        className
                    )}
                    animate={{
                        backgroundPosition: ["200% center", "-200% center"],
                    }}
                    transition={{
                        duration: 2.5,
                        ease: "linear",
                        repeat: Number.POSITIVE_INFINITY,
                    }}
                >
                    {text}
                </motion.h1>
            </motion.div>
        </div>
    );
}
