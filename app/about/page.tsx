import { pageMetadata } from "@/lib/seo";
import AboutHero from "@/components/about/AboutHero";
import Journey from "@/components/about/Journey";
import Founder from "@/components/about/Founder";
import { MouldDivider } from "@/components/svg/MouldPattern";

export const metadata = pageMetadata(
  "Our story",
  "The Desi Pakwan started in a kitchen in Bihar, with a mould older than the founder. Handmade thekua and chakli — atta, gud, ghee, patience.",
  "/about"
);

export default function AboutPage() {
  return (
    <div className="bg-paan-900">
      <AboutHero />

      <MouldDivider className="text-kesariya-500" />

      <Journey />

      <Founder />
    </div>
  );
}
