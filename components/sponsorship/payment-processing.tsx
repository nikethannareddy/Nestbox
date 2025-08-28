"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Lock, Calendar, DollarSign, Receipt, CheckCircle } from "lucide-react"

interface PaymentProcessingProps {
  tier: any
  customization: any
  onPaymentSuccess: (paymentData: any) => void
  onBack: () => void
}

export function PaymentProcessing({ tier, customization, onPaymentSuccess, onBack }: PaymentProcessingProps) {
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    nameOnCard: "",
    billingAddress: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
      country: "US",
    },
    paymentType: "one-time",
    agreeToTerms: false,
  })
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const updatePaymentData = (field: string, value: any) => {
    setPaymentData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const updateBillingAddress = (field: string, value: string) => {
    setPaymentData((prev) => ({
      ...prev,
      billingAddress: {
        ...prev.billingAddress,
        [field]: value,
      },
    }))
  }

  const handlePayment = async () => {
    setIsProcessing(true)

    // Mock payment processing delay
    await new Promise((resolve) => setTimeout(resolve, 3000))

    const mockPaymentResult = {
      transactionId: "TXN_" + Date.now(),
      amount: tier.price,
      currency: "USD",
      status: "completed",
      paymentMethod: "card",
      receiptUrl: "/receipt/" + Date.now(),
      sponsorshipId: "SPONSOR_" + Date.now(),
      tier: tier,
      customization: customization,
      paymentData: paymentData,
    }

    setIsProcessing(false)
    setShowSuccess(true)
    onPaymentSuccess(mockPaymentResult)
  }

  const calculateTotal = () => {
    const baseAmount = tier.price
    const processingFee = Math.round(baseAmount * 0.029 + 0.3) // Mock Stripe fee
    return {
      subtotal: baseAmount,
      processingFee: processingFee,
      total: baseAmount + processingFee,
    }
  }

  const totals = calculateTotal()

  if (showSuccess) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="font-serif text-2xl font-bold mb-4">Payment Successful!</h2>
          <p className="text-muted-foreground mb-6">
            Thank you for your sponsorship! You'll receive a confirmation email shortly with your receipt and next
            steps.
          </p>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Transaction ID:</strong> TXN_{Date.now()}
            </p>
            <p>
              <strong>Amount:</strong> ${totals.total}
            </p>
            <p>
              <strong>Sponsorship:</strong> {tier.name}
            </p>
          </div>
          <Button className="mt-6" onClick={() => (window.location.href = "/dashboard")}>
            Go to Dashboard
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Payment Form */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Payment Type */}
            <div className="space-y-3">
              <Label>Payment Type</Label>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentType"
                    value="one-time"
                    checked={paymentData.paymentType === "one-time"}
                    onChange={(e) => updatePaymentData("paymentType", e.target.value)}
                    className="text-primary"
                  />
                  <span>One-time Payment</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="paymentType"
                    value="recurring"
                    checked={paymentData.paymentType === "recurring"}
                    onChange={(e) => updatePaymentData("paymentType", e.target.value)}
                    className="text-primary"
                  />
                  <span>Annual Recurring</span>
                  <Badge variant="secondary" className="text-xs">
                    Save 10%
                  </Badge>
                </label>
              </div>
            </div>

            {/* Card Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Number</Label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="card-number"
                    placeholder="1234 5678 9012 3456"
                    value={paymentData.cardNumber}
                    onChange={(e) => updatePaymentData("cardNumber", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiry">Expiry Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={paymentData.expiryDate}
                      onChange={(e) => updatePaymentData("expiryDate", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="cvv"
                      placeholder="123"
                      value={paymentData.cvv}
                      onChange={(e) => updatePaymentData("cvv", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name-on-card">Name on Card</Label>
                <Input
                  id="name-on-card"
                  placeholder="John Doe"
                  value={paymentData.nameOnCard}
                  onChange={(e) => updatePaymentData("nameOnCard", e.target.value)}
                />
              </div>
            </div>

            {/* Billing Address */}
            <div className="space-y-4">
              <h3 className="font-semibold">Billing Address</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    placeholder="123 Main St"
                    value={paymentData.billingAddress.street}
                    onChange={(e) => updateBillingAddress("street", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      placeholder="Anytown"
                      value={paymentData.billingAddress.city}
                      onChange={(e) => updateBillingAddress("city", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Select
                      value={paymentData.billingAddress.state}
                      onValueChange={(value) => updateBillingAddress("state", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CA">California</SelectItem>
                        <SelectItem value="NY">New York</SelectItem>
                        <SelectItem value="TX">Texas</SelectItem>
                        <SelectItem value="FL">Florida</SelectItem>
                        {/* Add more states as needed */}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    placeholder="12345"
                    value={paymentData.billingAddress.zipCode}
                    onChange={(e) => updateBillingAddress("zipCode", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={paymentData.agreeToTerms}
                  onCheckedChange={(checked) => updatePaymentData("agreeToTerms", checked)}
                />
                <label htmlFor="terms" className="text-sm leading-relaxed">
                  I agree to the{" "}
                  <a href="#" className="text-primary hover:text-primary/80">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:text-primary/80">
                    Privacy Policy
                  </a>
                  . I understand this is a tax-deductible donation to support bird conservation efforts.
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Order Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">{tier.name}</span>
                <span>${tier.price}</span>
              </div>
              {paymentData.paymentType === "recurring" && (
                <div className="flex justify-between text-green-600">
                  <span>Annual Recurring Discount</span>
                  <span>-${Math.round(tier.price * 0.1)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Processing Fee</span>
                <span>${totals.processingFee}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>${totals.total}</span>
                </div>
              </div>
            </div>

            {customization.dedicationType && customization.dedicationType !== "none" && (
              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Dedication</h4>
                <p className="text-sm text-muted-foreground">{customization.dedicationType}</p>
                {customization.dedicationText && (
                  <p className="text-sm mt-1 italic">"{customization.dedicationText}"</p>
                )}
              </div>
            )}

            <div className="pt-4 border-t text-xs text-muted-foreground">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-3 w-3" />
                <span>Secure payment powered by Stripe</span>
              </div>
              <p>Your donation is tax-deductible. You'll receive a receipt for tax purposes.</p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            onClick={handlePayment}
            className="w-full"
            disabled={
              isProcessing ||
              !paymentData.cardNumber ||
              !paymentData.expiryDate ||
              !paymentData.cvv ||
              !paymentData.nameOnCard ||
              !paymentData.agreeToTerms
            }
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing Payment...
              </>
            ) : (
              <>
                <DollarSign className="h-4 w-4 mr-2" />
                Complete Payment (${totals.total})
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onBack} className="w-full bg-transparent" disabled={isProcessing}>
            Back to Customization
          </Button>
        </div>
      </div>
    </div>
  )
}
