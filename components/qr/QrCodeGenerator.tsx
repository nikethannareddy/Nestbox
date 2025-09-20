"use client"

import { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Icons } from "@/components/icons"
import { cn } from "@/lib/utils"
import QRCode from "qrcode.react"
import html2canvas from 'html2canvas';

interface QrCodeGeneratorProps {
  nestBoxId: string;
  latitude?: number;
  longitude?: number;
  onGenerate?: (data: { qrCodeUrl: string; printData: any }) => void;
  className?: string;
}

export function QrCodeGenerator({ 
  nestBoxId, 
  latitude, 
  longitude, 
  onGenerate,
  className 
}: QrCodeGeneratorProps) {
  const [size, setSize] = useState<number>(256);
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [fgColor, setFgColor] = useState<string>("#000000");
  const [includeLogo, setIncludeLogo] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const qrRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Generate the URL for the QR code
  const generateQrCodeUrl = (): string => {
    const baseUrl = `${window.location.origin}/nestbox/${nestBoxId}`;
    const params = new URLSearchParams();
    
    if (latitude !== undefined && longitude !== undefined) {
      params.append('lat', latitude.toString());
      params.append('lng', longitude.toString());
    }
    
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  };

  const qrCodeUrl = generateQrCodeUrl();

  // Handle print functionality
  const handlePrint = () => {
    if (!qrRef.current) return;
    
    setIsGenerating(true);
    
    // Use html2canvas to capture the QR code with higher DPI for print
    html2canvas(qrRef.current, {
      scale: 2, // Higher scale for better print quality
      useCORS: true,
      allowTaint: true,
      backgroundColor: bgColor,
    }).then(canvas => {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({
          title: "Error",
          description: "Could not open print window. Please check your popup blocker.",
          variant: "destructive",
        });
        return;
      }
      
      const printContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Nest Box QR Code - ${nestBoxId}</title>
            <style>
              body { 
                margin: 0; 
                padding: 20px; 
                display: flex; 
                flex-direction: column; 
                align-items: center; 
                justify-content: center; 
                min-height: 100vh;
                font-family: Arial, sans-serif;
              }
              .container { 
                text-align: center; 
                max-width: 100%;
              }
              h1 { 
                margin-bottom: 20px; 
                color: #333;
              }
              .qr-container { 
                margin: 0 auto; 
                padding: 20px; 
                background: white; 
                border-radius: 8px; 
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                max-width: 100%;
              }
              .info {
                margin-top: 20px;
                color: #666;
                font-size: 14px;
              }
              @media print {
                body { padding: 0; }
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Nest Box #${nestBoxId}</h1>
              <div class="qr-container">
                <img src="${canvas.toDataURL('image/png')}" alt="QR Code" style="max-width: 100%; height: auto;" />
              </div>
              <p class="info">Scan this QR code to view nest box details and report sightings</p>
              <div class="no-print" style="margin-top: 20px;">
                <p>Press Ctrl+P to print or use your browser's print function</p>
                <button onclick="window.print()" style="margin-top: 10px; padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
                  Print QR Code
                </button>
                <button onclick="window.close()" style="margin-top: 10px; margin-left: 10px; padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
                  Close
                </button>
              </div>
            </div>
          </body>
        </html>
      `;
      
      printWindow.document.open();
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Auto-print after a short delay to ensure content is loaded
      setTimeout(() => {
        printWindow.print();
      }, 500);
      
    }).catch(error => {
      console.error('Error generating print preview:', error);
      toast({
        title: "Error",
        description: "Failed to generate print preview. Please try again.",
        variant: "destructive",
      });
    }).finally(() => {
      setIsGenerating(false);
    });
  };

  // Handle download functionality
  const handleDownload = () => {
    if (!qrRef.current) return;
    
    setIsGenerating(true);
    
    html2canvas(qrRef.current, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: bgColor,
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = `nestbox-qr-${nestBoxId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }).catch(error => {
      console.error('Error generating download:', error);
      toast({
        title: "Error",
        description: "Failed to generate download. Please try again.",
        variant: "destructive",
      });
    }).finally(() => {
      setIsGenerating(false);
    });
  };

  // Notify parent component when the QR code is generated
  useEffect(() => {
    if (onGenerate) {
      onGenerate({
        qrCodeUrl,
        printData: {
          nestBoxId,
          latitude,
          longitude,
          generatedAt: new Date().toISOString(),
        },
      });
    }
  }, [qrCodeUrl, nestBoxId, latitude, longitude, onGenerate]);

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="size">QR Code Size</Label>
            <Select 
              value={size.toString()} 
              onValueChange={(value) => setSize(Number(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="128">Small (128px)</SelectItem>
                <SelectItem value="256">Medium (256px)</SelectItem>
                <SelectItem value="384">Large (384px)</SelectItem>
                <SelectItem value="512">Extra Large (512px)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bgColor">Background Color</Label>
            <div className="flex items-center gap-2">
              <Input 
                type="color" 
                id="bgColor" 
                value={bgColor} 
                onChange={(e) => setBgColor(e.target.value)} 
                className="w-16 h-10 p-1"
              />
              <Input 
                type="text" 
                value={bgColor} 
                onChange={(e) => setBgColor(e.target.value)} 
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="fgColor">Foreground Color</Label>
            <div className="flex items-center gap-2">
              <Input 
                type="color" 
                id="fgColor" 
                value={fgColor} 
                onChange={(e) => setFgColor(e.target.value)} 
                className="w-16 h-10 p-1"
              />
              <Input 
                type="text" 
                value={fgColor} 
                onChange={(e) => setFgColor(e.target.value)} 
                className="flex-1"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input 
              type="checkbox" 
              id="includeLogo" 
              checked={includeLogo} 
              onChange={(e) => setIncludeLogo(e.target.checked)} 
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <Label htmlFor="includeLogo">Include NestBox Logo</Label>
          </div>
          
          <div className="pt-2 space-y-2">
            <Button 
              onClick={handlePrint} 
              disabled={isGenerating}
              className="w-full"
            >
              <Icons.printer className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Print QR Code'}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full"
            >
              <Icons.download className="mr-2 h-4 w-4" />
              {isGenerating ? 'Generating...' : 'Download QR Code'}
            </Button>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center p-6 border rounded-lg bg-white">
          <div 
            ref={qrRef}
            className="p-4 bg-white rounded-lg"
            style={{ backgroundColor: bgColor }}
          >
            <QRCode
              value={qrCodeUrl}
              size={size}
              bgColor={bgColor}
              fgColor={fgColor}
              level="H"
              includeMargin={true}
              renderAs="svg"
              imageSettings={
                includeLogo
                  ? {
                      src: '/logo.svg',
                      height: size * 0.2,
                      width: size * 0.2,
                      excavate: true,
                    }
                  : undefined
              }
            />
          </div>
          
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Scan this QR code to view nest box details</p>
            <p className="text-xs mt-1">Nest Box ID: {nestBoxId}</p>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-sm mb-2">QR Code URL:</h3>
        <div className="flex items-center gap-2">
          <Input 
            value={qrCodeUrl} 
            readOnly 
            className="font-mono text-xs"
            onClick={(e) => (e.target as HTMLInputElement).select()}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(qrCodeUrl);
              toast({
                title: "Copied!",
                description: "QR Code URL has been copied to clipboard.",
              });
            }}
          >
            <Icons.copy className="h-4 w-4 mr-2" />
            Copy
          </Button>
        </div>
      </div>
    </div>
  );
}

export default QrCodeGenerator;
