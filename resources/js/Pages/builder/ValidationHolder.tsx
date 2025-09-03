import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import "../../../css/app.css";
import "flag-icons/css/flag-icons.min.css";

// ValidationHolder component
interface ValidationHolderProps {
  contacts: {
    firstName: string;
    lastName: string;
    desiredJobTitle: string;
    phone: string;
    email: string;
    address?: string;
    city?: string;
    country?: string;
    postCode?: string;
  };
  setContacts: React.Dispatch<React.SetStateAction<{
    firstName: string;
    lastName: string;
    desiredJobTitle: string;
    phone: string;
    email: string;
    address?: string;
    city?: string;
    country?: string;
    postCode?: string;
  }>>;
  errors: Record<string, string>;

  onClearError?: (field: string) => void;
}

type PhoneCountry = 'US' | 'PH' | 'UK';

const COUNTRY_FORMATS: Record<PhoneCountry, { dialCode: string; mask: string; maxLength: number; name: string; flag: string }> = {
  US: { dialCode: '+1', mask: '+1 (###) ###-####', maxLength: 10, name: 'United States', flag: '🇺🇸' },
  PH: { dialCode: '+63', mask: '+63 (###) ###-####', maxLength: 10, name: 'Philippines', flag: '🇵🇭' },
  UK: { dialCode: '+44', mask: '+44 #### ######', maxLength: 10, name: 'United Kingdom', flag: '🇬🇧' },
};

const COUNTRY_PLACEHOLDERS: Record<PhoneCountry, string> = {
  US: '+1 (555) 123-4567',
  PH: '+63 (900) 123-4567',
  UK: '+44 7123 456789',
};

function applyMask(digits: string, mask: string): string {
  let dIndex = 0;
  let out = '';
  for (let i = 0; i < mask.length; i++) {
    const ch = mask[i];
    if (ch === '#') {
      if (dIndex < digits.length) {
        out += digits[dIndex++];
      } else {
        break;
      }
    } else {
      out += ch;
    }
  }
  return out;
}

