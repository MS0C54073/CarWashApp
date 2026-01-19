import { useState, useRef, useEffect } from 'react';
import './DriverSelector.css';

interface Driver {
    id: string;
    _id?: string;
    name: string;
    phone: string;
}

interface DriverSelectorProps {
    drivers: Driver[];
    value: string;
    onChange: (driverId: string) => void;
    placeholder?: string;
}

const DriverSelector: React.FC<DriverSelectorProps> = ({
    drivers,
    value,
    onChange,
    placeholder = 'Search for a driver...'
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Get selected driver name for display
    const selectedDriver = drivers?.find(d => (d.id || d._id) === value);
    const displayText = selectedDriver ? `${selectedDriver.name} - ${selectedDriver.phone}` : '';

    // Filter drivers based on search term
    const filteredDrivers = drivers?.filter(driver =>
        driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        driver.phone.includes(searchTerm)
    ) || [];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (driver: Driver) => {
        onChange(driver.id || driver._id || '');
        setIsOpen(false);
        setSearchTerm('');
    };

    const handleFocus = () => {
        setIsOpen(true);
        // Don't clear search term on every focus, only if it matched the display text
        if (!searchTerm) {
            setSearchTerm('');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    return (
        <div className="driver-selector" ref={wrapperRef}>
            <div className="driver-selector-input-wrapper">
                <input
                    type="text"
                    className="driver-selector-input"
                    value={isOpen ? searchTerm : displayText}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    placeholder={selectedDriver ? displayText : placeholder}
                    autoComplete="off"
                />
                <span className="driver-selector-arrow">▼</span>
            </div>

            {isOpen && (
                <div className="driver-selector-dropdown">
                    {filteredDrivers.length === 0 ? (
                        <div className="driver-selector-empty">
                            {searchTerm ? 'No drivers found' : 'No available drivers'}
                        </div>
                    ) : (
                        filteredDrivers.map((driver) => (
                            <div
                                key={driver.id || driver._id}
                                className={`driver-selector-option ${(driver.id || driver._id) === value ? 'selected' : ''
                                    }`}
                                onMouseDown={() => handleSelect(driver)}
                            >
                                <div className="driver-info">
                                    <span className="driver-name">{driver.name}</span>
                                    <span className="driver-phone">{driver.phone}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default DriverSelector;
