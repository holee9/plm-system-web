"use client";

import Link from "next/link";
import {
  Bell,
  Boxes,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Search,
  ShieldCheck,
  Siren,
} from "lucide-react";
import { useState } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const topMenus = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/identity", label: "Identity", icon: ShieldCheck },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/issue", label: "Issues", icon: Siren },
  { href: "/plm", label: "PLM", icon: Boxes },
];

export function Navbar() {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-colors duration-300">
      <div className="container mx-auto flex h-16 items-center gap-3 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <div className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground transition-transform hover:scale-105 active:scale-95">
            <Boxes className="h-4 w-4" />
          </div>
          <span className="text-base">PLM System</span>
        </Link>

        <Badge variant="secondary" className="hidden md:inline-flex">
          SPEC-PLM-001
        </Badge>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {topMenus.map((menu) => (
            <Button key={menu.href} asChild variant="ghost" className="gap-2">
              <Link href={menu.href}>
                <menu.icon className="h-4 w-4" />
                {menu.label}
              </Link>
            </Button>
          ))}
        </nav>

        <div className="ml-auto hidden w-full max-w-xs items-center md:flex">
          <div className="relative w-full">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search project, issue, part..." />
          </div>
        </div>

        {/* Mobile search toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
          aria-label="Toggle search"
          aria-expanded={isMobileSearchOpen}
        >
          <Search className="h-5 w-5" />
        </Button>

        <ThemeToggle />

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="Open modules"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-4">
            <SheetHeader className="mb-4">
              <SheetTitle>Modules</SheetTitle>
            </SheetHeader>
            <Sidebar />
          </SheetContent>
        </Sheet>

        <UserMenu />
      </div>

      {/* Mobile search bar */}
      {isMobileSearchOpen && (
        <div className="border-t border-border px-4 py-3 md:hidden animate-in slide-in-from-top duration-300">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search project, issue, part..."
              autoFocus
            />
          </div>
        </div>
      )}
    </header>
  );
}
