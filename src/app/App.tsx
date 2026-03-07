import { useState } from 'react';
import { Upload } from './components/Upload';
import { ReceiptEditor } from './components/ReceiptEditor';
import { ParticipantManager } from './components/ParticipantManager';
import { ItemAssignment } from './components/ItemAssignment';
import { FinalBreakdown } from './components/FinalBreakdown';
import { Button } from './components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Toaster } from 'sonner';

export interface ReceiptItem {
  id: string;
  name: string;
  price: number;
  assignedTo: string[];
  isPersonal: boolean;
}

export interface Participant {
  id: string;
  name: string;
  color: string;
}

export interface ReceiptMetadata {
  subtotal: number;
  tax: number;
  tip: number;
  grandTotal: number;
}

type Step = 'upload' | 'edit' | 'participants' | 'assign' | 'results';

export default function App() {
  const [currentStep, setCurrentStep] = useState<Step>('upload');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [ocrText, setOcrText] = useState<string>('');
  const [items, setItems] = useState<ReceiptItem[]>([]);
  const [metadata, setMetadata] = useState<ReceiptMetadata>({
    subtotal: 0,
    tax: 0,
    tip: 0,
    grandTotal: 0,
  });
  const [participants, setParticipants] = useState<Participant[]>([
    { id: 'a', name: 'A', color: '#F48B5C' },
  ]);

  const handleOCRComplete = (image: string, text: string) => {
    setReceiptImage(image);
    setOcrText(text);
    setCurrentStep('edit');
  };

  const handleEditComplete = (editedItems: ReceiptItem[], editedMetadata: ReceiptMetadata) => {
    setItems(editedItems);
    setMetadata(editedMetadata);
    setCurrentStep('participants');
  };

  const handleParticipantsComplete = (updatedParticipants: Participant[]) => {
    setParticipants(updatedParticipants);
    // Initialize all items to be shared by all participants
    const updatedItems = items.map(item => ({
      ...item,
      assignedTo: updatedParticipants.map(p => p.id),
      isPersonal: false,
    }));
    setItems(updatedItems);
    setCurrentStep('assign');
  };

  const handleAssignmentComplete = (assignedItems: ReceiptItem[]) => {
    setItems(assignedItems);
    setCurrentStep('results');
  };

  const handleStartOver = () => {
    setCurrentStep('upload');
    setReceiptImage(null);
    setOcrText('');
    setItems([]);
    setMetadata({
      subtotal: 0,
      tax: 0,
      tip: 0,
      grandTotal: 0,
    });
    setParticipants([{ id: 'a', name: 'A', color: '#F48B5C' }]);
  };

  const handleBack = () => {
    const stepOrder: Step[] = ['upload', 'edit', 'participants', 'assign', 'results'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-[#E8DCC8] bg-gradient-to-br from-[#E8DCC8] to-[#D4C4B0]">
      <Toaster position="top-center" />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-[#2D1B0E] mb-2 tracking-tight">EquiSplit</h1>
          <p className="text-[#6B5744] text-lg">Split receipts fairly with proportional tax & tip</p>
        </div>

        {/* Back Button */}
        {currentStep !== 'upload' && (
          <Button
            variant="ghost"
            onClick={handleBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        )}

        {/* Step Content */}
        <div className="bg-[#F5F1E8] rounded-xl shadow-[6px_6px_0px_0px_#3D2817] border-4 border-[#3D2817] p-[24px]">
          {currentStep === 'upload' && (
            <Upload onOCRComplete={handleOCRComplete} />
          )}

          {currentStep === 'edit' && (
            <ReceiptEditor
              ocrText={ocrText}
              receiptImage={receiptImage}
              onComplete={handleEditComplete}
            />
          )}

          {currentStep === 'participants' && (
            <ParticipantManager
              initialParticipants={participants}
              onComplete={handleParticipantsComplete}
            />
          )}

          {currentStep === 'assign' && (
            <ItemAssignment
              items={items}
              participants={participants}
              onComplete={handleAssignmentComplete}
            />
          )}

          {currentStep === 'results' && (
            <FinalBreakdown
              items={items}
              participants={participants}
              metadata={metadata}
              onStartOver={handleStartOver}
            />
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 flex justify-center items-center gap-3">
          {['upload', 'edit', 'participants', 'assign', 'results'].map((step, index) => {
            const stepOrder: Step[] = ['upload', 'edit', 'participants', 'assign', 'results'];
            const currentIndex = stepOrder.indexOf(currentStep);
            const isActive = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <div
                key={step}
                className={`rounded-full transition-all border-2 border-[#3D2817] ${
                  isActive
                    ? 'w-4 h-4 bg-[#F48B5C]'
                    : isCompleted
                    ? 'w-3 h-3 bg-[#4ECDC4]'
                    : 'w-3 h-3 bg-[#E8DCC8]'
                }`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}