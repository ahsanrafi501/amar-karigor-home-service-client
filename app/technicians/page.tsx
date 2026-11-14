import type { Metadata } from 'next';
import { Catalog } from '@/components/marketplace/catalog';
export const metadata: Metadata = { title: 'Our professionals' };
export default function TechniciansPage() { return <Catalog professionals />; }
