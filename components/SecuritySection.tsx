import { ShieldCheck, Lock, Users, RefreshCw } from "lucide-react";

const securityPoints = [
  {
    icon: Lock,
    title: "Your account is private",
    description:
      "Your campaigns and articles are saved under your own login, and sign-in is handled by Supabase Auth.",
  },
  {
    icon: ShieldCheck,
    title: "Hosted on established platforms",
    description:
      "RankinSEO runs on Vercel, with data stored in Supabase. Payments are handled securely by Lemon Squeezy.",
  },
  {
    icon: Users,
    title: "You stay in control",
    description:
      "You review each article and publish it yourself on your own website. Nothing is posted for you.",
  },
  {
    icon: RefreshCw,
    title: "Encrypted connections",
    description:
      "Traffic to RankinSEO uses HTTPS, and Supabase encrypts stored data at rest.",
  },
];

export default function SecuritySection() {
  return (
    <section id="security" className="bg-paper py-20 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-ink mb-4">
          Built with your trust in mind
        </h2>
        <p className="text-ink/70 max-w-2xl mx-auto mb-12">
          You're trusting us with your content and your customers' experience.
          Here's how we keep it safe.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          {securityPoints.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-surface border border-line rounded-xl p-6 flex gap-4"
            >
              <div className="shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-accent-from to-accent-from/70 flex items-center justify-center">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-ink font-semibold mb-1">{title}</h3>
                <p className="text-ink/70 text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}