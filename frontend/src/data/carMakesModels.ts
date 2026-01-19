// Comprehensive car makes and models database
export const carMakesModels: Record<string, string[]> = {
  'Toyota': ['Corolla', 'Camry', 'RAV4', 'Highlander', 'Land Cruiser', 'Prado', 'Hilux', 'Fortuner', 'Yaris', 'Auris', 'Avensis', 'Prius', 'C-HR', 'Vitz', 'Passo', 'Vios', 'Innova', 'Sienna', 'Tacoma', 'Tundra', 'Sequoia', '4Runner', 'Matrix', 'Celica', 'Supra'],
  'Honda': ['Civic', 'Accord', 'CR-V', 'Pilot', 'Odyssey', 'Fit', 'HR-V', 'Passport', 'Ridgeline', 'Insight', 'Clarity', 'Prelude', 'S2000', 'Element', 'Crosstour'],
  'Nissan': ['Altima', 'Sentra', 'Maxima', 'Rogue', 'Pathfinder', 'Armada', 'Murano', 'Frontier', 'Titan', 'Versa', 'Kicks', 'Leaf', '370Z', 'GT-R', 'Juke', 'X-Trail', 'Navara', 'Patrol'],
  'Ford': ['F-150', 'F-250', 'F-350', 'Mustang', 'Explorer', 'Escape', 'Edge', 'Expedition', 'Ranger', 'Bronco', 'Focus', 'Fusion', 'Taurus', 'EcoSport', 'Everest', 'Raptor'],
  'Chevrolet': ['Silverado', 'Tahoe', 'Suburban', 'Equinox', 'Traverse', 'Malibu', 'Impala', 'Cruze', 'Camaro', 'Corvette', 'Trailblazer', 'Blazer', 'Colorado', 'Avalanche'],
  'BMW': ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', 'Z4', 'M3', 'M5', 'i3', 'i8', '2 Series', '4 Series', '6 Series', '8 Series', 'X2', 'X4', 'X6'],
  'Mercedes-Benz': ['C-Class', 'E-Class', 'S-Class', 'A-Class', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'CLA', 'CLS', 'SL', 'AMG GT', 'G-Class', 'Sprinter'],
  'Audi': ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT', 'R8', 'e-tron', 'S3', 'S4', 'S5', 'RS3', 'RS4', 'RS5'],
  'Volkswagen': ['Golf', 'Jetta', 'Passat', 'Tiguan', 'Atlas', 'Arteon', 'Beetle', 'Polo', 'Touareg', 'Amarok', 'T-Cross', 'T-Roc', 'ID.3', 'ID.4'],
  'Hyundai': ['Elantra', 'Sonata', 'Accent', 'Tucson', 'Santa Fe', 'Palisade', 'Kona', 'Venue', 'Veloster', 'Genesis', 'i10', 'i20', 'i30', 'Grandeur', 'Azera'],
  'Kia': ['Rio', 'Forte', 'Optima', 'Sorento', 'Sportage', 'Telluride', 'Soul', 'Stinger', 'Carnival', 'Seltos', 'Niro', 'EV6', 'Picanto', 'Cerato'],
  'Mazda': ['Mazda3', 'Mazda6', 'CX-3', 'CX-5', 'CX-9', 'MX-5', 'CX-30', 'BT-50', 'Tribute', 'Protege'],
  'Subaru': ['Impreza', 'Legacy', 'Outback', 'Forester', 'Ascent', 'BRZ', 'WRX', 'Crosstrek'],
  'Lexus': ['ES', 'IS', 'GS', 'LS', 'RX', 'NX', 'GX', 'LX', 'UX', 'LC', 'RC', 'LFA'],
  'Volvo': ['S60', 'S90', 'V60', 'V90', 'XC40', 'XC60', 'XC90', 'C30', 'C70'],
  'Jeep': ['Wrangler', 'Grand Cherokee', 'Cherokee', 'Compass', 'Renegade', 'Gladiator', 'Patriot', 'Commander'],
  'Dodge': ['Challenger', 'Charger', 'Durango', 'Journey', 'Grand Caravan', 'Ram 1500', 'Viper'],
  'Chrysler': ['300', 'Pacifica', 'Voyager', 'Aspen'],
  'GMC': ['Sierra', 'Yukon', 'Acadia', 'Terrain', 'Canyon', 'Envoy'],
  'Ram': ['1500', '2500', '3500', 'ProMaster', 'ProMaster City'],
  'Mitsubishi': ['Outlander', 'Eclipse Cross', 'Mirage', 'Lancer', 'Pajero', 'Montero', 'Triton', 'ASX'],
  'Suzuki': ['Swift', 'Vitara', 'SX4', 'Grand Vitara', 'Jimny', 'Baleno', 'Celerio', 'Ertiga', 'XL7'],
  'Isuzu': ['D-Max', 'MU-X', 'Trooper', 'Rodeo'],
  'Land Rover': ['Range Rover', 'Range Rover Sport', 'Range Rover Evoque', 'Discovery', 'Defender', 'Velar'],
  'Jaguar': ['XE', 'XF', 'XJ', 'F-Pace', 'E-Pace', 'I-Pace', 'F-Type'],
  'Porsche': ['911', 'Cayenne', 'Macan', 'Panamera', 'Boxster', 'Cayman', 'Taycan'],
  'Tesla': ['Model S', 'Model 3', 'Model X', 'Model Y', 'Roadster', 'Cybertruck'],
  'Peugeot': ['208', '308', '508', '2008', '3008', '5008', 'Partner'],
  'Renault': ['Clio', 'Megane', 'Kadjar', 'Koleos', 'Duster', 'Captur', 'Kwid'],
  'Opel': ['Corsa', 'Astra', 'Insignia', 'Crossland', 'Grandland'],
  'Fiat': ['500', 'Panda', 'Tipo', 'Punto', 'Doblo', 'Ducato'],
  'Alfa Romeo': ['Giulia', 'Stelvio', '4C', 'Giulietta'],
  'Maserati': ['Ghibli', 'Quattroporte', 'Levante', 'GranTurismo'],
  'Bentley': ['Continental', 'Flying Spur', 'Bentayga'],
  'Rolls-Royce': ['Ghost', 'Phantom', 'Wraith', 'Dawn', 'Cullinan'],
  'Lamborghini': ['Huracan', 'Aventador', 'Urus'],
  'Ferrari': ['488', 'F8', 'Roma', 'Portofino', 'SF90'],
  'McLaren': ['720S', '570S', 'GT', 'Artura'],
  'Aston Martin': ['DB11', 'Vantage', 'DBS', 'DBX'],
  'Mini': ['Cooper', 'Countryman', 'Clubman', 'Paceman'],
  'Smart': ['Fortwo', 'Forfour'],
  'Infiniti': ['Q50', 'Q60', 'Q70', 'QX50', 'QX60', 'QX80'],
  'Acura': ['ILX', 'TLX', 'RLX', 'RDX', 'MDX', 'NSX'],
  'Cadillac': ['ATS', 'CTS', 'XTS', 'Escalade', 'XT4', 'XT5', 'XT6'],
  'Lincoln': ['MKZ', 'Continental', 'Navigator', 'Aviator', 'Corsair'],
  'Buick': ['Encore', 'Envision', 'Enclave', 'Regal', 'LaCrosse'],
  'Genesis': ['G70', 'G80', 'G90', 'GV70', 'GV80'],
  'Other': ['Other Make']
};

export const carColors = [
  'White', 'Black', 'Silver', 'Gray', 'Grey', 'Red', 'Blue', 'Green', 'Yellow', 'Orange',
  'Brown', 'Beige', 'Gold', 'Bronze', 'Purple', 'Pink', 'Maroon', 'Navy', 'Teal', 'Turquoise',
  'Cream', 'Ivory', 'Tan', 'Champagne', 'Pearl White', 'Metallic Silver', 'Metallic Gray',
  'Charcoal', 'Gunmetal', 'Titanium', 'Platinum', 'Copper', 'Burgundy', 'Magenta', 'Lime',
  'Olive', 'Forest Green', 'Sky Blue', 'Royal Blue', 'Electric Blue', 'Midnight Blue',
  'Crimson', 'Scarlet', 'Coral', 'Salmon', 'Peach', 'Amber', 'Mustard', 'Khaki'
];

export const getModelsForMake = (make: string): string[] => {
  return carMakesModels[make] || [];
};

export const getAllMakes = (): string[] => {
  return Object.keys(carMakesModels);
};
