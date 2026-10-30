import Image from "next/image";
import type { FleetVehicle } from "@/domain/booking";
import { cn } from "@/lib/cn";
import { isRemoteImage } from "@/lib/remote-image";
import { fleetMedia } from "./fleet-media";
import styles from "./fleet-frame.module.css";

interface FleetFrameProps {
  vehicle?: FleetVehicle;
  src?: string;
  model?: string;
  /** Appended to the model name for the alt text, e.g. "black exterior". */
  altSuffix: string;
  sizes: string;
  /** Offsets the drift animation so neighbouring cards don't move in sync. */
  driftOffset?: number;
  className?: string;
}

/** Framed, slowly drifting vehicle photo with a light sweep on hover. */
export function FleetFrame({
  vehicle,
  src,
  model,
  altSuffix,
  sizes,
  driftOffset = 0,
  className,
}: FleetFrameProps) {
  const media = vehicle ? fleetMedia[vehicle] : undefined;
  const imageSrc = src || media?.src || "/media/fleet-first-2026-front.jpg";
  const imageModel = model || media?.model || "";

  return (
    <div className={cn(styles.frame, className)}>
      <div className={styles.clip}>
        <Image
          src={imageSrc}
          alt={`${imageModel} ${altSuffix}`.trim()}
          fill
          sizes={sizes}
          unoptimized={isRemoteImage(imageSrc)}
          className={styles.image}
          style={{ animationDelay: `${-driftOffset * 3.3}s` }}
        />
      </div>
      <div className={styles.reflection} aria-hidden="true" />
    </div>
  );
}
