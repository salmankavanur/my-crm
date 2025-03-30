// src/components/ui/BranchSelector.tsx
import React, { useState, useEffect } from 'react';
import { FiGlobe, FiChevronDown } from 'react-icons/fi';
import { Branch } from '@/types';

interface BranchSelectorProps {
  value: string;
  onChange: (branchId: string) => void;
  onBranchChange?: (branch: Branch) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  required?: boolean;
  showCurrency?: boolean;
  error?: string;
}

export default function BranchSelector({
  value,
  onChange,
  onBranchChange,
  label = 'Branch',
  disabled = false,
  className = '',
  required = false,
  showCurrency = true,
  error
}: BranchSelectorProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        // Fetch active branches only
        const response = await fetch('/api/branches?active=true');
        
        if (!response.ok) {
          throw new Error('Failed to fetch branches');
        }
        
        const data = await response.json();
        setBranches(data.branches);
        
        // Set selected branch based on value
        if (value) {
          const selected = data.branches.find((b: Branch) => b._id === value);
          if (selected) {
            setSelectedBranch(selected);
            if (onBranchChange) onBranchChange(selected);
          }
        } else if (data.branches.length > 0) {
          // Default to first branch if value not provided
          setSelectedBranch(data.branches[0]);
          onChange(data.branches[0]._id);
          if (onBranchChange) onBranchChange(data.branches[0]);
        }
      } catch (err) {
        setLocalError('Error loading branches');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBranches();
  }, [value, onChange, onBranchChange]);

  // If value changes externally, update selected branch
  useEffect(() => {
    if (value && branches.length > 0) {
      const selected = branches.find(b => b._id === value);
      if (selected) {
        setSelectedBranch(selected);
        if (onBranchChange) onBranchChange(selected);
      }
    }
  }, [value, branches, onBranchChange]);

  const handleSelect = (branch: Branch) => {
    setSelectedBranch(branch);
    onChange(branch._id);
    if (onBranchChange) onBranchChange(branch);
    setIsOpen(false);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isOpen && !target.closest('.branch-selector')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <label className={`block text-sm font-medium text-gray-700 mb-1 ${required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}`}>
          {label}
        </label>
        <div className="mt-1 relative rounded-md shadow-sm cursor-not-allowed bg-gray-50">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiGlobe className="h-5 w-5 text-gray-400" />
          </div>
          <div className="block w-full pl-10 pr-10 py-2 sm:text-sm border-gray-300 rounded-md">
            Loading branches...
          </div>
        </div>
      </div>
    );
  }

  const displayError = error || localError;

  return (
    <div className={`relative ${className} branch-selector`}>
      <label className={`block text-sm font-medium text-gray-700 mb-1 ${required ? 'after:content-["*"] after:ml-0.5 after:text-red-500' : ''}`}>
        {label}
      </label>
      <div className="mt-1 relative">
        <button
          type="button"
          className={`bg-white relative w-full border rounded-md shadow-sm pl-3 pr-10 py-2 text-left focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'
          } ${displayError ? 'border-red-300' : 'border-gray-300'}`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          {selectedBranch ? (
            <div className="flex items-center">
              <FiGlobe className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
              <div>
                <div className="font-medium">{selectedBranch.name}</div>
                <div className="text-xs text-gray-500 flex items-center">
                  <span>{selectedBranch.address.city}, {selectedBranch.address.country}</span>
                  {showCurrency && (
                    <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full">
                      {selectedBranch.currency.code} ({selectedBranch.currency.symbol})
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-gray-500">Select a branch</span>
          )}
          <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <FiChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </button>

        {displayError && (
          <p className="mt-2 text-sm text-red-600">{displayError}</p>
        )}

        {isOpen && !disabled && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {branches.length > 0 ? (
              branches.map((branch) => (
                <div
                  key={branch._id}
                  className={`cursor-pointer select-none relative p-3 hover:bg-indigo-50 ${
                    selectedBranch?._id === branch._id ? 'bg-indigo-100' : ''
                  }`}
                  onClick={() => handleSelect(branch)}
                >
                  <div className="flex items-center">
                    <FiGlobe className="flex-shrink-0 mr-2 h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{branch.name}</div>
                      <div className="text-xs text-gray-500 flex">
                        <span>{branch.address.city}, {branch.address.country}</span>
                        {showCurrency && (
                          <span className="ml-2 px-2 py-0.5 bg-gray-100 rounded-full">
                            {branch.currency.code} ({branch.currency.symbol})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 text-center text-sm text-gray-500">
                No active branches found
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}