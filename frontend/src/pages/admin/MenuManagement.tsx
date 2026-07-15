import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Plus, Trash2, Edit2, Sparkles, X, Save, Image as ImageIcon, Check, Calendar, Coffee, Layers } from 'lucide-react';
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
  isAvailable: boolean;
  categoryId: string;
  category: {
    name: string;
  };
  happyHourPrice: string | null;
  happyHourStart: string | null;
  happyHourEnd: string | null;
  isCombo: boolean;
  comboItems: string | null;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
}

export const MenuManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { showNotification, showConfirm } = useNotification();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });

  // Form states
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [uploading, setUploading] = useState(false);

  // Advanced Menu Attributes
  const [modifiersInput, setModifiersInput] = useState('');
  const [isHappyHour, setIsHappyHour] = useState(false);
  const [happyHourPrice, setHappyHourPrice] = useState('');
  const [happyHourStart, setHappyHourStart] = useState('');
  const [happyHourEnd, setHappyHourEnd] = useState('');
  const [isCombo, setIsCombo] = useState(false);
  const [comboItems, setComboItems] = useState('');
  
  // Recipe building state
  const [recipeIngredients, setRecipeIngredients] = useState<{ ingredientId: string; quantity: number }[]>([]);
  const [selectedIngId, setSelectedIngId] = useState('');
  const [selectedIngQty, setSelectedIngQty] = useState('');

  // Category creation form state
  const [showCatForm, setShowCatForm] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  const loadData = async () => {
    try {
      const cats = await api.menu.getCategories({ limit: 100 });
      setCategories(cats.data || []);

      const ings = await api.inventory.getIngredients({ limit: 100 });
      setIngredients(ings.data || []);

      const items = await api.menu.getItems({ page, limit });
      setMenuItems(items.data || []);
      setPagination(items.pagination);
      if (cats.data.length > 0) setCategoryId(cats.data[0].id);
      if (ings.data.length > 0) setSelectedIngId(ings.data[0].id);
    } catch (error) {
      console.error('Failed to load menu manager data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, limit]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName) return;

    try {
      await api.menu.createCategory({ name: newCatName });
      setNewCatName('');
      setShowCatForm(false);
      loadData();
    } catch (error) {
      showNotification({
        title: 'Action Failed',
        message: 'Failed to create category',
        type: 'error'
      });
    }
  };

  const handleAddRecipeIngredient = () => {
    if (!selectedIngId || !selectedIngQty) return;
    const ingId = selectedIngId;
    const qty = parseFloat(selectedIngQty);

    if (isNaN(qty) || qty <= 0) {
      showNotification({
        title: 'Invalid Qty',
        message: 'Please enter a valid quantity',
        type: 'info'
      });
      return;
    }

    if (recipeIngredients.some((i) => i.ingredientId === ingId)) {
      showNotification({
        title: 'Duplicate Ingredient',
        message: 'Ingredient already added to recipe list',
        type: 'info'
      });
      return;
    }

    setRecipeIngredients([...recipeIngredients, { ingredientId: ingId, quantity: qty }]);
    setSelectedIngQty('');
  };

  const handleRemoveRecipeIngredient = (ingId: string) => {
    setRecipeIngredients(recipeIngredients.filter((i) => i.ingredientId !== ingId));
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64String = reader.result as string;
        const data = await api.menu.uploadImage(base64String, file.name);
        setImage(data.imageUrl);
        showNotification({
          title: 'Asset Uploaded',
          message: 'Image uploaded and registered successfully!',
          type: 'success'
        });
      } catch (error: any) {
        showNotification({
          title: 'Upload Failed',
          message: error.message || 'Image upload failed',
          type: 'error'
        });
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !categoryId) return;

    // Parse Modifiers string "Extra Cheese:0.80, Oat Milk:0.75" -> array
    const parsedModifiers = modifiersInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.includes(':'))
      .map((s) => {
        const parts = s.split(':');
        return {
          name: parts[0].trim(),
          price: parseFloat(parts[1].trim()) || 0.00,
        };
      });

    const payload = {
      name,
      price: parseFloat(price),
      description,
      imageUrl: image,
      categoryId,
      recipes: recipeIngredients,
      modifiers: parsedModifiers,
      happyHourPrice: isHappyHour && happyHourPrice ? parseFloat(happyHourPrice) : null,
      happyHourStart: isHappyHour ? happyHourStart : null,
      happyHourEnd: isHappyHour ? happyHourEnd : null,
      isCombo,
      comboItems: isCombo ? comboItems : null,
    };

    try {
      if (editingItemId) {
        await api.menu.updateItem(editingItemId, payload);
        showNotification({
          title: 'Item Updated',
          message: 'Menu item updated successfully!',
          type: 'success'
        });
      } else {
        await api.menu.createItem(payload);
        showNotification({
          title: 'Item Created',
          message: 'Menu item created successfully!',
          type: 'success'
        });
      }
      resetItemForm();
      loadData();
    } catch (error: any) {
      showNotification({
        title: 'Action Failed',
        message: error.message || 'Failed to save menu item',
        type: 'error'
      });
    }
  };

  const handleEditItemClick = async (item: MenuItem) => {
    setEditingItemId(item.id);
    setName(item.name);
    setPrice(parseFloat(item.price).toString());
    setDescription(item.description || '');
    setImage(item.imageUrl || '');
    setIsHappyHour(!!item.happyHourPrice);
    setHappyHourPrice(item.happyHourPrice ? parseFloat(item.happyHourPrice).toString() : '');
    setHappyHourStart(item.happyHourStart || '');
    setHappyHourEnd(item.happyHourEnd || '');
    setIsCombo(item.isCombo);
    setComboItems(item.comboItems || '');
    
    try {
      const details = await api.menu.getItemDetails(item.id);
      setCategoryId(details.categoryId);
      setRecipeIngredients(
        (details.recipes || []).map((r: any) => ({
          ingredientId: r.ingredientId,
          quantity: parseFloat(r.quantity.toString()),
        }))
      );
      // Compile modifiers back to string list
      setModifiersInput(
        (details.modifiers || []).map((m: any) => `${m.name}:${parseFloat(m.price).toFixed(2)}`).join(', ')
      );
    } catch (error) {
      console.error(error);
    }
    setShowItemForm(true);
  };

  const handleDeleteItem = (itemId: string) => {
    showConfirm('Are you sure you want to delete this menu item and its recipe settings?', async () => {
      try {
        await api.menu.deleteItem(itemId);
        loadData();
      } catch (error) {
        showNotification({
          title: 'Action Failed',
          message: 'Failed to delete item',
          type: 'error'
        });
      }
    });
  };

  const resetItemForm = () => {
    setShowItemForm(false);
    setEditingItemId(null);
    setName('');
    setPrice('');
    setDescription('');
    setImage('');
    setRecipeIngredients([]);
    setSelectedIngQty('');
    setModifiersInput('');
    setIsHappyHour(false);
    setHappyHourPrice('');
    setHappyHourStart('');
    setHappyHourEnd('');
    setIsCombo(false);
    setComboItems('');
  };

  return (
    <div className="space-y-8 text-left selection:bg-tastyc-copper selection:text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-tastyc-copper/10 pb-4">
        <div>
          <p className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold">Kitchen Configurations</p>
          <h3 className="font-title text-3xl uppercase tracking-wider text-white">Menu & Recipes</h3>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={() => setShowCatForm(true)}
            className="px-4 py-2 border border-tastyc-copper/40 text-tastyc-copper hover:bg-tastyc-copper hover:text-white transition-all text-xs uppercase tracking-widest font-semibold"
          >
            New Category
          </button>
          <button
            onClick={() => setShowItemForm(true)}
            className="px-4 py-2 bg-tastyc-copper hover:bg-tastyc-copperLight text-white transition-all text-xs uppercase tracking-widest font-semibold"
          >
            New Menu Item
          </button>
        </div>
      </div>

      {/* Category Creation Overlay Modal */}
      {showCatForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#121e22] border border-tastyc-copper/35 p-6 w-full max-w-sm space-y-4">
            <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-3">
              <h4 className="font-title text-xl uppercase tracking-wider text-white">New Category</h4>
              <button onClick={() => setShowCatForm(false)} className="text-[#a9b8c3] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Category Name</label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full bg-tastyc-dark border border-tastyc-copper/20 focus:border-tastyc-copper p-2.5 text-sm text-white outline-none"
                  placeholder="e.g. Italian Soda"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-tastyc-copper text-white text-xs uppercase tracking-widest font-bold"
              >
                Save Category
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Menu Item Form overlay Modal */}
      {showItemForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 overflow-y-auto py-8">
          <div className="bg-[#121e22] border border-tastyc-copper/35 p-6 w-full max-w-3xl space-y-6 my-auto max-h-[90vh] overflow-y-auto scrollbar-thin text-left">
            <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-3">
              <h4 className="font-title text-2xl uppercase tracking-wider text-white">
                {editingItemId ? 'Edit Menu Item' : 'New Menu Item'}
              </h4>
              <button onClick={resetItemForm} className="text-[#a9b8c3] hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleItemSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column: Basic & Advanced Details */}
              <div className="space-y-4">
                <h5 className="text-xs uppercase font-bold text-tastyc-copper border-b border-tastyc-copper/5 pb-1">
                  1. Details & Configuration
                </h5>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Category</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Modifiers, Add-ons & Sizes (e.g. Oat Milk:0.75, Extra Shot:0.80)</label>
                  <input
                    type="text"
                    value={modifiersInput}
                    onChange={(e) => setModifiersInput(e.target.value)}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-xs text-white outline-none"
                    placeholder="Oat Milk:0.75, Extra Shot:0.80, Large Size:1.20"
                  />
                </div>

                {/* Happy Hour Discount Options */}
                <div className="bg-tastyc-dark/20 p-3 border border-tastyc-copper/5 space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isHappyHour"
                      checked={isHappyHour}
                      onChange={(e) => setIsHappyHour(e.target.checked)}
                      className="rounded border-tastyc-copper/30 text-tastyc-copper focus:ring-0 bg-tastyc-dark h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="isHappyHour" className="text-[10px] uppercase font-bold text-[#a9b8c3] cursor-pointer flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5 text-tastyc-copper" />
                      <span>Configure Happy Hour Discount</span>
                    </label>
                  </div>
                  {isHappyHour && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-bold text-[#a9b8c3]">HH Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={happyHourPrice}
                          onChange={(e) => setHappyHourPrice(e.target.value)}
                          className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-1.5 text-xs text-white outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-bold text-[#a9b8c3]">Start Time</label>
                        <input
                          type="text"
                          placeholder="14:00"
                          value={happyHourStart}
                          onChange={(e) => setHappyHourStart(e.target.value)}
                          className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-1.5 text-xs text-white outline-none text-center"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[8px] uppercase font-bold text-[#a9b8c3]">End Time</label>
                        <input
                          type="text"
                          placeholder="17:00"
                          value={happyHourEnd}
                          onChange={(e) => setHappyHourEnd(e.target.value)}
                          className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-1.5 text-xs text-white outline-none text-center"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Combo Meal options */}
                <div className="bg-tastyc-dark/20 p-3 border border-tastyc-copper/5 space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isCombo"
                      checked={isCombo}
                      onChange={(e) => setIsCombo(e.target.checked)}
                      className="rounded border-tastyc-copper/30 text-tastyc-copper focus:ring-0 bg-tastyc-dark h-4 w-4 cursor-pointer"
                    />
                    <label htmlFor="isCombo" className="text-[10px] uppercase font-bold text-[#a9b8c3] cursor-pointer flex items-center space-x-1">
                      <Layers className="h-3.5 w-3.5 text-tastyc-copper" />
                      <span>This is a Combo Meal</span>
                    </label>
                  </div>
                  {isCombo && (
                    <div className="space-y-1">
                      <label className="text-[8px] uppercase font-bold text-[#a9b8c3]">Combo Inclusions</label>
                      <input
                        type="text"
                        value={comboItems}
                        onChange={(e) => setComboItems(e.target.value)}
                        className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-xs text-white outline-none"
                        placeholder="e.g. Double Espresso + Butter Croissant + Water"
                      />
                    </div>
                  )}
                </div>
                
                {/* Media Image Inputs */}
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Image URL</label>
                    <input
                      type="text"
                      value={image}
                      onChange={(e) => setImage(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none"
                      placeholder="e.g. /uploads/cappuccino.png or url"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-tastyc-copper flex items-center space-x-1.5">
                      <ImageIcon className="h-3 w-3" />
                      <span>Or Upload Local Photo</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      disabled={uploading}
                      className="w-full bg-tastyc-dark border border-dashed border-tastyc-copper/30 p-2 text-xs text-[#a9b8c3] outline-none cursor-pointer hover:border-tastyc-copper transition-colors disabled:opacity-50"
                    />
                    {uploading && <p className="text-[10px] text-tastyc-copper animate-pulse">Uploading asset files...</p>}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2.5 text-sm text-white outline-none resize-none"
                  />
                </div>
              </div>

              {/* Right Column: Recipe Linkings */}
              <div className="space-y-4 flex flex-col justify-between">
                <div>
                  <h5 className="text-xs uppercase font-bold text-tastyc-copper border-b border-tastyc-copper/5 pb-1">
                    2. Recipe (Link Ingredients)
                  </h5>

                  {/* Add Ingredient Widget */}
                  <div className="bg-tastyc-dark/20 p-3 border border-tastyc-copper/5 space-y-3 mt-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-[#a9b8c3]">Ingredient</label>
                        <select
                          value={selectedIngId}
                          onChange={(e) => setSelectedIngId(e.target.value)}
                          className="w-full bg-tastyc-dark border border-tastyc-copper/15 p-2 text-xs text-white outline-none"
                        >
                          {ingredients.map((ing) => (
                            <option key={ing.id} value={ing.id}>
                              {ing.name} ({ing.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase font-bold text-[#a9b8c3]">Required Qty</label>
                        <input
                          type="number"
                          step="0.001"
                          value={selectedIngQty}
                          onChange={(e) => setSelectedIngQty(e.target.value)}
                          className="w-full bg-tastyc-dark border border-tastyc-copper/15 p-2 text-xs text-white outline-none"
                          placeholder="e.g. 0.018 (18g)"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddRecipeIngredient}
                      className="w-full py-1.5 border border-dashed border-tastyc-copper text-tastyc-copper hover:bg-tastyc-copper/5 text-[10px] uppercase font-bold tracking-wider"
                    >
                      Add to Recipe List
                    </button>
                  </div>

                  {/* Active List */}
                  <div className="mt-4 space-y-2 max-h-[220px] overflow-y-auto scrollbar-thin">
                    {recipeIngredients.map((item) => {
                      const ing = ingredients.find((i) => i.id === item.ingredientId);
                      return (
                        <div
                          key={item.ingredientId}
                          className="flex items-center justify-between bg-tastyc-dark/30 p-2 border border-tastyc-copper/10 text-xs"
                        >
                          <span className="text-white font-medium">{ing?.name}</span>
                          <div className="flex items-center space-x-3">
                            <span className="text-tastyc-copper font-bold">
                              {item.quantity} {ing?.unit}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveRecipeIngredient(item.ingredientId)}
                              className="text-red-400 hover:text-red-500"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Form Submit */}
                <button
                  type="submit"
                  className="w-full py-3 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold mt-4"
                >
                  {editingItemId ? 'Update Menu Item' : 'Create Menu Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tastyc-copper mx-auto"></div>
          <p className="mt-4 text-[#a9b8c3] text-sm uppercase tracking-widest">Loading Catalog...</p>
        </div>
      ) : (
        <div className="bg-[#121e22] border border-tastyc-copper/10 p-6">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase text-[#a9b8c3] border-b border-tastyc-copper/10 pb-2">
                  <th className="py-3">Dish / Drink</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Attributes</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-tastyc-copper/5">
                {menuItems.map((item) => (
                  <tr key={item.id} className="hover:bg-tastyc-dark/10 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center space-x-3">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="h-10 w-10 object-cover border border-tastyc-copper/10 rounded" />
                        ) : (
                          <div className="h-10 w-10 bg-tastyc-dark flex items-center justify-center border border-tastyc-copper/10 rounded">
                            <Coffee className="h-5 w-5 text-tastyc-copper" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-white text-xs uppercase tracking-wider">{item.name}</p>
                          <p className="text-[10px] text-[#a9b8c3] max-w-xs truncate">{item.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-xs text-[#a9b8c3] uppercase font-medium">{item.category?.name}</td>
                    <td className="py-4 text-xs font-bold text-white">${parseFloat(item.price).toFixed(2)}</td>
                    <td className="py-4 text-[10px] text-[#a9b8c3]">
                      <div className="flex flex-wrap gap-1.5">
                        {item.happyHourPrice && (
                          <span className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-1.5 py-0.5 rounded font-bold uppercase">
                            Happy Hour (${parseFloat(item.happyHourPrice).toFixed(2)})
                          </span>
                        )}
                        {item.isCombo && (
                          <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">
                            Combo Meal
                          </span>
                        )}
                        {!item.happyHourPrice && !item.isCombo && (
                          <span className="text-[#a9b8c3]/40 italic">Standard</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditItemClick(item)}
                          className="p-1.5 border border-tastyc-copper/10 hover:border-tastyc-copper text-[#a9b8c3] hover:text-white transition-colors"
                          title="Edit Item Details"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-1.5 border border-red-500/10 hover:border-red-500 text-red-400 hover:text-white transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationControls
            pagination={pagination}
            onPageChange={setPage}
            onLimitChange={(n) => {
              setLimit(n);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
};
