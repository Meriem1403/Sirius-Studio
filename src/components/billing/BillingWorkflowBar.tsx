import { Check } from 'lucide-react'

interface Step {
  id: string
  label: string
  done: boolean
  current: boolean
}

interface BillingWorkflowBarProps {
  steps: Step[]
}

export default function BillingWorkflowBar({ steps }: BillingWorkflowBarProps) {
  return (
    <ol className="billing-workflow" aria-label="Progression du document">
      {steps.map((step, i) => (
        <li
          key={step.id}
          className={`billing-workflow-step ${step.done ? 'billing-workflow-step--done' : ''} ${step.current ? 'billing-workflow-step--current' : ''}`}
        >
          <span className="billing-workflow-dot" aria-hidden="true">
            {step.done ? <Check size={10} strokeWidth={3} /> : i + 1}
          </span>
          <span className="billing-workflow-label">{step.label}</span>
        </li>
      ))}
    </ol>
  )
}

export function quoteWorkflowSteps(status: string) {
  const order = ['draft', 'sent', 'signed', 'converted']
  const idx = order.indexOf(status)
  return [
    { id: 'draft', label: 'Brouillon', done: idx >= 0, current: status === 'draft' },
    { id: 'sent', label: 'Envoyé', done: idx >= 1, current: status === 'sent' },
    { id: 'signed', label: 'Signé', done: idx >= 2 || status === 'accepted', current: status === 'signed' || status === 'accepted' },
    { id: 'converted', label: 'Facturé', done: status === 'converted', current: status === 'converted' },
  ]
}

export function invoiceWorkflowSteps(status: string, amountPaid: number, totalTTC: number) {
  const paid = amountPaid >= totalTTC - 0.01
  const partial = amountPaid > 0 && !paid
  return [
    { id: 'draft', label: 'Brouillon', done: status !== 'draft', current: status === 'draft' },
    { id: 'sent', label: 'Émise', done: !['draft'].includes(status), current: status === 'sent' || status === 'signed' },
    { id: 'partial', label: 'Partiel', done: partial || paid, current: partial },
    { id: 'paid', label: 'Soldée', done: paid || status === 'paid', current: paid || status === 'paid' },
  ]
}
