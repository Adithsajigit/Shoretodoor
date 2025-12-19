'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { products } from '@/data';
import { Upload, CheckCircle, XCircle } from 'lucide-react';

export default function MigrateProductsPage() {
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<{ success: number; failed: number; messages: string[] }>({
    success: 0,
    failed: 0,
    messages: []
  });

  const migrateProducts = async () => {
    if (!confirm(`This will migrate ${products.length} products to Firestore. Continue?`)) {
      return;
    }

    setMigrating(true);
    setProgress(0);
    setResults({ success: 0, failed: 0, messages: [] });

    let successCount = 0;
    let failedCount = 0;
    const messages: string[] = [];

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      try {
        await addDoc(collection(db, 'products'), {
          code: product.code,
          englishName: product.englishName,
          malayalamName: product.malayalamName,
          preparation: product.preparation,
          packaging: product.packaging,
          sizeSpec: product.sizeSpec,
          priceDiamond: product.priceDiamond,
          pricePlatinum: product.pricePlatinum,
          priceGold: product.priceGold,
          priceSilver: product.priceSilver,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        successCount++;
        messages.push(`✓ ${product.englishName} (${product.code})`);
      } catch (error: any) {
        failedCount++;
        messages.push(`✗ ${product.englishName}: ${error.message}`);
      }

      setProgress(((i + 1) / products.length) * 100);
      setResults({ success: successCount, failed: failedCount, messages: [...messages] });
    }

    setMigrating(false);
    alert(`Migration complete! Success: ${successCount}, Failed: ${failedCount}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mx-auto mb-4">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Migrate Products to Firestore</h1>
            <p className="text-slate-600">
              This will upload all {products.length} products from data.ts to your Firestore database
            </p>
          </div>

          {!migrating && results.success === 0 && (
            <div className="text-center">
              <button
                onClick={migrateProducts}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-3 shadow-md hover:shadow-lg mx-auto text-lg font-semibold"
              >
                <Upload className="w-6 h-6" />
                Start Migration
              </button>
            </div>
          )}

          {migrating && (
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-slate-700">Progress</span>
                <span className="text-sm font-medium text-slate-700">{progress.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {results.success > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-700">{results.success}</p>
                  <p className="text-sm text-green-600">Successful</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-700">{results.failed}</p>
                  <p className="text-sm text-red-600">Failed</p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                <h3 className="font-semibold text-slate-900 mb-2">Migration Log:</h3>
                <div className="space-y-1 text-sm font-mono">
                  {results.messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={msg.startsWith('✓') ? 'text-green-600' : 'text-red-600'}
                    >
                      {msg}
                    </div>
                  ))}
                </div>
              </div>

              {!migrating && (
                <div className="text-center">
                  <a
                    href="/admin/products"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-md hover:shadow-lg"
                  >
                    Go to Products Management →
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
