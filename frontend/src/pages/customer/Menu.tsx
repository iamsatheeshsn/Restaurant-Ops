import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { Search, ShoppingBag, Plus, Sparkles } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import { useSearchParams } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import { PaginationControls } from '../../components/PaginationControls';

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: string;
  imageUrl: string | null;
  categoryId: string;
  nutritionInfo?: {
    calories: number;
    allergens: string | null;
    protein: string;
    carbs: string;
    fat: string;
  } | null;
}

export const Menu: React.FC = () => {
  const { addToCart } = useCart();
  const { showNotification } = useNotification();
  const { formatPrice } = useSettings();
  const [searchParams] = useSearchParams();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  useEffect(() => {
    const tableId = searchParams.get('tableId');
    if (tableId) {
      sessionStorage.setItem('tastyc_table_id', tableId);
    }
  }, [searchParams]);

  useEffect(() => {
    api.menu
      .getCategories({ limit: 100 })
      .then((cats) => setCategories(cats.data || []))
      .catch((error) => console.error('Failed to load categories:', error));
  }, []);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const params: Record<string, string | number> = { page, limit };
        if (selectedCategory) params.categoryId = selectedCategory;
        const items = await api.menu.getItems(params);
        setMenuItems(items.data || []);
        setPagination(items.pagination);
      } catch (error) {
        console.error('Failed to load menu items:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [selectedCategory, page, limit]);

  const handleCategorySelect = (catId: string | null) => {
    setSelectedCategory(catId);
    setPage(1);
  };

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="bg-[#0a1316] min-h-[80vh] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Page Title & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-tastyc-copper/10 pb-8">
          <div className="space-y-2 text-left">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-tastyc-copper" />
              <span className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold">Freshly Brewed</span>
            </div>
            <h1 className="font-title text-4xl sm:text-5xl uppercase tracking-wider text-white">
              Our Premium Menu
            </h1>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-[#a9b8c3]" />
            </span>
            <input
              type="text"
              placeholder="Search dishes, drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#121e22] border border-tastyc-copper/20 focus:border-tastyc-copper pl-10 pr-4 py-2.5 rounded-none text-white text-sm outline-none placeholder-[#a9b8c3]/40 transition-colors duration-300"
            />
          </div>
        </div>

        {/* Categories Tab Navigation */}
        <div className="flex overflow-x-auto pb-4 space-x-4 border-b border-tastyc-copper/5 scrollbar-thin">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`px-6 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-300 border-b-2 ${
              selectedCategory === null
                ? 'border-tastyc-copper text-tastyc-copper'
                : 'border-transparent text-[#a9b8c3] hover:text-white'
            }`}
          >
            All Items
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className={`px-6 py-2.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all duration-300 border-b-2 ${
                selectedCategory === cat.id
                  ? 'border-tastyc-copper text-tastyc-copper'
                  : 'border-transparent text-[#a9b8c3] hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Menu Grid Items */}
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tastyc-copper mx-auto"></div>
            <p className="mt-4 text-[#a9b8c3] text-sm uppercase tracking-widest">Brewing selections...</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-tastyc-copper/10">
            <ShoppingBag className="h-10 w-10 text-tastyc-copper/40 mx-auto mb-4" />
            <p className="text-[#a9b8c3] text-sm uppercase tracking-widest">No menu items found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-[#121e22] border border-tastyc-copper/10 hover:border-tastyc-copper/30 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Item Image */}
                <div className="relative aspect-video w-full overflow-hidden bg-tastyc-dark border-b border-tastyc-copper/5">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-tastyc-copper/25 text-xs uppercase tracking-wider">
                      No Image Available
                    </div>
                  )}
                  <span className="absolute top-4 right-4 bg-tastyc-dark/95 border border-tastyc-copper/30 px-3 py-1 font-title text-sm tracking-widest text-tastyc-copper font-bold">
                    {formatPrice(item.price)}
                  </span>
                </div>

                {/* Details */}
                <div className="p-6 space-y-4 flex-grow flex flex-col justify-between text-left">
                  <div className="space-y-2">
                    <h3 className="font-title text-2xl uppercase tracking-wider text-white">
                      {item.name}
                    </h3>
                    <p className="text-xs text-[#a9b8c3] leading-relaxed line-clamp-3">
                      {item.description || 'No description available for this handcrafted menu item.'}
                    </p>
                    {item.nutritionInfo && (
                      <div className="pt-2 flex flex-wrap gap-1.5 text-[8px] uppercase tracking-wider font-semibold">
                        <span className="bg-white/5 border border-white/10 px-2 py-0.5 text-white">
                          {item.nutritionInfo.calories} Cal
                        </span>
                        {item.nutritionInfo.allergens && (
                          <span className="bg-red-500/10 border border-red-500/20 px-2 py-0.5 text-red-400">
                            Allergens: {item.nutritionInfo.allergens}
                          </span>
                        )}
                        <span className="text-[#a9b8c3] pt-0.5">
                          P: {parseFloat(item.nutritionInfo.protein)}g | C: {parseFloat(item.nutritionInfo.carbs)}g | F: {parseFloat(item.nutritionInfo.fat)}g
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Add to Cart button */}
                  <button
                    onClick={() => {
                      addToCart({
                        id: item.id,
                        name: item.name,
                        price: parseFloat(item.price),
                        image: item.imageUrl,
                      });
                      showNotification({
                        title: 'Cart Updated',
                        message: `${item.name} added to cart!`,
                        type: 'success'
                      });
                    }}
                    className="w-full mt-2 flex items-center justify-center space-x-2 border border-tastyc-copper/30 hover:border-tastyc-copper px-4 py-2.5 text-xs uppercase tracking-widest text-tastyc-copper hover:text-white hover:bg-tastyc-copper transition-all duration-300 font-semibold"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add to Order</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <PaginationControls
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(n) => {
            setLimit(n);
            setPage(1);
          }}
        />
      </div>
    </div>
  );
};
