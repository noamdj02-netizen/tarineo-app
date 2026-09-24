/** Exemples d’automatisations : un clic ouvre l’assistant avec la consigne. */
export const AUTOMATIONS = [
  {
    label: "Rédiger un mail",
    hint: "Rédige un mail de relance…",
    prompt:
      "Rédige un mail court et clair pour relancer mon dernier contact. Propose un objet et un corps prêts à copier.",
  },
  {
    label: "Résumer un fichier",
    hint: "Résume ce fichier…",
    prompt:
      "Lis le fichier que je viens de déposer et donne-moi : 3 points clés, les décisions à prendre, les prochaines actions.",
  },
  {
    label: "Schéma du parcours",
    hint: "Dessine le parcours client…",
    prompt:
      "Propose le parcours client de mon projet en Focus, en 5 étapes, prêt à coller dans un schéma.",
  },
  {
    label: "Post LinkedIn",
    hint: "Écris un post LinkedIn…",
    prompt:
      "Écris un post LinkedIn de 8 lignes pour annoncer l’avancement de mon projet en Focus. Ton direct, sans emojis.",
  },
] as const;
