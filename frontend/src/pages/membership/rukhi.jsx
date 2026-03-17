import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Search, Download, Eye, EyeOff, Edit2, Trash2, 
  Sun, Moon, ChevronUp, ChevronDown, Filter, Package,
  MoreVertical, FileText, LayoutGrid, List, CheckCircle2, X,
  Image as ImageIcon, Layers, Loader2, AlertCircle, Maximize2,
  Settings2, Copy
} from 'lucide-react';

// Helper to convert Image URL to Base64 for PDF inclusion
const getBase64ImageFromURL = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.setAttribute("crossOrigin", "anonymous");
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    img.onerror = (error) => resolve("");
    img.src = url;
  });
};

const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });
};

const INITIAL_DATA = [
  { 
    id: 1, name: "Defoaming Machine", model: "GAN-16 Fenix", category: "Machines", priceQty: 35570, priceWs: 37200, 
    description: "16-inch workspace original with 2-in-1 vacuum", image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400",
    descMode: 'shared', variants: [] 
  },
  { 
    id: 9, name: "Mechanic High Temp Tape", model: "V6-Series", category: "Tape Series", priceQty: 0, priceWs: 0, 
    description: "High quality heat resistant gold tape", image: "https://images.unsplash.com/photo-1589987607627-616cab5c2224?w=400",
    descMode: 'shared',
    variants: [
      { id: 'v1', model: "2mm Width", priceQty: 180, priceWs: 165, description: "" },
      { id: 'v2', model: "5mm Width", priceQty: 250, priceWs: 230, description: "" },
      { id: 'v3', model: "10mm Width", priceQty: 420, priceWs: 390, description: "" },
    ]
  },
  { 
    id: 12, name: "Sunshine UV Glue", model: "SS-058", category: "Paste Series", priceQty: 0, priceWs: 0, 
    description: "Professional grade UV adhesive", image: "https://images.unsplash.com/photo-159742324403d-d19501ac2837?w=400",
    descMode: 'individual',
    variants: [
      { id: 'v11', model: "Small (10g)", priceQty: 120, priceWs: 110, description: "Quick drying for micro-soldering" },
      { id: 'v12', model: "Large (50g)", priceQty: 450, priceWs: 420, description: "Bulk pack for screen refurbishing" },
    ]
  },
];

const CATEGORIES = ["All", "Machines", "Microscopes", "Soldering", "Tools", "Tape Series", "UV Series", "Multimeters", "Paste Series"];

