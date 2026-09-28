import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

/** Brand palette for emails (inline styles only — email clients ignore CSS files). */
export const c = {
  paan: "#0C2B1E",
  paanSoft: "#1B4A35",
  kesariya: "#FF8A3C",
  sindoor: "#B03A0F",
  mehndi: "#2E7D57",
  pista: "#F4F8EA",
  pistaDeep: "#E3EDD2",
  cream: "#FFF3DC",
  white: "#FFFFFF",
  muted: "#5B6B62",
};

export const font =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

/** Referenced as <img src="cid:logo"> — the PNG is attached inline when sending. */
export const LOGO_CID = "tdp-logo";

export function EmailLayout({
  preview,
  children,
  siteUrl,
}: {
  preview: string;
  children: ReactNode;
  siteUrl: string;
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: c.pista, fontFamily: font, margin: 0, padding: "24px 0" }}>
        <Container style={{ maxWidth: "600px", margin: "0 auto", backgroundColor: c.white, borderRadius: "20px", overflow: "hidden", border: `1px solid ${c.pistaDeep}` }}>
          {/* header */}
          <Section style={{ backgroundColor: c.cream, padding: "22px 32px", textAlign: "center", borderBottom: `4px solid ${c.kesariya}` }}>
            <Link href={siteUrl}>
              <Img src={`cid:${LOGO_CID}`} width="200" alt="The Desi Pakwan" style={{ margin: "0 auto", display: "block" }} />
            </Link>
          </Section>

          {children}

          {/* footer */}
          <Section style={{ backgroundColor: c.paan, padding: "22px 32px", textAlign: "center" }}>
            <Text style={{ color: c.kesariya, fontSize: "15px", fontWeight: 700, margin: "0 0 4px" }}>
              Ghar ka khasta, ghar tak.
            </Text>
            <Text style={{ color: "#C9D6CD", fontSize: "12px", lineHeight: "18px", margin: 0 }}>
              Handmade thekua &amp; namkeen from a Bihari kitchen · Desi ghee · No maida · No preservatives
            </Text>
            <Text style={{ color: "#8FA398", fontSize: "12px", margin: "10px 0 0" }}>
              <Link href={siteUrl} style={{ color: "#C9D6CD", textDecoration: "underline" }}>
                {siteUrl.replace(/^https?:\/\//, "")}
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

/** Label on the left, value on the right; stacks cleanly on narrow phone screens. */
export function DetailRows({ rows }: { rows: { label: string; value: ReactNode }[] }) {
  return (
    <table width="100%" cellPadding={0} cellSpacing={0} style={{ borderCollapse: "collapse" }}>
      <tbody>
        {rows.map((r, i) => (
          <tr key={r.label}>
            <td
              style={{
                padding: "8px 12px 8px 0",
                borderTop: i === 0 ? "none" : `1px solid ${c.pistaDeep}`,
                color: c.muted,
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                verticalAlign: "top",
                width: "90px",
              }}
            >
              {r.label}
            </td>
            <td
              align="right"
              style={{
                padding: "8px 0",
                borderTop: i === 0 ? "none" : `1px solid ${c.pistaDeep}`,
                color: c.paan,
                fontSize: "14px",
                fontWeight: 700,
                verticalAlign: "top",
                overflowWrap: "anywhere",
              }}
            >
              {r.value}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function formatAmount(n: number) {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function formatDate(d: Date) {
  return d.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
