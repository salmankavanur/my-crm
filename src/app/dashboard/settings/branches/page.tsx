// src/app/dashboard/settings/branches/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, 
  FiGlobe, FiMapPin, FiDollarSign, FiMail 
} from 'react-icons/fi';

interface Branch {
  _id: string;
  name: string;
  code: string;
  address: {
    city: string;
    country: string;
  };
  currency: {
    code: string;
    symbol: string;
    name: string;
  };
  active: boolean;
}

export default function BranchesPage() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const response = await fetch('/api/branches');
        
        if (!response.ok) {
          throw new Error('Failed to fetch branches');
        }
        
        const data = await response.json();
        setBranches(data.branches);
      } catch (err) {
        setError('Failed to load branches. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBranches();
  }, []);

  // Toggle branch active status
  const toggleBranchStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/branches/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ active: !currentStatus }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update branch status');
      }
      
      // Update local state
      setBranches(prev => 
        prev.map(branch => 
          branch._id === id 
            ? { ...branch, active: !currentStatus } 
            : branch
        )
      );
    } catch (err) {
      setError('Failed to update branch status.');
      console.error(err);
    }
  };

  // Delete branch
  const deleteBranch = async (id: string) => {
    try {
      const response = await fetch(`/api/branches/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete branch');
      }
      
      // Remove from local state
      setBranches(prev => prev.filter(branch => branch._id !== id));
      setDeleteConfirm(null);
    } catch (err) {
      setError('Failed to delete branch.');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Branch Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your company's branches and their currencies
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/dashboard/settings/branches/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FiPlus className="-ml-1 mr-2 h-5 w-5" />
              Add Branch
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <FiX className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-2 text-sm text-red-600 hover:text-red-500"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {branches.length > 0 ? (
              branches.map((branch) => (
                <li key={branch._id}>
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-md bg-indigo-100 text-indigo-700">
                          <FiGlobe className="h-6 w-6" />
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <h3 className="text-lg font-medium text-gray-900">{branch.name}</h3>
                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                              {branch.code}
                            </span>
                            <span className={`ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              branch.active
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {branch.active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <FiMapPin className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>{branch.address.city}, {branch.address.country}</p>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <FiDollarSign className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                            <p>
                              {branch.currency.name} ({branch.currency.code}) {branch.currency.symbol}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => toggleBranchStatus(branch._id, branch.active)}
                          className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md ${
                            branch.active
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                          {branch.active ? (
                            <>
                              <FiX className="mr-1.5 -ml-0.5 h-4 w-4" />
                              Deactivate
                            </>
                          ) : (
                            <>
                              <FiCheck className="mr-1.5 -ml-0.5 h-4 w-4" />
                              Activate
                            </>
                          )}
                        </button>
                        <Link
                          href={`/dashboard/settings/branches/${branch._id}/edit`}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          <FiEdit2 className="mr-1.5 -ml-0.5 h-4 w-4" />
                          Edit
                        </Link>
                        <div className="relative">
                          {deleteConfirm === branch._id ? (
                            <div className="absolute right-0 top-0 -mt-1 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-10">
                              <p className="px-4 py-2 text-sm text-gray-700">Confirm deletion?</p>
                              <div className="flex px-4 py-2">
                                <button
                                  onClick={() => deleteBranch(branch._id)}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mr-2"
                                >
                                  Delete
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm(null)}
                                  className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeleteConfirm(branch._id)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <FiTrash2 className="mr-1.5 -ml-0.5 h-4 w-4" />
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-4 py-5 sm:px-6 text-center">
                <p className="text-gray-500">No branches found.</p>
                <p className="text-sm text-gray-400 mt-1">
                  Click "Add Branch" to create your first branch.
                </p>
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}