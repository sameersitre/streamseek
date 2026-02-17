import Link from "next/link";

interface NavLink {
  href: string;
  label: string;
}

interface DesktopNavProps {
  navLinks: NavLink[];
  pathname: string;
}

export default function DesktopNav({ navLinks, pathname }: DesktopNavProps) {
  return (
    <div className="hidden items-center gap-1 md:flex">
      {navLinks.map(({ href, label }) => {
        const isActive = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "text-accent"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
