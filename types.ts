export enum PricingTier {
  Bronze = 'Bronze', // Special tier for <100kg (Selected customers only)
  Base = 'Base', // < 100kg (Not eligible for wholesale)
  Silver = 'Silver', // 100kg+
  Gold = 'Gold', // 250kg+
  Platinum = 'Platinum', // 500kg+
  Diamond = 'Diamond' // 1000kg+
}

export interface Product {
  id: string;
  code: string;
  englishName: string;
  malayalamName: string;
  preparation: string;
  packaging: string;
  sizeSpec: string; // Weight/pc or Number/kg
  priceBronze?: number; // Special pricing for bronze tier customers
  priceDiamond: number;
  pricePlatinum: number;
  priceGold: number;
  priceSilver: number;
}

export interface CartItem {
  productId: string;
  quantity: number; // in kg
}

export interface OrderSummary {
  totalWeight: number;
  subtotal: number;
  tier: PricingTier;
  nextTier: PricingTier | null;
  kgToNextTier: number;
  items: Array<CartItem & { 
    price: number; 
    lineTotal: number; 
    product: Product 
  }>;
}

export interface CustomerDetails {
  name: string;
  companyName: string;
  email: string;
  address: string;
  phone: string;
}

/* 
  AIRTABLE SCHEMA RECOMMENDATION
  
  Table 1: Species (Product Catalog)
  - Item Code (Single Line Text)
  - English Name (Single Line Text)
  - Malayalam Name (Single Line Text)
  - Preparation (Single Select: Whole, Cleaned, Chunk, Steak, Curry cut)
  - Packaging (Single Select: Thermal Box, Vacuum Pack)
  - Size Spec (Single Line Text)
  - Price Diamond (Currency, GBP)
  - Price Platinum (Currency, GBP)
  - Price Gold (Currency, GBP)
  - Price Silver (Currency, GBP)

  Table 2: Orders
  - Order ID (Formula/Autonumber)
  - Customer Name (Link to Customers Table or Text)
  - Tier Applied (Single Select: Silver, Gold, Platinum, Diamond)
  - Total Weight (Number, Decimal)
  - Total Value (Currency, GBP)
  - Status (Single Select: Received, Processing, Shipped, Delivered)
  - Created Time (Created Time)
  - Order JSON (Long Text - for full backup)

  Table 3: Order Items
  - Order Link (Link to Orders)
  - Species Link (Link to Species)
  - Quantity KG (Number)
  - Applied Unit Price (Currency)
  - Line Total (Currency - Formula: {Quantity KG} * {Applied Unit Price})
*/
