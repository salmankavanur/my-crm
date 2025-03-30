// src/app/api/currencies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Branch from '@/models/Branch';

// Helper type for currency
interface Currency {
  id: string; // This will be the branch ID for branch-specific currencies
  code: string;
  symbol: string;
  name: string;
  flag?: string;
}

// Define flags for common currencies
const currencyFlags: Record<string, string> = {
  AED: '🇦🇪',
  INR: '🇮🇳',
  USD: '🇺🇸',
  EUR: '🇪🇺',
  GBP: '🇬🇧',
  AUD: '🇦🇺',
  CAD: '🇨🇦',
  SGD: '🇸🇬',
  JPY: '🇯🇵',
  CNY: '🇨🇳',
};

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    
    const searchParams = request.nextUrl.searchParams;
    const branchId = searchParams.get('branchId');
    
    let currencies: Currency[] = [];
    
    if (branchId) {
      // If branchId is provided, only return that branch's currency
      const branch = await Branch.findById(branchId);
      
      if (!branch) {
        return NextResponse.json(
          { error: 'Branch not found' },
          { status: 404 }
        );
      }
      
      currencies = [{
        id: branch._id.toString(),
        code: branch.currency.code,
        symbol: branch.currency.symbol,
        name: branch.currency.name,
        flag: currencyFlags[branch.currency.code] || undefined,
      }];
    } else {
      // Fetch currencies from all active branches
      const branches = await Branch.find({ active: true });
      
      currencies = branches.map(branch => ({
        id: branch._id.toString(),
        code: branch.currency.code,
        symbol: branch.currency.symbol,
        name: branch.currency.name,
        flag: currencyFlags[branch.currency.code] || undefined,
      }));
    }
    
    return NextResponse.json({
      currencies
    });
  } catch (error) {
    console.error('Currency fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch currencies' },
      { status: 500 }
    );
  }
}