export default function App() {
  const [products, setProducts] = useState(INITIAL_DATA);
  const [darkMode, setDarkMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [viewMode, setViewMode] = useState("table");
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [libError, setLibError] = useState(false);
  
  const [visibleColumns, setVisibleColumns] = useState({
    image: true,
    name: true,
    model: true,
    category: true,
    priceQty: true,
    priceWs: true,
    description: true,
  });

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [includeImagesInPdf, setIncludeImagesInPdf] = useState(true);
  const [pdfImageScale, setPdfImageScale] = useState(15);
  const [editingProduct, setEditingProduct] = useState(null);
  const [pdfColumns, setPdfColumns] = useState({ ...visibleColumns });

  const [formData, setFormData] = useState({
    name: '', model: '', category: 'Tools', priceQty: '', priceWs: '', description: '', image: '', descMode: 'shared', variants: []
  });

  useEffect(() => {
    const initLibs = async () => {
      try {
        const jspdfLoaded = await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
        if (jspdfLoaded) {
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.28/jspdf.plugin.autotable.min.js');
        } else {
          setLibError(true);
        }
      } catch (e) {
        setLibError(true);
      }
    };
    initLibs();
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  const groupedAndSortedProducts = useMemo(() => {
    let filtered = products.filter(p => {
      const mainMatch = Object.values(p).some(val => 
        typeof val === 'string' && val.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const variantMatch = p.variants?.some(v => v.model.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesSearch = mainMatch || variantMatch;
      const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    const groups = {};
    filtered.forEach(p => {
      if (!groups[p.category]) groups[p.category] = [];
      groups[p.category].push(p);
    });

    const sortedCats = Object.keys(groups).sort();
    sortedCats.forEach(cat => {
      groups[cat].sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    });

    return { sortedCats, groups };
  }, [products, searchTerm, selectedCategory, sortConfig]);

  const handleDelete = (id) => setProducts(products.filter(p => p.id !== id));

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: '', model: '', category: 'Tools', priceQty: '', priceWs: '', description: '', image: '', descMode: 'shared', variants: [] });
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

  const generatePDF = async () => {
    if (!window.jspdf || !window.jspdf.jsPDF) {
      alert("PDF libraries are still loading. Please try again in a few seconds.");
      return;
    }

    setIsGeneratingPdf(true);
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('l', 'mm', 'a4');
    
    doc.setFontSize(22);
    doc.setTextColor(239, 68, 68);
    doc.text('techforce', 14, 20);
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('PROFESSIONAL TOOLS CATALOG - PRICE LIST', 14, 28);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 250, 28);

    const activeHeaders = Object.keys(pdfColumns).filter(key => pdfColumns[key]);
    if (includeImagesInPdf && !activeHeaders.includes('image')) activeHeaders.unshift('image');

    const tableData = [];
    const imageMap = new Map();
    const { sortedCats, groups } = groupedAndSortedProducts;

    for (const cat of sortedCats) {
      tableData.push([{ 
        content: cat.toUpperCase(), 
        colSpan: activeHeaders.length, 
        styles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', fontSize: 10, halign: 'left' } 
      }]);

      for (const p of groups[cat]) {
        if (includeImagesInPdf && p.image) {
          const b64 = await getBase64ImageFromURL(p.image);
          if (b64) imageMap.set(p.id, b64);
        }

        if (p.variants && p.variants.length > 0) {
          p.variants.forEach((v, idx) => {
            const row = activeHeaders.map(h => {
              if (h === 'image') return idx === 0 ? { productId: p.id, isImage: true, index: 0 } : '';
              if (h === 'name') return idx === 0 ? p.name : '';
              if (h === 'category') return idx === 0 ? p.category : '';
              if (h === 'model') return v.model;
              if (h === 'priceQty') return v.priceQty.toLocaleString();
              if (h === 'priceWs') return v.priceWs.toLocaleString();
              if (h === 'description') {
                if (p.descMode === 'shared') return idx === 0 ? p.description : '';
                return v.description || '-';
              }
              return '-';
            });
            tableData.push(row);
          });
        } else {
          const row = activeHeaders.map(h => {
            if (h === 'image') return { productId: p.id, isImage: true, index: 0 };
            if (h === 'name') return p.name;
            if (h === 'category') return p.category;
            if (h === 'model') return p.model;
            if (h === 'priceQty') return p.priceQty.toLocaleString();
            if (h === 'priceWs') return p.priceWs.toLocaleString();
            if (h === 'description') return p.description;
            return '-';
          });
          tableData.push(row);
        }
      }
    }

    const headers = activeHeaders.map(h => {
      if(h === 'priceQty') return 'Price (QTY)';
      if(h === 'priceWs') return 'Price (WS)';
      return h.charAt(0).toUpperCase() + h.slice(1).replace(/([A-Z])/g, ' $1');
    });

    const colStyles = {};
    activeHeaders.forEach((h, idx) => {
      if (h === 'image') colStyles[idx] = { cellWidth: pdfImageScale + 4 };
      if (h === 'priceQty' || h === 'priceWs') colStyles[idx] = { cellWidth: 28, halign: 'right', fontStyle: 'bold' };
      if (h === 'model') colStyles[idx] = { cellWidth: 35 };
      if (h === 'description') colStyles[idx] = { cellWidth: 50 };
    });

    doc.autoTable({
      startY: 35,
      head: [headers],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [239, 68, 68], textColor: 255, fontSize: 8, fontStyle: 'bold' },
      bodyStyles: { fontSize: 7, valign: 'middle', cellPadding: 2 },
      columnStyles: colStyles,
      didDrawCell: (data) => {
        if (includeImagesInPdf && data.section === 'body') {
          const cellRaw = data.cell.raw;
          if (cellRaw && cellRaw.isImage && cellRaw.index === 0) {
            const b64 = imageMap.get(cellRaw.productId);
            if (b64) doc.addImage(b64, 'PNG', data.cell.x + 2, data.cell.y + 2, pdfImageScale, pdfImageScale);
          }
        }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.cell.raw && data.cell.raw.isImage) {
          data.cell.text = ''; 
          data.cell.styles.minCellHeight = pdfImageScale + 4;
        }
        if (data.section === 'body' && (activeHeaders[data.column.index] === 'priceQty' || activeHeaders[data.column.index] === 'priceWs')) {
           if (data.cell.text[0] && data.cell.text[0] !== '-') data.cell.text = '₹' + data.cell.text;
        }
      }
    });

    doc.save(`Techforce_Inventory_${Date.now()}.pdf`);
    setIsExportModalOpen(false);
    setIsGeneratingPdf(false);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      <header className={`sticky top-0 z-40 border-b backdrop-blur-xl px-8 py-5 flex flex-wrap items-center justify-between gap-6 ${darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="flex items-center gap-4">
          <div className="bg-red-600 p-3 rounded-2xl rotate-3 shadow-lg shadow-red-600/30">
            <Package className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-red-600 uppercase italic leading-none">techforce</h1>
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase opacity-50 mt-1">Professional Mobile Tools</p>
          </div>
        </div>

        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 group-focus-within:text-red-500 transition-all" size={20} />
            <input type="text" placeholder="Search catalog..." 
              className={`w-full pl-12 pr-6 py-3.5 rounded-2xl border-2 outline-none transition-all font-medium ${darkMode ? 'bg-slate-900 border-slate-800 focus:border-red-600/50 focus:ring-4 focus:ring-red-600/10' : 'bg-slate-100 border-transparent focus:bg-white focus:border-red-500 focus:ring-4 focus:ring-red-500/10'}`}
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>
          <button onClick={() => setDarkMode(!darkMode)}
            className={`p-3.5 rounded-2xl border-2 transition-all ${darkMode ? 'bg-slate-900 border-slate-800 text-yellow-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
            {darkMode ? <Sun size={22} /> : <Moon size={22} />}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={openAddModal} className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3.5 rounded-2xl font-bold transition-all transform hover:-translate-y-1 shadow-xl shadow-red-600/20 active:scale-95">
            <Plus size={20} /> New Item
          </button>
          <button onClick={() => setIsExportModalOpen(true)} className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-bold border-2 transition-all ${darkMode ? 'border-slate-800 bg-slate-900 hover:bg-slate-800' : 'border-slate-200 bg-white hover:bg-slate-50'}`}>
            <Download size={20} /> Export
          </button>
        </div>
      </header>

      {libError && (
        <div className="bg-red-500 text-white p-2 text-center text-xs font-bold flex items-center justify-center gap-2">
          <AlertCircle size={14} /> PDF Libraries failed to load. Export features may not work.
        </div>
      )}

      <main className="p-8 max-w-[1700px] mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-6 mb-10">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap border-2 ${
                  selectedCategory === cat ? 'bg-red-600 border-red-600 text-white shadow-lg' : darkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-100 text-slate-500 hover:border-red-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-slate-200/50 dark:bg-slate-900 p-1.5 rounded-2xl border dark:border-slate-800">
            <button onClick={() => setViewMode('table')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? (darkMode ? 'bg-slate-800 text-white' : 'bg-white shadow-md text-red-600') : 'text-slate-500'}`}><List size={22} /></button>
            <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? (darkMode ? 'bg-slate-800 text-white' : 'bg-white shadow-md text-red-600') : 'text-slate-500'}`}><LayoutGrid size={22} /></button>
          </div>
        </div>

        {viewMode === 'table' ? (
          <div className={`overflow-hidden rounded-[2.5rem] border-2 shadow-2xl ${darkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className={`${darkMode ? 'bg-slate-900' : 'bg-slate-50'} border-b-2 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    {visibleColumns.image && <th className="px-8 py-6 text-xs font-black uppercase tracking-widest opacity-40">Visual</th>}
                    {visibleColumns.name && (
                      <th className="px-8 py-6 cursor-pointer group" onClick={() => handleSort('name')}>
                        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">
                          Item Entity {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp size={16}/> : <ChevronDown size={16}/>)}
                        </div>
                      </th>
                    )}
                    {visibleColumns.model && <th className="px-8 py-6 text-xs font-black uppercase tracking-widest opacity-40">Specifications</th>}
                    {visibleColumns.priceQty && <th className="px-8 py-6 text-xs font-black uppercase tracking-widest opacity-40 text-center">Qty Price</th>}
                    {visibleColumns.priceWs && <th className="px-8 py-6 text-xs font-black uppercase tracking-widest opacity-40 text-center">Ws Price</th>}
                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest opacity-40 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {groupedAndSortedProducts.sortedCats.map(cat => (
                    <React.Fragment key={cat}>
                      <tr className={`${darkMode ? 'bg-slate-800/30' : 'bg-slate-100/30'}`}>
                        <td colSpan={6} className="px-8 py-3 text-[10px] font-black uppercase tracking-widest opacity-40">Group: {cat}</td>
                      </tr>
                      {groupedAndSortedProducts.groups[cat].map((p) => (
                        <tr key={p.id} className={`group relative transition-all hover:bg-slate-50/50 dark:hover:bg-slate-800/20`}>
                          {visibleColumns.image && (
                            <td className="px-8 py-5 align-top">
                              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 dark:border-slate-700 shadow-sm bg-slate-100">
                                <img src={p.image} className="w-full h-full object-cover" alt={p.name} />
                              </div>
                            </td>
                          )}
                          {visibleColumns.name && (
                            <td className="px-8 py-5 align-top relative">
                              {p.variants.length > 0 && <div className="absolute left-0 top-6 bottom-6 w-1 bg-red-600 rounded-r-full shadow-[2px_0_8px_rgba(220,38,38,0.5)]"></div>}
                              <div className="space-y-1">
                                <span className="font-black text-lg block tracking-tight">{p.name}</span>
                                {p.descMode === 'shared' && <p className="text-xs opacity-50 max-w-xs leading-relaxed mt-2 italic">{p.description}</p>}
                                {p.variants.length > 0 && <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-black uppercase mt-1 tracking-tighter"><Layers size={10}/> {p.variants.length} Variants</span>}
                              </div>
                            </td>
                          )}
                          
                          <td colSpan={3} className="p-0 align-top">
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                              {p.variants && p.variants.length > 0 ? (
                                p.variants.map((v) => (
                                  <div key={v.id} className="grid grid-cols-3 h-full items-center">
                                    <div className="px-8 py-4 space-y-1 border-r dark:border-slate-800">
                                      <div className="font-mono text-sm font-bold opacity-80">{v.model}</div>
                                      {p.descMode === 'individual' && <p className="text-[10px] opacity-50 font-medium italic">{v.description || 'No variant info'}</p>}
                                    </div>
                                    <div className="px-8 py-4 text-center font-black text-red-600 border-r dark:border-slate-800">₹{v.priceQty.toLocaleString()}</div>
                                    <div className="px-8 py-4 text-center font-bold opacity-60">₹{v.priceWs.toLocaleString()}</div>
                                  </div>
                                ))
                              ) : (
                                <div className="grid grid-cols-3 h-full min-h-[80px] items-center">
                                    <div className="px-8 py-4 font-mono text-sm font-bold opacity-80 border-r dark:border-slate-800">{p.model}</div>
                                    <div className="px-8 py-4 text-center font-black text-red-600 border-r dark:border-slate-800">₹{p.priceQty.toLocaleString()}</div>
                                    <div className="px-8 py-4 text-center font-bold opacity-60">₹{p.priceWs.toLocaleString()}</div>
                                </div>
                              )}
                            </div>
                          </td>

                          <td className="px-8 py-5 text-right align-top">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => openEditModal(p)} className="p-3 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all shadow-lg"><Edit2 size={18} /></button>
                              <button onClick={() => handleDelete(p.id)} className="p-3 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"><Trash2 size={18} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {groupedAndSortedProducts.sortedCats.map(cat => (
              <section key={cat}>
                <h2 className="text-xs font-black uppercase tracking-[0.3em] opacity-40 mb-6 border-b pb-2 dark:border-slate-800">{cat}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-8">
                  {groupedAndSortedProducts.groups[cat].map(p => (
                    <div key={p.id} className={`group relative rounded-[2.5rem] border-2 transition-all hover:shadow-2xl hover:-translate-y-2 overflow-hidden ${darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
                      <div className="aspect-[4/3] relative overflow-hidden bg-slate-100 dark:bg-slate-800">
                        <img src={p.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt={p.name} />
                        <div className="absolute top-5 left-5">
                          {p.variants?.length > 0 && <span className="bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl animate-pulse"><Layers size={12} /> {p.variants.length} Variants</span>}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-4">
                           <button onClick={() => openEditModal(p)} className="p-4 bg-white rounded-2xl text-blue-600 hover:scale-110 shadow-2xl"><Edit2 size={24}/></button>
                           <button onClick={() => handleDelete(p.id)} className="p-4 bg-white rounded-2xl text-red-600 hover:scale-110 shadow-2xl"><Trash2 size={24}/></button>
                        </div>
                      </div>
                      <div className="p-7">
                        <h3 className="font-black text-xl mb-1 truncate">{p.name}</h3>
                        <p className="text-xs opacity-40 mb-5 font-bold line-clamp-2">{p.description}</p>
                        
                        {p.variants?.length > 0 ? (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between opacity-40 text-[10px] font-black uppercase tracking-widest border-b dark:border-slate-800 pb-1"><span>Spec</span><span>Price</span></div>
                            {p.variants.slice(0, 3).map(v => (
                              <div key={v.id} className="flex items-center justify-between"><span className="text-sm font-bold opacity-70 truncate max-w-[120px]">{v.model}</span><span className="text-sm font-black text-red-600">₹{v.priceQty.toLocaleString()}</span></div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                            <div><p className="text-[10px] font-black uppercase tracking-tighter opacity-30">Model</p><p className="text-sm font-bold font-mono">{p.model}</p></div>
                            <div className="text-right"><p className="text-[10px] font-black uppercase tracking-tighter opacity-30">Price</p><p className="text-xl font-black text-red-600">₹{p.priceQty.toLocaleString()}</p></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md animate-in fade-in" onClick={() => setIsProductModalOpen(false)}></div>
          <div className={`relative w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl animate-in zoom-in ${darkMode ? 'bg-slate-900 border border-slate-800' : 'bg-white'}`}>
            <div className="sticky top-0 z-10 px-10 py-8 border-b backdrop-blur-md flex items-center justify-between bg-inherit rounded-t-[2.5rem]">
              <div>
                <h2 className="text-3xl font-black italic tracking-tighter uppercase">{editingProduct ? 'Edit Records' : 'Create Entry'}</h2>
                <p className="text-xs font-bold opacity-40 uppercase tracking-widest mt-1">Advanced variant and description management</p>
              </div>
              <button onClick={() => setIsProductModalOpen(false)} className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSaveProduct} className="p-10 space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                <div className="lg:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest opacity-40">Main Visual (Cloudinary URL)</label>
                    <input className={`w-full p-4 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-red-600' : 'bg-slate-50 border-slate-200 focus:border-red-500'}`} 
                      value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} placeholder="https://res.cloudinary.com/..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest opacity-40">Full Product Name</label>
                    <input required className={`w-full p-4 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-red-600' : 'bg-slate-50 border-slate-200 focus:border-red-500'}`} 
                      value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Mechanic Soldering Station" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest opacity-40">Category</label>
                      <select className={`w-full p-4 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-red-600' : 'bg-slate-50 border-slate-200 focus:border-red-500'}`}
                        value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        {CATEGORIES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-black uppercase tracking-widest opacity-40">Base Model</label>
                      <input className={`w-full p-4 rounded-2xl border-2 outline-none transition-all ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-red-600' : 'bg-slate-50 border-slate-200 focus:border-red-500'}`} 
                        value={formData.model} onChange={e => setFormData({...formData, model: e.target.value})} placeholder="Model Number" />
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl border-2 border-red-600/20 bg-red-600/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-2"><Settings2 size={14}/> Description Logic</label>
                      <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button type="button" onClick={() => setFormData({...formData, descMode: 'shared'})} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${formData.descMode === 'shared' ? 'bg-red-600 text-white shadow-lg' : 'opacity-40'}`}>SHARED</button>
                        <button type="button" onClick={() => setFormData({...formData, descMode: 'individual'})} className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${formData.descMode === 'individual' ? 'bg-red-600 text-white shadow-lg' : 'opacity-40'}`}>SPECIFIC</button>
                      </div>
                    </div>
                    
                    {formData.descMode === 'shared' && (
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase opacity-40">Global Product Info</label>
                        <textarea rows="4" className={`w-full p-4 rounded-2xl border-2 outline-none transition-all resize-none ${darkMode ? 'bg-slate-800 border-slate-700 focus:border-red-600' : 'bg-slate-100 border-slate-200 focus:border-red-500'}`} 
                          value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Enter description for all items..." />
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-6">
                  <div className="flex items-center justify-between border-b-2 dark:border-slate-800 pb-2">
                    <label className="text-xs font-black uppercase tracking-widest opacity-40 flex items-center gap-2"><Layers size={14}/> Specifications & Variants</label>
                    <button type="button" onClick={() => setFormData({...formData, variants: [...formData.variants, { id: Date.now(), model: '', priceQty: 0, priceWs: 0, description: '' }]})} className="text-[10px] font-black text-red-600 hover:bg-red-600 hover:text-white px-4 py-1.5 border-2 border-red-600 rounded-full transition-all">ADD VARIATION</button>
                  </div>
                  
                  {formData.variants.length === 0 ? (
                    <div className="grid grid-cols-2 gap-4 pt-10">
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest opacity-40 text-red-600">Base Price (QTY)</label>
                        <input type="number" className={`w-full p-6 rounded-3xl border-2 border-red-600/30 outline-none transition-all text-xl font-black ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`} 
                          value={formData.priceQty} onChange={e => setFormData({...formData, priceQty: Number(e.target.value)})} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest opacity-40">Base Price (WS)</label>
                        <input type="number" className={`w-full p-6 rounded-3xl border-2 border-slate-200 outline-none transition-all text-xl font-bold opacity-70 ${darkMode ? 'bg-slate-800' : 'bg-slate-50'}`} 
                          value={formData.priceWs} onChange={e => setFormData({...formData, priceWs: Number(e.target.value)})} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 max-h-[550px] overflow-y-auto pr-4 custom-scrollbar">
                      {formData.variants.map((v, idx) => (
                        <div key={v.id} className={`p-6 rounded-[2rem] border-2 relative group/var ${darkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                          <button type="button" onClick={() => setFormData({...formData, variants: formData.variants.filter((_, i) => i !== idx)})} className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all opacity-0 group-hover/var:opacity-100"><X size={18}/></button>
                          
                          <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase opacity-40">Spec/Model</label>
                              <input className="w-full bg-transparent border-b-2 border-slate-300 dark:border-slate-600 font-bold outline-none pb-2 focus:border-red-600" value={v.model} onChange={e => {
                                const newVars = [...formData.variants]; newVars[idx].model = e.target.value; setFormData({...formData, variants: newVars});
                              }} placeholder="e.g. 5mm Width" />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase opacity-40">Qty Price</label>
                              <input type="number" className="w-full bg-transparent border-b-2 border-slate-300 dark:border-slate-600 font-black text-red-600 outline-none pb-2 focus:border-red-600" value={v.priceQty} onChange={e => {
                                const newVars = [...formData.variants]; newVars[idx].priceQty = Number(e.target.value); setFormData({...formData, variants: newVars});
                              }} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase opacity-40">Ws Price</label>
                              <input type="number" className="w-full bg-transparent border-b-2 border-slate-300 dark:border-slate-600 font-bold outline-none pb-2 focus:border-red-600" value={v.priceWs} onChange={e => {
                                const newVars = [...formData.variants]; newVars[idx].priceWs = Number(e.target.value); setFormData({...formData, variants: newVars});
                              }} />
                            </div>
                          </div>
                          
                          {formData.descMode === 'individual' && (
                            <div className="mt-4 pt-4 border-t-2 border-dashed border-slate-200 dark:border-slate-700">
                              <label className="text-[10px] font-black uppercase opacity-40 block mb-2 tracking-widest">Variant Specific Info</label>
                              <textarea rows="2" className={`w-full p-4 rounded-xl border-2 outline-none transition-all resize-none ${darkMode ? 'bg-slate-900' : 'bg-white'}`}
                                value={v.description} onChange={e => {
                                  const newVars = [...formData.variants]; newVars[idx].description = e.target.value; setFormData({...formData, variants: newVars});
                                }} placeholder="Description only for this variant..." />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              <button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xl py-8 rounded-[2.5rem] shadow-2xl shadow-red-600/30 transition-all transform hover:scale-[1.01] active:scale-95">
                {editingProduct ? 'Update Inventory' : 'Add to Catalog'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsExportModalOpen(false)}></div>
          <div className={`relative w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
            <div className="px-10 py-10 bg-red-600 text-white">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-black italic tracking-tighter uppercase leading-none">Catalog Export</h2>
                {isGeneratingPdf ? <Loader2 className="animate-spin" size={32} /> : <FileText size={32} />}
              </div>
              <p className="text-red-100 font-bold text-sm leading-relaxed opacity-90">Advanced grouping ensures variants and descriptions are aligned for professional printing.</p>
            </div>
            <div className="p-10 space-y-8">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Document Style</h3>
                <div className="space-y-3">
                  <label className={`flex items-center justify-between p-5 rounded-3xl cursor-pointer transition-all border-2 ${includeImagesInPdf ? 'bg-red-500/5 border-red-500' : (darkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 opacity-50')}`}>
                    <div className="flex items-center gap-4">
                      <ImageIcon className={includeImagesInPdf ? 'text-red-600' : 'text-slate-400'} size={24}/>
                      <div><span className="font-black block leading-none">Include Item Photos</span><span className="text-[10px] opacity-60">Ensures visuals appear in rows</span></div>
                    </div>
                    <input type="checkbox" className="hidden" checked={includeImagesInPdf} onChange={() => setIncludeImagesInPdf(!includeImagesInPdf)} />
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${includeImagesInPdf ? 'bg-red-600 text-white' : 'bg-slate-300'}`}>{includeImagesInPdf && <CheckCircle2 size={16}/>}</div>
                  </label>

                  {includeImagesInPdf && (
                    <div className={`p-5 rounded-3xl border-2 grid grid-cols-3 gap-4 ${darkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50'}`}>
                        {[{v:10, l:'S'}, {v:15, l:'M'}, {v:22, l:'L'}].map(s => (
                          <button key={s.l} onClick={() => setPdfImageScale(s.v)} className={`py-2 rounded-xl text-[10px] font-black border-2 transition-all ${pdfImageScale === s.v ? 'border-red-600 bg-red-600 text-white shadow-lg' : 'border-slate-300 opacity-60'}`}>{s.l} SIZE</button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Visible Columns</h3>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(pdfColumns).map(col => col !== 'image' && (
                    <button key={col} onClick={() => setPdfColumns(prev => ({...prev, [col]: !prev[col]}))} className={`flex items-center gap-3 p-4 rounded-2xl text-left border-2 transition-all ${pdfColumns[col] ? 'border-red-600 bg-red-600/5' : 'opacity-40'}`}>
                      <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${pdfColumns[col] ? 'bg-red-600 text-white' : 'bg-slate-300'}`}>{pdfColumns[col] && <CheckCircle2 size={12}/>}</div>
                      <span className="text-xs font-black uppercase tracking-tighter truncate">{col.replace(/([A-Z])/g, ' $1')}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button disabled={isGeneratingPdf} onClick={() => setIsExportModalOpen(false)} className="flex-1 py-5 font-black text-slate-500 uppercase tracking-widest text-xs disabled:opacity-30">Cancel</button>
                <button disabled={isGeneratingPdf} onClick={generatePDF} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-5 rounded-2xl shadow-2xl shadow-red-600/30 transition-all text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                  {isGeneratingPdf ? <><Loader2 className="animate-spin" size={16} /> Building...</> : 'Print PDF'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-10 py-4 rounded-full border-2 shadow-2xl flex items-center gap-8 backdrop-blur-xl ${darkMode ? 'bg-slate-950/90 border-slate-800' : 'bg-white/90 border-slate-200'}`}>
        <div className="flex items-center gap-3"><div className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-green-500/50 animate-pulse"></div><span className="text-[10px] font-black uppercase tracking-widest opacity-40">System Active</span></div>
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-800"></div>
        <div className="text-xs font-black tracking-tighter uppercase">Catalog Size: <span className="text-red-600 ml-1">{products.length} Items</span></div>
      </footer>
    </div>
  );
}