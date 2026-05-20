import { PageHeader } from "@/components/app-shell";

export default function ResearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <PageHeader
        eyebrow="Research"
        title="Research Command"
        description="From scattered curiosity to publishable research."
      />
      {children}
    </div>
  );
}
