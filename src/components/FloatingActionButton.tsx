import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Plus, X, Receipt, PieChart, Tag, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router';
import { AddTransaction } from './AddTransaction';
import { AddCategory } from './AddCategory';
import { AddAccount } from './AddAccount';

export function FloatingActionButton() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Draggable state
  const [position, setPosition] = useState({ x: 16, y: 96 }); // Default: right-4 (16px), bottom-24 (96px)
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const buttonRef = useRef<HTMLDivElement>(null);

  const [isAddTransactionModalOpen, setIsAddTransactionModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

  const menuItems = [
    { label: 'Add Transaction', icon: Receipt, action: () => setIsAddTransactionModalOpen(true) },
    { label: 'Add Budget', icon: PieChart, path: '/dashboard/budgets' },
    { label: 'Add Category', icon: Tag, action: () => setIsAddCategoryModalOpen(true) },
    { label: 'Add Account', icon: Wallet, action: () => setIsAddAccountModalOpen(true) },
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
      <AddTransaction
        isOpen={isAddTransactionModalOpen}
        onClose={() => setIsAddTransactionModalOpen(false)}
        onSuccess={() => {
          console.log('Transaction added successfully from FAB');
        }}
      />

      {/* Add Category Modal */}
      <AddCategory
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onSuccess={() => {
          console.log('Category added successfully from FAB');
        }}
      />

      {/* Add Account Modal */}
      <AddAccount
        isOpen={isAddAccountModalOpen}
        onClose={() => setIsAddAccountModalOpen(false)}
        onSuccess={() => {
          console.log('Account added successfully from FAB');
        }}
      />
    </>
  );
}
