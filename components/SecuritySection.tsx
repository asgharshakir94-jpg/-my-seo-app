import { ShieldCheck, Lock, Users, RefreshCw } from "lucide-react";

const securityPoints = [
  {
    icon: Lock,
    title: "Your data stays yours",
    description:
      "Every account is protected with row-level security — your campaigns and content are never visible to other customers, ever.",
  },
  {
    icon: ShieldCheck,
    title: "Enterprise-grade infrastructure",
    description:
      "Built on Supabase and Vercel, the same infrastructure trusted by thousands of production applications for encrypted storage and secure hosting.",
  },
  {
    icon: Users,
    title: "You approve before it publishes",
    description:
      "Every article goes through review before it ever reaches your website — nothing goes live without your sign-off.",
  },
  {
    icon: RefreshCw,
    title: "Always encrypted, always backed up",
    description:
      "Data is encrypted in transit and at rest, with automatic backups so your content is never at risk of being lost.",
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