import React, { useState, useEffect } from 'react';
import Card from '../../ui/Card';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  FileText, 
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  X
} from 'lucide-react';
import { useInvestors } from '../../../hooks/useInvestors';
import { useFunding } from '../../../context/FundingContext';
import { useAlerts } from '../../../context/AlertsContext';
import { useAuth } from '../../../context/AuthContext';
import { startupsApi } from '../../../services/startupsApi';
import { investorsApi } from '../../../services/investorsApi';
import { profileApi } from '../../../services/profileApi';

const Overview: React.FC = () => {
  const { user } = useAuth();
  const { investors, loading: investorsLoading, error: investorsError } = useInvestors();
  const { fundingStages } = useFunding();
  const { getUpcomingAlerts, markAsCompleted, deleteAlert } = useAlerts();
  const [startupPhase, setStartupPhase] = useState<string | null>(null);
  const [loadingPhase, setLoadingPhase] = useState(true);
  const [startupName, setStartupName] = useState<string>('');
  const [requestingIntro, setRequestingIntro] = useState<string | null>(null);
  const [introSuccess, setIntroSuccess] = useState<string | null>(null);
  const [introError, setIntroError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          setLoadingPhase(true);
          
          // Fetch startup phase and name
          let foundStartupName = false;
          try {
            const startups = await startupsApi.getStartups(user.id);
            if (startups.length > 0) {
              if (startups[0].startupPhase) {
                setStartupPhase(startups[0].startupPhase);
              }
              if (startups[0].name) {
                setStartupName(startups[0].name);
                foundStartupName = true;
              }
            }
          } catch (error) {
            console.error('Error fetching startup phase:', error);
          }

          // Fetch profile to get startup name if not available from startup
          if (!foundStartupName) {
            try {
              const profile = await profileApi.getProfileByUserId(user.id);
              if (profile.startupName) {
                setStartupName(profile.startupName);
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
            }
          }
        } finally {
          setLoadingPhase(false);
        }
      } else {
        setLoadingPhase(false);
      }
    };
    fetchData();
  }, [user?.id]);

  const getPhaseLabel = (phase: string | null) => {
    if (!phase) return 'Not Set';
    const phaseMap: { [key: string]: string } = {
      'idea': 'Idea',
      'mvp': 'MVP',
      'seed': 'Seed',
      'series-a': 'Series A',
      'growth': 'Growth',
      'scale': 'Scale'
    };
    return phaseMap[phase] || phase;
  };

  const alerts = getUpcomingAlerts(30); // Get alerts for next 30 days

  const handleMarkComplete = (alertId: string) => {
    markAsCompleted(alertId);
  };

  const handleDeleteAlert = (alertId: string) => {
    deleteAlert(alertId);
  };

  const handleRequestIntro = async (investor: { id: string; email: string; name: string }) => {
    if (!user?.id || !user?.email || !user?.fullName) {
      setIntroError('User information not available. Please log in again.');
      setTimeout(() => setIntroError(null), 5000);
      return;
    }

    if (!startupName) {
      setIntroError('Startup name not found. Please complete your profile.');
      setTimeout(() => setIntroError(null), 5000);
      return;
    }

    setRequestingIntro(investor.id);
    setIntroError(null);
    setIntroSuccess(null);

    try {
      await investorsApi.requestIntro(
        investor.email,
        startupName,
        user.email,
        user.fullName
      );
      
      setIntroSuccess(`Introduction request sent to ${investor.name} successfully!`);
      setTimeout(() => setIntroSuccess(null), 5000);
    } catch (error: any) {
      console.error('Error sending intro request:', error);
      setIntroError(error.message || 'Failed to send introduction request. Please try again.');
      setTimeout(() => setIntroError(null), 5000);
    } finally {
      setRequestingIntro(null);
    }
  };


  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-900/30 text-red-400 border-red-500/50';
      case 'high':
        return 'bg-orange-900/30 text-orange-400 border-orange-500/50';
      case 'medium':
        return 'bg-blue-900/30 text-blue-400 border-blue-500/50';
      case 'low':
        return 'bg-blue-900/30 text-blue-400 border-blue-500/50';
      default:
        return 'bg-gray-900/30 text-gray-400 border-gray-500/50';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'meeting':
        return <Calendar className="h-4 w-4" />;
      case 'deadline':
        return <AlertCircle className="h-4 w-4" />;
      case 'session':
        return <Users className="h-4 w-4" />;
      case 'milestone':
        return <TrendingUp className="h-4 w-4" />;
      case 'funding':
        return <FileText className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  // Use funding stages from context instead of hardcoded milestones
  const milestones = fundingStages.map(stage => ({
    stage: stage.name,
    status: stage.status,
    date: stage.date || null,
    progress: stage.progress
  }));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'current':
        return <Clock className="h-5 w-5 text-blue-400" />;
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-600"></div>;
    }
  };


  const getProgressColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-400';
      case 'current':
        return 'bg-blue-400';
      default:
        return 'bg-gray-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Startup Dashboard</h1>
        <p className="text-gray-400">Track your progress and manage your startup journey</p>
      </div>

      {/* Upcoming Alerts */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">
            Upcoming Alerts
          </h2>
          <div className="text-sm text-gray-400">
            {alerts.length} upcoming alerts
          </div>
        </div>
        
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No upcoming alerts</h3>
            <p className="text-gray-400">Alerts will appear here when admin actions occur</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getTypeIcon(alert.type)}
                    <h3 className="text-white font-medium">{alert.title}</h3>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleMarkComplete(alert.id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10 rounded transition-colors"
                      title="Mark as completed"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                      title="Delete alert"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                
                {alert.description && (
                  <p className="text-sm text-gray-300 mb-2">{alert.description}</p>
                )}
                
                <div className="flex items-center justify-between mt-3">
                  <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(alert.priority)}`}>
                    {alert.priority}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    alert.type === 'meeting' ? 'bg-blue-900/30 text-blue-400' :
                    alert.type === 'deadline' ? 'bg-red-900/30 text-red-400' :
                    alert.type === 'session' ? 'bg-emerald-900/30 text-emerald-400' :
                    alert.type === 'milestone' ? 'bg-purple-900/30 text-purple-400' :
                    alert.type === 'funding' ? 'bg-cyan-900/30 text-cyan-400' :
                    'bg-gray-900/30 text-gray-400'
                  }`}>
                    {alert.type}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Fundraising Progress and Investor Suggestions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Fundraising and Startup Stage */}
        <div className="space-y-6">
          {/* Fundraising Progress */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-cyan-400" />
                Fundraising
              </h2>
              <div className="text-sm text-gray-400">
                {milestones.filter(m => m.status === 'completed').length}/{milestones.length}
              </div>
            </div>
            
            {/* Horizontal Progress Bar */}
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-gray-700 rounded-full">
                <div 
                  className="h-1 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(milestones.filter(m => m.status === 'completed').length / milestones.length) * 100}%` 
                  }}
                ></div>
              </div>
              
              {/* Steps */}
              <div className="relative flex items-center justify-between">
                {milestones.map((milestone, index) => {
                  const isCompleted = milestone.status === 'completed';
                  const isCurrent = milestone.status === 'current';
                  
                  return (
                    <div 
                      key={index} 
                      className="relative flex flex-col items-center"
                    >
                      {/* Step Circle */}
                      <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-200 ${
                        isCompleted 
                          ? 'bg-emerald-400 border-emerald-400 shadow-lg shadow-emerald-400/50' 
                          : isCurrent
                          ? 'bg-blue-400 border-blue-400 shadow-lg shadow-blue-400/50'
                          : 'bg-gray-800 border-gray-600'
                      }`}>
                        {getStatusIcon(milestone.status)}
                      </div>
                      
                      {/* Step Label */}
                      <div className="mt-3 text-center">
                        <p className={`text-xs font-medium ${
                          isCompleted ? 'text-emerald-400' :
                          isCurrent ? 'text-blue-400' :
                          'text-gray-400'
                        }`}>
                          {milestone.stage}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {milestone.progress}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Startup Stage */}
          {startupPhase && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Startup Stage</h2>
              </div>
              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-1">Current Stage</p>
                <p className="text-xl font-bold text-white">{getPhaseLabel(startupPhase)}</p>
              </div>
            </Card>
          )}
        </div>

        {/* Investor Suggestions */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Available Investors</h2>
          
          {introSuccess && (
            <div className="mb-4 p-3 bg-green-900/20 border border-green-500/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span className="text-green-300 text-sm">{introSuccess}</span>
              </div>
            </div>
          )}

          {introError && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-red-300 text-sm">{introError}</span>
              </div>
            </div>
          )}
          
          {investorsError && (
            <div className="mb-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-red-300 text-sm">{investorsError}</span>
              </div>
            </div>
          )}

          {investorsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center space-x-3">
                <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
                <span className="text-gray-400">Loading investors...</span>
              </div>
            </div>
          ) : investors.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No investors available</h3>
              <p className="text-gray-400">Investors will appear here once they are added by administrators</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 justify-center">
              {investors.slice(0, 3).map((investor) => (
                <div key={investor.id} className="bg-gray-700/50 rounded-lg p-4 border border-gray-600 flex flex-col items-center text-center w-full sm:w-[calc(50%-0.5rem)] lg:w-[calc(33.333%-0.67rem)]">
                  <div className="mb-3">
                    <div className="h-12 w-12 bg-cyan-500 rounded-full flex items-center justify-center text-white font-medium mx-auto mb-2">
                      {investor.profilePicture}
                    </div>
                    <h3 className="text-white font-medium text-base mb-1">{investor.name}</h3>
                    <p className="text-xs text-gray-400">{investor.firm}</p>
                  </div>
                  <p className="text-xs text-gray-300 mb-2 line-clamp-3">{investor.backgroundSummary}</p>
                  <p className="text-xs text-gray-400 mb-3">Investment Range: {investor.investmentRange}</p>
                  <button 
                    onClick={() => handleRequestIntro(investor)}
                    disabled={requestingIntro === investor.id}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white py-1.5 px-3 rounded-lg text-xs font-medium transition-colors flex items-center justify-center"
                  >
                    {requestingIntro === investor.id ? (
                      <>
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      'Request Intro'
                    )}
                  </button>
                </div>
              ))}
              {investors.length > 3 && (
                <div className="w-full text-center mt-4">
                  <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium">
                    View All Investors ({investors.length - 3} more)
                  </button>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

    </div>
  );
};

export default Overview;