'use client';

import { useState } from 'react';

interface DeleteConfirmModalProps {
    title: string;
    message: string;
    itemName: string;
    hasChildren?: boolean;
    childrenCount?: number;
    childrenType?: string;
    otherOptions?: { id: string; name: string }[];
    onConfirm: (shouldDeleteChildren?: boolean, moveToId?: string) => void;
    onCancel: () => void;
}

export default function DeleteConfirmModal({
    title,
    message,
    itemName,
    hasChildren = false,
    childrenCount = 0,
    childrenType = 'items',
    otherOptions = [],
    onConfirm,
    onCancel,
}: DeleteConfirmModalProps) {
    const [deleteChildren, setDeleteChildren] = useState(false);
    const [moveToId, setMoveToId] = useState<string>('');

    const handleConfirm = () => {
        if (hasChildren && !deleteChildren && moveToId) {
            onConfirm(false, moveToId);
        } else {
            onConfirm(deleteChildren);
        }
    };

    const canConfirm = !hasChildren || deleteChildren || moveToId;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" onClick={onCancel}>
            <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
                <p className="text-gray-600 mb-4">{message}</p>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-yellow-700 font-semibold">
                                This action cannot be undone!
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 rounded p-3 mb-4">
                    <p className="text-sm font-medium text-gray-700">
                        You are about to delete: <span className="font-bold text-gray-900">{itemName}</span>
                    </p>
                </div>

                {hasChildren && (
                    <div className="mb-4 space-y-3">
                        <p className="text-sm font-medium text-red-600">
                            This category has {childrenCount} {childrenType}. What would you like to do?
                        </p>

                        <div className="space-y-2">
                            <label className="flex items-start space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50">
                                <input
                                    type="radio"
                                    name="deleteOption"
                                    checked={!deleteChildren && !moveToId}
                                    onChange={() => {
                                        setDeleteChildren(false);
                                        setMoveToId('');
                                    }}
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-medium">Move to another category</p>
                                    {!deleteChildren && (
                                        <select
                                            value={moveToId}
                                            onChange={(e) => setMoveToId(e.target.value)}
                                            className="mt-2 w-full px-3 py-2 border rounded text-sm"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <option value="">Select category...</option>
                                            {otherOptions.map(opt => (
                                                <option key={opt.id} value={opt.id}>{opt.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                            </label>

                            <label className="flex items-start space-x-3 p-3 border rounded cursor-pointer hover:bg-gray-50 border-red-200 bg-red-50">
                                <input
                                    type="radio"
                                    name="deleteOption"
                                    checked={deleteChildren}
                                    onChange={() => {
                                        setDeleteChildren(true);
                                        setMoveToId('');
                                    }}
                                    className="mt-1"
                                />
                                <div>
                                    <p className="text-sm font-medium text-red-700">Delete all {childrenType} in this category</p>
                                    <p className="text-xs text-red-600 mt-1">This will permanently delete {childrenCount} {childrenType}</p>
                                </div>
                            </label>
                        </div>
                    </div>
                )}

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
