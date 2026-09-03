import React, { useState } from 'react';
import {
  AlertTriangle,
  Boxes,
  CheckCircle2,
  Package,
  Plus,
  RotateCcw,
  Search,
  ShoppingCart,
  Sliders,
  TrendingDown,
  X,
  Edit,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { InventoryItem } from '../../types';
import { formatFCFA } from '../../services/store';

export const InventoryView: React.FC = () => {
  const {
    state,
    updateStockItem,
    createInventoryItem,
    updateInventoryThreshold,
    currentTenant,
  } = useApp();

  const tenantInventory = state.inventory.filter((i) => i.tenantId === state.currentTenantId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Restock modal
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [quantityToAdd, setQuantityToAdd] = useState<number>(10);
  const [purchaseCost, setPurchaseCost] = useState<number>(25000);

  // New Product Modal
  const [showNewProductModal, setShowNewProductModal] = useState<boolean>(false);
  const [newName, setNewName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Lessives & Détergents');
  const [newUnit, setNewUnit] = useState<string>('Bidon 5L');
  const [newInitialStock, setNewInitialStock] = useState<number>(10);
  const [newMinThreshold, setNewMinThreshold] = useState<number>(5);
  const [newUnitPrice, setNewUnitPrice] = useState<number>(15000);
  const [newSupplier, setNewSupplier] = useState<string>('');

  // Threshold Edit Modal
  const [thresholdItem, setThresholdItem] = useState<InventoryItem | null>(null);
  const [newThresholdValue, setNewThresholdValue] = useState<number>(5);

  const filtered = tenantInventory.filter((item) => {
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim().length > 0) {
      return (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return true;
  });

  const handleRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockItem || quantityToAdd <= 0) return;

    updateStockItem(restockItem.id, quantityToAdd, purchaseCost);
    setRestockItem(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    createInventoryItem({
      name: newName.trim(),
      category: newCategory,
      unit: newUnit.trim(),
      quantityInStock: Number(newInitialStock),
      minimumAlertThreshold: Number(newMinThreshold),
      unitPrice: Number(newUnitPrice),
      supplier: newSupplier.trim() || undefined,
    });

    setShowNewProductModal(false);
    setNewName('');
    setNewInitialStock(10);
    setNewMinThreshold(5);
    setNewUnitPrice(15000);
    setNewSupplier('');
  };

  const handleSaveThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!thresholdItem || newThresholdValue < 0) return;

    updateInventoryThreshold(thresholdItem.id, Number(newThresholdValue));
    setThresholdItem(null);
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-amber-500" />
            Stocks, Consommables & Produits Blanchisserie
          </h2>
          <p className="text-xs text-slate-500">
            Gestion autonome des produits, ajustement direct des seuils d'alerte et réapprovisionnements.
          </p>
        </div>

        {/* Action Button: Add New Product */}
        <button
          type="button"
          onClick={() => setShowNewProductModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>Ajouter un Nouveau Produit</span>
        </button>
      </div>

      {/* Stock Alerts & Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">RÉFÉRENCES EN STOCK</span>
          <p className="font-mono font-bold text-xl text-slate-900">{tenantInventory.length} articles</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-amber-600">ALERTES STOCK FAIBLE</span>
          <p className="font-mono font-bold text-xl text-amber-700">
            {tenantInventory.filter((i) => i.status === 'low' || i.status === 'critical').length} alerte(s)
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[10px] uppercase font-bold text-slate-400">VALEUR ESTIMÉE DU STOCK</span>
          <p className="font-mono font-bold text-xl text-slate-900">
            {formatFCFA(tenantInventory.reduce((acc, i) => acc + i.quantityInStock * i.unitPrice, 0))}
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher produit ou référence SKU..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-slate-900"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="text-xs bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium"
        >
          <option value="all">Toutes les catégories</option>
          <option value="Lessives & Détergents">Lessives & Détergents</option>
          <option value="Détachants & Chimie">Détachants & Chimie</option>
          <option value="Conditionnement & Emballage">Conditionnement & Emballage</option>
          <option value="Adoucissants & Parfums">Adoucissants & Parfums</option>
          <option value="Accessoires & Autres">Accessoires & Autres</option>
        </select>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">SKU / Produit</th>
                <th className="p-3">Catégorie</th>
                <th className="p-3">Stock Actuel</th>
                <th className="p-3">Seuil d'Alerte</th>
                <th className="p-3">Prix Unitaire</th>
                <th className="p-3">État</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                    Aucun produit trouvé dans le stock.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-3">
                      <span className="font-semibold text-slate-900 block">{item.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{item.sku} • {item.unit}</span>
                    </td>
                    <td className="p-3 text-slate-600">{item.category}</td>
                    <td className="p-3 font-mono font-bold text-slate-900 text-sm">
                      {item.quantityInStock} {item.unit}
                    </td>
                    <td className="p-3 text-slate-700 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold">Min: {item.minimumAlertThreshold} {item.unit}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setThresholdItem(item);
                            setNewThresholdValue(item.minimumAlertThreshold);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded hover:bg-slate-100 cursor-pointer"
                          title="Modifier le seuil d'alerte"
                        >
                          <Sliders className="w-3 h-3 text-amber-600" />
                        </button>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-slate-800">{formatFCFA(item.unitPrice)}</td>
                    <td className="p-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          item.status === 'optimal'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : item.status === 'low'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                        }`}
                      >
                        {item.status === 'optimal' ? 'OPTIMAL' : item.status === 'low' ? 'STOCK BAS' : 'CRITIQUE'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setThresholdItem(item);
                            setNewThresholdValue(item.minimumAlertThreshold);
                          }}
                          className="px-2 py-1 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded text-[10px] font-semibold cursor-pointer"
                          title="Définir seuil alerte"
                        >
                          Seuil
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setRestockItem(item);
                            setQuantityToAdd(10);
                            setPurchaseCost(item.unitPrice * 10);
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded font-semibold text-[11px] cursor-pointer"
                        >
                          + Réappro
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add New Product */}
      {showNewProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5 border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Boxes className="w-4 h-4 text-amber-500" />
                <span>Ajouter un Nouveau Produit de Blanchisserie</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowNewProductModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nom du produit / Consommable <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Ex: Lessive liquide concentrée Aloe Vera"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Catégorie</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Lessives & Détergents">Lessives & Détergents</option>
                    <option value="Détachants & Chimie">Détachants & Chimie</option>
                    <option value="Conditionnement & Emballage">Conditionnement & Emballage</option>
                    <option value="Adoucissants & Parfums">Adoucissants & Parfums</option>
                    <option value="Accessoires & Autres">Accessoires & Autres</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Unité de mesure</label>
                  <input
                    type="text"
                    required
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="Ex: Bidon 5L, Carton, Rouleau"
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Stock initial</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={newInitialStock}
                    onChange={(e) => setNewInitialStock(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Seuil d'Alerte Minimum <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newMinThreshold}
                    onChange={(e) => setNewMinThreshold(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-amber-300 bg-amber-50/50 rounded-lg font-mono font-bold text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Prix Unitaire Estimé (FCFA)</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    required
                    value={newUnitPrice}
                    onChange={(e) => setNewUnitPrice(Number(e.target.value))}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fournisseur (Optionnel)</label>
                  <input
                    type="text"
                    value={newSupplier}
                    onChange={(e) => setNewSupplier(e.target.value)}
                    placeholder="Ex: Chimie Pro Abidjan"
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewProductModal(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-xs font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold"
                >
                  Enregistrer le Produit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Edit Alert Threshold */}
      {thresholdItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>Définir le Seuil d'Alerte</span>
              </h3>
              <button
                type="button"
                onClick={() => setThresholdItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveThreshold} className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <p className="font-bold text-slate-900">{thresholdItem.name}</p>
                <p className="text-slate-500 text-[11px] font-mono">Stock actuel : {thresholdItem.quantityInStock} {thresholdItem.unit}</p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Nouveau seuil d'alerte minimale ({thresholdItem.unit}) :
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={newThresholdValue}
                  onChange={(e) => setNewThresholdValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-amber-300 bg-amber-50 rounded-lg font-mono font-bold text-base text-amber-900"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Une alerte sera automatiquement déclenchée dès que le stock descend à cette valeur ou en-dessous.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setThresholdItem(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold"
                >
                  Enregistrer le Seuil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Restock Modal */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-5 border border-slate-200 space-y-4 animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-sm">
              Réapprovisionnement : {restockItem.name}
            </h3>

            <form onSubmit={handleRestock} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 mb-1">
                  Quantité reçue ({restockItem.unit})
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantityToAdd}
                  onChange={(e) => {
                    const qty = Number(e.target.value);
                    setQuantityToAdd(qty);
                    setPurchaseCost(qty * restockItem.unitPrice);
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-600 mb-1">Coût d'achat total (FCFA)</label>
                <input
                  type="number"
                  min={0}
                  step={500}
                  required
                  value={purchaseCost}
                  onChange={(e) => setPurchaseCost(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg font-mono font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-400">
                  Cette dépense sera automatiquement reportée dans vos charges comptables.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockItem(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 text-white rounded-lg font-semibold text-xs"
                >
                  Valider entrée en stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
