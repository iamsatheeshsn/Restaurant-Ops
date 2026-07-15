import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { Plus, Edit2, Trash2, Check, X, ShieldAlert, Award, Layers, Users, Table, Clipboard } from 'lucide-react';

interface Role {
  id: string;
  name: string;
}

interface Branch {
  id: string;
  name: string;
}

interface Floor {
  id: string;
  name: string;
  branchId?: string;
  branch: {
    name: string;
  } | null;
}

interface DiningTable {
  id: string;
  number: string;
  seatingCapacity: number;
  qrToken: string;
  floor: {
    name: string;
  };
}

interface KitchenSection {
  id: string;
  name: string;
  branch: {
    name: string;
  };
}

interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: {
    name: string;
  };
  branch: {
    name: string;
  } | null;
}

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  stockLevel: string;
  lowStockThreshold: string;
}

export const MasterDataManagement: React.FC = () => {
  const { showNotification, showConfirm } = useNotification();
  const [loading, setLoading] = useState(true);

  // Tabs: EMPLOYEES, FLOORS, TABLES, SECTIONS, INGREDIENTS
  const [activeTab, setActiveTab] = useState<'EMPLOYEES' | 'FLOORS' | 'TABLES' | 'SECTIONS' | 'INGREDIENTS'>('EMPLOYEES');

  // Master Data collections
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [floors, setFloors] = useState<Floor[]>([]);
  const [tables, setTables] = useState<DiningTable[]>([]);
  const [sections, setSections] = useState<KitchenSection[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);

  // Auxiliary configuration details
  const [roles, setRoles] = useState<Role[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);

  // Modal controls
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Form Inputs
  const [empName, setEmpName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPhone, setEmpPhone] = useState('');
  const [empPass, setEmpPass] = useState('');
  const [empRoleId, setEmpRoleId] = useState('');
  const [empBranchId, setEmpBranchId] = useState('');

  const [floorName, setFloorName] = useState('');
  const [floorBranchId, setFloorBranchId] = useState('');

  const [tableNum, setTableNum] = useState('');
  const [tableSeats, setTableSeats] = useState('2');
  const [tableFloorId, setTableFloorId] = useState('');

  const [secName, setSecName] = useState('');
  const [secBranchId, setSecBranchId] = useState('');

  const [ingName, setIngName] = useState('');
  const [ingUnit, setIngUnit] = useState('KG');
  const [ingThreshold, setIngThreshold] = useState('1.000');

  const loadData = async () => {
    setLoading(true);
    try {
      const listBranches = await api.branches.getAll({ limit: 100 });
      setBranches(listBranches.data || []);
      if (listBranches.data.length > 0) {
        setEmpBranchId(listBranches.data[0].id);
        setFloorBranchId(listBranches.data[0].id);
        setSecBranchId(listBranches.data[0].id);
      }

      const listRoles = await api.roles.getAll();
      setRoles(listRoles || []);
      if (listRoles.length > 0) setEmpRoleId(listRoles[0].id);

      const emps = await api.master.getUsers({ limit: 100 });
      setEmployees(emps.data || []);

      const fls = await api.master.getFloors({ limit: 100 });
      setFloors(fls.data || []);
      if (fls.data.length > 0) setTableFloorId(fls.data[0].id);

      const tbs = await api.master.getTables({ limit: 100 });
      setTables(tbs.data || []);

      const secs = await api.master.getSections({ limit: 100 });
      setSections(secs.data || []);

      const ings = await api.inventory.getIngredients({ limit: 100 });
      setIngredients(ings.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    if (activeTab === 'EMPLOYEES') {
      setEmpName(item.name);
      setEmpEmail(item.email);
      setEmpPhone(item.phone || '');
      setEmpPass('');
      setEmpRoleId(item.roleId || '');
      setEmpBranchId(item.branchId || '');
    } else if (activeTab === 'FLOORS') {
      setFloorName(item.name);
      setFloorBranchId(item.branchId || '');
    } else if (activeTab === 'TABLES') {
      setTableNum(item.number);
      setTableSeats(item.seatingCapacity.toString());
      setTableFloorId(item.floorId || '');
    } else if (activeTab === 'SECTIONS') {
      setSecName(item.name);
      setSecBranchId(item.branchId || '');
    } else if (activeTab === 'INGREDIENTS') {
      setIngName(item.name);
      setIngUnit(item.unit);
      setIngThreshold(item.lowStockThreshold.toString());
    }
    setShowModal(true);
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'EMPLOYEES') {
        const payload = {
          name: empName,
          email: empEmail,
          phone: empPhone,
          roleId: empRoleId,
          branchId: empBranchId || null,
          password: empPass || undefined
        };
        if (editingItem) {
          await api.master.updateUser(editingItem.id, payload);
        } else {
          await api.master.createUser(payload);
        }
      } else if (activeTab === 'FLOORS') {
        const payload = {
          name: floorName,
          branchId: floorBranchId || null
        };
        if (editingItem) {
          await api.master.updateFloor(editingItem.id, payload);
        } else {
          await api.master.createFloor(payload);
        }
      } else if (activeTab === 'TABLES') {
        const payload = {
          number: tableNum,
          seatingCapacity: parseInt(tableSeats),
          floorId: tableFloorId
        };
        if (editingItem) {
          await api.master.updateTable(editingItem.id, payload);
        } else {
          await api.master.createTable(payload);
        }
      } else if (activeTab === 'SECTIONS') {
        const payload = {
          name: secName,
          branchId: secBranchId
        };
        if (editingItem) {
          await api.master.updateSection(editingItem.id, payload);
        } else {
          await api.master.createSection(payload);
        }
      } else if (activeTab === 'INGREDIENTS') {
        const payload = {
          name: ingName,
          unit: ingUnit,
          lowStockThreshold: parseFloat(ingThreshold)
        };
        if (editingItem) {
          await api.inventory.updateIngredient(editingItem.id, payload);
        } else {
          await api.inventory.createIngredient(payload);
        }
      }

      showNotification({
        title: 'Master Data Updated',
        message: 'Master reference saved successfully.',
        type: 'success'
      });
      setShowModal(false);
      setEditingItem(null);
      loadData();
    } catch (error: any) {
      showNotification({
        title: 'Action Failed',
        message: error.message || 'Could not sync master record.',
        type: 'error'
      });
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const itemLabel = activeTab === 'EMPLOYEES' ? 'employee' : activeTab === 'INGREDIENTS' ? 'ingredient' : activeTab.toLowerCase().slice(0, -1);
    showConfirm(`Are you sure you want to delete this ${itemLabel}?`, async () => {
      try {
        if (activeTab === 'EMPLOYEES') await api.master.deleteUser(id);
        else if (activeTab === 'FLOORS') await api.master.deleteFloor(id);
        else if (activeTab === 'TABLES') await api.master.deleteTable(id);
        else if (activeTab === 'SECTIONS') await api.master.deleteSection(id);
        else if (activeTab === 'INGREDIENTS') await api.inventory.deleteIngredient(id);

        showNotification({
          title: 'Record Removed',
          message: 'Master reference deleted successfully.',
          type: 'success'
        });
        loadData();
      } catch (error) {
        showNotification({
          title: 'Action Failed',
          message: 'Could not remove master record.',
          type: 'error'
        });
      }
    });
  };

  return (
    <div className="space-y-6 text-left selection:bg-tastyc-copper selection:text-white">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-tastyc-copper/10 pb-4">
        <div>
          <p className="text-tastyc-copper text-xs uppercase tracking-widest font-semibold">System Settings</p>
          <h3 className="font-title text-3xl uppercase tracking-wider text-white">Master Data References</h3>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setEmpName('');
            setEmpEmail('');
            setEmpPhone('');
            setEmpPass('');
            setFloorName('');
            setTableNum('');
            setTableSeats('2');
            setSecName('');
            setIngName('');
            setIngUnit('KG');
            setIngThreshold('1.000');
            setShowModal(true);
          }}
          className="px-4 py-2 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold flex items-center space-x-1.5 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>Add Master Item</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-tastyc-copper/5 pb-4">
        {(['EMPLOYEES', 'FLOORS', 'TABLES', 'SECTIONS', 'INGREDIENTS'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-[10px] uppercase tracking-widest font-semibold border transition-all ${
              activeTab === tab
                ? 'bg-tastyc-copper text-white border-tastyc-copper'
                : 'border-tastyc-copper/20 text-[#a9b8c3] hover:border-tastyc-copper/50 hover:text-white bg-tastyc-dark/20'
            }`}
          >
            {tab === 'INGREDIENTS' ? 'Raw Materials (Ingredients)' : tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-tastyc-copper mx-auto"></div>
          <p className="mt-4 text-[#a9b8c3] text-sm uppercase tracking-widest">Loading master data...</p>
        </div>
      ) : (
        <div className="bg-[#121e22] border border-tastyc-copper/10 p-6">
          <div className="overflow-x-auto">
            {/* EMPLOYEES TAB */}
            {activeTab === 'EMPLOYEES' && (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-[#a9b8c3] border-b border-tastyc-copper/10 pb-2">
                    <th>Name</th>
                    <th>Email Address</th>
                    <th>Phone</th>
                    <th>System Role</th>
                    <th>Assigned Outlet</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tastyc-copper/5">
                  {employees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-tastyc-dark/20 transition-colors">
                      <td className="py-4 font-semibold text-white">{emp.name}</td>
                      <td className="text-xs text-white">{emp.email}</td>
                      <td className="text-xs text-white">{emp.phone || '—'}</td>
                      <td className="text-xs text-tastyc-copper font-bold uppercase">{emp.role.name.replace('_', ' ')}</td>
                      <td className="text-xs text-white">{emp.branch?.name || 'Global HQ'}</td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(emp)}
                            className="p-1 border border-tastyc-copper/20 hover:border-tastyc-copper text-[#a9b8c3] hover:text-white"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(emp.id)}
                            className="p-1 border border-red-500/10 hover:border-red-500 text-red-400 hover:text-white"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* FLOORS TAB */}
            {activeTab === 'FLOORS' && (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-[#a9b8c3] border-b border-tastyc-copper/10 pb-2">
                    <th>Floor Level Name</th>
                    <th>Assigned Branch</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tastyc-copper/5">
                  {floors.map((f) => (
                    <tr key={f.id} className="hover:bg-tastyc-dark/20 transition-colors">
                      <td className="py-4 font-semibold text-white">{f.name}</td>
                      <td className="text-xs text-white">{f.branch?.name || 'All'}</td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(f)}
                            className="p-1 border border-tastyc-copper/20 hover:border-tastyc-copper text-[#a9b8c3] hover:text-white"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(f.id)}
                            className="p-1 border border-red-500/10 hover:border-red-500 text-red-400 hover:text-white"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* TABLES TAB */}
            {activeTab === 'TABLES' && (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-[#a9b8c3] border-b border-tastyc-copper/10 pb-2">
                    <th>Table identifier</th>
                    <th>Seating Capacity</th>
                    <th>Floor mapping</th>
                    <th>QR Token Identifier</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tastyc-copper/5">
                  {tables.map((t) => (
                    <tr key={t.id} className="hover:bg-tastyc-dark/20 transition-colors">
                      <td className="py-4 font-semibold text-white">Table {t.number}</td>
                      <td className="text-xs text-white font-bold">{t.seatingCapacity} Seats</td>
                      <td className="text-xs text-white">{t.floor?.name || 'Main Room'}</td>
                      <td className="text-xs text-tastyc-copper font-semibold font-mono">{t.qrToken}</td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(t)}
                            className="p-1 border border-tastyc-copper/20 hover:border-tastyc-copper text-[#a9b8c3] hover:text-white"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="p-1 border border-red-500/10 hover:border-red-500 text-red-400 hover:text-white"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* SECTIONS TAB */}
            {activeTab === 'SECTIONS' && (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-[#a9b8c3] border-b border-tastyc-copper/10 pb-2">
                    <th>Kitchen Station Name</th>
                    <th>Assigned Branch</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tastyc-copper/5">
                  {sections.map((sec) => (
                    <tr key={sec.id} className="hover:bg-tastyc-dark/20 transition-colors">
                      <td className="py-4 font-semibold text-white">{sec.name}</td>
                      <td className="text-xs text-white">{sec.branch?.name}</td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(sec)}
                            className="p-1 border border-tastyc-copper/20 hover:border-tastyc-copper text-[#a9b8c3] hover:text-white"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(sec.id)}
                            className="p-1 border border-red-500/10 hover:border-red-500 text-red-400 hover:text-white"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* INGREDIENTS TAB */}
            {activeTab === 'INGREDIENTS' && (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-[#a9b8c3] border-b border-tastyc-copper/10 pb-2">
                    <th>Raw Material / Ingredient Name</th>
                    <th>Measurement Unit</th>
                    <th>Low Stock Threshold</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-tastyc-copper/5">
                  {ingredients.map((ing) => (
                    <tr key={ing.id} className="hover:bg-tastyc-dark/20 transition-colors">
                      <td className="py-4 font-semibold text-white">{ing.name}</td>
                      <td className="text-xs text-tastyc-copper font-bold uppercase tracking-wider">{ing.unit}</td>
                      <td className="text-xs text-white font-mono">{parseFloat(ing.lowStockThreshold).toFixed(2)}</td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditClick(ing)}
                            className="p-1 border border-tastyc-copper/20 hover:border-tastyc-copper text-[#a9b8c3] hover:text-white"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(ing.id)}
                            className="p-1 border border-red-500/10 hover:border-red-500 text-red-400 hover:text-white"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

          </div>
        </div>
      )}

      {/* Editor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-[#121e22] border border-tastyc-copper/35 p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-tastyc-copper/10 pb-3">
              <h4 className="font-title text-xl uppercase tracking-wider text-white">
                {editingItem ? `Edit ${activeTab.toLowerCase()}` : `Create ${activeTab.toLowerCase()}`}
              </h4>
              <button onClick={() => setShowModal(false)} className="text-[#a9b8c3] hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdate} className="space-y-4 text-left">
              {activeTab === 'EMPLOYEES' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Employee Name</label>
                      <input
                        type="text"
                        required
                        value={empName}
                        onChange={(e) => setEmpName(e.target.value)}
                        className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Phone</label>
                      <input
                        type="tel"
                        value={empPhone}
                        onChange={(e) => setEmpPhone(e.target.value)}
                        className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Email Address</label>
                    <input
                      type="email"
                      required
                      value={empEmail}
                      onChange={(e) => setEmpEmail(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">{editingItem ? 'Password (Leave blank to keep current)' : 'Password'}</label>
                    <input
                      type="password"
                      required={!editingItem}
                      value={empPass}
                      onChange={(e) => setEmpPass(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Role</label>
                      <select
                        value={empRoleId}
                        onChange={(e) => setEmpRoleId(e.target.value)}
                        className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                      >
                        {roles.map((r) => (
                          <option key={r.id} value={r.id}>{r.name.replace('_', ' ')}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Store Branch</label>
                      <select
                        value={empBranchId}
                        onChange={(e) => setEmpBranchId(e.target.value)}
                        className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                      >
                        <option value="">Global HQ</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'FLOORS' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Floor Name</label>
                    <input
                      type="text"
                      required
                      value={floorName}
                      onChange={(e) => setFloorName(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                      placeholder="e.g. Ground Floor"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Branch Location</label>
                    <select
                      value={floorBranchId}
                      onChange={(e) => setFloorBranchId(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                    >
                      <option value="">All Branches</option>
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'TABLES' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Table identifier / Number</label>
                      <input
                        type="text"
                        required
                        value={tableNum}
                        onChange={(e) => setTableNum(e.target.value)}
                        className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                        placeholder="e.g. T-15"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Seating Capacity</label>
                      <input
                        type="number"
                        required
                        value={tableSeats}
                        onChange={(e) => setTableSeats(e.target.value)}
                        className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Floor Level allocation</label>
                    <select
                      value={tableFloorId}
                      onChange={(e) => setTableFloorId(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                    >
                      {floors.map((f) => (
                        <option key={f.id} value={f.id}>{f.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'SECTIONS' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Kitchen Section Name</label>
                    <input
                      type="text"
                      required
                      value={secName}
                      onChange={(e) => setSecName(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                      placeholder="e.g. Bakery Section"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Branch location</label>
                    <select
                      value={secBranchId}
                      onChange={(e) => setSecBranchId(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              {activeTab === 'INGREDIENTS' && (
                <>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Ingredient / Material Name</label>
                    <input
                      type="text"
                      required
                      value={ingName}
                      onChange={(e) => setIngName(e.target.value)}
                      className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                      placeholder="e.g. Organic Cocoa Powder"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Measurement Unit</label>
                      <select
                        value={ingUnit}
                        onChange={(e) => setIngUnit(e.target.value)}
                        className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                      >
                        <option value="KG">Kilogram (KG)</option>
                        <option value="GRAM">Gram (GRAM)</option>
                        <option value="LITER">Liter (LITER)</option>
                        <option value="ML">Milliliter (ML)</option>
                        <option value="PCS">Pieces (PCS)</option>
                        <option value="BOX">Boxes (BOX)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-[#a9b8c3]">Low Stock Threshold</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={ingThreshold}
                        onChange={(e) => setIngThreshold(e.target.value)}
                        className="w-full bg-tastyc-dark border border-tastyc-copper/20 p-2 text-sm text-white outline-none"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-tastyc-copper hover:bg-tastyc-copperLight text-white text-xs uppercase tracking-widest font-bold transition-all"
              >
                {editingItem ? 'Save Reference' : 'Add Item'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
