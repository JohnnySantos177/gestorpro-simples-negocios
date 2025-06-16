
import React from "react";
import { Button } from "@/components/ui/button";
import { FilterOptions } from "@/types";

interface VendasFiltersProps {
  filterOptions: FilterOptions;
  onFilterChange: (options: FilterOptions) => void;
}

export function VendasFilters({ filterOptions, onFilterChange }: VendasFiltersProps) {
  const filterButtons = [
    { label: "Todas", value: "" },
    { label: "Dinheiro", value: "Dinheiro" },
    { label: "Cartão de Crédito", value: "Cartão de Crédito" },
    { label: "PIX", value: "PIX" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filterButtons.map((filter) => (
        <Button
          key={filter.value}
          variant={filterOptions.formaPagamento === filter.value ? "default" : "outline"}
          size="sm"
          onClick={() => onFilterChange({ ...filterOptions, formaPagamento: filter.value, page: 1 })}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
