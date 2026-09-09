import { LocalSchemaGenerator } from '@/components/LocalSchemaGenerator';

export const metadata = {
  title: 'Free Local Business Schema Generator | RankinSEO',
  description:
    'Generate a LocalBusiness JSON-LD schema for free in seconds. Paste it into your site to help Google and AI engines understand your business.',
};

export default function Page() {
  return <LocalSchemaGenerator />;
}
