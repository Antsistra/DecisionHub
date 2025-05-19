import { WeightedKriteria } from "@/hooks/useWeightedKriteria";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  MoreHorizontal,
  Trash2,
  AlertCircle,
  Edit,
  ArrowUpDown,
} from "lucide-react";
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
import { EditWeightedKriteriaDialog } from "./EditWeightedKriteriaDialog";

interface WeightedKriteriaTableProps {
  kriteria: WeightedKriteria[];
  onDelete: (id: string) => void;
  onUpdate: (
    id: string,
    kriteria: string,
    keterangan: string,
    bobot: number,
    kode: string
  ) => Promise<void>;
}

export default function WeightedKriteriaTable({
  kriteria,
  onDelete,
  onUpdate,
}: WeightedKriteriaTableProps) {
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<WeightedKriteria | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<"kode" | "bobot">("kode");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedKriteria = [...kriteria].sort((a, b) => {
    if (sortField === "kode") {
      return sortOrder === "asc"
        ? a.kode.localeCompare(b.kode)
        : b.kode.localeCompare(a.kode);
    } else {
      return sortOrder === "asc" ? a.bobot - b.bobot : b.bobot - a.bobot;
    }
  });

  const totalPages = Math.ceil(sortedKriteria.length / itemsPerPage);
  const paginatedKriteria = sortedKriteria.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const toggleSort = (field: "kode" | "bobot") => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const openDeleteDialog = (id: string, item: WeightedKriteria) => {
    setSelectedId(id);
    setSelectedItem(item);
    setDeleteDialog(true);
  };

  const handleDelete = () => {
    if (selectedId) {
      onDelete(selectedId);
      setDeleteDialog(false);
      setSelectedId(null);
      setSelectedItem(null);
    }
  };

  const openEditDialog = (item: WeightedKriteria) => {
    setSelectedItem(item);
    setEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setEditDialog(false);
    setSelectedItem(null);
  };

  return (
    <div>
      <div className="rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-[#1a1a1a]">
            <TableRow>
              <TableHead className="w-[100px] font-medium text-gray-700 dark:text-white">
                <div className="flex items-center gap-1">
                  <span>Kode</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => toggleSort("kode")}
                    title={`Sort ${
                      sortOrder === "asc" ? "descending" : "ascending"
                    }`}
                  >
                    <ArrowUpDown className="h-3 w-3" />
                  </Button>
                </div>
              </TableHead>
              <TableHead className="font-medium text-gray-700 dark:text-white">
                Nama Kriteria
              </TableHead>
              <TableHead className="font-medium text-gray-700 dark:text-white">
                Keterangan
              </TableHead>
              <TableHead className="w-[100px] font-medium text-gray-700 dark:text-white">
                <div className="flex items-center gap-1">
                  <span>Bobot</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5"
                    onClick={() => toggleSort("bobot")}
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
                  colSpan={5}
                  className="text-center py-6 text-gray-500"
                >
                  Tidak ada kriteria yang tersedia
                </TableCell>
              </TableRow>
            ) : (
              paginatedKriteria.map((item) => (
                <TableRow
                  key={item.id}
                  className="hover:bg-gray-50 dark:hover:bg-[#1a1a1a]"
                >
                  <TableCell className="font-medium">{item.kode}</TableCell>
                  <TableCell>
                    <div
                      className="truncate max-w-[200px] lg:max-w-full"
                      title={item.nama_kriteria}
                    >
                      {item.nama_kriteria}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className="truncate max-w-[200px] lg:max-w-full"
                      title={item.keterangan}
                    >
                      {item.keterangan || "-"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-semibold">
                      {item.bobot}
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
                          onClick={() => openEditDialog(item)}
                        >
                          <Edit className="mr-2 h-4 w-4 dark:text-white" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer text-destructive flex items-center"
                          onClick={() => openDeleteDialog(item.id, item)}
                        >
                          <Trash2 className="mr-2 h-4 w-4 dark:text-red-600" />
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-4 px-2">
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
                <SelectItem value="25">25</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center sm:justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="hidden sm:flex h-8 w-8 p-0"
            >
              <span className="sr-only">First page</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 rotate-180"
              >
                <path
                  d="M2.14645 11.1464C1.95118 11.3417 1.95118 11.6583 2.14645 11.8536C2.34171 12.0488 2.65829 12.0488 2.85355 11.8536L6.85355 7.85355C7.04882 7.65829 7.04882 7.34171 6.85355 7.14645L2.85355 3.14645C2.65829 2.95118 2.34171 2.95118 2.14645 3.14645C1.95118 3.34171 1.95118 3.65829 2.14645 3.85355L5.79289 7.5L2.14645 11.1464ZM8.14645 11.1464C7.95118 11.3417 7.95118 11.6583 8.14645 11.8536C8.34171 12.0488 8.65829 12.0488 8.85355 11.8536L12.8536 7.85355C13.0488 7.65829 13.0488 7.34171 12.8536 7.14645L8.85355 3.14645C8.65829 2.95118 8.34171 2.95118 8.14645 3.14645C7.95118 3.34171 7.95118 3.65829 8.14645 3.85355L11.7929 7.5L8.14645 11.1464Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </Button>
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
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="hidden sm:flex h-8 w-8 p-0"
            >
              <span className="sr-only">Last page</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
              >
                <path
                  d="M2.14645 11.1464C1.95118 11.3417 1.95118 11.6583 2.14645 11.8536C2.34171 12.0488 2.65829 12.0488 2.85355 11.8536L6.85355 7.85355C7.04882 7.65829 7.04882 7.34171 6.85355 7.14645L2.85355 3.14645C2.65829 2.95118 2.34171 2.95118 2.14645 3.14645C1.95118 3.34171 1.95118 3.65829 2.14645 3.85355L5.79289 7.5L2.14645 11.1464ZM8.14645 11.1464C7.95118 11.3417 7.95118 11.6583 8.14645 11.8536C8.34171 12.0488 8.65829 12.0488 8.85355 11.8536L12.8536 7.85355C13.0488 7.65829 13.0488 7.34171 12.8536 7.14645L8.85355 3.14645C8.65829 2.95118 8.34171 2.95118 8.14645 3.14645C7.95118 3.34171 7.95118 3.65829 8.14645 3.85355L11.7929 7.5L8.14645 11.1464Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </Button>
          </div>
        </div>
      )}

      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Konfirmasi Penghapusan
            </DialogTitle>
            <DialogDescription className="pt-2">
              Apakah Anda yakin ingin menghapus kriteria ini?
              {selectedItem && (
                <div className="mt-2 p-3 bg-slate-50 rounded-md border">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Kode:</span>
                    <span>{selectedItem.kode}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="font-medium mr-2">Nama:</span>
                    <span>{selectedItem.nama_kriteria}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="font-medium mr-2">Bobot:</span>
                    <span>{selectedItem.bobot}</span>
                  </div>
                </div>
              )}
              <div className="mt-2 text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span>
                  Tindakan ini tidak dapat dibatalkan dan akan mempengaruhi
                  perhitungan.
                </span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteDialog(false)}>
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditWeightedKriteriaDialog
        isOpen={editDialog}
        onClose={handleEditDialogClose}
        onUpdate={onUpdate}
        kriteria={selectedItem}
      />
    </div>
  );
}
