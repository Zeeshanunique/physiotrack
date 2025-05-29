import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { User, Save, Camera, X, Edit } from 'lucide-react';

interface UserStats {
  height: number | null;
  weight: number | null;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | null;
  goals: string[];
  conditions: string[];
}

const Profile: React.FC = () => {
  const { user, updateProfile, isLoading } = useAuthStore();
  
  // Profile state
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [stats, setStats] = useState<UserStats>({
    height: 170,
    weight: 70,
    fitnessLevel: 'intermediate',
    goals: ['Improve mobility', 'Reduce pain', 'Build strength'],
    conditions: ['Rotator cuff injury']
  });
  
  // Personal records state
  const [personalRecords, setPersonalRecords] = useState([
    { id: '1', name: 'Shoulder external rotation', value: '12 reps × 3 sets', date: '2025-04-28' },
    { id: '2', name: 'Hip bridge', value: '15 reps × 3 sets', date: '2025-05-01' },
    { id: '3', name: 'Wall slides', value: '10 reps × 4 sets', date: '2025-05-03' }
  ]);
  
  // Badges/achievements
  const achievements = [
    { id: '1', name: 'First Workout', description: 'Completed your first exercise session', date: '2025-04-20', icon: '🏆' },
    { id: '2', name: '5-Day Streak', description: 'Worked out for 5 consecutive days', date: '2025-04-25', icon: '🔥' },
    { id: '3', name: 'Perfect Form', description: 'Maintained excellent form throughout an exercise', date: '2025-04-30', icon: '⭐' }
  ];
  
  const handleSaveProfile = async () => {
    try {
      await updateProfile({
        displayName,
        // In a real app, would save other profile data to Firestore
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        {/* Profile information */}
        <div className="md:col-span-1">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-primary-600 flex items-center justify-center text-white text-3xl mb-4">
                  {user?.displayName ? user.displayName[0].toUpperCase() : <User className="h-12 w-12" />}
                </div>
                {isEditing ? (
                  <div className="mt-2 w-full">
                    <label htmlFor="displayName" className="sr-only">Name</label>
                    <input
                      type="text"
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="block w-full rounded-md border border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                ) : (
                  <h3 className="text-lg font-bold text-neutral-900 mt-2">{user?.displayName}</h3>
                )}
                <p className="text-sm text-neutral-500">{user?.email}</p>
                
                <div className="flex mt-4">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        onClick={handleSaveProfile}
                        disabled={isLoading}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 mr-2"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="inline-flex items-center px-3 py-1.5 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-3 py-1.5 border border-neutral-300 text-sm font-medium rounded-md text-neutral-700 bg-white hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Profile
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mt-6 border-t border-neutral-200 pt-6">
                <h3 className="text-md font-medium text-neutral-900 mb-4">Personal Information</h3>
                <dl className="divide-y divide-neutral-200">
                  <div className="py-3 flex justify-between text-sm">
                    <dt className="text-neutral-500">Height</dt>
                    <dd className="text-neutral-900 font-medium">
                      {isEditing ? (
                        <input
                          type="number"
                          value={stats.height || ''}
                          onChange={(e) => setStats({ ...stats, height: parseFloat(e.target.value) || null })}
                          className="w-20 rounded-md border border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      ) : (
                        `${stats.height || '--'} cm`
                      )}
                    </dd>
                  </div>
                  <div className="py-3 flex justify-between text-sm">
                    <dt className="text-neutral-500">Weight</dt>
                    <dd className="text-neutral-900 font-medium">
                      {isEditing ? (
                        <input
                          type="number"
                          value={stats.weight || ''}
                          onChange={(e) => setStats({ ...stats, weight: parseFloat(e.target.value) || null })}
                          className="w-20 rounded-md border border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        />
                      ) : (
                        `${stats.weight || '--'} kg`
                      )}
                    </dd>
                  </div>
                  <div className="py-3 flex justify-between text-sm">
                    <dt className="text-neutral-500">Fitness Level</dt>
                    <dd className="text-neutral-900 font-medium">
                      {isEditing ? (
                        <select
                          value={stats.fitnessLevel || ''}
                          onChange={(e) => setStats({ ...stats, fitnessLevel: e.target.value as any })}
                          className="rounded-md border border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        >
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      ) : (
                        stats.fitnessLevel ? stats.fitnessLevel.charAt(0).toUpperCase() + stats.fitnessLevel.slice(1) : '--'
                      )}
                    </dd>
                  </div>
                  <div className="py-3 text-sm">
                    <dt className="text-neutral-500 mb-2">Fitness Goals</dt>
                    <dd className="text-neutral-900">
                      {isEditing ? (
                        <div className="space-y-2">
                          {stats.goals.map((goal, index) => (
                            <div key={index} className="flex items-center">
                              <input
                                type="text"
                                value={goal}
                                onChange={(e) => {
                                  const newGoals = [...stats.goals];
                                  newGoals[index] = e.target.value;
                                  setStats({ ...stats, goals: newGoals });
                                }}
                                className="block w-full rounded-md border border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newGoals = [...stats.goals];
                                  newGoals.splice(index, 1);
                                  setStats({ ...stats, goals: newGoals });
                                }}
                                className="ml-2 text-neutral-400 hover:text-error-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setStats({ ...stats, goals: [...stats.goals, ''] })}
                            className="inline-flex items-center px-2 py-1 text-xs border border-neutral-300 rounded-md text-neutral-700 bg-white hover:bg-neutral-50"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Goal
                          </button>
                        </div>
                      ) : (
                        <ul className="list-disc list-inside space-y-1">
                          {stats.goals.map((goal, index) => (
                            <li key={index}>{goal}</li>
                          ))}
                        </ul>
                      )}
                    </dd>
                  </div>
                  <div className="py-3 text-sm">
                    <dt className="text-neutral-500 mb-2">Medical Conditions</dt>
                    <dd className="text-neutral-900">
                      {isEditing ? (
                        <div className="space-y-2">
                          {stats.conditions.map((condition, index) => (
                            <div key={index} className="flex items-center">
                              <input
                                type="text"
                                value={condition}
                                onChange={(e) => {
                                  const newConditions = [...stats.conditions];
                                  newConditions[index] = e.target.value;
                                  setStats({ ...stats, conditions: newConditions });
                                }}
                                className="block w-full rounded-md border border-neutral-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newConditions = [...stats.conditions];
                                  newConditions.splice(index, 1);
                                  setStats({ ...stats, conditions: newConditions });
                                }}
                                className="ml-2 text-neutral-400 hover:text-error-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => setStats({ ...stats, conditions: [...stats.conditions, ''] })}
                            className="inline-flex items-center px-2 py-1 text-xs border border-neutral-300 rounded-md text-neutral-700 bg-white hover:bg-neutral-50"
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add Condition
                          </button>
                        </div>
                      ) : (
                        <ul className="list-disc list-inside space-y-1">
                          {stats.conditions.map((condition, index) => (
                            <li key={index}>{condition}</li>
                          ))}
                        </ul>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        {/* Records and achievements */}
        <div className="md:col-span-2 mt-5 md:mt-0">
          {/* Personal records */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-neutral-900">Personal Records</h3>
              <p className="mt-1 max-w-2xl text-sm text-neutral-500">Your best performances in each exercise</p>
            </div>
            <div className="border-t border-neutral-200">
              <ul className="divide-y divide-neutral-200">
                {personalRecords.map((record) => (
                  <li key={record.id} className="px-4 py-4 sm:px-6 hover:bg-neutral-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{record.name}</p>
                        <p className="text-sm text-neutral-500">{record.value}</p>
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {new Date(record.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Achievements */}
          <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-neutral-900">Achievements</h3>
              <p className="mt-1 max-w-2xl text-sm text-neutral-500">Milestones you've reached in your recovery journey</p>
            </div>
            <div className="border-t border-neutral-200">
              <ul className="divide-y divide-neutral-200">
                {achievements.map((achievement) => (
                  <li key={achievement.id} className="px-4 py-4 sm:px-6 hover:bg-neutral-50">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 text-2xl mr-4">{achievement.icon}</div>
                      <div>
                        <p className="text-sm font-medium text-neutral-900">{achievement.name}</p>
                        <p className="text-sm text-neutral-500">{achievement.description}</p>
                        <p className="text-xs text-neutral-400 mt-1">Earned on {new Date(achievement.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Account settings */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-neutral-900">Account Settings</h3>
              <p className="mt-1 max-w-2xl text-sm text-neutral-500">Manage your account preferences</p>
            </div>
            <div className="border-t border-neutral-200 px-4 py-5 sm:px-6">
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="email-notifications"
                      name="email-notifications"
                      type="checkbox"
                      defaultChecked={true}
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-neutral-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="email-notifications" className="font-medium text-neutral-700">
                      Email notifications
                    </label>
                    <p className="text-neutral-500">Receive email updates about your scheduled workouts and progress.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="browser-notifications"
                      name="browser-notifications"
                      type="checkbox"
                      defaultChecked={true}
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-neutral-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="browser-notifications" className="font-medium text-neutral-700">
                      Browser notifications
                    </label>
                    <p className="text-neutral-500">Get push notifications for workout reminders and achievements.</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="data-sharing"
                      name="data-sharing"
                      type="checkbox"
                      defaultChecked={false}
                      className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-neutral-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="data-sharing" className="font-medium text-neutral-700">
                      Share data with healthcare provider
                    </label>
                    <p className="text-neutral-500">Allow your physiotherapist to access your workout data and progress.</p>
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Save Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper components
const Plus: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
};

export default Profile;