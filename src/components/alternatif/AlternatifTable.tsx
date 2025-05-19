import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EditAlternatifDialog } from "./EditAlternatifDialog";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Pencil,
  Trash2,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Alternatif {
  id: string;
  kode: string;
  nama: string;
  status: string;
}

interface AlternatifTableProps {
  alternatif: Alternatif[];
  onDelete: (id: string) => Promise<void>;
  onUpdate: (id: string, kode: string, nama: string) => Promise<void>;
}

export const AlternatifTable = ({
  alternatif,
  onDelete,
  onUpdate,
}: AlternatifTableProps) => {
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<Alternatif | null>(null);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedAlternatif, setSelectedAlternatif] =
    useState<Alternatif | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [editConfirmDialog, setEditConfirmDialog] = useState(false);
  const [pendingEditAlternatif, setPendingEditAlternatif] =
    useState<Alternatif | null>(null);

  const handleDelete = async () => {
    if (selectedId) {
      await onDelete(selectedId);
      setDeleteDialog(false);
      setSelectedId(null);
      setSelectedItem(null);
    }
  };

  const openDeleteDialog = (id: string, item: Alternatif) => {
    setSelectedId(id);
    setSelectedItem(item);
    setDeleteDialog(true);
  };

  const openEditDialog = (alternatif: Alternatif) => {
    setSelectedAlternatif(alternatif);
    setEditDialog(true);
  };

  const closeEditDialog = () => {
    setEditDialog(false);
    setSelectedAlternatif(null);
  };

  const openEditConfirmDialog = (alternatif: Alternatif) => {
    setPendingEditAlternatif(alternatif);
    setEditConfirmDialog(true);
  };

  const handleEditConfirm = () => {
    if (pendingEditAlternatif) {
      openEditDialog(pendingEditAlternatif);
      setPendingEditAlternatif(null);
      setEditConfirmDialog(false);
    }
  };

  const totalPages = Math.ceil(alternatif.length / itemsPerPage);
  const paginatedAlternatif = alternatif.slice(
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

  return (
    <div>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-[#1a1b1f]">
            <TableRow>
              <TableHead className="w-[100px] font-medium text-gray-700 dark:text-white">
                Kode
              </TableHead>
              <TableHead className="font-medium text-gray-700 dark:text-white">
                Nama Alternatif
              </TableHead>

              <TableHead className="w-[60px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedAlternatif.map((item) => (
              <TableRow
                key={item.id}
                className="hover:bg-gray-50 dark:hover:bg-[#1a1b1f] "
              >
                <TableCell className="font-medium">{item.kode}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="truncate max-w-[200px] lg:max-w-full">
                      {item.nama}
                    </span>
                  </div>
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
                        onClick={() => openEditConfirmDialog(item)}
                      >
                        <Pencil className="mr-2 h-4 w-4 text-black" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer text-destructive flex items-center"
                        onClick={() => openDeleteDialog(item.id, item)}
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-red-400" />
                        Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {paginatedAlternatif.length === 0 && (
        <div className="text-center py-12 border-b">
          <p className="text-gray-500">Tidak ada alternatif yang ditampilkan</p>
        </div>
      )}

      {totalPages > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 gap-4 px-2">
          <div className="flex items-center space-x-2 pb-4 px-4">
            <span className="text-sm text-gray-500">Items per page</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleItemsPerPageChange}
            >
              <SelectTrigger className="h-8 w-[70px] cursor-pointer">
                <SelectValue placeholder={itemsPerPage.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5" className="cursor-pointer">
                  5
                </SelectItem>
                <SelectItem value="10" className="cursor-pointer">
                  10
                </SelectItem>
                <SelectItem value="15" className="cursor-pointer">
                  15
                </SelectItem>
                <SelectItem value="20" className="cursor-pointer">
                  20
                </SelectItem>
                <SelectItem value="25" className="cursor-pointer">
                  25
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-center sm:justify-end gap-2 pb-2 px-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="hidden sm:flex h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
              <ChevronLeft className="h-4 w-4 -ml-2" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="hidden sm:flex h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
              <ChevronRight className="h-4 w-4 -ml-2" />
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
              Apakah Anda yakin ingin menghapus alternatif ini?
              {selectedItem && (
                <div className="mt-2 p-3 bg-slate-50 rounded-md border">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Kode:</span>
                    <span>{selectedItem.kode}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="font-medium mr-2">Nama:</span>
                    <span>{selectedItem.nama}</span>
                  </div>
                </div>
              )}
              <div className="mt-2 text-red-500 flex items-center">
                <AlertCircle className="w-4 h-4 mr-1" />
                <span>Tindakan ini tidak dapat dibatalkan.</span>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className=" sm:gap-0">
            <Button
              className="mr-2"
              variant="outline"
              onClick={() => setDeleteDialog(false)}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={editConfirmDialog} onOpenChange={setEditConfirmDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Konfirmasi Edit</DialogTitle>
            <DialogDescription className="pt-2">
              Apakah Anda yakin ingin mengedit alternatif ini?
              {pendingEditAlternatif && (
                <div className="mt-2 p-3 bg-slate-50 rounded-md border">
                  <div className="flex items-center">
                    <span className="font-medium mr-2">Kode:</span>
                    <span>{pendingEditAlternatif.kode}</span>
                  </div>
                  <div className="flex items-center mt-1">
                    <span className="font-medium mr-2">Nama:</span>
                    <span>{pendingEditAlternatif.nama}</span>
                  </div>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:gap-0">
            <Button
              className="mr-2"
              variant="outline"
              onClick={() => {
                setEditConfirmDialog(false);
                setPendingEditAlternatif(null);
              }}
            >
              Batal
            </Button>
            <Button onClick={handleEditConfirm}>Edit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <EditAlternatifDialog
        alternatif={selectedAlternatif}
        isOpen={editDialog}
        onClose={closeEditDialog}
        onUpdate={onUpdate}
      />
    </div>
  );
};
