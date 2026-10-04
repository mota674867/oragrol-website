import { setRequestLocale } from "next-intl/server";
import OutboundTool from "./outbound-tool";

export const metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

export default function OutboundPage({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <OutboundTool />;
}