function toPlaceholder(mask: string): string {
  return mask.replace(/#/g, '0');
}

const ValidationHolder: React.FC<ValidationHolderProps> = ({ contacts, setContacts, errors, onClearError }) => {
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>('US');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showCountryDropdown && !(event.target as Element).closest('.country-selector')) {
        setShowCountryDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCountryDropdown]);

  // Detect country by existing phone value (simple heuristic)
  useEffect(() => {
    const value = contacts.phone || '';
    if (value.startsWith('+63')) setPhoneCountry('PH');
    else if (value.startsWith('+44')) setPhoneCountry('UK');
    else if (value.startsWith('+1')) setPhoneCountry('US');
  }, []);

  const formatPhone = (raw: string, country: PhoneCountry): string => {
    // If input is empty or only contains non-digits, return empty string
    const digits = (raw.match(/\d+/g) || []).join('');
    if (digits.length === 0) {
      return '';
    }
    
    const { dialCode, mask } = COUNTRY_FORMATS[country];
    const dialDigits = dialCode.replace('+', '');
    
    // Remove dial code if it's already in the input
    let localDigits = digits;
    if (localDigits.startsWith(dialDigits)) {
      localDigits = localDigits.slice(dialDigits.length);
    }
    
    // If no local digits after removing dial code, return empty
    if (localDigits.length === 0) {
      return '';
    }
    
    // Apply mask to local digits
    const formattedLocal = applyMask(localDigits, mask);
    
    // Return formatted number with dial code
    return `${dialCode} ${formattedLocal.replace(/^\+\d+\s*/, '')}`;
  };

  const updateContact = (field: keyof typeof contacts, value: string) => {
    setContacts(prev => ({ ...prev, [field]: value }));
    
    // Clear the error for this field when user starts typing
    if (errors[field] && onClearError) {
      onClearError(field);
    }
  };


  
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Contacts</h2>
      <p className="text-gray-600 mb-6">Add your up-to-date contact information so employers and recruiters can easily reach you.</p>
      
      {/* Validation Error Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
            <h3 className="text-red-800 font-semibold">Please fix the following errors:</h3>
          </div>
          <ul className="text-red-700 text-sm space-y-1">
            {Object.entries(errors).map(([field, message]) => (
              <li key={field}>• {message}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 mb-1">First name</label>
          <input 
            className={`w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition-all duration-150 ease-in-out ${errors.firstName ? 'border-red-500' : 'border-slate-300'}`}
            placeholder="Riley"
            value={contacts.firstName}
            onChange={e => updateContact('firstName', e.target.value)}
          />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Last name</label>
          <input 
            className={`w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition-all duration-150 ease-in-out ${errors.lastName ? 'border-red-500' : 'border-slate-300'}`}
            placeholder="Taylor"
            value={contacts.lastName}
            onChange={e => updateContact('lastName', e.target.value)}
          />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>
      </div>
      {/* Phone and Email Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 mb-1">Phone number</label>
          


                      <div className="flex mt-1">
              <div className="flex-shrink-0 relative">
                {/* Custom Country Selector */}
                <div className="relative country-selector">
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    className="flex items-center justify-between w-20 h-[49px] px-2 bg-white border border-r-0 border-slate-300 rounded-l-md text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white cursor-pointer hover:bg-gray-50 transition-all duration-150 ease-in-out"
                  >
                    <span className={`fi fi-${phoneCountry === 'US' ? 'us' : phoneCountry === 'PH' ? 'ph' : 'gb'} text-lg`}></span>
                    <span className="text-xs text-gray-600 ml-1">
                      {phoneCountry === 'US' ? 'US' : phoneCountry === 'PH' ? 'PH' : 'UK'}
                    </span>
                    <svg className="w-4 h-4 ml-1 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showCountryDropdown && (
                    <div className="absolute top-full left-0 mt-1 w-24 bg-white border border-slate-300 rounded-lg shadow-lg z-10">
                      <div className="py-1">
                        {(['US', 'PH', 'UK'] as PhoneCountry[]).map((country) => (
                          <button
                            key={country}
                            type="button"
                            onClick={() => {
                              setPhoneCountry(country);
                              setShowCountryDropdown(false);
                            }}
                            className="w-full px-2 py-1.5 text-left text-sm hover:bg-gray-100 flex items-center justify-center gap-1"
                          >
                            <span className={`fi fi-${country === 'US' ? 'us' : country === 'PH' ? 'ph' : 'gb'} text-base`}></span>
                            <span className="text-xs text-gray-600">{country}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <input 
                type="tel"
                autoComplete="tel"
                className={`flex-1 md:max-w-[175px] border border-l-0 border-slate-300 rounded-r-md px-3 py-2 h-[49px] appearance-none bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition-all duration-150 ease-in-out ${errors.phone ? 'border-red-500' : ''} placeholder-gray-400 focus:placeholder-transparent text-gray-900`}
                maxLength={COUNTRY_FORMATS[phoneCountry].dialCode.length + 1 + COUNTRY_FORMATS[phoneCountry].maxLength}
                placeholder={COUNTRY_PLACEHOLDERS[phoneCountry]}
                value={contacts.phone}
              onChange={e => {
                const raw = e.target.value;
                const { dialCode, maxLength } = COUNTRY_FORMATS[phoneCountry];
                
                // If field is empty, keep it empty
                if (!raw || raw.trim() === '') {
                  updateContact('phone', '');
                  return;
                }
                
                // If it's just the dial code, keep it as is
                if (raw === dialCode || raw === `${dialCode} `) {
                  updateContact('phone', raw);
                  return;
                }
                
                // Ensure the dial code is always preserved
                if (!raw.startsWith(dialCode)) {
                  // If dial code was removed, restore it
                  updateContact('phone', `${dialCode} ${raw}`);
                  return;
                }
                
                // Check if the number exceeds the maximum length for this country
                const digits = raw.replace(/\D/g, '');
                const dialDigits = dialCode.replace(/\D/g, '');
                let localDigits = digits;
                
                // Remove dial code digits if they're at the start
                if (localDigits.startsWith(dialDigits)) {
                  localDigits = localDigits.slice(dialDigits.length);
                }
                
                // If local digits exceed max length, truncate the input
                if (localDigits.length > maxLength) {
                  const truncatedLocal = localDigits.slice(0, maxLength);
                  const truncatedInput = `${dialCode} ${truncatedLocal}`;
                  updateContact('phone', truncatedInput);
                  return;
                }
                
                // For any other input, just store it as-is without formatting
                updateContact('phone', raw);
              }}
              onFocus={(e) => {
                // Auto-insert country dial code if field is empty
                if (!contacts.phone || contacts.phone.trim() === '') {
                  const { dialCode } = COUNTRY_FORMATS[phoneCountry];
                  updateContact('phone', `${dialCode} `);
                  // Move cursor to end after the dial code
                  setTimeout(() => {
                    e.target.setSelectionRange(dialCode.length + 1, dialCode.length + 1);
                  }, 0);
                }
              }}
              onBlur={(e) => {
                // Clear field if only dial code remains
                const { dialCode } = COUNTRY_FORMATS[phoneCountry];
                if (contacts.phone === `${dialCode} ` || contacts.phone === dialCode) {
                  updateContact('phone', '');
                  return;
                }
                
                // Only format when user finishes typing (on blur)
                const raw = e.target.value;
                
                // Skip formatting if field is empty or just dial code
                if (!raw || raw === dialCode || raw === `${dialCode} `) {
                  return;
                }
                
                // Extract digits and check if we have a complete phone number
                const digits = raw.replace(/\D/g, '');
                const dialDigits = dialCode.replace(/\D/g, '');
                let localDigits = digits;
                
                // Remove dial code digits if they're at the start
                if (localDigits.startsWith(dialDigits)) {
                  localDigits = localDigits.slice(dialDigits.length);
                }
                
                // Only format if we have enough digits for a complete number
                if (localDigits.length >= 7) {
                  const formatted = formatPhone(raw, phoneCountry);
                  updateContact('phone', formatted);
                }
              }}
              onKeyDown={(e) => {
                const { dialCode } = COUNTRY_FORMATS[phoneCountry];
                const prefixLength = `${dialCode} `.length;
                const input = e.currentTarget;
                const selectionStart = input.selectionStart || 0;
                
                // Prevent deleting or moving cursor into the dial code prefix
                if (
                  (e.key === 'Backspace' && selectionStart <= prefixLength) ||
                  (e.key === 'Delete' && selectionStart < prefixLength) ||
                  (e.key === 'ArrowLeft' && selectionStart <= prefixLength)
                ) {
                  e.preventDefault();
                  // Move cursor to the safe position after the dial code
                  input.setSelectionRange(prefixLength, prefixLength);
                }
              }}
            />
          </div>
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input 
            className={`w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition-all duration-150 ease-in-out ${errors.email ? 'border-red-500' : 'border-slate-300'}`}
            placeholder="e.g.mail@example.com"
            value={contacts.email}
            onChange={e => updateContact('email', e.target.value)}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>

      {/* Desired Job Title */}
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Desired job title</label>
        <input 
          className={`w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition-all duration-150 ease-in-out ${errors.desiredJobTitle ? 'border-red-500' : 'border-slate-300'}`}
          placeholder="Computer Engineer"
          value={contacts.desiredJobTitle}
          onChange={e => updateContact('desiredJobTitle', e.target.value)}
        />
        {errors.desiredJobTitle && <p className="text-red-500 text-xs mt-1">{errors.desiredJobTitle}</p>}
      </div>
      
      {/* Additional Information Dropdown */}
      <div className="mb-4">
        <button
          onClick={() => setShowAdditionalInfo(!showAdditionalInfo)}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-700 transition-colors"
        >
          <span className="text-sm font-medium">Additional Information</span>
          {showAdditionalInfo ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>
        
        {/* Dropdown Content */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
          showAdditionalInfo ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}>
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
            <div>
              <label className="block text-gray-700 mb-1">Address</label>
              <input 
                className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition-all duration-150 ease-in-out border-slate-300"
                placeholder="123 Main Street"
                value={contacts.address || ''}
                onChange={e => updateContact('address', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">City</label>
                <input 
                  className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition-all duration-150 ease-in-out border-slate-300"
                  placeholder="New York"
                  value={contacts.city || ''}
                  onChange={e => updateContact('city', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Country</label>
                <input 
                  className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition-all duration-150 ease-in-out border-slate-300"
                  placeholder="United States"
                  value={contacts.country || ''}
                  onChange={e => updateContact('country', e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Postal Code</label>
              <input 
                className="w-full border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white transition-all duration-150 ease-in-out border-slate-300"
                placeholder="10001"
                value={contacts.postCode || ''}
                onChange={e => updateContact('postCode', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValidationHolder; 