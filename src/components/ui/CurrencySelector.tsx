// src/components/ui/CurrencySelector.tsx
import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiChevronDown } from 'react-icons/fi';

interface Currency {
  id: string;
  code: string;
  symbol: string;
  name: string;
  flag?: string; // Optional flag emoji
}

interface CurrencySelectorProps {
  value: string;
  onChange: (currencyId: string) => void;
  branchId?: string;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export default function CurrencySelector({
  value,
  onChange,
  branchId,
  label = 'Currency',
  disabled = false,
  className = '',
}: CurrencySelectorProps) {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);

  useEffect(() => {
    const fetchCurrencies = async () => {
      try {
        // Fetch currencies from API
        const url = branchId 
          ? `/api/currencies?branchId=${branchId}`
          : '/api/currencies';
          
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Failed to fetch currencies');
        }
        
        const data = await response.json();
        setCurrencies(data.currencies);
        
        // Set selected currency based on value
        const selected = data.currencies.find((c: Currency) => c.id === value);
        if (selected) {
          setSelectedCurrency(selected);
        } else if (data.currencies.length > 0) {
          // Default to first currency if value not found
          setSelectedCurrency(data.currencies[0]);
          onChange(data.currencies[0].id);
        }
      } catch (err) {
        setError('Error loading currencies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrencies();
  }, [branchId, value, onChange]);

  // If value changes externally, update selected currency
  useEffect(() => {
    const selected = currencies.find(c => c.id === value);
    if (selected) {
      setSelectedCurrency(selected);
    }
  }, [value, currencies]);

  const handleSelect = (currency: Currency) => {
    setSelectedCurrency(currency);
    onChange(currency.id);
    setIsOpen(false);
  };

  // Fallback currencies in case API fails
  const fallbackCurrencies: Currency[] = [
    { id: 'inr', code: 'INR', symbol: '₹', name: 'Indian Rupee', flag: '🇮🇳' },
    { id: 'aed', code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', flag: '🇦🇪' },
    { id: 'usd', code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
    { id: 'eur', code: 'EUR', symbol: '€', name: 'Euro', flag: '🇪🇺' },
  ];

  const displayCurrencies = currencies.length > 0 ? currencies : fallbackCurrencies;

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm cursor-not-allowed bg-gray-50">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiDollarSign className="h-5 w-5 text-gray-400" />
          </div>
          <div className="block w-full pl-10 pr-10 py-2 sm:text-sm border-gray-300 rounded-md">
            Loading currencies...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`relative ${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <div className="mt-1 relative rounded-md shadow-sm cursor-not-allowed bg-red-50">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiDollarSign className="h-5 w-5 text-red-400" />
          </div>
          <div className="block w-full pl-10 pr-10 py-2 sm:text-sm border-red-300 rounded-md text-red-900">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="mt-1 relative">
        <button
          type="button"
          className={`bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
        >
          <span className="flex items-center">
            {selectedCurrency?.flag && (
              <span className="flex-shrink-0 text-lg mr-2">{selectedCurrency.flag}</span>
            )}
            <span className="flex items-center">
              <span className="font-medium">{selectedCurrency?.code || 'Select'}</span>
              <span className="ml-2 text-gray-500">({selectedCurrency?.symbol || '?'})</span>
            </span>
          </span>
          <span className="ml-3 absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <FiChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </button>

        {isOpen && !disabled && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-56 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {displayCurrencies.map((currency) => (
              <div
                key={currency.id}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 ${
                  selectedCurrency?.id === currency.id ? 'bg-indigo-100' : ''
                }`}
                onClick={() => handleSelect(currency)}
              >
                <div className="flex items-center">
                  {currency.flag && (
                    <span className="flex-shrink-0 text-lg mr-2">{currency.flag}</span>
                  )}
                  <span className="font-medium">{currency.code}</span>
                  <span className="ml-2 text-gray-500">({currency.symbol})</span>
                </div>
                <span className="ml-3 text-xs text-gray-500">{currency.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}