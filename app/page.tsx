'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { NeoStepper, type Step } from "@/components/ui/neo-stepper"
import { formSchema, type FormData } from "@/lib/schemas"

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      treatments: [{ type: "", value: "" }],
      costs: [],
      companyName: "",
      contractPercentage: "",
      confirmDetails: false,
    },
    mode: "onChange"
  })

  const steps: Step[] = [
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
