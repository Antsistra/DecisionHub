import { useState } from "react";
import { Kriteria } from "@/hooks/useKriteria";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertCircle,
  ArrowUpDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EditKriteriaDialog } from "./EditKriteriaDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface KriteriaTableProps {
  kriteria: Kriteria[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, nama: string, bobot: number) => Promise<void>;
}

export function KriteriaTable({
  kriteria,
  onDelete,
  onUpdate,
}: KriteriaTableProps) {
  const [selectedKriteria, setSelectedKriteria] = useState<Kriteria | null>(
    null
  );
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [kriteriaToDelete, setKriteriaToDelete] = useState<string | null>(null);
  const [kriteriaToDeleteData, setKriteriaToDeleteData] =
    useState<Kriteria | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sortedKriteria = [...kriteria].sort((a, b) => {
    return sortOrder === "asc" ? a.bobot - b.bobot : b.bobot - a.bobot;
  });

  const totalPages = Math.ceil(sortedKriteria.length / itemsPerPage);
  const paginatedKriteria = sortedKriteria.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleEdit = (kriteria: Kriteria) => {
    setSelectedKriteria(kriteria);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedKriteria(null);
  };

  const openDeleteDialog = (id: string) => {
    const kriteriaData = kriteria.find((k) => k.id === id) || null;
    setKriteriaToDelete(id);
    setKriteriaToDeleteData(kriteriaData);
    setDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    if (kriteriaToDelete) {
      onDelete(kriteriaToDelete);
      setDeleteDialogOpen(false);
      setKriteriaToDelete(null);
      setKriteriaToDeleteData(null);
    }
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  return (
    <div>
      <div className="rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-[#1a1a1a] ">
            <TableRow>
              <TableHead className="font-medium text-gray-700 dark:text-white">
                Nama Kriteria
              </TableHead>
              <TableHead className="w-[150px] font-medium text-gray-700 dark:text-white">
                <div className="flex items-center gap-1 justify-center">
                  <span>Bobot</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={toggleSortOrder}
                    title={`Sort ${
                      sortOrder === "asc" ? "descending" : "ascending"
                    }`}
                  >
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </div>
              </TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedKriteria.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-6 text-gray-500"
                >
                  Tidak ada kriteria yang tersedia
                </TableCell>
              </TableRow>
            ) : (
              paginatedKriteria.map((k) => (
                <TableRow
                  key={k.id}
                  className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
                >
                  <TableCell className="font-medium">
                    <div
                      className="truncate max-w-[300px] lg:max-w-full"
                      title={k.nama_kriteria}
                    >
                      {k.nama_kriteria}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-semibold">
                      {(k.bobot * 100).toFixed(0)}%
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer flex items-center"
                          onClick={() => handleEdit(k)}
                        >
                          <Pencil className="mr-2 h-4 w-4 text-black" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive flex items-center"
                          onClick={() => openDeleteDialog(k.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4 text-red-400" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Items per page</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={itemsPerPage.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Previous page</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path
                  d="M8.84182 3.13514C9.04327 3.32401 9.05348 3.64042 8.86462 3.84188L5.43521 7.49991L8.86462 11.1579C9.05348 11.3594 9.04327 11.6758 8.84182 11.8647C8.64036 12.0535 8.32394 12.0433 8.13508 11.8419L4.38508 7.84188C4.20477 7.64955 4.20477 7.35027 4.38508 7.15794L8.13508 3.15794C8.32394 2.95648 8.64036 2.94628 8.84182 3.13514Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <span className="sr-only">Next page</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path
                  d="M6.1584 3.13514C5.95694 3.32401 5.94673 3.64042 6.13559 3.84188L9.565 7.49991L6.13559 11.1579C5.94673 11.3594 5.95694 11.6758 6.1584 11.8647C6.35986 12.0535 6.67627 12.0433 6.86514 11.8419L10.6151 7.84188C10.7954 7.64955 10.7954 7.35027 10.6151 7.15794L6.86514 3.15794C6.67627 2.95648 6.35986 2.94628 6.1584 3.13514Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </Button>
          </div>
        </div>
      )}

      {selectedKriteria && (
        <EditKriteriaDialog
          kriteria={selectedKriteria}
          isOpen={isEditDialogOpen}
          onClose={handleCloseEditDialog}
          onUpdate={onUpdate}
        />
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Konfirmasi Penghapusan
            </DialogTitle>
            <DialogDescription className="pt-2">
              Apakah Anda yakin ingin menghapus kriteria ini?
              {kriteriaToDeleteData && (
                <div className="mt-2 p-3 bg-slate-50 rounded-md border">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Nama Kriteria:</span>
                    <span>{kriteriaToDeleteData.nama_kriteria}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="font-medium mr-2">Bobot:</span>
                    <span>
                      {(kriteriaToDeleteData.bobot * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              )}
              <div className="mt-2 text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span>
                  Menghapus kriteria akan mempengaruhi sub kriteria dan
                  penilaian yang terkait.
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
