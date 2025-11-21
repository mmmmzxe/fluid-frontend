/**
 * Admin Dashboard Utility Functions
 * Shared helpers for admin pages
 */

import { Order, SubCategory } from '@/services/adminApi';

/**
 * Extract customer name from order object
 * Handles both createdBy user object and direct firstName/lastName fields
 */
export const getCustomerName = (order: Order): string => {
    if (order.createdBy?.name) {
        return order.createdBy.name;
    }

    const firstName = order.firstName || '';
    const lastName = order.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || 'Guest';
};

/**
 * Extract customer email from order object
 */
export const getCustomerEmail = (order: Order): string => {
    return order.createdBy?.email || order.email || '';
};

/**
 * Extract category ID from various formats
 * Handles both string IDs and populated category objects
 */
export const getCategoryId = (categoryId: string | { _id: string } | undefined): string => {
    if (!categoryId) return '';
    return typeof categoryId === 'string' ? categoryId : categoryId._id;
};

/**
 * Extract category name from various formats
 */
export const getCategoryName = (
    categoryId: string | { _id: string; name?: string; nameEnglish?: string } | undefined,
    fallback: string = 'Unknown'
): string => {
    if (!categoryId) return fallback;

    if (typeof categoryId === 'object') {
        return categoryId.nameEnglish || categoryId.name || fallback;
    }

    return fallback;
};

/**
 * Format currency consistently
 */
export const formatCurrency = (amount: number | string | undefined, currency: string = '$'): string => {
    const num = Number(amount || 0);
    return `${currency}${num.toFixed(2)}`;
};

/**
 * Format role name for display
 */
export const getRoleDisplay = (role: string): string => {
    switch (role) {
        case 'superAdmin':
            return 'Super Admin';
        case 'admin':
            return 'Admin';
        case 'user':
            return 'User';
        default:
            return role.charAt(0).toUpperCase() + role.slice(1);
    }
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + '...';
};

/**
 * Calculate percentage change
 */
export const calculatePercentageChange = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
};

/**
 * Format percentage with sign
 */
export const formatPercentage = (value: number): string => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
};
