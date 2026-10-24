import { NextRequest, NextResponse } from 'next/server';
import { ConversationInputSchema } from '@/types/agreement';
import { extractTermsHybrid } from '@/lib/analysis/extractTermsAI';
import { generateAgreementDraft } from '@/lib/agreement/generateDraft';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Validate request payload
    const validationResult = ConversationInputSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          issues: validationResult.error.issues.map(i => ({ field: i.path.join('.'), message: i.message })),
        },
        { status: 400 }
      );
    }

    const { rawConversation, title, businessContext } = validationResult.data;

    // Run hybrid analysis (uses Gemini if GEMINI_API_KEY is configured, else deterministic rules)
    const extractedData = await extractTermsHybrid(rawConversation, title, businessContext);

    // Call Python FastAPI statutory engine for Garment Job-Work Sector analysis
    let garmentAnalysis = null;
    try {
      const fastApiResponse = await fetch('http://127.0.0.1:8000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_chat: rawConversation,
          udyam_urn: body.udyam_urn || 'UDYAM-KR-03-0128945',
          state: body.state || 'Karnataka',
        }),
        signal: AbortSignal.timeout(3000),
      });
      if (fastApiResponse.ok) {
        garmentAnalysis = await fastApiResponse.json();
      }
    } catch {
      // FastAPI fallback continues smoothly with local deterministic rules
    }

    // Generate initial plain-language draft with [Needs confirmation] tags
    const draft = await generateAgreementDraft(extractedData);

    return NextResponse.json({
      success: true,
      extractedData,
      draft,
      garmentAnalysis,
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'An unexpected error occurred during conversation analysis.',
        details: error?.message || 'Internal Server Error',
      },
      { status: 500 }
    );
  }
}
