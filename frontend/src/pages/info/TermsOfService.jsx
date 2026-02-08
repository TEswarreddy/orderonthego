import { useState } from "react";
import { ChevronDown } from "lucide-react";

const TermsOfService = () => {
  const sections = [
    {
      title: "Using the service",
      body: "By placing an order you agree to provide accurate information and follow all applicable laws and regulations.",
    },
    {
      title: "Orders and cancellations",
      body: "Orders can be updated or canceled within the grace window shown at checkout. After pickup, changes may be limited.",
    },
    {
      title: "Pricing and fees",
      body: "Prices are set by restaurants. Delivery fees, service fees, and promotions are shown before you confirm an order.",
    },
    {
      title: "Refunds and adjustments",
      body: "If something goes wrong, we will work with you and the restaurant to make it right. Refunds are processed to the original payment method.",
    },
    {
      title: "Account security",
      body: "Keep your login details safe. You are responsible for activity under your account unless it is caused by a breach on our side.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-amber-50 font-body text-slate-900">
      <section className="container mx-auto px-6 py-16">
        <div className="relative max-w-3xl">
          <div className="absolute -top-10 -left-14 h-24 w-24 rounded-full bg-rose-200/40 blur-3xl" />
          <p className="text-sm uppercase tracking-[0.35em] text-orange-600">Terms</p>
          <h1 className="mt-3 text-4xl font-display font-semibold sm:text-5xl">
            Terms of Service
          </h1>
          <p className="mt-4 text-sm text-slate-600">Last updated: Feb 8, 2026</p>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            These terms explain how Order On The Go works, what you can expect from us, and
            how we handle orders and payments.
          </p>
        </div>

        <div className="mt-10 grid gap-4">
          {sections.map((section, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={section.title}
                className="rounded-3xl border border-slate-100 bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-xl font-display font-semibold text-slate-900">
                    {section.title}
                  </span>
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition ${
                      isOpen ? "rotate-180 bg-slate-900 text-white" : "bg-white"
                    }`}
                  >
                    <ChevronDown size={18} />
                  </span>
                </button>
                <div
                  className={`grid overflow-hidden text-sm text-slate-600 transition-all duration-300 ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <p className="mt-3 overflow-hidden leading-relaxed">{section.body}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-3xl border border-slate-100 bg-slate-900 p-7 text-white">
          <h3 className="text-lg font-display font-semibold">Questions about these terms?</h3>
          <p className="mt-2 text-sm text-slate-200">
            Reach out at support@orderonthego.com and we will walk you through any details.
          </p>
        </div>
      </section>
    </div>
  );
};

export default TermsOfService;
