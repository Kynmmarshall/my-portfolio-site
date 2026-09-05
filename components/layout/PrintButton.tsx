"use client";
import { Printer } from "lucide-react";
export function PrintButton() { return <button className="button button-light no-print" onClick={() => window.print()}><Printer size={16} /> Print / Save PDF</button>; }