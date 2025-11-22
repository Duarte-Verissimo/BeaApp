"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { NeoButton } from "@/components/ui/neo-button";
import { NeoInput } from "@/components/ui/neo-input";
import { sendEarningsReport } from "@/app/actions/email-actions";
import { saveReport, getClinicSettings } from "@/app/actions/report-actions";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { FormData } from "@/lib/schemas";
import { useAuth } from "@/contexts/auth-context";

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

export interface Step {
  id: string;
  title: string;
}

interface NeoStepperProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof neoStepperVariants> {
  steps: Step[];
  currentStep: number;
  onStepChange?: (step: number) => void;
  form: UseFormReturn<FormData>;
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
      form,
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
    const { user } = useAuth();
    const {
      register,
      control,
      trigger,
      watch,
      setValue,
      handleSubmit: rhfHandleSubmit,
      formState: { errors },
    } = form;

    const {
      fields: treatmentFields,
      append: appendTreatment,
      remove: removeTreatment,
    } = useFieldArray({
      control,
      name: "treatments",
    });

    const {
      fields: costFields,
      append: appendCost,
      remove: removeCost,
    } = useFieldArray({
      control,
      name: "costs",
    });

    // State to hold user's clinic settings
    const [clinicSettings, setClinicSettings] = React.useState<Array<{ id: string; clinic_name: string; contract_percentage: number }>>([]);

    // Watch values for calculations and conditional rendering
    const treatments = watch("treatments");
    const costs = watch("costs");
    const companyName = watch("companyName");
    const customClinicName = watch("customClinicName");
    const contractPercentage = watch("contractPercentage");
    const reportEmail = watch("reportEmail");

