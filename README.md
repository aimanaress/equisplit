# EquiSplit

A smart receipt-splitting application that fairly divides bills using proportional tax and tip calculation.

## Features

### 1. **OCR Receipt Scanning**
- Upload receipt photos via drag-and-drop or file picker
- Real-time OCR processing using OCR.space API
- Automatic extraction of items, prices, tax, and tip

### 2. **Smart Parsing**
- Intelligent text parsing to identify receipt components
- Manual editing capability for any parsing errors
- Add/remove items as needed

### 3. **Participant Management**
- Add multiple people with color-coded avatars
- Visual identification for easy assignment

### 4. **Flexible Item Assignment**
- **Shared by All**: Split equally among everyone
- **Shared by Some**: Select specific people who shared an item
- **Personal**: Assign to a single person

### 5. **Fair Share Calculation**
- Proportional tax & tip distribution based on each person's subtotal
- Formula: `Total_i = Items_i + (Items_i / Subtotal) × (Tax + Tip)`
- Ensures fair splitting where higher spenders pay more tax/tip

### 6. **Visual Breakdown**
- Pie chart showing percentage split
- Per-person itemized breakdown
- Copy-to-clipboard summary for payment requests

## How It Works

### The Math Behind Fair Splitting

Traditional "split equally" doesn't account for who ordered what. EquiSplit uses proportional distribution:

**Example:**
- Person A orders $50 steak
- Person B orders $10 salad
- Tax + Tip = $15

**Traditional split (unfair):**
- Each pays: $30 + $7.50 = $37.50

**EquiSplit (fair):**
- Person A: $50 + ($50/$60 × $15) = $62.50
- Person B: $10 + ($10/$60 × $15) = $12.50

Person A pays 83% of fees because they ordered 83% of the food.

## Tech Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React
- **OCR**: OCR.space API
- **Backend**: Supabase Edge Functions (Hono)
- **Notifications**: Sonner

## User Flow

1. **Upload** → Upload receipt photo or use demo data
2. **Review** → Verify extracted items and adjust
3. **Add People** → Add all participants
4. **Assign** → Mark who ordered what
5. **Results** → View fair breakdown with proportional fees
6. **Share** → Copy summary for payment requests

## Privacy

- No data persistence - all calculations happen client-side
- Receipt images stored in browser memory only
- Session-only storage (clears on refresh)
- Perfect for one-time splits

## Development Notes

### OCR Integration
The OCR.space API is called through a Supabase Edge Function to keep the API key secure. The endpoint:
- Receives base64-encoded images
- Calls OCR.space with secure API key
- Returns extracted text to frontend

### Edge Cases Handled
- Division by zero (empty subtotals)
- Items with no assignments
- Proportional distribution when subtotal doesn't match items
- File size validation (4MB limit)
- Image type validation

## Future Enhancements

Ideas for extending the app:
- Payment integration (Venmo, Zelle, PayPal)
- Multi-currency support
- Group/recurring splits
- QR code sharing
- Split history (with opt-in persistence)
# equisplit
# equisplit
