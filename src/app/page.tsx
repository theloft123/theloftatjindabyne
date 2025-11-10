import { AccessGate } from "@/components/AccessGate";
import { LandingShell } from "@/components/LandingShell";
import { AccessProvider } from "@/context/AccessContext";
import { SiteContentProvider } from "@/context/SiteContentContext";

export default function Home() {
  return (
    <AccessProvider>
      <AccessGate>
        <SiteContentProvider>
          <LandingShell />
        </SiteContentProvider>
      </AccessGate>
    </AccessProvider>
  );
}
