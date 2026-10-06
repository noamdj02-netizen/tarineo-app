import { AccueilContent } from "../components/AccueilContent";

export function AccueilPanel({ progress = 1 }: { progress?: number }) {
  return <AccueilContent progress={progress} />;
}
