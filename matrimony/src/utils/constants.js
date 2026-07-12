// src/utils/constants.js
export const LOCATION_OPTIONS = [
  { value: 'Mumbai, India', label: 'Mumbai, India' },
  { value: 'Delhi, India', label: 'Delhi, India' },
  { value: 'Bangalore, India', label: 'Bangalore, India' },
  { value: 'Hyderabad, India', label: 'Hyderabad, India' },
  { value: 'Ahmedabad, India', label: 'Ahmedabad, India' },
  { value: 'Chennai, India', label: 'Chennai, India' },
  { value: 'Kolkata, India', label: 'Kolkata, India' },
  { value: 'Surat, India', label: 'Surat, India' },
  { value: 'Pune, India', label: 'Pune, India' },
  { value: 'Jaipur, India', label: 'Jaipur, India' },
  { value: 'NRI - USA', label: 'NRI - USA' },
  { value: 'NRI - UK', label: 'NRI - UK' },
  { value: 'NRI - Canada', label: 'NRI - Canada' },
  { value: 'NRI - Australia', label: 'NRI - Australia' },
  { value: 'NRI - UAE', label: 'NRI - UAE' },
  { value: 'NRI - Germany', label: 'NRI - Germany' },
  { value: 'NRI - Japan', label: 'NRI - Japan' },
  { value: 'Other', label: 'Other' }
];

export const CAST_OPTIONS = [
  { value: 'Brahmin', label: 'Brahmin' },
  { value: 'Vaishnav', label: 'Vaishnav' },
  { value: 'Jain', label: 'Jain' },
  { value: 'Rajput', label: 'Rajput' },
  { value: 'Maratha', label: 'Maratha' },
  { value: 'Other', label: 'Other' }
];

export const generateHeightOptions = () => {
    const heights = [];
    for (let feet = 4; feet <= 7; feet++) {
        for (let inches = 0; inches <= 11; inches++) {
            if (feet === 7 && inches > 0) break;
            const str = `${feet}'${inches}"`;
            heights.push({ value: str, label: str });
        }
    }
    return heights;
};

export const FILTER_LOCATION_OPTIONS = [
  { value: 'Any', label: 'Anywhere' },
  ...LOCATION_OPTIONS
];

export const FILTER_CAST_OPTIONS = [
  { value: 'Any', label: 'Any Community' },
  ...CAST_OPTIONS
];