import React, { useState } from "react";
import { 
  Edit, 
  Trash, 
  Plus,
  Users,
  Filter
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useData } from "@/context/DataContext";
import { Cliente, FilterOptions } from "@/types";
import { GRUPOS_CLIENTES, ESTADOS_BRASILEIROS } from "@/data/constants";
import { formatDate } from "@/utils/format";
import { toast } from "sonner";
import { z } from "zod";
import { ExportButtons } from "@/components/ExportButtons";

// Atualize o schema: somente nome e telefone obrigatórios
const clienteSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  telefone: z.string().min(1, "Telefone é obrigatório"),
  endereco: z.string().optional().or(z.literal("")),
  cidade: z.string().optional().or(z.literal("")),
  estado: z.string().optional().or(z.literal("")),
  cep: z.string().optional().or(z.literal("")),
  grupo: z.string().optional().or(z.literal("")),
  observacoes: z.string().optional().or(z.literal("")),
});

const ClientesPage = () => {
  const { clientes, addCliente, updateCliente, deleteCliente, filterClientes } = useData();
  
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    search: "",
    sortBy: "nome",
    sortOrder: "asc",
    page: 1,
    itemsPerPage: 10,
    grupo: "Todos",
  });
  
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [newCliente, setNewCliente] = useState<Partial<Cliente>>({
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
    grupo: "Novos",
    observacoes: "",
  });
  
  const filteredClientes = filterClientes(filterOptions);
  
  const handleFilterChange = (options: FilterOptions) => {
    setFilterOptions({ ...filterOptions, ...options });
  };
  
  const handleOpenEditDialog = (cliente: Cliente) => {
    setEditingCliente(cliente);
  };
  
  const handleSaveCliente = () => {
    // Não exige mais e-mail obrigatório
    if (!newCliente.nome || !newCliente.telefone) {
      toast.error("Por favor, preencha os campos obrigatórios: nome e telefone.");
      return;
    }
    // Valida dados usando schema atualizado
    const result = clienteSchema.safeParse(newCliente);
    if (!result.success) {
      toast.error(result.error.errors.map(e => e.message).join(", "));
      return;
    }

    addCliente(newCliente as Omit<Cliente, "id" | "dataCadastro">);
    toast.success("Cliente adicionado com sucesso!");
    setNewCliente({
      nome: "",
      email: "",
      telefone: "",
      endereco: "",
      cidade: "",
      estado: "",
      cep: "",
      grupo: "Novos",
      observacoes: "",
    });
  };
  
  const handleUpdateCliente = () => {
    if (editingCliente) {
      if (!editingCliente.nome || !editingCliente.telefone) {
        toast.error("Por favor, preencha os campos obrigatórios: nome e telefone.");
        return;
      }
      // Valida dados usando schema atualizado
      const result = clienteSchema.safeParse(editingCliente);
      if (!result.success) {
        toast.error(result.error.errors.map(e => e.message).join(", "));
        return;
      }

      updateCliente(editingCliente.id, editingCliente);
      toast.success("Cliente atualizado com sucesso!");
      setEditingCliente(null);
    }
  };
  
  const handleDeleteCliente = (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.")) {
      deleteCliente(id);
      toast.success("Cliente excluído com sucesso!");
    }
  };
  
  const columns = [
    {
      key: "nome",
      header: "Nome",
      cell: (value: any) => value
    },
    {
      key: "email",
      header: "Email",
      cell: (value: any) => value
    },
    {
      key: "telefone",
      header: "Telefone",
      cell: (value: any) => value
    },
    {
      key: "grupo",
      header: "Grupo",
      cell: (value: any) => value
    },
    {
      key: "dataCadastro",
      header: "Data de Cadastro",
      cell: (value: any) => formatDate(value)
    },
    {
      key: "actions",
      header: "Ações",
      cell: (value: any, row: Cliente) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleOpenEditDialog(row)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => handleDeleteCliente(row.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
  
  return (
    <>
      <PageHeader
        title="Clientes"
        description="Gerencie seus clientes"
        actions={
          <div className="flex gap-2">
            <ExportButtons 
              data={clientes} 
              type="clientes" 
              disabled={clientes.length === 0}
            />
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Cliente
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome *</Label>
                      <Input
                        id="nome"
                        value={newCliente.nome}
                        onChange={(e) =>
                          setNewCliente({ ...newCliente, nome: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={newCliente.email}
                        onChange={(e) =>
                          setNewCliente({ ...newCliente, email: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input
                        id="telefone"
                        value={newCliente.telefone}
                        onChange={(e) =>
                          setNewCliente({ ...newCliente, telefone: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="grupo">Grupo</Label>
                      <Select
                        value={newCliente.grupo}
                        onValueChange={(value) =>
                          setNewCliente({ ...newCliente, grupo: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um grupo" />
                        </SelectTrigger>
                        <SelectContent>
                          {GRUPOS_CLIENTES.filter(g => g !== "Todos").map((grupo) => (
                            <SelectItem key={grupo} value={grupo}>
                              {grupo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      value={newCliente.endereco}
                      onChange={(e) =>
                        setNewCliente({ ...newCliente, endereco: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        value={newCliente.cidade}
                        onChange={(e) =>
                          setNewCliente({ ...newCliente, cidade: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Select
                        value={newCliente.estado}
                        onValueChange={(value) =>
                          setNewCliente({ ...newCliente, estado: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="UF" />
                        </SelectTrigger>
                        <SelectContent>
                          {ESTADOS_BRASILEIROS.map((estado) => (
                            <SelectItem key={estado} value={estado}>
                              {estado}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        value={newCliente.cep}
                        onChange={(e) =>
                          setNewCliente({ ...newCliente, cep: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Input
                      id="observacoes"
                      value={newCliente.observacoes}
                      onChange={(e) =>
                        setNewCliente({ ...newCliente, observacoes: e.target.value })
                      }
                    />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancelar</Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button onClick={handleSaveCliente}>Salvar</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        }
      />
      
      <div className="mb-6 flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Filtros:</h3>
        </div>
        <div className="flex flex-wrap gap-4">
          <Select
            value={filterOptions.grupo}
            onValueChange={(value) =>
              handleFilterChange({ ...filterOptions, grupo: value, page: 1 })
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione um grupo" />
            </SelectTrigger>
            <SelectContent>
              {GRUPOS_CLIENTES.map((grupo) => (
                <SelectItem key={grupo} value={grupo}>
                  {grupo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <DataTable
        data={filteredClientes}
        columns={columns}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
        totalItems={clientes.length}
        page={filterOptions.page}
        itemsPerPage={filterOptions.itemsPerPage}
      />
      
      {/* Edit Dialog */}
      {editingCliente && (
        <Dialog open={!!editingCliente} onOpenChange={(open) => !open && setEditingCliente(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Cliente</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-nome">Nome *</Label>
                  <Input
                    id="edit-nome"
                    value={editingCliente.nome}
                    onChange={(e) =>
                      setEditingCliente({ ...editingCliente, nome: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingCliente.email}
                    onChange={(e) =>
                      setEditingCliente({ ...editingCliente, email: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-telefone">Telefone *</Label>
                  <Input
                    id="edit-telefone"
                    value={editingCliente.telefone}
                    onChange={(e) =>
                      setEditingCliente({ ...editingCliente, telefone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-grupo">Grupo</Label>
                  <Select
                    value={editingCliente.grupo}
                    onValueChange={(value) =>
                      setEditingCliente({ ...editingCliente, grupo: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um grupo" />
                    </SelectTrigger>
                    <SelectContent>
                      {GRUPOS_CLIENTES.filter(g => g !== "Todos").map((grupo) => (
                        <SelectItem key={grupo} value={grupo}>
                          {grupo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endereco">Endereço</Label>
                <Input
                  id="edit-endereco"
                  value={editingCliente.endereco}
                  onChange={(e) =>
                    setEditingCliente({ ...editingCliente, endereco: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-cidade">Cidade</Label>
                  <Input
                    id="edit-cidade"
                    value={editingCliente.cidade}
                    onChange={(e) =>
                      setEditingCliente({ ...editingCliente, cidade: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-estado">Estado</Label>
                  <Select
                    value={editingCliente.estado}
                    onValueChange={(value) =>
                      setEditingCliente({ ...editingCliente, estado: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_BRASILEIROS.map((estado) => (
                        <SelectItem key={estado} value={estado}>
                          {estado}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-cep">CEP</Label>
                  <Input
                    id="edit-cep"
                    value={editingCliente.cep}
                    onChange={(e) =>
                      setEditingCliente({ ...editingCliente, cep: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-observacoes">Observações</Label>
                <Input
                  id="edit-observacoes"
                  value={editingCliente.observacoes}
                  onChange={(e) =>
                    setEditingCliente({ ...editingCliente, observacoes: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <DialogClose asChild>
                <Button onClick={handleUpdateCliente}>Salvar Alterações</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ClientesPage;
