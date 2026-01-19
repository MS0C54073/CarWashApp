import { useState, useRef, useEffect } from 'react';
import './AutocompleteSelect.css';

interface AutocompleteSelectProps {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  searchable?: boolean;
  maxHeight?: string;
}

const AutocompleteSelect = ({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select or type...',
  required = false,
  searchable = true,
  maxHeight = '300px',
}: AutocompleteSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filter options based on search term
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll highlighted item into view
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
    
    // If exact match found, select it
    const exactMatch = options.find(opt => opt.toLowerCase() === newValue.toLowerCase());
    if (exactMatch) {
      onChange(exactMatch);
    } else {
      onChange(newValue);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (!value) {
      setSearchTerm('');
    }
  };

  const handleSelect = (option: string) => {
    onChange(option);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => 
        prev < filteredOptions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      handleSelect(filteredOptions[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm('');
      setHighlightedIndex(-1);
    }
  };

  const displayValue = isOpen && searchable ? searchTerm : value;

  return (
    <div className="autocomplete-select" ref={containerRef}>
      <label className="autocomplete-label">
        {label} {required && <span className="required">*</span>}
      </label>
      <div className="autocomplete-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          className="autocomplete-input"
          value={displayValue}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />
        <button
          type="button"
          className="autocomplete-toggle"
          onClick={() => {
            setIsOpen(!isOpen);
            if (!isOpen) {
              inputRef.current?.focus();
            }
          }}
          tabIndex={-1}
        >
          {isOpen ? '▲' : '▼'}
        </button>
      </div>
      
      {isOpen && (
        <ul 
          className="autocomplete-dropdown"
          ref={listRef}
          style={{ maxHeight }}
        >
          {filteredOptions.length === 0 ? (
            <li className="autocomplete-no-results">No results found</li>
          ) : (
            filteredOptions.map((option, index) => (
              <li
                key={option}
                className={`autocomplete-option ${
                  index === highlightedIndex ? 'highlighted' : ''
                } ${option === value ? 'selected' : ''}`}
                onClick={() => handleSelect(option)}
                onMouseEnter={() => setHighlightedIndex(index)}
              >
                {option}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default AutocompleteSelect;
