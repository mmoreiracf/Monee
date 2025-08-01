import React, { useState, useEffect } from 'react';
import { Plus, Trash2, PiggyBank, TrendingUp, Download, DollarSign, Calendar, Target } from 'lucide-react';

const FinanceManager = () => {
  const [salary, setSalary] = useState(0);
  const [categories, setCategories] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [savingsRate, setSavingsRate] = useState(5);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newCategory, setNewCategory] = useState({ name: '', budget: 0 });
  const [newExpense, setNewExpense] = useState({ categoryId: '', description: '', amount: 0 });

  // Initialize with savings category
  useEffect(() => {
    const savedData = localStorage.getItem('financeData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setSalary(data.salary || 0);
      setCategories(data.categories || []);
      setExpenses(data.expenses || []);
      setSavingsRate(data.savingsRate || 5);
    } else {
      // Create default savings category
      const savingsCategory = {
        id: 'savings',
        name: 'Poupança',
        budget: 0,
        isSavings: true,
        color: '#10B981'
      };
      setCategories([savingsCategory]);
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    const data = { salary, categories, expenses, savingsRate };
    localStorage.setItem('financeData', JSON.stringify(data));
  }, [salary, categories, expenses, savingsRate]);

  const addCategory = () => {
    if (newCategory.name && newCategory.budget > 0) {
      const category = {
        id: Date.now().toString(),
        name: newCategory.name,
        budget: parseFloat(newCategory.budget),
        isSavings: false,
        color: `#${Math.floor(Math.random()*16777215).toString(16)}`
      };
      setCategories([...categories, category]);
      setNewCategory({ name: '', budget: 0 });
    }
  };

  const deleteCategory = (id) => {
    if (id === 'savings') return; // Prevent deletion of savings
    setCategories(categories.filter(cat => cat.id !== id));
    setExpenses(expenses.filter(exp => exp.categoryId !== id));
  };

  const addExpense = () => {
    if (newExpense.categoryId && newExpense.description && newExpense.amount > 0) {
      const expense = {
        id: Date.now().toString(),
        categoryId: newExpense.categoryId,
        description: newExpense.description,
        amount: parseFloat(newExpense.amount),
        date: new Date().toISOString().split('T')[0]
      };
      setExpenses([...expenses, expense]);
      setNewExpense({ categoryId: '', description: '', amount: 0 });
    }
  };

  const deleteExpense = (id) => {
    setExpenses(expenses.filter(exp => exp.id !== id));
  };

  const updateCategoryBudget = (id, budget) => {
    setCategories(categories.map(cat => 
      cat.id === id ? { ...cat, budget: parseFloat(budget) } : cat
    ));
  };

  const getCategoryExpenses = (categoryId) => {
    return expenses.filter(exp => exp.categoryId === categoryId);
  };

  const getCategorySpent = (categoryId) => {
    return getCategoryExpenses(categoryId).reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getCategoryBalance = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return 0;
    
    if (category.isSavings) {
      return category.budget; // Savings accumulate
    }
    return category.budget - getCategorySpent(categoryId);
  };

  const getTotalBudgeted = () => {
    return categories.reduce((sum, cat) => sum + cat.budget, 0);
  };

  const getTotalSpent = () => {
    return expenses.reduce((sum, exp) => {
      const category = categories.find(cat => cat.id === exp.categoryId);
      return category && !category.isSavings ? sum + exp.amount : sum;
    }, 0);
  };

  const getUnallocated = () => {
    return salary - getTotalBudgeted();
  };

  const getSavingsCategory = () => {
    return categories.find(cat => cat.isSavings) || categories.find(cat => cat.id === 'savings');
  };

  const getMonthlySavingsEarnings = () => {
    const savings = getSavingsCategory();
    if (!savings) return 0;
    return (savings.budget * savingsRate) / 100 / 12;
  };

  const exportToCSV = () => {
    const headers = ['Categoria', 'Orçamento', 'Gasto', 'Saldo', 'Tipo'];
    const rows = categories.map(cat => [
      cat.name,
      cat.budget.toFixed(2),
      getCategorySpent(cat.id).toFixed(2),
      getCategoryBalance(cat.id).toFixed(2),
      cat.isSavings ? 'Poupança' : 'Despesa'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio-financeiro.csv';
    a.click();
  };

  const TabButton = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === id 
          ? 'bg-blue-600 text-white' 
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  );

  const ProgressBar = ({ current, max, color = '#3B82F6' }) => {
    const percentage = max > 0 ? Math.min((current / max) * 100, 100) : 0;
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Gerenciador de Finanças Pessoais</h1>
          
          {/* Salary Input */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <DollarSign className="text-green-600" size={20} />
              <label className="font-medium text-gray-700">Salário Mensal:</label>
            </div>
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(parseFloat(e.target.value) || 0)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Digite seu salário mensal"
            />
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-green-600 font-semibold">Salário Mensal</div>
              <div className="text-2xl font-bold text-green-700">R$ {salary.toFixed(2)}</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-blue-600 font-semibold">Total Alocado</div>
              <div className="text-2xl font-bold text-blue-700">R$ {getTotalBudgeted().toFixed(2)}</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-red-600 font-semibold">Total Gasto</div>
              <div className="text-2xl font-bold text-red-700">R$ {getTotalSpent().toFixed(2)}</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-purple-600 font-semibold">Não Alocado</div>
              <div className="text-2xl font-bold text-purple-700">R$ {getUnallocated().toFixed(2)}</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-6">
          <TabButton id="dashboard" label="Painel" icon={TrendingUp} />
          <TabButton id="categories" label="Categorias" icon={Target} />
          <TabButton id="expenses" label="Gastos" icon={DollarSign} />
          <TabButton id="savings" label="Poupança" icon={PiggyBank} />
          <TabButton id="reports" label="Relatórios" icon={Download} />
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Visão Geral das Categorias</h2>
              <div className="space-y-4">
                {categories.map(category => {
                  const spent = getCategorySpent(category.id);
                  const balance = getCategoryBalance(category.id);
                  return (
                    <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-semibold">{category.name}</span>
                          {category.isSavings && <PiggyBank size={16} className="text-green-600" />}
                        </div>
                        <div className="text-right">
                          <div className="font-bold">R$ {balance.toFixed(2)} restante</div>
                          <div className="text-sm text-gray-600">
                            R$ {spent.toFixed(2)} / R$ {category.budget.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      {!category.isSavings && (
                        <ProgressBar 
                          current={spent} 
                          max={category.budget} 
                          color={category.color} 
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Gerenciar Categorias</h2>
            
            {/* Add Category */}
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">Adicionar Nova Categoria</h3>
              <div className="flex flex-wrap gap-3">
                <input
                  type="text"
                  placeholder="Nome da categoria"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Valor do orçamento"
                  value={newCategory.budget}
                  onChange={(e) => setNewCategory({...newCategory, budget: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addCategory}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Adicionar Categoria
                </button>
              </div>
            </div>

            {/* Categories List */}
            <div className="space-y-3">
              {categories.map(category => (
                <div key={category.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-semibold">{category.name}</span>
                      {category.isSavings && <PiggyBank size={16} className="text-green-600" />}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Orçamento:</span>
                        <input
                          type="number"
                          value={category.budget}
                          onChange={(e) => updateCategoryBudget(category.id, e.target.value)}
                          className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                      </div>
                      {category.id !== 'savings' && (
                        <button
                          onClick={() => deleteCategory(category.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expenses Tab */}
        {activeTab === 'expenses' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Gerenciar Gastos</h2>
            
            {/* Add Expense */}
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">Adicionar Novo Gasto</h3>
              <div className="flex flex-wrap gap-3">
                <select
                  value={newExpense.categoryId}
                  onChange={(e) => setNewExpense({...newExpense, categoryId: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecionar categoria</option>
                  {categories.filter(cat => !cat.isSavings).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Descrição"
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Valor"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={addExpense}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus size={16} />
                  Adicionar Gasto
                </button>
              </div>
            </div>

            {/* Expenses List */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4">Data</th>
                    <th className="text-left py-3 px-4">Categoria</th>
                    <th className="text-left py-3 px-4">Descrição</th>
                    <th className="text-right py-3 px-4">Valor</th>
                    <th className="text-center py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.sort((a, b) => new Date(b.date) - new Date(a.date)).map(expense => {
                    const category = categories.find(cat => cat.id === expense.categoryId);
                    return (
                      <tr key={expense.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">{expense.date}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category?.color }}
                            />
                            {category?.name}
                          </div>
                        </td>
                        <td className="py-3 px-4">{expense.description}</td>
                        <td className="py-3 px-4 text-right font-semibold">R$ {expense.amount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => deleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Savings Tab */}
        {activeTab === 'savings' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Gerenciamento da Poupança</h2>
            
            {/* Interest Rate Setting */}
            <div className="border border-gray-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-3">Taxa de Juros Anual</h3>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  value={savingsRate}
                  onChange={(e) => setSavingsRate(parseFloat(e.target.value) || 0)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  step="0.1"
                  min="0"
                  max="100"
                />
                <span className="text-gray-600">% ao ano</span>
              </div>
            </div>

            {/* Savings Overview */}
            {getSavingsCategory() && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-6 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <PiggyBank className="text-green-600" size={24} />
                    <h3 className="font-semibold text-green-800">Total Poupado</h3>
                  </div>
                  <div className="text-3xl font-bold text-green-700">
                    R$ {getSavingsCategory().budget.toFixed(2)}
                  </div>
                </div>
                
                <div className="bg-blue-50 p-6 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="text-blue-600" size={24} />
                    <h3 className="font-semibold text-blue-800">Juros Mensais</h3>
                  </div>
                  <div className="text-3xl font-bold text-blue-700">
                    R$ {getMonthlySavingsEarnings().toFixed(2)}
                  </div>
                </div>
                
                <div className="bg-purple-50 p-6 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="text-purple-600" size={24} />
                    <h3 className="font-semibold text-purple-800">Crescimento Anual</h3>
                  </div>
                  <div className="text-3xl font-bold text-purple-700">
                    R$ {(getMonthlySavingsEarnings() * 12).toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-800">Relatório Financeiro</h2>
              <button
                onClick={exportToCSV}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <Download size={16} />
                Exportar CSV
              </button>
            </div>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-4 rounded-lg">
                <h3 className="font-semibold">Renda Mensal</h3>
                <p className="text-2xl font-bold">R$ {salary.toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white p-4 rounded-lg">
                <h3 className="font-semibold">Total Alocado</h3>
                <p className="text-2xl font-bold">R$ {getTotalBudgeted().toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-r from-red-400 to-red-600 text-white p-4 rounded-lg">
                <h3 className="font-semibold">Total Gasto</h3>
                <p className="text-2xl font-bold">R$ {getTotalSpent().toFixed(2)}</p>
              </div>
              <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white p-4 rounded-lg">
                <h3 className="font-semibold">Disponível</h3>
                <p className="text-2xl font-bold">R$ {getUnallocated().toFixed(2)}</p>
              </div>
            </div>

            {/* Detailed Report */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4">Categoria</th>
                    <th className="text-right py-3 px-4">Orçamento</th>
                    <th className="text-right py-3 px-4">Gasto</th>
                    <th className="text-right py-3 px-4">Saldo</th>
                    <th className="text-right py-3 px-4">Uso %</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map(category => {
                    const spent = getCategorySpent(category.id);
                    const balance = getCategoryBalance(category.id);
                    const usage = category.budget > 0 ? (spent / category.budget) * 100 : 0;
                    
                    return (
                      <tr key={category.id} className="border-b border-gray-100">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                            {category.isSavings && <PiggyBank size={14} className="text-green-600" />}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold">R$ {category.budget.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">R$ {spent.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right font-semibold">R$ {balance.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-semibold ${usage > 100 ? 'text-red-600' : usage > 80 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {category.isSavings ? 'N/A' : `${usage.toFixed(1)}%`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceManager;