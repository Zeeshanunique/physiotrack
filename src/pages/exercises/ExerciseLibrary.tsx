import React, { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import ExerciseCard from '../../components/exercises/ExerciseCard';
import { mockExercises } from '../../data/mockExercises';

const ExerciseLibrary: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('');
  const [filterBodyPart, setFilterBodyPart] = useState<string>('');

  const filteredExercises = mockExercises.filter((exercise) => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          exercise.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty = filterDifficulty === '' || exercise.difficulty === filterDifficulty;
    const matchesBodyPart = filterBodyPart === '' || exercise.bodyPart === filterBodyPart;
    
    return matchesSearch && matchesDifficulty && matchesBodyPart;
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="md:flex md:items-center md:justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-neutral-900 sm:text-3xl sm:truncate">
            Exercise Library
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            Browse all available exercises for your rehabilitation
          </p>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">
                Search exercises
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-neutral-400" />
                </div>
                <input
                  type="text"
                  name="search"
                  id="search"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-neutral-300 rounded-md"
                  placeholder="Search exercises..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div>
                <label htmlFor="difficulty" className="block text-sm font-medium text-neutral-700 mb-1">
                  Difficulty
                </label>
                <select
                  id="difficulty"
                  name="difficulty"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filterDifficulty}
                  onChange={(e) => setFilterDifficulty(e.target.value)}
                >
                  <option value="">All Difficulties</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div>
                <label htmlFor="bodyPart" className="block text-sm font-medium text-neutral-700 mb-1">
                  Body Part
                </label>
                <select
                  id="bodyPart"
                  name="bodyPart"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={filterBodyPart}
                  onChange={(e) => setFilterBodyPart(e.target.value)}
                >
                  <option value="">All Body Parts</option>
                  <option value="upper">Upper Body</option>
                  <option value="lower">Lower Body</option>
                  <option value="core">Core</option>
                  <option value="full">Full Body</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise grid */}
      {filteredExercises.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          {filteredExercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white shadow rounded-lg">
          <Filter className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-lg font-medium text-neutral-900">No exercises found</h3>
          <p className="mt-1 text-sm text-neutral-500">
            Try adjusting your search or filter criteria to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
};

export default ExerciseLibrary;