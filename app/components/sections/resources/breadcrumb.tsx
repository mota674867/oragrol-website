import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Icon } from "../../ui";

/**
 * Article breadcrumb — Resources / [Article Title]. Real `next/link`
 * trail (not a styled-only decoration), matching 21st.dev's "Link
 * Breadcrumb" pattern (chevron separator, current page as plain text)
 * researched for this template.
 */
export function ArticleBreadcrumb({ title }: { title: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 font-body text-sm text-text-muted">
      <Link href="/resources" className="transition-colors duration-150 hover:text-text-primary">
        Resources
      </Link>
      <Icon icon={ChevronRight} size="sm" />
      <span aria-current="page" className="truncate text-text-secondary">
        {title}
      </span>
    </nav>
  );
}
