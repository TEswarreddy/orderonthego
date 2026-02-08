import { useState } from "react";
import { ChevronDown } from "lucide-react";

const Faqs = () => {
  const faqs = [
    {
      question: "Can I change my order after placing it?",
      answer: "Yes. You can edit items or delivery notes before the restaurant confirms prep.",
    },
    {
      question: "What if my food arrives late or missing?",
      answer: "Report it in the app and our support team will credit or resend quickly.",
    },
    {
      question: "Do you offer contactless delivery?",
      answer: "Yes. Toggle contactless delivery at checkout and add drop-off instructions.",
    },
    {
      question: "How do refunds work?",
      answer: "Refunds go back to the original payment method and typically post in 3 to 5 days.",
    },
    {
      question: "Can I reorder a previous meal?",
      answer: "Yes. Use the My Orders page to reorder favorites in a single tap.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,146,60,0.15),_transparent_55%),radial-gradient(circle_at_20%_35%,_rgba(56,189,248,0.18),_transparent_45%),linear-gradient(135deg,_#fff7ed_0%,_#ffffff_45%,_#fefce8_100%)] font-body text-slate-900">
      <section className="container mx-auto px-6 py-16">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="relative max-w-xl">
            <div className="absolute -top-10 -left-14 h-24 w-24 rounded-full bg-orange-200/50 blur-3xl" />
            <p className="text-sm uppercase tracking-[0.35em] text-orange-600">FAQs</p>
            <h1 className="mt-3 text-4xl font-display font-semibold sm:text-5xl">
              Quick answers, ready to go.
            </h1>
            <p className="mt-4 text-base text-slate-600 sm:text-lg">
              Browse the most common questions about ordering, delivery, and account
              settings. You can also reach the team anytime.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {["Orders", "Payments", "Delivery", "Account"].map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/60 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/80 p-7 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
                  Support response
                </p>
                <p className="mt-2 text-3xl font-display font-semibold text-slate-900">
                  Under 3 min
                </p>
              </div>
              <div className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                Live daily
              </div>
            </div>
            <div className="mt-6 grid gap-3 text-sm text-slate-600">
              {[
                "Priority support for live orders",
                "Refunds processed in 3 to 5 days",
                "Real-time courier tracking",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 grid gap-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.question}
                className={`rounded-3xl border bg-white/90 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                  isOpen ? "border-slate-900/20" : "border-slate-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="flex w-full items-center justify-between gap-4 text-left"
                  aria-expanded={isOpen}
                >
                  <span className="text-lg font-display font-semibold text-slate-900">
                    {faq.question}
                  </span>
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full border text-slate-500 transition ${
                      isOpen
                        ? "rotate-180 border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white"
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
                  <p className="mt-3 overflow-hidden leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default Faqs;
