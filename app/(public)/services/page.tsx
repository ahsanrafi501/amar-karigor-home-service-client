import type { Metadata } from 'next';
import { Catalog } from '@/components/marketplace/catalog';
export const metadata: Metadata = { title: 'Find a service' };
export default function ServicesPage() { return <Catalog />; }
