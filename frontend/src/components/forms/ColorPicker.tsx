import { useState } from 'react';
import AutocompleteSelect from './AutocompleteSelect';
import { carColors } from '../../data/carMakesModels';
import './ColorPicker.css';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

const ColorPicker = ({ label, value, onChange, required = false }: ColorPickerProps) => {
  const [showPicker, setShowPicker] = useState(false);

  // Common colors with hex values for visual display
  const commonColors = [
    { name: 'White', hex: '#FFFFFF' },
    { name: 'Black', hex: '#000000' },
    { name: 'Silver', hex: '#C0C0C0' },
    { name: 'Gray', hex: '#808080' },
    { name: 'Red', hex: '#FF0000' },
    { name: 'Blue', hex: '#0000FF' },
    { name: 'Green', hex: '#008000' },
    { name: 'Yellow', hex: '#FFFF00' },
    { name: 'Orange', hex: '#FFA500' },
    { name: 'Brown', hex: '#A52A2A' },
    { name: 'Beige', hex: '#F5F5DC' },
    { name: 'Gold', hex: '#FFD700' },
    { name: 'Purple', hex: '#800080' },
    { name: 'Pink', hex: '#FFC0CB' },
    { name: 'Maroon', hex: '#800000' },
    { name: 'Navy', hex: '#000080' },
  ];

  const getColorHex = (colorName: string): string => {
    const color = commonColors.find(c => c.name.toLowerCase() === colorName.toLowerCase());
    return color?.hex || '#CCCCCC';
  };

  return (
    <div className="color-picker-wrapper">
      <AutocompleteSelect
        label={label}
        value={value}
        options={carColors}
        onChange={onChange}
        placeholder="Search or select color..."
        required={required}
        searchable
        maxHeight="200px"
      />
      
      {value && (
        <div className="color-preview">
          <div 
            className="color-swatch" 
            style={{ backgroundColor: getColorHex(value) }}
            title={value}
          />
          <span className="color-name">{value}</span>
        </div>
      )}

      <div className="color-quick-pick">
        <p className="quick-pick-label">Quick Pick:</p>
        <div className="color-chips">
          {commonColors.map((color) => (
            <button
              key={color.name}
              type="button"
              className={`color-chip ${value === color.name ? 'selected' : ''}`}
              onClick={() => onChange(color.name)}
              title={color.name}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorPicker;
