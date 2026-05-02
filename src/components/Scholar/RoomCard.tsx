import React from 'react';
import { EditorialCard } from './EditorialCard';

export type RoomStatus = 'live' | 'scheduled' | 'ended';

interface RoomCardProps {
  title: string;
  hostLine: React.ReactNode;
  description?: React.ReactNode;
  status?: RoomStatus;
  statusLabel?: string;
  avatars?: { id: string; src?: string; name: string }[];
  peopleLabel?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const statusStyle: Record<RoomStatus, string> = {
  live: 'bg-accent-gold text-ink',
  scheduled: 'bg-chip text-ink dark:text-ink-on-dark border border-divider dark:border-divider-on-dark',
  ended: 'bg-subtle text-muted-ink dark:text-muted-ink-on-dark',
};

/**
 * Study Room card composite. Hairline border, status chip top-end,
 * avatar stack + people count + actions below a hairline divider.
 */
export const RoomCard: React.FC<RoomCardProps> = ({
  title,
  hostLine,
  description,
  status,
  statusLabel,
  avatars = [],
  peopleLabel,
  primaryAction,
  secondaryAction,
  onClick,
  className = '',
}) => {
  return (
    <EditorialCard
      hover
      className={`relative flex flex-col ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {status && statusLabel ? (
        <span
          className={`absolute top-3 end-3 text-[10px] font-semibold tracking-[0.14em] uppercase px-2 py-0.5 rounded-[4px] ${statusStyle[status]}`}
        >
          {statusLabel}
        </span>
      ) : null}

      <h3 className="font-display text-xl text-ink dark:text-ink-on-dark pe-20">{title}</h3>
      <p className="mt-1 text-sm text-secondary-ink dark:text-muted-ink-on-dark">{hostLine}</p>
      {description ? (
        <p className="mt-3 text-sm text-secondary-ink dark:text-muted-ink-on-dark line-clamp-3">
          {description}
        </p>
      ) : null}

      <hr className="hairline border-divider dark:border-divider-on-dark my-4" />

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {avatars.length > 0 ? (
            <div className="flex -space-x-2 rtl:space-x-reverse">
              {avatars.slice(0, 4).map((a) =>
                a.src ? (
                  <img
                    key={a.id}
                    src={a.src}
                    alt={a.name}
                    className="h-7 w-7 rounded-full border border-divider dark:border-divider-on-dark object-cover"
                  />
                ) : (
                  <div
                    key={a.id}
                    className="h-7 w-7 rounded-full border border-divider dark:border-divider-on-dark bg-chip flex items-center justify-center text-[10px] font-semibold text-ink dark:text-ink-on-dark"
                  >
                    {a.name.slice(0, 2).toUpperCase()}
                  </div>
                ),
              )}
            </div>
          ) : null}
          {peopleLabel ? (
            <span className="text-xs text-muted-ink dark:text-muted-ink-on-dark truncate">
              {peopleLabel}
            </span>
          ) : null}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {secondaryAction}
          {primaryAction}
        </div>
      </div>
    </EditorialCard>
  );
};

export default RoomCard;
