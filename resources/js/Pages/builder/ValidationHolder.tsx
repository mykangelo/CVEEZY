import React from "react";

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
}

const ValidationHolder: React.FC<ValidationHolderProps> = ({ contacts, setContacts, errors }) => {
  const updateContact = (field: keyof typeof contacts, value: string) => {
    setContacts(prev => ({ ...prev, [field]: value }));
  };

  const [showAdditional, setShowAdditional] = React.useState(false);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Contacts</h2>
      <p className="text-gray-600 mb-6">Add your up-to-date contact information so employers and recruiters can easily reach you.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 mb-1">First name</label>
          <input 
            className={`w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-400 ${errors.firstName ? 'border-red-500' : ''}`}
            placeholder="Riley"
            value={contacts.firstName}
            onChange={e => updateContact('firstName', e.target.value)}
          />
          {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Last name</label>
          <input 
            className={`w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-400 ${errors.lastName ? 'border-red-500' : ''}`}
            placeholder="Taylor"
            value={contacts.lastName}
            onChange={e => updateContact('lastName', e.target.value)}
          />
          {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
        </div>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1">Desired job title</label>
        <input 
          className={`w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-400 ${errors.desiredJobTitle ? 'border-red-500' : ''}`}
          placeholder="Accountant"
          value={contacts.desiredJobTitle}
          onChange={e => updateContact('desiredJobTitle', e.target.value)}
        />
        {errors.desiredJobTitle && <p className="text-red-500 text-xs mt-1">{errors.desiredJobTitle}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-700 mb-1">Phone</label>
          <input 
            className={`w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-400 ${errors.phone ? 'border-red-500' : ''}`}
            placeholder="305-123-44444"
            value={contacts.phone}
            onChange={e => updateContact('phone', e.target.value)}
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>
        <div>
          <label className="block text-gray-700 mb-1">Email</label>
          <input 
            className={`w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-400 ${errors.email ? 'border-red-500' : ''}`}
            placeholder="e.g.mail@example.com"
            value={contacts.email}
            onChange={e => updateContact('email', e.target.value)}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
      </div>
      <div className="mb-4">
        <button
          type="button"
          onClick={() => setShowAdditional((s) => !s)}
          className="text-blue-500 hover:underline text-sm"
        >
          {showAdditional ? 'Hide additional information' : 'Additional information'}
        </button>
      </div>

      {showAdditional && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-gray-700 mb-1">Country</label>
            <input
              className="w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-400"
              placeholder="e.g. Philippines"
              value={contacts.country || ''}
              onChange={(e) => updateContact('country', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">City</label>
            <input
              className="w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-400"
              placeholder="e.g. Manila"
              value={contacts.city || ''}
              onChange={(e) => updateContact('city', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Address</label>
            <input
              className="w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-400"
              placeholder="Street, Building, etc."
              value={contacts.address || ''}
              onChange={(e) => updateContact('address', e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Post code</label>
            <input
              className="w-full border rounded-md p-3 focus:ring-2 focus:ring-blue-400"
              placeholder="e.g. 1000"
              value={contacts.postCode || ''}
              onChange={(e) => updateContact('postCode', e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationHolder; 