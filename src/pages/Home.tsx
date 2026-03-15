import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';
import { ShoppingCart, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category: string;
  stock: number;
}

const CATEGORIES = ['Fresh Produce', 'Dairy', 'Bakery', 'Beverages', 'Snacks', 'Grocery'];

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const q = query(collection(db, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData: Product[] = [];
      snapshot.forEach((doc) => {
        productsData.push({ id: doc.id, ...doc.data() } as Product);
      });
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    toast.success(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  // Helper function to group products
  const getProductsByCategory = (categoryName: string) => {
    return products.filter(p => {
      const pCat = p.category.toLowerCase();
      const cName = categoryName.toLowerCase();
      
      if (cName === 'grocery') {
        // 'Grocery' acts as a catch-all for anything not in the main 5 categories
        const isMainCategory = CATEGORIES.slice(0, 5).some(c => pCat.includes(c.toLowerCase()));
        return pCat.includes('grocery') || !isMainCategory;
      }
      
      return pCat.includes(cName);
    });
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-10">
      {/* Hero Banner */}
      <div className="relative w-full h-[300px] sm:h-[400px] lg:h-[500px] bg-gradient-to-b from-slate-800 to-gray-100 mb-[-150px] sm:mb-[-200px] lg:mb-[-250px] z-0">
        <div className="absolute inset-0 flex items-center justify-center text-white/20 text-4xl font-bold">
          {/* Placeholder for a real banner image */}
          <img 
            src="https://images.unsplash.com/photo-1604719312566-8912e9227c6a?q=80&w=2000&auto=format&fit=crop" 
            alt="Hero Banner" 
            className="w-full h-full object-cover opacity-80"
            style={{ maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))', WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1), rgba(0,0,0,0))' }}
          />
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {products.length === 0 ? (
          <div className="bg-white p-8 text-center rounded shadow mt-32">
            <p className="text-gray-500 text-lg">No products available at the moment.</p>
          </div>
        ) : (
          <div className="space-y-12 mt-32">
            {CATEGORIES.map(category => {
              const categoryProducts = getProductsByCategory(category);
              
              if (categoryProducts.length === 0) return null;

              return (
                <div key={category} className="bg-transparent">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 bg-white inline-block px-4 py-2 rounded shadow-sm border-l-4 border-amber-500">
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {categoryProducts.map((product) => (
                      <div key={product.id} className="bg-white p-4 flex flex-col relative z-20 hover:shadow-lg transition-shadow rounded-lg border border-gray-100">
                        <div className="h-48 w-full mb-4 relative cursor-pointer group">
                          {product.imageUrl ? (
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 rounded">
                              No Image
                            </div>
                          )}
                          {product.stock <= 0 && (
                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded">
                              <span className="text-red-600 font-bold text-lg">Currently unavailable</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-grow flex flex-col">
                          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-amber-600 cursor-pointer mb-1">
                            {product.name}
                          </h3>
                          
                          {/* Fake Rating */}
                          <div className="flex items-center mb-1">
                            <div className="flex text-amber-400">
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current" />
                              <Star className="w-4 h-4 fill-current text-gray-300" />
                            </div>
                            <span className="text-xs text-blue-600 ml-1 hover:underline cursor-pointer">
                              {Math.floor(Math.random() * 500) + 10}
                            </span>
                          </div>

                          <div className="mt-1 mb-2">
                            <span className="text-xs align-top">₹</span>
                            <span className="text-2xl font-medium">{Math.floor(product.price)}</span>
                            <span className="text-xs align-top">{(product.price % 1).toFixed(2).substring(1)}</span>
                          </div>
                          
                          <div className="text-xs text-gray-500 mb-4">
                            Ships to your location
                          </div>

                          <div className="mt-auto">
                            <button
                              onClick={() => handleAddToCart(product)}
                              disabled={product.stock <= 0}
                              className="w-full bg-amber-400 hover:bg-amber-500 text-sm font-medium py-2 rounded-full shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              Add to Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
