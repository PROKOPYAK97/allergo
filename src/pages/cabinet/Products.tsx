import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import { DEMO_COMPANY_ID, useStore } from '@/lib/store';

export default function Products() {
  const store = useStore();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const products = store.products.filter((p) => p.companyId === DEMO_COMPANY_ID);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-500">{products.length} продукта</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-1" /> Новый продукт</Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-[#004e35]/15">
            <DialogHeader>
              <DialogTitle>Новый продукт</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Название</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Например: Печенье овсяное без глютена" />
              </div>
              <div>
                <Label>Категория</Label>
                <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Печенье, пряники, шоколад…" />
              </div>
              <Button
                className="w-full"
                disabled={!name.trim() || !category.trim()}
                onClick={() => {
                  store.addProduct({ name: name.trim(), category: category.trim(), photo: '🍪' });
                  setName(''); setCategory(''); setOpen(false);
                }}
              >
                Сохранить
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {products.map((p) => {
          const count = store.batches.filter((b) => b.productId === p.id).length;
          return (
            <Card key={p.id} className="border-[#004e35]/10 bg-card">
              <CardContent className="pt-5">
                <div className="flex items-start justify-between">
                  <span className="w-12 h-12 rounded-xl bg-[#004e35]/5 border border-[#004e35]/10 flex items-center justify-center text-2xl">
                    {p.photo ?? '📦'}
                  </span>
                  <Button
                    size="icon" variant="ghost"
                    onClick={() => { if (confirm(`Удалить «${p.name}» вместе с партиями?`)) store.deleteProduct(p.id); }}
                  >
                    <Trash2 className="w-4 h-4 text-zinc-500" />
                  </Button>
                </div>
                <p className="font-medium mt-2 text-zinc-800">{p.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{p.category}</Badge>
                  <span className="text-xs text-zinc-500">{count} партий</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
                                                                                     