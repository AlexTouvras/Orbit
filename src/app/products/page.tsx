import type { Metadata } from "next";
import { ProductList } from "@/components/products/ProductList";
import { MissionHero } from "@/components/ui/MissionHero";
import { OrbitSignature } from "@/components/ui/OrbitSignature";
import { getEditableProfile } from "@/lib/profile-store";

export const metadata: Metadata = {
  title: "Products",
  description: "What I ship, you can run. Install it, or open it. The source stays in git.",
  alternates: { canonical: "/products" },
};

export default function ProductsPage() {
  const profile = getEditableProfile();

  return (
    <div className="space-y-16 sm:space-y-20">
      <MissionHero
        signature={<OrbitSignature variant="cyan" duration="95s" />}
        avatarUrl={profile.avatarUrl}
        title="Products"
        headline={{ line: "What I ship,", accent: "you can run." }}
        description="Install it, or open it. The source stays in git."
      />
      <ProductList />
    </div>
  );
}
