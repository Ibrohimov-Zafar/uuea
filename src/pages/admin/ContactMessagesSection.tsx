import { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { adminContactMessages, adminDeleteContactMessage } from '@/api/client';
import { toast } from 'sonner';

type ContactMsg = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string | null;
  subject?: string | null;
  message: string;
  created_at: string;
};

export default function ContactMessagesSection() {
  const [messages, setMessages] = useState<ContactMsg[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const rows = await adminContactMessages();
    setMessages(rows as unknown as ContactMsg[]);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await adminDeleteContactMessage(deleteId);
    setDeleteId(null);
    toast.success("Xabar o'chirildi");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Aloqa formasi xabarlari</span>
        <Button onClick={load} variant="ghost" size="sm" className="text-muted-foreground hover:text-primary rounded-sm">
          <RefreshCw className="w-3.5 h-3.5 mr-1" /> Yangilash
        </Button>
      </div>
      {loading ? (
        <div className="space-y-2">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-sm" />)}</div>
      ) : messages.length === 0 ? (
        <div className="glass-card border-ancient rounded-sm p-10 text-center text-muted-foreground text-sm">
          Hali xabarlar yo'q
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map(m => (
            <div key={m.id} className="glass-card border-ancient rounded-sm p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground font-medium">
                    {m.first_name} {m.last_name}
                    <span className="text-muted-foreground font-normal"> · {m.email}</span>
                  </p>
                  {m.subject && <p className="text-xs text-primary mt-0.5">{m.subject}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {new Date(m.created_at).toLocaleString('uz-UZ')}
                    {m.phone ? ` · ${m.phone}` : ''}
                  </p>
                  {expanded === m.id ? (
                    <p className="text-sm text-muted-foreground mt-3 whitespace-pre-wrap leading-relaxed">{m.message}</p>
                  ) : (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{m.message}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs rounded-sm"
                    onClick={() => setExpanded(expanded === m.id ? null : m.id)}
                  >
                    {expanded === m.id ? 'Yopish' : "O'qish"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive rounded-sm"
                    onClick={() => setDeleteId(m.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent className="glass-card border-ancient">
          <AlertDialogHeader>
            <AlertDialogTitle>Xabarni o'chirish?</AlertDialogTitle>
            <AlertDialogDescription>Bu amalni qaytarib bo'lmaydi.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-sm">Bekor</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground rounded-sm">O'chirish</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
