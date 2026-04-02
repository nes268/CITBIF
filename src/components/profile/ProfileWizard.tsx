import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ProgressBar from '../ui/ProgressBar';
import PersonalInfo from './steps/PersonalInfo';
import EnterpriseInfo from './steps/EnterpriseInfo';
import IncubationDetails from './steps/IncubationDetails';
import Documentation from './steps/Documentation';
import PitchDeckTraction from './steps/PitchDeckTraction';
import FundingInfo from './steps/FundingInfo';
import { Profile } from '../../types';
import { Building2 } from 'lucide-react';
import { profileApi } from '../../services/profileApi';
import { startupsApi } from '../../services/startupsApi';
import Button from '../ui/Button';
import Card from '../ui/Card';

const ProfileWizard: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [profileData, setProfileData] = useState<Partial<Profile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileSubmitted, setProfileSubmitted] = useState(false);
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const totalSteps = 6;

  const updateProfileData = (stepData: Partial<Profile>) => {
    setProfileData(prev => ({ ...prev, ...stepData }));
  };

  const nextStep = async (stepPayload?: Partial<Profile>) => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      if (!user?.id) {
        setError('User not found. Please login again.');
        return;
      }

      // Merge last-step fields here: updateData() schedules state async, so profileData
      // would still be stale on first submit without stepPayload.
      const payload = stepPayload
        ? { ...profileData, ...stepPayload }
        : profileData;

      setIsSaving(true);
      setError(null);

      try {
        const savedProfile = await profileApi.saveProfile({
          userId: user.id,
          ...payload
        } as Partial<Profile> & { userId: string });

        if (savedProfile.startupName && savedProfile.founderName && savedProfile.sector) {
          try {
            const existingStartup = await startupsApi.getStartupByUserId(user.id);
            
            const startupData = {
              name: savedProfile.startupName,
              founder: savedProfile.founderName,
              sector: savedProfile.sector,
              type: savedProfile.applicationType || 'incubation',
              email: savedProfile.email,
              submissionDate: new Date().toISOString().split('T')[0],
              userId: user.id,
              status: 'pending' as const
            };

            if (existingStartup) {
              await startupsApi.updateStartup(existingStartup.id, startupData);
            } else {
              await startupsApi.createStartup(startupData);
            }
          } catch (startupError: any) {
            console.error('Error creating/updating startup entry:', startupError);
          }
        }

        setError(null);
        setIsSaving(false);
        setProfileSubmitted(true);
      } catch (err: any) {
        setError(err.message || 'Failed to save profile. Please try again.');
        console.error('Error saving profile:', err);
        setIsSaving(false);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <PersonalInfo data={profileData} updateData={updateProfileData} onNext={nextStep} />;
      case 2:
        return <EnterpriseInfo data={profileData} updateData={updateProfileData} onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <IncubationDetails data={profileData} updateData={updateProfileData} onNext={nextStep} onPrev={prevStep} />;
      case 4:
        return <Documentation data={profileData} updateData={updateProfileData} onNext={nextStep} onPrev={prevStep} />;
      case 5:
        return <PitchDeckTraction data={profileData} updateData={updateProfileData} onNext={nextStep} onPrev={prevStep} />;
      case 6:
        return <FundingInfo data={profileData} updateData={updateProfileData} onNext={nextStep} onPrev={prevStep} />;
      default:
        return null;
    }
  };

  if (profileSubmitted) {
    return (
      <div className="min-h-screen bg-dots-pattern px-4 py-8 flex items-center justify-center">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="p-8">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
                <Building2 className="h-10 w-10 text-emerald-600" />
              </div>
            </div>
            <h1 className="text-3xl font-semibold text-[var(--text)] mb-4">Profile Submitted Successfully!</h1>
            <p className="text-[var(--text-muted)] mb-6">
              Your profile has been submitted and is now pending admin review. 
              You will be notified once your application has been reviewed.
            </p>
            <p className="text-[var(--text-subtle)] text-sm mb-8">
              Please wait for admin approval before accessing the dashboard.
            </p>
            <Button
              onClick={() => navigate('/login')}
              variant="primary"
              size="lg"
            >
              Return to Login
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dots-pattern px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-2 mb-4">
            <div className="h-10 w-10 rounded-full bg-[var(--accent-muted)] flex items-center justify-center">
              <Building2 className="h-5 w-5 text-[var(--accent)]" />
            </div>
            <h1 className="text-3xl font-semibold text-[var(--text)]">Profile Setup</h1>
          </div>
          <p className="text-[var(--text-muted)]">Complete your profile to access the dashboard</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar current={currentStep} total={totalSteps} />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
            {error}
          </div>
        )}

        {/* Step Content */}
        <Card>
          {renderStep()}
        </Card>

        {/* Loading overlay */}
        {isSaving && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
            aria-busy="true"
            aria-live="polite"
          >
            <div className="flex items-center gap-1.5" role="status">
              <span className="sr-only">Loading</span>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="h-2 w-2 rounded-full bg-[var(--accent)]"
                  animate={{ y: [0, -8, 0], opacity: [0.45, 1, 0.45] }}
                  transition={{
                    duration: 0.55,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.12,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileWizard;
