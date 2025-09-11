'use client'

import { useState } from "react"
import { NeoStepper, type Step } from "@/components/ui/neo-stepper"

export default function Home() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  
  // Form data state
  const [formData, setFormData] = useState({
    companyName: "",
    customClinicName: "",
    contractPercentage: "",
    reportEmail: "",
    confirmDetails: false,
    treatments: [
      { type: "", value: "" }
    ],
    costs: [
      { type: "", value: "" }
    ]
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
          formData={formData}
          setFormData={setFormData}
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
