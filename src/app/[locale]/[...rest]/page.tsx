import { notFound } from "next/navigation";

// Any unknown path under /ar or /en renders the localized not-found page.
export default function CatchAllPage() {
  notFound();
}
