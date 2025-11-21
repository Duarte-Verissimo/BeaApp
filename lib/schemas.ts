import { z } from "zod";

export const treatmentSchema = z.object({
  type: z.string().min(1, "O tipo de tratamento é obrigatório"),
  value: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
    message: "O valor deve ser um número positivo ou zero",
  }),
});

export const costSchema = z.object({
  type: z.string().optional(),
  value: z.string().refine((val) => !val || (!isNaN(parseFloat(val)) && parseFloat(val) >= 0), {
    message: "O valor deve ser um número positivo",
  }).optional(),
});

export const formSchema = z.object({
  treatments: z.array(treatmentSchema).min(1, "Adicione pelo menos um tratamento"),
  costs: z.array(costSchema).default([]),
  companyName: z.string().min(1, "Selecione uma clínica"),
  customClinicName: z.string().optional(),
  contractPercentage: z.string().refine(
    (val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0 && num <= 100;
    },
    { message: "A percentagem deve ser entre 0 e 100" }
  ),
  reportEmail: z.string().email("Email inválido").optional().or(z.literal("")),
  confirmDetails: z.boolean().refine((val) => val === true, {
    message: "Deve confirmar os dados para prosseguir",
  }),
}).refine((data) => {
  if (data.companyName === "Outro" && !data.customClinicName) {
    return false;
  }
  return true;
}, {
  message: "O nome da clínica é obrigatório",
  path: ["customClinicName"],
});

export type FormData = z.infer<typeof formSchema>;
