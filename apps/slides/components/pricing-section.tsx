"use client"

import Link from "next/link"
import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const plans = [
  {
    name: "Starter",
    price: "$9",
    description: "Perfect for getting started",
    features: [
      "Up to 10 presentations",
      "AI content generation",
      "Basic templates",
      "Share & collaborate",
      "Support via email",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Professional",
    price: "$29",
    description: "For active creators",
    features: [
      "Unlimited presentations",
      "Advanced AI features",
      "Premium templates",
      "Real-time collaboration",
      "Priority support",
      "Custom branding",
      "Analytics dashboard",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For teams & organizations",
    features: [
      "Everything in Professional",
      "Advanced security",
      "Team management",
      "API access",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 border-t border-border/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan for your needs. Always flexible, always fair.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-xl p-8 border transition-all duration-300 ${
                plan.popular
                  ? "border-primary/50 bg-card ring-2 ring-primary/20"
                  : "border-border/40 bg-card/50 hover:border-border/60 hover:bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    Most Popular
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <p className="text-muted-foreground text-sm mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-muted-foreground">/month</span>}
              </div>

              <Link href="/signup">
                <Button className="w-full mb-8" variant={plan.popular ? "default" : "outline"}>
                  {plan.cta}
                </Button>
              </Link>

              <ul className="space-y-3">
                {plan.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
