This is a comprehensive Technical Specification for your receipt-splitting application. Since we are aiming for an "advanced" level, we will focus on a cloud-native mobile architecture that utilizes Large Language Models (LLMs) to handle the messy reality of physical receipts.
1. System Overview

Project Name: EquiSplit (Placeholder)
Core Objective: To automate the transition from a physical receipt to a fair, person-specific expense report using OCR (Optical Character Recognition) and intelligent item assignment.
2. High-Level Architecture

The system follows a Mobile-First Client-Server model.

    Client (Frontend): React Native or Flutter (for cross-platform iOS/Android support).

    API Layer: Node.js or Python (FastAPI) to handle image uploads and logic.

    Vision Engine: Google Cloud Vision API or AWS Textract (for raw text extraction).

    Intelligence Layer: Gemini 1.5 Flash (to structure raw text into JSON).

    State Management: Local storage (Zustand or Redux) for real-time calculation without constant database calls.

3. Data Schema (JSON Structure)

This is how the system "thinks" about a receipt once it has been scanned.
JSON

{
  "receipt_id": "uuid-12345",
  "metadata": {
    "subtotal": 85.00,
    "tax": 7.50,
    "tip": 15.00,
    "grand_total": 107.50
  },
  "items": [
    {
      "id": "item_01",
      "name": "Truffle Fries",
      "price": 12.00,
      "is_personal": false,
      "assigned_to": ["user_A", "user_B", "user_C"]
    },
    {
      "id": "item_02",
      "name": "Ribeye Steak",
      "price": 45.00,
      "is_personal": true,
      "assigned_to": ["user_A"] 
    }
  ],
  "participants": [
    {"id": "user_A", "name": "You", "avatar_url": "..."},
    {"id": "user_B", "name": "Sarah", "avatar_url": "..."}
  ]
}

4. Functional Requirements
FR1: Intelligent OCR & Parsing

    The Problem: Standard OCR just gives you a "blob" of text.

    The Solution: Use an LLM prompt to convert raw text into the schema above.

    Requirement: The system must identify the Tax and Service Charge as separate entities to apply them proportionally later.

FR2: Item Assignment Logic

    Default State: All items are "Shared" by all participants equally.

    Manual Override: Users can toggle an item to "Personal."

    Single-Ownership: If "Personal" is selected, the user must select one owner. This item is then removed from the "Shared Pool."

    Subset Splitting: Users can select a specific group (e.g., "Only Person A and Person B shared the wine").

FR3: The "Fair Share" Calculation Engine

The system must calculate individual totals using proportional tax distribution.

The Formula:
Let Ii​ be the sum of items owned/shared by person i.
Let S be the receipt subtotal.
Let F be the total fees (Tax + Tip).
Individual_Totali​=Ii​+(SIi​​×F)
5. UI/UX Design Specification
Screen A: The Camera & Crop

    Feature: Real-time edge detection to ensure the receipt is flat and legible.

    UX Note: Provide a "Flash" toggle and a "Low Light" warning.

Screen B: The Interactive List (The "War Room")

    Visuals: A vertical list of items.

    Interaction: * Swipe Right: Mark as "Personal" (triggers owner selection).

        Swipe Left: Split with specific people (opens a multi-select avatar list).

        Tap Price: Edit (in case OCR failed).

Screen C: The Final Breakdown

    Visuals: A "Donut Chart" showing the percentage of the bill each person is paying.

    Action: A "Copy Summary" button that generates a text like:

        Sarah owes $34.50 (Steak + 1/3 Fries + Proportional Tax).

6. Technical Constraints & Edge Cases

    Discounts/Coupons: The system must detect negative values (discounts) and apply them to the subtotal before calculating the proportional tax.

    Image Quality: If the LLM confidence score for a price is <90%, the UI must highlight that item in red for manual verification.