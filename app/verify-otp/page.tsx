import { Suspense } from "react"
import VerifyOTPForm from "./components/verify-otp-form"

export default function VerifyOTPPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
      <VerifyOTPForm />
    </Suspense>
  )
}