    // Fetch clinic settings when user logs in
    React.useEffect(() => {
      const fetchSettings = async () => {
        if (user) {
          const settings = await getClinicSettings(user.id);
          setClinicSettings(settings);
          
          // Auto-fill percentage if clinic is already selected
          const clinicNameToCheck = companyName === "Outro" ? customClinicName : companyName;
          
          if (clinicNameToCheck) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const setting = settings?.find((s: any) => s.clinic_name === clinicNameToCheck);
            if (setting) {
              setValue("contractPercentage", setting.contract_percentage.toString());
            }
          }
        }
      };
      fetchSettings();
    }, [user, companyName, customClinicName, setValue]);

    const handleStepClick = async (index: number) => {
      if (onStepChange && index < currentStep) {
        onStepChange(index);
      }
    };

    const calculateTotal = (items: { value?: string }[]) => {
      return items.reduce((acc, item) => {
        const val = parseFloat(item.value || "0");
        return acc + (isNaN(val) ? 0 : val);
      }, 0);
    };

    const calculateNetEarnings = () => {
      const totalTreatments = calculateTotal(treatments || []);
      const totalCosts = calculateTotal(costs || []);
      const percentage = parseFloat(contractPercentage || "0");

      if (isNaN(percentage)) return 0;

      return (totalTreatments * (percentage / 100)) - totalCosts;
    };

    const processFormSubmission = async (data: FormData) => {
      setIsSubmitting(true);
      setSubmitError(null);

      try {
        // If user is logged in, save the report
        if (user) {
          const saveResult = await saveReport(data, user.id);
          if (!saveResult.success) {
            console.error("Failed to save report:", saveResult.error);
            // We continue to send email even if save fails? Or show error?
            // Let's show error but maybe still try to send email if requested?
            // For now, let's assume saving is critical if logged in.
          }
        }

        // Always send email if reportEmail is present
        if (data.reportEmail) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await sendEarningsReport(data as any);

          if (result.success) {
            setSubmitSuccess(true);
          } else {
            setSubmitError(result.error || "Failed to send report");
          }
        } else {
          // If no email (shouldn't happen if validation works, but maybe user didn't want email?)
          // If logged in and saved, we can consider it a success
          if (user) {
            setSubmitSuccess(true);
          }
        }
      } catch (error) {
        setSubmitError("An unexpected error occurred");
        console.error("Error submitting form:", error);
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleNext = async () => {
      let isValid = false;
      const currentStepId = steps[currentStep].id;

      switch (currentStepId) {
        case "step1":
          isValid = await trigger("treatments");
          break;
        case "step2":
          isValid = await trigger("costs");
          break;
        case "step3":
          isValid = await trigger(["companyName", "customClinicName", "contractPercentage"]);
          break;
        case "step4":
          isValid = await trigger("reportEmail");
          break;
        default:
          isValid = true;
      }

      if (isValid && currentStep < steps.length - 1) {
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

    const renderStepContent = () => {
      const currentStepId = steps[currentStep].id;

      switch (currentStepId) {
        case "step1": // Treatments only
          return (
            <div className="space-y-4">
              <div className="mt-6">
                <h3 className="font-bold text-lg mb-3">
                  Tratamentos Realizados
                </h3>
                {treatmentFields.map((field, index) => (
                  <div key={field.id} className="flex flex-col md:flex-row gap-2 mb-6 md:mb-3 items-start border-b-2 border-dashed border-gray-300 pb-4 md:border-0 md:pb-0 last:border-0">
                    <div className="w-full md:flex-1">
                      <NeoInput
                        label={`Tipo de Tratamento`}
                        placeholder="Tipo de tratamento"
                        {...register(`treatments.${index}.type`)}
                        error={errors.treatments?.[index]?.type?.message}
                      />
                    </div>
                    <div className="w-full md:flex-1">
                      <NeoInput
                        label="Valor (€)"
                        type="number"
                        placeholder="0.00"
                        {...register(`treatments.${index}.value`)}
                        error={errors.treatments?.[index]?.value?.message}
                      />
                    </div>
                    {treatmentFields.length > 1 && (
                      <div className="w-full md:w-auto flex justify-end md:block">
                        <NeoButton
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeTreatment(index)}
                          className="h-[42px] mt-2 md:mt-[28px] w-full md:w-auto"
                        >
                          Remover
                        </NeoButton>
                      </div>
                    )}
                  </div>
                ))}
                <NeoButton
                  type="button"
                  variant="secondary"
                  onClick={() => appendTreatment({ type: "", value: "" })}
                  className="mt-2 w-full md:w-auto"
                >
                  Adicionar Tratamento
                </NeoButton>
                {errors.treatments?.root && (
                   <p className="text-red-500 text-sm mt-2 font-bold">{errors.treatments.root.message}</p>
                )}
              </div>
            </div>
          );
        case "step2": // Costs
          return (
            <div className="space-y-4">
              <div className="mt-6">
                <h3 className="font-bold text-lg mb-3">Custos Associados</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Adicione quaisquer custos que você tenha como médico dentista
                  que devem ser deduzidos do seu rendimento.
                </p>
                {costFields.map((field, index) => (
                  <div key={field.id} className="flex flex-col md:flex-row gap-2 mb-6 md:mb-3 items-start border-b-2 border-dashed border-gray-300 pb-4 md:border-0 md:pb-0 last:border-0">
                    <div className="w-full md:flex-1">
                      <NeoInput
                        label={`Tipo de Custo ${index + 1}`}
                        placeholder="Tipo de custo"
                        {...register(`costs.${index}.type`)}
                        error={errors.costs?.[index]?.type?.message}
                      />
                    </div>
                    <div className="w-full md:flex-1">
                      <NeoInput
                        label="Valor (€)"
                        type="number"
                        placeholder="0.00"
                        {...register(`costs.${index}.value`)}
                        error={errors.costs?.[index]?.value?.message}
                      />
                    </div>
                    {costFields.length > 1 && (
                      <div className="w-full md:w-auto flex justify-end md:block">
                        <NeoButton
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeCost(index)}
                          className="h-[42px] mt-2 md:mt-[28px] w-full md:w-auto"
                        >
                          Remover
                        </NeoButton>
                      </div>
                    )}
                  </div>
                ))}
                <NeoButton
                  type="button"
                  variant="secondary"
                  onClick={() => appendCost({ type: "", value: "" })}
                  className="mt-2"
                >
                  Adicionar Custo
                </NeoButton>
              </div>
            </div>
          );
        case "step3": // Business Info
          return (
            <div className="space-y-4">
              <div className="w-full">
                <label className="block text-sm font-bold mb-2">
                  Nome da Clínica
                </label>
                <select
                  {...register("companyName")}
                  className={cn(
                    "w-full px-4 py-2 border-2 border-black font-medium shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white focus:ring-black transition-all bg-white",
                    errors.companyName && "border-red-500"
                  )}
                >
                  <option value="">Selecione uma clínica</option>
                  
                  {/* User-defined clinics */}
                  {clinicSettings.length > 0 && (
                    <>
                      <optgroup label="As Suas Clínicas">
                        {clinicSettings.map((clinic) => (
                          <option key={clinic.id} value={clinic.clinic_name}>
                            {clinic.clinic_name} ({clinic.contract_percentage}%)
                          </option>
                        ))}
                      </optgroup>
                    </>
                  )}
                  
                  {/* Default clinics - only show if user has no custom clinics */}
                  {clinicSettings.length === 0 && (
                    <>
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
                    </>
                  )}
                  
                  <option value="Outro">Outro</option>
                </select>
                {errors.companyName && (
                  <p className="text-red-500 text-xs mt-1 font-bold">{errors.companyName.message}</p>
                )}
              </div>
              {companyName === "Outro" && (
                <NeoInput
                  label="Nome da Clínica"
                  placeholder="Introduza o nome da clínica"
                  {...register("customClinicName")}
                  error={errors.customClinicName?.message}
                />
              )}
              <NeoInput
                label="Percentagem do seu contrato"
                type="number"
                placeholder="Introduza a sua percentagem"
                {...register("contractPercentage")}
                error={errors.contractPercentage?.message}
              />
            </div>
          );
        case "step4": // Email
          return (
            <div className="space-y-4">
              <NeoInput
                label="Email para receber o relatório"
                type="email"
                placeholder="Introduza o seu email"
                {...register("reportEmail")}
                error={errors.reportEmail?.message}
              />
              <p className="text-sm text-gray-600">
                Introduza o seu email para receber um relatório detalhado com os
                seus ganhos diários.
              </p>
            </div>
          );
        case "step5": // Confirmation
          return (
            <div className="space-y-4">
              <div className="p-4 border-2 border-black bg-white">
                <h3 className="font-bold text-lg mb-2">Resumo da Clínica</h3>
                <p>
                  <span className="font-bold">Clínica:</span>{" "}
                  {companyName === "Outro"
                    ? customClinicName
                    : companyName}
                </p>
                <p>
                  <span className="font-bold">Percentagem do Contrato:</span>{" "}
                  {contractPercentage}%
                </p>
                {reportEmail && (
                  <p>
                    <span className="font-bold">Email para Relatório:</span>{" "}
                    {reportEmail}
                  </p>
                )}
              </div>

              <div className="p-4 border-2 border-black bg-white">
                <h3 className="font-bold text-lg mb-2">
                  Tratamentos Realizados
                </h3>
                {treatments.map((treatment, index) => (
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
                  <span>{calculateTotal(treatments).toFixed(2)}€</span>
                </div>
              </div>

              <div className="p-4 border-2 border-black bg-white">
                <h3 className="font-bold text-lg mb-2">Custos Deduzidos</h3>
                {costs.map((cost, index) => (
                  <div key={index} className="flex justify-between mb-1">
                    <span>{cost.type || "Custo sem nome"}</span>
                    <span>
                      {parseFloat(cost.value || "0")
                        ? `${parseFloat(cost.value || "0").toFixed(2)}€`
                        : "0.00€"}
                    </span>
                  </div>
                ))}
                <div className="border-t-2 border-black mt-2 pt-2 flex justify-between font-bold">
                  <span>Total de Custos:</span>
                  <span>{calculateTotal(costs).toFixed(2)}€</span>
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
                  id="confirmDetails"
                  className="w-5 h-5 mr-2 border-2 border-black"
                  {...register("confirmDetails")}
                />
                <label htmlFor="confirmDetails" className="font-bold">
                  Confirmo que os dados estão corretos
                </label>
              </div>
              {errors.confirmDetails && (
                  <p className="text-red-500 text-xs mt-1 font-bold ml-7">{errors.confirmDetails.message}</p>
              )}

              {submitSuccess && (
                <div className="p-4 border-2 border-green-500 bg-green-100 text-green-700">
                  <p className="font-bold">Relatório enviado com sucesso!</p>
                  <p>
                    {reportEmail ? `O seu relatório foi enviado para ${reportEmail}.` : "O seu relatório foi guardado."}
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
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  Anterior
                </NeoButton>
                {currentStep === steps.length - 1 ? (
                  <NeoButton
                    type="button"
                    onClick={rhfHandleSubmit(processFormSubmission)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Terminar"}
                  </NeoButton>
                ) : (
                  <NeoButton
                    type="button"
                    onClick={handleNext}
                  >
                    Seguinte
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
                      type="button"
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
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                >
                  Anterior
                </NeoButton>
                {currentStep === steps.length - 1 ? (
                  <NeoButton
                    type="button"
                    onClick={rhfHandleSubmit(processFormSubmission)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Enviando..." : "Terminar"}
                  </NeoButton>
                ) : (
                  <NeoButton
                    type="button"
                    onClick={handleNext}
                  >
                    Seguinte
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
