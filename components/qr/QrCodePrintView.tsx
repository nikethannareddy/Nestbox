"use client"

import { QrCodeGenerator } from './QrCodeGenerator'
import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

interface QrCodePrintViewProps {
  nestBoxId: string
  name: string
  latitude: number
  longitude: number
  onClose?: () => void
}

export function QrCodePrintView({ 
  nestBoxId, 
  name, 
  latitude, 
  longitude, 
  onClose 
}: QrCodePrintViewProps) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-emerald-900">Print QR Code</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>
        
        <div className="flex flex-col items-center">
          <div className="p-4 bg-white rounded-lg border border-gray-200">
            <QrCodeGenerator 
              nestBoxId={nestBoxId}
              latitude={latitude}
              longitude={longitude}
            />
            <div className="mt-4 text-center">
              <h3 className="font-semibold text-lg">{name}</h3>
              <p className="text-sm text-gray-600">ID: {nestBoxId.slice(0, 8)}</p>
              <p className="text-sm text-gray-500 mt-2">
                Scan to view on map
              </p>
            </div>
          </div>
          
          <div className="mt-6 flex gap-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Printer className="w-4 h-4 mr-2" />
              Print QR Code
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
