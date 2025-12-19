'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface ProductPrice {
  id: string;
  code: string;
  englishName: string;
  malayalamName: string;
  packaging: string;
  unit: string;
  sizeSpec?: string;
  category: string;
  preparation: string;
  imageUrl: string;
  priceBronze?: number;
  priceDiamond: number;
  pricePlatinum: number;
  priceGold: number;
  priceSilver: number;
}

export function usePackagePrices(packageId: string | undefined) {
  const [products, setProducts] = useState<ProductPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPackagePrices = async () => {
      if (!packageId) {
        // If no package ID, fetch default products
        try {
          const productsSnapshot = await getDocs(collection(db, 'products'));
          const productsData = productsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              code: data.code || '',
              englishName: data.englishName || '',
              malayalamName: data.malayalamName || '',
              packaging: data.packaging || '',
              unit: data.unit || '',
              category: data.category || '',
              preparation: data.preparation || '',
              imageUrl: data.imageUrl || '',
              priceBronze: data.priceBronze,
              priceDiamond: data.priceDiamond || 0,
              pricePlatinum: data.pricePlatinum || 0,
              priceGold: data.priceGold || 0,
              priceSilver: data.priceSilver || 0
            };
          }) as ProductPrice[];
          setProducts(productsData);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching default products:', err);
          setError('Failed to load products');
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        
        // Fetch prices for this package
        const pricesSnapshot = await getDocs(collection(db, 'packagePrices'));
        const packagePrices = pricesSnapshot.docs
          .map(doc => doc.data())
          .filter((price: any) => price.packageId === packageId);

        if (packagePrices.length === 0) {
          console.warn(`No prices found for package ${packageId}, falling back to default products`);
          // Fallback to default products
          const productsSnapshot = await getDocs(collection(db, 'products'));
          const productsData = productsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              code: data.code || '',
              englishName: data.englishName || '',
              malayalamName: data.malayalamName || '',
              packaging: data.packaging || '',
              unit: data.unit || '',
              category: data.category || '',
              preparation: data.preparation || '',
              imageUrl: data.imageUrl || '',
              priceBronze: data.priceBronze,
              priceDiamond: data.priceDiamond || 0,
              pricePlatinum: data.pricePlatinum || 0,
              priceGold: data.priceGold || 0,
              priceSilver: data.priceSilver || 0
            };
          }) as ProductPrice[];
          setProducts(productsData);
          setLoading(false);
          return;
        }

        // Now fetch full product details and merge with package prices
        const productsSnapshot = await getDocs(collection(db, 'products'));
        const productsMap = new Map();
        productsSnapshot.docs.forEach(doc => {
          productsMap.set(doc.id, { id: doc.id, ...doc.data() });
        });

        // Merge product details with package prices
        const mergedProducts = packagePrices.map((price: any) => {
          const product = productsMap.get(price.productId);
          if (product) {
            const fallbackBronze = (product.priceBronze ?? product.priceSilver ?? price.priceSilver ?? 0);
            const fallbackDiamond = product.priceDiamond ?? price.priceDiamond ?? 0;
            const fallbackPlatinum = product.pricePlatinum ?? price.pricePlatinum ?? 0;
            const fallbackGold = product.priceGold ?? price.priceGold ?? 0;
            const fallbackSilver = product.priceSilver ?? price.priceSilver ?? 0;

            return {
              id: product.id,
              code: product.code || price.productCode,
              englishName: product.englishName || price.productName,
              malayalamName: product.malayalamName || '',
              packaging: product.packaging || '',
              unit: product.unit || '',
              category: product.category || '',
              preparation: product.preparation || '',
              imageUrl: product.imageUrl || '',
              priceBronze: price.priceBronze ?? fallbackBronze,
              priceDiamond: price.priceDiamond ?? fallbackDiamond,
              pricePlatinum: price.pricePlatinum ?? fallbackPlatinum,
              priceGold: price.priceGold ?? fallbackGold,
              priceSilver: price.priceSilver ?? fallbackSilver
            };
          }
          return null;
        }).filter(Boolean) as ProductPrice[];

        setProducts(mergedProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching package prices:', err);
        setError('Failed to load pricing');
      } finally {
        setLoading(false);
      }
    };

    fetchPackagePrices();
  }, [packageId]);

  return { products, loading, error };
}
