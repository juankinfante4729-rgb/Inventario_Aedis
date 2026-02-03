import React, { useState, useEffect } from 'react';
import { fetchMembers, createMember, syncMembers } from './services/api';
import { Member, DashboardStats } from './types';
import { Users, LayoutDashboard, PlusCircle, Search, Download, FileText, Menu, X, Filter, Edit, Trash2, ArrowUpDown, AlertTriangle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, Sector, CartesianGrid } from 'recharts';
import MemberForm from './components/MemberForm';
import MemberCard from './components/MemberCard';

// Helper for charts colors
const COLORS = ['#0ea5e9', '#22c55e', '#eab308', '#f97316', '#8b5cf6', '#ec4899', '#64748b'];

type SortConfig = {
  key: keyof Member | null;
  direction: 'asc' | 'desc';
};

// Custom Active Shape for Pie Chart
const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill} className="text-lg font-bold">
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" fontSize={14}>{`${value} Socios`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999" fontSize={12}>
        {`(${(percent * 100).toFixed(0)}%)`}
      </text>
    </g>
  );
};

function App() {
  const [members, setMembers] = useState<Member[]>([]);
  const [view, setView] = useState<'dashboard' | 'list' | 'create' | 'edit'>('dashboard');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [activeIndex, setActiveIndex] = useState(0);

  // Deletion State
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadMembers();
  }, []);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const loadMembers = async () => {
    setLoading(true);
    try {
      const data = await fetchMembers();
      setMembers(data);
    } catch (error) {
      console.error("Failed to load members", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data: Partial<Member>, file?: { data: string; name: string }) => {
    try {
      await createMember(data, file);
      alert('Socio creado exitosamente.');
      await loadMembers();
      setView('list');
    } catch (error) {
      console.error(error);
      alert('Error al crear socio');
    }
  };

  const handleUpdate = async (data: Partial<Member>, file?: { data: string; name: string }) => {
    if (!editingMember) return;
    
    // We match by ID if present, otherwise by Cedula (which is unique)
    const updatedMembers = members.map(m => {
      const isMatch = m.id && editingMember.id ? m.id === editingMember.id : m.cedula === editingMember.cedula;
      if (isMatch) {
         const updated = { ...m, ...data };
         if (file) {
           (updated as any).fileData = file.data;
           (updated as any).fileName = file.name;
         }
         return updated;
      }
      return m;
    });

    try {
      await syncMembers(updatedMembers);
      alert('Socio actualizado exitosamente.');
      await loadMembers(); 
      setView('list');
      setEditingMember(null);
    } catch (error) {
      console.error(error);
      alert('Error al actualizar socio');
    }
  };

  const initiateDelete = (member: Member) => {
    setMemberToDelete(member);
  };

  const confirmDelete = async () => {
    if (!memberToDelete) return;

    // Filter out the member using robust string comparison on Cedula
    const updatedMembers = members.filter(m => String(m.cedula).trim() !== String(memberToDelete.cedula).trim());
    
    if (updatedMembers.length === members.length) {
       alert("No se pudo identificar al socio para eliminar (Error de coincidencia de Cédula).");
       setMemberToDelete(null);
       return;
    }

    setLoading(true);
    try {
      await syncMembers(updatedMembers);
      // Optimistic update
      setMembers(updatedMembers); 
      setMemberToDelete(null);
      // Refresh strictly to be safe
      await loadMembers();
    } catch (error) {
      console.error(error);
      alert('Error al eliminar socio');
    } finally {
      setLoading(false);
      setMemberToDelete(null);
    }
  };

  const requestSort = (key: keyof Member) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const calculateStats = (): DashboardStats => {
    const totalMembers = members.length;
    const activeMembers = members.filter(m => m.estadoSocio === 'Activo').length;
    const totalPercentage = members.reduce((acc, m) => acc + (parseFloat(m.discapacidadPorcentaje) || 0), 0);
    const avgDisability = totalMembers ? Math.round(totalPercentage / totalMembers) : 0;
    
    const provinces = new Set(members.map(m => m.provinciaCanton.split('/')[0].trim()).filter(p => p));
    const totalProvinces = provinces.size;

    const disTypeCount: Record<string, number> = {};
    const provCount: Record<string, number> = {};
    const genderCount: Record<string, number> = {};
    const educationCount: Record<string, number> = {};
    const statusCount: Record<string, number> = {};
    const typeCount: Record<string, number> = {};
    
    // Percentage Ranges
    const ranges = {
      '0-34%': 0,
      '35-49%': 0,
      '50-74%': 0,
      '75-100%': 0
    };

    members.forEach(m => {
      // Dis Type
      const type = m.discapacidadTipo || 'Sin especificar';
      disTypeCount[type] = (disTypeCount[type] || 0) + 1;
      
      // Province
      const prov = m.provinciaCanton.split('/')[0].trim() || 'Desconocido';
      provCount[prov] = (provCount[prov] || 0) + 1;

      // Gender
      const gen = m.genero || 'No definido';
      genderCount[gen] = (genderCount[gen] || 0) + 1;

      // Education
      const edu = m.nivelInstruccion || 'No definido';
      educationCount[edu] = (educationCount[edu] || 0) + 1;

      // Status
      const stat = m.estadoSocio || 'Indefinido';
      statusCount[stat] = (statusCount[stat] || 0) + 1;

      // Member Type
      const mType = m.tipoDeSocio || 'Adherente';
      typeCount[mType] = (typeCount[mType] || 0) + 1;

      // Ranges
      const pct = parseFloat(m.discapacidadPorcentaje) || 0;
      if (pct < 35) ranges['0-34%']++;
      else if (pct < 50) ranges['35-49%']++;
      else if (pct < 75) ranges['50-74%']++;
      else ranges['75-100%']++;
    });

    const disabilityDistribution = Object.keys(disTypeCount).map(name => ({ name, value: disTypeCount[name] }));
    const provinceDistribution = Object.keys(provCount).map(name => ({ name, value: provCount[name] })).sort((a,b) => b.value - a.value).slice(0, 10);
    
    const genderDistribution = Object.keys(genderCount).map(name => ({ name, value: genderCount[name] }));
    const educationDistribution = Object.keys(educationCount).map(name => ({ name, value: educationCount[name] }));
    const statusDistribution = Object.keys(statusCount).map(name => ({ name, value: statusCount[name] }));
    const typeDistribution = Object.keys(typeCount).map(name => ({ name, value: typeCount[name] }));
    const percentageRanges = Object.keys(ranges).map(name => ({ name, value: ranges[name as keyof typeof ranges] }));

    return { 
      totalMembers, 
      activeMembers, 
      avgDisability, 
      totalProvinces, 
      disabilityDistribution, 
      provinceDistribution,
      genderDistribution,
      educationDistribution,
      statusDistribution,
      typeDistribution,
      percentageRanges
    };
  };

  const stats = calculateStats();

  const filteredMembers = members.filter(m => 
    m.nombresCompletos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.apellidosCompletos.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.cedula.includes(searchTerm)
  );

  const sortedMembers = React.useMemo(() => {
    let sortableItems = [...filteredMembers];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const valA = a[sortConfig.key!]?.toString().toLowerCase() || '';
        const valB = b[sortConfig.key!]?.toString().toLowerCase() || '';
        
        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredMembers, sortConfig]);

  const totalPages = Math.ceil(sortedMembers.length / itemsPerPage);
  const currentMembers = sortedMembers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const exportToCSV = () => {
    const headers = ["Nombres", "Apellidos", "Cedula", "Discapacidad", "Porcentaje", "Provincia", "Celular", "Estado", "Comision"];
    const rows = members.map(m => [
      m.nombresCompletos, m.apellidosCompletos, `"${m.cedula}"`, m.discapacidadTipo, m.discapacidadPorcentaje, m.provinciaCanton, m.celular, m.estadoSocio, `"${m.comiteComision}"`
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "reporte_socios_aedis.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white shadow-xl">
        <div className="p-6 border-b border-slate-700 flex flex-col items-center">
          {/* LOGO CONTAINER: Added overflow-hidden to clip square corners of the image */}
          <div className="bg-white p-1 rounded-full mb-4 w-24 h-24 flex items-center justify-center overflow-hidden shadow-lg border-2 border-slate-700/30">
            <img src="/logo.png" alt="AEDIS" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold tracking-wider">AEDIS</h1>
          <p className="text-xs text-slate-400 mt-1">Gestión de Socios</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button onClick={() => setView('dashboard')} className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${view === 'dashboard' ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => setView('list')} className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${view === 'list' ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <Users size={20} /> Socios
          </button>
          <button onClick={() => setView('create')} className={`flex items-center gap-3 w-full p-3 rounded transition-colors ${view === 'create' ? 'bg-brand-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}>
            <PlusCircle size={20} /> Registrar Socio
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Mobile Header */}
        <header className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center z-20 shadow-md">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center overflow-hidden p-0.5">
               <img src="/logo.png" alt="AEDIS" className="w-full h-full object-contain" />
            </div>
            <span className="font-bold">AEDIS</span>
          </div>
          <button onClick={() => setShowMobileMenu(!showMobileMenu)}>
            {showMobileMenu ? <X /> : <Menu />}
          </button>
        </header>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="absolute top-14 left-0 w-full bg-slate-800 text-white z-10 p-4 md:hidden shadow-xl">
            <button onClick={() => { setView('dashboard'); setShowMobileMenu(false); }} className="block w-full text-left py-2 border-b border-slate-700">Dashboard</button>
            <button onClick={() => { setView('list'); setShowMobileMenu(false); }} className="block w-full text-left py-2 border-b border-slate-700">Socios</button>
            <button onClick={() => { setView('create'); setShowMobileMenu(false); }} className="block w-full text-left py-2">Registrar</button>
          </div>
        )}

        <main className="flex-1 overflow-auto p-4 md:p-8">
          
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
            </div>
          ) : (
            <>
              {/* DASHBOARD VIEW */}
              {view === 'dashboard' && (
                <div className="space-y-6 animate-in fade-in duration-500 pb-10">
                  <h2 className="text-3xl font-bold text-slate-800 mb-6">Panel General</h2>
                  
                  {/* KPI Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-brand-500 hover:shadow-md transition-shadow">
                      <p className="text-gray-500 text-sm font-medium">Total Socios</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalMembers}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500 hover:shadow-md transition-shadow">
                      <p className="text-gray-500 text-sm font-medium">Socios Activos</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stats.activeMembers}</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-500 hover:shadow-md transition-shadow">
                      <p className="text-gray-500 text-sm font-medium">Discapacidad Promedio</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stats.avgDisability}%</p>
                    </div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                      <p className="text-gray-500 text-sm font-medium">Provincias</p>
                      <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalProvinces}</p>
                    </div>
                  </div>

                  {/* ROW 1: Demographic Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                    
                    {/* Gender Pie Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-sm h-80 flex flex-col">
                      <h3 className="text-lg font-semibold mb-4 text-gray-700">Género</h3>
                      <div className="flex-1 min-h-0 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie 
                                data={stats.genderDistribution} 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={40}
                                outerRadius={70} 
                                fill="#8884d8" 
                                dataKey="value" 
                                label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                              {stats.genderDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Member Type Pie Chart */}
                     <div className="bg-white p-6 rounded-lg shadow-sm h-80 flex flex-col">
                      <h3 className="text-lg font-semibold mb-4 text-gray-700">Tipo de Socio</h3>
                      <div className="flex-1 min-h-0 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie 
                                data={stats.typeDistribution} 
                                cx="50%" 
                                cy="50%" 
                                outerRadius={70} 
                                fill="#8884d8" 
                                dataKey="value" 
                                label={({name, value}) => `${name}: ${value}`}
                            >
                              {stats.typeDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index + 3 % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Status Pie Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-sm h-80 flex flex-col">
                      <h3 className="text-lg font-semibold mb-4 text-gray-700">Estado</h3>
                      <div className="flex-1 min-h-0 w-full">
                         <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.statusDistribution} layout="vertical" margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                            <XAxis type="number" hide />
                            <YAxis dataKey="name" type="category" width={80} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#82ca9d" radius={[0, 4, 4, 0]}>
                               {stats.statusDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === 'Activo' ? '#22c55e' : '#ef4444'} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* ROW 2: Detailed Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Disability Type (Existing but resized) */}
                    <div className="bg-white p-6 rounded-lg shadow-sm h-96 flex flex-col">
                      <h3 className="text-lg font-semibold mb-4 text-gray-700">Por Tipo de Discapacidad</h3>
                      <div className="flex-1 min-h-0 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie 
                                activeIndex={activeIndex}
                                activeShape={renderActiveShape}
                                data={stats.disabilityDistribution} 
                                cx="50%" 
                                cy="50%" 
                                innerRadius={50}
                                outerRadius={80} 
                                fill="#8884d8" 
                                dataKey="value" 
                                onMouseEnter={onPieEnter}
                            >
                              {stats.disabilityDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Legend layout="vertical" verticalAlign="middle" align="right" />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                     {/* Disability Ranges Bar Chart */}
                     <div className="bg-white p-6 rounded-lg shadow-sm h-96 flex flex-col">
                      <h3 className="text-lg font-semibold mb-4 text-gray-700">Rangos de Porcentaje</h3>
                      <div className="flex-1 min-h-0 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.percentageRanges}>
                             <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip cursor={{fill: '#f9fafb'}} />
                            <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} name="Socios" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Education Level Bar Chart */}
                    <div className="bg-white p-6 rounded-lg shadow-sm h-96 flex flex-col">
                      <h3 className="text-lg font-semibold mb-4 text-gray-700">Nivel de Instrucción</h3>
                      <div className="flex-1 min-h-0 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={stats.educationDistribution} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} style={{fontSize: '12px'}} />
                            <Tooltip cursor={{fill: '#f9fafb'}} />
                            <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} name="Socios" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Provinces (Existing) */}
                    <div className="bg-white p-6 rounded-lg shadow-sm h-96 flex flex-col">
                      <h3 className="text-lg font-semibold mb-4 text-gray-700">Top Provincias</h3>
                       <div className="flex-1 min-h-0 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.provinceDistribution} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
                              <XAxis 
                                dataKey="name" 
                                fontSize={10} 
                                interval={0} 
                                angle={-45} 
                                textAnchor="end"
                                height={60}
                              />
                              <YAxis />
                              <Tooltip cursor={{fill: '#f0f9ff'}} />
                              <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Socios" animationDuration={1500}>
                                {stats.provinceDistribution.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                       </div>
                    </div>
                  </div>
                </div>
              )}

              {/* LIST VIEW */}
              {view === 'list' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <h2 className="text-2xl font-bold text-slate-800">Listado de Socios</h2>
                    <div className="flex gap-2 w-full md:w-auto items-center">
                      <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                          type="text" 
                          placeholder="Buscar por nombre o cédula..." 
                          className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
                          value={searchTerm}
                          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                      </div>
                      <button onClick={exportToCSV} className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2">
                        <Download size={18} /> <span className="hidden sm:inline">Exportar</span>
                      </button>
                      <div className="ml-2 flex items-center">
                        <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-700">Registros por página:</label>
                        <select
                          id="itemsPerPage"
                          value={itemsPerPage}
                          onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                          className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          {[5, 10, 20, 50, 100].map(n => (
                            <option key={n} value={n}>{n}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            {[
                              { label: 'Nombre', key: 'apellidosCompletos' },
                              { label: 'Cédula', key: 'cedula' },
                              { label: 'Discapacidad', key: 'discapacidadTipo' },
                              { label: 'Provincia', key: 'provinciaCanton' },
                              { label: 'Estado', key: 'estadoSocio' }
                            ].map((col) => (
                              <th 
                                key={col.key}
                                onClick={() => requestSort(col.key as keyof Member)}
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                              >
                                <div className="flex items-center gap-1">
                                  {col.label}
                                  <ArrowUpDown size={14} className={sortConfig.key === col.key ? 'text-brand-600' : 'text-gray-300'} />
                                </div>
                              </th>
                            ))}
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentMembers.length > 0 ? (
                            currentMembers.map((member, index) => (
                              <tr key={member.id || index} className="hover:bg-gray-50 transition-colors group">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">{member.apellidosCompletos}</div>
                                  <div className="text-sm text-gray-500">{member.nombresCompletos}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.cedula}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                    {member.discapacidadTipo} ({member.discapacidadPorcentaje}%)
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.provinciaCanton}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    member.estadoSocio === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {member.estadoSocio}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <div className="flex justify-end gap-3 transition-opacity">
                                    <button 
                                      onClick={() => setSelectedMember(member)} 
                                      className="text-gray-500 hover:text-brand-600 tooltip p-1 rounded hover:bg-gray-100"
                                      title="Ver Ficha"
                                    >
                                      <FileText size={18} />
                                    </button>
                                    <button 
                                      onClick={() => { setEditingMember(member); setView('edit'); }} 
                                      className="text-gray-500 hover:text-blue-600 p-1 rounded hover:bg-gray-100"
                                      title="Editar"
                                    >
                                      <Edit size={18} />
                                    </button>
                                    <button 
                                      onClick={() => initiateDelete(member)} 
                                      className="text-gray-500 hover:text-red-600 p-1 rounded hover:bg-gray-100"
                                      title="Eliminar"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                No se encontraron resultados.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center flex-wrap gap-2">
                      <span className="text-sm text-gray-600">
                        Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredMembers.length)} de {filteredMembers.length}
                      </span>
                      <div className="flex gap-2">
                        <button 
                          disabled={currentPage === 1} 
                          onClick={() => setCurrentPage(p => p - 1)}
                          className="px-3 py-1 border rounded disabled:opacity-50 text-sm hover:bg-gray-50"
                        >
                          Anterior
                        </button>
                        <button 
                          disabled={currentPage === totalPages} 
                          onClick={() => setCurrentPage(p => p + 1)}
                          className="px-3 py-1 border rounded disabled:opacity-50 text-sm hover:bg-gray-50"
                        >
                          Siguiente
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* CREATE VIEW */}
              {view === 'create' && (
                <MemberForm 
                  onSubmit={handleCreate} 
                  onCancel={() => setView('list')}
                />
              )}

               {/* EDIT VIEW */}
               {view === 'edit' && editingMember && (
                <MemberForm 
                  initialData={editingMember}
                  onSubmit={handleUpdate} 
                  onCancel={() => { setView('list'); setEditingMember(null); }}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Member Card Modal */}
      {selectedMember && (
        <MemberCard member={selectedMember} onClose={() => setSelectedMember(null)} />
      )}

      {/* Custom Delete Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 transform transition-all scale-100">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Confirmar Eliminación</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              ¿Está seguro que desea eliminar al socio <span className="font-semibold text-gray-800">{memberToDelete.nombresCompletos} {memberToDelete.apellidosCompletos}</span> con cédula <span className="font-mono bg-gray-100 px-1 rounded">{memberToDelete.cedula}</span>?
              <br/><br/>
              <span className="text-sm text-red-500">Esta acción no se puede deshacer.</span>
            </p>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Eliminando...' : 'Sí, Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;