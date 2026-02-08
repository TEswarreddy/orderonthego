import { useState } from "react";
import { ChevronDown } from "lucide-react";

const Faqs = () => {
  const faqs = [
    {
      question: "Can I change my order after placing it?",
      answer:
        "Yes. You can modify items or delivery instructions until the restaurant begins preparation.",
    },
    {
      question: "What if my food arrives late or missing?",
      answer:
        "Report the issue directly from the app. Our support team will quickly resolve it with a refund or replacement.",
    },
    {
      question: "Do you offer contactless delivery?",
      answer:
        "Absolutely. Enable contactless delivery during checkout and add drop-off instructions.",
    },
    {
      question: "How do refunds work?",
      answer:
        "Refunds are processed to your original payment method and usually reflect within 3–5 business days.",
    },
    {
      question: "Can I reorder a previous meal?",
      answer:
        "Yes. Visit the My Orders page and reorder your favorites with a single tap.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-32 -left-32 h-96 w-96 rounded-full bg-orange-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-sky-300/30 blur-3xl" />

      <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6">
        {/* Header */}
        <div className="mb-14 text-center">
          <p className="mb-3 inline-block rounded-full bg-orange-100 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-orange-600 dark:bg-orange-500/10 dark:text-orange-400">
            FAQs
          </p>
          <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
            Got questions? We’ve got answers.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg dark:text-slate-400">
            Everything you need to know about ordering, payments, delivery, and your account.
          </p>
        </div>

        {/* FAQ list */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className={`rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur transition-all duration-300 dark:border-white/10 dark:bg-slate-900/70 ${
                  isOpen ? "shadow-lg" : "hover:shadow-md"
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-4 text-left"
                >
                  <span className="text-lg font-semibold text-slate-900 dark:text-white">
                    {faq.question}
                  </span>

                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 ${
                      isOpen
                        ? "rotate-180 border-orange-500 bg-orange-500 text-white"
                        : "border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    <ChevronDown size={18} />
                  </span>
                </button>

                {/* Animated answer */}
                <div
                  className={`grid overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <p className="mt-4 overflow-hidden text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer CTA */}
        <div className="mt-16 rounded-3xl bg-slate-900 px-6 py-10 text-center text-white shadow-xl sm:px-10">
          <h3 className="text-2xl font-semibold sm:text-3xl">
            Still need help?
          </h3>
          <p className="mt-3 text-slate-300">
            Our support team is available 24/7 to assist you.
          </p>
          <button className="mt-6 rounded-full bg-orange-500 px-8 py-3 text-sm font-semibold transition hover:bg-orange-600">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
};

export default Faqs;
