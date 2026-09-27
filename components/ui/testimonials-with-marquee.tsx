"use client";

import { motion } from "framer-motion";
import { AnimatedTestimonials } from "@/components/ui/testimonials-with-marquee-utils/animated-testimonials";
import { LANDING_TESTIMONIALS } from "@/lib/site/content";

const testimonials = LANDING_TESTIMONIALS.map((t) => ({
  name: t.name,
  handle: t.role,
  description: t.quote,
  image: t.photo,
}));

/** Marquee d’avis — données Navpit, pas de citations inventées. */
export default function TestimonialsMarquee({
  title = "Ils avancent avec un seul projet en Focus.",
  text = "Retours de fondateurs solo qui ont remplacé le chaos d’onglets par un cockpit.",
  hideIntro = false,
}: {
  title?: string;
  text?: string;
  hideIntro?: boolean;
}) {
  const titleWords = title.split(" ");

  return (
    <section className="relative w-full bg-background">
      <div className="relative z-10 flex w-full flex-col items-center">
        {hideIntro ? null : (
        <div className="flex flex-col items-center gap-4 px-4 py-12 text-center md:py-16">
          <h2 className="font-display text-4xl font-semibold tracking-tightest text-balance text-foreground md:text-6xl">
            {titleWords.map((word, index) => (
              <motion.span
                key={`title-${word}-${index}`}
                initial={{ opacity: 0, filter: "blur(6px)", y: 12 }}
                whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.08,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="mr-2 inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="max-w-2xl px-4 text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            {text}
          </motion.p>
        </div>
        )}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.65 }}
          className="w-full"
        >
          <AnimatedTestimonials data={testimonials} />
        </motion.div>
      </div>
    </section>
  );
}
