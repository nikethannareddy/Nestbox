import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const supabase = createClient();
    
    // Check if user is admin
    const { data: isAdmin } = await supabase
      .rpc('is_admin')
      .single();

    if (!isAdmin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Generate and assign QR code to the nest box
    const { data: qrCodeData, error } = await supabase
      .rpc('assign_qr_code_to_nest_box', { nest_box_id: params.id })
      .single();

    if (error) {
      console.error('Error generating QR code:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to generate QR code' }),
        { status: 500 }
      );
    }

    return NextResponse.json(qrCodeData);
  } catch (error) {
    console.error('Error in QR code generation:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Get the nest box with QR code information
    const { data: nestBox, error } = await supabase
      .from('nest_boxes')
      .select('id, qr_code_id, qr_code_url')
      .eq('id', params.id)
      .single();

    if (error) {
      console.error('Error fetching QR code:', error);
      return new NextResponse(
        JSON.stringify({ error: 'Failed to fetch QR code' }),
        { status: 500 }
      );
    }

    if (!nestBox) {
      return new NextResponse('Nest box not found', { status: 404 });
    }

    return NextResponse.json({
      qrCodeId: nestBox.qr_code_id,
      qrCodeUrl: nestBox.qr_code_url,
    });
  } catch (error) {
    console.error('Error in QR code fetch:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
