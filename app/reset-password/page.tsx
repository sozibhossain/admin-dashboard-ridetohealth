import { Suspense } from "react"
import ResetPasswordForm from "./_components/ResetPasswordPage"

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="text-center mt-20">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  )
}
