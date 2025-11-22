import { useState, useRef, useEffect } from 'react';
import { type CategoryWithChildren } from '~/server/api/types';

interface ThreadMenuProps {
  threadId: number;
  currentCategoryId: number;
  categories: CategoryWithChildren[];
  onDelete: () => void;
  onMove: (targetCategoryId: number) => void;
  isDeleting: boolean;
  isMoving: boolean;
}

export const ThreadMenu: React.FC<ThreadMenuProps> = ({
  threadId: _threadId,
  currentCategoryId,
  categories,
  onDelete,
  onMove,
  isDeleting,
  isMoving,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter out root category and current category from move options
  const availableCategories = categories.filter(
    (cat) => cat.id !== currentCategoryId && cat.parentCategoryId !== null
  );

  const handleMoveClick = () => {
    setIsOpen(false);
    setShowMoveModal(true);
  };

  const handleMoveConfirm = () => {
    if (selectedCategoryId) {
      onMove(selectedCategoryId);
      setShowMoveModal(false);
      setSelectedCategoryId(null);
    }
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Hamburger button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="ml-2 rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white"
        aria-label="Thread menu"
        data-testid="thread-menu-button"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="ring-opacity-5 absolute right-0 z-10 mt-2 w-48 rounded-md bg-gray-800 shadow-lg ring-1 ring-black">
          <div className="py-1" role="menu">
            <button
              type="button"
              onClick={handleMoveClick}
              className="block w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
              role="menuitem"
              data-testid="move-thread-button"
            >
              Siirrä lanka
            </button>
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                onDelete();
              }}
              disabled={isDeleting}
              className="block w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 hover:text-red-300"
              role="menuitem"
              data-testid="delete-thread-button"
            >
              {isDeleting ? 'Poistetaan...' : 'Poista lanka'}
            </button>
          </div>
        </div>
      )}

      {/* Move thread modal */}
      {showMoveModal && (
        <div className="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-full max-w-md rounded-lg bg-gray-800 p-6 shadow-xl">
            <h3 className="mb-4 text-lg font-semibold text-white">
              Siirrä lanka
            </h3>

            <div className="mb-4">
              <label
                htmlFor="category-select"
                className="mb-2 block text-sm text-gray-300"
              >
                Valitse kohde kategoria:
              </label>
              <select
                id="category-select"
                value={selectedCategoryId || ''}
                onChange={(e) => setSelectedCategoryId(Number(e.target.value))}
                className="w-full rounded-md border border-gray-600 bg-gray-700 px-3 py-2 text-white focus:border-purple-500 focus:outline-none"
                data-testid="category-select"
              >
                <option value="">Valitse kategoria...</option>
                {availableCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setShowMoveModal(false);
                  setSelectedCategoryId(null);
                }}
                className="rounded-md px-4 py-2 text-gray-300 hover:bg-gray-700"
              >
                Peruuta
              </button>
              <button
                type="button"
                onClick={handleMoveConfirm}
                disabled={!selectedCategoryId || isMoving}
                className="rounded-md bg-purple-600 px-4 py-2 text-white hover:bg-purple-700 disabled:opacity-50"
                data-testid="confirm-move-button"
              >
                {isMoving ? 'Siirretään...' : 'Siirrä'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
