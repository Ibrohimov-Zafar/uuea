import { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, Calendar, ShieldAlert, MessageSquare, Info, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/contexts/NotificationContext';
import type { Notification, NotificationType } from '@/types/types';

function typeIcon(type: NotificationType) {
  const cls = 'w-4 h-4 shrink-0';
  if (type === 'new_event') return <Calendar className={cn(cls, 'text-primary')} />;
  if (type === 'membership_expiring') return <ShieldAlert className={cn(cls, 'text-yellow-400')} />;
  if (type === 'membership_expired') return <ShieldAlert className={cn(cls, 'text-destructive')} />;
  if (type === 'new_message') return <MessageSquare className={cn(cls, 'text-blue-400')} />;
  return <Info className={cn(cls, 'text-muted-foreground')} />;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Hozirgina';
  if (min < 60) return `${min} daqiqa oldin`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} soat oldin`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} kun oldin`;
  return new Date(iso).toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short' });
}

function NotifItem({ n, onRead, onDismiss }: { n: Notification; onRead: () => void; onDismiss: () => void }) {
  const inner = (
    <div
      onClick={onRead}
      className={cn(
        'group flex items-start gap-3 px-4 py-3 transition-colors cursor-pointer relative',
        n.is_read ? 'opacity-60 hover:opacity-80' : 'hover:bg-primary/5',
      )}
    >
      {/* unread dot */}
      {!n.is_read && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_6px_rgba(212,175,55,0.6)]" />
      )}

      <div className="mt-0.5">{typeIcon(n.type)}</div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-foreground leading-snug text-balance">{n.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 text-pretty">{n.body}</p>
        <p className="text-[10px] text-muted-foreground/50 mt-1 tracking-wide">{timeAgo(n.created_at)}</p>
      </div>

      <div className="flex flex-col gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {n.link && (
          <Link
            to={n.link}
            onClick={e => e.stopPropagation()}
            className="w-5 h-5 flex items-center justify-center rounded-sm hover:bg-primary/15 text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="w-3 h-3" />
          </Link>
        )}
        <button
          onClick={e => { e.stopPropagation(); onDismiss(); }}
          className="w-5 h-5 flex items-center justify-center rounded-sm hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
  return inner;
}

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, dismiss } = useNotifications();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(o => !o)}
        className={cn(
          'relative w-9 h-9 flex items-center justify-center rounded-sm border transition-all',
          open
            ? 'bg-primary/10 border-primary/40 text-primary'
            : 'border-border/40 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5'
        )}
        aria-label="Bildirishnomalar"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-0.5 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center shadow-[0_0_8px_rgba(212,175,55,0.5)] animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-11 w-80 z-50 rounded-sm border border-border/60 bg-navy shadow-2xl overflow-hidden"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,175,55,0.08)' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 bg-navy-light">
            <div className="flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-semibold text-foreground tracking-wide">Bildirishnomalar</span>
              {unreadCount > 0 && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-primary/15 text-primary border border-primary/20">
                  {unreadCount} yangi
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary px-2 py-1 rounded-sm hover:bg-primary/10 transition-colors"
                >
                  <CheckCheck className="w-3 h-3" />
                  Hammasini o'qish
                </button>
              )}
              <button onClick={() => setOpen(false)} className="w-6 h-6 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-sm">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Constellation divider */}
          <div className="h-px relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          </div>

          {/* List */}
          <div className="overflow-y-auto max-h-[340px] divide-y divide-border/20">
            {notifications.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Bell className="w-8 h-8 text-muted-foreground/20 mx-auto" />
                <p className="text-xs text-muted-foreground">Bildirishnomalar yo'q</p>
              </div>
            ) : (
              notifications.map(n => (
                <NotifItem
                  key={n.id}
                  n={n}
                  onRead={() => markRead(n.id)}
                  onDismiss={() => dismiss(n.id)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-border/30 bg-navy-light flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">{notifications.length} ta bildirishnoma</span>
              <button
                onClick={async () => {
                  for (const n of notifications) await dismiss(n.id);
                }}
                className="text-[10px] text-muted-foreground hover:text-destructive transition-colors"
              >
                Hammasini o'chirish
              </button>
            </div>
          )}

          {/* Bottom rune accent */}
          <div className="h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        </div>
      )}
    </div>
  );
}

export { useNotifications };
