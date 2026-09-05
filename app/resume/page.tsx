import type { Metadata } from "next";
import { ResumeDocument } from "@/components/resume/ResumeDocument";
import "./resume.css";

export const metadata: Metadata = {
  title: "Resume & engineering profile",
  description:
    "Kamdeu Yamdjeuson Neil Marshall's engineering profile, selected projects, technical toolkit, and contact details. Print-friendly and ready to save as PDF.",
};
export default function ResumePage() {
  return <ResumeDocument />;
}
