import { EmailLayout, P } from "./layout";

export function WelcomeEmail({ firstName, appUrl }: { firstName: string; appUrl: string }) {
  return (
    <EmailLayout
      preview="Ton cockpit est prêt : ajoute ton premier projet."
      label="Bienvenue"
      title={`Bienvenue${firstName ? `, ${firstName}` : ""} !`}
      cta={{ href: `${appUrl}/projets#nouveau`, text: "Ajouter mon premier projet" }}
    >
      <P>Ton cockpit Navpit est prêt. Pour bien démarrer, trois étapes :</P>
      <P>
        1. Ajoute tes projets, avec leurs liens.
        <br />
        2. Mets-en un seul en Focus.
        <br />
        3. Demande au copilote ta prochaine action.
      </P>
      <P>Une question ? Réponds simplement à cet email.</P>
    </EmailLayout>
  );
}
