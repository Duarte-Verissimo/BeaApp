"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoInput } from "@/components/ui/neo-input";
import { sendEarningsReport } from "@/app/actions/email-actions";

const neoStepperVariants = cva("flex w-full", {
  variants: {
    orientation: {
      horizontal: "flex-col",
      vertical: "flex-row",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

interface Step {
  id: string;
  title: string;
}

interface NeoStepperProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof neoStepperVariants> {
  steps: Step[];
  currentStep: number;
  onStepChange?: (step: number) => void;
  formData: {
    companyName: string;
    customClinicName: string;
    contractPercentage: string;
    reportEmail: string;
    confirmDetails: boolean;
    treatments: Array<{ type: string; value: string }>;
    costs: Array<{ type: string; value: string }>;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      companyName: string;
      customClinicName: string;
      contractPercentage: string;
      reportEmail: string;
      confirmDetails: boolean;
      treatments: Array<{ type: string; value: string }>;
      costs: Array<{ type: string; value: string }>;
    }>
  >;
  isSubmitting: boolean;
  submitSuccess: boolean;
  submitError: string | null;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setSubmitSuccess: React.Dispatch<React.SetStateAction<boolean>>;
  setSubmitError: React.Dispatch<React.SetStateAction<string | null>>;
}

const NeoStepper = React.forwardRef<HTMLDivElement, NeoStepperProps>(
  (
    {
      className,
      orientation = "horizontal",
      steps,
      currentStep,
      onStepChange,
      formData,
      setFormData,
      isSubmitting,
      submitSuccess,
      submitError,
      setIsSubmitting,
      setSubmitSuccess,
      setSubmitError,
      ...props
    },
    ref
  ) => {
    const handleStepClick = (index: number) => {
      if (onStepChange && index <= currentStep) {
        onStepChange(index);
      }
    };

    const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { name, value, type } = e.target;
      const checked =
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : undefined;

      if (name.startsWith("treatments.")) {
        const [, index, field] = name.split(".");
        const newTreatments = [...formData.treatments];
        newTreatments[parseInt(index)][
          field as keyof (typeof newTreatments)[0]
        ] = value;
        setFormData({
          ...formData,
          treatments: newTreatments,
        });
      } else if (name.startsWith("costs.")) {
        const [, index, field] = name.split(".");
        const newCosts = [...formData.costs];
        newCosts[parseInt(index)][field as keyof (typeof newCosts)[0]] = value;
        setFormData({
          ...formData,
          costs: newCosts,
        });
      } else {
        setFormData({
          ...formData,
          [name]: type === "checkbox" ? checked : value,
        });
      }
    };

    const addTreatment = () => {
      setFormData({
        ...formData,
        treatments: [...formData.treatments, { type: "", value: "" }],
      });
    };

    const addCost = () => {
      setFormData({
        ...formData,
        costs: [...formData.costs, { type: "", value: "" }],
      });
    };

    const removeTreatment = (index: number) => {
      if (formData.treatments.length > 1) {
        const newTreatments = [...formData.treatments];
        newTreatments.splice(index, 1);
        setFormData({
          ...formData,
          treatments: newTreatments,
        });
      }
    };

    const removeCost = (index: number) => {
      if (formData.costs.length > 1) {
        const newCosts = [...formData.costs];
        newCosts.splice(index, 1);
        setFormData({
          ...formData,
          costs: newCosts,
        });
      }
    };

    const calculateTotal = () => {
      return formData.treatments.reduce((total, treatment) => {
        const value = parseFloat(treatment.value) || 0;
        return total + value;
      }, 0);
    };

    const calculateCosts = () => {
      return formData.costs.reduce((total, cost) => {
        const value = parseFloat(cost.value) || 0;
        return total + value;
      }, 0);
    };

    const calculateNetEarnings = () => {
      const total = calculateTotal();
      const costs = calculateCosts();
      const percentage = parseFloat(formData.contractPercentage) || 0;
      const grossEarnings = (total * percentage) / 100;
      return grossEarnings - costs;
    };

    const handleSubmit = async () => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        const result = await sendEarningsReport(formData);

        if (result.success) {
          setSubmitSuccess(true);
        } else {
          setSubmitError(result.error || "Failed to send report");
        }
      } catch (error) {
        setSubmitError("An unexpected error occurred");
        console.error("Error submitting form:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    // Render form content based on current step
    const renderStepContent = () => {
      switch (currentStep) {
        case 0: // Treatments only
          return (
            <div className="space-y-4">
              <div className="mt-6">
                <h3 className="font-bold text-lg mb-3">
                  Tratamentos Realizados
                </h3>
                {formData.treatments.map((treatment, index) => (
                  <div key={index} className="flex gap-2 mb-3 items-end">
                    <div className="flex-1">
                      <NeoInput
                        label={`Tipo de Tratamento ${index + 1}`}
                        name={`treatments.${index}.type`}
                        value={treatment.type}
                        onChange={handleInputChange}
                        placeholder="Tipo de tratamento"
                      />
                    </div>
                    <div className="flex-1">
                      <NeoInput
                        label="Valor (€)"
                        name={`treatments.${index}.value`}
                        type="number"
                        value={treatment.value}
                        onChange={handleInputChange}
                        placeholder="0.00"
                      />
                    </div>
                    {formData.treatments.length > 1 && (
                      <NeoButton
                        variant="destructive"
                        size="sm"
                        onClick={() => removeTreatment(index)}
                        className="h-[42px]"
                      >
                        Remover
                      </NeoButton>
                    )}
                  </div>
                ))}
                <NeoButton
                  variant="secondary"
                  onClick={addTreatment}
                  className="mt-2"
                >
                  Adicionar Tratamento
                </NeoButton>
              </div>
            </div>
          );
        case 1: // Costs
          return (
            <div className="space-y-4">
              <div className="mt-6">
                <h3 className="font-bold text-lg mb-3">Custos Associados</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Adicione quaisquer custos que você tenha como médico dentista
                  que devem ser deduzidos do seu rendimento.
                </p>
                {formData.costs.map((cost, index) => (
                  <div key={index} className="flex gap-2 mb-3 items-end">
                    <div className="flex-1">
                      <NeoInput
                        label={`Tipo de Custo ${index + 1}`}
                        name={`costs.${index}.type`}
                        value={cost.type}
                        onChange={handleInputChange}
                        placeholder="Tipo de custo"
                      />
                    </div>
                    <div className="flex-1">
                      <NeoInput
                        label="Valor (€)"
                        name={`costs.${index}.value`}
                        type="number"
                        value={cost.value}
                        onChange={handleInputChange}
                        placeholder="0.00"
                      />
                    </div>
                    {formData.costs.length > 1 && (
                      <NeoButton
                        variant="destructive"
                        size="sm"
                        onClick={() => removeCost(index)}
                        className="h-[42px]"
                      >
                        Remover
                      </NeoButton>
                    )}
                  </div>
                ))}
                <NeoButton
                  variant="secondary"
                  onClick={addCost}
                  className="mt-2"
                >
                  Adicionar Custo
                </NeoButton>
              </div>
            </div>
          );
        case 2: // Business Info with contract percentage (with clinic dropdown)
          return (
            <div className="space-y-4">
              <div className="w-full">
                <label className="block text-sm font-bold mb-2">
                  Nome da Clínica
                </label>
                <select
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-black font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-black transition-all bg-white"
                >
                  <option value="">Selecione uma clínica</option>
                  <option value="Smile.up">Smile.up</option>
                  <option value="OralMED">OralMED</option>
                  <option value="Malo Clinic">Malo Clinic</option>
                  <option value="Vitaldent">Vitaldent</option>
                  <option value="CUF">CUF</option>
                  <option value="Master Dental">Master Dental</option>
                  <option value="Clínica Santa Madalena">
                    Clínica Santa Madalena
                  </option>
                  <option value="Clínica Médis">Clínica Médis</option>
                  <option value="O Meu Doutor">O Meu Doutor</option>
                  <option value="Médico dos Dentes">Médico dos Dentes</option>
                  <option value="Dental Light">Dental Light</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              {formData.companyName === "Outro" && (
                <NeoInput
                  label="Nome da Clínica"
                  name="customClinicName"
                  value={formData.customClinicName || ""}
                  onChange={handleInputChange}
                  placeholder="Introduza o nome da clínica"
                />
              )}
              <NeoInput
                label="Percentagem do seu contrato"
                name="contractPercentage"
                type="number"
                value={formData.contractPercentage}
                onChange={handleInputChange}
                placeholder="Introduza a sua percentagem"
              />
            </div>
          );
        case 3: // Email for PDF report
          return (
            <div className="space-y-4">
              <NeoInput
                label="Email para receber o relatório"
                name="reportEmail"
                type="email"
                value={formData.reportEmail || ""}
                onChange={handleInputChange}
                placeholder="Introduza o seu email"
              />
              <p className="text-sm text-gray-600">
                Introduza o seu email para receber um relatório detalhado com os
                seus ganhos diários.
              </p>
            </div>
          );
        case 4: // Confirmation with earnings calculation
          return (
            <div className="space-y-4">
              <div className="p-4 border-2 border-black bg-white">
                <h3 className="font-bold text-lg mb-2">Resumo da Clínica</h3>
                <p>
                  <span className="font-bold">Clínica:</span>{" "}
                  {formData.companyName === "Outro"
                    ? formData.customClinicName
                    : formData.companyName}
                </p>
                <p>
                  <span className="font-bold">Percentagem do Contrato:</span>{" "}
                  {formData.contractPercentage}%
                </p>
                {formData.reportEmail && (
                  <p>
                    <span className="font-bold">Email para Relatório:</span>{" "}
                    {formData.reportEmail}
                  </p>
                )}
              </div>

              <div className="p-4 border-2 border-black bg-white">
                <h3 className="font-bold text-lg mb-2">
                  Tratamentos Realizados
                </h3>
                {formData.treatments.map((treatment, index) => (
                  <div key={index} className="flex justify-between mb-1">
                    <span>{treatment.type || "Tratamento sem nome"}</span>
                    <span>
                      {parseFloat(treatment.value)
                        ? `${parseFloat(treatment.value).toFixed(2)}€`
                        : "0.00€"}
                    </span>
                  </div>
                ))}
                <div className="border-t-2 border-black mt-2 pt-2 flex justify-between font-bold">
                  <span>Total Bruto:</span>
                  <span>{calculateTotal().toFixed(2)}€</span>
                </div>
              </div>

              <div className="p-4 border-2 border-black bg-white">
                <h3 className="font-bold text-lg mb-2">Custos Deduzidos</h3>
                {formData.costs.map((cost, index) => (
                  <div key={index} className="flex justify-between mb-1">
                    <span>{cost.type || "Custo sem nome"}</span>
                    <span>
                      {parseFloat(cost.value)
                        ? `${parseFloat(cost.value).toFixed(2)}€`
                        : "0.00€"}
                    </span>
                  </div>
                ))}
                <div className="border-t-2 border-black mt-2 pt-2 flex justify-between font-bold">
                  <span>Total de Custos:</span>
                  <span>{calculateCosts().toFixed(2)}€</span>
                </div>
              </div>

              <div className="p-4 border-2 border-black bg-white">
                <div className="border-t-2 border-black mt-2 pt-2 flex justify-between font-bold text-lg">
                  <span>Ganhos Líquidos:</span>
                  <span>{calculateNetEarnings().toFixed(2)}€</span>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="confirmDetails"
                  checked={formData.confirmDetails}
                  onChange={handleInputChange}
                  className="w-5 h-5 mr-2 border-2 border-black"
                />
                <label className="font-bold">
                  Confirmo que os dados estão corretos
                </label>
              </div>

              {submitSuccess && (
                <div className="p-4 border-2 border-green-500 bg-green-100 text-green-700">
                  <p className="font-bold">Relatório enviado com sucesso!</p>
                  <p>
                    O seu relatório foi enviado para {formData.reportEmail}.
                  </p>
                </div>
              )}

              {submitError && (
                <div className="p-4 border-2 border-red-500 bg-red-100 text-red-700">
                  <p className="font-bold">Erro ao enviar relatório</p>
                  <p>{submitError}</p>
                </div>
              )}
            </div>
          );
        default:
          return <p>O conteúdo do passo apareceria aqui</p>;
      }
    };

    const handleNext = () => {
      if (currentStep < steps.length - 1) {
        onStepChange?.(currentStep + 1);
      }
    };

    const handlePrevious = () => {
      if (currentStep > 0) {
        onStepChange?.(currentStep - 1);
      }
    };

    // Verifica se é mobile (baseado em breakpoints comuns)
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    return (
      <div
        ref={ref}
        className={cn(neoStepperVariants({ orientation, className }))}
        {...props}
      >
        {isMobile ? (
          // Versão mobile: mostra apenas o step atual
          <div className="flex flex-col items-center w-full">
            {/* Step indicator */}
            <div className="flex items-center justify-center w-10 h-10 rounded-lg border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-main text-main-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] scale-110 mb-2">
              {currentStep + 1}
            </div>

            {/* Step content */}
            <div className="text-center w-full px-1 mb-6">
              <p className="font-bold text-sm truncate w-full">
                {steps[currentStep].title}
              </p>
            </div>

            {/* Step Content */}
            <div className="w-full p-6 border-2 border-black bg-secondary-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-bold mb-4">
                {steps[currentStep].title}
              </h2>

              <div className="mb-6">{renderStepContent()}</div>

              <div className="flex justify-between">
                <NeoButton
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  Anterior
                </NeoButton>
                {currentStep === steps.length - 1 ? (
                  <NeoButton
                    onClick={handleSubmit}
                    disabled={!formData.confirmDetails || isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Terminar"}
                  </NeoButton>
                ) : (
                  <NeoButton
                    onClick={handleNext}
                    disabled={
                      currentStep === steps.length - 1 &&
                      !formData.confirmDetails
                    }
                  >
                    {currentStep === steps.length - 1 ? "Terminar" : "Seguinte"}
                  </NeoButton>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Versão desktop: mostra todos os steps
          <>
            <div
              className={cn(
                "flex w-full",
                orientation === "horizontal"
                  ? "flex-row items-center justify-between"
                  : "flex-col"
              )}
            >
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={cn(
                    "flex flex-col items-center justify-start flex-1",
                    orientation === "horizontal"
                      ? "mx-2 first:ml-0 last:mr-0"
                      : "my-2 first:mt-0 last:mb-0"
                  )}
                >
                  <div className="flex flex-col items-center w-full">
                    {/* Step indicator */}
                    <button
                      onClick={() => handleStepClick(index)}
                      disabled={index > currentStep}
                      aria-current={index === currentStep ? "step" : undefined}
                      aria-label={`Passo ${index + 1}: ${step.title}${
                        index < currentStep
                          ? " - Concluído"
                          : index === currentStep
                          ? " - Ativo"
                          : " - Não concluído"
                      }`}
                      className={cn(
                        "flex items-center justify-center rounded-lg border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-black flex-shrink-0",
                        "w-10 h-10",
                        index < currentStep
                          ? "bg-green-500 text-white shadow-[6px_6px_0px_0px_rgba(0,70,0,1)]"
                          : index === currentStep
                          ? "bg-main text-main-foreground shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] scale-110"
                          : "bg-white text-gray-400",
                        index > currentStep && "cursor-not-allowed"
                      )}
                    >
                      {index < currentStep ? "✓" : index + 1}
                    </button>

                    {/* Step content */}
                    <div className="mt-2 text-center w-full px-1">
                      <p className="font-bold text-sm truncate w-full">
                        {step.title}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="mt-12 p-6 border-2 border-black bg-secondary-background shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-bold mb-4">
                {steps[currentStep].title}
              </h2>

              <div className="mb-6">{renderStepContent()}</div>

              <div className="flex justify-between">
                <NeoButton
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  Anterior
                </NeoButton>
                {currentStep === steps.length - 1 ? (
                  <NeoButton
                    onClick={handleSubmit}
                    disabled={!formData.confirmDetails || isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Terminar"}
                  </NeoButton>
                ) : (
                  <NeoButton
                    onClick={handleNext}
                    disabled={
                      currentStep === steps.length - 1 &&
                      !formData.confirmDetails
                    }
                  >
                    {currentStep === steps.length - 1 ? "Terminar" : "Seguinte"}
                  </NeoButton>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    );
  }
);

NeoStepper.displayName = "NeoStepper";

export { NeoStepper };
export type { Step };
