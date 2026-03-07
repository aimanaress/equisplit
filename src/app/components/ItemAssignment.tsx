import { useState } from 'react';
import { Button } from './ui/button';
import { Users, Check } from 'lucide-react';
import type { ReceiptItem, Participant } from '../App';

interface ItemAssignmentProps {
  items: ReceiptItem[];
  participants: Participant[];
  onComplete: (items: ReceiptItem[]) => void;
}

export function ItemAssignment({ items, participants, onComplete }: ItemAssignmentProps) {
  const [assignedItems, setAssignedItems] = useState<ReceiptItem[]>(items);

  const isSharedByAll = (item: ReceiptItem): boolean => {
    return item.assignedTo.length === participants.length;
  };

  const toggleSharedByAll = (itemId: string) => {
    setAssignedItems(assignedItems.map(item => {
      if (item.id !== itemId) return item;

      const allSelected = isSharedByAll(item);
      return {
        ...item,
        assignedTo: allSelected ? [participants[0].id] : participants.map(p => p.id),
        isPersonal: false,
      };
    }));
  };

  const toggleParticipant = (itemId: string, participantId: string) => {
    setAssignedItems(assignedItems.map(item => {
      if (item.id !== itemId) return item;

      const isAssigned = item.assignedTo.includes(participantId);
      let newAssignedTo: string[];

      if (isAssigned) {
        newAssignedTo = item.assignedTo.filter(id => id !== participantId);
        // Keep at least one person assigned
        if (newAssignedTo.length === 0) {
          newAssignedTo = [participantId];
        }
      } else {
        newAssignedTo = [...item.assignedTo, participantId];
      }

      return {
        ...item,
        assignedTo: newAssignedTo,
        isPersonal: newAssignedTo.length === 1,
      };
    }));
  };

  const handleContinue = () => {
    onComplete(assignedItems);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#2D1B0E] mb-2">Assign Items</h2>
        <p className="text-[#6B5744]">Click avatars to mark who ordered what</p>
      </div>

      <div className="space-y-4">
        {assignedItems.map((item) => {
          const sharedByAll = isSharedByAll(item);

          return (
            <div key={item.id} className="border-4 border-[#3D2817] rounded-xl p-5 space-y-3 bg-[#FDFCFA] shadow-[3px_3px_0px_0px_#3D2817]">
              {/* Item Header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-[#2D1B0E] text-lg">{item.name}</h3>
                  <p className="text-sm text-[#6B5744] font-semibold">${item.price.toFixed(2)}</p>
                </div>
              </div>

              {/* Assignment Controls */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Shared by All Button */}
                <Button
                  variant={sharedByAll ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleSharedByAll(item.id)}
                  className={`flex-shrink-0 font-bold ${
                    sharedByAll 
                      ? 'bg-[#F48B5C] text-white border-3 border-[#3D2817] shadow-[3px_3px_0px_0px_#3D2817] hover:bg-[#E67A4C]' 
                      : 'bg-[#F5EFE6] text-[#6B5744] border-2 border-[#3D2817]/40 shadow-none hover:bg-[#E8DCC8]'
                  }`}
                >
                  All
                </Button>

                {/* Participant Avatars */}
                <div className="flex flex-wrap gap-2">
                  {participants.map((participant) => {
                    const isAssigned = item.assignedTo.includes(participant.id);
                    return (
                      <button
                        key={participant.id}
                        onClick={() => toggleParticipant(item.id, participant.id)}
                        className="relative group"
                        title={participant.name}
                      >
                        <div
                          className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all border-3 ${
                            isAssigned
                              ? 'opacity-100 border-[#3D2817] border-4 scale-110'
                              : 'opacity-50 hover:opacity-70 border-[#3D2817] border-2'
                          }`}
                          style={{ 
                            backgroundColor: participant.color,
                          }}
                        >
                          {participant.name[0].toUpperCase()}
                        </div>
                        
                        {/* Checkmark for selected */}
                        {isAssigned && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#4ECDC4] rounded-full flex items-center justify-center border-3 border-[#3D2817]">
                            <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                          </div>
                        )}

                        {/* Name tooltip on hover */}
                        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                          <div className="bg-[#2D1B0E] text-white text-xs px-2 py-1 rounded-md font-semibold border-2 border-[#3D2817]">
                            {participant.name}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <Button onClick={handleContinue} className="w-full" size="lg">
        View Final Breakdown
      </Button>
    </div>
  );
}