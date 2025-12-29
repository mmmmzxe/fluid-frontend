import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Search,
  Filter,
  Download,
} from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, row: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  actions?: Array<{
    label: string;
    onClick: (row: T) => void;
    icon?: React.ReactNode;
  }>;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (pageSize: number) => void;
  };
  filters?: Array<{
    key: string;
    label: string;
    options: Array<{ value: string; label: string }>;
    onFilter: (value: string) => void;
  }>;
}

function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  searchable = true,
  searchPlaceholder = 'Search...',
  onSearch,
  onEdit,
  onDelete,
  onView,
  actions = [],
  pagination,
  filters = [],
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch?.(query);
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const defaultActions = [];
  if (onView) {
    defaultActions.push({
      label: 'View',
      onClick: onView,
    });
  }
  if (onEdit) {
    defaultActions.push({
      label: 'Edit',
      onClick: onEdit,
    });
  }
  if (onDelete) {
    defaultActions.push({
      label: 'Delete',
      onClick: onDelete,
    });
  }

  const allActions = [...defaultActions, ...actions];

  const getNestedValue = (obj: any, path: string) => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-10 w-64 bg-white/40 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-white/40 rounded-lg animate-pulse" />
        </div>
        <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-sm overflow-hidden">
          <div className="h-12 bg-purple-50/20 border-b border-white/10" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 border-b border-white/10 animate-pulse bg-transparent" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/40 backdrop-blur-sm p-4 rounded-xl border border-white/20 shadow-sm">
        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {searchable && (
            <div className="relative flex-1 sm:flex-initial min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
              <Input
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-9 w-full sm:w-72 bg-white/50 border-white/20 focus:bg-white focus:ring-purple-500/20 transition-all"
              />
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            {filters.map((filter) => (
              <Select key={filter.key} onValueChange={filter.onFilter}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white/50 border-white/20">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Filter className="h-3.5 w-3.5" />
                    <span className="text-foreground">{filter.label}</span>
                  </div>
                </SelectTrigger>
                <SelectContent>
                  {filter.options.filter(option => option.value !== '').map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Additional global actions can go here */}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-white/20 bg-white/40 backdrop-blur-md shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-purple-50/30 border-b border-white/10">
              <TableRow className="hover:bg-transparent border-white/10">
                {columns.map((column) => (
                  <TableHead
                    key={column.key as string}
                    className={`text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 py-4 ${column.sortable ? 'cursor-pointer hover:text-purple-600 transition-colors' : ''}`}
                    onClick={() => column.sortable && handleSort(column.key as string)}
                    style={{ width: column.width }}
                  >
                    <div className="flex items-center space-x-1 whitespace-nowrap">
                      <span>{column.title}</span>
                      {column.sortable && (
                        <span className="text-xs ml-1 text-purple-500/70">
                          {getSortIcon(column.key as string)}
                        </span>
                      )}
                    </div>
                  </TableHead>
                ))}
                {allActions.length > 0 && <TableHead className="w-12 text-right pr-6 whitespace-nowrap">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (allActions.length > 0 ? 1 : 0)} className="text-center py-12 text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="h-8 w-8 text-muted-foreground/30" />
                      <p>No data available</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((row, index) => (
                  <TableRow
                    key={index}
                    className="border-b border-white/10 hover:bg-purple-50/30 transition-colors duration-200 group"
                  >
                    {columns.map((column) => (
                      <TableCell key={column.key as string} className="py-4 text-sm">
                        {column.render
                          ? column.render(getNestedValue(row, column.key as string), row)
                          : getNestedValue(row, column.key as string)}
                      </TableCell>
                    ))}
                    {allActions.length > 0 && (
                      <TableCell className="text-right pr-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-purple-100/50 hover:text-purple-600 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {allActions.map((action, actionIndex) => (
                              <DropdownMenuItem
                                key={actionIndex}
                                onClick={() => action.onClick(row)}
                                className="cursor-pointer focus:bg-purple-50 focus:text-purple-700"
                              >
                                {action.icon && <span className="mr-2 text-muted-foreground group-hover:text-purple-500">{action.icon}</span>}
                                {action.label}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{((pagination.page - 1) * pagination.pageSize) + 1}</span> to{' '}
            <span className="font-medium text-foreground">{Math.min(pagination.page * pagination.pageSize, pagination.total)}</span> of{' '}
            <span className="font-medium text-foreground">{pagination.total}</span> results
          </div>
          <div className="flex items-center space-x-2">
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={(value) => pagination.onPageSizeChange(Number(value))}
            >
              <SelectTrigger className="w-20 h-8 bg-white/50 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="h-8 w-8 p-0 bg-white/50 border-white/20 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium px-2 min-w-[3rem] text-center">
                Page {pagination.page} / {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => pagination.onPageChange(pagination.page + 1)}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                className="h-8 w-8 p-0 bg-white/50 border-white/20 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
