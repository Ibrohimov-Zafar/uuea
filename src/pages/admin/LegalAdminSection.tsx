import { useState, useEffect, useCallback } from 'react';
import { Plus, Pencil, Trash2, RefreshCw, Scale } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import {
  adminListLegalResources,
  adminUpsertLegalResource,
  adminDeleteLegalResource,
  type LegalResourcePayload,
} from '@/api/client';
import type { LegalResource } from '@/types/types';
import { toast } from 'sonner';

const CATEGORIES = ['Qonunlar', 'Qarorlar', 'Biznes yangiliklari', "Huquqiy ma'lumotlar"];
const TYPES = [
  { value: 'law', label: 'Qonun' },
  { value: 'decree', label: 'Qaror' },
  { value: 'business_news', label: 'Biznes yangiligi' },
  { value: 'legal_info', label: "Huquqiy ma'lumot" },
];

const emptyForm = (): LegalResourcePayload => ({
  title: '',
  excerpt: '',
  body: '',
  category: 'Qonunlar',
  resource_type: 'law',
  source: 'UUEA',
  published_date: new Date().toISOString().slice(0, 10),
  is_featured: false,
  status: 'published',
});

export default function LegalAdminSection({ canManage }: { canManage: boolean }) {
  const [items, setItems] = useState<LegalResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<LegalResourcePayload>(emptyForm());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await adminListLegalResources());
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setForm(emptyForm());
    setDialogOpen(true);
  };

  const openEdit = (item: LegalResource) => {
    setForm({
      id: item.id,
      title: item.title,
      excerpt: item.excerpt,
      body: item.body,
      category: item.category,
      resource_type: item.resource_type,
      source: item.source,
      published_date: item.published_date?.slice(0, 10) || '',
      is_featured: Boolean(item.is_featured),
      status: item.status === 'draft' ? 'draft' : 'published',
    });
    setDialogOpen(true);
  };

  const submit = async () => {
    setSaving(true);
    try {
      await adminUpsertLegalResource(form);
      toast.success(form.id ? 'Yangilandi' : "Qo'shildi");
      setDialogOpen(false);
      load();
    } catch {
      toast.error('Saqlashda xatolik');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await adminDeleteLegalResource(deleteId);
      toast.success("O'chirildi");
      setDeleteId(null);
      load();
    } catch {
      toast.error("O'chirishda xatolik");
    }
  };

  if (loading) return <Skeleton className="h-40 bg-muted rounded-sm" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="text-sm text-muted-foreground">
          Jami: <span className="text-foreground font-semibold">{items.length}</span>
        </div>
        <div className="flex gap-2">
          <Button onClick={load} variant="ghost" size="sm" className="border border-border/40 rounded-sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
          {canManage && (
            <Button onClick={openCreate} size="sm" className="bg-primary text-primary-foreground rounded-sm">
              <Plus className="w-4 h-4 mr-1" /> Yangi material
            </Button>
          )}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="glass-card border-ancient rounded-sm p-10 text-center space-y-2">
          <Scale className="w-10 h-10 text-primary/30 mx-auto" />
          <p className="text-muted-foreground text-sm">Qonunlar materiallari yo&apos;q</p>
        </div>
      ) : (
        <div className="glass-card border-ancient rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50">
                  {['Sarlavha', 'Kategoriya', 'Holat', 'Sana', 'Amal'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {items.map((n) => (
                  <tr key={n.id} className="hover:bg-accent/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-foreground min-w-[280px]">
                      <div className="font-semibold line-clamp-1">{n.title}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">{n.excerpt}</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{n.category}</td>
                    <td className="px-4 py-3 text-xs whitespace-nowrap">
                      <span
                        className={cn(
                          'px-2 py-0.5 rounded-sm border',
                          n.status === 'published'
                            ? 'text-green-400 bg-green-400/10 border-green-400/20'
                            : 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
                        )}
                      >
                        {n.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                      {n.published_date}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {canManage && (
                        <div className="flex items-center gap-1">
                          <Button
                            onClick={() => openEdit(n)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-primary rounded-sm"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            onClick={() => setDeleteId(n.id)}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive rounded-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="glass-card border-ancient max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Tahrirlash' : 'Yangi material'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Sarlavha *</Label>
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="rounded-sm text-sm" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Qisqa tavsif *</Label>
              <Input value={form.excerpt} onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))} className="rounded-sm text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Kategoriya</Label>
                <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                  <SelectTrigger className="rounded-sm text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Turi</Label>
                <Select value={form.resource_type} onValueChange={(v) => setForm((f) => ({ ...f, resource_type: v }))}>
                  <SelectTrigger className="rounded-sm text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Manba</Label>
                <Input value={form.source} onChange={(e) => setForm((f) => ({ ...f, source: e.target.value }))} className="rounded-sm text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Sana</Label>
                <Input type="date" value={form.published_date} onChange={(e) => setForm((f) => ({ ...f, published_date: e.target.value }))} className="rounded-sm text-sm" />
              </div>
            </div>
            <div className="flex gap-4 items-center">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm((f) => ({ ...f, is_featured: e.target.checked }))}
                  className="accent-primary"
                />
                Asosiy (featured)
              </label>
              <Select value={form.status} onValueChange={(v: 'published' | 'draft') => setForm((f) => ({ ...f, status: v }))}>
                <SelectTrigger className="w-32 rounded-sm text-sm h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">published</SelectItem>
                  <SelectItem value="draft">draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">To&apos;liq matn *</Label>
              <textarea
                value={form.body}
                onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
                rows={8}
                className="w-full px-3 py-2 bg-background/60 border border-border/60 rounded-sm text-sm resize-y min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDialogOpen(false)} className="rounded-sm">Bekor</Button>
            <Button onClick={submit} disabled={saving} className="bg-primary text-primary-foreground rounded-sm">
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent className="glass-card border-ancient">
          <AlertDialogHeader>
            <AlertDialogTitle>O&apos;chirishni tasdiqlaysizmi?</AlertDialogTitle>
            <AlertDialogDescription>Bu amalni qaytarib bo&apos;lmaydi.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-sm">Bekor</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground rounded-sm">
              O&apos;chirish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
