import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Settings | Video Production News',
  description: 'Manage your cookie preferences for Video Production News',
};

export default function CookieSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
