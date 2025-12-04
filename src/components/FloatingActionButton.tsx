import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Plus, X, Receipt, PieChart, Tag, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router';
import { AddTransaction } from './AddTransaction';

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Draggable state
  const [position, setPosition] = useState({ x: 16, y: 96 }); // Default: right-4 (16px), bottom-24 (96px)
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);

  const menuItems = [
    { label: 'Add Transaction', icon: Receipt, action: () => setIsAddTransactionModalOpen(true) },
    { label: 'Add Budget', icon: PieChart, path: '/dashboard/budgets' },
    { label: 'Add Category', icon: Tag, action: () => setIsDialogOpen(true) },
    { label: 'Add Account', icon: Wallet, action: () => setIsAccountDialogOpen(true) },
  ];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    color: '#FF6B6B',
    type: 'expense' as 'expense' | 'income',
  });

  const [accountFormData, setAccountFormData] = useState({
    name: '',
    type: 'Bank' as 'Bank' | 'Cash' | 'Credit Card',
    balance: '',
  });

  const colorOptions = [
    '#FF6B6B',
    '#F38181',
    '#AA96DA',
    '#FFA07A',
    '#95E1D3',
    '#4ECDC4',
    '#6BCF7F',
    '#5BC0DE',
    '#FFB6B9',
    '#FEC8D8',
  ];

  // Calculate menu position based on button position
  // Note: position.x = distance from RIGHT edge, position.y = distance from BOTTOM edge
  const menuPosition = useMemo(() => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const buttonSize = 56;
    const menuHeight = menuItems.length * 56; // Approximate menu height
    
    // Calculate actual distances from edges
    // position.x is distance from right, so left distance = windowWidth - position.x - buttonSize
    const distanceFromLeft = windowWidth - position.x - buttonSize;
    const distanceFromTop = windowHeight - position.y - buttonSize;
    const distanceFromBottom = position.y;
    
    // Determine horizontal: where should menu EXTEND to (not where button is)
    // If button is on left side (distanceFromLeft < half screen), menu should extend RIGHT
    // If button is on right side, menu should extend LEFT
    const menuExtendsRight = distanceFromLeft < windowWidth / 2;
    
    // Determine vertical: where should menu appear
    // If button is near BOTTOM (small distanceFromBottom), show menu ABOVE
    // If button is near TOP (small distanceFromTop), show menu BELOW
    // Use distanceFromTop to decide - if not enough space above, show below
    const showAbove = distanceFromTop > menuHeight + 20;
    
    return {
      extendsRight: menuExtendsRight, // true = menu extends to the right of button
      showAbove: showAbove,           // true = menu appears above button
    };
  }, [position, menuItems.length]);

  // Handle drag start
  const handleDragStart = (clientX: number, clientY: number) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const offsetY = clientY - rect.top;

    setDragOffset({ x: offsetX, y: offsetY });
    setIsDragging(true);
  };

  // Handle drag move
  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging) return;

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const buttonSize = 56; // 14 * 4 = 56px (h-14 w-14)

    // Calculate new position from right and bottom
    let newX = windowWidth - clientX - (buttonSize - dragOffset.x);
    let newY = windowHeight - clientY - (buttonSize - dragOffset.y);

    // Constrain to window bounds
    newX = Math.max(16, Math.min(newX, windowWidth - buttonSize - 16));
    newY = Math.max(16, Math.min(newY, windowHeight - buttonSize - 16));

    setPosition({ x: newX, y: newY });
  };

  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // Mouse events
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: MouseEvent) => {
    handleDragMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    handleDragEnd();
  };

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (touch) handleDragStart(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
    const touch = e.touches[0];
    if (touch) handleDragMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    handleDragEnd();
  };

  // Add/remove event listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isDragging]);

  const handleItemClick = useCallback(
    (item: (typeof menuItems)[0]) => {
      setIsOpen(false);
      if (item.path) {
        navigate(item.path);
      } else if (item.action) {
        item.action();
      }
    },
    [navigate]
  );

  const handleButtonClick = useCallback(() => {
    // Only toggle menu if not dragging
    if (!isDragging) {
      setIsOpen(!isOpen);
    }
  }, [isDragging, isOpen]);

  const handleSubmitCategory = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.name.trim()) return;

      // Here you would typically save the category
      alert(`Category "${formData.name}" created successfully!`);

      // Reset form and close dialog
      setFormData({ name: '', color: '#FF6B6B', type: 'expense' });
      setIsDialogOpen(false);
    },
    [formData]
  );

  const handleSubmitAccount = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!accountFormData.name.trim()) return;

      // Here you would typically save the account
      alert(`Account "${accountFormData.name}" created successfully!`);

      // Reset form and close dialog
      setAccountFormData({ name: '', type: 'Bank', balance: '' });
      setIsAccountDialogOpen(false);
    },
    [accountFormData]
  );

  return (
    <>
      {/* Floating Action Button - Only on mobile/tablet */}
      <div
        ref={buttonRef}
        className="fixed z-40 lg:hidden"
        style={{
          right: `${position.x}px`,
          bottom: `${position.y}px`,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
      >
        {/* Menu Items - Dynamically positioned */}
        {isOpen && (
          <div 
            className={`absolute space-y-2 min-w-[200px] ${
              menuPosition.showAbove ? 'bottom-16 mb-2' : 'top-16 mt-2'
            } ${
              menuPosition.extendsRight ? 'left-0' : 'right-0'
            }`}
          >
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={index}
                  onClick={() => handleItemClick(item)}
                  className="w-full h-12 bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 rounded-[14px] shadow-lg flex items-center gap-3 px-4 hover:bg-[#F3F3F5] dark:hover:bg-[#27272A] transition-colors"
                >
                  <Icon className="w-5 h-5 text-[#0A0A0A] dark:text-white" />
                  <span className="text-sm text-[#0A0A0A] dark:text-white">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Main FAB Button */}
        <button
          onClick={handleButtonClick}
          onMouseDown={handleMouseDown}
          onTouchStart={handleTouchStart}
          className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all touch-none select-none ${
            isOpen
              ? 'bg-[#717182] dark:bg-[#27272A] rotate-45'
              : 'bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] shadow-[#6366F1]/30'
          }`}
        >
          {isOpen ? <X className="w-6 h-6 text-white" /> : <Plus className="w-6 h-6 text-white" />}
        </button>
      </div>

      {/* Add Transaction Modal */}
      {isAddTransactionModalOpen && (
        <AddTransaction
          isOpen={isAddTransactionModalOpen}
          onClose={() => setIsAddTransactionModalOpen(false)}
          onSuccess={() => {
            console.log('Transaction added successfully from FAB');
          }}
        />
      )}

      {/* Add Category Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-[#18181B] border dark:border-white/10 rounded-[14px] w-full max-w-md p-6">
            {/* Dialog Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base text-[#0A0A0A] dark:text-white">Add New Category</h3>
              <button
                onClick={() => setIsDialogOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A]"
              >
                <X className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
              </button>
            </div>

            {/* Dialog Form */}
            <form onSubmit={handleSubmitCategory} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Groceries"
                  className="w-full h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-lg text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A]"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                  Type *
                </label>
                <div className="bg-[#ECECF0] dark:bg-[#27272A] rounded-[14px] p-1 flex">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'expense' })}
                    className={`flex-1 h-8 rounded-[14px] text-sm ${
                      formData.type === 'expense'
                        ? 'bg-white dark:bg-[#18181B] text-[#0A0A0A] dark:text-white shadow-sm'
                        : 'text-[#0A0A0A] dark:text-[#A1A1AA]'
                    }`}
                  >
                    Expense
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, type: 'income' })}
                    className={`flex-1 h-8 rounded-[14px] text-sm ${
                      formData.type === 'income'
                        ? 'bg-white dark:bg-[#18181B] text-[#0A0A0A] dark:text-white shadow-sm'
                        : 'text-[#0A0A0A] dark:text-[#A1A1AA]'
                    }`}
                  >
                    Income
                  </button>
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                  Color *
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {colorOptions.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-full aspect-square rounded-lg ${
                        formData.color === color
                          ? 'ring-2 ring-[#6366F1] dark:ring-[#A78BFA] ring-offset-2 dark:ring-offset-[#18181B]'
                          : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1 h-9 bg-white dark:bg-[#27272A] border border-black/10 dark:border-white/10 text-[#0A0A0A] dark:text-white text-sm rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#18181B] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-lg shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 hover:opacity-90 transition-opacity"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Account Dialog */}
      {isAccountDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70">
          <div className="bg-white dark:bg-[#18181B] border dark:border-white/10 rounded-[14px] w-full max-w-md p-6">
            {/* Dialog Header */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base text-[#0A0A0A] dark:text-white">Add New Account</h3>
              <button
                onClick={() => setIsAccountDialogOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#F3F3F5] dark:hover:bg-[#27272A]"
              >
                <X className="w-4 h-4 text-[#0A0A0A] dark:text-white" />
              </button>
            </div>

            {/* Dialog Form */}
            <form onSubmit={handleSubmitAccount} className="space-y-4">
              {/* Account Name */}
              <div>
                <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                  Account Name *
                </label>
                <input
                  type="text"
                  value={accountFormData.name}
                  onChange={(e) => setAccountFormData({ ...accountFormData, name: e.target.value })}
                  placeholder="e.g. Main Bank"
                  className="w-full h-9 px-3 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-lg text-sm text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A]"
                  required
                />
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                  Type *
                </label>
                <div className="bg-[#ECECF0] dark:bg-[#27272A] rounded-[14px] p-1 flex">
                  <button
                    type="button"
                    onClick={() => setAccountFormData({ ...accountFormData, type: 'Bank' })}
                    className={`flex-1 h-8 rounded-[14px] text-sm ${
                      accountFormData.type === 'Bank'
                        ? 'bg-white dark:bg-[#18181B] text-[#0A0A0A] dark:text-white shadow-sm'
                        : 'text-[#0A0A0A] dark:text-[#A1A1AA]'
                    }`}
                  >
                    Bank
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountFormData({ ...accountFormData, type: 'Cash' })}
                    className={`flex-1 h-8 rounded-[14px] text-sm ${
                      accountFormData.type === 'Cash'
                        ? 'bg-white dark:bg-[#18181B] text-[#0A0A0A] dark:text-white shadow-sm'
                        : 'text-[#0A0A0A] dark:text-[#A1A1AA]'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountFormData({ ...accountFormData, type: 'Credit Card' })}
                    className={`flex-1 h-8 rounded-[14px] text-sm ${
                      accountFormData.type === 'Credit Card'
                        ? 'bg-white dark:bg-[#18181B] text-[#0A0A0A] dark:text-white shadow-sm'
                        : 'text-[#0A0A0A] dark:text-[#A1A1AA]'
                    }`}
                  >
                    Card
                  </button>
                </div>
              </div>

              {/* Initial Balance */}
              <div>
                <label className="block text-sm leading-[14px] text-[#0A0A0A] dark:text-white mb-2">
                  Initial Balance *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-base text-[#717182] dark:text-[#A1A1AA]">
                    $
                  </span>
                  <input
                    type="number"
                    value={accountFormData.balance}
                    onChange={(e) =>
                      setAccountFormData({ ...accountFormData, balance: e.target.value })
                    }
                    placeholder="0.00"
                    step="0.01"
                    className="w-full h-9 pl-7 pr-3 bg-[#F3F3F5] dark:bg-[#27272A] border border-transparent dark:border-white/10 rounded-lg text-base text-[#0A0A0A] dark:text-white placeholder:text-[#717182] dark:placeholder:text-[#71717A]"
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAccountDialogOpen(false)}
                  className="flex-1 h-9 bg-white dark:bg-[#27272A] border border-black/10 dark:border-white/10 text-[#0A0A0A] dark:text-white text-sm rounded-lg hover:bg-[#F9FAFB] dark:hover:bg-[#18181B] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-9 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white text-sm rounded-lg shadow-lg shadow-[#6366F1]/20 dark:shadow-[#6366F1]/30 hover:opacity-90 transition-opacity"
                >
                  Add Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
