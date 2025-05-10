import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterOptions } from "@/types";

interface Column {
  key: string;
  header: string;
  cell?: (value: any, row?: any) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column[];
  filterOptions: FilterOptions;
  onFilterChange: (options: FilterOptions) => void;
  totalItems?: number;
  page?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
  loading?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  filterOptions,
  onFilterChange,
  totalItems = 0,
  page = 1,
  itemsPerPage = 10,
  onPageChange,
  loading = false,
}: DataTableProps<T>) {
  const [search, setSearch] = useState(filterOptions.search || "");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filterOptions, search, page: 1 });
  };

  const handleSort = (sortBy: string) => {
    const newSortOrder = filterOptions.sortBy === sortBy && filterOptions.sortOrder === "asc" 
      ? "desc" 
      : "asc";
    
    onFilterChange({
      ...filterOptions,
      sortBy,
      sortOrder: newSortOrder,
    });
  };

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage);
    } else {
      onFilterChange({
        ...filterOptions,
        page: newPage,
      });
    }
  };

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearchSubmit}>
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            placeholder="Pesquisar..."
            value={search}
            onChange={handleSearchChange}
            className="max-w-sm"
          />
          <Button type="submit" variant="secondary" className="sm:w-auto">
            Buscar
          </Button>
        </div>
      </form>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead 
                  key={column.key}
                  onClick={() => handleSort(column.key)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-1">
                    {column.header}
                    {filterOptions.sortBy === column.key && (
                      <span className="ml-1">
                        {filterOptions.sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Nenhum resultado encontrado.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row: T, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column) => (
                    <TableCell key={column.key}>
                      {column.cell
                        ? column.cell((row as any)[column.key], row)
                        : (row as any)[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page - 1)}
            disabled={page <= 1}
          >
            Anterior
          </Button>
          <div className="text-sm">
            Página {page} de {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(page + 1)}
            disabled={page >= totalPages}
          >
            Próximo
          </Button>
        </div>
      )}
    </div>
  );
}
