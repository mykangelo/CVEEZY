import React, { useState, useRef, useEffect } from 'react';
import { Check, X, Edit3 } from 'lucide-react';

interface InlineEditProps {
    value: string;
    onSave: (newValue: string) => Promise<boolean>;
    onCancel?: () => void;
    placeholder?: string;
    className?: string;
    maxLength?: number;
    validation?: (value: string) => string | null;
    disabled?: boolean;
    triggerMode?: 'doubleClick' | 'icon';
}

export default function InlineEdit({
    value,
    onSave,
    onCancel,
    placeholder = "Enter text...",
    className = "",
    maxLength = 255,
    validation,
    disabled = false,
    triggerMode = 'doubleClick'
}: InlineEditProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(value);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setEditValue(value);
    }, [value]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleEdit = () => {
        if (disabled) return;
        setIsEditing(true);
        setError(null);
    };

    const handleSave = async () => {
        const trimmedValue = editValue.trim();
        
        // Validation
        if (validation) {
            const validationError = validation(trimmedValue);
            if (validationError) {
                setError(validationError);
                return;
            }
        }

        if (trimmedValue === value.trim()) {
            // No change, just cancel
            handleCancel();
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const success = await onSave(trimmedValue);
            if (success) {
                setIsEditing(false);
            } else {
                setError('Failed to save changes');
            }
        } catch (error) {
            setError('An error occurred while saving');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setEditValue(value);
        setIsEditing(false);
        setError(null);
        if (onCancel) {
            onCancel();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            handleCancel();
        }
    };

    if (isEditing) {
        return (
            <div className="inline-flex items-center space-x-1">
                <div className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={handleSave}
                        maxLength={maxLength}
                        className={`
                            bg-white border border-blue-300 rounded px-2 py-1 text-sm
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''}
                        `}
                        disabled={isSaving}
                    />
                    {error && (
                        <div className="absolute top-full left-0 mt-1 text-xs text-red-600 whitespace-nowrap">
                            {error}
                        </div>
                    )}
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="text-green-600 hover:text-green-800 disabled:opacity-50"
                    title="Save"
                >
                    <Check className="h-4 w-4" />
                </button>
                <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="text-red-600 hover:text-red-800 disabled:opacity-50"
                    title="Cancel"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
        );
    }

    if (triggerMode === 'icon') {
        return (
            <div className={`inline-flex items-center group ${className}`}>
                <span className="select-none">
                    {value || placeholder}
                </span>
                {!disabled && (
                    <button
                        onClick={handleEdit}
                        className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors rounded"
                        title="Rename"
                    >
                        <Edit3 className="h-4 w-4" />
                    </button>
                )}
            </div>
        );
    }

    // Default double-click mode
    return (
        <div 
            className={`
                inline-flex items-center group cursor-pointer
                ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:text-blue-600'}
                ${className}
            `}
            onDoubleClick={handleEdit}
            title={disabled ? 'Editing disabled' : 'Double-click to edit'}
        >
            <span className="select-none">
                {value || placeholder}
            </span>
            {!disabled && (
                <Edit3 className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />
            )}
        </div>
    );
}
