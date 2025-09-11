# Resumo do Projeto: Sistema de Relatórios Médicos com Autenticação

## 🎯 Objetivo Principal

Implementar um sistema onde profissionais de saúde (dentistas/médicos) possam:

- Submeter relatórios diários através do formulário `NeoStepper`
- Guardar esses relatórios na sua conta pessoal
- Gerar relatórios mensais consolidados
- **Apenas cada profissional tem acesso aos seus próprios dados**

## 🏗️ Arquitetura Definida

### **Stack Tecnológico:**

- **Frontend:** Next.js com App Router (atual)
- **Autenticação:** Supabase
- **Base de Dados:** Supabase
- **UI:** shadcn/ui (componente NeoStepper já existe)

### **Estrutura de Dados:**

- Cada submissão do `NeoStepper` = 1 relatório diário
- Data capturada automaticamente no momento da submissão
- Múltiplos relatórios por dia permitidos (diferenciados por hora)

## 🔄 Fluxo de Utilizador Definido

### **Processo de Submissão:**

1. Utilizador preenche formulário nos 5 steps
2. No Step 5 ("Confirmação"), clica em "Terminar"
3. **Se não autenticado:** Aparece modal com opções:
   - "Registar/Login" → Guarda na conta
   - "Saltar" → Envia por email (sem histórico)
4. **Se autenticado:** Submete automaticamente para a base de dados
5. **Pós-autenticação:** Formulário completa automaticamente sem novo clique

## 📋 Estado Atual do Projeto

### **Ficheiro Principal (page.tsx):**

```tsx
// Já implementado:
- NeoStepper com 5 steps
- Estados: formData, isSubmitting, submitSuccess, submitError
- Dados: tratamentos, custos, informações da clínica, email

// Campos relevantes no formData:
- reportEmail: string (para envio por email)
- companyName, customClinicName, contractPercentage
- treatments: [{ type, value }]
- costs: [{ type, value }]
```

## 🚧 Implementação Necessária

### **1. Configuração Base:**

- [ ] Instalar e configurar Clerk no projeto
- [ ] Criar `layout.tsx` com `ClerkProvider`
- [ ] Configurar Supabase para persistência

### **2. Modificações no Frontend:**

- [ ] Interceptar botão "Terminar" no Step 5
- [ ] Criar modal de autenticação
- [ ] Implementar lógica de submissão condicional

### **3. Backend (API Routes):**

- [ ] Criar endpoints para CRUD de relatórios
- [ ] Implementar envio de email para utilizadores não autenticados
- [ ] Gerar relatórios mensais consolidados

## ❓ Questões Pendentes de Validação

### **Questões Técnicas:**

1. **Acesso ao NeoStepper:** Tens o código fonte do componente `@/components/ui/neo-stepper`?
2. **Layout existente:** Já existe um layout.tsx no projeto?
3. **Modal library:** Pretendes usar shadcn/ui Dialog ou outra solução?

### **Questões de Negócio:**

- **Validação de duplicados:** Como gerir múltiplos relatórios no mesmo dia?
- **Timezone:** Vais capturar timezone local ou usar UTC?

## 📍 Próximo Passo Recomendado

**Verifica se tens acesso ao código do componente `NeoStepper`** no ficheiro `@/components/ui/neo-stepper` - isto é crítico para perceber como interceptar o botão "Terminar" e implementar a lógica de autenticação.

Confirma também se já existe um layout.tsx no teu projeto para planeares onde colocar o `ClerkProvider`.
