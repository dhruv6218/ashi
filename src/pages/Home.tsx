import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { HeroSection } from '../components/sections/HeroSection';
import { LogoTicker } from '../components/sections/LogoTicker';
import { ChaosSection } from '../components/sections/ChaosSection';
import { VolumeValueSection } from '../components/sections/VolumeValueSection';
import { IngestionSection } from '../components/sections/IngestionSection';
import { SignalExplorerSection } from '../components/sections/SignalExplorerSection';
import { ClaritySection } from '../components/sections/ClaritySection';
import { EvidenceViewSection } from '../components/sections/EvidenceViewSection';
import { EngineSection } from '../components/sections/EngineSection';
import { DecisionLabSection } from '../components/sections/DecisionLabSection';
import { ArtifactSection } from '../components/sections/ArtifactSection';
import { PostLaunchSection } from '../components/sections/PostLaunchSection';
import { AskAssistantSection } from '../components/sections/AskAssistantSection';
import { DigestSection } from '../components/sections/DigestSection';
import { MainLayout } from '../layouts/MainLayout';

export const Home = () => {
  const location = useLocation();

  // Handle smooth scroll to hash links when navigating from other pages
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const element = document.getElementById(id);
      if (element) {
        // Small delay to ensure the DOM is fully rendered before scrolling
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location]);

  return (
    <MainLayout>
      <HeroSection />
      <LogoTicker />
      <ChaosSection />
      <VolumeValueSection />
      <IngestionSection />
      <SignalExplorerSection />
      <ClaritySection />
      <EvidenceViewSection />
      <EngineSection />
      <DecisionLabSection />
      <ArtifactSection />
      <PostLaunchSection />
      <AskAssistantSection />
      <DigestSection />
    </MainLayout>
  );
};
