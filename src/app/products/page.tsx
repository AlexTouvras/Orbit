import type { Metadata } from "next";
import { ProductList } from "@/components/products/ProductList";
import { MissionHero } from "@/components/ui/MissionHero";
import { OrbitSignature } from "@/components/ui/OrbitSignature";
import { getEditableProfile } from "@/lib/profile-store";

export const metadata: Metadata = {
  title: "Products",
  description: "A page or a command a stranger can open.",
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
        headline={{ line: "I ship", accent: "a page." }}
        description="A page or a command a stranger can open."
      />
      <ProductList />
    </div>
  );
}
