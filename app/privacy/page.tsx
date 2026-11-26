import type { Metadata } from "next";
import { T } from "@/components/i18n/T";

export const metadata: Metadata = { title: "Privacy" };
export default function PrivacyPage() {
  return (
    <article className="shell prose-page" data-scene="reading">
      <p className="eyebrow">
        <T
          en="LAST UPDATED / SEPTEMBER 2026"
          fr="DERNIÈRE MISE À JOUR / SEPTEMBRE 2026"
        />
      </p>
      <h1>
        <T en="Privacy, plainly." fr="La confidentialité, simplement." />
      </h1>
      <h2>
        <T
          en="No advertising or visitor tracking"
          fr="Ni publicité ni suivi des visiteurs"
        />
      </h2>
      <p>
        <T
          en="This portfolio does not install advertising trackers or collect visitor analytics. Fonts and project media are served locally. Your visual preferences are stored in your browser's local storage, not on our server. The color theme follows your device setting on every fresh page load. A manual light or dark selection lasts only for the current visit and is not saved."
          fr="Ce portfolio n'installe aucun traceur publicitaire et ne collecte aucune statistique sur les visiteurs. Les polices et les médias des projets sont servis localement. Vos préférences visuelles sont enregistrées dans le stockage local de votre navigateur, et non sur notre serveur. Le thème de couleur suit le réglage de votre appareil à chaque nouveau chargement de page. Un choix manuel de thème clair ou sombre ne dure que le temps de la visite en cours et n'est pas enregistré."
        />
      </p>
      <h2>
        <T en="Language" fr="Langue" />
      </h2>
      <p>
        <T
          en="Your language choice (English or French) is stored in your browser's local storage so the site can remember it. It stays on your device and is never sent to a server. Until you choose, the site follows your browser's language."
          fr="Votre choix de langue (anglais ou français) est enregistré dans le stockage local de votre navigateur pour que le site s'en souvienne. Il reste sur votre appareil et n'est jamais envoyé à un serveur. Tant que vous n'avez pas choisi, le site suit la langue de votre navigateur."
        />
      </p>
      <h2>
        <T en="Developer insights" fr="Statistiques de développement" />
      </h2>
      <p>
        <T
          en="Repository and contribution data comes from public GitHub information. Project reachability checks run on the server against a fixed list of public project addresses. Neither panel tracks your browsing activity."
          fr="Les données sur les dépôts et les contributions proviennent d'informations publiques de GitHub. Les vérifications d'accessibilité des projets s'exécutent sur le serveur, sur une liste fixe d'adresses de projets publics. Aucun de ces panneaux ne suit votre activité de navigation."
        />
      </p>
      <h2>
        <T en="Optional device tilt" fr="Inclinaison de l'appareil (facultatif)" />
      </h2>
      <p>
        <T
          en="On supported secure mobile browsers, you can enable device tilt to move the background camera. A permission request is made only after you choose that control when the browser requires one. Orientation values are used locally, are not stored or transmitted, and are ignored while effects are paused, reduced motion is enabled, or the page is hidden. Camera, microphone, and location access are not used."
          fr="Sur les navigateurs mobiles sécurisés compatibles, vous pouvez activer l'inclinaison de l'appareil pour déplacer la caméra de l'arrière-plan. Une demande d'autorisation n'est faite qu'après que vous avez choisi cette commande, lorsque le navigateur l'exige. Les valeurs d'orientation sont utilisées localement, ne sont ni stockées ni transmises, et sont ignorées lorsque les effets sont en pause, que la réduction des animations est activée ou que la page est masquée. L'accès à la caméra, au microphone et à la localisation n'est pas utilisé."
        />
      </p>
      <h2>
        <T en="Contact and external websites" fr="Contact et sites externes" />
      </h2>
      <p>
        <T
          en="Email links open your own email application. Any message you choose to send is used to respond to your inquiry. Links to GitHub, LinkedIn, itch.io, and project websites take you to services with their own privacy practices."
          fr="Les liens e-mail ouvrent votre propre application de messagerie. Tout message que vous choisissez d'envoyer sert à répondre à votre demande. Les liens vers GitHub, LinkedIn, itch.io et les sites des projets vous mènent vers des services qui ont leurs propres pratiques de confidentialité."
        />
      </p>
      <h2>
        <T en="Technical logs" fr="Journaux techniques" />
      </h2>
      <p>
        <T
          en="The hosting server may record standard request information, including IP addresses, for security and troubleshooting. No contact form submissions are stored by this website."
          fr="Le serveur d'hébergement peut enregistrer des informations de requête standard, notamment les adresses IP, à des fins de sécurité et de dépannage. Aucun envoi de formulaire de contact n'est stocké par ce site."
        />
      </p>
      <h2>
        <T en="Questions" fr="Questions" />
      </h2>
      <p>
        <a href="mailto:kynmmarshall@gmail.com">kynmmarshall@gmail.com</a>
      </p>
    </article>
  );
}
