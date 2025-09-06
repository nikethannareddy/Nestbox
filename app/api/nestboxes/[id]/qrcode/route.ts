import { NextResponse } from "next/server"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { url } = body

    if (!url) {
      return new NextResponse("URL is required", { status: 400 })
    }

    // Generate QR code using a simple approach - create a data URL
    // In a real implementation, you might use a QR code library
    const qrCodeDataUrl = await generateQRCodeDataUrl(url)

    return NextResponse.json({
      qrCodeDataUrl,
      url,
    })
  } catch (error) {
    console.error("Error generating QR code:", error)
    return new NextResponse(JSON.stringify({ error: "Failed to generate QR code" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

// Simple QR code generation function
async function generateQRCodeDataUrl(text: string): Promise<string> {
  try {
    // Use QR Server API to generate QR code
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(text)}`

    const response = await fetch(qrApiUrl)
    if (!response.ok) {
      throw new Error("Failed to generate QR code from external service")
    }

    const arrayBuffer = await response.arrayBuffer()
    const base64 = Buffer.from(arrayBuffer).toString("base64")
    return `data:image/png;base64,${base64}`
  } catch (error) {
    console.error("Error generating QR code:", error)
    // Fallback: return a simple data URL that represents a QR code placeholder
    return "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2ZmZiIvPjx0ZXh0IHg9IjEwMCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzMzMyI+UVIgQ29kZTwvdGV4dD48L3N2Zz4="
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // This endpoint can be used to retrieve existing QR code data
    return NextResponse.json({
      message: "QR code retrieval endpoint",
      nestBoxId: params.id,
    })
  } catch (error) {
    console.error("Error in QR code fetch:", error)
    return new NextResponse(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
