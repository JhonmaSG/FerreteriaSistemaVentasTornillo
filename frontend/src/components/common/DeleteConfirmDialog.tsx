import { useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface DeleteDialogProps<T> {
  item: T | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (item: T) => Promise<void>
  getLabel: (item: T) => string
  title?: string
  description?: string
}

export function DeleteConfirmDialog<T>({
  item,
  open,
  onOpenChange,
  onConfirm,
  getLabel,
  title = 'Eliminar elemento',
  description,
}: DeleteDialogProps<T>) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleConfirm = async () => {
    if (!item) return
    setIsDeleting(true)
    try {
      await onConfirm(item)
      onOpenChange(false)
    } finally {
      setIsDeleting(false)
    }
  }

  const label = item ? getLabel(item) : 'este elemento'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ?? (
              <>
                ¿Seguro que deseas eliminar <strong>{label}</strong>? Esta acción no se puede
                deshacer.
              </>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              event.preventDefault()
              void handleConfirm()
            }}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando…' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
