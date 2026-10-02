"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ComponentProps, MouseEvent } from "react";
import { usePageTransition } from "./PageTransition";

type Props = ComponentProps<typeof Link>;

const isInternal = (href: string) => href.startsWith("/") && !href.startsWith("//");

/**
 * Drop-in for next/link that plays the curtain: it waits until the screen is covered, then changes
 * route (see PageTransition). New-tab clicks, downloads, external links and #anchors stay untouched.
 * It also prefetches the destination on hover and keyboard focus so the page is ready when covered.
 */
export function TransitionLink({ href, onClick, onPointerEnter, onFocus, target, download, ...rest }: Props) {
  const transition = usePageTransition();
  const router = useRouter();
  const path = typeof href === "string" ? href : undefined;

  const prefetch = () => {
    if (path && isInternal(path)) router.prefetch(path);
  };

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e);
    if (e.defaultPrevented || !transition || !path || !isInternal(path)) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if ((target && target !== "_self") || download !== undefined) return;
    if (path.startsWith("#") || (path.includes("#") && path.split("#")[0] === "")) return;
    e.preventDefault();
    transition.navigate(path);
  };

  return (
    <Link
      href={href}
      target={target}
      download={download}
      onClick={handleClick}
      onPointerEnter={(e) => {
        prefetch();
        onPointerEnter?.(e);
      }}
      onFocus={(e) => {
        prefetch();
        onFocus?.(e);
      }}
      {...rest}
    />
  );
}
