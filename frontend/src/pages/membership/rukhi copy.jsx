import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Search, Download, Eye, EyeOff, Edit2, Trash2, 
  Sun, Moon, ChevronUp, ChevronDown, Filter, Package,
  MoreVertical, FileText, LayoutGrid, List, CheckCircle2, X
} from 'lucide-react';

// External libraries for PDF generation (loaded via script tags in a real app, 
// here we simulate or use window globals if available)
const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

const INITIAL_DATA = [
  { id: 1, name: "Defoaming Machine", model: "GAN-16 Fenix", category: "Machines", priceQty: 35570, priceWs: 37200, description: "16-inch workspace original", image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400" },
  { id: 2, name: "Intelligent Laminating Machine", model: "GAN-03 FENIX", category: "Machines", priceQty: 71600, priceWs: 75500, description: "16-inch Intelligent vacuum + compressor", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400" },
  { id: 3, name: "Trinocular Stereo Microscope", model: "MC-67T-B11", category: "Microscopes", priceQty: 19390, priceWs: 19500, description: "67X Zoom with lens original", image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=400" },
  { id: 4, name: "Soldering Station", model: "T12 Pro", category: "Soldering", priceQty: 1630, priceWs: 1700, description: "Anti-static intelligent temperature control", image: "https://images.unsplash.com/photo-1555617766-c94804975da3?w=400" },
  { id: 5, name: "Digital Multimeter", model: "DT-17N", category: "Multimeters", priceQty: 1390, priceWs: 1450, description: "Sunshine high precision digital", image: "https://images.unsplash.com/photo-1590374585152-72276332808e?w=400" },
  { id: 6, name: "Electric Glue Remover", model: "IR-14", category: "Tools", priceQty: 725, priceWs: 750, description: "Mechanic OCA Electric Glue Remover", image: "https://images.unsplash.com/photo-1530124560612-3df9a390df01?w=400" },
  { id: 7, name: "UV Curing Lamp", model: "SC-05", category: "UV Series", priceQty: 1290, priceWs: 1350, description: "2UUL professional UV curing lamp", image: "https://images.unsplash.com/photo-159742324403d-d19501ac2837?w=400" },
  { id: 8, name: "PCB Holder", model: "MR6 Max", category: "Holders", priceQty: 920, priceWs: 950, description: "Double bearings versatile fixture", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400" },
];

const CATEGORIES = ["All", "Machines", "Microscopes", "Soldering", "Tools", "UV Series", "Holders", "Multimeters", "Paste Series"];

export default function Rukhi() {
  const [products, setProducts] = useState(INITIAL_DATA);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'grid'
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  
  // Column Visibility State
  const [visibleColumns, setVisibleColumns] = useState({
    image: true,
    name: true,
    model: true,
    category: true,
    priceQty: true,
    priceWs: true,
    description: true,
  });

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [pdfColumns, setPdfColumns] = useState({ ...visibleColumns });

  // Add/Edit Product State
  const [formData, setFormData] = useState({
    name: '', model: '', category: 'Tools', priceQty: '', priceWs: '', description: '', image: ''
  });

  useEffect(() => {
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js');
  }, []);

  // Sorting Logic
  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedProducts = useMemo(() => {
    let result = products.filter(p => {
      const matchesSearch = Object.values(p).some(val => 
        val.toString().toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return result;
  }, [products, searchTerm, selectedCategory, sortConfig]);

  const toggleColumn = (col) => {
    setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
  };

  const handleDelete = (id) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', model: '', category: 'Tools', priceQty: '', priceWs: '', description: '', image: '' });
    setIsProductModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({ ...product });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e) => {
    e.preventDefault();
    if (editingProduct) {
      setProducts(products.map(p => p.id === editingProduct.id ? { ...formData, id: p.id } : p));
    } else {
      setProducts([...products, { ...formData, id: Date.now() }]);
    }
    setIsProductModalOpen(false);
  };

  const generatePDF = () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    
    // Techforce branding
    doc.setFontSize(22);
    doc.setTextColor(239, 68, 68); // Red
    doc.text('techforce', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('THE MOBILE TOOLS SHOP - INVENTORY REPORT', 14, 28);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 250, 28);

    const tableHeaders = Object.keys(pdfColumns).filter(key => pdfColumns[key] && key !== 'image');
    const tableData = filteredAndSortedProducts.map(p => 
      tableHeaders.map(header => p[header])
    );

    doc.autoTable({
      startY: 35,
      head: [tableHeaders.map(h => h.charAt(0).toUpperCase() + h.slice(1).replace(/([A-Z])/g, ' $1'))],
      body: tableData,
      theme: 'grid',
      headStyles: { fillStyle: [239, 68, 68], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] }
    });

    doc.save(`techforce_inventory_${Date.now()}.pdf`);
    setIsExportModalOpen(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-40 border-b backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4 ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center gap-2">
          <div className="bg-red-600 p-2 rounded-lg">
            <Package className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tighter text-red-600 uppercase italic">techforce</h1>
            <p className="text-[10px] font-bold tracking-widest uppercase opacity-60 -mt-1">Professional Tools Manager</p>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" size={18} />
            <input 
              type="text" 
              placeholder="Search catalog..." 
              className={`w-full pl-10 pr-4 py-2 rounded-xl border focus:ring-2 outline-none transition-all ${darkMode ? 'bg-slate-800 border-slate-700 focus:ring-red-500' : 'bg-slate-100 border-transparent focus:ring-red-400'}`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`p-2 rounded-xl border transition-colors ${darkMode ? 'bg-slate-800 border-slate-700 text-yellow-400' : 'bg-slate-100 border-transparent text-slate-600 hover:bg-slate-200'}`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={openAddModal}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium transition-all transform active:scale-95 shadow-lg shadow-red-600/20"
          >
            <Plus size={18} /> Add Product
          </button>
          <button 
            onClick={() => setIsExportModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium border transition-all ${darkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-100'}`}
          >
            <Download size={18} /> Export
          </button>
        </div>
      </header>

      <main className="p-6 max-w-[1600px] mx-auto">
        {/* Filters and View Toggles */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat 
                    ? 'bg-red-600 text-white shadow-md' 
                    : darkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white border text-slate-600 hover:border-red-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-slate-200/50 dark:bg-slate-800 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'table' ? (darkMode ? 'bg-slate-700 text-white' : 'bg-white shadow-sm') : 'text-slate-500'}`}
            >
              <List size={20} />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? (darkMode ? 'bg-slate-700 text-white' : 'bg-white shadow-sm') : 'text-slate-500'}`}
            >
              <LayoutGrid size={20} />
            </button>
          </div>
        </div>

        {/* Column Management (Only for Table View) */}
        {viewMode === 'table' && (
          <div className={`mb-4 p-4 rounded-2xl border flex flex-wrap items-center gap-3 ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-white border-slate-200'}`}>
            <span className="text-xs font-bold uppercase tracking-wider opacity-50 flex items-center gap-2">
              <Eye size={14} /> Toggle Columns:
            </span>
            {Object.keys(visibleColumns).map(col => (
              <button
                key={col}
                onClick={() => toggleColumn(col)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                  visibleColumns[col] 
                    ? 'border-red-500/50 text-red-500 bg-red-500/5' 
                    : 'border-slate-300 opacity-40 line-through'
                }`}
              >
                {visibleColumns[col] ? <CheckCircle2 size={12} /> : <X size={12} />}
                {col.replace(/([A-Z])/g, ' $1').toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {/* Main Content Area */}
        {viewMode === 'table' ? (
          <div className={`overflow-hidden rounded-3xl border ${darkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-white border-slate-200'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`${darkMode ? 'bg-slate-800' : 'bg-slate-50'} border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                    {visibleColumns.image && <th className="px-6 py-4 text-xs font-black uppercase tracking-widest opacity-60">Image</th>}
                    {visibleColumns.name && (
                      <th className="px-6 py-4 cursor-pointer group" onClick={() => handleSort('name')}>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">
                          Product Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
                        </div>
                      </th>
                    )}
                    {visibleColumns.model && (
                      <th className="px-6 py-4 cursor-pointer group" onClick={() => handleSort('model')}>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">
                          Model {sortConfig.key === 'model' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
                        </div>
                      </th>
                    )}
                    {visibleColumns.category && <th className="px-6 py-4 text-xs font-black uppercase tracking-widest opacity-60">Category</th>}
                    {visibleColumns.priceQty && (
                      <th className="px-6 py-4 cursor-pointer group" onClick={() => handleSort('priceQty')}>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-60 group-hover:opacity-100">
                          Price (QTY) {sortConfig.key === 'priceQty' && (sortConfig.direction === 'asc' ? <ChevronUp size={14}/> : <ChevronDown size={14}/>)}
                        </div>
                      </th>
                    )}
                    {visibleColumns.priceWs && <th className="px-6 py-4 text-xs font-black uppercase tracking-widest opacity-60">Price (WS)</th>}
                    {visibleColumns.description && <th className="px-6 py-4 text-xs font-black uppercase tracking-widest opacity-60">Info</th>}
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest opacity-60 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {filteredAndSortedProducts.map((p) => (
                    <tr key={p.id} className={`group transition-colors ${darkMode ? 'hover:bg-slate-700/30' : 'hover:bg-slate-50'}`}>
                      {visibleColumns.image && (
                        <td className="px-6 py-3">
                          <img src={p.image} className="w-12 h-12 rounded-xl object-cover border dark:border-slate-600 shadow-sm" alt={p.name} />
                        </td>
                      )}
                      {visibleColumns.name && (
                        <td className="px-6 py-3">
                          <span className="font-bold text-sm block">{p.name}</span>
                          <span className="text-[10px] opacity-40 font-mono">ID: {p.id}</span>
                        </td>
                      )}
                      {visibleColumns.model && <td className="px-6 py-3 font-mono text-sm opacity-80">{p.model}</td>}
                      {visibleColumns.category && (
                        <td className="px-6 py-3">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                            darkMode ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {p.category}
                          </span>
                        </td>
                      )}
                      {visibleColumns.priceQty && (
                        <td className="px-6 py-3">
                          <span className="font-black text-red-500">₹{p.priceQty.toLocaleString()}</span>
                        </td>
                      )}
                      {visibleColumns.priceWs && (
                        <td className="px-6 py-3">
                          <span className="font-bold opacity-60">₹{p.priceWs.toLocaleString()}</span>
                        </td>
                      )}
                      {visibleColumns.description && (
                        <td className="px-6 py-3">
                          <p className="text-xs max-w-xs truncate opacity-60">{p.description}</p>
                        </td>
                      )}
                      <td className="px-6 py-3 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => openEditModal(p)} className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500"><Edit2 size={16} /></button>
                          <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredAndSortedProducts.length === 0 && (
                <div className="p-20 text-center">
                  <Package className="mx-auto mb-4 opacity-20" size={64} />
                  <p className="font-bold opacity-40 uppercase tracking-widest">No matching products found</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredAndSortedProducts.map(p => (
              <div key={p.id} className={`group relative rounded-3xl border transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                <div className="aspect-square relative overflow-hidden">
                  <img src={p.image} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={p.name} />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter shadow-sm">{p.category}</span>
                  </div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                     <button onClick={() => openEditModal(p)} className="p-3 bg-white rounded-full text-blue-600 hover:scale-110 transition-transform"><Edit2 size={20}/></button>
                     <button onClick={() => handleDelete(p.id)} className="p-3 bg-white rounded-full text-red-600 hover:scale-110 transition-transform"><Trash2 size={20}/></button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-sm truncate mb-1">{p.name}</h3>
                  <p className="text-xs opacity-50 mb-3 font-mono">{p.model}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-tighter opacity-40">QTY Price</p>
                      <p className="text-lg font-black text-red-600 leading-none">₹{p.priceQty.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black uppercase tracking-tighter opacity-40">WS Price</p>
                      <p className="text-sm font-bold opacity-60">₹{p.priceWs.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add/Edit Product Modal */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsProductModalOpen(false)}></div>
          <div className={`relative w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"><X size={20}/></button>
            </div>
            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase opacity-50">Product Name</label>
                <input required className={`w-full p-3 rounded-xl border focus:ring-2 outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Soldering Iron" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase opacity-50">Model</label>
                  <input required className={`w-full p-3 rounded-xl border focus:ring-2 outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} 
                    value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="T-12" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase opacity-50">Category</label>
                  <select className={`w-full p-3 rounded-xl border focus:ring-2 outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}
                    value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase opacity-50">Price (QTY)</label>
                  <input required type="number" className={`w-full p-3 rounded-xl border focus:ring-2 outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} 
                    value={formData.priceQty} onChange={e => setFormData({...formData, priceQty: Number(e.target.value)})} placeholder="0.00" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase opacity-50">Price (WS)</label>
                  <input required type="number" className={`w-full p-3 rounded-xl border focus:ring-2 outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} 
                    value={formData.priceWs} onChange={e => setFormData({...formData, priceWs: Number(e.target.value)})} placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold uppercase opacity-50">Image URL (Cloudinary)</label>
                <input className={`w-full p-3 rounded-xl border focus:ring-2 outline-none ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`} 
                  value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://res.cloudinary.com/..." />
              </div>
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-red-600/20 transition-all active:scale-95">
                {editingProduct ? 'Update Inventory' : 'Add to Catalog'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Export/PDF Settings Modal */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsExportModalOpen(false)}></div>
          <div className={`relative w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
            <div className="px-8 py-6 bg-red-600 text-white">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-black italic tracking-tighter uppercase">Export to PDF</h2>
                <FileText size={24} />
              </div>
              <p className="text-red-100 text-sm opacity-80">Customize columns for your professional price list.</p>
            </div>
            <div className="p-8">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-4">Select Columns to Include:</h3>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {Object.keys(pdfColumns).map(col => (
                  col !== 'image' && (
                    <label key={col} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border-2 ${
                      pdfColumns[col] 
                        ? 'border-red-500 bg-red-500/5' 
                        : (darkMode ? 'border-slate-800 bg-slate-800/40 text-slate-500' : 'border-slate-100 bg-slate-50 text-slate-400')
                    }`}>
                      <input 
                        type="checkbox" 
                        className="hidden" 
                        checked={pdfColumns[col]} 
                        onChange={() => setPdfColumns(prev => ({...prev, [col]: !prev[col]}))} 
                      />
                      <div className={`w-5 h-5 rounded flex items-center justify-center ${pdfColumns[col] ? 'bg-red-500 text-white' : 'bg-slate-400/20'}`}>
                        {pdfColumns[col] && <CheckCircle2 size={14}/>}
                      </div>
                      <span className="text-sm font-bold truncate capitalize">{col.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  )
                ))}
              </div>
              <div className="flex gap-4">
                <button onClick={() => setIsExportModalOpen(false)} className="flex-1 py-4 font-bold text-slate-500">Cancel</button>
                <button onClick={generatePDF} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-red-600/20 active:scale-95 transition-all">
                  Generate PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Bar */}
      <footer className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-6 py-3 rounded-full border shadow-2xl flex items-center gap-6 backdrop-blur-md ${
        darkMode ? 'bg-slate-900/90 border-slate-700' : 'bg-white/90 border-slate-200'
      }`}>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-xs font-black uppercase tracking-tighter opacity-60">Database: Active</span>
        </div>
        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
        <div className="text-xs font-black tracking-tighter">
          TOTAL ITEMS: <span className="text-red-500">{products.length}</span>
        </div>
        <div className="h-4 w-px bg-slate-300 dark:bg-slate-700"></div>
        <div className="text-xs font-black tracking-tighter">
          VALUE (QTY): <span className="text-red-500">₹{products.reduce((acc, curr) => acc + curr.priceQty, 0).toLocaleString()}</span>
        </div>
      </footer>
    </div>
  );
}