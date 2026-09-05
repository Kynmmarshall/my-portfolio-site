import Link from "next/link";
import { ArrowLeft } from "lucide-react";
export default function NotFound() {
  return (
    <div className="shell prose-page">
      <p className="eyebrow">404 / NOT FOUND</p>
      <h1>This route ends here.</h1>
      <p>
        The project or page you&apos;re looking for isn&apos;t in this
        collection.
      </p>
      <Link href="/projects" className="button button-dark">
        <ArrowLeft size={16} /> Back to the work
      </Link>
    </div>
  );
}
