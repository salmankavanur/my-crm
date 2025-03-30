// src/lib/currencyUtils.ts
interface CurrencyFormat {
    code: string;
    symbol: string;
    name: string;
    decimalPlaces: number;
    decimalSeparator: string;
    thousandsSeparator: string;
  }
  
  // Define common currency formats
  const currencyFormats: Record<string, CurrencyFormat> = {
    AED: {
      code: 'AED',
      symbol: 'د.إ',
      name: 'UAE Dirham',
      decimalPlaces: 2,
      decimalSeparator: '.',
      thousandsSeparator: ','
    },
    INR: {
      code: 'INR',
      symbol: '₹',
      name: 'Indian Rupee',
      decimalPlaces: 2,
      decimalSeparator: '.',
      thousandsSeparator: ','
    },
    USD: {
      code: 'USD',
      symbol: '$',
      name: 'US Dollar',
      decimalPlaces: 2,
      decimalSeparator: '.',
      thousandsSeparator: ','
    },
    EUR: {
      code: 'EUR',
      symbol: '€',
      name: 'Euro',
      decimalPlaces: 2,
      decimalSeparator: ',',
      thousandsSeparator: '.'
    },
    GBP: {
      code: 'GBP',
      symbol: '£',
      name: 'British Pound',
      decimalPlaces: 2,
      decimalSeparator: '.',
      thousandsSeparator: ','
    },
    SGD: {
      code: 'SGD',
      symbol: 'S$',
      name: 'Singapore Dollar',
      decimalPlaces: 2,
      decimalSeparator: '.',
      thousandsSeparator: ','
    },
    AUD: {
      code: 'AUD',
      symbol: 'A$',
      name: 'Australian Dollar',
      decimalPlaces: 2,
      decimalSeparator: '.',
      thousandsSeparator: ','
    },
    CAD: {
      code: 'CAD',
      symbol: 'C$',
      name: 'Canadian Dollar',
      decimalPlaces: 2,
      decimalSeparator: '.',
      thousandsSeparator: ','
    },
    JPY: {
      code: 'JPY',
      symbol: '¥',
      name: 'Japanese Yen',
      decimalPlaces: 0,  // JPY typically doesn't use decimal places
      decimalSeparator: '.',
      thousandsSeparator: ','
    },
    CNY: {
      code: 'CNY',
      symbol: '¥',
      name: 'Chinese Yuan',
      decimalPlaces: 2,
      decimalSeparator: '.',
      thousandsSeparator: ','
    },
    SAR: {
      code: 'SAR',
      symbol: '﷼',
      name: 'Saudi Riyal',
      decimalPlaces: 2,
      decimalSeparator: '.',
      thousandsSeparator: ','
    },
    QAR: {
      code: 'QAR',
      symbol: 'ر.ق',
      name: 'Qatari Riyal',
      decimalPlaces: 2,
      decimalSeparator: '.',
      thousandsSeparator: ','
    },
    KWD: {
      code: 'KWD',
      symbol: 'د.ك',
      name: 'Kuwaiti Dinar',
      decimalPlaces: 3,  // KWD uses 3 decimal places
      decimalSeparator: '.',
      thousandsSeparator: ','
    }
  };
  
  /**
   * Format a number as currency
   * @param amount The amount to format
   * @param currencyCode The currency code (e.g., 'USD', 'EUR')
   * @param options Formatting options
   * @returns Formatted currency string
   */
  export function formatCurrency(
    amount: number,
    currencyCode: string = 'USD',
    options: {
      showCode?: boolean;
      showSymbol?: boolean;
      localize?: boolean;
      minimumFractionDigits?: number;
      maximumFractionDigits?: number;
    } = {}
  ): string {
    // Default options
    const { 
      showCode = false, 
      showSymbol = true, 
      localize = true,
      minimumFractionDigits,
      maximumFractionDigits
    } = options;
  
    // Get currency format
    const format = currencyFormats[currencyCode] || currencyFormats.USD;
  
    if (localize) {
      // Use browser's Intl API for localized formatting
      const formatter = new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: format.code,
        currencyDisplay: showSymbol ? 'symbol' : 'code',
        minimumFractionDigits: minimumFractionDigits !== undefined 
          ? minimumFractionDigits 
          : format.decimalPlaces,
        maximumFractionDigits: maximumFractionDigits !== undefined 
          ? maximumFractionDigits 
          : format.decimalPlaces
      });
      return formatter.format(amount);
    } else {
      // Manual formatting
      const fixedAmount = amount.toFixed(format.decimalPlaces);
      
      // Split the number by decimal point
      const [integerPart, decimalPart = ''] = fixedAmount.split('.');
      
      // Format the integer part with thousand separators
      const formattedInteger = integerPart.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        format.thousandsSeparator
      );
      
      // Construct the final formatted amount
      const formattedAmount = decimalPart 
        ? `${formattedInteger}${format.decimalSeparator}${decimalPart}`
        : formattedInteger;
      
      // Add symbol and/or code as requested
      const parts = [];
      if (showSymbol) parts.push(format.symbol);
      parts.push(formattedAmount);
      if (showCode) parts.push(` ${format.code}`);
      
      return parts.join('');
    }
  }
  
  // Exchange rates against USD (for demo purposes)
  // In a real app, you'd fetch these from an API like Open Exchange Rates or Fixer.io
  const exchangeRates: Record<string, number> = {
    USD: 1,
    EUR: 0.93,
    GBP: 0.79,
    INR: 83.11,
    AED: 3.67,
    SGD: 1.35,
    AUD: 1.51,
    CAD: 1.36,
    JPY: 150.45,
    CNY: 7.19,
    SAR: 3.75,
    QAR: 3.64,
    KWD: 0.31
  };
  
  /**
   * Convert an amount from one currency to another
   * @param amount The amount to convert
   * @param fromCurrency The source currency code
   * @param toCurrency The target currency code
   * @returns The converted amount
   */
  export function convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): number {
    // If currencies are the same, no conversion needed
    if (fromCurrency === toCurrency) return amount;
    
    // Get exchange rates (default to 1 if not found)
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;
    
    // Convert to USD first (as base currency), then to target currency
    const amountInUSD = amount / fromRate;
    const convertedAmount = amountInUSD * toRate;
    
    // Round based on the decimal places of the target currency
    const format = currencyFormats[toCurrency] || currencyFormats.USD;
    const factor = Math.pow(10, format.decimalPlaces);
    return Math.round(convertedAmount * factor) / factor;
  }
  
  /**
   * Get all available currencies
   * @returns Array of currency objects
   */
  export function getAvailableCurrencies(): Array<{
    code: string;
    symbol: string;
    name: string;
  }> {
    return Object.values(currencyFormats).map(({ code, symbol, name }) => ({
      code,
      symbol,
      name
    }));
  }
  
  /**
   * Get currency format details by currency code
   * @param currencyCode The currency code
   * @returns The currency format details or a default format
   */
  export function getCurrencyFormat(currencyCode: string): CurrencyFormat {
    return currencyFormats[currencyCode] || currencyFormats.USD;
  }
  
  /**
   * Parse a currency string to a number
   * @param currencyString The currency string to parse
   * @param currencyCode The currency code to determine the format
   * @returns The parsed number value
   */
  export function parseCurrencyString(currencyString: string, currencyCode: string = 'USD'): number {
    const format = currencyFormats[currencyCode] || currencyFormats.USD;
    
    // Remove the currency symbol, code and any non-numeric characters except the decimal separator
    const numericString = currencyString
      .replace(format.symbol, '')
      .replace(format.code, '')
      .replace(new RegExp(`[^0-9${format.decimalSeparator}]`, 'g'), '')
      .replace(format.decimalSeparator, '.');
    
    return parseFloat(numericString) || 0;
  }
  
  /**
   * Format a number with the specified number of decimal places
   * @param num The number to format
   * @param decimalPlaces The number of decimal places
   * @returns The formatted number string
   */
  export function formatNumber(num: number, decimalPlaces: number = 2): string {
    return num.toFixed(decimalPlaces);
  }
  
  /**
   * Format a percentage
   * @param percentage The percentage value (e.g., 15.5 for 15.5%)
   * @param decimalPlaces The number of decimal places
   * @returns The formatted percentage string
   */
  export function formatPercentage(percentage: number, decimalPlaces: number = 2): string {
    return `${percentage.toFixed(decimalPlaces)}%`;
  }
  
  /**
   * Calculate total from subtotal and tax rate
   * @param subtotal The subtotal amount
   * @param taxRate The tax rate percentage
   * @returns The total amount
   */
  export function calculateTotal(subtotal: number, taxRate: number): number {
    const tax = (subtotal * taxRate) / 100;
    return subtotal + tax;
  }
  
  /**
   * Format currency for display in tables with consistent alignment
   * @param amount The amount to format
   * @param currencyCode The currency code
   * @returns The formatted currency string with consistent spacing
   */
  export function formatCurrencyForTable(amount: number, currencyCode: string): string {
    const formatted = formatCurrency(amount, currencyCode, { showCode: false });
    return formatted;
  }
  
  /**
   * Get exchange rate between two currencies
   * @param fromCurrency Source currency code
   * @param toCurrency Target currency code
   * @returns The exchange rate
   */
  export function getExchangeRate(fromCurrency: string, toCurrency: string): number {
    const fromRate = exchangeRates[fromCurrency] || 1;
    const toRate = exchangeRates[toCurrency] || 1;
    
    return toRate / fromRate;
  }
  
  /**
   * Format a monetary amount range
   * @param minAmount The minimum amount
   * @param maxAmount The maximum amount
   * @param currencyCode The currency code
   * @returns Formatted range string
   */
  export function formatAmountRange(minAmount: number, maxAmount: number, currencyCode: string): string {
    const formattedMin = formatCurrency(minAmount, currencyCode);
    const formattedMax = formatCurrency(maxAmount, currencyCode);
    
    return `${formattedMin} - ${formattedMax}`;
  }
  
  /**
   * Update exchange rates (in a real app, this would fetch from an API)
   * @param rates New exchange rates to set
   */
  export function updateExchangeRates(rates: Record<string, number>): void {
    Object.assign(exchangeRates, rates);
  }
  
  /**
   * Add a new currency format
   * @param code Currency code
   * @param format Currency format details
   */
  export function addCurrencyFormat(code: string, format: CurrencyFormat): void {
    currencyFormats[code] = format;
  }