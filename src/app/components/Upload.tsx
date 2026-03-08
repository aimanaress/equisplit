import { useState, useCallback } from 'react';
import { Upload as UploadIcon, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/button';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { toast } from 'sonner';

interface UploadProps {
  onOCRComplete: (image: string, text: string) => void;
}

export function Upload({ onOCRComplete }: UploadProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const processImage = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Validate file size (max 4MB for OCR.space free tier)
      if (file.size > 4 * 1024 * 1024) {
        throw new Error('Image size must be less than 4MB');
      }

      // Convert to base64
      const reader = new FileReader();
      reader.readAsDataURL(file);
      
      await new Promise((resolve, reject) => {
        reader.onload = resolve;
        reader.onerror = reject;
      });

      const base64Image = reader.result as string;

      // Call our backend to process OCR securely (use env var or relative path for production)
      const apiUrl = import.meta.env.DEV ? (import.meta.env.VITE_API_URL || 'http://localhost:3001') : '';
      const fetchUrl = `${apiUrl}/.netlify/functions/make-server-a01cb916/ocr-process`;
      console.log('Attempting to fetch from:', fetchUrl); // Added logging
      const response = await fetch(fetchUrl, { // Changed apiUrl to fetchUrl
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: base64Image }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        // Enhanced error logging and alerting
        console.error('OCR processing failed with response:', errorData);
        alert(`OCR processing failed: ${errorData.error || response.statusText || 'Unknown error'}`); // Added alert
        throw new Error(errorData.error || 'OCR processing failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        // Enhanced error logging and alerting
        console.error('OCR processing failed with result:', result);
        alert(`OCR processing failed: ${result.message || 'Unknown error'}`); // Added alert
        throw new Error('OCR processing failed');
      }

      toast.success('Receipt processed successfully!');
      onOCRComplete(base64Image, result.text);
    } catch (err) {
      console.error('OCR error in catch block:', err); // Enhanced error logging
      const errorMessage = err instanceof Error ? err.message : 'Failed to process image';
      alert(`OCR Error: ${errorMessage}`); // Added alert for catch block errors
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      processImage(file);
    } else {
      setError('Please upload an image file');
    }
  }, []);

  const loadDemoReceipt = () => {
    // Demo receipt data
    const demoText = `MIKE'S RESTAURANT
123 Main Street
New York, NY 10001

Order #12345
Date: 03/01/2026

Truffle Fries         $12.00
Ribeye Steak          $45.00
Caesar Salad          $14.00
Margherita Pizza      $18.00
House Wine (Bottle)   $32.00

SUBTOTAL             $121.00
TAX                   $10.89
TIP                   $21.78
TOTAL                $153.67

Thank you for dining with us!`;

    onOCRComplete('demo', demoText);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-[#2D1B0E] mb-2">Upload Receipt</h2>
        <p className="text-[#6B5744]">Take a photo or upload an image of your receipt</p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-4 border-dashed rounded-xl p-12 text-center transition-all ${
          dragActive
            ? 'border-[#F48B5C] bg-[#F48B5C]/10 shadow-[4px_4px_0px_0px_#F48B5C]'
            : 'border-[#3D2817] hover:border-[#6B5744] bg-[#FDFCFA]'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {isProcessing ? (
          <div className="space-y-4">
            <Loader2 className="w-16 h-16 mx-auto text-[#F48B5C] animate-spin" />
            <p className="text-[#2D1B0E] font-semibold">Processing receipt...</p>
            <p className="text-sm text-[#6B5744]">This may take a few seconds</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ImageIcon className="w-16 h-16 mx-auto text-[#6B5744]" />
            <div>
              <label htmlFor="file-upload">
                <Button asChild>
                  <span className="cursor-pointer">
                    <UploadIcon className="w-4 h-4 mr-2" />
                    Choose File
                  </span>
                </Button>
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={isProcessing}
              />
            </div>
            <p className="text-sm text-[#6B5744]">
              or drag and drop your receipt image here
            </p>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 bg-[#E63946]/10 border-4 border-[#E63946] rounded-lg">
          <p className="text-[#E63946] text-sm font-semibold">{error}</p>
        </div>
      )}

      {/* Demo Button */}
      <div className="text-center pt-4 border-t-4 border-[#3D2817] border-dashed">
        <p className="text-sm text-[#6B5744] mb-3 font-medium">Don't have a receipt handy?</p>
        <Button variant="outline" onClick={loadDemoReceipt}>
          Load Demo Receipt
        </Button>
      </div>
    </div>
  );
}