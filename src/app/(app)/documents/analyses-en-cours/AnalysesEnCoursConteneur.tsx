"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AnimationImportRecu } from "./AnimationImportRecu";
import { SuiviAnalysesLot } from "./SuiviAnalysesLot";

export function AnalysesEnCoursConteneur({
  documentIds,
  redirectWhenDone,
  marquerOnboarding,
  titre,
}: {
  documentIds: string[];
  redirectWhenDone: string;
  marquerOnboarding: boolean;
  titre: string;
}) {
  const [afficherIntro, setAfficherIntro] = useState(true);

  return (
    <>
      <AnimatePresence mode="wait">
        {afficherIntro && (
          <AnimationImportRecu
            key="intro"
            nbDocuments={documentIds.length}
            onTermine={() => setAfficherIntro(false)}
          />
        )}
      </AnimatePresence>

      {!afficherIntro && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <SuiviAnalysesLot
            documentIds={documentIds}
            redirectWhenDone={redirectWhenDone}
            marquerOnboarding={marquerOnboarding}
            titre={titre}
          />
        </motion.div>
      )}
    </>
  );
}
