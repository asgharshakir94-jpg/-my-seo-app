import type { Metadata } from "next";
import WriteForUsForm from "./WriteForUsForm";

export const metadata: Metadata = {
  title: "Write for Us | RankinSEO",
  description:
    "Run a roofing, solar, HVAC, plumbing or other trades business? Share your expertise with a guest article on RankinSEO. Free to submit, reviewed by hand.",
  alternates: { canonical: "/write-for-us" },
};

export default function WriteForUsPage() {
  return (
    <div className="min-h-screen bg-paper text-ink flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-surface border border-line rounded-xl p-8">
        <h1 className="text-3xl font-bold mb-2">Write for Us</h1>
        <p className="text-ink/70 mb-6">
          Do you own or run a trades business? Share what you know with other
          owners. We publish practical articles on getting leads, pricing jobs,
          local SEO, reviews and running a better business.
        </p>

        <div className="mb-8 rounded-md border border-line bg-paper p-4 text-sm text-ink/80">
          <p className="font-medium text-ink mb-2">Before you submit</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>It is free to submit. We do not charge for guest posts.</li>
            <li>
              Your article should be original and written for trades owners.
              Articles that are copied from elsewhere will not be published.
            </li>
            <li>
              Your English does not need to be perfect. We read every
              submission by hand and can tidy the wording.
            </li>
            <li>
              You can include a link to your business website in your author
              bio. Links in guest articles are marked nofollow.
            </li>
            <li>We reply to every submission by email, usually within a week.</li>
          </ul>
        </div>

        <WriteForUsForm />
      </div>
    </div>
  );
}