import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Trash2, Plus } from 'lucide-react';
import type { ReceiptItem, ReceiptMetadata } from '../App';

interface ReceiptEditorProps {
  ocrText: string;
  receiptImage: string | null;
  onComplete: (items: ReceiptItem[], metadata: ReceiptMetadata) => void;
}

export function ReceiptEditor({ ocrText, receiptImage, onComplete }: ReceiptEditorProps) {
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [metadata, setMetadata] = useState<ReceiptMetadata>({
    subtotal: 0,
    tax: 0,
    tip: 0,
    grandTotal: 0,
  });

  useEffect(() => {
    // Parse OCR text
    const parsed = parseReceiptText(ocrText);
    setItems(parsed.items);
    setMetadata(parsed.metadata);
  }, [ocrText]);

  const parseReceiptText = (text: string): { items: ReceiptItem[], metadata: ReceiptMetadata } => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const items: ReceiptItem[] = [];
    let subtotal = 0;
    let tax = 0;
    let tip = 0;
    let grandTotal = 0;

    // Common patterns for prices
    const pricePattern = /\$?\s*(\d+\.?\d*)/;
    
    for (const line of lines) {
      const lowerLine = line.toLowerCase();
      
      // Check for metadata lines
      if (lowerLine.includes('subtotal')) {
        const match = line.match(pricePattern);
        if (match) subtotal = parseFloat(match[1]);
        continue;
      }
      if (lowerLine.includes('tax')) {
        const match = line.match(pricePattern);
        if (match) tax = parseFloat(match[1]);
        continue;
      }
      if (lowerLine.includes('tip') || lowerLine.includes('gratuity')) {
        const match = line.match(pricePattern);
        if (match) tip = parseFloat(match[1]);
        continue;
      }
      if (lowerLine.includes('total') && !lowerLine.includes('subtotal')) {
        const match = line.match(pricePattern);
        if (match) grandTotal = parseFloat(match[1]);
        continue;
      }

      // Try to parse as item line (multiple patterns)
      const itemMatch = line.match(/^(.+?)\s+\$?\s*(\d+\.?\d*)$/) || 
                       line.match(/^(.+?)\s+(\d+\.\d{2})$/);
      
      if (itemMatch) {
        const name = itemMatch[1].trim();
        const price = parseFloat(itemMatch[2]);
        
        // Skip if it looks like metadata or invalid
        if (name.toLowerCase().includes('total') || 
            name.toLowerCase().includes('tax') ||
            name.toLowerCase().includes('tip') ||
            name.toLowerCase().includes('change') ||
            name.toLowerCase().includes('cash') ||
            name.toLowerCase().includes('card') ||
            price === 0 ||
            isNaN(price)) {
          continue;
        }

        items.push({
          id: Math.random().toString(36).substr(2, 9),
          name,
          price,
          assignedTo: [],
          isPersonal: false,
        });
      }
    }

    // Calculate missing values
    if (subtotal === 0 && items.length > 0) {
      subtotal = items.reduce((sum, item) => sum + item.price, 0);
    }
    if (grandTotal === 0) {
      grandTotal = subtotal + tax + tip;
    }

    return {
      items,
      metadata: { subtotal, tax, tip, grandTotal },
    };
  };

  const updateItem = (id: string, field: 'name' | 'price', value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const deleteItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const addItem = () => {
    setItems([...items, {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      price: 0,
      assignedTo: [],
      isPersonal: false,
    }]);
  };

  const updateMetadata = (field: keyof ReceiptMetadata, value: number) => {
    setMetadata({ ...metadata, [field]: value });
  };

  const handleContinue = () => {
    // Recalculate subtotal and grand total
    const calculatedSubtotal = items.reduce((sum, item) => sum + item.price, 0);
    const calculatedGrandTotal = calculatedSubtotal + metadata.tax + metadata.tip;
    
    onComplete(items, {
      ...metadata,
      subtotal: calculatedSubtotal,
      grandTotal: calculatedGrandTotal,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#2D1B0E] mb-2">Review & Edit Items</h2>
        <p className="text-[#6B5744]">Verify the extracted items and adjust as needed</p>
      </div>

      {/* Receipt Image Preview */}
      {receiptImage && receiptImage !== 'demo' && (
        <div className="bg-[#E8DCC8] rounded-xl p-4 border-4 border-[#3D2817]">
          <img 
            src={receiptImage} 
            alt="Receipt" 
            className="max-h-64 mx-auto rounded-lg shadow-[4px_4px_0px_0px_#3D2817] border-2 border-[#3D2817]"
          />
        </div>
      )}

      {/* Items List */}
      <div className="space-y-3">
        <Label className="text-lg font-bold text-[#2D1B0E]">Items</Label>
        {items.map((item) => (
          <div key={item.id} className="flex flex-col md:flex-row gap-2 items-stretch md:items-center pb-3 border-b border-dashed border-[#3D2817]/40">
            <Input
              value={item.name}
              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
              placeholder="Item name"
              className="flex-1"
            />
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                step="0.01"
                value={item.price}
                onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className="w-28 flex-1 md:flex-initial"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteItem(item.id)}
                className="flex-shrink-0 bg-[#FFE5DD] border-3 border-[#3D2817] hover:bg-[#FFCCC2] shadow-[2px_2px_0px_0px_#3D2817]"
              >
                <Trash2 className="w-5 h-5 text-[#E63946]" strokeWidth={2.5} />
              </Button>
            </div>
          </div>
        ))}
        <Button variant="outline" onClick={addItem} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t-4 border-dashed border-[#3D2817]">
        <div>
          <Label htmlFor="tax" className="text-[#2D1B0E] font-bold">Tax</Label>
          <Input
            id="tax"
            type="number"
            step="0.01"
            value={metadata.tax}
            onChange={(e) => updateMetadata('tax', parseFloat(e.target.value) || 0)}
          />
        </div>
        <div>
          <Label htmlFor="tip" className="text-[#2D1B0E] font-bold">Tip</Label>
          <Input
            id="tip"
            type="number"
            step="0.01"
            value={metadata.tip}
            onChange={(e) => updateMetadata('tip', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="bg-[#E8DCC8] rounded-xl p-5 space-y-2 border-4 border-[#3D2817] shadow-[3px_3px_0px_0px_#3D2817]">
        <div className="flex justify-between text-sm">
          <span className="text-[#6B5744] font-semibold">Subtotal:</span>
          <span className="font-bold text-[#2D1B0E]">${items.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#6B5744] font-semibold">Tax:</span>
          <span className="font-bold text-[#2D1B0E]">${metadata.tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-[#6B5744] font-semibold">Tip:</span>
          <span className="font-bold text-[#2D1B0E]">${metadata.tip.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-lg font-bold pt-3 border-t-4 border-[#3D2817]">
          <span className="text-[#2D1B0E]">Total:</span>
          <span className="text-[#F48B5C]">${(items.reduce((sum, item) => sum + item.price, 0) + metadata.tax + metadata.tip).toFixed(2)}</span>
        </div>
      </div>

      <Button onClick={handleContinue} className="w-full" size="lg">
        Continue to Add People
      </Button>
    </div>
  );
}