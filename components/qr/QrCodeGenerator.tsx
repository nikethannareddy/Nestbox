"use client";

import { useState, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import html2canvas from 'html2canvas';

interface QrCodeGeneratorProps {
  nestBoxId: string;
  nestBoxName: string;
  qrCodeId?: string;
  qrCodeUrl?: string;
  onGenerate: () => Promise<{ qrCodeId: string; qrCodeUrl: string }>;
  className?: string;
}

export function QrCodeGenerator({
  nestBoxId,
  nestBoxName,
  qrCodeId: initialQrCodeId,
  qrCodeUrl: initialQrCodeUrl,
  onGenerate,
  className = '',
}: QrCodeGeneratorProps) {
  const [qrCodeId, setQrCodeId] = useState(initialQrCodeId);
  const [qrCodeUrl, setQrCodeUrl] = useState(initialQrCodeUrl);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const result = await onGenerate();
      setQrCodeId(result.qrCodeId);
      setQrCodeUrl(result.qrCodeUrl);
      toast({
        title: 'QR Code Generated',
        description: 'The QR code has been successfully generated.',
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate QR code. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = async () => {
    if (!qrCodeRef.current) return;

    try {
      setIsPrinting(true);
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window');
      }

      // Create a canvas from the QR code
      const canvas = await html2canvas(qrCodeRef.current, {
        scale: 2, // Higher quality
        backgroundColor: null,
        logging: false,
      });

      // Create the print content
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>NestBox QR Code - ${nestBoxName}</title>
          <style>
            @page { margin: 0; }
            body { 
              margin: 0;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              padding: 20px;
              text-align: center;
            }
            .print-container {
              max-width: 300px;
              margin: 0 auto;
            }
            .qr-code {
              margin: 0 auto 20px;
              padding: 10px;
              background: white;
              border-radius: 8px;
            }
            h1 {
              font-size: 20px;
              margin: 0 0 10px 0;
              color: #333;
            }
            p {
              margin: 5px 0;
              color: #666;
              font-size: 14px;
            }
            .instructions {
              margin-top: 20px;
              font-size: 12px;
              color: #999;
              border-top: 1px solid #eee;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="print-container">
            <h1>${nestBoxName}</h1>
            <p>Nest Box ID: ${nestBoxId}</p>
            <div class="qr-code">
              <img src="${canvas.toDataURL('image/png')}" alt="QR Code" style="max-width: 100%;" />
            </div>
            <p>Scan to view nest box details</p>
            <div class="instructions">
              <p>Place this label on the nest box in a visible location.</p>
              <p>Scan the QR code to view nest box information and report issues.</p>
            </div>
          </div>
          <script>
            // Print when the window loads
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.onafterprint = function() {
                  window.close();
                };
              }, 500);
            };
          </script>
        </body>
        </html>
      `;

      // Write the content to the new window
      printWindow.document.write(printContent);
      printWindow.document.close();
    } catch (error) {
      console.error('Error printing QR code:', error);
      toast({
        title: 'Print Error',
        description: 'Failed to prepare the print preview. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>QR Code</CardTitle>
      </CardHeader>
      <CardContent>
        {qrCodeId && qrCodeUrl ? (
          <div className="flex flex-col items-center space-y-4">
            <div 
              ref={qrCodeRef}
              className="p-4 bg-white rounded-lg border border-gray-200 flex flex-col items-center"
            >
              <QRCodeSVG 
                value={qrCodeUrl} 
                size={200} 
                level="H"
                includeMargin={true}
                className="w-full h-auto max-w-[200px]"
              />
              <p className="mt-2 text-sm text-gray-500 text-center">
                {nestBoxName}
              </p>
            </div>
            
            <div className="w-full space-y-2">
              <div className="space-y-1">
                <Label htmlFor="qr-code-id">QR Code ID</Label>
                <Input 
                  id="qr-code-id" 
                  value={qrCodeId} 
                  readOnly 
                  className="font-mono text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="qr-code-url">QR Code URL</Label>
                <Input 
                  id="qr-code-url" 
                  value={qrCodeUrl} 
                  readOnly 
                  className="text-sm"
                />
              </div>
            </div>

            <div className="flex gap-2 w-full">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handlePrint}
                disabled={isPrinting}
              >
                {isPrinting ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.printer className="mr-2 h-4 w-4" />
                )}
                Print QR Code
              </Button>
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={handleGenerate}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Icons.refreshCw className="mr-2 h-4 w-4" />
                )}
                Regenerate
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4 p-4">
            <Icons.qrCode className="h-12 w-12 text-gray-300" />
            <p className="text-sm text-gray-500 text-center">
              No QR code has been generated for this nest box yet.
            </p>
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating}
              className="mt-2"
            >
              {isGenerating ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Icons.qrCode className="mr-2 h-4 w-4" />
              )}
              Generate QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
