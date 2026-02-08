import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Sparkles } from "lucide-react";

const HelpCenter = () => {
  const topics = [
    {
      title: "Ordering",
      desc: "Place, edit, or cancel an order within a few taps.",
      items: [
        "Track live preparation and courier updates.",
        "Edit delivery notes before pickup.",
        "Cancel within the grace window for a full refund.",
      ],
    },
    {
      title: "Payments",
      desc: "Multiple payment options with clear receipts.",
      items: [
        "Secure card payments and instant confirmation.",
        "Saved methods for faster checkout.",
        "Receipts emailed automatically.",
      ],
    },
    {
      title: "Delivery",
      desc: "Reliable delivery with smart routing and support.",
      items: [
        "Real-time courier location and ETA.",
        "Contactless drop-off options.",
        "Support for missing or incorrect items.",
      ],
    },
    {
      title: "Account",
      desc: "Manage your profile and preferences.",
      items: [
        "Update phone, email, and addresses.",
        "Dietary preferences and favorites.",
        "Export order history at any time.",
      ],
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeTopic = topics[activeIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-amber-50 font-body text-slate-900">
      <section className="container mx-auto px-6 py-16">
        <div className="relative max-w-3xl">
          <div className="absolute -top-8 -left-16 h-24 w-24 rounded-full bg-sky-200/40 blur-3xl" />
          <p className="text-sm uppercase tracking-[0.35em] text-orange-600">Help center</p>
          <h1 className="mt-3 text-4xl font-display font-semibold sm:text-5xl">
            How can we help today?
          </h1>
          <p className="mt-4 text-base text-slate-600 sm:text-lg">
            Quick answers and practical tips for ordering, payments, delivery, and account
            management. If you need more, our team is ready to jump in.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/faqs"
              className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Browse FAQs
            </Link>
            <a
              href="mailto:thathieswarreddy@gmail.com"
              className="rounded-full border border-slate-900/10 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900/30"
            >
              Email support
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          {topics.map((topic, index) => {
            const isActive = index === activeIndex;
            return (
              <button
                key={topic.title}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-slate-900 text-white shadow"
                    : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {topic.title}
              </button>
            );
          })}
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl bg-white p-7 shadow-sm">
            <div className="flex items-center gap-3 text-orange-600">
              <Sparkles size={18} />
              <p className="text-xs uppercase tracking-[0.3em]">Featured topic</p>
            </div>
            <h2 className="mt-3 text-2xl font-display font-semibold text-slate-900">
              {activeTopic.title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{activeTopic.desc}</p>
            <ul className="mt-5 space-y-3 text-sm text-slate-600">
              {activeTopic.items.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-500" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/faqs"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-orange-600 transition hover:text-orange-700"
            >
              Read related FAQs
              <ArrowUpRight size={16} />
            </Link>
          </div>

          <div className="grid gap-4">
            {topics.map((topic, index) => (
              <button
                key={topic.title}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`rounded-3xl border px-6 py-5 text-left transition hover:-translate-y-1 hover:shadow-md ${
                  index === activeIndex
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-100 bg-white text-slate-700"
                }`}
              >
                <p className="text-lg font-display font-semibold">{topic.title}</p>
                <p className={`mt-2 text-sm ${index === activeIndex ? "text-slate-200" : "text-slate-500"}`}>
                  {topic.desc}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-slate-100 bg-slate-900 p-8 text-white">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h3 className="text-2xl font-display font-semibold">Need a human?</h3>
              <p className="mt-3 text-sm text-slate-200">
                Reach us from 8 am to 11 pm. We respond quickly and can adjust orders in real
                time.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-200">Call or text</p>
              <p className="mt-2 text-xl font-semibold">+91 7416518998</p>
              <p className="mt-2 text-xs text-slate-200">Average response: under 3 minutes.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenter;
