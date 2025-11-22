'use client'

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { NeoStepper, type Step } from "@/components/ui/neo-stepper"
import { formSchema, type FormData } from "@/lib/schemas"
import { useAuth } from "@/contexts/auth-context"

export default function Home() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const form = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      treatments: [{ type: "", value: "" }],
      costs: [],
      companyName: "",
      contractPercentage: "",
      confirmDetails: false,
      reportEmail: "",
    },
    mode: "onChange"
  })

  // Update email when user logs in
  useEffect(() => {
    if (user?.email) {
      form.setValue("reportEmail", user.email)
    }
  }, [user, form])

  const allSteps: Step[] = [
    {
      id: "step1",
      title: "Tratamentos"
    },
    {
      id: "step2",
      title: "Custos"
    },
    {
      id: "step3",
      title: "Informações da Clínica"
    },
    {
      id: "step4",
      title: "E-mail"
    },
    {
      id: "step5",
      title: "Confirmação"
    }
  ]

  // Filter out email step if user is logged in
  const steps = user 
    ? allSteps.filter(step => step.title !== "E-mail")
    : allSteps

  const handleStepChange = (step: number) => {
    setCurrentStep(step)
  }

  return (
    <div className="flex flex-col items-center min-h-screen gap-8 p-4 pt-12">
      <div className="w-full max-w-3xl p-8 border-2 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-white">
        <NeoStepper
          steps={steps}
          currentStep={currentStep}
          onStepChange={handleStepChange}
          form={form}
          isSubmitting={isSubmitting}
          setIsSubmitting={setIsSubmitting}
          submitSuccess={submitSuccess}
          setSubmitSuccess={setSubmitSuccess}
          submitError={submitError}
          setSubmitError={setSubmitError}
        />
      </div>
    </div>
  );
}
