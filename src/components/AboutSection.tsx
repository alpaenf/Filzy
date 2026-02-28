"use client";

import { motion } from "framer-motion";

const stats = [
  { value: "8+", label: "Built-in Tools" },
  { value: "100%", label: "Client-side Processing" },
  { value: "0 KB", label: "Data Uploaded to Server" },
  { value: "Free", label: "Always & Forever" },
];

export default function AboutSection() {
  return (
    <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-sky-500 mb-3">
              About Filzy
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
              Your files stay on{" "}
              <span className="bg-gradient-to-r from-sky-500 to-violet-600 bg-clip-text text-transparent">
                your device
              </span>
            </h2>
            <div className="space-y-4 text-gray-500 dark:text-gray-400 leading-relaxed">
              <p>
                Filzy is a collection of powerful file processing tools that run entirely 
                in your browser using modern web technologies like WebAssembly, Canvas API, 
                and client-side machine learning.
              </p>
              <p>
                Unlike traditional online tools that upload your files to remote servers, 
                Filzy processes everything locally. This means faster results, zero privacy risk,
                and no dependency on network connectivity after the initial page load.
              </p>
              <p>
                Built with Next.js 16, React, and libraries like{" "}
                <code className="text-sky-500 font-mono text-sm bg-sky-50 dark:bg-sky-950/30 px-1.5 py-0.5 rounded">
                  browser-image-compression
                </code>
                ,{" "}
                <code className="text-violet-500 font-mono text-sm bg-violet-50 dark:bg-violet-950/30 px-1.5 py-0.5 rounded">
                  pdf-lib
                </code>
                , and{" "}
                <code className="text-rose-500 font-mono text-sm bg-rose-50 dark:bg-rose-950/30 px-1.5 py-0.5 rounded">
                  @imgly/background-removal
                </code>
                .
              </p>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            {stats.map(({ value, label }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
                className="bg-slate-50 dark:bg-gray-800 rounded-2xl p-6 text-center hover:shadow-md transition-shadow duration-300"
              >
                <p className="text-4xl font-bold bg-gradient-to-r from-sky-500 to-violet-600 bg-clip-text text-transparent mb-1">
                  {value}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
