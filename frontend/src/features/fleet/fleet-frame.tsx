import Image from "next/image";
import type { FleetVehicle } from "@/domain/booking";
import { cn } from "@/lib/cn";
import { fleetMedia } from "./fleet-media";
import styles from "./fleet-frame.module.css";

interface FleetFrameProps {
  vehicle: FleetVehicle;
  /** Appended to the model name for the alt text, e.g. "black exterior". */
  altSuffix: string;
  sizes: string;
  /** Offsets the drift animation so neighbouring cards don't move in sync. */
  driftOffset?: number;
  className?: string;
}

/** Framed, slowly drifting vehicle photo with a light sweep on hover. */
export function FleetFrame({ vehicle, altSuffix, sizes, driftOffset = 0, className }: FleetFrameProps) {
  const media = fleetMedia[vehicle];

  return (
    <div className={cn(styles.frame, className)}>
      <div className={styles.clip}>
        <Image
          src={media.src}
          alt={`${media.model} ${altSuffix}`}
          fill
          sizes={sizes}
          className={styles.image}
          style={{ animationDelay: `${-driftOffset * 3.3}s` }}
        />
      </div>
      <div className={styles.reflection} aria-hidden="true" />
    </div>
  );
}
