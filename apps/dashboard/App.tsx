import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { DashboardLayout } from './components/DashboardLayout';
import { dashboardService } from './services/dashboardService';
import { DashboardView, PersonalDashboardData, TeamDashboardData, OrgDashboardData } from './types';
import { UserDashboard } from './modules/dashboard/pages/UserDashboard';
import { TeamDashboard } from './modules/dashboard/pages/TeamDashboard';
import { OrgDashboard } from './modules/dashboard/pages/OrgDashboard';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<DashboardView>(DashboardView.PERSONAL);
  const [loading, setLoading] = useState<boolean>(true);
  
  // State for data
  const [personalData, setPersonalData] = useState<PersonalDashboardData | null>(null);
  const [teamData, setTeamData] = useState<TeamDashboardData | null>(null);
  const [orgData, setOrgData] = useState<OrgDashboardData | null>(null);

  // Fetch data when view changes
  useEffect(() => {
    const needsPersonal = currentView === DashboardView.PERSONAL && !personalData;
    const needsTeam = currentView === DashboardView.TEAM && !teamData;
    const needsOrg = currentView === DashboardView.ORG && !orgData;
    const needsFetch = needsPersonal || needsTeam || needsOrg;

    if (!needsFetch) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const loadData = async () => {
      setLoading(true);
      try {
        if (needsPersonal) {
          const data = await dashboardService.getPersonalDashboard();
          if (!cancelled) {
            setPersonalData(data);
          }
        }
        if (needsTeam) {
          const data = await dashboardService.getTeamDashboard('team-1');
          if (!cancelled) {
            setTeamData(data);
          }
        }
        if (needsOrg) {
          const data = await dashboardService.getOrgDashboard();
          if (!cancelled) {
            setOrgData(data);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load dashboard data', err);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      cancelled = true;
    };
  }, [currentView, personalData, teamData, orgData]);

  // Loading State
  if (loading && !personalData && !teamData && !orgData) {
     return (
       <div className="h-screen w-full flex items-center justify-center bg-slate-50">
         <div className="flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-indigo-600" size={32} />
            <span className="text-slate-500 font-medium animate-pulse">Loading Workspace...</span>
         </div>
       </div>
     );
  }

  const handleAskAiAssistant = () => {
    // Placeholder hook for the upcoming AI automation assistant integration.
    console.info('AI Assistant action will be implemented in Phase B.');
  };

  return (
    <DashboardLayout currentView={currentView} onViewChange={setCurrentView}>
      {loading ? (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="animate-spin text-indigo-500" />
        </div>
      ) : (
        <>
          {currentView === DashboardView.PERSONAL && personalData && (
            <UserDashboard data={personalData} onAskAi={handleAskAiAssistant} />
          )}
          {currentView === DashboardView.TEAM && teamData && (
            <TeamDashboard data={teamData} />
          )}
          {currentView === DashboardView.ORG && orgData && (
            <OrgDashboard data={orgData} />
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default App;
