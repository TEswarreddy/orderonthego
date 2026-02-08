import { useState } from "react";
import { ChevronDown } from "lucide-react";

const PrivacyPolicy = () => {
  const sections = [
    {
      title: "What we collect",
      body: "We collect account details, delivery addresses, and order information needed to process your requests.",
    },
    {
      title: "How we use data",
      body: "We use your information to fulfill orders, provide support, and improve delivery accuracy.",
    },
    {
      title: "Sharing",
      body: "We share only what is necessary with restaurants and couriers to complete your delivery.",
    },
    {
      title: "Security",
      body: "We use industry-standard safeguards and limit access to sensitive data.",
    },
    {
      title: "Your choices",
      body: "You can update your profile, remove saved payment methods, and request data exports at any time.",
    },
  ];

  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-sky-50 font-body text-slate-900">
      <section className="container mx-auto px-6 py-16">
        <div className="relative max-w-3xl">
          <div className="absolute -top-10 -left-14 h-24 w-24 rounded-full bg-amber-200/40 blur-3xl" />
          <p className="text-sm uppercase tracking-[0.35em] text-orange-600">Privacy</p>
          <h1 className="mt-3 text-4xl font-display font-semibold sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-sm text-slate-600">Last updated: Feb 8, 2026</p>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            We respect your data and keep your information limited to what is needed for a
            great delivery experience.
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
          <h3 className="text-lg font-display font-semibold">Need more detail?</h3>
          <p className="mt-2 text-sm text-slate-200">
            Email privacy@orderonthego.com for data requests or questions.
          </p>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
