"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Boxes,
  FileText,
  FolderKanban,
  ShieldCheck,
  Siren,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/identity", label: "Identity", icon: ShieldCheck },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/issue", label: "Issues", icon: Siren },
  { href: "/plm", label: "PLM", icon: Boxes },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav
      className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md"
      aria-label="Main navigation"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold">Modules</h2>
        <Badge variant="secondary" className="text-xs">
          v0.1
        </Badge>
      </div>

      <ul className="space-y-1" role="list">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 rounded-md border border-border bg-muted/50 p-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <p className="text-xs font-medium">SPEC-PLM-001</p>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Initial UI baseline and scaffolding.
        </p>
      </div>
    </nav>
  );
}
