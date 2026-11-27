import React from 'react';
import { LandingHero } from './LandingHero';
import { SubjectGrid } from './SubjectGrid';
import { RoleFeatureShowcase } from './RoleFeatureShowcase';
import { PricingTable } from './PricingTable';
import { FAQSection } from './FAQSection';
import { SaaSFooter } from './SaaSFooter';
import type { ViewMode } from '../../types';

interface LandingPageProps {
  onNavigate: (view: ViewMode) => void;
  onOpenUpgrade: () => void;
  onSelectPrompt?: (prompt: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigate,
  onOpenUpgrade,
  onSelectPrompt
}) => {
  const handleSelectPrompt = (prompt: string) => {
    if (onSelectPrompt) {
      onSelectPrompt(prompt);
    }
    onNavigate('ai-solver');
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col selection:bg-cyan-500/20 selection:text-cyan-200">
      <main className="flex-1">
        <LandingHero onNavigate={onNavigate} onOpenUpgrade={onOpenUpgrade} />
        <SubjectGrid onSelectPrompt={handleSelectPrompt} />
        <RoleFeatureShowcase onNavigate={onNavigate} />
        <PricingTable onOpenUpgrade={onOpenUpgrade} />
        <FAQSection />
      </main>
      <SaaSFooter onNavigate={onNavigate} onOpenUpgrade={onOpenUpgrade} />
    </div>
  );
};
