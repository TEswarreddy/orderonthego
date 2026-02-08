import { Link } from "react-router-dom";

const About = () => {
  const values = [
    {
      title: "Fresh-first sourcing",
      body: "We partner with kitchens that prep daily and keep a tight time-to-door promise.",
    },
    {
      title: "Delivery you can track",
      body: "Live updates, clear ETAs, and a support team ready when plans change.",
    },
    {
      title: "Community focused",
      body: "We spotlight local favorites and help small restaurants grow.",
    },
  ];

  const milestones = [
    { value: "2020", label: "Started delivering" },
    { value: "150+", label: "Restaurant partners" },
    { value: "12k", label: "Monthly orders" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-sky-50 font-body text-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute -top-32 -right-24 h-72 w-72 rounded-full bg-orange-200/40 blur-3xl" />
        <div className="absolute -bottom-32 -left-24 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />

        <section className="container mx-auto px-6 py-16">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="animate-fade-in">
              <p className="text-sm uppercase tracking-[0.35em] text-orange-600">About us</p>
              <h1 className="mt-3 text-4xl font-display font-semibold leading-tight sm:text-5xl">
                Built for busy days and bold cravings.
              </h1>
              <p className="mt-5 text-base text-slate-700 sm:text-lg">
                Order On The Go is a fast, friendly way to get your favorite meals without
                sacrificing freshness. We obsess over timing, packaging, and real-time updates
                so your food arrives the way it should.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/"
                  className="rounded-full bg-slate-900 px-6 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Browse restaurants
                </Link>
                <Link
                  to="/help"
                  className="rounded-full border border-slate-900/10 px-6 py-2 text-sm font-semibold text-slate-900 transition hover:border-slate-900/30"
                >
                  Visit help center
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {milestones.map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/60 bg-white/70 p-5 text-center shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-md"
                >
                  <p className="text-2xl font-display font-semibold text-slate-900">
                    {item.value}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-500">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <section className="container mx-auto px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {values.map((value) => (
            <div
              key={value.title}
              className="group rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <h3 className="text-lg font-display font-semibold text-slate-900">
                {value.title}
              </h3>
              <div className="mt-3 h-1 w-10 rounded-full bg-orange-500/80 transition group-hover:w-16" />
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{value.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl bg-slate-900 p-8 text-white shadow-lg">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <h2 className="text-2xl font-display font-semibold">Our promise to you</h2>
              <p className="mt-3 text-sm text-slate-200">
                Every order is handled with care, with live support if something needs a quick
                fix. We are constantly tuning routes and prep timing to keep meals on schedule.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-slate-200">Support window</p>
              <p className="mt-2 text-2xl font-display font-semibold">8 am to 11 pm</p>
              <p className="mt-2 text-xs text-slate-200">Local time, every day.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
