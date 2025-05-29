import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, TrendingUp, Target, Clock, Award } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import ProgressChart from '../../components/dashboard/ProgressChart';
import ExerciseCard from '../../components/exercises/ExerciseCard';
import { mockExercises } from '../../data/mockExercises';

const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    exercisesCompleted: 0,
    minutesSpent: 0,
    streakDays: 0,
    improvement: 0,
  });

  // Fetch user stats (mock for now)
  useEffect(() => {
    // This would normally come from a database
    setStats({
      exercisesCompleted: 24,
      minutesSpent: 320,
      streakDays: 5,
      improvement: 18,
    });
  }, []);

  // Get today's date
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:truncate">
            Welcome back, {user?.displayName || 'User'}
          </h2>
          <p className="mt-1 text-sm text-neutral-500">{formattedDate}</p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <Link
            to="/planner"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Calendar className="h-4 w-4 mr-2" />
            View Schedule
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500 truncate">Exercises Completed</dt>
                  <dd>
                    <div className="text-lg font-medium text-neutral-900">{stats.exercisesCompleted}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500 truncate">Minutes Exercised</dt>
                  <dd>
                    <div className="text-lg font-medium text-neutral-900">{stats.minutesSpent}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500 truncate">Day Streak</dt>
                  <dd>
                    <div className="text-lg font-medium text-neutral-900">{stats.streakDays} days</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Award className="h-6 w-6 text-primary-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-neutral-500 truncate">Overall Improvement</dt>
                  <dd>
                    <div className="text-lg font-medium text-neutral-900">+{stats.improvement}%</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress chart */}
      <div className="mt-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-neutral-900">Recovery Progress</h3>
            <p className="mt-1 text-sm text-neutral-500">Your progress over the last 30 days</p>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <ProgressChart />
          </div>
        </div>
      </div>

      {/* Recommended exercises */}
      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-neutral-900">Recommended Today</h3>
          <Link
            to="/exercises"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all exercises
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mockExercises.slice(0, 3).map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      </div>

      {/* Today's Schedule */}
      <div className="mt-8 mb-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-neutral-900">Today's Schedule</h3>
            <p className="mt-1 text-sm text-neutral-500">Your workout plan for today</p>
          </div>
          <div className="border-t border-neutral-200">
            <ul className="divide-y divide-neutral-200">
              <li className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-primary-100 rounded-md p-2">
                      <Clock className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-900">Morning Stretch</p>
                      <p className="text-sm text-neutral-500">15 minutes • Full Body</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      8:00 AM
                    </span>
                    <Link
                      to="/exercise/1"
                      className="ml-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Start
                    </Link>
                  </div>
                </div>
              </li>
              <li className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-primary-100 rounded-md p-2">
                      <Clock className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-900">Shoulder Recovery</p>
                      <p className="text-sm text-neutral-500">20 minutes • Upper Body</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      1:00 PM
                    </span>
                    <Link
                      to="/exercise/2"
                      className="ml-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Start
                    </Link>
                  </div>
                </div>
              </li>
              <li className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-primary-100 rounded-md p-2">
                      <Clock className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-neutral-900">Knee Rehabilitation</p>
                      <p className="text-sm text-neutral-500">25 minutes • Lower Body</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      6:30 PM
                    </span>
                    <Link
                      to="/exercise/3"
                      className="ml-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      Start
                    </Link>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;