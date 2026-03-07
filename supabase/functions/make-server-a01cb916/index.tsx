import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-a01cb916/health", (c) => {
  return c.json({ status: "ok" });
});

// OCR endpoint - processes receipt images using OCR.space API
app.post("/make-server-a01cb916/ocr-process", async (c) => {
  try {
    const body = await c.req.json();
    const { image } = body;

    if (!image) {
      return c.json({ error: "No image provided" }, 400);
    }

    // Get API key from environment
    const apiKey = Deno.env.get("OCR_SPACE_API_KEY");
    if (!apiKey) {
      console.error("OCR processing error: OCR_SPACE_API_KEY not configured");
      return c.json({ error: "OCR API key not configured" }, 500);
    }

    // Call OCR.space API
    const formData = new FormData();
    formData.append("base64Image", image);
    formData.append("language", "eng");
    formData.append("isOverlayRequired", "false");
    formData.append("detectOrientation", "true");
    formData.append("scale", "true");
    formData.append("OCREngine", "2"); // Use OCR Engine 2 for better accuracy

    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      headers: {
        "apikey": apiKey,
      },
      body: formData,
    });

    const ocrResult = await ocrResponse.json();

    if (ocrResult.OCRExitCode !== 1) {
      console.error("OCR processing error:", ocrResult.ErrorMessage);
      return c.json({ error: ocrResult.ErrorMessage || "OCR processing failed" }, 500);
    }

    // Extract parsed text
    const parsedText = ocrResult.ParsedResults?.[0]?.ParsedText || "";

    console.log("OCR processing successful, text length:", parsedText.length);

    return c.json({
      success: true,
      text: parsedText,
      rawResult: ocrResult,
    });

  } catch (error) {
    console.error("OCR endpoint error:", error);
    return c.json({ error: `OCR processing failed: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);