import { ProfileDetail } from '@/components/marketplace/profile-detail';
export default async function TechnicianPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <ProfileDetail id={id} />; }
