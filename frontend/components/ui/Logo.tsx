import Image from 'next/image';
import { cn } from '@/utils/cn';

interface LogoProps {
  /** Rendered size in pixels; the mark is square. */
  size?: number;
  className?: string;
  /** Show the wordmark beside the mark. */
  withWordmark?: boolean;
  wordmarkClassName?: string;
}

/**
 * The brand mark.
 *
 * A single component so the logo is defined once - previously each surface drew
 * its own `Globe` icon in a coloured box, which meant five slightly different
 * "logos" and nothing to change when the real one arrived.
 *
 * `priority` because it sits in the header on first paint, so lazy-loading it
 * would cost a visible pop-in.
 */
export function Logo({
  size = 32,
  className,
  withWordmark = false,
  wordmarkClassName,
}: LogoProps) {
  const mark = (
    <Image
      src="/logo.png"
      alt="TourismToolKit"
      width={size}
      height={size}
      priority
      className={cn('shrink-0', !withWordmark && className)}
    />
  );

  if (!withWordmark) return mark;

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      {mark}
      <span className={cn('font-semibold tracking-tight text-foreground', wordmarkClassName)}>
        TourismToolKit
      </span>
    </span>
  );
}
