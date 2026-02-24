import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Grid, List as ListIcon } from 'lucide-react';
import ProductCard from '../components/ProductCard';
import { PRESENTATIONS, SERVICES } from '../constants';

const Marketplace = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(searchParams.get('type') === 'services' ? 'services' : 'products');

    // Sync tab state with URL parameters
    React.useEffect(() => {
        const type = searchParams.get('type');
        if (type === 'services') {
            setActiveTab('services');
        } else {
            setActiveTab('products');
        }
    }, [searchParams]);

    // Update URL when tab changes manually
    const handleTabChange = (type) => {
        setSearchParams({ type });
    };

    const categories = useMemo(() => {
        const items = activeTab === 'products' ? PRESENTATIONS : SERVICES;
        return ['All', ...new Set(items.map(item => item.category))];
    }, [activeTab]);

    const [selectedCategory, setSelectedCategory] = useState('All');

    const filteredItems = useMemo(() => {
        const items = activeTab === 'products' ? PRESENTATIONS : SERVICES;
        return items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [activeTab, searchQuery, selectedCategory]);

    return (
        <div className="pt-32 pb-20 container">
            {/* Header */}
            <div className="mb-12">
                <h1 className="text-4xl font-bold text-text-primary mb-4">Marketplace</h1>
                <p className="text-text-secondary">Discover elite digital products and expert services from top African creators.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Filters */}
                <aside className="w-full lg:w-64 shrink-0">
                    <div className="glass p-6 rounded-2xl sticky top-32">
                        <div className="flex items-center gap-2 mb-6 text-text-primary font-bold">
                            <Filter size={18} />
                            <span>Filters</span>
                        </div>

                        <div className="mb-8">
                            <h4 className="text-xs uppercase tracking-widest text-text-muted mb-4 font-bold">Category</h4>

                            {/* Mobile Select */}
                            <div className="lg:hidden">
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full bg-surface-1 border border-glass-border rounded-lg py-2 px-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                                >
                                    {categories.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Desktop Buttons */}
                            <div className="hidden lg:flex flex-col gap-2">
                                {categories.map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${selectedCategory === cat ? 'bg-primary/10 text-primary font-medium' : 'text-text-secondary hover:text-white'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="text-xs uppercase tracking-widest text-text-muted mb-4 font-bold">Price Range</h4>
                            <div className="flex flex-col gap-4">
                                <input type="range" className="w-full accent-primary" />
                                <div className="flex justify-between text-xs text-text-secondary">
                                    <span>MK 0</span>
                                    <span>MK 50,000+</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-grow">
                    {/* Search and Tabs */}
                    <div className="flex flex-col md:flex-row gap-4 mb-8">
                        <div className="relative flex-grow">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                            <input
                                type="text"
                                placeholder="Search products or services..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-surface-1 border border-glass-border rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-colors"
                            />
                        </div>

                        <div className="flex glass p-1 rounded-xl">
                            <button
                                onClick={() => handleTabChange('products')}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'products' ? 'bg-primary text-white shadow-lg shadow-primary-glow' : 'text-text-secondary hover:text-white'}`}
                            >
                                Products
                            </button>
                            <button
                                onClick={() => handleTabChange('services')}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'services' ? 'bg-primary text-white shadow-lg shadow-primary-glow' : 'text-text-secondary hover:text-white'}`}
                            >
                                Services
                            </button>
                        </div>
                    </div>

                    {/* Grid */}
                    {filteredItems.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredItems.map(item => (
                                <ProductCard key={item.id} item={item} type={activeTab === 'products' ? 'product' : 'service'} />
                            ))}
                        </div>
                    ) : (
                        <div className="glass p-20 rounded-3xl text-center">
                            <div className="text-5xl mb-6">🔍</div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">No items found</h3>
                            <p className="text-text-secondary">Try adjusting your filters or search query.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
                                className="mt-6 text-primary hover:underline transition-all"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default Marketplace;
