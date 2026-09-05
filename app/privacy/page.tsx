import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy" };
export default function PrivacyPage() {
  return (
    <article className="shell prose-page">
      <p className="eyebrow">LAST UPDATED / SEPTEMBER 2026</p>
      <h1>Privacy, plainly.</h1>
      <h2>No advertising or visitor tracking</h2>
      <p>
        This portfolio does not install advertising trackers or collect visitor
        analytics. Fonts and project media are served locally. Your
        artistic/wireframe preference is stored in your browser&apos;s local
        storage, not on our server.
      </p>
      <h2>Developer insights</h2>
      <p>
        Repository and contribution data comes from public GitHub information.
        Project reachability checks run on the server against a fixed list of
        public project addresses. Neither panel tracks your browsing activity.
      </p>
      <h2>Contact and external websites</h2>
      <p>
        Email links open your own email application. Any message you choose to
        send is used to respond to your inquiry. Links to GitHub, LinkedIn,
        itch.io, and project websites take you to services with their own
        privacy practices.
      </p>
      <h2>Technical logs</h2>
      <p>
        The hosting server may record standard request information, including IP
        addresses, for security and troubleshooting. No contact form submissions
        are stored by this website.
      </p>
      <h2>Questions</h2>
      <p>
        <a href="mailto:kynmmarshall@gmail.com">kynmmarshall@gmail.com</a>
      </p>
    </article>
  );
}
