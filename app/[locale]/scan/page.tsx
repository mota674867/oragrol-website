import { unstable_setRequestLocale } from "next-intl/server";
import OdoScanPage from "@/app/components/site/odo-scan";

export const metadata = {
  title: "Free Business Scan | ORAGROL",
  description: "Let ODO research your business and deliver a personalized report — free, within 24 hours. No sales call. No commitment.",
};

export default function ScanPage({ params: { locale } }: { params: { locale: string } }) {
  unstable_setRequestLocale(locale);
  return <OdoScanPage locale={locale} />;
}
