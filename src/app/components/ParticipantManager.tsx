import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Trash2, Plus, Users } from 'lucide-react';
import type { Participant } from '../App';

interface ParticipantManagerProps {
  initialParticipants: Participant[];
  onComplete: (participants: Participant[]) => void;
}

const PRESET_COLORS = [
  '#F48B5C', // Orange (primary)
  '#4ECDC4', // Teal (secondary)
  '#F9C74F', // Yellow
  '#E76F51', // Red-orange
  '#90BE6D', // Green
  '#E63946', // Red
  '#577590', // Blue
  '#B392AC', // Purple
];

export function ParticipantManager({ initialParticipants, onComplete }: ParticipantManagerProps) {
  const [participants, setParticipants] = useState<Participant[]>(initialParticipants);

  const addParticipant = () => {
    const colorIndex = participants.length % PRESET_COLORS.length;
    const nextLetter = String.fromCharCode(65 + participants.length); // A=65, B=66, etc.
    setParticipants([...participants, {
      id: nextLetter.toLowerCase(),
      name: nextLetter,
      color: PRESET_COLORS[colorIndex],
    }]);
  };

  const updateParticipant = (id: string, name: string) => {
    setParticipants(participants.map(p => 
      p.id === id ? { ...p, name } : p
    ));
  };

  const deleteParticipant = (id: string) => {
    if (participants.length > 1) {
      setParticipants(participants.filter(p => p.id !== id));
    }
  };

  const handleContinue = () => {
    // Filter out participants with empty names
    const validParticipants = participants.filter(p => p.name.trim() !== '');
    if (validParticipants.length > 0) {
      onComplete(validParticipants);
    }
  };

  const isValid = participants.some(p => p.name.trim() !== '');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-[#2D1B0E] mb-2">Who's splitting the bill?</h2>
        <p className="text-[#6B5744]">Add everyone who shared this meal</p>
      </div>

      <div className="space-y-3">
        {participants.map((participant, index) => (
          <div key={participant.id} className="flex gap-3 items-center">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 border-4 border-[#3D2817] shadow-[2px_2px_0px_0px_#3D2817]"
              style={{ backgroundColor: participant.color }}
            >
              {participant.name ? participant.name[0].toUpperCase() : <Users className="w-6 h-6" />}
            </div>
            <Input
              value={participant.name}
              onChange={(e) => updateParticipant(participant.id, e.target.value)}
              placeholder="Edit name (optional)"
              className="flex-1"
            />
            {participants.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => deleteParticipant(participant.id)}
              >
                <Trash2 className="w-5 h-5 text-[#E63946]" strokeWidth={2.5} />
              </Button>
            )}
          </div>
        ))}
      </div>

      <Button variant="outline" onClick={addParticipant} className="w-full">
        <Plus className="w-4 h-4 mr-2" />
        Add Person
      </Button>

      <div className="pt-4">
        <Button 
          onClick={handleContinue} 
          className="w-full" 
          size="lg"
          disabled={!isValid}
        >
          Continue to Assign Items
        </Button>
      </div>
    </div>
  );
}