import { useMemo } from 'react';
import { Button } from './ui/button';
import { Copy, RotateCcw } from 'lucide-react';
import type { ReceiptItem, Participant, ReceiptMetadata } from '../App';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { toast } from 'sonner';

interface FinalBreakdownProps {
  items: ReceiptItem[];
  participants: Participant[];
  metadata: ReceiptMetadata;
  onStartOver: () => void;
}

interface PersonBreakdown {
  participant: Participant;
  items: Array<{ name: string; amount: number; isShared: boolean }>;
  itemsTotal: number;
  proportionalFees: number;
  total: number;
}

export function FinalBreakdown({ items, participants, metadata, onStartOver }: FinalBreakdownProps) {
  const breakdowns = useMemo(() => {
    const result: PersonBreakdown[] = [];
    const totalFees = metadata.tax + metadata.tip;

    for (const participant of participants) {
      const personItems: Array<{ name: string; amount: number; isShared: boolean }> = [];
      let itemsTotal = 0;

      // Calculate this person's share of each item
      for (const item of items) {
        if (item.assignedTo.includes(participant.id)) {
          const shareCount = item.assignedTo.length;
          const amount = item.price / shareCount;
          itemsTotal += amount;
          personItems.push({
            name: item.name,
            amount,
            isShared: shareCount > 1,
          });
        }
      }

      // Calculate proportional fees
      // Formula: (person's items / subtotal) × (tax + tip)
      const proportionalFees = metadata.subtotal > 0
        ? (itemsTotal / metadata.subtotal) * totalFees
        : 0;

      const total = itemsTotal + proportionalFees;

      result.push({
        participant,
        items: personItems,
        itemsTotal,
        proportionalFees,
        total,
      });
    }

    return result;
  }, [items, participants, metadata]);

  const chartData = breakdowns.map(b => ({
    name: b.participant.name,
    value: b.total,
    color: b.participant.color,
  }));

  const copyToClipboard = async () => {
    try {
      let text = '💰 Receipt Split Summary\n\n';
      text += `Total Bill: $${metadata.grandTotal.toFixed(2)}\n`;
      text += `Subtotal: $${metadata.subtotal.toFixed(2)}\n`;
      text += `Tax: $${metadata.tax.toFixed(2)}\n`;
      text += `Tip: $${metadata.tip.toFixed(2)}\n\n`;
      text += '---\n\n';

      for (const breakdown of breakdowns) {
        text += `${breakdown.participant.name}: $${breakdown.total.toFixed(2)}\n`;
        for (const item of breakdown.items) {
          const shareInfo = item.isShared ? ' (shared)' : '';
          text += `  • ${item.name}${shareInfo}: $${item.amount.toFixed(2)}\n`;
        }
        text += `  • Tax & Tip (proportional): $${breakdown.proportionalFees.toFixed(2)}\n`;
        text += '\n';
      }

      await navigator.clipboard.writeText(text);
      toast.success('Summary copied to clipboard!');
    } catch (error) {
      console.error('Clipboard error:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#2D1B0E] mb-2">Final Breakdown</h2>
        <p className="text-[#6B5744]">Fair split with proportional tax & tip</p>
      </div>

      {/* Chart */}
      <div className="bg-[#E8DCC8] rounded-xl p-6 border-4 border-[#3D2817] shadow-[4px_4px_0px_0px_#3D2817]">
        <h3 className="text-lg font-bold mb-4 text-center text-[#2D1B0E]">Split Visualization</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              stroke="#3D2817"
              strokeWidth={3}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => `$${value.toFixed(2)}`}
              contentStyle={{
                backgroundColor: '#F5F1E8',
                border: '3px solid #3D2817',
                borderRadius: '8px',
                fontWeight: 'bold',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Individual Breakdowns */}
      <div className="space-y-4">
        {breakdowns.map((breakdown) => (
          <div key={breakdown.participant.id} className="border-4 border-[#3D2817] rounded-xl p-5 bg-[#FDFCFA] shadow-[3px_3px_0px_0px_#3D2817]">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-lg border-4 border-[#3D2817] shadow-[2px_2px_0px_0px_#3D2817]"
                style={{ backgroundColor: breakdown.participant.color }}
              >
                {breakdown.participant.name[0].toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-[#2D1B0E]">{breakdown.participant.name}</h3>
                <p className="text-2xl font-bold text-[#F48B5C]">
                  ${breakdown.total.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="font-bold text-[#2D1B0E]">Items:</div>
              {breakdown.items.map((item, index) => (
                <div key={index} className="flex justify-between text-[#6B5744] pl-4">
                  <span>
                    {item.name}
                    {item.isShared && (
                      <span className="text-xs text-[#6B5744] ml-1">(shared)</span>
                    )}
                  </span>
                  <span className="font-semibold">${item.amount.toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t-3 border-[#3D2817]">
                <span className="text-[#2D1B0E] font-semibold">Items Subtotal:</span>
                <span className="font-bold">${breakdown.itemsTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#6B5744]">
                <span className="font-medium">Tax & Tip (proportional):</span>
                <span className="font-semibold">${breakdown.proportionalFees.toFixed(2)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t-3 border-[#3D2817] font-bold">
                <span className="text-[#2D1B0E]">Total:</span>
                <span className="text-[#F48B5C]">${breakdown.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total Verification */}
      <div className="bg-[#4ECDC4]/20 border-4 border-[#4ECDC4] rounded-xl p-4">
        <div className="flex justify-between items-center">
          <span className="font-bold text-[#2D1B0E]">Total (Verification):</span>
          <span className="text-xl font-bold text-[#2D1B0E]">
            ${breakdowns.reduce((sum, b) => sum + b.total, 0).toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-[#6B5744] mt-1 font-semibold">
          Original bill: ${metadata.grandTotal.toFixed(2)}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={copyToClipboard} className="flex-1" size="lg">
          <Copy className="w-4 h-4 mr-2" />
          Copy Summary
        </Button>
        <Button onClick={onStartOver} variant="outline" size="lg">
          <RotateCcw className="w-4 h-4 mr-2" />
          New Receipt
        </Button>
      </div>

      {/* Info Box */}
      <div className="bg-[#90BE6D]/20 border-4 border-[#90BE6D] rounded-xl p-4 text-sm text-[#2D1B0E]">
        <p className="font-bold mb-1">✨ Fair Split Applied</p>
        <p className="font-medium">
          Tax and tip were distributed proportionally based on each person's share of the subtotal.
          This ensures everyone pays their fair share!
        </p>
      </div>
    </div>
  );
}