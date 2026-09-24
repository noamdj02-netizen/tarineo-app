// Généré par scripts/build-design-data.mjs depuis « Studio Noam.html ».
// Ne pas modifier à la main : relancer `npm run design-data`.

export type KitComponent = { ic: string; n: string; w: string; h: string };

/** Composants landing (HTML qui utilise les variables --k-* du thème choisi). */
export const COMPONENTS: KitComponent[] = [
  {
    "ic": "mouse-pointer-click",
    "n": "Boutons",
    "w": "CTA principal plein, secondaire bordé, ghost pour les liens discrets.",
    "h": "<div class=\"k-row\"><a class=\"k-btn k-primary\" href=\"#\">Vérifier mon premier devis <i data-lucide=\"arrow-right\"></i></a><a class=\"k-btn k-second\" href=\"#\"><i data-lucide=\"play\"></i> Voir la démo</a><a class=\"k-btn k-ghost\" href=\"#\">Se connecter</a></div>"
  },
  {
    "ic": "megaphone",
    "n": "Badge annonce",
    "w": "Au-dessus du titre du hero. Une nouveauté ou une offre limitée.",
    "h": "<span class=\"k-pill\"><b>Nouveau</b> Alertes prix en temps réel <i data-lucide=\"chevron-right\"></i></span>"
  },
  {
    "ic": "panel-top",
    "n": "Navbar",
    "w": "Frame 01. Logo, 3-4 liens, 1 CTA. En sticky.",
    "h": "<nav class=\"k-nav\"><span class=\"k-logo\"><i></i>Tarineo</span><span class=\"k-links\"><span>Fonctionnement</span><span>Tarifs</span><span>FAQ</span></span><a class=\"k-btn k-primary\" href=\"#\" style=\"padding:8px 14px\">Essayer</a></nav>"
  },
  {
    "ic": "sparkles",
    "n": "Hero split",
    "w": "Frame 02. Texte à gauche, produit à droite. Le composant le plus important.",
    "h": "<section class=\"k-hero\"><div style=\"display:flex;flex-direction:column;gap:16px;align-items:flex-start\"><span class=\"k-pill\"><b>1 mois offert</b> 100 premières places</span><h2 class=\"k-h\">Arrêtez de payer vos fournitures trop cher.</h2><p class=\"k-muted\" style=\"margin:0\">Photographiez un devis fournisseur. Tarineo le compare à vos achats passés et surligne chaque hausse en 10 secondes.</p><div class=\"k-row\"><a class=\"k-btn k-primary\" href=\"#\">Vérifier mon premier devis <i data-lucide=\"arrow-right\"></i></a><a class=\"k-btn k-second\" href=\"#\"><i data-lucide=\"play\"></i> Démo 30 s</a></div><div class=\"k-proof k-muted\"><span class=\"k-avs\"><i></i><i></i><i></i></span>Sans carte bancaire · Résiliable en 1 clic</div></div><div class=\"k-card k-mock\"><div class=\"k-row\" style=\"justify-content:space-between\"><b>Devis Point P · n° 48213</b><span class=\"k-mono k-muted\" style=\"font-size:12px\">analysé en 9 s</span></div><div class=\"k-line\"><span>Tube PER Ø16 (100 m)</span><span class=\"k-okc\">84,90 €</span><span class=\"k-okc\">=</span></div><div class=\"k-line k-hl\"><span>Raccord laiton 1/2\"</span><span class=\"k-up\">6,40 €</span><span class=\"k-up\">+12 %</span></div><div class=\"k-line\"><span>Collier Atlas x50</span><span class=\"k-okc\">18,20 €</span><span class=\"k-okc\">−2 %</span></div><div class=\"k-line k-hl\"><span>Robinet ¼ tour</span><span class=\"k-up\">11,80 €</span><span class=\"k-up\">+9 %</span></div></div></section>"
  },
  {
    "ic": "badge-check",
    "n": "Bande de preuve",
    "w": "Frame 03. Sous le hero. Uniquement des infos vraies.",
    "h": "<div style=\"display:flex;flex-direction:column;gap:12px\"><p class=\"k-muted k-mono\" style=\"text-align:center;margin:0;font-size:12px;text-transform:uppercase;letter-spacing:.08em\">Compatible avec plus de 30 distributeurs</p><div class=\"k-marq\"><span>CEDEO</span><span>POINT P</span><span>REXEL</span><span>BROSSETTE</span><span>RICHARDSON</span></div></div>"
  },
  {
    "ic": "list-ordered",
    "n": "3 étapes",
    "w": "Frame 05. Prouver que c’est simple.",
    "h": "<div class=\"k-steps\"><div class=\"k-card k-step\"><div class=\"k-ico\"><i data-lucide=\"camera\"></i></div><span class=\"k-num\">01</span><h4 style=\"margin:2px 0 4px\">Photographiez</h4><p class=\"k-muted\" style=\"margin:0;font-size:14px\">Photo, PDF ou transfert du mail du fournisseur.</p></div><div class=\"k-card k-step\"><div class=\"k-ico\"><i data-lucide=\"scan-line\"></i></div><span class=\"k-num\">02</span><h4 style=\"margin:2px 0 4px\">Tarineo compare</h4><p class=\"k-muted\" style=\"margin:0;font-size:14px\">Chaque ligne face à vos 12 derniers mois d’achats.</p></div><div class=\"k-card k-step\"><div class=\"k-ico\"><i data-lucide=\"handshake\"></i></div><span class=\"k-num\">03</span><h4 style=\"margin:2px 0 4px\">Vous négociez</h4><p class=\"k-muted\" style=\"margin:0;font-size:14px\">Avec la preuve de la hausse sous les yeux.</p></div></div>"
  },
  {
    "ic": "layout-grid",
    "n": "Bento fonctionnalités",
    "w": "Frame 06. Grande case = fonction star.",
    "h": "<div class=\"k-bento\"><div class=\"k-card big\"><div class=\"k-ico\"><i data-lucide=\"bell-ring\"></i></div><h4>Alerte dès qu’un prix monte</h4><p>Notification sur votre téléphone avec la ligne, l’ancien prix et l’écart.</p><div class=\"k-bignum\" style=\"margin-top:14px\">+12 %</div><p>Raccord laiton 1/2\" · Point P</p></div><div class=\"k-card\"><div class=\"k-ico\"><i data-lucide=\"history\"></i></div><h4>Historique 12 mois</h4><p>Tous vos prix, ligne par ligne.</p></div><div class=\"k-card\"><div class=\"k-ico\"><i data-lucide=\"hard-hat\"></i></div><h4>Multi-chantiers</h4><p>Un compte, tous vos chantiers.</p></div><div class=\"k-card wide\"><div class=\"k-ico\"><i data-lucide=\"percent\"></i></div><h4>Marge calculée</h4><p>Vos prix d’achat réels alimentent vos devis clients.</p></div></div>"
  },
  {
    "ic": "trending-up",
    "n": "Cartes chiffres",
    "w": "Frame 09 ou dashboard. Chiffres réels seulement.",
    "h": "<div class=\"k-stats\"><div class=\"k-card k-stat\"><small>Économies ce mois</small><span class=\"v\">312 €</span><span class=\"k-delta\">+18 % vs août</span></div><div class=\"k-card k-stat\"><small>Devis analysés</small><span class=\"v\">47</span><span class=\"k-muted k-mono\" style=\"font-size:12px\">sur 150 inclus</span></div><div class=\"k-card k-stat\"><small>Hausses détectées</small><span class=\"v\">9</span><span class=\"k-delta\">3 à négocier</span></div></div>"
  },
  {
    "ic": "bell-ring",
    "n": "Notification alerte",
    "w": "Dans l’app ou en visuel marketing : montre le « moment wow ».",
    "h": "<div class=\"k-card k-toast\"><div class=\"k-ico\"><i data-lucide=\"triangle-alert\"></i></div><div><b>Hausse détectée chez Point P</b><p class=\"k-muted\" style=\"margin:2px 0 8px;font-size:14px\">Raccord laiton 1/2\" : 5,71 € → 6,40 € (+12 %). Vous l’achetiez moins cher en juin.</p><a class=\"k-btn k-second\" href=\"#\" style=\"padding:7px 12px;font-size:13px\">Voir le devis</a></div></div>"
  },
  {
    "ic": "quote",
    "n": "Témoignage",
    "w": "Frame 08. À remplir avec de VRAIS clients bêta.",
    "h": "<figure class=\"k-card k-quote\" style=\"margin:0\"><blockquote>« [Citation réelle du client : sa situation avant, et le résultat chiffré après.] »</blockquote><figcaption class=\"k-who\"><i></i><div><b>[Prénom N.]</b><br><span class=\"k-muted\">[Métier], [Ville]</span></div></figcaption></figure>"
  },
  {
    "ic": "credit-card",
    "n": "Tarifs 3 colonnes",
    "w": "Frame 10. Offre du milieu mise en avant.",
    "h": "<div class=\"k-price\"><div class=\"k-card k-plan\"><b>Starter</b><div class=\"p\">17 €<small class=\"k-muted\" style=\"font-size:14px\">/mois</small></div><ul><li><i data-lucide=\"check\"></i>150 documents / mois</li><li><i data-lucide=\"check\"></i>3 distributeurs</li><li><i data-lucide=\"check\"></i>Historique 12 mois</li></ul><a class=\"k-btn k-second\" href=\"#\">Commencer</a></div><div class=\"k-card k-plan pop\"><span class=\"tag\">Le plus choisi</span><b>Pro</b><div class=\"p\">29 €<small class=\"k-muted\" style=\"font-size:14px\">/mois</small></div><ul><li><i data-lucide=\"check\"></i>400 documents / mois</li><li><i data-lucide=\"check\"></i>Tous les distributeurs</li><li><i data-lucide=\"check\"></i>Marge automatique</li></ul><a class=\"k-btn k-primary\" href=\"#\">Essayer 1 mois offert</a></div><div class=\"k-card k-plan\"><b>Équipe</b><div class=\"p\">49 €<small class=\"k-muted\" style=\"font-size:14px\">/mois</small></div><ul><li><i data-lucide=\"check\"></i>1 000 documents / mois</li><li><i data-lucide=\"check\"></i>Plusieurs utilisateurs</li><li><i data-lucide=\"check\"></i>Dashboard dirigeant</li></ul><a class=\"k-btn k-second\" href=\"#\">Commencer</a></div></div>"
  },
  {
    "ic": "circle-help",
    "n": "FAQ accordéon",
    "w": "Frame 11. Les vraies objections.",
    "h": "<div class=\"k-faq\"><details open><summary>Mes devis restent-ils privés ? <i data-lucide=\"plus\"></i></summary><p>Oui. Vos documents ne sont visibles que par votre compte et ne sont jamais partagés avec les distributeurs.</p></details><details><summary>Je peux arrêter quand je veux ? <i data-lucide=\"plus\"></i></summary><p>Oui, résiliation en un clic depuis votre compte, sans engagement.</p></details><details><summary>Ça marche avec mon fournisseur ? <i data-lucide=\"plus\"></i></summary><p>Plus de 30 distributeurs sont reconnus. Sinon, Tarineo lit quand même le PDF.</p></details></div>"
  },
  {
    "ic": "mail",
    "n": "Capture email",
    "w": "Newsletter, liste d’attente, lead magnet.",
    "h": "<form class=\"k-form\" onsubmit=\"event.preventDefault()\"><input type=\"email\" placeholder=\"votre@email.fr\" aria-label=\"Email\"><button class=\"k-btn k-primary\" type=\"submit\">Recevoir la démo</button></form><p class=\"k-muted\" style=\"font-size:12.5px;margin:8px 0 0\">Pas de spam. Désinscription en 1 clic.</p>"
  },
  {
    "ic": "rocket",
    "n": "CTA final",
    "w": "Frame 12. Répète la promesse.",
    "h": "<div class=\"k-cta\"><h2 class=\"k-h\">Votre premier devis vérifié en 10 secondes.</h2><p style=\"margin:10px 0 18px;opacity:.85\">1 mois offert · Sans carte bancaire</p><a class=\"k-btn\" href=\"#\">Vérifier mon devis <i data-lucide=\"arrow-right\"></i></a></div>"
  },
  {
    "ic": "panel-bottom",
    "n": "Footer",
    "w": "Liens légaux, contact, SEO.",
    "h": "<footer class=\"k-foot\"><div><span class=\"k-logo\"><i></i>Tarineo</span><p class=\"k-muted\" style=\"margin:8px 0 0\">Le bon prix sur chaque devis fournisseur.</p></div><div><h5>Produit</h5><a href=\"#\">Fonctionnement</a><a href=\"#\">Tarifs</a></div><div><h5>Aide</h5><a href=\"#\">FAQ</a><a href=\"#\">Contact</a></div><div><h5>Légal</h5><a href=\"#\">Mentions</a><a href=\"#\">CGV</a></div></footer>"
  }
];
